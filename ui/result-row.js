/**
 * Result row renderer shared by the popup/side panel and the visual preview.
 *
 * The address and every source reason come from untrusted input, so values are
 * written with textContent and never interpreted as markup.
 */

const SVG_NS = 'http://www.w3.org/2000/svg';

const ICONS = Object.freeze({
  copy: [
    { tag: 'rect', attrs: { x: '9', y: '9', width: '13', height: '13', rx: '2' } },
    { tag: 'path', attrs: { d: 'M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1' } }
  ],
  fix: [
    { tag: 'polyline', attrs: { points: '20 6 9 17 4 12' } }
  ]
});

const DEFAULT_TEXT = Object.freeze({
  confidenceLabel: 'ثقة',
  scoreTitle: 'تقدير الثقة {score}% — اتفاق المصادر {agreement}%',
  reasonSuggestion: 'تصحيح: {value}',
  reasonDisposable: 'نطاق بريد مؤقت (disposable)',
  reasonRole: 'عنوان وظيفي مشترك (role)',
  reasonInvalidFormat: 'الصيغة غير صحيحة — رفض محلي',
  reasonNoExternal: 'لا رد من المصادر الخارجية',
  reasonFreeProvider: 'مزود بريد مجاني — بلا رد من المصادر',
  reasonUnrecognized: 'رد غير مفهوم',
  reasonUnavailable: 'المصدر غير متاح',
  reason_VALID: 'صيغة سليمة',
  reason_deliverable: 'قابل للتوصيل',
  reason_format_and_dns_ok: 'صيغة سليمة وسيرفر بريد موجود',
  reason_has_mx: 'سيرفر بريد موجود',
  reason_mx_ok: 'سيرفر بريد موجود',
  reason_mx_present: 'سيرفر بريد موجود',
  reason_not_disposable: 'ليس بريداً مؤقتاً',
  reason_routable: 'عنوان قابل للتوجيه',
  reason_format: 'الصيغة غير صحيحة',
  reason_no_mail_server: 'لا سيرفر بريد',
  reason_nxdomain: 'النطاق غير موجود',
  reason_disposable: 'بريد مؤقت',
  reason_undeliverable: 'لا يمكن التوصيل',
  reason_local_signals: 'فحص محلي أولي'
});

function defaultTranslate(key, vars) {
  const template = DEFAULT_TEXT[key] ?? key;
  return vars
    ? template.replace(/\{(\w+)\}/gu, (match, name) =>
        Object.prototype.hasOwnProperty.call(vars, name) ? String(vars[name]) : match)
    : template;
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = String(text);
  return node;
}

function icon(name) {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('width', '15');
  svg.setAttribute('height', '15');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '2');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  svg.setAttribute('aria-hidden', 'true');

  for (const spec of ICONS[name]) {
    const node = document.createElementNS(SVG_NS, spec.tag);
    for (const [key, value] of Object.entries(spec.attrs)) node.setAttribute(key, value);
    svg.appendChild(node);
  }
  return svg;
}

const SOURCE_LABEL = Object.freeze({
  rapid: 'Rapid',
  disify: 'Disify',
  debounce: 'DeBounce',
  disban: 'Disban',
  emailprobe: 'EmailProbe',
  mailcheck: 'MailCheck',
  doh_google: 'Google DNS',
  doh_cloudflare: 'Cloudflare DNS'
});

const REASON_KEY = Object.freeze({
  VALID: 'reason_VALID',
  deliverable: 'reason_deliverable',
  format_and_dns_ok: 'reason_format_and_dns_ok',
  has_mx: 'reason_has_mx',
  mx_ok: 'reason_mx_ok',
  mx_present: 'reason_mx_present',
  not_disposable: 'reason_not_disposable',
  routable: 'reason_routable',
  format: 'reason_format',
  no_mail_server: 'reason_no_mail_server',
  nxdomain: 'reason_nxdomain',
  disposable: 'reason_disposable',
  undeliverable: 'reason_undeliverable',
  unrecognized_response: 'reasonUnrecognized',
  local_signals: 'reason_local_signals'
});

function describeSource(source, translate) {
  const t = translate ?? defaultTranslate;
  const name = SOURCE_LABEL[source.source] ?? source.source;
  const reasonKey = String(source.reason).startsWith('unavailable')
    ? 'reasonUnavailable'
    : (REASON_KEY[source.reason] ?? 'reasonUnrecognized');
  return `${name}: ${t(reasonKey)}`;
}

/** One short, actionable sentence; the caveat lives once under the list. */
export function describeResult(result, translate) {
  const t = translate ?? defaultTranslate;
  const local = result.local ?? {};
  if (local.suggestion) return t('reasonSuggestion', { value: local.suggestion });
  if (local.disposable) return t('reasonDisposable');
  if (local.role) return t('reasonRole');
  if (local.valid === false) return t('reasonInvalidFormat');

  const sources = Array.isArray(result.sources) ? result.sources : [];
  const bad = sources.find((item) =>
    item.source !== 'local' && (item.verdict === 'invalid' || item.verdict === 'risky'));
  if (bad) return describeSource(bad, t);

  const good = sources.find((item) => item.source !== 'local' && item.verdict === 'valid');
  if (good) return describeSource(good, t);

  if (local.freeProvider) return t('reasonFreeProvider');
  return t('reasonNoExternal');
}

export function createResultRow(result, options = {}) {
  const { showSources = false, onCopy, onFix, t } = options;
  const translate = typeof t === 'function' ? t : defaultTranslate;
  const status = result.confidence?.status ?? 'unknown';
  const score = Number(result.confidence?.score ?? 0);
  const agreement = Number(result.confidence?.agreement ?? score);

  const row = el('li', 'result');
  row.dataset.status = status;
  row.setAttribute('role', 'listitem');

  const main = el('div', 'result-main');

  const top = el('div', 'result-top');
  const email = el('span', 'result-email', result.email);
  email.dir = 'ltr';
  email.title = result.email;
  const badge = el('span', 'badge', translate(`status${status.charAt(0).toUpperCase()}${status.slice(1)}`));
  badge.dataset.status = status;
  top.append(email, badge);
  main.appendChild(top);

  // Score and reason share one line: the row stays scannable at 400px without
  // pushing the list into a second screen.
  const detail = el('div', 'result-detail');
  const scoreLabel = el('span', 'result-score');
  scoreLabel.title = translate('scoreTitle', { score, agreement });
  scoreLabel.append(translate('confidenceLabel'), ' ', el('b', '', `${score}%`));
  detail.append(
    scoreLabel,
    el('span', 'sep', '·'),
    el('span', 'result-reason', describeResult(result, translate))
  );
  main.appendChild(detail);

  const caveat = result.confidence?.caveat;
  if (caveat) {
    const caveatKey = result.confidence?.caveatKey;
    main.appendChild(el('p', 'result-caveat', caveatKey ? translate(caveatKey) : caveat));
  }

  if (showSources) {
    const sources = (Array.isArray(result.sources) ? result.sources : [])
      .filter((item) => item.verdict !== 'unknown')
      .map((item) => item.source);
    if (!sources.length) sources.push('local');

    const chips = el('div', 'sources');
    for (const name of sources) chips.appendChild(el('span', 'source-chip', name));
    main.appendChild(chips);
  }

  const actions = el('div', 'result-actions');
  if (typeof onCopy === 'function') {
    const copy = miniButton('copy', translate('copyAddress'));
    copy.addEventListener('click', () => onCopy(result));
    actions.appendChild(copy);
  }
  if ((result.local?.suggestion) && typeof onFix === 'function') {
    const fix = miniButton('fix', translate('applyCorrection'));
    fix.classList.add('fix');
    fix.addEventListener('click', () => onFix(result));
    actions.appendChild(fix);
  }

  row.append(main, actions);
  return row;
}

function miniButton(iconName, label) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'mini-btn';
  button.setAttribute('aria-label', label);
  button.title = label;
  button.appendChild(icon(iconName));
  return button;
}
