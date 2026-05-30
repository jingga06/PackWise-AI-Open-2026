const STORAGE_KEY = "packwise_sessions";

function formatVolume(value) {
  return `${value.toFixed(2)} m³`;
}

function formatWeight(value) {
  return `${value.toFixed(0)} kg`;
}

function saveSessions(sessions) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

function loadSessions() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

function getSelectedSession() {
  const data = localStorage.getItem("packwise_current_session");
  return data ? JSON.parse(data) : null;
}

function saveSelectedSession(session) {
  localStorage.setItem("packwise_current_session", JSON.stringify(session));
}

function goTo(page) {
  window.location.href = page;
}

function todayLabel() {
  return new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

function getCurrentUser() {
  const data = localStorage.getItem("packwise_user");
  return data ? JSON.parse(data) : null;
}

function logout() {
  localStorage.removeItem("packwise_user");
  window.location.href = "login.html";
}

function protectPage(allowedRoles = []) {
  const user = getCurrentUser();

  if (!user) {
    window.location.href = "login.html";
    return;
  }

  if (allowedRoles.length && !allowedRoles.includes(user.role)) {
    if (user.role === "operator") {
      window.location.href = "session.html";
    } else {
      window.location.href = "index.html";
    }
  }
}

function renderSidebarUser() {
  const user = getCurrentUser();
  const target = document.getElementById("sidebarUser");

  if (!target || !user) return;

  const roleLabel = user.role === "operator"
    ? "Warehouse Operator"
    : "Logistics Manager";

  const roleScope = user.role === "operator"
    ? "Loading execution access"
    : "Dashboard & fleet access";

  target.innerHTML = `
    <span>Signed in as</span>
    <strong>${roleLabel}</strong>
    <small>${roleScope}</small>
  `;
}

function renderSidebar(activePage) {
  const user = getCurrentUser();
  const nav = document.getElementById("navMenu");

  if (!nav || !user) return;

  let links = [];

  if (user.role === "operator") {
    links = [
      { label: "New Session", href: "session.html", key: "session" },
      { label: "3D Visual", href: "visualize.html", key: "visualize" },
      { label: "Loading Guide", href: "guide.html", key: "guide" }
    ];
  }

  if (user.role === "manager") {
    links = [
      { label: "Dashboard", href: "index.html", key: "dashboard" },
      { label: "Fleet Database", href: "fleet.html", key: "fleet" },
      { label: "3D Visual", href: "visualize.html", key: "visualize" },
      { label: "Loading Guide", href: "guide.html", key: "guide" }
    ];
  }

  nav.innerHTML = links.map(link => {
    const activeClass = link.key === activePage ? "active" : "";

    return `
      <a href="${link.href}" class="nav-link ${activeClass}">
        ${link.label}
      </a>
    `;
  }).join("");
}