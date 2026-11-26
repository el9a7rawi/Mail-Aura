/**
 * Local validation primitives.
 *
 * Everything here is pure and synchronous so the same rules can be used by the
 * popup, the service worker, and the test suite without duplicating logic.
 * These checks describe what can be established without contacting a remote
 * service; they deliberately never claim that a mailbox actually exists.
 */

const EMAIL_PATTERN =
  /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,63}$/u;

const EMAIL_IN_TEXT =
  /[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,63}/gu;

import { correctEmail } from './corrections.js';

const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com',
  'yopmail.com',
  'tempmail.com',
  '10minutemail.com',
  'guerrillamail.com',
  'trashmail.com',
  'disposableinbox.com',
  'fakeinbox.com',
  'maildrop.cc',
  'getairmail.com',
  'sharklasers.com',
  'spam4.me',
  'temp-mail.org',
  'throwawaymail.com'
]);

const ROLE_LOCALS = new Set([
  'info',
  'admin',
  'support',
  'sales',
  'contact',
  'help',
  'noreply',
  'no-reply',
  'postmaster',
  'webmaster',
  'team',
  'office',
  'billing',
  'security'
]);

const FREE_PROVIDERS = new Set([
  'gmail.com',
  'googlemail.com',
  'yahoo.com',
  'yahoo.co.uk',
  'hotmail.com',
  'outlook.com',
  'live.com',
  'icloud.com',
  'me.com',
  'aol.com',
  'protonmail.com',
  'proton.me',
  'mail.com',
  'yandex.com',
  'yandex.ru',
  'zoho.com',
  'gmx.com',
  'qq.com',
  '163.com'
]);

const DOT_ALIAS_DOMAINS = new Set(['gmail.com', 'googlemail.com']);
const PLUS_ALIAS_DOMAINS = new Set([
  'gmail.com',
  'googlemail.com',
  'outlook.com',
  'hotmail.com',
  'live.com'
]);
const HYPHEN_ALIAS_DOMAINS = new Set(['yahoo.com', 'yahoo.co.uk']);

/**
 * Splits a raw address into local and domain parts. Angle brackets are removed
 * because pasted addresses frequently arrive as `<name@example.com>`.
 */
export function normalizeEmail(raw) {
  if (typeof raw !== 'string') return null;

  const trimmed = raw.trim().replace(/^<|>$/gu, '');
  const separator = trimmed.lastIndexOf('@');
  if (separator <= 0 || separator === trimmed.length - 1) return null;

  const local = trimmed.slice(0, separator);
  const domain = trimmed.slice(separator + 1).toLowerCase();

  return { local, domain, normalized: `${local}@${domain}` };
}

export function validateSyntax(value) {
  const parsed = normalizeEmail(value);
  if (!parsed) return { valid: false, reason: 'missing_at_or_empty' };
  if (parsed.local.length > 64) return { valid: false, reason: 'local_too_long' };
  if (parsed.domain.length > 253) return { valid: false, reason: 'domain_too_long' };
  if (
    parsed.local.startsWith('.') ||
    parsed.local.endsWith('.') ||
    parsed.local.includes('..')
  ) {
    return { valid: false, reason: 'invalid_local_dots' };
  }
  if (!EMAIL_PATTERN.test(parsed.normalized)) {
    return { valid: false, reason: 'invalid_format' };
  }
  return { valid: true, reason: 'ok', parsed };
}

/** Correct a known typo locally; return null when the address is ambiguous. */
export function suggestCorrection(email) {
  return correctEmail(email);
}

/** Normalizes provider-specific aliases so duplicates can be detected. */
export function normalizeAlias(local, domain) {
  let canonical = local.toLowerCase();

  if (DOT_ALIAS_DOMAINS.has(domain)) canonical = canonical.replace(/\./gu, '');
  if (PLUS_ALIAS_DOMAINS.has(domain)) canonical = canonical.replace(/\+.*$/u, '');
  if (HYPHEN_ALIAS_DOMAINS.has(domain)) canonical = canonical.replace(/-.*$/u, '');

  return `${canonical}@${domain}`;
}

/** Collects every signal that can be derived without a network call. */
export function classifyLocal(email) {
  const syntax = validateSyntax(email);
  if (!syntax.valid) {
    return {
      ...syntax,
      suggestion: null,
      aliasOf: null,
      disposable: false,
      role: false,
      freeProvider: false
    };
  }

  const { local, domain, normalized } = syntax.parsed;

  return {
    valid: true,
    reason: 'ok',
    parsed: syntax.parsed,
    normalized,
    suggestion: suggestCorrection(normalized),
    aliasOf: normalizeAlias(local, domain),
    disposable: DISPOSABLE_DOMAINS.has(domain),
    role: ROLE_LOCALS.has(local.toLowerCase()),
    freeProvider: FREE_PROVIDERS.has(domain)
  };
}

/**
 * Parses a pasted list.
 *
 * Whitespace inside a token is never treated as a separator: splitting on it
 * would turn a malformed address such as "name domain@gmail.com" into a valid
 * fragment and silently hide the original error from the user.
 */
export function parseEmailLines(text) {
  if (typeof text !== 'string') return { emails: [], duplicates: [], invalid: [] };

  const tokens = text.split(/[,;\r\n\t]+/u).map((token) => token.trim()).filter(Boolean);
  const seen = new Set();
  const aliases = new Set();
  const emails = [];
  const duplicates = [];
  const invalid = [];

  for (const token of tokens) {
    const syntax = validateSyntax(token);
    if (!syntax.valid) {
      invalid.push(token);
      continue;
    }
    const key = syntax.parsed.normalized.toLowerCase();
    const alias = normalizeAlias(syntax.parsed.local, syntax.parsed.domain);
    if (seen.has(key) || aliases.has(alias)) {
      duplicates.push(token);
      continue;
    }
    seen.add(key);
    aliases.add(alias);
    emails.push(token);
  }

  return { emails, duplicates, invalid };
}

/** Collect unique addresses from arbitrary text for page scan. */
export function extractEmailsFromText(text) {
  if (typeof text !== 'string') return [];

  const found = text.match(EMAIL_IN_TEXT) ?? [];
  const seen = new Set();
  const result = [];

  for (const value of found) {
    const parsed = normalizeEmail(value);
    if (!parsed) continue;

    const key = parsed.normalized.toLowerCase();
    if (seen.has(key)) continue;

    seen.add(key);
    result.push(value);
  }

  return result;
}
