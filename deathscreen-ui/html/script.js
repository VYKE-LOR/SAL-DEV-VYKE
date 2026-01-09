const volumeStorageKey = 'sal_loading_volume';
const loadingScreen = document.getElementById('loading-screen');
const progressFill = document.getElementById('progress-fill');
const progressGlow = document.getElementById('progress-glow');
const progressPercent = document.getElementById('progress-percent');
const volumeRange = document.getElementById('volume-range');
const volumeValue = document.getElementById('volume-value');
const volumeToggle = document.getElementById('volume-toggle');
const volumeHigh = document.getElementById('volume-high');
const volumeLow = document.getElementById('volume-low');
const volumeMute = document.getElementById('volume-mute');
const video = document.getElementById('bg-video');

let currentProgress = 0;
let targetProgress = 0;
let hasFinished = false;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const updateVolumeIcon = (volumePercent) => {
  volumeHigh.classList.remove('is-visible');
  volumeLow.classList.remove('is-visible');
  volumeMute.classList.remove('is-visible');

  if (volumePercent === 0) {
    volumeMute.classList.add('is-visible');
  } else if (volumePercent < 50) {
    volumeLow.classList.add('is-visible');
  } else {
    volumeHigh.classList.add('is-visible');
  }
};

const setVolume = (volumePercent) => {
  const clamped = clamp(volumePercent, 0, 100);
  volumeRange.value = clamped;
  volumeValue.textContent = `${Math.round(clamped)}%`;
  video.volume = clamped / 100;
  video.muted = clamped === 0;
  updateVolumeIcon(Math.round(clamped));
  localStorage.setItem(volumeStorageKey, `${clamped}`);
};

const restoreVolume = () => {
  const stored = localStorage.getItem(volumeStorageKey);
  if (stored !== null) {
    const parsed = Number.parseFloat(stored);
    if (!Number.isNaN(parsed)) {
      setVolume(parsed);
      return;
    }
  }
  setVolume(15);
};

const tryPlayAudio = () => {
  const playPromise = video.play();
  if (playPromise && typeof playPromise.catch === 'function') {
    playPromise.then(() => {
      if (Number.parseFloat(volumeRange.value) > 0) {
        video.muted = false;
      }
    }).catch(() => {
      const resumeAudio = () => {
        video.play().catch(() => {});
        if (Number.parseFloat(volumeRange.value) > 0) {
          video.muted = false;
        }
        window.removeEventListener('click', resumeAudio);
        window.removeEventListener('keydown', resumeAudio);
      };
      window.addEventListener('click', resumeAudio, { once: true });
      window.addEventListener('keydown', resumeAudio, { once: true });
    });
  }
};

const tryUnmuteWithRetries = (attempts = 2) => {
  if (Number.parseFloat(volumeRange.value) <= 0) {
    return;
  }
  video.muted = false;
  const playPromise = video.play();
  if (playPromise && typeof playPromise.catch === 'function') {
    playPromise.catch(() => {
      if (attempts <= 0) {
        return;
      }
      video.muted = true;
      setTimeout(() => tryUnmuteWithRetries(attempts - 1), 800);
    });
  }
};

const scheduleUnmuteAttempts = () => {
  tryUnmuteWithRetries(2);
};

const setupAutoplayBoost = () => {
  const tryOnInteraction = () => {
    scheduleUnmuteAttempts();
    window.removeEventListener('mousemove', tryOnInteraction);
    window.removeEventListener('touchstart', tryOnInteraction);
    window.removeEventListener('pointerdown', tryOnInteraction);
    window.removeEventListener('keydown', tryOnInteraction);
  };

  window.addEventListener('focus', scheduleUnmuteAttempts);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      scheduleUnmuteAttempts();
    }
  });

  window.addEventListener('mousemove', tryOnInteraction);
  window.addEventListener('touchstart', tryOnInteraction);
  window.addEventListener('pointerdown', tryOnInteraction);
  window.addEventListener('keydown', tryOnInteraction);
};

const animateProgress = () => {
  currentProgress += (targetProgress - currentProgress) * 0.12;
  const display = clamp(currentProgress, 0, 1);
  const percent = Math.floor(display * 100);
  const width = `${display * 100}%`;
  progressFill.style.width = width;
  progressGlow.style.width = width;
  progressPercent.textContent = `${percent}%`;
  requestAnimationFrame(animateProgress);
};

window.addEventListener('message', (event) => {
  const { eventName, loadFraction } = event.data || {};
  if (eventName === 'loadProgress') {
    const fraction = clamp(Number(loadFraction) || 0, 0, 1);
    const nextTarget = fraction >= 1 && !hasFinished ? 0.99 : fraction;
    targetProgress = Math.max(targetProgress, nextTarget);
  }

  if (eventName === 'sal:finish') {
    hasFinished = true;
    targetProgress = 1;
    loadingScreen.classList.add('is-fading');
    video.pause();
  }
});

volumeRange.addEventListener('input', (event) => {
  const value = Number.parseFloat(event.target.value);
  setVolume(value);
});

volumeToggle.addEventListener('click', () => {
  const current = Number.parseFloat(volumeRange.value);
  if (current > 0) {
    setVolume(0);
  } else {
    setVolume(15);
  }
});

restoreVolume();
tryPlayAudio();
setTimeout(() => tryUnmuteWithRetries(2), 500);
setupAutoplayBoost();
requestAnimationFrame(animateProgress);
