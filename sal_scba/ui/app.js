const root = document.getElementById('scba-root');
const hudCard = document.getElementById('hudCard');
const pressureValue = document.getElementById('pressureValue');
const status = document.getElementById('status');
const bar = document.getElementById('bar');
const maskFlag = document.getElementById('maskFlag');
const passFlag = document.getElementById('passFlag');
const warnBanner = document.getElementById('warnBanner');
const vignette = document.getElementById('vignette');

const uiState = {
  visible: false,
  hud: false,
  maskOn: false,
  pressure: 0,
  maxPressure: 100,
  lowAirState: 'none',
  passAlarm: false,
};

const dangerStates = new Set(['low', 'verylow', 'empty']);

function syncVisibility() {
  const showRoot = uiState.visible || uiState.maskOn;
  root.classList.toggle('visible', showRoot);
  root.classList.toggle('hidden', !showRoot);
  root.setAttribute('aria-hidden', String(!showRoot));

  hudCard.classList.toggle('hidden', !(uiState.visible && uiState.hud));
  vignette.classList.toggle('active', uiState.maskOn);
}

function updateHud() {
  pressureValue.textContent = `${uiState.pressure.toFixed(1)} / ${uiState.maxPressure}`;

  const percent = Math.max(0, Math.min(100, (uiState.pressure / uiState.maxPressure) * 100));
  bar.style.width = `${percent}%`;

  if (uiState.lowAirState === 'none') {
    status.textContent = 'READY';
    bar.style.background = 'linear-gradient(90deg, #24b6ff, #6df8ff)';
  } else if (uiState.lowAirState === 'low') {
    status.textContent = 'LOW AIR';
    bar.style.background = 'linear-gradient(90deg, #f4b740, #ffe37d)';
  } else if (uiState.lowAirState === 'verylow') {
    status.textContent = 'VERY LOW';
    bar.style.background = 'linear-gradient(90deg, #ff8d57, #ff5f5f)';
  } else {
    status.textContent = 'EMPTY';
    bar.style.background = 'linear-gradient(90deg, #ff5f5f, #ff2f2f)';
  }

  status.className = `status status-${uiState.lowAirState}`;

  maskFlag.classList.toggle('active', uiState.maskOn);
  passFlag.classList.toggle('active', uiState.passAlarm);

  const warn = dangerStates.has(uiState.lowAirState);
  warnBanner.classList.toggle('hidden', !warn);
  warnBanner.classList.toggle('flash', warn);
  warnBanner.textContent = uiState.lowAirState === 'empty' ? 'OUT OF AIR' : 'LOW AIR';
}

window.addEventListener('message', (event) => {
  const data = event.data;
  if (!data || !data.type) return;

  if (data.type === 'scba:setVisible') {
    uiState.visible = !!data.visible;
    syncVisibility();
    return;
  }

  if (data.type === 'scba:setMask') {
    uiState.maskOn = !!data.on;
    syncVisibility();
    updateHud();
    return;
  }

  if (data.type === 'scba:update') {
    Object.assign(uiState, data.payload || {});
    syncVisibility();
    updateHud();
    return;
  }

  if (data.type === 'scba:reset') {
    uiState.visible = false;
    uiState.hud = false;
    uiState.maskOn = false;
    uiState.pressure = 0;
    uiState.maxPressure = 100;
    uiState.lowAirState = 'none';
    uiState.passAlarm = false;
    syncVisibility();
    updateHud();
  }
});

syncVisibility();
updateHud();
