const form = document.getElementById("surveyForm");
const q0 = document.getElementById("q0");
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


// โหลด services
async function loadServices() {
  try {
    q0.disabled = true;
    q0.innerHTML = `<option disabled selected>กำลังโหลด...</option>`;

    const res = await fetch(GAS_URL, { cache: "force-cache" });
    const data = await res.json();

    if (data[DEPARTMENT]) {
      q0.innerHTML = `<option value="" disabled selected>-- กรุณาเลือก --</option>`;
      data[DEPARTMENT].forEach(item => {
        const opt = document.createElement("option");
        opt.value = item;
        opt.textContent = item;
        q0.appendChild(opt);
      });
      q0.disabled = false;
    } else {
      q0.innerHTML = `<option disabled>ไม่พบข้อมูลบริการ</option>`;
    }
  } catch (err) {
    console.error("โหลด services ไม่ได้", err);
    q0.innerHTML = `<option disabled>โหลดข้อมูลไม่สำเร็จ</option>`;
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

  // Validation
  const finalQ0 = q0.value === "อื่นๆ" ? q0Other.value.trim() : q0.value;
  
  if (!finalQ0) {
    document.getElementById("q0Error").classList.remove("hidden");
    valid = false;
  } else {
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

  // Reset form
  form.reset();
  // ✅ reset ค่าในฟอร์มทั้งหมด
  form.reset();

  // ✅ ซ่อนช่อง reason และ otherService กลับไปเหมือนตอนเริ่ม
  document.getElementById("reasonContainer").classList.add("hidden");
  document.getElementById("otherServiceContainer").classList.add("hidden");

  // ✅ เคลียร์ค่าในช่องด้วย
  document.getElementById("otherService").value = "";
    
  q1Options.forEach(o => o.classList.remove("active"));
  q1Value = "";
  q2Value = "";
  q2Section.classList.add("hidden");
  q2Other.classList.add("hidden");

    // ✅ ส่งข้อมูลไปเบื้องหลัง (ไม่ต้องรอผลลัพธ์)
  fetch(GAS_URL + "?cachebust=" + new Date().getTime(), {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(payload)
  }).catch(err => {
    console.error("ส่งข้อมูลไม่สำเร็จ (background)", err);
  });

});


// ปุ่มทำใหม่
document.getElementById("againBtn").addEventListener("click", () => {
  thankYou.classList.add("hidden");
  form.classList.remove("hidden");
});