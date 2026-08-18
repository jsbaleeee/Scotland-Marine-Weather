/* ==========================================================================
   Scottish Marine Weather Dashboard
   Vanilla JS — data fetching, unit conversion, tide lookup, feature gating
   ========================================================================== */

/* ---------- Port data (name -> coords + nearest EA tidal station search) --- */
const PORTS = {
  // Weather stations (non-CalMac reference points)
  lerwick:      { name: "Lerwick",           lat: 60.1547, lon: -1.1494 },
  kirkwall:     { name: "Kirkwall",          lat: 58.9807, lon: -2.9605 },
  aberdeen:     { name: "Aberdeen",          lat: 57.1497, lon: -2.0943 },

  // CalMac — Mainland
  oban:         { name: "Oban",              lat: 56.4152, lon: -5.4719 },
  mallaig:      { name: "Mallaig",           lat: 57.0068, lon: -5.8285 },
  ullapool:     { name: "Ullapool",          lat: 57.8956, lon: -5.1608 },
  ardrossan:    { name: "Ardrossan",         lat: 55.6408, lon: -4.8207 },
  troon:        { name: "Troon",             lat: 55.5350, lon: -4.6600 },
  gourock:      { name: "Gourock",           lat: 55.9581, lon: -4.8148 },
  wemyssbay:    { name: "Wemyss Bay",        lat: 55.8747, lon: -4.8869 },
  largs:        { name: "Largs",             lat: 55.7970, lon: -4.8680 },
  claonaig:     { name: "Claonaig",          lat: 55.7871, lon: -5.4009 },
  tarbertkintyre:{ name: "Tarbert (Kintyre)",lat: 55.8664, lon: -5.4139 },
  kennacraig:   { name: "Kennacraig",        lat: 55.7826, lon: -5.4661 },
  tayinloan:    { name: "Tayinloan",         lat: 55.6417, lon: -5.6614 },
  portavadie:   { name: "Portavadie",        lat: 55.8814, lon: -5.3125 },
  lochaline:    { name: "Lochaline",         lat: 56.5325, lon: -5.7770 },
  kilcreggan:   { name: "Kilcreggan",        lat: 55.9758, lon: -4.8309 },
  colintraive:  { name: "Colintraive",       lat: 55.9336, lon: -5.1519 },
  gallanach:    { name: "Gallanach",         lat: 56.4001, lon: -5.4890 },
  fionnphort:   { name: "Fionnphort",        lat: 56.3244, lon: -6.3789 },

  // CalMac — Islands
  brodick:      { name: "Brodick (Arran)",         lat: 55.5760, lon: -5.1450 },
  lochranza:    { name: "Lochranza (Arran)",       lat: 55.7040, lon: -5.3010 },
  rothesay:     { name: "Rothesay (Bute)",         lat: 55.8386, lon: -5.0533 },
  rhubodach:    { name: "Rhubodach (Bute)",        lat: 55.9463, lon: -5.1481 },
  millport:     { name: "Millport (Cumbrae)",      lat: 55.7500, lon: -4.9100 },
  gigha:        { name: "Gigha",                   lat: 55.6820, lon: -5.7370 },
  dunoon:       { name: "Dunoon",                  lat: 55.9490, lon: -4.9270 },
  kerrera:      { name: "Kerrera",                 lat: 56.3990, lon: -5.5460 },
  iona:         { name: "Iona",                    lat: 56.3310, lon: -6.3900 },
  fishnish:     { name: "Fishnish (Mull)",         lat: 56.5150, lon: -5.7900 },
  tobermory:    { name: "Tobermory (Mull)",        lat: 56.6230, lon: -6.0640 },
  kilchoan:     { name: "Kilchoan",                lat: 56.6890, lon: -6.1130 },
  craignure:    { name: "Craignure (Mull)",        lat: 56.4720, lon: -5.7020 },
  colonsay:     { name: "Colonsay",                lat: 56.0790, lon: -6.1770 },
  portaskaig:   { name: "Port Askaig (Islay)",     lat: 55.8460, lon: -6.1050 },
  portellen:    { name: "Port Ellen (Islay)",      lat: 55.6270, lon: -6.1930 },
  castlebay:    { name: "Castlebay (Barra)",       lat: 56.9490, lon: -7.4870 },
  eriskay:      { name: "Eriskay",                 lat: 57.0870, lon: -7.2900 },
  lochboisdale: { name: "Lochboisdale (S. Uist)",  lat: 57.1520, lon: -7.3190 },
  lochmaddy:    { name: "Lochmaddy (N. Uist)",     lat: 57.5960, lon: -7.1520 },
  uig:          { name: "Uig (Skye)",              lat: 57.5920, lon: -6.3720 },
  armadale:     { name: "Armadale (Skye)",         lat: 57.0640, lon: -5.8990 },
  sconser:      { name: "Sconser (Skye)",          lat: 57.3280, lon: -6.1130 },
  raasay:       { name: "Raasay",                  lat: 57.4060, lon: -6.0540 },
  tarbertharris:{ name: "Tarbert (Harris)",        lat: 57.8960, lon: -6.7960 },
  stornoway:    { name: "Stornoway (Lewis)",       lat: 58.2093, lon: -6.3862 },
  arinagour:    { name: "Arinagour (Coll)",        lat: 56.6160, lon: -6.5310 },
  scarinish:    { name: "Scarinish (Tiree)",       lat: 56.5010, lon: -6.8010 },
  eigg:         { name: "Eigg",                    lat: 56.8770, lon: -6.1350 },
  muck:         { name: "Muck",                    lat: 56.8300, lon: -6.2300 },
  rum:          { name: "Rum",                     lat: 57.0070, lon: -6.2850 },
  canna:        { name: "Canna",                   lat: 57.0550, lon: -6.4700 },
};

/* ---------- Typical tidal range (reference, NOT live) ---------------------
   Springs range (MHWS − MLWS) in metres, per port. This is static reference
   data — not a live measurement — and belongs to Admiralty Tide Tables /
   UKHO, not CMAL's live gauges (see conversation note on why we don't scrape
   CMAL's site). Left unpopulated deliberately: fabricating precise nautical
   figures for a tool touching navigation is not something to do without a
   verified source. Fill each value in from the Admiralty Tide Tables /
   UKHO EasyTide (https://easytide.admiralty.co.uk/) or a port's own
   published Passage/Pilot information, then it will display automatically. */
const TIDAL_RANGES = {
  // portKey: rangeInMetres — e.g. oban: 3.1,
  lerwick: null, kirkwall: null, aberdeen: null,
  oban: null, mallaig: null, ullapool: null, ardrossan: null, troon: null,
  gourock: null, wemyssbay: null, largs: null, claonaig: null, tarbertkintyre: null,
  kennacraig: null, tayinloan: null, portavadie: null, lochaline: null,
  kilcreggan: null, colintraive: null, gallanach: null, fionnphort: null,
  brodick: null, lochranza: null, rothesay: null, rhubodach: null, millport: null,
  gigha: null, dunoon: null, kerrera: null, iona: null, fishnish: null,
  tobermory: null, kilchoan: null, craignure: null, colonsay: null,
  portaskaig: null, portellen: null, castlebay: null, eriskay: null,
  lochboisdale: null, lochmaddy: null, uig: null, armadale: null, sconser: null,
  raasay: null, tarbertharris: null, stornoway: null, arinagour: null,
  scarinish: null, eigg: null, muck: null, rum: null, canna: null,
};

/* ---------- Feature flag: paid status ---------- */
/* In production this is set from your auth/subscription backend after
   Stripe confirms payment (see server.js). Toggle here for local testing. */
let isProUser = true; // TEMP: set back to false to re-enable the paywall

/* ---------- App state ---------- */
const state = {
  port: "oban",
  proView: false,     // "Pro Maritime View" UI toggle (units/detail density)
  unit: {
    temp: "C",         // C | F
    speed: "mph",       // mph | kn
  },
  lastData: null,
};

/* ---------- DOM refs ---------- */
const $ = (id) => document.getElementById(id);
const portSelect   = $("portSelect");
const viewToggle   = $("viewToggle");
const labelStandard= $("labelStandard");
const labelPro     = $("labelPro");
const portNameEl   = $("portName");
const lastUpdated  = $("lastUpdated");
const unitBadge    = $("unitBadge");

/* ==========================================================================
   1) WEATHER + MARINE DATA (Open-Meteo — no API key required)
   ========================================================================== */
async function fetchWeatherAndMarine(lat, lon) {
  const weatherUrl =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,` +
    `wind_speed_10m,wind_gusts_10m,wind_direction_10m,visibility,dew_point_2m` +
    `&hourly=wind_gusts_10m` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min,wind_gusts_10m_max,precipitation_probability_max,sunrise,sunset` +
    `&forecast_days=5` +
    `&wind_speed_unit=mph&temperature_unit=celsius&timezone=auto`;

  const marineUrl =
    `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}` +
    `&current=wave_height,wave_period,swell_wave_height,swell_wave_direction,swell_wave_period,sea_surface_temperature` +
    `&daily=wave_height_max` +
    `&forecast_days=5` +
    `&timezone=auto`;

  const [weatherRes, marineRes] = await Promise.all([
    fetch(weatherUrl).then((r) => { if (!r.ok) throw new Error("weather fetch failed"); return r.json(); }),
    fetch(marineUrl).then((r) => { if (!r.ok) throw new Error("marine fetch failed"); return r.json(); }).catch(() => null),
    // Marine API has sparser global coverage than the weather API; fail soft.
  ]);

  return { weather: weatherRes, marine: marineRes };
}

const WMO_DESCRIPTIONS = {
  0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
  45: "Fog", 48: "Depositing rime fog",
  51: "Light drizzle", 53: "Drizzle", 55: "Dense drizzle",
  61: "Light rain", 63: "Rain", 65: "Heavy rain",
  71: "Light snow", 73: "Snow", 75: "Heavy snow",
  80: "Light showers", 81: "Showers", 82: "Violent showers",
  95: "Thunderstorm", 96: "Thunderstorm w/ hail", 99: "Severe thunderstorm",
};

function compassFromDegrees(deg) {
  if (deg === null || deg === undefined || isNaN(deg)) return "—";
  const dirs = ["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"];
  return dirs[Math.round(deg / 22.5) % 16];
}

/* ==========================================================================
   2) UK TIDE DATA (Environment Agency flood-monitoring API)
   --------------------------------------------------------------------------
   Note: the EA "real-time flood-monitoring" API (environment.data.gov.uk)
   publishes live tidal-level GAUGE READINGS for coastal stations — it does
   NOT publish official predicted high/low tide TIMES. For fully predicted
   tide tables (the kind harbourmasters use) you need the UK Hydrographic
   Office's Admiralty UK Tidal API, which requires a (free-tier available)
   subscription key: https://admiraltyapi.portal.azure-api.net/
   This module uses the open EA gauge data to show the latest recorded
   level and short-term trend, and is written so the Admiralty API can be
   swapped in later (see fetchAdmiraltyTide stub below) once you have a key.
   ========================================================================== */
async function findNearestTidalStation(lat, lon) {
  const url =
    `https://environment.data.gov.uk/flood-monitoring/id/stations` +
    `?parameter=level&qualifier=Tidal&lat=${lat}&long=${lon}&dist=35&_limit=1`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("station lookup failed");
  const data = await res.json();
  return data.items && data.items[0] ? data.items[0] : null;
}

async function fetchTidalReadings(stationNoticeUrl) {
  // stationNoticeUrl looks like .../id/stations/{id}
  const url = `${stationNoticeUrl}/readings?_sorted&_limit=6`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("readings fetch failed");
  return res.json();
}

async function fetchUkTideStatus(lat, lon) {
  try {
    const station = await findNearestTidalStation(lat, lon);
    if (!station) return { available: false, reason: "No tidal gauge within range" };

    const readings = await fetchTidalReadings(station["@id"]);
    const items = (readings.items || []).filter((r) => typeof r.value === "number");
    if (items.length < 2) return { available: false, reason: "Insufficient recent readings" };

    const latest = items[0];
    const previous = items[1];
    const trend = latest.value > previous.value ? "Rising" : latest.value < previous.value ? "Falling" : "Steady";

    return {
      available: true,
      stationName: station.label || station.stationReference || "Unnamed station",
      levelMetres: latest.value,
      trend,
      dateTime: latest.dateTime,
    };
  } catch (err) {
    return { available: false, reason: "EA tidal service unreachable" };
  }
}

/* Stub for swapping in official predicted tide times once you hold an
   Admiralty UK Tidal API key. Left unimplemented deliberately — do not
   call with a hardcoded key from client-side JS; proxy it through your
   own backend (see server.js) so the key isn't exposed in the browser. */
// async function fetchAdmiraltyTide(stationId) { /* proxy via your backend */ }

/* ==========================================================================
   3) UNIT CONVERSION
   ========================================================================== */
const convertTemp = (celsius, unit) => (unit === "F" ? (celsius * 9) / 5 + 32 : celsius);
const convertSpeed = (mph, unit) => (unit === "kn" ? mph * 0.868976 : mph);

function fmtTemp(celsius, unit) {
  if (celsius === null || celsius === undefined) return "—";
  return `${Math.round(convertTemp(celsius, unit))}°${unit}`;
}
function fmtSpeed(mph, unit) {
  if (mph === null || mph === undefined) return "—";
  return `${Math.round(convertSpeed(mph, unit))} ${unit === "kn" ? "kn" : "mph"}`;
}

/* ==========================================================================
   4) RENDER
   ========================================================================== */
function renderWeather(weather) {
  const c = weather?.current;
  if (!c) return;
  $("airTemp").textContent = fmtTemp(c.temperature_2m, state.unit.temp);
  $("feelsLike").textContent = fmtTemp(c.apparent_temperature, state.unit.temp);
  $("humidity").textContent = c.relative_humidity_2m != null ? `${c.relative_humidity_2m}%` : "—";
  $("weatherDesc").textContent = WMO_DESCRIPTIONS[c.weather_code] ?? "Conditions unavailable";

  $("visibility").textContent = c.visibility != null ? `${(c.visibility / 1000).toFixed(1)} km` : "—";

  const daily = weather?.daily;
  if (daily?.sunrise?.[0] && daily?.sunset?.[0]) {
    const sr = new Date(daily.sunrise[0]).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    const ss = new Date(daily.sunset[0]).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    $("sunTimes").textContent = `${sr} / ${ss}`;
  } else {
    $("sunTimes").textContent = "—";
  }

  $("windSpeed").textContent = fmtSpeed(c.wind_speed_10m, state.unit.speed);
  $("windGust").textContent = fmtSpeed(c.wind_gusts_10m, state.unit.speed);

  const gustAlert = $("gustAlert");
  if (state.proView && c.wind_gusts_10m && c.wind_speed_10m && c.wind_gusts_10m > c.wind_speed_10m * 1.5) {
    gustAlert.classList.remove("hidden");
  } else {
    gustAlert.classList.add("hidden");
  }

  lastUpdated.textContent = `Observed ${new Date(c.time).toLocaleString("en-GB", {
    weekday: "short", hour: "2-digit", minute: "2-digit",
  })}`;
}

function renderMarine(marine) {
  const c = marine?.current;
  const hasData = c && c.swell_wave_height != null;

  $("swellHeight").textContent = hasData ? `${c.swell_wave_height.toFixed(1)} m` : "—";
  $("swellDirection").textContent = hasData ? compassFromDegrees(c.swell_wave_direction) : "—";
  $("swellPeriod").textContent = hasData ? `${Math.round(c.swell_wave_period)}s` : "—";
  $("seaTemp").textContent = c?.sea_surface_temperature != null ? fmtTemp(c.sea_surface_temperature, state.unit.temp) : "—";
  $("wavePeriod").textContent = c?.wave_period != null ? `${Math.round(c.wave_period)}s` : "—";
}

/* ==========================================================================
   4d) FOG RISK (heuristic estimate — not an official forecast)
   --------------------------------------------------------------------------
   Uses temperature/dew-point spread + humidity + wind as a rough proxy.
   Clearly labelled as estimated since this is not a proper fog model.
   ========================================================================== */
function renderFogRisk(weather) {
  const c = weather?.current;
  const el = $("fogRisk");
  if (!c || c.dew_point_2m == null) { el.textContent = "—"; return; }

  const spread = c.temperature_2m - c.dew_point_2m;
  const humidity = c.relative_humidity_2m ?? 0;
  const windMph = c.wind_speed_10m ?? 99;

  let risk = "Low";
  if (spread <= 1 && humidity >= 92 && windMph <= 8) risk = "Elevated";
  else if (spread <= 2.5 && humidity >= 85 && windMph <= 12) risk = "Moderate";

  el.textContent = `${risk} (est.)`;
}

/* ==========================================================================
   4e) HOURLY GUST TIMING (next 12 hours)
   ========================================================================== */
function renderHourlyGusts(weather) {
  const row = $("gustTimingRow");
  const hourly = weather?.hourly;
  row.innerHTML = "";
  if (!hourly?.time) return;

  const nowIso = weather.current?.time;
  let startIdx = hourly.time.findIndex((t) => t >= nowIso);
  if (startIdx === -1) startIdx = 0;

  hourly.time.slice(startIdx, startIdx + 8).forEach((t, i) => {
    const idx = startIdx + i;
    const gust = hourly.wind_gusts_10m?.[idx];
    const hourLabel = new Date(t).toLocaleTimeString("en-GB", { hour: "2-digit" });
    const cell = document.createElement("div");
    cell.className = "text-center shrink-0";
    cell.style.minWidth = "3rem";
    cell.innerHTML = `
      <p style="color:var(--paper-dim)" class="text-[10px]">${hourLabel}</p>
      <p style="color:var(--paper)" class="instrument-value text-sm mt-1">${gust != null ? Math.round(convertSpeed(gust, state.unit.speed)) : "—"}</p>
    `;
    row.appendChild(cell);
  });
}

/* ==========================================================================
   4a) CONDITIONS BADGE (Green / Amber / Red at-a-glance summary)
   --------------------------------------------------------------------------
   Thresholds are a reasonable starting point for small-vessel/ferry
   operations, not an official standard — tune these once real crew
   feedback comes in.
   ========================================================================== */
function computeConditionsBadge(weather, marine) {
  const c = weather?.current;
  const m = marine?.current;
  if (!c) return { level: "unknown", label: "No data" };

  const gustMph = c.wind_gusts_10m ?? 0;
  const swellM = m?.swell_wave_height ?? 0;
  const visKm = c.visibility != null ? c.visibility / 1000 : 99;

  if (gustMph >= 45 || swellM >= 3 || visKm < 1) {
    return { level: "red", label: "Marginal — check before departure" };
  }
  if (gustMph >= 30 || swellM >= 1.5 || visKm < 4) {
    return { level: "amber", label: "Caution advised" };
  }
  return { level: "green", label: "Good conditions" };
}

function renderConditionsBadge(weather, marine) {
  const badge = $("conditionsBadge");
  const { level, label } = computeConditionsBadge(weather, marine);
  badge.textContent = label;
  badge.className = "font-mono text-[10px] uppercase tracking-wider px-2 py-1 rounded-sm border " +
    (level === "green" ? "badge-green" : level === "amber" ? "badge-amber" : level === "red" ? "badge-red" : "");
  if (level === "unknown") badge.style.borderColor = "rgba(217,174,104,0.3)";
}

async function renderTide(lat, lon) {
  $("tideStation").textContent = "Locating…";
  $("tideLevel").textContent = "—";
  $("tideTrend").textContent = "—";
  $("tideNote").textContent = "";

  const range = TIDAL_RANGES[state.port];
  $("tideRange").textContent = range != null
    ? `${range.toFixed(1)} m (springs)`
    : "— (add via Admiralty Tide Tables)";

  const tide = await fetchUkTideStatus(lat, lon);

  if (!tide.available) {
    $("tideStation").textContent = "Unavailable";
    $("tideLevel").textContent = "—";
    $("tideTrend").textContent = "—";
    $("tideNote").textContent = `${tide.reason}. Consult local port authority tide tables.`;
    $("tideTrendIcon").textContent = "–";
    return;
  }

  $("tideStation").textContent = tide.stationName;
  $("tideLevel").textContent = `${tide.levelMetres.toFixed(2)} m`;
  $("tideTrend").textContent = tide.trend;
  $("tideTrendIcon").textContent = tide.trend === "Rising" ? "↑" : tide.trend === "Falling" ? "↓" : "↔";
  $("tideNote").textContent =
    "Live gauge reading (EA tidal network), not an official predicted tide table. " +
    "For predicted high/low times, check Admiralty EasyTide or your local harbour authority.";
}

/* ==========================================================================
   4c) MULTI-DAY FORECAST (proper forward-looking forecast, not just current)
   ========================================================================== */
function renderForecast(weather, marine) {
  const row = $("forecastRow");
  row.innerHTML = "";
  const daily = weather?.daily;
  if (!daily || !daily.time) {
    row.innerHTML = `<p style="color:var(--paper-dim)">Forecast unavailable.</p>`;
    return;
  }

  const waveMax = marine?.daily?.wave_height_max || [];

  daily.time.forEach((dateStr, i) => {
    const date = new Date(dateStr);
    const dayLabel = date.toLocaleDateString("en-GB", { weekday: "short" });
    const dateLabel = date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
    const desc = WMO_DESCRIPTIONS[daily.weather_code?.[i]] ?? "—";
    const hi = daily.temperature_2m_max?.[i];
    const lo = daily.temperature_2m_min?.[i];
    const gust = daily.wind_gusts_10m_max?.[i];
    const rainChance = daily.precipitation_probability_max?.[i];
    const wave = waveMax[i];

    const cell = document.createElement("div");
    cell.className = "rounded-sm p-3";
    cell.style.background = "rgba(241,235,218,0.04)";
    cell.style.border = "1px solid rgba(217,174,104,0.15)";
    cell.innerHTML = `
      <p style="color:var(--brass-light)" class="uppercase tracking-wide">${dayLabel} <span style="color:var(--paper-dim)">${dateLabel}</span></p>
      <p style="color:var(--paper)" class="mt-1">${desc}</p>
      <p style="color:var(--paper)" class="mt-1 instrument-value">
        ${hi != null ? Math.round(convertTemp(hi, state.unit.temp)) : "—"}° / ${lo != null ? Math.round(convertTemp(lo, state.unit.temp)) : "—"}°${state.unit.temp}
      </p>
      <p style="color:var(--paper-dim)" class="mt-1">Gusts: ${gust != null ? Math.round(convertSpeed(gust, state.unit.speed)) : "—"} ${state.unit.speed}</p>
      <p style="color:var(--paper-dim)">Rain: ${rainChance != null ? rainChance + "%" : "—"}</p>
      ${wave != null ? `<p style="color:var(--seafoam)">Wave: ${wave.toFixed(1)} m</p>` : ""}
    `;
    row.appendChild(cell);
  });
}

/* ==========================================================================
   5) FEATURE GATING / PAYWALL
   ========================================================================== */
function applyPaywall() {
  const swellPaywall = $("swellPaywall");
  const tidePaywall = $("tidePaywall");
  const swellPeriodWrap = $("swellPeriodWrap");

  const gateProFeatures = !isProUser;

  swellPaywall.classList.toggle("hidden", !gateProFeatures);
  tidePaywall.classList.toggle("hidden", !gateProFeatures);
  swellPeriodWrap.classList.toggle("paywall-blur", gateProFeatures);

  document.querySelectorAll(".upgrade-btn").forEach((btn) => {
    btn.onclick = () => startUpgradeCheckout();
  });
}

async function startUpgradeCheckout() {
  // Calls your backend (see server.js) which creates a Stripe Checkout
  // Session and returns its URL. Never create Checkout Sessions from
  // client-side JS with a secret key.
  try {
    const res = await fetch("/api/create-checkout-session", { method: "POST" });
    if (!res.ok) throw new Error("checkout session failed");
    const { url } = await res.json();
    window.location.href = url;
  } catch (err) {
    alert("Unable to start checkout right now — please try again shortly.");
  }
}

/* ==========================================================================
   6) VIEW / UNIT TOGGLE LOGIC
   ========================================================================== */
function setProView(on) {
  state.proView = on;
  state.unit.temp = on ? "F" : "C";   // Pro view surfaces Fahrenheit + knots
  state.unit.speed = on ? "kn" : "mph";

  viewToggle.classList.toggle("on", on);
  viewToggle.setAttribute("aria-pressed", String(on));
  labelStandard.style.color = on ? "var(--paper-dim)" : "var(--paper)";
  labelPro.style.color = on ? "var(--paper)" : "var(--brass-light)";

  unitBadge.textContent = on
    ? `PRO MARITIME · °F · kn`
    : `STANDARD · °C · mph`;

  // Re-render with current cached data under new units, if we have it
  if (state.lastData) {
    renderWeather(state.lastData.weather);
    renderMarine(state.lastData.marine);
    renderForecast(state.lastData.weather, state.lastData.marine);
    renderHourlyGusts(state.lastData.weather);
  }
}

/* ==========================================================================
   7) LOAD PORT
   ========================================================================== */
async function loadPort(key) {
  const port = PORTS[key];
  if (!port) return;
  state.port = key;
  portNameEl.textContent = port.name;
  lastUpdated.textContent = "Fetching latest observation…";

  try {
    const { weather, marine } = await fetchWeatherAndMarine(port.lat, port.lon);
    state.lastData = { weather, marine };
    saveToCache(key, { weather, marine });
    renderWeather(weather);
    renderMarine(marine);
    renderForecast(weather, marine);
    renderConditionsBadge(weather, marine);
    renderFogRisk(weather);
    renderHourlyGusts(weather);
    renderFreshnessBanner(false);
  } catch (err) {
    const cached = loadFromCache(key);
    if (cached) {
      state.lastData = cached;
      renderWeather(cached.weather);
      renderMarine(cached.marine);
      renderForecast(cached.weather, cached.marine);
      renderConditionsBadge(cached.weather, cached.marine);
      renderFogRisk(cached.weather);
      renderHourlyGusts(cached.weather);
      renderFreshnessBanner(true, cached.cachedAt);
      lastUpdated.textContent = "Unable to reach weather service — showing cached data.";
    } else {
      lastUpdated.textContent = "Unable to reach weather service — retry shortly.";
    }
  }

  renderTide(port.lat, port.lon);
  updateFavouriteStar();
  await updateAis(port.lat, port.lon);
  if (isCrewUnlocked()) renderCrewNotes();
}

/* ==========================================================================
   9) CREW / PIER STAFF OBSERVATIONS (demo — localStorage only)
   --------------------------------------------------------------------------
   DEMO NOTE: this PIN check happens entirely in client-side JS, which means
   it is NOT real security — anyone can read the code from this file. It's
   here purely to demonstrate the gated UX. A production version needs
   proper crew accounts (real auth) and a shared backend database so
   observations sync across every vessel/device instead of staying local
   to one browser. See the note at the bottom of this section for what
   that migration looks like.
   ========================================================================== */
const CREW_ACCESS_CODE = "PIER2026"; // DEMO ONLY — replace with real auth in production
const CREW_SESSION_KEY = "smw_crew_unlocked";
const CREW_NOTES_KEY = "smw_crew_notes"; // { [portKey]: [{ id, category, text, time }] } — fallback only

/* ---------- Supabase (real shared database) ------------------------------
   Fill these in once you've created your Supabase project (see
   supabase-schema.sql for the table to set up first):
     1. supabase.com → New project
     2. Project Settings → API → copy "Project URL" and "anon public" key
     3. Paste both below
   Until both are filled in, observations fall back to this browser's
   localStorage only (today's demo behaviour) — nothing breaks either way. */
const SUPABASE_URL = ""; // <-- e.g. https://xxxxxxxx.supabase.co
const SUPABASE_ANON_KEY = ""; // <-- the "anon public" key, not the service key

let supabaseClient = null;
if (SUPABASE_URL && SUPABASE_ANON_KEY && window.supabase) {
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
const isDbConfigured = () => supabaseClient !== null;

/* ---------- Company session (multi-tenant) --------------------------------
   Each authenticated user belongs to exactly one company (see
   supabase-schema.sql). This is set once on load and used whenever we
   write a row that needs a company_id — reads are filtered automatically
   by Postgres RLS, so we don't need to filter by company_id ourselves. */
let currentCompany = null; // { id, name } once resolved, else null

async function resolveCompanySession() {
  if (!isDbConfigured()) return null;
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) return null;

  const { data, error } = await supabaseClient
    .from("company_members")
    .select("company_id, companies(name)")
    .eq("user_id", session.user.id)
    .single();
  if (error || !data) return null;

  return { id: data.company_id, name: data.companies.name };
}

function isCrewUnlocked() {
  return sessionStorage.getItem(CREW_SESSION_KEY) === "true";
}

function loadCrewNotesLocal() {
  try {
    return JSON.parse(localStorage.getItem(CREW_NOTES_KEY) || "{}");
  } catch {
    return {};
  }
}

async function fetchCrewNotesForPort(portKey) {
  if (isDbConfigured() && currentCompany) {
    const { data, error } = await supabaseClient
      .from("observations")
      .select("*")
      .eq("port", portKey)
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) { console.error("Supabase read error:", error.message); return []; }
    return data.map((row) => ({
      id: row.id, category: row.category, text: row.note_text,
      time: row.created_at, confirms: row.confirms,
    }));
  }
  return (loadCrewNotesLocal()[portKey] || []);
}

async function saveCrewNote(portKey, note) {
  if (isDbConfigured() && currentCompany) {
    const { error } = await supabaseClient.from("observations").insert({
      company_id: currentCompany.id, port: portKey, category: note.category, note_text: note.text, confirms: 0,
    });
    if (error) console.error("Supabase write error:", error.message);
    return;
  }
  const all = loadCrewNotesLocal();
  all[portKey] = all[portKey] || [];
  all[portKey].unshift(note);
  all[portKey] = all[portKey].slice(0, 20); // cap per port for a demo
  localStorage.setItem(CREW_NOTES_KEY, JSON.stringify(all));
}

async function confirmCrewNote(portKey, noteId, currentConfirms) {
  if (isDbConfigured() && currentCompany) {
    const { error } = await supabaseClient
      .from("observations")
      .update({ confirms: (currentConfirms || 0) + 1 })
      .eq("id", noteId);
    if (error) console.error("Supabase update error:", error.message);
    await renderCrewNotes();
    return;
  }
  const all = loadCrewNotesLocal();
  const notes = all[portKey] || [];
  const note = notes.find((n) => n.id === noteId);
  if (note) {
    note.confirms = (note.confirms || 0) + 1;
    localStorage.setItem(CREW_NOTES_KEY, JSON.stringify(all));
    await renderCrewNotes();
  }
}

async function renderCrewNotes() {
  const notes = await fetchCrewNotesForPort(state.port);
  const list = $("crewNotesList");
  const empty = $("crewEmptyState");

  list.innerHTML = "";
  empty.classList.toggle("hidden", notes.length > 0);

  notes.forEach((n) => {
    const row = document.createElement("div");
    row.className = "font-mono text-xs flex items-start gap-3 border-l-2 pl-3 py-1";
    row.style.borderColor = "var(--brass)";
    row.innerHTML = `
      <span class="shrink-0 px-2 py-0.5 rounded-sm" style="background:rgba(111,168,160,0.15); color:var(--seafoam)">${n.category}</span>
      <span style="color:var(--paper)" class="flex-1">${n.text}</span>
      <span style="color:var(--paper-dim)" class="shrink-0">${new Date(n.time).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
      <button data-note-id="${n.id}" data-confirms="${n.confirms || 0}" class="confirm-note-btn shrink-0 px-2 py-0.5 rounded-sm border" style="border-color:rgba(217,174,104,0.4); color:var(--brass-light)">&#10003; ${n.confirms || 0}</button>
    `;
    list.appendChild(row);
  });

  list.querySelectorAll(".confirm-note-btn").forEach((btn) => {
    btn.addEventListener("click", () =>
      confirmCrewNote(state.port, Number(btn.dataset.noteId), Number(btn.dataset.confirms))
    );
  });

  $("dbStatusNote").textContent = isDbConfigured()
    ? `Connected to shared database — ${currentCompany ? currentCompany.name + "'s" : "your company's"} observations only.`
    : "Demo mode: stored in this browser only. A database isn't connected yet.";
}

function unlockCrewView() {
  $("crewLocked").classList.add("hidden");
  $("crewLoginPrompt").classList.add("hidden");
  $("crewUnlocked").classList.remove("hidden");
  renderCrewNotes();
}

async function initCrewPanel() {
  $("crewNoteForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = $("crewNoteText").value.trim();
    if (!text) return;
    await saveCrewNote(state.port, {
      id: Date.now(),
      category: $("crewCategory").value,
      text,
      time: new Date().toISOString(),
    });
    $("crewNoteText").value = "";
    await renderCrewNotes();
  });

  if (isDbConfigured()) {
    // Real auth path: no PIN, just an actual logged-in company account.
    if (currentCompany) {
      unlockCrewView();
    } else {
      $("crewLoginPrompt").classList.remove("hidden");
    }
    return;
  }

  // Demo path (no database connected yet): fall back to the client-side
  // PIN gate — not real security, just a UX placeholder (see note above).
  $("crewLocked").classList.remove("hidden");
  if (isCrewUnlocked()) unlockCrewView();

  $("crewUnlockBtn").addEventListener("click", () => {
    const entered = $("crewCodeInput").value.trim();
    if (entered === CREW_ACCESS_CODE) {
      sessionStorage.setItem(CREW_SESSION_KEY, "true");
      $("crewError").classList.add("hidden");
      unlockCrewView();
    } else {
      $("crewError").classList.remove("hidden");
    }
  });
}

/* ==========================================================================
   14) OFFLINE / STALE-DATA CACHING
   --------------------------------------------------------------------------
   Caches the last successful fetch per port so the app shows something
   useful (clearly marked as stale) instead of going blank on poor signal —
   exactly when it's most likely to be in use, approaching a pier.
   ========================================================================== */
const CACHE_KEY = (portKey) => `smw_cache_${portKey}`;

function saveToCache(portKey, data) {
  try {
    localStorage.setItem(CACHE_KEY(portKey), JSON.stringify({ ...data, cachedAt: Date.now() }));
  } catch { /* storage full or unavailable — non-critical */ }
}
function loadFromCache(portKey) {
  try {
    const raw = localStorage.getItem(CACHE_KEY(portKey));
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
function renderFreshnessBanner(isStale, cachedAt) {
  const el = $("freshnessBanner");
  if (!isStale) { el.classList.add("hidden"); return; }
  el.classList.remove("hidden");
  const mins = cachedAt ? Math.round((Date.now() - cachedAt) / 60000) : null;
  el.textContent = mins != null
    ? `⚠ Showing cached data from ${mins} min ago — live fetch failed (check connection)`
    : `⚠ Showing cached data — live fetch failed (check connection)`;
}

/* ==========================================================================
   15) CSV EXPORT (crew notes)
   ========================================================================== */
async function exportCrewNotesCsv() {
  const notes = await fetchCrewNotesForPort(state.port);
  if (!notes.length) { alert("No observations to export for this port."); return; }

  const header = "Port,Category,Note,Time,Confirmations\n";
  const rows = notes.map((n) =>
    [PORTS[state.port].name, n.category, `"${n.text.replace(/"/g, '""')}"`, n.time, n.confirms || 0].join(",")
  ).join("\n");

  const blob = new Blob([header + rows], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${state.port}-crew-notes.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ==========================================================================
   16) MULTI-PORT NETWORK OVERVIEW
   --------------------------------------------------------------------------
   Fetches every port on demand (not automatically on page load, to avoid
   hammering the API for a user who just wants one port) and shows a
   compact conditions-badge grid across the whole network.
   ========================================================================== */
async function loadNetworkOverview() {
  const grid = $("overviewGrid");
  const btn = $("overviewLoadBtn");
  btn.textContent = "Loading…";
  btn.disabled = true;
  grid.innerHTML = "";

  const entries = Object.entries(PORTS);
  const results = await Promise.all(entries.map(async ([key, port]) => {
    try {
      const data = await fetchWeatherAndMarine(port.lat, port.lon);
      return { key, port, badge: computeConditionsBadge(data.weather, data.marine) };
    } catch {
      return { key, port, badge: { level: "unknown", label: "No data" } };
    }
  }));

  results.forEach(({ key, port, badge }) => {
    const cell = document.createElement("button");
    cell.className = "text-left rounded-sm p-2 border font-mono text-xs " +
      (badge.level === "green" ? "badge-green" : badge.level === "amber" ? "badge-amber" : badge.level === "red" ? "badge-red" : "");
    if (badge.level === "unknown") cell.style.borderColor = "rgba(217,174,104,0.3)";
    cell.innerHTML = `<p class="font-semibold">${port.name}</p><p class="mt-0.5">${badge.label}</p>`;
    cell.onclick = () => { portSelect.value = key; loadPort(key); window.scrollTo({ top: 0, behavior: "smooth" }); };
    grid.appendChild(cell);
  });

  btn.textContent = "Refresh network overview";
  btn.disabled = false;
}

/* ==========================================================================
   17) VESSEL TRAFFIC (AIS) — via AISstream.io
   --------------------------------------------------------------------------
   AISstream.io is used because it's the only genuinely free, global,
   keyless-to-*use* (but not keyless-to-*sign-up*) AIS source suitable for
   direct browser use via WebSocket. Free API key: https://aisstream.io/apikeys
   Without a key this panel degrades gracefully — it just tells you so,
   rather than pretending to show live traffic it doesn't have.
   ========================================================================== */
const AISSTREAM_API_KEY = ""; // <-- paste your free key from aisstream.io/apikeys

let aisMap, aisSocket;
const aisMarkers = new Map(); // MMSI -> Leaflet marker
let fleetMmsiList = []; // company's own vessels, if logged in with a company that has any

function initAisMap(lat, lon) {
  if (aisMap) return;
  aisMap = L.map("aisMap", { zoomControl: true, attributionControl: false }).setView([lat, lon], 9);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 13 }).addTo(aisMap);
}

function boundingBoxAround(lat, lon, deg = 0.6) {
  return [[lat - deg, lon - deg], [lat + deg, lon + deg]];
}

async function loadFleetMmsiList() {
  if (!isDbConfigured() || !currentCompany) { fleetMmsiList = []; return; }
  const { data, error } = await supabaseClient.from("vessels").select("mmsi").eq("company_id", currentCompany.id);
  fleetMmsiList = (!error && data) ? data.map((v) => v.mmsi) : [];
}

function connectAisStream(lat, lon) {
  if (!AISSTREAM_API_KEY) {
    $("aisStatus").textContent = "AIS not configured — add a free API key from aisstream.io/apikeys in app.js to enable live vessel tracking.";
    return;
  }

  if (aisSocket) { aisSocket.close(); aisSocket = null; }
  aisMarkers.forEach((m) => aisMap.removeLayer(m));
  aisMarkers.clear();

  const trackingFleet = fleetMmsiList.length > 0;
  $("aisStatus").textContent = trackingFleet
    ? `Connecting to AIS stream — tracking ${fleetMmsiList.length} fleet vessel(s) worldwide…`
    : "Connecting to AIS stream — showing general traffic near this port…";

  aisSocket = new WebSocket("wss://stream.aisstream.io/v0/stream");

  aisSocket.onopen = () => {
    const subscription = {
      APIKey: AISSTREAM_API_KEY,
      // Fleet mode: watch these specific vessels anywhere in the world.
      // Vicinity mode (no fleet registered): just watch traffic near the
      // currently selected port, same as before.
      BoundingBoxes: trackingFleet ? [[[-90, -180], [90, 180]]] : [boundingBoxAround(lat, lon)],
      FilterMessageTypes: ["PositionReport"],
    };
    if (trackingFleet) subscription.FiltersShipMMSI = fleetMmsiList;
    aisSocket.send(JSON.stringify(subscription));
  };

  aisSocket.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data);
      const pr = msg?.Message?.PositionReport;
      const meta = msg?.MetaData;
      if (!pr || !meta) return;

      const mmsi = meta.MMSI;
      const shipName = (meta.ShipName || `MMSI ${mmsi}`).trim();
      const latLng = [pr.Latitude, pr.Longitude];
      const popup = `<strong>${shipName}</strong><br>Speed: ${pr.Sog ?? "—"} kn<br>Course: ${pr.Cog ?? "—"}°`;

      if (aisMarkers.has(mmsi)) {
        aisMarkers.get(mmsi).setLatLng(latLng).setPopupContent(popup);
      } else {
        const marker = L.circleMarker(latLng, {
          radius: 6, color: trackingFleet ? "#D9AE68" : "#6FA8A0", fillColor: trackingFleet ? "#D9AE68" : "#6FA8A0", fillOpacity: 0.85,
        }).addTo(aisMap).bindPopup(popup);
        aisMarkers.set(mmsi, marker);
        if (trackingFleet) aisMap.panTo(latLng); // fleet vessels could be anywhere — keep them in view
      }
      $("aisStatus").textContent = trackingFleet
        ? `${aisMarkers.size} of ${fleetMmsiList.length} fleet vessel(s) reporting · live`
        : `${aisMarkers.size} vessel(s) tracked in range · live`;
    } catch { /* ignore malformed frame */ }
  };

  aisSocket.onerror = () => { $("aisStatus").textContent = "AIS stream error — check API key / connection."; };
  aisSocket.onclose = () => { $("aisStatus").textContent = "AIS stream disconnected."; };
}

async function updateAis(lat, lon) {
  initAisMap(lat, lon);
  aisMap.setView([lat, lon], 9);
  await loadFleetMmsiList();
  connectAisStream(lat, lon);
}

/* ==========================================================================
   18) CAPTAIN'S NOTES (public tier — no login, anyone can view/post)
   ========================================================================== */
async function populateCaptainNotesCompanies() {
  const sel = $("captainNotesCompany");
  if (!isDbConfigured()) return;
  const { data, error } = await supabaseClient.from("companies").select("id, name").order("name");
  if (error || !data) return;
  data.forEach((c) => sel.add(new Option(c.name, c.id)));
}

async function renderCaptainNotes(companyId) {
  const list = $("captainNotesList");
  const empty = $("captainNotesEmpty");
  list.innerHTML = "";

  const { data, error } = await supabaseClient
    .from("captain_notes").select("*").eq("company_id", companyId)
    .order("created_at", { ascending: false }).limit(30);

  if (error || !data || !data.length) { empty.classList.remove("hidden"); return; }
  empty.classList.add("hidden");

  data.forEach((n) => {
    const row = document.createElement("div");
    row.className = "font-mono text-xs flex items-start gap-3 border-l-2 pl-3 py-1";
    row.style.borderColor = "var(--seafoam)";
    row.innerHTML = `
      <span style="color:var(--paper)" class="flex-1">${n.note_text}${n.author_name ? ` <span style="color:var(--paper-dim)">— ${n.author_name}</span>` : ""}</span>
      <span style="color:var(--paper-dim)" class="shrink-0">${new Date(n.created_at).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
    `;
    list.appendChild(row);
  });
}

function initCaptainNotes() {
  if (!isDbConfigured()) {
    $("captainNotesCompany").classList.add("hidden");
    $("captainNotesNotConfigured").classList.remove("hidden");
    return;
  }
  populateCaptainNotesCompanies();

  $("captainNotesCompany").addEventListener("change", async (e) => {
    const companyId = e.target.value;
    $("captainNotesArea").classList.toggle("hidden", !companyId);
    if (companyId) await renderCaptainNotes(companyId);
  });

  $("captainNoteForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const companyId = $("captainNotesCompany").value;
    const text = $("captainNoteText").value.trim();
    if (!companyId || !text) return;

    const { error } = await supabaseClient.from("captain_notes").insert({
      company_id: companyId,
      author_name: $("captainAuthorName").value.trim() || null,
      note_text: text,
    });
    if (error) { alert("Couldn't post: " + error.message); return; }

    $("captainNoteText").value = "";
    await renderCaptainNotes(companyId);
  });
}

/* ==========================================================================
   10) FAVOURITE PORTS
   ========================================================================== */
const FAVOURITES_KEY = "smw_favourites";

function loadFavourites() {
  try { return JSON.parse(localStorage.getItem(FAVOURITES_KEY) || "[]"); } catch { return []; }
}
function saveFavourites(list) {
  localStorage.setItem(FAVOURITES_KEY, JSON.stringify(list));
}
function isFavourite(key) {
  return loadFavourites().includes(key);
}
function toggleFavourite(key) {
  const list = loadFavourites();
  const idx = list.indexOf(key);
  if (idx === -1) list.push(key); else list.splice(idx, 1);
  saveFavourites(list);
  renderFavouritesRow();
  updateFavouriteStar();
}
function updateFavouriteStar() {
  $("favouriteStar").classList.toggle("active", isFavourite(state.port));
}
function renderFavouritesRow() {
  const row = $("favouritesRow");
  const favs = loadFavourites();
  row.innerHTML = "";
  if (!favs.length) return;
  const label = document.createElement("span");
  label.style.color = "var(--paper-dim)";
  label.textContent = "Favourites:";
  row.appendChild(label);
  favs.forEach((key) => {
    if (!PORTS[key]) return;
    const chip = document.createElement("button");
    chip.textContent = PORTS[key].name;
    chip.className = "px-2 py-1 rounded-sm border";
    chip.style.borderColor = "rgba(217,174,104,0.4)";
    chip.style.color = "var(--brass-light)";
    chip.onclick = () => { portSelect.value = key; loadPort(key); };
    row.appendChild(chip);
  });
}

/* ==========================================================================
   11) THEME TOGGLE (light / dark)
   ========================================================================== */
const THEME_KEY = "smw_theme";
function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  $("themeToggle").textContent = theme === "light" ? "\u263D" : "\u2600";
  localStorage.setItem(THEME_KEY, theme);
}
function initTheme() {
  const saved = localStorage.getItem(THEME_KEY) || "dark";
  applyTheme(saved);
  $("themeToggle").addEventListener("click", () => {
    applyTheme(document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light");
  });
}

/* ==========================================================================
   12) ROUTE PLANNER (compare departure + arrival port conditions)
   ========================================================================== */
function populateRouteSelectors() {
  const fromSel = $("routeFrom");
  const toSel = $("routeTo");
  Object.entries(PORTS).forEach(([key, port]) => {
    fromSel.add(new Option(port.name, key));
    toSel.add(new Option(port.name, key));
  });
  fromSel.value = "oban";
  toSel.value = "craignure";
}

async function compareRoute() {
  const fromKey = $("routeFrom").value;
  const toKey = $("routeTo").value;
  const results = $("routeResults");
  results.innerHTML = `<p style="color:var(--paper-dim)">Loading&hellip;</p>`;

  const [fromData, toData] = await Promise.all([
    fetchWeatherAndMarine(PORTS[fromKey].lat, PORTS[fromKey].lon).catch(() => null),
    fetchWeatherAndMarine(PORTS[toKey].lat, PORTS[toKey].lon).catch(() => null),
  ]);

  results.innerHTML = "";
  [{ key: fromKey, data: fromData }, { key: toKey, data: toData }].forEach(({ key, data }) => {
    const c = data?.weather?.current;
    const m = data?.marine?.current;
    const badge = data ? computeConditionsBadge(data.weather, data.marine) : { label: "Unavailable" };
    const cell = document.createElement("div");
    cell.className = "rounded-sm p-3";
    cell.style.background = "rgba(241,235,218,0.04)";
    cell.style.border = "1px solid rgba(217,174,104,0.15)";
    cell.innerHTML = `
      <p style="color:var(--brass-light)" class="uppercase tracking-wide mb-1">${PORTS[key].name}</p>
      <p style="color:var(--paper)">${c ? fmtTemp(c.temperature_2m, state.unit.temp) : "—"} &middot; ${c ? WMO_DESCRIPTIONS[c.weather_code] ?? "—" : "—"}</p>
      <p style="color:var(--paper-dim)">Wind: ${c ? fmtSpeed(c.wind_speed_10m, state.unit.speed) : "—"} (gusts ${c ? fmtSpeed(c.wind_gusts_10m, state.unit.speed) : "—"})</p>
      <p style="color:var(--paper-dim)">Swell: ${m?.swell_wave_height != null ? m.swell_wave_height.toFixed(1) + " m" : "—"}</p>
      <p class="mt-1" style="color:var(--seafoam)">${badge.label}</p>
    `;
    results.appendChild(cell);
  });
}

/* ==========================================================================
   13) PRINT HANDOVER
   ========================================================================== */
function initPrintHandover() {
  $("printHandoverBtn").addEventListener("click", () => window.print());
}

/* ==========================================================================
   8) INIT
   ========================================================================== */
portSelect.addEventListener("change", (e) => loadPort(e.target.value));
viewToggle.addEventListener("click", () => setProView(!state.proView));

function renderCompanyIndicator() {
  const el = $("companyIndicator");
  if (!isDbConfigured()) { el.innerHTML = ""; return; }
  el.innerHTML = currentCompany
    ? `<span style="color:var(--seafoam)">${currentCompany.name}</span> · <a href="fleet.html" style="color:var(--brass-light)">Fleet</a> · <a href="#" id="logoutLink" style="color:var(--brass-light)">Log out</a>`
    : `<a href="login.html" style="color:var(--brass-light)">Log in</a>`;
  $("logoutLink")?.addEventListener("click", async (e) => {
    e.preventDefault();
    await supabaseClient.auth.signOut();
    window.location.reload();
  });
}

async function initApp() {
  setProView(false);
  applyPaywall();
  initTheme();
  initPrintHandover();
  populateRouteSelectors();
  renderFavouritesRow();
  $("favouriteStar").addEventListener("click", () => toggleFavourite(state.port));
  $("routeCompareBtn").addEventListener("click", compareRoute);
  $("exportCrewCsvBtn").addEventListener("click", exportCrewNotesCsv);
  $("overviewLoadBtn").addEventListener("click", loadNetworkOverview);

  if (isDbConfigured()) currentCompany = await resolveCompanySession();
  renderCompanyIndicator();
  await initCrewPanel();
  initCaptainNotes();
  await loadPort(state.port);
}

initApp();
