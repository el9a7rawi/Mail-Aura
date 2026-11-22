/**
 * CSV ingestion helpers.
 *
 * The upload contract is deliberately simple: one email column, with or without
 * a header. Supporting the common `Name,Email` layout avoids silently verifying
 * names as if they were addresses.
 */

export const CSV_MAX_BYTES = 5 * 1024 * 1024;

const HEADER_CELL = /^(?:(?:work|business|primary|contact)\s+)?e[-_\s]?mail(?:[-_\s]*(?:address|id))?$|^بريد$|^الإيميل$|^البريد(?:\s+الإلكتروني)?$/iu;

// Rows are parsed as a single pass so a quoted cell may legitimately span
// physical lines. Splitting on newlines first would turn the tail of such a
// cell into a bogus address and shift every following column.
function parseRows(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;

  const endRow = () => {
    row.push(cell.trim());
    if (row.some(Boolean)) rows.push(row);
    row = [];
    cell = '';
  };

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (quoted) {
      if (char === '"') {
        if (text[index + 1] === '"') {
          cell += '"';
          index += 1;
        } else {
          quoted = false;
        }
      } else {
        cell += char;
      }
      continue;
    }
    if (char === '"') {
      quoted = true;
    } else if (char === ',') {
      row.push(cell.trim());
      cell = '';
    } else if (char === '\r' || char === '\n') {
      if (char === '\r' && text[index + 1] === '\n') index += 1;
      endRow();
    } else {
      cell += char;
    }
  }
  endRow();
  return rows;
}

function emailColumn(rows) {
  if (!rows.length) return { index: 0, hasHeader: false };
  const index = rows[0].findIndex((cell) => HEADER_CELL.test(cell));
  return index >= 0 ? { index, hasHeader: true } : { index: 0, hasHeader: false };
}

export function csvEmails(text) {
  if (typeof text !== 'string') return [];

  const rows = parseRows(text);
  const { index, hasHeader } = emailColumn(rows);

  return rows.slice(hasHeader ? 1 : 0)
    .map((row) => row[index] ?? '')
    .filter(Boolean);
}

/** Prefix spreadsheet formula triggers so exported cells stay literal text. */
export function csvEscape(value) {
  const text = String(value ?? '');
  // Inspect a left-trimmed copy: a leading space followed by '=' is still a
  // formula in some spreadsheets, but the original value must be preserved.
  const safe = /^[=+\-@\t\r]/u.test(text.trimStart()) ? `'${text}` : text;
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
