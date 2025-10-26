// === This Game Shop - Register Script (fixed) ===
// === This Game Shop - Register Script (fixed) ===
document.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.getElementById("registerForm");
  const sendOtpBtn = document.getElementById("sendOtpBtn");
  const verifyOtpBtn = document.getElementById("verifyOtpBtn");
  const otpWrap = document.querySelector(".otp-wrap");
  const registerBtn = document.getElementById("registerBtn");

  const togglePassword = document.getElementById("togglePassword");
  const togglePasswordConfirm = document.getElementById("togglePasswordConfirm");
  const passwordInput = document.getElementById("password");
  const passwordConfirmInput = document.getElementById("passwordConfirm");

  let otpVerified = false;

  // 👁️ Toggle password visibility
 if (togglePassword && passwordInput) {
    togglePassword.addEventListener("click", () => {
      const isPassword = passwordInput.getAttribute("type") === "password";
      passwordInput.setAttribute("type", isPassword ? "text" : "password");

      // ล้างเฉพาะคลาสที่เกี่ยวกับไอคอน แล้วสลับ rr ↔ rr-crossed
      togglePassword.classList.remove("fi-rr-eye", "fi-rr-eye-crossed", "fi-sr-eye", "fi-sr-eye-crossed");
      togglePassword.classList.add(isPassword ? "fi-rr-eye-crossed" : "fi-rr-eye");
    });
  }

  // ✅ ส่ง OTP
  sendOtpBtn.addEventListener("click", async () => {
    const email = document.getElementById("email").value.trim();
    if (!email) {
      Swal.fire("Warning", "Please enter your email first", "warning");
      return;
    }
    sendOtpBtn.disabled = true;
    sendOtpBtn.textContent = "Sending...";
    try {
      const res = await fetch("/account/generate-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("Failed to send OTP");
      Swal.fire("OTP Sent", "Check your email for the verification code!", "success");
      otpWrap.style.display = "flex";
      sendOtpBtn.textContent = "Resend OTP";
    } catch (err) {
      Swal.fire("Error", "Failed to send OTP", "error");
      sendOtpBtn.textContent = "Send OTP";
    } finally {
      sendOtpBtn.disabled = false;
    }
  });
  // ✅ ส่ง OTP
  sendOtpBtn.addEventListener("click", async () => {
    const email = document.getElementById("email").value.trim();
    if (!email) {
      Swal.fire("Warning", "Please enter your email first", "warning");
      return;
    }
    sendOtpBtn.disabled = true;
    sendOtpBtn.textContent = "Sending...";
    try {
      const res = await fetch("/account/generate-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("Failed to send OTP");
      Swal.fire("OTP Sent", "Check your email for the verification code!", "success");
      otpWrap.style.display = "flex";
      sendOtpBtn.textContent = "Resend OTP";
    } catch (err) {
      Swal.fire("Error", "Failed to send OTP", "error");
      sendOtpBtn.textContent = "Send OTP";
    } finally {
      sendOtpBtn.disabled = false;
    }
  });

  // ✅ ตรวจสอบ OTP
  verifyOtpBtn.addEventListener("click", async () => {
    const email = document.getElementById("email").value.trim();
    const otp = document.getElementById("otp").value.trim();
    if (!otp) {
      Swal.fire("Warning", "Please enter the OTP", "warning");
      return;
    }
    verifyOtpBtn.disabled = true;
    verifyOtpBtn.textContent = "Checking...";
    try {
      const res = await fetch("/account/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.status === true) {
        otpVerified = true;
        registerBtn.disabled = false; // ✅ เปิดปุ่มสมัคร
        Swal.fire("Success", "OTP verified successfully!", "success");
        verifyOtpBtn.textContent = "✅ Verified";
        verifyOtpBtn.style.background = "green";
        verifyOtpBtn.style.cursor = "default";
        verifyOtpBtn.disabled = true; // ล็อกหลังยืนยันแล้ว
      } else {
        Swal.fire("Error", "Invalid OTP", "error");
        verifyOtpBtn.textContent = "Verify";
        verifyOtpBtn.disabled = false;
      }
    } catch (err) {
      Swal.fire("Error", "Verification failed", "error");
      verifyOtpBtn.textContent = "Verify";
      verifyOtpBtn.disabled = false;
    }
  });
  // ✅ ตรวจสอบ OTP
  verifyOtpBtn.addEventListener("click", async () => {
    const email = document.getElementById("email").value.trim();
    const otp = document.getElementById("otp").value.trim();
    if (!otp) {
      Swal.fire("Warning", "Please enter the OTP", "warning");
      return;
    }
    verifyOtpBtn.disabled = true;
    verifyOtpBtn.textContent = "Checking...";
    try {
      const res = await fetch("/account/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.status === true) {
        otpVerified = true;
        registerBtn.disabled = false; // ✅ เปิดปุ่มสมัคร
        Swal.fire("Success", "OTP verified successfully!", "success");
        verifyOtpBtn.textContent = "✅ Verified";
        verifyOtpBtn.style.background = "green";
        verifyOtpBtn.style.cursor = "default";
        verifyOtpBtn.disabled = true; // ล็อกหลังยืนยันแล้ว
      } else {
        Swal.fire("Error", "Invalid OTP", "error");
        verifyOtpBtn.textContent = "Verify";
        verifyOtpBtn.disabled = false;
      }
    } catch (err) {
      Swal.fire("Error", "Verification failed", "error");
      verifyOtpBtn.textContent = "Verify";
      verifyOtpBtn.disabled = false;
    }
  });

  // 🚀 ส่งฟอร์มสมัคร
  registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!otpVerified) {
      Swal.fire("Warning", "Please verify your OTP before registering", "warning");
      return;
    }

    const formData = new FormData(registerForm);
    const data = Object.fromEntries(formData.entries());

    if (data.password !== data.password_confirm) {
      Swal.fire("Error", "Passwords do not match!", "error");
      return;
    }

    registerBtn.disabled = true;
    const oldText = registerBtn.innerText;
    registerBtn.innerText = "Creating Account...";

    try {
      const res = await fetch("/account/register-sum", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          display_name: data.display_name,
          email: data.email,
          password: data.password,
          // ไม่ต้องส่ง otp ไปที่ endpoint สมัคร ถ้า backend ไม่ได้ใช้
        }),
      });

      // ป้องกันกรณีตอบไม่เป็น JSON
      const text = await res.text();
      let result;
      try { result = JSON.parse(text); } catch { result = { status: res.ok, message: text }; }

      if (result.status === true) {
        Swal.fire("Success", "Register Success!", "success").then(() => {
          window.location.href = "/account/login";
        });
      } else {
        Swal.fire("Register Failed", result.message || "Unknown error", "error");
        registerBtn.disabled = false;
        registerBtn.innerText = oldText;
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Server Error", "error");
      registerBtn.disabled = false;
      registerBtn.innerText = oldText;
    }
  });
});
