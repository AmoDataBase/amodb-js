import { describe, expect, it } from 'vitest';
import { imageUrl } from '../src/index';

describe('imageUrl (standalone)', () => {
  it('defaults to w500', () => {
    expect(imageUrl('/poster.jpg')).toBe('https://img.amodb.dev/t/p/w500/poster.jpg');
  });

  it('accepts every standard size', () => {
    for (const size of ['w92', 'w154', 'w185', 'w300', 'w342', 'w500', 'w780', 'w1280', 'h632', 'original']) {
      expect(imageUrl('/p.jpg', size)).toBe(`https://img.amodb.dev/t/p/${size}/p.jpg`);
    }
  });

  it('adds a missing leading slash', () => {
    expect(imageUrl('poster.jpg', 'w185')).toBe('https://img.amodb.dev/t/p/w185/poster.jpg');
  });

  it('returns null for empty input', () => {
    expect(imageUrl(null)).toBeNull();
    expect(imageUrl(undefined)).toBeNull();
    expect(imageUrl('')).toBeNull();
  });

  it('takes a custom base URL with or without a trailing slash', () => {
    expect(imageUrl('/a.jpg', 'w92', 'https://cdn.example.test/t/p')).toBe('https://cdn.example.test/t/p/w92/a.jpg');
    expect(imageUrl('/a.jpg', 'w92', 'https://cdn.example.test/t/p/')).toBe('https://cdn.example.test/t/p/w92/a.jpg');
  });
});
