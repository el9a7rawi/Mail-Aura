/**
 * Page scanner. Runs in an isolated world and treats page content as data only.
 *
 * The email pattern is inlined deliberately: this file is injected through the
 * scripting API as a classic script, which cannot use static ES imports.
 */

const EMAIL_PATTERN =
  /[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,63}/gu;

const MAX_HIGHLIGHTS = 200;

function collectEmails() {
  const text = document.body?.innerText ?? '';
  const found = text.match(EMAIL_PATTERN) ?? [];

  for (const link of document.querySelectorAll('a[href^="mailto:"]')) {
    const address = link.getAttribute('href')?.slice(7).split('?')[0] ?? '';
    if (address) found.push(address);
  }

  const seen = new Set();
  return found.filter((email) => {
    const key = email.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** Marks matched emails without mutating the DOM (CSS Custom Highlight API). */
function highlightEmails(emails) {
  if (!('highlights' in CSS) || typeof Highlight === 'undefined') return;

  const marks = new Highlight();
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);

  let node = walker.nextNode();
  while (node) {
    const value = node.nodeValue ?? '';
    for (const email of emails.slice(0, MAX_HIGHLIGHTS)) {
      let index = value.indexOf(email);
      while (index !== -1) {
        const range = document.createRange();
        range.setStart(node, index);
        range.setEnd(node, index + email.length);
        marks.add(range);
        index = value.indexOf(email, index + email.length);
      }
    }
    node = walker.nextNode();
  }

  CSS.highlights.set('mail-aura', marks);

  if (!document.getElementById('mail-aura-highlight-style')) {
    const style = document.createElement('style');
    style.id = 'mail-aura-highlight-style';
    style.textContent = '::highlight(mail-aura){background:#dfe2ff;color:#141826;}';
    document.head.appendChild(style);
  }
}

function clearHighlight() {
  if ('highlights' in CSS) CSS.highlights.delete('mail-aura');
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === 'CLEAR_HIGHLIGHT') {
    clearHighlight();
    return false;
  }

  if (message?.type !== 'SCAN_PAGE') return false;

  try {
    const emails = collectEmails();
    if (message.highlight === false) clearHighlight();
    else highlightEmails(emails);
    sendResponse({ emails });
  } catch {
    sendResponse({ emails: [] });
  }
  return false;
});
