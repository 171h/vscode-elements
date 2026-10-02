/**
 * 表单已修改状态的高亮持续时间。数字按毫秒解析，
 * 字符串按 CSS 时间解析，例如 `2500` 或 `'2.5s'`。
 */
export type MarkDuration = number | string;

/** 保持已修改状态直至显式重置的持续时间。 */
export const FOREVER = 'forever';

/** 字符串中的纯数字，例如 `mark-duration="2500"` 特性。 */
const MILLISECOND_PATTERN = /^-?\d+(\.\d+)?$/;

const CSS_TIME_PATTERN = /^-?\d+(\.\d+)?(ms|s)$/;

/**
 * 将持续时间转换为毫秒。
 *
 * 负数持续时间按零处理，使 HTML 特性与属性行为一致，
 * 并立即移除高亮。负数不会被视为无法解析的持续时间，
 * 避免高亮无故一直停留在界面上，
 * 且无法判断原因。
 *
 * @returns 毫秒数；表示永久高亮或无法解析时
 * 返回 `null`。
 */
export const toMilliseconds = (value: MarkDuration): number | null => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? Math.max(0, value) : null;
  }

  if (value === FOREVER) {
    return null;
  }

  const trimmed = value.trim();

  // 不带单位的特性值按毫秒解析。
  if (MILLISECOND_PATTERN.test(trimmed)) {
    return Math.max(0, Number.parseFloat(trimmed));
  }

  if (!CSS_TIME_PATTERN.test(trimmed)) {
    return null;
  }

  const amount = Number.parseFloat(trimmed);

  return Math.max(0, trimmed.endsWith('ms') ? amount : amount * 1000);
};

/**
 * 将持续时间转换为 CSS 时间值。
 *
 * @returns CSS 时间值；无法解析为 CSS 时间时
 * 返回 `null`。
 */
export const toCssTime = (value: MarkDuration): string | null => {
  const milliseconds = toMilliseconds(value);

  return milliseconds === null ? null : `${milliseconds}ms`;
};
