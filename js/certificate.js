(async function () {
  await IC.i18n.init();
  const params = new URLSearchParams(window.location.search);
  const internshipId = params.get('internshipId');
  const state = IC.store.getState();
  const rec = internshipId ? state.internships[internshipId] : null;

  if (!rec || rec.status !== 'completed') {
    document.getElementById('notReadyState').hidden = false;
    return;
  }

  let data;
  try {
    data = await fetch(`data/internships/${internshipId}.json`).then(r => r.json());
  } catch (e) {
    document.getElementById('notReadyState').hidden = false;
    return;
  }

  document.getElementById('certificateWrap').hidden = false;

  const verifyCode = 'VER-' + rec.certNo.split('-').pop();
  document.getElementById('certInternshipName').textContent = `${data.certificate.name} — ${data.companyIntro.name}`;
  document.getElementById('certDate').textContent = new Date(rec.completedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  document.getElementById('certNo').textContent = rec.certNo;
  document.getElementById('certNoTag').textContent = rec.certNo;
  document.getElementById('certVerify').textContent = verifyCode;

  let studentName = state.profile.name;
  const nameInput = document.getElementById('certNameInput');
  const saveNameBtn = document.getElementById('saveNameBtn');
  const savedTag = document.getElementById('nameSavedTag');
  const certNameEl = document.getElementById('certName');

  function renderQr(name) {
    const qrEl = document.getElementById('qrcode');
    qrEl.innerHTML = '';
    new QRCode(qrEl, {
      text: `IndustrCons IRE-3 Certificate\n${rec.certNo}\n${name}\n${data.certificate.name}\nVerify: ${verifyCode}`,
      width: 72, height: 72, correctLevel: QRCode.CorrectLevel.M
    });
  }

  function renderName(name) {
    certNameEl.textContent = name && name.trim() ? name.trim() : 'Guest Student';
    renderQr(certNameEl.textContent);
  }

  nameInput.value = studentName === 'Guest Student' ? '' : studentName;
  renderName(studentName);

  // Live preview as they type, persist on explicit save (and on blur, so nothing is lost)
  nameInput.addEventListener('input', () => renderName(nameInput.value || 'Guest Student'));
  function persistName() {
    const val = nameInput.value.trim();
    if (!val) return;
    studentName = val;
    IC.store.setProfileName(val);
    renderName(val);
    savedTag.style.display = 'inline';
    clearTimeout(persistName._t);
    persistName._t = setTimeout(() => savedTag.style.display = 'none', 2200);
  }
  saveNameBtn.addEventListener('click', persistName);
  nameInput.addEventListener('blur', persistName);
  nameInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); persistName(); } });

  // Download PDF
  document.getElementById('downloadPdfBtn').addEventListener('click', async () => {
    const card = document.getElementById('certificateCard');
    const btn = document.getElementById('downloadPdfBtn');
    btn.disabled = true; btn.textContent = 'Preparing…';
    try {
      const canvas = await html2canvas(card, { scale: 2, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [canvas.width, canvas.height] });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`IndustrCons-Certificate-${rec.certNo}.pdf`);
    } catch (e) {
      console.error(e);
      IC.toast('PDF export failed — check your connection (this feature loads libraries from a CDN).');
    }
    btn.disabled = false; btn.textContent = IC.i18n.t('certificate.downloadPdf');
  });

  document.getElementById('printBtn').addEventListener('click', () => window.print());

  // LinkedIn caption
  document.getElementById('shareLinkedInBtn').addEventListener('click', () => {
    const skills = data.skills.join(', ');
    const name = certNameEl.textContent || 'Guest Student';
    const caption = `🏗️ I'm ${name}, and I just completed the "${data.certificate.name}" virtual internship at ${data.companyIntro.name} on IndustrCons IRE-3.

I practiced: ${skills}.

Real-format engineering documents, a graded case study, and a certificate to show for it. Working through the "${data.caseStudy.title}" case study was the part that stuck with me most.

Thank you to @IndustrCons and its founder @Elvin Asgarov for building a hands-on way to get industry-ready before graduation.

#IndustryReadyEngineer #ConstructionEngineering #AEC #CivilEngineering #IndustrCons

IndustrCons: https://www.linkedin.com/company/industrcons/
Elvin Asgarov: https://www.linkedin.com/in/elvinasgarov`;
    document.getElementById('linkedinCaption').value = caption;
    document.getElementById('linkedinCaptionCard').hidden = false;
    document.getElementById('linkedinCaptionCard').scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  document.getElementById('copyCaptionBtn').addEventListener('click', () => {
    const ta = document.getElementById('linkedinCaption');
    ta.select();
    const openShare = () => window.open('https://www.linkedin.com/feed/?shareActive=true', '_blank', 'noopener');
    navigator.clipboard.writeText(ta.value)
      .then(() => { IC.toast('Mətn kopyalandı — indi LinkedIn-də yeni paylaşım qutusuna yapışdırın (Ctrl/Cmd+V).'); openShare(); })
      .catch(() => { document.execCommand('copy'); openShare(); });
  });
})();
