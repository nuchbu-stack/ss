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

// ===== GAS & Config =====
const GAS_URL = "https://script.google.com/macros/s/AKfycbyGhPwMCqvXhU0TMue4AfU0TOo2Nms7Iy9kFCfun-wqYFrb7ntTB5uBUPDDXGpYoIPa/exec";
const DEPARTMENT = "ASU_E";                  // ใช้สำหรับโหลด services
const DEPARTMENT_LABEL = "การสร้างเจ้าของธุรกิจฯ"; // เก็บลงชีท
const JSON_URL = "https://nuchbu-stack.github.io/ss/q0Options.json";

/********************
 * i18n dictionary
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
    thank_title: "ขอบคุณสำหรับการประเมิน 🙏",
    thank_desc: "เราจะนำข้อเสนอแนะไปปรับปรุงบริการให้ดียิ่งขึ้น",
    again: "ทำแบบสอบถามอีกครั้ง"
  },
  en: {
    titleMain: "Satisfaction Evaluation Form",
    titleSub: "School of Entrepreneurship and Management",

    qUser_label: "Service Recipient: You are...",
    qUser_student: "Student",
    qUser_staff: "BU Personnel",
    qUser_parent: "Parent / Alumnus",
    qUser_external: "External Organization",
    qUser_error: "Please select the service recipient.",

    q0_label: "Service Category",
    q0_placeholder: "-- Please select --",
    q0_error: "Please select the service topic.",

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
    q2_opt_other: "Others",
    q2_other_placeholder: "Please specify",
    q2_error: "Please select or specify what made you dissatisfied",

    q3_label: "Suggestions / Complaints",
    q3_placeholder: "Type your message here",

    submit: "Submit",
    thank_title: "Thanks for your feedback 🙏",
    thank_desc: "We’ll use it to improve our services.",
    again: "Submit another response"
  }
};

let CURRENT_LANG = localStorage.getItem("lang") || "th";

/********************
 * Auto return timers
 ********************/
let autoBackTimer = null;
let countdownTimer = null;
const autoReturnNote = document.getElementById("autoReturnNote");
const countdownEl = document.getElementById("countdown");

function backToForm() {
  if (autoBackTimer) { clearTimeout(autoBackTimer); autoBackTimer = null; }
  if (countdownTimer) { clearInterval(countdownTimer); countdownTimer = null; }

  thankYou.classList.add("hidden");
  form.classList.remove("hidden");

  if (autoReturnNote) autoReturnNote.style.display = "none";
  if (countdownEl) {
    countdownEl.textContent = "10";
    countdownEl.classList.remove("animate");
  }

  const qUserErr = document.getElementById("qUserError");
  document.querySelectorAll("input[name='qUser']").forEach(r => r.checked = false);
  if (qUserErr) qUserErr.classList.add("hidden");

  const q0Err = document.getElementById("q0Error");
  const q1Err = document.getElementById("q1Error");
  const q2Err = document.getElementById("q2Error");
  if (q0Err) q0Err.classList.add("hidden");
  if (q1Err) q1Err.classList.add("hidden");
  if (q2Err) q2Err.classList.add("hidden");

  q1Options.forEach(o => o.classList.remove("active"));
  let q1Value = ""; // local reset if needed
  let q2Value = "";
  q2Section.classList.add("hidden");
  q2Other.classList.add("hidden");

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function bumpCountdown() {
  if (!countdownEl) return;
  countdownEl.classList.remove("animate");
  void countdownEl.offsetWidth;
  countdownEl.classList.add("animate");
}

/********************
 * Error text helpers (update while visible)
 ********************/
function setErrorText(elId, i18nKey) {
  const el = document.getElementById(elId);
  if (!el) return;
  const t = I18N[CURRENT_LANG]?.[i18nKey];
  if (t) el.textContent = t;
}

function updateErrorTexts() {
  setErrorText("qUserError", "qUser_error");
  setErrorText("q0Error", "q0_error");
  setErrorText("q1Error", "q1_error");
  setErrorText("q2Error", "q2_error");
}

/********************
 * Load Services (Q0)
 ********************/
async function loadServices() {
  try {
    q0.disabled = true;
    q0.innerHTML = `<option disabled selected>${I18N[CURRENT_LANG].q0_placeholder}</option>`;

    const res = await fetch(JSON_URL + "?v=" + Date.now());
    const data = await res.json();

    // QUser on/off by Features.UserType
    const hasUserType = data.Features
      && Array.isArray(data.Features.UserType)
      && data.Features.UserType.includes(DEPARTMENT);

    if (hasUserType) {
      qUserSection?.classList.remove("hidden");
      document.getElementById("qUserError")?.classList.add("hidden");
    } else {
      qUserSection?.classList.add("hidden");
    }

    // Department config
    let conf = data[DEPARTMENT];
    if (Array.isArray(conf)) {
      conf = { hasServices: true, options: conf };
    }

    if (!conf || conf.hasServices === false) {
      q0Section?.classList.add("hidden");
      q0.required = false;
      q0.disabled = false;
      q0.value = "--";
      q0Other.value = "";
      q0Other.classList.add("hidden");
      return;
    }

    // fill options by current lang
    q0.innerHTML = `<option value="" disabled selected>${I18N[CURRENT_LANG].q0_placeholder}</option>`;
    conf.options.forEach(item => {
      const text = (typeof item === "string")
        ? item
        : (item[CURRENT_LANG] || item.th || item.en || "");
      if (!text) return;
      const opt = document.createElement("option");
      opt.value = text;
      opt.textContent = text;
      q0.appendChild(opt);
    });

    q0.disabled = false;
    q0Section?.classList.remove("hidden");
    q0.required = true;

  } catch (err) {
    console.error("โหลด services.json ไม่ได้", err);
    q0Section?.classList.add("hidden");
    q0.disabled = true;
    q0.value = "--";
    q0Other.value = "";
    q0Other.classList.add("hidden");
  }
}

// initial load
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
 * Q0 show/hide "อื่นๆ"
 ********************/
q0.addEventListener("change", () => {
  document.getElementById("q0Error")?.classList.add("hidden");
  if (q0.value === "อื่นๆ" || q0.value === "Other" || q0.value === "อื่นๆ (โปรดระบุ)" || q0.value === "Other (please specify)") {
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
let q2Value = "";

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
    if (radio.value === "อื่นๆ" || radio.value?.toLowerCase() === "other") {
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

  // ==== QUser (ผู้รับบริการ)
  let finalQUser = "--";
  const qUserErrEl = document.getElementById("qUserError");

  function showQUserError() {
    setErrorText("qUserError", "qUser_error"); // <- ดึงจาก I18N เสมอ
    if (!qUserErrEl) return;
    qUserErrEl.classList.remove("hidden");
    qUserErrEl.style.display = "block";
    qUserErrEl.setAttribute("aria-live", "assertive");
  }

  function hideQUserError() {
    if (!qUserErrEl) return;
    qUserErrEl.classList.add("hidden");
    qUserErrEl.style.display = "";
  }

  const isQUserVisible = (() => {
    const el = document.getElementById("qUserSection");
    return !!(el && el.offsetParent !== null);
  })();

  if (isQUserVisible) {
    const qUserChecked = document.querySelector("input[name='qUser']:checked");
    if (!qUserChecked) {
      showQUserError();
      valid = false;
    } else {
      finalQUser = qUserChecked.value;
      hideQUserError();
    }
  } else {
    hideQUserError();
  }

  // ==== Q0
  let finalQ0 = "--";
  if (!q0Section.classList.contains("hidden")) {
    finalQ0 = (q0.value === "อื่นๆ" || q0.value === "Other" ||
               q0.value === "อื่นๆ (โปรดระบุ)" || q0.value === "Other (please specify)")
              ? q0Other.value.trim()
              : q0.value;

    if (!finalQ0) {
      setErrorText("q0Error", "q0_error"); // <- อัปเดตตามภาษา
      document.getElementById("q0Error")?.classList.remove("hidden");
      valid = false;
    } else {
      document.getElementById("q0Error")?.classList.add("hidden");
    }
  } else {
    document.getElementById("q0Error")?.classList.add("hidden");
  }

  // ==== Q1
  if (!q1Value) {
    setErrorText("q1Error", "q1_error"); // <- อัปเดตตามภาษา
    document.getElementById("q1Error")?.classList.remove("hidden");
    valid = false;
  } else {
    document.getElementById("q1Error")?.classList.add("hidden");
  }

  // ==== Q2
  let finalQ2 = "";
  if (q1Value === "1" || q1Value === "2") {
    const q2Checked = document.querySelector("input[name='q2']:checked");
    if (!q2Checked) {
      setErrorText("q2Error", "q2_error"); // <- อัปเดตตามภาษา
      document.getElementById("q2Error")?.classList.remove("hidden");
      valid = false;
    } else {
      finalQ2 = (q2Checked.value === "อื่นๆ" || q2Checked.value?.toLowerCase() === "other")
        ? q2Other.value.trim()
        : q2Checked.value;

      if ((q2Checked.value === "อื่นๆ" || q2Checked.value?.toLowerCase() === "other") && !finalQ2) {
        setErrorText("q2Error", "q2_error");
        document.getElementById("q2Error")?.classList.remove("hidden");
        valid = false;
      } else {
        document.getElementById("q2Error")?.classList.add("hidden");
      }
    }
  }

  if (!valid) return;

  const payload = new URLSearchParams({
    department: DEPARTMENT_LABEL,
    qUser: finalQUser,
    q0: finalQ0,
    q1: q1Value,
    q2: finalQ2,
    q3: document.getElementById("q3").value.trim()
  });

  // Thank You ทันที
  form.classList.add("hidden");
  thankYou.classList.remove("hidden");

  // Auto return
  let remain = 10;
  if (countdownEl) {
    countdownEl.textContent = remain;
    countdownEl.classList.add("animate");
    setTimeout(() => countdownEl.classList.remove("animate"), 400);
  }
  if (autoReturnNote) autoReturnNote.style.display = "block";
  if (countdownTimer) clearInterval(countdownTimer);
  countdownTimer = setInterval(() => {
    remain -= 1;
    if (countdownEl) {
      countdownEl.textContent = remain;
      bumpCountdown();
    }
    if (remain <= 0) {
      clearInterval(countdownTimer);
      countdownTimer = null;
    }
  }, 1000);
  if (autoBackTimer) clearTimeout(autoBackTimer);
  autoBackTimer = setTimeout(() => backToForm(), 10000);

  // Reset UI
  form.reset();
  q0Other.classList.add("hidden");
  q1Options.forEach(o => o.classList.remove("active"));
  q1Value = "";
  q2Value = "";
  q2Section.classList.add("hidden");
  q2Other.classList.add("hidden");
  document.querySelectorAll('input[name="qUser"]').forEach(r => (r.checked = false));
  document.getElementById("qUserError")?.classList.add("hidden");

  // Background send
  fetch(GAS_URL + "?cachebust=" + Date.now(), {
    method: "POST",
    body: new URLSearchParams(payload)
  }).catch(err => {
    console.error("ส่งข้อมูลไม่สำเร็จ (background)", err);
  });
});

// ทำอีกครั้ง
document.getElementById("againBtn").addEventListener("click", () => {
  backToForm();
});

/********************
 * Language switch
 ********************/
function applyLang(lang) {
  CURRENT_LANG = lang;
  localStorage.setItem("lang", lang);
  const t = I18N[lang];

  // Header
  document.getElementById("title-main")?.replaceChildren(document.createTextNode(t.titleMain));
  document.getElementById("title-sub")?.replaceChildren(document.createTextNode(t.titleSub));

  // Labels
  document.getElementById("q0Label")?.replaceChildren(document.createTextNode(t.q0_label));
  document.getElementById("q1Label")?.replaceChildren(document.createTextNode(t.q1_label));
  document.getElementById("q2Label")?.replaceChildren(document.createTextNode(t.q2_label));
  document.getElementById("q3Label")?.replaceChildren(document.createTextNode(t.q3_label));

  // QUser label & options
  document.getElementById("qUserLabel")?.replaceChildren(document.createTextNode(I18N[lang].qUser_label));
  [
    ["qUser_student_text",  "qUser_student"],
    ["qUser_staff_text",    "qUser_staff"],
    ["qUser_parent_text",   "qUser_parent"],
    ["qUser_external_text", "qUser_external"],
  ].forEach(([spanId, key]) => {
    const el = document.getElementById(spanId);
    if (el) el.textContent = I18N[lang][key];
  });

  // Q1 captions
  [
    [".option-5 span", t.q1_5],
    [".option-4 span", t.q1_4],
    [".option-3 span", t.q1_3],
    [".option-2 span", t.q1_2],
    [".option-1 span", t.q1_1],
  ].forEach(([sel, txt]) => {
    const el = document.querySelector(sel);
    if (el) el.textContent = txt;
  });

  // Q0 placeholder
  if (q0) {
    const first = q0.querySelector("option[disabled]");
    if (first) first.textContent = t.q0_placeholder;
  }

  // Q2 texts
  document.getElementById("q2Label")?.replaceChildren(document.createTextNode(I18N[lang].q2_label));
  [
    ["q2_opt_staff_text",   I18N[lang].q2_opt_staff],
    ["q2_opt_delay_text",   I18N[lang].q2_opt_delay],
    ["q2_opt_accuracy_text",I18N[lang].q2_opt_accuracy],
    ["q2_opt_facility_text",I18N[lang].q2_opt_facility],
    ["q2_opt_other_text",   I18N[lang].q2_opt_other],
  ].forEach(([id, txt]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = txt;
  });

  // Q2 other placeholder
  const q2OtherEl = document.getElementById("q2Other");
  if (q2OtherEl) {
    q2OtherEl.placeholder = (lang === "th")
      ? `${I18N.th.q2_other_placeholder} / ${I18N.en.q2_other_placeholder}`
      : I18N.en.q2_other_placeholder;
  }

  // Q3 placeholder
  const q3 = document.getElementById("q3");
  if (q3) q3.placeholder = t.q3_placeholder;

  // Buttons & thank you
  const submitBtn = document.getElementById("submitBtn");
  if (submitBtn) submitBtn.textContent = t.submit;
  document.querySelector("#thankYou h2")?.replaceChildren(document.createTextNode(t.thank_title));
  const thanksP = document.querySelector("#thankYou p");
  if (thanksP) thanksP.textContent = t.thank_desc;
  const againBtn = document.getElementById("againBtn");
  if (againBtn) againBtn.textContent = t.again;

  // Active lang button
  document.querySelectorAll(".lang-btn").forEach(b =>
    b.classList.toggle("active", b.dataset.lang === lang)
  );

  // Reload Q0 options for the chosen language
  loadServices();

  // ✅ Update any visible error texts to current language
  updateErrorTexts();
}

// bind language buttons + initial
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".lang-btn").forEach(btn => {
    btn.addEventListener("click", () => applyLang(btn.dataset.lang));
  });
  applyLang(CURRENT_LANG);
});
