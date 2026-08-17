document.addEventListener('DOMContentLoaded', () => {
  if (authManager.isAuthenticated()) {
    window.location.href = '/dashboard';
  }

  const form = document.getElementById('registerForm');
  const errorDiv = document.getElementById('error');
  const successDiv = document.getElementById('success');

  form.addEventListener('submit', async e => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;

    errorDiv.style.display = 'none';
    successDiv.style.display = 'none';

    if (password !== confirmPassword) {
      errorDiv.textContent = 'Passwords do not match';
      errorDiv.style.display = 'block';
      return;
    }

    if (password.length < 8) {
      errorDiv.textContent = 'Password must be at least 8 characters';
      errorDiv.style.display = 'block';
      return;
    }

    const result = await authManager.register(email, password, firstName, lastName);

    if (result.success) {
      successDiv.textContent = 'Registration successful! Please check your email to verify your account.';
      successDiv.style.display = 'block';
      form.reset();
      setTimeout(() => {
        window.location.href = '/login';
      }, 3000);
    } else {
      errorDiv.textContent = result.message || 'Registration failed';
      errorDiv.style.display = 'block';
    }
  });
});
