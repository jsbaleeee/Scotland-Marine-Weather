/* ==========================================================================
   PortCast — Shared Supabase config
   --------------------------------------------------------------------------
   Loaded by every page (index.html, admin.html, login.html, fleet.html)
   BEFORE their own script tag. Fill in your Supabase details ONCE here —
   no more editing 4 separate files and hoping they stay in sync.
   ========================================================================== */
const SUPABASE_URL = ""; // <-- e.g. https://xxxxxxxx.supabase.co
const SUPABASE_ANON_KEY = ""; // <-- the "anon public" key, not the service key

let supabaseClient = null;
if (SUPABASE_URL && SUPABASE_ANON_KEY && window.supabase) {
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
const isDbConfigured = () => supabaseClient !== null;
