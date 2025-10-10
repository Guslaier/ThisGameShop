
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const togglePassword = document.getElementById("togglePassword");
  const passwordInput = document.getElementById("password");
  const loginButton = document.querySelector(".login-btn");

  // 👁️ Toggle password visibility
  togglePassword.addEventListener("click", () => {
    const isPassword = passwordInput.getAttribute("type") === "password";
    passwordInput.setAttribute("type", isPassword ? "text" : "password");

    // ล้าง class เก่าออกทั้งหมดก่อน
    togglePassword.className = "fi";

    // เพิ่ม class ใหม่ตามสถานะ
    if (isPassword) {
      togglePassword.classList.add("fi-sr-eye-crossed"); // เมื่อแสดงรหัสผ่าน
    } else {
      togglePassword.classList.add("fi-rr-eye"); // เมื่อซ่อนรหัสผ่าน
    }
  });


  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(loginForm);
    const data = Object.fromEntries(formData.entries());

    try {

      loginButton.disabled = true;
      loginButton.innerText = "Logging in...";

      const response = await fetch("/account/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.status === true) {
        window.location.href = result.redirectTo;
      } else {
        alert("❌ Login Failed: " + result.message);
        loginButton.disabled = false;
        loginButton.innerText = "Login";
      }
    } catch (err) {
      alert("⚠️ Server Error");
      console.error("Error:", err);
      loginButton.disabled = false;
      loginButton.innerText = "Login";
    }
  });
});
