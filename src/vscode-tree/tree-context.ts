import {createContext} from '@lit/context';
import type {VscodeTreeItem} from '../vscode-tree-item';
import type {ExpandMode, IndentGuideDisplay, VscodeTree} from './vscode-tree';

export interface TreeContext {
  isShiftPressed: boolean;
  selectedItems: Set<VscodeTreeItem>;
  allItems: NodeListOf<VscodeTreeItem> | null;
  itemListUpToDate: boolean;
  focusedItem: VscodeTreeItem | null;
  prevFocusedItem: VscodeTreeItem | null;
  /** 显示箭头且 `List` 组件不含分支项时，
   * 应移除叶子元素内容前的额外内边距
   */
  hasBranchItem: boolean;
  rootElement: VscodeTree | null;
  activeItem: VscodeTreeItem | null;
  highlightedItems?: Set<VscodeTreeItem>;
  highlightIndentGuides?: () => void;
  emitSelectEvent?: () => void;
  hoveredItem?: VscodeTreeItem | null;
}

export const treeContext = createContext<TreeContext>('vscode-list');

export interface ConfigContext {
  readonly hideArrows: boolean;
  readonly expandMode: ExpandMode;
  readonly indent: number;
  readonly indentGuides: IndentGuideDisplay;
  readonly multiSelect: boolean;
}

export const configContext = createContext<ConfigContext>(
  Symbol('configContext')
);
