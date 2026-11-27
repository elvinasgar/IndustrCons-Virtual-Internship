(function(){
  const UI={
    en:{title:'Career Guide',lead:'Find where you are, see what each level expects, plan a move to project manager or a new field, and get a personal roadmap built from IndustrCons simulations.',start:'Find my level',
      quizH:'Where am I now?',quizP:'Answer five quick questions. Nothing is stored on a server.',result:'Your likely level',see:'Build my roadmap',retake:'Retake',
      stagesH:'Career levels',stagesP:'Typical expectations at each level. Years are a rough guide only.',expects:'Employers expect',doNow:'What to do',mistakes:'Common mistakes',nextL:'Next step',cur:'You',
      pathsH:'Four ways to grow',pathsP:'You do not have to become a manager. Choose the direction that fits you, and change later if needed.',fits:'Good fit if',
      fieldsH:'Explore fields',fieldsP:'Pick a field to see its simulations, from beginner to advanced.',open:'Open',done:'Done',
      switchH:'Changing field',switchP:'A switch is a series of small steps, not a leap. Start from what you already have.',pairsH:'Common switches',keep:'You keep',gap:'You must add',planH:'A 90-day plan',
      roadH:'Personal roadmap',roadP:'Choose your level, goal and field. You get ordered steps and simulations to start with.',lblStage:'Current level',lblGoal:'Goal',lblField:'Target field',build:'Create roadmap',print:'Print / save as PDF',
      goals:{grow:'Grow in my field',manager:'Become a project / team manager',switch:'Switch to this field',found:'Start my own business'},
      checkH:'Checklists',cv:'CV checklist',iv:'Interview checklist',
      r1:'Step 1 — Actions now',r2:'Step 2 — Simulations to complete (in this order)',r3:'Step 3 — Prove it and apply',r3items:['Keep your certificates and add the best two to your CV and LinkedIn','Write 3 short results from the simulations in STAR form (situation, task, action, result)','Apply to 5–10 roles that match the level above, then review what you learn after 30 days'],
      r4:'Extra for managers',r5:'Extra for switching',r6:'Extra for founders',noTracks:'No simulations found for this selection.',saved:'Saved on this device'},
    az:{title:'Karyera Bələdçisi',lead:'Harada olduğunuzu tapın, hər səviyyədən nə gözlənildiyini görün, layihə menecerliyinə və ya yeni sahəyə keçidi planlaşdırın və IndustrCons simulyasiyalarından şəxsi yol xəritəsi alın.',start:'Səviyyəmi tap',
      quizH:'İndi haradayam?',quizP:'Beş qısa suala cavab verin. Heç nə serverdə saxlanmır.',result:'Ehtimal olunan səviyyəniz',see:'Yol xəritəmi qur',retake:'Yenidən',
      stagesH:'Karyera səviyyələri',stagesP:'Hər səviyyədə tipik gözləntilər. İllər yalnız təxmini bələdçidir.',expects:'İşəgötürən nə gözləyir',doNow:'Nə etməli',mistakes:'Tez-tez edilən səhvlər',nextL:'Növbəti addım',cur:'Siz',
      pathsH:'İnkişafın dörd yolu',pathsP:'Menecer olmaq məcburi deyil. Sizə uyğun istiqaməti seçin, lazım olsa sonra dəyişin.',fits:'Nə vaxt uyğundur',
      fieldsH:'Sahələri kəşf edin',fieldsP:'Sahəni seçin və başlanğıcdan irəli səviyyəyə qədər simulyasiyalarına baxın.',open:'Aç',done:'Bitib',
      switchH:'Sahə dəyişmək',switchP:'Keçid tullanış deyil, kiçik addımlar silsiləsidir. Əlinizdə olandan başlayın.',pairsH:'Tez-tez rast gəlinən keçidlər',keep:'Saxladığınız',gap:'Əlavə edəcəyiniz',planH:'90 günlük plan',
      roadH:'Şəxsi yol xəritəsi',roadP:'Səviyyəni, məqsədi və sahəni seçin. Sıralı addımlar və başlanğıc simulyasiyalar alacaqsınız.',lblStage:'Cari səviyyə',lblGoal:'Məqsəd',lblField:'Hədəf sahə',build:'Yol xəritəsi yarat',print:'Çap et / PDF saxla',
      goals:{grow:'Sahəmdə inkişaf etmək',manager:'Layihə / komanda meneceri olmaq',switch:'Bu sahəyə keçmək',found:'Öz bizneslərimi qurmaq'},
      checkH:'Çek-listlər',cv:'CV çek-listi',iv:'Müsahibə çek-listi',
      r1:'Addım 1 — İndi görüləcək işlər',r2:'Addım 2 — Bitiriləcək simulyasiyalar (bu ardıcıllıqla)',r3:'Addım 3 — Sübut edin və müraciət edin',r3items:['Sertifikatları saxlayın və ən yaxşı ikisini CV və LinkedIn-ə əlavə edin','Simulyasiyalardan 3 qısa nəticəni STAR formatında yazın (vəziyyət, tapşırıq, hərəkət, nəticə)','Yuxarıdakı səviyyəyə uyğun 5–10 vakansiyaya müraciət edin, 30 gündən sonra öyrəndiklərinizi nəzərdən keçirin'],
      r4:'Menecerlər üçün əlavə',r5:'Keçid edənlər üçün əlavə',r6:'Təsisçilər üçün əlavə',noTracks:'Bu seçim üçün simulyasiya tapılmadı.',saved:'Bu cihazda saxlanıldı'}
  };
  const $=id=>document.getElementById(id);
  let G=null,IDX={},lang='en',answers=[],stageIdx=null;
  const L=o=>o?(o[lang]||o.en):'';
  const T=()=>UI[lang];
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const DIFF={Beginner:0,Intermediate:1,Advanced:2};
  function done(id){try{const p=IC.store.getInternshipProgress(id);return p&&p.status==='completed'}catch(e){return false}}
  function trk(id){const t=IDX[id];if(!t)return'';
    const dn=done(id);
    return `<a class="cg-trk" href="internship-detail.html?id=${encodeURIComponent(id)}"><span><strong>${esc(t.title)}</strong><br><small>${esc(t.company)} · ${esc(t.difficulty)} · ${t.durationHours||''}h</small></span><span>${dn?`<span class="cg-done">✓ ${T().done}</span>`:'→'}</span></a>`}
  function list(a){return '<ul>'+a.map(x=>'<li>'+esc(L(x))+'</li>').join('')+'</ul>'}
  function setText(){const t=T();
    $('uiTitle').textContent=t.title;document.title=t.title+' — IndustrCons';$('uiLead').textContent=t.lead;$('uiStart').textContent=t.start;
    [['uiQuizH','quizH'],['uiQuizP','quizP'],['uiStagesH','stagesH'],['uiStagesP','stagesP'],['uiPathsH','pathsH'],['uiPathsP','pathsP'],['uiFieldsH','fieldsH'],['uiFieldsP','fieldsP'],['uiSwitchH','switchH'],['uiSwitchP','switchP'],['uiPairsH','pairsH'],['uiPlanH','planH'],['uiRoadH','roadH'],['uiRoadP','roadP'],['lblStage','lblStage'],['lblGoal','lblGoal'],['lblField','lblField'],['btnRoad','build'],['btnPrint','print'],['uiCheckH','checkH']].forEach(([i,k])=>$(i).textContent=t[k]);
    $('uiDisc').textContent=L(G.disclaimer)}
  function renderQuiz(){
    $('quizBox').innerHTML=G.quiz.map((q,i)=>`<div class="cg-q"><h4>${i+1}. ${esc(L(q.q))}</h4>${q.o.map((o,j)=>`<button type="button" class="cg-opt" data-q="${i}" data-o="${j}" aria-pressed="${answers[i]===j}">${esc(L(o[0]))}</button>`).join('')}</div>`).join('');
    $('quizBox').querySelectorAll('.cg-opt').forEach(b=>b.onclick=()=>{answers[+b.dataset.q]=+b.dataset.o;renderQuiz();calc()});
    calc()}
  function calc(){
    if(answers.filter(a=>a!==undefined).length<G.quiz.length){$('quizResult').innerHTML='';return}
    let sw=false,vals=[];G.quiz.forEach((q,i)=>{const v=q.o[answers[i]][1];if(v<0)sw=true;else vals.push(v)});
    const avg=vals.reduce((a,b)=>a+b,0)/vals.length;
    stageIdx=Math.min(G.stages.length-1,Math.max(0,Math.round(avg)));
    const s=G.stages[stageIdx],t=T();
    $('quizResult').innerHTML=`<div class="card cg-card" style="border-left:5px solid #f97316"><div class="cg-ic">${s.icon}</div><small>${t.result}</small><h3>${esc(L(s.name))}</h3><p>${esc(L(s.summary))}</p>${sw?`<p><strong>${lang==='az'?'Sahə dəyişmək istəyirsiniz: aşağıdakı "Sahə dəyişmək" bölməsinə baxın.':'You want to change field: see the "Changing field" section below.'}</strong></p>`:''}<button class="btn btn-primary" id="goRoad">${t.see}</button> <button class="btn btn-ghost" id="retake">${t.retake}</button></div>`;
    $('goRoad').onclick=()=>{$('selStage').value=s.id;if(sw)$('selGoal').value='switch';$('cgRoadmap').scrollIntoView({behavior:'smooth'})};
    $('retake').onclick=()=>{answers=[];renderQuiz()};
    renderStages()}
  function renderStages(){const t=T();
    $('stagesBox').innerHTML=G.stages.map((s,i)=>`<details class="card cg-card ${i===stageIdx?'cg-stage-cur':''}"><summary><span class="cg-ic">${s.icon}</span> ${i===stageIdx?`<span class="badge badge-orange">${t.cur}</span>`:''}<h3>${esc(L(s.name))}</h3><small>${esc(L(s.years))}</small><p style="margin:6px 0 0;font-size:.9rem">${esc(L(s.summary))}</p></summary><h4 style="margin:12px 0 0">${t.expects}</h4>${list(s.expect)}<h4 style="margin:12px 0 0">${t.doNow}</h4>${list(s.do)}<h4 style="margin:12px 0 0">${t.mistakes}</h4>${list(s.mistakes)}<p style="margin:12px 0 0"><strong>${t.nextL}:</strong> ${esc(L(s.next))}</p></details>`).join('')}
  function renderPaths(){const t=T();
    $('pathsBox').innerHTML=G.paths.map(p=>`<div class="card cg-card"><div class="cg-ic">${p.icon}</div><h3>${esc(L(p.name))}</h3><p style="font-size:.92rem">${esc(L(p.desc))}</p><p style="font-size:.88rem;color:var(--ink-soft)"><strong>${t.fits}:</strong> ${esc(L(p.fits))}</p><div style="display:grid;gap:8px">${p.tracks.map(trk).join('')}</div></div>`).join('')}
  let curField=null;
  function renderFields(){
    if(!curField)curField=G.fields[0].id;
    $('fieldChips').innerHTML=G.fields.map(f=>`<button type="button" class="cg-chip" data-f="${f.id}" aria-pressed="${f.id===curField}">${f.icon} ${esc(L(f.name))}</button>`).join('');
    $('fieldChips').querySelectorAll('.cg-chip').forEach(b=>b.onclick=()=>{curField=b.dataset.f;renderFields()});
    const f=G.fields.find(x=>x.id===curField);
    const ts=f.tracks.filter(id=>IDX[id]).sort((a,b)=>DIFF[IDX[a].difficulty]-DIFF[IDX[b].difficulty]);
    $('fieldBox').innerHTML=`<p>${esc(L(f.desc))}</p><div class="cg-grid">${ts.map(trk).join('')}</div>`}
  function renderSwitch(){const t=T();
    $('switchSteps').innerHTML=G.switch.steps.map((s,i)=>`<div class="cg-step"><div class="cg-num">${i+1}</div><div><strong>${esc(L(s.t).replace(/^\d+\.\s*/,''))}</strong><p style="margin:2px 0 0;color:var(--ink-soft)">${esc(L(s.d))}</p></div></div>`).join('');
    $('pairsBox').innerHTML=G.switch.pairs.map(p=>`<details class="card cg-card"><summary><strong>${esc(L(p.from))}</strong> → ${esc(L(p.to))}</summary><p style="margin:10px 0 0;font-size:.9rem"><strong>${t.keep}:</strong> ${p.keep.map(L).join('; ')}<br><strong>${t.gap}:</strong> ${p.gap.map(L).join('; ')}</p><div style="display:grid;gap:8px;margin-top:10px">${p.tracks.map(trk).join('')}</div></details>`).join('');
    $('planBox').innerHTML=G.switch.plan.map(p=>`<div class="card cg-card"><h3>${esc(L(p.t))}</h3><p style="margin:0;color:var(--ink-soft)">${esc(L(p.d))}</p></div>`).join('')}
  function renderChecks(){const t=T();
    const box=(h,a)=>`<div class="card cg-card"><h3>${h}</h3>${a.map(x=>`<label style="display:flex;gap:8px;margin:8px 0;font-size:.92rem"><input type="checkbox"> <span>${esc(L(x))}</span></label>`).join('')}</div>`;
    $('checksBox').innerHTML=box(t.cv,G.checks.cv)+box(t.iv,G.checks.interview)}
  function fillSelects(){const t=T();
    const keepS=$('selStage').value,keepG=$('selGoal').value,keepF=$('selField').value;
    $('selStage').innerHTML=G.stages.map(s=>`<option value="${s.id}">${esc(L(s.name))}</option>`).join('');
    $('selGoal').innerHTML=Object.keys(t.goals).map(k=>`<option value="${k}">${esc(t.goals[k])}</option>`).join('');
    $('selField').innerHTML=G.fields.map(f=>`<option value="${f.id}">${esc(L(f.name))}</option>`).join('');
    if(keepS)$('selStage').value=keepS;if(keepG)$('selGoal').value=keepG;if(keepF)$('selField').value=keepF}
  function pick(fieldId,stage,n){
    const f=G.fields.find(x=>x.id===fieldId);const si=G.stages.findIndex(s=>s.id===stage);
    const want=si<=1?[0,1]:si<=3?[1,2]:[2,1];
    let ts=f.tracks.filter(id=>IDX[id]);
    const score=id=>{const d=DIFF[IDX[id].difficulty];const k=want.indexOf(d);return (k<0?5:k)*10+(done(id)?100:0)};
    ts=ts.sort((a,b)=>score(a)-score(b)).slice(0,n);
    return ts.sort((a,b)=>DIFF[IDX[a].difficulty]-DIFF[IDX[b].difficulty])}
  function road(){const t=T();
    const stage=$('selStage').value,goal=$('selGoal').value,field=$('selField').value;
    const s=G.stages.find(x=>x.id===stage),f=G.fields.find(x=>x.id===field);
    const main=pick(field,stage,5);
    let h=`<h3>${s.icon} ${esc(L(s.name))} → ${f.icon} ${esc(L(f.name))} · ${esc(t.goals[goal])}</h3>`;
    h+=`<h4>${t.r1}</h4>${list(s.do)}`;
    h+=`<h4>${t.r2}</h4>`+(main.length?`<div style="display:grid;gap:8px">${main.map(trk).join('')}</div>`:`<p>${t.noTracks}</p>`);
    if(goal==='manager'){const pm=G.fields.find(x=>x.id==='pm');const extra=[...G.paths.find(p=>p.id==='manager').tracks,...pm.tracks].filter((v,i,a)=>IDX[v]&&a.indexOf(v)===i&&!main.includes(v)).slice(0,4);h+=`<h4>${t.r4}</h4><div style="display:grid;gap:8px">${extra.map(trk).join('')}</div>`}
    if(goal==='switch'){const cur=G.stages[G.stages.length-1];h+=`<h4>${t.r5}</h4>${list(G.switch.steps.slice(1,5).map(x=>({en:x.t.en.replace(/^\d+\.\s*/,'')+': '+x.d.en,az:x.t.az.replace(/^\d+\.\s*/,'')+': '+x.d.az})))}`}
    if(goal==='found'){const bf=G.fields.find(x=>x.id==='business');const extra=bf.tracks.filter(v=>IDX[v]).slice(0,4);h+=`<h4>${t.r6}</h4><div style="display:grid;gap:8px">${extra.map(trk).join('')}</div>`}
    h+=`<h4>${t.r3}</h4><ul>${t.r3items.map(x=>'<li>'+esc(x)+'</li>').join('')}</ul><p class="cg-note">${t.saved}</p>`;
    $('roadOut').innerHTML=h;
    try{localStorage.setItem('ic_career_plan',JSON.stringify({stage,goal,field}))}catch(e){}}
  function renderAll(){setText();renderQuiz();renderStages();renderPaths();renderFields();renderSwitch();renderChecks();fillSelects();if($('roadOut').innerHTML)road()}
  async function init(){
    try{
      const [g,a,b]=await Promise.all(['data/career/guide.json','data/tracks/index.json','data/internships/index.json'].map(u=>fetch(u,{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error(u+' '+r.status);return r.json()})));
      G=g;[...a,...b].forEach(x=>IDX[x.id]=x);
    }catch(e){document.getElementById('main').insertAdjacentHTML('afterbegin','<div class="container"><div class="card" style="padding:18px;margin-bottom:16px">⚠ '+esc(e.message)+'</div></div>');return}
    try{lang=(window.IC&&IC.i18n&&IC.i18n.getLang())||localStorage.getItem('ic_lang')||'en'}catch(e){}
    if(!UI[lang])lang='en';
    renderAll();
    try{const p=JSON.parse(localStorage.getItem('ic_career_plan')||'null');if(p){$('selStage').value=p.stage;$('selGoal').value=p.goal;$('selField').value=p.field}}catch(e){}
    $('btnRoad').onclick=road;$('btnPrint').onclick=()=>{if(!$('roadOut').innerHTML)road();window.print()};
    ['selStage','selGoal','selField'].forEach(i=>$(i).onchange=()=>{if($('roadOut').innerHTML)road()});
    if(window.IC&&IC.i18n)IC.i18n.onChange(l=>{if(l!==lang&&UI[l]){lang=l;renderAll()}});
  }
  init();
})();
