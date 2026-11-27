(async function () {
  console.log('IndustrCons certificate.js v7 loaded');
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
    "Tenant Communication": "Kirayəçilərlə Ünsiyyət",
    "Royalty Calculation": "Royalti Hesablanması",
    "Clearance Search": "Əvvəlcədən Axtarış (Clearance)",
    "Learning Objectives": "Öyrənmə Məqsədləri",
    "Debt Cover": "Borc Əhatəsi",
    "Site Quality Control": "Sahədə Keyfiyyətə Nəzarət",
    "Cap Rate & Valuation": "Cap Rate və Qiymətləndirmə",
    "Change Control": "Dəyişikliklərə Nəzarət",
    "Health Scoring": "Sağlamlıq Balı (Health Score)",
    "Item Analysis": "Test Sualı Təhlili",
    "Customer Lifetime Value": "Müştərinin Ömürlük Dəyəri",
    "Nurse Staffing": "Tibb Bacısı Kadrlaşdırması",
    "Churn & NRR": "Churn və NRR",
    "Maintenance Prioritisation": "Təmirlərin Prioritetləşdirilməsi",
    "Net Operating Income": "Xalis Əməliyyat Gəliri",
    "Length of Stay": "Qalma Müddəti",
    "Training Evaluation": "Təlimin Qiymətləndirilməsi",
    "Occupancy & Collections": "Doluluq və Yığım",
    "Trademark Strength": "Əmtəə Nişanının Gücü",
    "Quantities & Concrete": "Həcmlər və Beton",
    "Bed Occupancy": "Çarpayı Doluluğu",
    "Planning Metrics": "Planlaşdırma Göstəriciləri",
    "Fair Selection": "Ədalətli Seçim",
    "Holiday & Overtime Pay": "Məzuniyyət və Əlavə İş Haqqı",
    "Bending Moment & Stress": "Əyilmə Momenti və Gərginlik",
    "Conversion & AOV": "Konversiya və Orta Sifariş Dəyəri",
    "Curve Cant": "Əyri Yüksəkliyi (Cant)",
    "Braking & Capacity": "Əyləc və Tutum",
    "Employer Cost": "İşəgötürən Xərci",
    "Stock Turn": "Ehtiyat Dövriyyəsi",
    "Earned Value": "Qazanılmış Dəyər",
    "Cart Abandonment": "Səbətin Tərk Edilməsi",
    "Error Handling": "Xətaların İdarəsi",
    "Risk Classification": "Risk Təsnifatı",
    "Fair Investigation": "Ədalətli Araşdırma",
    "Lawful Basis": "Hüquqi Əsas",
    "Area Efficiency": "Sahə Səmərəliliyi",
    "Possession Safety": "Hərəkətin Dayandırılması Təhlükəsizliyi",
    "Thermal Movement": "Termal Hərəkət",
    "Bridge Inspection": "Körpü Müayinəsi",
    "Break-Even": "Zərərsizlik Nöqtəsi",
    "Bias Testing": "Qərəz Testi",
    "Labour Scheduling": "Əmək Qrafikinin Planlaşdırılması",
    "Payback Analysis": "Geri Ödəmə Təhlili",
    "Structured Interviewing": "Strukturlaşdırılmış Müsahibə",
    "HR Metrics": "HR Göstəriciləri",
    "Gross-to-Net": "Brutdan Nete",
    "Delay Analysis": "Gecikmə Təhlili",
    "AI Business Case": "Süni İntellekt Biznes Əsaslandırması",
    "Forecast at Completion": "Tamamlanma Proqnozu",
    "Cash Protection": "Nağd Pulun Qorunması",
    "Launch Guardrails": "Buraxılış Qoruyucuları",
    "Duct & Pipe Sizing": "Kanal və Boru Ölçüləndirməsi",
    "Notice & Termination": "Xəbərdarlıq və Xitam",
    "Pricing & Margin": "Qiymət və Marja",
    "Cost & Token Management": "Xərc və Token İdarəsi",
    "Precision & Review Rates": "Dəqiqlik və Yoxlama Göstəriciləri",
    "Commissioning": "İstismara Qəbul",
    "Pay Equity": "Ödəniş Bərabərliyi",
    "Pressure Testing": "Təzyiq Testi",
    "Automation ROI": "Avtomatlaşdırmanın Gəlirliliyi",
    "Fair Process": "Ədalətli Prosedur",
    "Claim Notices": "İddia Bildirişləri",
    "Shrinkage Control": "İtkilərə Nəzarət",
    "Human Oversight": "İnsan Nəzarəti",
    "Prompt Evaluation": "Prompt Qiymətləndirməsi",
    "Gross Margin": "Ümumi Marja",
    "Grievance Handling": "Şikayətlərin İdarəsi",
    "Advertising Return": "Reklam Gəliri",
    "Compa-Ratio": "Compa-Ratio (Maaş/Orta Nöqtə)",
    "Breach Response": "Pozuntuya Reaksiya",
    "Prompt Design": "Prompt Dizaynı",
    "Payroll Controls": "Əmək Haqqı Nəzarətləri",
    "Total Reward": "Ümumi Mükafatlandırma",
    "Markdown Planning": "Endirimlərin Planlaşdırılması",
    "Due Diligence": "Lazımi Araşdırma",
    "Prolongation Costs": "Uzanma Xərcləri",
    "Franchise Economics": "Françayzinq İqtisadiyyatı",
    "Retention & Cash Flow": "Saxlanma və Pul Axını",
    "Process Selection": "Proses Seçimi",
    "Egress & Stairs": "Evakuasiya və Pilləkənlər",
    "DPIA": "Data Təsir Qiymətləndirməsi (DPIA)",
    "Hiring Metrics": "İşə Qəbul Göstəriciləri",
    "Retail KPIs": "Pərakəndə KPI-lər",
    "Backlog Prioritisation": "Backlog Prioritetləşdirməsi",
    "RICE Scoring": "RICE Qiymətləndirməsi",
    "Stakeholder Management": "Maraqlı Tərəflərlə İş",
    "Market Sizing": "Bazar Ölçüsünün Qiymətləndirilməsi",
    "Structured Problem Solving": "Strukturlaşdırılmış Problem Həlli",
    "Executive Communication": "Rəhbərliklə Kommunikasiya",
    "OEE & Capacity": "OEE və Gücün İdarəsi",
    "Takt Time": "Takt Vaxtı",
    "Bottleneck Management": "Dar Boğaz İdarəsi",
    "Tender Evaluation": "Tender Qiymətləndirməsi",
    "Total Cost of Ownership": "Ümumi Sahiblik Dəyəri",
    "Supplier Risk": "Təchizatçı Riski",
    "Pipeline Management": "Satış Pipeline İdarəsi",
    "Discovery & Qualification": "Ehtiyacın Aşkarlanması və Kvalifikasiya",
    "Negotiation": "Danışıqlar",
    "Unit Economics": "Vahid İqtisadiyyat",
    "MVP Validation": "MVP Doğrulaması",
    "Runway Planning": "Runway Planlaşdırması",
    "VAT Computation": "ƏDV Hesablanması",
    "Corporate Tax": "Korporativ Vergi",
    "Tax Compliance": "Vergi Uyğunluğu",
    "Discounted Cash Flow": "Diskontlaşdırılmış Pul Axını",
    "Valuation Multiples": "Qiymətləndirmə Multiplikatorları",
    "Investment Recommendation": "İnvestisiya Tövsiyəsi",
    "Contract Review": "Müqavilə Təhlili",
    "Liability & Indemnity": "Məsuliyyət və Təminat",
    "Risk Negotiation": "Risk üzrə Danışıqlar",
    "Risk Pricing": "Riskin Qiymətləndirilməsi",
    "Loss & Combined Ratio": "Zərər və Birləşmiş Əmsal",
    "Underwriting Judgement": "Anderraytinq Qərarı",
    "Cash Forecasting": "Nağd Pul Proqnozu",
    "FX Exposure": "Valyuta Riski",
    "Liquidity Management": "Likvidlik İdarəsi",
    "Stress Analysis": "Gərginlik Təhlili",
    "Factor of Safety": "Təhlükəsizlik Əmsalı",
    "Design Verification": "Layihənin Doğrulanması",
    "Load Calculations": "Yük Hesablamaları",
    "Voltage Drop": "Gərginlik Düşgüsü",
    "Protection Selection": "Mühafizənin Seçimi",
    "Cooling Load": "Soyutma Yükü",
    "Ventilation Rates": "Ventilyasiya Normaları",
    "Chiller Efficiency": "Çiller Səmərəliliyi",
    "MTBF & Availability": "MTBF və Hazırlıq",
    "Preventive Maintenance": "Profilaktik Texniki Xidmət",
    "Criticality Analysis": "Kritiklik Təhlili",
    "Mass Balance": "Kütlə Balansı",
    "Line Sizing": "Boru Xəttinin Ölçülməsi",
    "Process Safety (HAZOP)": "Proses Təhlükəsizliyi (HAZOP)",
    "Energy Yield": "Enerji İstehsalı",
    "Capacity Factor": "Güc İstifadə Əmsalı",
    "Levelised Cost": "Bərabərləşdirilmiş Xərc",
    "Technical Bid Evaluation": "Texniki Təklifin Qiymətləndirilməsi",
    "Landed Cost": "Çatdırılma Dəyəri",
    "Delivery Planning": "Çatdırılmanın Planlaşdırılması",
    "Planned Maintenance": "Planlı Texniki Xidmət",
    "Cost per Area": "Sahəyə görə Xərc",
    "Energy Management": "Enerji İdarəsi",
    "Carbon Accounting": "Karbon Uçotu",
    "Scope 1, 2, 3": "Scope 1, 2, 3",
    "Credible Reporting": "Etibarlı Hesabatlılıq",
    "Map Scale & Geometry": "Xəritə Miqyası və Həndəsə",
    "Spatial Analysis": "Məkan Təhlili",
    "Data Quality": "Data Keyfiyyəti",
    "Measurement": "Ölçü İşləri",
    "Bill of Quantities": "Kəmiyyət Cədvəli (BoQ)",
    "Variation Valuation": "Variasiyaların Qiymətləndirilməsi",
    "Float Analysis": "Ehtiyat Vaxt (Float) Təhlili",
    "Delay & EOT Claims": "Gecikmə və Müddət Uzadılması",
    "Variance Analysis": "Fərq Təhlili",
    "Financial Forecasting": "Maliyyə Proqnozlaşdırması",
    "Scenario Modelling": "Ssenari Modelləşdirməsi",
    "IFRS Fundamentals": "IFRS Əsasları",
    "Financial Ratios": "Maliyyə Əmsalları",
    "Asset Valuation": "Aktivlərin Qiymətləndirilməsi",
    "Audit Materiality": "Audit Əhəmiyyətliliyi",
    "Audit Sampling": "Audit Seçmə Üsulu",
    "Internal Controls Testing": "Daxili Nəzarətlərin Testi",
    "Credit Analysis": "Kredit Təhlili",
    "Debt Service Coverage": "Borc Xidməti Əhatəsi",
    "Covenant Monitoring": "Kovenant Monitorinqi",
    "KYC & Due Diligence": "KYC və Lazımi Araşdırma",
    "Transaction Monitoring": "Əməliyyat Monitorinqi",
    "Suspicious Activity Reporting": "Şübhəli Fəaliyyət Hesabatı",
    "Model Evaluation": "Model Qiymətləndirilməsi",
    "Experiment Analysis": "Eksperiment Təhlili",
    "Data Leakage Detection": "Data Sızmasının Aşkarlanması",
    "SQL Joins": "SQL Birləşmələri",
    "Aggregation": "Aqreqasiya",
    "Data Quality Checks": "Data Keyfiyyət Yoxlamaları",
    "Model Deployment": "Modelin Deploy Edilməsi",
    "Drift Monitoring": "Drift Monitorinqi",
    "Release Safety": "Release Təhlükəsizliyi",
    "Debugging": "Debaq",
    "Code Review": "Kod Nəzərdən Keçirilməsi",
    "API Design": "API Dizaynı",
    "Responsive Layout": "Responsiv Tərtibat",
    "Web Accessibility": "Veb Əlçatanlıq",
    "Page Performance": "Səhifə Performansı",
    "Test Design": "Test Dizaynı",
    "Defect Reporting": "Defekt Hesabatı",
    "Quality Metrics": "Keyfiyyət Metrikaları",
    "CI/CD Pipelines": "CI/CD Pipeline-ları",
    "Incident Response": "İnsidentlərə Reaksiya",
    "Reliability Metrics": "Etibarlılıq Metrikaları",
    "Cloud Cost Optimisation": "Cloud Xərclərinin Optimallaşdırılması",
    "High Availability": "Yüksək Əlçatanlıq",
    "Cloud Security Basics": "Cloud Təhlükəsizliyinin Əsasları",
    "Alert Triage": "Xəbərdarlıqların Triajı",
    "Incident Containment": "İnsidentin Lokallaşdırılması",
    "Security Fundamentals": "Təhlükəsizlik Əsasları",
    "Requirements Elicitation": "Tələblərin Aşkarlanması",
    "User Stories": "İstifadəçi Hekayələri",
    "Acceptance Criteria": "Qəbul Meyarları",
    "Earned Value Management": "Qazanılmış Dəyər İdarəsi",
    "Risk Management": "Risk İdarəetməsi",
    "Status Reporting": "Status Hesabatı",
    "User Research": "İstifadəçi Tədqiqatı",
    "Usability Heuristics": "Usability Evristikaları",
    "Usability Testing": "Usability Testi",
    "Incident Management": "İnsident İdarəsi",
    "SLA Management": "SLA İdarəsi",
    "User Communication": "İstifadəçi ilə Kommunikasiya",
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
  (function(){ const d = new Date(rec.completedAt); const AZM=['yanvar','fevral','mart','aprel','may','iyun','iyul','avqust','sentyabr','oktyabr','noyabr','dekabr'];
    document.getElementById('certDate').textContent = lang === 'az' ? `${d.getDate()} ${AZM[d.getMonth()]} ${d.getFullYear()}` : d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }); })();
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
        text: `IndustrCons IRE-3 | ${rec.certNo} | ${verifyCode} | ${String(name).slice(0,28)}`,
        width: 72, height: 72, correctLevel: QRCode.CorrectLevel.M
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
    const canvas = await html2canvas(card, {
      scale: 2, backgroundColor: '#ffffff', useCORS: true,
      width: 1123, height: 794, windowWidth: 1400,
      onclone: (doc) => {
        const c = doc.getElementById('credentialCard');
        c.style.transform = 'none';
        const v = doc.getElementById('certViewport');
        v.style.height = '794px'; v.style.width = '1123px'; v.style.maxWidth = 'none'; v.style.overflow = 'visible';
      }
    });
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
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      pdf.addImage(imgData, 'PNG', 0, 0, 297, 210);
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

  // Scale the fixed landscape canvas to the available width (phones included) — layout never reflows.
  function fitCert() {
    const v = document.getElementById('certViewport'), c = document.getElementById('credentialCard');
    if (!v || !c) return;
    const s = Math.min(1, v.clientWidth / 1123);
    c.style.transform = `scale(${s})`;
    v.style.height = Math.round(794 * s) + 'px';
  }
  fitCert();
  window.addEventListener('resize', fitCert);
  window.addEventListener('orientationchange', fitCert);
  window.addEventListener('load', fitCert);
  setTimeout(fitCert, 300);
})();
