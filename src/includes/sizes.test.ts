/* eslint-disable @typescript-eslint/no-unused-expressions */
import {expect} from './testing.js';
import {parseSizeAttributeToPercent} from './sizes.js';

describe('parseSizeAttributeToPercent', () => {
  const base = 200;

  // 数字输入
  it('should parse valid number input', () => {
    expect(parseSizeAttributeToPercent(50, base)).to.equal(25);
    expect(parseSizeAttributeToPercent(0, base)).to.equal(0);
    expect(parseSizeAttributeToPercent(200, base)).to.equal(100);
    expect(parseSizeAttributeToPercent(-50, base)).to.equal(-25);
  });

  it('should return null for invalid number input', () => {
    expect(parseSizeAttributeToPercent(NaN, base)).to.be.null;
    expect(parseSizeAttributeToPercent(Infinity, base)).to.be.null;
    expect(parseSizeAttributeToPercent(-Infinity, base)).to.be.null;
  });

  // 数字字符串输入
  it('should parse valid string number', () => {
    expect(parseSizeAttributeToPercent('50', base)).to.equal(25);
    expect(parseSizeAttributeToPercent('0', base)).to.equal(0);
    expect(parseSizeAttributeToPercent('100.5', base)).to.be.closeTo(
      50.25,
      0.0001
    );
    expect(parseSizeAttributeToPercent('-50', base)).to.equal(-25);
    expect(parseSizeAttributeToPercent('   50  ', base)).to.equal(25);
  });

  it('should return null for invalid string number', () => {
    expect(parseSizeAttributeToPercent('abc', base)).to.be.null;
    expect(parseSizeAttributeToPercent('50abc', base)).to.be.null;
    expect(parseSizeAttributeToPercent('', base)).to.be.null;
    expect(parseSizeAttributeToPercent('   ', base)).to.be.null;
    expect(parseSizeAttributeToPercent('NaN', base)).to.be.null;
  });

  // 像素输入
  it('should parse valid px input', () => {
    expect(parseSizeAttributeToPercent('50px', base)).to.equal(25);
    expect(parseSizeAttributeToPercent('0px', base)).to.equal(0);
    expect(parseSizeAttributeToPercent('100.5px', base)).to.be.closeTo(
      50.25,
      0.0001
    );
    expect(parseSizeAttributeToPercent('-50px', base)).to.equal(-25);
    expect(parseSizeAttributeToPercent('   50px  ', base)).to.equal(25);
  });

  it('should return null for invalid px input', () => {
    expect(parseSizeAttributeToPercent('50p', base)).to.be.null;
    expect(parseSizeAttributeToPercent('px', base)).to.be.null;
    expect(parseSizeAttributeToPercent('50px%', base)).to.be.null;
  });

  // 百分比输入
  it('should parse valid percent input', () => {
    expect(parseSizeAttributeToPercent('25%', base)).to.equal(25);
    expect(parseSizeAttributeToPercent('0%', base)).to.equal(0);
    expect(parseSizeAttributeToPercent('100%', base)).to.equal(100);
    expect(parseSizeAttributeToPercent('50.5%', base)).to.be.closeTo(
      50.5,
      0.0001
    );
    expect(parseSizeAttributeToPercent('-20%', base)).to.equal(-20);
    expect(parseSizeAttributeToPercent('   30%  ', base)).to.equal(30);
  });

  it('should return null for invalid percent input', () => {
    expect(parseSizeAttributeToPercent('%', base)).to.be.null;
    expect(parseSizeAttributeToPercent('20%%', base)).to.be.null;
    expect(parseSizeAttributeToPercent('abc%', base)).to.be.null;
    expect(parseSizeAttributeToPercent('50%px', base)).to.be.null;
  });

  // 无效基准值
  it('should return null for invalid base', () => {
    expect(parseSizeAttributeToPercent('50', 0)).to.be.null;
    expect(parseSizeAttributeToPercent('50', NaN)).to.be.null;
    expect(parseSizeAttributeToPercent('50', Infinity)).to.be.null;
    expect(parseSizeAttributeToPercent(50, 0)).to.be.null;
  });
});
