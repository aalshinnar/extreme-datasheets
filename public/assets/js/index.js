async function loadStatistics() {
  try {
    const response = await fetch('/api/datasheets/stats');
    if (!response.ok) throw new Error('Failed to load stats');

    const data = await response.json();
    document.getElementById('totalDatasheets').textContent = data.totalDatasheets;
    document.getElementById('totalDownloads').textContent = data.totalDownloads;
  } catch (error) {
    console.error('Error loading statistics:', error);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadStatistics();

  if (authManager.isAuthenticated()) {
    const heroLoginBtn = document.getElementById('heroLoginBtn');
    const heroRegisterBtn = document.getElementById('heroRegisterBtn');
    if (heroLoginBtn) heroLoginBtn.href = '/dashboard';
    if (heroRegisterBtn) heroRegisterBtn.style.display = 'none';
  }
});
