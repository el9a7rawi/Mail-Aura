/**
 * Extracts addresses from the first column of a CSV upload.
 *
 * Header detection must not delete data: a real address such as
 * `email@gmail.com` contains the word "email" but is not a header row.
 */

const HEADER_CELL = /^(?:e-?mail|بريد|الإيميل|البريد(?: الإلكتروني)?)$/iu;

function isHeader(line) {
  if (line.includes('@')) return false;
  return line.split(',').some((cell) => HEADER_CELL.test(cell.trim().replace(/^"|"$/gu, '')));
}

export function csvEmails(text) {
  if (typeof text !== 'string') return [];

  const lines = text.split(/\r?\n/u).filter((line) => line.trim());
  if (lines.length && isHeader(lines[0])) lines.shift();

  return lines
    .map((line) => line.split(',')[0].trim().replace(/^"|"$/gu, ''))
    .filter(Boolean);
}

/**
 * Builds export rows with the corrected address in the Email column.
 * The Suggestion column is cleared once the correction has been applied, so
 * the old address never leaves the extension in either column.
 */
export function csvResultRows(results) {
  return (Array.isArray(results) ? results : []).map((result) => {
    const suggestion = result.local?.suggestion ?? '';
    return [
      suggestion || result.email,
      result.confidence?.status ?? 'unknown',
      `${result.confidence?.score ?? 0}%`,
      `${result.confidence?.agreement ?? result.confidence?.score ?? 0}%`,
      '',
      (Array.isArray(result.sources) ? result.sources : []).map((source) => source.source).join(' ')
    ];
  });
}
