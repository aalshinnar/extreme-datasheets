let currentPage = 1;
let currentQuery = '';
let currentProduct = '';
let currentCategory = '';

document.addEventListener('DOMContentLoaded', () => {
  if (!authManager.isAuthenticated()) {
    window.location.href = '/login';
    return;
  }

  const greeting = document.getElementById('userGreeting');
  if (greeting && authManager.user) {
    const firstName = authManager.user.firstName || authManager.user.email;
    greeting.textContent = `Welcome back, ${firstName}!`;
  }

  document.getElementById('searchBtn').addEventListener('click', performSearch);
  document.getElementById('searchInput').addEventListener('keypress', e => {
    if (e.key === 'Enter') performSearch();
  });

  setupModal();
  loadDatasheets();
});

async function performSearch() {
  currentPage = 1;
  currentQuery = document.getElementById('searchInput').value;
  currentProduct = document.getElementById('productFilter').value;
  currentCategory = document.getElementById('categoryFilter').value;
  loadDatasheets();
}

async function loadDatasheets(page = 1) {
  const loadingSpinner = document.getElementById('loadingSpinner');
  const datasheetsList = document.getElementById('datasheetsList');
  const noResults = document.getElementById('noResults');

  loadingSpinner.style.display = 'block';
  datasheetsList.innerHTML = '';
  noResults.style.display = 'none';

  try {
    let url = `/api/datasheets/search?page=${page}&limit=12`;
    if (currentQuery) url += `&q=${encodeURIComponent(currentQuery)}`;
    if (currentProduct) url += `&product=${encodeURIComponent(currentProduct)}`;
    if (currentCategory) url += `&category=${encodeURIComponent(currentCategory)}`;

    const response = await authManager.fetchWithAuth(url);
    if (!response.ok) throw new Error('Failed to load datasheets');

    const data = await response.json();

    if (data.datasheets.length === 0) {
      noResults.style.display = 'block';
    } else {
      displayDatasheets(data.datasheets);
    }

    displayPagination(data.pagination);
  } catch (error) {
    console.error('Error loading datasheets:', error);
    noResults.textContent = 'Error loading datasheets. Please try again.';
    noResults.style.display = 'block';
  } finally {
    loadingSpinner.style.display = 'none';
  }
}

function displayDatasheets(datasheets) {
  const datasheetsList = document.getElementById('datasheetsList');
  datasheetsList.innerHTML = '';

  datasheets.forEach(datasheet => {
    const card = document.createElement('div');
    card.className = 'datasheet-card';

    const description = datasheet.description ? datasheet.description.substring(0, 100) + '...' : 'No description';

    card.innerHTML = `
      <div class="datasheet-header">
        <h4>${datasheet.title}</h4>
      </div>
      <div class="datasheet-body">
        <span class="datasheet-product">${datasheet.product}</span>
        <div class="datasheet-meta">
          <span>📁 ${datasheet.fileFormat.toUpperCase()}</span>
          <span>📊 ${(datasheet.fileSize / 1024 / 1024).toFixed(2)} MB</span>
          <span>⬇️ ${datasheet.downloadCount} downloads</span>
        </div>
        <p class="datasheet-description">${description}</p>
        ${datasheet.category ? `<p style="color: #999; font-size: 0.85rem;">Category: ${datasheet.category}</p>` : ''}
        <div class="datasheet-footer">
          <button class="btn btn-primary" onclick="showDatasheetModal('${datasheet._id}', '${datasheet.title}', '${datasheet.description || ''}', '${datasheet.fileSize}', '${datasheet.downloadCount}')">View Details</button>
          <button class="btn btn-secondary" onclick="downloadDatasheet('${datasheet._id}', '${datasheet.fileName}')">Download</button>
        </div>
      </div>
    `;

    datasheetsList.appendChild(card);
  });
}

function displayPagination(pagination) {
  const paginationDiv = document.getElementById('pagination');
  paginationDiv.innerHTML = '';

  if (pagination.pages <= 1) return;

  const prevBtn = document.createElement('button');
  prevBtn.textContent = '← Previous';
  prevBtn.disabled = pagination.page === 1;
  prevBtn.addEventListener('click', () => {
    if (pagination.page > 1) loadDatasheets(pagination.page - 1);
  });
  paginationDiv.appendChild(prevBtn);

  for (let i = 1; i <= pagination.pages; i++) {
    if (i === pagination.page || i === 1 || i === pagination.pages || Math.abs(i - pagination.page) <= 1) {
      const btn = document.createElement('button');
      btn.textContent = i;
      btn.addEventListener('click', () => loadDatasheets(i));
      if (i === pagination.page) btn.className = 'active';
      paginationDiv.appendChild(btn);
    } else if (i === 2 && pagination.page > 3) {
      const dots = document.createElement('span');
      dots.textContent = '...';
      paginationDiv.appendChild(dots);
    }
  }

  const nextBtn = document.createElement('button');
  nextBtn.textContent = 'Next →';
  nextBtn.disabled = pagination.page === pagination.pages;
  nextBtn.addEventListener('click', () => {
    if (pagination.page < pagination.pages) loadDatasheets(pagination.page + 1);
  });
  paginationDiv.appendChild(nextBtn);
}

function setupModal() {
  const modal = document.getElementById('downloadModal');
  const closeBtn = document.querySelector('.close');

  closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  window.addEventListener('click', e => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });
}

function showDatasheetModal(id, title, description, fileSize, downloadCount) {
  const modal = document.getElementById('downloadModal');
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalDescription').textContent = description || 'No description available';

  const fileSizeMB = (fileSize / 1024 / 1024).toFixed(2);
  document.getElementById('modalStats').innerHTML = `
    <strong>File Size:</strong> ${fileSizeMB} MB<br>
    <strong>Total Downloads:</strong> ${downloadCount}<br>
    <strong>Format:</strong> PDF
  `;

  const downloadBtn = document.getElementById('downloadBtn');
  downloadBtn.onclick = () => downloadDatasheet(id, null);

  modal.style.display = 'flex';
}

async function downloadDatasheet(id, fileName) {
  try {
    const response = await authManager.fetchWithAuth(`/api/datasheets/${id}/download`);

    if (!response.ok) throw new Error('Download failed');

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName || `datasheet-${id}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    const modal = document.getElementById('downloadModal');
    modal.style.display = 'none';
  } catch (error) {
    console.error('Download error:', error);
    alert('Download failed. Please try again.');
  }
}
