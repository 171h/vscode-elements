import {css} from 'lit';
import selectStyles from '../includes/vscode-select/styles.js';

export default [
  selectStyles,
  css`
    .face-values {
      align-items: center;
      display: flex;
      gap: 2px;
      /* 未选中任何标签时保持展示区域高度 */
      min-height: 24px;
      min-width: 0;
      overflow: hidden;
    }

    /* 标签与展示区域内容共用一行 */
    .select-face.multiselect {
      align-items: center;
      display: flex;
    }

    :host([size='small']) .face-values {
      gap: 1px;
      min-height: 12px;
    }

    .select-face .face-values {
      flex: 1 1 auto;
      /* 防止标签遮挡下拉图标 */
      margin-right: 20px;
    }

    .combobox-face .face-values {
      flex: 0 1 auto;
    }

    /* 行内标签通过容器 gap 设置间距，
       因此须移除徽章随尺寸变化的外边距。 */
    :host .face-values .select-face-badge.option-tag {
      margin: 0;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .face-values .option-tag.collapsed {
      display: none;
    }

    /* 最后一个标签占据剩余空间，
       展示区域过窄时可截断该标签。 */
    .face-values .option-tag-last {
      flex-shrink: 1;
      min-width: 24px;
    }

    /* 即使所有标签均可见，也测量 "+N" 徽章。 */
    .face-values .option-tag.measuring {
      left: 0;
      position: absolute;
      top: 0;
      visibility: hidden;
    }

    /* 在选中标签旁为过滤文字预留空间 */
    .combobox-face.multiselect .combobox-input {
      flex: 1 1 80px;
      min-width: 80px;
    }
  `,
];
