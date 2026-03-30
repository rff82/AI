/* farpa.ai — Admin Dashboard */

const API_BASE = 'https://api-leads.rfelipefernandes.workers.dev/api';
let leadsData = [];
const chartsInstances = {};

function getActiveSectionId() {
  return document.querySelector('.section.active')?.id || '';
}

function fetchLeadResults(result) {
  if (Array.isArray(result?.results)) return result.results;
  if (Array.isArray(result)) return result;
  return [];
}

function showMessage(type, message) {
  const main = document.querySelector('.main');
  if (!main) return;

  const element = document.createElement('div');
  element.className = `${type}-message`;
  element.textContent = message;
  main.insertBefore(element, main.firstChild);
  setTimeout(() => element.remove(), type === 'error' ? 5000 : 3000);
}

function showError(message) {
  showMessage('error', message);
}

function showSuccess(message) {
  showMessage('success', message);
}

function animateValue(elementId, target) {
  const element = document.getElementById(elementId);
  if (!element) return;

  let current = parseInt(String(element.textContent).replace(/\D/g, ''), 10) || 0;
  const step = Math.max(1, Math.ceil((target - current) / 10));

  const timer = setInterval(() => {
    current += step;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }
    element.textContent = current.toLocaleString('pt-BR');
  }, 28);
}

function initializeMenus() {
  document.querySelectorAll('.menu-item').forEach((item) => {
    item.addEventListener('click', (event) => {
      event.preventDefault();
      const section = item.dataset.section;
      showSection(section);
      document.querySelectorAll('.menu-item').forEach((menuItem) => menuItem.classList.remove('active'));
      item.classList.add('active');
    });
  });
}

function showSection(sectionId) {
  document.querySelectorAll('.section').forEach((section) => section.classList.remove('active'));
  const section = document.getElementById(sectionId);
  if (!section) return;

  section.classList.add('active');
  if (sectionId === 'leads') {
    loadLeadsTable();
  } else if (sectionId === 'dashboard') {
    loadDashboardData();
  }
}

async function loadDashboardData() {
  try {
    const response = await fetch(`${API_BASE}/leads`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const result = await response.json();
    leadsData = fetchLeadResults(result);

    const totalLeads = leadsData.length;
    const today = new Date().toISOString().split('T')[0];
    const leadsToday = leadsData.filter((lead) => String(lead.created_at || '').startsWith(today)).length;

    animateValue('total-leads', totalLeads);
    animateValue('leads-today', leadsToday);
    animateValue('unique-visitors', Math.floor(totalLeads * 3.5));

    const conversionEl = document.getElementById('conversion-rate');
    if (conversionEl) {
      conversionEl.textContent = totalLeads > 0 ? `${((leadsToday / totalLeads) * 100).toFixed(1)}%` : '0%';
    }

    drawLeadsChart();
    drawCountriesChart();
  } catch (error) {
    console.error('Erro ao carregar dados do dashboard:', error);
    showError('Erro ao carregar dados do dashboard.');
  }
}

async function loadLeadsTable() {
  try {
    const response = await fetch(`${API_BASE}/leads`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const result = await response.json();
    leadsData = fetchLeadResults(result);
    renderLeadsTable(leadsData);
  } catch (error) {
    console.error('Erro ao carregar leads:', error);
    showError('Erro ao carregar leads.');
  }
}

function renderLeadsTable(leads) {
  const tbody = document.getElementById('leads-tbody');
  if (!tbody) return;

  if (!leads.length) {
    tbody.innerHTML = [
      '<tr><td colspan="6">',
      '<div class="empty-state">',
      '<strong>Nenhum lead ainda</strong>',
      '<span>Assim que os envios acontecerem, eles aparecem aqui para priorização do time.</span>',
      '</div>',
      '</td></tr>',
    ].join('');
    return;
  }

  tbody.innerHTML = leads.map((lead) => `
    <tr>
      <td><strong style="color:var(--text)">${lead.name || '-'}</strong></td>
      <td>${lead.email || '-'}</td>
      <td>${lead.phone || '-'}</td>
      <td><span class="badge">${lead.interest || 'geral'}</span></td>
      <td style="font-family:'DM Mono',monospace;font-size:11px;">${lead.created_at ? new Date(lead.created_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}</td>
      <td>
        <div class="row-actions">
          <button class="icon-btn" onclick="copyEmail('${lead.email || ''}')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/></svg>
            Copiar
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

function setupSearch() {
  const input = document.getElementById('search-leads');
  if (!input) return;

  input.addEventListener('input', (event) => {
    const query = event.target.value.toLowerCase();
    const filtered = leadsData.filter((lead) =>
      (lead.name && lead.name.toLowerCase().includes(query)) ||
      (lead.email && lead.email.toLowerCase().includes(query))
    );
    renderLeadsTable(filtered);
  });
}

function copyEmail(email) {
  if (!email) return;

  navigator.clipboard.writeText(email)
    .then(() => showSuccess('Email copiado com sucesso.'))
    .catch(() => showError('Não foi possível copiar o email.'));
}

function drawLeadsChart() {
  const ctx = document.getElementById('leadsChart');
  if (!ctx || typeof Chart === 'undefined') return;

  const leadsByDay = {};
  leadsData.forEach((lead) => {
    if (!lead.created_at) return;
    const day = new Date(lead.created_at).toLocaleDateString('pt-BR');
    leadsByDay[day] = (leadsByDay[day] || 0) + 1;
  });

  const labels = Object.keys(leadsByDay).slice(-7);
  const data = labels.map((label) => leadsByDay[label] || 0);

  if (chartsInstances.leadsChart) chartsInstances.leadsChart.destroy();
  chartsInstances.leadsChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Novos leads',
        data,
        borderColor: '#00ff88',
        backgroundColor: 'rgba(0,255,136,.12)',
        borderWidth: 3,
        fill: true,
        tension: 0.35,
        pointBackgroundColor: '#00ff88',
        pointBorderColor: '#060606',
        pointBorderWidth: 2,
        pointRadius: 4,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: { legend: { labels: { color: '#f4f4f2' } } },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { color: 'rgba(244,244,242,.62)', stepSize: 1 },
          grid: { color: 'rgba(255,255,255,.08)' },
        },
        x: {
          ticks: { color: 'rgba(244,244,242,.62)' },
          grid: { color: 'rgba(255,255,255,.06)' },
        },
      },
    },
  });
}

function drawCountriesChart() {
  const ctx = document.getElementById('countriesChart');
  if (!ctx || typeof Chart === 'undefined') return;

  if (chartsInstances.countriesChart) chartsInstances.countriesChart.destroy();
  chartsInstances.countriesChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Brasil', 'Portugal', 'Estados Unidos', 'Outros'],
      datasets: [{
        data: [45, 15, 20, 20],
        backgroundColor: ['#00ff88', '#00e5ff', '#ffd764', '#787878'],
        borderColor: '#060606',
        borderWidth: 2,
        hoverOffset: 6,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: { legend: { labels: { color: '#f4f4f2' } } },
    },
  });
}

function exportLeadsToCSV() {
  if (!leadsData.length) {
    showError('Nenhum lead disponível para exportação.');
    return;
  }

  const headers = ['Nome', 'Email', 'Telefone', 'Interesse', 'Data'];
  const rows = leadsData.map((lead) => [
    lead.name || '',
    lead.email || '',
    lead.phone || '',
    lead.interest || '',
    lead.created_at ? new Date(lead.created_at).toLocaleString('pt-BR') : '',
  ]);
  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `leads-${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
  showSuccess('Base exportada com sucesso.');
}

window.copyEmail = copyEmail;
window.exportLeadsToCSV = exportLeadsToCSV;

document.addEventListener('DOMContentLoaded', () => {
  initializeMenus();
  loadDashboardData();
  setupSearch();

  setInterval(() => {
    if (getActiveSectionId() === 'dashboard') {
      loadDashboardData();
    }
  }, 30000);
});
