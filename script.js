// PALETTE PASTELS D'ORIGINE
const PASTEL_PALETTE = [
    { name: "Rose Poudré", hex: "#FDE2E4" },
    { name: "Menthe Douce", hex: "#D1F2D9" },
    { name: "Lavande Pastel", hex: "#E2D4F9" },
    { name: "Citron Glacé", hex: "#FFF1C5" },
    { name: "Ciel Pastel", hex: "#B9F3FC" },
    { name: "Pêche Douce", hex: "#FFD8BE" },
    { name: "Sauge Pastel", hex: "#E8F5E9" },
    { name: "Lilas Doux", hex: "#F7C8E0" },
    { name: "Bleu Pervenche", hex: "#D6E4FF" },
    { name: "Beige Vanille", hex: "#F5EBE0" }
];

// DONNÉES ET ÉTAT GLOBAL DE L'APPLICATION
let appData = {
    modules: [],
    timeSlots: [
        { id: 1, start: "08:00", end: "09:30" },
        { id: 2, start: "09:30", end: "11:00" },
        { id: 3, start: "11:00", end: "12:30" },
        { id: 4, start: "14:00", end: "15:30" },
        { id: 5, start: "15:30", end: "17:00" },
        { id: 6, start: "17:00", end: "18:30" },
        { id: 7, start: "20:00", end: "21:30" },
        { id: 8, start: "21:30", end: "23:00" },
        { id: 9, start: "23:00", end: "00:30" },
        { id: 10, start: "00:30", end: "02:00" }
    ],
    savedActivities: [
        { id: 1, title: "Cours Université", color: "#E2D4F9" },
        { id: 2, title: "Séance Gym", color: "#D1F2D9" },
        { id: 3, title: "Session Peinture", color: "#FFD8BE" }
    ],
    timetable: {},
    customTasks: [
        { id: 1, name: "Ranger ma chambre & bureau", energy: "low", duration: "20min" },
        { id: 2, name: "Session Peinture / Dessin", energy: "medium", duration: "1h" },
        { id: 3, name: "Séance de Gym / Sport", energy: "high", duration: "1h20min" }
    ],
    pomodoroHistory: [],
    pomodoroConfig: {
        workMin: 25,
        shortBreakMin: 5,
        longBreakMin: 15,
        cyclesBeforeLong: 4,
        soundWork: 'bell',
        soundShort: 'marimba',
        soundLong: 'gong'
    },
    githubConfig: { token: '', repo: '' },
    currentTheme: 'dopamine-pastel'
};

let timerInterval = null;
let timerSecondsLeft = 25 * 60;
let isTimerRunning = false;
let currentMode = 'work';
let currentCycle = 1;
let selectedModuleIdForPomo = null;
let activeDetailModuleId = null;

// PARSER DU TEMPS FLEXIBLE (ex: "1h20min", "45min", "2h")
function parseFlexibleTime(input) {
    if (!input) return 25;
    let str = input.toString().toLowerCase().trim();
    let totalMinutes = 0;
    
    let hoursMatch = str.match(/(\d+(?:\.\d+)?)\s*h/);
    let minsMatch = str.match(/(\d+)\s*m/);

    if (hoursMatch) {
        totalMinutes += parseFloat(hoursMatch[1]) * 60;
        let afterH = str.split('h')[1];
        if (afterH) {
            let mAfter = afterH.match(/(\d+)/);
            if (mAfter) totalMinutes += parseInt(mAfter[1]);
        }
    } else if (minsMatch) {
        totalMinutes += parseInt(minsMatch[1]);
    } else {
        let val = parseFloat(str);
        if (!isNaN(val)) totalMinutes = val;
    }
    return totalMinutes > 0 ? Math.round(totalMinutes) : 25;
}

// INITIALISATION
document.addEventListener('DOMContentLoaded', () => {
    loadLocalData();
    initNavigation();
    initSwatches();
    initEventListeners();
    applyTheme(appData.currentTheme);
    renderApp();
});

function loadLocalData() {
    const saved = localStorage.getItem('focus_study_app_data');
    if (saved) {
        appData = JSON.parse(saved);
        if (!appData.timeSlots) appData.timeSlots = [];
        if (!appData.savedActivities) appData.savedActivities = [];
        if (!appData.timetable) appData.timetable = {};
        if (!appData.pomodoroHistory) appData.pomodoroHistory = [];
        if (!appData.customTasks) appData.customTasks = [];
    }
}

function saveData() {
    localStorage.setItem('focus_study_app_data', JSON.stringify(appData));
    if (appData.githubConfig && appData.githubConfig.token && appData.githubConfig.repo) {
        pushToGitHub();
    }
}

function initNavigation() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-pane').forEach(tab => tab.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(btn.dataset.tab).classList.add('active');
        });
    });
}

function initSwatches() {
    const bankContainer = document.getElementById('bank-pastel-swatches');
    const modContainer = document.getElementById('module-pastel-swatches');
    
    if (bankContainer) renderSwatchesInto(bankContainer, 'new-act-color');
    if (modContainer) renderSwatchesInto(modContainer, 'new-mod-color');
}

function renderSwatchesInto(container, hiddenInputId) {
    container.innerHTML = '';
    PASTEL_PALETTE.forEach((p, idx) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `pastel-swatch-btn ${idx === 0 ? 'selected' : ''}`;
        btn.style.backgroundColor = p.hex;
        btn.title = p.name;
        btn.onclick = () => {
            container.querySelectorAll('.pastel-swatch-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            document.getElementById(hiddenInputId).value = p.hex;
        };
        container.appendChild(btn);
    });
}

function initEventListeners() {
    document.getElementById('form-create-module').addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('new-mod-name').value;
        const color = document.getElementById('new-mod-color').value || "#E2D4F9";
        const td = parseInt(document.getElementById('new-mod-td').value) || 0;
        const tp = parseInt(document.getElementById('new-mod-tp').value) || 0;
        const chapCount = parseInt(document.getElementById('new-mod-chap').value) || 1;

        const chapters = [];
        for (let i = 1; i <= chapCount; i++) {
            chapters.push({
                id: Date.now() + i,
                title: `Chapitre ${i}`,
                step1: false,
                step2: false,
                step3: false
            });
        }

        appData.modules.push({ id: Date.now(), name, color, tdCount: td, tdDone: 0, tpCount: tp, tpDone: 0, chapters, pomodoroMinutes: 0 });
        saveData(); renderApp(); closeAddModuleModal();
        document.getElementById('form-create-module').reset();
    });

    document.getElementById('form-add-slot').addEventListener('submit', (e) => {
        e.preventDefault();
        const start = document.getElementById('slot-start').value.trim();
        const end = document.getElementById('slot-end').value.trim();
        appData.timeSlots.push({ id: Date.now(), start, end });
        saveData(); renderTimetableGrid(); closeAddSlotModal();
        document.getElementById('form-add-slot').reset();
    });

    document.getElementById('form-create-saved-activity').addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('new-act-name').value.trim();
        const color = document.getElementById('new-act-color').value || "#FDE2E4";
        appData.savedActivities.push({ id: Date.now(), title, color });
        saveData(); renderSavedActivitiesList(); renderSavedActivitiesDropdown();
        document.getElementById('form-create-saved-activity').reset();
    });

    document.getElementById('form-add-task').addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('task-name').value;
        const energy = document.getElementById('task-energy').value;
        const duration = document.getElementById('task-duration').value;

        appData.customTasks.push({ id: Date.now(), name, energy, duration });
        saveData(); renderTasksPinterest(); closeAddTaskModal();
        document.getElementById('form-add-task').reset();
    });

    document.getElementById('form-github-sync').addEventListener('submit', (e) => {
        e.preventDefault();
        appData.githubConfig.token = document.getElementById('gh-token').value.trim();
        appData.githubConfig.repo = document.getElementById('gh-repo').value.trim();
        saveData(); alert('Identifiants sauvegardés !');
    });

    document.getElementById('btn-pomo-start').addEventListener('click', startPomodoro);
    document.getElementById('btn-pomo-pause').addEventListener('click', pausePomodoro);
    document.getElementById('btn-pomo-reset').addEventListener('click', resetPomodoro);
    document.getElementById('pomo-module-select').addEventListener('change', (e) => {
        selectedModuleIdForPomo = e.target.value ? parseInt(e.target.value) : null;
    });
}

// RENDU GLOBAL
function renderApp() {
    renderModulesHorizontal();
    renderPomodoroSelect();
    renderSavedActivitiesDropdown();
    renderTimetableGrid();
    renderTasksPinterest();
    if (activeDetailModuleId) renderModuleDetail(activeDetailModuleId);
}

// --- ONGLET MODULES ---
function renderModulesHorizontal() {
    const list = document.getElementById('modules-horizontal-list');
    list.innerHTML = '';

    if (appData.modules.length === 0) {
        list.innerHTML = '<p style="color:var(--text-muted)">Aucun module pour le moment. Cliquez sur "Nouveau Module".</p>';
        return;
    }

    appData.modules.forEach(mod => {
        let totalSteps = mod.chapters.length * 3;
        let doneSteps = 0;
        mod.chapters.forEach(c => {
            if (c.step1) doneSteps++;
            if (c.step2) doneSteps++;
            if (c.step3) doneSteps++;
        });

        const percent = totalSteps > 0 ? Math.round((doneSteps / totalSteps) * 100) : 0;
        const hours = Math.floor(mod.pomodoroMinutes / 60);
        const mins = mod.pomodoroMinutes % 60;
        const timeStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

        const card = document.createElement('div');
        card.className = `module-card-mini ${activeDetailModuleId === mod.id ? 'active-selected' : ''}`;
        card.style.borderColor = mod.color;
        card.style.backgroundColor = mod.color + "22";
        card.onclick = () => toggleModuleDetail(mod.id);

        card.innerHTML = `
            <div class="mod-header">
                <span class="mod-title">${mod.name}</span>
                <span class="mod-pomo-time">⏱️ ${timeStr}</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width:${percent}%"></div>
            </div>
            <p style="font-size:0.8rem; text-align:right; font-weight:bold">${percent}% complété</p>
        `;
        list.appendChild(card);
    });
}

function toggleModuleDetail(id) {
    if (activeDetailModuleId === id) {
        activeDetailModuleId = null;
        document.getElementById('module-detail-container').classList.add('hidden');
    } else {
        activeDetailModuleId = id;
        renderModuleDetail(id);
    }
    renderModulesHorizontal();
}

function renderModuleDetail(id) {
    const container = document.getElementById('module-detail-container');
    const mod = appData.modules.find(m => m.id === id);
    if (!mod) { container.classList.add('hidden'); return; }

    container.classList.remove('hidden');
    container.style.borderLeftColor = mod.color;
    container.style.backgroundColor = mod.color + "15";

    let chaptersHTML = '';
    mod.chapters.forEach((chap) => {
        const step1Done = chap.step1;
        const step2Done = chap.step1 && chap.step2;

        chaptersHTML += `
            <div class="chapter-box">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <input type="text" value="${chap.title}" onchange="updateChapterTitle(${mod.id}, ${chap.id}, this.value)" style="font-weight:bold; width:75%;">
                    <button class="btn-danger" onclick="deleteChapter(${mod.id}, ${chap.id})" style="padding:4px 8px;">🗑️</button>
                </div>
                <div style="margin-top:10px;">
                    <label class="step-item">
                        <input type="checkbox" ${chap.step1 ? 'checked' : ''} onchange="toggleStep(${mod.id}, ${chap.id}, 'step1')">
                        <span><strong>Étape 1 :</strong> Écouter / Noter l'audio</span>
                    </label>

                    <label class="step-item ${!step1Done ? 'disabled' : ''}">
                        <input type="checkbox" ${chap.step2 ? 'checked' : ''} ${!step1Done ? 'disabled' : ''} onchange="toggleStep(${mod.id}, ${chap.id}, 'step2')">
                        <span>${!step1Done ? '🔒 (Valider d\'abord l\'Étape 1)' : '<strong>Étape 2 :</strong> Comprendre le reste'}</span>
                    </label>

                    <label class="step-item ${!step2Done ? 'disabled' : ''}">
                        <input type="checkbox" ${chap.step3 ? 'checked' : ''} ${!step2Done ? 'disabled' : ''} onchange="toggleStep(${mod.id}, ${chap.id}, 'step3')">
                        <span>${!step2Done ? '🔒 (Valider d\'abord l\'Étape 2)' : '<strong>Étape 3 :</strong> Faire le résumé final'}</span>
                    </label>
                </div>
            </div>
        `;
    });

    container.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
            <h2 style="color:var(--text);">${mod.name}</h2>
            <button class="btn-danger" onclick="deleteModule(${mod.id})">🗑️ Supprimer Module</button>
        </div>
        <p style="margin-bottom:15px; font-weight:bold;">📝 T.D : ${mod.tdDone}/${mod.tdCount} | 🧪 T.P : ${mod.tpDone}/${mod.tpCount}</p>
        ${chaptersHTML}
        <button class="btn-primary mt-20" onclick="addNewChapter(${mod.id})">➕ Ajouter Chapitre</button>
    `;
}

function toggleStep(modId, chapId, stepKey) {
    const mod = appData.modules.find(m => m.id === modId);
    if (!mod) return;
    const chap = mod.chapters.find(c => c.id === chapId);
    if (!chap) return;

    if (stepKey === 'step1') {
        chap.step1 = !chap.step1;
        if (!chap.step1) { chap.step2 = false; chap.step3 = false; }
    } else if (stepKey === 'step2' && chap.step1) {
        chap.step2 = !chap.step2;
        if (!chap.step2) { chap.step3 = false; }
    } else if (stepKey === 'step3' && chap.step1 && chap.step2) {
        chap.step3 = !chap.step3;
    }

    saveData(); renderApp();
}

function updateChapterTitle(modId, chapId, title) {
    const mod = appData.modules.find(m => m.id === modId);
    if (mod) {
        const chap = mod.chapters.find(c => c.id === chapId);
        if (chap) { chap.title = title; saveData(); }
    }
}

function addNewChapter(modId) {
    const mod = appData.modules.find(m => m.id === modId);
    if (mod) {
        mod.chapters.push({ id: Date.now(), title: `Chapitre ${mod.chapters.length + 1}`, step1: false, step2: false, step3: false });
        saveData(); renderApp();
    }
}

function deleteChapter(modId, chapId) {
    const mod = appData.modules.find(m => m.id === modId);
    if (mod && confirm('Supprimer ce chapitre ?')) {
        mod.chapters = mod.chapters.filter(c => c.id !== chapId);
        saveData(); renderApp();
    }
}

function deleteModule(modId) {
    if (confirm('Supprimer définitivement ce module ?')) {
        appData.modules = appData.modules.filter(m => m.id !== modId);
        activeDetailModuleId = null;
        saveData(); renderApp();
    }
}

// --- BANQUE D'ACTIVITÉS ET PLANNING HEBDO EN TABLEAU ---
function renderSavedActivitiesDropdown() {
    const sel = document.getElementById('assign-saved-activity');
    if (!sel) return;
    sel.innerHTML = '';
    if (appData.savedActivities.length === 0) {
        sel.innerHTML = '<option value="">-- Aucune activité enregistrée --</option>';
        return;
    }
    appData.savedActivities.forEach(act => {
        const opt = document.createElement('option');
        opt.value = act.id;
        opt.textContent = act.title;
        sel.appendChild(opt);
    });
}

function renderSavedActivitiesList() {
    const list = document.getElementById('bank-activities-list');
    if (!list) return;
    list.innerHTML = '';
    if (appData.savedActivities.length === 0) {
        list.innerHTML = '<p style="font-size:0.85rem;">Aucune activité enregistrée.</p>';
        return;
    }
    appData.savedActivities.forEach(act => {
        const div = document.createElement('div');
        div.className = 'bank-item';
        div.style.backgroundColor = act.color + "55";
        div.innerHTML = `
            <span>${act.title}</span>
            <button class="btn-danger btn-sm" onclick="deleteSavedActivity(${act.id})">🗑️</button>
        `;
        list.appendChild(div);
    });
}

function deleteSavedActivity(id) {
    appData.savedActivities = appData.savedActivities.filter(a => a.id !== id);
    saveData(); renderSavedActivitiesList(); renderSavedActivitiesDropdown();
}

function renderTimetableGrid() {
    const tbody = document.getElementById('timetable-body');
    const slotSelect = document.getElementById('assign-slot');
    if (!tbody || !slotSelect) return;

    tbody.innerHTML = '';
    slotSelect.innerHTML = '';

    const days = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

    appData.timeSlots.forEach(slot => {
        const opt = document.createElement('option');
        opt.value = slot.id;
        opt.textContent = `${slot.start} - ${slot.end}`;
        slotSelect.appendChild(opt);

        const tr = document.createElement('tr');
        
        const tdTime = document.createElement('td');
        tdTime.className = 'time-slot-label';
        tdTime.textContent = `${slot.start} - ${slot.end}`;
        tr.appendChild(tdTime);

        days.forEach(day => {
            const tdCell = document.createElement('td');
            tdCell.className = 'cell-slot';
            const key = `${day}-${slot.id}`;
            const taskData = appData.timetable[key];

            if (taskData) {
                tdCell.innerHTML = `<span class="slot-badge" style="background-color:${taskData.color}">${taskData.title}</span>`;
            }

            tdCell.onclick = () => assignFromCellClick(day, slot.id);
            tr.appendChild(tdCell);
        });

        const tdAction = document.createElement('td');
        tdAction.innerHTML = `<button class="btn-danger btn-sm" onclick="deleteTimeSlot(${slot.id})">❌</button>`;
        tr.appendChild(tdAction);

        tbody.appendChild(tr);
    });
}

function assignFromCellClick(day, slotId) {
    if (appData.savedActivities.length === 0) {
        const title = prompt(`Nom de l'activité pour ${day} :`);
        if (title) {
            appData.timetable[`${day}-${slotId}`] = { title, color: "#FDE2E4" };
            saveData(); renderTimetableGrid();
        }
        return;
    }
    const actId = document.getElementById('assign-saved-activity').value;
    const act = appData.savedActivities.find(a => a.id == actId) || appData.savedActivities[0];
    if (act) {
        appData.timetable[`${day}-${slotId}`] = { title: act.title, color: act.color };
        saveData(); renderTimetableGrid();
    }
}

function assignTaskFromBar() {
    const actId = document.getElementById('assign-saved-activity').value;
    const day = document.getElementById('assign-day').value;
    const slotId = document.getElementById('assign-slot').value;

    const act = appData.savedActivities.find(a => a.id == actId);
    if (!act) { alert('Veuillez d\'abord ajouter une activité à votre banque d\'activités.'); return; }

    appData.timetable[`${day}-${slotId}`] = { title: act.title, color: act.color };
    saveData(); renderTimetableGrid();
}

function clearSelectedSlotFromBar() {
    const day = document.getElementById('assign-day').value;
    const slotId = document.getElementById('assign-slot').value;
    delete appData.timetable[`${day}-${slotId}`];
    saveData(); renderTimetableGrid();
}

function deleteTimeSlot(slotId) {
    if (confirm('Supprimer ce créneau horaire du tableau ?')) {
        appData.timeSlots = appData.timeSlots.filter(s => s.id !== slotId);
        saveData(); renderTimetableGrid();
    }
}

// --- POMODORO ---
function renderPomodoroSelect() {
    const sel = document.getElementById('pomo-module-select');
    sel.innerHTML = '<option value="">-- Session libre / Aucun module --</option>';
    appData.modules.forEach(m => {
        const opt = document.createElement('option');
        opt.value = m.id; opt.textContent = m.name;
        if (selectedModuleIdForPomo === m.id) opt.selected = true;
        sel.appendChild(opt);
    });
}

function applyPomodoroConfig() {
    appData.pomodoroConfig.workMin = parseFlexibleTime(document.getElementById('cfg-pomo-work').value);
    appData.pomodoroConfig.shortBreakMin = parseFlexibleTime(document.getElementById('cfg-pomo-short').value);
    appData.pomodoroConfig.longBreakMin = parseFlexibleTime(document.getElementById('cfg-pomo-long').value);
    appData.pomodoroConfig.cyclesBeforeLong = parseInt(document.getElementById('cfg-pomo-cycles').value) || 4;
    
    appData.pomodoroConfig.soundWork = document.getElementById('sound-work').value;
    appData.pomodoroConfig.soundShort = document.getElementById('sound-short').value;
    appData.pomodoroConfig.soundLong = document.getElementById('sound-long').value;

    saveData(); resetPomodoro();
    alert('Réglages Pomodoro enregistrés !');
}

function playSound(type) {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);

        if (type === 'bell') {
            osc.frequency.setValueAtTime(587.33, ctx.currentTime);
            gain.gain.setValueAtTime(0.5, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
            osc.start(); osc.stop(ctx.currentTime + 1.5);
        } else if (type === 'beep') {
            osc.type = 'square'; osc.frequency.setValueAtTime(800, ctx.currentTime);
            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            osc.start(); osc.stop(ctx.currentTime + 0.3);
        } else if (type === 'gong') {
            osc.frequency.setValueAtTime(261.63, ctx.currentTime);
            gain.gain.setValueAtTime(0.6, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.5);
            osc.start(); osc.stop(ctx.currentTime + 2.5);
        } else if (type === 'marimba') {
            osc.type = 'triangle'; osc.frequency.setValueAtTime(440, ctx.currentTime);
            gain.gain.setValueAtTime(0.5, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
            osc.start(); osc.stop(ctx.currentTime + 0.6);
        } else if (type === 'chime') {
            osc.type = 'sine'; osc.frequency.setValueAtTime(880, ctx.currentTime);
            gain.gain.setValueAtTime(0.4, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
            osc.start(); osc.stop(ctx.currentTime + 1.2);
        }
    } catch(e) { console.log('Audio error:', e); }
}

function testSound(elementId) { playSound(document.getElementById(elementId).value); }

function startPomodoro() {
    if (isTimerRunning) return;
    isTimerRunning = true;
    timerInterval = setInterval(() => {
        if (timerSecondsLeft > 0) {
            timerSecondsLeft--; updateClockDisplay();
        } else {
            handleTimerCompletion();
        }
    }, 1000);
}

function pausePomodoro() { clearInterval(timerInterval); isTimerRunning = false; }
function resetPomodoro() {
    pausePomodoro(); currentMode = 'work';
    timerSecondsLeft = appData.pomodoroConfig.workMin * 60;
    updateClockDisplay();
    document.getElementById('timer-status').textContent = "Session de Travail";
}

function handleTimerCompletion() {
    pausePomodoro();

    const todayStr = new Date().toLocaleDateString('fr-FR');
    const mod = appData.modules.find(m => m.id === selectedModuleIdForPomo);
    const modName = mod ? mod.name : 'Session Libre';

    if (currentMode === 'work') {
        playSound(appData.pomodoroConfig.soundWork || 'bell');
        const minsWorked = appData.pomodoroConfig.workMin;
        if (mod) { mod.pomodoroMinutes += minsWorked; }

        appData.pomodoroHistory.push({
            id: Date.now(),
            date: todayStr,
            moduleName: modName,
            minutes: minsWorked
        });
        saveData(); renderModulesHorizontal();

        if (currentCycle % appData.pomodoroConfig.cyclesBeforeLong === 0) {
            currentMode = 'longBreak'; timerSecondsLeft = appData.pomodoroConfig.longBreakMin * 60;
            document.getElementById('timer-status').textContent = "Pause Longue ! ☕";
        } else {
            currentMode = 'shortBreak'; timerSecondsLeft = appData.pomodoroConfig.shortBreakMin * 60;
            document.getElementById('timer-status').textContent = "Pause Courte ! ☕";
        }
        currentCycle++;
    } else if (currentMode === 'shortBreak') {
        playSound(appData.pomodoroConfig.soundShort || 'marimba');
        currentMode = 'work'; timerSecondsLeft = appData.pomodoroConfig.workMin * 60;
        document.getElementById('timer-status').textContent = "Session de Travail";
    } else if (currentMode === 'longBreak') {
        playSound(appData.pomodoroConfig.soundLong || 'gong');
        currentMode = 'work'; timerSecondsLeft = appData.pomodoroConfig.workMin * 60;
        document.getElementById('timer-status').textContent = "Session de Travail";
    }

    document.getElementById('timer-cycles').textContent = `Cycle ${currentCycle}`;
    updateClockDisplay();
    alert('Temps écoulé !');
}

function updateClockDisplay() {
    const mins = Math.floor(timerSecondsLeft / 60);
    const secs = timerSecondsLeft % 60;
    document.getElementById('timer-time').textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// MODAL BILAN
function openBilanModal() {
    const modal = document.getElementById('modal-bilan');
    const summary = document.getElementById('bilan-stats-summary');
    const list = document.getElementById('bilan-history-list');

    let totalMins = 0;
    appData.pomodoroHistory.forEach(h => totalMins += h.minutes);
    const totalHours = (totalMins / 60).toFixed(1);

    summary.innerHTML = `🏆 **Total Étudié :** ${totalHours} heures (${totalMins} min) | **${appData.pomodoroHistory.length} Sessions**`;

    list.innerHTML = '';
    if (appData.pomodoroHistory.length === 0) {
        list.innerHTML = '<p>Aucune session enregistrée.</p>';
    } else {
        appData.pomodoroHistory.slice().reverse().forEach(h => {
            list.innerHTML += `<div style="padding:8px; border-bottom:1px solid var(--border);">
                📅 <strong>${h.date}</strong> - ${h.moduleName} : ⏱️ ${h.minutes} min
            </div>`;
        });
    }
    modal.classList.remove('hidden');
}

function closeBilanModal() { document.getElementById('modal-bilan').classList.add('hidden'); }

// --- TÂCHES PERSO & RECOMMANDATIONS ---
function renderTasksPinterest() {
    const grid = document.getElementById('tasks-pinterest-grid');
    if (!grid) return;
    grid.innerHTML = '';

    appData.customTasks.forEach(t => {
        const card = document.createElement('div');
        card.className = 'pinterest-card';
        card.innerHTML = `
            <span class="pinterest-card-tag">Énergie ${t.energy}</span>
            <h3>${t.name}</h3>
            <p style="margin-top:6px; font-weight:bold; color:var(--primary)">⏱️ Durée : ${t.duration}</p>
            <button class="btn-danger" style="margin-top:10px; padding:4px 8px;" onclick="deleteCustomTask(${t.id})">🗑️ Supprimer</button>
        `;
        grid.appendChild(card);
    });
}

function deleteCustomTask(id) { appData.customTasks = appData.customTasks.filter(t => t.id !== id); saveData(); renderTasksPinterest(); }

function calculateUltimateTask() {
    const energy = document.getElementById('rec-energy').value;
    const timeStr = document.getElementById('rec-time').value;
    const timeMins = parseFlexibleTime(timeStr);
    const box = document.getElementById('ultimate-task-result');

    const matching = appData.customTasks.filter(t => t.energy === energy && parseFlexibleTime(t.duration) <= timeMins);

    let html = `<h3>🚀 Recommandation suggérée :</h3>`;
    if (matching.length > 0) {
        const best = matching[Math.floor(Math.random() * matching.length)];
        html += `<p class="mt-20"><strong>${best.name}</strong> (${best.duration})</p>`;
    } else {
        html += `<p class="mt-20">Réviser ${timeMins} min de l'Étape 1 ou 2 d'un de vos modules d'études.</p>`;
    }
    box.innerHTML = html; box.classList.remove('hidden');
}

// --- THÈMES ET MODALS ---
function setTheme(name) { appData.currentTheme = name; applyTheme(name); saveData(); }
function applyTheme(name) { document.body.className = `theme-${name}`; }

function openAddModuleModal() { document.getElementById('modal-add-module').classList.remove('hidden'); }
function closeAddModuleModal() { document.getElementById('modal-add-module').classList.add('hidden'); }
function openAddSlotModal() { document.getElementById('modal-add-slot').classList.remove('hidden'); }
function closeAddSlotModal() { document.getElementById('modal-add-slot').classList.add('hidden'); }
function openAddTaskModal() { document.getElementById('modal-add-task').classList.remove('hidden'); }
function closeAddTaskModal() { document.getElementById('modal-add-task').classList.add('hidden'); }
function openActivityBankModal() { renderSavedActivitiesList(); document.getElementById('modal-activity-bank').classList.remove('hidden'); }
function closeActivityBankModal() { document.getElementById('modal-activity-bank').classList.add('hidden'); }

// --- GITHUB API PUSH/PULL & IMPORT/EXPORT JSON ---
function exportDataJSON() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(appData, null, 2));
    const dl = document.createElement('a'); dl.setAttribute("href", dataStr); dl.setAttribute("download", "focus_backup.json");
    document.body.appendChild(dl); dl.click(); dl.remove();
}

function importDataJSON(e) {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = function(evt) {
        try {
            appData = JSON.parse(evt.target.result); saveData(); renderApp(); alert('Données importées avec succès !');
        } catch(err) { alert('Fichier JSON invalide.'); }
    };
    reader.readAsText(file);
}

async function pushToGitHub() {
    const { token, repo } = appData.githubConfig; if (!token || !repo) return;
    const url = `https://api.github.com/repos/${repo}/contents/data.json`;
    const contentBase64 = btoa(unescape(encodeURIComponent(JSON.stringify(appData, null, 2))));
    try {
        let sha = null;
        const getRes = await fetch(url, { headers: { 'Authorization': `token ${token}` } });
        if (getRes.ok) { const fileData = await getRes.json(); sha = fileData.sha; }
        await fetch(url, {
            method: 'PUT',
            headers: { 'Authorization': `token ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: 'Update FocusStudy Data', content: contentBase64, sha: sha })
        });
    } catch (err) { console.error('GitHub Push Error:', err); }
}

async function pullFromGitHub() {
    const { token, repo } = appData.githubConfig;
    if (!token || !repo) { alert('Renseignez d\'abord vos identifiants GitHub.'); return; }
    const url = `https://api.github.com/repos/${repo}/contents/data.json`;
    try {
        const res = await fetch(url, { headers: { 'Authorization': `token ${token}` } });
        if (res.ok) {
            const data = await res.json();
            const decoded = decodeURIComponent(escape(atob(data.content)));
            appData = JSON.parse(decoded);
            localStorage.setItem('focus_study_app_data', JSON.stringify(appData));
            applyTheme(appData.currentTheme || 'dopamine-pastel'); renderApp(); alert('Données synchronisées depuis GitHub !');
        }
    } catch (err) { alert('Erreur Pull GitHub: ' + err.message); }
}
