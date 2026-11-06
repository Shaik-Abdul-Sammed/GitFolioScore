/**
 * PDF Sanitizer Utility
 * Transliterates multi-byte Unicode typography, punctuation, smart quotes,
 * em-dashes, and bullets into clean ASCII characters compatible with
 * standard jsPDF built-in fonts (Helvetica, Times, Courier).
 */

export function sanitizeForPDF(str) {
  if (!str) return '';
  return String(str)
    // Smart quotes to ASCII quotes
    .replace(/[“”״″„]/g, '"')
    .replace(/[‘’`′‚]/g, "'")
    // Dashes to standard hyphen
    .replace(/──+/g, '--')
    .replace(/[—–―‒]/g, '-')
    // Ellipsis to three dots
    .replace(/…/g, '...')
    // Bullets to hyphens
    .replace(/[•·▸▪▫◦●►]/g, '-')
    // Stars and ratings
    .replace(/[★☆⭐]/g, '*')
    // Checkmarks and crosses
    .replace(/[✓✔]/g, '[x]')
    .replace(/[✕✖✗]/g, '[x]')
    // Arrows
    .replace(/[→⇒]/g, '->')
    .replace(/[←⇐]/g, '<-')
    // Strip emojis and any remaining non-printable / non-Latin1 glyphs to single space
    .replace(/[^\x20-\x7E\t\n\r\xA0-\xFF]/g, ' ')
    // Collapse multi-spaces created by stripped emojis
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

export default sanitizeForPDF;
