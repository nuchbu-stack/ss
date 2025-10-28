/********************
 * Base elements
 ********************/
const form = document.getElementById("surveyForm");
const qUserSection = document.getElementById("qUserSection");
const q0 = document.getElementById("q0");
const q0Section = document.getElementById("q0Section");
const q0Other = document.getElementById("q0Other");
const q1Options = document.querySelectorAll("#q1Options .option");
const q2Section = document.getElementById("q2Section");
const q2Other = document.getElementById("q2Other");
const thankYou = document.getElementById("thankYou");
const submitButton = form.querySelector('button[type="submit"]');

/********************
 * Config
 ********************/
const GAS_URL = "https://script.google.com/macros/s/AKfycbyGhPwMCqvXhU0TMue4AfU0TOo2Nms7Iy9kFCfun-wqYFrb7ntTB5uBUPDDXGpYoIPa/exec";
const DEPARTMENT = "ASU_E";          // ใช้โหลด services
const DEPARTMENT_LABEL = "การสร้างเจ้าของธุรกิจฯ_2";             // ชื่อที่จะเก็บลงชีท
const JSON_URL = "https://nuchbu-stack.github.io/ss/q0Options.json";

/********************
 * i18n
 ********************/
const I18N = {
  th: {
    titleMain: "แบบประเมินความพึงพอใจ",
    titleSub: "คณะการสร้างเจ้าของธุรกิจและการบริหารกิจการ (SEM)",

    qUser_label: "ผู้รับบริการคือ",
    qUser_student: "นักศึกษา",
    qUser_staff: "บุคลากรของมหาวิทยาลัย",
    qUser_parent: "ผู้ปกครอง / ศิษย์เก่า",
    qUser_external: "หน่วยงานภายนอก",
    qUser_error: "กรุณาเลือกผู้รับบริการ",

    q0_label: "เรื่องที่รับบริการ",
    q0_placeholder: "-- กรุณาเลือก --",
    q0_error: "กรุณาเลือกเรื่องที่รับบริการ",
    q0_other_placeholder: "โปรดระบุเรื่องที่รับบริการ",   // <-- เพิ่มบรรทัดนี้

    q1_label: "ระดับความพึงพอใจของท่าน",
    q1_5: "มากที่สุด",
    q1_4: "มาก",
    q1_3: "ปานกลาง",
    q1_2: "น้อย",
    q1_1: "น้อยที่สุด",
    q1_error: "กรุณาเลือกระดับความพึงพอใจ",

    q2_label: "ท่านไม่พึงพอใจในเรื่องใด",
    q2_opt_staff: "มรรยาทและความเต็มใจในการให้บริการ",
    q2_opt_delay: "ระยะเวลาที่ใช้ในการให้บริการ",
    q2_opt_accuracy: "ความสามารถในการให้ข้อมูลอย่างถูกต้อง",
    q2_opt_facility: "ความพร้อมของอุปกรณ์และสถานที่ (Facility)",
    q2_opt_other: "อื่นๆ",
    q2_other_placeholder: "โปรดระบุ",
    q2_error: "กรุณาเลือกหรือระบุเรื่องที่ไม่พึงพอใจ",

    q3_label: "ข้อเสนอแนะ/ข้อร้องเรียน",
    q3_placeholder: "พิมพ์ข้อความเพิ่มเติม",

    submit: "ส่งแบบประเมิน",
    thank_title: "รับข้อมูลเรียบร้อยแล้ว ขอบคุณค่ะ 🙏",
    thank_desc: "คุณสามารถเลือกทำแบบสอบถามใหม่หรือปิดหน้านี้ได้",
    thank_autoreturn: "กลับไปหน้าฟอร์มอัตโนมัติใน",
    thank_again: "ทำแบบสอบถามอีกครั้ง",
  },
  en: {
    titleMain: "Satisfaction Evaluation Form",
    titleSub: "School of Entrepreneurship and Management (SEM)",

    qUser_label: "Service Recipient: You are...",
    qUser_student: "Student",
    qUser_staff: "BU Personnel",
    qUser_parent: "Parent / Alumnus",
    qUser_external: "External Organization",
    qUser_error: "Please select the service recipient.",

    q0_label: "Service Category",
    q0_placeholder: "-- Please select --",
    q0_error: "Please select the service topic.",
    q0_other_placeholder: "Please specify the service received.", // <-- เพิ่มบรรทัดนี้

    q1_label: "Your satisfaction/dissatisfaction level.",
    q1_5: "Most satisfied",
    q1_4: "Very satisfied",
    q1_3: "Neutral",
    q1_2: "Somewhat dissatisfied",
    q1_1: "Very dissatisfied",
    q1_error: "Please select your satisfaction level.",

    q2_label: "Which aspect were you dissatisfied with?",
    q2_opt_staff: "Manner and willingness of the staff",
    q2_opt_delay: "Time taken to provide the service",
    q2_opt_accuracy: "Correctness of information provided",
    q2_opt_facility: "Adequacy and readiness of equipment and venue (Facility)",
    q2_opt_other: "Other(s)",
    q2_other_placeholder: "Please specify",
    q2_error: "Please select or specify what made you dissatisfied",

    q3_label: "Suggestions / Complaints",
    q3_placeholder: "Type your message here",

    submit: "Submit",
    thank_title: "Your response has been successfully recorded.\nThank you 🙏",
    thank_desc: "You may choose to complete another survey or close this page.",
    thank_autoreturn: "Returning to the form automatically in",
    thank_again: "Submit another response",
  }
};


let CURRENT_LANG = localStorage.getItem("lang") || "th";

function renderHeader(lang = "th") {
  const t = I18N_HEADER[lang] || I18N_HEADER.th;
  document.getElementById("title-main").textContent = t.titleMain;
  document.getElementById("title-sub").textContent = t.titleSub;
}

function isOther(val) {
  if (!val) return false;
  const s = val.toString().trim().toLowerCase();
  // ไทย: อื่น, อื่นๆ, อื่น ๆ, อื่นๆ (โปรดระบุ) ฯลฯ
  if (/^อื่น(\s*ๆ)?/.test(s)) return true;
  // EN: other, others, other., others., other (please specify) ฯลฯ
  if (s.startsWith('other')) return true; // ครอบคลุม others/other./other (...)
  return false;
}

/********************
 * Auto return timers
 ********************/
let autoBackTimer = null;
let countdownTimer = null;
const autoReturnNote = document.getElementById("autoReturnNote");

// ใช้เป็น state กลางของเลขวินาที
let countdownSeconds = 10;

// อย่า cache element; หาใหม่ทุกครั้ง เพราะเราเขียนทับ innerHTML ตอนสลับภาษา
function getCountdownEl() {
  return document.getElementById("countdown");
}


function bumpCountdown() {
  const el = getCountdownEl();
  if (!el) return;
  el.classList.remove("animate");
  void el.offsetWidth;
  el.classList.add("animate");
}

function backToForm() {
  if (autoBackTimer) { clearTimeout(autoBackTimer); autoBackTimer = null; }
  if (countdownTimer) { clearInterval(countdownTimer); countdownTimer = null; }

  thankYou.classList.add("hidden");
  form.classList.remove("hidden");

  if (autoReturnNote) autoReturnNote.style.display = "none";

  // รีเซ็ตตัวเลขกลับเป็น 10 และอัปเดตลง DOM (ถ้ามี)
  countdownSeconds = 10;
  const cEl = getCountdownEl();
  if (cEl) {
    cEl.textContent = countdownSeconds;
    cEl.classList.remove("animate");
  }

  // …(โค้ดล้าง error/รีเซ็ต UI อื่น ๆ คงเดิม)…
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/********************
 * Helpers: error texts (เปลี่ยนสดตอนสลับภาษา)
 ********************/
function setErrorText(elId, i18nKey) {
  const el = document.getElementById(elId);
  if (!el) return;
  const t = I18N[CURRENT_LANG]?.[i18nKey];
  if (t) el.textContent = t;
}
function updateErrorTexts() {
  setErrorText("qUserError","qUser_error");
  setErrorText("q0Error","q0_error");
  setErrorText("q1Error","q1_error");
  setErrorText("q2Error","q2_error");
}

/********************
 * Load Services (Q0)
 * เก็บค่า value เป็น "ไทยเสมอ" เพื่อทำสรุปในชีทง่าย
 * รองรับ options เป็น string (ไทยล้วน) หรือ object { th, en }
 ********************/

// แปลง option เป็น { value, label } โดย:
//   value = ไทย (canonical) เสมอ
//   label = แสดงตามภาษา UI ปัจจุบัน
function buildQ0OptionObj(item, lang) {
  if (typeof item === "string") {
    const v = item.trim();                 // ไทยล้วน
    return { value: v, label: v };         // ไม่มี en ก็แสดงไทยไป
  }
  const th = (item?.th || "").trim();
  const en = (item?.en || "").trim();
  const value = th || en;                  // ถ้าไม่มี th จริง ๆ ค่อย fallback เป็น en
  const label = (lang === "th") ? (th || en) : (en || th);
  return { value, label };
}

async function loadServices() {
  try {
    q0.disabled = true;
    q0.innerHTML = `<option disabled selected>${I18N[CURRENT_LANG].q0_placeholder}</option>`;

    const res = await fetch(JSON_URL + "?v=" + Date.now());
    const data = await res.json();

    // เปิด/ปิด QUser ตาม Features.UserType
    const hasUserType = !!data?.Features?.UserType?.includes(DEPARTMENT);
    qUserSection?.classList.toggle("hidden", !hasUserType);
    if (!hasUserType) document.getElementById("qUserError")?.classList.add("hidden");

    // ดึง config ของหน่วยงาน
    let conf = data[DEPARTMENT];
    // เผื่อรูปแบบเก่าเป็น array ของ string ไทยล้วน
    if (Array.isArray(conf)) conf = { hasServices: true, options: conf };

    // ไม่มี Q0 สำหรับหน่วยนี้
    if (!conf || conf.hasServices === false) {
      q0Section?.classList.add("hidden");
      q0.disabled = true;
      q0.value = "--";
      q0Other.value = "";
      q0Other.classList.add("hidden");
      return;
    }

    // เติม option: value=ไทยเสมอ, label=ตามภาษา UI
    q0.innerHTML = `<option value="" disabled selected>${I18N[CURRENT_LANG].q0_placeholder}</option>`;
    conf.options.forEach(item => {
      const { value, label } = buildQ0OptionObj(item, CURRENT_LANG);
      if (!value || !label) return;
      const opt = document.createElement("option");
      opt.value = value;       // ✅ ส่งไปชีทเป็น "ไทย" เสมอ
      opt.textContent = label; // 👁️ เห็นตามภาษา UI
      q0.appendChild(opt);
    });

    q0.disabled = false;
    q0Section?.classList.remove("hidden");

    // อัปเดต placeholder ของช่อง "ระบุเรื่องฯ" ให้ตรงภาษา
    if (q0Other) q0Other.placeholder = I18N[CURRENT_LANG].q0_other_placeholder;

  } catch (err) {
    console.error("โหลด services.json ไม่ได้", err);
    q0Section?.classList.add("hidden");
    q0.disabled = true;
    q0.value = "--";
    q0Other.value = "";
    q0Other.classList.add("hidden");
  }
}

// เรียกครั้งแรก
loadServices();


/********************
 * QUser
 ********************/
document.querySelectorAll('input[name="qUser"]').forEach(radio => {
  radio.addEventListener("change", () => {
    document.getElementById("qUserError")?.classList.add("hidden");
  });
});

/********************
 * Q0 other toggle
 ********************/
q0.addEventListener("change", () => {
  document.getElementById("q0Error")?.classList.add("hidden");
  const v = q0.value;
  if (isOther(q0.value)) {
    q0Other.classList.remove("hidden");
  } else {
    q0Other.classList.add("hidden");
    q0Other.value = "";
  }
});
q0Other.addEventListener("input", () => {
  if (q0Other.value.trim() !== "") {
    document.getElementById("q0Error")?.classList.add("hidden");
  }
});

/********************
 * Q1 / Q2
 ********************/
let q1Value = "";
q1Options.forEach(opt => {
  opt.addEventListener("click", () => {
    q1Options.forEach(o => o.classList.remove("active"));
    opt.classList.add("active");
    q1Value = opt.dataset.value;

    document.getElementById("q1Error")?.classList.add("hidden");

    if (q1Value === "1" || q1Value === "2") {
      q2Section.classList.remove("hidden");
      document.getElementById("q2Error")?.classList.add("hidden");
    } else {
      q2Section.classList.add("hidden");
      document.querySelectorAll('input[name="q2"]').forEach(r => r.checked = false);
      q2Other.value = "";
      q2Other.classList.add("hidden");
    }
  });
});
document.querySelectorAll('input[name="q2"]').forEach(radio => {
  radio.addEventListener("change", () => {
    document.getElementById("q2Error")?.classList.add("hidden");
    if (isOther(radio.value)) {
      q2Other.classList.remove("hidden");
    } else {
      q2Other.classList.add("hidden");
      q2Other.value = "";
    }
  });
});
q2Other.addEventListener("input", () => {
  if (q2Other.value.trim() !== "") {
    document.getElementById("q2Error")?.classList.add("hidden");
  }
});

/********************
 * Submit
 ********************/
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  let valid = true;

  // QUser
  let finalQUser = "--";
  const isQUserVisible = !!(qUserSection && qUserSection.offsetParent !== null);
  if (isQUserVisible) {
    const qUserChecked = document.querySelector("input[name='qUser']:checked");
    if (!qUserChecked) {
      setErrorText("qUserError","qUser_error");
      document.getElementById("qUserError")?.classList.remove("hidden");
      valid = false;
    } else {
      finalQUser = qUserChecked.value;
      document.getElementById("qUserError")?.classList.add("hidden");
    }
  } else {
    document.getElementById("qUserError")?.classList.add("hidden");
  }

  // Q0
  let finalQ0 = "--";
  if (!q0Section.classList.contains("hidden")) {
    finalQ0 = isOther(q0.value)
              ? q0Other.value.trim()
              : q0.value;

    if (!finalQ0) {
      setErrorText("q0Error","q0_error");
      document.getElementById("q0Error")?.classList.remove("hidden");
      valid = false;
    } else {
      document.getElementById("q0Error")?.classList.add("hidden");
    }
  } else {
    document.getElementById("q0Error")?.classList.add("hidden");
  }

  // Q1
  if (!q1Value) {
    setErrorText("q1Error","q1_error");
    document.getElementById("q1Error")?.classList.remove("hidden");
    valid = false;
  } else {
    document.getElementById("q1Error")?.classList.add("hidden");
  }

  // Q2
  let finalQ2 = "";
  if (q1Value === "1" || q1Value === "2") {
    const q2Checked = document.querySelector("input[name='q2']:checked");
    if (!q2Checked) {
      setErrorText("q2Error","q2_error");
      document.getElementById("q2Error")?.classList.remove("hidden");
      valid = false;
    } else {
      finalQ2 = isOther(q2Checked.value)
        ? q2Other.value.trim()
        : q2Checked.value;

      if (isOther(q2Checked.value) && !finalQ2) {
        setErrorText("q2Error","q2_error");
        document.getElementById("q2Error")?.classList.remove("hidden");
        valid = false;
      } else {
        document.getElementById("q2Error")?.classList.add("hidden");
      }
    }
  }

  if (!valid) return;

  // ส่งข้อมูล (background) + ไปหน้า Thank You ทันที
  const payload = new URLSearchParams({
    department: DEPARTMENT_LABEL,
    qUser: finalQUser,
    q0: finalQ0,
    q1: q1Value,
    q2: finalQ2,
    q3: document.getElementById("q3").value.trim()
  });

  form.classList.add("hidden");
  thankYou.classList.remove("hidden");

  // ===== เริ่มจับเวลา 10 วินาทีเพื่อกลับหน้าฟอร์มอัตโนมัติ =====
  countdownSeconds = 10;

  // แสดงค่าเริ่มต้น
  {
    const el = getCountdownEl();
    if (el) {
      el.textContent = countdownSeconds;
      el.classList.add("animate");
      setTimeout(() => el.classList.remove("animate"), 400);
    }
  }

  if (autoReturnNote) autoReturnNote.style.display = "block";

  // เดินนาฬิกา
  if (countdownTimer) clearInterval(countdownTimer);
  countdownTimer = setInterval(() => {
    countdownSeconds -= 1;
    const el = getCountdownEl();
    if (el) {
      el.textContent = countdownSeconds;
      bumpCountdown();
    }
    if (countdownSeconds <= 0) {
      clearInterval(countdownTimer);
      countdownTimer = null;
    }
  }, 1000);

  // ตั้งเวลารีเทิร์นกลับฟอร์ม
  if (autoBackTimer) clearTimeout(autoBackTimer);
  autoBackTimer = setTimeout(() => {
    backToForm();
  }, 10000);


  // reset UI
  form.reset();
  q0Other.classList.add("hidden");
  q1Options.forEach(o => o.classList.remove("active"));
  q1Value = "";
  q2Section.classList.add("hidden");
  q2Other.classList.add("hidden");
  document.querySelectorAll('input[name="qUser"]').forEach(r => (r.checked = false));
  document.getElementById("qUserError")?.classList.add("hidden");

  fetch(GAS_URL + "?cachebust=" + Date.now(), {
    method: "POST",
    body: new URLSearchParams(payload)
  }).catch(err => console.error("ส่งข้อมูลไม่สำเร็จ (background)", err));
});

/********************
 * Language switch
 ********************/
function applyLang(lang) {
  CURRENT_LANG = lang;
  localStorage.setItem("lang", lang);
  const t = I18N[lang];

  // ▼ เปลี่ยนหัวข้อ
  document.getElementById("title-main")
    ?.replaceChildren(document.createTextNode(t.titleMain));
  document.getElementById("title-sub")
    ?.replaceChildren(document.createTextNode(t.titleSub));


  // QUser label & options (ต้องมี id ตามนี้ใน HTML)
  document.getElementById("qUserLabel")?.replaceChildren(document.createTextNode(t.qUser_label));
  [
    ["qUser_student_text","qUser_student"],
    ["qUser_staff_text","qUser_staff"],
    ["qUser_parent_text","qUser_parent"],
    ["qUser_external_text","qUser_external"],
  ].forEach(([id,key])=>{
    const el = document.getElementById(id);
    if (el) el.textContent = t[key];
  });

  // Q0 label + placeholder
  document.getElementById("q0Label")?.replaceChildren(document.createTextNode(t.q0_label));
  const first = q0?.querySelector("option[disabled]");
  if (first) first.textContent = t.q0_placeholder;

  // Q0 placeholder (select)
  if (q0) {
    const first = q0.querySelector("option[disabled]");
    if (first) first.textContent = t.q0_placeholder;
  }

  // Q0 other placeholder (input)
  if (q0Other) {
    q0Other.placeholder = t.q0_other_placeholder;   // <-- ตั้งตามภาษาเดียว
  }


  // Q1 captions (ต้องมี .option-X span)
  [
    [".option-5 span", t.q1_5],
    [".option-4 span", t.q1_4],
    [".option-3 span", t.q1_3],
    [".option-2 span", t.q1_2],
    [".option-1 span", t.q1_1],
  ].forEach(([sel,txt])=>{
    const el = document.querySelector(sel);
    if (el) el.textContent = txt;
  });
  document.getElementById("q1Label")?.replaceChildren(document.createTextNode(t.q1_label));

  // Q2 texts
  document.getElementById("q2Label")?.replaceChildren(document.createTextNode(t.q2_label));
  [
    ["q2_opt_staff_text", t.q2_opt_staff],
    ["q2_opt_delay_text", t.q2_opt_delay],
    ["q2_opt_accuracy_text", t.q2_opt_accuracy],
    ["q2_opt_facility_text", t.q2_opt_facility],
    ["q2_opt_other_text", t.q2_opt_other],
  ].forEach(([id,txt]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = txt;
  });
  const q2OtherEl = document.getElementById("q2Other");
  if (q2OtherEl) {
    q2OtherEl.placeholder = (lang === "th")
      ? `${I18N.th.q2_other_placeholder} / ${I18N.en.q2_other_placeholder}`
      : I18N.en.q2_other_placeholder;
  }

  // Q3
  document.getElementById("q3Label")?.replaceChildren(document.createTextNode(t.q3_label));
  const q3 = document.getElementById("q3"); if (q3) q3.placeholder = t.q3_placeholder;

  const submitBtn = document.getElementById("submitBtn");
  if (submitBtn) submitBtn.textContent = t.submit;   // <<< บรรทัดนี้สำคัญ

  // Thank You texts
  const thankTitle = document.getElementById("thankTitle");
  if (thankTitle) thankTitle.textContent = t.thank_title;

  const thankDesc = document.getElementById("thankDesc");
  if (thankDesc) thankDesc.textContent = t.thank_desc;

  const againBtn = document.getElementById("againBtn");
  if (againBtn) againBtn.textContent = t.thank_again;

  const autoReturnNoteEl = document.getElementById("autoReturnNote");
  if (autoReturnNoteEl) {
    autoReturnNoteEl.innerHTML = `${I18N[lang].thank_autoreturn} <span id="countdown">${countdownSeconds}</span> ${
      lang === "th" ? "วินาที" : "seconds"
    }`;
  }

  // ปุ่มภาษา active
  document.querySelectorAll(".lang-btn").forEach(b =>
    b.classList.toggle("active", b.dataset.lang === lang)
  );

  // โหลด Q0 ใหม่ตามภาษา + อัปเดต error ที่กำลังโชว์อยู่
  loadServices();
  updateErrorTexts();
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".lang-btn").forEach(btn => {
    btn.addEventListener("click", () => applyLang(btn.dataset.lang));
  });
  applyLang(CURRENT_LANG);

  // ✅ Event delegation ให้ปุ่ม "ทำแบบสอบถามอีกครั้ง" (againBtn)
  // ทำงานได้แม้ DOM ถูก re-render จากการสลับภาษา
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("#againBtn");
    if (!btn) return;
    backToForm();
  });

});
