/**
 * Turns a staged Chromium extension into a Firefox package.
 *
 * Firefox has no service-worker background and no sidePanel API, and its
 * extension policies differ from the Chrome Web Store's. Everything that
 * differs is applied here so the shipped JS has no dead Chrome-only branches.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const stage = process.argv[2];
if (!stage) throw new Error('usage: node .github/firefox-transform.mjs <stage-dir>');
const at = (file) => join(stage, file);

const manifest = JSON.parse(readFileSync(at('manifest.json'), 'utf8'));
delete manifest.minimum_chrome_version;
manifest.background = { scripts: ['background.js'], type: 'module' };
manifest.permissions = manifest.permissions.filter((p) => p !== 'sidePanel');
delete manifest.side_panel;
manifest.sidebar_action = {
  default_panel: 'sidepanel.html',
  default_title: 'Mail Aura',
  default_icon: manifest.action.default_icon
};
manifest.browser_specific_settings = {
  gecko: {
    id: 'mail-aura@el9a7rawi',
    strict_min_version: '140.0',
    data_collection_permissions: {
      required: ['personallyIdentifyingInfo', 'websiteContent']
    }
  },
  gecko_android: { strict_min_version: '142.0' }
};
writeFileSync(at('manifest.json'), JSON.stringify(manifest, null, 2) + '\n');

function replaceOnce(file, from, to) {
  const source = readFileSync(at(file), 'utf8');
  if (!source.includes(from)) throw new Error(`${file}: expected block not found`);
  writeFileSync(at(file), source.replace(from, to));
}

replaceOnce(
  'background.js',
  `function openResultSurface(tab) {
  try {
    if (chrome.sidePanel?.open && tab?.id) {
      void chrome.sidePanel.open({ tabId: tab.id }).catch(() => openFallbackSurface());
      return;
    }
    if (chrome.sidebarAction?.open) {
      void chrome.sidebarAction.open().catch(() => openFallbackSurface());
      return;
    }
    if (chrome.action?.openPopup) {
      void chrome.action.openPopup().catch(() => openFallbackSurface());
      return;
    }
  } catch {
    // An unavailable API in this browser; use the tab fallback below.
  }
  openFallbackSurface();
}`,
  `function openResultSurface() {
  try {
    void chrome.sidebarAction.open().catch(() => openFallbackSurface());
  } catch {
    openFallbackSurface();
  }
}`
);

replaceOnce(
  'ui.js',
  `function openSidePanel() {
  try {
    // open() must be called synchronously from the click: an await here loses
    // the user gesture and the call is rejected by both browsers.
    if (chrome.sidePanel?.open && currentWindowId !== null) {
      void chrome.sidePanel.open({ windowId: currentWindowId }).catch(() => openPanelFallback());
    } else if (chrome.sidebarAction?.open) {
      // Firefox exposes the same surface as sidebarAction instead of sidePanel.
      void chrome.sidebarAction.open().catch(() => openPanelFallback());
    } else {
      openPanelFallback();
    }
    window.close();
  } catch {
    setStatus(t('statusPanelError'), 'error');
  }
}`,
  `function openSidePanel() {
  try {
    void chrome.sidebarAction.open().catch(() => openPanelFallback());
    window.close();
  } catch {
    setStatus(t('statusPanelError'), 'error');
  }
}`
);

let privacy = readFileSync(at('privacy.html'), 'utf8');
privacy = privacy.replace(
  '<li><strong>sidePanel.</strong> Opens the wider results view for long lists.</li>',
  '<li><strong>sidebar_action.</strong> Opens the wider results view for long lists.</li>'
).replace(
  'Chrome Web Store User Data Policy, including the Limited Use requirements.',
  "Mozilla's Add-on Policies and privacy requirements."
);
if (privacy.includes('sidePanel.') || privacy.includes('Chrome Web Store')) {
  throw new Error('privacy.html still describes Chromium-only surfaces');
}
writeFileSync(at('privacy.html'), privacy);

const finalManifest = JSON.parse(readFileSync(at('manifest.json'), 'utf8'));
const ok = finalManifest.background.scripts?.includes('background.js') &&
  !finalManifest.background.service_worker &&
  finalManifest.sidebar_action?.default_panel === 'sidepanel.html' &&
  !finalManifest.permissions.includes('sidePanel') &&
  finalManifest.browser_specific_settings.gecko.strict_min_version === '140.0' &&
  !readFileSync(at('background.js'), 'utf8').includes('chrome.sidePanel') &&
  !readFileSync(at('ui.js'), 'utf8').includes('chrome.sidePanel');
if (!ok) throw new Error('Firefox transform verification failed');
console.log('Firefox transform OK');
