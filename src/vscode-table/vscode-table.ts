import {html, PropertyValues, TemplateResult} from 'lit';
import {
  property,
  query,
  queryAll,
  queryAssignedElements,
  state,
} from 'lit/decorators.js';
import {classMap} from 'lit/directives/class-map.js';
import {customElement, VscElement} from '../includes/VscElement.js';
import {stylePropertyMap} from '../includes/style-property-map.js';
import '../vscode-scrollable/index.js';
import {VscodeScrollable} from '../vscode-scrollable/index.js';
import {VscodeTableBody} from '../vscode-table-body/index.js';
import {VscodeTableCell} from '../vscode-table-cell/index.js';
import {VscodeTableHeader} from '../vscode-table-header/index.js';
import {VscodeTableHeaderCell} from '../vscode-table-header-cell/index.js';
import {
  parseSizeAttributeToPercent,
  Percent,
  percent,
} from '../includes/sizes.js';
import styles from './vscode-table.styles.js';
import {ColumnResizeController} from './ColumnResizeController.js';
import {VscTableChangeMinColumnWidthEvent} from '../vscode-table-header-cell/vscode-table-header-cell.js';
import {FormControlSize} from '../includes/form-control-size.js';

/**
 * @tag vscode-table
 *
 * @cssprop [--vscode-editorGroup-border=rgba(255, 255, 255, 0.09)]
 * @cssprop [--vscode-keybindingTable-rowsBackground=rgba(204, 204, 204, 0.04)]
 * @cssprop [--vscode-sash-hoverBorder=#0078d4]
 */
@customElement('vscode-table')
export class VscodeTable extends VscElement {
  static override styles = styles;

  /** @internal */
  @property({reflect: true})
  override role = 'table';

  @property({type: Boolean, reflect: true})
  resizable = false;

  @property({type: Boolean, reflect: true})
  responsive = false;

  /**
   * 表格行和文字的尺寸，默认为 `medium`。
   */
  @property({reflect: true})
  size: FormControlSize = 'medium';

  /**
   * 行列均以边框分隔。
   */
  @property({type: Boolean, reflect: true})
  bordered = false;

  /**
   * 列之间以边框分隔。
   */
  @property({type: Boolean, reflect: true, attribute: 'bordered-columns'})
  borderedColumns = false;

  /**
   * 行之间以边框分隔。
   */
  @property({type: Boolean, reflect: true, attribute: 'bordered-rows'})
  borderedRows = false;

  @property({type: Number})
  breakpoint = 300;

  /**
   * 以 JSON 数组编码的初始列尺寸。
   * 接受以下值：
   * - 数字
   * - 数字字符串（例如 "100"）
   * - 像素值（例如 "100px"）
   * - 百分比值（例如 "50%"）
   * - 百分比值（例如 "50%"）
   * - "auto" 关键字
   */
  @property({type: Array})
  set columns(val: string[]) {
    if (!Array.isArray(val)) {
      this.warn('Invalid value for "columns": expected an array.');
      this._columns = [];

      return;
    }

    this._columns = val;

    if (this.isConnected) {
      this._initDefaultColumnSizes();
    }
  }
  get columns(): string[] {
    return this._columns;
  }

  /**
   * 最小列宽，接受以下值：
   * - 数字
   * - 数字字符串（例如 "100"）
   * - 像素值（例如 "100px"）
   * - 百分比值（例如 "50%"）
   * - 百分比值（例如 "50%"）
   * - "auto" 关键字
   */
  @property({attribute: 'min-column-width'})
  minColumnWidth = '50px';

  @property({type: Boolean, reflect: true, attribute: 'delayed-resizing'})
  delayedResizing = false;

  /**
   * @internal
   */
  @property({type: Boolean, reflect: true})
  compact = false;

  /**
   * 斑马纹：为偶数行着色。
   */
  @property({type: Boolean, reflect: true})
  zebra = false;

  /**
   * 斑马纹：为奇数行着色。
   */
  @property({type: Boolean, reflect: true, attribute: 'zebra-odd'})
  zebraOdd = false;

  @query('.header')
  private _headerElement!: HTMLDivElement;

  @query('.scrollable')
  private _scrollableElement!: VscodeScrollable;

  @queryAll('.sash-visible')
  private _sashVisibleElements!: HTMLDivElement[];

  @queryAssignedElements({
    flatten: true,
    selector: 'vscode-table-header, vscode-table-body',
  })
  private _assignedElements!: NodeListOf<HTMLElement>;

  @queryAssignedElements({
    slot: 'header',
    flatten: true,
    selector: 'vscode-table-header',
  })
  private _assignedHeaderElements!: NodeListOf<VscodeTableHeader>;

  @queryAssignedElements({
    slot: 'body',
    flatten: true,
    selector: 'vscode-table-body',
  })
  private _assignedBodyElements!: NodeListOf<VscodeTableBody>;

  /**
   * 以百分比表示的分隔条位置
   */
  @state()
  private _sashPositions: number[] = [];

  @state()
  private _isDragging = false;

  /**
   * 分隔条悬停状态标记，用于渲染。
   */
  private _sashHovers: boolean[] = [];
  private _columns: string[] = [];
  private _componentResizeObserver?: ResizeObserver;
  private _headerResizeObserver?: ResizeObserver;
  private _bodyResizeObserver?: ResizeObserver;
  private _activeSashElementIndex = -1;
  private _componentH = 0;
  private _componentW = 0;
  /**
   * 缓存的 querySelectorAll 结果，表头插槽变化时更新。
   * 不要直接使用，请通过 "_getHeaderCells" 函数读取。
   */
  private _headerCells: VscodeTableHeaderCell[] = [];
  /**
   * 缓存的 querySelectorAll 结果，表格主体插槽变化时更新。
   * 不要直接使用，请通过 "_getCellsOfFirstRow" 函数读取。
   */
  private _cellsOfFirstRow: VscodeTableCell[] = [];
  private _prevHeaderHeight = 0;
  private _prevComponentHeight = 0;

  private _columnResizeController = new ColumnResizeController(this);

  constructor() {
    super();

    this.addEventListener(
      'vsc-table-change-min-column-width',
      this._handleMinColumnWidthChange
    );
  }

  override connectedCallback(): void {
    super.connectedCallback();

    this._memoizeComponentDimensions();
    this._initDefaultColumnSizes();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this._componentResizeObserver?.unobserve(this);
    this._componentResizeObserver?.disconnect();
    this._bodyResizeObserver?.disconnect();
  }

  protected override willUpdate(changedProperties: PropertyValues): void {
    // `minColumnWidth` 已弃用。在从 API 完全移除之前，
    // 当列头单元格未指定 min-width 时，
    // 将其作为回退值。
    if (changedProperties.has('minColumnWidth')) {
      const value = percent(
        parseSizeAttributeToPercent(this.minColumnWidth, this._componentW) ?? 0
      );
      const prevMap = this._columnResizeController.columnMinWidths;
      const widths = this._columnResizeController.columnWidths;

      for (let i = 0; i < widths.length; i++) {
        // 不要覆盖来自表头单元格的值：
        if (!prevMap.has(i)) {
          this._columnResizeController.setColumnMinWidthAt(i, value);
        }
      }
    }
  }

  private _memoizeComponentDimensions() {
    const cr = this.getBoundingClientRect();

    this._componentH = cr.height;
    this._componentW = cr.width;
  }

  private _queryHeaderCells() {
    const headers = this._assignedHeaderElements;

    if (!(headers && headers[0])) {
      return [];
    }

    return Array.from(
      headers[0].querySelectorAll<VscodeTableHeaderCell>(
        'vscode-table-header-cell'
      )
    );
  }

  /**
   * 获取缓存的表头单元格
   */
  private _getHeaderCells() {
    if (!this._headerCells.length) {
      this._headerCells = this._queryHeaderCells();
    }

    return this._headerCells;
  }

  private _queryCellsOfFirstRow() {
    const assignedBodyElements = this._assignedBodyElements;

    if (!(assignedBodyElements && assignedBodyElements[0])) {
      return [];
    }

    return Array.from(
      assignedBodyElements[0].querySelectorAll<VscodeTableCell>(
        'vscode-table-row:first-child vscode-table-cell'
      )
    );
  }

  /**
   * 获取缓存的首行单元格
   */
  private _getCellsOfFirstRow() {
    if (!this._cellsOfFirstRow.length) {
      this._cellsOfFirstRow = this._queryCellsOfFirstRow();
    }

    return this._cellsOfFirstRow;
  }

  private _resizeTableBody() {
    let headerHeight = 0;
    let tbodyHeight = 0;
    const tableHeight = this.getBoundingClientRect().height;

    if (this._assignedHeaderElements && this._assignedHeaderElements.length) {
      headerHeight =
        this._assignedHeaderElements[0].getBoundingClientRect().height;
    }

    if (this._assignedBodyElements && this._assignedBodyElements.length) {
      tbodyHeight =
        this._assignedBodyElements[0].getBoundingClientRect().height;
    }

    const overflownContentHeight = tbodyHeight - headerHeight - tableHeight;

    this._scrollableElement.style.height =
      overflownContentHeight > 0 ? `${tableHeight - headerHeight}px` : 'auto';
  }

  private _initResizeObserver() {
    this._componentResizeObserver = new ResizeObserver(
      this._componentResizeObserverCallback
    );
    this._componentResizeObserver.observe(this);

    this._headerResizeObserver = new ResizeObserver(
      this._headerResizeObserverCallback
    );
    this._headerResizeObserver.observe(this._headerElement);
  }

  private _componentResizeObserverCallback = () => {
    this._memoizeComponentDimensions();
    this._updateResizeHandlersSize();

    if (this.responsive) {
      this._toggleCompactView();
    }

    this._resizeTableBody();
  };

  private _headerResizeObserverCallback = () => {
    this._updateResizeHandlersSize();
  };

  private _bodyResizeObserverCallback = () => {
    this._resizeTableBody();
  };

  private _calculateInitialColumnWidths(): number[] {
    const numCols = this._getHeaderCells().length;
    let cols: (string | number)[] = this.columns.slice(0, numCols);
    const numAutoCols =
      cols.filter((c) => c === 'auto').length + numCols - cols.length;
    let availablePercent = 100;

    cols = cols.map((col) => {
      const percentage = parseSizeAttributeToPercent(col, this._componentW);

      if (percentage === null) {
        return 'auto';
      }

      availablePercent -= percentage;

      return percentage;
    });

    if (cols.length < numCols) {
      for (let i = cols.length; i < numCols; i++) {
        cols.push('auto');
      }
    }

    cols = cols.map((col) => {
      if (col === 'auto') {
        return availablePercent / numAutoCols;
      }

      return col as number;
    });

    return cols as number[];
  }

  private _initHeaderCellSizes(colWidths: number[]) {
    this._getHeaderCells().forEach((cell, index) => {
      cell.style.width = `${colWidths[index]}%`;
    });
  }

  private _initBodyColumnSizes(colWidths: number[]) {
    this._getCellsOfFirstRow().forEach((cell, index) => {
      cell.style.width = `${colWidths[index]}%`;
    });
  }

  private _initSashes(colWidths: number[]) {
    const l = colWidths.length;
    let prevHandlerPos = 0;
    this._sashPositions = [];

    colWidths.forEach((collW, index) => {
      if (index < l - 1) {
        const pos = prevHandlerPos + collW;

        this._sashPositions.push(pos);
        prevHandlerPos = pos;
      }
    });
  }

  private _initDefaultColumnSizes() {
    const colWidths = this._calculateInitialColumnWidths();
    this._columnResizeController.setColumWidths(
      colWidths.map((c) => percent(c))
    );

    this._initHeaderCellSizes(colWidths);
    this._initBodyColumnSizes(colWidths);
    this._initSashes(colWidths);
  }

  private _updateResizeHandlersSize() {
    const headerCr = this._headerElement.getBoundingClientRect();

    if (
      headerCr.height === this._prevHeaderHeight &&
      this._componentH === this._prevComponentHeight
    ) {
      return;
    }

    this._prevHeaderHeight = headerCr.height;
    this._prevComponentHeight = this._componentH;

    const bodyHeight = this._componentH - headerCr.height;

    this._sashVisibleElements.forEach((el) => {
      el.style.height = `${bodyHeight}px`;
      el.style.top = `${headerCr.height}px`;
    });
  }

  private _applyCompactViewColumnLabels() {
    const headerCells = this._getHeaderCells();
    const labels = headerCells.map((c) => c.innerText);
    const rows = this.querySelectorAll('vscode-table-row');

    rows.forEach((r) => {
      const cells = r.querySelectorAll('vscode-table-cell');

      cells.forEach((c, i) => {
        c.columnLabel = labels[i];
        c.compact = true;
      });
    });
  }

  private _clearCompactViewColumnLabels() {
    this.querySelectorAll('vscode-table-cell').forEach((c) => {
      c.columnLabel = '';
      c.compact = false;
    });
  }

  private _toggleCompactView() {
    const cr = this.getBoundingClientRect();
    const nextCompactView = cr.width < this.breakpoint;

    if (this.compact !== nextCompactView) {
      this.compact = nextCompactView;

      if (nextCompactView) {
        this._applyCompactViewColumnLabels();
      } else {
        this._clearCompactViewColumnLabels();
      }
    }
  }

  private _stopDrag(event: PointerEvent) {
    const activeSplitter = this._columnResizeController.getActiveSplitter();

    if (activeSplitter) {
      activeSplitter.removeEventListener(
        'pointermove',
        this._handleSplitterPointerMove
      );
      activeSplitter.removeEventListener(
        'pointerup',
        this._handleSplitterPointerUp
      );
      activeSplitter.removeEventListener(
        'pointercancel',
        this._handleSplitterPointerCancel
      );
    }

    this._columnResizeController.stopDrag(event);
    this._resizeColumns(true);

    this._sashHovers[this._activeSashElementIndex] = false;
    this._isDragging = false;
    this._activeSashElementIndex = -1;
  }

  private _onDefaultSlotChange() {
    this._assignedElements.forEach((el) => {
      if (el.tagName.toLowerCase() === 'vscode-table-header') {
        el.slot = 'header';
        return;
      }

      if (el.tagName.toLowerCase() === 'vscode-table-body') {
        el.slot = 'body';
        return;
      }
    });
  }

  private _onHeaderSlotChange() {
    this._headerCells = this._queryHeaderCells();
    const minWidths: Percent[] = [];
    minWidths.fill(percent(0), 0, this._headerCells.length - 1);

    this._headerCells.forEach((c, i) => {
      c.index = i;

      if (c.minWidth) {
        const minWidth =
          parseSizeAttributeToPercent(c.minWidth, this._componentW) ??
          percent(0);
        this._columnResizeController.setColumnMinWidthAt(i, minWidth);
      }
    });
  }

  private _onBodySlotChange() {
    this._initDefaultColumnSizes();
    this._initResizeObserver();
    this._updateResizeHandlersSize();

    if (!this._bodyResizeObserver) {
      const tbody = this._assignedBodyElements[0] ?? null;

      if (tbody) {
        this._bodyResizeObserver = new ResizeObserver(
          this._bodyResizeObserverCallback
        );
        this._bodyResizeObserver.observe(tbody);
      }
    }
  }

  private _onSashMouseOver(event: MouseEvent) {
    if (this._isDragging) {
      return;
    }

    const target = event.currentTarget as HTMLDivElement;
    const index = Number(target.dataset.index);
    this._sashHovers[index] = true;
    this.requestUpdate();
  }

  private _onSashMouseOut(event: MouseEvent) {
    event.stopPropagation();

    if (this._isDragging) {
      return;
    }

    const target = event.currentTarget as HTMLDivElement;
    const index = Number(target.dataset.index);
    this._sashHovers[index] = false;
    this.requestUpdate();
  }

  private _resizeColumns(resizeBodyCells = true) {
    const widths = this._columnResizeController.columnWidths;

    const headerCells = this._getHeaderCells();
    headerCells.forEach((h, i) => (h.style.width = `${widths[i]}%`));

    if (resizeBodyCells) {
      const firstRowCells = this._getCellsOfFirstRow();
      firstRowCells.forEach((c, i) => (c.style.width = `${widths[i]}%`));
    }
  }

  private _handleSplitterPointerDown(event: PointerEvent) {
    event.stopPropagation();

    const activeSplitter = event.currentTarget as HTMLElement;

    this._columnResizeController
      .saveHostDimensions()
      .setActiveSplitter(activeSplitter)
      .startDrag(event);

    activeSplitter.addEventListener(
      'pointermove',
      this._handleSplitterPointerMove
    );
    activeSplitter.addEventListener('pointerup', this._handleSplitterPointerUp);
    activeSplitter.addEventListener(
      'pointercancel',
      this._handleSplitterPointerCancel
    );
  }

  private _handleSplitterPointerMove = (event: PointerEvent) => {
    if (!this._columnResizeController.shouldDrag(event)) {
      return;
    }

    this._columnResizeController.drag(event);
    if (!this.delayedResizing) {
      this._resizeColumns(true);
    } else {
      this._resizeColumns(false);
    }
  };

  private _handleSplitterPointerUp = (event: PointerEvent) => {
    this._stopDrag(event);
  };

  private _handleSplitterPointerCancel = (event: PointerEvent) => {
    this._stopDrag(event);
  };

  private _handleMinColumnWidthChange = (
    event: VscTableChangeMinColumnWidthEvent
  ) => {
    const {columnIndex, propertyValue} = event.detail;
    const value = parseSizeAttributeToPercent(propertyValue, this._componentW);

    if (value) {
      this._columnResizeController.setColumnMinWidthAt(columnIndex, value);
    }
  };

  override render(): TemplateResult {
    const splitterPositions = this._columnResizeController.splitterPositions;

    const sashes = splitterPositions.map((val, index) => {
      const classes = classMap({
        sash: true,
        hover: this._sashHovers[index],
        resizable: this.resizable,
      });

      const left = `${val}%`;

      return this.resizable
        ? html`
            <div
              class=${classes}
              data-index=${index}
              .style=${stylePropertyMap({left})}
              @pointerdown=${this._handleSplitterPointerDown}
              @mouseover=${this._onSashMouseOver}
              @mouseout=${this._onSashMouseOut}
            >
              <div class="sash-visible"></div>
              <div class="sash-clickable"></div>
            </div>
          `
        : html`<div
            class=${classes}
            data-index=${index}
            .style=${stylePropertyMap({left})}
          >
            <div class="sash-visible"></div>
          </div>`;
    });

    const wrapperClasses = classMap({
      wrapper: true,
      'select-disabled': this._columnResizeController.isDragging,
      'resize-cursor': this._columnResizeController.isDragging,
      'compact-view': this.compact,
    });

    return html`
      <div class=${wrapperClasses}>
        <div class="header">
          <slot name="caption"></slot>
          <div class="header-slot-wrapper">
            <slot name="header" @slotchange=${this._onHeaderSlotChange}></slot>
          </div>
        </div>
        <vscode-scrollable class="scrollable">
          <div>
            <slot name="body" @slotchange=${this._onBodySlotChange}></slot>
          </div>
        </vscode-scrollable>
        ${sashes}
        <slot @slotchange=${this._onDefaultSlotChange}></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'vscode-table': VscodeTable;
  }
}
