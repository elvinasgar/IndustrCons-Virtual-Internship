(async function () {
  console.log('IndustrCons certificate.js v3 loaded');
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
  const lang = IC.i18n.getLang();
  const certTitleName = (lang === 'az' && data.certificate.nameAz) ? data.certificate.nameAz : data.certificate.name;
  document.getElementById('certInternshipName').textContent = `${certTitleName} — ${data.companyIntro.name}`;
  document.getElementById('certDate').textContent = new Date(rec.completedAt).toLocaleDateString(lang === 'az' ? 'az-AZ' : undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  document.getElementById('certNo').textContent = rec.certNo;
  document.getElementById('certNoTag').textContent = rec.certNo;
  document.getElementById('certVerify').textContent = verifyCode;

  let studentName = state.profile.name;
  const nameInput = document.getElementById('certNameInput');
  const saveNameBtn = document.getElementById('saveNameBtn');
  const savedTag = document.getElementById('nameSavedTag');
  const certNameEl = document.getElementById('certName');

  function renderQr(name) {
    try {
      const qrEl = document.getElementById('qrcode');
      qrEl.innerHTML = '';
      new QRCode(qrEl, {
        text: `IndustrCons IRE-3 Certificate\n${rec.certNo}\n${name}\n${data.certificate.name}\nVerify: ${verifyCode}`,
        width: 72, height: 72, correctLevel: QRCode.CorrectLevel.M
      });
    } catch (e) {
      console.error('QR render failed (non-blocking):', e);
    }
  }

  function renderName(name) {
    certNameEl.textContent = name && name.trim() ? name.trim() : 'Guest Student';
    renderQr(certNameEl.textContent);
  }

  try {
    nameInput.value = studentName === 'Guest Student' ? '' : studentName;
    renderName(studentName);
  } catch (e) {
    console.error('Initial certificate render issue (non-blocking):', e);
  }

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

  async function captureCertPng() {
    const card = document.getElementById('certificateCard');
    const canvas = await html2canvas(card, { scale: 2, backgroundColor: '#ffffff' });
    return canvas;
  }

  function downloadCanvas(canvas, filename) {
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  // Download PDF
  document.getElementById('downloadPdfBtn').addEventListener('click', async () => {
    const btn = document.getElementById('downloadPdfBtn');
    btn.disabled = true; btn.textContent = 'Preparing…';
    try {
      const canvas = await captureCertPng();
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

  // Download PNG (also the format most useful to attach to a LinkedIn post)
  document.getElementById('downloadPngBtn').addEventListener('click', async () => {
    const btn = document.getElementById('downloadPngBtn');
    btn.disabled = true; const original = btn.textContent; btn.textContent = 'Hazırlanır…';
    try {
      const canvas = await captureCertPng();
      downloadCanvas(canvas, `IndustrCons-Certificate-${rec.certNo}.png`);
    } catch (e) {
      console.error(e);
      IC.toast('Şəkil yaradıla bilmədi — internet bağlantınızı yoxlayın.');
    }
    btn.disabled = false; btn.textContent = original;
  });

  document.getElementById('printBtn').addEventListener('click', () => window.print());

  // LinkedIn caption + auto-download the certificate image so it's ready to attach
  document.getElementById('shareLinkedInBtn').addEventListener('click', async () => {
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

    const btn = document.getElementById('shareLinkedInBtn');
    btn.disabled = true;
    try {
      const canvas = await captureCertPng();
      downloadCanvas(canvas, `IndustrCons-Certificate-${rec.certNo}.png`);
      IC.toast('Sertifikat şəkli endirildi (Downloads qovluğu). Aşağıdan mətni kopyalayın, LinkedIn açılanda "Add media" ilə həmin şəkli əlavə edin.');
    } catch (e) { console.error(e); }
    btn.disabled = false;
  });

  document.getElementById('copyCaptionBtn').addEventListener('click', () => {
    const ta = document.getElementById('linkedinCaption');
    ta.select();
    const openShare = () => window.open('https://www.linkedin.com/feed/?shareActive=true', '_blank', 'noopener');
    navigator.clipboard.writeText(ta.value)
      .then(() => { IC.toast('Mətn kopyalandı — LinkedIn açılır. Paylaşım qutusuna yapışdırın (Ctrl/Cmd+V), sonra "Add media" ilə endirilmiş sertifikat şəklini əlavə edin.'); openShare(); })
      .catch(() => { document.execCommand('copy'); openShare(); });
  });
})();
