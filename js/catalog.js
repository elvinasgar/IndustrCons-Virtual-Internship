(async function () {
  let ALL = [];
  const grid = document.getElementById('catalogGrid');
  const emptyState = document.getElementById('emptyState');
  const resultsCount = document.getElementById('resultsCount');
  const searchInput = document.getElementById('searchInput');
  const categoryFilter = document.getElementById('categoryFilter');
  const difficultyFilter = document.getElementById('difficultyFilter');
  const durationFilter = document.getElementById('durationFilter');
  const clearBtn = document.getElementById('clearFiltersBtn');

  function cardHtml(it) {
    const href = it.playable ? `internship-detail.html?id=${it.id}` : `internships.html#${it.id}`;
    const soon = it.playable ? '' : `<span class="badge badge-outline" style="position:absolute; top:12px; right:12px;">Preview</span>`;
    return `
    <a href="${href}" class="card card-hover internship-card reveal is-visible" data-id="${it.id}" style="position:relative;">
      ${soon}
      <div class="thumb"><span class="drawing-tag">${it.category}</span></div>
      <div class="body">
        <div class="flex between"><h4 style="margin:0;">${it.title}</h4><span class="badge badge-blue">${it.difficulty}</span></div>
        <p style="font-size:.86rem; margin:0;">${it.company} — ${it.summary}</p>
        <div class="meta">
          <span>⏱ ${it.durationHours} <span data-i18n="catalog.hours">hrs</span></span>
          <span>✅ ${it.taskCount} <span data-i18n="catalog.tasks">tasks</span></span>
          ${it.certificate ? '<span>🏅 Certificate</span>' : ''}
        </div>
        <div class="skills">${it.skills.map(s => `<span class="chip">${s}</span>`).join('')}</div>
      </div>
    </a>`;
  }

  function render(list) {
    grid.innerHTML = list.map(cardHtml).join('');
    emptyState.hidden = list.length > 0;
    resultsCount.textContent = `${list.length} internship${list.length === 1 ? '' : 's'}`;
  }

  function applyFilters() {
    const q = searchInput.value.trim().toLowerCase();
    const cat = categoryFilter.value;
    const diff = difficultyFilter.value;
    const dur = durationFilter.value;

    const filtered = ALL.filter(it => {
      if (cat && it.category !== cat) return false;
      if (diff && it.difficulty !== diff) return false;
      if (dur === 'short' && it.durationHours >= 7) return false;
      if (dur === 'long' && it.durationHours < 7) return false;
      if (q) {
        const hay = [it.title, it.company, it.category, it.summary, ...it.skills].join(' ').toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    render(filtered);
  }

  try {
    const res = await fetch('data/internships/index.json', { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status} for data/internships/index.json`);
    ALL = await res.json();
  } catch (e) {
    console.error('Catalog load failed:', e);
    const detail = /HTTP \d+/.test(e.message)
      ? `Server responded with an error (${e.message.replace('HTTP ', '')}). The file "data/internships/index.json" is likely missing from the deployed site — check that the data/ folder was committed and pushed to the repo.`
      : (location.protocol === 'file:'
          ? `You're viewing this file directly from disk. Serve the folder over http:// instead (e.g. "python3 -m http.server"), since fetch() of local JSON is blocked on file://.`
          : `The response wasn't valid JSON. Open the file in the browser directly to see what's actually being returned (redirects, HTML error pages, etc. all break JSON parsing).`);
    grid.innerHTML = `<p style="color:#dc2626;">Could not load the internship catalog. ${detail}</p>`;
    return;
  }

  const categories = [...new Set(ALL.map(i => i.category))].sort();
  categories.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c; opt.textContent = c;
    categoryFilter.appendChild(opt);
  });

  [searchInput, categoryFilter, difficultyFilter, durationFilter].forEach(el =>
    el.addEventListener('input', applyFilters)
  );
  clearBtn.addEventListener('click', () => {
    searchInput.value = ''; categoryFilter.value = ''; difficultyFilter.value = ''; durationFilter.value = '';
    applyFilters();
  });

  render(ALL);
})();
