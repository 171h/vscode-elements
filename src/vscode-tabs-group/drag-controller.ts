import {VscodeTabHeader} from '../vscode-tab-header/index.js';
import {VscodeTabPanel} from '../vscode-tab-panel/index.js';
import type {VscodeTabs} from '../vscode-tabs/index.js';
import {
  clearTabsDragFeedback,
  getTabsDragSession,
  panelViews,
} from '../vscode-tabs/drag-controller.js';
import type {TabsDragSession} from '../vscode-tabs/drag-controller.js';
import type {
  VscodeTabsGroup,
  VscTabsGroupLayoutChangeEvent,
} from './vscode-tabs-group.js';

/** Move a whole tabs group by dragging the background of its tab strip. */
const HANDLE_ATTR = 'data-vsc-tabs-group-handle';
const DRAGGING_ATTR = 'data-vsc-group-dragging';
const PLACEHOLDER_ATTR = 'data-vsc-group-placeholder';
const DRAGOVER_ATTR = 'data-vsc-group-dragover';
const INTERACTIVE =
  'input, button, select, textarea, a, [contenteditable="true"]';
const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

type GroupSession = {
  owner: TabsGroupDragController;
  tabs: VscodeTabs;
};

let session: GroupSession | undefined;
const controllers = new Set<TabsGroupDragController>();

function endGroupDrag() {
  const drag = session;

  session = undefined;
  drag?.tabs.removeAttribute(DRAGGING_ATTR);
  if (drag) {
    drag.owner.image?.remove();
    drag.owner.image = undefined;
  }
  controllers.forEach((controller) => controller.clear());
}

/**
 * Native move drag and drop for `vscode-tabs` children of a
 * `vscode-tabs-group`, following the same model as the tabs drag controller:
 * native drag images, midpoint insertion and themed indicators.
 *
 * A tabs group is dragged by the empty part of its tab strip. Tab titles keep
 * their existing drag behavior, so a tab can still be pulled out into its own
 * group, and fieldset legends still promote a view to a new group.
 */
export class TabsGroupDragController {
  private observer = new MutationObserver(() => this.refresh());
  private handles = new Map<VscodeTabs, HTMLElement>();
  private pending = new WeakSet<VscodeTabs>();
  private placeholder?: HTMLDivElement;
  /** @internal Drag image kept until the drag ends. */
  image?: HTMLDivElement;
  private target?: Element | null;

  constructor(private group: VscodeTabsGroup) {}

  connect() {
    controllers.add(this);
    this.group.addEventListener('dragstart', this.start);
    this.group.addEventListener('dragover', this.captureOver, true);
    this.group.addEventListener('dragover', this.over);
    this.group.addEventListener('drop', this.drop);
    this.group.addEventListener('dragleave', this.leave);
    this.group.ownerDocument.addEventListener('dragend', this.end);
    this.group.ownerDocument.addEventListener('keydown', this.key);
    this.observer.observe(this.group, {childList: true});
    this.refresh();
  }

  disconnect() {
    if (session?.owner === this) {
      endGroupDrag();
    }
    this.clear();
    this.observer.disconnect();
    this.group.removeEventListener('dragstart', this.start);
    this.group.removeEventListener('dragover', this.captureOver, true);
    this.group.removeEventListener('dragover', this.over);
    this.group.removeEventListener('drop', this.drop);
    this.group.removeEventListener('dragleave', this.leave);
    this.group.ownerDocument.removeEventListener('dragend', this.end);
    this.group.ownerDocument.removeEventListener('keydown', this.key);
    controllers.delete(this);
    this.handles.forEach((handle) => {
      handle.removeAttribute('draggable');
      handle.removeAttribute(HANDLE_ATTR);
      handle.style.removeProperty('cursor');
    });
    this.handles.clear();
  }

  /** @internal */
  refresh() {
    if (!this.group.isConnected) {
      return;
    }
    const handles = new Map<VscodeTabs, HTMLElement>();

    this.tabs().forEach((tabs) => {
      const bar = tabs.dragBar;

      if (bar) {
        handles.set(tabs, bar);
      } else if (!this.pending.has(tabs)) {
        this.pending.add(tabs);
        tabs.updateComplete.then(() => this.refresh());
      }
    });
    this.handles.forEach((handle, tabs) => {
      if (handles.get(tabs) !== handle) {
        handle.removeAttribute('draggable');
        handle.removeAttribute(HANDLE_ATTR);
        handle.style.removeProperty('cursor');
      }
    });
    handles.forEach((handle) => {
      handle.setAttribute('draggable', 'true');
      handle.setAttribute(HANDLE_ATTR, '');
      handle.style.cursor = 'grab';
    });
    this.handles = handles;
  }

  /** @internal Clears the placeholder and any target feedback. */
  clear() {
    this.target = undefined;
    this.placeholder?.remove();
    this.placeholder = undefined;
    this.group.removeAttribute(DRAGOVER_ATTR);
  }

  private tabs(): VscodeTabs[] {
    return Array.from(this.group.children).filter(
      (el) => el.localName === 'vscode-tabs'
    ) as VscodeTabs[];
  }

  private childTabsInPath(event: DragEvent): VscodeTabs | undefined {
    const own = this.tabs();

    return event.composedPath().find((el) => own.includes(el as VscodeTabs)) as
      | VscodeTabs
      | undefined;
  }

  private start = (event: DragEvent) => {
    if (!event.dataTransfer) {
      return;
    }
    const path = event.composedPath();

    if (
      path.some((el) => el instanceof HTMLElement && el.matches(INTERACTIVE))
    ) {
      event.preventDefault();
      return;
    }
    const tabs = path.find(
      (el) => el instanceof HTMLElement && el.localName === 'vscode-tabs'
    ) as VscodeTabs | undefined;
    if (!tabs || tabs.parentElement !== this.group) {
      return;
    }
    const bar = tabs.dragBar;

    if (
      !bar ||
      !bar.hasAttribute(HANDLE_ATTR) ||
      !path.includes(bar) ||
      path.some((el) => el instanceof VscodeTabHeader)
    ) {
      return;
    }
    endGroupDrag();
    session = {owner: this, tabs};
    event.stopPropagation();
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData(
      'application/x-vscode-elements-tabs-group',
      'move'
    );
    tabs.setAttribute(DRAGGING_ATTR, '');
    this.image = this.buildImage(tabs);
    event.dataTransfer.setDragImage(this.image, 12, 12);
  };

  /** Keeps the tab titles of the dragged group attached to the pointer. */
  private buildImage(tabs: VscodeTabs): HTMLDivElement {
    const image = this.group.ownerDocument.createElement('div');
    const headers = Array.from(tabs.children).filter(
      (el): el is VscodeTabHeader => el instanceof VscodeTabHeader
    );

    Object.assign(image.style, {
      position: 'fixed',
      top: '-1000px',
      left: '0',
      display: 'flex',
      alignItems: 'stretch',
      background:
        'var(--vscode-panel-background, var(--vscode-sideBar-background, #181818))',
      border:
        '1px solid var(--vscode-contrastActiveBorder, var(--vscode-focusBorder, #0078d4))',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.35)',
      font: '13px var(--vscode-font-family, sans-serif)',
    });
    headers.forEach((header, index) => {
      const chip = this.group.ownerDocument.createElement('div');
      const active = index === tabs.selectedIndex;

      chip.textContent = header.textContent?.trim() || 'Tab';
      Object.assign(chip.style, {
        borderBottom: active
          ? '2px solid var(--vscode-panelTitle-activeBorder, #0078d4)'
          : '2px solid transparent',
        color: active
          ? 'var(--vscode-panelTitle-activeForeground, var(--vscode-foreground, #cccccc))'
          : 'var(--vscode-panelTitle-inactiveForeground, var(--vscode-foreground, #9d9d9d))',
        maxWidth: '200px',
        overflow: 'hidden',
        padding: '7px 10px',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      });
      image.append(chip);
    });
    (this.group.shadowRoot || this.group.ownerDocument.body).append(image);
    return image;
  }

  private over = (event: DragEvent) => {
    const drag = session;
    const tabsDrag = drag ? undefined : getTabsDragSession();

    if (!drag && !tabsDrag) {
      return;
    }
    if (tabsDrag && this.childTabsInPath(event)) {
      return;
    }
    if (tabsDrag) {
      clearTabsDragFeedback();
    }
    this.place(
      this.computeBefore(event.clientY, drag?.tabs),
      drag?.tabs,
      tabsDrag
    );
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
    event.preventDefault();
    event.stopPropagation();
  };

  private drop = (event: DragEvent) => {
    const drag = session;
    const tabsDrag = drag ? undefined : getTabsDragSession();

    if (!drag && !tabsDrag) {
      return;
    }
    if (tabsDrag && this.childTabsInPath(event)) {
      return;
    }
    // Recompute at release so stale feedback cannot cause an unintended move.
    this.over(event);
    if (this.target === undefined) {
      endGroupDrag();
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    const before = this.target ?? null;

    if (drag) {
      const source = drag.owner.group;
      const tabs = drag.tabs;

      this.group.insertBefore(tabs, before);
      this.announce(source, tabs, undefined, this.viewsOf(tabs));
    } else if (tabsDrag) {
      const source = tabsDrag.owner.tabs.closest(
        'vscode-tabs-group'
      ) as VscodeTabsGroup | null;
      const tabs = tabsDrag.owner.moveToNewGroup(this.group, before);

      if (tabs) {
        this.announce(source, tabs, tabsDrag.header, tabsDrag.views);
      }
    }
    endGroupDrag();
  };

  /**
   * Clears the placeholder as soon as the pointer enters one of the tabs
   * components of this group: the inner tabs controller takes over there.
   */
  private captureOver = (event: DragEvent) => {
    if (getTabsDragSession() && this.childTabsInPath(event)) {
      this.clear();
    }
  };

  private leave = (event: DragEvent) => {
    const related = event.relatedTarget;

    if (
      !(related instanceof Node) ||
      (!this.group.contains(related) &&
        !this.group.shadowRoot?.contains(related))
    ) {
      this.clear();
    }
  };

  private key = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      endGroupDrag();
    }
  };

  private computeBefore(clientY: number, dragged?: VscodeTabs): Element | null {
    for (const tabs of this.tabs()) {
      if (tabs === dragged) {
        continue;
      }
      const rect = tabs.getBoundingClientRect();

      if (clientY < rect.top + rect.height / 2) {
        return tabs;
      }
    }
    return null;
  }

  /**
   * Shows the placeholder at the insertion point. Siblings are animated from
   * their previous position so the groups slide apart instead of jumping.
   */
  private place(
    before: Element | null,
    dragged?: VscodeTabs,
    tabsDrag?: TabsDragSession
  ) {
    if (!this.placeholder) {
      this.placeholder = this.group.ownerDocument.createElement('div');
      this.placeholder.setAttribute(PLACEHOLDER_ATTR, '');
      this.placeholder.setAttribute('aria-hidden', 'true');
    }
    this.fill(this.placeholder, dragged, tabsDrag);
    this.target = before;
    this.group.setAttribute(DRAGOVER_ATTR, '');
    if (
      this.placeholder.parentElement === this.group &&
      this.placeholder.nextElementSibling === before
    ) {
      return;
    }
    const first = new Map<Element, DOMRect>();

    for (const child of Array.from(this.group.children)) {
      first.set(child, child.getBoundingClientRect());
    }
    this.group.insertBefore(this.placeholder, before);
    if (matchMedia(REDUCED_MOTION).matches) {
      return;
    }
    for (const child of Array.from(this.group.children)) {
      const from = first.get(child);

      if (!from) {
        continue;
      }
      const to = child.getBoundingClientRect();
      const dy = from.top - to.top;

      if (Math.abs(dy) < 0.5) {
        continue;
      }
      child.animate([{transform: `translateY(${dy}px)`}, {transform: 'none'}], {
        duration: 140,
        easing: 'ease-out',
      });
    }
  }

  private fill(
    placeholder: HTMLDivElement,
    dragged?: VscodeTabs,
    tabsDrag?: TabsDragSession
  ) {
    const doc = this.group.ownerDocument;
    const titles: string[] = [];
    let height = 72;

    if (dragged) {
      height = Math.max(48, Math.round(dragged.getBoundingClientRect().height));
      for (const child of Array.from(dragged.children)) {
        if (child instanceof VscodeTabHeader) {
          titles.push(child.textContent?.trim() || 'Tab');
        }
      }
    } else if (tabsDrag?.header) {
      titles.push(tabsDrag.header.textContent?.trim() || 'Tab');
    } else if (tabsDrag) {
      titles.push(
        ...tabsDrag.views.map(
          (view) => view.querySelector('legend')?.textContent?.trim() || 'View'
        )
      );
    }
    placeholder.textContent = '';
    placeholder.style.height = `${height}px`;
    const bar = doc.createElement('div');

    Object.assign(bar.style, {display: 'flex', flexWrap: 'wrap', gap: '4px'});
    (titles.length ? titles : ['Tabs group']).forEach((title) => {
      const chip = doc.createElement('span');

      chip.textContent = title;
      Object.assign(chip.style, {
        background:
          'var(--vscode-panel-background, var(--vscode-sideBar-background, #181818))',
        border:
          '1px solid var(--vscode-panelTitle-activeBorder, var(--vscode-focusBorder, #0078d4))',
        borderRadius: '3px',
        color: 'var(--vscode-foreground, #cccccc)',
        font: '11px var(--vscode-font-family, sans-serif)',
        maxWidth: '160px',
        overflow: 'hidden',
        padding: '2px 8px',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      });
      bar.append(chip);
    });
    placeholder.append(bar);
    if (!dragged) {
      const label = doc.createElement('span');

      label.textContent = 'New tabs group';
      Object.assign(label.style, {
        color: 'var(--vscode-descriptionForeground, #9d9d9d)',
        font: '11px var(--vscode-font-family, sans-serif)',
        textAlign: 'center',
      });
      placeholder.append(label);
    }
  }

  private viewsOf(tabs: VscodeTabs): HTMLElement[] {
    return Array.from(tabs.children)
      .filter((el): el is VscodeTabPanel => el instanceof VscodeTabPanel)
      .flatMap((panel) => panelViews(panel));
  }

  private announce(
    source: VscodeTabsGroup | null,
    tabs: VscodeTabs,
    header: VscodeTabHeader | undefined,
    views: HTMLElement[]
  ) {
    this.group.dispatchEvent(
      new CustomEvent('vsc-tabs-group-layout-change', {
        bubbles: true,
        composed: true,
        detail: {source, destination: this.group, tabs, header, views},
      }) as VscTabsGroupLayoutChangeEvent
    );
  }

  private end = () => {
    endGroupDrag();
  };
}
