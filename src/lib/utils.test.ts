import { cn } from './utils';

describe('utils cn helper', () => {
  test('joins classes with spaces', () => {
    expect(cn('class-a', 'class-b')).toBe('class-a class-b');
  });

  test('ignores falsy values', () => {
    expect(cn('class-a', false && 'class-b', undefined, null, '', 'class-c')).toBe('class-a class-c');
  });

  test('returns empty string when all falsy', () => {
    expect(cn(false, null, undefined)).toBe('');
  });
});
