import {VscodeTabHeader} from '../vscode-tab-header/index.js';
import {VscodeTabPanel} from '../vscode-tab-panel/index.js';
import type {VscodeTabs} from './vscode-tabs.js';
import {installFieldsetStyles} from '../includes/fieldset.styles.js';

type View = HTMLElement;
type Session = {
  owner: TabsDragController;
  header?: VscodeTabHeader;
  panel: VscodeTabPanel;
  views: View[];
};
type Target = {panel?: VscodeTabPanel; before?: HTMLElement; index?: number};
let session: Session | undefined;
const controllers = new Set<TabsDragController>();

/** Direct sidebar views only: nested form fieldsets are never separate views. */
export function panelViews(panel: VscodeTabPanel): View[] {
  return Array.from(panel.children).filter(
    (el): el is HTMLElement =>
      el instanceof HTMLElement && el.matches('fieldset, vscode-fieldset')
  );
}

/**
 * Native move DND, following VS Code's compositeBar and ViewPaneDropOverlay:
 * midpoint insertion, title drag images, delayed activation and half-pane overlays.
 * See dev/vscode-tabs/drag-drop.md for upstream references and layout differences.
 */
export class TabsDragController {
  private observer = new MutationObserver(() => this.refresh());
  private handles = new Set<HTMLElement>();
  private target?: Target;
  private overlay?: HTMLDivElement;
  private image?: HTMLDivElement;
  private hover?: VscodeTabHeader;
  private timer?: ReturnType<typeof setTimeout>;
  private generated = new Set<VscodeTabPanel>();

  constructor(private tabs: VscodeTabs) {}

  connect() {
    installFieldsetStyles(this.tabs);
    controllers.add(this);
    this.tabs.addEventListener('dragstart', this.start);
    this.tabs.addEventListener('dragover', this.over);
    this.tabs.addEventListener('drop', this.drop);
    this.tabs.addEventListener('dragleave', this.leave);
    this.tabs.ownerDocument.addEventListener('dragend', this.end);
    this.tabs.ownerDocument.addEventListener('keydown', this.key);
    this.observer.observe(this.tabs, {childList: true, subtree: true});
    this.refresh();
  }

  disconnect() {
    if (session?.owner === this) {
      this.end();
    }
    this.clear();
    this.observer.disconnect();
    this.tabs.removeEventListener('dragstart', this.start);
    this.tabs.removeEventListener('dragover', this.over);
    this.tabs.removeEventListener('drop', this.drop);
    this.tabs.removeEventListener('dragleave', this.leave);
    this.tabs.ownerDocument.removeEventListener('dragend', this.end);
    this.tabs.ownerDocument.removeEventListener('keydown', this.key);
    controllers.delete(this);
    this.handles.forEach((el) => el.removeAttribute('draggable'));
    this.handles.clear();
  }

  private headers() {
    return Array.from(this.tabs.children).filter(
      (el): el is VscodeTabHeader => el instanceof VscodeTabHeader
    );
  }

  private panels() {
    return Array.from(this.tabs.children).filter(
      (el): el is VscodeTabPanel => el instanceof VscodeTabPanel
    );
  }

  refresh() {
    const handles = new Set<HTMLElement>(this.headers());
    this.panels().forEach((panel) =>
      panelViews(panel).forEach((view) => {
        const legend = view.querySelector('legend');
        if (legend) {
          handles.add(legend);
        }
      })
    );
    this.handles.forEach((el) => {
      if (!handles.has(el)) {
        el.removeAttribute('draggable');
      }
    });
    handles.forEach((el) => el.setAttribute('draggable', 'true'));
    this.handles = handles;
  }

  private owned(event: Event) {
    return (
      event
        .composedPath()
        .find(
          (el) => el instanceof HTMLElement && el.localName === 'vscode-tabs'
        ) === this.tabs
    );
  }

  private start = (event: DragEvent) => {
    if (!this.owned(event) || !event.dataTransfer) {
      return;
    }
    const path = event.composedPath();
    if (
      path.some(
        (el) =>
          el instanceof HTMLElement &&
          el.matches(
            'input, button, select, textarea, a, [contenteditable="true"]'
          )
      )
    ) {
      event.preventDefault();
      return;
    }
    const handle = path.find(
      (el) => el instanceof HTMLElement && this.handles.has(el)
    ) as HTMLElement | undefined;
    if (!handle) {
      return;
    }
    this.end();
    const header = handle instanceof VscodeTabHeader ? handle : undefined;
    const panel = header
      ? this.panels()[this.headers().indexOf(header)]
      : handle.closest('vscode-tab-panel');
    if (!(panel instanceof VscodeTabPanel)) {
      return;
    }
    const views = panelViews(panel);
    const view = views.find((el) => el.contains(handle));
    if (!header && !view) {
      return;
    }
    session = {
      owner: this,
      header,
      panel,
      views: header ? views : [view!],
    };
    event.stopPropagation();
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('application/x-vscode-elements-view', 'move');
    const image = this.tabs.ownerDocument.createElement('div');
    image.textContent = handle.textContent?.trim() || 'View';
    Object.assign(image.style, {
      position: 'fixed',
      top: '-1000px',
      padding: '6px 12px',
      background:
        'var(--vscode-sideBarSectionHeader-background, var(--vscode-sideBar-background, var(--vscode-editor-background, Canvas)))',
      color:
        'var(--vscode-sideBarSectionHeader-foreground, var(--vscode-foreground, CanvasText))',
      font: '13px var(--vscode-font-family, sans-serif)',
      border:
        '1px solid var(--vscode-contrastActiveBorder, var(--vscode-focusBorder, Highlight))',
    });
    (this.tabs.shadowRoot || this.tabs.ownerDocument.body).append(image);
    this.image = image;
    event.dataTransfer.setDragImage(image, 12, 12);
  };

  private activate(header: VscodeTabHeader) {
    const index = this.headers().indexOf(header);
    if (index >= 0 && index !== this.tabs.selectedIndex) {
      this.tabs.selectedIndex = index;
      this.tabs.dispatchEvent(
        new CustomEvent('vsc-tabs-select', {
          detail: {selectedIndex: index},
          composed: true,
        })
      );
    }
  }

  private feedback(rect: DOMRect, half?: boolean, after = false) {
    if (!this.overlay) {
      this.overlay = this.tabs.ownerDocument.createElement('div');
      this.overlay.setAttribute('aria-hidden', 'true');
      this.overlay.dataset.vscDropIndicator = '';
      // Keep the indicator in the component shadow root to inherit its theme.
      this.tabs.shadowRoot?.append(this.overlay);
    }
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    Object.assign(this.overlay.style, {
      position: 'fixed',
      pointerEvents: 'none',
      zIndex: '10000',
      transition: reduced
        ? 'none'
        : 'top 80ms ease-out, left 80ms ease-out, height 80ms ease-out, width 80ms ease-out',
      left: `${rect.left}px`,
      top: `${rect.top + (half && after ? rect.height / 2 : 0)}px`,
      width: `${rect.width}px`,
      height: `${half ? rect.height / 2 : rect.height}px`,
      background:
        half === undefined
          ? 'var(--vscode-activityBar-dropBorder, #0078d4)'
          : 'var(--vscode-sideBar-dropBackground, rgba(83, 89, 93, .5))',
      outline: '1px solid var(--vscode-contrastActiveBorder, transparent)',
    });
  }

  private cancelHover() {
    clearTimeout(this.timer);
    this.timer = undefined;
    this.hover = undefined;
  }

  private scheduleHover(header: VscodeTabHeader) {
    if (this.hover === header) {
      return;
    }
    this.cancelHover();
    this.hover = header;
    this.timer = setTimeout(() => {
      if (session && header.isConnected) {
        this.activate(header);
      }
    }, 500);
  }

  private empty(panel: VscodeTabPanel) {
    return !Array.from(panel.childNodes).some(
      (node) => node instanceof Element || node.textContent?.trim()
    );
  }

  private over = (event: DragEvent) => {
    if (!session || !this.owned(event)) {
      return;
    }
    controllers.forEach((controller) => {
      if (controller !== this) {
        controller.clear();
      }
    });
    const path = event.composedPath();
    const headers = this.headers();
    const header = path.find((el) =>
      headers.includes(el as VscodeTabHeader)
    ) as VscodeTabHeader | undefined;
    const bar = path.some(
      (el) =>
        el instanceof HTMLElement &&
        el.classList.contains('header') &&
        el.getRootNode() === this.tabs.shadowRoot
    );
    this.target = undefined;
    if (bar) {
      const bounds = (
        header || this.tabs.shadowRoot!.querySelector('.tablist')!
      ).getBoundingClientRect();
      const nearCenter =
        header &&
        event.clientX > bounds.left + bounds.width * 0.25 &&
        event.clientX < bounds.right - bounds.width * 0.25;
      if (!session.header && nearCenter) {
        const panel = this.panels()[headers.indexOf(header)];
        if (!panel) {
          return;
        }
        this.target = {panel};
        this.feedback(bounds, false);
        this.scheduleHover(header);
      } else {
        // Open another tab while dragging a container so its views can be merged
        // by continuing down into the revealed panel. Releasing on the bar still reorders.
        if (session.header && nearCenter && header !== session.header) {
          this.scheduleHover(header);
        } else {
          this.cancelHover();
        }
        const after = header
          ? event.clientX >= bounds.left + bounds.width / 2
          : true;
        this.target = {
          index: header
            ? headers.indexOf(header) + (after ? 1 : 0)
            : headers.length,
        };
        this.feedback(
          new DOMRect(
            header && !after ? bounds.left : bounds.right,
            bounds.top,
            2,
            bounds.height
          )
        );
      }
    } else {
      this.cancelHover();
      const panel = path.find((el) =>
        this.panels().includes(el as VscodeTabPanel)
      ) as VscodeTabPanel | undefined;
      if (
        !panel ||
        panel.hidden ||
        (session.header && panel === session.panel)
      ) {
        this.clear();
        return;
      }
      const view = panelViews(panel).find((el) => path.includes(el));
      if (view && session.views.includes(view)) {
        this.clear();
        return;
      }
      if (view) {
        const rect = view.getBoundingClientRect();
        const after = event.clientY >= rect.top + rect.height / 2;
        this.target = {
          panel,
          before: after
            ? (view.nextElementSibling as HTMLElement | undefined)
            : view,
        };
        this.feedback(rect, true, after);
      } else {
        this.target = {panel};
        this.feedback(panel.getBoundingClientRect(), false);
      }
      // Scroll the nearest overflowing container at the edge, including the panel.
      for (const el of path) {
        if (
          !(el instanceof HTMLElement) ||
          !panel.contains(el) ||
          el.scrollHeight <= el.clientHeight
        ) {
          continue;
        }
        const rect = el.getBoundingClientRect();
        if (event.clientY < rect.top + 24) {
          el.scrollTop -= 16;
        } else if (event.clientY > rect.bottom - 24) {
          el.scrollTop += 16;
        }
        break;
      }
    }
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  };

  private drop = (event: DragEvent) => {
    if (!session || !this.owned(event)) {
      return;
    }
    // Recompute at release so stale feedback cannot cause an unintended move.
    this.over(event);
    if (!this.target) {
      this.end();
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    const drag = session;
    const target = this.target;
    const sourceHeaders = drag.owner.headers();
    const sourceIndex = sourceHeaders.indexOf(drag.header!);
    if (target.panel) {
      drag.views.forEach((view) =>
        target.panel!.insertBefore(view, target.before || null)
      );
      if (
        drag.header &&
        panelViews(drag.panel).length === 0 &&
        this.empty(drag.panel)
      ) {
        drag.header.remove();
        drag.panel.remove();
        drag.owner.generated.delete(drag.panel);
      } else if (
        drag.owner.generated.has(drag.panel) &&
        this.empty(drag.panel)
      ) {
        const index = drag.owner.panels().indexOf(drag.panel);
        drag.owner.headers()[index]?.remove();
        drag.panel.remove();
        drag.owner.generated.delete(drag.panel);
      }
      this.tabs.syncDragTabs(target.panel);
    } else {
      const headers = this.headers();
      const panels = this.panels();
      let index = target.index ?? headers.length;
      const header =
        drag.header ||
        this.tabs.ownerDocument.createElement('vscode-tab-header');
      const panel = drag.header
        ? drag.panel
        : this.tabs.ownerDocument.createElement('vscode-tab-panel');
      if (
        drag.header &&
        drag.owner !== this &&
        drag.owner.generated.delete(panel)
      ) {
        this.generated.add(panel);
      }
      if (!drag.header) {
        header.textContent =
          drag.views[0].querySelector('legend')?.textContent?.trim() || 'View';
        panel.append(...drag.views);
        this.generated.add(panel);
      }
      const selected = this.panels()[this.tabs.selectedIndex];
      if (drag.owner === this && drag.header && sourceIndex < index) {
        index--;
      }
      const remainingHeaders = headers.filter((el) => el !== header);
      const remainingPanels = panels.filter((el) => el !== panel);
      header.slot = 'header';
      this.tabs.insertBefore(header, remainingHeaders[index] || null);
      this.tabs.insertBefore(panel, remainingPanels[index] || null);
      this.tabs.syncDragTabs(
        drag.header ? (selected === drag.panel ? panel : selected) : panel
      );
    }
    if (drag.owner !== this || !drag.header) {
      drag.owner.tabs.syncDragTabs();
    }
    for (const controller of controllers) {
      for (const panel of controller.generated) {
        if (controller.empty(panel) && panel.isConnected) {
          controller.headers()[controller.panels().indexOf(panel)]?.remove();
          panel.remove();
          controller.generated.delete(panel);
          controller.tabs.syncDragTabs();
        }
      }
      controller.refresh();
    }
    this.tabs.dispatchEvent(
      new CustomEvent('vsc-tabs-layout-change', {
        bubbles: true,
        composed: true,
        detail: {
          source: drag.owner.tabs,
          destination: this.tabs,
          views: drag.views,
          header: drag.header,
        },
      })
    );
    this.end();
  };

  private leave = (event: DragEvent) => {
    const related = event.relatedTarget;
    if (
      !(related instanceof Node) ||
      (!this.tabs.contains(related) && !this.tabs.shadowRoot?.contains(related))
    ) {
      this.clear();
    }
  };

  private key = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      this.end();
    }
  };

  private clear() {
    this.cancelHover();
    this.target = undefined;
    this.overlay?.remove();
    this.overlay = undefined;
  }

  private end = () => {
    session = undefined;
    controllers.forEach((controller) => {
      controller.clear();
      controller.image?.remove();
      controller.image = undefined;
    });
  };
}
