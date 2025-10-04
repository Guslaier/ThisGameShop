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

    try {
      registerButton.disabled = true;
      registerButton.innerText = "Creating Account...";

      const response = await fetch("/account/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.status === true) {
        alert("🎉 Register Success!");
        window.location.href = "/login";
      } else {
        alert("❌ Register Failed: " + result.message);
        registerButton.disabled = false;
        registerButton.innerText = "Create Account";
      }
    } catch (err) {
      alert("⚠️ Server Error");
      console.error("Error:", err);
      registerButton.disabled = false;
      registerButton.innerText = "Create Account";
    }
  });
});
