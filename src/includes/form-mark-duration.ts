/**
 * How long the modified state of a form is highlighted. A number is
 * interpreted as milliseconds, a string as CSS time, e.g. `2500` or `'2.5s'`.
 */
export type MarkDuration = number | string;

/** A duration that keeps the modified state until it is reset explicitly. */
export const FOREVER = 'forever';

/** A plain number in a string, e.g. the `mark-duration="2500"` attribute. */
const MILLISECOND_PATTERN = /^-?\d+(\.\d+)?$/;

const CSS_TIME_PATTERN = /^-?\d+(\.\d+)?(ms|s)$/;

/**
 * Converts a duration to milliseconds.
 *
 * A negative duration is interpreted as zero, so the attribute and the property
 * behave the same way and the highlight is removed immediately. It is never
 * treated as a duration which cannot be interpreted, that would keep the
 * highlight on the screen without a way to tell why.
 *
 * @returns The duration in milliseconds, or `null` when the value means that
 * the highlight never expires or when it cannot be interpreted.
 */
export const toMilliseconds = (value: MarkDuration): number | null => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? Math.max(0, value) : null;
  }

  if (value === FOREVER) {
    return null;
  }

  const trimmed = value.trim();

  // An attribute value without a unit is a millisecond value.
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
 * Converts a duration to a CSS time value.
 *
 * @returns The CSS time value, or `null` when the duration cannot be
 * interpreted as a CSS time.
 */
export const toCssTime = (value: MarkDuration): string | null => {
  const milliseconds = toMilliseconds(value);

  return milliseconds === null ? null : `${milliseconds}ms`;
};
