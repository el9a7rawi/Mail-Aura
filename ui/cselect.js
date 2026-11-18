/**
 * Custom select.
 *
 * The native <select> stays in the DOM as the single source of truth (form
 * semantics, value, change events) and is visually replaced by a listbox that
 * matches the design instead of the operating system's menu.
 */

function buildOptions(native, button, menu) {
  menu.replaceChildren();
  Array.from(native.options).forEach((option, index) => {
    const item = document.createElement('li');
    item.className = 'cselect-option';
    item.setAttribute('role', 'option');
    item.dataset.value = option.value;
    item.dataset.index = String(index);
    item.id = `${native.id}-option-${index}`;
    item.tabIndex = -1;

    const label = document.createElement('span');
    label.className = 'cselect-opt-label';
    label.textContent = option.textContent;

    const check = document.createElement('span');
    check.className = 'cselect-check';
    check.textContent = '✓';
    check.setAttribute('aria-hidden', 'true');

    item.append(label, check);
    item.addEventListener('click', () => {
      native.value = option.value;
      native.dispatchEvent(new Event('change', { bubbles: true }));
      syncCustomSelects();
      closeAllMenus();
      button.focus();
    });
    menu.appendChild(item);
  });
}

export function enhanceCustomSelects() {
  document.querySelectorAll('.cselect').forEach((wrap) => {
    const native = document.getElementById(wrap.dataset.select);
    const button = wrap.querySelector('.cselect-btn');
    const menu = wrap.querySelector('.cselect-menu');
    if (!native || !button || !menu) return;

    menu.id = `${native.id}-options`;
    button.setAttribute('aria-controls', menu.id);
    buildOptions(native, button, menu);

    button.addEventListener('click', (event) => {
      event.stopPropagation();
      const isOpen = !menu.hidden;
      closeAllMenus();
      if (isOpen) return;
      menu.hidden = false;
      wrap.classList.add('open');
      button.setAttribute('aria-expanded', 'true');
      highlightCurrent(wrap, button);
    });

    button.addEventListener('keydown', (event) => {
      const items = Array.from(menu.querySelectorAll('.cselect-option'));
      let highlighted = items.findIndex((item) => item.classList.contains('highlight'));

      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        if (menu.hidden) {
          button.click();
          return;
        }
        highlighted = event.key === 'ArrowDown'
          ? Math.min(items.length - 1, highlighted + 1)
          : Math.max(0, highlighted - 1);
        items.forEach((item) => item.classList.remove('highlight'));
        items[highlighted]?.classList.add('highlight');
        if (items[highlighted]?.id) button.setAttribute('aria-activedescendant', items[highlighted].id);
        items[highlighted]?.scrollIntoView({ block: 'nearest' });
      } else if (event.key === 'Enter' || event.key === ' ') {
        if (!menu.hidden && highlighted >= 0) {
          event.preventDefault();
          items[highlighted].click();
        }
      }
    });
  });
}

/** Rebuilds option labels after a locale switch without duplicating listeners. */
export function refreshCustomSelects() {
  document.querySelectorAll('.cselect').forEach((wrap) => {
    const native = document.getElementById(wrap.dataset.select);
    const button = wrap.querySelector('.cselect-btn');
    const menu = wrap.querySelector('.cselect-menu');
    if (native && button && menu) buildOptions(native, button, menu);
  });
  syncCustomSelects();
}

export function syncCustomSelects() {
  document.querySelectorAll('.cselect').forEach((wrap) => {
    const native = document.getElementById(wrap.dataset.select);
    const label = wrap.querySelector('.cselect-value');
    const menu = wrap.querySelector('.cselect-menu');
    if (!native || !menu) return;

    const current = Array.from(native.options).find((option) => option.value === native.value);
    if (label && current) label.textContent = current.textContent;
    menu.querySelectorAll('.cselect-option').forEach((item) => {
      item.setAttribute('aria-selected', item.dataset.value === native.value ? 'true' : 'false');
    });
  });
}

export function closeAllMenus() {
  document.querySelectorAll('.cselect').forEach((wrap) => {
    wrap.classList.remove('open');
    const button = wrap.querySelector('.cselect-btn');
    button?.setAttribute('aria-expanded', 'false');
    button?.removeAttribute('aria-activedescendant');
    const menu = wrap.querySelector('.cselect-menu');
    if (menu) menu.hidden = true;
  });
}

function highlightCurrent(wrap, button) {
  const native = document.getElementById(wrap.dataset.select);
  if (!native) return;
  wrap.querySelectorAll('.cselect-option').forEach((item) => {
    item.classList.remove('highlight');
    if (item.dataset.value === native.value) {
      item.classList.add('highlight');
      button?.setAttribute('aria-activedescendant', item.id);
    }
  });
}
