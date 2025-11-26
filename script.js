/* CONFIG */
const SHEET_URL = "https://script.google.com/macros/s/AKfycbxijC7q5I7yiqW8DfvUY6RpD9F79uT362I3qrNoh1EYrw3poGMaO6LnE325x0Iv2Gcycw/exec";
const REFRESH_INTERVAL = 30_000;   // ms (base)
const MAX_POINTS = 40;             // for sparklines
const PRED_STEPS = 6;              // predict next 6 steps
const BACKOFF_MAX = 6;             // exponential backoff limit (attempts)

/* Cached DOM refs */
const $ = id => document.getElementById(id);
const statusEl = $('status');
const elTemp = $('temp'), elHum = $('hum'), elAqi = $('aqi'), elTime = $('time');
const elCalib = $('calib'), elLat = $('lat'), elLon = $('lon'), elDeployed = $('deployed');
const elPredTempNext = $('predTempNext'), elPredHumNext = $('predHumNext'), elPredAqiNext = $('predAqiNext');

/* Chart contexts (cached) */
const ctxSparkTemp = $('sparkTemp')?.getContext('2d');
const ctxSparkHum  = $('sparkHum')?.getContext('2d');
const ctxSparkAqi  = $('sparkAqi')?.getContext('2d');

const ctxPredTemp = $('predTemp')?.getContext('2d');
const ctxPredHum  = $('predHum')?.getContext('2d');
const ctxPredAqi  = $('predAqi')?.getContext('2d');

let sparkTemp, sparkHum, sparkAqi;
let predTempChart, predHumChart, predAqiChart;

/* map */
let map, marker;
let lastMapSet = 0;
const MAP_THROTTLE_MS = 2000;

/* small helpers */
const safeNum = v => {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 0;
};

function fmtTime(ts) {
  if (!ts) return '--';
  try { return new Date(ts).toLocaleString(); }
  catch (e) { return String(ts); }
}

/* Linear least-squares extrapolation */
function linearExtrapolate(values, steps) {
  // ensure numeric and enough points
  const arr = (values || []).map(v => safeNum(v)).filter((_,i,a)=>a.length>0);
  if (arr.length < 2) return Array(steps).fill(null);

  const n = arr.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
  for (let i = 0; i < n; i++) {
    const x = i;
    const y = arr[i];
    sumX += x; sumY += y; sumXY += x * y; sumXX += x * x;
  }
  const denom = (n * sumXX - sumX * sumX);
  let m = 0, b = 0;
  if (Math.abs(denom) > 1e-9) {
    m = (n * sumXY - sumX * sumY) / denom;
    b = (sumY - m * sumX) / n;
  } else {
    // fallback: flat line at mean
    m = 0;
    b = sumY / n;
  }
  const out = [];
  for (let s = 1; s <= steps; s++) {
    const x = n - 1 + s;
    out.push(m * x + b);
  }
  return out;
}

/* Chart factory helpers (fixed-frame) */
function makeSpark(ctx, initialData = [], color = '#888') {
  if (!ctx) return null;
  return new Chart(ctx, {
    type: 'line',
    data: { labels: initialData.map((_,i)=>i), datasets: [{ data: initialData, borderColor: color, tension: 0.2, pointRadius: 0 }] },
    options: {
      responsive: false,
      maintainAspectRatio: false,
      animation: { duration: 150 },
      plugins: { legend: { display: false } },
      scales: { x: { display: false }, y: { display: false } }
    }
  });
}

function makeMiniChart(ctx, labels=[], data=[], color='#2c7be5') {
  if (!ctx) return null;
  return new Chart(ctx, {
    type: 'line',
    data: { labels, datasets: [{ label: 'pred', data, borderColor: color, tension: 0.3, pointRadius: 2, fill: false }] },
    options: {
      responsive: false,
      maintainAspectRatio: false,
      animation: { duration: 200 },
      plugins: { legend: { display: false } },
      scales: { x: { display: false }, y: { display: false } }
    }
  });
}

/* Leaflet map init (OSM) */
function initMap(lat = 21.146633, lon = 79.08886) {
  if (map) return;
  try {
    map = L.map('map', { zoomControl: false }).setView([lat, lon], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
    marker = L.marker([lat, lon]).addTo(map);
  } catch (e) {
    console.warn('Map init failed', e);
  }
}

/* set marker (throttled to avoid excessive map setView calls) */
function setMarker(lat, lon) {
  if (!lat || !lon) return;
  initMap(lat, lon);
  const now = Date.now();
  marker.setLatLng([lat, lon]);
  if (now - lastMapSet > MAP_THROTTLE_MS) {
    map.setView([lat, lon], 13);
    lastMapSet = now;
  }
}

/* Apply server data to UI (single place) */
function applyData(data) {
  if (!Array.isArray(data) || data.length === 0) return;

  const recent = data.slice(-MAX_POINTS);
  const last = data[data.length - 1];

  // latest values
  elTemp.textContent = `${safeNum(last.temperature).toFixed(2)} °C`;
  elHum.textContent  = `${safeNum(last.humidity).toFixed(2)} %`;
  elAqi.textContent  = `${safeNum(last.mq135)}`;
  elTime.textContent = fmtTime(last.timestamp);

  // calibration
  if ('calibrating' in last) {
    const c = last.calibrating === '1' || last.calibrating === 1 || last.calibrating === true;
    elCalib.textContent = c ? 'Calibration: in progress' : 'Calibration: done';
  } else {
    elCalib.textContent = 'Calibration: (not provided)';
  }

  // map coords (support many field names)
  const latVal = Number(last.latitude ?? last.lat ?? last.latitudes ?? last.latitude_deg ?? NaN);
  const lonVal = Number(last.longitude ?? last.lon ?? last.lng ?? last.longitude_deg ?? NaN);
  if (Number.isFinite(latVal) && Number.isFinite(lonVal)) {
    elLat.textContent = latVal.toFixed(6);
    elLon.textContent = lonVal.toFixed(6);
    setMarker(latVal, lonVal);
  } else {
    // fallback: attempt browser geolocation once (non-blocking)
    if (!map) initMap();
    elLat.textContent = '—';
    elLon.textContent = '—';
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(p => {
        elLat.textContent = p.coords.latitude.toFixed(6);
        elLon.textContent = p.coords.longitude.toFixed(6);
        setMarker(p.coords.latitude, p.coords.longitude);
      }, () => {});
    }
  }

  // prepare arrays
  const labels = recent.map(r => fmtTime(r.timestamp));
  const temps = recent.map(r => safeNum(r.temperature));
  const hums  = recent.map(r => safeNum(r.humidity));
  const aqis  = recent.map(r => safeNum(r.mq135));

  // Sparks: create once, update thereafter
  if (!sparkTemp && ctxSparkTemp) sparkTemp = makeSpark(ctxSparkTemp, temps, '#ff6b6b');
  if (!sparkHum  && ctxSparkHum)  sparkHum  = makeSpark(ctxSparkHum,  hums,  '#4dabf7');
  if (!sparkAqi  && ctxSparkAqi)  sparkAqi  = makeSpark(ctxSparkAqi,  aqis,  '#55c57a');

  if (sparkTemp) { sparkTemp.data.datasets[0].data = temps; sparkTemp.update(); }
  if (sparkHum)  { sparkHum.data.datasets[0].data = hums;  sparkHum.update(); }
  if (sparkAqi)  { sparkAqi.data.datasets[0].data = aqis;  sparkAqi.update(); }

  // Predictions (last N values)
  const lastN = Math.min(4, temps.length);
  const tTail = temps.slice(-lastN);
  const hTail = hums.slice(-lastN);
  const aTail = aqis.slice(-lastN);

  const predTemps = linearExtrapolate(tTail, PRED_STEPS);
  const predHums  = linearExtrapolate(hTail, PRED_STEPS);
  const predAqis  = linearExtrapolate(aTail, PRED_STEPS);

  elPredTempNext.textContent = (Number.isFinite(predTemps[0]) ? `${predTemps[0].toFixed(2)} °C` : '—');
  elPredHumNext.textContent  = (Number.isFinite(predHums[0])  ? `${predHums[0].toFixed(2)} %` : '—');
  elPredAqiNext.textContent  = (Number.isFinite(predAqis[0])  ? `${Math.round(predAqis[0])}` : '—');

  const predLabels = predTemps.map((_, i) => `+${i + 1}`);

  if (!predTempChart && ctxPredTemp) predTempChart = makeMiniChart(ctxPredTemp, predLabels, predTemps, '#ff6b6b');
  if (!predHumChart  && ctxPredHum)  predHumChart  = makeMiniChart(ctxPredHum,  predLabels, predHums,  '#4dabf7');
  if (!predAqiChart  && ctxPredAqi)  predAqiChart  = makeMiniChart(ctxPredAqi,  predLabels, predAqis,  '#55c57a');

  if (predTempChart) { predTempChart.data.labels = predLabels; predTempChart.data.datasets[0].data = predTemps; predTempChart.update(); }
  if (predHumChart)  { predHumChart.data.labels  = predLabels; predHumChart.data.datasets[0].data  = predHums;  predHumChart.update(); }
  if (predAqiChart)  { predAqiChart.data.labels  = predLabels; predAqiChart.data.datasets[0].data  = predAqis;  predAqiChart.update(); }

  // deployed stamp
  elDeployed.textContent = new Date().toLocaleDateString();
}

/* Fetch loop with exponential backoff */
let backoffAttempts = 0;
async function fetchData() {
  statusEl.textContent = 'Fetching…';
  try {
    const res = await fetch(SHEET_URL, { cache: 'no-store' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) throw new Error('Empty data');
    localStorage.setItem('lastDataset', JSON.stringify(data));
    applyData(data);
    statusEl.textContent = 'Live';
    backoffAttempts = 0; // reset
  } catch (err) {
    console.warn('Fetch error', err);
    statusEl.textContent = 'Offline (cached)';
    const cached = localStorage.getItem('lastDataset');
    if (cached) {
      try { applyData(JSON.parse(cached)); } catch (e) { console.warn('Cached parse failed', e); }
    }
    // exponential backoff retry scheduling
    backoffAttempts = Math.min(backoffAttempts + 1, BACKOFF_MAX);
    const delay = REFRESH_INTERVAL * Math.pow(1.6, backoffAttempts); // gradually longer
    setTimeout(fetchData, delay);
    return;
  }
  // schedule next normal fetch if successful
  setTimeout(fetchData, REFRESH_INTERVAL);
}

/* Initialize on load */
window.addEventListener('load', () => {
  // init map with default location
  initMap();

  // prime charts with empty arrays so canvas contexts exist and sizes lock
  if (ctxSparkTemp && !sparkTemp) sparkTemp = makeSpark(ctxSparkTemp, Array(MAX_POINTS).fill(0), '#ff6b6b');
  if (ctxSparkHum  && !sparkHum)  sparkHum  = makeSpark(ctxSparkHum,  Array(MAX_POINTS).fill(0), '#4dabf7');
  if (ctxSparkAqi  && !sparkAqi)  sparkAqi  = makeSpark(ctxSparkAqi,  Array(MAX_POINTS).fill(0), '#55c57a');

  if (ctxPredTemp && !predTempChart) predTempChart = makeMiniChart(ctxPredTemp, [], [], '#ff6b6b');
  if (ctxPredHum  && !predHumChart)  predHumChart  = makeMiniChart(ctxPredHum,  [], [], '#4dabf7');
  if (ctxPredAqi  && !predAqiChart)  predAqiChart  = makeMiniChart(ctxPredAqi,  [], [], '#55c57a');

  // initial fetch
  fetchData();
});
