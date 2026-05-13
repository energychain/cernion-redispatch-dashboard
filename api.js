/**
 * Redispatch Dashboard — API Client + Demo-Daten
 */
var CERNION_CONFIG_KEY = 'cernion.api.config';

// --- Redispatch Demo Data ---
var DEMO_REDISPATCH = {
  bilanzkreis: "BK-MA-2026",
  zeitraum: "2026-05-12",
  gesamtAnlagen: 47,
  einspeisemanagementAktiv: 12,
  abgerufeneLeistungKw: 2840,
  verguetungCtKwh: 13.5,
  gesamtAbrechnungEur: 3842.50,
  status: "aktiv"
};

var DEMO_ANLAGEN = [
  { id: "EEG-DE00123456789", name: "PV-Freifläche Hockenheim A", typ: "PV", leistungKw: 8200, status: "abgerufen", abrufKw: 4100, grund: "Netzengpass T1", zeit: "2026-05-12T10:00:00Z", verguetungEur: 553.50 },
  { id: "EEG-DE00987654321", name: "Windpark Pfalz Nord", typ: "Wind", leistungKw: 15000, status: "abgerufen", abrufKw: 7500, grund: "Netzengpass T2", zeit: "2026-05-12T10:30:00Z", verguetungEur: 1012.50 },
  { id: "EEG-DE00555123456", name: "Biogas Anlage Süd", typ: "Biogas", leistungKw: 1800, status: "bereit", abrufKw: 0, grund: "", zeit: "", verguetungEur: 0 },
  { id: "EEG-DE00222333445", name: "PV-Dach Industrie Ost", typ: "PV", leistungKw: 450, status: "normal", abrufKw: 0, grund: "", zeit: "", verguetungEur: 0 },
  { id: "EEG-DE00777888990", name: "Speicherpark Flex A", typ: "Speicher", leistungKw: 5000, status: "abgerufen", abrufKw: 2500, grund: "Systemdienstleistung", zeit: "2026-05-12T11:00:00Z", verguetungEur: 337.50 },
  { id: "EEG-DE00666111222", name: "Windpark Odenwald", typ: "Wind", leistungKw: 12000, status: "normal", abrufKw: 0, grund: "", zeit: "", verguetungEur: 0 },
  { id: "EEG-DE00444333211", name: "PV-Freifläche Sandhausen", typ: "PV", leistungKw: 5000, status: "bereit", abrufKw: 0, grund: "", zeit: "", verguetungEur: 0 },
  { id: "EEG-DE00888777665", name: "Biogas West", typ: "Biogas", leistungKw: 1200, status: "abgerufen", abrufKw: 600, grund: "Netzengpass T1", zeit: "2026-05-12T10:00:00Z", verguetungEur: 81.00 }
];

// 24h curtailed power curve
var DEMO_CURTAILMENT = [];
for (var i = 0; i < 96; i++) {
  var h = i / 4.0;
  var hh = String(Math.floor(h)).padStart(2, '0');
  var mm = String((i % 4) * 15).padStart(2, '0');
  var val = 0;
  if (h >= 10 && h <= 15) val = 2840 + (Math.random() * 200 - 100);
  else if (h >= 8 && h < 10) val = 1500 * (h - 8);
  else if (h > 15 && h <= 17) val = 2840 * (17 - h) / 2;
  DEMO_CURTAILMENT.push({ ts: "2026-05-12T" + hh + ":" + mm + ":00Z", abgerufenKw: Math.round(val * 100) / 100, potenzialKw: 2840 });
}

class CernionAPI {
  constructor() {
    this.config = this.loadConfig();
    this.config.baseUrl = (this.config.baseUrl || 'https://api.cernion.de/').replace(/\/api\/$/, '');
  }
  loadConfig() {
    try {
      var raw = localStorage.getItem(CERNION_CONFIG_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return { baseUrl: 'https://api.cernion.de/', tenantId: 'agentic-hackathon', token: '' };
  }
  saveConfig(cfg) {
    for (var k in cfg) this.config[k] = cfg[k];
    localStorage.setItem(CERNION_CONFIG_KEY, JSON.stringify(this.config));
  }
  get headers() {
    var h = { 'Content-Type': 'application/json', 'x-tenant-id': this.config.tenantId };
    if (this.config.token) h['Authorization'] = 'Bearer ' + this.config.token;
    return h;
  }
  async get(endpoint) {
    try {
      var res = await fetch(this.config.baseUrl + endpoint, { headers: this.headers });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    } catch (e) { e.isCORS = e.message.indexOf('Failed') >= 0; throw e; }
  }
  async getRedispatchStatus() {
    try { return await this.get('api/redispatch/audits'); }
    catch (e) { return { success: true, ...DEMO_REDISPATCH, anlagen: DEMO_ANLAGEN }; }
  }
  async getRedispatchSchedule() {
    try { return await this.get('api/redispatch/audits'); }
    catch (e) { return { success: true, schedule: DEMO_CURTAILMENT }; }
  }
}

var api = new CernionAPI();
