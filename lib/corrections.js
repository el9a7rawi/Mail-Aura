/**
 * Local-only email typo correction.
 *
 * Corrections are deliberately conservative: an address is rewritten only when
 * it resolves to exactly one well-known domain through an unambiguous rule.
 * Anything ambiguous stays untouched, because guessing a recipient is worse
 * than reporting an uncertain address. No network call is involved.
 */

const KNOWN_DOMAINS = Object.freeze(new Set([
  'gmail.com', 'googlemail.com', 'google.com', 'yahoo.com', 'yahoo.co.uk',
  'yahoo.de', 'yahoo.fr', 'yahoo.es', 'yahoo.it', 'yahoo.ca', 'yahoo.com.au',
  'yahoo.co.in', 'yahoo.co.nz', 'hotmail.com', 'hotmail.co.uk', 'hotmail.fr',
  'outlook.com', 'outlook.fr', 'outlook.de', 'live.com', 'live.co.uk',
  'icloud.com', 'me.com', 'aol.com', 'aim.com', 'msn.com',
  'protonmail.com', 'proton.me', 'tutanota.com', 'tutanota.de',
  'fastmail.com', 'fastmail.fm', 'hushmail.com', 'mail.com', 'email.com',
  'inbox.com', 'zoho.com', 'gmx.com', 'gmx.de', 'gmx.net', 'web.de',
  'posteo.de', 'mailbox.org', 'riseup.net', 'disroot.org', 'lavabit.com',
  'yandex.com', 'yandex.ru', 'yandex.kz', 'yandex.by', 'mail.ru', 'list.ru',
  'bk.ru', 'inbox.ru', 'rambler.ru', 'qq.com', '163.com', '126.com',
  'rediffmail.com', 'indiatimes.com', 'sify.com', 'vsnl.net',
  'btinternet.com', 'sky.com', 'virginmedia.com', 'talktalk.net',
  'verizon.net', 'comcast.net', 'sbcglobal.net', 'bellsouth.net',
  'charter.net', 'cox.net', 'att.net', 'bigpond.com', 'optusnet.com.au',
  'xtra.co.nz', 'wp.pl', 'o2.pl', 'interia.pl', 'op.pl', 'poczta.fm',
  't-online.de', 'freenet.de', 'libero.it', 'virgilio.it', 'alice.it',
  'tin.it', 'terra.es', 'telefonica.net', 'orange.fr', 'free.fr',
  'laposte.net', 'wanadoo.fr', 'skynet.be', 'telenet.be', 'ziggo.nl',
  'planet.nl', 'hetnet.nl', 'casema.nl', 'tele2.nl', 'purple.com',
  'company.com', 'example.com', 'test.com', 'domain.com', 'mail.net'
]));

/** Suffixes that are never legitimate for the providers above. */
const TLD_TYPOS = Object.freeze({
  con: 'com', cmo: 'com', comm: 'com', cim: 'com', cpm: 'com',
  xom: 'com', ocm: 'com', ocmo: 'com', omc: 'com', comn: 'com', comc: 'com',
  ogr: 'org', orgg: 'org', og: 'org', ner: 'net', nett: 'net',
  nte: 'net', ne: 'net', couk: 'co.uk', om: 'com'
});

/** Real providers that must never be rewritten by an edit rule. */
const PROTECTED_DOMAINS = Object.freeze(new Set([
  'ymail.com', 'dmail.com', 'mailinator.com', 'yopmail.com', 'zmail.com',
  'mmail.com', 'smail.com', 'bmail.com'
]));

/** Digit-for-letter mistakes that are safe to fix on a known provider. */
const DIGIT_FIXES = Object.freeze({ 0: 'o', 1: 'l' });

const SAFE_LOCAL = /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+$/u;
const SAFE_DOMAIN = /^(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,63}$/u;

/** High-confidence whole-domain typos that an edit rule alone might miss. */
const DOMAIN_ALIASES = Object.freeze({
  'gmial.com': 'gmail.com', 'gmial.co': 'gmail.com',
  'gmai.com': 'gmail.com', 'gnail.com': 'gmail.com',
  'gmaill.com': 'gmail.com', 'gmil.com': 'gmail.com', 'gnail.co': 'gmail.com',
  'gmail.co': 'gmail.com', 'gmail.con': 'gmail.com', 'gmail.cmo': 'gmail.com',
  'googlemail.co': 'googlemail.com', 'googlmail.com': 'googlemail.com',
  'hotmial.com': 'hotmail.com', 'hormail.com': 'hotmail.com',
  'hotmai.com': 'hotmail.com', 'hotmial.co': 'hotmail.com',
  'hotmail.co': 'hotmail.com', 'hotmail.con': 'hotmail.com',
  'outlok.com': 'outlook.com', 'outloook.com': 'outlook.com',
  'outlook.co': 'outlook.com', 'outlok.co.uk': 'outlook.co.uk',
  'iclould.com': 'icloud.com', 'icloud.co': 'icloud.com',
  'icloud.con': 'icloud.com', 'protonmai.com': 'protonmail.com',
  'protonmail.co': 'protonmail.com', 'live.co': 'live.com',
  'yaho.com': 'yahoo.com', 'yahooo.com': 'yahoo.com',
  'yahoo.co': 'yahoo.com', 'yahoo.con': 'yahoo.com',
  'yahoo.cmo': 'yahoo.com', 'yahooo.co.uk': 'yahoo.co.uk',
  'aol.co': 'aol.com', 'msn.co': 'msn.com', 'zoho.co': 'zoho.com',
  'gmx.co': 'gmx.com', 'mail.co': 'mail.com', 'yandex.co': 'yandex.com',
  'yandex.ru.co': 'yandex.ru', 'qq.co': 'qq.com'
});

/** Role-mailbox spellings that are safe to fix when the domain is known. */
const LOCAL_ALIASES = Object.freeze({
  inf0: 'info', ifno: 'info', infom: 'info', ifo: 'info',
  admn: 'admin', adnim: 'admin', amin: 'admin',
  suport: 'support', suppport: 'support', supprot: 'support', suportt: 'support',
  salaes: 'sales', saless: 'sales',
  contat: 'contact', contacct: 'contact', contatct: 'contact',
  hepl: 'help', hlep: 'help',
  noreplyy: 'noreply', noreplyy2: 'noreply',
  webmast: 'webmaster', webmster: 'webmaster',
  postmast: 'postmaster', postmster: 'postmaster'
});

function splitDomain(domain) {
  const dot = domain.lastIndexOf('.');
  if (dot <= 0) return { base: domain, tld: '' };
  return { base: domain.slice(0, dot), tld: domain.slice(dot + 1) };
}

/** True when `typed` differs from `known` by one conservative edit. */
function isSingleEdit(typed, known) {
  if (typed === known) return false;
  const delta = typed.length - known.length;
  if (Math.abs(delta) > 1) return false;

  if (delta === 0) {
    let differences = 0;
    let first = -1;
    let second = -1;
    for (let index = 0; index < typed.length; index += 1) {
      if (typed[index] === known[index]) continue;
      differences += 1;
      if (first < 0) first = index;
      else second = index;
      if (differences > 2) return false;
    }
    if (differences === 1) {
      // General letter substitution is too ambiguous: a real domain such as
      // ymail.com would silently become gmail.com. Only documented digit slips
      // are accepted here; other confusions must use an explicit alias.
      return DIGIT_FIXES[typed[first]] === known[first];
    }
    if (differences === 2) {
      return second === first + 1 && typed[first] === known[second] && typed[second] === known[first];
    }
    return false;
  }

  // One insertion or deletion: the shorter string must be a subsequence with
  // one skipped character, and that character must be a duplicate neighbour.
  const shorter = delta > 0 ? known : typed;
  const longer = delta > 0 ? typed : known;
  let skipped = -1;
  let cursor = 0;
  for (let index = 0; index < longer.length && cursor < shorter.length; index += 1) {
    if (longer[index] === shorter[cursor]) cursor += 1;
    else if (skipped < 0) skipped = index;
    else return false;
  }
  if (skipped < 0) return true;
  // A missing or extra final character is a common typing slip. Interior
  // insertions are accepted only when they repeat the adjacent character,
  // which keeps the rule from inventing unrelated domains.
  if (skipped === longer.length - 1) return true;
  return skipped > 0 && longer[skipped] === longer[skipped - 1];
}

export function suggestDomainCorrection(domain) {
  if (typeof domain !== 'string') return null;
  const typed = domain.trim().toLowerCase();
  if (!typed || KNOWN_DOMAINS.has(typed) || PROTECTED_DOMAINS.has(typed)) return null;

  if (Object.hasOwn(DOMAIN_ALIASES, typed)) return DOMAIN_ALIASES[typed];

  const { base, tld } = splitDomain(typed);
  const fixedTld = Object.hasOwn(TLD_TYPOS, tld) ? TLD_TYPOS[tld] : null;
  if (fixedTld) {
    const candidate = `${base}.${fixedTld}`;
    if (KNOWN_DOMAINS.has(candidate)) return candidate;
  }

  // Compare the provider label, not the whole host: a missing final character
  // is at the end of the label even though a TLD follows it. A typo may affect
  // the label and the suffix at once (gmial.co -> gmail.com).
  if (base.length < 3) return null;

  const candidates = [];
  for (const known of KNOWN_DOMAINS) {
    const other = splitDomain(known);
    if (other.tld !== (fixedTld ?? tld)) continue;
    if (isSingleEdit(base, other.base)) candidates.push(known);
    if (candidates.length > 1) return null;
  }
  return candidates[0] ?? null;
}

export function suggestLocalCorrection(local, domain) {
  if (typeof local !== 'string' || !KNOWN_DOMAINS.has(domain)) return null;
  const typed = local.toLowerCase();
  return Object.hasOwn(LOCAL_ALIASES, typed) ? LOCAL_ALIASES[typed] : null;
}

/** Returns a corrected address, or null when nothing can be safely changed. */
export function correctEmail(email) {
  if (typeof email !== 'string') return null;
  const trimmed = email.trim().replace(/^<|>$/gu, '');
  const separator = trimmed.lastIndexOf('@');
  if (separator <= 0 || separator === trimmed.length - 1) return null;

  const local = trimmed.slice(0, separator);
  const domain = trimmed.slice(separator + 1).toLowerCase();
  const fixedDomain = suggestDomainCorrection(domain);
  const fixedLocal = suggestLocalCorrection(local, fixedDomain ?? domain);

  if (!fixedDomain && !fixedLocal) return null;
  const result = `${fixedLocal ?? local}@${fixedDomain ?? domain}`;
  const [resultLocal, resultDomain] = result.split('@');
  if (!SAFE_LOCAL.test(resultLocal) || !SAFE_DOMAIN.test(resultDomain)) return null;
  return result;
}

export { KNOWN_DOMAINS, PROTECTED_DOMAINS, TLD_TYPOS };
