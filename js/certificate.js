(async function () {
  console.log('IndustrCons certificate.js v4 loaded');
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

  const lang = IC.i18n.getLang();

  // Finite, hand-maintained skill translation dictionary — keeps the credential
  // strictly single-language even though the underlying internship data is English-only.
  const SKILL_AZ = {
    'Drawing Interpretation': 'Çertyojların Təhlili',
    'Concrete Calculation': 'Beton Hesablanması',
    'Site Inspection': 'Sahə Yoxlanışı',
    'Daily Reporting': 'Gündəlik Hesabatlıq',
    'Earthworks': 'Torpaq İşləri',
    'Material Selection': 'Material Seçimi',
    'Technical Report': 'Texniki Hesabat',
    'Scheduling': 'Cədvəlləşdirmə',
    'Critical Path': 'Kritik Yol',
    'MS Project Logic': 'MS Project Məntiqi',
    'Risk Assessment': 'Risk Qiymətləndirməsi',
    'Safety Observation': 'Təhlükəsizlik Müşahidəsi',
    'Incident Investigation': 'Hadisə Araşdırması',
    'Decision Making': 'Qərar Qəbuletmə',
    'Presentation': 'Təqdimat',
    'Steel Quantity': 'Polad Miqdarı',
    'Shop Drawing Review': 'İstehsalat Çertyojlarının Yoxlanılması',
    'RFI': 'Məlumat Sorğusu (RFI)',
    'Coordination': 'Koordinasiya',
    'BOQ Analysis': 'BOQ Təhlili',
    'Cost Estimation': 'Xərc Qiymətləndirməsi',
    'Procurement': 'Təchizat',
    'Communication': 'Kommunikasiya',
    'Engineering Ethics': 'Mühəndislik Etikası',
    'Quality Checklist': 'Keyfiyyət Nəzarəti Siyahısı',
    'Material Datasheet Review': 'Material Vərəqəsinin Yoxlanılması'
  };
  function localizedSkill(s) {
    return (lang === 'az' && SKILL_AZ[s]) ? SKILL_AZ[s] : s;
  }

  const verifyCode = 'VER-' + rec.certNo.split('-').pop();
  const certTitleName = (lang === 'az' && data.certificate.nameAz) ? data.certificate.nameAz : data.certificate.name;

  document.getElementById('certInternshipName').textContent = certTitleName;
  document.getElementById('certCompanyName').textContent = data.companyIntro.name;
  document.getElementById('certDate').textContent = new Date(rec.completedAt).toLocaleDateString(lang === 'az' ? 'az-AZ' : undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  document.getElementById('certNoTag').textContent = rec.certNo;
  document.getElementById('certVerify').textContent = verifyCode;

  const skillsRow = document.getElementById('certSkillsRow');
  skillsRow.innerHTML = (data.skills || []).map(s => `<span class="cred-chip">${localizedSkill(s)}</span>`).join('');

  let studentName = state.profile.name;
  const nameInput = document.getElementById('certNameInput');
  const saveNameBtn = document.getElementById('saveNameBtn');
  const savedTag = document.getElementById('nameSavedTag');
  const certNameEl = document.getElementById('certName');
  const defaultName = lang === 'az' ? 'Qonaq Tələbə' : 'Guest Student';

  function renderQr(name) {
    try {
      const qrEl = document.getElementById('qrcode');
      qrEl.innerHTML = '';
      new QRCode(qrEl, {
        text: `IndustrCons IRE-3 Credential\n${rec.certNo}\n${name}\n${certTitleName}\nVerify: ${verifyCode}`,
        width: 56, height: 56, correctLevel: QRCode.CorrectLevel.M
      });
    } catch (e) {
      console.error('QR render failed (non-blocking):', e);
    }
  }

  function renderName(name) {
    certNameEl.textContent = name && name.trim() ? name.trim() : defaultName;
    renderQr(certNameEl.textContent);
  }

  try {
    nameInput.value = (studentName === 'Guest Student' || studentName === 'Qonaq Tələbə') ? '' : studentName;
    renderName(studentName);
  } catch (e) {
    console.error('Initial certificate render issue (non-blocking):', e);
  }

  // Live preview as they type, persist on explicit save (and on blur, so nothing is lost)
  nameInput.addEventListener('input', () => renderName(nameInput.value || defaultName));
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
    const card = document.getElementById('credentialCard');
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
    const original = btn.textContent;
    btn.disabled = true; btn.textContent = lang === 'az' ? 'Hazırlanır…' : 'Preparing…';
    try {
      const canvas = await captureCertPng();
      const imgData = canvas.toDataURL('image/png');
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [canvas.width, canvas.height] });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`IndustrCons-Credential-${rec.certNo}.pdf`);
    } catch (e) {
      console.error(e);
      IC.toast(lang === 'az' ? 'PDF yaradıla bilmədi — internetinizi yoxlayın.' : 'PDF export failed — check your connection (this feature loads libraries from a CDN).');
    }
    btn.disabled = false; btn.textContent = original;
  });

  // Download PNG (also the format most useful to attach to a LinkedIn post)
  document.getElementById('downloadPngBtn').addEventListener('click', async () => {
    const btn = document.getElementById('downloadPngBtn');
    const original = btn.textContent;
    btn.disabled = true; btn.textContent = lang === 'az' ? 'Hazırlanır…' : 'Preparing…';
    try {
      const canvas = await captureCertPng();
      downloadCanvas(canvas, `IndustrCons-Credential-${rec.certNo}.png`);
    } catch (e) {
      console.error(e);
      IC.toast(lang === 'az' ? 'Şəkil yaradıla bilmədi — internet bağlantınızı yoxlayın.' : 'Could not generate the image — check your connection.');
    }
    btn.disabled = false; btn.textContent = original;
  });

  document.getElementById('printBtn').addEventListener('click', () => window.print());

  // LinkedIn caption + auto-download the certificate image so it's ready to attach
  document.getElementById('shareLinkedInBtn').addEventListener('click', async () => {
    const skillsList = (data.skills || []).map(localizedSkill).join(', ');
    const name = certNameEl.textContent || defaultName;

    const captionEn = `🏗️ I'm ${name}, and I just completed the "${certTitleName}" virtual internship at ${data.companyIntro.name} on IndustrCons IRE-3.

I practiced: ${skillsList}.

Real-format engineering documents, a graded case study, and a verified digital credential to show for it. Working through the "${data.caseStudy.title}" case study was the part that stuck with me most.

Thank you to @IndustrCons and its founder @Elvin Asgarov for building a hands-on way to get industry-ready before graduation.

#IndustryReadyEngineer #ConstructionEngineering #AEC #CivilEngineering #IndustrCons

IndustrCons: https://www.linkedin.com/company/industrcons/
Elvin Asgarov: https://www.linkedin.com/in/elvinasgarov`;

    const captionAz = `🏗️ Mən ${name}, "${data.companyIntro.name}" şirkətində IndustrCons IRE-3 platformasında "${certTitleName}" virtual təcrübəsini tamamladım.

Məşq etdiyim bacarıqlar: ${skillsList}.

Real formatlı mühəndislik sənədləri, qiymətləndirilən keys-study və rəsmi rəqəmsal sertifikat əldə etdim. Ən çox yadımda qalan hissə "${data.caseStudy.title}" keys-study-si oldu.

@IndustrCons və qurucusu @Elvin Asgarov-a, məzun olmadan öncə sənayeyə hazır olmaq üçün bu praktiki imkanı yaratdıqlarına görə təşəkkür edirəm.

#SənayeyəHazırMühəndis #TikintiMühəndisliyi #AEC #MülkiMühəndislik #IndustrCons

IndustrCons: https://www.linkedin.com/company/industrcons/
Elvin Asgarov: https://www.linkedin.com/in/elvinasgarov`;

    const caption = lang === 'az' ? captionAz : captionEn;
    document.getElementById('linkedinCaption').value = caption;
    document.getElementById('linkedinCaptionCard').hidden = false;
    document.getElementById('linkedinCaptionCard').scrollIntoView({ behavior: 'smooth', block: 'center' });

    const btn = document.getElementById('shareLinkedInBtn');
    btn.disabled = true;
    try {
      const canvas = await captureCertPng();
      downloadCanvas(canvas, `IndustrCons-Credential-${rec.certNo}.png`);
      IC.toast(lang === 'az'
        ? 'Sertifikat şəkli endirildi (Downloads qovluğu). Aşağıdan mətni kopyalayın, LinkedIn açılanda "Add media" ilə həmin şəkli əlavə edin.'
        : 'Credential image downloaded. Copy the text below, and when LinkedIn opens, use "Add media" to attach the downloaded image.');
    } catch (e) { console.error(e); }
    btn.disabled = false;
  });

  document.getElementById('copyCaptionBtn').addEventListener('click', () => {
    const ta = document.getElementById('linkedinCaption');
    ta.select();
    const openShare = () => window.open('https://www.linkedin.com/feed/?shareActive=true', '_blank', 'noopener');
    navigator.clipboard.writeText(ta.value)
      .then(() => {
        IC.toast(lang === 'az'
          ? 'Mətn kopyalandı — LinkedIn açılır. Paylaşım qutusuna yapışdırın (Ctrl/Cmd+V), sonra "Add media" ilə endirilmiş şəkli əlavə edin.'
          : 'Text copied — opening LinkedIn. Paste it into the post box (Ctrl/Cmd+V), then use "Add media" to attach the downloaded image.');
        openShare();
      })
      .catch(() => { document.execCommand('copy'); openShare(); });
  });
})();
