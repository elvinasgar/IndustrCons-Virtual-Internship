(async function () {
  console.log('IndustrCons microsim.js v1 loaded');
  await IC.i18n.init();
  const params = new URLSearchParams(window.location.search);
  const msId = params.get('id') || '';
  const content = document.getElementById('flowContent');
  const progressEl = document.getElementById('msProgress');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');

  let data;
  try {
    data = await fetch(`data/microsims/${msId}.json`).then(r => {
      if (!r.ok) throw new Error('404');
      return r.json();
    });
  } catch (e) {
    content.innerHTML = `<h3>Simulation not found</h3><p>This micro simulation may not be published yet.</p><a class="btn btn-primary" href="microsims.html">Browse Micro Simulations</a>`;
    prevBtn.style.display = 'none'; nextBtn.style.display = 'none';
    return;
  }

  document.title = `${data.title} — IndustrCons IRE-3`;
  document.getElementById('crumbTitle').textContent = data.title;

  // Dynamic SEO
  (function seo() {
    const BASE = 'https://elvinasgar.github.io/IndustrCons-Virtual-Internship';
    const url = `${BASE}/microsim-detail.html?id=${msId}`;
    const desc = `${data.title} — a ${data.durationMinutes}-minute micro simulation. ${data.scenario.brief}`;
    let d = document.querySelector('meta[name="description"]');
    if (d) d.setAttribute('content', desc);
    let c = document.querySelector('link[rel="canonical"]'); if (c) c.setAttribute('href', url);
    const s = document.createElement('script'); s.type = 'application/ld+json';
    s.textContent = JSON.stringify({
      "@context": "https://schema.org", "@type": "LearningResource",
      "name": data.title, "description": desc, "url": url,
      "learningResourceType": "Micro Simulation", "timeRequired": `PT${data.durationMinutes}M`,
      "educationalLevel": data.difficulty, "isPartOf": { "@type": "EducationalOrganization", "name": "IndustrCons" }
    });
    document.head.appendChild(s);
  })();

  // steps: 0 = scenario intro, 1..N = tasks, N+1 = outcome
  const totalSteps = data.steps.length + 2;
  let step = 0;
  let earnedXp = 0;
  const answers = {};

  IC.store.startInternship(msId); // reuse the generic progress engine — a microsim is just a very short internship record

  function renderProgress() {
    progressEl.innerHTML = '';
    for (let i = 0; i < totalSteps; i++) {
      const dot = document.createElement('div');
      dot.className = 'dot' + (i < step ? ' done' : i === step ? ' active' : '');
      progressEl.appendChild(dot);
    }
  }

  function gate(open) { nextBtn.disabled = !open; }

  function feedbackPanel(t, correct) {
    return `
      <div class="card" style="margin-top:18px; padding:18px; background:${correct ? 'color-mix(in srgb, var(--success) 8%, var(--surface))' : 'color-mix(in srgb, var(--danger) 6%, var(--surface))'}; border-color:${correct ? 'var(--success)' : 'var(--danger)'};">
        <p style="margin:0 0 8px; font-weight:700;">${correct ? '✅ Correct' : '↺ Not quite — here\'s the reasoning either way'}</p>
        <p style="margin:0 0 8px;"><strong>Reasoning:</strong> ${t.reasoning}</p>
        <p style="margin:0 0 8px;"><strong>Tip:</strong> ${t.tip}</p>
        <p style="margin:0 0 8px;"><strong>Common mistake:</strong> ${t.mistake}</p>
        <p style="margin:0;"><strong>Recommendation:</strong> ${t.recommendation}</p>
      </div>`;
  }

  function renderScenario() {
    gate(true);
    content.innerHTML = `
      <span class="eyebrow">${data.category} · ${data.durationMinutes} min · ${data.difficulty}</span>
      <h2 style="margin-top:10px;">${data.title}</h2>
      <p><strong>Setting:</strong> ${data.scenario.setting}</p>
      <p>${data.scenario.brief}</p>
      ${data.scenario.context ? `<div class="card" style="margin-top:14px; padding:16px; background:var(--surface-2);"><p style="margin:0;">${data.scenario.context}</p></div>` : ''}
      <div class="flex gap-2" style="flex-wrap:wrap; margin-top:16px;">
        ${(data.skills || []).map(s => `<span class="chip">${s}</span>`).join('')}
      </div>`;
  }

  function renderTask(idx) {
    const t = data.steps[idx];
    const prog = IC.store.getInternshipProgress(msId);
    const alreadyDone = !!prog.tasksDone[t.id];
    gate(alreadyDone);

    let inputHtml = '';
    if (t.type === 'mcq') {
      inputHtml = t.options.map((opt, i) => `
        <label class="field" style="flex-direction:row; align-items:center; gap:10px; border:1px solid var(--line); border-radius:9px; padding:12px 14px; margin-bottom:8px; cursor:pointer;">
          <input type="radio" name="mcq" value="${i}"> <span>${opt}</span>
        </label>`).join('');
    } else if (t.type === 'multiselect') {
      inputHtml = t.options.map((opt, i) => `
        <label class="field" style="flex-direction:row; align-items:center; gap:10px; border:1px solid var(--line); border-radius:9px; padding:12px 14px; margin-bottom:8px; cursor:pointer;">
          <input type="checkbox" name="ms" value="${i}"> <span>${opt}</span>
        </label>`).join('');
    } else if (t.type === 'numeric') {
      inputHtml = `<div class="field"><label>Your answer (${t.unit})</label><input type="number" step="0.01" id="numericInput"></div>`;
    } else if (t.type === 'text') {
      inputHtml = `<div class="field"><label>Your response</label><textarea id="textInput" rows="4"></textarea></div>`;
    }

    content.innerHTML = `
      <span class="drawing-tag">Sprint ${idx + 1}/${data.steps.length}</span>
      <h3 style="margin-top:12px;">${t.title}</h3>
      <p>${t.prompt}</p>
      <form id="taskForm">${inputHtml}</form>
      <button class="btn btn-primary" id="submitTaskBtn" ${alreadyDone ? 'disabled' : ''}>${alreadyDone ? '✓ Submitted' : IC.i18n.t('flow.submit') || 'Submit'}</button>
      <div id="taskFeedback"></div>
    `;

    if (alreadyDone) {
      document.getElementById('taskFeedback').innerHTML = feedbackPanel(t, true);
    }

    document.getElementById('submitTaskBtn').addEventListener('click', (e) => {
      e.preventDefault();
      if (alreadyDone) return;
      let correct = true;
      if (t.type === 'mcq') {
        const sel = content.querySelector('input[name="mcq"]:checked');
        if (!sel) { IC.toast('Select an answer first.'); return; }
        correct = parseInt(sel.value) === t.correctIndex;
      } else if (t.type === 'multiselect') {
        const sel = [...content.querySelectorAll('input[name="ms"]:checked')].map(i => parseInt(i.value)).sort();
        const want = [...t.correctIndices].sort();
        correct = JSON.stringify(sel) === JSON.stringify(want);
      } else if (t.type === 'numeric') {
        const val = parseFloat(document.getElementById('numericInput').value);
        if (isNaN(val)) { IC.toast('Enter a number first.'); return; }
        correct = Math.abs(val - t.answer) <= (t.tolerance || 0.001);
      } else if (t.type === 'text') {
        const val = document.getElementById('textInput').value.trim();
        if (val.length < (t.minLength || 20)) { IC.toast(`Write at least ${t.minLength || 20} characters.`); return; }
        correct = true;
      }
      IC.store.completeTask(msId, t.id, t.xp);
      earnedXp += t.xp;
      IC.toast(`<b>+${t.xp} XP</b>`);
      document.getElementById('taskFeedback').innerHTML = feedbackPanel(t, correct) +
        (t.type === 'text' && t.modelAnswer ? `<div class="card" style="margin-top:12px; padding:16px;"><strong>Model answer for comparison:</strong><p style="margin:6px 0 0;">${t.modelAnswer}</p></div>` : '');
      document.getElementById('submitTaskBtn').disabled = true;
      document.getElementById('submitTaskBtn').textContent = '✓ Submitted';
      gate(true);
    });
  }

  function renderOutcome() {
    gate(true);
    const prog = IC.store.getInternshipProgress(msId);
    const totalXp = data.steps.reduce((s, t) => s + t.xp, 0);
    const gotAllXp = Object.keys(prog.tasksDone).length >= data.steps.length;
    if (gotAllXp && prog.status !== 'completed') {
      IC.store.completeInternship(msId, null);
    }
    const lang = IC.i18n.getLang ? IC.i18n.getLang() : 'en';
    const caption = lang === 'az'
      ? `⚡ İndicə "${data.title}" — ${data.durationMinutes} dəqiqəlik IndustrCons mikro-simulyasiyasını tamamladım. ${(data.skills||[]).join(', ')} bacarıqlarını məşq etdim.\n\n#IndustrCons #SənayeyəHazırMühəndis\nhttps://elvinasgar.github.io/IndustrCons-Virtual-Internship/`
      : `⚡ Just completed "${data.title}" — a ${data.durationMinutes}-minute IndustrCons micro simulation. Practiced: ${(data.skills||[]).join(', ')}.\n\n#IndustrCons #IndustryReadyEngineer\nhttps://elvinasgar.github.io/IndustrCons-Virtual-Internship/`;

    content.innerHTML = `
      <div class="text-center">
        <div style="font-size:2.4rem;">⚡</div>
        <h2 style="margin:10px 0 6px;">Sprint complete</h2>
        <p>You earned <strong>${totalXp} XP</strong> in ${data.durationMinutes} minutes.</p>
      </div>
      <div class="card" style="margin-top:18px; padding:18px; background:var(--surface-2);">
        <h4 style="margin-top:0;">Reflection</h4>
        <p style="margin:0;">${data.outcome.reflectionPrompt}</p>
      </div>
      <div class="card" style="margin-top:14px; padding:18px;">
        <h4 style="margin-top:0;">Ready-to-post update</h4>
        <textarea readonly rows="5" style="width:100%; font-family:var(--font-body); padding:10px; border-radius:9px; border:1px solid var(--line);">${caption}</textarea>
        <button class="btn btn-ghost btn-sm" style="margin-top:8px;" id="copyMsCaption">Copy text</button>
      </div>
      <div class="flex gap-2" style="flex-wrap:wrap; margin-top:20px;">
        <a class="btn btn-primary" href="microsims.html">More sprints</a>
        <a class="btn btn-ghost" href="internships.html">Full internships</a>
        <a class="btn btn-ghost" href="dashboard.html">My dashboard</a>
      </div>
    `;
    document.getElementById('copyMsCaption').addEventListener('click', () => {
      navigator.clipboard.writeText(caption).then(() => IC.toast('Copied.'));
    });
  }

  function render() {
    renderProgress();
    if (step === 0) renderScenario();
    else if (step <= data.steps.length) renderTask(step - 1);
    else renderOutcome();
    prevBtn.style.visibility = step === 0 ? 'hidden' : 'visible';
    nextBtn.textContent = step >= totalSteps - 1 ? 'Finish' : (step === 0 ? 'Start sprint →' : 'Continue →');
  }

  prevBtn.addEventListener('click', () => { if (step > 0) { step--; render(); } });
  nextBtn.addEventListener('click', () => {
    if (step < totalSteps - 1) { step++; render(); }
    else { window.location.href = 'microsims.html'; }
  });

  render();
})();
