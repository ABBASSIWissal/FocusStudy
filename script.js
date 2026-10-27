// --- BASE DE DONNÉES DE L'APPLICATION ---
let appData = {
    modules: [],
    routines: [],
    customTasks: [
        { id: 1, name: "Écouter & annoter les audios de cours", energy: "low", duration: 25 },
        { id: 2, name: "Faire une fiche de résumé rapide", energy: "medium", duration: 20 },
        { id: 3, name: "Résoudre une série de T.D / T.P complexes", energy: "high", duration: 45 }
    ],
    pomodoroConfig: {
        workMin: 25,
        shortBreakMin: 5,
        longBreakMin: 15,
        cyclesBeforeLong: 4
    },
    githubConfig: { token: '', repo: '' },
    currentTheme: 'dopamine'
};

// Variables globales Pomodoro
let timerInterval = null;
let timerSecondsLeft = 25 * 60;
let isTimerRunning = false;
let currentMode = 'work'; // 'work', 'shortBreak', 'longBreak'
let currentCycle = 1;
let selectedModuleIdForPomo = null;
let activeDetailModuleId = null;

// --- INITIALISATION ---
document.addEventListener('DOMContentLoaded', () => {
    loadLocalData();
    initNavigation();
    initEventListeners();
    applyTheme(appData.currentTheme);
    renderApp();
    registerSW();
});

function registerSW() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js').catch(err => console.log('SW error:', err));
    }
}

function loadLocalData() {
    const saved = localStorage.getItem('focus_study_app_data');
    if (saved) {
        appData = JSON.parse(saved);
        if (!appData.customTasks) appData.customTasks = [];
        if (!appData.routines) appData.routines = [];
    }
}

function saveData() {
    localStorage.setItem('focus_study_app_data', JSON.stringify(appData));
    if (appData.githubConfig && appData.githubConfig.token && appData.githubConfig.repo) {
        pushToGitHub();
    }
}

// NAVIGATION ONGLETS
function initNavigation() {
    const navBtns = document.querySelectorAll('.nav-btn');
    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            navBtns.forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-pane').forEach(tab => tab.classList.remove('active'));

            btn.classList.add('active');
            const targetTab = btn.dataset.tab;
            document.getElementById(targetTab).classList.add('active');
        });
    });
}

function initEventListeners() {
    // Formulaire Nouveau Module
    document.getElementById('form-create-module').addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('new-mod-name').value;
        const color = document.getElementById('new-mod-color').value;
        const td = parseInt(document.getElementById('new-mod-td').value) || 0;
        const tp = parseInt(document.getElementById('new-mod-tp').value) || 0;
        const chapCount = parseInt(document.getElementById('new-mod-chap').value) || 1;

        const chapters = [];
        for (let i = 1; i <= chapCount; i++) {
            chapters.push({
                id: Date.now() + i,
                title: `Chapitre ${i}`,
                step1: false, // 1. écouter/noter l'audio (OBLIGATOIRE)
                step2: false, // 2. comprendre le reste
                step3: false  // 3. faire un résumé
            });
        }

        const newMod = {
            id: Date.now(),
            name,
            color,
            tdCount: td,
            tdDone: 0,
            tpCount: tp,
            tpDone: 0,
            chapters,
            pomodoroMinutes: 0
        };

        appData.modules.push(newMod);
        saveData();
        renderApp();
        closeAddModuleModal();
        document.getElementById('form-create-module').reset();
    });

    // Formulaire Édition Module
    document.getElementById('form-edit-module').addEventListener('submit', (e) => {
        e.preventDefault();
        const id = parseInt(document.getElementById('edit-mod-id').value);
        const mod = appData.modules.find(m => m.id === id);
        if (mod) {
            mod.name = document.getElementById('edit-mod-name').value;
            mod.color = document.getElementById('edit-mod-color').value;
            mod.tdCount = parseInt(document.getElementById('edit-mod-td').value) || 0;
            mod.tpCount = parseInt(document.getElementById('edit-mod-tp').value) || 0;
            saveData();
            renderApp();
            closeEditModuleModal();
        }
    });

    // Formulaire Routine Fixe
    document.getElementById('form-add-routine').addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('routine-title').value;
        const day = document.getElementById('routine-day').value;
        const start = document.getElementById('routine-start').value;
        const end = document.getElementById('routine-end').value;

        appData.routines.push({ id: Date.now(), title, day, start, end });
        saveData();
        renderRoutines();
        document.getElementById('form-add-routine').reset();
    });

    // Formulaire Tâche Personnalisée
    document.getElementById('form-add-task').addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('task-name').value;
        const energy = document.getElementById('task-energy').value;
        const duration = parseInt(document.getElementById('task-duration').value) || 20;

        appData.customTasks.push({ id: Date.now(), name, energy, duration });
        saveData();
        renderCustomTasks();
        document.getElementById('form-add-task').reset();
    });

    // Formulaire GitHub
    document.getElementById('form-github-sync').addEventListener('submit', (e) => {
        e.preventDefault();
        appData.githubConfig.token = document.getElementById('gh-token').value.trim();
        appData.githubConfig.repo = document.getElementById('gh-repo').value.trim();
        saveData();
        alert('Identifiants GitHub sauvegardés !');
    });

    // Minuteur Pomodoro BTNS
    document.getElementById('btn-pomo-start').addEventListener('click', startPomodoro);
    document.getElementById('btn-pomo-pause').addEventListener('click', pausePomodoro);
    document.getElementById('btn-pomo-reset').addEventListener('click', resetPomodoro);
    document.getElementById('pomo-module-select').addEventListener('change', (e) => {
        selectedModuleIdForPomo = e.target.value ? parseInt(e.target.value) : null;
    });
}

// --- RENDU GLOBAL ---
function renderApp() {
    renderModulesHorizontal();
    renderPomodoroSelect();
    renderRoutines();
    renderCustomTasks();
    if (activeDetailModuleId) renderModuleDetail(activeDetailModuleId);
}

// RENDU HORIZONTAL DES MODULES
function renderModulesHorizontal() {
    const list = document.getElementById('modules-horizontal-list');
    list.innerHTML = '';

    if (appData.modules.length === 0) {
        list.innerHTML = '<p>Aucun module. Cliquez sur "Nouveau Module" pour commencer !</p>';
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
        const timeFormatted = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

        const card = document.createElement('div');
        card.className = 'module-card-mini';
        card.style.borderTopColor = mod.color;
        card.onclick = () => selectModuleDetail(mod.id);

        card.innerHTML = `
            <div class="mod-header">
                <span class="mod-title" style="color:${mod.color}">${mod.name}</span>
                <span class="mod-pomo-time">⏱️ ${timeFormatted}</span>
            </div>
            <p style="font-size:0.85rem; color:var(--text-muted)">📖 ${mod.chapters.length} Chapitres | 📝 ${mod.tdCount} TD | 🧪 ${mod.tpCount} TP</p>
            <div class="progress-bar">
                <div class="progress-fill" style="width:${percent}%"></div>
            </div>
            <p style="font-size:0.8rem; text-align:right; font-weight:bold">${percent}% complété</p>
        `;
        list.appendChild(card);
    });
}

function selectModuleDetail(id) {
    activeDetailModuleId = id;
    renderModuleDetail(id);
}

// VUE DÉTAILLÉE DU MODULE + REGLE STRICTE STEP 1
function renderModuleDetail(id) {
    const container = document.getElementById('module-detail-container');
    const mod = appData.modules.find(m => m.id === id);
    if (!mod) {
        container.classList.add('hidden');
        return;
    }

    container.classList.remove('hidden');
    container.style.borderTopColor = mod.color;

    let chaptersHTML = '';
    mod.chapters.forEach((chap, idx) => {
        // Règle séquentielle : Étape 1 OBLIGATOIRE avant Étape 2 et Étape 3
        const step1Done = chap.step1;

        chaptersHTML += `
            <div class="chapter-box">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                    <input type="text" value="${chap.title}" onchange="updateChapterTitle(${mod.id}, ${chap.id}, this.value)" style="font-weight:bold; width:80%;">
                    <button class="btn-danger" onclick="deleteChapter(${mod.id}, ${chap.id})" style="padding:4px 8px;">🗑️</button>
                </div>
                <div class="steps-list">
                    <label class="step-item">
                        <input type="checkbox" ${chap.step1 ? 'checked' : ''} onchange="toggleStep(${mod.id}, ${chap.id}, 'step1')">
                        <strong>Étape 1 :</strong> Écouter / Noter l'audio de cours
                    </label>

                    <label class="step-item ${!step1Done ? 'disabled' : ''}">
                        <input type="checkbox" ${chap.step2 ? 'checked' : ''} ${!step1Done ? 'disabled' : ''} onchange="toggleStep(${mod.id}, ${chap.id}, 'step2')">
                        ${!step1Done ? '🔒' : '<strong>Étape 2 :</strong>'} Comprendre le reste du cours
                    </label>

                    <label class="step-item ${!step1Done ? 'disabled' : ''}">
                        <input type="checkbox" ${chap.step3 ? 'checked' : ''} ${!step1Done ? 'disabled' : ''} onchange="toggleStep(${mod.id}, ${chap.id}, 'step3')">
                        ${!step1Done ? '🔒' : '<strong>Étape 3 :</strong>'} Faire le résumé final
                    </label>
                </div>
            </div>
        `;
    });

    container.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
            <h2 style="color:${mod.color}">${mod.name} (Détails)</h2>
            <div>
                <button class="btn-warning" onclick="openEditModuleModal(${mod.id})">✏️ Éditer</button>
                <button class="btn-danger" onclick="deleteModule(${mod.id})">🗑️ Supprimer</button>
            </div>
        </div>

        <div style="display:flex; gap:15px; margin-bottom:15px;">
            <p><strong>T.D Réalisés :</strong> ${mod.tdDone} / ${mod.tdCount} 
                <button class="btn-secondary" onclick="updateTDDone(${mod.id}, 1)" style="padding:2px 6px;">+</button>
                <button class="btn-secondary" onclick="updateTDDone(${mod.id}, -1)" style="padding:2px 6px;">-</button>
            </p>
            <p><strong>T.P Réalisés :</strong> ${mod.tpDone} / ${mod.tpCount} 
                <button class="btn-secondary" onclick="updateTPDone(${mod.id}, 1)" style="padding:2px 6px;">+</button>
                <button class="btn-secondary" onclick="updateTPDone(${mod.id}, -1)" style="padding:2px 6px;">-</button>
            </p>
        </div>

        <h3>Chapitres</h3>
        ${chaptersHTML}
        <button class="btn-primary mt-20" onclick="addNewChapter(${mod.id})">➕ Ajouter un Chapitre</button>
    `;
}

// DÉVERROUILLAGE SÉQUENTIEL & ACTIONS ETAPES
function toggleStep(modId, chapId, stepKey) {
    const mod = appData.modules.find(m => m.id === modId);
    if (!mod) return;
    const chap = mod.chapters.find(c => c.id === chapId);
    if (!chap) return;

    if (stepKey === 'step1') {
        chap.step1 = !chap.step1;
        if (!chap.step1) {
            chap.step2 = false;
            chap.step3 = false;
        }
    } else if (stepKey === 'step2' && chap.step1) {
        chap.step2 = !chap.step2;
    } else if (stepKey === 'step3' && chap.step1) {
        chap.step3 = !chap.step3;
    }

    saveData();
    renderApp();
}

function updateChapterTitle(modId, chapId, newTitle) {
    const mod = appData.modules.find(m => m.id === modId);
    if (mod) {
        const chap = mod.chapters.find(c => c.id === chapId);
        if (chap) {
            chap.title = newTitle;
            saveData();
        }
    }
}

function addNewChapter(modId) {
    const mod = appData.modules.find(m => m.id === modId);
    if (mod) {
        mod.chapters.push({
            id: Date.now(),
            title: `Nouveau Chapitre ${mod.chapters.length + 1}`,
            step1: false,
            step2: false,
            step3: false
        });
        saveData();
        renderApp();
    }
}

function deleteChapter(modId, chapId) {
    const mod = appData.modules.find(m => m.id === modId);
    if (mod && confirm('Supprimer ce chapitre ?')) {
        mod.chapters = mod.chapters.filter(c => c.id !== chapId);
        saveData();
        renderApp();
    }
}

function updateTDDone(modId, delta) {
    const mod = appData.modules.find(m => m.id === modId);
    if (mod) {
        mod.tdDone = Math.max(0, Math.min(mod.tdCount, mod.tdDone + delta));
        saveData();
        renderApp();
    }
}

function updateTPDone(modId, delta) {
    const mod = appData.modules.find(m => m.id === modId);
    if (mod) {
        mod.tpDone = Math.max(0, Math.min(mod.tpCount, mod.tpDone + delta));
        saveData();
        renderApp();
    }
}

function deleteModule(modId) {
    if (confirm('Voulez-vous supprimer ce module ?')) {
        appData.modules = appData.modules.filter(m => m.id !== modId);
        activeDetailModuleId = null;
        saveData();
        renderApp();
    }
}

// --- LOGIQUE POMODORO ---
function renderPomodoroSelect() {
    const sel = document.getElementById('pomo-module-select');
    sel.innerHTML = '<option value="">-- Session libre / Aucun module --</option>';
    appData.modules.forEach(m => {
        const opt = document.createElement('option');
        opt.value = m.id;
        opt.textContent = m.name;
        if (selectedModuleIdForPomo === m.id) opt.selected = true;
        sel.appendChild(opt);
    });
}

function applyPomodoroConfig() {
    appData.pomodoroConfig.workMin = parseInt(document.getElementById('cfg-pomo-work').value) || 25;
    appData.pomodoroConfig.shortBreakMin = parseInt(document.getElementById('cfg-pomo-short').value) || 5;
    appData.pomodoroConfig.longBreakMin = parseInt(document.getElementById('cfg-pomo-long').value) || 15;
    appData.pomodoroConfig.cyclesBeforeLong = parseInt(document.getElementById('cfg-pomo-cycles').value) || 4;
    saveData();
    resetPomodoro();
    alert('Système Pomodoro mis à jour !');
}

function startPomodoro() {
    if (isTimerRunning) return;
    isTimerRunning = true;

    timerInterval = setInterval(() => {
        if (timerSecondsLeft > 0) {
            timerSecondsLeft--;
            updateClockDisplay();
        } else {
            handleTimerCompletion();
        }
    }, 1000);
}

function pausePomodoro() {
    clearInterval(timerInterval);
    isTimerRunning = false;
}

function resetPomodoro() {
    pausePomodoro();
    currentMode = 'work';
    timerSecondsLeft = appData.pomodoroConfig.workMin * 60;
    updateClockDisplay();
    document.getElementById('timer-status').textContent = "Session de Travail";
}

function handleTimerCompletion() {
    pausePomodoro();

    if (currentMode === 'work') {
        // Ajouter le temps au module sélectionné
        if (selectedModuleIdForPomo) {
            const mod = appData.modules.find(m => m.id === selectedModuleIdForPomo);
            if (mod) {
                mod.pomodoroMinutes += appData.pomodoroConfig.workMin;
                saveData();
                renderModulesHorizontal();
            }
        }

        if (currentCycle % appData.pomodoroConfig.cyclesBeforeLong === 0) {
            currentMode = 'longBreak';
            timerSecondsLeft = appData.pomodoroConfig.longBreakMin * 60;
            document.getElementById('timer-status').textContent = "Pause Longue ! ☕";
        } else {
            currentMode = 'shortBreak';
            timerSecondsLeft = appData.pomodoroConfig.shortBreakMin * 60;
            document.getElementById('timer-status').textContent = "Pause Courte ! ☕";
        }
        currentCycle++;
    } else {
        currentMode = 'work';
        timerSecondsLeft = appData.pomodoroConfig.workMin * 60;
        document.getElementById('timer-status').textContent = "Session de Travail";
    }

    document.getElementById('timer-cycles').textContent = `Cycle ${currentCycle}`;
    updateClockDisplay();
    alert('Minuteur Terminé !');
}

function updateClockDisplay() {
    const mins = Math.floor(timerSecondsLeft / 60);
    const secs = timerSecondsLeft % 60;
    document.getElementById('timer-time').textContent = 
        `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// --- ROUTINES & CRÉNEAUX LIBRES ---
function renderRoutines() {
    const list = document.getElementById('routines-list');
    list.innerHTML = '';
    appData.routines.forEach(r => {
        const item = document.createElement('div');
        item.style.cssText = "display:flex; justify-content:space-between; padding:8px; border-bottom:1px solid var(--border);";
        item.innerHTML = `
            <span><strong>${r.day}</strong> : ${r.title} (${r.start} - ${r.end})</span>
            <button class="btn-danger" style="padding:2px 6px;" onclick="deleteRoutine(${r.id})">❌</button>
        `;
        list.appendChild(item);
    });
}

function deleteRoutine(id) {
    appData.routines = appData.routines.filter(r => r.id !== id);
    saveData();
    renderRoutines();
}

function analyzeFreeGaps() {
    const day = document.getElementById('analyzer-day').value;
    const dayRoutines = appData.routines.filter(r => r.day === day);
    const box = document.getElementById('analyzer-results');

    if (dayRoutines.length === 0) {
        box.innerHTML = `<p>Aucune routine fixe enregistrée pour le ${day}. Votre journée est entièrement libre pour réviser !</p>`;
        return;
    }

    box.innerHTML = `<p><strong>Créneaux occupés le ${day} :</strong></p>`;
    dayRoutines.forEach(r => {
        box.innerHTML += `<p>• ${r.title} de ${r.start} à ${r.end}</p>`;
    });
    box.innerHTML += `<p class="mt-20">💡 <strong>Recommandation :</strong> Utilisez vos moments de pause entre ces activités pour caser une session Pomodoro d'Étape 1 ou 3 !</p>`;
}

// --- RECOMMANDATION ULTIME ---
function renderCustomTasks() {
    const list = document.getElementById('custom-tasks-list');
    list.innerHTML = '';
    appData.customTasks.forEach(t => {
        const item = document.createElement('div');
        item.style.cssText = "display:flex; justify-content:space-between; padding:8px; border-bottom:1px solid var(--border);";
        item.innerHTML = `
            <span>${t.name} (${t.duration} min - Énergie ${t.energy})</span>
            <button class="btn-danger" style="padding:2px 6px;" onclick="deleteCustomTask(${t.id})">❌</button>
        `;
        list.appendChild(item);
    });
}

function deleteCustomTask(id) {
    appData.customTasks = appData.customTasks.filter(t => t.id !== id);
    saveData();
    renderCustomTasks();
}

function calculateUltimateTask() {
    const energy = document.getElementById('rec-energy').value;
    const time = parseInt(document.getElementById('rec-time').value) || 30;
    const resultBox = document.getElementById('ultimate-task-result');

    const matchingTasks = appData.customTasks.filter(t => t.energy === energy && t.duration <= time);

    let html = `<h3>🚀 Option Ultime Recommandée :</h3>`;
    if (matchingTasks.length > 0) {
        const best = matchingTasks[Math.floor(Math.random() * matchingTasks.length)];
        html += `<p class="mt-20"><strong>${best.name}</strong> (${best.duration} min)</p>`;
        html += `<p style="font-size:0.9rem; color:var(--text-muted)">Cette tâche correspond exactement à votre temps (${time} min) et à votre niveau d'énergie actuel !</p>`;
    } else {
        if (energy === 'low') {
            html += `<p class="mt-20"><strong>Étape 1 d'un Module :</strong> Écoutez ou annotez 15 minutes d'audio sans vous forcer.</p>`;
        } else if (energy === 'medium') {
            html += `<p class="mt-20"><strong>Étape 3 / Fiche Résumé :</strong> Prenez un chapitre et synthétisez les notions principales.</p>`;
        } else {
            html += `<p class="mt-20"><strong>Session T.D / T.P :</strong> Lancez-vous dans la résolution d'exercices complexes !</p>`;
        }
    }

    resultBox.innerHTML = html;
    resultBox.classList.remove('hidden');
}

// --- THÈMES ---
function setTheme(name) {
    appData.currentTheme = name;
    applyTheme(name);
    saveData();
}

function applyTheme(name) {
    document.body.className = `theme-${name}`;
}

// --- MODALS ---
function openAddModuleModal() { document.getElementById('modal-add-module').classList.remove('hidden'); }
function closeAddModuleModal() { document.getElementById('modal-add-module').classList.add('hidden'); }

function openEditModuleModal(id) {
    const mod = appData.modules.find(m => m.id === id);
    if (mod) {
        document.getElementById('edit-mod-id').value = mod.id;
        document.getElementById('edit-mod-name').value = mod.name;
        document.getElementById('edit-mod-color').value = mod.color;
        document.getElementById('edit-mod-td').value = mod.tdCount;
        document.getElementById('edit-mod-tp').value = mod.tpCount;
        document.getElementById('modal-edit-module').classList.remove('hidden');
    }
}
function closeEditModuleModal() { document.getElementById('modal-edit-module').classList.add('hidden'); }

// --- IMPORT / EXPORT & GITHUB ---
function exportDataJSON() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(appData, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", "focus_study_backup.json");
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
}

function importDataJSON(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(evt) {
        try {
            appData = JSON.parse(evt.target.result);
            saveData();
            renderApp();
            alert('Données importées avec succès !');
        } catch(err) {
            alert('Erreur lors du fichier JSON : ' + err.message);
        }
    };
    reader.readAsText(file);
}

async function pushToGitHub() {
    const { token, repo } = appData.githubConfig;
    if (!token || !repo) return;

    const url = `https://api.github.com/repos/${repo}/contents/data.json`;
    const contentBase64 = btoa(unescape(encodeURIComponent(JSON.stringify(appData, null, 2))));

    try {
        let sha = null;
        const getRes = await fetch(url, { headers: { 'Authorization': `token ${token}` } });
        if (getRes.ok) {
            const fileData = await getRes.json();
            sha = fileData.sha;
        }

        await fetch(url, {
            method: 'PUT',
            headers: { 'Authorization': `token ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: 'Auto update FocusStudy',
                content: contentBase64,
                sha: sha
            })
        });
        console.log('GitHub Push OK');
    } catch (err) {
        console.error('GitHub Push Error:', err);
    }
}

async function pullFromGitHub() {
    const { token, repo } = appData.githubConfig;
    if (!token || !repo) {
        alert('Veuillez renseigner le Token et le Dépôt GitHub.');
        return;
    }

    const url = `https://api.github.com/repos/${repo}/contents/data.json`;
    try {
        const res = await fetch(url, { headers: { 'Authorization': `token ${token}` } });
        if (res.ok) {
            const data = await res.json();
            const decoded = decodeURIComponent(escape(atob(data.content)));
            appData = JSON.parse(decoded);
            localStorage.setItem('focus_study_app_data', JSON.stringify(appData));
            applyTheme(appData.currentTheme || 'dopamine');
            renderApp();
            alert('Données synchronisées depuis GitHub !');
        }
    } catch (err) {
        alert('Erreur Pull GitHub: ' + err.message);
    }
}