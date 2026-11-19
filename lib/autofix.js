/**
 * Automatic corrections applied to CSV uploads only.
 *
 * Only domains listed in the local typo dictionary are rewritten. Provider
 * alias forms belong to the real mailbox, so they are never changed silently.
 */

import { normalizeEmail, suggestCorrection } from './validation.js';

export function autoFixEmails(emails) {
  const list = Array.isArray(emails) ? emails : [];
  const seen = new Set();
  const fixed = [];
  const correctedFrom = [];
  let corrections = 0;

  for (const email of list) {
    const suggestion = suggestCorrection(email);
    const candidate = suggestion ?? email;
    const parsed = normalizeEmail(candidate);
    const key = parsed
      ? parsed.normalized.toLowerCase()
      : String(candidate).trim().toLowerCase();

    // A correction can collapse two rows into one address; keeping the first
    // prevents the result list from showing a duplicate the CSV never had.
    if (seen.has(key)) continue;
    seen.add(key);

    fixed.push(candidate);
    correctedFrom.push(suggestion ? email : null);
    if (suggestion) corrections += 1;
  }

  return { emails: fixed, correctedFrom, corrections };
}
