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
   2) UK TIDE DATA — ADMIRALTY UK Tidal API (Discovery tier, free) as primary,
      EA flood-monitoring gauge readings as fallback
   --------------------------------------------------------------------------
   The Admiralty Discovery tier gives genuine OFFICIAL PREDICTED high/low
   tide events (current + 6 days) for 607 UK stations, completely free —
   just needs a subscription key: https://admiraltyapi.portal.azure-api.net/
   (choose "UK Tidal API - Discovery" when creating a product/subscription).

   IMPORTANT LICENSING NOTE: the Discovery tier's terms explicitly prohibit
   caching/storing the returned data (it's Crown copyright). So unlike the
   weather/marine data elsewhere in this app, tide predictions are NEVER
   written to localStorage — they're used in-memory only, for the current
   page view, and simply show as unavailable if offline. Don't change this
   without re-checking Admiralty's current terms.

   Falls back to the EA gauge-reading approach (live level + trend, not
   predicted times) if no Admiralty key is set, or if the Admiralty call
   fails for any reason — so tide status still degrades gracefully rather
   than going blank.
   ========================================================================== */
const ADMIRALTY_API_KEY = ""; // <-- paste your free Discovery-tier subscription key
const ADMIRALTY_BASE = "https://admiraltyapi.azure-api.net/uktidalapi/api/V1";

// In-memory only (see licensing note above) — holds the station list for
// the current page session so we don't re-fetch it on every port switch.
let admiraltyStationsCache = null;

async function loadAdmiraltyStations() {
  if (admiraltyStationsCache) return admiraltyStationsCache;
  const res = await fetch(`${ADMIRALTY_BASE}/Stations/`, {
    headers: { "Ocp-Apim-Subscription-Key": ADMIRALTY_API_KEY },
  });
  if (!res.ok) throw new Error("Admiralty station list fetch failed");
  const geojson = await res.json();
  admiraltyStationsCache = (geojson.features || []).map((f) => ({
    id: f.properties.Id,
    name: f.properties.Name,
    lon: f.geometry.coordinates[0],
    lat: f.geometry.coordinates[1],
  }));
  return admiraltyStationsCache;
}

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function findNearestAdmiraltyStation(lat, lon) {
  const stations = await loadAdmiraltyStations();
  let nearest = null, nearestDist = Infinity;
  for (const s of stations) {
    const d = haversineKm(lat, lon, s.lat, s.lon);
    if (d < nearestDist) { nearest = s; nearestDist = d; }
  }
  return nearest;
}

async function fetchAdmiraltyTideStatus(lat, lon) {
  if (!ADMIRALTY_API_KEY) return { available: false, reason: "Admiralty API not configured" };

  const station = await findNearestAdmiraltyStation(lat, lon);
  if (!station) return { available: false, reason: "No Admiralty station found nearby" };

  const res = await fetch(`${ADMIRALTY_BASE}/Stations/${station.id}/TidalEvents?duration=2`, {
    headers: { "Ocp-Apim-Subscription-Key": ADMIRALTY_API_KEY },
  });
  if (!res.ok) throw new Error("Admiralty tidal events fetch failed");
  const events = await res.json();
  if (!events || !events.length) return { available: false, reason: "No tidal events returned for this station" };

  const now = new Date();
  const nextHigh = events.find((e) => e.EventType === "HighWater" && new Date(e.DateTime) > now);
  const nextLow = events.find((e) => e.EventType === "LowWater" && new Date(e.DateTime) > now);
  const lastEvent = [...events].reverse().find((e) => new Date(e.DateTime) <= now);

  const trend = lastEvent
    ? (lastEvent.EventType === "LowWater" ? "Rising" : "Falling")
    : null;

  // Today's predicted range, from today's high/low event heights.
  const todayStr = now.toISOString().slice(0, 10);
  const todaysHeights = events
    .filter((e) => e.DateTime.slice(0, 10) === todayStr && typeof e.Height === "number")
    .map((e) => e.Height);
  const todaysRange = todaysHeights.length >= 2
    ? Math.max(...todaysHeights) - Math.min(...todaysHeights)
    : null;

  return {
    available: true,
    predicted: true,
    stationName: station.name,
    trend,
    nextHigh: nextHigh ? { time: nextHigh.DateTime, height: nextHigh.Height } : null,
    nextLow: nextLow ? { time: nextLow.DateTime, height: nextLow.Height } : null,
    todaysRange,
  };
}

/* ---------- EA flood-monitoring gauge readings (fallback) -----------------
   Live level + short-term trend, NOT predicted times — used only when the
   Admiralty API isn't configured or its call fails. */
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
  const url = `${stationNoticeUrl}/readings?_sorted&_limit=6`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("readings fetch failed");
  return res.json();
}

async function fetchEaTideStatus(lat, lon) {
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
      predicted: false,
      stationName: station.label || station.stationReference || "Unnamed station",
      levelMetres: latest.value,
      trend,
      dateTime: latest.dateTime,
    };
  } catch (err) {
    return { available: false, reason: "EA tidal service unreachable" };
  }
}

/* ---------- Combined: try Admiralty first, fall back to EA ---------------- */
async function fetchUkTideStatus(lat, lon) {
  try {
    const admiralty = await fetchAdmiraltyTideStatus(lat, lon);
    if (admiralty.available) return admiralty;
  } catch (err) {
    // fall through to EA below
  }
  return fetchEaTideStatus(lat, lon);
}

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
  $("tideRange").textContent = "—";
  $("tideNote").textContent = "";

  const tide = await fetchUkTideStatus(lat, lon);

  if (!tide.available) {
    $("tideStation").textContent = "Unavailable";
    $("tideLevel").textContent = "—";
    $("tideTrend").textContent = "—";
    const fallbackRange = TIDAL_RANGES[state.port];
    $("tideRange").textContent = fallbackRange != null ? `${fallbackRange.toFixed(1)} m (springs)` : "—";
    $("tideNote").textContent = `${tide.reason}. Consult local port authority tide tables.`;
    $("tideTrendIcon").textContent = "–";
    return;
  }

  $("tideStation").textContent = tide.stationName;
  $("tideTrend").textContent = tide.trend || "—";
  $("tideTrendIcon").textContent = tide.trend === "Rising" ? "↑" : tide.trend === "Falling" ? "↓" : "↔";

  if (tide.predicted) {
    // Admiralty path: official predicted events.
    const fmtEvent = (ev) => ev ? `${new Date(ev.time).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })} (${ev.height.toFixed(1)}m)` : "—";
    $("tideLevel").textContent = `Next high ${fmtEvent(tide.nextHigh)} · Next low ${fmtEvent(tide.nextLow)}`;
    $("tideRange").textContent = tide.todaysRange != null ? `${tide.todaysRange.toFixed(1)} m (today, predicted)` : "—";
    $("tideNote").textContent = "Official predicted tide events — UK Hydrographic Office (Admiralty).";
  } else {
    // EA fallback path: live gauge reading, not predicted.
    $("tideLevel").textContent = `${tide.levelMetres.toFixed(2)} m`;
    const fallbackRange = TIDAL_RANGES[state.port];
    $("tideRange").textContent = fallbackRange != null ? `${fallbackRange.toFixed(1)} m (springs)` : "— (add via Admiralty Tide Tables)";
    $("tideNote").textContent =
      "Live gauge reading (EA tidal network), not an official predicted tide table. " +
      "Add a free Admiralty API key in app.js for predicted high/low times.";
  }
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

  // Pro view reveals the heavier panels (Observations, Captain's Notes,
  // Network Overview, Vessel Traffic/AIS, Route Planner) — Standard keeps
  // it to core weather/tide/forecast so a first-time user isn't faced
  // with 10 panels at once.
  document.querySelectorAll(".pro-only-panel").forEach((el) => {
    el.classList.toggle("hidden", !on);
  });
  if (on && !aisMap) updateAis(PORTS[state.port].lat, PORTS[state.port].lon);

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
  if (state.proView) await updateAis(port.lat, port.lon); // Standard view skips this — saves a live connection nobody's looking at
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

/* Supabase config now lives in ONE place: supabase-config.js (loaded via
   <script> before this file in index.html). SUPABASE_URL, SUPABASE_ANON_KEY,
   supabaseClient, and isDbConfigured() are all defined there — set them up
   once and every page (dashboard, admin, login, fleet) picks them up. */

/* ---------- Company session (multi-tenant) --------------------------------
   Each authenticated user belongs to exactly one company (see
   supabase-schema.sql). This is set once on load and used whenever we
   write a row that needs a company_id — reads are filtered automatically
   by Postgres RLS, so we don't need to filter by company_id ourselves. */
let currentCompany = null; // { id, name } once resolved, else null
let currentUserEmail = null; // set alongside currentCompany, for attribution

async function resolveCompanySession() {
  if (!isDbConfigured()) return null;
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) return null;
  currentUserEmail = session.user.email;

  const { data, error } = await supabaseClient
    .from("company_members")
    .select("company_id, companies(name)")
    .eq("user_id", session.user.id)
    .single();
  if (error || !data) return null;

  return { id: data.company_id, name: data.companies.name };
}

/* ---------- Shared photo upload helper (Observations + Captain's Notes) --- */
async function uploadNotePhoto(file) {
  if (!file || !isDbConfigured()) return null;
  const path = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
  const { error } = await supabaseClient.storage.from("portcast-photos").upload(path, file);
  if (error) { console.error("Photo upload failed:", error.message); return null; }
  const { data } = supabaseClient.storage.from("portcast-photos").getPublicUrl(path);
  return data.publicUrl;
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
      photoUrl: row.photo_url, postedBy: row.posted_by,
    }));
  }
  return (loadCrewNotesLocal()[portKey] || []);
}

async function saveCrewNote(portKey, note) {
  if (isDbConfigured() && currentCompany) {
    const { error } = await supabaseClient.from("observations").insert({
      company_id: currentCompany.id, port: portKey, category: note.category, note_text: note.text,
      confirms: 0, photo_url: note.photoUrl || null, posted_by: currentUserEmail || null,
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
      <span style="color:var(--paper)" class="flex-1">
        ${n.text}${n.postedBy ? ` <span style="color:var(--paper-dim)">— ${n.postedBy}</span>` : ""}
        ${n.photoUrl ? `<br><a href="${n.photoUrl}" target="_blank"><img src="${n.photoUrl}" class="mt-1 rounded-sm" style="max-height:80px"></a>` : ""}
      </span>
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
    const photoFile = $("crewNotePhoto").files[0];
    const photoUrl = photoFile ? await uploadNotePhoto(photoFile) : null;
    await saveCrewNote(state.port, {
      id: Date.now(),
      category: $("crewCategory").value,
      text,
      time: new Date().toISOString(),
      photoUrl,
    });
    $("crewNoteText").value = "";
    $("crewNotePhoto").value = "";
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
      const status = (pr.Sog != null) ? (pr.Sog < 0.5 ? "At berth / anchored" : "Underway") : "—";
      const popup = `<strong>${shipName}</strong><br>${status}<br>Speed: ${pr.Sog ?? "—"} kn<br>Course: ${pr.Cog ?? "—"}°`;

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
      <span style="color:var(--paper)" class="flex-1">
        ${n.note_text}${n.author_name ? ` <span style="color:var(--paper-dim)">— ${n.author_name}</span>` : ""}
        ${n.photo_url ? `<br><a href="${n.photo_url}" target="_blank"><img src="${n.photo_url}" class="mt-1 rounded-sm" style="max-height:80px"></a>` : ""}
      </span>
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
    const photoFile = $("captainNotePhoto").files[0];
    const photoUrl = photoFile ? await uploadNotePhoto(photoFile) : null;

    const { error } = await supabaseClient.from("captain_notes").insert({
      company_id: companyId,
      author_name: $("captainAuthorName").value.trim() || null,
      note_text: text,
      photo_url: photoUrl,
    });
    if (error) { alert("Couldn't post: " + error.message); return; }

    $("captainNoteText").value = "";
    $("captainNotePhoto").value = "";
    await renderCaptainNotes(companyId);
  });
}

/* ==========================================================================
   19) PWA — service worker registration + install prompt
   ========================================================================== */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("service-worker.js").catch(() => { /* non-critical */ });
  });
}

let deferredInstallPrompt = null;
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredInstallPrompt = e;
  const btn = $("installAppBtn");
  if (btn) btn.classList.remove("hidden");
});

function initInstallPrompt() {
  const btn = $("installAppBtn");
  if (!btn) return;
  btn.addEventListener("click", async () => {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    btn.classList.add("hidden");
  });
  window.addEventListener("appinstalled", () => btn.classList.add("hidden"));
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
  initInstallPrompt();
  await loadPort(state.port);
}

initApp();
