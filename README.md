# 🔴 Redispatch Dashboard

> **Zielgruppe:** Redispatch-Operator / Einspeisemanagement  
> **Regulatorischer Rahmen:** Redispatch 2.0, §14a EnWG, §13 EnWG  
> **Cernion a²mdm Services:** Redispatch, VDMI, Grid-Operations  
> **Live-Demo:** https://energychain.github.io/cernion-redispatch-dashboard/

---

## 1. Der Use Case

### Medien-Anker
Die Umsetzung von Redispatch 2.0 und die Ausweitung von §14a EnWG auf steuerbare Verbrauchseinrichtungen erfordern, dass Redispatch-Operatoren Einspeisemanagement-Abrufe in Echtzeit verfolgen und abrechnen. Ohne zentrale Datenplattform verteilen sich Abruf-Status, Curtailment-Mengen und Vergütungsdaten auf Excel-Listen, E-Mails und verschiedene Marktkommunikationssysteme.

### Problemstellung
Der Redispatch-Operator muss wissen: Welche Anlagen sind aktuell abgerufen? Wie viel Leistung wurde gecurtailt? Und was kostet die Vergütung? Bei manueller Zusammenführung dauert die Übersichtserstellung Stunden — zu lang für Echtzeit-Entscheidungen im Netzbetrieb.

### User Story
> Als Redispatch-Operator möchte ich alle abgerufenen Anlagen, die Curtailment-Kurve und die akkumulierte Vergütung in Echtzeit sehen — um schnell auf neue Netzengpässe zu reagieren und die Abrechnung transparent zu machen.

---

## 2. Was das Tool zeigt

| Feature | Beschreibung |
|---------|-------------|
| **KPI-Status** | Bilanzkreis, Gesamtzahl Anlagen, aktiv abgerufene Anlagen, Gesamtleistung kW, akkumulierte Vergütung EUR |
| **Curtailment-Chart** | 24h-Verlauf: Abgerufene Leistung (rot) vs. Potenzial (gelb gestrichelt) in 15-Minuten-Werten |
| **Anlagen-Tabelle** | Alle Anlagen mit Status (abgerufen/bereit/normal), Typ, Leistung, Abrufgrund, Zeitpunkt, Vergütung |
| **Status-Badge** | Farbiger Status-Indikator: 🔴 aktiv / 🟢 normal |
| **Einstellungen** | API-URL, Tenant-ID und Token konfigurierbar |

---

## 3. Technischer Stack

| Ebene | Technologie | Begründung |
|-------|------------|-----------|
| **Frontend** | Vanilla HTML5 + CSS3 + ES5 | Zero-Build, funktioniert auf jedem Browser ohne Transpiler |
| **Styling** | Pico.css via CDN | Dark-Mode, professionell, kein Build |
| **Charts** | Chart.js via CDN | Industriestandard, keine Toolchain |
| **Backend** | Cernion a²mdm API | Kein eigenes Backend, Tenant-isolierte Daten |
| **Hosting** | GitHub Pages | Kostenlos, Fork = eigene Demo |

---

## 4. Schnellstart

### Live-Demo
https://energychain.github.io/cernion-redispatch-dashboard/

### Lokale Ausführung
```bash
git clone https://github.com/energychain/cernion-redispatch-dashboard.git
cd cernion-redispatch-dashboard
# Öffne index.html im Browser
```

### Mit eigener Cernion-Instanz verbinden
1. In den Einstellungen die API-URL eintragen (Standard: `https://api.cernion.de/`)
2. Tenant-ID auf Ihren Cernion-Tenant setzen
3. API-Token hinterlegen (falls erforderlich)
4. "Speichern & Verbinden" klicken

---

## 5. Cernion-Mehrwert

| Ohne Cernion | Mit Cernion a²mdm |
|-------------|-------------------|
| Abruf-Status per E-Mail/Excel von VNBs (verzögert, unvollständig) | **Echtzeit-Abrufstatus** aus zentraler Redispatch-Schnittstelle |
| Curtailment manuell aus SCADA exportieren (stündlich) | **Automatische Curtailment-Kurve** aus Zeitreihen-Daten |
| Vergütung manuell kalkulieren (fehleranfällig) | **Deterministische Abrechnung** nach §13 EnWG-Vergütungssätzen |
| Keine Tenant-Isolation — alle Bilanzkreise gemischt | **Tenant-isoliert** — Operator sieht nur eigenen Bilanzkreis |

---

## 6. Demo-Daten

| Anlage | Typ | Nennleistung | Status | Abruf kW | Grund | Vergütung |
|--------|-----|-------------|--------|---------|-------|-----------|
| PV-Freifläche Hockenheim A | PV | 8.200 kW | abgerufen | 4.100 | Netzengpass T1 | 553,50 € |
| Windpark Pfalz Nord | Wind | 15.000 kW | abgerufen | 7.500 | Netzengpass T2 | 1.012,50 € |
| Speicherpark Flex A | Speicher | 5.000 kW | abgerufen | 2.500 | Systemdienstleistung | 337,50 € |
| Biogas West | Biogas | 1.200 kW | abgerufen | 600 | Netzengpass T1 | 81,00 € |
| Biogas Anlage Süd | Biogas | 1.800 kW | bereit | 0 | — | 0 € |
| PV-Freifläche Sandhausen | PV | 5.000 kW | bereit | 0 | — | 0 € |
| Windpark Odenwald | Wind | 12.000 kW | normal | 0 | — | 0 € |
| PV-Dach Industrie Ost | PV | 450 kW | normal | 0 | — | 0 € |

**Bilanzkreis:** BK-MA-2026 | **Gesamtanlagen:** 47 | **Aktiv abgerufen:** 12 | **Gesamtabgerufen:** 2.840 kW | **Vergütung:** 3.842,50 €

---

## 7. Architektur

```
┌─────────────────────────────────────────┐
│  Browser (GitHub Pages)                 │
│  ┌─────────┐ ┌─────────┐ ┌──────────┐  │
│  │index.html│ │ app.js  │ │ api.js   │  │
│  │ (UI)    │ │ (Logic) │ │ (Client) │  │
│  └────┬────┘ └────┬────┘ └────┬─────┘  │
│       └─────────────┴─────────┘        │
│              │ HTTPS                     │
└──────────────┼──────────────────────────┘
               │
       ┌───────▼────────┐
       │  Cernion API   │
       │  api.cernion.de│
       │  ┌──────────┐  │
       │  │ Tenant:  │  │
       │  │ agentic- │  │
       │  │hackathon │  │
       │  └──────────┘  │
       │  ┌──────────┐    │
       │  │ Redisp.  │    │
       │  │ Audits   │    │
       │  │ Grid-Op. │    │
       │  │ VDMI     │    │
       │  └──────────┘    │
       └──────────────────┘
```

---

## Lizenz

AGPL-3.0 — Siehe [LICENSE](LICENSE)

---

**Maintained by:** [STROMDAO GmbH](https://stromdao.de) | [Cernion](https://cernion.de) | [GitHub](https://github.com/energychain/cernion-redispatch-dashboard)
