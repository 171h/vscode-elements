/**
 * Helpers for the percentage mode of `vscode-textfield`.
 *
 * The editable text of the component is a percent number (`1`, `12.5`, `-3`)
 * and it is displayed with a percent sign (`1%`). The value which the component
 * reports to the outside world - the `value` property and the value submitted
 * with the form - is the fraction form of that number (`0.01`, `0.125`, `-0.03`).
 *
 * The conversions are calculated with decimal string arithmetic instead of
 * floating point division, so they do not introduce rounding errors:
 * `percentToFraction('1.1')` is exactly `'0.011'`.
 */

type DecimalParts = {
  /** `'-'` or an empty string. */
  sign: string;
  /** The digits without the decimal separator. */
  digits: string;
  /**
   * The position of the decimal separator inside `digits`, counted from the
   * left. It can be outside of the string, which means the value has leading or
   * trailing zeros.
   */
  pointPos: number;
};

const DECIMAL_PATTERN = /^([+-]?)(\d*)(?:\.(\d*))?(?:[eE]([+-]?\d+))?$/;

const parseDecimal = (value: string): DecimalParts | null => {
  const match = DECIMAL_PATTERN.exec(value.trim());

  if (!match) {
    return null;
  }

  const [, sign, intPart = '', fracPart = '', exponent] = match;

  if (intPart === '' && fracPart === '') {
    return null;
  }

  return {
    sign: sign === '-' ? '-' : '',
    digits: `${intPart}${fracPart}`,
    // A leading `+` sign and a missing integer part are handled by the position
    // of the separator, the exponent shifts it further.
    pointPos: intPart.length + (exponent ? Number(exponent) : 0),
  };
};

const formatDecimal = ({sign, digits, pointPos}: DecimalParts): string => {
  let intPart: string;
  let fracPart: string;

  if (pointPos <= 0) {
    intPart = '0';
    fracPart = `${'0'.repeat(-pointPos)}${digits}`;
  } else if (pointPos >= digits.length) {
    intPart = `${digits}${'0'.repeat(pointPos - digits.length)}`;
    fracPart = '';
  } else {
    intPart = digits.slice(0, pointPos);
    fracPart = digits.slice(pointPos);
  }

  intPart = intPart.replace(/^0+(?=\d)/, '');
  fracPart = fracPart.replace(/0+$/, '');

  if (intPart === '0' && fracPart === '') {
    return '0';
  }

  return `${sign}${intPart}${fracPart === '' ? '' : `.${fracPart}`}`;
};

const shiftDecimal = (value: string, places: number): string => {
  const parsed = parseDecimal(value);

  return parsed
    ? formatDecimal({...parsed, pointPos: parsed.pointPos + places})
    : '';
};

/**
 * Converts a percent number to its fraction form: `'1'` to `'0.01'`, `'12.5'`
 * to `'0.125'`. An empty string or anything which is not a number results in an
 * empty string.
 */
export const percentToFraction = (percent: string): string =>
  shiftDecimal(percent, -2);

/**
 * Converts a fraction to its percent number form: `'0.01'` to `'1'`, `'0.125'`
 * to `'12.5'`. An empty string or anything which is not a number results in an
 * empty string.
 */
export const fractionToPercent = (fraction: string): string =>
  shiftDecimal(fraction, 2);

const addLeadingZero = (digits: string): string => {
  if (digits.startsWith('.')) {
    return `0${digits}`;
  }

  return digits;
};

/**
 * Keeps the characters of a percent number while the user is typing: a leading
 * minus sign, the digits, and a single decimal separator. The result can be
 * incomplete, `'-'`, `'1.'` and `'0.'` are accepted results.
 */
export const sanitizePercentInput = (raw: string): string => {
  let digits = '';
  let hasSeparator = false;
  let isNegative = false;

  for (const char of raw) {
    if (char >= '0' && char <= '9') {
      digits += char;
    } else if ((char === '.' || char === ',') && !hasSeparator) {
      digits += '.';
      hasSeparator = true;
    } else if (char === '-' && digits === '') {
      isNegative = true;
    }
  }

  return `${isNegative ? '-' : ''}${addLeadingZero(digits)}`;
};

/**
 * The final form of the editable text, applied when the editing is finished:
 * `'05'` becomes `'5'`, `'1.'` and `'-'` become `'1'` and `''`.
 */
export const normalizePercentInput = (raw: string): string => {
  const parsed = parseDecimal(sanitizePercentInput(raw));

  return parsed ? formatDecimal(parsed) : '';
};

/**
 * Adds the percent sign to a percent number for displaying it in the input.
 * Partial values without a digit, like an empty string or a single minus sign,
 * are not decorated.
 */
export const formatPercentDisplay = (percent: string): string =>
  /\d/.test(percent) ? `${percent}%` : percent;

/**
 * A constraint which the fraction value violates.
 */
export type PercentConstraintViolation = {
  flag: 'rangeUnderflow' | 'rangeOverflow' | 'stepMismatch';
  message: string;
};

const formatNumber = (value: number): string =>
  `${Number(value.toPrecision(12))}`;

const findStepMismatch = (
  value: number,
  step: number,
  base: number
): {lower: number; upper: number} | null => {
  // `step="any"` is converted to NaN by the numeric attribute converter.
  if (!Number.isFinite(step) || step <= 0) {
    return null;
  }

  const lowerRatio = Math.floor((value - base) / step);
  const lower = base + lowerRatio * step;
  const upper = lower + step;
  const tolerance = Math.abs(step) * 1e-9;

  if (
    Math.abs(value - lower) <= tolerance ||
    Math.abs(value - upper) <= tolerance
  ) {
    return null;
  }

  return {lower, upper};
};

/**
 * Checks a fraction value against the `min`, `max`, and `step` constraints of
 * the component. The constraints are interpreted in the same unit as the
 * fraction value, so `min="0"` and `max="1"` accept 0% - 100% and `step="0.05"`
 * means steps of 5%.
 */
export const validatePercentValue = (
  fraction: string,
  {
    min,
    max,
    step,
  }: {
    min: number | undefined;
    max: number | undefined;
    step: number | undefined;
  }
): PercentConstraintViolation | null => {
  if (fraction === '') {
    return null;
  }

  const value = Number(fraction);

  if (!Number.isFinite(value)) {
    return null;
  }

  if (min !== undefined && !Number.isNaN(min) && value < min) {
    return {
      flag: 'rangeUnderflow',
      message: `Value must be greater than or equal to ${formatNumber(min)}.`,
    };
  }

  if (max !== undefined && !Number.isNaN(max) && value > max) {
    return {
      flag: 'rangeOverflow',
      message: `Value must be less than or equal to ${formatNumber(max)}.`,
    };
  }

  if (step !== undefined && !Number.isNaN(step)) {
    const nearest = findStepMismatch(
      value,
      step,
      min !== undefined && !Number.isNaN(min) ? min : 0
    );

    if (nearest) {
      return {
        flag: 'stepMismatch',
        message:
          'Please enter a valid value. The two nearest valid values are ' +
          `${formatNumber(nearest.lower)} and ${formatNumber(nearest.upper)}.`,
      };
    }
  }

  return null;
};
