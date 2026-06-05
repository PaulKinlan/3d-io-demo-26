// Site Generator Demo - Main Script

const statusDot = document.getElementById('status-dot');
const statusText = document.getElementById('status-text');
const urlInput = document.getElementById('url-input');
const goBtn = document.getElementById('go-btn');
const contentFrame = document.getElementById('content-frame');
const loadingOverlay = document.getElementById('loading');
const welcomeScreen = document.getElementById('welcome');
const suggestionBtns = document.querySelectorAll('.suggestion');

let swReady = false;

// Register service worker
async function initServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    setStatus('error', 'Service Workers not supported');
    return;
  }

  try {
    const reg = await navigator.serviceWorker.register('./sw.js', {
      scope: '/demos/site-generator/',
    });

    if (reg.active) {
      onSWReady();
    } else {
      const sw = reg.installing || reg.waiting;
      sw.addEventListener('statechange', () => {
        if (sw.state === 'activated') onSWReady();
      });
    }
  } catch (e) {
    setStatus('error', 'SW registration failed: ' + e.message);
  }
}

function onSWReady() {
  swReady = true;
  checkPromptAPI();
}

async function checkPromptAPI() {
  // Current Chrome exposes the Prompt API as a global `LanguageModel`.
  // Older builds used `self.ai.languageModel` with a different shape.
  const lm = self.LanguageModel || (self.ai && self.ai.languageModel);
  if (!lm) {
    setStatus('error', 'Prompt API not detected - use desktop Chrome 138+');
    return;
  }

  try {
    if (typeof lm.availability === 'function') {
      // New API: 'available' | 'downloadable' | 'downloading' | 'unavailable'
      const status = await lm.availability();
      if (status === 'available') {
        setStatus('ready', 'Ready - Gemini Nano available');
      } else if (status === 'downloadable' || status === 'downloading') {
        // Proactively kick off the download so the model is ready by the time
        // the user navigates, and surface progress in the status bar.
        await ensureModelDownloaded(lm);
      } else {
        setStatus('error', 'Prompt API not available on this device');
      }
    } else {
      // Legacy API: capabilities() -> { available: 'readily' | 'after-download' | 'no' }
      const capabilities = await lm.capabilities();
      if (capabilities.available === 'readily') {
        setStatus('ready', 'Ready - Gemini Nano available');
      } else if (capabilities.available === 'after-download') {
        setStatus('loading', 'Downloading Gemini Nano model...');
      } else {
        setStatus('error', 'Prompt API not available on this device');
      }
    }
  } catch (e) {
    setStatus('error', 'Could not check Prompt API: ' + e.message);
  }
}

// Trigger (or attach to) the Gemini Nano download. The model is shared across
// the origin, so warming it up here means the service worker can use it
// immediately. Progress is reported live via the `downloadprogress` event.
async function ensureModelDownloaded(lm) {
  setStatus('loading', 'Starting Gemini Nano download...');
  try {
    const session = await lm.create({
      // Declaring the output language silences Chrome's "no output language"
      // warning and improves output quality.
      expectedOutputs: [{ type: 'text', languages: ['en'] }],
      monitor(m) {
        m.addEventListener('downloadprogress', (e) => {
          const pct = Math.round(e.loaded * 100);
          setStatus('loading', `Downloading Gemini Nano... ${pct}%`);
        });
      },
    });
    // This warm-up session is only needed to drive the download; release it.
    session.destroy?.();
    setStatus('ready', 'Ready - Gemini Nano downloaded');
  } catch (e) {
    setStatus('error', 'Model download failed: ' + e.message);
  }
}

function setStatus(state, message) {
  statusDot.className = 'status-dot ' + state;
  statusText.textContent = message;
}

function showLoading(show) {
  loadingOverlay.classList.toggle('visible', show);
}

async function navigateTo(url) {
  if (!url) return;

  // Wait for service worker to be ready before navigating
  if (!swReady) {
    setStatus('loading', 'Waiting for service worker...');
    await navigator.serviceWorker.ready;
    swReady = true;
  }

  // Normalize URL
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    if (url.includes('.') && !url.includes(' ')) {
      url = 'https://' + url;
    } else {
      // Treat as search query - generate a search results page
      url = 'https://www.google.com/search?q=' + encodeURIComponent(url);
    }
  }

  urlInput.value = url;
  welcomeScreen.style.display = 'none';
  contentFrame.style.display = 'block';
  showLoading(true);
  setStatus('loading', 'Generating page...');

  const browsePath = '/demos/site-generator/browse/' + encodeURIComponent(url);
  contentFrame.src = browsePath;
}

contentFrame.addEventListener('load', () => {
  showLoading(false);
  if (swReady) {
    setStatus('ready', 'Page generated');
  }
});

// Handle URL input
urlInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    navigateTo(urlInput.value.trim());
  }
});

goBtn.addEventListener('click', () => {
  navigateTo(urlInput.value.trim());
});

// Handle suggestion clicks
suggestionBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    const url = btn.dataset.url;
    navigateTo(url);
  });
});

// Init
initServiceWorker();
