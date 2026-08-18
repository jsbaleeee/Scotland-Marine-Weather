/* ==========================================================================
   PortCast — Observations Admin
   Shows every observation for YOUR company across every port. Requires a
   real login (same Supabase account as the main dashboard) — no PIN here.
   Keep SUPABASE_URL / SUPABASE_ANON_KEY identical across app.js, admin.js,
   login.js, and fleet.js.
   ========================================================================== */
const SUPABASE_URL = ""; // <-- same value as in app.js
const SUPABASE_ANON_KEY = ""; // <-- same value as in app.js

let supabaseClient = null;
if (SUPABASE_URL && SUPABASE_ANON_KEY && window.supabase) {
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
const isDbConfigured = () => supabaseClient !== null;

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

function populatePortFilter() {
  const sel = $("filterPort");
  Object.entries(PORT_NAMES).forEach(([key, name]) => sel.add(new Option(name, key)));
}

async function fetchAllObservations() {
  const portFilter = $("filterPort").value;
  const categoryFilter = $("filterCategory").value;

  // RLS automatically scopes this to the logged-in user's company —
  // no need to filter by company_id explicitly here.
  let query = supabaseClient.from("observations").select("*").order("created_at", { ascending: false }).limit(200);
  if (portFilter) query = query.eq("port", portFilter);
  if (categoryFilter) query = query.eq("category", categoryFilter);
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

  $("dbStatusNote").textContent = `Logged in as ${currentCompany.name} — showing your company's observations only.`;
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

  const { data: membership, error } = await supabaseClient
    .from("company_members").select("company_id, companies(name)").eq("user_id", session.user.id).single();

  if (error || !membership) {
    $("adminLocked").classList.remove("hidden");
    $("adminLocked").innerHTML = `<p class="text-xs" style="color:var(--paper-dim)">Couldn't find a company for this account.</p>`;
    return;
  }

  currentCompany = { id: membership.company_id, name: membership.companies.name };
  $("adminUnlocked").classList.remove("hidden");
  populatePortFilter();
  await renderTable();
}

$("refreshBtn")?.addEventListener("click", renderTable);
document.addEventListener("change", (e) => {
  if (e.target.id === "filterPort" || e.target.id === "filterCategory") renderTable();
});

init();
