/**
 * Redispatch Dashboard — App Logic
 * Operator-Tool fuer Einspeisemanagement
 */
var chartInstances = {};
var isDemoMode = false;

document.addEventListener('DOMContentLoaded', function() {
  initSettings();
  setupTabs();
  loadDashboard();
});

function switchTab(tabId) {
  document.querySelectorAll('nav[aria-label="breadcrumb"] button').forEach(function(btn) {
    btn.classList.remove('active');
    if (btn.dataset.tab === tabId) btn.classList.add('active');
  });
  document.querySelectorAll('.tab-panel').forEach(function(p) { p.classList.remove('active'); });
  var panel = document.getElementById(tabId);
  if (panel) panel.classList.add('active');
  if (tabId === 'dashboard') loadDashboard();
  if (tabId === 'anlagen') loadAnlagen();
}

function setupTabs() {
  document.querySelectorAll('nav[aria-label="breadcrumb"] button').forEach(function(btn) {
    btn.addEventListener('click', function() { switchTab(btn.dataset.tab); });
  });
}

function initSettings() {
  var form = document.getElementById('settings-form');
  if (!form) return;
  form.onsubmit = function(e) {
    e.preventDefault();
    api.saveConfig({
      baseUrl: document.getElementById('cfg-url').value,
      tenantId: document.getElementById('cfg-tenant').value,
      token: document.getElementById('cfg-token').value
    });
    alert('Einstellungen gespeichert');
  };
}

function loadDashboard() {
  showLoading(true);
  api.getRedispatchStatus().then(function(data) {
    renderKPIs(data);
    renderCurtailmentChart(data.schedule || DEMO_CURTAILMENT);
    loadAnlagenTable(data.anlagen || DEMO_ANLAGEN);
    showLoading(false);
  }).catch(function(e) {
    renderKPIs(DEMO_REDISPATCH);
    renderCurtailmentChart(DEMO_CURTAILMENT);
    loadAnlagenTable(DEMO_ANLAGEN);
    showLoading(false);
  });
}

function renderKPIs(data) {
  var container = document.getElementById('dashboard-cards');
  if (!container) return;
  var s = data.status === "aktiv" ? "🔴" : "🟢";
  var c = data.status === "aktiv" ? "#d05050" : "#2a8a2a";
  container.innerHTML = '<div class="grid kpi-grid">' +
    '<article class="kpi-card" style="border-left:4px solid '+c+'"><h3>Status</h3><p class="kpi-value" style="color:'+c+'">'+s+' '+data.status+'</p><small>'+data.bilanzkreis+'</small></article>' +
    '<article class="kpi-card"><h3>Anlagen</h3><p class="kpi-value">'+data.gesamtAnlagen+'</p><small>'+data.einspeisemanagementAktiv+' aktiv</small></article>' +
    '<article class="kpi-card"><h3>Abgerufen</h3><p class="kpi-value">'+data.abgerufeneLeistungKw+' <span>kW</span></p></article>' +
    '<article class="kpi-card"><h3>Vergütung</h3><p class="kpi-value">'+data.gesamtAbrechnungEur.toFixed(2)+' <span>€</span></p></article>' +
    '</div>';
}

function renderCurtailmentChart(schedule) {
  var canvas = document.getElementById('curtailment-chart');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  if (chartInstances['curtailment']) chartInstances['curtailment'].destroy();
  chartInstances['curtailment'] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: schedule.map(function(s) { return s.ts.slice(11,16); }),
      datasets: [
        { label: 'Abgerufen kW', data: schedule.map(function(s) { return s.abgerufenKw; }), borderColor: '#d05050', backgroundColor: 'rgba(208,80,80,0.1)', fill: true, tension: 0.3, pointRadius: 0 },
        { label: 'Potenzial kW', data: schedule.map(function(s) { return s.potenzialKw; }), borderColor: '#e8b339', borderDash: [5,5], fill: false, pointRadius: 0 }
      ]
    },
    options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, title: { display: true, text: 'kW' } } } }
  });
}

function loadAnlagen() {
  showLoading(true);
  api.getRedispatchStatus().then(function(data) {
    loadAnlagenTable(data.anlagen || DEMO_ANLAGEN);
    showLoading(false);
  }).catch(function() {
    loadAnlagenTable(DEMO_ANLAGEN);
    showLoading(false);
  });
}

function loadAnlagenTable(anlagen) {
  var tbody = document.querySelector('#anlagen-table tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  anlagen.forEach(function(a) {
    var row = document.createElement('tr');
    var statusClass = 'badge-' + a.status;
    row.innerHTML = '<td><strong>'+a.name+'</strong><br><small>'+a.id+'</small></td>' +
      '<td><span class="badge badge-'+a.typ.toLowerCase()+'">'+a.typ+'</span></td>' +
      '<td>'+a.leistungKw+' kW</td>' +
      '<td><span class="badge '+statusClass+'">'+a.status+'</span></td>' +
      '<td>'+(a.abrufKw>0?a.abrufKw+' kW':'—')+'</td>' +
      '<td>'+(a.grund||'—')+'</td>' +
      '<td>'+a.verguetungEur.toFixed(2)+' €</td>';
    tbody.appendChild(row);
  });
}

function showLoading(show) {
  var el = document.getElementById('loading');
  if (el) el.style.display = show ? 'block' : 'none';
}
