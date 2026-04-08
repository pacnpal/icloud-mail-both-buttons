// ==UserScript==
// @name         iCloud Mail - Show Archive & Delete Together
// @namespace    https://github.com/pacnpal
// @version      2.4.0
// @description  Shows both the Archive and Delete buttons simultaneously in iCloud Mail's toolbar instead of the default either/or behavior.
// @author       Talor (pacnpal)
// @license      MIT
// @homepageURL  https://github.com/pacnpal/icloud-mail-both-buttons
// @supportURL   https://github.com/pacnpal/icloud-mail-both-buttons/issues
// @match        https://www.icloud.com/mail/
// @match        https://www.icloud.com/mail/*
// @match        https://www.icloud.com/applications/mail2/current/en-us/index.html
// @match        https://www.icloud.com/applications/mail2/current/en-us/index.html?*
// @match        https://www.icloud.com/applications/mail2/current/*/index.html
// @match        https://www.icloud.com/applications/mail2/current/*/index.html?*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
  'use strict';

  const INJECTED_ATTR = 'data-injected-companion';
  const LOG_PREFIX = '[iCloud Mail Both Buttons]';
  const DEBOUNCE_MS = 250;
  const INIT_DELAY_MS = 2000;
  const POLL_INTERVAL_MS = 2000;
  const POLL_MAX = 30;

  const ICONS = {
    delete: `<svg viewBox="0 0 267.9298095703125 158.0849609375" version="1.1" xmlns="http://www.w3.org/2000/svg" class="ic-1afv5je layout-box"><g transform="matrix(1 0 0 1 79.23996826171879 114.2724609375)"><path d="M41.2042-1.20658C43.2875-1.20658 44.6028-2.51622 44.5491-4.43149L43.0559-55.5903C43.0022-57.5387 41.6405-58.7774 39.6802-58.7774C37.6695-58.7774 36.3124-57.4953 36.3661-55.5628L37.8593-4.40233C37.913-2.45392 39.2575-1.20658 41.2042-1.20658ZM55.5951-1.20658C57.639-1.20658 59.0166-2.48707 59.0166-4.40065L59.0166-55.5834C59.0166-57.4969 57.639-58.7774 55.5951-58.7774C53.5599-58.7774 52.1737-57.4969 52.1737-55.5834L52.1737-4.40065C52.1737-2.48707 53.5599-1.20658 55.5951-1.20658ZM70.0209-1.18938C71.9328-1.18938 73.3207-2.44532 73.3744-4.39373L74.8242-55.5542C74.8779-57.4867 73.5557-58.7688 71.5101-58.7688C69.5412-58.7688 68.1795-57.4867 68.1258-55.5817L66.676-4.42289C66.6223-2.50762 67.9462-1.18938 70.0209-1.18938ZM33.4375-72.3612L42.4385-72.3612L42.4385-82.4667C42.4385-85.0307 44.203-86.6431 46.9237-86.6431L64.2146-86.6431C66.9004-86.6431 68.6649-85.0307 68.6649-82.4667L68.6649-72.3612L77.7094-72.3612L77.7094-82.9421C77.7094-90.3838 72.9315-94.8217 64.8269-94.8217L46.2679-94.8217C38.2154-94.8217 33.4375-90.3838 33.4375-82.9421ZM11.7686-67.0693L99.4217-67.0693C101.853-67.0693 103.705-68.9325 103.705-71.355C103.705-73.7741 101.801-75.6201 99.4217-75.6201L11.7686-75.6201C9.43294-75.6201 7.47656-73.7655 7.47656-71.355C7.47656-68.9239 9.43294-67.0693 11.7686-67.0693ZM33.1927 15.3156L78.041 15.3156C85.5137 15.3156 90.3776 10.7705 90.7445 3.26125L94.074-67.9797L85.0345-67.9797L81.8314 1.82353C81.6982 4.75101 79.7889 6.70302 76.9904 6.70302L34.1392 6.70302C31.4362 6.70302 29.4835 4.70758 29.3503 1.82353L26.0083-67.9711L17.1163-67.9711L20.4978 3.30468C20.8647 10.8139 25.6332 15.3156 33.1927 15.3156Z"></path></g></svg>`,

    archive: `<svg viewBox="0 0 267.9298095703125 158.0849609375" version="1.1" xmlns="http://www.w3.org/2000/svg" class="ic-1afv5je layout-box"><g transform="matrix(1 0 0 1 72.70493896484368 114.2724609375)"><path d="M35.2039 10.3864L88.7543 10.3864C98.7567 10.3864 104.242 5.01396 104.242-4.9713L104.242-56.6484L94.6815-56.6484L94.6815-5.15727C94.6815-0.970041 92.4109 1.21653 88.3426 1.21653L35.607 1.21653C31.5043 1.21653 29.2246-0.970041 29.2246-5.15727L29.2246-56.6484L19.6726-56.6484L19.6726-4.9713C19.6726 5.03116 25.1494 10.3864 35.2039 10.3864ZM46.2423-32.0429L77.7696-32.0429C80.0383-32.0429 81.7229-33.7097 81.7229-36.0756L81.7229-37.6439C81.7229-40.0184 80.0486-41.6316 77.7696-41.6316L46.2423-41.6316C43.9113-41.6316 42.2805-40.0184 42.2805-37.6439L42.2805-36.0756C42.2805-33.7097 43.9215-32.0429 46.2423-32.0429ZM22.9095-51.986L101.05-51.986C107.686-51.986 111.489-56.2434 111.489-62.8163L111.489-69.9355C111.489-76.5084 107.686-80.7658 101.05-80.7658L22.9095-80.7658C16.5537-80.7658 12.4609-76.5084 12.4609-69.9355L12.4609-62.8163C12.4609-56.2434 16.2931-51.986 22.9095-51.986ZM24.8001-60.763C22.5482-60.763 21.5694-61.7848 21.5694-64.0366L21.5694-68.6804C21.5694-70.9322 22.5482-71.9454 24.8001-71.9454L99.193-71.9454C101.445-71.9454 102.345-70.9322 102.345-68.6804L102.345-64.0366C102.345-61.7848 101.445-60.763 99.193-60.763Z"></path></g></svg>`,
  };

  function log(...args) {
    console.log(LOG_PREFIX, ...args);
  }

  function findToolbarButtons() {
    const results = { delete: null, archive: null, injectedDelete: null, injectedArchive: null };
    const allButtons = document.querySelectorAll('ui-button[role="button"]');

    for (const btn of allButtons) {
      const title = (btn.getAttribute('title') || '').toLowerCase();
      const isInjected = btn.hasAttribute(INJECTED_ATTR);

      if (title === 'delete message') {
        if (isInjected) results.injectedDelete = btn;
        else results.delete = btn;
      } else if (title === 'archive message') {
        if (isInjected) results.injectedArchive = btn;
        else results.archive = btn;
      }
    }
    return results;
  }

  /**
   * Simulate pressing the Delete key on the active element.
   * This is the exact invocation confirmed working in the live console.
   */
  function simulateDelete() {
    document.activeElement.dispatchEvent(new KeyboardEvent('keydown', {
      key: 'Delete',
      code: 'Delete',
      keyCode: 46,
      which: 46,
      bubbles: true,
      cancelable: true,
    }));
    log('Dispatched Delete keydown on activeElement');
  }

  function buildCompanionButton(type) {
    const isDelete = type === 'delete';
    const title = isDelete ? 'Delete Message' : 'Archive Message';
    const icon = isDelete ? ICONS.delete : ICONS.archive;

    const btn = document.createElement('ui-button');
    btn.setAttribute('aria-disabled', 'false');
    btn.setAttribute('class', 'push primary icloud-mouse');
    btn.setAttribute('ontouchstart', 'void(0)');
    btn.setAttribute('title', title);
    btn.setAttribute('role', 'button');
    btn.setAttribute('aria-label', title);
    btn.setAttribute('tabindex', '0');
    btn.setAttribute(INJECTED_ATTR, type);

    const innerBtn = document.createElement('button');
    innerBtn.setAttribute('type', 'button');
    innerBtn.setAttribute('tabindex', '-1');

    const span = document.createElement('span');
    span.setAttribute('class', 'symbols-glyph ic-1t7v4h0');
    span.setAttribute('data-testid', 'symbols-glyph');
    span.innerHTML = icon;

    btn.appendChild(innerBtn);
    btn.appendChild(span);

    // Use mousedown instead of click so focus hasn't shifted to the
    // injected button yet -- activeElement is still the message area.
    btn.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (isDelete) {
        simulateDelete();
      } else {
        const buttons = findToolbarButtons();
        if (buttons.archive) {
          buttons.archive.click();
          log('Clicked native Archive button');
        }
      }
    });

    return btn;
  }

  function inject() {
    const buttons = findToolbarButtons();

    if (!buttons.delete && !buttons.archive) return;
    if (buttons.delete && buttons.archive) return;

    if (buttons.delete && !buttons.injectedArchive) {
      const companion = buildCompanionButton('archive');
      buttons.delete.parentNode.insertBefore(companion, buttons.delete.nextSibling);
      log('Injected Archive button (Delete is native)');
    } else if (buttons.archive && !buttons.injectedDelete) {
      const companion = buildCompanionButton('delete');
      buttons.archive.parentNode.insertBefore(companion, buttons.archive);
      log('Injected Delete button (Archive is native)');
    }
  }

  function cleanup() {
    const injected = document.querySelectorAll(`ui-button[${INJECTED_ATTR}]`);
    for (const btn of injected) {
      if (!btn.isConnected) { btn.remove(); continue; }
      const buttons = findToolbarButtons();
      const myType = btn.getAttribute(INJECTED_ATTR);
      if (myType === 'delete' && !buttons.archive) btn.remove();
      if (myType === 'archive' && !buttons.delete) btn.remove();
    }
  }

  function startObserver() {
    let timer = null;

    const observer = new MutationObserver(() => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => { cleanup(); inject(); }, DEBOUNCE_MS);
    });

    observer.observe(document.body, { childList: true, subtree: true });
    inject();

    let polls = 0;
    const interval = setInterval(() => {
      cleanup(); inject();
      if (++polls >= POLL_MAX) clearInterval(interval);
    }, POLL_INTERVAL_MS);

    log('Observer started');
  }

  if (document.readyState === 'complete') {
    setTimeout(startObserver, INIT_DELAY_MS);
  } else {
    window.addEventListener('load', () => setTimeout(startObserver, INIT_DELAY_MS));
  }

  log('Script loaded at:', window.location.href);
})();