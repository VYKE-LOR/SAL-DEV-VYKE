const state = {
    alerts: [],
    scenarios: [],
    selected: null,
    canSend: false
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
const titleInput = document.getElementById('alert-title');
const messageInput = document.getElementById('alert-message');
const previewText = document.getElementById('preview-text');
const sendButton = document.getElementById('send-alert');
const detailOverlay = document.getElementById('detail-overlay');
const detailClose = document.getElementById('detail-close');
const audioElement = document.getElementById('alert-audio');
const uiError = document.getElementById('ui-error');

const RESOURCE = 'sal_public_alerts';
const postNui = (endpoint, data = {}) =>
    fetch(`https://${RESOURCE}/${endpoint}`,
        { method: 'POST', headers: { 'Content-Type': 'application/json; charset=UTF-8' }, body: JSON.stringify(data) });

const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('de-DE');
};

const severityClass = (severity) => {
    const value = (severity || '').toLowerCase();
    if (value === 'critical') return 'critical';
    if (value === 'warning') return 'warning';
    if (value === 'test') return 'test';
    return 'info';
};

const makeCard = (alert) => {
    const card = document.createElement('div');
    card.className = 'alert-card';
    card.innerHTML = `
        <div class="title">${alert.title}</div>
        <div class="meta">
            <span class="badge ${severityClass(alert.severity)}">${alert.severity}</span>
            <span>${formatTime(alert.created_at)}</span>
        </div>
        <div class="muted">${alert.message.slice(0, 90)}${alert.message.length > 90 ? '…' : ''}</div>
    `;
    card.addEventListener('click', () => showDetails(alert));
    return card;
};

const renderFeed = () => {
    if (!activeList || !historyList || !statusEl) {
        return;
    }

    activeList.innerHTML = '';
    historyList.innerHTML = '';
    statusEl.textContent = '';

    if (state.alerts.length === 0) {
        activeEmpty.classList.remove('hidden');
        historyEmpty.classList.remove('hidden');
        updateStatusChip(false);
        return;
    }

    activeEmpty.classList.add('hidden');
    historyEmpty.classList.add('hidden');

    const activeAlerts = state.alerts.slice(0, 3);
    const historyAlerts = state.alerts;

    activeAlerts.forEach(alert => activeList.appendChild(makeCard(alert)));
    historyAlerts.forEach(alert => historyList.appendChild(makeCard(alert)));

    updateStatusChip(true);
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
};

const handleSendResult = (success, reason) => {
    if (success) {
        formStatus.textContent = 'Meldung gesendet.';
        if (titleInput) {
            titleInput.value = '';
        }
        if (messageInput) {
            messageInput.value = '';
        }
        buildPreview();
        return;
    }

    switch (reason) {
        case 'permission':
            formStatus.textContent = 'Keine Berechtigung zum Senden.';
            break;
        case 'rate_limit':
            formStatus.textContent = 'Rate-Limit erreicht. Bitte warten.';
            break;
        case 'validation':
            formStatus.textContent = 'Bitte alle Felder korrekt ausfüllen.';
            break;
        default:
            formStatus.textContent = 'Fehler beim Senden.';
    }
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

    const area = areaSelect.value || 'San Andreas';
    const title = titleInput.value.trim() || scenario.defaultTitle;
    const customText = messageInput.value.trim();
    const instructions = scenario.defaultInstructions || '';

    if (customText) {
        previewText.textContent = `${title} – ${customText}`;
        return;
    }

    const template = scenario.template || '';
    previewText.textContent = template
        .replace('{AREA}', area)
        .replace('{INSTRUCTIONS}', instructions);
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

const openSheet = () => {
    if (sendSheet) {
        sendSheet.classList.remove('hidden');
    }
};

const closeSheet = () => {
    if (sendSheet) {
        sendSheet.classList.add('hidden');
    }
};

if (emergencyButton) {
    emergencyButton.addEventListener('click', openSheet);
}

if (sheetClose) {
    sheetClose.addEventListener('click', closeSheet);
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

if (sendButton) {
    sendButton.addEventListener('click', () => {
        formStatus.textContent = '';
        if (!scenarioSelect.value) {
            formStatus.textContent = 'Bitte ein Szenario auswählen.';
            return;
        }
        if (!window.confirm('Alarm wirklich senden?')) {
            return;
        }
        postNui('sendAlert', {
            scenarioId: scenarioSelect.value,
            area: areaSelect.value,
            titleOptional: titleInput.value.trim(),
            customTextOptional: messageInput.value.trim()
        });
    });
}

window.addEventListener('message', (event) => {
    const payload = event.data;
    if (!payload || !payload.event) {
        return;
    }

    switch (payload.event) {
        case 'alert:history':
            state.alerts = payload.data || [];
            renderFeed();
            break;
        case 'alert:new':
            if (payload.data) {
                state.alerts = [payload.data, ...state.alerts];
                renderFeed();
            }
            break;
        case 'alert:permissions':
            updatePermissions(payload.data && payload.data.canSend);
            break;
        case 'alert:scenarios':
            state.scenarios = payload.data || [];
            renderScenarioOptions();
            break;
        case 'alert:sendResult':
            handleSendResult(payload.data && payload.data.success, payload.data && payload.data.reason);
            if (payload.data && payload.data.success) {
                closeSheet();
            }
            break;
        case 'sound:play':
            playSound(payload.data);
            break;
        default:
            break;
    }
});

updatePermissions(false);
postNui('fetchHistory', { limit: 25, offset: 0 });

if (statusEl) {
    statusEl.textContent = 'Lade Alerts...';
}

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
