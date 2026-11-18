/**
 * Adapters for the keyless verification services.
 *
 * Each adapter returns the same shape so the orchestrator never needs to know
 * which provider produced a verdict. A failed or unknown response is reported
 * as 'unknown' rather than guessed: an outage must not turn into a verdict.
 */

const TIMEOUT_MS = 8000;

async function fetchJson(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

function result(source, verdict, reason, extra = {}) {
  return { source, verdict, reason, ...extra };
}

/** Rapid Email Validator: syntax, domain, MX, disposable, role, typo, score. */
export async function checkRapid(email) {
  try {
    const endpoint = `https://rapid-email-verifier.fly.dev/api/validate?email=${encodeURIComponent(email)}`;
    const payload = await fetchJson(endpoint);
    const status = String(payload.status ?? '').toUpperCase();

    if (status === 'VALID') return result('rapid', 'valid', status, { mx: true });
    if (status === 'DISPOSABLE') return result('rapid', 'risky', status);
    if (status.startsWith('INVALID')) return result('rapid', 'invalid', status);

    return result('rapid', 'unknown', status || 'unrecognized_status');
  } catch (error) {
    return result('rapid', 'unknown', `unavailable: ${error.message}`);
  }
}

/** Disify: format, DNS, and disposable detection in one keyless call. */
export async function checkDisify(email) {
  try {
    const endpoint = `https://disify.com/api/email/${encodeURIComponent(email)}`;
    const payload = await fetchJson(endpoint);

    if (payload.format === false) return result('disify', 'invalid', 'format');
    if (payload.dns === false) return result('disify', 'invalid', 'no_mail_server');
    if (payload.disposable === true) return result('disify', 'risky', 'disposable');

    // A 200 with an unknown shape is an outage, not a positive verdict.
    if (payload.format === true && payload.dns === true) {
      return result('disify', 'valid', 'format_and_dns_ok', { mx: true });
    }
    return result('disify', 'unknown', 'unrecognized_response');
  } catch (error) {
    return result('disify', 'unknown', `unavailable: ${error.message}`);
  }
}

/** DeBounce disposable endpoint returns its boolean as a string. */
export async function checkDebounce(email) {
  try {
    const endpoint = `https://disposable.debounce.io/?email=${encodeURIComponent(email)}`;
    const payload = await fetchJson(endpoint);
    const value = String(payload.disposable ?? '').toLowerCase();

    if (value === 'true') return result('debounce', 'risky', 'disposable');
    if (value === 'false') return result('debounce', 'valid', 'not_disposable');

    return result('debounce', 'unknown', 'unrecognized_response');
  } catch (error) {
    return result('debounce', 'unknown', `unavailable: ${error.message}`);
  }
}

/** Disban: category and mail-routing classification. */
export async function checkDisban(email) {
  try {
    const endpoint = `https://disban.io/api/v1/check/${encodeURIComponent(email)}`;
    const payload = await fetchJson(endpoint);

    if (payload.mail_routing === 'undeliverable') {
      return result('disban', 'invalid', 'undeliverable');
    }
    if (payload.disposable === true || payload.category === 'disposable') {
      return result('disban', 'risky', 'disposable');
    }
    if (payload.mail_routing === 'routable') {
      return result('disban', 'valid', 'routable');
    }

    return result('disban', 'unknown', 'unrecognized_response');
  } catch (error) {
    return result('disban', 'unknown', `unavailable: ${error.message}`);
  }
}

/** EmailProbe's open endpoint is intentionally limited to disposable checks. */
export async function checkEmailProbe(domain) {
  try {
    const endpoint = `https://api.emailprobe.dev/open/v1/disposable/${encodeURIComponent(domain)}`;
    const payload = await fetchJson(endpoint);

    if (payload.is_disposable === true) return result('emailprobe', 'risky', 'disposable');
    if (payload.is_disposable === false) return result('emailprobe', 'valid', 'not_disposable');

    return result('emailprobe', 'unknown', 'unrecognized_response');
  } catch (error) {
    return result('emailprobe', 'unknown', `unavailable: ${error.message}`);
  }
}

/** MailCheck.ai is also disposable-only; an unknown shape stays unknown. */
export async function checkMailCheck(domain) {
  try {
    const endpoint = `https://api.mailcheck.ai/domain/${encodeURIComponent(domain)}`;
    const payload = await fetchJson(endpoint);

    if (payload.disposable === true) return result('mailcheck', 'risky', 'disposable');
    if (payload.disposable === false) return result('mailcheck', 'valid', 'not_disposable');

    return result('mailcheck', 'unknown', 'unrecognized_response');
  } catch (error) {
    return result('mailcheck', 'unknown', `unavailable: ${error.message}`);
  }
}

async function queryDns(source, endpoint, options) {
  try {
    const payload = await fetchJson(endpoint, options);
    const answers = Array.isArray(payload.Answer) ? payload.Answer : [];
    const hasMx = answers.some((answer) => Number(answer.type) === 15);

    if (payload.Status === 3) return result(source, 'invalid', 'nxdomain');
    if (hasMx) return result(source, 'valid', 'mx_present', { mx: true });

    return result(source, 'unknown', 'no_mx_answer');
  } catch (error) {
    return result(source, 'unknown', `unavailable: ${error.message}`);
  }
}

export function checkDnsGoogle(domain) {
  const endpoint = `https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=MX`;
  return queryDns('doh_google', endpoint);
}

export function checkDnsCloudflare(domain) {
  const endpoint = `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=MX`;
  return queryDns('doh_cloudflare', endpoint, { headers: { Accept: 'application/dns-json' } });
}
