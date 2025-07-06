document.addEventListener('DOMContentLoaded', () => {
    // === CONSTANTES ===
    const CUSTOM_RACES_STORAGE_KEY = 'ecoSimRPG_races_custom';

    // --- DOM Elements ---
    const treeContainer = document.getElementById('tree-container');
    const raceForm = document.getElementById('race-form');
    const placeholder = document.getElementById('placeholder');
    const addRaceBtn = document.getElementById('add-race-btn');
    const resetAllBtn = document.getElementById('reset-all-btn');
    const analysisOutput = document.getElementById('analysis-output');
    
    // --- Selecteurs pour la gestion des données ---
    const importDataBtn = document.getElementById('import-data-btn');
    const jsonUploadInput = document.getElementById('json-upload');
    const openManageModalBtn = document.getElementById('open-manage-modal-btn');
    const manageDataModal = document.getElementById('manage-data-modal');
    const manageModalCloseBtn = document.getElementById('manage-modal-close-btn');
    const downloadJsonBtn = document.getElementById('download-json-btn');

    let ecoSimData = null;
    let selectedRaceName = null;
    let originalData = null;

    // --- Fonctions Utilitaires et de Sauvegarde ---
    const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

    function saveCustomRacesToStorage() {
        if (ecoSimData) {
            localStorage.setItem(CUSTOM_RACES_STORAGE_KEY, JSON.stringify(ecoSimData));
        }
    }

    function downloadJSON() {
        const jsonData = JSON.stringify(ecoSimData, null, 4);
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const date = new Date().toISOString().slice(0, 10);
        a.href = url;
        a.download = `ecosim_races_data-${date}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    function handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const newRaceData = JSON.parse(e.target.result);
                if (newRaceData.races && newRaceData.compatibilites) {
                     if (confirm("Charger ce fichier remplacera les données de races actuelles. Continuer ?")) {
                        ecoSimData = newRaceData;
                        selectedRaceName = null;
                        renderNavigation();
                        displayRaceForm();
                        updateAnalysis();
                        saveCustomRacesToStorage();
                        alert('Données de races chargées !');
                    }
                } else {
                    alert('Fichier JSON invalide. Il doit contenir "races" et "compatibilites".');
                }
            } catch (error) {
                alert('Erreur de parsing du JSON.');
            } finally {
                jsonUploadInput.value = '';
            }
        };
        reader.readAsText(file);
    }

    // --- Rendu de l'UI ---
    function renderNavigation() {
        treeContainer.innerHTML = '';
        Object.keys(ecoSimData.races).sort().forEach(raceName => {
            const raceDiv = document.createElement('div');
            raceDiv.className = 'race-item';
            raceDiv.textContent = raceName;
            raceDiv.dataset.raceName = raceName;
            if (raceName === selectedRaceName) {
                raceDiv.classList.add('selected');
            }
            treeContainer.appendChild(raceDiv);
        });
        addNavEventListeners();
    }

    function addNavEventListeners() {
        treeContainer.querySelectorAll('.race-item').forEach(raceDiv => {
            raceDiv.addEventListener('click', () => {
                selectedRaceName = raceDiv.dataset.raceName;
                document.querySelectorAll('.race-item').forEach(el => el.classList.remove('selected'));
                raceDiv.classList.add('selected');
                displayRaceForm();
            });
        });
    }

    function displayRaceForm() {
        if (!selectedRaceName || !ecoSimData.races[selectedRaceName]) {
            raceForm.style.display = 'none';
            placeholder.style.display = 'block';
            return;
        }

        const raceData = ecoSimData.races[selectedRaceName];
        const allRaces = Object.keys(ecoSimData.races);
        const compatibilites = ecoSimData.compatibilites[selectedRaceName] || [];

        raceForm.innerHTML = `
            <h3>Édition de : ${selectedRaceName}</h3>
            <fieldset>
                <legend>Nom de la Race</legend>
                <input type="text" id="raceName" value="${selectedRaceName}" />
            </fieldset>
            
            <fieldset>
                <legend>Caractéristiques Démographiques</legend>
                <div class="grid-5">
                    <div><label for="ageAdulte">Âge Adulte</label><input type="number" id="ageAdulte" value="${raceData.ageAdulte || 18}"></div>
                    <div><label for="esperanceVieMax">Espérance Vie</label><input type="number" id="esperanceVieMax" value="${raceData.esperanceVieMax || 80}"></div>
                    <div><label for="dureeGestationMois">Gestation (mois)</label><input type="number" id="dureeGestationMois" value="${raceData.dureeGestationMois || 9}"></div>
                    <div><label for="ageApprentissage">Âge Apprentissage</label><input type="number" id="ageApprentissage" value="${raceData.ageApprentissage || 4}"></div>
                    <div><label for="ageTravail">Âge Travail</label><input type="number" id="ageTravail" value="${raceData.ageTravail || 14}"></div>
                </div>
            </fieldset>

            <fieldset>
                <legend>Noms et Prénoms</legend>
                <div class="grid-3 names-container">
                    ${createNameListWidget('prenomsM', 'Prénoms Masculins', raceData.prenomsM)}
                    ${createNameListWidget('prenomsF', 'Prénoms Féminins', raceData.prenomsF)}
                    ${createNameListWidget('noms', 'Noms de Famille', raceData.noms)}
                </div>
            </fieldset>

            <fieldset>
                <legend>Compatibilité pour la Reproduction</legend>
                ${createCompatibilityWidget(compatibilites, allRaces)}
            </fieldset>

            <div class="button-group">
                <button type="button" id="delete-race-btn" class="btn btn-delete">Supprimer cette Race</button>
            </div>
        `;

        placeholder.style.display = 'none';
        raceForm.style.display = 'flex';
        addFormEventListeners();
    }

    function createNameListWidget(id, title, names) {
        return `
            <div>
                <label for="${id}">${title}</label>
                <textarea id="${id}" class="names-list" spellcheck="false">${(names || []).join('\n')}</textarea>
            </div>
        `;
    }
    
    function createCompatibilityWidget(compatibilites, allRaces) {
        const tagItems = compatibilites.map(tag => `
            <div class="tag-item" data-tag="${tag}">
                <span>${tag}</span><button type="button" class="delete-btn" data-tag="${tag}">x</button>
            </div>`).join('');
    
        const raceOptions = allRaces
            .filter(r => r !== selectedRaceName && !compatibilites.includes(r))
            .sort()
            .map(r => `<option value="${r}">${r}</option>`).join('');

        return `<div id="compatibilites-widget" class="tag-widget">
            <div class="tag-list-container">${tagItems}</div>
            <div class="add-item-form">
                <select><option value="">Choisir une race...</option>${raceOptions}</select>
                <button type="button" class="btn btn-secondary add-btn">Ajouter</button>
            </div>
        </div>`;
    }


    // --- Logique de Mise à Jour ---
    function addFormEventListeners() {
        raceForm.addEventListener('change', handleFormChange);
        raceForm.addEventListener('input', handleFormChange);

        document.getElementById('delete-race-btn').addEventListener('click', deleteRace);
        
        // Listeners pour le widget de compatibilité
        const compatWidget = document.getElementById('compatibilites-widget');
        compatWidget.querySelector('.add-btn').addEventListener('click', (e) => {
            const select = e.target.previousElementSibling;
            const raceToAdd = select.value;
            if (raceToAdd) {
                ecoSimData.compatibilites[selectedRaceName].push(raceToAdd);
                saveAndRedraw();
            }
        });

        compatWidget.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const raceToRemove = e.target.dataset.tag;
                const index = ecoSimData.compatibilites[selectedRaceName].indexOf(raceToRemove);
                if (index > -1) {
                    ecoSimData.compatibilites[selectedRaceName].splice(index, 1);
                }
                saveAndRedraw();
            });
        });
    }

    function handleFormChange(event) {
        if (!selectedRaceName) return;

        const raceData = ecoSimData.races[selectedRaceName];
        
        // Gérer le renommage de la race
        const newName = document.getElementById('raceName').value.trim();
        if (newName && newName !== selectedRaceName) {
            if (ecoSimData.races[newName]) {
                alert(`La race "${newName}" existe déjà !`);
                document.getElementById('raceName').value = selectedRaceName; // Annuler
                return;
            }
            // Mettre à jour dans l'objet 'races'
            Object.defineProperty(ecoSimData.races, newName, Object.getOwnPropertyDescriptor(ecoSimData.races, selectedRaceName));
            delete ecoSimData.races[selectedRaceName];
            
            // Mettre à jour dans les compatibilités
             Object.defineProperty(ecoSimData.compatibilites, newName, Object.getOwnPropertyDescriptor(ecoSimData.compatibilites, selectedRaceName));
            delete ecoSimData.compatibilites[selectedRaceName];

             // Mettre à jour les références dans les listes de compatibilité des autres races
            for (const key in ecoSimData.compatibilites) {
                const compatList = ecoSimData.compatibilites[key];
                const index = compatList.indexOf(selectedRaceName);
                if (index > -1) {
                    compatList[index] = newName;
                }
            }
            
            selectedRaceName = newName;
            saveAndRedraw(true); // Redessiner la navigation
            return; // Sortir pour éviter les mises à jour sur l'ancien nom
        }

        // Mettre à jour les données numériques
        raceData.ageAdulte = parseInt(document.getElementById('ageAdulte').value);
        raceData.esperanceVieMax = parseInt(document.getElementById('esperanceVieMax').value);
        raceData.dureeGestationMois = parseInt(document.getElementById('dureeGestationMois').value);
        raceData.ageApprentissage = parseInt(document.getElementById('ageApprentissage').value);
        raceData.ageTravail = parseInt(document.getElementById('ageTravail').value);
        
        // Mettre à jour les listes de noms
        raceData.prenomsM = document.getElementById('prenomsM').value.split('\n').map(n => n.trim()).filter(Boolean);
        raceData.prenomsF = document.getElementById('prenomsF').value.split('\n').map(n => n.trim()).filter(Boolean);
        raceData.noms = document.getElementById('noms').value.split('\n').map(n => n.trim()).filter(Boolean);
        
        saveCustomRacesToStorage();
        updateAnalysis();
    }

    function saveAndRedraw(redrawNav = false) {
        saveCustomRacesToStorage();
        if(redrawNav) renderNavigation();
        displayRaceForm();
        updateAnalysis();
    }

    // --- Actions (Ajout/Suppression) ---
    function addRace() {
        const newRaceName = prompt("Entrez le nom de la nouvelle race :");
        if (newRaceName && !ecoSimData.races[newRaceName]) {
            ecoSimData.races[newRaceName] = {
                prenomsM: [], prenomsF: [], noms: [],
                ageAdulte: 18, esperanceVieMax: 80, dureeGestationMois: 9,
                ageApprentissage: 4, ageTravail: 14
            };
            ecoSimData.compatibilites[newRaceName] = [];
            selectedRaceName = newRaceName;
            saveAndRedraw(true);
        } else if (newRaceName) {
            alert("Cette race existe déjà !");
        }
    }

    function deleteRace() {
        if (confirm(`Êtes-vous sûr de vouloir supprimer la race "${selectedRaceName}" ?`)) {
            // Supprimer de la liste principale et des compatibilités
            delete ecoSimData.races[selectedRaceName];
            delete ecoSimData.compatibilites[selectedRaceName];
            
            // Supprimer des listes de compatibilité des autres races
            for (const key in ecoSimData.compatibilites) {
                const compatList = ecoSimData.compatibilites[key];
                const index = compatList.indexOf(selectedRaceName);
                if (index > -1) {
                    compatList.splice(index, 1);
                }
            }

            selectedRaceName = null;
            saveAndRedraw(true);
        }
    }

    function resetData() {
        if (confirm("Réinitialiser les données de races à leur état d'origine ?")) {
            ecoSimData = deepClone(originalData);
            selectedRaceName = null;
            saveCustomRacesToStorage();
            renderNavigation();
            displayRaceForm();
            updateAnalysis();
            alert("Données de races restaurées.");
        }
    }

    // --- Analyse en Temps Réel ---
    function updateAnalysis() {
        let html = '<ul>';
        const { races, compatibilites, racesMixtes } = ecoSimData;

        for (const raceA in compatibilites) {
            const partners = compatibilites[raceA];
            partners.forEach(raceB => {
                const partnersOfB = compatibilites[raceB];
                const mixedRaceKey1 = `${raceA}-${raceB}`;
                const mixedRaceKey2 = `${raceB}-${raceA}`;

                // Vérification de la compatibilité réciproque
                if (!partnersOfB || !partnersOfB.includes(raceA)) {
                    html += `<li class="analysis-error"><b>Non-réciproque:</b> ${raceA} est compatible avec ${raceB}, mais ${raceB} ne l'est pas avec ${raceA}.</li>`;
                } 
                // Vérification de l'existence d'une race mixte définie
                else if (racesMixtes && (racesMixtes[mixedRaceKey1] || racesMixtes[mixedRaceKey2])) {
                    const mixedRace = racesMixtes[mixedRaceKey1] || racesMixtes[mixedRaceKey2];
                    if (races[mixedRace]) {
                         html += `<li class="analysis-ok"><b>Reproduction OK:</b> ${raceA} &harr; ${raceB} &rarr; ${mixedRace} (défini et existe).</li>`;
                    } else {
                         html += `<li class="analysis-error"><b>Race Mixte Manquante:</b> La reproduction entre ${raceA} et ${raceB} devrait produire "${mixedRace}", mais cette race n'existe pas dans la base.</li>`;
                    }
                }
                // Avertissement s'il n'y a pas de race mixte définie pour un couple compatible
                else {
                    html += `<li class="analysis-warning"><b>Race Mixte Non Définie:</b> ${raceA} et ${raceB} sont compatibles, mais aucune race mixte n'est définie dans \`racesMixtes\`.</li>`;
                }
            });
        }
        html += '</ul>';
        analysisOutput.innerHTML = html;
    }

    // --- Initialisation ---
    function init() {
        // CORRECTED: Check for racesData object
        if (window.EcoSimData && window.EcoSimData.racesData) {
            // CORRECTED: Clone the nested racesData object
            originalData = deepClone(window.EcoSimData.racesData);
            
            const savedData = localStorage.getItem(CUSTOM_RACES_STORAGE_KEY);
            if (savedData) {
                console.log("Données de races personnalisées trouvées, chargement...");
                ecoSimData = JSON.parse(savedData);
            } else {
                // CORRECTED: Use the nested racesData object as the working data
                ecoSimData = window.EcoSimData.racesData;
            }

            addRaceBtn.addEventListener('click', addRace);
            resetAllBtn.addEventListener('click', resetData);
            
            importDataBtn.addEventListener('click', () => jsonUploadInput.click());
            jsonUploadInput.addEventListener('change', handleFileUpload);
            downloadJsonBtn.addEventListener('click', downloadJSON);

            openManageModalBtn.addEventListener('click', () => manageDataModal.style.display = 'flex');
            manageModalCloseBtn.addEventListener('click', () => manageDataModal.style.display = 'none');

            renderNavigation();
            updateAnalysis();
        } else {
            placeholder.innerHTML = "<h2>Erreur</h2><p>Le fichier <strong>races.js</strong> est manquant ou l'objet <strong>EcoSimData.racesData</strong> est introuvable.</p>";
        }
    }
    
    init();
});