const form = document.getElementById("surveyForm");
const q0 = document.getElementById("q0");
const q0Section = document.getElementById("q0Section");
const q0Other = document.getElementById("q0Other");
const q1Options = document.querySelectorAll("#q1Options .option");
const q2Section = document.getElementById("q2Section");
const q2Other = document.getElementById("q2Other");
const thankYou = document.getElementById("thankYou");
const submitButton = form.querySelector('button[type="submit"]');

// กำหนด URL ของ Google Apps Script ไว้ในตัวแปรคงที่
// *** แก้ไขตรงนี้: นำ Web App URL ที่ได้จากการ Deploy Code.gs มาวาง ***
const GAS_URL = "https://script.google.com/macros/s/AKfycbyGhPwMCqvXhU0TMue4AfU0TOo2Nms7Iy9kFCfun-wqYFrb7ntTB5uBUPDDXGpYoIPa/exec";
const DEPARTMENT = "OSS";  // ✅ หน่วยงานนี้  ใช้สำหรับโหลด services
const DEPARTMENT_LABEL = "OSS"; // เก็บลงชีท

// ใช้สำหรับโหลดตัวเลือก Q0 จากไฟล์ JSON (เร็ว)
const JSON_URL = "https://nuchbu-stack.github.io/ss/q0Options.json";


// เพิ่มตัวจับเวลา + ฟังก์ชันกลับหน้าฟอร์ม
let autoBackTimer = null;
let countdownTimer = null;
const autoReturnNote = document.getElementById("autoReturnNote");
const countdownEl = document.getElementById("countdown");

function backToForm() {
  // เคลียร์ตัวจับเวลาถ้ามี
  if (autoBackTimer) { clearTimeout(autoBackTimer); autoBackTimer = null; }
  if (countdownTimer) { clearInterval(countdownTimer); countdownTimer = null; }

  // ซ่อน thank you และกลับมาแสดงฟอร์ม
  thankYou.classList.add("hidden");
  form.classList.remove("hidden");
  // เลื่อนกลับขึ้นบน (กันกรณีฟอร์มยาว)
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function bumpCountdown() {
  if (!countdownEl) return;
  countdownEl.classList.remove("animate");
  void countdownEl.offsetWidth;   // 👈 บังคับ reflow
  countdownEl.classList.add("animate");
}

// โหลด services
async function loadServices() {
  try {
    q0.disabled = true;
    q0.innerHTML = `<option disabled selected>กำลังโหลด...</option>`;

    const res = await fetch(JSON_URL);
    const data = await res.json();

    const list = data[DEPARTMENT]; // อนุญาตให้ไม่มี key หรือเป็น []

    if (Array.isArray(list) && list.length > 0) {
      // ✅ มีข้อมูล → แสดง Q0 เป็น dropdown ปกติ
      q0.innerHTML = `<option value="" disabled selected>-- กรุณาเลือก --</option>`;
      list.forEach(item => {
        const opt = document.createElement("option");
        opt.value = item;
        opt.textContent = item;
        q0.appendChild(opt);
      });
      q0.disabled = false;
      q0Section.classList.remove("hidden");
    } else {
      // ❌ ไม่มีข้อมูล → ซ่อน Q0 และตั้งค่าที่จะบันทึกเป็น "--"
      q0Section.classList.add("hidden");
      q0.disabled = true;
      q0.value = "--";
      q0Other.value = "";
      q0Other.classList.add("hidden");
    }
  } catch (err) {
    console.error("โหลด services.json ไม่ได้", err);
    // กรณีโหลดไม่ได้ ก็ซ่อน Q0 เช่นกัน
    q0Section.classList.add("hidden");
    q0.disabled = true;
    q0.value = "--";
    q0Other.value = "";
    q0Other.classList.add("hidden");
  }
}

loadServices();



let q1Value = "";
let q2Value = "";

// แสดง/ซ่อน input อื่นๆ ของ Q0
q0.addEventListener("change", () => {

  document.getElementById("q0Error").classList.add("hidden");

  if (q0.value === "อื่นๆ") {
    q0Other.classList.remove("hidden");
  } else {
    q0Other.classList.add("hidden");
    q0Other.value = "";
  }
  document.getElementById("q0Error").classList.add("hidden");
});

q0Other.addEventListener("input", () => {
  if (q0Other.value.trim() !== "") {
    document.getElementById("q0Error").classList.add("hidden");
  }
});

// Q1 logic
q1Options.forEach(opt => {
  opt.addEventListener("click", () => {
    q1Options.forEach(o => o.classList.remove("active"));
    opt.classList.add("active");
    q1Value = opt.dataset.value;

    document.getElementById("q1Error").classList.add("hidden");

    if (q1Value === "1" || q1Value === "2") {
      q2Section.classList.remove("hidden");
      document.getElementById("q2Error").classList.add("hidden");    
    } else {
      q2Section.classList.add("hidden");
      document.querySelectorAll('input[name="q2"]').forEach(r => r.checked = false);
      q2Other.value = "";
      q2Other.classList.add("hidden");
    }
  });
});

// Q2 logic
document.querySelectorAll('input[name="q2"]').forEach(radio => {
  radio.addEventListener("change", () => {
    document.getElementById("q2Error").classList.add("hidden");
    if (radio.value === "อื่นๆ") {
      q2Other.classList.remove("hidden");
    } else {
      q2Other.classList.add("hidden");
      q2Other.value = "";
    }
  });
});

// Q2 อื่นๆ text input
q2Other.addEventListener("input", () => {
  if (q2Other.value.trim() !== "") {
    document.getElementById("q2Error").classList.add("hidden");
  }
});

// handle submit
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  let valid = true;

  // แทนที่โค้ดเดิมที่คำนวณ/ตรวจ Q0 ด้วยก้อนนี้
  let finalQ0 = "--"; // ค่า default เมื่อ Q0 ถูกซ่อน
  if (!q0Section.classList.contains("hidden")) {
    finalQ0 = (q0.value === "อื่นๆ") ? q0Other.value.trim() : q0.value;

    if (!finalQ0) {
      document.getElementById("q0Error").classList.remove("hidden");
      valid = false;
    } else {
      document.getElementById("q0Error").classList.add("hidden");
    }
  } else {
    // ซ่อนอยู่ → ไม่ต้องแสดง error
    document.getElementById("q0Error").classList.add("hidden");
  }

  
  if (!q1Value) {
    document.getElementById("q1Error").classList.remove("hidden");
    valid = false;
  } else {
    document.getElementById("q1Error").classList.add("hidden");
  }

  let finalQ2 = "";
  if (q1Value === "1" || q1Value === "2") {
    let q2Checked = document.querySelector("input[name='q2']:checked");
    if (!q2Checked) {
      document.getElementById("q2Error").classList.remove("hidden");
      valid = false;
    } else {
      finalQ2 = q2Checked.value === "อื่นๆ" ? q2Other.value.trim() : q2Checked.value;
      if (q2Checked.value === "อื่นๆ" && !finalQ2) {
        document.getElementById("q2Error").classList.remove("hidden");
        valid = false;
      } else {
        document.getElementById("q2Error").classList.add("hidden");
      }
    }
  }

  if (!valid) {
    return;
  }

  // ✅ เปลี่ยนวิธีส่งข้อมูลเพื่อแก้ปัญหา CORS โดยใช้ URLSearchParams และไม่ต้องระบุ Header
  const payload = new URLSearchParams({
    department: DEPARTMENT_LABEL,  // จะเก็บชีท    
    q0: finalQ0,
    q1: q1Value,
    q2: finalQ2,
    q3: document.getElementById("q3").value.trim()
  });

    // ✅ ไปหน้า Thank You ทันที
  form.classList.add("hidden");
  thankYou.classList.remove("hidden");

    // ===== เริ่มจับเวลา 10 วินาทีเพื่อกลับหน้าฟอร์มอัตโนมัติ =====
  let remain = 10;
  if (countdownEl) {
    countdownEl.textContent = remain;
    // เด้งครั้งแรกตอนเริ่มได้ด้วย (ถ้าชอบ)
    countdownEl.classList.add("animate");
    setTimeout(() => countdownEl.classList.remove("animate"), 400);
  }
  
  if (autoReturnNote) autoReturnNote.style.display = "block";

  if (countdownTimer) { clearInterval(countdownTimer); }
  countdownTimer = setInterval(() => {
    remain -= 1;
    if (countdownEl) {
      countdownEl.textContent = remain;
      bumpCountdown();  // 👈 เรียกทุกครั้งที่เลขเปลี่ยน
    }

    if (remain <= 0) {
      clearInterval(countdownTimer);
      countdownTimer = null;
    }
  }, 1000);

  if (autoBackTimer) { clearTimeout(autoBackTimer); }
  autoBackTimer = setTimeout(() => {
    backToForm();
  }, 10000);
  // ===== จบส่วน auto-return =====

  // Reset form
  form.reset();

  q0Other.classList.add("hidden");
  q1Options.forEach(o => o.classList.remove("active"));
  q1Value = "";
  q2Value = "";
  q2Section.classList.add("hidden");
  q2Other.classList.add("hidden");

    // ✅ ส่งข้อมูลไปเบื้องหลัง (ไม่ต้องรอผลลัพธ์)
  fetch(GAS_URL + "?cachebust=" + new Date().getTime(), {
    method: "POST",
    body: new URLSearchParams(payload)
  }).catch(err => {
    console.error("ส่งข้อมูลไม่สำเร็จ (background)", err);
  });

});


// ปุ่มทำแบบสอบถามอีกครั้ง
document.getElementById("againBtn").addEventListener("click", () => {
  backToForm(); // ← เรียกฟังก์ชันรวมที่เราสร้างไว้ข้างบน
});
