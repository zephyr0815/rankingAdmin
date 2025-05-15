// public/js/authAdmin.js
import * as Api from './apiAdmin.js';

document.addEventListener("DOMContentLoaded", () => {
  console.log('authAdmin.js loaded');

  const form = document.getElementById("adminLoginForm");
  if (!form) {
    // Not on login page — expose API for logout usage (navbar, etc.)
    window.authAdmin = Api.authAdmin;
    window.Api = { authAdmin: Api.authAdmin };
    return;
  }

  const sidInput = document.getElementById("sid");
  const pwInput  = document.getElementById("passwd");
  const btn      = form.querySelector("button[type='submit']");

  form.addEventListener("submit", async e => {
    e.preventDefault();
    btn.disabled = true;
    btn.textContent = "Signing in...";

    try {
      const res = await Api.authAdmin.slogin({
        sid: sidInput.value.trim(),
        passwd: pwInput.value.trim()
      });

      // Save token
      localStorage.setItem('adminToken', res.token);

      Swal.fire({
        icon: 'success',
        title: 'Welcome Admin!',
        text: 'Login successful',
        background: '#010116',
        color: '#ffffff',
        confirmButtonColor: '#6c5ce7'
      }).then(() => {
        window.location.href = '/dashboard'; // adjust if needed
      });

    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: err.message,
        background: '#010116',
        color: '#ffffff',
        confirmButtonColor: '#e74c3c'
      });
    } finally {
      btn.disabled = false;
      btn.textContent = "Sign In";
    }
  });

  // Expose globally only after setup to avoid undefined errors
  window.authAdmin = Api.authAdmin;
  window.Api = { authAdmin: Api.authAdmin };
});
