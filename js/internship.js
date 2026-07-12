(function () {
  const params = new URLSearchParams(window.location.search);
  const internshipId = params.get('id') || 'site-engineer-atlas';

  const CATEGORY_BADGE = {
    'Site Engineer': 'site_expert',
    'Planning Engineer': 'planner',
    'Estimator': 'estimator',
    'Quantity Surveyor': 'estimator',
    'HSE Engineer': 'safety_champion',
    'QA/QC Engineer': 'qa_master',
    'Project Engineer': 'project_coordinator',
    'Project Manager': 'project_coordinator',
    'Construction Manager': 'construction_leader'
  };

  let data = null;
  let steps = []; // [{key, label, taskIndex?}]
  let current = 0;
  const content = document.getElementById('flowContent');
  const stepperEl = document.getElementById('stepper');
  const nextBtn = document.getElementById('nextStepBtn');
  const backBtn = document.getElementById('backStepBtn');
  let taskAnswered = false; // gate for "Next" on task steps until submitted

  function buildSteps() {
    steps = [
      { key: 'companyIntro', label: 'Company' },
      { key: 'projectBackground', label: 'Project' },
      { key: 'manager', label: 'Manager' },
      { key: 'assignment', label: 'Assignment' },
      { key: 'documents', label: 'Documents' }
    ];
    data.tasks.forEach((t, i) => steps.push({ key: 'task', taskIndex: i, label: `Task ${i + 1}` }));
    steps.push({ key: 'caseStudy', label: 'Case Study' });
    steps.push({ key: 'quiz', label: 'Quiz' });
    steps.push({ key: 'reflection', label: 'Reflection' });
    steps.push({ key: 'feedback', label: 'Summary' });
    steps.push({ key: 'certificate', label: 'Certificate' });
  }

  function ecosystemPanel() {
    return `
      <div class="card" style="margin-top:24px; padding:20px; background:var(--surface-2);">
        <h4 style="margin-top:0;">What's next</h4>
        <div class="grid" style="grid-template-columns:repeat(2,1fr); gap:10px;">
          <a class="btn btn-ghost btn-sm" href="https://industrcons-knowledge-center.vercel.app/" target="_blank" rel="noopener">📚 Continue learning in Knowledge Center</a>
          <a class="btn btn-ghost btn-sm" href="https://industrconsdocs.netlify.app/" target="_blank" rel="noopener">📄 Download related documents</a>
          <a class="btn btn-ghost btn-sm" href="https://industrconsestimator.netlify.app/" target="_blank" rel="noopener">🧮 Open Cost Estimator</a>
          <a class="btn btn-ghost btn-sm" href="https://industrcons-ai.vercel.app/" target="_blank" rel="noopener">🤖 Ask IndustrCons AI</a>
          <a class="btn btn-ghost btn-sm" href="https://elvinasgar.github.io/IndustrCons-Enginering-Map/" target="_blank" rel="noopener">🗺️ Explore Engineering Map</a>
          <a class="btn btn-ghost btn-sm" href="https://elvinasgar.github.io/IndustrCons-Games/" target="_blank" rel="noopener">🎮 Play Engineering Games</a>
          <a class="btn btn-ghost btn-sm" href="https://elvinasgar.github.io/IndustrCons-Engineering-Comics/" target="_blank" rel="noopener">💬 Read Engineering Comics</a>
          <a class="btn btn-ghost btn-sm" href="internships.html">➡ Start another internship</a>
        </div>
      </div>`;
  }

  function learningObjectives() {
    const skillList = (data.skills || []).map(s => `apply <strong>${s}</strong>`).join(', ');
    return `
      <div class="card" style="margin-top:16px; padding:18px; background:var(--surface-2);">
        <h4 style="margin-top:0;">Learning objectives</h4>
        <ul style="margin:0; padding-left:18px;">
          <li>Read and interpret the real-format engineering documents used on this project.</li>
          <li>Complete ${data.tasks.length} graded tasks that ${skillList}.</li>
          <li>Work through a full case study, including a decision with real trade-offs.</li>
          <li>Leave with a verifiable, shareable digital credential.</li>
        </ul>
      </div>`;
  }

  function knowledgeReferencesBox() {
    return `
      <div class="card" style="margin-top:16px; padding:18px;">
        <h4 style="margin-top:0;">Knowledge references &amp; AI assistance</h4>
        <p style="font-size:.9rem; margin:0 0 10px;">Stuck on a concept behind one of these documents? These stay open in a separate tab while you work.</p>
        <div class="flex gap-2" style="flex-wrap:wrap;">
          <a class="btn btn-ghost btn-sm" href="https://industrcons-knowledge-center.vercel.app/" target="_blank" rel="noopener">📚 Knowledge Center</a>
          <a class="btn btn-ghost btn-sm" href="https://industrconsdocs.netlify.app/" target="_blank" rel="noopener">📄 Docs &amp; templates</a>
          <a class="btn btn-ghost btn-sm" href="https://industrcons-ai.vercel.app/" target="_blank" rel="noopener">🤖 Ask IndustrCons AI</a>
          <a class="btn btn-ghost btn-sm" href="https://industrconsestimator.netlify.app/" target="_blank" rel="noopener">🧮 Cost Estimator</a>
        </div>
      </div>`;
  }


  function renderStepper() {
    stepperEl.innerHTML = steps.map((s, i) => {
      const cls = i === current ? 'active' : (i < current ? 'complete' : '');
      return `<div class="step-pill ${cls}"><span class="n">${i + 1}</span><span>${s.label}</span></div>`;
    }).join('');
  }

  function gate(open) {
    taskAnswered = open;
    nextBtn.disabled = !open;
  }

  function feedbackPanel(t, correct) {
    return `
      <div class="card" style="margin-top:18px; padding:18px; background:${correct ? 'color-mix(in srgb, var(--success) 8%, var(--surface))' : 'color-mix(in srgb, var(--danger) 6%, var(--surface))'}; border-color:${correct ? 'var(--success)' : 'var(--danger)'};">
        <p style="margin:0 0 8px; font-weight:700;">${correct ? '✅ Correct' : '↺ Not quite — here\'s the reasoning either way'}</p>
        <p style="margin:0 0 8px;"><strong>Engineering reasoning:</strong> ${t.reasoning}</p>
        <p style="margin:0 0 8px;"><strong>Professional tip:</strong> ${t.tip}</p>
        <p style="margin:0 0 8px;"><strong>Common mistake:</strong> ${t.mistake}</p>
        <p style="margin:0;"><strong>Industry recommendation:</strong> ${t.recommendation}</p>
      </div>`;
  }

  function markTaskDone(t, correct) {
    IC.store.completeTask(internshipId, t.id, t.xp);
    IC.toast(`<b>+${t.xp} XP</b> — ${t.title} ${correct ? 'completed correctly' : 'completed'}`);
    const state = IC.store.getState();
    // engineer_rookie badge: first task completed across the whole platform
    const totalTasksDone = Object.values(state.internships).reduce((n, r) => n + Object.keys(r.tasksDone).length, 0);
    if (totalTasksDone === 1 && IC.store.awardBadge('engineer_rookie')) {
      IC.toast(`🏅 Badge earned: <b>Engineer Rookie</b>`);
    }
  }

  function renderTask(idx) {
    const t = data.tasks[idx];
    const prog = IC.store.getInternshipProgress(internshipId);
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
      inputHtml = `<div class="field"><label>Your report</label><textarea id="textInput" rows="5"></textarea></div>`;
    } else if (t.type === 'excel-upload') {
      inputHtml = `
        <div class="card" style="padding:16px; margin-bottom:14px; background:var(--surface-2);">
          <p style="margin:0 0 10px;">1. Download the template below and open it in Excel (or Google Sheets / LibreOffice).<br>2. Fill in the highlighted blank cells.<br>3. Save the file, then upload it here — it's checked automatically, right in your browser. Nothing is sent to a server.</p>
          <button type="button" class="btn btn-ghost btn-sm" id="downloadTemplateBtn">⬇ Download ${t.template.fileName}</button>
        </div>
        <div class="field">
          <label>Upload your completed file (.xlsx)</label>
          <input type="file" id="excelInput" accept=".xlsx,.xls">
        </div>`;
    }

    content.innerHTML = `
      <span class="drawing-tag">${data.drawingTag}</span>
      <h3 style="margin-top:12px;">${t.title}</h3>
      <p>${t.prompt}</p>
      <form id="taskForm">${inputHtml}</form>
      <button class="btn btn-primary" id="submitTaskBtn" ${alreadyDone ? 'disabled' : ''}>${alreadyDone ? '✓ Submitted' : ''}</button>
      <span id="taskSubmitLabel"></span>
      <div id="taskFeedback"></div>
    `;
    const submitLabel = document.getElementById('taskSubmitLabel');
    const submitBtn = document.getElementById('submitTaskBtn');
    if (!alreadyDone) submitBtn.textContent = IC.i18n.t('flow.submit');
    submitLabel.remove();

    if (alreadyDone) {
      // show feedback immediately if revisited
      document.getElementById('taskFeedback').innerHTML = feedbackPanel(t, true);
    }

    if (t.type === 'excel-upload') {
      document.getElementById('downloadTemplateBtn').addEventListener('click', () => {
        const tpl = t.template;
        const ws = XLSX.utils.aoa_to_sheet([tpl.headers, ...tpl.rows]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, tpl.sheetName || 'Sheet1');
        XLSX.writeFile(wb, tpl.fileName);
      });
    }

    submitBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      if (alreadyDone) return;
      let correct = true;
      let excelDetail = '';
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
        if (val.length < t.minLength) { IC.toast(`Write at least ${t.minLength} characters.`); return; }
        correct = true;
      } else if (t.type === 'excel-upload') {
        const fileInput = document.getElementById('excelInput');
        const file = fileInput.files[0];
        if (!file) { IC.toast('Upload your completed .xlsx file first.'); return; }
        try {
          const buf = await file.arrayBuffer();
          const wb = XLSX.read(buf, { type: 'array' });
          const ws = wb.Sheets[wb.SheetNames[0]];
          const rows = [];
          correct = true;
          t.checks.forEach(chk => {
            const cell = ws[chk.cell];
            const val = cell ? parseFloat(cell.v) : NaN;
            const ok = !isNaN(val) && Math.abs(val - chk.expected) <= (chk.tolerance || 0.01);
            if (!ok) correct = false;
            rows.push(`<tr><td>${chk.label}</td><td class="mono">${chk.cell}</td><td class="mono">${isNaN(val) ? '—' : val}</td><td class="mono">${chk.expected}</td><td>${ok ? '✅' : '❌'}</td></tr>`);
          });
          excelDetail = `<table class="data-table" style="margin-top:12px;"><tr><th>Check</th><th>Cell</th><th>Your value</th><th>Expected</th><th></th></tr>${rows.join('')}</table>`;
        } catch (err) {
          IC.toast('Could not read that file — make sure it\'s a valid .xlsx saved from Excel/Sheets/LibreOffice.');
          return;
        }
      }
      markTaskDone(t, correct);
      document.getElementById('taskFeedback').innerHTML = feedbackPanel(t, correct) + excelDetail +
        (t.type === 'text' ? `<div class="card" style="margin-top:12px; padding:16px;"><strong>Model answer for comparison:</strong><p style="margin:6px 0 0;">${t.modelAnswer}</p></div>` : '') +
        (t.type === 'numeric' && t.workingNote ? `<p style="margin-top:10px; font-size:.85rem; color:var(--ink-soft);"><em>Working: ${t.workingNote}</em></p>` : '');
      submitBtn.disabled = true;
      submitBtn.textContent = '✓ Submitted';
      gate(true);
    });
  }

  function renderQuiz() {
    const prog = IC.store.getInternshipProgress(internshipId);
    gate(prog.quizScore !== null);
    content.innerHTML = `
      <h3>${IC.i18n.t('flow.quiz')}</h3>
      <p>Five questions on what you just practiced. Your score is recorded on your certificate summary.</p>
      <form id="quizForm">
        ${data.quiz.map((q, qi) => `
          <div class="card" style="padding:16px; margin-bottom:14px;">
            <p style="font-weight:600;">${qi + 1}. ${q.q}</p>
            ${q.options.map((opt, oi) => `
              <label class="field" style="flex-direction:row; align-items:center; gap:10px; margin-bottom:6px;">
                <input type="radio" name="q${qi}" value="${oi}"> <span style="font-weight:400;">${opt}</span>
              </label>`).join('')}
          </div>`).join('')}
      </form>
      <button class="btn btn-primary" id="submitQuizBtn">${IC.i18n.t('flow.submit')}</button>
      <div id="quizResult"></div>
    `;
    if (prog.quizScore !== null) {
      document.getElementById('quizResult').innerHTML = `<p style="margin-top:14px;">Your recorded score: <strong>${prog.quizScore}/${data.quiz.length}</strong></p>`;
      document.getElementById('submitQuizBtn').disabled = true;
    }
    document.getElementById('submitQuizBtn').addEventListener('click', (e) => {
      e.preventDefault();
      if (prog.quizScore !== null) return;
      let score = 0;
      data.quiz.forEach((q, qi) => {
        const sel = content.querySelector(`input[name="q${qi}"]:checked`);
        if (sel && parseInt(sel.value) === q.correctIndex) score++;
      });
      IC.store.recordQuiz(internshipId, score);
      IC.store.addXp(score * 10, `Scored ${score}/${data.quiz.length} on the quiz`);
      IC.toast(`Quiz recorded: <b>${score}/${data.quiz.length}</b> (+${score * 10} XP)`);
      document.getElementById('quizResult').innerHTML = `<p style="margin-top:14px;">Your score: <strong>${score}/${data.quiz.length}</strong></p>`;
      document.getElementById('submitQuizBtn').disabled = true;
      gate(true);
    });
  }

  function renderIntroStep(key) {
    gate(true);
    if (key === 'companyIntro') {
      const c = data.companyIntro;
      content.innerHTML = `
        <span class="eyebrow">${IC.i18n.t('flow.companyIntro')}</span>
        <h3 style="margin-top:10px;">${c.name}</h3>
        <p>${c.country} · Founded ${c.founded}</p>
        <div class="flex gap-2" style="flex-wrap:wrap; margin:10px 0;">
          <span class="badge badge-blue">⏱ ${data.durationHours} hrs</span>
          <span class="badge badge-outline">${data.difficulty}</span>
          ${(data.skills || []).map(s => `<span class="chip">${s}</span>`).join('')}
        </div>
        <p><strong>Mission:</strong> ${c.mission}</p>
        <p><strong>Culture:</strong> ${c.culture}</p>
        <strong>Live projects</strong>
        <ul style="margin:8px 0 0; padding-left:18px; color:var(--ink-soft);">${c.projects.map(p => `<li>${p}</li>`).join('')}</ul>
        ${learningObjectives()}`;
    } else if (key === 'projectBackground') {
      const p = data.projectBackground;
      content.innerHTML = `
        <span class="eyebrow">${IC.i18n.t('flow.projectBackground')}</span>
        <h3 style="margin-top:10px;">${p.name}</h3>
        <table class="data-table" style="margin-top:10px;">
          <tr><th>Client</th><td>${p.client}</td></tr>
          <tr><th>Location</th><td>${p.location}</td></tr>
          <tr><th>Budget</th><td>${p.budget}</td></tr>
          <tr><th>Timeline</th><td>${p.timeline}</td></tr>
        </table>
        <p style="margin-top:14px;">${p.context}</p>`;
    } else if (key === 'manager') {
      const m = data.manager;
      content.innerHTML = `
        <span class="eyebrow">${IC.i18n.t('flow.meetManager')}</span>
        <div class="flex" style="gap:16px; align-items:center; margin-top:12px;">
          <div class="avatar-dot" style="width:56px; height:56px; font-size:1.3rem;">${m.name.split(' ').map(w=>w[0]).join('')}</div>
          <div><h3 style="margin:0;">${m.name}</h3><p style="margin:0;">${m.role}</p></div>
        </div>
        <div class="card" style="padding:16px; margin-top:16px; background:var(--surface-2);"><p style="margin:0; font-style:italic;">"${m.note}"</p></div>`;
    } else if (key === 'assignment') {
      const a = data.assignment;
      content.innerHTML = `
        <span class="eyebrow">${IC.i18n.t('flow.assignment')}</span>
        <h3 style="margin-top:10px;">${a.title}</h3>
        <p>${a.brief}</p>`;
    } else if (key === 'documents') {
      content.innerHTML = `
        <span class="eyebrow">${IC.i18n.t('flow.documents')}</span>
        <h3 style="margin-top:10px;">Engineering Document Library</h3>
        <div class="grid" style="grid-template-columns:1fr 1fr; gap:12px; margin-top:12px;">
          ${data.documents.map(d => `
            <div class="card" style="padding:16px;">
              <span class="badge badge-outline">${d.type}</span>
              <h4 style="margin:10px 0 6px; font-size:1rem;">${d.name}</h4>
              <p style="margin:0; font-size:.86rem;">${d.note}</p>
            </div>`).join('')}
        </div>
        ${knowledgeReferencesBox()}`;
    }
  }

  function renderCaseStudy() {
    gate(true);
    const c = data.caseStudy;
    content.innerHTML = `
      <span class="eyebrow">${IC.i18n.t('flow.caseStudy')}</span>
      <h3 style="margin-top:10px;">${c.title}</h3>
      <p>${c.background}</p>
      <table class="data-table">
        <tr><th>Client</th><td>${c.client}</td></tr>
        <tr><th>Budget</th><td>${c.budget}</td></tr>
        <tr><th>Timeline</th><td>${c.timeline}</td></tr>
      </table>
      <p style="margin-top:14px;"><strong>Challenges:</strong> ${c.challenges}</p>
      <p><strong>Constraints:</strong> ${c.constraints}</p>
      <strong>Discussion questions</strong>
      <ul style="padding-left:18px; color:var(--ink-soft);">${c.questions.map(q => `<li>${q}</li>`).join('')}</ul>
      <details class="accordion-item"><summary>Reveal solution &amp; lessons learned</summary>
        <div class="a-body">
          <p><strong>Solution:</strong> ${c.solution}</p>
          <p style="margin-bottom:0;"><strong>Lessons learned:</strong> ${c.lessonsLearned}</p>
        </div>
      </details>`;
  }

  function renderReflection() {
    gate(true);
    content.innerHTML = `
      <span class="eyebrow">${IC.i18n.t('flow.reflection')}</span>
      <h3 style="margin-top:10px;">Reflection</h3>
      <p>Take a moment before you finish — these aren't graded, but they're where the internship actually sticks.</p>
      ${data.reflection.prompts.map((p, i) => `
        <div class="field"><label>${i + 1}. ${p}</label><textarea rows="3"></textarea></div>`).join('')}
    `;
  }

  function renderFeedback() {
    gate(true);
    const state = IC.store.getState();
    const prog = state.internships[internshipId] || { tasksDone: {}, quizScore: null };
    const xpFromTasks = data.tasks.filter(t => prog.tasksDone[t.id]).reduce((s, t) => s + t.xp, 0);
    const taskSummary = data.tasks.map(t => t.title.toLowerCase()).join(', ');
    content.innerHTML = `
      <span class="eyebrow">${IC.i18n.t('flow.feedback')}</span>
      <h3 style="margin-top:10px;">Internship summary</h3>
      <div class="grid" style="grid-template-columns:repeat(3,1fr); gap:14px; margin:16px 0;">
        <div class="stat"><div class="num">${Object.keys(prog.tasksDone).length}/${data.tasks.length}</div><div class="lbl">Tasks completed</div></div>
        <div class="stat"><div class="num">${prog.quizScore !== null ? prog.quizScore + '/' + data.quiz.length : '—'}</div><div class="lbl">Quiz score</div></div>
        <div class="stat"><div class="num">${xpFromTasks}</div><div class="lbl">XP from tasks</div></div>
      </div>
      <p>You worked through: ${taskSummary} — the core rhythm of a first assignment as a ${data.title} at ${data.companyIntro.name}.</p>
      <div class="card" style="margin-top:16px; padding:18px;">
        <h4 style="margin-top:0;">Related to keep building on this</h4>
        <ul style="margin:0; padding-left:18px; font-size:.9rem;">
          <li><a href="https://industrcons-knowledge-center.vercel.app/" target="_blank" rel="noopener">Related articles</a> on the concepts behind this internship's tasks</li>
          <li><a href="https://industrconsdocs.netlify.app/" target="_blank" rel="noopener">Related documents</a> — blank templates you can reuse outside IRE-3</li>
          <li><a href="https://industrconsestimator.netlify.app/" target="_blank" rel="noopener">Related calculators</a> for the quantity and cost math in these tasks</li>
        </ul>
      </div>
      ${ecosystemPanel()}
    `;
  }

  function renderCertificateStep() {
    gate(true);
    const prog = IC.store.getInternshipProgress(internshipId);
    if (prog.status === 'completed') {
      content.innerHTML = `
        <h3>🎉 Certificate issued</h3>
        <p>Certificate number: <span class="mono">${prog.certNo}</span></p>
        <a class="btn btn-primary" href="certificate.html?internshipId=${internshipId}">View &amp; download your certificate</a>
        ${ecosystemPanel()}`;
      return;
    }
    content.innerHTML = `
      <h3>${IC.i18n.t('flow.getCertificate')}</h3>
      <p>You've completed every task, the case study, and the quiz. Generate your verifiable certificate for <strong>${data.certificate.name}</strong>.</p>
      <button class="btn btn-accent btn-lg" id="issueCertBtn">${IC.i18n.t('flow.getCertificate')}</button>`;
    document.getElementById('issueCertBtn').addEventListener('click', () => {
      const certNo = 'IRE3-' + new Date().getFullYear() + '-' + Math.random().toString(36).slice(2, 8).toUpperCase();
      IC.store.completeInternship(internshipId, certNo);
      const badge = CATEGORY_BADGE[data.category];
      if (badge) IC.store.awardBadge(badge);
      IC.store.awardBadge('first_internship');
      const allCompleted = Object.values(IC.store.getState().internships).every(r => r.status === 'completed');
      if (allCompleted) IC.store.awardBadge('full_completion');
      IC.store.awardBadge('industry_ready');
      IC.toast('🏅 Certificate issued — badges updated!');
      window.location.href = `certificate.html?internshipId=${internshipId}`;
    });
  }

  function render() {
    renderStepper();
    const s = steps[current];
    if (s.key === 'task') renderTask(s.taskIndex);
    else if (s.key === 'quiz') renderQuiz();
    else if (s.key === 'caseStudy') renderCaseStudy();
    else if (s.key === 'reflection') renderReflection();
    else if (s.key === 'feedback') renderFeedback();
    else if (s.key === 'certificate') renderCertificateStep();
    else renderIntroStep(s.key);

    backBtn.style.visibility = current === 0 ? 'hidden' : 'visible';
    nextBtn.style.display = s.key === 'certificate' ? 'none' : 'inline-flex';
    IC.store.setStep(internshipId, current);
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  }

  nextBtn.addEventListener('click', () => {
    if (current < steps.length - 1) { current++; render(); }
  });
  backBtn.addEventListener('click', () => {
    if (current > 0) { current--; render(); }
  });

  function injectInternshipSeo(d) {
    const BASE = 'https://elvinasgar.github.io/IndustrCons-Virtual-Internship';
    const url = `${BASE}/internship-detail.html?id=${internshipId}`;
    const image = `${BASE}/assets/icons/logo-real.png`;
    const desc = `${d.title} virtual internship at ${d.companyIntro.name} — ${d.assignment.title}. ${d.durationHours} hrs, ${d.difficulty} level. Skills: ${(d.skills||[]).join(', ')}.`;
    const head = document.head;

    function setMeta(attr, key, val) {
      let el = document.querySelector(`meta[${attr}="${key}"]`);
      if (!el) { el = document.createElement('meta'); el.setAttribute(attr, key); head.appendChild(el); }
      el.setAttribute('content', val);
    }
    function setLink(rel, href) {
      let el = document.querySelector(`link[rel="${rel}"]`);
      if (!el) { el = document.createElement('link'); el.setAttribute('rel', rel); head.appendChild(el); }
      el.setAttribute('href', href);
    }
    function addSchema(obj) {
      const s = document.createElement('script');
      s.type = 'application/ld+json';
      s.textContent = JSON.stringify(obj);
      head.appendChild(s);
    }

    let descEl = document.querySelector('meta[name="description"]');
    if (!descEl) { descEl = document.createElement('meta'); descEl.setAttribute('name', 'description'); head.appendChild(descEl); }
    descEl.setAttribute('content', desc);

    setLink('canonical', url);
    setMeta('property', 'og:type', 'article');
    setMeta('property', 'og:title', `${d.title} — IndustrCons IRE-3`);
    setMeta('property', 'og:description', desc);
    setMeta('property', 'og:url', url);
    setMeta('property', 'og:image', image);
    setMeta('property', 'og:site_name', 'IndustrCons IRE-3');
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', `${d.title} — IndustrCons IRE-3`);
    setMeta('name', 'twitter:description', desc);
    setMeta('name', 'twitter:image', image);

    addSchema({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "IndustrCons IRE-3", "item": `${BASE}/index.html` },
        { "@type": "ListItem", "position": 2, "name": "Internships", "item": `${BASE}/internships.html` },
        { "@type": "ListItem", "position": 3, "name": d.title, "item": url }
      ]
    });

    addSchema({
      "@context": "https://schema.org",
      "@type": "Course",
      "name": `${d.title} Virtual Internship — ${d.companyIntro.name}`,
      "description": desc,
      "url": url,
      "provider": { "@type": "EducationalOrganization", "name": "IndustrCons", "sameAs": `${BASE}/index.html` },
      "timeRequired": `PT${d.durationHours}H`,
      "coursePrerequisites": d.difficulty,
      "teaches": (d.skills || []).join(', '),
      "hasCourseInstance": {
        "@type": "CourseInstance",
        "courseMode": "online",
        "courseWorkload": `PT${d.durationHours}H`
      }
    });

    addSchema({
      "@context": "https://schema.org",
      "@type": "LearningResource",
      "name": `${d.title} — ${d.assignment.title}`,
      "description": desc,
      "url": url,
      "learningResourceType": "Virtual Internship",
      "educationalLevel": d.difficulty,
      "teaches": (d.skills || []).join(', '),
      "timeRequired": `PT${d.durationHours}H`,
      "isPartOf": { "@type": "EducationalOrganization", "name": "IndustrCons" }
    });

    addSchema({
      "@context": "https://schema.org",
      "@type": "EducationalOccupationalProgram",
      "name": `${d.title} — IndustrCons IRE-3 Track`,
      "description": desc,
      "url": url,
      "occupationalCategory": d.category,
      "provider": { "@type": "EducationalOrganization", "name": "IndustrCons" },
      "timeToComplete": `PT${d.durationHours}H`,
      "educationalProgramMode": "online",
      "programType": "Virtual Internship"
    });
  }


  async function boot() {
    await IC.i18n.init();
    try {
      data = await fetch(`data/internships/${internshipId}.json`).then(r => {
        if (!r.ok) throw new Error('not found');
        return r.json();
      });
    } catch (e) {
      content.innerHTML = `
        <div class="empty-state">
          <div class="icon">🚧</div>
          <h3>This internship's full flow isn't built yet</h3>
          <p>It's already listed in the catalog with real metadata, but the step-by-step content (documents, tasks, case study) hasn't been authored. Try <a href="internship-detail.html?id=site-engineer-atlas">the Site Engineer internship</a> for the complete, playable flow.</p>
        </div>`;
      document.getElementById('stepperWrap').style.display = 'none';
      nextBtn.style.display = 'none';
      backBtn.style.display = 'none';
      return;
    }
    document.getElementById('crumbTitle').textContent = data.title;
    document.title = `${data.title} — IndustrCons IRE-3`;
    injectInternshipSeo(data);
    IC.store.startInternship(internshipId);
    buildSteps();
    const prog = IC.store.getInternshipProgress(internshipId);
    current = Math.min(prog.currentStep || 0, steps.length - 1);
    render();
  }

  document.addEventListener('DOMContentLoaded', boot);
})();
