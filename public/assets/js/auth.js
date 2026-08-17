const API_URL = '/api';

class AuthManager {
  constructor() {
    this.token = localStorage.getItem('accessToken');
    this.user = JSON.parse(localStorage.getItem('user') || 'null');
    this.initializeAuth();
  }

  initializeAuth() {
    this.updateNavigation();
    this.setupLogout();
  }

  updateNavigation() {
    const isAuthenticated = !!this.token;
    const loginLink = document.getElementById('loginLink');
    const registerLink = document.getElementById('registerLink');
    const dashboardLink = document.getElementById('dashboardLink');
    const logoutBtn = document.getElementById('logoutBtn');
    const userEmail = document.getElementById('userEmail');

    if (loginLink) loginLink.style.display = isAuthenticated ? 'none' : 'block';
    if (registerLink) registerLink.style.display = isAuthenticated ? 'none' : 'block';
    if (dashboardLink) dashboardLink.style.display = isAuthenticated ? 'block' : 'none';
    if (logoutBtn) logoutBtn.style.display = isAuthenticated ? 'block' : 'none';

    if (userEmail && this.user) {
      userEmail.textContent = this.user.email;
    }

    const heroLoginBtn = document.getElementById('heroLoginBtn');
    const heroRegisterBtn = document.getElementById('heroRegisterBtn');
    if (heroLoginBtn) heroLoginBtn.style.display = isAuthenticated ? 'none' : 'block';
    if (heroRegisterBtn) heroRegisterBtn.style.display = isAuthenticated ? 'none' : 'block';
  }

  setupLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => this.logout());
    }
  }

  async register(email, password, firstName, lastName) {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, firstName, lastName }),
      });
      const data = await response.json();
      return { success: response.ok, message: data.message, data };
    } catch (error) {
      return { success: false, message: 'Network error' };
    }
  }

  async verifyEmail(token) {
    try {
      const response = await fetch(`${API_URL}/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const data = await response.json();
      return { success: response.ok, message: data.message };
    } catch (error) {
      return { success: false, message: 'Network error' };
    }
  }

  async login(email, password) {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (response.ok) {
        this.setToken(data.accessToken, data.refreshToken);
        this.user = data.user;
        localStorage.setItem('user', JSON.stringify(data.user));
        this.updateNavigation();
      }

      return { success: response.ok, message: data.message, data };
    } catch (error) {
      return { success: false, message: 'Network error' };
    }
  }

  setToken(accessToken, refreshToken) {
    this.token = accessToken;
    localStorage.setItem('accessToken', accessToken);
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
  }

  logout() {
    this.token = null;
    this.user = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    this.updateNavigation();
    window.location.href = '/';
  }

  isAuthenticated() {
    return !!this.token;
  }

  getToken() {
    return this.token;
  }

  getHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }
    return headers;
  }

  async fetchWithAuth(url, options = {}) {
    const headers = this.getHeaders();
    const response = await fetch(url, {
      ...options,
      headers: { ...headers, ...options.headers },
    });

    if (response.status === 401) {
      this.logout();
      throw new Error('Unauthorized');
    }

    return response;
  }
}

const authManager = new AuthManager();
