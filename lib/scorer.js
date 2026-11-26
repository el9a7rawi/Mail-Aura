/**
 * Multi-source confidence scoring.
 *
 * No public service can prove that a specific mailbox exists. `agreement`
 * reports how strongly the answering sources agree; `score` is the number shown
 * to the user and is deliberately capped for positive verdicts so agreement is
 * never mistaken for certainty about a real inbox.
 */

const SOURCE_WEIGHTS = Object.freeze({
  rapid: 3,
  disify: 2,
  debounce: 2,
  mailcheck: 1,
  disban: 1,
  emailprobe: 1,
  doh_google: 2,
  doh_cloudflare: 2,
  local: 2
});

const VALID_VERDICTS = new Set(['valid', 'invalid', 'risky', 'unknown']);

/**
 * Combines source verdicts into a status and an honestly bounded score.
 *
 * @param {Array<{source:string, verdict:string}>} results
 * @param {object} localSignals output of classifyLocal()
 * @returns {{score:number, agreement:number, level:string, status:string, basis:string, caveat:string, caveatKey:string, votes:object, conflicts:string[], sourceCount:number}}
 */
export function computeConfidence(results, localSignals = {}, context = {}) {
  const signals = localSignals && typeof localSignals === 'object' ? localSignals : {};
  // One answer per source: repeated entries must not add votes or independent
  // MX confirmations for the same provider.
  const entries = [...new Map(
    (Array.isArray(results) ? results : [])
      .filter(Boolean)
      .map((entry) => [entry.source, entry])
  ).values()];
  const votes = { valid: 0, invalid: 0, risky: 0, unknown: 0 };
  const conflicts = [];

  // The local check only validates syntax. Counting it as a remote vote would
  // let one disposable-only service produce a "valid" verdict without any MX.
  for (const entry of entries) {
    if (entry.source === 'local') continue;
    const weight = Object.hasOwn(SOURCE_WEIGHTS, entry.source) ? SOURCE_WEIGHTS[entry.source] : 1;
    const verdict = VALID_VERDICTS.has(entry.verdict) ? entry.verdict : 'unknown';
    votes[verdict] += weight;
  }

  const decisive = votes.valid + votes.invalid + votes.risky;
  const winning = Math.max(votes.valid, votes.invalid, votes.risky);
  const agreement = decisive === 0 ? 0 : Math.round((winning / decisive) * 100);
  const hasConflict = votes.valid > 0 && votes.invalid > 0;
  // No single service may promote an address to `valid`: a positive answer from
  // one provider is a claim, not a second opinion. DNS adapters normally give
  // two independent MX confirmations on a real domain.
  const hasMx = new Set(entries
    .filter((entry) => entry.mx === true && entry.verdict === 'valid')
    .map((entry) => entry.source)).size >= 2;
  const externalCount = entries.filter((entry) => entry.source !== 'local').length;
  const basis = externalCount === 0 ? 'local-only' : 'multi-source';

  // An address repaired before verification carries its origin in the context,
  // not in local.suggestion — that field would offer a button to undo the fix.
  const wasCorrected = Boolean(signals.suggestion || context.correctedFrom);
  if (hasConflict) conflicts.push('sources_disagree');
  if (wasCorrected) conflicts.push('domain_corrected');

  let status;
  if (signals.valid === false) {
    status = 'invalid';
  } else if (hasConflict) {
    status = 'review';
  } else if (wasCorrected) {
    // A known repair is reportable even when privacy mode returns no votes.
    status = 'corrected';
  } else if (decisive === 0) {
    status = 'unknown';
  } else if (votes.invalid > votes.valid && votes.invalid >= 3) {
    status = 'invalid';
  } else if (signals.disposable || signals.role || votes.risky > 0) {
    status = 'suspicious';
  } else if (votes.valid >= 3 && hasMx) {
    status = 'valid';
  } else {
    status = 'review';
  }

  let score;
  let caveat;
  let caveatKey;

  switch (status) {
    case 'invalid':
      if (signals.valid === false) {
        score = 100;
        caveat = 'الصيغة غير صحيحة — نتيجة محلية مؤكدة';
        caveatKey = 'caveatInvalidLocal';
      } else {
        score = Math.min(agreement, 95);
        caveat = 'تشير المصادر إلى أن النطاق لا يستقبل بريداً';
        caveatKey = 'caveatInvalidRemote';
      }
      break;
    case 'valid':
      score = Math.min(agreement, 88);
      caveat = 'تقدير نطاقي — لا يثبت وجود الصندوق أو استلامه';
      caveatKey = 'caveatValid';
      break;
    case 'corrected':
      score = Math.min(agreement, 85);
      caveat = 'يوجد خطأ معروف في الدومين — راجع الاقتراح';
      caveatKey = 'caveatCorrected';
      break;
    case 'suspicious':
      score = Math.min(agreement, 90);
      caveat = 'إشارات تحذيرية على العنوان أو النطاق';
      caveatKey = 'caveatSuspicious';
      break;
    case 'review':
      score = Math.min(agreement, 60);
      caveat = 'المصادر متعارضة أو غير كافية — يلزم مراجعة يدوية';
      caveatKey = 'caveatReview';
      break;
    default:
      // Privacy mode answers no external question, but the local brain still
      // has evidence. Surface it as a bounded, explicitly local estimate;
      // `unknown` stays the status so nobody mistakes it for mailbox proof.
      const localScore = Number(signals.localScore ?? 0);
      score = Math.min(Math.max(Number.isFinite(localScore) ? localScore : 0, 0), 60);
      caveat = 'لم تتوفر إجابات من المصادر';
      caveatKey = 'caveatUnknown';
  }

  let level = score >= 80 ? 'high' : score >= 50 ? 'medium' : 'low';
  if (status === 'review' || status === 'unknown') level = 'low';

  return {
    score,
    agreement,
    level,
    status,
    basis,
    caveat,
    caveatKey,
    votes,
    conflicts,
    sourceCount: entries.length
  };
}
