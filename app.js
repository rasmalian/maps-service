/**
 * Smart Perumahan - Map Monitor Client App
 * Pure Vanilla JavaScript (Compatible with Cloudflare Pages / GitHub Pages)
 */

// --- Default Configuration & State ---
const DEFAULT_COORDS = [-7.0503327574839405, 110.48405875119505]; // Titik Tengah Peta Baru
const DEFAULT_ZOOM = 17;
const STORAGE_KEY = 'klipang_green_2_markers_v5';
const UMKM_STORAGE_KEY = 'klipang_green_2_umkm_v2';
const TELEGRAM_WORKER_URL = 'https://summer-rt9.demigod1337.workers.dev';
const UMKM_GAS_API_URL = 'https://script.google.com/macros/s/AKfycbwPvPOxQ_soVSSm5_28XLxcraEI-GEdaz2hnP_1AFuJszeTzbTxBEzYtA4TJwA37EbF/exec';

// Initial Markers
const INITIAL_DEMO_MARKERS = [
  {
    id: 'm_alarm_1',
    type: 'alarm',
    name: 'Alarm Safir 2',
    lat: -7.050423194247873,
    lng: 110.48430984799066,
    status: 'idle',
    activeHazard: null,
    createdAt: Date.now(),
    webhooks: {
      ping: `${TELEGRAM_WORKER_URL}/?bot=2&action=ping`,
      stop: `${TELEGRAM_WORKER_URL}/?bot=2&action=stop`
    }
  },
  {
    id: 'm_cctv_1',
    type: 'cctv',
    name: 'CCTV Safir 2',
    lat: -7.050360,
    lng: 110.484230, // Digeser ~11m ke sudut barat laut agar tidak bertumpuk dengan Alarm Safir 2
    preset: 'gate',
    streamUrl: 'https://livepantau.semarangkota.go.id/7f4d1bec-25f2-4ffe-9673-0d4e3c3111c2/index.m3u8',
    createdAt: Date.now()
  },
  {
    id: 'm_alarm_2',
    type: 'alarm',
    name: 'Alarm Safir 3',
    lat: -7.050437072530633,
    lng: 110.48491388759022,
    status: 'idle',
    activeHazard: null,
    createdAt: Date.now(),
    webhooks: {
      ping: `${TELEGRAM_WORKER_URL}/?bot=1&action=ping`,
      stop: `${TELEGRAM_WORKER_URL}/?bot=1&action=stop`
    }
  },
  {
    id: 'm_alarm_3',
    type: 'alarm',
    name: 'Alarm Kalimaya Timur',
    lat: -7.051005204245323,
    lng: 110.48481366638987,
    status: 'idle',
    activeHazard: null,
    createdAt: Date.now(),
    webhooks: {
      ping: `${TELEGRAM_WORKER_URL}/?bot=3&action=ping`,
      stop: `${TELEGRAM_WORKER_URL}/?bot=3&action=stop`
    }
  },
  {
    id: 'm_alarm_4',
    type: 'alarm',
    name: 'Alarm Kalimaya Barat',
    lat: -7.051349569340888,
    lng: 110.48230923057393,
    status: 'idle',
    activeHazard: null,
    createdAt: Date.now(),
    webhooks: {
      ping: `${TELEGRAM_WORKER_URL}/?bot=4&action=ping`,
      stop: `${TELEGRAM_WORKER_URL}/?bot=4&action=stop`
    }
  },
  {
    id: 'm_cctv_2',
    type: 'cctv',
    name: 'CCTV Titik 2',
    lat: -7.050783253591908,
    lng: 110.48299489036295,
    preset: 'street',
    createdAt: Date.now()
  },
  {
    id: 'm_cctv_3',
    type: 'cctv',
    name: 'CCTV Titik 3',
    lat: -7.0507205782913696,
    lng: 110.4842308823787,
    preset: 'corner',
    createdAt: Date.now()
  },
  {
    id: 'm_cctv_4',
    type: 'cctv',
    name: 'CCTV Titik 4',
    lat: -7.050418393665095,
    lng: 110.48485564474373,
    preset: 'gate',
    createdAt: Date.now()
  }
];

// Initial Seed Data UMKM (Render instan 0ms tanpa menunggu jeda Google Apps Script)
const INITIAL_DEMO_UMKM = [
  {
    id: 1,
    nama_usaha: 'Dapur Bu',
    kategori: 'kuliner',
    deskripsi_menu: 'Nasi Ayam & Aneka Menu Masakan',
    no_wa: '62812345678',
    foto_url: 'https://kadarland.com/wp-content/uploads/2025/01/Warung-Makan-instagram.com-temansocialspace.webp',
    lat: -7.0502968502322,
    lng: 110.484817016547,
    status: 'buka',
    promo: 'Diskon 10%'
  },
  {
    id: 2,
    nama_usaha: 'KG2',
    kategori: 'laundry',
    deskripsi_menu: 'Cuci Kilat & Kiloan',
    no_wa: '62898765432',
    foto_url: 'https://casaindonesia.com/lkgallery/images/ibjido_ruang_laundry_4.jpg',
    lat: -7.0502968502322,
    lng: 110.484817016547,
    status: 'buka',
    promo: 'Gratis Antar Jemput'
  },
  {
    id: 3,
    nama_usaha: 'Warung',
    kategori: 'toko',
    deskripsi_menu: 'Sembako, Gas & Galon',
    no_wa: '62811223344',
    foto_url: 'https://cdn0-production-images-kly.akamaized.net/Frrg5nVBHJ2jG03fZViZzPmTgao=/500x500/smart/filters:quality(75):strip_icc():format(webp)/kly-media-production/medias/5369830/original/057638400_1759480731-toko_sembako_di_perumahan.jpg',
    lat: -7.0502968502322,
    lng: 110.484817016547,
    status: 'buka',
    promo: 'Siap Kirim Cepat'
  },
  {
    id: 4,
    nama_usaha: 'Kopi Warga',
    kategori: 'kuliner',
    deskripsi_menu: 'Kopi Susu Gula Aren',
    no_wa: '62877112233',
    foto_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQGiyEj-yIFT4bAf_LNjXKxuC_Rq8VeR9eDHacyDM9fdIfnhvcvWE1nnE3A&s=10',
    lat: -7.0502968502322,
    lng: 110.484817016547,
    status: 'tutup',
    promo: 'Promo Beli 2 Gratis 1'
  }
];

// App State
const state = {
  markers: [],
  map: null,
  leafletMarkers: new Map(), // id -> L.Marker
  isAddMode: false,
  selectedLatLng: null,
  activeAlarmMarkerId: null,
  activeCctvMarkerId: null,
  globalSirenActive: false,
  cctvAnimationId: null,
  previewCanvasInterval: null,
  popupHlsInstance: null,
  hlsInstance: null,
  umkmList: [],
  umkmLayerGroup: null,
  showUmkm: true
};

// --- Web Audio API Synthesizer (Zero External Audio File Dependency) ---
class SoundSynthesizer {
  constructor() {
    this.ctx = null;
    this.sirenOsc1 = null;
    this.sirenOsc2 = null;
    this.sirenGain = null;
    this.sirenLfo = null;
    this.sirenActive = false;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Bip Test Ping (3 Detik)
  playPingBeeps(onComplete) {
    this.init();
    if (!this.ctx) return;

    const startTime = this.ctx.currentTime;
    const beepCount = 3;
    const beepDuration = 0.25;
    const interval = 0.9;

    for (let i = 0; i < beepCount; i++) {
      const t = startTime + (i * interval);
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, t); // High A5 note
      osc.frequency.exponentialRampToValueAtTime(1320, t + beepDuration);

      gain.gain.setValueAtTime(0.01, t);
      gain.gain.linearRampToValueAtTime(0.35, t + 0.05);
      gain.gain.linearRampToValueAtTime(0.01, t + beepDuration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + beepDuration);
    }

    setTimeout(() => {
      if (onComplete) onComplete();
    }, 3000);
  }

  // Sirine Bahaya Kontinu
  startEmergencySiren() {
    this.init();
    if (!this.ctx || this.sirenActive) return;

    this.sirenActive = true;
    const now = this.ctx.currentTime;

    // Dual Tone Modulated Siren
    this.sirenOsc1 = this.ctx.createOscillator();
    this.sirenOsc2 = this.ctx.createOscillator();
    this.sirenGain = this.ctx.createGain();

    this.sirenOsc1.type = 'sawtooth';
    this.sirenOsc2.type = 'triangle';

    // LFO to modulate siren pitch (wooo-waaa-wooo)
    this.sirenLfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();

    this.sirenLfo.frequency.setValueAtTime(0.6, now); // Siren pitch cycle
    lfoGain.gain.setValueAtTime(250, now); // Pitch variation depth

    this.sirenOsc1.frequency.setValueAtTime(700, now);
    this.sirenOsc2.frequency.setValueAtTime(705, now);

    this.sirenLfo.connect(this.sirenOsc1.frequency);
    this.sirenLfo.connect(this.sirenOsc2.frequency);

    this.sirenGain.gain.setValueAtTime(0.01, now);
    this.sirenGain.gain.linearRampToValueAtTime(0.4, now + 0.3);

    this.sirenOsc1.connect(this.sirenGain);
    this.sirenOsc2.connect(this.sirenGain);
    this.sirenGain.connect(this.ctx.destination);

    this.sirenLfo.start(now);
    this.sirenOsc1.start(now);
    this.sirenOsc2.start(now);
  }

  stopEmergencySiren() {
    if (!this.sirenActive || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      if (this.sirenGain) {
        this.sirenGain.gain.linearRampToValueAtTime(0.001, now + 0.2);
      }
      setTimeout(() => {
        if (this.sirenOsc1) { this.sirenOsc1.stop(); this.sirenOsc1.disconnect(); }
        if (this.sirenOsc2) { this.sirenOsc2.stop(); this.sirenOsc2.disconnect(); }
        if (this.sirenLfo) { this.sirenLfo.stop(); this.sirenLfo.disconnect(); }
        this.sirenActive = false;
      }, 250);
    } catch (e) {
      this.sirenActive = false;
    }
  }
}

const audioFX = new SoundSynthesizer();

// --- Storage Management ---
function loadMarkers() {
  try {
    let raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Migrasi data dari versi sebelumnya jika ada
      raw = localStorage.getItem('klipang_green_2_markers_v4') ||
            localStorage.getItem('klipang_green_2_markers_v3') ||
            localStorage.getItem('klipang_green_2_markers_v2');
    }

    if (raw) {
      state.markers = JSON.parse(raw);
      // Sinkronkan nama dan webhook untuk marker alarm standar
      state.markers.forEach(m => {
        if (m.type === 'alarm') {
          if (m.id === 'm_alarm_1' || (m.name && m.name.toLowerCase().includes('safir 2'))) {
            m.name = 'Alarm Safir 2';
            m.botId = '2';
          } else if (m.id === 'm_alarm_2' || (m.name && m.name.toLowerCase().includes('safir 3'))) {
            m.name = 'Alarm Safir 3';
            m.botId = '1';
          } else if (m.id === 'm_alarm_3' || (m.name && m.name.toLowerCase().includes('kalimaya timur'))) {
            m.name = 'Alarm Kalimaya Timur';
            m.botId = '3';
          } else if (m.id === 'm_alarm_4' || (m.name && m.name.toLowerCase().includes('kalimaya barat'))) {
            m.name = 'Alarm Kalimaya Barat';
            m.botId = '4';
          }

          const botId = getBotIdForMarker(m);
          m.botId = botId;
          m.webhooks = {
            ping: `${TELEGRAM_WORKER_URL}/?bot=${botId}&action=ping`,
            stop: `${TELEGRAM_WORKER_URL}/?bot=${botId}&action=stop`
          };
        } else if (m.type === 'cctv') {
          // Sinkronkan CCTV Titik 1 -> CCTV Safir 2 dan update posisi agar tidak bertumpuk
          if (m.id === 'm_cctv_1' || (m.name && (m.name.includes('Titik 1') || m.name.includes('Safir 2')))) {
            m.name = 'CCTV Safir 2';
            m.streamUrl = 'https://livepantau.semarangkota.go.id/7f4d1bec-25f2-4ffe-9673-0d4e3c3111c2/index.m3u8';
            m.lat = -7.050360;
            m.lng = 110.484230;
          }
        }
      });
      saveMarkers();
    } else {
      state.markers = JSON.parse(JSON.stringify(INITIAL_DEMO_MARKERS));
      saveMarkers();
    }
  } catch (e) {
    state.markers = JSON.parse(JSON.stringify(INITIAL_DEMO_MARKERS));
  }
  loadUmkmCache();
}

function loadUmkmCache() {
  try {
    const raw = localStorage.getItem(UMKM_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        state.umkmList = parsed;
        return;
      }
    }
  } catch (e) {
    console.warn('[UMKM] Cache read error:', e);
  }
  // Fallback awal (instan 0ms) tanpa menunggu cold-start Google Apps Script
  state.umkmList = JSON.parse(JSON.stringify(INITIAL_DEMO_UMKM));
}

function saveUmkmCache() {
  try {
    localStorage.setItem(UMKM_STORAGE_KEY, JSON.stringify(state.umkmList));
  } catch (e) {
    console.warn('[UMKM] Cache save error:', e);
  }
}

function saveMarkers() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.markers));
    updateHeaderStats();
  } catch (e) {
    console.error('Storage error:', e);
  }
}

// --- Map Initialization ---
function initMap() {
  // Mobile touch-friendly map options
  state.map = L.map('map', {
    zoomControl: false,
    tap: true,
    touchZoom: true
  }).setView(DEFAULT_COORDS, DEFAULT_ZOOM);

  // OpenStreetMap Tile Layer (No API Key Required!)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(state.map);

  // Custom Zoom Control at Top Right
  L.control.zoom({ position: 'bottomleft' }).addTo(state.map);

  // Map Click Listener (for adding markers)
  state.map.on('click', onMapClick);

  // Render initial markers & instant UMKM layer (0ms)
  renderAllMarkers();
  renderUmkmMarkers();
}

// --- Marker Renderers & Custom Icons ---
function createMarkerIcon(marker) {
  let innerHtml = '';
  const isAlarm = marker.type === 'alarm';
  const isTesting = marker.status === 'testing';
  const isActiveAlert = marker.status === 'active';

  if (isAlarm) {
    let radarHtml = isActiveAlert ? '<div class="siren-radar-ring"></div>' : '';
    let statusClass = isActiveAlert ? 'active' : (isTesting ? 'testing' : 'normal');

    innerHtml = `
      <div class="custom-pin">
        ${radarHtml}
        <div class="pin-bubble alarm ${statusClass}">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
        </div>
      </div>
    `;
  } else {
    // CCTV Pin
    innerHtml = `
      <div class="custom-pin">
        <div class="pin-bubble cctv">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M23 7l-7 5 7 5V7z"></path>
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
          </svg>
        </div>
      </div>
    `;
  }

  return L.divIcon({
    html: innerHtml,
    className: 'custom-leaflet-marker',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -22]
  });
}

function renderAllMarkers() {
  // Clear existing Leaflet markers
  state.leafletMarkers.forEach(lm => state.map.removeLayer(lm));
  state.leafletMarkers.clear();

  state.markers.forEach(marker => {
    const icon = createMarkerIcon(marker);
    const leafletMarker = L.marker([marker.lat, marker.lng], { icon: icon }).addTo(state.map);

    if (marker.type === 'alarm') {
      leafletMarker.on('click', () => openAlarmModal(marker.id));
    } else if (marker.type === 'cctv') {
      // CCTV Marker: Show mini preview popup on click
      const popupContent = createCctvPopupHtml(marker);
      leafletMarker.bindPopup(popupContent, { maxWidth: 220, closeButton: false });
      leafletMarker.on('popupopen', () => setupCctvMiniCanvas(marker));
      leafletMarker.on('popupclose', () => cleanupCctvMiniPopup());
    }

    state.leafletMarkers.set(marker.id, leafletMarker);
  });

  updateHeaderStats();
}

// --- UMKM & Merchant Modules (Google Apps Script API Integration) ---
function normalizeCoord(val, isLat) {
  if (val === null || val === undefined) return null;
  let str = String(val).trim().replace(',', '.');
  let num = parseFloat(str);
  if (isNaN(num)) return null;

  if (isLat) {
    if (num < -90 || num > 90) {
      const digits = str.replace(/[^0-9]/g, '');
      const sign = str.startsWith('-') ? -1 : 1;
      if (digits.length >= 2) {
        num = sign * parseFloat(digits[0] + '.' + digits.slice(1));
      }
    }
  } else {
    if (num < -180 || num > 180) {
      const digits = str.replace(/[^0-9]/g, '');
      const sign = str.startsWith('-') ? -1 : 1;
      if (digits.length >= 4) {
        num = sign * parseFloat(digits.slice(0, 3) + '.' + digits.slice(3));
      }
    }
  }
  return num;
}

function createUmkmIcon(item) {
  const cat = (item.kategori || '').toLowerCase();
  const name = (item.nama_usaha || '').toLowerCase();
  const menu = (item.deskripsi_menu || '').toLowerCase();
  let emoji = '🛍️';
  let bgColor = '#6366f1'; // Indigo

  if (cat.includes('kopi') || cat.includes('kafe') || cat.includes('coffee') || name.includes('kopi') || menu.includes('kopi')) {
    emoji = '☕';
    bgColor = '#8b5cf6'; // Violet
  } else if (cat.includes('laundry') || cat.includes('cuci') || name.includes('laundry')) {
    emoji = '🧺';
    bgColor = '#06b6d4'; // Cyan
  } else if (cat.includes('toko') || cat.includes('sembako') || cat.includes('warung') || name.includes('warung') || name.includes('toko')) {
    emoji = '🏪';
    bgColor = '#10b981'; // Emerald
  } else if (cat.includes('kuliner') || cat.includes('makan') || cat.includes('food') || name.includes('dapur')) {
    emoji = '🍔';
    bgColor = '#f59e0b'; // Amber
  }

  const rawStatus = item.status || item['stat…'] || item['stat?'] || '';
  const isClosed = String(rawStatus).toLowerCase().includes('tutup');
  const statusDotClass = isClosed ? 'umkm-status-dot closed' : 'umkm-status-dot';

  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div class="custom-pin">
        <div class="umkm-pin-bubble" style="background: ${bgColor};" title="${item.nama_usaha || 'UMKM'}">
          <span>${emoji}</span>
          <span class="${statusDotClass}"></span>
        </div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20]
  });
}

function renderUmkmMarkers() {
  if (!state.map) return;
  if (!state.umkmLayerGroup) {
    state.umkmLayerGroup = L.layerGroup().addTo(state.map);
  }

  state.umkmLayerGroup.clearLayers();

  if (!state.showUmkm) return;

  // Lacak koordinat kembar/tumpang-tindih agar tidak bertumpuk 100% pada 1 titik
  const coordOccurrences = new Map();

  state.umkmList.forEach((item, index) => {
    let lat = normalizeCoord(item.lat, true);
    let lng = normalizeCoord(item.lng, false);

    if (lat === null || lng === null) return;

    // Kunci koordinat pembulatan ~1 meter
    const coordKey = `${lat.toFixed(5)},${lng.toFixed(5)}`;
    const duplicateCount = coordOccurrences.get(coordKey) || 0;
    coordOccurrences.set(coordKey, duplicateCount + 1);

    // Jika ada koordinat yang sama persis (misal di spreadsheet belum diubah titik lokasinya),
    // berikan offset melingkar kecil (~8 meter) agar semua pin terlihat berdampingan
    if (duplicateCount > 0) {
      const angle = (duplicateCount * (2 * Math.PI / 4)) + (index * 0.4);
      const radius = 0.000075 * Math.ceil(duplicateCount / 2);
      lat += Math.sin(angle) * radius;
      lng += Math.cos(angle) * radius;
    }

    const marker = L.marker([lat, lng], { icon: createUmkmIcon(item) });
    marker.on('click', () => openUmkmModal(item));
    state.umkmLayerGroup.addLayer(marker);
  });

  updateHeaderStats();
}

let umkmLastJsonCache = '';
const UMKM_SYNC_INTERVAL_MS = 60000; // Auto-polling setiap 60 detik
let umkmSyncInterval = null;

async function fetchUmkmData(isSilent = false) {
  if (!UMKM_GAS_API_URL) return;
  try {
    const res = await fetch(UMKM_GAS_API_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (json && json.ok && Array.isArray(json.data)) {
      const newJsonStr = JSON.stringify(json.data);
      // Hanya re-render jika data benar-benar berubah/bertambah/berkurang
      if (newJsonStr !== umkmLastJsonCache) {
        const prevCount = state.umkmList.length;
        umkmLastJsonCache = newJsonStr;
        state.umkmList = json.data;
        saveUmkmCache();
        renderUmkmMarkers();
        updateHeaderStats();

        if (isSilent && prevCount !== state.umkmList.length) {
          showToast(`Direktori UMKM diperbarui (${state.umkmList.length} usaha)`, '🔄');
        }
      }
    }
  } catch (err) {
    if (!isSilent) {
      console.warn('[UMKM] Gagal memuat data Google Sheet:', err);
    }
  }
}

function startUmkmAutoSync() {
  if (umkmSyncInterval) clearInterval(umkmSyncInterval);
  umkmSyncInterval = setInterval(() => {
    if (state.showUmkm && !document.hidden) {
      fetchUmkmData(true);
    }
  }, UMKM_SYNC_INTERVAL_MS);
}

function openUmkmModal(item) {
  const modal = document.getElementById('umkmModal');
  if (!modal) return;

  document.getElementById('umkmModalName').textContent = item.nama_usaha || 'Toko Warga';

  const cat = (item.kategori || 'UMKM').toLowerCase();
  const catBadge = document.getElementById('umkmCategoryBadge');
  catBadge.textContent = (item.kategori || 'UMKM').toUpperCase();
  catBadge.className = `umkm-cat-badge ${cat}`;

  const rawStatus = item.status || item['stat…'] || item['stat?'] || '';
  const isClosed = String(rawStatus).toLowerCase().includes('tutup');
  const statusBadge = document.getElementById('umkmStatusBadge');
  const deliveryBadge = document.getElementById('umkmDeliveryBadge');
  if (isClosed) {
    statusBadge.className = 'status-chip-compact testing';
    statusBadge.textContent = '🔴 TUTUP';
    if (deliveryBadge) deliveryBadge.style.display = 'none';
  } else {
    statusBadge.className = 'status-chip-compact normal';
    statusBadge.textContent = '🟢 BUKA';
    if (deliveryBadge) {
      deliveryBadge.style.display = 'inline-flex';
      deliveryBadge.className = 'status-chip-compact delivery';
      deliveryBadge.textContent = '🏷️ Siap Kirim';
    }
  }

  // Tampilkan toast notifikasi status 10 detik sesuai status masing-masing UMKM
  triggerUmkmStatusToast(item);

  const promoWrap = document.getElementById('umkmPromoBanner');
  const promoText = document.getElementById('umkmPromoText');
  if (item.promo && String(item.promo).trim() !== '') {
    promoText.textContent = item.promo;
    promoWrap.classList.remove('hidden');
  } else {
    promoWrap.classList.add('hidden');
  }

  const imgWrap = document.getElementById('umkmImageWrap');
  const imgEl = document.getElementById('umkmModalImage');
  if (item.foto_url && String(item.foto_url).startsWith('http') && !item.foto_url.includes('...')) {
    imgEl.src = item.foto_url;
    imgWrap.classList.remove('hidden');
  } else {
    imgWrap.classList.add('hidden');
  }

  document.getElementById('umkmModalDesc').textContent = item.deskripsi_menu || 'Layanan dan produk warga Klipang Green 2';

  const waBtn = document.getElementById('btnUmkmWhatsapp');
  let waNum = String(item.no_wa || '').replace(/[^0-9]/g, '');
  if (waNum.startsWith('0')) {
    waNum = '62' + waNum.slice(1);
  }

  if (!waNum) {
    waBtn.style.display = 'none';
  } else {
    waBtn.style.display = 'flex';
    const waMsg = encodeURIComponent(`Halo ${item.nama_usaha}, saya warga Klipang Green 2 lihat dari Peta Perumahan, mau tanya/pesan: ${item.deskripsi_menu || ''}`);
    waBtn.href = `https://wa.me/${waNum}?text=${waMsg}`;
  }

  modal.classList.remove('hidden');
}

function closeUmkmModal() {
  const modal = document.getElementById('umkmModal');
  if (modal) modal.classList.add('hidden');
}

// Tampilkan status toast dinamis selama 10 detik sesuai status masing-masing UMKM
function triggerUmkmStatusToast(item) {
  if (!item) return;

  const rawStatus = item.status || item['stat…'] || item['stat?'] || '';
  const isClosed = String(rawStatus).toLowerCase().includes('tutup');
  const nama = item.nama_usaha || 'UMKM Warga';
  const promo = (item.promo || '').trim();
  const desc = (item.deskripsi_menu || '').trim();

  let toastMsg = '';
  let toastIcon = '🏷️';
  let toastType = 'ready';

  if (isClosed) {
    toastIcon = '🔴';
    toastMsg = `🔴 Sedang Tutup • ${nama} (Buka kembali nanti)`;
    toastType = 'closed';
  } else {
    toastIcon = '🏷️';
    if (promo) {
      toastMsg = `🏷️ Siap Kirim • ${nama}: "${promo}"`;
    } else if (desc) {
      toastMsg = `🏷️ Siap Kirim • ${nama} (${desc})`;
    } else {
      toastMsg = `🏷️ Siap Kirim • ${nama} (Buka & Ready Order)`;
    }
    toastType = 'ready';
  }

  // Muncul tepat 10 detik (10.000 ms) sesuai status masing-masing UMKM
  showToast(toastMsg, toastIcon, 10000, toastType);
}

function focusUmkmOnMap() {
  if (!state.map || state.umkmList.length === 0) return;
  const first = state.umkmList[0];
  const lat = normalizeCoord(first.lat, true) || DEFAULT_COORDS[0];
  const lng = normalizeCoord(first.lng, false) || DEFAULT_COORDS[1];
  state.map.flyTo([lat, lng], 18, { duration: 1 });
}

function toggleUmkmLayer() {
  // Jika sedang aktif, klik tombol akan memusatkan kamera peta ke lokasi UMKM
  if (state.showUmkm && state.umkmList.length > 0) {
    focusUmkmOnMap();
    showToast(`📍 Memusatkan ke ${state.umkmList.length} Gerai UMKM (Jl. Safir)`, '🛍️');
    return;
  }

  // Jika sedang tersembunyi, aktifkan kembali dan arahkan kamera
  state.showUmkm = true;
  const btn = document.getElementById('btnToggleUmkm');
  if (btn) btn.classList.add('active');
  renderUmkmMarkers();
  focusUmkmOnMap();
  showToast('Menampilkan UMKM & Kuliner', '🛍️');
}

function updateMarkerDisplay(markerId) {
  const marker = state.markers.find(m => m.id === markerId);
  const leafletMarker = state.leafletMarkers.get(markerId);
  if (marker && leafletMarker) {
    leafletMarker.setIcon(createMarkerIcon(marker));
  }
}

function drawSimulatedCameraFrame(canvas, marker, isHighRes = false) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;

  // Background gradient: security camera surveillance tone
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, '#111827');
  grad.addColorStop(0.5, '#1e293b');
  grad.addColorStop(1, '#0f172a');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Moving road / grid simulation
  const time = Date.now() * 0.0015;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1;

  // Draw perspective lines (Roadway / Alley / Gate)
  ctx.beginPath();
  ctx.moveTo(w * 0.1, h);
  ctx.lineTo(w * 0.45, h * 0.4);
  ctx.moveTo(w * 0.9, h);
  ctx.lineTo(w * 0.55, h * 0.4);
  ctx.stroke();

  // Horizon line
  ctx.beginPath();
  ctx.moveTo(0, h * 0.4);
  ctx.lineTo(w, h * 0.4);
  ctx.stroke();

  // Draw simulated vehicle / pedestrian movement in distance
  const objX = (w * 0.5) + Math.sin(time) * (w * 0.2);
  const objY = h * 0.55 + Math.cos(time * 0.5) * (h * 0.1);
  ctx.fillStyle = 'rgba(59, 130, 246, 0.35)';
  ctx.fillRect(objX - 18, objY - 10, 36, 20);

  // Motion Detection Box over object
  ctx.strokeStyle = '#22c55e';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(objX - 22, objY - 14, 44, 28);
  ctx.fillStyle = '#22c55e';
  ctx.font = '9px monospace';
  ctx.fillText('TARGET', objX - 20, objY - 18);

  // Scanline TV effect
  ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
  for (let i = 0; i < h; i += 4) {
    ctx.fillRect(0, i, w, 2);
  }

  // Live Timestamp Overlay
  const now = new Date();
  const dateStr = now.toISOString().replace('T', ' ').slice(0, 19);
  ctx.fillStyle = '#f8fafc';
  ctx.font = isHighRes ? '16px monospace' : '10px monospace';
  ctx.fillText(dateStr, 12, h - 14);

  // Camera ID
  ctx.fillStyle = '#38bdf8';
  ctx.fillText(marker.name.toUpperCase(), 12, isHighRes ? 26 : 16);
}

function createCctvPopupHtml(marker) {
  const isRealStream = !!marker.streamUrl;
  const badgeText = isRealStream ? '🔴 LIVE STREAM' : '● LIVE';
  return `
    <div class="cctv-preview-card" onclick="openCctvFullscreen('${marker.id}')">
      <div class="cctv-preview-thumb-wrap">
        <video class="cctv-preview-video hidden" id="popup_video_${marker.id}" playsinline autoplay muted loop></video>
        <canvas class="cctv-preview-canvas" id="popup_canvas_${marker.id}" width="200" height="105"></canvas>
        <span class="cctv-badge-live">${badgeText}</span>
        <span class="cctv-thumb-status" id="popup_status_${marker.id}">${isRealStream ? 'Menghubungkan...' : 'Simulasi'}</span>
      </div>
      <div class="cctv-preview-title">${marker.name}</div>
      <div class="cctv-preview-hint">
        <span>Ketuk untuk perbesar</span>
        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="15 3 21 3 21 9"></polyline>
          <polyline points="9 21 3 21 3 15"></polyline>
          <line x1="21" y1="3" x2="14" y2="10"></line>
          <line x1="3" y1="21" x2="10" y2="14"></line>
        </svg>
      </div>
    </div>
  `;
}

function cleanupCctvMiniPopup() {
  if (state.popupHlsInstance) {
    try {
      state.popupHlsInstance.destroy();
    } catch (e) {}
    state.popupHlsInstance = null;
  }
  if (state.previewCanvasInterval) {
    clearInterval(state.previewCanvasInterval);
    state.previewCanvasInterval = null;
  }
}

function setupCctvMiniCanvas(marker) {
  cleanupCctvMiniPopup();

  setTimeout(() => {
    const canvas = document.getElementById(`popup_canvas_${marker.id}`);
    const video = document.getElementById(`popup_video_${marker.id}`);
    const statusLabel = document.getElementById(`popup_status_${marker.id}`);
    if (!canvas) return;

    // Render frame awal pada canvas
    drawSimulatedCameraFrame(canvas, marker, false);

    const startCanvasInterval = () => {
      if (state.previewCanvasInterval) clearInterval(state.previewCanvasInterval);
      state.previewCanvasInterval = setInterval(() => {
        const c = document.getElementById(`popup_canvas_${marker.id}`);
        if (c) drawSimulatedCameraFrame(c, marker, false);
        else clearInterval(state.previewCanvasInterval);
      }, 500);
    };

    if (marker.streamUrl && video) {
      if (statusLabel) statusLabel.textContent = 'Menghubungkan...';

      if (window.Hls && Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          manifestLoadingTimeOut: 6000,
          levelLoadingTimeOut: 6000
        });
        state.popupHlsInstance = hls;

        hls.loadSource(marker.streamUrl);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().then(() => {
            video.classList.remove('hidden');
            if (statusLabel) statusLabel.textContent = 'Live Feed';
          }).catch(() => {
            video.classList.remove('hidden');
            if (statusLabel) statusLabel.textContent = 'Live Feed';
          });
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            video.classList.add('hidden');
            if (statusLabel) statusLabel.textContent = 'Offline (Simulasi)';
            startCanvasInterval();
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = marker.streamUrl;
        video.addEventListener('loadedmetadata', () => {
          video.play().then(() => {
            video.classList.remove('hidden');
            if (statusLabel) statusLabel.textContent = 'Live Feed';
          }).catch(() => {});
        });
        video.addEventListener('error', () => {
          video.classList.add('hidden');
          if (statusLabel) statusLabel.textContent = 'Offline (Simulasi)';
          startCanvasInterval();
        });
      } else {
        startCanvasInterval();
      }
    } else {
      if (statusLabel) statusLabel.textContent = 'Simulasi';
      startCanvasInterval();
    }
  }, 50);
}

// --- CCTV Fullscreen Modal Controls ---
window.openCctvFullscreen = function(markerId) {
  const marker = state.markers.find(m => m.id === markerId);
  if (!marker) return;

  // Tutup dan bersihkan player HLS thumbnail agar tidak jalan dobel dengan fullscreen
  cleanupCctvMiniPopup();

  state.activeCctvMarkerId = markerId;
  const modal = document.getElementById('cctvFullModal');
  const title = document.getElementById('cctvFullTitle');
  const osdCamId = document.getElementById('osdCamId');
  const osdLocation = document.getElementById('osdLocation');
  const canvas = document.getElementById('cctvLiveCanvas');
  const video = document.getElementById('cctvVideoPlayer');
  const modeSource = document.getElementById('cctvModeSource');
  const statusTag = document.getElementById('cctvStatusTag');

  title.textContent = marker.name;
  osdCamId.textContent = `CAM-${marker.id.slice(-4).toUpperCase()}`;
  osdLocation.textContent = marker.name.toUpperCase();

  modal.classList.remove('hidden');

  // Bersihkan HLS player sebelumnya jika ada
  if (state.hlsInstance) {
    state.hlsInstance.destroy();
    state.hlsInstance = null;
  }
  if (video) {
    video.pause();
    video.src = '';
    video.classList.add('hidden');
  }

  // Jika marker memiliki stream live URL (contoh: m3u8 dari Pemkot Semarang)
  if (marker.streamUrl && video) {
    if (modeSource) modeSource.textContent = 'Live HLS Stream';
    if (statusTag) statusTag.textContent = 'Menghubungkan Stream...';

    const streamUrl = marker.streamUrl;

    // 1. Coba Hls.js jika didukung browser
    if (window.Hls && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        manifestLoadingTimeOut: 10000,
        levelLoadingTimeOut: 10000
      });
      state.hlsInstance = hls;

      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.classList.remove('hidden');
        video.play().catch(e => console.warn('Autoplay video dicegah browser:', e));
        if (statusTag) statusTag.textContent = '🟢 Online Live (Semarang)';
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.warn('[CCTV HLS Error]', data);
        if (data.fatal) {
          if (statusTag) statusTag.textContent = '⚠️ Stream Offline (Beralih ke Simulasi)';
          video.classList.add('hidden');
          hls.destroy();
          state.hlsInstance = null;
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // 2. Dukungan native HLS (Safari iOS / macOS)
      video.src = streamUrl;
      video.addEventListener('loadedmetadata', () => {
        video.classList.remove('hidden');
        video.play().catch(e => console.warn('Autoplay error:', e));
        if (statusTag) statusTag.textContent = '🟢 Online Live (Safari)';
      });
      video.addEventListener('error', () => {
        if (statusTag) statusTag.textContent = '⚠️ Stream Offline (Beralih ke Simulasi)';
        video.classList.add('hidden');
      });
    }
  } else {
    if (modeSource) modeSource.textContent = 'Kamera Simulasi';
    if (statusTag) statusTag.textContent = 'Inframerah / Auto';
  }

  // Jalankan smooth animation loop pada canvas (sebagai fallback/background/clock OSD)
  function renderLoop() {
    drawSimulatedCameraFrame(canvas, marker, true);
    // Update live digital clock
    const clock = document.getElementById('cctvClock');
    if (clock) {
      const now = new Date();
      clock.textContent = now.toTimeString().split(' ')[0];
    }
    state.cctvAnimationId = requestAnimationFrame(renderLoop);
  }

  cancelAnimationFrame(state.cctvAnimationId);
  state.cctvAnimationId = requestAnimationFrame(renderLoop);
};

function closeCctvFullscreen() {
  const modal = document.getElementById('cctvFullModal');
  modal.classList.add('hidden');
  cancelAnimationFrame(state.cctvAnimationId);
  state.activeCctvMarkerId = null;

  if (state.hlsInstance) {
    state.hlsInstance.destroy();
    state.hlsInstance = null;
  }
  const video = document.getElementById('cctvVideoPlayer');
  if (video) {
    video.pause();
    video.src = '';
    video.classList.add('hidden');
  }
}

// --- Alarm Modal & Hazard Trigger Controls ---
function openAlarmModal(markerId) {
  const marker = state.markers.find(m => m.id === markerId);
  if (!marker) return;

  state.activeAlarmMarkerId = markerId;
  const modal = document.getElementById('alarmModal');
  const nameEl = document.getElementById('alarmModalName');
  const coordsEl = document.getElementById('alarmModalCoords');
  const statusEl = document.getElementById('alarmStatusBadge');

  nameEl.textContent = marker.name;
  coordsEl.textContent = `${marker.lat.toFixed(5)}, ${marker.lng.toFixed(5)}`;

  updateAlarmStatusChip(marker, statusEl);

  modal.classList.remove('hidden');
}

function closeAlarmModal() {
  document.getElementById('alarmModal').classList.add('hidden');
  state.activeAlarmMarkerId = null;
}

function updateAlarmStatusChip(marker, statusEl) {
  if (!statusEl) statusEl = document.getElementById('alarmStatusBadge');
  if (!statusEl) return;

  if (marker.status === 'active') {
    statusEl.className = 'status-chip-compact active';
    statusEl.textContent = `🚨 ${getHazardLabel(marker.activeHazard).toUpperCase()}`;
  } else if (marker.status === 'testing') {
    statusEl.className = 'status-chip-compact testing';
    statusEl.textContent = '⚠️ PING TEST';
  } else {
    statusEl.className = 'status-chip-compact normal';
    statusEl.textContent = 'Standby';
  }
}

function getHazardLabel(type) {
  switch (type) {
    case 'wild_animal': return 'Hewan Liar';
    case 'fire': return 'Kebakaran';
    case 'flood': return 'Kebanjiran';
    case 'theft': return 'Pencurian';
    case 'other': return 'Bahaya Lain';
    default: return 'Bahaya';
  }
}

// --- Webhook & Notification System ---
let toastTimeout = null;
function showToast(message, icon = '📡', duration = 2800, type = 'default', onClick = null) {
  const toast = document.getElementById('toastNotification');
  const msgEl = document.getElementById('toastMessage');
  const iconEl = document.getElementById('toastIcon');
  if (!toast) return;

  if (msgEl) msgEl.textContent = message;
  if (iconEl) iconEl.textContent = icon;

  // Hapus class tipe lama & pasang yang baru
  toast.classList.remove('toast-umkm-ready', 'toast-umkm-closed');
  if (type === 'ready') toast.classList.add('toast-umkm-ready');
  if (type === 'closed') toast.classList.add('toast-umkm-closed');

  // Callback interaktif (misal diklik untuk fokus ke toko)
  if (typeof onClick === 'function') {
    toast.style.cursor = 'pointer';
    toast.onclick = (e) => {
      e.stopPropagation();
      onClick(e);
      hideToast();
    };
  } else {
    toast.style.cursor = 'default';
    toast.onclick = null;
  }

  toast.classList.remove('hidden');
  toast.style.opacity = '1';

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    hideToast();
  }, duration);
}

function hideToast() {
  const toast = document.getElementById('toastNotification');
  if (!toast) return;
  toast.style.opacity = '0';
  setTimeout(() => {
    toast.classList.add('hidden');
    toast.classList.remove('toast-umkm-ready', 'toast-umkm-closed');
  }, 300);
}

// --- Live UMKM Spotlight Ticker (Auto Rotasi Highlight Toko Warga) ---
let umkmSpotlightInterval = null;
function startUmkmLiveSpotlight() {
  if (umkmSpotlightInterval) clearInterval(umkmSpotlightInterval);

  // Tunggu 5 detik setelah peta dibuka untuk memunculkan highlight pertama
  setTimeout(() => {
    showRandomUmkmSpotlight();
  }, 5000);

  // Tampilkan spotlight toko berikutnya secara otomatis setiap 40 detik
  umkmSpotlightInterval = setInterval(() => {
    if (state.showUmkm && !state.globalSirenActive && !document.hidden) {
      showRandomUmkmSpotlight();
    }
  }, 40000);
}

function showRandomUmkmSpotlight() {
  if (!state.umkmList || state.umkmList.length === 0) return;

  // Prioritaskan UMKM yang statusnya buka
  const openUmkm = state.umkmList.filter(item => {
    const rawStatus = item.status || item['stat…'] || item['stat?'] || '';
    return !String(rawStatus).toLowerCase().includes('tutup');
  });

  const pool = openUmkm.length > 0 ? openUmkm : state.umkmList;
  if (pool.length === 0) return;

  const randomIndex = Math.floor(Math.random() * pool.length);
  const item = pool[randomIndex];
  if (!item) return;

  const nama = item.nama_usaha || 'UMKM Warga';
  const promo = (item.promo || '').trim();
  const desc = (item.deskripsi_menu || '').trim();
  const textInfo = promo ? `"${promo}"` : (desc || 'Siap melayani warga');

  const message = `🏷️ Siap Kirim: ${nama} • ${textInfo} (Ketuk untuk lihat)`;

  showToast(message, '🏷️', 10000, 'ready', () => {
    // Saat diklik, arahkan kamera ke pin toko & buka modalnya
    const lat = normalizeCoord(item.lat, true);
    const lng = normalizeCoord(item.lng, false);
    if (lat !== null && lng !== null && state.map) {
      state.map.flyTo([lat, lng], 18, { duration: 1 });
    }
    openUmkmModal(item);
  });
}

function getBotIdForMarker(marker) {
  if (!marker) return '1';

  // 1. Prioritaskan ID marker default yang sudah pasti
  if (marker.id === 'm_alarm_2') return '1'; // Alarm Safir 3 -> Bot 1
  if (marker.id === 'm_alarm_1') return '2'; // Alarm Safir 2 -> Bot 2
  if (marker.id === 'm_alarm_3') return '3'; // Alarm Kalimaya Timur -> Bot 3
  if (marker.id === 'm_alarm_4') return '4'; // Alarm Kalimaya Barat -> Bot 4

  // 2. Prioritaskan pencocokan nama spesifik (Cegah Safir 3 disalahartikan sebagai Bot 3!)
  const name = (marker.name || '').toLowerCase();
  if (name.includes('safir 3')) return '1';
  if (name.includes('safir 2') || name.includes('titik 1') || name.includes('titik 2')) return '2';
  if (name.includes('kalimaya timur') || name.includes('titik 3')) return '3';
  if (name.includes('kalimaya barat') || name.includes('titik 4')) return '4';

  // 3. Jika marker memiliki botId kustom yang valid (1-4)
  if (marker.botId && /^[1-4]$/.test(String(marker.botId))) {
    return String(marker.botId);
  }

  const numMatch = name.match(/\b([1-4])\b/);
  if (numMatch) return numMatch[1];

  return '1';
}

function getMarkerWebhook(marker, action) {
  if (!marker) return null;

  // Selalu hitung botId secara dinamis & konsisten agar webhook tidak tertukar dengan data lama
  const botId = getBotIdForMarker(marker);
  if (botId) {
    return `${TELEGRAM_WORKER_URL}/?bot=${botId}&action=${action}`;
  }

  return null;
}

async function sendWebhookRequest(url, actionDesc) {
  if (!url) return;
  console.log(`[Webhook] Mengirim request (${actionDesc}):`, url);
  showToast(`Mengirim sinyal ${actionDesc}...`, '⏳');

  try {
    const res = await fetch(url, { method: 'GET', mode: 'cors' });
    let data = null;
    try {
      data = await res.json();
    } catch (_) {}

    if (res.ok) {
      if (Array.isArray(data)) {
        const rejected = data.find(item => item.status === 'rejected');
        if (rejected) {
          const reason = rejected.reason || 'Environment variables bot belum lengkap';
          console.warn(`[Webhook] Bot rejected:`, rejected);
          showToast(`Gagal: ${reason}`, '⚠️');
          return false;
        }

        const tgError = data.find(item => item.value && item.value.response && item.value.response.ok === false);
        if (tgError) {
          const desc = (tgError.value && tgError.value.response && tgError.value.response.description) || 'Gagal mengubah title Telegram';
          console.warn(`[Webhook] Telegram error:`, tgError);
          showToast(`Telegram: ${desc}`, '⚠️');
          return false;
        }
      } else if (data && data.ok === false) {
        console.warn(`[Webhook] Worker error:`, data.error);
        showToast(`Gagal: ${data.error}`, '⚠️');
        return false;
      }

      console.log(`[Webhook] Berhasil: ${actionDesc}`, data);
      showToast(`Sinyal ${actionDesc} terkirim ke Telegram`, '✅');
      return true;
    } else {
      const errDetail = (data && data.error) ? data.error : `Status HTTP ${res.status}`;
      console.warn(`[Webhook] Respon server: ${res.status}`, data);
      showToast(`Gagal: ${errDetail}`, '⚠️');
      return false;
    }
  } catch (err) {
    console.warn(`[Webhook] Fetch CORS terhambat, mencoba mode no-cors:`, err);
    try {
      await fetch(url, { method: 'GET', mode: 'no-cors' });
      showToast(`Sinyal ${actionDesc} terkirim ke Telegram`, '📡');
      return true;
    } catch (e) {
      console.error(`[Webhook] Gagal:`, e);
      showToast(`Gagal mengirim ke Telegram: ${e.message}`, '❌');
      return false;
    }
  }
}

function triggerPingTest() {
  if (!state.activeAlarmMarkerId) return;
  const marker = state.markers.find(m => m.id === state.activeAlarmMarkerId);
  if (!marker) return;

  // Cek apakah marker memiliki webhook ping (misal: Safir 3 -> title=20)
  const pingUrl = getMarkerWebhook(marker, 'ping');
  if (pingUrl) {
    sendWebhookRequest(pingUrl, `Ping ${marker.name} (title=20)`);
  }

  marker.status = 'testing';
  updateMarkerDisplay(marker.id);
  updateAlarmStatusChip(marker);
  saveMarkers();

  audioFX.playPingBeeps(() => {
    // Return to idle if not switched to emergency
    if (marker.status === 'testing') {
      marker.status = 'idle';
      updateMarkerDisplay(marker.id);
      updateAlarmStatusChip(marker);
      saveMarkers();
    }
  });
}

function triggerHazardAlarm(hazardType, hazardTitle) {
  if (!state.activeAlarmMarkerId) return;
  const marker = state.markers.find(m => m.id === state.activeAlarmMarkerId);
  if (!marker) return;

  marker.status = 'active';
  marker.activeHazard = hazardType;
  updateMarkerDisplay(marker.id);
  updateAlarmStatusChip(marker);
  saveMarkers();

  // Start continuous siren and display banner
  audioFX.startEmergencySiren();
  showEmergencyBanner(marker, hazardTitle);
}

function stopCurrentAlarm() {
  if (!state.activeAlarmMarkerId) return;
  const marker = state.markers.find(m => m.id === state.activeAlarmMarkerId);
  if (!marker) return;

  // Cek apakah marker memiliki webhook stop (misal: Safir 3 -> title=101)
  const stopUrl = getMarkerWebhook(marker, 'stop');
  if (stopUrl) {
    sendWebhookRequest(stopUrl, `Matikan Sirine ${marker.name} (title=101)`);
  }

  marker.status = 'idle';
  marker.activeHazard = null;
  updateMarkerDisplay(marker.id);
  updateAlarmStatusChip(marker);
  saveMarkers();

  checkAndStopGlobalSiren();
}

function checkAndStopGlobalSiren() {
  const anyActive = state.markers.some(m => m.type === 'alarm' && m.status === 'active');
  if (!anyActive) {
    audioFX.stopEmergencySiren();
    hideEmergencyBanner();
  }
}

function showEmergencyBanner(marker, hazardTitle) {
  const banner = document.getElementById('emergencyBanner');
  const title = document.getElementById('emergencyTitle');
  const desc = document.getElementById('emergencyDesc');

  title.textContent = `🚨 ALARM DARURAT: ${hazardTitle.toUpperCase()}`;
  desc.textContent = `Lokasi: ${marker.name} &bull; Segera lakukan tindakan darurat!`;
  banner.classList.remove('hidden');
}

function hideEmergencyBanner() {
  document.getElementById('emergencyBanner').classList.add('hidden');
}

// --- Add Marker Flow ---
function startAddMarkerMode() {
  state.isAddMode = true;
  document.getElementById('crosshairGuide').classList.remove('hidden');
  document.getElementById('map').style.cursor = 'crosshair';
}

function cancelAddMarkerMode() {
  state.isAddMode = false;
  document.getElementById('crosshairGuide').classList.add('hidden');
  document.getElementById('map').style.cursor = '';
}

function onMapClick(e) {
  if (!state.isAddMode) return;

  state.selectedLatLng = e.latlng;
  cancelAddMarkerMode();
  openAddMarkerDialog(e.latlng);
}

function openAddMarkerDialog(latlng) {
  const modal = document.getElementById('addMarkerModal');
  const latInput = document.getElementById('markerLat');
  const lngInput = document.getElementById('markerLng');
  const form = document.getElementById('addMarkerForm');
  form.reset();

  if (latlng) {
    state.selectedLatLng = latlng;
    if (latInput) latInput.value = latlng.lat;
    if (lngInput) lngInput.value = latlng.lng;
  }

  selectMarkerTypeInForm('alarm');
  modal.classList.remove('hidden');
}

function closeAddMarkerDialog() {
  document.getElementById('addMarkerModal').classList.add('hidden');
  state.selectedLatLng = null;
}

function selectMarkerTypeInForm(type) {
  const alarmCard = document.getElementById('typeCardAlarm');
  const cctvCard = document.getElementById('typeCardCctv');
  const cctvSettings = document.getElementById('cctvSettingsWrap');

  if (type === 'alarm') {
    alarmCard.classList.add('selected');
    cctvCard.classList.remove('selected');
    alarmCard.querySelector('input').checked = true;
    cctvSettings.classList.add('hidden');
  } else {
    cctvCard.classList.add('selected');
    alarmCard.classList.remove('selected');
    cctvCard.querySelector('input').checked = true;
    cctvSettings.classList.remove('hidden');
  }
}

// --- Marker List & Deletion ---
function openListModal() {
  const modal = document.getElementById('listModal');
  const listEl = document.getElementById('markerItemsList');
  listEl.innerHTML = '';

  if (state.markers.length === 0) {
    listEl.innerHTML = '<p style="text-align:center; padding: 20px; color:#94a3b8;">Belum ada marker terpasang.</p>';
  } else {
    state.markers.forEach(marker => {
      const card = document.createElement('div');
      card.className = 'marker-item-card';
      const icon = marker.type === 'alarm' ? '🚨' : '📹';
      card.innerHTML = `
        <div class="marker-item-info">
          <strong>${icon} ${marker.name}</strong>
          <span>${marker.lat.toFixed(4)}, ${marker.lng.toFixed(4)} &bull; ${marker.type.toUpperCase()}</span>
        </div>
        <button class="icon-btn" style="width:30px;height:30px;" title="Fokus Peta">&rarr;</button>
      `;
      card.onclick = () => {
        closeListModal();
        state.map.setView([marker.lat, marker.lng], 18);
        if (marker.type === 'alarm') openAlarmModal(marker.id);
      };
      listEl.appendChild(card);
    });
  }

  // Tambahkan Section UMKM Warga
  if (state.umkmList && state.umkmList.length > 0) {
    const umkmHeader = document.createElement('div');
    umkmHeader.style.cssText = 'padding: 12px 4px 6px; font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; border-top: 1px solid rgba(255,255,255,0.08); margin-top: 10px; display: flex; justify-content: space-between; align-items: center;';
    umkmHeader.innerHTML = `<span>🛍️ Direktori UMKM & Kuliner (${state.umkmList.length})</span>`;
    listEl.appendChild(umkmHeader);

    state.umkmList.forEach(item => {
      const card = document.createElement('div');
      card.className = 'marker-item-card';
      const cat = (item.kategori || '').toLowerCase();
      let emoji = '🛍️';
      if (cat.includes('kopi')) emoji = '☕';
      else if (cat.includes('laundry')) emoji = '🧺';
      else if (cat.includes('toko') || cat.includes('sembako')) emoji = '🏪';
      else if (cat.includes('kuliner')) emoji = '🍔';

      const isBuka = !String(item.status || item['stat…'] || '').toLowerCase().includes('tutup');

      card.innerHTML = `
        <div class="marker-item-info">
          <strong>${emoji} ${item.nama_usaha || 'UMKM'}</strong>
          <span>${(item.kategori || 'UMKM').toUpperCase()} &bull; ${isBuka ? '🟢 BUKA' : '🔴 TUTUP'} &bull; ${item.promo || 'Tersedia'}</span>
        </div>
        <button class="icon-btn" style="width:30px;height:30px;" title="Buka Profil">&rarr;</button>
      `;
      card.onclick = () => {
        closeListModal();
        const lat = normalizeCoord(item.lat, true) || DEFAULT_COORDS[0];
        const lng = normalizeCoord(item.lng, false) || DEFAULT_COORDS[1];
        state.map.flyTo([lat, lng], 18, { duration: 1 });
        openUmkmModal(item);
      };
      listEl.appendChild(card);
    });
  }

  modal.classList.remove('hidden');
}

function closeListModal() {
  document.getElementById('listModal').classList.add('hidden');
}

function deleteCurrentMarker(markerId) {
  if (!confirm('Yakin ingin menghapus marker ini dari peta?')) return;
  state.markers = state.markers.filter(m => m.id !== markerId);
  saveMarkers();
  renderAllMarkers();
  checkAndStopGlobalSiren();
}

function updateHeaderStats() {
  const countEl = document.getElementById('markerCountText');
  if (countEl) {
    const alarmCount = state.markers.filter(m => m.type === 'alarm').length;
    const cctvCount = state.markers.filter(m => m.type === 'cctv').length;
    countEl.textContent = `${state.markers.length} Keamanan (${alarmCount} Alarm, ${cctvCount} CCTV)`;
  }
  const umkmCountEl = document.getElementById('umkmCountText');
  if (umkmCountEl) {
    umkmCountEl.textContent = `${state.umkmList.length} UMKM`;
  }
  const badgeEl = document.getElementById('umkmBadgeCount');
  if (badgeEl) {
    badgeEl.textContent = state.umkmList.length;
  }
}

// --- Geolocation GPS Handler ---
function locateUserGPS() {
  if (!navigator.geolocation) {
    alert('Browser kamu tidak mendukung deteksi lokasi GPS.');
    return;
  }
  const btn = document.getElementById('btnGps');
  btn.style.opacity = '0.5';

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      btn.style.opacity = '1';
      const userLatLng = [pos.coords.latitude, pos.coords.longitude];
      state.map.setView(userLatLng, 17);
      L.circleMarker(userLatLng, {
        radius: 8,
        color: '#3b82f6',
        fillColor: '#60a5fa',
        fillOpacity: 0.8
      }).addTo(state.map).bindPopup('Lokasi Anda Saat Ini').openPopup();
    },
    (err) => {
      btn.style.opacity = '1';
      alert('Gagal mengambil lokasi GPS: ' + err.message);
    },
    { enableHighAccuracy: true }
  );
}

// --- Event Listeners Setup ---
function setupEventListeners() {
  // GPS, List & Logout Buttons
  document.getElementById('btnGps').addEventListener('click', locateUserGPS);
  document.getElementById('btnListMarkers').addEventListener('click', openListModal);
  document.getElementById('btnCloseListModal').addEventListener('click', closeListModal);

  const btnLogout = document.getElementById('btnLogout');
  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      if (confirm('Keluar dari sistem monitoring Klipang Green 2?')) {
        try {
          sessionStorage.removeItem('kg2_auth_token');
          sessionStorage.removeItem('kg2_auth_user');
          localStorage.removeItem('kg2_auth_token');
          localStorage.removeItem('kg2_auth_user');
        } catch (e) {}
        window.location.replace('index.html');
      }
    });
  }

  // UMKM Toggle & Modal
  const btnToggleUmkm = document.getElementById('btnToggleUmkm');
  if (btnToggleUmkm) {
    btnToggleUmkm.addEventListener('click', toggleUmkmLayer);
  }
  const btnCloseUmkm = document.getElementById('btnCloseUmkmModal');
  if (btnCloseUmkm) {
    btnCloseUmkm.addEventListener('click', closeUmkmModal);
  }
  const umkmModal = document.getElementById('umkmModal');
  if (umkmModal) {
    umkmModal.addEventListener('click', (e) => {
      if (e.target === umkmModal) closeUmkmModal();
    });
  }

  // UMKM Auto-Sync saat tab/layar HP kembali aktif
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && state.showUmkm) {
      fetchUmkmData(true);
    }
  });
  window.addEventListener('focus', () => {
    if (state.showUmkm) {
      fetchUmkmData(true);
    }
  });

  // FAB Add Marker
  document.getElementById('btnAddMarker').addEventListener('click', startAddMarkerMode);
  document.getElementById('btnCancelAddMode').addEventListener('click', cancelAddMarkerMode);

  const btnManualCoord = document.getElementById('btnManualCoord');
  if (btnManualCoord) {
    btnManualCoord.addEventListener('click', () => {
      cancelAddMarkerMode();
      const center = state.map.getCenter();
      openAddMarkerDialog({ lat: center.lat, lng: center.lng });
    });
  }

  // Add Marker Dialog
  document.getElementById('btnCloseAddModal').addEventListener('click', closeAddMarkerDialog);
  document.getElementById('btnCancelAdd').addEventListener('click', closeAddMarkerDialog);
  document.getElementById('typeCardAlarm').addEventListener('click', () => selectMarkerTypeInForm('alarm'));
  document.getElementById('typeCardCctv').addEventListener('click', () => selectMarkerTypeInForm('cctv'));

  document.getElementById('addMarkerForm').addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('markerName').value.trim();
    const type = document.querySelector('input[name="markerType"]:checked').value;
    const cctvPreset = document.getElementById('cctvChannel').value;
    const latVal = parseFloat(document.getElementById('markerLat').value);
    const lngVal = parseFloat(document.getElementById('markerLng').value);

    if (isNaN(latVal) || isNaN(lngVal)) {
      alert('Koordinat latitude atau longitude tidak valid.');
      return;
    }

    const newMarker = {
      id: 'm_' + Date.now(),
      type: type,
      name: name,
      lat: latVal,
      lng: lngVal,
      createdAt: Date.now()
    };

    if (type === 'alarm') {
      newMarker.status = 'idle';
      newMarker.activeHazard = null;
    } else {
      newMarker.preset = cctvPreset;
    }

    state.markers.push(newMarker);
    saveMarkers();
    renderAllMarkers();
    closeAddMarkerDialog();

    // Pan map to new marker
    state.map.panTo([newMarker.lat, newMarker.lng]);
  });

  // Alarm Modal Controls
  const alarmModal = document.getElementById('alarmModal');
  if (alarmModal) {
    alarmModal.addEventListener('click', (e) => {
      if (e.target === alarmModal) closeAlarmModal();
    });
  }
  document.getElementById('btnCloseAlarmModal').addEventListener('click', closeAlarmModal);
  document.getElementById('btnPingAlarm').addEventListener('click', triggerPingTest);
  document.getElementById('btnStopAlarm').addEventListener('click', () => {
    stopCurrentAlarm();
    closeAlarmModal();
  });
  document.getElementById('btnDeleteAlarmMarker').addEventListener('click', () => {
    if (state.activeAlarmMarkerId) {
      deleteCurrentMarker(state.activeAlarmMarkerId);
      closeAlarmModal();
    }
  });

  // 5 Hazard Buttons
  const hazardButtons = document.querySelectorAll('.hazard-btn');
  hazardButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const hazard = btn.dataset.hazard;
      const title = btn.dataset.title;
      triggerHazardAlarm(hazard, title);
    });
  });

  // Global Mute Banner Button
  document.getElementById('btnMuteGlobal').addEventListener('click', () => {
    state.markers.forEach(m => {
      if (m.type === 'alarm') {
        if (m.status === 'active') {
          const stopUrl = getMarkerWebhook(m, 'stop');
          if (stopUrl) {
            sendWebhookRequest(stopUrl, `Matikan Sirine ${m.name} (title=101)`);
          }
        }
        m.status = 'idle';
        m.activeHazard = null;
      }
    });
    saveMarkers();
    renderAllMarkers();
    audioFX.stopEmergencySiren();
    hideEmergencyBanner();
  });

  // CCTV Fullscreen Controls
  document.getElementById('btnCloseCctvFull').addEventListener('click', closeCctvFullscreen);
  document.getElementById('btnDeleteCctvMarker').addEventListener('click', () => {
    if (state.activeCctvMarkerId) {
      deleteCurrentMarker(state.activeCctvMarkerId);
      closeCctvFullscreen();
    }
  });
  document.getElementById('btnSnapshotCctv').addEventListener('click', () => {
    const video = document.getElementById('cctvVideoPlayer');
    const canvas = document.getElementById('cctvLiveCanvas');
    const link = document.createElement('a');
    link.download = `CCTV_SNAPSHOT_${Date.now()}.png`;

    if (video && !video.classList.contains('hidden') && video.readyState >= 2) {
      const snapCanvas = document.createElement('canvas');
      snapCanvas.width = video.videoWidth || 854;
      snapCanvas.height = video.videoHeight || 480;
      const ctx = snapCanvas.getContext('2d');
      ctx.drawImage(video, 0, 0, snapCanvas.width, snapCanvas.height);

      // OSD Watermark
      ctx.font = 'bold 16px monospace';
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 4;
      ctx.fillText(`CCTV SAFIR 2 - ${new Date().toLocaleString('id-ID')}`, 20, snapCanvas.height - 20);

      link.href = snapCanvas.toDataURL('image/png');
    } else if (canvas) {
      link.href = canvas.toDataURL('image/png');
    } else {
      return;
    }
    link.click();
  });

  // Reset to Defaults
  document.getElementById('btnResetDefaultMarkers').addEventListener('click', () => {
    if (confirm('Kembalikan marker ke contoh bawaan awal? Marker kustommu akan direset.')) {
      state.markers = JSON.parse(JSON.stringify(INITIAL_DEMO_MARKERS));
      saveMarkers();
      renderAllMarkers();
      closeListModal();
    }
  });
}

// --- DOM Ready Entry Point ---
document.addEventListener('DOMContentLoaded', () => {
  loadMarkers();
  initMap();
  setupEventListeners();
  fetchUmkmData().then(() => {
    startUmkmAutoSync();
    startUmkmLiveSpotlight();
  });
});
