const root = document.getElementById('root');
const pressureValue = document.getElementById('pressureValue');
const status = document.getElementById('status');
const bar = document.getElementById('bar');
const maskFlag = document.getElementById('maskFlag');
const passFlag = document.getElementById('passFlag');
const warnBanner = document.getElementById('warnBanner');
const vignette = document.getElementById('vignette');

const uiState = {
  visible: false,
  pressure: 0,
  maxPressure: 100,
  lowAirState: 'none',
  maskOn: false,
  passAlarm: false,
};

const dangerStates = new Set(['low', 'verylow', 'empty']);

function updateView() {
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

  vignette.classList.toggle('active', uiState.maskOn);
}

window.addEventListener('message', (event) => {
  const data = event.data;
  if (!data || !data.action) return;

  if (data.action === 'setVisible') {
    uiState.visible = !!data.visible;
    root.classList.toggle('hidden', !uiState.visible);
    return;
  }

  if (data.action === 'update') {
    Object.assign(uiState, data.payload || {});
    updateView();
    return;
  }

  if (data.action === 'reset') {
    uiState.visible = false;
    uiState.pressure = 0;
    uiState.lowAirState = 'none';
    uiState.maskOn = false;
    uiState.passAlarm = false;
    root.classList.add('hidden');
    updateView();
  }
});

updateView();
