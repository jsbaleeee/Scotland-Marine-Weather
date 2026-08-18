/* ==========================================================================
   PortCast — Fleet Registry
   ========================================================================== */
const SUPABASE_URL = ""; // <-- same value as in app.js
const SUPABASE_ANON_KEY = ""; // <-- same value as in app.js

let supabaseClient = null;
if (SUPABASE_URL && SUPABASE_ANON_KEY && window.supabase) {
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

const $ = (id) => document.getElementById(id);
let companyId = null;

async function init() {
  if (!supabaseClient) {
    $("notLoggedIn").classList.remove("hidden");
    $("notLoggedIn").querySelector("p").textContent = "No database is connected yet — set this up from app.js first.";
    return;
  }

  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) {
    $("notLoggedIn").classList.remove("hidden");
    return;
  }

  const { data: membership, error } = await supabaseClient
    .from("company_members").select("company_id, companies(name)").eq("user_id", session.user.id).single();

  if (error || !membership) {
    $("notLoggedIn").classList.remove("hidden");
    $("notLoggedIn").querySelector("p").textContent = "Couldn't find a company for this account.";
    return;
  }

  companyId = membership.company_id;
  $("companyLabel").textContent = `Managing fleet for ${membership.companies.name}`;
  $("fleetContent").classList.remove("hidden");
  await renderVessels();
}

async function renderVessels() {
  const { data, error } = await supabaseClient
    .from("vessels").select("*").eq("company_id", companyId).order("name");
  const body = $("vesselTableBody");
  body.innerHTML = "";

  if (error || !data) { return; }
  $("emptyState").classList.toggle("hidden", data.length > 0);

  data.forEach((v) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td style="color:var(--paper)">${v.name}</td>
      <td style="color:var(--paper-dim)">${v.mmsi}</td>
      <td><button data-id="${v.id}" class="delete-vessel-btn text-[10px] uppercase px-2 py-1 rounded-sm border" style="border-color:var(--admiralty-red); color:#F3C9C4">Remove</button></td>
    `;
    body.appendChild(tr);
  });

  body.querySelectorAll(".delete-vessel-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      await supabaseClient.from("vessels").delete().eq("id", Number(btn.dataset.id));
      await renderVessels();
    });
  });
}

$("addVesselForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = $("vesselName").value.trim();
  const mmsi = $("vesselMmsi").value.trim();
  if (!name || !mmsi) return;

  const { error } = await supabaseClient.from("vessels").insert({ company_id: companyId, name, mmsi });
  if (error) { alert("Couldn't add vessel: " + error.message); return; }

  $("vesselName").value = "";
  $("vesselMmsi").value = "";
  await renderVessels();
});

init();
