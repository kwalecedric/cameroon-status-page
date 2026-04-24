// ── DATA ──────────────────────────────────────────────
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
  },
  {
    type: "resolved",
    title: "MTN Mobile Money — OTP delays",
    date: "20 Apr 2026 · Resolved 09:00",
    desc: "OTP codes were delayed by up to 10 minutes. The issue was traced to the SMS gateway and resolved."
  }
];

// ── HELPERS ───────────────────────────────────────────
function statusLabel(s) {
  return s === "operational" ? "Operational" : s === "degraded" ? "Degraded" : "Outage";
}

function incLabel(t) {
  return t === "outage" ? "Outage" : t === "degraded" ? "Degraded" : "Resolved";
}

// ── HOVER MESSAGES ────────────────────────────────────
const hoverMessages = {
  operational: "All systems are running normally. No action needed.",
  degraded: "This service is experiencing issues. Transactions may be slow or fail. Try again later.",
  outage: "This service is currently down. Do not retry transactions — contact support if funds were debited."
};

// ── LIVE CLOCK ────────────────────────────────────────
function updateClock() {
  const el = document.getElementById("live-clock");
  if (el) {
    const now = new Date();
    el.textContent = now.toLocaleTimeString("en-GB", {
      hour: "2-digit", minute: "2-digit", second: "2-digit"
    });
  }
}
setInterval(updateClock, 1000);
updateClock();

// ── AUTO REFRESH COUNTDOWN ────────────────────────────
let countdown = 60;
setInterval(() => {
  countdown--;
  const el = document.getElementById("countdown");
  if (el) el.textContent = countdown;
  if (countdown <= 0) {
    countdown = 60;
    renderServices();
    renderSummary();
  }
}, 1000);

function manualRefresh() {
  countdown = 60;
  const el = document.getElementById("countdown");
  if (el) el.textContent = countdown;
  renderServices();
  renderSummary();
}

// ── PAGES ─────────────────────────────────────────────
function showPage(name, link) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.querySelectorAll(".nav-link").forEach(l => l.classList.remove("active"));
  document.getElementById("page-" + name).classList.add("active");
  if (link) link.classList.add("active");
  if (name === "incidents") renderIncidents("all");
}

// ── SUMMARY CARDS ─────────────────────────────────────
function renderSummary() {
  const total = services.length;
  const ok    = services.filter(s => s.status === "operational").length;
  const warn  = services.filter(s => s.status === "degraded").length;
  const bad   = services.filter(s => s.status === "outage").length;

  const grid = document.getElementById("summary-grid");
  if (grid) {
    grid.innerHTML = `
      <div class="summary-card">
        <p class="s-label">Services monitored</p>
        <p class="s-num">${total}</p>
      </div>
      <div class="summary-card">
        <p class="s-label">Operational</p>
        <p class="s-num ok">${ok}</p>
      </div>
      <div class="summary-card">
        <p class="s-label">Disrupted</p>
        <p class="s-num warn">${warn}</p>
      </div>
      <div class="summary-card">
        <p class="s-label">Outage</p>
        <p class="s-num bad">${bad}</p>
      </div>
    `;
  }

  const badge = document.getElementById("overall-badge");
  if (badge) {
    if (bad > 0) {
      badge.textContent = "Some services down";
      badge.className = "overall-badge issues";
    } else if (warn > 0) {
      badge.textContent = "Some disruptions";
      badge.className = "overall-badge some";
    } else {
      badge.textContent = "All systems operational";
      badge.className = "overall-badge all-good";
    }
  }
}

// ── SERVICE CARDS ─────────────────────────────────────
function renderServices() {
  const query = (document.getElementById("search-input")?.value || "").toLowerCase();
  const filtered = services.filter(s =>
    s.name.toLowerCase().includes(query) ||
    s.type.toLowerCase().includes(query)
  );

  const grid = document.getElementById("services-grid");
  if (!grid) return;

  if (filtered.length === 0) {
    grid.innerHTML = `<div class="no-results">No services match "${query}"</div>`;
    return;
  }

  grid.innerHTML = filtered.map(s => {
    const blocks = s.uptime.map(d => `<div class="uptime-block ${d}"></div>`).join("");
    return `
      <div class="service-card">
        <div class="service-top">
          <p class="service-name">${s.name}</p>
          <div class="status-dot ${s.status}"></div>
        </div>
        <p class="service-type">${s.type}</p>
        <span class="status-badge ${s.status}">${statusLabel(s.status)}</span>
        <p class="service-note">${s.note}</p>
        <div class="uptime-bar">${blocks}</div>
        <p class="uptime-label">Last 30 days</p>
        <div class="hover-message ${s.status}">${hoverMessages[s.status]}</div>
      </div>
    `;
  }).join("");
}

// ── INCIDENTS ─────────────────────────────────────────
function renderIncidents(filter) {
  const filtered = filter === "all"
    ? incidents
    : incidents.filter(i => i.type === filter);

  const log = document.getElementById("incident-log");
  if (!log) return;

  log.innerHTML = filtered.map(i => `
    <div class="incident-card ${i.type}">
      <span class="inc-tag ${i.type}">${incLabel(i.type)}</span>
      <p class="inc-title">${i.title}</p>
      <p class="inc-meta">${i.date}</p>
      <p class="inc-desc">${i.desc}</p>
    </div>
  `).join("");
}

function filterIncidents(filter, btn) {
  document.querySelectorAll(".inc-filter-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  renderIncidents(filter);
}

// ── INIT ──────────────────────────────────────────────
renderSummary();
renderServices();