import {css} from 'lit';
import selectStyles from '../includes/vscode-select/styles.js';

export default [
  selectStyles,
  css`
    .face-values {
      align-items: center;
      display: flex;
      gap: 2px;
      /* keeps the height of the face when no label is selected */
      min-height: 24px;
      min-width: 0;
      overflow: hidden;
    }

    /* the labels share a single row with the content of the face */
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
      /* keep the labels clear of the dropdown icon */
      margin-right: 20px;
    }

    .combobox-face .face-values {
      flex: 0 1 auto;
    }

    /* The labels of the row are spaced by the gap of the container, so the
       size dependent margin of the badge has to be removed. */
    :host .face-values .select-face-badge.option-tag {
      margin: 0;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .face-values .option-tag.collapsed {
      display: none;
    }

    /* The last label takes the remaining space, so it can be truncated when
       the face is too narrow for a full label. */
    .face-values .option-tag-last {
      flex-shrink: 1;
      min-width: 24px;
    }

    /* The "+N" badge is measured even when every label is visible. */
    .face-values .option-tag.measuring {
      left: 0;
      position: absolute;
      top: 0;
      visibility: hidden;
    }

    /* leave room for the filter pattern next to the selected labels */
    .combobox-face.multiselect .combobox-input {
      flex: 1 1 80px;
      min-width: 80px;
    }
  `,
];
