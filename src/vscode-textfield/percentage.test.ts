/* eslint-disable @typescript-eslint/no-unused-expressions */
import {expect} from '@open-wc/testing';
import {
  formatPercentDisplay,
  fractionToPercent,
  normalizePercentInput,
  percentToFraction,
  sanitizePercentInput,
  validatePercentValue,
} from './percentage.js';

describe('percentage helpers', () => {
  describe('percentToFraction', () => {
    for (const [percent, fraction] of [
      ['0', '0'],
      ['1', '0.01'],
      ['12', '0.12'],
      ['100', '1'],
      ['125', '1.25'],
      ['1.1', '0.011'],
      ['12.5', '0.125'],
      ['0.5', '0.005'],
      ['3.456', '0.03456'],
      ['007', '0.07'],
      ['-5', '-0.05'],
      ['-0.25', '-0.0025'],
      ['1e-2', '0.0001'],
    ]) {
      it(`${percent} -> ${fraction}`, () => {
        expect(percentToFraction(percent)).to.eq(fraction);
      });
    }

    for (const empty of ['', '  ', 'abc', '-', '1x2']) {
      it(`"${empty}" -> ""`, () => {
        expect(percentToFraction(empty)).to.eq('');
      });
    }
  });

  describe('fractionToPercent', () => {
    for (const [fraction, percent] of [
      ['0', '0'],
      ['0.01', '1'],
      ['0.125', '12.5'],
      ['1', '100'],
      ['1.5', '150'],
      ['0.005', '0.5'],
      ['0.03456', '3.456'],
      ['-0.05', '-5'],
      ['0.001', '0.1'],
    ]) {
      it(`${fraction} -> ${percent}`, () => {
        expect(fractionToPercent(fraction)).to.eq(percent);
      });
    }

    for (const empty of ['', 'abc', '0x10', '--1']) {
      it(`"${empty}" -> ""`, () => {
        expect(fractionToPercent(empty)).to.eq('');
      });
    }
  });

  it('percentToFraction and fractionToPercent are inverse operations', () => {
    for (const percent of ['1', '12.5', '0.05', '130', '-7.5']) {
      expect(fractionToPercent(percentToFraction(percent))).to.eq(percent);
    }
  });

  describe('sanitizePercentInput', () => {
    for (const [raw, expected] of [
      ['', ''],
      ['1', '1'],
      ['1%', '1'],
      ['12.5%', '12.5'],
      ['-8%', '-8'],
      ['1a2', '12'],
      ['1.2.3', '1.23'],
      ['1,5', '1.5'],
      ['-', '-'],
      ['-1-2', '-12'],
      ['5-', '5'],
      ['.', '0.'],
      ['.5', '0.5'],
      ['-.5', '-0.5'],
      ['%', ''],
      ['1.', '1.'],
      [' 4 %', '4'],
    ]) {
      it(`"${raw}" -> "${expected}"`, () => {
        expect(sanitizePercentInput(raw)).to.eq(expected);
      });
    }
  });

  describe('normalizePercentInput', () => {
    for (const [raw, expected] of [
      ['05%', '5'],
      ['0.50%', '0.5'],
      ['1.', '1'],
      ['-', ''],
      ['', ''],
      ['0', '0'],
      ['-0', '0'],
      ['00.10', '0.1'],
      ['1%', '1'],
    ]) {
      it(`"${raw}" -> "${expected}"`, () => {
        expect(normalizePercentInput(raw)).to.eq(expected);
      });
    }
  });

  describe('formatPercentDisplay', () => {
    for (const [percent, expected] of [
      ['', ''],
      ['1', '1%'],
      ['1.', '1.%'],
      ['0.5', '0.5%'],
      ['-3', '-3%'],
      ['-', '-'],
    ]) {
      it(`"${percent}" -> "${expected}"`, () => {
        expect(formatPercentDisplay(percent)).to.eq(expected);
      });
    }
  });

  describe('validatePercentValue', () => {
    const noConstraints = {min: undefined, max: undefined, step: undefined};

    it('accepts an empty value', () => {
      expect(validatePercentValue('', {min: 0, max: 1, step: 0.05})).to.be.null;
    });

    it('accepts a value without constraints', () => {
      expect(validatePercentValue('0.5', noConstraints)).to.be.null;
    });

    it('reports a value below the minimum', () => {
      const violation = validatePercentValue('0.01', {
        ...noConstraints,
        min: 0.1,
      });

      expect(violation?.flag).to.eq('rangeUnderflow');
      expect(violation?.message).to.eq(
        'Value must be greater than or equal to 0.1.'
      );
    });

    it('reports a value above the maximum', () => {
      const violation = validatePercentValue('1.5', {
        ...noConstraints,
        max: 1,
      });

      expect(violation?.flag).to.eq('rangeOverflow');
      expect(violation?.message).to.eq(
        'Value must be less than or equal to 1.'
      );
    });

    it('accepts a value on the boundary', () => {
      expect(validatePercentValue('1', {...noConstraints, min: 0, max: 1})).to
        .be.null;
    });

    it('reports a value which does not match the step', () => {
      const violation = validatePercentValue('0.12', {
        ...noConstraints,
        step: 0.05,
      });

      expect(violation?.flag).to.eq('stepMismatch');
      expect(violation?.message).to.eq(
        'Please enter a valid value. The two nearest valid values are 0.1 and 0.15.'
      );
    });

    it('accepts a value which matches the step', () => {
      expect(validatePercentValue('0.15', {...noConstraints, step: 0.05})).to.be
        .null;
    });

    it('tolerates floating point errors of the step', () => {
      expect(validatePercentValue('0.3', {...noConstraints, step: 0.1})).to.be
        .null;
    });

    it('uses the minimum as the base of the step', () => {
      const violation = validatePercentValue('0.13', {
        min: 0.05,
        max: undefined,
        step: 0.1,
      });

      expect(violation?.message).to.eq(
        'Please enter a valid value. The two nearest valid values are 0.05 and 0.15.'
      );
    });

    it('ignores an invalid step', () => {
      expect(validatePercentValue('0.13', {...noConstraints, step: Number.NaN}))
        .to.be.null;
    });
  });
});
