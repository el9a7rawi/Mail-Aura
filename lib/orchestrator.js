/**
 * Verification orchestration.
 *
 * Domain-level checks are cached because a single list usually contains many
 * addresses from the same provider. Email-level checks are never cached, since
 * storing addresses would conflict with the extension's privacy commitments.
 */

import { classifyLocal } from './validation.js';
import { computeConfidence } from './scorer.js';
import {
  checkDebounce,
  checkDisban,
  checkDisify,
  checkDnsCloudflare,
  checkDnsGoogle,
  checkEmailProbe,
  checkMailCheck,
  checkRapid
} from './sources.js';

export const DOMAIN_CACHE_TTL_MS = 5 * 60 * 1000;
const domainCache = new Map();
// A lookup that is still in flight when the cache is cleared must not write
// its pre-clear verdict back in; the generation makes that write conditional.
let cacheGeneration = 0;

async function checkDomain(domain) {
  const cached = domainCache.get(domain);
  if (cached) {
    if (Date.now() - cached.at < DOMAIN_CACHE_TTL_MS) return cached.value;
    // Drop stale entries instead of leaving them allocated until the next
    // lookup of the same domain, which may never happen.
    domainCache.delete(domain);
  }

  // Store the pending promise so concurrent addresses on one domain share one
  // lookup instead of each issuing the same four requests.
  const generation = cacheGeneration;
  const pending = Promise.all([
    checkDnsGoogle(domain),
    checkDnsCloudflare(domain),
    checkEmailProbe(domain),
    checkMailCheck(domain)
  ]).then((results) => {
    if (generation === cacheGeneration) domainCache.set(domain, { at: Date.now(), value: results });
    return results;
  });

  domainCache.set(domain, { at: Date.now(), value: pending });
  return pending;
}

/** Verify one address; remote checks run unless privacy mode disables them. */
export async function verifyEmail(email, options = {}) {
  const local = classifyLocal(email);
  const correctedFrom = options.correctedFrom ?? null;
  if (!local.valid) {
    return {
      email, local, sources: [], correctedFrom,
      confidence: computeConfidence([], local, { correctedFrom })
    };
  }

  const remoteEnabled = options.privacyMode !== true;
  const address = local.normalized;
  const [domainResults, addressResults] = remoteEnabled
    ? await Promise.all([
        checkDomain(local.domain),
        Promise.all([
          checkRapid(address),
          checkDisify(address),
          checkDebounce(address),
          checkDisban(address)
        ])
      ])
    : [[], []];

  const sources = [
    { source: 'local', verdict: 'valid', reason: 'local_signals' },
    ...domainResults,
    ...addressResults
  ];

  return {
    email, local, sources, correctedFrom,
    confidence: computeConfidence(sources, local, { correctedFrom })
  };
}

/** Bounded concurrency keeps provider load low; results preserve input order. */
export async function verifyBatch(emails, options = {}) {
  const list = Array.isArray(emails) ? emails : [];
  const limit = Math.max(1, Math.min(options.concurrency ?? 4, list.length || 1));
  const results = new Array(list.length);
  const corrections = Array.isArray(options.correctedFrom) ? options.correctedFrom : [];
  let cursor = 0;

  async function worker() {
    while (cursor < list.length) {
      const index = cursor++;
      results[index] = await verifyEmail(list[index], {
        privacyMode: options.privacyMode,
        correctedFrom: corrections[index] ?? null
      });
    }
  }

  await Promise.all(Array.from({ length: limit }, worker));
  return results;
}

export function clearDomainCache() {
  cacheGeneration += 1;
  domainCache.clear();
}
