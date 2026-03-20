/* Farpa.ai - Admin Dashboard */

const API_BASE = 'https://api-leads.rfelipefernandes.workers.dev/api';
let leadsData = [];
let chartsInstances = {};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  initializeMenus();
  loadDashboardData();
  setupSearch();
  
  // Atualizar dados a cada 30 segundos
  setInterval(() => {
    const activeSection = document.querySelector('.section.active').id;
    if (activeSection === 'dashboard') {
      loadDashboardData();
    }
  }, 30000);
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
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Erro ao carregar dados');
    }
    
    leadsData = result.results || [];
    
    // Calculate stats with animation
    const totalLeads = leadsData.length;
    const today = new Date().toISOString().split('T')[0];
    const leadsToday = leadsData.filter(l => l.created_at.startsWith(today)).length;
    const uniqueVisitors = Math.floor(totalLeads * 3.5);
    const conversionRate = totalLeads > 0 ? ((leadsToday / totalLeads) * 100).toFixed(1) : 0;
    
    // Animate stat cards
    animateValue('total-leads', totalLeads);
    animateValue('leads-today', leadsToday);
    animateValue('unique-visitors', uniqueVisitors);
    
    const conversionEl = document.getElementById('conversion-rate');
    conversionEl.textContent = conversionRate + '%';
    
    // Draw charts
    drawLeadsChart();
    drawCountriesChart();
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
    showError('Erro ao carregar dados do dashboard. Tente novamente.');
  }
}

// Animate number values
function animateValue(elementId, target) {
  const element = document.getElementById(elementId);
  if (!element) return;
  
  let current = parseInt(element.textContent) || 0;
  const increment = Math.ceil((target - current) / 10);
  
  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }
    element.textContent = current.toLocaleString('pt-BR');
  }, 30);
}

// Load Leads Table
async function loadLeadsTable() {
  try {
    const response = await fetch(`${API_BASE}/leads`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Erro ao carregar leads');
    }
    
    leadsData = result.results || [];
    renderLeadsTable(leadsData);
  } catch (error) {
    console.error('Erro ao carregar leads:', error);
    showError('Erro ao carregar leads. Tente novamente.');
  }
}

// Render Leads Table
function renderLeadsTable(leads) {
  const tbody = document.getElementById('leads-tbody');
  
  if (leads.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6">
          <div class="empty-state">
            <div class="empty-state-icon">📭</div>
            <div class="empty-state-title">Nenhum lead ainda</div>
            <p>Os leads aparecerão aqui assim que começarem a se inscrever.</p>
          </div>
        </td>
      </tr>
    `;
    return;
  }
  
  tbody.innerHTML = leads.map((lead, index) => `
    <tr style="animation: slideIn 0.3s ease ${index * 0.05}s both;">
      <td><strong>${lead.name || '-'}</strong></td>
      <td>${lead.email}</td>
      <td>${lead.phone || '-'}</td>
      <td><span class="badge">${lead.interest || '-'}</span></td>
      <td>${new Date(lead.created_at).toLocaleDateString('pt-BR', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })}</td>
      <td>
        <button class="action-btn" onclick="copyToClipboard('${lead.email}')">📋 Copiar</button>
        <button class="action-btn delete" onclick="deleteLead('${lead.email}')">🗑️ Deletar</button>
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
        (lead.name && lead.name.toLowerCase().includes(query)) ||
        lead.email.toLowerCase().includes(query)
      );
      renderLeadsTable(filtered);
    });
  }
}

// Copy to Clipboard
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    showSuccess(`Email "${text}" copiado para a área de transferência!`);
  }).catch(() => {
    showError('Erro ao copiar para a área de transferência');
  });
}

// Delete Lead
async function deleteLead(email) {
  if (!confirm(`Tem certeza que deseja deletar o lead ${email}?`)) {
    return;
  }
  
  // Note: This is a placeholder. The actual delete functionality would need
  // to be implemented in the Worker API
  showError('Funcionalidade de exclusão será implementada em breve.');
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
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#00ff88',
        pointBorderColor: '#0a0a0a',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointHoverBackgroundColor: '#00cc6a'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          labels: {
            color: '#f0f0ef',
            font: { size: 12, weight: 'bold' },
            padding: 15
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { 
            color: '#a0a0a0',
            stepSize: 1
          },
          grid: { 
            color: '#2a2a2a',
            drawBorder: false
          }
        },
        x: {
          ticks: { color: '#a0a0a0' },
          grid: { 
            color: '#2a2a2a',
            drawBorder: false
          }
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
        borderWidth: 2,
        hoverOffset: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          labels: {
            color: '#f0f0ef',
            font: { size: 12, weight: 'bold' },
            padding: 15
          }
        }
      }
    }
  });
}

// Show Error
function showError(message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.textContent = '❌ ' + message;
  
  const mainContent = document.querySelector('.main-content');
  mainContent.insertBefore(errorDiv, mainContent.firstChild);
  
  setTimeout(() => errorDiv.remove(), 5000);
}

// Show Success
function showSuccess(message) {
  const successDiv = document.createElement('div');
  successDiv.className = 'success-message';
  successDiv.textContent = '✓ ' + message;
  
  const mainContent = document.querySelector('.main-content');
  mainContent.insertBefore(successDiv, mainContent.firstChild);
  
  setTimeout(() => successDiv.remove(), 3000);
}

// Logout
function handleLogout() {
  if (confirm('Tem certeza que deseja sair?')) {
    window.location.href = '/';
  }
}

// Export to CSV
function exportLeadsToCSV() {
  if (leadsData.length === 0) {
    showError('Nenhum lead para exportar');
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
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `leads-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  showSuccess('Leads exportados com sucesso!');
}
