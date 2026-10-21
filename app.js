/**
 * Smart Perumahan - Map Monitor Client App
 * Pure Vanilla JavaScript (Compatible with Cloudflare Pages / GitHub Pages)
 */

// --- Default Configuration & State ---
const DEFAULT_COORDS = [-6.2088, 106.8456]; // Jakarta / Perumahan Center Sample
const DEFAULT_ZOOM = 16;
const STORAGE_KEY = 'perumahan_map_markers_v1';

// Initial Demo Markers if user has fresh local storage
const INITIAL_DEMO_MARKERS = [
  {
    id: 'm_alarm_pos_utama',
    type: 'alarm',
    name: 'Pos Satpam Gerbang Utama',
    lat: -6.2085,
    lng: 106.8445,
    status: 'idle', // 'idle' | 'testing' | 'active'
    activeHazard: null,
    createdAt: Date.now()
  },
  {
    id: 'm_cctv_gerbang',
    type: 'cctv',
    name: 'CCTV Gerbang Masuk & Keluar',
    lat: -6.2082,
    lng: 106.8447,
    preset: 'gate',
    createdAt: Date.now()
  },
  {
    id: 'm_alarm_taman',
    type: 'alarm',
    name: 'Alarm Darurat Blok B & Taman',
    lat: -6.2094,
    lng: 106.8465,
    status: 'idle',
    activeHazard: null,
    createdAt: Date.now()
  },
  {
    id: 'm_cctv_lapangan',
    type: 'cctv',
    name: 'CCTV Pertigaan Lapangan Warga',
    lat: -6.2091,
    lng: 106.8472,
    preset: 'street',
    createdAt: Date.now()
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
  previewCanvasInterval: null
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
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      state.markers = JSON.parse(raw);
    } else {
      state.markers = [...INITIAL_DEMO_MARKERS];
      saveMarkers();
    }
  } catch (e) {
    state.markers = [...INITIAL_DEMO_MARKERS];
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

  // Render initial markers
  renderAllMarkers();
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
    }

    state.leafletMarkers.set(marker.id, leafletMarker);
  });

  updateHeaderStats();
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
  return `
    <div class="cctv-preview-card" onclick="openCctvFullscreen('${marker.id}')">
      <div class="cctv-preview-thumb-wrap">
        <canvas class="cctv-preview-canvas" id="popup_canvas_${marker.id}" width="200" height="105"></canvas>
        <span class="cctv-badge-live">● LIVE</span>
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

function setupCctvMiniCanvas(marker) {
  setTimeout(() => {
    const canvas = document.getElementById(`popup_canvas_${marker.id}`);
    if (canvas) {
      drawSimulatedCameraFrame(canvas, marker, false);
      clearInterval(state.previewCanvasInterval);
      state.previewCanvasInterval = setInterval(() => {
        const c = document.getElementById(`popup_canvas_${marker.id}`);
        if (c) drawSimulatedCameraFrame(c, marker, false);
        else clearInterval(state.previewCanvasInterval);
      }, 500);
    }
  }, 50);
}

// --- CCTV Fullscreen Modal Controls ---
window.openCctvFullscreen = function(markerId) {
  const marker = state.markers.find(m => m.id === markerId);
  if (!marker) return;

  state.activeCctvMarkerId = markerId;
  const modal = document.getElementById('cctvFullModal');
  const title = document.getElementById('cctvFullTitle');
  const osdCamId = document.getElementById('osdCamId');
  const osdLocation = document.getElementById('osdLocation');
  const canvas = document.getElementById('cctvLiveCanvas');

  title.textContent = marker.name;
  osdCamId.textContent = `CAM-${marker.id.slice(-4).toUpperCase()}`;
  osdLocation.textContent = marker.name.toUpperCase();

  modal.classList.remove('hidden');

  // Start smooth 30fps animation loop on the canvas
  function renderLoop() {
    drawSimulatedCameraFrame(canvas, marker, true);
    // Update live clock
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
    statusEl.className = 'status-chip active';
    statusEl.textContent = `🚨 ALARM AKTIF: ${getHazardLabel(marker.activeHazard).toUpperCase()}`;
  } else if (marker.status === 'testing') {
    statusEl.className = 'status-chip testing';
    statusEl.textContent = '⚠️ STATUS: SEDANG PING / TEST';
  } else {
    statusEl.className = 'status-chip normal';
    statusEl.textContent = '✓ Status: Standby (Normal)';
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

function triggerPingTest() {
  if (!state.activeAlarmMarkerId) return;
  const marker = state.markers.find(m => m.id === state.activeAlarmMarkerId);
  if (!marker) return;

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
  const coordsDisplay = document.getElementById('displaySelectedCoords');
  const form = document.getElementById('addMarkerForm');
  form.reset();

  coordsDisplay.textContent = `${latlng.lat.toFixed(5)}, ${latlng.lng.toFixed(5)}`;
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
    countEl.textContent = `${state.markers.length} Marker (${alarmCount} Alarm, ${cctvCount} CCTV)`;
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
  // GPS & List Buttons
  document.getElementById('btnGps').addEventListener('click', locateUserGPS);
  document.getElementById('btnListMarkers').addEventListener('click', openListModal);
  document.getElementById('btnCloseListModal').addEventListener('click', closeListModal);

  // FAB Add Marker
  document.getElementById('btnAddMarker').addEventListener('click', startAddMarkerMode);
  document.getElementById('btnCancelAddMode').addEventListener('click', cancelAddMarkerMode);

  // Add Marker Dialog
  document.getElementById('btnCloseAddModal').addEventListener('click', closeAddMarkerDialog);
  document.getElementById('btnCancelAdd').addEventListener('click', closeAddMarkerDialog);
  document.getElementById('typeCardAlarm').addEventListener('click', () => selectMarkerTypeInForm('alarm'));
  document.getElementById('typeCardCctv').addEventListener('click', () => selectMarkerTypeInForm('cctv'));

  document.getElementById('addMarkerForm').addEventListener('submit', (e) => {
    e.preventDefault();
    if (!state.selectedLatLng) return;

    const name = document.getElementById('markerName').value.trim();
    const type = document.querySelector('input[name="markerType"]:checked').value;
    const cctvPreset = document.getElementById('cctvChannel').value;

    const newMarker = {
      id: 'm_' + Date.now(),
      type: type,
      name: name,
      lat: state.selectedLatLng.lat,
      lng: state.selectedLatLng.lng,
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
    const canvas = document.getElementById('cctvLiveCanvas');
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `CCTV_SNAPSHOT_${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  });

  // Reset to Defaults
  document.getElementById('btnResetDefaultMarkers').addEventListener('click', () => {
    if (confirm('Kembalikan marker ke contoh bawaan awal? Marker kustommu akan direset.')) {
      state.markers = [...INITIAL_DEMO_MARKERS];
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
});
