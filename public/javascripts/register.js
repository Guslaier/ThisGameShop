// === This Game Shop - Register Script ===
document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.getElementById("registerForm");
    const togglePassword = document.getElementById("togglePassword");
    const togglePasswordConfirm = document.getElementById("togglePasswordConfirm");
    const passwordInput = document.getElementById("password");
    const passwordConfirmInput = document.getElementById("passwordConfirm");
    const registerButton = document.querySelector(".register-btn");

    // 👁️ Toggle password visibility
    function toggleVisibility(icon, input) {
        const isPassword = input.getAttribute("type") === "password";
        input.setAttribute("type", isPassword ? "text" : "password");
        icon.classList.remove("fi-rr-eye", "fi-sr-eye-crossed");
        icon.classList.add(isPassword ? "fi-sr-eye-crossed" : "fi-rr-eye");
    }

    togglePassword.addEventListener("click", () => toggleVisibility(togglePassword, passwordInput));
    togglePasswordConfirm.addEventListener("click", () => toggleVisibility(togglePasswordConfirm, passwordConfirmInput));

    // 🚀 Handle register submit
    registerForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const formData = new FormData(registerForm);
        const data = Object.fromEntries(formData.entries());

        if (data.password !== data.password_confirm) {
            alert("❌ Passwords do not match!");
            return;
        }
        let response;
        try {
            registerButton.disabled = true;
            registerButton.innerText = "Creating Account...";
            response = await fetch("/account/register-sum", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });


        } catch (err) {
            alert("⚠️ Server Error");
            console.error("Error:", err);
            registerButton.disabled = false;
            registerButton.innerText = "Create Account";
        }
        const result = await response.json();

        if (result.status === true) {
            alert("🎉 Register Success!");
            window.location.href = "/account";
        } else {
            alert("❌ Register Failed: " + result.message);
            registerButton.disabled = false;
            registerButton.innerText = "Create Account";
        }
    });
});

 const sendOtpBtn = document.getElementById("sendOtpBtn");
 const verifyOtpBtn = document.getElementById("verifyOtpBtn");
    const otpWrap = document.querySelector(".otp-wrap");
    const registerBtn = document.getElementById("registerBtn");

    let otpVerified = false;

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
          body: JSON.stringify({ email })
        });
        const data = await res.text();

        Swal.fire("OTP Sent", "Check your email for the verification code!", "success");
        otpWrap.style.display = "flex";
      } catch (err) {
        Swal.fire("Error", "Failed to send OTP", "error");
      } finally {
        sendOtpBtn.disabled = false;
        sendOtpBtn.textContent = "Resend OTP";
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
          body: JSON.stringify({ email, otp })
        });

        const data = await res.json();
        if (data.status || otpVerified) {
          otpVerified = true;
          Swal.fire("Success", "OTP verified successfully!", "success");
          registerBtn.disabled = false;
          verifyOtpBtn.textContent = "✅ Verified";
          verifyOtpBtn.style.background = "green";
          verifyOtpBtn.style.cursor = "default";
        } else {
          Swal.fire("Error", "Invalid OTP", "error");
          verifyOtpBtn.textContent = "Verify";
        }
      } catch (err) {
        Swal.fire("Error", "Verification failed", "error");
      } finally {
        verifyOtpBtn.disabled = false;
      }
    });

    // ✅ ป้องกัน submit ถ้ายังไม่ verify OTP
    document.getElementById("registerForm").addEventListener("submit", (e) => {
      if (!otpVerified) {
        e.preventDefault();
        Swal.fire("Warning", "Please verify your OTP before registering", "warning");
      }
    });