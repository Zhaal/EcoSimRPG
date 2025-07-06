/**
 * EcoSimRPG - step3.js
 * VERSION 11.0 - Refonte de la modale de création de famille.
 * - Remplacement de la liste de membres par une structure (Chef, Conjoint, Enfants).
 * - Permet d'assigner un conjoint et des enfants directement.
 * - Chaque adulte (chef/conjoint) peut avoir un poste assigné indépendamment.
 * - Logique de sauvegarde adaptée pour créer les liens familiaux (époux, parents, enfants) correctement.
 * MODIFIED: Ajout de la sauvegarde et de l'édition des modèles de familles personnalisées.
 * MODIFIED: Ajout du sélecteur pour la loi de succession (Tiers 0).
 */
document.addEventListener('DOMContentLoaded', () => {

    // --- CONSTANTES & CONFIGURATION ---
    const STORAGE_KEY = 'ecoSimRPG_map_data';
    const FAMILY_TEMPLATE_STORAGE_KEY = 'ecoSimRPG_family_templates';
    const LAST_REGION_KEY = 'ecoSimRPG_last_region_id';
    const BUILDING_DATA = window.EcoSimData.buildings;
    const RACES_DATA = window.EcoSimData.racesData;
    const TRAVEL_SPEEDS = { Pied: 30, Cheval: 70, Caravane: 20 };
    const ROAD_MODIFIERS = { 'royal': 1.0, 'comtal': 0.85, 'marchand': 0.70, 'seigneurial': 0.60, 'traverse': 0.50, 'forestier': 0.40, 'montagne': 0.25 };
    const ROAD_TYPES = { 'royal': { users: ['Caravane', 'Cheval', 'Pied'] }, 'comtal': { users: ['Caravane', 'Cheval', 'Pied'] }, 'marchand': { users: ['Caravane', 'Cheval', 'Pied'] }, 'seigneurial': { users: ['Caravane', 'Cheval', 'Pied'] }, 'traverse': { users: ['Cheval', 'Pied'] }, 'forestier': { users: ['Cheval', 'Pied'] }, 'montagne': { users: ['Cheval', 'Pied'] } };

    // --- SÉLECTEURS DOM ---
    const placesListContainer = document.getElementById('places-list-step3');
    const mainPanel = document.getElementById('main-panel-step3');
    const welcomePanel = document.getElementById('welcome-panel');
    const configPanel = document.getElementById('config-panel');
    const configPanelTitle = document.getElementById('config-panel-title');
    const raceDistributionContainer = document.getElementById('race-distribution-container');
    const raceTotalPercentage = document.getElementById('race-total-percentage');
    const interracialMarriageToggle = document.getElementById('interracial-marriage-toggle');
    const inheritanceLawSelect = document.getElementById('inheritance-law-select'); // Ajout
    const preGenerateBtn = document.getElementById('pre-generate-btn');
    const manageFamiliesBtn = document.getElementById('manage-families-btn');
    const familyListContainer = document.getElementById('family-list-container');
    const statTotalPopulation = document.getElementById('stat-total-population');
    const statFamilyCount = document.getElementById('stat-family-count');
    const statTotalJobs = document.getElementById('stat-total-jobs');
    const statFilledJobs = document.getElementById('stat-filled-jobs');
    const globalTotalPopulation = document.getElementById('global-total-population');
    const globalFamilyCount = document.getElementById('global-family-count');
    const distanceMatrixContainer = document.getElementById('distance-matrix-container');
    const resetAllBtn = document.getElementById('reset-all-btn');
    const resetGen0Btn = document.getElementById('reset-gen0-btn');
    const familyLibraryModal = document.getElementById('family-library-modal');
    const createNewTemplateBtn = document.getElementById('create-new-template-btn');
    const familyTemplatesList = document.getElementById('family-templates-list');
    const characterDetailsModal = document.getElementById('character-details-modal');

    // -- DOM Selectors for NEW Family Modal --
    const familyModal = document.getElementById('family-modal');
    const familyForm = document.getElementById('family-form');
    const familyNameInput = document.getElementById('family-name');
    const confirmAddFamilyBtn = document.getElementById('confirm-add-family-btn');
    const cancelFamilyBtn = document.getElementById('cancel-family-btn');


    // --- ÉTAT DE L'APPLICATION ---
    let regions = [];
    let currentRegion = null;
    let selectedPlace = null;
    let currentCustomFamily = { head: null, spouse: null, children: [] };


    // --- FONCTIONS UTILITAIRES & HELPERS ---
    function getFamilyTemplates() { const data = localStorage.getItem(FAMILY_TEMPLATE_STORAGE_KEY); return data ? JSON.parse(data) : []; }
    function saveFamilyTemplates(templates) { localStorage.setItem(FAMILY_TEMPLATE_STORAGE_KEY, JSON.stringify(templates)); }
    
    function addOrUpdateFamilyTemplate(familyData) {
        let templates = getFamilyTemplates();
        const existingIndex = templates.findIndex(t => t.id === familyData.id);
        if (existingIndex > -1) {
            templates[existingIndex] = familyData;
        } else {
            templates.push(familyData);
        }
        saveFamilyTemplates(templates);
    }

    function deleteFamilyTemplate(templateId) { let templates = getFamilyTemplates(); templates = templates.filter(t => t.id !== templateId); saveFamilyTemplates(templates); }
    function convertToDnD(rawValue) { const RAW_MIN = 10; const RAW_MAX = 700; const DND_MIN = 8; const DND_MAX = 18; const DND_ABSOLUTE_MIN = 3; let dndScore; if (rawValue >= RAW_MAX) { dndScore = DND_MAX; } else if (rawValue <= RAW_MIN) { const ratio = rawValue / RAW_MIN; dndScore = Math.round(DND_ABSOLUTE_MIN + ratio * (DND_MIN - DND_ABSOLUTE_MIN)); } else { const rawRange = RAW_MAX - RAW_MIN; const dndRange = DND_MAX - DND_MIN; const scaledValue = (rawValue - RAW_MIN) / rawRange; dndScore = Math.round(DND_MIN + (scaledValue * dndRange)); } dndScore = Math.max(1, dndScore); const modifier = Math.floor((dndScore - 10) / 2); const sign = modifier >= 0 ? '+' : ''; return `${dndScore} (${sign}${modifier})`; }
    function getBuildingData(buildingName) { if (!buildingName) return null; for (const type in BUILDING_DATA) { for (const category in BUILDING_DATA[type]) { if (BUILDING_DATA[type][category][buildingName]) { return { ...BUILDING_DATA[type][category][buildingName], category, originalType: type }; } } } return null; }
    function getJobData(buildingName, jobTitle) { const building = getBuildingData(buildingName); if (!building || !building.emplois) return null; return building.emplois.find(j => j.titre === jobTitle) || null; }
    function axialDistance(a, b) { if (!a || !b) return Infinity; const dq = a.q - b.q; const dr = a.r - b.r; return (Math.abs(dq) + Math.abs(dr) + Math.abs(-dq - dr)) / 2; }
    function getRoadKey(id1, id2) { return [id1, id2].sort((a, b) => a - b).join('-'); }
    function formatTravelTime(timeInDays) { if (isNaN(timeInDays) || timeInDays < 0 || timeInDays === Infinity) return "N/A"; const days = Math.floor(timeInDays); const hours = Math.floor((timeInDays - days) * 24); let parts = []; if (days > 0) parts.push(`${days}j`); if (hours > 0) parts.push(`${hours}h`); return parts.length > 0 ? parts.join(' ') : "< 1h"; }
    function getPersonById(id, scope) { return scope.find(p => p.id === id); }
    function getWeightedDesiredChildren() { const weights = [ 2, 2, 3 ]; return weights[Math.floor(Math.random() * weights.length)]; }
    
    function getDescendantMap(ruler, population) {
        const descendantMap = new Map();
        const queue = [{ personId: ruler.id, generation: 0 }];
        const visited = new Set();
        if (ruler.spouseId) { descendantMap.set(ruler.spouseId, 1); visited.add(ruler.spouseId); }
        while (queue.length > 0) {
            const { personId, generation } = queue.shift();
            if (visited.has(personId)) continue;
            visited.add(personId);
            descendantMap.set(personId, generation);
            const person = getPersonById(personId, population);
            if (person && person.childrenIds) {
                person.childrenIds.forEach(childId => {
                    if (!visited.has(childId)) {
                        queue.push({ personId: childId, generation: generation + 1 });
                    }
                });
            }
        }
        return descendantMap;
    }

    function getRulingFamilyInfoForPerson(person, allPopulation) {
        for (const p of allPopulation) {
            if (p.job) {
                const jobData = getJobData(p.job.buildingName, p.job.jobTitle);
                if (jobData && jobData.tier === 0) {
                    if (p.spouseId === person.id) {
                        return { isRulerSpouse: true, rulerJobTitle: jobData.titre };
                    }
                    const descendantMap = getDescendantMap(p, allPopulation);
                    if (descendantMap.has(person.id) && descendantMap.get(person.id) > 0) {
                        return { isHeir: true };
                    }
                }
            }
        }
        return null;
    }

    // --- LOGIQUE DE L'INTERFACE PRINCIPALE ---
    function loadData() { const data = localStorage.getItem(STORAGE_KEY); regions = data ? JSON.parse(data) : []; const lastRegionId = localStorage.getItem(LAST_REGION_KEY); if (lastRegionId) { currentRegion = regions.find(r => r.id == lastRegionId) || null; } }
    function saveData() { localStorage.setItem(STORAGE_KEY, JSON.stringify(regions)); }
    function displayPlacesList() { placesListContainer.innerHTML = ''; if (!currentRegion) return; currentRegion.places.forEach(place => { const li = document.createElement('li'); li.className = 'place-item-step3'; li.dataset.placeId = place.id; const isConfigured = place.demographics && place.demographics.population && place.demographics.population.length > 0; li.innerHTML = `<span>${place.name} (${place.type})</span><span class="status-icon" id="status-icon-${place.id}">${isConfigured ? '🟢' : '🟡'}</span>`; li.addEventListener('click', () => selectPlace(place.id)); placesListContainer.appendChild(li); }); }
    
    function selectPlace(placeId) {
        selectedPlace = currentRegion.places.find(p => p.id === placeId);
        if (!selectedPlace) return;
    
        if (!selectedPlace.demographics) {
            selectedPlace.demographics = {
                raceDistribution: {},
                raceDistributionTotal: 0,
                allowInterracialMarriage: true,
                population: [],
                families: [],
                inheritanceLaw: 'primogeniture_male' // Valeur par défaut
            };
        }
        // Assurer que la propriété existe pour les anciennes sauvegardes
        if (selectedPlace.demographics.inheritanceLaw === undefined) {
            selectedPlace.demographics.inheritanceLaw = 'primogeniture_male';
        }
    
        document.querySelectorAll('.place-item-step3.active').forEach(el => el.classList.remove('active'));
        document.querySelector(`.place-item-step3[data-place-id='${placeId}']`).classList.add('active');
        welcomePanel.classList.add('hidden');
        configPanel.classList.remove('hidden');
        configPanelTitle.textContent = `Configuration de ${selectedPlace.name}`;
        
        renderRaceDistribution();
        
        // Mettre à jour la valeur du select avec la donnée sauvegardée
        inheritanceLawSelect.value = selectedPlace.demographics.inheritanceLaw;

        updatePlaceStats();
        updatePopulationUI();
    }
    
    function renderRaceDistribution() { raceDistributionContainer.innerHTML = ''; let total = 0; Object.keys(RACES_DATA.races).forEach(raceName => { const value = selectedPlace.demographics.raceDistribution[raceName] || 0; total += value; const div = document.createElement('div'); div.className = 'race-slider-group'; div.innerHTML = `<label for="slider-${raceName}">${raceName}</label><input type="range" id="slider-${raceName}" min="0" max="100" value="${value}" data-race="${raceName}"><span id="value-${raceName}">${value}%</span>`; raceDistributionContainer.appendChild(div); div.querySelector('input[type="range"]').addEventListener('input', handleSliderChange); }); selectedPlace.demographics.raceDistributionTotal = total; updateTotalPercentage(); interracialMarriageToggle.checked = selectedPlace.demographics.allowInterracialMarriage; }
    function handleSliderChange(e) { document.getElementById(`value-${e.target.dataset.race}`).textContent = `${e.target.value}%`; selectedPlace.demographics.raceDistribution[e.target.dataset.race] = parseInt(e.target.value, 10); updateTotalPercentage(); }
    function updateTotalPercentage() { let total = Object.values(selectedPlace.demographics.raceDistribution).reduce((sum, val) => sum + val, 0); selectedPlace.demographics.raceDistributionTotal = total; raceTotalPercentage.textContent = `${total} / 100 %`; preGenerateBtn.disabled = total !== 100; raceTotalPercentage.style.color = total === 100 ? 'var(--color-forest-green)' : 'var(--color-error)'; }
    function updatePlaceStats() { if (!selectedPlace) return; const totalJobs = countTotalJobsForPlace(selectedPlace); const filledJobs = selectedPlace.demographics.population.filter(p => p.job).length; statTotalPopulation.textContent = selectedPlace.demographics.population.length; statFamilyCount.textContent = selectedPlace.demographics.families.length; statTotalJobs.textContent = totalJobs; statFilledJobs.textContent = filledJobs; }
    
    function renderFamilyView(container, families, population) {
        const familyGroups = document.createElement('div');
        families.forEach(family => {
            const familyDiv = document.createElement('div');
            familyDiv.className = 'family-summary-list';
            const members = family.memberIds.map(id => population.find(p => p.id === id)).filter(p => p);
            const memberDetails = members.sort((a, b) => b.age - a.age).map(p => {
                if (!p) return '<li>Membre manquant</li>';
                const rulingInfo = getRulingFamilyInfoForPerson(p, population);
                let jobInfo = 'Sans emploi';
                if(p.job) jobInfo = p.job.jobTitle;
                else if (rulingInfo?.isRulerSpouse) jobInfo = `${p.gender === 'Femme' ? 'Épouse' : 'Époux'} du ${rulingInfo.rulerJobTitle}`;
                else if (rulingInfo?.isHeir) jobInfo = p.gender === 'Femme' ? 'Héritière' : 'Héritier';
                else if(p.age < (RACES_DATA.races[p.race]?.ageAdulte || 18)) jobInfo = 'Enfant';

                return `<li><span class="character-link" data-person-id="${p.id}">${p.firstName} ${p.lastName}</span><span class="family-member-job">(${p.age} ans, ${jobInfo})</span></li>`;
            }).join('');
            familyDiv.innerHTML = `<h4>Famille ${family.name} (${members.length} membres)</h4><ul>${memberDetails}</ul>`;
            familyGroups.appendChild(familyDiv);
        });
        container.appendChild(familyGroups);
    }

    function renderCategoryView(container, place) {
        const population = place.demographics.population;
        const allPopulation = currentRegion.places.flatMap(p => (p.demographics ? p.demographics.population : []));        
        const buildingDefinitions = BUILDING_DATA[place.type] || {};
        const peopleByBuilding = population.reduce((acc, p) => { if (p.job && p.job.buildingName) { if (!acc[p.job.buildingName]) acc[p.job.buildingName] = []; acc[p.job.buildingName].push(p); } return acc; }, {});
        
        Object.keys(buildingDefinitions).forEach(categoryName => {
            const buildingsInCategory = buildingDefinitions[categoryName];
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'building-category-group';
            let categoryHTML = `<h3>${categoryName}</h3>`;
            let hasContent = false;
            Object.keys(buildingsInCategory).forEach(buildingName => {
                const workersInBuilding = peopleByBuilding[buildingName];
                if (workersInBuilding && workersInBuilding.length > 0) {
                    hasContent = true;
                    const buildingData = buildingsInCategory[buildingName];
                    let buildingHTML = `<div class="building-job-group"><h4>${buildingName}</h4>`;
                    buildingData.emplois.forEach(job => {
                        const workersInJob = workersInBuilding.filter(p => p.job.jobTitle === job.titre).sort((a, b) => (a.lastName || '').localeCompare(b.lastName || ''));
                        if(workersInJob.length > 0) {
                            buildingHTML += `<div class="job-listing"><strong>${job.titre}</strong> (${workersInJob.length}/${job.postes})<ul class="employee-list">${workersInJob.map(p => `<li><span class="character-link" data-person-id="${p.id}">${p.firstName} ${p.lastName}</span> (${p.age} ans)</li>`).join('')}</ul></div>`;
                        }
                    });
                    buildingHTML += `</div>`;
                    categoryHTML += buildingHTML;
                }
            });
            categoryDiv.innerHTML = categoryHTML;
            if (hasContent) container.appendChild(categoryDiv);
        });
        
        const unemployedAdults = population.filter(p => !p.job && p.age >= (RACES_DATA.races[p.race]?.ageAdulte || 18));
        const children = population.filter(p => !p.job && p.age < (RACES_DATA.races[p.race]?.ageAdulte || 18));

        const unemployedList = unemployedAdults.sort((a, b) => (a.lastName || '').localeCompare(b.lastName || ''))
            .map(p => {
                const rulingInfo = getRulingFamilyInfoForPerson(p, allPopulation);
                let title = 'Sans Emploi';
                if (rulingInfo?.isRulerSpouse) title = `${p.gender === 'Femme' ? 'Épouse' : 'Époux'} du ${rulingInfo.rulerJobTitle}`;
                else if (rulingInfo?.isHeir) title = p.gender === 'Femme' ? 'Héritière' : 'Héritier';
                return `<li><span class="character-link" data-person-id="${p.id}">${p.firstName} ${p.lastName}</span> (${p.age} ans, <i>${title}</i>)</li>`;
            }).join('');
        
        if (unemployedAdults.length > 0) {
            const unemployedDiv = document.createElement('div');
            unemployedDiv.className = 'building-category-group';
            unemployedDiv.innerHTML = `<h3>Adultes sans assignation</h3><ul class="unemployed-list">${unemployedList}</ul>`;
            container.appendChild(unemployedDiv);
        }

        if (children.length > 0) {
            const childrenDiv = document.createElement('div');
            childrenDiv.className = 'building-category-group';
            childrenDiv.innerHTML = `<h3>Enfants</h3><ul class="unemployed-list">${children.map(p => `<li><span class="character-link" data-person-id="${p.id}">${p.firstName} ${p.lastName}</span> (${p.age} ans)</li>`).join('')}</ul>`;
            container.appendChild(childrenDiv);
        }
    }

    function updatePopulationUI() { familyListContainer.innerHTML = ''; if (!selectedPlace || selectedPlace.demographics.population.length === 0) { familyListContainer.innerHTML = '<p>Aucune population n\'a encore été générée pour ce lieu.</p>'; return; } const tabsNav = document.createElement('div'); tabsNav.className = 'tabs-nav'; tabsNav.innerHTML = `<button class="tab-link active" data-tab="category-view">Par Catégorie de Bâtiment</button><button class="tab-link" data-tab="family-view">Par Famille</button>`; const tabsContent = document.createElement('div'); tabsContent.className = 'tabs-content-wrapper'; const categoryView = document.createElement('div'); categoryView.id = 'category-view'; categoryView.className = 'tab-content active'; renderCategoryView(categoryView, selectedPlace); const familyView = document.createElement('div'); familyView.id = 'family-view'; familyView.className = 'tab-content'; renderFamilyView(familyView, selectedPlace.demographics.families, selectedPlace.demographics.population); tabsContent.appendChild(categoryView); tabsContent.appendChild(familyView); familyListContainer.appendChild(tabsNav); familyListContainer.appendChild(tabsContent); tabsNav.addEventListener('click', (e) => { if (e.target.matches('.tab-link')) { const tabId = e.target.dataset.tab; tabsNav.querySelectorAll('.tab-link').forEach(tab => tab.classList.remove('active')); tabsContent.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active')); e.target.classList.add('active'); document.getElementById(tabId).classList.add('active'); } }); }

    function getAvailableJobs(place, ignoreCustomFamilies = false) { let allJobSlots = []; if (place.config && place.config.buildings) { Object.values(place.config.buildings).flat().forEach(building => { const buildingData = getBuildingData(building.name); if (buildingData && buildingData.emplois) { buildingData.emplois.forEach(job => { for (let i = 0; i < job.postes; i++) { allJobSlots.push({ locationId: place.id, buildingName: building.name, jobTitle: job.titre }); } }); } }); } if (ignoreCustomFamilies) return allJobSlots; const filledJobCounts = new Map(); place.demographics.population.forEach(p => { if (p.job) { const key = `${p.job.locationId}-${p.job.buildingName}-${p.job.jobTitle}`; filledJobCounts.set(key, (filledJobCounts.get(key) || 0) + 1); } }); const availableJobs = []; const tempJobCounts = new Map(); for (const job of allJobSlots) { const key = `${job.locationId}-${job.buildingName}-${job.jobTitle}`; const filledCount = filledJobCounts.get(key) || 0; const tempCount = tempJobCounts.get(key) || 0; const jobData = getJobData(job.buildingName, job.jobTitle); if (!jobData) continue; if (tempCount < (jobData.postes - filledCount)) { availableJobs.push(job); tempJobCounts.set(key, tempCount + 1); } } return availableJobs; }
    function countTotalJobsForPlace(place) { return getAvailableJobs(place, true).length; }
    
    function findBestPartner(person, potentialPartners, allowInterracial, compatibleRaces) {
        let bestPartnerIndex = -1;
        let highestScore = -1;
        const personJobData = getJobData(person.job.buildingName, person.job.jobTitle);
        if (!personJobData) return -1;
        const personJobTier = personJobData.tier;
        const SAMPLE_SIZE = 60;
        let searchSample = [...potentialPartners];
        for (let i = searchSample.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [searchSample[i], searchSample[j]] = [searchSample[j], searchSample[i]];
        }
        if (searchSample.length > SAMPLE_SIZE) {
            searchSample = searchSample.slice(0, SAMPLE_SIZE);
        }
        for (const partner of searchSample) {
            if (Math.abs(person.age - partner.age) > 10) { 
                continue;
            }
            let currentScore = 0;
            const isRaceCompatible = (partner.race === person.race) || (allowInterracial && compatibleRaces.includes(partner.race));
            if (!isRaceCompatible) continue;
            currentScore += 100;
            const partnerJobData = getJobData(partner.job.buildingName, partner.job.jobTitle);
            if (partnerJobData) {
                if (person.job && partner.job && person.job.buildingName === partner.job.buildingName) currentScore += 15;

                const partnerJobTier = partnerJobData.tier;
                if (partner.job.jobTitle === person.job.jobTitle) currentScore += 20;
                else if (partnerJobTier === personJobTier) currentScore += 10;
                else if (Math.abs(partnerJobTier - personJobTier) === 1) currentScore += 5;
            }
            if (currentScore > highestScore) {
                highestScore = currentScore;
                bestPartnerIndex = potentialPartners.findIndex(p => p.id === partner.id);
            }
        }
        return bestPartnerIndex;
    }
    
    function getAgeForTier(tier, raceData) {
        const adultAge = raceData.ageAdulte || 18;
        const maxAge = raceData.esperanceVieMax || 100;
        let minAge, maxAgeRange;
        switch (tier) {
            case 0: case 1: minAge = Math.max(adultAge, Math.floor(maxAge * 0.4)); maxAgeRange = Math.floor(maxAge * 0.2); break;
            case 2: minAge = Math.max(adultAge, Math.floor(maxAge * 0.3)); maxAgeRange = Math.floor(maxAge * 0.2); break;
            case 3: minAge = Math.max(adultAge, Math.floor(maxAge * 0.2)); maxAgeRange = Math.floor(maxAge * 0.15); break;
            case 4: minAge = adultAge + 2; maxAgeRange = 10; break;
            default: minAge = adultAge; maxAgeRange = 7; break;
        }
        const calculatedMaxAge = minAge + Math.floor(Math.random() * (maxAgeRange + 1));
        return Math.min(calculatedMaxAge, maxAge - 1);
    }

    function generatePopulationForPlace() {
        if (!selectedPlace || selectedPlace.demographics.raceDistributionTotal !== 100) {
            alert("Veuillez d'abord définir la distribution des races à 100%.");
            return;
        }
        if (selectedPlace.demographics.population.some(p => !p.isCustom)) {
            if (!confirm("Cette action va remplacer la population auto-générée existante (les familles personnalisées seront conservées). Voulez-vous continuer ?")) {
                return;
            }
        }
        resetGen0Population();
        let availableJobs = getAvailableJobs(selectedPlace);
        let allNewPopulation = [];
        let individualsToCreate = [];
        availableJobs.sort((a, b) => {
            const jobA_data = getJobData(a.buildingName, a.jobTitle);
            const jobB_data = getJobData(b.buildingName, b.jobTitle);
            return (jobA_data?.tier ?? 5) - (jobB_data?.tier ?? 5);
        });
        const racePool = [];
        Object.entries(selectedPlace.demographics.raceDistribution).forEach(([raceName, percentage]) => {
            const count = Math.round(availableJobs.length * (percentage / 100));
            for (let i = 0; i < count; i++) racePool.push(raceName);
        });
        availableJobs.forEach(job => {
            if (racePool.length === 0) return;
            const raceIndex = Math.floor(Math.random() * racePool.length);
            const selectedRace = racePool.splice(raceIndex, 1)[0];
            const raceData = RACES_DATA.races[selectedRace];
            const jobData = getJobData(job.buildingName, job.jobTitle);
            const gender = Math.random() < 0.5 ? 'Homme' : 'Femme';
            const names = gender === 'Homme' ? raceData.prenomsM : raceData.prenomsF;
            const firstName = names[Math.floor(Math.random() * names.length)];
            const age = getAgeForTier(jobData.tier, raceData);
            const person = {
                id: `auto_${Date.now()}_${Math.random()}`, firstName, locationId: selectedPlace.id, race: selectedRace, gender, isAlive: true, age,
                job: { locationId: job.locationId, buildingName: job.buildingName, jobTitle: job.jobTitle },
                spouseId: null, hasBeenMarried: false, familyId: null, isCustom: false, parents: [], childrenIds: [],
                friendIds: [], acquaintanceIds: [], maxFriends: Math.floor(Math.random() * 5) + 1,
                maxAcquaintances: Math.floor(Math.random() * 12) + 7, desiredChildren: getWeightedDesiredChildren(), status: 'Actif'
            };
            const experienceData = applyInitialExperience(person, jobData);
            Object.assign(person, { salary: calculateInitialSalary(jobData), stats: experienceData.stats, prestige: experienceData.prestige });
            individualsToCreate.push(person);
        });
        const usedFamilyNames = new Set(selectedPlace.demographics.families.map(f => f.name));
        let men = individualsToCreate.filter(p => p.gender === 'Homme');
        let women = individualsToCreate.filter(p => p.gender === 'Femme');
        const getTier = (p) => getJobData(p.job.buildingName, p.job.jobTitle)?.tier ?? 5;
        men.sort((a, b) => getTier(a) - getTier(b));
        women.sort((a, b) => getTier(a) - getTier(b));
        const allowInterracial = selectedPlace.demographics.allowInterracialMarriage;
        const singleLeftovers = [];

        while (men.length > 0) {
            const man = men.shift();
            const compatibleRaces = allowInterracial ? RACES_DATA.compatibilites[man.race] || [] : [];
            const womanIndex = findBestPartner(man, women, allowInterracial, compatibleRaces);
            const isRuler = getTier(man) === 0;

            if (womanIndex > -1 && women.length > 0) {
                const woman = women.splice(womanIndex, 1)[0];
                let familyName;
                do { familyName = RACES_DATA.races[man.race].noms[Math.floor(Math.random() * RACES_DATA.races[man.race].noms.length)]; } while (usedFamilyNames.has(familyName));
                usedFamilyNames.add(familyName);
                man.lastName = familyName;
                woman.maidenName = woman.lastName;
                woman.lastName = familyName;
                man.spouseId = woman.id;
                woman.spouseId = man.id;
                man.hasBeenMarried = true;
                woman.hasBeenMarried = true;
                const family = { id: `fam_auto_${Date.now()}_${Math.random()}`, name: familyName, locationId: selectedPlace.id, memberIds: [man.id, woman.id], isCustom: false };
                man.familyId = family.id;
                woman.familyId = family.id;
                allNewPopulation.push(man, woman);
                if (isRuler) woman.job = null; 
                
                const desiredChildCount = Math.min(man.desiredChildren, woman.desiredChildren);
                const youngestParent = man.age < woman.age ? man : woman;
                let maxPossibleAgeForNextChild = youngestParent.age - (RACES_DATA.races[youngestParent.race].ageAdulte || 18);

                for (let i = 0; i < desiredChildCount; i++) {
                    const childSpacingInYears = (RACES_DATA.races[woman.race].dureeGestationMois || 9) / 12 + 1.5;
                    if (maxPossibleAgeForNextChild <= childSpacingInYears) break;
                    const finalChildAge = Math.max(0, Math.random() * (maxPossibleAgeForNextChild - childSpacingInYears));
                    const child = createChild(man, woman);
                    if (child) {
                        child.age = Math.floor(finalChildAge);
                        family.memberIds.push(child.id);
                        man.childrenIds.push(child.id);
                        woman.childrenIds.push(child.id);
                        allNewPopulation.push(child);
                        maxPossibleAgeForNextChild = finalChildAge;
                    } else break;
                }
                selectedPlace.demographics.families.push(family);
            } else {
                singleLeftovers.push(man);
            }
        }
        singleLeftovers.push(...men, ...women);
        
        singleLeftovers.forEach(person => {
            let newFamilyName;
            const personRaceData = RACES_DATA.races[person.race];
            do {
                newFamilyName = personRaceData.noms[Math.floor(Math.random() * personRaceData.noms.length)];
            } while (usedFamilyNames.has(newFamilyName));
            usedFamilyNames.add(newFamilyName);
            person.lastName = newFamilyName; 

            const family = { id: `fam_auto_${Date.now()}_${Math.random()}`, name: person.lastName, locationId: selectedPlace.id, memberIds: [person.id], isCustom: false };
            person.familyId = family.id;
            selectedPlace.demographics.families.push(family);
            allNewPopulation.push(person);
        });

        const allFamilies = selectedPlace.demographics.families;
        allFamilies.forEach(family => {
            const ruler = allNewPopulation.find(p => p.familyId === family.id && p.job && getJobData(p.job.buildingName, p.job.jobTitle)?.tier === 0);
            if (ruler) {
                const rulerJobData = getJobData(ruler.job.buildingName, ruler.job.jobTitle);
                const descendantMap = getDescendantMap(ruler, allNewPopulation);
                descendantMap.forEach((generation, personId) => {
                    const person = getPersonById(personId, allNewPopulation);
                    if (!person || person.id === ruler.id) return;
                    
                    person.job = null; 
                    const raceData = RACES_DATA.races[person.race];
                    const learningMonths = Math.max(0, (person.age - raceData.ageApprentissage) * 12);
                    let percentage;
                    if (generation <= 1) percentage = 1.0;
                    else if (generation === 2) percentage = 0.7;
                    else percentage = 0.4;

                    let totalPrestigeGain = 0;
                    let totalStatGains = { intelligence: 0, force: 0, constitution: 0, dexterite: 0, sagesse: 0, charisme: 0 };

                    if (rulerJobData && rulerJobData.gainsMensuels) {
                        totalPrestigeGain = (rulerJobData.gainsMensuels.prestige || 0);
                        for (const stat in rulerJobData.gainsMensuels.stats) {
                            totalStatGains[stat] = (rulerJobData.gainsMensuels.stats[stat] || 0);
                        }
                    }

                    person.prestige = (totalPrestigeGain * percentage) * learningMonths;
                    for (const stat in totalStatGains) {
                        person.stats[stat] = 5 + ((totalStatGains[stat] * percentage) * learningMonths);
                    }
                });
            }
        });

        selectedPlace.demographics.population.push(...allNewPopulation);
        saveData();
        updatePlaceStats();
        updatePopulationUI();
        updateDashboard();
        document.getElementById(`status-icon-${selectedPlace.id}`).textContent = '🟢';
    }


    function createChild(father, mother) {
        const childGender = Math.random() > 0.5 ? 'Homme' : 'Femme';
        const mixedRaceKey = [father.race, mother.race].sort().join('-');
        const childRace = RACES_DATA.racesMixtes[mixedRaceKey] || father.race;
        const raceData = RACES_DATA.races[childRace];
        const names = childGender === 'Homme' ? raceData.prenomsM : raceData.prenomsF;
        const firstName = names[Math.floor(Math.random() * names.length)];
        return {
            id: `auto_child_${Date.now()}_${Math.random()}`, locationId: mother.locationId, firstName, lastName: father.lastName,
            race: childRace, gender: childGender, age: 0, isAlive: true, job: null, salary: 0, prestige: 0,
            stats: { intelligence: 5, force: 5, constitution: 5, dexterite: 5, sagesse: 5, charisme: 5 },
            spouseId: null, hasBeenMarried: false, familyId: father.familyId, parents: [father.id, mother.id],
            childrenIds: [], friendIds: [], acquaintanceIds: [], maxFriends: Math.floor(Math.random() * 5) + 1,
            maxAcquaintances: Math.floor(Math.random() * 12) + 7, isCustom: false, desiredChildren: getWeightedDesiredChildren(), status: 'Actif'
        };
    }

    function calculateInitialSalary(jobData) { return Math.round(jobData.salaire.totalEnCuivre * (1 + (Math.random() * 0.3 - 0.15))); }
    function applyInitialExperience(person, jobData) { const raceData = RACES_DATA.races[person.race]; if (!raceData || !jobData) { return { stats: { intelligence: 10, force: 10, constitution: 10, dexterite: 10, sagesse: 10, charisme: 10 }, prestige: 0 }; } const adultAge = raceData.ageAdulte; const experienceInYears = Math.max(0, person.age - adultAge); const experienceInMonths = experienceInYears * 12; let calculatedPrestige = jobData.prerequis.prestige || 0; let calculatedStats = { intelligence: 10, force: 10, constitution: 10, dexterite: 10, sagesse: 10, charisme: 10 }; const monthlyGains = jobData.gainsMensuels; if (monthlyGains) { if (monthlyGains.prestige) { const totalBasePrestigeGain = monthlyGains.prestige * experienceInMonths; const randomFactor = 1 + (Math.random() * 0.8 - 0.2); calculatedPrestige += totalBasePrestigeGain * randomFactor; } if (monthlyGains.stats) { Object.keys(calculatedStats).forEach(statKey => { if (monthlyGains.stats[statKey] !== undefined) { const monthlyAdditiveGain = monthlyGains.stats[statKey]; const totalBaseStatGain = monthlyAdditiveGain * experienceInMonths; const randomFactor = 1 + (Math.random() * 0.8 - 0.4); calculatedStats[statKey] += totalBaseStatGain * randomFactor; } }); } } Object.keys(calculatedStats).forEach(statKey => { calculatedStats[statKey] = Math.max(1, Math.round(calculatedStats[statKey])); }); calculatedPrestige = Math.max(0, calculatedPrestige); return { prestige: calculatedPrestige, stats: calculatedStats }; }

    function openFamilyLibraryModal() {
        familyTemplatesList.innerHTML = ''; 
        const templates = getFamilyTemplates();
        if (templates.length === 0) {
            familyTemplatesList.innerHTML = '<p style="padding: 15px; text-align: center;">Aucun modèle de famille sauvegardé.</p>';
        } else {
            templates.forEach(template => {
                const div = document.createElement('div');
                div.className = 'family-template-item';
                div.innerHTML = `<span>${template.name}</span><div><button class="btn btn-edit" data-template-id="${template.id}">Charger & Éditer</button><button class="btn btn-danger" data-template-id="${template.id}">Supprimer</button></div>`;
                familyTemplatesList.appendChild(div);
            });
        }
        familyLibraryModal.showModal();
    }
    
    function handleLibraryActions(e) { 
        const templateId = e.target.dataset.templateId; 
        if (!templateId) return; 

        if (e.target.classList.contains('btn-edit')) { 
            const templates = getFamilyTemplates();
            const templateToLoad = templates.find(t => t.id === templateId);

            if (templateToLoad) {
                familyLibraryModal.close();
                loadTemplateIntoModal(templateToLoad);
            } else {
                alert("Erreur : Modèle de famille introuvable.");
            }
        } else if (e.target.classList.contains('btn-danger')) { 
            if (confirm("Êtes-vous sûr de vouloir supprimer ce modèle de famille de votre bibliothèque ?")) { 
                deleteFamilyTemplate(templateId); 
                openFamilyLibraryModal();
            } 
        } 
    }

    function loadTemplateIntoModal(template) {
        openFamilyModal();

        document.getElementById('editing-family-template-id').value = template.id;
        familyNameInput.value = template.name;

        if (template.head) {
            document.getElementById('head-firstname').value = template.head.firstName || '';
            document.getElementById('head-race').value = template.head.race || 'Humain';
            document.getElementById('head-age').value = template.head.age || '';
            document.getElementById('head-gender').value = template.head.gender || 'Homme';
        }

        const spouseToggle = document.getElementById('add-spouse-toggle');
        const spouseSection = document.getElementById('spouse-section');
        if (template.spouse) {
            spouseToggle.checked = true;
            spouseSection.classList.remove('hidden');
            document.getElementById('spouse-firstname').value = template.spouse.firstName || '';
            document.getElementById('spouse-race').value = template.spouse.race || 'Humain';
            document.getElementById('spouse-age').value = template.spouse.age || '';
            document.getElementById('spouse-gender').value = template.spouse.gender || 'Femme';
        } else {
            spouseToggle.checked = false;
            spouseSection.classList.add('hidden');
        }

        currentCustomFamily.children = template.children ? [...template.children] : [];
        updateChildrenUI();
        
        updateFamilyModalButtons();
    }

    function openFamilyModal() {
        if (!selectedPlace) {
            alert("Veuillez d'abord sélectionner un lieu.");
            return;
        }
        
        familyForm.reset();
        document.getElementById('editing-family-template-id').value = ''; // Reset editing ID
        currentCustomFamily = { head: null, spouse: null, children: [] };
        document.getElementById('spouse-section').classList.add('hidden');
        
        const allRaces = Object.keys(RACES_DATA.races).map(race => `<option value="${race}">${race}</option>`).join('');
        const allPlaces = '<option value="">-- Aucun --</option>' + currentRegion.places.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
        
        ['head-race', 'spouse-race', 'child-race'].forEach(id => document.getElementById(id).innerHTML = allRaces);
        ['head-work-location', 'spouse-work-location'].forEach(id => document.getElementById(id).innerHTML = allPlaces);

        updateChildrenUI();
        updateFamilyModalButtons();
        
        familyModal.showModal();
    }

    function handleWorkLocationChange(locationSelect, buildingSelect, jobSelect) {
        buildingSelect.innerHTML = '<option value="">-- Bâtiment --</option>';
        buildingSelect.disabled = true;
        handleWorkBuildingChange(locationSelect, buildingSelect, jobSelect); 
        const locationId = parseInt(locationSelect.value);
        if (!locationId) return;

        const location = currentRegion.places.find(p => p.id === locationId);
        if (location && location.config.buildings) {
            const buildingNames = Object.values(location.config.buildings).flat().map(b => b.name).sort();
            buildingSelect.innerHTML += buildingNames.map(bName => `<option value="${bName}">${bName}</option>`).join('');
            buildingSelect.disabled = false;
        }
    }

    function handleWorkBuildingChange(locationSelect, buildingSelect, jobSelect) {
        jobSelect.innerHTML = '<option value="">-- Poste --</option>';
        jobSelect.disabled = true;
        const locationId = parseInt(locationSelect.value);
        const buildingName = buildingSelect.value;
        if (!locationId || !buildingName) return;

        const location = currentRegion.places.find(p => p.id === locationId);
        if (!location) return;
        
        if (!location.demographics) {
            location.demographics = { population: [], families: [] };
        }

        const buildingData = getBuildingData(buildingName);
        if (!buildingData || !buildingData.emplois) return;
        
        const populationInLocation = location.demographics.population;

        const filledJobs = new Map();
        populationInLocation.forEach(p => {
            if (p.job && p.job.buildingName === buildingName) {
                const key = p.job.jobTitle;
                filledJobs.set(key, (filledJobs.get(key) || 0) + 1);
            }
        });
        
        buildingData.emplois.forEach(job => {
            const totalPosts = job.postes;
            const filledCount = filledJobs.get(job.titre) || 0;
            if (filledCount < totalPosts) {
                jobSelect.innerHTML += `<option value="${job.titre}">${job.titre} (${totalPosts - filledCount} dispo.)</option>`;
            }
        });
        jobSelect.disabled = jobSelect.options.length <= 1;
    }

    function updateChildrenUI() {
        const container = document.getElementById('children-list');
        if (currentCustomFamily.children.length === 0) {
            container.innerHTML = '<p>Aucun enfant ajouté.</p>';
            return;
        }
        container.innerHTML = currentCustomFamily.children.map((child, index) => {
            return `<div class="child-item">
                        <span>${child.firstName} (${child.race}, ${child.age} ans)</span>
                        <button type="button" class="btn btn-delete-child" data-index="${index}">&times;</button>
                    </div>`;
        }).join('');
    }

    function saveChild() {
        const firstName = document.getElementById('child-firstname').value.trim();
        const ageInput = document.getElementById('child-age').value;

        if (!firstName || ageInput === '') {
            alert("Le prénom et l'âge de l'enfant sont requis.");
            return;
        }
        const age = parseInt(ageInput, 10);

        const childData = {
            firstName: firstName,
            race: document.getElementById('child-race').value,
            age: age,
            gender: document.getElementById('child-gender').value
        };

        currentCustomFamily.children.push(childData);
        updateChildrenUI();

        document.getElementById('child-firstname').value = '';
        document.getElementById('child-age').value = '';
        document.getElementById('child-firstname').focus();
    }

    function updateFamilyModalButtons() {
        const familyName = document.getElementById('family-name').value.trim();
        const headFirstName = document.getElementById('head-firstname').value.trim();
        const headAge = document.getElementById('head-age').value;
        const canSubmit = familyName !== '' && headFirstName !== '' && headAge !== '';
        document.getElementById('confirm-add-family-btn').disabled = !canSubmit;
    }

    function addFamilyToPlace(e) {
        e.preventDefault();
        const familyName = familyNameInput.value.trim();
        if (selectedPlace.demographics.families.some(f => f.name.toLowerCase() === familyName.toLowerCase())) {
            alert(`Une famille nommée "${familyName}" existe déjà à ${selectedPlace.name}.`);
            return;
        }

        const hasSpouse = document.getElementById('add-spouse-toggle').checked;
        const headFirstName = document.getElementById('head-firstname').value.trim();
        const spouseFirstName = document.getElementById('spouse-firstname').value.trim();
        if(hasSpouse && !spouseFirstName){
            alert("Veuillez renseigner le prénom du conjoint.");
            return;
        }

        const editingTemplateId = document.getElementById('editing-family-template-id').value;
        const familyTemplate = {
            id: editingTemplateId ? editingTemplateId : `tpl_${Date.now()}`,
            name: familyName,
            head: {
                firstName: headFirstName,
                race: document.getElementById('head-race').value,
                age: parseInt(document.getElementById('head-age').value),
                gender: document.getElementById('head-gender').value,
            },
            spouse: null,
            children: [...currentCustomFamily.children]
        };

        const getJobFromForm = (prefix) => {
            const locationId = document.getElementById(`${prefix}-work-location`).value;
            const buildingName = document.getElementById(`${prefix}-work-building`).value;
            const jobTitle = document.getElementById(`${prefix}-work-job`).value;
            if (locationId && buildingName && jobTitle) {
                return { locationId: parseInt(locationId), buildingName, jobTitle };
            }
            return null;
        };
        
        const headJob = getJobFromForm('head');
        const spouseJob = hasSpouse ? getJobFromForm('spouse') : null;
        const headJobData = headJob ? getJobData(headJob.buildingName, headJob.jobTitle) : null;
        const spouseJobData = spouseJob ? getJobData(spouseJob.buildingName, spouseJob.jobTitle) : null;

        if ((headJobData && headJobData.tier === 0) && spouseJob) {
            alert("Si le chef de famille est un dirigeant (Tier 0), le conjoint ne peut pas avoir d'emploi assigné.");
            return;
        }
         if ((spouseJobData && spouseJobData.tier === 0) && headJob) {
            alert("Si le conjoint est un dirigeant (Tier 0), le chef de famille ne peut pas avoir d'emploi assigné.");
            return;
        }
        
        const familyId = `fam_custom_${Date.now()}`;
        const allMembers = [];
        const memberIds = [];

        const head = {
            id: `custom_${Date.now()}_${Math.random()}`,
            firstName: headFirstName,
            lastName: familyName,
            race: document.getElementById('head-race').value,
            age: parseInt(document.getElementById('head-age').value),
            gender: document.getElementById('head-gender').value,
            job: headJob,
            familyId: familyId, locationId: selectedPlace.id, isCustom: true, isAlive: true, parents: [], childrenIds: [], spouseId: null,
            desiredChildren: getWeightedDesiredChildren(), status: 'Actif',
            friendIds: [], acquaintanceIds: [], maxFriends: Math.floor(Math.random() * 5) + 1, maxAcquaintances: Math.floor(Math.random() * 12) + 7
        };
        allMembers.push(head);
        memberIds.push(head.id);

        let spouse = null;
        if (hasSpouse) {
            spouse = {
                id: `custom_${Date.now()}_${Math.random()}`,
                firstName: spouseFirstName,
                lastName: familyName,
                race: document.getElementById('spouse-race').value,
                age: parseInt(document.getElementById('spouse-age').value),
                gender: document.getElementById('spouse-gender').value,
                job: spouseJob,
                familyId: familyId, locationId: selectedPlace.id, isCustom: true, isAlive: true, parents: [], childrenIds: [], spouseId: null,
                desiredChildren: getWeightedDesiredChildren(), status: 'Actif',
                friendIds: [], acquaintanceIds: [], maxFriends: Math.floor(Math.random() * 5) + 1, maxAcquaintances: Math.floor(Math.random() * 12) + 7
            };
            head.spouseId = spouse.id;
            spouse.spouseId = head.id;
            allMembers.push(spouse);
            memberIds.push(spouse.id);
            
            familyTemplate.spouse = {
                firstName: spouse.firstName,
                race: spouse.race,
                age: spouse.age,
                gender: spouse.gender
            };
        }
        
        currentCustomFamily.children.forEach(childData => {
            const child = {
                id: `custom_${Date.now()}_${Math.random()}`,
                firstName: childData.firstName, lastName: familyName, race: childData.race, age: childData.age, gender: childData.gender,
                job: null, familyId: familyId, locationId: selectedPlace.id, isCustom: true, isAlive: true,
                parents: [head.id, spouse ? spouse.id : null].filter(Boolean),
                childrenIds: [], spouseId: null,
                desiredChildren: getWeightedDesiredChildren(), status: 'Actif',
                friendIds: [], acquaintanceIds: [], maxFriends: Math.floor(Math.random() * 5) + 1, maxAcquaintances: Math.floor(Math.random() * 12) + 7
            };
            allMembers.push(child);
            memberIds.push(child.id);
            head.childrenIds.push(child.id);
            if (spouse) spouse.childrenIds.push(child.id);
        });

        const newFamily = { id: familyId, name: familyName, locationId: selectedPlace.id, memberIds, isCustom: true };

        allMembers.forEach(member => {
             if (member.job) {
                 const jobData = getJobData(member.job.buildingName, member.job.jobTitle);
                 if(jobData){
                     const expData = applyInitialExperience(member, jobData);
                     Object.assign(member, { salary: calculateInitialSalary(jobData), stats: expData.stats, prestige: expData.prestige });
                 }
             } else {
                 Object.assign(member, { salary: 0, stats: { intelligence: 10, force: 10, constitution: 10, dexterite: 10, sagesse: 10, charisme: 10 }, prestige: 0 });
             }
        });

        selectedPlace.demographics.families.push(newFamily);
        selectedPlace.demographics.population.push(...allMembers);
        
        addOrUpdateFamilyTemplate(familyTemplate);

        document.getElementById('editing-family-template-id').value = '';

        familyModal.close();
        saveData();
        selectPlace(selectedPlace.id);
        updateDashboard();
        document.getElementById(`status-icon-${selectedPlace.id}`).textContent = '🟢';
        alert(`La famille ${familyName} a été ${editingTemplateId ? 'mise à jour et' : ''} ajoutée à ${selectedPlace.name} et sauvegardée dans votre bibliothèque de modèles.`);
    }

    function resetAllPopulation() { if (!selectedPlace) return; if (!confirm(`Êtes-vous sûr de vouloir supprimer TOUTE la population et toutes les familles de "${selectedPlace.name}" ? Cette action est irréversible.`)) { return; } selectedPlace.demographics.population = []; selectedPlace.demographics.families = []; document.getElementById(`status-icon-${selectedPlace.id}`).textContent = '🟡'; saveData(); updatePlaceStats(); updatePopulationUI(); updateDashboard(); }
    function resetGen0Population() { if (!selectedPlace) return; const customFamilies = selectedPlace.demographics.families.filter(f => f.isCustom); const customMemberIds = new Set(customFamilies.flatMap(f => f.memberIds)); const customPopulation = selectedPlace.demographics.population.filter(p => customMemberIds.has(p.id)); selectedPlace.demographics.families = customFamilies; selectedPlace.demographics.population = customPopulation; const isConfigured = selectedPlace.demographics.population.length > 0; document.getElementById(`status-icon-${selectedPlace.id}`).textContent = isConfigured ? '🟢' : '🟡'; saveData(); updatePlaceStats(); updatePopulationUI(); updateDashboard(); }
    
    function openCharacterModal(personId) {
        const allPopulation = currentRegion.places.flatMap(p => (p.demographics ? p.demographics.population : []));
        const person = allPopulation.find(p => p.id === personId);
        if (!person) return;
    
        document.getElementById('char-modal-title').textContent = `Détails de ${person.firstName}`;
        document.getElementById('char-modal-fullname').textContent = `${person.firstName} ${person.lastName}`;
        document.getElementById('char-modal-race').textContent = person.race;
        document.getElementById('char-modal-age').textContent = person.age;
        document.getElementById('char-modal-gender').textContent = person.gender;
        
        const monthlyGainsContainer = document.getElementById('char-modal-monthly-gains');
        monthlyGainsContainer.innerHTML = '';
        
        const rulingInfo = getRulingFamilyInfoForPerson(person, allPopulation);
        let jobText = 'N/A', workplaceText = 'N/A', salaryText = '0';
        let prestigeText = (person.prestige || 0).toFixed(2);
        
        if (person.job) {
            const jobData = getJobData(person.job.buildingName, person.job.jobTitle);
            const workPlace = currentRegion.places.find(p => p.id === person.job.locationId);
            jobText = person.job.jobTitle;
            workplaceText = `${person.job.buildingName} (${workPlace.name})`;
            salaryText = (person.salary || 0).toLocaleString();
            if (jobData && jobData.gainsMensuels) {
                monthlyGainsContainer.innerHTML += `<div class="char-detail-item"><strong>Prestige/mois :</strong> +${(jobData.gainsMensuels.prestige || 0).toFixed(2)}</div>`;
                if(jobData.gainsMensuels.stats){
                    const statGains = Object.entries(jobData.gainsMensuels.stats).map(([stat, val]) => `+${val.toFixed(2)} ${stat.slice(0,3)}.`);
                    monthlyGainsContainer.innerHTML += `<div class="char-detail-item" style="grid-column: span 2;"><strong>Stats/mois :</strong> ${statGains.join(', ')}</div>`;
                }
            }
        } else if (rulingInfo) {
            if (rulingInfo.isRulerSpouse) jobText = `${person.gender === 'Femme' ? 'Épouse' : 'Époux'} du ${rulingInfo.rulerJobTitle}`;
            else if (rulingInfo.isHeir) jobText = person.gender === 'Femme' ? 'Héritière' : 'Héritier';
            monthlyGainsContainer.innerHTML = '<p>Bénéficie des revenus de sa famille.</p>';
        } else {
             jobText = 'Sans emploi';
             monthlyGainsContainer.innerHTML = '<p>Pas de gains mensuels.</p>';
        }

        document.getElementById('char-modal-job').textContent = jobText;
        document.getElementById('char-modal-workplace').textContent = workplaceText;
        document.getElementById('char-modal-salary').textContent = salaryText;
        document.getElementById('char-modal-prestige').textContent = prestigeText;

        const statsList = document.getElementById('char-modal-stats');
        statsList.innerHTML = '';
        if (person.stats) {
            const statMap = { intelligence: 'Int', force: 'For', constitution: 'Con', dexterite: 'Dex', sagesse: 'Sag', charisme: 'Cha' };
            for (const [stat, value] of Object.entries(person.stats)) {
                const dndString = convertToDnD(value);
                const statShort = statMap[stat] || stat.slice(0,3);
                statsList.innerHTML += `<li><span><strong>${stat.charAt(0).toUpperCase() + stat.slice(1)}:</strong> ${Math.round(value)}</span><span class="dnd-stat"><strong>${statShort}:</strong> ${dndString}</span></li>`;
            }
        }
    
        const familyInfoContainer = document.getElementById('char-modal-family-info');
        familyInfoContainer.innerHTML = '<ul>' + ['parents', 'spouseId', 'childrenIds'].map(prop => {
            if (!person[prop] || person[prop].length === 0) return '';
            const ids = Array.isArray(person[prop]) ? person[prop] : [person[prop]];
            const relatives = ids.map(id => getPersonById(id, allPopulation)).filter(Boolean);
            if (relatives.length === 0) return '';
            const propMap = { parents: 'Parents', spouseId: 'Conjoint(e)', childrenIds: 'Enfant(s)'};
            return `<li><strong>${propMap[prop]} :</strong> ${relatives.map(p => `<span class="character-link" data-person-id="${p.id}">${p.firstName} ${p.lastName || ''}</span>`).join(' et ')}</li>`;
        }).join('') + '</ul>';
        if(familyInfoContainer.textContent === '') familyInfoContainer.innerHTML = '<ul><li>Aucun lien de parenté direct connu.</li></ul>';

        document.getElementById('char-modal-desired-children').textContent = person.desiredChildren ?? 'N/A';
        document.getElementById('char-modal-desired-friends').textContent = person.maxFriends ?? 'N/A';
        document.getElementById('char-modal-desired-acquaintances').textContent = person.maxAcquaintances ?? 'N/A';
        characterDetailsModal.showModal();
    }

    function updateDashboard() { let totalPop = 0, totalFam = 0; if(currentRegion) { currentRegion.places.forEach(p => { if (p.demographics) { totalPop += p.demographics.population.length; totalFam += p.demographics.families.length; } }); } globalTotalPopulation.textContent = totalPop; globalFamilyCount.textContent = totalFam; calculateAndDisplayDistanceMatrix(); }
    function calculateAndDisplayDistanceMatrix() { if (!currentRegion || !currentRegion.roads || currentRegion.places.length < 2) { distanceMatrixContainer.innerHTML = '<p>Pas assez de lieux ou de routes pour calculer une matrice.</p>'; return; } const places = currentRegion.places; const roadsData = currentRegion.roads; const travelModesToDisplay = { "Pied": "Pied", "Rapide": "Cheval", "Convoi": "Caravane" }; const headerRow = '<th>Lieu</th><th>Mode</th>' + places.map(p => `<th title="${p.name}">${p.name.substring(0, 5)}...</th>`).join(''); let tableHTML = `<table class="distance-matrix-table"><thead><tr>${headerRow}</tr></thead><tbody>`; places.forEach(p1 => { Object.entries(travelModesToDisplay).forEach(([displayName, modeKey], index) => { let rowHTML = '<tr>'; if (index === 0) rowHTML += `<td rowspan="3" style="vertical-align: middle; text-align: left; font-weight: bold;">${p1.name}</td>`; rowHTML += `<td style="text-align: left;">${displayName}</td>`; places.forEach(p2 => { if (p1.id === p2.id) { rowHTML += '<td style="background-color: #ccc;">-</td>'; } else { const roadKey = getRoadKey(p1.id, p2.id); const roadInfo = roadsData[roadKey]; let travelTime = Infinity; if (roadInfo && ROAD_TYPES[roadInfo.type].users.includes(modeKey)) { const distanceKm = axialDistance(p1.coords, p2.coords) * (currentRegion.scale || 10); const baseSpeed = TRAVEL_SPEEDS[modeKey]; const modifier = ROAD_MODIFIERS[roadInfo.type]; travelTime = distanceKm / (baseSpeed * modifier); } rowHTML += `<td>${formatTravelTime(travelTime)}</td>`; } }); rowHTML += '</tr>'; tableHTML += rowHTML; }); }); tableHTML += '</tbody></table>'; distanceMatrixContainer.innerHTML = tableHTML; }

    function init() {
        loadData();
        if (!currentRegion) {
            mainPanel.innerHTML = '<h1>Erreur</h1><p>Aucune région valide. Retournez à l\'étape 1 et créez une région et des lieux.</p>';
            const topBanner = document.getElementById('top-dashboard-banner');
            if (topBanner) topBanner.style.display = 'none';
            return;
        }
        displayPlacesList();
        updateDashboard();

        preGenerateBtn.addEventListener('click', generatePopulationForPlace);
        manageFamiliesBtn.addEventListener('click', openFamilyLibraryModal);
        resetAllBtn.addEventListener('click', resetAllPopulation);
        resetGen0Btn.addEventListener('click', resetGen0Population);
        
        interracialMarriageToggle.addEventListener('change', (e) => {
            if(selectedPlace) {
                selectedPlace.demographics.allowInterracialMarriage = e.target.checked;
                saveData();
            }
        });

        inheritanceLawSelect.addEventListener('change', (e) => {
            if (selectedPlace) {
                selectedPlace.demographics.inheritanceLaw = e.target.value;
                saveData();
            }
        });

        familyLibraryModal.querySelector('.modal-close-btn').addEventListener('click', () => familyLibraryModal.close());
        createNewTemplateBtn.addEventListener('click', () => { familyLibraryModal.close(); openFamilyModal(); });
        familyTemplatesList.addEventListener('click', handleLibraryActions);
        
        familyForm.addEventListener('submit', addFamilyToPlace);
        familyModal.querySelector('.modal-close-btn').addEventListener('click', () => familyModal.close());
        cancelFamilyBtn.addEventListener('click', () => familyModal.close());
        
        familyNameInput.addEventListener('input', updateFamilyModalButtons);
        document.getElementById('head-firstname').addEventListener('input', updateFamilyModalButtons);
        document.getElementById('head-age').addEventListener('input', updateFamilyModalButtons);

        document.getElementById('add-spouse-toggle').addEventListener('change', (e) => {
            document.getElementById('spouse-section').classList.toggle('hidden', !e.target.checked);
        });

        document.getElementById('add-child-btn').addEventListener('click', saveChild);
        document.getElementById('children-list').addEventListener('click', e => {
            if (e.target.classList.contains('btn-delete-child')) {
                const index = parseInt(e.target.dataset.index, 10);
                if (!isNaN(index)) {
                    currentCustomFamily.children.splice(index, 1);
                    updateChildrenUI();
                }
            }
        });

        const headLocation = document.getElementById('head-work-location');
        const headBuilding = document.getElementById('head-work-building');
        const headJob = document.getElementById('head-work-job');
        headLocation.addEventListener('change', () => handleWorkLocationChange(headLocation, headBuilding, headJob));
        headBuilding.addEventListener('change', () => handleWorkBuildingChange(headLocation, headBuilding, headJob));

        const spouseLocation = document.getElementById('spouse-work-location');
        const spouseBuilding = document.getElementById('spouse-work-building');
        const spouseJob = document.getElementById('spouse-work-job');
        spouseLocation.addEventListener('change', () => handleWorkLocationChange(spouseLocation, spouseBuilding, spouseJob));
        spouseBuilding.addEventListener('change', () => handleWorkBuildingChange(spouseLocation, spouseBuilding, spouseJob));

        document.body.addEventListener('click', e => {
            if (e.target.classList.contains('character-link')) {
                const personId = e.target.dataset.personId;
                const openModals = document.querySelectorAll('dialog[open]');
                openModals.forEach(modal => modal.close());
                setTimeout(() => openCharacterModal(personId), 50);
            }
        });
        characterDetailsModal.querySelector('.modal-close-btn').addEventListener('click', () => characterDetailsModal.close());
    }

    init();
});