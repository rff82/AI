/* Farpa.ai - Admin Dashboard */

const API_BASE = 'https://api-leads.rfelipefernandes.workers.dev/api';
const ADMIN_PATH = window.location.pathname.includes('/admin') ? '/admin' : '';

// Função para resolver URLs relativas corretamente
function resolveUrl(path) {
  if (path.startsWith('http')) return path;
  return ADMIN_PATH + path;
}
let leadsData = [];
let chartsInstances = {};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  initializeMenus();
  loadDashboardData();
  setupSearch();
});

// Menu Navigation
function initializeMenus() {
  const menuItems = document.querySelectorAll('.menu-item');
  menuItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const section = item.dataset.section;
      showSection(section);
      
      // Update active menu item
      document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));
      item.classList.add('active');
    });
  });
}

function showSection(sectionId) {
  // Hide all sections
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  
  // Show selected section
  const section = document.getElementById(sectionId);
  if (section) {
    section.classList.add('active');
    
    // Load data based on section
    if (sectionId === 'leads') {
      loadLeadsTable();
    } else if (sectionId === 'dashboard') {
      loadDashboardData();
    }
  }
}

// Load Dashboard Data
async function loadDashboardData() {
  try {
    const response = await fetch(`${API_BASE}/leads`);
    const result = await response.json();
    
    leadsData = result.results || [];
    
    // Calculate stats
    const totalLeads = leadsData.length;
    const today = new Date().toISOString().split('T')[0];
    const leadsToday = leadsData.filter(l => l.created_at.startsWith(today)).length;
    
    // Update stat cards
    document.getElementById('total-leads').textContent = totalLeads;
    document.getElementById('leads-today').textContent = leadsToday;
    document.getElementById('unique-visitors').textContent = Math.floor(totalLeads * 3.5); // Estimation
    document.getElementById('conversion-rate').textContent = ((leadsToday / Math.max(totalLeads, 1)) * 100).toFixed(1) + '%';
    
    // Draw charts
    drawLeadsChart();
    drawCountriesChart();
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
  }
}

// Load Leads Table
async function loadLeadsTable() {
  try {
    const response = await fetch(`${API_BASE}/leads`);
    const result = await response.json();
    
    leadsData = result.results || [];
    renderLeadsTable(leadsData);
  } catch (error) {
    console.error('Erro ao carregar leads:', error);
    document.getElementById('leads-tbody').innerHTML = '<tr><td colspan="6" class="error-message">Erro ao carregar leads</td></tr>';
  }
}

// Render Leads Table
function renderLeadsTable(leads) {
  const tbody = document.getElementById('leads-tbody');
  
  if (leads.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="loading">Nenhum lead encontrado</td></tr>';
    return;
  }
  
  tbody.innerHTML = leads.map(lead => `
    <tr>
      <td>${lead.name || '-'}</td>
      <td>${lead.email}</td>
      <td>${lead.phone || '-'}</td>
      <td>${lead.interest || '-'}</td>
      <td>${new Date(lead.created_at).toLocaleDateString('pt-BR')}</td>
      <td>
        <button class="action-btn" onclick="copyToClipboard('${lead.email}')">Copiar Email</button>
        <button class="action-btn delete" onclick="deleteLead('${lead.email}')">Deletar</button>
      </td>
    </tr>
  `).join('');
}

// Search Leads
function setupSearch() {
  const searchBox = document.getElementById('search-leads');
  if (searchBox) {
    searchBox.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      const filtered = leadsData.filter(lead =>
        lead.name.toLowerCase().includes(query) ||
        lead.email.toLowerCase().includes(query)
      );
      renderLeadsTable(filtered);
    });
  }
}

// Copy to Clipboard
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    alert('Email copiado para a área de transferência!');
  });
}

// Delete Lead
async function deleteLead(email) {
  if (!confirm(`Tem certeza que deseja deletar o lead ${email}?`)) {
    return;
  }
  
  // Note: This is a placeholder. The actual delete functionality would need
  // to be implemented in the Worker API
  alert('Funcionalidade de exclusão será implementada em breve.');
}

// Draw Leads Chart
function drawLeadsChart() {
  const ctx = document.getElementById('leadsChart');
  if (!ctx) return;
  
  // Group leads by day
  const leadsPerDay = {};
  leadsData.forEach(lead => {
    const date = new Date(lead.created_at).toLocaleDateString('pt-BR');
    leadsPerDay[date] = (leadsPerDay[date] || 0) + 1;
  });
  
  const labels = Object.keys(leadsPerDay).slice(-7);
  const data = labels.map(label => leadsPerDay[label] || 0);
  
  // Destroy existing chart if it exists
  if (chartsInstances.leadsChart) {
    chartsInstances.leadsChart.destroy();
  }
  
  chartsInstances.leadsChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Novos Leads',
        data: data,
        borderColor: '#00ff88',
        backgroundColor: 'rgba(0, 255, 136, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#00ff88',
        pointBorderColor: '#0a0a0a',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          labels: {
            color: '#f0f0ef',
            font: { size: 12 }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { color: '#a0a0a0' },
          grid: { color: '#2a2a2a' }
        },
        x: {
          ticks: { color: '#a0a0a0' },
          grid: { color: '#2a2a2a' }
        }
      }
    }
  });
}

// Draw Countries Chart
function drawCountriesChart() {
  const ctx = document.getElementById('countriesChart');
  if (!ctx) return;
  
  // Simulated data (in production, this would come from Cloudflare Analytics API)
  const countries = {
    'Brasil': 45,
    'Portugal': 15,
    'EUA': 20,
    'Outros': 20
  };
  
  // Destroy existing chart if it exists
  if (chartsInstances.countriesChart) {
    chartsInstances.countriesChart.destroy();
  }
  
  chartsInstances.countriesChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: Object.keys(countries),
      datasets: [{
        data: Object.values(countries),
        backgroundColor: [
          '#00ff88',
          '#00e5ff',
          '#ff3b3b',
          '#a0a0a0'
        ],
        borderColor: '#0a0a0a',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          labels: {
            color: '#f0f0ef',
            font: { size: 12 }
          }
        }
      }
    }
  });
}

// Logout
function handleLogout() {
  // In production, this would clear the session/token
  alert('Logout implementado via Cloudflare Access');
  window.location.href = '/';
}

// Export to CSV
function exportLeadsToCSV() {
  if (leadsData.length === 0) {
    alert('Nenhum lead para exportar');
    return;
  }
  
  const headers = ['Nome', 'Email', 'Telefone', 'Interesse', 'Data'];
  const rows = leadsData.map(lead => [
    lead.name,
    lead.email,
    lead.phone || '-',
    lead.interest || '-',
    new Date(lead.created_at).toLocaleDateString('pt-BR')
  ]);
  
  const csv = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `leads-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
}
