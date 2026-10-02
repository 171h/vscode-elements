import {PropertyValues, TemplateResult, html} from 'lit';
import {provide} from '@lit/context';
import {property, queryAssignedElements} from 'lit/decorators.js';
import {customElement, VscElement} from '../includes/VscElement.js';
import type {VscodeTreeItem} from '../vscode-tree-item';
import styles from './vscode-tree.styles.js';
import {
  ConfigContext,
  configContext,
  treeContext,
  type TreeContext,
} from './tree-context.js';
import {
  findNextItem,
  findPrevItem,
  findParentItem,
  initPathTrackerProps,
} from './helpers.js';
import {FormControlSize} from '../includes/form-control-size.js';

export type VscTreeSelectEvent = CustomEvent<{selectedItems: VscodeTreeItem[]}>;

export const ExpandMode = {
  singleClick: 'singleClick',
  doubleClick: 'doubleClick',
} as const;

export type ExpandMode = (typeof ExpandMode)[keyof typeof ExpandMode];

export const IndentGuides = {
  none: 'none',
  onHover: 'onHover',
  always: 'always',
} as const;

export type IndentGuideDisplay =
  (typeof IndentGuides)[keyof typeof IndentGuides];

type ListenedKey =
  | 'ArrowDown'
  | 'ArrowUp'
  | 'ArrowLeft'
  | 'ArrowRight'
  | 'Enter'
  | 'Escape'
  | 'Shift'
  | ' ';

const listenedKeys: ListenedKey[] = [
  ' ',
  'ArrowDown',
  'ArrowUp',
  'ArrowLeft',
  'ArrowRight',
  'Enter',
  'Escape',
  'Shift',
];

/**
 * @tag vscode-tree
 *
 * @cssprop [--vscode-font-family=sans-serif]
 * @cssprop [--vscode-font-size=13px]
 * @cssprop [--vscode-font-weight=normal]
 * @cssprop [--vscode-foreground=#cccccc]
 * @cssprop [--vscode-icon-foreground=#cccccc]
 * @cssprop [--vscode-list-focusAndSelectionOutline=#0078d4]
 * @cssprop [--vscode-list-focusOutline=#0078d4]
 * @cssprop [--vscode-list-hoverBackground=#2a2d2e]
 * @cssprop [--vscode-list-hoverForeground=#cccccc]
 * @cssprop [--vscode-tree-inactiveIndentGuidesStroke=rgba(88, 88, 88, 0.4)]
 * @cssprop [--vscode-tree-indentGuidesStroke=#585858]
 */
@customElement('vscode-tree')
export class VscodeTree extends VscElement {
  static override styles = styles;

  //#region 属性

  /**
   * 树项目尺寸，默认为 `medium`。
   */
  @property({reflect: true})
  size: FormControlSize = 'medium';

  /**
   * 控制点击时树文件夹的展开方式，用于适配
   * `workbench.tree.expandMode` 设置。
   *
   * 有效选项通过常量提供。
   *
   * ```javascript
   * import {ExpandMode} from 'nusys-ui/dist/vscode-tree/vscode-tree.js';
   *
   * document.querySelector('vscode-tree').expandMode = ExpandMode.singleClick;
   * ```
   *
   * @type {'singleClick' | 'doubleClick'}
   */
  @property({type: String, attribute: 'expand-mode'})
  expandMode: ExpandMode = 'singleClick';

  /**
   * VS Code 的树组件默认始终显示箭头，但部分图标集
   * （例如 Material Icon Theme）允许在文件资源管理器中禁用箭头。
   * 此标记用于模拟该行为。
   */
  @property({type: Boolean, reflect: true, attribute: 'hide-arrows'})
  hideArrows: boolean = false;

  /**
   * 控制缩进的像素值，用于适配
   * `workbench.tree.indent` 设置。
   */
  @property({type: Number, reflect: true})
  indent: number = 8;

  /**
   * 控制树是否渲染缩进参考线，
   * 用于适配 `workbench.tree.renderIndentGuides` 设置。
   *
   * 有效选项通过常量提供。
   *
   * ```javascript
   * import {IndentGuides} from 'nusys-ui/dist/vscode-tree/vscode-tree.js';
   *
   * document.querySelector('vscode-tree').expandMode = IndentGuides.onHover;
   * ```
   *
   * @type {'none' | 'onHover' | 'always'}
   */
  @property({
    type: String,
    attribute: 'indent-guides',
    useDefault: true,
    reflect: true,
  })
  indentGuides: IndentGuideDisplay = 'onHover';

  /**
   * 允许选择多个项目。
   */
  @property({type: Boolean, reflect: true, attribute: 'multi-select'})
  multiSelect: boolean = false;

  //#endregion

  //#region 私有变量

  @provide({context: treeContext})
  private _treeContextState: TreeContext = {
    isShiftPressed: false,
    activeItem: null,
    selectedItems: new Set(),
    hoveredItem: null,
    allItems: null,
    itemListUpToDate: false,
    focusedItem: null,
    prevFocusedItem: null,
    hasBranchItem: false,
    rootElement: this,
    highlightedItems: new Set(),
    highlightIndentGuides: () => {
      this._highlightIndentGuides();
    },
    emitSelectEvent: () => {
      this._emitSelectEvent();
    },
  };

  @provide({context: configContext})
  private _configContext: ConfigContext = {
    hideArrows: this.hideArrows,
    expandMode: this.expandMode,
    indent: this.indent,
    indentGuides: this.indentGuides,
    multiSelect: this.multiSelect,
  };

  @queryAssignedElements({selector: 'vscode-tree-item'})
  private _assignedTreeItems!: VscodeTreeItem[];

  //#endregion

  //#region 生命周期方法

  constructor() {
    super();

    this.addEventListener('keyup', this._handleComponentKeyUp);
    this.addEventListener('keydown', this._handleComponentKeyDown);
  }

  override connectedCallback(): void {
    super.connectedCallback();

    this.role = 'tree';
  }

  protected override willUpdate(changedProperties: PropertyValues<this>): void {
    this._updateConfigContext(changedProperties);

    if (changedProperties.has('multiSelect')) {
      this.ariaMultiSelectable = this.multiSelect ? 'true' : 'false';
    }
  }

  //#endregion

  //#region 公共方法

  /**
   * 展开所有文件夹。
   */
  expandAll() {
    const children = this.querySelectorAll<VscodeTreeItem>('vscode-tree-item');

    children.forEach((item) => {
      if (item.branch) {
        item.open = true;
      }
    });
  }

  /**
   * 折叠所有文件夹。
   */
  collapseAll() {
    const children = this.querySelectorAll<VscodeTreeItem>('vscode-tree-item');

    children.forEach((item) => {
      if (item.branch) {
        item.open = false;
      }
    });
  }

  /**
   * @internal
   * 更新上下文状态中的 `hasBranchItem`，
   * 按需移除叶子元素前的额外内边距。
   */
  updateHasBranchItemFlag() {
    const hasBranchItem = this._assignedTreeItems.some((li) => li.branch);
    this._treeContextState = {...this._treeContextState, hasBranchItem};
  }

  //#endregion

  //#region 私有方法

  private _emitSelectEvent() {
    const ev = new CustomEvent('vsc-tree-select', {
      detail: Array.from(this._treeContextState.selectedItems),
    });

    this.dispatchEvent(ev);
  }

  private _highlightIndentGuideOfItem(item: VscodeTreeItem) {
    if (item.branch && item.open) {
      item.highlightedGuides = true;
      this._treeContextState.highlightedItems?.add(item);
    } else {
      const parent = findParentItem(item);

      if (parent) {
        parent.highlightedGuides = true;
        this._treeContextState.highlightedItems?.add(parent);
      }
    }
  }

  private _highlightIndentGuides() {
    if (this.indentGuides === IndentGuides.none) {
      return;
    }

    this._treeContextState.highlightedItems?.forEach(
      (i) => (i.highlightedGuides = false)
    );
    this._treeContextState.highlightedItems?.clear();

    if (this._treeContextState.activeItem) {
      this._highlightIndentGuideOfItem(this._treeContextState.activeItem);
    }

    this._treeContextState.selectedItems.forEach((item) => {
      this._highlightIndentGuideOfItem(item);
    });
  }

  private _updateConfigContext(changedProperties: PropertyValues) {
    const {hideArrows, expandMode, indent, indentGuides, multiSelect} = this;

    if (changedProperties.has('hideArrows')) {
      this._configContext = {...this._configContext, hideArrows};
    }

    if (changedProperties.has('expandMode')) {
      this._configContext = {...this._configContext, expandMode};
    }

    if (changedProperties.has('indent')) {
      this._configContext = {...this._configContext, indent};
    }

    if (changedProperties.has('indentGuides')) {
      this._configContext = {...this._configContext, indentGuides};
    }

    if (changedProperties.has('multiSelect')) {
      this._configContext = {...this._configContext, multiSelect};
    }
  }

  private _focusItem(item: VscodeTreeItem) {
    item.active = true;

    item.updateComplete.then(() => {
      item.focus();
      this._highlightIndentGuides();
    });
  }

  private _focusPrevItem() {
    if (this._treeContextState.focusedItem) {
      const item = findPrevItem(this._treeContextState.focusedItem);

      if (item) {
        this._focusItem(item);

        if (this._treeContextState.isShiftPressed && this.multiSelect) {
          item.selected = !item.selected;
          this._emitSelectEvent();
        }
      }
    }
  }

  private _focusNextItem() {
    if (this._treeContextState.focusedItem) {
      const item = findNextItem(this._treeContextState.focusedItem);

      if (item) {
        this._focusItem(item);

        if (this._treeContextState.isShiftPressed && this.multiSelect) {
          item.selected = !item.selected;
          this._emitSelectEvent();
        }
      }
    }
  }

  //#endregion

  //#region 事件处理

  private _handleArrowRightPress() {
    if (!this._treeContextState.focusedItem) {
      return;
    }

    const {focusedItem} = this._treeContextState;

    if (focusedItem.branch) {
      if (focusedItem.open) {
        this._focusNextItem();
      } else {
        focusedItem.open = true;
      }
    }
  }

  private _handleArrowLeftPress(ev: KeyboardEvent) {
    if (ev.ctrlKey) {
      this.collapseAll();
      return;
    }

    if (!this._treeContextState.focusedItem) {
      return;
    }

    const {focusedItem} = this._treeContextState;
    const parent = findParentItem(focusedItem);

    if (!focusedItem.branch) {
      if (parent && parent.branch) {
        this._focusItem(parent);
      }
    } else {
      if (focusedItem.open) {
        focusedItem.open = false;
      } else {
        if (parent && parent.branch) {
          this._focusItem(parent);
        }
      }
    }
  }

  private _handleArrowDownPress() {
    if (this._treeContextState.focusedItem) {
      this._focusNextItem();
    } else {
      this._focusItem(this._assignedTreeItems[0]);
    }
  }

  private _handleArrowUpPress() {
    if (this._treeContextState.focusedItem) {
      this._focusPrevItem();
    } else {
      this._focusItem(this._assignedTreeItems[0]);
    }
  }

  private _handleEnterPress() {
    const {focusedItem} = this._treeContextState;

    if (focusedItem) {
      this._treeContextState.selectedItems.forEach(
        (li) => (li.selected = false)
      );
      this._treeContextState.selectedItems.clear();
      this._highlightIndentGuides();

      focusedItem.selected = true;
      this._emitSelectEvent();

      if (focusedItem.branch) {
        focusedItem.open = !focusedItem.open;
      }
    }
  }

  private _handleShiftPress() {
    this._treeContextState.isShiftPressed = true;
  }

  private _handleComponentKeyDown = (ev: KeyboardEvent) => {
    const key = ev.key as ListenedKey;

    if (listenedKeys.includes(key)) {
      ev.stopPropagation();
      ev.preventDefault();
    }

    switch (key) {
      case ' ':
      case 'Enter':
        this._handleEnterPress();
        break;
      case 'ArrowDown':
        this._handleArrowDownPress();
        break;
      case 'ArrowLeft':
        this._handleArrowLeftPress(ev);
        break;
      case 'ArrowRight':
        this._handleArrowRightPress();
        break;
      case 'ArrowUp':
        this._handleArrowUpPress();
        break;
      case 'Shift':
        this._handleShiftPress();
        break;
      default:
    }
  };

  private _handleComponentKeyUp = (ev: KeyboardEvent) => {
    if (ev.key === 'Shift') {
      this._treeContextState.isShiftPressed = false;
    }
  };

  private _handleSlotChange = () => {
    this._treeContextState.itemListUpToDate = false;
    initPathTrackerProps(this, this._assignedTreeItems);

    this.updateComplete.then(() => {
      if (this._treeContextState.activeItem === null) {
        const firstChild = this.querySelector<VscodeTreeItem>(
          ':scope > vscode-tree-item'
        );

        if (firstChild) {
          firstChild.active = true;
        }
      }
    });
  };

  //#endregion

  override render(): TemplateResult {
    return html`<div>
      <slot @slotchange=${this._handleSlotChange}></slot>
    </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'vscode-tree': VscodeTree;
  }

  interface GlobalEventHandlersEventMap {
    'vsc-tree-select': VscTreeSelectEvent;
  }
}
