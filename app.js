const SUPABASE_URL = "https://bhqtuqchbmoeezauwvft.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_55QMZTd7Br7HOBmtfs686Q_ZDC0ej40";
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

const state = {
  user: null,
  profile: null,
  activeAlert: null,
  notified: 86,
  responded: 54,
  safe: 49,
  zones: [
    { name: "Zone A1", progress: 82, status: "Guide validé" },
    { name: "Zone A2", progress: 63, status: "En contrôle" },
    { name: "Zone A3", progress: 46, status: "À surveiller" },
    { name: "Accueil", progress: 91, status: "Rassemblé" },
  ],
  people: [
    ["Paul Hoffmann", "A2", "Non répondant", "Notification envoyée"],
    ["Nathalie Schmit", "A3", "Pas en sécurité", "Localisation: escalier Est"],
    ["Marc Weber", "A2", "Guide en cours", "Point Nord"],
    ["Samira Klein", "A1", "Non répondant", "Email remis"],
  ],
  reports: [
    ["Exercice incendie - Bâtiment A", "07/05/2026", "86 notifiés, 54 réponses"],
    ["Secours à personne - Bureau 204", "04/05/2026", "Intervention clôturée"],
    ["Exercice évacuation - Atelier", "22/04/2026", "Temps total 11m 40s"],
  ],
  events: [
    "15:42 - Exercice déclenché par Claire Muller",
    "15:43 - Notifications push envoyées",
    "15:45 - Guide-file A1 arrivé au point Nord",
    "15:47 - Signalement à surveiller en zone A3",
  ],
};

const titles = {
  dashboard: "Tableau de bord",
  trigger: "Déclencher une alerte",
  responses: "Réponses",
  "first-aid": "Secours à personne",
  reports: "Rapports",
  admin: "Administration",
};

const roleLabels = {
  admin: "Admin",
  chef_securite: "Chef sécurité",
  guide_file: "Guide-file",
  secouriste: "Secouriste",
  employe: "Employé",
  visiteur_temporaire: "Visiteur temporaire",
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 2600);
}

function setAuthMode(mode) {
  $$(".auth-tab").forEach((tab) => tab.classList.toggle("active", tab.dataset.authMode === mode));
  $("#login-form").classList.toggle("active", mode === "login");
  $("#signup-form").classList.toggle("active", mode === "signup");
}

function renderAuthState() {
  const isAuthenticated = Boolean(state.user);
  $("#auth-screen").classList.toggle("hidden", isAuthenticated);
  $(".app-shell").classList.toggle("authenticated", isAuthenticated);

  if (isAuthenticated && state.profile) {
    $("#operator-name").textContent = state.profile.nom || state.user.email;
    $("#operator-role").textContent = roleLabels[state.profile.role] || state.profile.role || "Utilisateur";
  }
}

async function loadProfile() {
  if (!state.user) return null;
  const { data, error } = await supabaseClient
    .from("profiles")
    .select("*")
    .eq("user_id", state.user.id)
    .maybeSingle();

  if (error) {
    showToast(`Profil: ${error.message}`);
    return null;
  }

  state.profile = data;
  renderAuthState();
  return data;
}

async function upsertOwnProfile(profile) {
  const { error } = await supabaseClient.from("profiles").upsert({
    user_id: state.user.id,
    email: state.user.email,
    ...profile,
  });
  if (error) throw error;
  await loadProfile();
}

async function initializeAuth() {
  const { data, error } = await supabaseClient.auth.getSession();
  if (error) {
    showToast(`Session: ${error.message}`);
    return;
  }

  state.user = data.session?.user || null;
  if (state.user) {
    await loadProfile();
    await loadRemoteState();
    subscribeToRealtime();
  } else {
    renderAuthState();
  }

  supabaseClient.auth.onAuthStateChange(async (_event, session) => {
    state.user = session?.user || null;
    state.profile = null;
    if (state.user) {
      await loadProfile();
      await loadRemoteState();
      subscribeToRealtime();
    }
    renderAuthState();
  });
}

async function loadRemoteState() {
  const { data: alert, error: alertError } = await supabaseClient
    .from("alerts")
    .select("*")
    .eq("status", "ACTIVE")
    .order("triggered_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (alertError) {
    showToast(`Erreur Supabase: ${alertError.message}`);
    return;
  }

  state.activeAlert = alert;
  if (alert) {
    state.notified = alert.notified_count || 0;
  }

  const alertId = alert?.id;
  const responsesQuery = supabaseClient
    .from("evacuation_responses")
    .select("*")
    .order("responded_at", { ascending: false });
  const { data: responses, error: responsesError } = alertId
    ? await responsesQuery.eq("alert_id", alertId)
    : await responsesQuery;

  if (!responsesError && responses) {
    state.responded = responses.filter((response) => response.is_present !== null || response.is_safe !== null).length;
    state.safe = responses.filter((response) => response.is_safe === true).length;
    state.people = responses.map((response) => [
      response.person_name,
      response.zone || "-",
      response.is_safe === true ? "En sécurité" : response.is_safe === false ? "Pas en sécurité" : "Non répondant",
      response.location || response.notes || "En attente",
    ]);
  }

  const { data: zones } = await supabaseClient
    .from("zones")
    .select("name, assembly_point, guide_name")
    .order("name");

  if (zones?.length) {
    state.zones = zones.map((zone, index) => ({
      name: zone.name,
      progress: [82, 63, 46, 91, 58][index % 5],
      status: zone.guide_name ? `Guide: ${zone.guide_name}` : "À assigner",
    }));
  }

  const eventsQuery = supabaseClient
    .from("app_events")
    .select("message, created_at")
    .order("created_at", { ascending: false })
    .limit(8);
  const { data: events } = alertId ? await eventsQuery.eq("alert_id", alertId) : await eventsQuery;
  if (events?.length) {
    state.events = events.map((event) => {
      const time = new Date(event.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
      return `${time} - ${event.message}`;
    });
  }

  const { data: aidReports } = await supabaseClient
    .from("first_aid_reports")
    .select("*")
    .order("reported_at", { ascending: false })
    .limit(8);

  state.reports = [
    ...(alert ? [[`${alert.type === "REAL" ? "Alarme réelle" : "Exercice"} - ${alert.building_name}`, new Date(alert.triggered_at).toLocaleDateString("fr-FR"), `${state.notified} notifiés, ${state.responded} réponses`]] : []),
    ...(aidReports || []).map((report) => [
      `Secours à personne - ${report.location}`,
      new Date(report.reported_at).toLocaleDateString("fr-FR"),
      report.incident_type,
    ]),
  ];

  renderDashboard();
  renderTables();
}

function subscribeToRealtime() {
  if (state.realtimeChannel) {
    return;
  }
  state.realtimeChannel = supabaseClient
    .channel("safety-evac-demo")
    .on("postgres_changes", { event: "*", schema: "public", table: "alerts" }, loadRemoteState)
    .on("postgres_changes", { event: "*", schema: "public", table: "evacuation_responses" }, loadRemoteState)
    .on("postgres_changes", { event: "*", schema: "public", table: "first_aid_reports" }, loadRemoteState)
    .on("postgres_changes", { event: "*", schema: "public", table: "app_events" }, loadRemoteState)
    .subscribe();
}

function setView(viewId) {
  $$(".view").forEach((view) => view.classList.toggle("active", view.id === viewId));
  $$(".nav-item").forEach((item) => item.classList.toggle("active", item.dataset.view === viewId));
  $("#page-title").textContent = titles[viewId];
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderDashboard() {
  $("#metric-notified").textContent = state.notified;
  $("#metric-responded").textContent = state.responded;
  $("#metric-safe").textContent = state.safe;

  $("#zone-list").innerHTML = state.zones.map((zone) => `
    <div class="zone-row">
      <strong>${zone.name}</strong>
      <div class="progress" aria-label="Progression ${zone.name}">
        <span style="width: ${zone.progress}%"></span>
      </div>
      <span>${zone.progress}%</span>
    </div>
  `).join("");

  $("#timeline").innerHTML = state.events.map((event) => `<li>${event}</li>`).join("");
}

function renderTables() {
  $("#people-table").innerHTML = state.people.map(([name, zone, status, signal]) => `
    <tr>
      <td><strong>${name}</strong></td>
      <td>${zone}</td>
      <td>${status}</td>
      <td>${signal}</td>
    </tr>
  `).join("");

  $("#report-list").innerHTML = state.reports.map(([title, date, summary]) => `
    <article class="report-card">
      <div>
        <strong>${title}</strong>
        <p>${summary}</p>
      </div>
      <span>${date}</span>
    </article>
  `).join("");
}

async function simulateResponse() {
  if (!state.activeAlert) {
    showToast("Aucune alerte active à alimenter.");
    return;
  }
  const personName = `Employé démo ${Math.floor(Math.random() * 999)}`;
  const { error } = await supabaseClient.from("evacuation_responses").insert({
    alert_id: state.activeAlert.id,
    person_name: personName,
    role: "employee",
    zone: "A1",
    is_present: true,
    is_safe: true,
    location: "Point Nord",
    notes: "Réponse simulée",
  });
  if (error) {
    showToast(`Erreur Supabase: ${error.message}`);
    return;
  }
  state.responded += 1;
  state.safe += 1;
  await supabaseClient.from("app_events").insert({
    alert_id: state.activeAlert.id,
    message: `Nouvelle réponse reçue: ${personName}`,
  });
  renderDashboard();
  showToast("Réponse simulée reçue en temps réel.");
}

function bindEvents() {
  $$(".auth-tab").forEach((tab) => tab.addEventListener("click", () => setAuthMode(tab.dataset.authMode)));

  $("#login-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const { error } = await supabaseClient.auth.signInWithPassword({
      email: $("#login-email").value,
      password: $("#login-password").value,
    });
    if (error) {
      showToast(`Connexion: ${error.message}`);
      return;
    }
    showToast("Connexion réussie.");
  });

  $("#signup-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const profile = {
      nom: $("#signup-nom").value,
      telephone: $("#signup-telephone").value,
      batiment: $("#signup-batiment").value,
      zone: $("#signup-zone").value,
      role: $("#signup-role").value,
      statut_actif: true,
    };
    const { data, error } = await supabaseClient.auth.signUp({
      email: $("#signup-email").value,
      password: $("#signup-password").value,
      options: {
        data: {
          ...profile,
          email: $("#signup-email").value,
        },
        emailRedirectTo: window.location.href,
      },
    });
    if (error) {
      showToast(`Création: ${error.message}`);
      return;
    }
    if (data.session?.user) {
      state.user = data.session.user;
      try {
        await upsertOwnProfile(profile);
      } catch (profileError) {
        showToast(`Profil: ${profileError.message}`);
        return;
      }
      showToast("Compte créé et connecté.");
    } else {
      showToast("Compte créé. Vérifiez votre email pour confirmer l'inscription.");
      setAuthMode("login");
    }
  });

  $("#logout-button").addEventListener("click", async () => {
    await supabaseClient.auth.signOut();
    state.user = null;
    state.profile = null;
    if (state.realtimeChannel) {
      await supabaseClient.removeChannel(state.realtimeChannel);
      state.realtimeChannel = null;
    }
    renderAuthState();
    showToast("Déconnexion réussie.");
  });

  $$(".nav-item").forEach((item) => item.addEventListener("click", () => setView(item.dataset.view)));
  $$('[data-jump]').forEach((button) => button.addEventListener("click", () => setView(button.dataset.jump)));

  $("#simulate-response").addEventListener("click", simulateResponse);

  $("#trigger-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const type = $("#alert-type").value === "REAL" ? "Alarme réelle" : "Exercice";
    const { data, error } = await supabaseClient
      .from("alerts")
      .insert({
        type: $("#alert-type").value,
        status: "ACTIVE",
        building_name: $("#building").value,
        zones: $("#zones").value.split(",").map((zone) => zone.trim()).filter(Boolean),
        assembly_point: $("#assembly").value,
        message: $("#message").value,
        notified_count: 86,
        triggered_by: "Claire Muller",
      })
      .select()
      .single();
    if (error) {
      showToast(`Erreur Supabase: ${error.message}`);
      return;
    }
    await supabaseClient.from("app_events").insert({
      alert_id: data.id,
      message: `${type} déclenché par Claire Muller`,
    });
    await loadRemoteState();
    setView("dashboard");
    showToast(`${type} déclenché pour ${$("#building").value}.`);
  });

  $("#employee-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!state.activeAlert) {
      showToast("Aucune alerte active.");
      return;
    }
    const { error } = await supabaseClient.from("evacuation_responses").insert({
      alert_id: state.activeAlert.id,
      person_name: $("#employee-name").value || "Employé démo",
      role: "employee",
      zone: "A1",
      is_present: $("#employee-present").value === "true",
      is_safe: $("#employee-safe").value === "true",
      location: $("#employee-location").value,
    });
    if (error) {
      showToast(`Erreur Supabase: ${error.message}`);
      return;
    }
    showToast("Réponse employé enregistrée.");
  });

  $("#guide-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!state.activeAlert) {
      showToast("Aucune alerte active.");
      return;
    }
    const allOk = $("#guide-zone-ok").checked && $("#guide-point-ok").checked && $("#guide-all-ok").checked;
    const { error } = await supabaseClient.from("evacuation_responses").insert({
      alert_id: state.activeAlert.id,
      person_name: $("#guide-name").value || "Guide démo",
      role: "guide_file",
      zone: $("#guide-zone").value || "A2",
      is_present: true,
      is_safe: allOk,
      location: $("#guide-point-ok").checked ? state.activeAlert.assembly_point : "",
      notes: $("#guide-notes").value || (allOk ? "Checklist validée" : "Checklist incomplète"),
    });
    if (error) {
      showToast(`Erreur Supabase: ${error.message}`);
      return;
    }
    showToast("Checklist guide-file validée.");
  });

  $("#scan-location").addEventListener("click", () => {
    $("#aid-location").value = "Bâtiment A - Escalier Est";
    showToast("QR lieu simulé : Bâtiment A - Escalier Est.");
  });

  $("#aid-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const { error } = await supabaseClient.from("first_aid_reports").insert({
      location: $("#aid-location").value,
      victim_name: $("#aid-victim").value || null,
      incident_type: $("#aid-type").value,
      reported_by: "Claire Muller",
    });
    if (error) {
      showToast(`Erreur Supabase: ${error.message}`);
      return;
    }
    await loadRemoteState();
    showToast("Alerte secours transmise au chef de sécurité.");
  });

  $("#export-report").addEventListener("click", () => {
    showToast("Export PDF simulé pour le prototype.");
  });
}

renderDashboard();
renderTables();
bindEvents();
initializeAuth();
