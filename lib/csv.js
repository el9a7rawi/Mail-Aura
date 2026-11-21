/**
 * CSV ingestion helpers.
 *
 * The upload contract is deliberately simple: one email column, with or without
 * a header. Supporting the common `Name,Email` layout avoids silently verifying
 * names as if they were addresses.
 */

export const CSV_MAX_BYTES = 5 * 1024 * 1024;

const HEADER_CELL = /^(?:e-?mail|بريد|الإيميل|البريد(?: الإلكتروني)?)$/iu;

function parseLine(line) {
  const cells = [];
  let current = '';
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"') {
      if (quoted && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (char === ',' && !quoted) {
      cells.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  cells.push(current);
  return cells.map((cell) => cell.trim());
}

function emailColumn(lines) {
  if (!lines.length) return { index: 0, hasHeader: false };
  const first = parseLine(lines[0]);
  const index = first.findIndex((cell) => HEADER_CELL.test(cell));
  return index >= 0 ? { index, hasHeader: true } : { index: 0, hasHeader: false };
}

export function csvEmails(text) {
  if (typeof text !== 'string') return [];

  const lines = text.split(/\r?\n/u).filter((line) => line.trim());
  const { index, hasHeader } = emailColumn(lines);

  return lines.slice(hasHeader ? 1 : 0)
    .map((line) => parseLine(line)[index] ?? '')
    .filter(Boolean);
}

/** Prefix spreadsheet formula triggers so exported cells stay literal text. */
export function csvEscape(value) {
  const text = String(value ?? '');
  const safe = /^[=+\-@\t\r]/u.test(text) ? `'${text}` : text;
  return /[",\r\n]/u.test(safe) ? `"${safe.replace(/"/gu, '""')}"` : safe;
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
