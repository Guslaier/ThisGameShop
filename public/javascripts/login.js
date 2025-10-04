
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const togglePassword = document.getElementById("togglePassword");
  const passwordInput = document.getElementById("password");
  const loginButton = document.querySelector(".login-btn");

  // 👁️ Toggle password visibility
  togglePassword.addEventListener("click", () => {
    const isPassword = passwordInput.getAttribute("type") === "password";
    passwordInput.setAttribute("type", isPassword ? "text" : "password");


    togglePassword.classList.remove("fi-rr-eye", "fi-sr-eye-crossed");

    // Change icon depending on state
    if (isPassword) {
      togglePassword.classList.add("fi-sr-eye-crossed"); // show crossed eye when visible
    } else {
      togglePassword.classList.add("fi-rr-eye"); // show open eye when hidden
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
        window.location.href = "/";
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
