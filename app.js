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
    `wind_speed_10m,wind_gusts_10m,wind_direction_10m` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min,wind_gusts_10m_max,precipitation_probability_max` +
    `&forecast_days=5` +
    `&wind_speed_unit=mph&temperature_unit=celsius&timezone=auto`;

  const marineUrl =
    `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}` +
    `&current=wave_height,swell_wave_height,swell_wave_direction,swell_wave_period` +
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

  if (!hasData) {
    $("swellHeight").parentElement.parentElement.querySelectorAll("p.instrument-value")
      .forEach((el) => { if (el.textContent === "") el.textContent = "—"; });
  }
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
   4b) LIVE WEATHER MAP (Leaflet + OpenStreetMap + RainViewer radar)
   --------------------------------------------------------------------------
   Fully open-source stack, no API key or third-party branding required:
   - Base map tiles: OpenStreetMap (free, open license)
   - Rain radar overlay: RainViewer's public tile API (free, keyless)
   ========================================================================== */
let map, radarLayer, portMarker;
let radarFrames = [];
let radarFrameIndex = 0;
let radarTimer = null;

function initMap(lat, lon) {
  map = L.map("weatherMap", { zoomControl: true, attributionControl: false }).setView([lat, lon], 8);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 12,
  }).addTo(map);

  portMarker = L.marker([lat, lon]).addTo(map);

  loadRadarFrames();
}

async function loadRadarFrames() {
  try {
    const res = await fetch("https://api.rainviewer.com/public/weather-maps.json");
    const data = await res.json();
    radarFrames = [...(data.radar?.past || []), ...(data.radar?.nowcast || [])];
    radarFrameIndex = radarFrames.length ? radarFrames.length - 1 : 0; // start on "now"
    showRadarFrame(radarFrameIndex);
  } catch (err) {
    // Radar is a nice-to-have; map still works without it.
  }
}

function showRadarFrame(i) {
  if (!radarFrames.length || !map) return;
  const frame = radarFrames[i];
  if (radarLayer) map.removeLayer(radarLayer);
  radarLayer = L.tileLayer(
    `https://tilecache.rainviewer.com${frame.path}/256/{z}/{x}/{y}/4/1_1.png`,
    { opacity: 0.55, maxZoom: 12 }
  ).addTo(map);
}

function toggleRadarAnimation() {
  const btn = $("radarPlayBtn");
  if (radarTimer) {
    clearInterval(radarTimer);
    radarTimer = null;
    btn.textContent = "▶ Animate radar";
    showRadarFrame(radarFrames.length - 1); // back to "now"
    return;
  }
  if (!radarFrames.length) return;
  btn.textContent = "■ Stop";
  radarTimer = setInterval(() => {
    radarFrameIndex = (radarFrameIndex + 1) % radarFrames.length;
    showRadarFrame(radarFrameIndex);
  }, 500);
}

function updateWeatherMap(lat, lon) {
  if (!map) {
    initMap(lat, lon);
    return;
  }
  map.setView([lat, lon], 8);
  portMarker.setLatLng([lat, lon]);
  loadRadarFrames();
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
    renderWeather(weather);
    renderMarine(marine);
    renderForecast(weather, marine);
  } catch (err) {
    lastUpdated.textContent = "Unable to reach weather service — retry shortly.";
  }

  renderTide(port.lat, port.lon);
  updateWeatherMap(port.lat, port.lon);
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
const CREW_NOTES_KEY = "smw_crew_notes"; // { [portKey]: [{ id, category, text, time }] }

function isCrewUnlocked() {
  return sessionStorage.getItem(CREW_SESSION_KEY) === "true";
}

function loadCrewNotes() {
  try {
    return JSON.parse(localStorage.getItem(CREW_NOTES_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveCrewNote(portKey, note) {
  const all = loadCrewNotes();
  all[portKey] = all[portKey] || [];
  all[portKey].unshift(note);
  all[portKey] = all[portKey].slice(0, 20); // cap per port for a demo
  localStorage.setItem(CREW_NOTES_KEY, JSON.stringify(all));
}

function renderCrewNotes() {
  const all = loadCrewNotes();
  const notes = all[state.port] || [];
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
    `;
    list.appendChild(row);
  });
}

function unlockCrewView() {
  $("crewLocked").classList.add("hidden");
  $("crewUnlocked").classList.remove("hidden");
  renderCrewNotes();
}

function initCrewPanel() {
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

  $("crewNoteForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const text = $("crewNoteText").value.trim();
    if (!text) return;
    saveCrewNote(state.port, {
      id: Date.now(),
      category: $("crewCategory").value,
      text,
      time: new Date().toISOString(),
    });
    $("crewNoteText").value = "";
    renderCrewNotes();
  });
}

/* ==========================================================================
   8) INIT
   ========================================================================== */
portSelect.addEventListener("change", (e) => loadPort(e.target.value));
viewToggle.addEventListener("click", () => setProView(!state.proView));

setProView(false);
applyPaywall();
initCrewPanel();
$("radarPlayBtn").addEventListener("click", toggleRadarAnimation);
loadPort(state.port);
