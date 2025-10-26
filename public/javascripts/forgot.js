// === Game Shop - Forgot Password (OTP) ===
document.addEventListener("DOMContentLoaded", () => {
    // ---------- CONFIG: จุดเดียวเปลี่ยนทั้งไฟล์ ----------
    const ENDPOINTS = {
        sendOtp: "/account/generate-otp", // POST { email }
        verifyOtp: "/account/verify-otp",   // POST { email, otp }
        resetPass: "/account/password/reset",        // POST { email, otp, new_password }
    };
    const forgotForm = document.getElementById("forgotForm");
    const sendOtpBtn = document.getElementById("sendOtpBtn");
    const verifyOtpBtn = document.getElementById("verifyOtpBtn");
    const otpWrap = document.querySelector(".otp-wrap");
    const resetBtn = document.getElementById("resetBtn");

    const togglePassword = document.getElementById("togglePassword");
    const togglePasswordConfirm = document.getElementById("togglePasswordConfirm");
    const passwordInput = document.getElementById("password");
    const passwordConfirmInput = document.getElementById("passwordConfirm");

    const emailInput = document.getElementById("email");
    const otpInput = document.getElementById("otp");

    let otpVerified = false;

    // ---------- Helpers ----------
    const swal = (title, text = "", icon = "info") =>
        Swal.fire(title, text, icon);

    if (togglePassword && passwordInput) {
        togglePassword.addEventListener("click", () => {
            const isPassword = passwordInput.getAttribute("type") === "text";
            passwordInput.setAttribute("type", isPassword ? "text" : "password");

            // ล้างเฉพาะคลาสที่เกี่ยวกับไอคอน แล้วสลับ rr ↔ rr-crossed
            togglePassword.classList.remove("fi-rr-eye", "fi-rr-eye-crossed", "fi-sr-eye", "fi-sr-eye-crossed");
            togglePassword.classList.add(isPassword ? "fi-rr-eye-crossed" : "fi-rr-eye");
        });


    }
    if (togglePasswordConfirm && passwordConfirmInput) {
        togglePasswordConfirm.addEventListener("click", () => {
            const isPassword = passwordConfirmInput.getAttribute("type") === "text";
            passwordConfirmInput.setAttribute("type", isPassword ? "text" : "password");

            // ล้างเฉพาะคลาสที่เกี่ยวกับไอคอน แล้วสลับ rr ↔ rr-crossed
            togglePasswordConfirm.classList.remove("fi-rr-eye", "fi-rr-eye-crossed", "fi-sr-eye", "fi-sr-eye-crossed");
            togglePasswordConfirm.classList.add(isPassword ? "fi-rr-eye-crossed" : "fi-rr-eye");
        });
    }
    // ---------- ส่ง OTP ----------
    sendOtpBtn.addEventListener("click", async () => {
        const email = emailInput.value.trim();
        if (!email) return swal("Warning", "Please enter your email", "warning");

        sendOtpBtn.disabled = true;
        sendOtpBtn.textContent = "Sending...";

        try {
            const res = await fetch(ENDPOINTS.sendOtp, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await res.json().catch(() => ({}));
            if (!res.ok || data.status === false) {
                throw new Error(data.message || "Failed to send OTP");
            }

            await Swal.fire("OTP Sent", "We’ve emailed you a 6-digit code.", "success");
            otpWrap.style.display = "flex";
            otpInput.focus();
            sendOtpBtn.textContent = "Resend OTP";
        } catch (err) {
            Swal.fire("Error", err.message || "Failed to send OTP", "error");
            sendOtpBtn.textContent = "Send OTP";
        } finally {
            sendOtpBtn.disabled = false;
        }
    });

    // ---------- ยืนยัน OTP ----------
    verifyOtpBtn.addEventListener("click", async () => {
        const email = emailInput.value.trim();
        const otp = otpInput.value.trim();

        if (!otp) return swal("Warning", "Please enter the OTP", "warning");

        verifyOtpBtn.disabled = true;
        verifyOtpBtn.textContent = "Checking...";

        try {
            const res = await fetch(ENDPOINTS.verifyOtp, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp }),
            });

            const data = await res.json().catch(() => ({}));
            if (!res.ok || data.status === false) {
                throw new Error(data.message || "Invalid OTP");
            }

            otpVerified = true;
            resetBtn.disabled = false;  // เปิดปุ่ม Reset
            await Swal.fire("Success", "OTP verified successfully!", "success");

            verifyOtpBtn.textContent = "✅ Verified";
            verifyOtpBtn.style.background = "green";
            verifyOtpBtn.style.cursor = "default";
            verifyOtpBtn.disabled = true;

            // ปิดการแก้ไขอีเมล/OTP เพื่อความปลอดภัย
            emailInput.readOnly = true;
            otpInput.readOnly = true;
            sendOtpBtn.disabled = true;
        } catch (err) {
            Swal.fire("Error", err.message || "Verification failed", "error");
            verifyOtpBtn.textContent = "Verify";
            verifyOtpBtn.disabled = false;
        }
    });

    // ---------- Reset Password ----------
    forgotForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        if (!otpVerified) {
            return swal("Warning", "Please verify your OTP first", "warning");
        }

        const formData = new FormData(forgotForm);
        const data = Object.fromEntries(formData.entries());

        if ((data.password || "").length < 8) {
            return swal("Error", "Password must be at least 8 characters", "error");
        }
        if (data.password !== data.password_confirm) {
            return swal("Error", "Passwords do not match", "error");
        }

        resetBtn.disabled = true;
        const oldText = resetBtn.innerText;
        resetBtn.innerText = "Resetting...";

        try {
            const res = await fetch(ENDPOINTS.resetPass, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: data.email,
                    otp: data.otp,             // ถ้า backend ไม่ต้องใช้ otp ในขั้น reset ให้ลบทิ้งได้
                    new_password: data.password
                }),
            });

            // ป้องกัน response ไม่ใช่ JSON
            const txt = await res.text();
            let result;
            try { result = JSON.parse(txt); } catch { result = { status: res.ok, message: txt }; }

            if (res.ok && result.status !== false) {
                await Swal.fire("Success", "Password reset successfully!", "success");
                window.location.href = "/account/login";
            } else {
                Swal.fire("Reset Failed", result.message || "Unable to reset password", "error");
                resetBtn.disabled = false;
                resetBtn.innerText = oldText;
            }
        } catch (err) {
            console.error(err);
            Swal.fire("Error", "Server Error", "error");
            resetBtn.disabled = false;
            resetBtn.innerText = oldText;
        }
    });
});
