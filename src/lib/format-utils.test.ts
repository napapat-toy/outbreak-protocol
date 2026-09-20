import {
  formatCurrency,
  formatNumber,
  formatPercent,
  getProvinceStatus,
} from './format-utils';
import { ProvinceState } from './types';

describe('format-utils', () => {
  describe('formatNumber', () => {
    test('formats whole numbers with commas', () => {
      expect(formatNumber(1000)).toBe('1,000');
      expect(formatNumber(5527987)).toBe('5,527,987');
      expect(formatNumber(0)).toBe('0');
    });

    test('rounds decimals to nearest integer', () => {
      expect(formatNumber(123.4)).toBe('123');
      expect(formatNumber(123.8)).toBe('124');
    });
  });

  describe('formatPercent', () => {
    test('formats percentage numbers directly', () => {
      expect(formatPercent(45.67)).toBe('45.7%');
      expect(formatPercent(100, 0)).toBe('100%');
    });

    test('formats fractional ratios when isFraction = true', () => {
      expect(formatPercent(0.1234, 1, true)).toBe('12.3%');
      expect(formatPercent(0.005, 2, true)).toBe('0.50%');
    });
  });

  describe('formatCurrency', () => {
    test('formats currency with G unit', () => {
      expect(formatCurrency(150)).toBe('150G');
      expect(formatCurrency(1234.8)).toBe('1,234G');
      expect(formatCurrency(0)).toBe('0G');
    });
  });

  describe('getProvinceStatus', () => {
    const baseState: ProvinceState = {
      infected: 0,
      recovered: 0,
      dead: 0,
      vaccinated: 0,
      unrest: 0,
      rioting: false,
      collapsed: false,
      measures: {},
    };

    const pop = 100000;

    test('identifies collapsed status', () => {
      const state: ProvinceState = { ...baseState, collapsed: true };
      const status = getProvinceStatus(state, pop);
      expect(status.level).toBe('collapsed');
      expect(status.icon).toBe('💀');
      expect(status.label).toBe('เขตมรณะ');
    });

    test('identifies rioting status', () => {
      const state: ProvinceState = { ...baseState, rioting: true, unrest: 75 };
      const status = getProvinceStatus(state, pop);
      expect(status.level).toBe('rioting');
      expect(status.icon).toBe('🔥');
      expect(status.label).toBe('จลาจล');
    });

    test('identifies critical status when infected >= 30%', () => {
      const state: ProvinceState = { ...baseState, infected: 35000 };
      const status = getProvinceStatus(state, pop);
      expect(status.level).toBe('critical');
      expect(status.icon).toBe('🔴');
    });

    test('identifies warning status when infected >= 5% or unrest >= 40', () => {
      const state: ProvinceState = { ...baseState, infected: 6000 };
      const status = getProvinceStatus(state, pop);
      expect(status.level).toBe('warning');
      expect(status.icon).toBe('🟡');
    });

    test('identifies safe status when infection is minimal', () => {
      const state: ProvinceState = { ...baseState, infected: 10 }; // 0.01%
      const status = getProvinceStatus(state, pop);
      expect(status.level).toBe('safe');
      expect(status.icon).toBe('🟢');
    });
  });
});
