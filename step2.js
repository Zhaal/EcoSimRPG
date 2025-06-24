document.addEventListener('DOMContentLoaded', () => {
    // --- MODULE DE CALCUL (fusionné et nettoyé depuis sim-formulas.js) ---
    const Formula = (() => {
        function parseSalaryString(jobString) {
            // "Tiers 0 : Roi/Reine (1 poste, 100 prestige requis, 50 prestige/mois, mixte)"
            const tierMatch = jobString.match(/Tiers (\d+|0)/);
            const postsMatch = jobString.match(/(\d+)\s+poste/);
    
            return {
                tier: tierMatch ? `Tiers ${tierMatch[1]}` : 'N/A',
                posts: postsMatch ? parseInt(postsMatch[1]) : 0,
            };
        }
        
        function calculateGlobalStats(place, buildingData) {
            let totalPrestige = 0;
            let totalMenace = 0;
            let totalJobs = 0;
            let foodBalance = 0; // Simplification: +1 pour prod, -1 pour non-prod
    
            if (!place.config || !place.config.buildings) {
                return { totalPrestige, totalMenace, totalJobs, foodBalance };
            }
    
            const placeBuildings = buildingData[place.type] || {};
    
            for (const buildingName in place.config.buildings) {
                const config = place.config.buildings[buildingName];
                if (!config.active) continue;
    
                let buildingInfo = null;
                for(const category in placeBuildings) {
                    if(placeBuildings[category][buildingName]) {
                        buildingInfo = placeBuildings[category][buildingName];
                        
                        // Calcul du bilan alimentaire simplifié
                        if(category === 'Bâtiments Agricoles' || category === 'Chasse/Nature') {
                            foodBalance += config.count;
                        } else if (category === 'Bâtiments de Production' || category === 'Bâtiments Administratifs') {
                            foodBalance -= config.count;
                        }
                        break;
                    }
                }
                
                if (buildingInfo) {
                    totalPrestige += (buildingInfo.prestige || 0) * config.count;
                    totalMenace += (buildingInfo.menace || 0) * config.count;
                    if(buildingInfo.emplois) {
                        buildingInfo.emplois.forEach(jobString => {
                            const jobInfo = parseSalaryString(jobString);
                            totalJobs += jobInfo.posts * config.count;
                        });
                    }
                }
            }
            return { totalPrestige, totalMenace, totalJobs, foodBalance };
        }

        return {
            calculateGlobalStats
        };
    })();

    // --- MODULE TOOLTIP (fusionné depuis tooltips.js) ---
    const TooltipManager = (() => {
        let tooltipElement;

        function createTooltipElement() {
            if (document.getElementById('dynamic-tooltip')) return;
            tooltipElement = document.createElement('div');
            tooltipElement.id = 'dynamic-tooltip';
            tooltipElement.className = 'tooltip';
            document.body.appendChild(tooltipElement);
        }

        function showTooltip(e) {
            const trigger = e.target;
            const tooltipType = trigger.dataset.tooltipType;

            let content = 'Information non disponible.';
            if (tooltipType === 'building') {
                content = getBuildingTooltipContent(trigger);
            }

            tooltipElement.innerHTML = content;
            tooltipElement.style.display = 'block';
            
            positionTooltip(e);
        }
        
        function positionTooltip(e) {
            let x = e.clientX + 15;
            let y = e.clientY + 15;
            
            tooltipElement.style.left = `${x}px`;
            tooltipElement.style.top = `${y}px`;

            const rect = tooltipElement.getBoundingClientRect();
            if (rect.right > window.innerWidth) {
                tooltipElement.style.left = `${window.innerWidth - rect.width - 15}px`;
            }
            if (rect.bottom > window.innerHeight) {
                tooltipElement.style.top = `${window.innerHeight - rect.height - 15}px`;
            }
        }


        function hideTooltip() {
            if (tooltipElement) {
                tooltipElement.style.display = 'none';
            }
        }

        function getBuildingTooltipContent(trigger) {
            const type = trigger.dataset.type;
            const category = trigger.dataset.category;
            const buildingName = trigger.dataset.building;

            const buildingData = window.EcoSimData.buildings[type]?.[category]?.[buildingName];
            if (!buildingData) return "Données du bâtiment introuvables.";

            let content = `<h4>${buildingName}</h4>`;
            content += `<p>${buildingData.description}</p><hr>`;
            content += '<ul>';
            if (buildingData.prestige) content += `<li><strong>Prestige:</strong> ${buildingData.prestige}</li>`;
            if (buildingData.menace) content += `<li><strong>Menace:</strong> ${buildingData.menace}</li>`;
            if (buildingData.coutConstruction) content += `<li><strong>Coût:</strong> ${buildingData.coutConstruction}</li>`;
            if (buildingData.chargeFixe) content += `<li><strong>Charge Fixe:</strong> ${buildingData.chargeFixe}</li>`;
            if (buildingData.chiffreAffairesMax) content += `<li><strong>CA Max:</strong> ${buildingData.chiffreAffairesMax}</li>`;
            if (buildingData.beneficeMax) content += `<li><strong>Bénéfice Max:</strong> ${buildingData.beneficeMax}</li>`;
            content += '</ul>';

            if(buildingData.emplois && buildingData.emplois.length > 0) {
                 content += '<hr><strong>Emplois:</strong><ul>';
                 buildingData.emplois.forEach(job => {
                     content += `<li>${job}</li>`;
                 });
                 content += '</ul>';
            }

            return content;
        }

        function init() {
            createTooltipElement();
            
            document.body.addEventListener('mouseover', e => {
                if (e.target.matches('.tooltip-trigger')) {
                    showTooltip(e);
                }
            });

            document.body.addEventListener('mouseout', e => {
                 if (e.target.matches('.tooltip-trigger')) {
                    hideTooltip();
                }
            });
            
             document.body.addEventListener('mousemove', e => {
                if (tooltipElement && tooltipElement.style.display === 'block') {
                   positionTooltip(e);
                }
            });
        }

        return {
            init
        };
    })();

    // --- CONSTANTES & CONFIGURATION ---
    const STORAGE_KEY = 'ecoSimRPG_map_data';
    const LAST_REGION_KEY = 'ecoSimRPG_last_region_id';
    const ROUTE_TYPES = [
        { name: 'Grande Route Marchande', walkModifier: 1.0,  horseModifier: 1.0 },
        { name: 'Route Normale',          walkModifier: 1.25, horseModifier: 1.25 },
        { name: 'Chemin de Terre',        walkModifier: 1.75, horseModifier: 2.0 },
        { name: 'Sentier de Montagne',    walkModifier: 2.5,  horseModifier: 6.0 },
        { name: 'Marais/Difficile',       walkModifier: 3.5,  horseModifier: 13.5 }
    ];

    // --- SELECTEURS DOM ---
    const regionSelect = document.getElementById('region-select');
    const placesList = document.getElementById('places-list');
    const configPanel = document.getElementById('config-panel');
    const placeStatsSummary = document.getElementById('place-stats-summary');

    // --- ETAT DE L'APPLICATION ---
    let regions = [];
    let currentRegion = null;
    let selectedPlace = null;
    let buildingData = window.EcoSimData.buildings;
    let raceData = window.EcoSimData.racesData.races;

    // --- INITIALISATION ---
    function init() {
        loadData();
        setupEventListeners();
        TooltipManager.init();
        if (regions.length > 0) {
            populateRegionSelect();
            const lastRegionId = localStorage.getItem(LAST_REGION_KEY);
            if (lastRegionId) {
                regionSelect.value = lastRegionId;
            }
            handleRegionChange();
        } else {
            showWelcomeMessage("Aucune donnée de région trouvée.", "Veuillez retourner à l'Étape 1 pour créer une carte et des lieux.");
        }
    }

    // --- GESTION DES DONNÉES ---
    function loadData() {
        const data = localStorage.getItem(STORAGE_KEY);
        regions = data ? JSON.parse(data) : [];
    }

    function saveData() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(regions));
    }
    
    function initializePlaceConfig(place) {
        if (!place.config) {
             place.config = {};
        }
        place.config.demographics = place.config.demographics || { "Humain": 100 };
        place.config.initialState = place.config.initialState || 'Stable';
        place.config.buildings = place.config.buildings || {};
        place.config.isValidated = place.config.isValidated || false;

        const placeTypeBuildings = buildingData[place.type];
        if (!placeTypeBuildings) return;

        for (const category in placeTypeBuildings) {
            for (const buildingName in placeTypeBuildings[category]) {
                if (!place.config.buildings[buildingName]) {
                    const isAdministrative = category === 'Bâtiments Administratifs';
                    place.config.buildings[buildingName] = {
                        active: isAdministrative,
                        count: 1
                    };
                }
            }
        }
    }

    // --- GESTION DE L'UI ---
    
    /**
     * Formate un nombre d'heures en une chaîne de caractères "XhYmin".
     * @param {number} hours - Le nombre d'heures (peut être décimal).
     * @returns {string} Le temps formaté.
     */
    function formatTravelTime(hours) {
        if (hours < 0 || !isFinite(hours)) return 'N/A';
        const totalMinutes = Math.round(hours * 60);
        const h = Math.floor(totalMinutes / 60);
        const m = totalMinutes % 60;
        return `${h}h${m.toString().padStart(2, '0')}min`;
    }

    function populateRegionSelect() {
        regionSelect.innerHTML = '';
        if (regions.length === 0) {
            regionSelect.innerHTML = '<option>Aucune région</option>';
            return;
        }
        regions.forEach(region => {
            const option = document.createElement('option');
            option.value = region.id;
            option.textContent = region.name;
            regionSelect.appendChild(option);
        });
    }

    function renderPlacesList() {
        placesList.innerHTML = '';
        if (!currentRegion || currentRegion.places.length === 0) {
            placesList.innerHTML = '<li class="no-places">Aucun lieu dans cette région.</li>';
            updateNavLinksState();
            return;
        }
        currentRegion.places
            .sort((a, b) => a.name.localeCompare(b.name))
            .forEach(place => {
                initializePlaceConfig(place); 
                const li = document.createElement('li');
                li.dataset.placeId = place.id;
                
                let text = `${place.name} (${place.type})`;
                if (place.config.isValidated) {
                    text = `✓ ${text}`;
                    li.style.color = 'var(--color-forest-green)';
                }
                
                li.textContent = text;
                
                if (selectedPlace && place.id === selectedPlace.id) {
                    li.classList.add('active');
                }
                placesList.appendChild(li);
            });
        updateNavLinksState();
    }

    function showWelcomeMessage(title, message) {
        configPanel.innerHTML = `
            <div id="welcome-panel">
                <h2>${title}</h2>
                <p>${message}</p>
            </div>`;
        placeStatsSummary.innerHTML = '';
    }
    
    function renderDemographicsSection() {
        const placeDemographics = selectedPlace.config.demographics || {};
        let demographicsHtml = '';
        let totalPercentage = 0;
    
        for (const raceName in raceData) {
            const percentage = placeDemographics[raceName] || 0;
            totalPercentage += percentage;
            demographicsHtml += `
                 <div class="race-row">
                    <label for="race-num-${raceName}">${raceName}</label>
                    <input type="number" id="race-num-${raceName}" class="race-percentage-num" data-race="${raceName}" min="0" max="100" value="${percentage}">
                    <input type="range" id="race-slider-${raceName}" class="race-percentage-slider" data-race="${raceName}" min="0" max="100" value="${percentage}">
                    <span>%</span>
                </div>
            `;
        }
    
        const totalClass = totalPercentage !== 100 ? 'invalid' : '';
    
        return `
            <fieldset class="config-section">
                <legend>Démographie Raciale</legend>
                <div id="demographics-container">
                    ${demographicsHtml}
                </div>
                <div id="demographics-total" class="${totalClass}">Total : ${totalPercentage}%</div>
            </fieldset>
        `;
    }

    function renderConfigPanel() {
        if (!selectedPlace) {
            showWelcomeMessage("Prêt à configurer", "Sélectionnez un lieu dans la liste de gauche.");
            return;
        }
        
        initializePlaceConfig(selectedPlace);

        const placeTypeBuildings = buildingData[selectedPlace.type] || {};
        let buildingsHtml = '';
        for (const category in placeTypeBuildings) {
            buildingsHtml += `<fieldset class="config-section"><legend>${category}</legend>`;
            if (category !== 'Bâtiments Administratifs') {
                 buildingsHtml += `
                    <div class="building-actions">
                        <button class="btn btn-sm" data-action="check-all">Tout cocher</button>
                        <button class="btn btn-sm" data-action="uncheck-all">Tout décocher</button>
                        <button class="btn btn-sm" data-action="random-selection">Sélection Aléatoire</button>
                    </div>`;
            }
           
            for (const buildingName in placeTypeBuildings[category]) {
                const config = selectedPlace.config.buildings[buildingName];
                const isAdministrative = category === 'Bâtiments Administratifs';
                let countControlHtml = '';
                if (!isAdministrative) {
                    countControlHtml = `
                        <div class="custom-number-input">
                            <button class="btn-adjust" data-action="decrease" data-building-name="${buildingName}">-</button>
                            <span class="building-count-display">${config.count}</span>
                            <button class="btn-adjust" data-action="increase" data-building-name="${buildingName}">+</button>
                        </div>
                    `;
                }

                buildingsHtml += `
                    <div class="building-row">
                        <input type="checkbox" id="building-${buildingName.replace(/\s/g, '')}" name="${buildingName}" 
                               data-building-name="${buildingName}" ${config.active ? 'checked' : ''} ${isAdministrative ? 'disabled' : ''}>
                        <label for="building-${buildingName.replace(/\s/g, '')}">${buildingName}</label>
                        <span class="tooltip-trigger" data-tooltip-type="building" data-type="${selectedPlace.type}" data-category="${category}" data-building="${buildingName}">?</span>
                        <div class="building-count-wrapper">
                            ${countControlHtml}
                        </div>
                    </div>
                `;
            }
            buildingsHtml += `</fieldset>`;
        }
        
        const demographicsSectionHtml = renderDemographicsSection();

        // MODIFICATION ICI : Mise à jour de la liste des états initiaux
        const initialStateOptions = `
            <option value="Florissante" ${selectedPlace.config.initialState === 'Florissante' ? 'selected' : ''}>Florissante</option>
            <option value="Prospère" ${selectedPlace.config.initialState === 'Prospère' ? 'selected' : ''}>Prospère</option>
            <option value="Stable" ${selectedPlace.config.initialState === 'Stable' ? 'selected' : ''}>Stable</option>
            <option value="Fragile" ${selectedPlace.config.initialState === 'Fragile' ? 'selected' : ''}>Fragile</option>
            <option value="En crise" ${selectedPlace.config.initialState === 'En crise' ? 'selected' : ''}>En crise</option>
            <option value="Sur le déclin" ${selectedPlace.config.initialState === 'Sur le déclin' ? 'selected' : ''}>Sur le déclin</option>
        `;

        configPanel.innerHTML = `
            <h2>Configuration de ${selectedPlace.name} <span class="place-type-badge">${selectedPlace.type}</span><span id="place-validation-status"></span></h2>
            
            <div class="config-columns">
                <div class="config-col-main">
                    <fieldset class="config-section">
                        <legend>Paramètres Généraux</legend>
                         <div class="form-group">
                            <label for="initial-state">État Initial :</label>
                            <select id="initial-state">
                                ${initialStateOptions}
                            </select>
                        </div>
                    </fieldset>
                    
                    ${demographicsSectionHtml}

                     ${buildingsHtml}
                </div>
                <div class="config-col-side">
                    <fieldset class="config-section">
                        <legend>Distances & Temps de Trajet</legend>
                        <div id="distance-table"></div>
                    </fieldset>
                    <fieldset class="config-section">
                        <legend>Validation</legend>
                        <div id="validation-container" style="text-align: center; padding: 10px;">
                            <button id="validate-place-btn" class="btn">Valider le lieu</button>
                            <p id="validation-prerequisites" style="font-size: 0.8em; color: var(--color-error); margin-top: 10px; text-align: left;"></p>
                        </div>
                    </fieldset>
                </div>
            </div>
        `;
        
        updateGlobalStats();
        renderDistanceTable();
        updateValidationUI();
        setupConfigEventListeners();
    }
    
    function renderDistanceTable() {
        const container = document.getElementById('distance-table');
        if (!container || !currentRegion || !selectedPlace) return;
    
        // Initialiser l'objet des modificateurs de route s'il n'existe pas
        if (!currentRegion.routeModifiers) {
            currentRegion.routeModifiers = {};
        }
    
        const otherPlaces = currentRegion.places.filter(p => p.id !== selectedPlace.id);
        if (otherPlaces.length === 0) {
            container.innerHTML = '<p>Aucun autre lieu dans la région.</p>';
            return;
        }
    
        const axialDistance = (a, b) => (Math.abs(a.q - b.q) + Math.abs(a.r - b.r) + Math.abs(a.q + a.r - (b.q + b.r))) / 2;
        let contentHtml = '';
    
        otherPlaces.forEach(other => {
            const distKm = axialDistance(selectedPlace.coords, other.coords) * (currentRegion.scale || 1);
            const travelTimeWalkBase = distKm / 5;
            const travelTimeHorseBase = distKm / 15;
    
            // Créer une clé unique et consistante pour la paire de lieux
            const routeKey = [selectedPlace.id, other.id].sort((a, b) => a - b).join('-');
            const modifierIndex = currentRegion.routeModifiers[routeKey] || 0;
            const routeType = ROUTE_TYPES[modifierIndex];
    
            const travelTimeWalk = travelTimeWalkBase * routeType.walkModifier;
            const travelTimeHorse = travelTimeHorseBase * routeType.horseModifier;
            
            contentHtml += `
                <div class="distance-entry" data-other-id="${other.id}" data-route-key="${routeKey}">
                    <div class="distance-info">
                        <strong>${other.name}</strong> (${distKm.toFixed(0)} km)
                    </div>
                    <div class="distance-times">
                       <span>Marche: <b id="walk-time-${routeKey}">${formatTravelTime(travelTimeWalk)}</b></span>
                       <span>Cheval: <b id="horse-time-${routeKey}">${formatTravelTime(travelTimeHorse)}</b></span>
                    </div>
                    <div class="distance-slider-group">
                       <label for="slider-${routeKey}" class="route-type-label" id="label-${routeKey}">${routeType.name}</label>
                       <input type="range" min="0" max="${ROUTE_TYPES.length - 1}" value="${modifierIndex}" class="route-modifier-slider" id="slider-${routeKey}" data-route-key="${routeKey}">
                    </div>
                </div>
            `;
        });
        container.innerHTML = contentHtml;
    }

    function updateGlobalStats() {
        if (!selectedPlace) {
            placeStatsSummary.innerHTML = '';
            return;
        }
        const stats = Formula.calculateGlobalStats(selectedPlace, buildingData);
        placeStatsSummary.innerHTML = `
            <span><strong>Prestige:</strong> ${stats.totalPrestige}</span>
            <span><strong>Menace:</strong> ${stats.totalMenace}</span>
            <span><strong>Postes:</strong> ${stats.totalJobs}</span>
            <span><strong>Bilan Alimentaire:</strong> ${stats.foodBalance > 0 ? '+' : ''}${stats.foodBalance}</span>
        `;
    }

    function checkPlaceValidation() {
        const prerequisites = [];
        if (!selectedPlace || !selectedPlace.config) {
            return { isValid: false, prerequisites: ['Aucun lieu sélectionné.'] };
        }
    
        let totalPercentage = 0;
        if (selectedPlace.config.demographics) {
            totalPercentage = Object.values(selectedPlace.config.demographics).reduce((sum, val) => sum + (val || 0), 0);
        }
        if (totalPercentage !== 100) {
            prerequisites.push(`Le total de la démographie doit être de 100% (actuel: ${totalPercentage}%).`);
        }
    
        let nonAdminBuildingChecked = false;
        const placeTypeBuildings = buildingData[selectedPlace.type] || {};
        for (const category in placeTypeBuildings) {
            if (category === 'Bâtiments Administratifs') continue;
            for (const buildingName in placeTypeBuildings[category]) {
                if (selectedPlace.config.buildings[buildingName]?.active) {
                    nonAdminBuildingChecked = true;
                    break;
                }
            }
            if (nonAdminBuildingChecked) break;
        }
        if (!nonAdminBuildingChecked) {
            prerequisites.push('Au moins un bâtiment non-administratif doit être coché.');
        }
    
        return {
            isValid: prerequisites.length === 0,
            prerequisites: prerequisites
        };
    }

    function checkAllPlacesValidated(region) {
        if (!region || region.places.length === 0) {
            return false;
        }
        return region.places.every(place => place.config && place.config.isValidated === true);
    }

    function updateNavLinksState() {
        const navStep3 = document.getElementById('nav-step-3');
        if (!navStep3) return;
        const allValid = checkAllPlacesValidated(currentRegion);
        if (allValid) {
            navStep3.classList.remove('nav-disabled');
        } else {
            navStep3.classList.add('nav-disabled');
        }
    }

    function updateValidationUI() {
        if (!selectedPlace) return;
    
        const { isValid, prerequisites } = checkPlaceValidation();
        const isPlaceValidated = selectedPlace.config.isValidated;
    
        const validateBtn = document.getElementById('validate-place-btn');
        const validationMsg = document.getElementById('validation-prerequisites');
        const validationStatusBadge = document.getElementById('place-validation-status');
    
        if (validateBtn) {
            validateBtn.disabled = !isValid;
            validationMsg.innerHTML = prerequisites.map(p => `&bull; ${p}`).join('<br>');
    
            if (isValid) {
                validateBtn.classList.remove('btn-delete');
                validateBtn.classList.add('btn-primary');
            } else {
                validateBtn.classList.remove('btn-primary');
                validateBtn.classList.add('btn-delete');
            }
        }
    
        if (validationStatusBadge) {
            if (isPlaceValidated && isValid) {
                validationStatusBadge.textContent = '✓ Lieu enregistré';
                validationStatusBadge.className = 'place-type-badge';
                validationStatusBadge.style.backgroundColor = 'var(--color-forest-green)';
                validationStatusBadge.style.marginLeft = '10px';
            } else {
                validationStatusBadge.textContent = '';
                validationStatusBadge.className = '';
                validationStatusBadge.style.marginLeft = '0';
            }
        }
        
        renderPlacesList();
    }

    function invalidateAndSave() {
        if (selectedPlace) {
            selectedPlace.config.isValidated = false;
            saveData();
            updateValidationUI();
        }
    }

    // --- GESTIONNAIRES D'ÉVÉNEMENTS ---
    function setupEventListeners() {
        regionSelect.addEventListener('change', handleRegionChange);
        placesList.addEventListener('click', handlePlaceSelect);
    }

    function setupConfigEventListeners() {
        const distanceTable = configPanel.querySelector('#distance-table');

        configPanel.querySelector('#initial-state')?.addEventListener('change', (e) => {
            selectedPlace.config.initialState = e.target.value;
            invalidateAndSave();
        });

        configPanel.querySelectorAll('.race-percentage-num, .race-percentage-slider').forEach(input => {
            const eventType = input.type === 'range' ? 'input' : 'change';
            input.addEventListener(eventType, handleDemographicsChange);
        });

        configPanel.addEventListener('change', (e) => {
            if (e.target.matches('.building-row input[type="checkbox"]')) {
                const buildingName = e.target.dataset.buildingName;
                selectedPlace.config.buildings[buildingName].active = e.target.checked;
                updateGlobalStats();
                invalidateAndSave();
            }
        });
        
        configPanel.addEventListener('click', (e) => {
            const button = e.target.closest('button');
            if (!button) return;

            if (button.classList.contains('btn-adjust')) {
                const action = button.dataset.action;
                const buildingName = button.dataset.buildingName;
                const display = button.parentElement.querySelector('.building-count-display');
                let count = parseInt(display.textContent);
    
                if (action === 'increase') count++;
                else if (action === 'decrease' && count > 1) count--;
                
                display.textContent = count;
                selectedPlace.config.buildings[buildingName].count = count;
                updateGlobalStats();
                invalidateAndSave();
            }

            if (button.parentElement.classList.contains('building-actions')) {
                const action = button.dataset.action;
                const fieldset = button.closest('fieldset');
                const checkboxes = fieldset.querySelectorAll('input[type="checkbox"]:not(:disabled)');
                
                checkboxes.forEach(cb => {
                    let shouldBeActive;
                    if (action === 'check-all') shouldBeActive = true;
                    else if (action === 'uncheck-all') shouldBeActive = false;
                    else if (action === 'random-selection') shouldBeActive = Math.random() > 0.5;
                    else return;
                    cb.checked = shouldBeActive;
                    selectedPlace.config.buildings[cb.dataset.buildingName].active = shouldBeActive;
                });
                updateGlobalStats();
                invalidateAndSave();
            }

            if (button.id === 'validate-place-btn' && !button.disabled) {
                selectedPlace.config.isValidated = true;
                saveData();
                updateValidationUI();
            }
        });

        if (distanceTable) {
            distanceTable.addEventListener('input', handleRouteSliderChange);
        }
    }

    function handleRouteSliderChange(e) {
        if (!e.target.matches('.route-modifier-slider')) return;
    
        const slider = e.target;
        const routeKey = slider.dataset.routeKey;
        const newIndex = parseInt(slider.value);
    
        // Mettre à jour l'état
        currentRegion.routeModifiers[routeKey] = newIndex;
        saveData();
    
        // Mettre à jour l'UI en temps réel
        const routeType = ROUTE_TYPES[newIndex];
        document.getElementById(`label-${routeKey}`).textContent = routeType.name;
    
        const otherId = parseInt(slider.closest('.distance-entry').dataset.otherId);
        const otherPlace = currentRegion.places.find(p => p.id === otherId);
        if (!otherPlace) return;
    
        const axialDistance = (a, b) => (Math.abs(a.q - b.q) + Math.abs(a.r - b.r) + Math.abs(a.q + a.r - (b.q + b.r))) / 2;
        const distKm = axialDistance(selectedPlace.coords, otherPlace.coords) * (currentRegion.scale || 1);
        
        const travelTimeWalkBase = distKm / 5;
        const travelTimeHorseBase = distKm / 15;
    
        const travelTimeWalk = travelTimeWalkBase * routeType.walkModifier;
        const travelTimeHorse = travelTimeHorseBase * routeType.horseModifier;
    
        document.getElementById(`walk-time-${routeKey}`).textContent = formatTravelTime(travelTimeWalk);
        document.getElementById(`horse-time-${routeKey}`).textContent = formatTravelTime(travelTimeHorse);
    }

    function handleDemographicsChange(e) {
        const raceName = e.target.dataset.race;
        let value = parseInt(e.target.value) || 0;

        if (value < 0) value = 0;
        if (value > 100) value = 100;

        const numInput = document.getElementById(`race-num-${raceName}`);
        const sliderInput = document.getElementById(`race-slider-${raceName}`);
        numInput.value = value;
        sliderInput.value = value;
        
        selectedPlace.config.demographics[raceName] = value;
        
        const totalDiv = document.getElementById('demographics-total');
        const allNumInputs = document.querySelectorAll('.race-percentage-num');
        let totalPercentage = 0;
        allNumInputs.forEach(input => {
            totalPercentage += parseInt(input.value) || 0;
        });
        
        totalDiv.textContent = `Total : ${totalPercentage}%`;
        totalDiv.classList.toggle('invalid', totalPercentage !== 100);

        invalidateAndSave();
    }
    
    function handleRegionChange() {
        const selectedId = parseInt(regionSelect.value);
        currentRegion = regions.find(r => r.id === selectedId) || null;
        selectedPlace = null;
        
        if (currentRegion) {
             localStorage.setItem(LAST_REGION_KEY, currentRegion.id);
        }

        renderPlacesList();
        renderConfigPanel();
        updateNavLinksState(); 
    }

    function handlePlaceSelect(e) {
        if (e.target.tagName !== 'LI' || e.target.classList.contains('no-places')) return;
        
        const selectedId = parseInt(e.target.dataset.placeId);
        selectedPlace = currentRegion.places.find(p => p.id === selectedId);

        placesList.querySelectorAll('li').forEach(li => li.classList.remove('active'));
        e.target.classList.add('active');

        renderConfigPanel();
    }

    // --- DÉMARRAGE ---
    init();
});