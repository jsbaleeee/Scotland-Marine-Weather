/* ==========================================================================
   PortCast — Observations Admin
   Shows every observation for YOUR company across every port. Requires a
   real login (same Supabase account as the main dashboard) — no PIN here.
   Supabase config now lives in ONE place: supabase-config.js (loaded via
   <script> before this file in admin.html).
   ========================================================================== */

const PORT_NAMES = {
  lerwick: "Lerwick", kirkwall: "Kirkwall", aberdeen: "Aberdeen",
  oban: "Oban", mallaig: "Mallaig", ullapool: "Ullapool", ardrossan: "Ardrossan",
  troon: "Troon", gourock: "Gourock", wemyssbay: "Wemyss Bay", largs: "Largs",
  claonaig: "Claonaig", tarbertkintyre: "Tarbert (Kintyre)", kennacraig: "Kennacraig",
  tayinloan: "Tayinloan", portavadie: "Portavadie", lochaline: "Lochaline",
  kilcreggan: "Kilcreggan", colintraive: "Colintraive", gallanach: "Gallanach",
  fionnphort: "Fionnphort", brodick: "Brodick (Arran)", lochranza: "Lochranza (Arran)",
  rothesay: "Rothesay (Bute)", rhubodach: "Rhubodach (Bute)", millport: "Millport (Cumbrae)",
  gigha: "Gigha", dunoon: "Dunoon", kerrera: "Kerrera", iona: "Iona",
  fishnish: "Fishnish (Mull)", tobermory: "Tobermory (Mull)", kilchoan: "Kilchoan",
  craignure: "Craignure (Mull)", colonsay: "Colonsay", portaskaig: "Port Askaig (Islay)",
  portellen: "Port Ellen (Islay)", castlebay: "Castlebay (Barra)", eriskay: "Eriskay",
  lochboisdale: "Lochboisdale (S. Uist)", lochmaddy: "Lochmaddy (N. Uist)", uig: "Uig (Skye)",
  armadale: "Armadale (Skye)", sconser: "Sconser (Skye)", raasay: "Raasay",
  tarbertharris: "Tarbert (Harris)", stornoway: "Stornoway (Lewis)", arinagour: "Arinagour (Coll)",
  scarinish: "Scarinish (Tiree)", eigg: "Eigg", muck: "Muck", rum: "Rum", canna: "Canna",
};

const $ = (id) => document.getElementById(id);
let currentCompany = null;
let isAdmin = false;

function populatePortFilter() {
  const sel = $("filterPort");
  Object.entries(PORT_NAMES).forEach(([key, name]) => sel.add(new Option(name, key)));
}

async function populateCompanyFilter() {
  const { data, error } = await supabaseClient.from("companies").select("id, name").order("name");
  if (error || !data) return;
  const sel = $("filterCompany");
  data.forEach((c) => sel.add(new Option(c.name, c.id)));
}

async function countRows(table, companyId) {
  const { count } = await supabaseClient.from(table).select("*", { count: "exact", head: true }).eq("company_id", companyId);
  return count || 0;
}

/* ==========================================================================
   Site Content Editor (announcement + Local Knowledge) — admin only
   ========================================================================== */
function populateLocalKnowledgePortSelect() {
  const sel = $("localKnowledgePort");
  Object.entries(PORT_NAMES).forEach(([key, name]) => sel.add(new Option(name, key)));
}

async function loadAnnouncementIntoEditor() {
  const { data } = await supabaseClient.from("site_settings").select("*").eq("id", "main").maybeSingle();
  if (data) {
    $("announcementInput").value = data.announcement || "";
    $("announcementActive").checked = !!data.announcement_active;
  }
}

async function loadLocalKnowledgeIntoEditor(portKey) {
  const { data } = await supabaseClient.from("port_notes").select("note_text").eq("port", portKey).maybeSingle();
  $("localKnowledgeInput").value = data?.note_text || "";
}

function initContentEditor() {
  $("contentEditor").classList.remove("hidden");
  populateLocalKnowledgePortSelect();
  loadAnnouncementIntoEditor();
  loadLocalKnowledgeIntoEditor($("localKnowledgePort").value);

  $("localKnowledgePort").addEventListener("change", (e) => loadLocalKnowledgeIntoEditor(e.target.value));

  $("saveAnnouncementBtn").addEventListener("click", async () => {
    const { error } = await supabaseClient.from("site_settings").upsert({
      id: "main",
      announcement: $("announcementInput").value.trim(),
      announcement_active: $("announcementActive").checked,
      updated_at: new Date().toISOString(),
    });
    $("announcementSaveStatus").textContent = error ? "Failed: " + error.message : "Saved ✓";
    setTimeout(() => { $("announcementSaveStatus").textContent = ""; }, 2000);
  });

  $("saveLocalKnowledgeBtn").addEventListener("click", async () => {
    const port = $("localKnowledgePort").value;
    const text = $("localKnowledgeInput").value.trim();
    const { error } = await supabaseClient.from("port_notes").upsert({
      port, note_text: text, updated_at: new Date().toISOString(),
    });
    $("localKnowledgeSaveStatus").textContent = error ? "Failed: " + error.message : "Saved ✓";
    setTimeout(() => { $("localKnowledgeSaveStatus").textContent = ""; }, 2000);
  });
}

async function renderPlatformOverview() {
  const { data: companies, error } = await supabaseClient.from("companies").select("id, name, created_at").order("created_at");
  if (error || !companies) return;

  $("platformOverview").classList.remove("hidden");
  $("statCompanies").textContent = companies.length;

  const body = $("companiesTableBody");
  body.innerHTML = "";
  let totalVessels = 0, totalMembers = 0, totalObservations = 0;

  for (const c of companies) {
    const [vessels, members, observations] = await Promise.all([
      countRows("vessels", c.id), countRows("company_members", c.id), countRows("observations", c.id),
    ]);
    totalVessels += vessels; totalMembers += members; totalObservations += observations;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td style="color:var(--paper)">${c.name}</td>
      <td style="color:var(--paper-dim)">${new Date(c.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</td>
      <td style="color:var(--brass-light)">${vessels}</td>
      <td style="color:var(--brass-light)">${members}</td>
      <td style="color:var(--brass-light)">${observations}</td>
    `;
    body.appendChild(tr);
  }

  $("statVessels").textContent = totalVessels;
  $("statMembers").textContent = totalMembers;
  $("statObservations").textContent = totalObservations;
}

async function fetchAllObservations() {
  const portFilter = $("filterPort").value;
  const categoryFilter = $("filterCategory").value;
  const companyFilter = isAdmin ? $("filterCompany").value : null;

  // RLS scopes this to the logged-in user's own company automatically —
  // UNLESS they're a flagged platform admin, in which case RLS allows
  // every company's rows through and we filter client-side via the
  // company dropdown instead.
  let query = supabaseClient.from("observations").select("*").order("created_at", { ascending: false }).limit(200);
  if (portFilter) query = query.eq("port", portFilter);
  if (categoryFilter) query = query.eq("category", categoryFilter);
  if (companyFilter) query = query.eq("company_id", companyFilter);
  const { data, error } = await query;
  if (error) { console.error(error.message); return []; }
  return data.map((row) => ({
    port: row.port, category: row.category, text: row.note_text,
    time: row.created_at, confirms: row.confirms,
  }));
}

async function renderTable() {
  const rows = await fetchAllObservations();
  const body = $("obsTableBody");
  body.innerHTML = "";
  $("emptyState").classList.toggle("hidden", rows.length > 0);
  $("rowCount").textContent = `${rows.length} observation(s)`;

  rows.forEach((r) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td style="color:var(--paper-dim)">${new Date(r.time).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</td>
      <td style="color:var(--paper)">${PORT_NAMES[r.port] || r.port}</td>
      <td><span class="px-2 py-0.5 rounded-sm" style="background:rgba(111,168,160,0.15); color:var(--seafoam)">${r.category}</span></td>
      <td style="color:var(--paper)">${r.text}</td>
      <td style="color:var(--brass-light)">${r.confirms}</td>
    `;
    body.appendChild(tr);
  });

  $("dbStatusNote").textContent = isAdmin
    ? "Logged in as platform admin — showing observations across all companies (use the company filter to narrow)."
    : `Logged in as ${currentCompany.name} — showing your company's observations only.`;
}

async function init() {
  if (!isDbConfigured()) {
    $("adminLocked").classList.remove("hidden");
    $("adminLocked").innerHTML = `<p class="text-xs" style="color:var(--paper-dim)">No database connected yet — set this up from app.js first.</p>`;
    return;
  }

  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) {
    $("adminLocked").classList.remove("hidden");
    $("adminLocked").innerHTML = `
      <p class="text-xs mb-3" style="color:var(--paper-dim)">Log in with your company account to view observations.</p>
      <a href="login.html" class="inline-block text-xs uppercase tracking-wider px-4 py-2 rounded-sm" style="background:var(--brass); color:var(--navy-deep)">Log in</a>
    `;
    return;
  }

  // Check platform-admin status first — an admin doesn't necessarily
  // belong to any company at all, so this has to be checked before
  // assuming a missing company_members row means "not logged in properly".
  const { data: adminRow } = await supabaseClient
    .from("platform_admins").select("user_id").eq("user_id", session.user.id).maybeSingle();
  isAdmin = !!adminRow;

  const { data: membership, error } = await supabaseClient
    .from("company_members").select("company_id, companies(name)").eq("user_id", session.user.id).single();

  if ((error || !membership) && !isAdmin) {
    $("adminLocked").classList.remove("hidden");
    $("adminLocked").innerHTML = `<p class="text-xs" style="color:var(--paper-dim)">Couldn't find a company for this account.</p>`;
    return;
  }

  if (!error && membership) currentCompany = { id: membership.company_id, name: membership.companies.name };
  $("adminUnlocked").classList.remove("hidden");
  $("companyFilterWrap").classList.toggle("hidden", !isAdmin);
  populatePortFilter();
  if (isAdmin) {
    await populateCompanyFilter();
    await renderPlatformOverview();
    initContentEditor();
  }
  await renderTable();
}

$("refreshBtn")?.addEventListener("click", renderTable);
document.addEventListener("change", (e) => {
  if (["filterPort", "filterCategory", "filterCompany"].includes(e.target.id)) renderTable();
});

init();
