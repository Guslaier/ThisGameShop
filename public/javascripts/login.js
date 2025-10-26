document.addEventListener("DOMContentLoaded", () => {
  const loginForm      = document.getElementById("loginForm");
  const togglePassword = document.getElementById("togglePassword");
  const passwordInput  = document.getElementById("password");
  const loginButton    = document.querySelector(".login-btn");

  // 👁️ Toggle password visibility (ใช้ rr ทั้งคู่)
  if (togglePassword && passwordInput) {
    togglePassword.addEventListener("click", () => {
      const isPassword = passwordInput.getAttribute("type") === "password";
      passwordInput.setAttribute("type", isPassword ? "text" : "password");

      // ล้างเฉพาะคลาสที่เกี่ยวกับไอคอน แล้วสลับ rr ↔ rr-crossed
      togglePassword.classList.remove("fi-rr-eye", "fi-rr-eye-crossed", "fi-sr-eye", "fi-sr-eye-crossed");
      togglePassword.classList.add(isPassword ? "fi-rr-eye-crossed" : "fi-rr-eye");
    });
  }

  // 🧷 กัน submit ซ้ำ
  let submitting = false;

  if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (submitting) return;
      submitting = true;

      const formData = new FormData(loginForm);
      const data = Object.fromEntries(formData.entries());

      try {
        if (loginButton) {
          loginButton.disabled = true;
          loginButton.innerText = "Logging in...";
        }

        const response = await fetch("/account/login-sm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        // รองรับกรณี response ไม่ใช่ JSON
        const raw = await response.text();
        let result;
        try { result = JSON.parse(raw); } catch { result = { status: response.ok, message: raw }; }

        if (result.status === true && result.redirectTo) {
          window.location.href = result.redirectTo;
        } else {
          if (window.Swal) {
            Swal.fire("Login Failed", result.message || "Invalid credentials", "error");
          } else {
            alert("❌ Login Failed: " + (result.message || "Invalid credentials"));
          }
          if (loginButton) {
            loginButton.disabled = false;
            loginButton.innerText = "Login";
          }
          submitting = false;
        }
      } catch (err) {
        console.error("Error:", err);
        if (window.Swal) {
          Swal.fire("Server Error", "Please try again.", "error");
        } else {
          alert("⚠️ Server Error");
        }
        if (loginButton) {
          loginButton.disabled = false;
          loginButton.innerText = "Login";
        }
        submitting = false;
      }
    });
  }
});
