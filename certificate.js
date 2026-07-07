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

  // Editable name: prompt once if still default
  let studentName = state.profile.name;
  if (studentName === 'Guest Student') {
    const entered = window.prompt('Name to print on your certificate:', 'Guest Student');
    if (entered && entered.trim()) {
      studentName = entered.trim();
      IC.store.setProfileName(studentName);
    }
  }

  const verifyCode = 'VER-' + rec.certNo.split('-').pop();
  document.getElementById('certName').textContent = studentName;
  document.getElementById('certInternshipName').textContent = `${data.certificate.name} — ${data.companyIntro.name}`;
  document.getElementById('certDate').textContent = new Date(rec.completedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  document.getElementById('certNo').textContent = rec.certNo;
  document.getElementById('certNoTag').textContent = rec.certNo;
  document.getElementById('certVerify').textContent = verifyCode;

  // QR code — encodes a compact verification payload (no server exists to resolve it against)
  new QRCode(document.getElementById('qrcode'), {
    text: `IndustrCons IRE-3 Certificate\n${rec.certNo}\n${studentName}\n${data.certificate.name}\nVerify: ${verifyCode}`,
    width: 72, height: 72, correctLevel: QRCode.CorrectLevel.M
  });

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
    const caption = `🏗️ I just completed the "${data.certificate.name}" virtual internship at ${data.companyIntro.name} on IndustrCons IRE-3.

I practiced: ${skills}.

Real-format engineering documents, a graded case study, and a certificate to show for it. Working through the "${data.caseStudy.title}" case study was the part that stuck with me most.

#IndustryReadyEngineer #ConstructionEngineering #AEC #CivilEngineering #IndustrCons`;
    document.getElementById('linkedinCaption').value = caption;
    document.getElementById('linkedinCaptionCard').hidden = false;
    document.getElementById('linkedinCaptionCard').scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  document.getElementById('copyCaptionBtn').addEventListener('click', () => {
    const ta = document.getElementById('linkedinCaption');
    ta.select();
    navigator.clipboard.writeText(ta.value).then(() => IC.toast('Caption copied.')).catch(() => document.execCommand('copy'));
  });
})();
