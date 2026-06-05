/*
 * Behaviour for the injected browser chrome (see frame.css / frame.html).
 *
 * Unlike the old `/demos/browser/` wrapper, there is NO inner iframe. The chrome
 * lives in the same document as the demo, so navigation is *real* page
 * navigation: typing a path and pressing Enter loads that demo (which carries
 * its own injected chrome), and Back/Forward use the real session history.
 *
 * Injected as a module at the end of <body> by `demos/_frame/wrap.js`.
 */
(() => {
  const root = document.getElementById('browser-chrome');
  if (!root) return;

  const q = (sel) => root.querySelector(sel);
  const urlInput = q('[data-bf="url-input"]');
  const urlPrefix = q('[data-bf="url-prefix"]');
  const addressText = q('[data-bf="address-text"]');
  const tabTitle = q('.bf-tab-title');
  const favicon = q('.bf-favicon');

  const GLOBE = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23e0e0e0' rx='50'/><path d='M50 10 C25 10 10 30 10 50 C10 70 25 90 50 90 C75 90 90 70 90 50 C90 30 75 10 50 10 Z' fill='none' stroke='%23888' stroke-width='6'/><path d='M20 50 L80 50' stroke='%23888' stroke-width='4'/><path d='M50 10 C35 30 35 70 50 90 C65 70 65 30 50 10' fill='none' stroke='%23888' stroke-width='4'/></svg>";
  const GULL = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23ffcc00' rx='20'/><circle cx='50' cy='50' r='20' fill='%23fff'/></svg>";

  // Resolve whatever the user typed into a same-origin path or external URL.
  function resolveInput(value) {
    const raw = value.trim();
    if (!raw) return null;
    if (/^https?:\/\//i.test(raw)) return raw;
    return raw.startsWith('/') ? raw : '/' + raw;
  }

  function syncToLocation() {
    const path = location.pathname + location.search + location.hash;
    urlPrefix.textContent = location.origin;
    urlInput.value = path;
    const title = document.title || path;
    tabTitle.textContent = title;
    favicon.src = path.includes('flappy-bird') ? GULL : GLOBE;
  }

  function navigate(value) {
    const target = resolveInput(value);
    if (target) location.assign(target);
  }

  addressText.addEventListener('click', () => urlInput.focus());
  urlInput.addEventListener('focus', () => urlInput.select());
  urlInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      navigate(urlInput.value);
      urlInput.blur();
    }
  });

  root.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-bf]');
    if (!btn) return;
    switch (btn.dataset.bf) {
      case 'back': history.back(); break;
      case 'forward': history.forward(); break;
      case 'refresh': location.reload(); break;
      case 'home': location.assign('/demos/new-tab/'); break;
    }
  });

  syncToLocation();
})();
