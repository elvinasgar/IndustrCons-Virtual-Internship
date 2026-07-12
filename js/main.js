window.IC = window.IC || {};

/* ---------- Include loader (navbar / sidebar / footer partials) ---------- */
IC.includes = (function () {
  async function inject(selector, url) {
    const el = document.querySelector(selector);
    if (!el) return;
    try {
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) throw new Error(url);
      el.innerHTML = await res.text();
    } catch (e) {
      console.error('Include failed:', url, e);
      el.innerHTML = `<p style="padding:16px;color:#dc2626;">Component failed to load (${url}). If you're opening this file directly, serve it over http:// (e.g. \`python3 -m http.server\`) — fetch() of local partials is blocked on file://.</p>`;
    }
  }

  function markActiveNav() {
    const page = document.body.dataset.page;
    if (!page) return;
    document.querySelectorAll(`[data-nav="${page}"]`).forEach(el => el.classList.add('active'));
  }

  async function all() {
    const tasks = [];
    if (document.querySelector('#navbarInclude')) tasks.push(inject('#navbarInclude', 'components/navbar.html'));
    if (document.querySelector('#sidebarInclude')) tasks.push(inject('#sidebarInclude', 'components/sidebar.html'));
    if (document.querySelector('#ecosystemInclude')) tasks.push(inject('#ecosystemInclude', 'components/ecosystem.html'));
    if (document.querySelector('#footerInclude')) tasks.push(inject('#footerInclude', 'components/footer.html'));
    await Promise.all(tasks);
    markActiveNav();
    const y = document.getElementById('footYear');
    if (y) y.textContent = new Date().getFullYear();
    bindChrome();
    if (window.IC.i18n) await IC.i18n.init();
  }

  function bindChrome() {
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        const cur = document.documentElement.getAttribute('data-theme');
        const next = cur === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('ic_theme', next);
      });
    }
    const mobileToggle = document.getElementById('mobileNavToggle');
    const mobileNav = document.getElementById('mobileNav');
    if (mobileToggle && mobileNav) {
      mobileToggle.addEventListener('click', () => {
        const open = mobileNav.hidden === false;
        mobileNav.hidden = open;
        mobileToggle.setAttribute('aria-expanded', String(!open));
      });
    }
    const sideToggle = document.getElementById('mobileSidebarToggle');
    const sidebar = document.getElementById('appSidebar');
    if (sideToggle && sidebar) {
      sideToggle.addEventListener('click', () => sidebar.classList.toggle('open'));
    }
  }

  return { all };
})();

/* ---------- Theme (applied pre-paint by inline script in <head>, this just syncs icon state) ---------- */
(function initThemeEarly() {
  const saved = localStorage.getItem('ic_theme');
  if (saved) document.documentElement.setAttribute('data-theme', saved);
})();

/* ---------- Scroll reveal ---------- */
IC.reveal = function () {
  const items = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window) || items.length === 0) {
    items.forEach(el => el.classList.add('is-visible'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  items.forEach(el => io.observe(el));
};

/* ---------- Counter animation for stats ---------- */
IC.animateCounters = function () {
  document.querySelectorAll('[data-count-to]').forEach(el => {
    const target = parseFloat(el.dataset.countTo);
    const suffix = el.dataset.countSuffix || '';
    const dur = 1200;
    let start = null;
    function step(ts) {
      if (!start) start = ts;
      const p = Math.min((ts - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(eased * target) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) { requestAnimationFrame(step); io.disconnect(); }
    }, { threshold: 0.4 });
    io.observe(el);
  });
};

/* ---------- Toasts ---------- */
IC.toast = function (message, opts) {
  opts = opts || {};
  let stack = document.querySelector('.toast-stack');
  if (!stack) {
    stack = document.createElement('div');
    stack.className = 'toast-stack';
    document.body.appendChild(stack);
  }
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = message;
  stack.appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity 300ms'; setTimeout(() => el.remove(), 300); }, opts.duration || 3200);
};

document.addEventListener('DOMContentLoaded', async () => {
  await IC.includes.all();
  IC.reveal();
  IC.animateCounters();
});
