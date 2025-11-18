const map = L.map('map', {
  minZoom: 5,
  maxZoom: 17,
  maxBounds: [
    [44.0, 21.0],
    [53.5, 41.0]
  ],
  maxBoundsViscosity: 1.0
}).setView([49.0, 31.0], 6);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap'
}).addTo(map);

window.trafficLines = [];

async function fetchTraffic(midLat, midLng) {
  const resp = await fetch('/traffic', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ point: `${midLat},${midLng}` })
  });
  return (await resp.json()).flowSegmentData || {};
}

async function recordSample(data) {
  await fetch('/sample', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(data)
  });
}

function getRandomIndices(count, max) {
  const set = new Set();
  while (set.size < Math.min(count, max)) {
    set.add(Math.floor(Math.random() * max));
  }
  return set;
}

async function drawRouteSegments(coords, adjustedRoadwork = new Set(), adjustedAccident = new Set()) {
  for (let i = 0; i < coords.length - 1; i++) {
    const midLat = (coords[i].lat + coords[i+1].lat) / 2;
    const midLng = (coords[i].lng + coords[i+1].lng) / 2;

    let data = await fetchTraffic(midLat, midLng);

    let speed = data.currentSpeed || 0;
    let currentTT = data.currentTravelTime || 0;
    const freeFlow = data.freeFlowSpeed || 1;
    const freeFlowTT = data.freeFlowTravelTime || 1;

    if (adjustedAccident.has(i)) {
      speed = 0;
    } else if (adjustedAccident.has(i - 1) || adjustedAccident.has(i + 1)) {
      speed *= 0.6;
      currentTT *= 1.6;
    }
    if (adjustedRoadwork.has(i) || adjustedRoadwork.has(i - 1) || adjustedRoadwork.has(i - 2)) {
      speed *= 0.8;
      currentTT *= 1.5;
    }

    await recordSample({
      index: window.currentIndex,
      segment: i + 1,
      speed,
      free_flow: freeFlow,
      current_travel_time: currentTT,
      free_flow_travel_time: freeFlowTT,
      confidence: data.confidence || 0,
      has_roadwork: adjustedRoadwork.has(i) ? 1 : 0,
      has_accident: adjustedAccident.has(i) ? 1 : 0
    });

    const speedRatio = speed / freeFlow;
    const ttRatio = currentTT / freeFlowTT;

    let color = 'green';
    if (speed <= 5 || speedRatio < 0.2) color = 'red';
    else if (ttRatio >= 2.0) color = 'red';
    else if (ttRatio >= 1.5 || speedRatio < 0.4) color = 'orange';

    const line = L.polyline([coords[i], coords[i+1]], { color, weight: 5 }).addTo(map);
    line.bindPopup(`
      <strong>ttRatio:</strong> ${ttRatio.toFixed(2)}<br>
      <strong>speedRatio:</strong> ${speedRatio.toFixed(2)}<br>
      <strong>Ремонт:</strong> ${adjustedRoadwork.has(i) ? 'Так' : 'Ні'}<br>
      <strong>Аварія:</strong> ${adjustedAccident.has(i) ? 'Так' : 'Ні'}
    `);
    window.trafficLines.push(line);
  }
}

document.getElementById('train-route').addEventListener('click', async () => {
  const metaRes = await fetch('/sample', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ segment: 'meta' })
  });
  const metaData = await metaRes.json();
  window.currentIndex = metaData.index;

  const roadworkCount = parseInt(document.getElementById('roadwork_count').value) || 0;
  const accidentCount = parseInt(document.getElementById('accident_count').value) || 0;

  const adjustedRoadwork = getRandomIndices(roadworkCount, window.routeCoords.length - 1);
  const adjustedAccident = getRandomIndices(accidentCount, window.routeCoords.length - 1);

  await drawRouteSegments(window.routeCoords, adjustedRoadwork, adjustedAccident);
  alert('Тренування завершено');
});

document.getElementById('address-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (window.trafficLines) window.trafficLines.forEach(l => map.removeLayer(l));
  window.trafficLines = [];

  const origin = document.getElementById('origin_address').value;
  const destination = document.getElementById('destination_address').value;

  const metaRes = await fetch('/sample', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({segment: 'meta'})
  });
  const metaData = await metaRes.json();
  window.currentIndex = metaData.index;

  const geoRes = await fetch('/geocode', {
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    body: `origin_address=${encodeURIComponent(origin)}&destination_address=${encodeURIComponent(destination)}`
  });
  const geo = await geoRes.json();
  if (!geo.origin_lat || !geo.destination_lat) return alert('Не знайдено координати.');

  const routeControl = L.Routing.control({
    waypoints: [L.latLng(geo.origin_lat, geo.origin_lng), L.latLng(geo.destination_lat, geo.destination_lng)],
    router: L.Routing.osrmv1({ serviceUrl: 'https://router.project-osrm.org/route/v1' }),
    lineOptions: { styles: [{ color: 'gray', opacity: 0.4, weight: 6 }] },
    createMarker: (i, wp) => L.marker(wp.latLng).bindPopup(i === 0 ? 'Початок' : 'Кінець'),
    fitSelectedRoutes: true,
    addWaypoints: false
  }).addTo(map);

  routeControl.on('routesfound', async (e) => {
    window.routeCoords = e.routes[0].coordinates;
    await drawRouteSegments(window.routeCoords);
  });
});

const viewMode = document.getElementById('view-mode');
const daysDropdown = document.getElementById('days-dropdown');
const dropdownSelected = document.getElementById('dropdown-selected');
const dropdownList = document.getElementById('dropdown-list');
let selectedDays = [];
const fullModePanel = document.getElementById('full-mode-panel');
const lblRoadwork = document.getElementById('lbl-roadwork');
const roadworkCount = document.getElementById('roadwork_count');
const lblAccident = document.getElementById('lbl-accident');
const accidentCount = document.getElementById('accident_count');

async function populateDaysDropdown() {
  dropdownList.innerHTML = '';
  const resp = await fetch('/samples.csv');
  const text = await resp.text();
  const lines = text.trim().replaceAll('\r', '').split('\n').map(row => row.split(','));
  const headers = lines[0];
  const datetimeIdx = headers.indexOf('datetime');
  if (datetimeIdx === -1) return;

  const daysSet = new Set();
  for (let i = 1; i < lines.length; i++) {
    const row = lines[i];
    if (!row[datetimeIdx]) continue;
    const date = new Date(row[datetimeIdx]);
    const day = date.toLocaleDateString('en-US', { weekday: 'long' });
    daysSet.add(day);
  }
  const daysOrder = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  const foundDays = Array.from(daysSet).sort((a, b) => daysOrder.indexOf(a) - daysOrder.indexOf(b));
  const ukDays = {
    'Monday': 'Понеділок','Tuesday': 'Вівторок','Wednesday': 'Середа',
    'Thursday': 'Четвер','Friday': 'Пʼятниця','Saturday': 'Субота','Sunday': 'Неділя'
  };

  foundDays.forEach(day => {
    const opt = document.createElement('div');
    opt.className = 'dropdown-option';
    opt.dataset.value = day;
    opt.textContent = ukDays[day] || day;
    dropdownList.appendChild(opt);
  });
}
function updateDropdownUI() {
  dropdownSelected.innerHTML = '';
  if (!selectedDays.length) {
    dropdownSelected.innerHTML = '<span class="dropdown-placeholder">Обрати дні...</span><span class="dropdown-arrow">&#9662;</span>';
    return;
  }
  selectedDays.forEach(day => {
    const tag = document.createElement('span');
    tag.className = 'dropdown-tag';
    tag.textContent = ({
      'Monday': 'Понеділок','Tuesday': 'Вівторок','Wednesday': 'Середа',
      'Thursday': 'Четвер','Friday': 'Пʼятниця','Saturday': 'Субота','Sunday': 'Неділя'
    })[day] || day;
    const closeX = document.createElement('span');
    closeX.className = 'close-x';
    closeX.textContent = '×';
    closeX.onclick = (e) => {
      e.stopPropagation();
      selectedDays = selectedDays.filter(d => d !== day);
      updateDropdownUI();
      dropdownList.querySelectorAll('.dropdown-option').forEach(opt => {
        if (selectedDays.includes(opt.dataset.value)) opt.classList.add('selected');
        else opt.classList.remove('selected');
      });
    };
    tag.appendChild(closeX);
    dropdownSelected.appendChild(tag);
  });
  const arrow = document.createElement('span');
  arrow.className = 'dropdown-arrow';
  arrow.innerHTML = '&#9662;';
  dropdownSelected.appendChild(arrow);
}

dropdownSelected.addEventListener('click', () => {
  dropdownList.style.display = dropdownList.style.display === 'block' ? 'none' : 'block';
});
document.addEventListener('click', (e) => {
  if (!daysDropdown.contains(e.target)) dropdownList.style.display = 'none';
});
dropdownList.addEventListener('click', (e) => {
  if (!e.target.classList.contains('dropdown-option')) return;
  const value = e.target.dataset.value;
  if (selectedDays.includes(value)) {
    selectedDays = selectedDays.filter(d => d !== value);
  } else {
    selectedDays.push(value);
  }
  updateDropdownUI();
  dropdownList.querySelectorAll('.dropdown-option').forEach(opt => {
    if (selectedDays.includes(opt.dataset.value)) opt.classList.add('selected');
    else opt.classList.remove('selected');
  });
});

async function openDayDropdownIfNeeded() {
  await populateDaysDropdown();
  dropdownList.querySelectorAll('.dropdown-option').forEach(opt => {
    if (selectedDays.includes(opt.dataset.value)) opt.classList.add('selected');
    else opt.classList.remove('selected');
  });
}

function restoreFullModeHTML() {
  fullModePanel.innerHTML = `
    <div id="main-analytics-content">
      <div style="display: flex; justify-content: space-between; gap: 20px; margin-top: 30px; flex-wrap: wrap;">
        <div style="flex: 1 1 48%;">
          <h3 style="text-align: center;">Дані до тренування</h3>
          <table id="table-original">
            <thead>
              <tr>
                <th>Сегмент</th>
                <th>Коеф. швидкості</th>
                <th>Коеф. часу</th>
                <th>Ремонт</th>
                <th>Аварія</th>
              </tr>
            </thead>
            <tbody></tbody>
          </table>
        </div>
        <div style="flex: 1 1 48%;">
          <h3 style="text-align: center;">Дані після тренування</h3>
          <table id="table-trained">
            <thead>
              <tr>
                <th>Сегмент</th>
                <th>Коеф. швидкості</th>
                <th>Коеф. часу</th>
                <th>Ремонт</th>
                <th>Аварія</th>
              </tr>
            </thead>
            <tbody></tbody>
          </table>
        </div>
      </div>
      <div style="display: flex; justify-content: center; gap: 30px; flex-wrap: wrap; margin-top: 20px;">
        <div style="flex: 1 1 45%; text-align: center;">
          <p id="correlation-value" style="font-weight:bold; font-size:16px; margin-bottom:10px;">Коефіцієнт швидкості (впливові)</p>
          <canvas id="correlation-chart" width="700" height="450"></canvas>
        </div>
        <div style="flex: 1 1 45%; text-align: center;">
          <p id="tt-correlation-value" style="font-weight:bold; font-size:16px; margin-bottom:10px;">Коефіцієнт часу (впливові)</p>
          <canvas id="tt-correlation-chart" width="700" height="450"></canvas>
        </div>
      </div>
      <div style="display: flex; justify-content: center; gap: 30px; flex-wrap: wrap; margin-top: 20px;">
        <div style="flex: 1 1 45%; text-align: center;">
          <p id="global-correlation-value" style="font-weight:bold; font-size:16px; margin-bottom:10px;">Коефіцієнт швидкості (всі сегменти)</p>
          <canvas id="global-correlation-chart" width="700" height="450"></canvas>
        </div>
        <div style="flex: 1 1 45%; text-align: center;">
          <p id="tt-global-correlation-value" style="font-weight:bold; font-size:16px; margin-bottom:10px;">Коефіцієнт часу (всі сегменти)</p>
          <canvas id="tt-global-correlation-chart" width="700" height="450"></canvas>
        </div>
      </div>
      <div style="display: flex; flex-wrap: wrap; gap: 30px; justify-content: center; margin-top: 30px;">
        <div style="flex: 1 1 30%; min-width: 350px;">
          <h3 style="text-align: center;">Швидкість: до/після (по сегментах)</h3>
          <canvas id="compare-prediction-chart" width="400" height="350"></canvas>
        </div>
        <div style="flex: 1 1 30%; min-width: 350px;">
          <h3 style="text-align: center;">Відхилення швидкості (Δ: після – до)</h3>
          <canvas id="delta-speed-chart" width="400" height="350"></canvas>
        </div>
        <div style="flex: 1 1 30%; min-width: 350px;">
          <h3 style="text-align: center;">ТОП-5 проблемних сегментів</h3>
          <canvas id="worst-bar-chart" width="400" height="350"></canvas>
        </div>
      </div>
    </div>
  `;
}
function restoreDaysModeHTML() {
  fullModePanel.innerHTML = `
    <div class="day-analysis-panel">
      <h3 style="text-align:center; font-size:24px; font-weight:600; color:#0369a1;">
        Середні коефіцієнти швидкості та часу за обраними днями
      </h3>
      <table class="day-table" style="margin:0 auto; min-width:330px;max-width:530px;">
        <thead>
          <tr>
            <th>День</th>
            <th>Середня швидкість</th>
            <th>Середній час у дорозі</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colspan="3" style="text-align:center; color:#bbb;">
              Дані будуть відображені після вибору днів та аналізу
            </td>
          </tr>
        </tbody>
      </table>
      <div class="day-charts-row" style="display:flex; flex-wrap:wrap; gap:38px; justify-content:center; margin-top:25px;">
        <div class="day-chart-block" style="min-width:340px;">
          <h4>Середня швидкість (по днях)</h4>
          <canvas id="day-compare-speed" width="380" height="250"></canvas>
        </div>
        <div class="day-chart-block" style="min-width:340px;">
          <h4>Середній час у дорозі (по днях)</h4>
          <canvas id="day-compare-tt" width="380" height="250"></canvas>
        </div>
      </div>
      <div class="day-charts-row" style="display:flex; flex-wrap:wrap; gap:38px; justify-content:center; margin-top:38px;">
        <div class="day-chart-block" style="min-width:420px;">
          <h4>Розподіл швидкостей по днях (розмах та медіана)</h4>
          <canvas id="day-speed-box" width="480" height="350"></canvas>
        </div>
        <div class="day-chart-block" style="min-width:420px;">
          <h4>Розподіл часу у дорозі по днях (розмах та медіана)</h4>
          <canvas id="day-tt-box" width="480" height="350"></canvas>
        </div>
      </div>
    </div>
  `;
}

function renderDaysComparisonTableAndCharts(filtered, labels, avgSpeed, avgTT, dayMap) {
fullModePanel.innerHTML = `
  <div class="day-analysis-panel">
    <h3 style="text-align:center; font-size:24px; font-weight:600; color:#0369a1;">
      Середні коефіцієнти швидкості та часу за обраними днями
    </h3>
    <table class="day-table">
      <thead>
        <tr>
          <th>День</th>
          <th>Середня швидкість</th>
          <th>Середній час у дорозі</th>
        </tr>
      </thead>
      <tbody>
        ${filtered.map((d, i) =>
          `<tr>
            <td>${labels[i]}</td>
            <td>${avgSpeed[i].toFixed(3)}</td>
            <td>${avgTT[i].toFixed(3)}</td>
          </tr>`
        ).join('')}
      </tbody>
    </table>
    <div class="day-charts-row" style="display:flex; flex-wrap:wrap; gap:38px; justify-content:center; margin-top:25px;">
      <div class="day-chart-block" style="min-width:340px;">
        <h4>Середня швидкість (по днях)</h4>
        <canvas id="day-compare-speed" width="380" height="250"></canvas>
      </div>
      <div class="day-chart-block" style="min-width:340px;">
        <h4>Середній час у дорозі (по днях)</h4>
        <canvas id="day-compare-tt" width="380" height="250"></canvas>
      </div>
    </div>
    <div class="day-charts-row" style="display:flex; flex-wrap:wrap; gap:38px; justify-content:center; margin-top:38px;">
      <div class="day-chart-block" style="min-width:420px;">
        <h4>Розподіл швидкостей по днях (розмах та медіана)</h4>
        <canvas id="day-speed-box" width="480" height="350"></canvas>
      </div>
      <div class="day-chart-block" style="min-width:420px;">
        <h4>Розподіл часу у дорозі по днях (розмах та медіана)</h4>
        <canvas id="day-tt-box" width="480" height="350"></canvas>
      </div>
    </div>
  </div>
`;

window.dayCompareSpeedChart = new Chart(document.getElementById('day-compare-speed').getContext('2d'), {
  type: 'bar',
  data: {
    labels,
    datasets: [{
      label: 'Середня швидкість',
      data: avgSpeed,
      backgroundColor: '#38bdf8',
      borderRadius: 10,
      barPercentage: 0.55,
      categoryPercentage: 0.7,
    }]
  },
  options: {
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, title: { display: true, text: 'Швидкість' }, max: 1.3 }
    }
  }
});

window.dayCompareTTChart = new Chart(document.getElementById('day-compare-tt').getContext('2d'), {
  type: 'bar',
  data: {
    labels,
    datasets: [{
      label: 'Середній час у дорозі',
      data: avgTT,
      backgroundColor: '#34d399',
      borderRadius: 10,
      barPercentage: 0.55,
      categoryPercentage: 0.7,
    }]
  },
  options: {
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, title: { display: true, text: 'час у дорозі' }, max: 2 }
    }
  }
});

  let boxData = labels.map((label, i) => {
    let arr = dayMap[filtered[i]].map(e => e.speed).sort((a, b) => a - b);
    let q1 = arr[Math.floor(arr.length * 0.25)] || 0;
    let med = arr[Math.floor(arr.length * 0.5)] || 0;
    let q3 = arr[Math.floor(arr.length * 0.75)] || 0;
    let min = arr[0] || 0;
    let max = arr[arr.length - 1] || 0;
    return {min, q1, med, q3, max};
  });

  window.daySpeedBoxChart = new Chart(document.getElementById('day-speed-box').getContext('2d'), {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Мін',
          data: boxData.map(d => d.min),
          backgroundColor: 'rgba(59,130,246,0.15)'
        },
        {
          label: 'Q1',
          data: boxData.map(d => d.q1),
          backgroundColor: 'rgba(59,130,246,0.25)'
        },
        {
          label: 'Медіана',
          data: boxData.map(d => d.med),
          backgroundColor: 'rgba(59,130,246,0.65)'
        },
        {
          label: 'Q3',
          data: boxData.map(d => d.q3),
          backgroundColor: 'rgba(59,130,246,0.4)'
        },
        {
          label: 'Макс',
          data: boxData.map(d => d.max),
          backgroundColor: 'rgba(59,130,246,0.15)'
        }
      ]
    },
    options: {
      plugins: { legend: { display: true } },
      scales: {
        y: { beginAtZero: true, title: { display: true, text: 'Швидкість' }, max: 1.3 }
      }
    }
  });

  let boxTT = labels.map((label, i) => {
    let arr = dayMap[filtered[i]].map(e => e.tt).sort((a, b) => a - b);
    let q1 = arr[Math.floor(arr.length * 0.25)] || 0;
    let med = arr[Math.floor(arr.length * 0.5)] || 0;
    let q3 = arr[Math.floor(arr.length * 0.75)] || 0;
    let min = arr[0] || 0;
    let max = arr[arr.length - 1] || 0;
    return {min, q1, med, q3, max};
  });

  window.dayTTBoxChart = new Chart(document.getElementById('day-tt-box').getContext('2d'), {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Мін',
          data: boxTT.map(d => d.min),
          backgroundColor: 'rgba(52,211,153,0.15)'
        },
        {
          label: 'Q1',
          data: boxTT.map(d => d.q1),
          backgroundColor: 'rgba(52,211,153,0.25)'
        },
        {
          label: 'Медіана',
          data: boxTT.map(d => d.med),
          backgroundColor: 'rgba(52,211,153,0.6)'
        },
        {
          label: 'Q3',
          data: boxTT.map(d => d.q3),
          backgroundColor: 'rgba(52,211,153,0.35)'
        },
        {
          label: 'Макс',
          data: boxTT.map(d => d.max),
          backgroundColor: 'rgba(52,211,153,0.15)'
        }
      ]
    },
    options: {
      plugins: { legend: { display: true } },
      scales: {
        y: { beginAtZero: true, title: { display: true, text: 'Час у дорозі' }, max: 2 }
      }
    }
  });
}

function updateMode() {
  if (viewMode.value === 'full') {
    lblRoadwork.style.display = '';
    roadworkCount.style.display = '';
    lblAccident.style.display = '';
    accidentCount.style.display = '';
    daysDropdown.style.display = 'none';
    restoreFullModeHTML();
    fullModePanel.style.display = '';
  } else {
    lblRoadwork.style.display = 'none';
    roadworkCount.style.display = 'none';
    lblAccident.style.display = 'none';
    accidentCount.style.display = 'none';
    daysDropdown.style.display = '';
    fullModePanel.style.display = '';
    openDayDropdownIfNeeded();
    restoreDaysModeHTML();
  }
}
viewMode.addEventListener('change', updateMode);
updateMode();

document.getElementById('analyze-data').addEventListener('click', async () => {

  ['myChart','globalChart','ttChart','ttGlobalChart','comparePredictionChart','deltaSpeedChart','worstBarChart']
    .forEach(name => {
      if (window[name]) { window[name].destroy(); window[name] = null; }
    });

  [
    'correlation-chart','tt-correlation-chart','global-correlation-chart','tt-global-correlation-chart',
    'compare-prediction-chart','delta-speed-chart','worst-bar-chart','day-compare-speed','day-compare-tt'
  ].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      const parent = el.parentNode;
      const newCanvas = el.cloneNode();
      parent.replaceChild(newCanvas, el);
    }
  });

if (viewMode.value !== 'full') {
  fullModePanel.innerHTML = '';
  const selected = [...selectedDays];
  if (selected.length < 2) {
    fullModePanel.innerHTML = '<div style="text-align:center; color:red; font-size:18px; margin-top:30px;">Недостатньо днів для порівняння (виберіть хоча б 2 дні з даними)</div>';
    return;
  }
  const resp = await fetch('/samples.csv');
  const text = await resp.text();
  const lines = text.trim().replaceAll('\r', '').split('\n').map(row => row.split(','));
  const headers = lines[0];
  const datetimeIdx = headers.indexOf('datetime');
  const speedIdx = headers.indexOf('speed_ratio');
  const ttIdx = headers.indexOf('travel_time_ratio');
  const segmentIdx = headers.indexOf('segment');

  const dayMap = {};
  for (let i = 1; i < lines.length; i++) {
    const row = lines[i];
    if (!row[datetimeIdx] || row[segmentIdx] === 'meta') continue;
    const date = new Date(row[datetimeIdx]);
    const day = date.toLocaleDateString('en-US', { weekday: 'long' });
    if (!selected.includes(day)) continue;
    if (!dayMap[day]) dayMap[day] = [];
    if (row[speedIdx] && row[ttIdx]) {
      dayMap[day].push({
        speed: parseFloat(row[speedIdx]),
        tt: parseFloat(row[ttIdx])
      });
    }
  }
  const filtered = Object.keys(dayMap).filter(d => dayMap[d].length > 0);
  if (filtered.length < 2) {
    fullModePanel.innerHTML = '<div style="text-align:center; color:red; font-size:18px; margin-top:30px;">Недостатньо даних для порівняння (є дані менше ніж по 2 днях)</div>';
    return;
  }
  const ukrDays = {
    'Monday': 'Понеділок', 'Tuesday': 'Вівторок', 'Wednesday': 'Середа',
    'Thursday': 'Четвер', 'Friday': 'Пʼятниця', 'Saturday': 'Субота', 'Sunday': 'Неділя'
  };
  const labels = filtered.map(day => ukrDays[day] || day);
  const avgSpeed = filtered.map(day => {
    const arr = dayMap[day].map(e => e.speed);
    return arr.length ? (arr.reduce((a, b) => a + b, 0) / arr.length) : 0;
  });
  const avgTT = filtered.map(day => {
    const arr = dayMap[day].map(e => e.tt);
    return arr.length ? (arr.reduce((a, b) => a + b, 0) / arr.length) : 0;
  });
    renderDaysComparisonTableAndCharts(filtered, labels, avgSpeed, avgTT, dayMap); // стало
  return;
  }

  if (!document.getElementById('correlation-value')) restoreFullModeHTML();

  const resp = await fetch('/samples.csv');
  const text = await resp.text();
  const lines = text.trim().replaceAll('\r', '').split('\n').map(row => row.split(','));
  const headers = lines[0];
  const data = lines.slice(1).map(row => Object.fromEntries(row.map((val, i) => [headers[i], val])));

  const grouped = data.reduce((acc, row) => {
    const idx = +row.index;
    if (!acc[idx]) acc[idx] = [];
    acc[idx].push(row);
    return acc;
  }, {});

  const indices = Object.keys(grouped).map(Number).sort((a, b) => b - a);
  const lastIndex = indices[0];
  const secondLastIndex = indices.find(i => i < lastIndex);

  const currentRows = grouped[lastIndex];
  const accidentSet = new Set(currentRows.filter(d => d.has_accident === '1').map(d => +d.segment));
  const roadworkSet = new Set(currentRows.filter(d => d.has_roadwork === '1').map(d => +d.segment));

  const affectedSegments = new Set();
  for (const d of currentRows) {
    const seg = +d.segment;
    if (accidentSet.has(seg) || accidentSet.has(seg - 1) || accidentSet.has(seg + 1)) affectedSegments.add(seg);
    if (roadworkSet.has(seg) || roadworkSet.has(seg - 1) || roadworkSet.has(seg - 2)) affectedSegments.add(seg);
  }

  const trained = currentRows.filter(d => affectedSegments.has(+d.segment));
  const segments = trained.map(d => d.segment);
  const original = (grouped[secondLastIndex] || []).filter(d => segments.includes(d.segment));

function fillTable(id, rows) {
  const tbody = document.querySelector(`#${id} tbody`);
  if (!tbody) return;
  tbody.innerHTML = '';

  const unique = {};
  for (const row of rows) {
    unique[row.segment] = row;
  }

  for (const seg in unique) {
    const row = unique[seg];
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${row.segment}</td>
      <td>${(+row.speed_ratio).toFixed(2)}</td>
      <td>${(+row.travel_time_ratio).toFixed(2)}</td>
      <td>${row.has_roadwork == '1' ? 'Так' : ''}</td>
      <td>${row.has_accident == '1' ? 'Так' : ''}</td>`;
    tbody.appendChild(tr);
  }
}


  fillTable('table-original', original);
  fillTable('table-trained', trained);

  const mean = arr => arr.reduce((sum, val) => sum + val, 0) / arr.length;
  const std = arr => Math.sqrt(arr.reduce((sum, val) => sum + (val - mean(arr)) ** 2, 0) / arr.length);
  const covariance = (a, b) => mean(a.map((val, i) => (val - mean(a)) * (b[i] - mean(b))));
  const correlation = (a, b) => covariance(a, b) / (std(a) * std(b));

  const merged = trained.map(t => {
    const match = original.find(o => o.segment === t.segment);
    return match ? {
      segment: t.segment,
      before: +match.speed_ratio,
      after: +t.speed_ratio
    } : null;
  }).filter(Boolean);

  const x = merged.map(p => p.before);
  const y = merged.map(p => p.after);
  const a = covariance(x, y) / (std(x) ** 2);
  const b = mean(y) - a * mean(x);
  const regLine = [{ x: Math.min(...x), y: a * Math.min(...x) + b }, { x: Math.max(...x), y: a * Math.max(...x) + b }];
  const corr = correlation(x, y).toFixed(4);
  const corrEl = document.getElementById('correlation-value');
  if (corrEl) corrEl.textContent = `Коефіцієнт кореляції (впливові сегменти): ${corr}`;

  window.myChart = new Chart(document.getElementById('correlation-chart').getContext('2d'), {
    type: 'scatter',
    data: {
      datasets: [
        {
          label: 'Швидкість: до / після (впливові)',
          data: merged.map(p => ({ x: p.before, y: p.after })),
          backgroundColor: 'rgba(54, 162, 235, 0.7)',
          pointRadius: 5
        },
        {
          label: 'Лінійна регресія',
          type: 'line',
          data: regLine,
          borderColor: 'rgba(255, 99, 132, 1)',
          backgroundColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 2,
          pointRadius: 0,
          fill: false
        }
      ]
    },
    options: {
      plugins: { legend: { display: true }, title: { display: true, text: 'Впливові: Швидкість' } },
      scales: {
        x: { title: { display: true, text: 'До (Швидкість)' } },
        y: { title: { display: true, text: 'Після (Швидкість)' } }
      }
    }
  });

  const allPrev = grouped[secondLastIndex] || [];
  const allCurr = grouped[lastIndex] || [];
  const fullMerged = allCurr.map(curr => {
    const match = allPrev.find(p => p.segment === curr.segment);
    return match ? {
      before: +match.speed_ratio,
      after: +curr.speed_ratio
    } : null;
  }).filter(Boolean);
  const gx = fullMerged.map(p => p.before);
  const gy = fullMerged.map(p => p.after);
  const ga = covariance(gx, gy) / (std(gx) ** 2);
  const gb = mean(gy) - ga * mean(gx);
  const gRegLine = [{ x: Math.min(...gx), y: ga * Math.min(...gx) + gb }, { x: Math.max(...gx), y: ga * Math.max(...gx) + gb }];
  const gCorrValue = correlation(gx, gy).toFixed(4);
  const gCorrEl = document.getElementById('global-correlation-value');
  if (gCorrEl) gCorrEl.textContent = `Глобальний коефіцієнт кореляції (усі сегменти): ${gCorrValue}`;

  window.globalChart = new Chart(document.getElementById('global-correlation-chart').getContext('2d'), {
    type: 'scatter',
    data: {
      datasets: [
        {
          label: 'Усі сегменти: Швидкість до / після',
          data: fullMerged.map(p => ({ x: p.before, y: p.after })),
          backgroundColor: 'rgba(54, 162, 235, 0.7)',
          pointRadius: 4
        },
        {
          label: 'Лінійна регресія',
          type: 'line',
          data: gRegLine,
          borderColor: 'rgba(255, 99, 132, 1)',
          backgroundColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 2,
          pointRadius: 0,
          fill: false
        }
      ]
    },
    options: {
      plugins: { legend: { display: true }, title: { display: true, text: 'Глобальна: Швидкість' } },
      scales: {
        x: { title: { display: true, text: 'До (Швидкість)' } },
        y: { title: { display: true, text: 'Після (Швидкість)' } }
      }
    }
  });

  const ttMerged = trained.map(t => {
    const match = original.find(o => o.segment === t.segment);
    return match ? {
      before: +match.travel_time_ratio,
      after: +t.travel_time_ratio
    } : null;
  }).filter(Boolean);

  const tx = ttMerged.map(p => p.before);
  const ty = ttMerged.map(p => p.after);
  const ta = covariance(tx, ty) / (std(tx) ** 2);
  const tb = mean(ty) - ta * mean(tx);
  const ttLine = [{ x: Math.min(...tx), y: ta * Math.min(...tx) + tb }, { x: Math.max(...tx), y: ta * Math.max(...tx) + tb }];

  window.ttChart = new Chart(document.getElementById('tt-correlation-chart').getContext('2d'), {
    type: 'scatter',
    data: {
      datasets: [
        {
          label: 'Час у дорозі: до / після (впливові)',
          data: ttMerged.map(p => ({ x: p.before, y: p.after })),
          backgroundColor: 'rgba(54, 162, 235, 0.7)',
          pointRadius: 5
        },
        {
          label: 'Лінійна регресія',
          type: 'line',
          data: ttLine,
          borderColor: 'rgba(255, 99, 132, 1)',
          backgroundColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 2,
          pointRadius: 0,
          fill: false
        }
      ]
    },
    options: {
      plugins: { legend: { display: true }, title: { display: true, text: 'Впливові: Час у дорозі' } },
      scales: {
        x: { title: { display: true, text: 'До (Час у дорозі)' } },
        y: { title: { display: true, text: 'Після (Час у дорозі)' } }
      }
    }
  });
  const ttCorr = correlation(tx, ty).toFixed(4);
  const ttCorrEl = document.getElementById('tt-correlation-value');
  if (ttCorrEl) ttCorrEl.textContent = `Коефіцієнт кореляції (впливові сегменти): ${ttCorr}`;

  const ttFull = allCurr.map(curr => {
    const match = allPrev.find(p => p.segment === curr.segment);
    return match ? {
      before: +match.travel_time_ratio,
      after: +curr.travel_time_ratio
    } : null;
  }).filter(Boolean);

  const tgx = ttFull.map(p => p.before);
  const tgy = ttFull.map(p => p.after);
  const tga = covariance(tgx, tgy) / (std(tgx) ** 2);
  const tgb = mean(tgy) - tga * mean(tgx);
  const ttgLine = [{ x: Math.min(...tgx), y: tga * Math.min(...tgx) + tgb }, { x: Math.max(...tgx), y: tga * Math.max(...tgx) + tgb }];

  window.ttGlobalChart = new Chart(document.getElementById('tt-global-correlation-chart').getContext('2d'), {
    type: 'scatter',
    data: {
      datasets: [
        {
          label: 'Усі сегменти: Час у дорозі до / після',
          data: ttFull.map(p => ({ x: p.before, y: p.after })),
          backgroundColor: 'rgba(54, 162, 235, 0.7)',
          pointRadius: 4
        },
        {
          label: 'Лінійна регресія',
          type: 'line',
          data: ttgLine,
          borderColor: 'rgba(255, 99, 132, 1)',
          backgroundColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 2,
          pointRadius: 0,
          fill: false
        }
      ]
    },
    options: {
      plugins: { legend: { display: true }, title: { display: true, text: 'Глобальна: Час у дорозі' } },
      scales: {
        x: { title: { display: true, text: 'До (Час у дорозі)' } },
        y: { title: { display: true, text: 'Після (Час у дорозі)' } }
      }
    }
  });
  const ttgCorr = correlation(tgx, tgy).toFixed(4);
  const ttgCorrEl = document.getElementById('tt-global-correlation-value');
  if (ttgCorrEl) ttgCorrEl.textContent = `Глобальний коефіцієнт кореляції (усі сегменти): ${ttgCorr}`;

  drawComparePredictionChart(original, trained);
  drawDeltaSpeedChart(original, trained);
  drawWorstSegmentsBar(trained);
});

function drawComparePredictionChart(original, trained) {
  if (window.comparePredictionChart) { window.comparePredictionChart.destroy(); window.comparePredictionChart = null; }

  const origMap = {};
  original.forEach(r => { origMap[r.segment] = +r.speed_ratio; });
  const trainedMap = {};
  trained.forEach(r => { trainedMap[r.segment] = +r.speed_ratio; });

  const allSegments = [...new Set([
    ...Object.keys(origMap),
    ...Object.keys(trainedMap)
  ])].filter(seg => origMap[seg] !== undefined && trainedMap[seg] !== undefined);

  const labels = allSegments.map(seg => `Сегмент ${seg}`);
  const yBefore = allSegments.map(seg => origMap[seg]);
  const yAfter = allSegments.map(seg => trainedMap[seg]);

  window.comparePredictionChart = new Chart(document.getElementById('compare-prediction-chart').getContext('2d'), {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Не прогнозовані (до)',
          data: yBefore,
          borderColor: '#6366f1',
          backgroundColor: '#6366f133',
          tension: 0.2,
          pointRadius: 3,
          borderWidth: 4
        },
        {
          label: 'Прогнозовані (після тренування)',
          data: yAfter,
          borderColor: '#16a34a',
          backgroundColor: '#16a34a33',
          tension: 0.2,
          pointRadius: 3,
          borderWidth: 4
        }
      ]
    },
    options: {
      plugins: { legend: { display: true }, title: { display: true, text: 'Швидкість: до/після (по сегментах)' } },
      scales: {
        x: { title: { display: true, text: 'Сегмент' }},
        y: { title: { display: true, text: 'Швидкість' }, min: 0, max: 1.2 }
      }
    }
  });
}


function drawDeltaSpeedChart(original, trained) {
  if (window.deltaSpeedChart) { window.deltaSpeedChart.destroy(); window.deltaSpeedChart = null; }

  const origMap = {};
  original.forEach(r => { origMap[r.segment] = +r.speed_ratio; });
  const trainedMap = {};
  trained.forEach(r => { trainedMap[r.segment] = +r.speed_ratio; });

  const segments = [...new Set(
    Object.keys(origMap).filter(seg => trainedMap[seg] !== undefined)
  )];

  const delta = segments.map(seg => trainedMap[seg] - origMap[seg]);
  const labels = segments.map(seg => `Сегмент ${seg}`);

  window.deltaSpeedChart = new Chart(document.getElementById('delta-speed-chart').getContext('2d'), {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Δ Швидкість',
        data: delta,
        backgroundColor: delta.map(v => v >= 0 ? '#22c55e' : '#ef4444')
      }]
    },
    options: {
      plugins: { legend: { display: false } },
      scales: {
        x: { title: { display: true, text: 'Сегмент' }},
        y: { title: { display: true, text: 'Відхилення (Δ)' } }
      }
    }
  });
}



function drawWorstSegmentsBar(trained) {
  if (window.worstBarChart) { window.worstBarChart.destroy(); window.worstBarChart = null; }
  const uniqueMap = {};
  trained.forEach(row => { uniqueMap[row.segment] = row; });

  const uniqueRows = Object.values(uniqueMap);

  const sorted = [...uniqueRows]
    .sort((a, b) => (+b.travel_time_ratio) - (+a.travel_time_ratio))
    .slice(0, 5);

  window.worstBarChart = new Chart(document.getElementById('worst-bar-chart').getContext('2d'), {
    type: 'bar',
    data: {
      labels: sorted.map(row => `Сегмент ${row.segment}`),
      datasets: [{
        label: 'travel_time_ratio',
        data: sorted.map(row => +row.travel_time_ratio),
        backgroundColor: '#e11d48'
      }]
    },
    options: {
      plugins: {
        legend: { display: false },
        title: { display: false }
      },
      scales: {
        x: { title: { display: true, text: 'Сегмент' }},
        y: { title: { display: true, text: 'Час у дорозі' }, min: 0 }
      }
    }
  });
}

