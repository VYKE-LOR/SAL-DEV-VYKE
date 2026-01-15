const state = {
    activeAlerts: [],
    historyAlerts: [],
    scenarios: [],
    areas: [],
    selected: null,
    canSend: false,
    showSendSheet: false,
    sending: false,
    lastError: null
};

const activeList = document.getElementById('active-list');
const activeEmpty = document.getElementById('active-empty');
const historyList = document.getElementById('history-list');
const historyEmpty = document.getElementById('history-empty');
const statusEl = document.getElementById('status');
const statusChip = document.getElementById('status-chip');
const detailsTitle = document.getElementById('details-title');
const detailsMeta = document.getElementById('details-meta');
const detailsMessage = document.getElementById('details-message');
const formStatus = document.getElementById('form-status');
const govPanel = document.getElementById('gov-panel');
const emergencyButton = document.getElementById('emergency-button');
const sendSheet = document.getElementById('send-sheet');
const sheetClose = document.getElementById('sheet-close');
const scenarioSelect = document.getElementById('scenario-select');
const areaSelect = document.getElementById('alert-area');
const durationSelect = document.getElementById('alert-duration');
const untilInput = document.getElementById('alert-until');
const autoClearToggle = document.getElementById('alert-auto-clear');
const titleInput = document.getElementById('alert-title');
const messageInput = document.getElementById('alert-message');
const previewText = document.getElementById('preview-text');
const sendButton = document.getElementById('send-alert');
const sirenToggle = document.getElementById('alert-sirens');
const detailOverlay = document.getElementById('detail-overlay');
const detailClose = document.getElementById('detail-close');
const audioElement = document.getElementById('alert-audio');
const uiError = document.getElementById('ui-error');

if (statusEl) {
    statusEl.textContent = 'Lade Alerts...';
}

const RESOURCE = 'sal_public_alerts';
const postNui = (endpoint, data = {}) =>
    fetch(`https://${RESOURCE}/${endpoint}`,
        { method: 'POST', headers: { 'Content-Type': 'application/json; charset=UTF-8' }, body: JSON.stringify(data) });

const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const time = date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    const dayLabel = isToday ? 'Heute' : date.toLocaleDateString('de-DE');
    return `${time} • ${dayLabel}`;
};

const severityClass = (severity) => {
    const value = (severity || '').toLowerCase();
    if (value === 'critical') return 'critical';
    if (value === 'warning') return 'warning';
    if (value === 'test') return 'test';
    return 'info';
};

const resetForm = () => {
    if (titleInput) titleInput.value = '';
    if (messageInput) messageInput.value = '';
    if (sirenToggle) sirenToggle.checked = false;
    if (durationSelect) durationSelect.value = '';
    if (untilInput) untilInput.value = '';
    if (autoClearToggle) autoClearToggle.checked = false;
    if (scenarioSelect) scenarioSelect.selectedIndex = 0;
    if (areaSelect) areaSelect.selectedIndex = 0;
    buildPreview();
};

const formatExpiry = (timestamp) => {
    if (!timestamp) {
        return 'Ohne Ablauf';
    }
    return `Läuft bis ${formatTime(timestamp)}`;
};

const makeCard = (alert, options = {}) => {
    const card = document.createElement('div');
    card.className = `alert-card ${severityClass(alert.severity)}`;
    const actions = options.showClear
        ? `<div class="alert-actions"><button class="clear-button" type="button" data-action="clear" data-alert-id="${alert.id}">Alarm aufheben</button></div>`
        : '';
    card.innerHTML = `
        <div class="title">${alert.title}</div>
        <div class="meta">
            <span class="badge ${severityClass(alert.severity)}">${alert.severity}</span>
            <span>${formatTime(alert.created_at)}</span>
        </div>
        <div class="muted">${alert.message.slice(0, 90)}${alert.message.length > 90 ? '…' : ''}</div>
        ${options.showExpires ? `<div class="muted">${formatExpiry(alert.expires_at)}</div>` : ''}
        ${actions}
    `;
    card.addEventListener('click', (event) => {
        if (event.target && event.target.dataset && event.target.dataset.action === 'clear') {
            return;
        }
        showDetails(alert);
    });
    return card;
};

const renderFeed = () => {
    if (!activeList || !historyList || !statusEl) {
        return;
    }

    activeList.innerHTML = '';
    historyList.innerHTML = '';
    statusEl.textContent = '';

    if (state.activeAlerts.length === 0) {
        activeEmpty.classList.remove('hidden');
    } else {
        activeEmpty.classList.add('hidden');
    }

    if (state.historyAlerts.length === 0) {
        historyEmpty.classList.remove('hidden');
    } else {
        historyEmpty.classList.add('hidden');
    }

    state.activeAlerts.forEach(alert =>
        activeList.appendChild(makeCard(alert, { showClear: state.canSend, showExpires: true }))
    );
    state.historyAlerts.forEach(alert =>
        historyList.appendChild(makeCard(alert, { showExpires: false }))
    );

    updateStatusChip(state.activeAlerts.length > 0);
};

const showDetails = (alert) => {
    state.selected = alert;
    detailsTitle.textContent = alert.title;
    detailsMeta.textContent = `${alert.severity} • ${formatTime(alert.created_at)}`;
    detailsMessage.textContent = alert.message;
    detailOverlay.classList.remove('hidden');
};

const updateStatusChip = (hasAlerts) => {
    if (!statusChip) {
        return;
    }
    if (hasAlerts) {
        statusChip.textContent = 'LIVE';
        statusChip.classList.add('live');
    } else {
        statusChip.textContent = 'OK';
        statusChip.classList.remove('live');
    }
};

const updatePermissions = (canSend) => {
    state.canSend = canSend;
    if (govPanel) {
        govPanel.classList.toggle('hidden', !canSend);
    }
    renderFeed();
};

const handleSendResult = (success, reason) => {
    if (success) {
        formStatus.textContent = 'Alarm gesendet.';
        resetForm();
        state.showSendSheet = false;
        renderUIState();
        return;
    }

    if (reason) {
        formStatus.textContent = reason;
    } else {
        formStatus.textContent = 'Fehler beim Senden.';
    }
    state.lastError = formStatus.textContent;
    renderUIState();
};

const playSound = (data) => {
    if (!data || !data.url) {
        return;
    }

    audioElement.src = data.url;
    audioElement.volume = data.volume ?? 0.8;
    audioElement.currentTime = 0;
    audioElement.play().catch(() => {});
};

const buildPreview = () => {
    if (!previewText || state.scenarios.length === 0) {
        return;
    }
    const scenarioId = scenarioSelect.value;
    const scenario = state.scenarios.find(item => item.id === scenarioId);
    if (!scenario) {
        previewText.textContent = 'Kein Szenario ausgewählt.';
        return;
    }

    const selectedOption = areaSelect.options[areaSelect.selectedIndex];
    const areaLabel = (selectedOption && selectedOption.text) || 'San Andreas';
    const title = titleInput.value.trim() || scenario.defaultTitle;
    const customText = messageInput.value.trim();
    const instructions = scenario.defaultInstructions || '';

    if (customText) {
        previewText.textContent = `${title} – ${customText}`;
        return;
    }

    const template = scenario.template || '';
    previewText.textContent = template
        .replace('{AREA}', areaLabel)
        .replace('{INSTRUCTIONS}', instructions);
};

const getExpiryPayload = () => {
    const durationMinutes = durationSelect && durationSelect.value ? Number(durationSelect.value) : null;
    if (durationMinutes && !Number.isNaN(durationMinutes)) {
        return { durationMinutes, expiresAt: null };
    }

    if (untilInput && untilInput.value) {
        const [hours, minutes] = untilInput.value.split(':').map(Number);
        if (!Number.isNaN(hours) && !Number.isNaN(minutes)) {
            const now = new Date();
            const expires = new Date(now);
            expires.setHours(hours, minutes, 0, 0);
            if (expires.getTime() <= now.getTime()) {
                expires.setDate(expires.getDate() + 1);
            }
            return { durationMinutes: null, expiresAt: expires.getTime() };
        }
    }

    return { durationMinutes: null, expiresAt: null };
};

const renderScenarioOptions = () => {
    if (!scenarioSelect) {
        return;
    }
    scenarioSelect.innerHTML = '';
    state.scenarios.forEach((scenario) => {
        const option = document.createElement('option');
        option.value = scenario.id;
        option.textContent = `${scenario.label} (${scenario.severity})`;
        scenarioSelect.appendChild(option);
    });
    buildPreview();
};

const renderAreaOptions = () => {
    if (!areaSelect) {
        return;
    }
    areaSelect.innerHTML = '';
    const areas = state.areas.length > 0 ? state.areas : [{ key: 'statewide', label: 'San Andreas (Statewide)' }];
    areas.forEach((area) => {
        const option = document.createElement('option');
        option.value = area.key || area;
        option.textContent = area.label || area;
        areaSelect.appendChild(option);
    });
    buildPreview();
};

const renderUIState = () => {
    if (sendSheet) {
        sendSheet.classList.toggle('hidden', !state.showSendSheet);
    }
    if (sendButton) {
        sendButton.disabled = state.sending;
        sendButton.textContent = state.sending ? 'Sende…' : 'ALARM SENDEN';
    }
    if (state.lastError && formStatus) {
        formStatus.textContent = state.lastError;
    }
};

const sendAlertRequest = () => {
    state.sending = true;
    state.lastError = null;
    renderUIState();

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const expiryPayload = getExpiryPayload();

    fetch(`https://${RESOURCE}/sendAlert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=UTF-8' },
        body: JSON.stringify({
            scenarioId: scenarioSelect.value,
            areaKey: areaSelect.value,
            title: titleInput.value.trim(),
            customText: messageInput.value.trim(),
            enableSirens: sirenToggle ? sirenToggle.checked : false,
            durationMinutes: expiryPayload.durationMinutes,
            expiresAt: expiryPayload.expiresAt,
            autoClear: autoClearToggle ? autoClearToggle.checked : false
        }),
        signal: controller.signal
    })
        .then((res) => res.json())
        .then((data) => {
            if (!data || data.ok === false) {
                state.lastError = data && data.error ? data.error : 'Senden fehlgeschlagen.';
            }
        })
        .catch((err) => {
            state.lastError = err.name === 'AbortError' ? 'Timeout beim Senden.' : 'Senden fehlgeschlagen.';
        })
        .finally(() => {
            clearTimeout(timeout);
            state.sending = false;
            renderUIState();
        });
};

const sendClearRequest = (alertId) => {
    state.sending = true;
    state.lastError = null;
    renderUIState();

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    fetch(`https://${RESOURCE}/clearAlert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=UTF-8' },
        body: JSON.stringify({ alertId }),
        signal: controller.signal
    })
        .then((res) => res.json())
        .then((data) => {
            if (!data || data.ok === false) {
                state.lastError = data && data.error ? data.error : 'Entwarnung fehlgeschlagen.';
            }
        })
        .catch((err) => {
            state.lastError = err.name === 'AbortError' ? 'Timeout beim Aufheben.' : 'Entwarnung fehlgeschlagen.';
        })
        .finally(() => {
            clearTimeout(timeout);
            state.sending = false;
            renderUIState();
        });
};

document.addEventListener('DOMContentLoaded', () => {
    if (emergencyButton) {
        emergencyButton.addEventListener('click', () => {
            state.showSendSheet = true;
            state.lastError = null;
            renderUIState();
        });
    }

    if (sheetClose) {
        sheetClose.addEventListener('click', () => {
            state.showSendSheet = false;
            renderUIState();
        });
    }

    if (detailClose) {
        detailClose.addEventListener('click', () => detailOverlay.classList.add('hidden'));
    }

    if (detailOverlay) {
        detailOverlay.addEventListener('click', (event) => {
            if (event.target === detailOverlay) {
                detailOverlay.classList.add('hidden');
            }
        });
    }

    if (scenarioSelect) {
        scenarioSelect.addEventListener('change', buildPreview);
    }
    if (areaSelect) {
        areaSelect.addEventListener('change', buildPreview);
    }
    if (titleInput) {
        titleInput.addEventListener('input', buildPreview);
    }
    if (messageInput) {
        messageInput.addEventListener('input', buildPreview);
    }

    if (durationSelect) {
        durationSelect.addEventListener('change', () => {
            if (durationSelect.value && untilInput) {
                untilInput.value = '';
            }
        });
    }

    if (untilInput) {
        untilInput.addEventListener('change', () => {
            if (untilInput.value && durationSelect) {
                durationSelect.value = '';
            }
        });
    }

    if (sendButton) {
        sendButton.addEventListener('click', () => {
            formStatus.textContent = '';
            if (!scenarioSelect.value) {
                formStatus.textContent = 'Bitte ein Szenario auswählen.';
                return;
            }
            sendAlertRequest();
        });
    }

    if (activeList) {
        activeList.addEventListener('click', (event) => {
            const target = event.target;
            if (!target || target.dataset.action !== 'clear') {
                return;
            }
            event.stopPropagation();
            sendClearRequest(Number(target.dataset.alertId));
        });
    }
});

window.addEventListener('message', (event) => {
    const payload = event.data;
    if (!payload || !payload.event) {
        return;
    }

    switch (payload.event) {
        case 'alert:history':
            if (Array.isArray(payload.data)) {
                state.activeAlerts = [];
                state.historyAlerts = payload.data;
            } else {
                state.activeAlerts = (payload.data && payload.data.active) || [];
                state.historyAlerts = (payload.data && payload.data.history) || [];
            }
            renderFeed();
            break;
        case 'alert:new':
            if (payload.data) {
                state.historyAlerts = [payload.data, ...state.historyAlerts];
                if (payload.data.is_active) {
                    state.activeAlerts = [payload.data, ...state.activeAlerts];
                }
                renderFeed();
            }
            break;
        case 'alert:cleared':
            state.activeAlerts = state.activeAlerts.filter(alert => alert.id !== payload.data);
            renderFeed();
            break;
        case 'alert:permissions':
            updatePermissions(payload.data && payload.data.canSend);
            break;
        case 'alert:scenarios':
            state.scenarios = payload.data || [];
            renderScenarioOptions();
            break;
        case 'alert:areas':
            state.areas = payload.data || [];
            renderAreaOptions();
            break;
        case 'alert:sendResult':
            handleSendResult(payload.data && payload.data.ok, payload.data && payload.data.error);
            break;
        case 'alert:clearResult':
            if (payload.data && payload.data.ok) {
                formStatus.textContent = 'Entwarnung gesendet.';
            } else {
                state.lastError = payload.data && payload.data.error ? payload.data.error : 'Entwarnung fehlgeschlagen.';
            }
            renderUIState();
            break;
        case 'sound:play':
            playSound(payload.data);
            break;
        default:
            break;
    }
});

updatePermissions(false);
postNui('getPermissions');
postNui('fetchHistory', { limit: 25, offset: 0 });
renderUIState();

window.onerror = (message) => {
    if (!statusEl) {
        return;
    }
    statusEl.textContent = `UI Error: ${message}`;
    if (uiError) {
        uiError.classList.remove('hidden');
        uiError.textContent = `UI Error: ${message}`;
    }
};
