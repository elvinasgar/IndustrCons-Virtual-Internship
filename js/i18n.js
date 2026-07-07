window.IC = window.IC || {};

IC.i18n = (function () {
  const SUPPORTED = ['en', 'az'];
  const STORAGE_KEY = 'ic_lang';
  let dict = {};
  let currentLang = 'en';
  const listeners = [];

  function resolveBasePath() {
    const path = window.location.pathname;
    return path.includes('/pages/') ? '../lang/' : 'lang/';
  }

  function getByPath(obj, path) {
    return path.split('.').reduce((o, k) => (o && o[k] !== undefined ? o[k] : undefined), obj);
  }

  async function loadLang(lang) {
    const base = resolveBasePath();
    const res = await fetch(`${base}${lang}.json`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Could not load language file: ${lang}`);
    return res.json();
  }

  function applyToDom() {
    document.documentElement.setAttribute('lang', currentLang);
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const val = getByPath(dict, el.getAttribute('data-i18n'));
      if (val !== undefined) el.textContent = val;
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const val = getByPath(dict, el.getAttribute('data-i18n-placeholder'));
      if (val !== undefined) el.setAttribute('placeholder', val);
    });
    document.querySelectorAll('[data-i18n-alt]').forEach(el => {
      const val = getByPath(dict, el.getAttribute('data-i18n-alt'));
      if (val !== undefined) el.setAttribute('alt', val);
    });
    document.querySelectorAll('[data-i18n-aria-label]').forEach(el => {
      const val = getByPath(dict, el.getAttribute('data-i18n-aria-label'));
      if (val !== undefined) el.setAttribute('aria-label', val);
    });
    document.querySelectorAll('.lang-switch button').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === currentLang);
    });
    listeners.forEach(fn => { try { fn(currentLang); } catch (e) { console.error(e); } });
  }

  async function setLanguage(lang) {
    if (!SUPPORTED.includes(lang)) lang = 'en';
    currentLang = lang;
    localStorage.setItem(STORAGE_KEY, lang);
    dict = await loadLang(lang);
    applyToDom();
  }

  async function init() {
    const saved = localStorage.getItem(STORAGE_KEY);
    const browserLang = (navigator.language || 'en').slice(0, 2);
    const initial = saved || (SUPPORTED.includes(browserLang) ? browserLang : 'en');
    await setLanguage(initial);
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-lang]');
      if (btn) setLanguage(btn.dataset.lang);
    });
  }

  function t(path) {
    const val = getByPath(dict, path);
    return val !== undefined ? val : path;
  }

  function onChange(fn) { listeners.push(fn); }
  function getLang() { return currentLang; }

  return { init, setLanguage, t, onChange, getLang, applyToDom };
})();
