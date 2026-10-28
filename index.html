<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FocusStudy</title>
    <!-- Import de la police moderne Poppins -->
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700;800;900&display=swap" rel="stylesheet">
    <style>
        /* THÈMES ET PALETTES PASTELS */
        body.theme-dopamine-pastel { 
            --primary: #8C7CE6; 
            --accent: #FFB7B2; 
            --bg: #EAE6F7; 
            --card-bg: #FFFFFF; 
            --text: #2D3436; 
            --border: #E0D7F5; 
            --header-bg: #E3D7FF; 
        }

        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Poppins', system-ui, sans-serif; }
        body { background: var(--bg); color: var(--text); padding-bottom: 50px; transition: background 0.3s ease; }

        /* HEADER IDENTIQUE À LA PHOTO */
        header { 
            background: var(--header-bg); 
            padding: 2rem 2rem 2.5rem 2rem; 
        }
        .header-container { 
            max-width: 1100px; 
            margin: 0 auto; 
            display: flex; 
            flex-direction: column;
            gap: 20px; 
        }
        .logo { 
            font-size: 2.2rem; 
            font-weight: 900; 
            color: #2D3436; 
            display: flex;
            align-items: center;
            gap: 8px;
            letter-spacing: -0.5px;
        }
        .logo::before {
            content: "⚡";
            font-size: 2rem;
        }

        /* NAVIGATION EN PILULES ROUNDED */
        .main-nav { 
            display: flex; 
            gap: 12px; 
            flex-wrap: wrap; 
        }
        .nav-btn { 
            background: rgba(255, 255, 255, 0.75); 
            border: none; 
            color: #2D3436; 
            padding: 10px 22px; 
            border-radius: 50px; 
            cursor: pointer; 
            font-weight: 700; 
            font-size: 0.95rem; 
            transition: all 0.2s ease; 
            display: inline-flex;
            align-items: center;
            gap: 8px;
            box-shadow: 0 2px 6px rgba(0,0,0,0.03);
        }
        .nav-btn:hover {
            background: rgba(255, 255, 255, 0.95);
            transform: translateY(-1px);
        }
        .nav-btn.active { 
            background: #FFFFFF; 
            color: #2D3436; 
            box-shadow: 0 4px 12px rgba(0,0,0,0.08); 
        }

        /* CARTE PRINCIPALE BLANCHE ARRONDI */
        .main-content { max-width: 1100px; margin: -10px auto 0 auto; padding: 0 20px; }
        .tab-pane { display: none; }
        .tab-pane.active { display: block; }
        .card { 
            background: var(--card-bg); 
            border-radius: 24px; 
            padding: 32px; 
            box-shadow: 0 10px 30px rgba(0,0,0,0.04); 
            margin-bottom: 20px; 
        }

        /* TITRE PRINCIPAL */
        .page-title {
            font-size: 1.8rem;
            font-weight: 800;
            color: #2D3436;
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 24px;
            line-height: 1.3;
        }

        /* BARRE DE BOUTONS (Créer Horaire / Banque Activités) */
        .btn-group-row { display: flex; gap: 14px; flex-wrap: wrap; }
        .btn-action-pink {
            background-color: #FFB7B2;
            color: #2D3436;
            border: none;
            padding: 12px 22px;
            border-radius: 14px;
            font-weight: 800;
            font-size: 0.95rem;
            cursor: pointer;
            transition: transform 0.15s, opacity 0.15s;
            display: inline-flex;
            align-items: center;
            gap: 8px;
        }
        .btn-action-purple {
            background-color: #8C7CE6;
            color: #FFFFFF;
            border: none;
            padding: 12px 22px;
            border-radius: 14px;
            font-weight: 800;
            font-size: 0.95rem;
            cursor: pointer;
            transition: transform 0.15s, opacity 0.15s;
            display: inline-flex;
            align-items: center;
            gap: 8px;
        }
        .btn-action-pink:hover, .btn-action-purple:hover { opacity: 0.92; transform: translateY(-1px); }

        /* ASSIGN BAR & GRILLE PLANNING */
        .schedule-assign-bar { 
            background: #F8F5FF; 
            padding: 20px; 
            border-radius: 16px; 
            border: 1px solid var(--border); 
            margin-top: 20px;
        }
        .schedule-assign-bar h3 { font-size: 1rem; font-weight: 700; margin-bottom: 12px; }
        .form-row { display: flex; gap: 12px; flex-wrap: wrap; }
        .input-group { display: flex; flex-direction: column; gap: 6px; flex: 1; min-width: 150px; }
        .input-group label { font-size: 0.85rem; font-weight: 700; color: #636E72; }
        select, input[type="text"], input[type="number"] { 
            padding: 10px 14px; 
            border: 1px solid #E2D9F3; 
            background: white; 
            border-radius: 10px; 
            font-size: 0.9rem; 
            font-weight: 600;
            outline: none; 
        }

        .timetable-scroll-box { overflow-x: auto; border-radius: 14px; border: 1px solid var(--border); margin-top: 20px; }
        .timetable-grid { width: 100%; border-collapse: collapse; min-width: 850px; background: white; }
        .timetable-grid th { background: #F8F5FF; padding: 14px; font-size: 0.9rem; font-weight: 800; border: 1px solid var(--border); text-align: center; }
        .timetable-grid td { border: 1px solid var(--border); height: 58px; text-align: center; font-size: 0.85rem; vertical-align: middle; padding: 4px; }
        .time-slot-label { font-weight: 800; background: #F8F5FF; width: 120px; }
        .cell-slot { cursor: pointer; }
        .cell-slot:hover { background: #F0EAFF; }
        .slot-badge { padding: 8px 10px; border-radius: 10px; font-weight: 700; color: #2D3436; font-size: 0.85rem; display: block; }

        /* MODALS ET COMPOSANTS MASQUÉS */
        .modal { position: fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.4); display:flex; justify-content:center; align-items:center; z-index:1000; }
        .modal-content { background:white; padding:25px; border-radius:20px; width:90%; max-width:480px; position:relative; }
        .close-modal { position:absolute; top:15px; right:20px; font-size:1.5rem; cursor:pointer; }
        .hidden { display: none !important; }
        .btn-sm { padding: 4px 10px; font-size: 0.8rem; border-radius: 8px; border:none; cursor:pointer; }
        .btn-danger { background: #E57373; color: white; }
        .btn-primary { background: #8C7CE6; color: white; border:none; padding:10px 18px; border-radius:10px; font-weight:700; cursor:pointer; }
    </style>
</head>
<body class="theme-dopamine-pastel">

    <!-- En-tête identique au design visuel -->
    <header>
        <div class="header-container">
            <h1 class="logo">FocusStudy</h1>
            <nav class="main-nav">
                <button class="nav-btn" data-tab="tab-modules">📖 Modules</button>
                <button class="nav-btn" data-tab="tab-pomodoro">⏱️ Pomodoro</button>
                <button class="nav-btn" data-tab="tab-recommendations">🧠 Recommandations</button>
                <button class="nav-btn active" data-tab="tab-planning">📅 Planning Hebdo</button>
                <button class="nav-btn" data-tab="tab-tasks">📝 Tâches Perso</button>
                <button class="nav-btn" data-tab="tab-themes">🎨 Thèmes</button>
                <button class="nav-btn" data-tab="tab-config">⚙️ Configuration</button>
            </nav>
        </div>
    </header>

    <main class="main-content">

        <!-- ONGLET PLANNING HEBDO -->
        <section id="tab-planning" class="tab-pane active">
            <div class="card">
                <h2 class="page-title">📅 Emploi du Temps Hebdomadaire sur Mesure</h2>
                
                <div class="btn-group-row">
                    <button class="btn-action-pink" onclick="openAddSlotModal()">⏰ Créer un Horaire</button>
                    <button class="btn-action-purple" onclick="openActivityBankModal()">⭐ Banque d'Activités</button>
                </div>

                <!-- Barre d'affectation d'activités -->
                <div class="schedule-assign-bar">
                    <h3>📌 Placer une activité enregistrée dans le tableau :</h3>
                    <div class="form-row">
                        <div class="input-group">
                            <label>Activité enregistrée :</label>
                            <select id="assign-saved-activity"></select>
                        </div>
                        <div class="input-group">
                            <label>Jour :</label>
                            <select id="assign-day">
                                <option value="Lundi">Lundi</option>
                                <option value="Mardi">Mardi</option>
                                <option value="Mercredi">Mercredi</option>
                                <option value="Jeudi">Jeudi</option>
                                <option value="Vendredi">Vendredi</option>
                                <option value="Samedi">Samedi</option>
                                <option value="Dimanche">Dimanche</option>
                            </select>
                        </div>
                        <div class="input-group">
                            <label>Horaire :</label>
                            <select id="assign-slot"></select>
                        </div>
                    </div>

                    <div style="margin-top:15px; display:flex; gap:10px;">
                        <button class="btn-primary" onclick="assignTaskFromBar()">📌 Placer dans la case</button>
                        <button class="btn-danger btn-sm" style="padding:10px 16px; font-weight:700;" onclick="clearSelectedSlotFromBar()">🗑️ Vider le créneau</button>
                    </div>
                </div>

                <!-- Grille du Planning -->
                <div class="timetable-scroll-box">
                    <table class="timetable-grid">
                        <thead>
                            <tr>
                                <th>Horaires</th>
                                <th>Lundi</th>
                                <th>Mardi</th>
                                <th>Mercredi</th>
                                <th>Jeudi</th>
                                <th>Vendredi</th>
                                <th>Samedi</th>
                                <th>Dimanche</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody id="timetable-body"></tbody>
                    </table>
                </div>
            </div>
        </section>

        <!-- AUTRES ONGLETS (Modules, Pomodoro, etc.) -->
        <section id="tab-modules" class="tab-pane"><div class="card"><h2>📖 Modules d'Études</h2></div></section>
        <section id="tab-pomodoro" class="tab-pane"><div class="card"><h2>⏱️ Minuteur Pomodoro</h2></div></section>
        <section id="tab-recommendations" class="tab-pane"><div class="card"><h2>🧠 Recommandations</h2></div></section>
        <section id="tab-tasks" class="tab-pane"><div class="card"><h2>📝 Tâches Personnelles</h2></div></section>
        <section id="tab-themes" class="tab-pane"><div class="card"><h2>🎨 Thèmes</h2></div></section>
        <section id="tab-config" class="tab-pane"><div class="card"><h2>⚙️ Configuration</h2></div></section>

    </main>

    <!-- MODAL BANQUE ACTIVITÉS -->
    <div id="modal-activity-bank" class="modal hidden">
        <div class="modal-content">
            <span class="close-modal" onclick="closeActivityBankModal()">&times;</span>
            <h2>⭐ Banque d'Activités</h2>
            <form id="form-create-saved-activity" style="margin-top:15px;">
                <div class="input-group">
                    <label>Nom de l'activité :</label>
                    <input type="text" id="new-act-name" required placeholder="ex: Cours Université, Peinture...">
                </div>
                <input type="hidden" id="new-act-color" value="#FDE2E4">
                <button type="submit" class="btn-primary" style="margin-top:15px;">➕ Ajouter</button>
            </form>
            <div id="bank-activities-list" style="margin-top:20px; max-height:200px; overflow-y:auto;"></div>
        </div>
    </div>

    <!-- MODAL AJOUT HORAIRE -->
    <div id="modal-add-slot" class="modal hidden">
        <div class="modal-content">
            <span class="close-modal" onclick="closeAddSlotModal()">&times;</span>
            <h2>⏰ Créer un Créneau Horaire</h2>
            <form id="form-add-slot" style="margin-top:15px;">
                <div class="form-row">
                    <div class="input-group">
                        <label>Début :</label>
                        <input type="text" id="slot-start" placeholder="08:00" required>
                    </div>
                    <div class="input-group">
                        <label>Fin :</label>
                        <input type="text" id="slot-end" placeholder="09:30" required>
                    </div>
                </div>
                <button type="submit" class="btn-primary" style="margin-top:15px;">Ajouter Horaire</button>
            </form>
        </div>
    </div>

    <script>
        let appData = {
            timeSlots: [
                { id: 1, start: "08:00", end: "09:30" },
                { id: 2, start: "09:30", end: "11:00" },
                { id: 3, start: "11:00", end: "12:30" },
                { id: 4, start: "14:00", end: "15:30" }
            ],
            savedActivities: [
                { id: 1, title: "Cours Université", color: "#E2D4F9" },
                { id: 2, title: "Séance Gym", color: "#D1F2D9" }
            ],
            timetable: {}
        };

        document.addEventListener('DOMContentLoaded', () => {
            initNavigation();
            renderSavedActivitiesDropdown();
            renderTimetableGrid();
            
            document.getElementById('form-add-slot').addEventListener('submit', (e) => {
                e.preventDefault();
                const start = document.getElementById('slot-start').value.trim();
                const end = document.getElementById('slot-end').value.trim();
                appData.timeSlots.push({ id: Date.now(), start, end });
                renderTimetableGrid();
                closeAddSlotModal();
            });

            document.getElementById('form-create-saved-activity').addEventListener('submit', (e) => {
                e.preventDefault();
                const title = document.getElementById('new-act-name').value.trim();
                appData.savedActivities.push({ id: Date.now(), title, color: "#FDE2E4" });
                renderSavedActivitiesDropdown();
                renderSavedActivitiesList();
                document.getElementById('form-create-saved-activity').reset();
            });
        });

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

        function renderSavedActivitiesDropdown() {
            const sel = document.getElementById('assign-saved-activity');
            if (!sel) return;
            sel.innerHTML = '';
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
            appData.savedActivities.forEach(act => {
                const div = document.createElement('div');
                div.style.padding = '8px'; div.style.marginBottom = '6px'; div.style.borderRadius = '8px';
                div.style.backgroundColor = act.color; div.style.fontWeight = 'bold';
                div.textContent = act.title;
                list.appendChild(div);
            });
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
            const actId = document.getElementById('assign-saved-activity').value;
            const act = appData.savedActivities.find(a => a.id == actId) || appData.savedActivities[0];
            if (act) {
                appData.timetable[`${day}-${slotId}`] = { title: act.title, color: act.color };
                renderTimetableGrid();
            }
        }

        function assignTaskFromBar() {
            const actId = document.getElementById('assign-saved-activity').value;
            const day = document.getElementById('assign-day').value;
            const slotId = document.getElementById('assign-slot').value;
            const act = appData.savedActivities.find(a => a.id == actId);
            if (act) {
                appData.timetable[`${day}-${slotId}`] = { title: act.title, color: act.color };
                renderTimetableGrid();
            }
        }

        function clearSelectedSlotFromBar() {
            const day = document.getElementById('assign-day').value;
            const slotId = document.getElementById('assign-slot').value;
            delete appData.timetable[`${day}-${slotId}`];
            renderTimetableGrid();
        }

        function deleteTimeSlot(slotId) {
            appData.timeSlots = appData.timeSlots.filter(s => s.id !== slotId);
            renderTimetableGrid();
        }

        function openActivityBankModal() { renderSavedActivitiesList(); document.getElementById('modal-activity-bank').classList.remove('hidden'); }
        function closeActivityBankModal() { document.getElementById('modal-activity-bank').classList.add('hidden'); }
        function openAddSlotModal() { document.getElementById('modal-add-slot').classList.remove('hidden'); }
        function closeAddSlotModal() { document.getElementById('modal-add-slot').classList.add('hidden'); }
    </script>
</body>
</html>
