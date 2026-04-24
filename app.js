// ── FIREBASE SETUP ────────────────────────────────────
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, push, onValue, query, orderByChild, limitToLast }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCdU-t2ItIjVFRQo65rzle8n2PrKZ_STmU",
  authDomain: "cameroon-fintech-status.firebaseapp.com",
  databaseURL: "https://cameroon-fintech-status-default-rtdb.firebaseio.com",
  projectId: "cameroon-fintech-status",
  storageBucket: "cameroon-fintech-status.firebasestorage.app",
  messagingSenderId: "842559320219",
  appId: "1:842559320219:web:6011def2b8d8031b6bd63e",
  measurementId: "G-5P93PV51M8"
};

const app = initializeApp(firebaseConfig);
const db  = getDatabase(app);

// ── SERVICE DATA ──────────────────────────────────────
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
  { type:"outage",   title:"Express Union — Full service outage",       date:"24 Apr 2026 · Ongoing",       desc:"Users are unable to send or receive transfers. Express Union team has been notified. No ETA yet." },
  { type:"degraded", title:"Sara Money — Login failures after update",   date:"24 Apr 2026 · Since 07:00",   desc:"Multiple users report being unable to log in following the latest app update. Afriland team investigating." },
  { type:"resolved", title:"Orange Money — Slow transactions",           date:"22 Apr 2026 · Resolved 14:30",desc:"Transaction delays were reported between 11:00 and 14:30. Issue has been resolved." },
  { type:"resolved", title:"MTN Mobile Money — OTP delays",              date:"20 Apr 2026 · Resolved 09:00",desc:"OTP codes were delayed by up to 10 minutes. The issue was traced to the SMS gateway and resolved." }
];

// ── HELPERS ───────────────────────────────────────────
function statusLabel(s) {
  return s === "operational" ? "Operational" : s === "degraded" ? "Degraded" : "Outage";
}
function incLabel(t) {
  return t === "outage" ? "Outage" : t === "degraded" ? "Degraded" : "Resolved";
}
function timeAgo(ts) {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60)  return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
  return `${Math.floor(diff/3600)}h ago`;
}

// ── LIVE CLOCK ────────────────────────────────────────
function updateClock() {
  const el = document.getElementById("live-clock");
  if (el) el.textContent = new Date().toLocaleTimeString("en-GB",
    { hour:"2-digit", minute:"2-digit", second:"2-digit" });
}
setInterval(updateClock, 1000);
updateClock();

// ── AUTO REFRESH ──────────────────────────────────────
let countdown = 60;
setInterval(() => {
  countdown--;
  const el = document.getElementById("countdown");
  if (el) el.textContent = countdown;
  if (countdown <= 0) { countdown = 60; renderServices(); renderSummary(); }
}, 1000);

function manualRefresh() {
  countdown = 60;
  const el = document.getElementById("countdown");
  if (el) el.textContent = 60;
  renderServices();
  renderSummary();
}
window.manualRefresh = manualRefresh;

// ── PAGES ─────────────────────────────────────────────
function showPage(name, link) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.querySelectorAll(".nav-link").forEach(l => l.classList.remove("active"));
  document.getElementById("page-" + name).classList.add("active");
  if (link) link.classList.add("active");
  if (name === "incidents") renderIncidents("all");
  if (name === "logs") startLiveLogs();
}
window.showPage = showPage;

// ── SUMMARY ───────────────────────────────────────────
function renderSummary() {
  const ok   = services.filter(s => s.status === "operational").length;
  const warn = services.filter(s => s.status === "degraded").length;
  const bad  = services.filter(s => s.status === "outage").length;

  document.getElementById("summary-grid").innerHTML = `
    <div class="summary-card"><p class="s-label">Monitored</p><p class="s-num">${services.length}</p></div>
    <div class="summary-card"><p class="s-label">Operational</p><p class="s-num ok">${ok}</p></div>
    <div class="summary-card"><p class="s-label">Disrupted</p><p class="s-num warn">${warn}</p></div>
    <div class="summary-card"><p class="s-label">Outage</p><p class="s-num bad">${bad}</p></div>
  `;

  const badge = document.getElementById("overall-badge");
  if (bad > 0)       { badge.textContent = "Some services down"; badge.className = "overall-badge issues"; }
  else if (warn > 0) { badge.textContent = "Some disruptions";   badge.className = "overall-badge some"; }
  else               { badge.textContent = "All systems operational"; badge.className = "overall-badge all-good"; }
}

// ── SERVICE CARDS ─────────────────────────────────────
const hoverMessages = {
  operational: "All systems running normally. No action needed.",
  degraded:    "Service experiencing issues. Transactions may fail. Try again later.",
  outage:      "Service is DOWN. Do not retry — contact support if funds were debited."
};

function renderServices() {
  const query = (document.getElementById("search-input")?.value || "").toLowerCase();
  const filtered = services.filter(s =>
    s.name.toLowerCase().includes(query) || s.type.toLowerCase().includes(query)
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

// ── SUBMIT REPORT → FIREBASE ──────────────────────────
async function submitReport() {
  const service = document.getElementById("report-service").value;
  const type    = document.getElementById("report-type").value;
  const desc    = document.getElementById("report-desc").value.trim();
  const feedback = document.getElementById("report-feedback");

  if (!service || !type) {
    feedback.textContent = "Please select a service and issue type.";
    feedback.className = "report-feedback error";
    return;
  }

  try {
    await push(ref(db, "reports"), {
      service, type, desc: desc || "No additional details",
      timestamp: Date.now()
    });
    feedback.textContent = "✓ Report submitted. Thank you — this helps the community!";
    feedback.className = "report-feedback success";
    document.getElementById("report-service").value = "";
    document.getElementById("report-type").value = "";
    document.getElementById("report-desc").value = "";
    setTimeout(() => { feedback.textContent = ""; feedback.className = "report-feedback"; }, 4000);
  } catch (e) {
    feedback.textContent = "Failed to submit. Please try again.";
    feedback.className = "report-feedback error";
  }
}
window.submitReport = submitReport;

// ── LIVE LOGS FROM FIREBASE ───────────────────────────
let logsStarted = false;

function startLiveLogs() {
  if (logsStarted) return;
  logsStarted = true;

  const logsRef = query(ref(db, "reports"), orderByChild("timestamp"), limitToLast(50));

  onValue(logsRef, (snapshot) => {
    const list = document.getElementById("live-logs-list");
    const countEl = document.getElementById("logs-count");
    if (!list) return;

    const data = snapshot.val();
    if (!data) {
      list.innerHTML = `<div class="no-logs">No reports yet. Be the first to report an issue!</div>`;
      if (countEl) countEl.textContent = "";
      return;
    }

    // Convert to array and sort newest first
    const reports = Object.entries(data)
      .map(([id, val]) => ({ id, ...val }))
      .sort((a, b) => b.timestamp - a.timestamp);

    if (countEl) countEl.textContent = `${reports.length} report${reports.length !== 1 ? "s" : ""} from the community`;

    list.innerHTML = reports.map((r, i) => `
      <div class="log-card" style="animation-delay:${i * 0.04}s">
        <div class="log-top">
          <div class="log-service">${r.service}</div>
          <div class="log-time">${timeAgo(r.timestamp)}</div>
        </div>
        <div class="log-type">${r.type}</div>
        <div class="log-desc">${r.desc}</div>
      </div>
    `).join("");
  });
}

// ── INCIDENTS ─────────────────────────────────────────
function renderIncidents(filter) {
  const filtered = filter === "all" ? incidents : incidents.filter(i => i.type === filter);
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
window.filterIncidents = filterIncidents;

// ── INIT ──────────────────────────────────────────────
renderSummary();
renderServices();