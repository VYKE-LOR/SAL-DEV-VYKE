(() => {
  "use strict";

  const root = document.getElementById("sal-root");
  const hud = document.getElementById("sal-hud");
  const bar = document.getElementById("sal-bar");
  const statusEl = document.getElementById("sal-status");
  const pressureEl = document.getElementById("sal-pressure");
  const unitEl = document.getElementById("sal-unit");
  const warnEl = document.getElementById("sal-warn");
  const vignette = document.getElementById("sal-vignette");

  let state = {
    visible: false,
    hud: false,
    maskOn: false,
    pressure: 0,
    maxPressure: 100,
    unit: "",
    status: "",
    warn: "",
  };

  // HARD HIDE – ensures no grey overlay, ever
  function hardHide() {
    // force transparent on document
    document.documentElement.style.background = "transparent";
    document.body.style.background = "transparent";

    // hard-hide root no matter what CSS does
    root.style.setProperty("display", "none", "important");
    root.setAttribute("aria-hidden", "true");

    // also force vignette off
    vignette.classList.remove("vignette-on");
    vignette.classList.add("vignette-off");

    hud.classList.add("hidden");
    warnEl.classList.add("hidden");
  }

  // HARD SHOW – only when allowed
  function hardShow() {
    root.style.setProperty("display", "block", "important");
    root.setAttribute("aria-hidden", "false");
  }

  function apply() {
    // Root visibility gate
    if (!state.visible) {
      hardHide();
      return;
    }

    hardShow();

    // HUD gate
    if (state.hud) hud.classList.remove("hidden");
    else hud.classList.add("hidden");

    // Vignette gate
    vignette.classList.toggle("vignette-on", !!state.maskOn);
    vignette.classList.toggle("vignette-off", !state.maskOn);

    // Pressure UI
    const maxP = Math.max(1, Number(state.maxPressure) || 100);
    const p = Math.max(0, Math.min(maxP, Number(state.pressure) || 0));
    const pct = Math.max(0, Math.min(100, (p / maxP) * 100));

    bar.style.width = `${pct.toFixed(1)}%`;
    pressureEl.textContent = `${Math.round(p)}`;
    unitEl.textContent = state.unit || "";
    statusEl.textContent = state.status || "";

    if (state.warn && state.warn.length > 0) {
      warnEl.textContent = state.warn;
      warnEl.classList.remove("hidden");
    } else {
      warnEl.textContent = "";
      warnEl.classList.add("hidden");
    }
  }

  // On load: HARD HIDE instantly
  hardHide();

  // Extra failsafe for race conditions (runs briefly, then stops)
  let t = 0;
  const guard = setInterval(() => {
    t += 1;
    if (!state.visible) hardHide();
    if (t >= 15) clearInterval(guard); // ~1.5s then stop
  }, 100);

  window.addEventListener("message", (event) => {
    const d = event.data || {};
    if (!d.type) return;

    // absolute kill switch
    if (d.type === "scba:hardHide") {
      state.visible = false;
      state.hud = false;
      state.maskOn = false;
      apply();
      return;
    }

    if (d.type === "scba:visibility") {
      state.visible = !!d.visible;
      state.hud = !!d.hud;
      apply();
      return;
    }

    if (d.type === "scba:update") {
      // Only accept known fields
      if (typeof d.hud === "boolean") state.hud = d.hud;
      if (typeof d.maskOn === "boolean") state.maskOn = d.maskOn;
      if (d.pressure != null) state.pressure = d.pressure;
      if (d.maxPressure != null) state.maxPressure = d.maxPressure;
      if (d.unit != null) state.unit = String(d.unit);
      if (d.status != null) state.status = String(d.status);
      if (d.warn != null) state.warn = String(d.warn);
      apply();
      return;
    }
  });
})();
