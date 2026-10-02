export interface Option {
  label?: string;
  value?: string;
  /** 标签缩写，用于多选框的选中项展示区域。 */
  abbreviation?: string;
  description?: string;
  selected?: boolean;
  disabled?: boolean;
}

export interface InternalOption extends Required<Option> {
  index: number;
  /** 选项在过滤列表中的索引。 */
  filteredIndex: number;
  /** 过滤列表中用于高亮匹配文字的字符区间。 */
  ranges?: [number, number][];
  visible: boolean;
}

export type FilterMethod =
  | 'startsWithPerTerm'
  | 'startsWith'
  | 'contains'
  | 'fuzzy';
