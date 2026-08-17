document.addEventListener('DOMContentLoaded', () => {
  if (authManager.isAuthenticated()) {
    window.location.href = '/dashboard';
  }

  const form = document.getElementById('loginForm');
  const errorDiv = document.getElementById('error');
  const successDiv = document.getElementById('success');

  form.addEventListener('submit', async e => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    errorDiv.style.display = 'none';
    successDiv.style.display = 'none';

    const result = await authManager.login(email, password);

    if (result.success) {
      successDiv.textContent = 'Login successful! Redirecting...';
      successDiv.style.display = 'block';
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1000);
    } else {
      errorDiv.textContent = result.message || 'Login failed';
      errorDiv.style.display = 'block';
    }
  });
});
