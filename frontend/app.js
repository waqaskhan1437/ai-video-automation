const CONFIG_KEY = 'videoAutomationConfig';

let config = {
    scriptUrl: '',
    spreadsheetId: ''
};

let currentVideos = [];

document.addEventListener('DOMContentLoaded', () => {
    loadConfig();
    initTabs();
    initEventListeners();
    loadData();
});

function loadConfig() {
    const saved = localStorage.getItem(CONFIG_KEY);
    if (saved) {
        config = { ...config, ...JSON.parse(saved) };
        document.getElementById('scriptUrl').value = config.scriptUrl || '';
        document.getElementById('spreadsheetId').value = config.spreadsheetId || '';
    }
}

function saveConfig() {
    config.scriptUrl = document.getElementById('scriptUrl').value.trim();
    config.spreadsheetId = document.getElementById('spreadsheetId').value.trim();
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
}

function initTabs() {
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(tab.dataset.tab).classList.add('active');
        });
    });
}

function initEventListeners() {
    document.getElementById('generateNowBtn').addEventListener('click', generateNow);
    document.getElementById('refreshBtn').addEventListener('click', loadData);
    document.getElementById('createVideoForm').addEventListener('submit', createVideo);
    document.getElementById('batchCreateForm').addEventListener('submit', batchCreate);
    document.getElementById('saveScheduleBtn').addEventListener('click', saveSchedule);
    document.getElementById('saveSettingsBtn').addEventListener('click', saveSettingsHandler);
    document.getElementById('resetTriggersBtn').addEventListener('click', resetTriggers);
    document.getElementById('clearSheetBtn').addEventListener('click', clearSheet);
    document.getElementById('exportBtn').addEventListener('click', exportCSV);
    document.getElementById('statusFilter').addEventListener('change', filterVideos);
    document.querySelector('.modal-close').addEventListener('click', closeModal);
    document.getElementById('spreadsheetId').addEventListener('change', () => {
        saveConfig();
        updateSheetLink();
    });
}

async function loadData() {
    if (!config.scriptUrl) {
        showToast('Please configure Script URL in Settings', 'warning');
        return;
    }

    try {
        const [statusRes, videosRes] = await Promise.all([
            apiCall('getStatus'),
            apiCall('getVideos')
        ]);

        updateStats(statusRes.stats);
        currentVideos = videosRes.videos || [];
        renderVideos(currentVideos);
        renderVideoList(currentVideos);
    } catch (error) {
        showToast('Failed to load data: ' + error.message, 'error');
    }
}

function updateStats(stats) {
    document.getElementById('totalVideos').textContent = stats.total || 0;
    document.getElementById('pendingVideos').textContent = stats.pending || 0;
    document.getElementById('generatingVideos').textContent = stats.generating || 0;
    document.getElementById('completedVideos').textContent = stats.completed || 0;
}

function renderVideos(videos) {
    const grid = document.getElementById('recentVideos');
    const recent = videos.slice(0, 6);

    if (recent.length === 0) {
        grid.innerHTML = '<p class="empty-state">No videos yet. Create your first video!</p>';
        return;
    }

    grid.innerHTML = recent.map(video => createVideoCard(video)).join('');
    
    grid.querySelectorAll('.video-card').forEach(card => {
        card.addEventListener('click', () => openVideoModal(card.dataset.id));
    });
}

function createVideoCard(video) {
    const isCompleted = video.status === 'completed';
    const link = video.mergedLink || (video.clipsJson ? JSON.parse(video.clipsJson)[0]?.driveUrl : '');
    
    return `
        <div class="video-card" data-id="${video.id}">
            <div class="video-thumbnail">
                <div class="play-icon">▶</div>
                <span class="status-badge status-${video.status}">${video.status}</span>
            </div>
            <div class="video-info">
                <p class="video-prompt">${video.prompt || 'Random Creative Video'}</p>
                <p class="video-date">${formatDate(video.createdDate)}</p>
            </div>
        </div>
    `;
}

function renderVideoList(videos) {
    const list = document.getElementById('videoList');
    const filter = document.getElementById('statusFilter').value;

    let filtered = videos;
    if (filter !== 'all') {
        filtered = videos.filter(v => v.status === filter);
    }

    if (filtered.length === 0) {
        list.innerHTML = '<p class="empty-state">No videos found</p>';
        return;
    }

    list.innerHTML = filtered.map(video => `
        <div class="video-list-item" data-id="${video.id}">
            <div class="thumbnail">
                <span style="font-size: 24px;">▶</span>
            </div>
            <div class="details">
                <p class="prompt">${video.prompt || 'Random Creative Video'}</p>
                <p class="meta">
                    <span class="status-badge status-${video.status}">${video.status}</span>
                    • ${formatDate(video.createdDate)}
                </p>
            </div>
        </div>
    `).join('');

    list.querySelectorAll('.video-list-item').forEach(item => {
        item.addEventListener('click', () => openVideoModal(item.dataset.id));
    });
}

function filterVideos() {
    renderVideoList(currentVideos);
}

async function createVideo(e) {
    e.preventDefault();
    
    const prompt = document.getElementById('videoPrompt').value.trim();
    
    try {
        const response = await apiCall('create', { prompt });
        showToast('Video added to queue!', 'success');
        document.getElementById('videoPrompt').value = '';
        loadData();
    } catch (error) {
        showToast('Failed to create video: ' + error.message, 'error');
    }
}

async function batchCreate(e) {
    e.preventDefault();
    
    const count = parseInt(document.getElementById('batchCount').value) || 1;
    
    try {
        for (let i = 0; i < count; i++) {
            await apiCall('create', { prompt: '' });
        }
        showToast(`${count} videos added to queue!`, 'success');
        loadData();
    } catch (error) {
        showToast('Failed to create videos: ' + error.message, 'error');
    }
}

async function generateNow() {
    const btn = document.getElementById('generateNowBtn');
    btn.disabled = true;
    btn.innerHTML = '<span class="loading"></span> Generating...';

    try {
        const response = await apiCall('generateNow', {}, 'POST');
        showToast('Generation started!', 'success');
        setTimeout(loadData, 2000);
    } catch (error) {
        showToast('Failed: ' + error.message, 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<span class="btn-icon">▶</span> Generate Now';
    }
}

async function saveSchedule() {
    const schedule = {
        dailyEnabled: document.getElementById('dailyEnabled').checked,
        dailyTime: document.getElementById('dailyTime').value,
        weeklyEnabled: document.getElementById('weeklyEnabled').checked,
        weeklyDay: document.getElementById('weeklyDay').value,
        weeklyTime: document.getElementById('weeklyTime').value,
        minuteEnabled: document.getElementById('minuteEnabled').checked,
        minuteInterval: parseInt(document.getElementById('minuteInterval').value)
    };

    try {
        await apiCall('updateSettings', schedule, 'POST');
        showToast('Schedule saved!', 'success');
    } catch (error) {
        showToast('Failed to save schedule: ' + error.message, 'error');
    }
}

function saveSettingsHandler() {
    saveConfig();
    
    const settings = {
        zskyApiKey: document.getElementById('zskyApiKey').value.trim(),
        spreadsheetId: document.getElementById('spreadsheetId').value.trim()
    };

    apiCall('updateSettings', settings, 'POST')
        .then(() => showToast('Settings saved!', 'success'))
        .catch(error => showToast('Failed: ' + error.message, 'error'));
}

async function resetTriggers() {
    if (!confirm('Are you sure you want to reset all triggers? This cannot be undone.')) return;
    
    try {
        const response = await google.script.run.withSuccessHandler(r => {
            showToast('Triggers reset successfully!', 'success');
        }).setupTriggers();
    } catch (error) {
        showToast('Failed to reset triggers: ' + error.message, 'error');
    }
}

async function clearSheet() {
    if (!confirm('Are you sure you want to clear all videos? This cannot be undone.')) return;
    
    showToast('Please manually delete rows from Google Sheet', 'warning');
}

function exportCSV() {
    const headers = ['ID', 'Prompt', 'Status', 'Merged Link', 'Created Date'];
    const rows = currentVideos.map(v => [
        v.id,
        v.prompt,
        v.status,
        v.mergedLink || '',
        formatDate(v.createdDate)
    ]);

    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `videos_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
}

function openVideoModal(id) {
    const video = currentVideos.find(v => v.id === id);
    if (!video) return;

    const modal = document.getElementById('videoModal');
    const player = document.getElementById('videoPlayer');
    const info = document.getElementById('videoInfo');
    const catboxLink = document.getElementById('openCatboxLink');
    const sheetLink = document.getElementById('openSheetLink');

    if (video.mergedLink) {
        player.innerHTML = `<video controls src="${video.mergedLink}"></video>`;
        catboxLink.href = video.mergedLink;
        catboxLink.style.display = 'inline-flex';
    } else {
        player.innerHTML = '<p style="padding: 40px; text-align: center; color: var(--text-secondary);">Video not ready yet</p>';
        catboxLink.style.display = 'none';
    }

    const clips = video.clipsJson ? JSON.parse(video.clipsJson) : [];
    
    info.innerHTML = `
        <p><strong>Status:</strong> <span class="status-badge status-${video.status}">${video.status}</span></p>
        <p><strong>Prompt:</strong> ${video.prompt || 'Random'}</p>
        <p><strong>Clips:</strong> ${clips.length} / 6</p>
        <p><strong>Created:</strong> ${formatDate(video.createdDate)}</p>
    `;

    if (config.spreadsheetId) {
        sheetLink.href = `https://docs.google.com/spreadsheets/d/${config.spreadsheetId}`;
        sheetLink.style.display = 'inline-flex';
    } else {
        sheetLink.style.display = 'none';
    }

    modal.classList.add('active');
}

function closeModal() {
    document.getElementById('videoModal').classList.remove('active');
    document.getElementById('videoPlayer').innerHTML = '';
}

function updateSheetLink() {
    const id = document.getElementById('spreadsheetId').value.trim();
    if (id) {
        document.getElementById('openSheetLink').href = `https://docs.google.com/spreadsheets/d/${id}`;
    }
}

async function apiCall(action, data = {}, method = 'GET') {
    const url = new URL(config.scriptUrl);
    url.searchParams.append('action', action);

    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        }
    };

    if (method === 'POST') {
        options.body = JSON.stringify(data);
    }

    const response = await fetch(url.toString(), options);
    const result = await response.json();

    if (!response.ok || result.error) {
        throw new Error(result.error || 'API request failed');
    }

    return result;
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function formatDate(date) {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        closeModal();
    }
});
