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
    q0_label: "เรื่องที่รับบริการ",
    q0_placeholder: "-- กรุณาเลือก –-",
    q1_label: "ระดับความพึงพอใจของท่าน",
    q1_5: "มากที่สุด",
    q1_4: "มาก",
    q1_3: "ปานกลาง",
    q1_2: "น้อย",
    q1_1: "น้อยที่สุด",
    q2_label: "ท่านไม่พึงพอใจในเรื่องใด",
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
    q0_label: "Service Category",
    q0_placeholder: "-- Please select –-",
    q1_label: "Your satisfaction/dissatisfaction level.",
    q1_5: "Most satisfied",
    q1_4: "Very satisfied",
    q1_3: "Neutral",
    q1_2: "Somewhat dissatisfied",
    q1_1: "Very dissatisfied",
    q2_label: "What made you dissatisfied.",
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
  q1Value = "";
  q2Value = "";
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
 * Load Services (Q0)
 * - รองรับ q0Options.json แบบผสม:
 *   1) array ของ string (ไทยล้วน)
 *   2) object { hasServices, options:[string | {th,en}] }
 * - รองรับ Features.UserType เพื่อแสดง/ซ่อน qUserSection
 ********************/
async function loadServices() {
  try {
    q0.disabled = true;
    q0.innerHTML = `<option disabled selected>${I18N[CURRENT_LANG].q0_placeholder}</option>`;

    const res = await fetch(JSON_URL + "?v=" + Date.now()); // กัน cache เวลาเพิ่งแก้
    const data = await res.json();

    // === แสดง/ซ่อน QUser ตาม Features.UserType ===
    const hasUserType = data.Features
      && Array.isArray(data.Features.UserType)
      && data.Features.UserType.includes(DEPARTMENT);

    if (hasUserType) {
      qUserSection?.classList.remove("hidden");
      const qUserErr = document.getElementById("qUserError");
      if (qUserErr) qUserErr.classList.add("hidden");
    } else {
      qUserSection?.classList.add("hidden");
    }

    // === ค่าของหน่วยงาน ===
    let conf = data[DEPARTMENT];

    // รองรับรูปแบบเดิมที่เป็น array (ไทยล้วน)
    if (Array.isArray(conf)) {
      conf = { hasServices: true, options: conf };
    }

    if (!conf || conf.hasServices === false) {
      // ไม่มี Q0 สำหรับหน่วยนี้
      q0Section?.classList.add("hidden");
      q0.required = false;
      q0.disabled = false;
      q0.value = "--";
      q0Other.value = "";
      q0Other.classList.add("hidden");
      return;
    }

    // เติม options โดยดูภาษาปัจจุบัน
    q0.innerHTML = `<option value="" disabled selected>${I18N[CURRENT_LANG].q0_placeholder}</option>`;
    conf.options.forEach(item => {
      const text = (typeof item === "string")
        ? item
        : (item[CURRENT_LANG] || item.th || item.en || "");
      if (!text) return;
      const opt = document.createElement("option");
      opt.value = text;          // เก็บค่าเป็นข้อความที่เห็น (ง่ายสุด)
      opt.textContent = text;
      q0.appendChild(opt);
    });

    q0.disabled = false;
    q0Section?.classList.remove("hidden");
    q0.required = true;

  } catch (err) {
    console.error("โหลด services.json ไม่ได้", err);
    // โหลดไม่ได้ → ซ่อน Q0
    q0Section?.classList.add("hidden");
    q0.disabled = true;
    q0.value = "--";
    q0Other.value = "";
    q0Other.classList.add("hidden");
  }
}

// ครั้งแรก
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

  // QUser
  let finalQUser = "--";
  if (!qUserSection.classList.contains("hidden")) {
    const qUserChecked = document.querySelector("input[name='qUser']:checked");
    if (!qUserChecked) {
      document.getElementById("qUserError")?.classList.remove("hidden");
      valid = false;
    } else {
      finalQUser = qUserChecked.value;
      document.getElementById("qUserError")?.classList.add("hidden");
    }
  }

  // Q0
  let finalQ0 = "--";
  if (!q0Section.classList.contains("hidden")) {
    finalQ0 = (q0.value === "อื่นๆ" || q0.value === "Other" || q0.value === "อื่นๆ (โปรดระบุ)" || q0.value === "Other (please specify)")
      ? q0Other.value.trim()
      : q0.value;

    if (!finalQ0) {
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
      document.getElementById("q2Error")?.classList.remove("hidden");
      valid = false;
    } else {
      finalQ2 = (q2Checked.value === "อื่นๆ" || q2Checked.value?.toLowerCase() === "other")
        ? q2Other.value.trim()
        : q2Checked.value;
      if ((q2Checked.value === "อื่นๆ" || q2Checked.value?.toLowerCase() === "other") && !finalQ2) {
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

  // เริ่มจับเวลา auto return
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

  // ส่งเบื้องหลัง
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
 * - คาดว่าใน HTML มีปุ่ม .lang-btn[data-lang="th|en"]
 * - รองรับกรณีไม่มี element บางตัว (ใช้ ?. / เช็ค null)
 ********************/
function applyLang(lang) {
  CURRENT_LANG = lang;
  localStorage.setItem("lang", lang);
  const t = I18N[lang];

  // Header texts (ถ้ามี id ตามนี้)
  document.getElementById("title-main")?.replaceChildren(document.createTextNode(t.titleMain));
  document.getElementById("title-sub")?.replaceChildren(document.createTextNode(t.titleSub));

  // Labels (ถ้ามี id ตามนี้ใน HTML)
  document.getElementById("q0Label")?.replaceChildren(document.createTextNode(t.q0_label));
  document.getElementById("q1Label")?.replaceChildren(document.createTextNode(t.q1_label));
  document.getElementById("q2Label")?.replaceChildren(document.createTextNode(t.q2_label));
  document.getElementById("q3Label")?.replaceChildren(document.createTextNode(t.q3_label));

  // QUser label + options
  document.getElementById("qUserLabel")
    ?.replaceChildren(document.createTextNode(I18N[lang].qUser_label));

  const mapQUser = [
    ["qUser_student_text",  I18N[lang].qUser_student,  "นักศึกษา"],
    ["qUser_staff_text",    I18N[lang].qUser_staff,    "บุคลากรของมหาวิทยาลัย"],
    ["qUser_parent_text",   I18N[lang].qUser_parent,   "ผู้ปกครอง / ศิษย์เก่า"],
    ["qUser_external_text", I18N[lang].qUser_external, "หน่วยงานภายนอก"],
  ];

  mapQUser.forEach(([id, txtEnOrTh, thaiValue]) => {
    const el = document.getElementById(id);
    if (!el) return;

    // แสดงสองภาษาแบบกระชับ: ไทย / EN
    if (lang === "th") {
      el.textContent = `${thaiValue} - ${I18N.en[id.replace("_text","")] || ""}`.trim();
    } else {
      el.textContent = `${txtEnOrTh}`;
    }
  });


  // Q1 captions
  const captions = [
    { sel: ".option-5 span", txt: t.q1_5 },
    { sel: ".option-4 span", txt: t.q1_4 },
    { sel: ".option-3 span", txt: t.q1_3 },
    { sel: ".option-2 span", txt: t.q1_2 },
    { sel: ".option-1 span", txt: t.q1_1 }
  ];
  captions.forEach(c => {
    const el = document.querySelector(c.sel);
    if (el) el.textContent = c.txt;
  });

  // Q0 placeholder
  if (q0) {
    const first = q0.querySelector("option[disabled]");
    if (first) first.textContent = t.q0_placeholder;
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

  // ปุ่มภาษา active state
  document.querySelectorAll(".lang-btn").forEach(b => b.classList.toggle("active", b.dataset.lang === lang));

  // รีเรนเดอร์ Q0 ให้ตรงภาษา
  loadServices();
}

// bind ปุ่มภาษา + set initial language
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".lang-btn").forEach(btn => {
    btn.addEventListener("click", () => applyLang(btn.dataset.lang));
  });
  applyLang(CURRENT_LANG);
});
