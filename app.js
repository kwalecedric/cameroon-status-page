// SERVICE DATA
// In a real product, this would be fetched live from a monitoring server
// For now we define it manually — this is realistic enough to demo
const services = [
  {
    name: "Sara Money",
    type: "Afriland First Bank · Mobile Wallet",
    status: "degraded",
    note: "Login issues reported by multiple users",
    uptime: ["up","up","up","up","up","up","partial","partial","up","up","up","up","up","up","down","up","up","up","up","up","up","up","partial","up","up","up","up","up","up","up"]
  },
  {
    name: "MTN Mobile Money",
    type: "MTN Cameroon · Mobile Money",
    status: "operational",
    note: "All systems normal",
    uptime: ["up","up","up","up","up","up","up","up","up","up","up","up","up","up","up","up","up","up","up","up","up","up","up","up","up","up","up","up","up","up"]
  },
  {
    name: "Orange Money",
    type: "Orange Cameroun · Mobile Money",
    status: "operational",
    note: "All systems normal",
    uptime: ["up","up","up","up","up","up","up","up","up","up","up","up","up","up","partial","up","up","up","up","up","up","up","up","up","up","up","up","up","up","up"]
  },
  {
    name: "Express Union",
    type: "Express Union · Money Transfer",
    status: "outage",
    note: "Service unavailable. Team investigating.",
    uptime: ["up","up","up","up","up","up","up","up","up","up","up","up","up","up","up","up","up","up","up","up","up","up","down","down","down","up","up","up","up","up"]
  },
  {
    name: "CCA Bank",
    type: "CCA Bank · Mobile Banking",
    status: "operational",
    note: "All systems normal",
    uptime: ["up","up","up","up","up","up","up","up","up","up","up","up","up","up","up","up","up","up","up","up","up","up","up","up","up","up","up","up","up","up"]
  },
  {
    name: "Yoomee Mobile",
    type: "Yoomee · Mobile Payment",
    status: "operational",
    note: "All systems normal",
    uptime: ["up","up","up","up","up","up","up","up","up","up","up","up","up","up","up","up","up","up","up","up","up","up","up","up","up","up","up","up","up","up"]
  }
];

// INCIDENT LOG DATA
const incidents = [
  {
    type: "outage",
    title: "Express Union — Full service outage",
    date: "24 Apr 2026 · Ongoing",
    desc: "Users are unable to send or receive transfers. Express Union team has been notified. No ETA yet."
  },
  {
    type: "degraded",
    title: "Sara Money — Login failures after update",
    date: "24 Apr 2026 · Since 07:00",
    desc: "Multiple users report being unable to log in following the latest app update. Afriland team investigating."
  },
  {
    type: "resolved",
    title: "Orange Money — Slow transactions",
    date: "22 Apr 2026 · Resolved 14:30",
    desc: "Transaction delays were reported between 11:00 and 14:30. Issue has been resolved."
  }
];

// STATUS LABEL MAP
function getStatusLabel(status) {
  if (status === "operational") return "Operational";
  if (status === "degraded")    return "Degraded";
  if (status === "outage")      return "Outage";
}

// BUILD ONE SERVICE CARD
function buildServiceCard(service) {
  // Build the 30 uptime blocks (one per day)
  const blocks = service.uptime
    .map(day => `<div class="uptime-block ${day}"></div>`)
    .join("");

  return `
    <div class="service-card">
      <div class="service-top">
        <p class="service-name">${service.name}</p>
        <div class="status-dot ${service.status}"></div>
      </div>
      <p class="service-type">${service.type}</p>
      <span class="service-status-label ${service.status}">
        ${getStatusLabel(service.status)}
      </span>
      <p class="service-note">${service.note}</p>
      <div class="uptime-bar">${blocks}</div>
      <p class="uptime-label">Last 30 days</p>
    </div>
  `;
}

// BUILD ONE INCIDENT CARD
function buildIncidentCard(incident) {
  return `
    <div class="incident-card ${incident.type}">
      <p class="incident-title">${incident.title}</p>
      <p class="incident-meta">${incident.date}</p>
      <p class="incident-desc">${incident.desc}</p>
    </div>
  `;
}

// SET THE OVERALL STATUS BADGE AT THE TOP
function setOverallBadge() {
  const badge = document.getElementById("overall-badge");
  const hasOutage   = services.some(s => s.status === "outage");
  const hasDegraded = services.some(s => s.status === "degraded");

  if (hasOutage) {
    badge.textContent = "Some services down";
    badge.className = "overall-badge issues";
  } else if (hasDegraded) {
    badge.textContent = "Some disruptions";
    badge.className = "overall-badge some";
  } else {
    badge.textContent = "All systems operational";
    badge.className = "overall-badge all-good";
  }
}

// SET THE LAST CHECKED TIME
function setLastChecked() {
  const now = new Date();
  const time = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  const date = now.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  document.getElementById("last-checked").textContent = `Last updated: ${date} at ${time}`;
}

// RENDER EVERYTHING
function render() {
  // Render service cards
  const grid = document.getElementById("services-grid");
  grid.innerHTML = services.map(s => buildServiceCard(s)).join("");

  // Render incident log
  const log = document.getElementById("incident-log");
  log.innerHTML = incidents.map(i => buildIncidentCard(i)).join("");

  // Set overall badge and time
  setOverallBadge();
  setLastChecked();
}

// Run on page load
render();