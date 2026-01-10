const state = {
    alerts: [],
    selected: null,
    canSend: false
};

const feedList = document.getElementById('feed-list');
const feedEmpty = document.getElementById('feed-empty');
const detailsTitle = document.getElementById('details-title');
const detailsMeta = document.getElementById('details-meta');
const detailsMessage = document.getElementById('details-message');
const formStatus = document.getElementById('form-status');
const senderTab = document.getElementById('sender-tab');
const senderForm = document.getElementById('sender-form');
const audioElement = document.getElementById('alert-audio');

const tabs = document.querySelectorAll('.tab-button');

const postNui = (endpoint, data = {}) =>
    fetch(`https://${GetParentResourceName()}/${endpoint}`,
        { method: 'POST', headers: { 'Content-Type': 'application/json; charset=UTF-8' }, body: JSON.stringify(data) });

const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('de-DE');
};

const renderFeed = () => {
    feedList.innerHTML = '';

    if (state.alerts.length === 0) {
        feedEmpty.classList.remove('hidden');
        return;
    }

    feedEmpty.classList.add('hidden');
    state.alerts.forEach(alert => {
        const card = document.createElement('div');
        card.className = 'alert-card';
        card.innerHTML = `
            <div class="title">${alert.title}</div>
            <div class="meta">
                <span>${alert.severity.toUpperCase()}</span>
                <span>${formatTime(alert.created_at)}</span>
            </div>
        `;
        card.addEventListener('click', () => showDetails(alert));
        feedList.appendChild(card);
    });
};

const showDetails = (alert) => {
    state.selected = alert;
    detailsTitle.textContent = alert.title;
    detailsMeta.textContent = `${alert.severity.toUpperCase()} • ${formatTime(alert.created_at)}`;
    detailsMessage.textContent = alert.message;
    setActiveTab('details');
};

const setActiveTab = (tabName) => {
    tabs.forEach(tab => tab.classList.toggle('active', tab.dataset.tab === tabName));
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.toggle('hidden', content.id !== tabName);
    });
};

const updatePermissions = (canSend) => {
    state.canSend = canSend;
    senderTab.style.display = canSend ? 'block' : 'none';
};

const handleSendResult = (success, reason) => {
    if (success) {
        formStatus.textContent = 'Meldung gesendet.';
        senderForm.reset();
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

senderForm.addEventListener('submit', (event) => {
    event.preventDefault();
    formStatus.textContent = '';

    const payload = {
        title: document.getElementById('alert-title').value.trim(),
        message: document.getElementById('alert-message').value.trim(),
        severity: document.getElementById('alert-severity').value
    };

    if (!payload.title || !payload.message) {
        formStatus.textContent = 'Bitte alle Felder korrekt ausfüllen.';
        return;
    }

    if (!window.confirm('Alert wirklich senden?')) {
        return;
    }

    postNui('sendAlert', payload);
});

tabs.forEach(tab => {
    tab.addEventListener('click', () => setActiveTab(tab.dataset.tab));
});

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
        case 'alert:sendResult':
            handleSendResult(payload.data && payload.data.success, payload.data && payload.data.reason);
            break;
        case 'sound:play':
            playSound(payload.data);
            break;
        default:
            break;
    }
});

updatePermissions(false);
setActiveTab('feed');
postNui('fetchHistory');
