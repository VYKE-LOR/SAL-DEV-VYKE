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
                <span>${alert.category.toUpperCase()}</span>
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
    detailsMeta.textContent = `${alert.category.toUpperCase()} • ${formatTime(alert.created_at)} • ${alert.created_by_name || 'DESPS'}`;
    detailsMessage.textContent = alert.message;
    postNui('markSeen', { id: alert.id });
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
    const source = data.url && data.url !== '' ? data.url : `sounds/${data.name}.ogg`;
    audioElement.src = source;
    audioElement.volume = data.volume ?? 0.8;
    audioElement.currentTime = 0;
    audioElement.play().catch(() => {});
    if (data.duration) {
        setTimeout(() => {
            audioElement.pause();
        }, data.duration);
    }
};

senderForm.addEventListener('submit', (event) => {
    event.preventDefault();
    formStatus.textContent = '';

    const payload = {
        title: document.getElementById('alert-title').value.trim(),
        message: document.getElementById('alert-message').value.trim(),
        category: document.getElementById('alert-category').value,
        severity: parseInt(document.getElementById('alert-severity').value, 10)
    };

    postNui('sendAlert', payload);
});

tabs.forEach(tab => {
    tab.addEventListener('click', () => setActiveTab(tab.dataset.tab));
});

window.addEventListener('message', (event) => {
    const data = event.data;
    if (!data || data.type !== 'sal_public_alerts') {
        return;
    }

    switch (data.action) {
        case 'feed':
            state.alerts = data.alerts || [];
            renderFeed();
            break;
        case 'incoming':
            if (data.alert) {
                state.alerts = [data.alert, ...state.alerts];
                renderFeed();
            }
            break;
        case 'permissions':
            updatePermissions(data.canSend);
            break;
        case 'sendResult':
            handleSendResult(data.success, data.reason);
            break;
        case 'playSound':
            playSound(data);
            break;
        default:
            break;
    }
});

updatePermissions(false);
setActiveTab('feed');
postNui('fetchFeed', { limit: 25, offset: 0 });
