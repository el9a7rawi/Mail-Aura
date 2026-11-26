/**
 * Local email intelligence.
 *
 * Everything in this module is pure and synchronous: it never calls a network
 * API, never reads storage, and never claims that a mailbox exists. It only
 * reports what can be established from the address string itself.
 */

import { correctEmail } from './corrections.js';

const EMAIL = /^([A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+)@([A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+)$/u;
const EXTRACT = /[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/gu;

const FREE = new Set([
  'gmail.com', 'googlemail.com', 'yahoo.com', 'yahoo.co.uk', 'hotmail.com',
  'outlook.com', 'live.com', 'icloud.com', 'me.com', 'aol.com', 'msn.com',
  'protonmail.com', 'proton.me', 'tutanota.com', 'fastmail.com', 'mail.com',
  'email.com', 'inbox.com', 'zoho.com', 'gmx.com', 'yandex.com', 'mail.ru',
  'qq.com', '163.com', '126.com', 'rediffmail.com', 'sify.com'
]);
const DISPOSABLE = new Set([
  'mailinator.com', 'yopmail.com', 'tempmail.com', '10minutemail.com',
  'guerrillamail.com', 'trashmail.com', 'disposableinbox.com', 'fakeinbox.com',
  'maildrop.cc', 'getairmail.com', 'sharklasers.com', 'spam4.me',
  'temp-mail.org', 'throwawaymail.com'
]);
const ROLE = new Set([
  'info', 'admin', 'support', 'sales', 'contact', 'help', 'noreply',
  'no-reply', 'postmaster', 'webmaster', 'team', 'office', 'billing', 'security'
]);
const EDU_SUFFIXES = ['edu', 'ac.uk', 'edu.au', 'edu.tr', 'edu.cn', 'ac.in', 'ac.nz'];
const GOV_SUFFIXES = ['gov', 'gov.uk', 'gov.au', 'gov.tr', 'gov.cn', 'gouv.fr', 'admin.ch', 'bund.de'];

function domainCategory(domain) {
  if (DISPOSABLE.has(domain)) return 'disposable';
  if (EDU_SUFFIXES.some((suffix) => domain === suffix || domain.endsWith(`.${suffix}`))) return 'education';
  if (GOV_SUFFIXES.some((suffix) => domain === suffix || domain.endsWith(`.${suffix}`))) return 'government';
  if (FREE.has(domain)) return 'free';
  return 'unknown';
}

function aliasOf(local, domain) {
  let canonical = local.toLowerCase();
  if (domain === 'gmail.com' || domain === 'googlemail.com') canonical = canonical.replace(/\./gu, '');
  if (['gmail.com', 'googlemail.com', 'outlook.com', 'hotmail.com', 'live.com'].includes(domain)) {
    canonical = canonical.replace(/\+.*$/u, '');
  }
  if (['yahoo.com', 'yahoo.co.uk'].includes(domain)) canonical = canonical.replace(/-.*$/u, '');
  return `${canonical}@${domain}`;
}

function reasonFor(local, domain, normalized) {
  if (!local || !domain) return 'missing_at_or_empty';
  if (local.length > 64) return 'local_too_long';
  if (domain.length > 253) return 'domain_too_long';
  if (local.startsWith('.') || local.endsWith('.') || local.includes('..')) return 'invalid_local_dots';
  if (domain.startsWith('.') || domain.endsWith('.') || domain.includes('..')) return 'invalid_domain_dots';
  if (!EMAIL.test(normalized)) return 'invalid_format';
  return 'ok';
}

/** Full local-only analysis of a single address. */
export function analyzeEmail(value) {
  const email = typeof value === 'string' ? value.trim().replace(/^<|>$/gu, '') : '';
  const mailto = email.toLowerCase().startsWith('mailto:') ? email.slice(7) : email;
  const separator = mailto.lastIndexOf('@');
  const local = separator > 0 ? mailto.slice(0, separator) : '';
  const domain = separator > 0 ? mailto.slice(separator + 1).toLowerCase() : '';
  const normalized = local && domain ? `${local}@${domain}` : '';
  const reason = reasonFor(local, domain, normalized);
  const valid = reason === 'ok';

  const category = domainCategory(domain);
  const known = category !== 'unknown';
  const suggestion = valid ? correctEmail(normalized) : null;
  const signals = [];

  if (local.includes('+')) signals.push('plus_tag');
  if (local.includes('.')) signals.push('dotted_local');
  if (/\d/u.test(local)) signals.push('numeric_local');
  if (ROLE.has(local.toLowerCase())) signals.push('role_local');
  if (domain.split('.').length > 2) signals.push('subdomain');
  if (domain.startsWith('xn--') || domain.includes('.xn--')) signals.push('punycode');
  if (known) signals.push('known_provider');
  if (suggestion) signals.push('corrected_domain');

  let risk = 'low';
  if (!valid || category === 'disposable') risk = 'high';
  else if (signals.includes('role_local') || signals.includes('subdomain') ||
           signals.includes('punycode') || signals.includes('corrected_domain')) risk = 'medium';

  let localScore = 0;
  if (valid) {
    localScore = 45 + 10 + (known ? 15 : 0) + (risk === 'low' ? 10 : risk === 'medium' ? -10 : -25);
    if (signals.includes('subdomain')) localScore -= 5;
    if (signals.includes('punycode')) localScore -= 5;
    if (category === 'disposable') localScore = Math.min(localScore, 20);
    localScore = Math.max(0, Math.min(88, localScore));
  }

  return {
    email: typeof value === 'string' ? value.trim() : '',
    valid,
    reason,
    normalized: valid ? normalized : null,
    local: valid ? local : null,
    domain: valid ? domain : null,
    provider: { category, name: known ? domain : null },
    aliasOf: valid ? aliasOf(local, domain) : null,
    suggestion,
    signals,
    risk,
    localScore
  };
}

/** Extract unique addresses from arbitrary text, preserving first occurrence. */
export function detectEmails(text) {
  if (typeof text !== 'string') return [];
  const normalized = text
    .replace(/\s*\(\s*at\s*\)\s*/giu, '@')
    .replace(/\s*\[\s*at\s*\]\s*/giu, '@')
    .replace(/\s*\(\s*dot\s*\)\s*/giu, '.')
    .replace(/\s*\[\s*dot\s*\]\s*/giu, '.');

  const found = [];
  const seen = new Set();
  for (const match of normalized.matchAll(EXTRACT)) {
    const candidate = match[0];
    const key = candidate.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    if (analyzeEmail(candidate).valid) found.push(candidate);
  }
  return found;
}
