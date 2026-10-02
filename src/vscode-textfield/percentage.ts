/**
 * `vscode-textfield` 百分比模式的工具函数。
 *
 * 组件可编辑文字为百分数（`1`、`12.5`、`-3`），
 * 显示时附带百分号（`1%`）。组件向外部提供的值，
 * 即 `value` 属性与表单提交值，
 * 使用对应的小数形式（`0.01`、`0.125`、`-0.03`）。
 *
 * 转换使用十进制字符串运算，而非浮点除法，
 * 因此不会引入舍入误差：
 * `percentToFraction('1.1')` 精确返回 `'0.011'`。
 */

type DecimalParts = {
  /** `'-'` 或空字符串。 */
  sign: string;
  /** 不含小数分隔符的数字。 */
  digits: string;
  /**
   * 小数分隔符在 `digits` 中从左侧计数的位置。
   * 位置可以超出字符串范围，表示数值带有
   * 前导零或尾随零。
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
    // 通过分隔符位置处理前导 `+` 和缺少整数部分的情况，
    // 指数会进一步移动该位置。
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
 * 将百分数转换为小数形式：`'1'` 转为 `'0.01'`，`'12.5'`
 * 转为 `'0.125'`。空字符串或非数字内容
 * 返回空字符串。
 */
export const percentToFraction = (percent: string): string =>
  shiftDecimal(percent, -2);

/**
 * 将小数转换为百分数：`'0.01'` 转为 `'1'`，`'0.125'`
 * 转为 `'12.5'`。空字符串或非数字内容返回
 * 返回空字符串。
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
 * 输入过程中保留百分数允许的字符：前导负号、
 * 数字和一个小数分隔符。结果可以不完整，
 * 允许 `'-'`、`'1.'` 和 `'0.'`。
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
 * 编辑结束时应用的最终文字形式：
 * `'05'` 变为 `'5'`，`'1.'` 和 `'-'` 分别变为 `'1'` 和 `''`。
 */
export const normalizePercentInput = (raw: string): string => {
  const parsed = parseDecimal(sanitizePercentInput(raw));

  return parsed ? formatDecimal(parsed) : '';
};

/**
 * 为百分数添加百分号，以便在输入框中显示。
 * 不含数字的部分输入值，例如空字符串或单个负号，
 * 不添加百分号。
 */
export const formatPercentDisplay = (percent: string): string =>
  /\d/.test(percent) ? `${percent}%` : percent;

/**
 * 小数值违反的约束。
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
  // `step="any"` 经数字特性转换器转换后为 NaN。
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
 * 依据组件的 `min`、`max` 和 `step` 约束检查小数值。
 * 约束与小数值使用相同单位，
 * 因此 `min="0"` 和 `max="1"` 接受 0% 至 100%，`step="0.05"`
 * 表示 5% 的步长。
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
