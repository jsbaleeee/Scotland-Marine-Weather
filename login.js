/* ==========================================================================
   PortCast — Company login / signup
   Supabase config now lives in ONE place: supabase-config.js (loaded via
   <script> before this file in login.html).
   ========================================================================== */

const $ = (id) => document.getElementById(id);
let mode = "login"; // "login" | "signup"

if (!supabaseClient) {
  $("notConfigured").classList.remove("hidden");
  $("authForm").classList.add("hidden");
}

function setMode(newMode) {
  mode = newMode;
  const isLogin = mode === "login";
  $("tabLogin").style.background = isLogin ? "var(--brass)" : "transparent";
  $("tabLogin").style.color = isLogin ? "var(--navy-deep)" : "var(--brass-light)";
  $("tabSignup").style.background = isLogin ? "transparent" : "var(--brass)";
  $("tabSignup").style.color = isLogin ? "var(--brass-light)" : "var(--navy-deep)";
  $("companyName").classList.toggle("hidden", isLogin);
  $("submitBtn").textContent = isLogin ? "Log in" : "Create company & account";
}

$("tabLogin")?.addEventListener("click", () => setMode("login"));
$("tabSignup")?.addEventListener("click", () => setMode("signup"));

$("submitBtn")?.addEventListener("click", async () => {
  const email = $("email").value.trim();
  const password = $("password").value;
  const msg = $("authMessage");
  msg.textContent = "";

  if (!email || !password) { msg.textContent = "Enter an email and password."; return; }

  if (mode === "login") {
    const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) { msg.textContent = error.message; return; }
    window.location.href = "index.html";
    return;
  }

  // Signup: create the auth user, then a company, then link them together.
  const companyName = $("companyName").value.trim();
  if (!companyName) { msg.textContent = "Enter a company name."; return; }

  const { data: signUpData, error: signUpError } = await supabaseClient.auth.signUp({ email, password });
  if (signUpError) { msg.textContent = signUpError.message; return; }

  // If email confirmation is required (Supabase default), there's no
  // active session yet — tell the user to confirm before continuing.
  if (!signUpData.session) {
    msg.textContent = "Check your email to confirm your account, then log in.";
    return;
  }

  const { data: company, error: companyError } = await supabaseClient
    .from("companies").insert({ name: companyName }).select().single();
  if (companyError) { msg.textContent = "Account created, but company setup failed: " + companyError.message; return; }

  const { error: memberError } = await supabaseClient
    .from("company_members").insert({ user_id: signUpData.user.id, company_id: company.id, role: "admin" });
  if (memberError) { msg.textContent = "Account created, but linking to company failed: " + memberError.message; return; }

  window.location.href = "index.html";
});

setMode("login");
