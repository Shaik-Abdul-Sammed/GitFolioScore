import { sanitizeForPDF } from './pdfSanitizer';

describe('pdfSanitizer utility', () => {
  test('returns empty string for null, undefined, or empty input', () => {
    expect(sanitizeForPDF(null)).toBe('');
    expect(sanitizeForPDF(undefined)).toBe('');
    expect(sanitizeForPDF('')).toBe('');
  });

  test('normalizes smart quotes and curly apostrophes to ASCII', () => {
    const input = '“Senior Engineer” at ‘Acme Corp’ — I’m ready';
    expect(sanitizeForPDF(input)).toBe('"Senior Engineer" at \'Acme Corp\' - I\'m ready');
  });

  test('converts em-dashes, en-dashes, and box-drawing lines', () => {
    const input = 'Feature A — Feature B – Feature C ──── Divider';
    expect(sanitizeForPDF(input)).toBe('Feature A - Feature B - Feature C -- Divider');
  });

  test('converts bullets and ellipses', () => {
    const input = '• High performance… · Modular architecture ▸ Scalable';
    expect(sanitizeForPDF(input)).toBe('- High performance... - Modular architecture - Scalable');
  });

  test('converts stars and symbols without leaving question marks', () => {
    const input = 'Repo ★ 50 stars ⭐ 12 forks 🚀 [active]';
    expect(sanitizeForPDF(input)).toBe('Repo * 50 stars * 12 forks [active]');
  });

  test('converts arrows and checkmarks', () => {
    const input = '✓ Verified → Production ready';
    expect(sanitizeForPDF(input)).toBe('[x] Verified -> Production ready');
  });
});
