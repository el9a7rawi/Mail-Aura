/**
 * One syntax authority for every local module.
 *
 * Keeping the validator in its own dependency-free file lets validation, the
 * local brain and the correction engine agree on what a valid address is
 * without importing each other.
 */

export const EMAIL_PATTERN =
  /^([A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+)@((?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,63})$/u;

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
  if (parsed.local.startsWith('.') || parsed.local.endsWith('.') || parsed.local.includes('..')) {
    return { valid: false, reason: 'invalid_local_dots' };
  }
  if (parsed.domain.startsWith('.') || parsed.domain.endsWith('.') || parsed.domain.includes('..')) {
    return { valid: false, reason: 'invalid_domain_dots' };
  }
  if (!EMAIL_PATTERN.test(parsed.normalized)) return { valid: false, reason: 'invalid_format' };
  return { valid: true, reason: 'ok', parsed };
}
