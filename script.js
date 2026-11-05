// --- DONNÉES & LOCALSTORAGE ---
let appData = {
  modules: JSON.parse(localStorage.getItem('study_modules')) || [],
  planning: JSON.parse(localStorage.getItem('study_planning')) || [],
  timeSlots: JSON.parse(localStorage.getItem('study_timeSlots')) || [],
  savedActivities: JSON.parse(localStorage.getItem('study_savedActivities')) || [],
  timetable: JSON.parse(localStorage.getItem('study_timetable')) || {}
};

function saveData() {
  localStorage.setItem('study_modules', JSON.stringify(appData.modules));
  localStorage.setItem('study_planning', JSON.stringify(appData.planning));
  localStorage.setItem('study_timeSlots', JSON.stringify(appData.timeSlots || []));
  localStorage.setItem('study_savedActivities', JSON.stringify(appData.savedActivities || []));
  localStorage.setItem('study_timetable', JSON.stringify(appData.timetable || {}));
  updateGlobalStats();
}

// Navigation entre les onglets
function switchTab(tabId) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));
  
  const targetTab = document.getElementById(`tab-${tabId}`);
  if (targetTab) targetTab.classList.add('active');
  
  if (event && event.target) {
    event.target.classList.add('active');
  }

  if (tabId === 'pomodoro') updatePomodoroDropdown();
  if (tabId === 'config') loadSyncCredentials();
}

function toggleForm(formId) {
  const form = document.getElementById(formId);
  if (form) {
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
  }
}

// --- SÉLECTION DE PALETTE PASTEL ---
function initPastelPalette() {
  const swatches = document.querySelectorAll('#pastel-palette .swatch');
  swatches.forEach(swatch => {
    swatch.addEventListener('click', () => {
      swatches.forEach(s => s.classList.remove('selected'));
      swatch.classList.add('selected');
      const colorInput = document.getElementById('mod-color');
      if (colorInput) {
        colorInput.value = swatch.getAttribute('data-color');
      }
    });
  });
}

// --- GESTION DES MODULES ---
function createModule() {
  const nameInput = document.getElementById('mod-title');
  const name = nameInput ? nameInput.value.trim() : '';
  const color = document.getElementById('mod-color')?.value || '#A7F3D0';
  const tp = parseInt(document.getElementById('mod-tp')?.value) || 0;
  const td = parseInt(document.getElementById('mod-td')?.value) || 0;

  if (!name) return alert('Veuillez entrer un nom de module.');

  const newModule = {
    id: Date.now(),
    name: name,
    color: color,
    tpCount: tp,
    tdCount: td,
    collapsed: false,
    chapters: []
  };

  appData.modules.push(newModule);
  saveData();
  renderModules();
  if (nameInput) nameInput.value = '';
  toggleForm('form-add-module');
}

function deleteModule(modId) {
  if (confirm('Voulez-vous vraiment supprimer ce module ?')) {
    appData.modules = appData.modules.filter(m => m.id !== modId);
    saveData();
    renderModules();
  }
}

// Cliquer sur le module pour le réduire ou le ré-ouvrir
function toggleModuleCollapse(modId) {
  const mod = appData.modules.find(m => m.id === modId);
  if (mod) {
    mod.collapsed = !mod.collapsed;
    saveData();
    renderModules();
  }
}

function moveModule(index, direction, evt) {
  if (evt) evt.stopPropagation();
  const newIndex = index + direction;
  if (newIndex < 0 || newIndex >= appData.modules.length) return;
  const temp = appData.modules[index];
  appData.modules[index] = appData.modules[newIndex];
  appData.modules[newIndex] = temp;
  saveData();
  renderModules();
}

// --- CHAPITRES & ÉTAPES (3 ÉTAPES) ---
function addChapter(modId) {
  const title = prompt('Titre du chapitre :');
  if (!title) return;

  const mod = appData.modules.find(m => m.id === modId);
  if (mod) {
    mod.chapters.push({
      id: Date.now(),
      title: title,
      steps: [
        { id: 1, label: "1. Écouter / noter l'audio", done: false },
        { id: 2, label: "2. Comprendre le reste", done: false },
        { id: 3, label: "3. Faire un résumé", done: false }
      ]
    });
    saveData();
    renderModules();
  }
}

function deleteChapter(modId, chapId) {
  const mod = appData.modules.find(m => m.id === modId);
  if (mod) {
    mod.chapters = mod.chapters.filter(c => c.id !== chapId);
    saveData();
    renderModules();
  }
}

function toggleStep(modId, chapId, stepId) {
  const mod = appData.modules.find(m => m.id === modId);
  if (mod) {
    const chap = mod.chapters.find(c => c.id === chapId);
    if (chap) {
      const step = chap.steps.find(s => s.id === stepId);
      if (step) step.done = !step.done;
      saveData();
      renderModules();
    }
  }
}

function renderModules() {
  const container = document.getElementById('modules-list');
  if (!container) return;
  container.innerHTML = '';

  if (!appData.modules || appData.modules.length === 0) {
    container.innerHTML = '<p style="color: var(--text-muted);">Aucun module ajouté pour le moment.</p>';
    return;
  }

  appData.modules.forEach((mod, index) => {
    const card = document.createElement('div');
    card.className = `module-card ${mod.collapsed ? 'collapsed' : ''}`;
    card.style.borderLeftColor = mod.color || '#6366f1';

    let chaptersHTML = (mod.chapters || []).map(chap => `
      <div class="chapter-item">
        <div class="chapter-header">
          <span>📖 ${chap.title}</span>
          <button class="btn btn-danger btn-small" onclick="deleteChapter(${mod.id}, ${chap.id})">✕</button>
        </div>
        <ul class="steps-list">
          ${(chap.steps || []).map(step => `
            <li class="step-item ${step.done ? 'completed' : ''}">
              <input type="checkbox" ${step.done ? 'checked' : ''} onchange="toggleStep(${mod.id}, ${chap.id}, ${step.id})">
              <span>${step.label}</span>
            </li>
          `).join('')}
        </ul>
      </div>
    `).join('');

    card.innerHTML = `
      <div class="module-header" onclick="toggleModuleCollapse(${mod.id})">
        <div class="module-title-wrapper">
          <span class="toggle-icon">▼</span>
          <span class="module-title" style="color: ${mod.color || '#ffffff'}">${mod.name}</span>
        </div>
        <div class="module-actions" onclick="event.stopPropagation()">
          <button class="btn btn-secondary btn-small" onclick="moveModule(${index}, -1, event)">▲</button>
          <button class="btn btn-secondary btn-small" onclick="moveModule(${index}, 1, event)">▼</button>
          <button class="btn btn-danger btn-small" onclick="deleteModule(${mod.id})">✕</button>
        </div>
      </div>
      
      <div class="module-body">
        <div class="module-info">
          🧪 TP : ${mod.tpCount || 0} | 📝 TD : ${mod.tdCount || 0} | 📚 Chapitres : ${(mod.chapters || []).length}
        </div>

        <button class="btn btn-small full-width" style="margin-bottom: 10px;" onclick="addChapter(${mod.id})">+ Ajouter un chapitre</button>
        
        <div class="chapter-container">${chaptersHTML}</div>
      </div>
    `;

    container.appendChild(card);
  });
}

// --- STATISTIQUES GLOBALES ---
function updateGlobalStats() {
  const modCountEl = document.getElementById('stat-modules-count');
  const tpCountEl = document.getElementById('stat-tp-count');
  const tdCountEl = document.getElementById('stat-td-count');
  const progEl = document.getElementById('stat-progression');

  if (!modCountEl) return;

  modCountEl.innerText = (appData.modules || []).length;

  let totalTP = 0, totalTD = 0, totalSteps = 0, completedSteps = 0;

  (appData.modules || []).forEach(m => {
    totalTP += m.tpCount || 0;
    totalTD += m.tdCount || 0;
    (m.chapters || []).forEach(c => {
      (c.steps || []).forEach(s => {
        totalSteps++;
        if (s.done) completedSteps++;
      });
    });
  });

  if (tpCountEl) tpCountEl.innerText = totalTP;
  if (tdCountEl) tdCountEl.innerText = totalTD;

  const progressPct = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
  if (progEl) progEl.innerText = `${progressPct}%`;
}

// --- RECOMMANDATEUR ANTI-MOOD ---
function generateRecommendation() {
  const time = parseInt(document.getElementById('mood-time')?.value) || 30;
  const fatigue = parseInt(document.getElementById('mood-fatigue')?.value) || 1;
  const mood = document.getElementById('mood-state')?.value || 'neutral';
  const output = document.getElementById('recommendation-output');

  if (!output) return;

  if (!appData.modules || appData.modules.length === 0) {
    output.style.display = 'block';
    output.innerHTML = '<strong>Remarque :</strong> Ajoutez au moins un module pour recevoir une recommandation.';
    return;
  }

  const randomMod = appData.modules[Math.floor(Math.random() * appData.modules.length)];
  let advice = "";

  if (fatigue >= 4 || mood === 'demotivated') {
    advice = `💡 <strong>Stratégie Basse Énergie (${time} min)</strong> :<br>Ne forcez pas sur la théorie lourde. Prenez le module <strong>${randomMod.name}</strong> et réalisez l'<strong>Étape 1 (Écouter / noter l'audio)</strong> ou révisez un exercice de TD simple.`;
  } else if (fatigue === 3 || mood === 'distracted') {
    advice = `⚡ <strong>Stratégie Focus Modéré (${time} min)</strong> :<br>Lancez une session Pomodoro de 20-25 min sur <strong>${randomMod.name}</strong>. Effectuez l'<strong>Étape 3 (Faire un résumé)</strong> d'un chapitre.`;
  } else {
    advice = `🚀 <strong>Stratégie Haute Énergie (${time} min)</strong> :<br>Profitez de votre état ! Attaquez l'<strong>Étape 2 (Comprendre le reste)</strong> ou travaillez vos TP sur le module <strong>${randomMod.name}</strong>.`;
  }

  output.style.display = 'block';
  output.innerHTML = advice;
}

// --- PLANNING UNIVERSITAIRE ---
function addPlanningItem() {
  const titleInput = document.getElementById('plan-title');
  const dateInput = document.getElementById('plan-date');
  const title = titleInput ? titleInput.value.trim() : '';
  const date = dateInput ? dateInput.value : '';

  if (!title || !date) return alert('Veuillez remplir le titre et la date.');

  if (!appData.planning) appData.planning = [];
  appData.planning.push({ id: Date.now(), title, date });
  saveData();
  renderPlanning();
  if (titleInput) titleInput.value = '';
}

function deletePlanningItem(id) {
  appData.planning = (appData.planning || []).filter(p => p.id !== id);
  saveData();
  renderPlanning();
}

function renderPlanning() {
  const container = document.getElementById('planning-list');
  if (!container) return;

  if (!appData.planning || appData.planning.length === 0) {
    container.innerHTML = '<p style="color: var(--text-muted); font-size: 0.85rem;">Aucun événement planifié.</p>';
    return;
  }

  container.innerHTML = appData.planning.map(item => `
    <div class="planning-item">
      <div>
        <div style="font-weight: 600;">${item.title}</div>
        <div style="font-size: 0.75rem; color: var(--text-muted);">${new Date(item.date).toLocaleString('fr-FR')}</div>
      </div>
      <button class="btn btn-danger btn-small" onclick="deletePlanningItem(${item.id})">✕</button>
    </div>
  `).join('');
}

// --- MINUTEUR POMODORO ---
let timerInterval = null;
let timeLeft = 25 * 60;
let isRunning = false;

function updatePomodoroDropdown() {
  const select = document.getElementById('pomo-module-select');
  if (!select) return;
  select.innerHTML = (appData.modules || []).map(m => `<option value="${m.id}">${m.name}</option>`).join('');
}

function startTimer() {
  if (isRunning) return;
  isRunning = true;
  const startBtn = document.getElementById('pomo-start-btn');
  if (startBtn) startBtn.innerText = 'En cours...';

  timerInterval = setInterval(() => {
    if (timeLeft > 0) {
      timeLeft--;
      updateTimerDisplay();
    } else {
      clearInterval(timerInterval);
      isRunning = false;
      if (startBtn) startBtn.innerText = 'Démarrer';
      alert('Session Pomodoro terminée ! Prenez une pause.');
    }
  }, 1000);
}

function pauseTimer() {
  clearInterval(timerInterval);
  isRunning = false;
  const startBtn = document.getElementById('pomo-start-btn');
  if (startBtn) startBtn.innerText = 'Démarrer';
}

function resetTimer() {
  pauseTimer();
  const workDur = parseInt(document.getElementById('pomo-work')?.value) || 25;
  timeLeft = workDur * 60;
  updateTimerDisplay();
}

function updateTimerDisplay() {
  const display = document.getElementById('timer-display');
  if (!display) return;
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  display.innerText = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// --- CONFIGURATION : EXPORT & IMPORT LOCAL JSON ---
function exportJSON() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(appData, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `study_app_backup_${new Date().toISOString().slice(0,10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

function importJSON() {
  const fileInput = document.getElementById('import-file');
  if (!fileInput || !fileInput.files.length) return alert('Veuillez sélectionner un fichier JSON.');

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const importedData = JSON.parse(e.target.result);
      appData = {
        modules: importedData.modules || [],
        planning: importedData.planning || [],
        timeSlots: importedData.timeSlots || [],
        savedActivities: importedData.savedActivities || [],
        timetable: importedData.timetable || {}
      };
      saveData();
      renderModules();
      renderPlanning();
      alert('Données importées avec succès !');
    } catch (err) {
      alert('Erreur lors de la lecture du fichier JSON.');
    }
  };
  reader.readAsText(fileInput.files[0]);
}

// --- CONFIGURATION : SYNCHRO GITHUB GIST ---
function saveSyncCredentials() {
  const token = document.getElementById('github-token')?.value.trim() || '';
  const gistId = document.getElementById('github-gist-id')?.value.trim() || '';

  localStorage.setItem('study_gh_token', token);
  localStorage.setItem('study_gh_gist_id', gistId);
  alert('Identifiants GitHub enregistrés.');
}

function loadSyncCredentials() {
  const tokenInput = document.getElementById('github-token');
  const gistInput = document.getElementById('github-gist-id');
  if (tokenInput) tokenInput.value = localStorage.getItem('study_gh_token') || '';
  if (gistInput) gistInput.value = localStorage.getItem('study_gh_gist_id') || '';
}

async function pushToGist() {
  const token = localStorage.getItem('study_gh_token');
  const gistId = localStorage.getItem('study_gh_gist_id');
  const statusEl = document.getElementById('sync-status');

  if (!token || !gistId) return alert('Veuillez d\'abord enregistrer votre Jeton et Gist ID.');

  if (statusEl) statusEl.innerText = "Envoi des données en cours...";
  try {
    const res = await fetch(`https://api.github.com/gists/${gistId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `token ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        files: {
          "study_data.json": { content: JSON.stringify(appData, null, 2) }
        }
      })
    });

    if (res.ok) {
      if (statusEl) statusEl.innerText = "✅ Données envoyées au Cloud avec succès !";
    } else {
      if (statusEl) statusEl.innerText = "❌ Erreur lors de l'envoi vers GitHub.";
    }
  } catch (e) {
    if (statusEl) statusEl.innerText = "❌ Erreur de connexion réseau.";
  }
}

async function pullFromGist() {
  const token = localStorage.getItem('study_gh_token');
  const gistId = localStorage.getItem('study_gh_gist_id');
  const statusEl = document.getElementById('sync-status');

  if (!token || !gistId) return alert('Veuillez d\'abord enregistrer votre Jeton et Gist ID.');

  if (statusEl) statusEl.innerText = "Récupération des données...";
  try {
    const res = await fetch(`https://api.github.com/gists/${gistId}`, {
      headers: { 'Authorization': `token ${token}` }
    });

    if (res.ok) {
      const data = await res.json();
      const content = data.files["study_data.json"]?.content || "{}";
      const importedData = JSON.parse(content);
      
      appData = {
        modules: importedData.modules || [],
        planning: importedData.planning || [],
        timeSlots: importedData.timeSlots || [],
        savedActivities: importedData.savedActivities || [],
        timetable: importedData.timetable || {}
      };
      
      saveData();
      renderModules();
      renderPlanning();
      if (statusEl) statusEl.innerText = "✅ Données synchronisées depuis le Cloud !";
    } else {
      if (statusEl) statusEl.innerText = "❌ Erreur lors de la récupération.";
    }
  } catch (e) {
    if (statusEl) statusEl.innerText = "❌ Erreur réseau.";
  }
}

// --- INITIALISATION AUTOMATIQUE ---
document.addEventListener('DOMContentLoaded', () => {
  initPastelPalette();
  renderModules();
  renderPlanning();
  updateGlobalStats();
});
