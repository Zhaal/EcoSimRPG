/**
 * EcoSimRPG - step3.js
 * VERSION 6.1 - Correction d'un bug de tri
 * - CORRECTION : Correction d'une erreur "TypeError: Cannot read properties of undefined (reading 'localeCompare')" dans la fonction renderCategoryView.
 * - Le tri des listes de personnages (employés, sans-emplois, enfants) gère maintenant les cas où un `lastName` serait manquant, évitant ainsi un crash de l'interface.
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

    // Modale Bibliothèque Famille
    const familyLibraryModal = document.getElementById('family-library-modal');
    const createNewTemplateBtn = document.getElementById('create-new-template-btn');
    const familyTemplatesList = document.getElementById('family-templates-list');

    // Modale Création/Édition Famille
    const familyModal = document.getElementById('family-modal');
    const familyForm = document.getElementById('family-form');
    const editingFamilyTemplateIdInput = document.getElementById('editing-family-template-id');
    const familyNameInput = document.getElementById('family-name');
    const familyMembersList = document.getElementById('family-members-list');
    const addMemberBtn = document.getElementById('add-member-btn');
    const cancelFamilyBtn = document.getElementById('cancel-family-btn');
    const saveFamilyTemplateBtn = document.getElementById('save-family-template-btn');
    const confirmAddFamilyBtn = document.getElementById('confirm-add-family-btn');
    const memberFirstNameInput = document.getElementById('member-firstname');
    const memberRaceSelect = document.getElementById('member-race');
    const memberAgeInput = document.getElementById('member-age');
    const memberGenderSelect = document.getElementById('member-gender');
    const memberWorkLocationSelect = document.getElementById('member-work-location');
    const memberWorkBuildingSelect = document.getElementById('member-work-building');
    const memberWorkJobSelect = document.getElementById('member-work-job');
    
    // Sélecteurs pour la modale de détails
    const characterDetailsModal = document.getElementById('character-details-modal');


    // --- ÉTAT DE L'APPLICATION ---
    let regions = [];
    let currentRegion = null;
    let selectedPlace = null;
    let tempMembers = []; 
    let editingMemberIndex = -1; // Pour suivre le membre en cours d'édition

    // --- FONCTIONS UTILITAIRES ---
    function getFamilyTemplates() {
        const data = localStorage.getItem(FAMILY_TEMPLATE_STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    }

    function saveFamilyTemplates(templates) {
        localStorage.setItem(FAMILY_TEMPLATE_STORAGE_KEY, JSON.stringify(templates));
    }

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
    
    function deleteFamilyTemplate(templateId) {
        let templates = getFamilyTemplates();
        templates = templates.filter(t => t.id !== templateId);
        saveFamilyTemplates(templates);
    }

    function convertToDnD(rawValue) {
        const RAW_MIN = 10;
        const RAW_MAX = 700;
        const DND_MIN = 8;
        const DND_MAX = 18;
        const DND_ABSOLUTE_MIN = 3; 

        let dndScore;
        if (rawValue >= RAW_MAX) {
            dndScore = DND_MAX;
        } else if (rawValue <= RAW_MIN) {
            const ratio = rawValue / RAW_MIN;
            dndScore = Math.round(DND_ABSOLUTE_MIN + ratio * (DND_MIN - DND_ABSOLUTE_MIN));
        } else {
            const rawRange = RAW_MAX - RAW_MIN;
            const dndRange = DND_MAX - DND_MIN;
            const scaledValue = (rawValue - RAW_MIN) / rawRange;
            dndScore = Math.round(DND_MIN + (scaledValue * dndRange));
        }
        
        dndScore = Math.max(1, dndScore); 

        const modifier = Math.floor((dndScore - 10) / 2);
        const sign = modifier >= 0 ? '+' : '';
        return `${dndScore} (${sign}${modifier})`;
    }

    function getBuildingData(buildingName) {
        if (!buildingName) return null;
        for (const type in BUILDING_DATA) {
            for (const category in BUILDING_DATA[type]) {
                if (BUILDING_DATA[type][category][buildingName]) {
                    return { ...BUILDING_DATA[type][category][buildingName], category, originalType: type };
                }
            }
        }
        return null;
    }
    
    function getJobData(buildingName, jobTitle) {
        const building = getBuildingData(buildingName);
        if (!building || !building.emplois) return null;
        return building.emplois.find(j => j.titre === jobTitle) || null;
    }

    function axialDistance(a, b) {
        if (!a || !b) return Infinity;
        const dq = a.q - b.q; const dr = a.r - b.r;
        return (Math.abs(dq) + Math.abs(dr) + Math.abs(-dq - dr)) / 2;
    }

    function getRoadKey(id1, id2) {
        return [id1, id2].sort((a, b) => a - b).join('-');
    }
    
    function formatTravelTime(timeInDays) {
        if (isNaN(timeInDays) || timeInDays < 0 || timeInDays === Infinity) return "N/A";
        const days = Math.floor(timeInDays);
        const hours = Math.floor((timeInDays - days) * 24);
        let parts = [];
        if (days > 0) parts.push(`${days}j`);
        if (hours > 0) parts.push(`${hours}h`);
        return parts.length > 0 ? parts.join(' ') : "< 1h";
    }
    
    // --- LOGIQUE DE L'INTERFACE PRINCIPALE ---
    function loadData() {
        const data = localStorage.getItem(STORAGE_KEY);
        regions = data ? JSON.parse(data) : [];
        const lastRegionId = localStorage.getItem(LAST_REGION_KEY);
        if (lastRegionId) {
            currentRegion = regions.find(r => r.id == lastRegionId) || null;
        }
    }

    function saveData() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(regions));
    }
    
    function displayPlacesList() {
        placesListContainer.innerHTML = '';
        if (!currentRegion) return;

        currentRegion.places.forEach(place => {
            const li = document.createElement('li');
            li.className = 'place-item-step3';
            li.dataset.placeId = place.id;
            const isConfigured = place.demographics && place.demographics.population && place.demographics.population.length > 0;
            li.innerHTML = `
                <span>${place.name} (${place.type})</span>
                <span class="status-icon" id="status-icon-${place.id}">${isConfigured ? '🟢' : '🟡'}</span>
            `;
            li.addEventListener('click', () => selectPlace(place.id));
            placesListContainer.appendChild(li);
        });
    }

    function selectPlace(placeId) {
        selectedPlace = currentRegion.places.find(p => p.id === placeId);
        if (!selectedPlace) return;
        
        if (!selectedPlace.demographics) {
            selectedPlace.demographics = { raceDistribution: {}, raceDistributionTotal: 0, allowInterracialMarriage: true, population: [], families: [] };
        }
        
        document.querySelectorAll('.place-item-step3.active').forEach(el => el.classList.remove('active'));
        document.querySelector(`.place-item-step3[data-place-id='${placeId}']`).classList.add('active');

        welcomePanel.classList.add('hidden');
        configPanel.classList.remove('hidden');
        configPanelTitle.textContent = `Configuration de ${selectedPlace.name}`;
        
        renderRaceDistribution();
        updatePlaceStats();
        updatePopulationUI();
    }
    
    function renderRaceDistribution() {
        raceDistributionContainer.innerHTML = '';
        let total = 0;
        
        Object.keys(RACES_DATA.races).forEach(raceName => {
            const value = selectedPlace.demographics.raceDistribution[raceName] || 0;
            total += value;
            
            const div = document.createElement('div');
            div.className = 'race-slider-group';
            div.innerHTML = `
                <label for="slider-${raceName}">${raceName}</label>
                <input type="range" id="slider-${raceName}" min="0" max="100" value="${value}" data-race="${raceName}">
                <span id="value-${raceName}">${value}%</span>`;
            raceDistributionContainer.appendChild(div);
            div.querySelector('input[type="range"]').addEventListener('input', handleSliderChange);
        });

        selectedPlace.demographics.raceDistributionTotal = total;
        updateTotalPercentage();
        interracialMarriageToggle.checked = selectedPlace.demographics.allowInterracialMarriage;
    }
    
    function handleSliderChange(e) {
        document.getElementById(`value-${e.target.dataset.race}`).textContent = `${e.target.value}%`;
        selectedPlace.demographics.raceDistribution[e.target.dataset.race] = parseInt(e.target.value, 10);
        updateTotalPercentage();
    }
    
    function updateTotalPercentage() {
        let total = Object.values(selectedPlace.demographics.raceDistribution).reduce((sum, val) => sum + val, 0);
        selectedPlace.demographics.raceDistributionTotal = total;
        raceTotalPercentage.textContent = `${total} / 100 %`;
        
        preGenerateBtn.disabled = total !== 100;
        raceTotalPercentage.style.color = total === 100 ? 'var(--color-forest-green)' : 'var(--color-error)';
    }

    function updatePlaceStats() {
        if (!selectedPlace) return;
        const totalJobs = countTotalJobsForPlace(selectedPlace);
        const filledJobs = selectedPlace.demographics.population.filter(p => p.job).length;
        statTotalPopulation.textContent = selectedPlace.demographics.population.length;
        statFamilyCount.textContent = selectedPlace.demographics.families.length;
        statTotalJobs.textContent = totalJobs;
        statFilledJobs.textContent = filledJobs;
    }

    function renderFamilyView(container, families, population) {
        const familyGroups = document.createElement('div');
        families.forEach(family => {
            const familyDiv = document.createElement('div');
            familyDiv.className = 'family-summary-list';
    
            const members = family.memberIds.map(id => population.find(p => p.id === id)).filter(p => p);
            
            const memberDetails = members.sort((a, b) => b.age - a.age).map(p => {
                if (!p) return '<li>Membre manquant</li>';
                const jobInfo = p.job && p.job.jobTitle ? p.job.jobTitle : (p.age >= (RACES_DATA.races[p.race]?.ageAdulte || 18) ? 'Sans emploi' : 'Enfant');
                return `<li>
                          <span class="character-link" data-person-id="${p.id}">${p.firstName} ${p.lastName}</span>
                          <span class="family-member-job">(${p.age} ans, ${jobInfo})</span>
                        </li>`;
            }).join('');
    
            familyDiv.innerHTML = `
                <h4>Famille ${family.name} (${members.length} membres)</h4>
                <ul>${memberDetails}</ul>
            `;
            familyGroups.appendChild(familyDiv);
        });
        container.appendChild(familyGroups);
    }

    function renderCategoryView(container, place) {
        const population = place.demographics.population;
        const buildingDefinitions = BUILDING_DATA[place.type] || {};
        
        const peopleByBuilding = population.reduce((acc, p) => {
            if (p.job && p.job.buildingName) {
                if (!acc[p.job.buildingName]) acc[p.job.buildingName] = [];
                acc[p.job.buildingName].push(p);
            }
            return acc;
        }, {});

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
                        // BUG FIX: Added fallback for missing lastName to prevent crash
                        const workersInJob = workersInBuilding.filter(p => p.job.jobTitle === job.titre).sort((a, b) => (a.lastName || '').localeCompare(b.lastName || ''));
                        if(workersInJob.length > 0) {
                            buildingHTML += `<div class="job-listing">
                                <strong>${job.titre}</strong> (${workersInJob.length}/${job.postes})
                                <ul class="employee-list">
                                    ${workersInJob.map(p => `<li><span class="character-link" data-person-id="${p.id}">${p.firstName} ${p.lastName}</span> (${p.age} ans)</li>`).join('')}
                                </ul>
                            </div>`;
                        }
                    });
                    buildingHTML += `</div>`;
                    categoryHTML += buildingHTML;
                }
            });
            categoryDiv.innerHTML = categoryHTML;
            if (hasContent) container.appendChild(categoryDiv);
        });

        // BUG FIX: Added fallback for missing lastName to prevent crash
        const unemployed = population.filter(p => !p.job && p.age >= (RACES_DATA.races[p.race]?.ageAdulte || 18)).sort((a, b) => (a.lastName || '').localeCompare(b.lastName || ''));
        const children = population.filter(p => !p.job && p.age < (RACES_DATA.races[p.race]?.ageAdulte || 18)).sort((a, b) => (a.lastName || '').localeCompare(b.lastName || ''));

        if(unemployed.length > 0) {
             const unemployedDiv = document.createElement('div');
             unemployedDiv.className = 'building-category-group';
             unemployedDiv.innerHTML = `<h3>Sans Emploi</h3><ul class="unemployed-list">${unemployed.map(p => `<li><span class="character-link" data-person-id="${p.id}">${p.firstName} ${p.lastName}</span> (${p.age} ans)</li>`).join('')}</ul>`;
             container.appendChild(unemployedDiv);
        }
        if(children.length > 0) {
            const childrenDiv = document.createElement('div');
            childrenDiv.className = 'building-category-group';
            childrenDiv.innerHTML = `<h3>Enfants</h3><ul class="unemployed-list">${children.map(p => `<li><span class="character-link" data-person-id="${p.id}">${p.firstName} ${p.lastName}</span> (${p.age} ans)</li>`).join('')}</ul>`;
            container.appendChild(childrenDiv);
       }
    }

    function updatePopulationUI() {
        familyListContainer.innerHTML = '';
        if (!selectedPlace || selectedPlace.demographics.population.length === 0) {
            familyListContainer.innerHTML = '<p>Aucune population n\'a encore été générée pour ce lieu.</p>';
            return;
        }

        const tabsNav = document.createElement('div');
        tabsNav.className = 'tabs-nav';
        tabsNav.innerHTML = `
            <button class="tab-link active" data-tab="category-view">Par Catégorie de Bâtiment</button>
            <button class="tab-link" data-tab="family-view">Par Famille</button>
        `;

        const tabsContent = document.createElement('div');
        tabsContent.className = 'tabs-content-wrapper';
        
        const categoryView = document.createElement('div');
        categoryView.id = 'category-view';
        categoryView.className = 'tab-content active';
        renderCategoryView(categoryView, selectedPlace);
        
        const familyView = document.createElement('div');
        familyView.id = 'family-view';
        familyView.className = 'tab-content';
        renderFamilyView(familyView, selectedPlace.demographics.families, selectedPlace.demographics.population);
        
        tabsContent.appendChild(categoryView);
        tabsContent.appendChild(familyView);
        
        familyListContainer.appendChild(tabsNav);
        familyListContainer.appendChild(tabsContent);

        tabsNav.addEventListener('click', (e) => {
            if (e.target.matches('.tab-link')) {
                const tabId = e.target.dataset.tab;
                tabsNav.querySelectorAll('.tab-link').forEach(tab => tab.classList.remove('active'));
                tabsContent.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
                e.target.classList.add('active');
                document.getElementById(tabId).classList.add('active');
            }
        });
    }
    
    
    // --- LOGIQUE DE GÉNÉRATION DE POPULATION ---
    
    function getAvailableJobs(place, ignoreCustomFamilies = false) {
        let allJobSlots = [];
        if (place.config && place.config.buildings) {
            Object.values(place.config.buildings).flat().forEach(building => {
                const buildingData = getBuildingData(building.name);
                if (buildingData && buildingData.emplois) {
                    buildingData.emplois.forEach(job => {
                        for (let i = 0; i < job.postes; i++) {
                            allJobSlots.push({ 
                                locationId: place.id,
                                buildingName: building.name, 
                                jobTitle: job.titre 
                            });
                        }
                    });
                }
            });
        }
        if (ignoreCustomFamilies) return allJobSlots;

        const filledJobCounts = new Map();
        place.demographics.population.forEach(p => {
            if (p.job) {
                const key = `${p.job.locationId}-${p.job.buildingName}-${p.job.jobTitle}`;
                filledJobCounts.set(key, (filledJobCounts.get(key) || 0) + 1);
            }
        });

        const availableJobs = [];
        const tempJobCounts = new Map();
        for (const job of allJobSlots) {
            const key = `${job.locationId}-${job.buildingName}-${job.jobTitle}`;
            const filledCount = filledJobCounts.get(key) || 0;
            const tempCount = tempJobCounts.get(key) || 0;
            const jobData = getJobData(job.buildingName, job.jobTitle);
            if (!jobData) continue;
            if (tempCount < (jobData.postes - filledCount)) {
                availableJobs.push(job);
                tempJobCounts.set(key, tempCount + 1);
            }
        }
        return availableJobs;
    }
    
    function countTotalJobsForPlace(place) {
        return getAvailableJobs(place, true).length;
    }

    function findBestPartner(person, potentialPartners, allowInterracial, compatibleRaces) {
        let bestPartnerIndex = -1;
        let highestScore = -1;

        const personJobData = getJobData(person.job.buildingName, person.job.jobTitle);
        if (!personJobData) return -1;
        const personJobTier = personJobData.tier;

        for (let i = 0; i < potentialPartners.length; i++) {
            const partner = potentialPartners[i];
            
            // MODIFICATION: Ajout du critère de différence d'âge
            if (Math.abs(person.age - partner.age) > 5) {
                continue;
            }

            let currentScore = 0;

            const isRaceCompatible = (partner.race === person.race) || (allowInterracial && compatibleRaces.includes(partner.race));
            if (!isRaceCompatible) continue;
            currentScore += 100;

            const partnerJobData = getJobData(partner.job.buildingName, partner.job.jobTitle);
            if (partnerJobData) {
                const partnerJobTier = partnerJobData.tier;
                if (partner.job.jobTitle === person.job.jobTitle) currentScore += 20;
                else if (partnerJobTier === personJobTier) currentScore += 10;
                else if (Math.abs(partnerJobTier - personJobTier) === 1) currentScore += 5;
            }

            if (currentScore > highestScore) {
                highestScore = currentScore;
                bestPartnerIndex = i;
            }
        }
        return bestPartnerIndex;
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
        let individualsToCreate = [];
        let allNewPopulation = [];

        // --- Étape 1: Créer la liste des "proto-personnes" (race et sexe) ---
        Object.entries(selectedPlace.demographics.raceDistribution).forEach(([raceName, percentage]) => {
            const count = Math.round(availableJobs.length * (percentage / 100));
            for (let i = 0; i < count; i++) {
                individualsToCreate.push({ race: raceName, gender: i % 2 === 0 ? 'Homme' : 'Femme' });
            }
        });
        
        individualsToCreate.sort(() => Math.random() - 0.5); // Mélanger pour la distribution
        if (individualsToCreate.length > availableJobs.length) {
            individualsToCreate.length = availableJobs.length;
        }

        // --- Étape 2: Créer les objets Personne complets, SANS emploi pour l'instant ---
        let unassignedIndividuals = individualsToCreate.map(protoPerson => {
            return {
                id: `auto_${Date.now()}_${Math.random()}`,
                race: protoPerson.race,
                gender: protoPerson.gender,
                // MODIFICATION: Tranche d'âge étendue à 18-40 ans
                age: 18 + Math.floor(Math.random() * 23), 
                job: null, // Sera assigné après le tri
                spouseId: null,
                familyId: null,
                isCustom: false,
                parents: [],
                childrenIds: [],
                desiredChildren: Math.floor(Math.random() * 7),
                desiredFriends: Math.floor(Math.random() * 4) + 1,
                desiredAcquaintances: Math.floor(Math.random() * 12) + 5
            };
        });

        // --- Étape 3: Trier les personnes par âge (décroissant) et les emplois par importance (tier croissant) ---
        unassignedIndividuals.sort((a, b) => b.age - a.age);
        availableJobs.sort((a, b) => {
            const jobA_data = getJobData(a.buildingName, a.jobTitle);
            const jobB_data = getJobData(b.buildingName, b.jobTitle);
            if (!jobA_data) return 1;
            if (!jobB_data) return -1;
            return jobA_data.tier - jobB_data.tier;
        });

        // --- Étape 4: Assigner les meilleurs emplois aux personnes les plus âgées ---
        unassignedIndividuals.forEach((person, index) => {
            if (index < availableJobs.length) {
                const job = availableJobs[index];
                person.job = { locationId: job.locationId, buildingName: job.buildingName, jobTitle: job.jobTitle };
                
                const jobData = getJobData(job.buildingName, job.jobTitle);
                if(jobData) {
                    const salary = calculateInitialSalary(jobData);
                    const experienceData = applyInitialExperience(person, jobData);
                    Object.assign(person, {
                        salary: salary,
                        stats: experienceData.stats,
                        prestige: experienceData.prestige
                    });
                }
            }
        });


        // --- Étape 5: Formation des familles (logique existante) ---
        const usedFamilyNames = new Set(selectedPlace.demographics.families.map(f => f.name));
        let men = unassignedIndividuals.filter(p => p.gender === 'Homme');
        let women = unassignedIndividuals.filter(p => p.gender === 'Femme');
        const allowInterracial = selectedPlace.demographics.allowInterracialMarriage;

        while(men.length > 0 && women.length > 0) {
            const man = men.pop();
            const compatibleRaces = allowInterracial ? RACES_DATA.compatibilites[man.race] || [] : [];
            const womanIndex = findBestPartner(man, women, allowInterracial, compatibleRaces);
            
            if (womanIndex > -1) {
                const woman = women.splice(womanIndex, 1)[0];
                let familyName;
                do { familyName = RACES_DATA.races[man.race].noms[Math.floor(Math.random() * RACES_DATA.races[man.race].noms.length)]; } while (usedFamilyNames.has(familyName));
                usedFamilyNames.add(familyName);

                man.lastName = familyName; woman.lastName = familyName;
                man.spouseId = woman.id; woman.spouseId = man.id;
                
                const family = { id: `fam_auto_${Date.now()}_${Math.random()}`, name: familyName, locationId: selectedPlace.id, memberIds: [man.id, woman.id], isCustom: false };
                man.familyId = family.id; woman.familyId = family.id;
                allNewPopulation.push(man, woman);

                // --- Logique de création d'enfants (existante) ---
                const mother = woman;
                const raceData = RACES_DATA.races[mother.race];
                const gestationInYears = (raceData.dureeGestationMois || 9) / 12;
                const childSpacingInYears = gestationInYears + 1;
                const youngestParent = man.age < woman.age ? man : woman;
                const youngestParentRaceData = RACES_DATA.races[youngestParent.race];
                const adultAge = youngestParentRaceData.ageAdulte || 18;
                let maxPossibleAgeForNextChild = youngestParent.age - adultAge;
                const desiredChildCount = Math.min(man.desiredChildren, woman.desiredChildren);

                for (let i = 0; i < desiredChildCount; i++) {
                    if (maxPossibleAgeForNextChild <= 0) break;
                    const newChildAge = Math.random() * maxPossibleAgeForNextChild;
                    const finalChildAge = Math.max(1, newChildAge);
                    const child = createChild(man, woman, family, finalChildAge);
                    
                    if (child) {
                        family.memberIds.push(child.id);
                        man.childrenIds.push(child.id);
                        woman.childrenIds.push(child.id);
                        allNewPopulation.push(child);
                        maxPossibleAgeForNextChild = finalChildAge - childSpacingInYears;
                    } else {
                        break;
                    }
                }
                selectedPlace.demographics.families.push(family);

            } else {
                 allNewPopulation.push(man);
            }
        }
        
        // --- Célibataires restants ---
        [...men, ...women].forEach(person => {
             let familyName;
             do { familyName = RACES_DATA.races[person.race].noms[Math.floor(Math.random() * RACES_DATA.races[person.race].noms.length)]; } while (usedFamilyNames.has(familyName));
             usedFamilyNames.add(familyName);
             person.lastName = familyName;
             const family = { id: `fam_auto_${Date.now()}_${Math.random()}`, name: familyName, locationId: selectedPlace.id, memberIds: [person.id], isCustom: false };
             selectedPlace.demographics.families.push(family);
             person.familyId = family.id;
             allNewPopulation.push(person);
        });

        // --- Finalisation ---
        allNewPopulation.forEach(p => {
            if (!p.firstName) {
                const names = p.gender === 'Homme' ? RACES_DATA.races[p.race].prenomsM : RACES_DATA.races[p.race].prenomsF;
                p.firstName = names[Math.floor(Math.random() * names.length)];
            }
            selectedPlace.demographics.population.push(p);
        });

        saveData();
        updatePlaceStats();
        updatePopulationUI();
        updateDashboard();
        document.getElementById(`status-icon-${selectedPlace.id}`).textContent = '🟢';
    }


    function createChild(parent1, parent2, family, childAge) {
        // Si l'âge calculé n'est pas viable, on ne crée pas l'enfant.
        if (!childAge || childAge <= 0) {
            return null;
        }
    
        const childGender = Math.random() > 0.5 ? 'Homme' : 'Femme';
        
        // Déterminer la race de l'enfant
        let childRace;
        const mixedRaceKey = [parent1.race, parent2.race].sort().join('-');
        if (RACES_DATA.racesMixtes[mixedRaceKey]) {
            childRace = RACES_DATA.racesMixtes[mixedRaceKey];
        } else {
            childRace = Math.random() > 0.5 ? parent1.race : parent2.race;
        }
    
        return {
            id: `auto_child_${Date.now()}_${Math.random()}`,
            race: childRace,
            gender: childGender,
            age: Math.floor(childAge), // S'assurer que l'âge est un entier
            lastName: family.name,
            job: null,
            salary: 0,
            prestige: 0,
            stats: { intelligence: 5, force: 5, constitution: 5, dexterite: 5, sagesse: 5, charisme: 5 },
            spouseId: null,
            familyId: family.id,
            parents: [parent1.id, parent2.id],
            childrenIds: [],
            isCustom: false,
            desiredChildren: null, 
            desiredFriends: null,
            desiredAcquaintances: null
        };
    }
    
    function calculateInitialSalary(jobData) {
        return Math.round(jobData.salaire.totalEnCuivre * (1 + (Math.random() * 0.3 - 0.15)));
    }

    function applyInitialExperience(person, jobData) {
        const raceData = RACES_DATA.races[person.race];
        if (!raceData || !jobData) {
            return {
                stats: { intelligence: 10, force: 10, constitution: 10, dexterite: 10, sagesse: 10, charisme: 10 },
                prestige: 0
            };
        }

        const adultAge = raceData.ageAdulte;
        const experienceInYears = Math.max(0, person.age - adultAge);
        const experienceInMonths = experienceInYears * 12;

        let calculatedPrestige = jobData.prerequis.prestige || 0;
        let calculatedStats = { intelligence: 10, force: 10, constitution: 10, dexterite: 10, sagesse: 10, charisme: 10 };

        const monthlyGains = jobData.gainsMensuels;
        if (monthlyGains) {
            if (monthlyGains.prestige) {
                const totalBasePrestigeGain = monthlyGains.prestige * experienceInMonths;
                const randomFactor = 1 + (Math.random() * 0.8 - 0.2);
                calculatedPrestige += totalBasePrestigeGain * randomFactor;
            }
            if (monthlyGains.stats) {
                Object.keys(calculatedStats).forEach(statKey => {
                    if (monthlyGains.stats[statKey] !== undefined) {
                        const monthlyAdditiveGain = monthlyGains.stats[statKey];
                        const totalBaseStatGain = monthlyAdditiveGain * experienceInMonths;
                        const randomFactor = 1 + (Math.random() * 0.8 - 0.4);
                        calculatedStats[statKey] += totalBaseStatGain * randomFactor;
                    }
                });
            }
        }
        
        Object.keys(calculatedStats).forEach(statKey => {
            calculatedStats[statKey] = Math.max(1, Math.round(calculatedStats[statKey]));
        });
        
        calculatedPrestige = Math.max(0, calculatedPrestige);

        return { prestige: calculatedPrestige, stats: calculatedStats };
    }


    // --- NOUVELLE LOGIQUE : BIBLIOTHÈQUE DE FAMILLES ---

    function openFamilyLibraryModal() {
        familyTemplatesList.innerHTML = ''; 
        const templates = getFamilyTemplates();

        if (templates.length === 0) {
            familyTemplatesList.innerHTML = '<p style="padding: 15px; text-align: center;">Aucun modèle de famille sauvegardé.</p>';
        } else {
            templates.forEach(template => {
                const div = document.createElement('div');
                div.className = 'family-template-item';
                div.innerHTML = `
                    <span>${template.name}</span>
                    <div>
                        <button class="btn btn-edit" data-template-id="${template.id}">Charger & Éditer</button>
                        <button class="btn btn-danger" data-template-id="${template.id}">Supprimer</button>
                    </div>
                `;
                familyTemplatesList.appendChild(div); 
            });
        }
        familyLibraryModal.showModal();
    }
    
    function handleLibraryActions(e) {
        const templateId = e.target.dataset.templateId;
        if (!templateId) return;

        if (e.target.classList.contains('btn-edit')) {
            loadTemplateForEditing(templateId);
        } else if (e.target.classList.contains('btn-danger')) {
            if (confirm("Êtes-vous sûr de vouloir supprimer ce modèle de famille de votre bibliothèque ?")) {
                deleteFamilyTemplate(templateId);
                openFamilyLibraryModal(); // Refresh the list
            }
        }
    }
    
    function loadTemplateForEditing(templateId) {
        const template = getFamilyTemplates().find(t => t.id === templateId);
        if (!template) {
            alert("Modèle non trouvé.");
            return;
        }

        familyLibraryModal.close();
        openFamilyModal(template);
    }
    
    function openFamilyModal(templateData = null) {
        if (!selectedPlace) {
            alert("Veuillez d'abord sélectionner un lieu.");
            return;
        }
        familyForm.reset();
        tempMembers = [];
        editingMemberIndex = -1; // Réinitialiser l'index d'édition
        editingFamilyTemplateIdInput.value = '';

        if (templateData) {
            // Mode édition/chargement
            familyNameInput.value = templateData.name;
            editingFamilyTemplateIdInput.value = templateData.id;
            
            tempMembers = templateData.members.map(member => {
                const newMember = { ...member };
                if (newMember.job) {
                    const jobLocation = currentRegion.places.find(p => p.id === newMember.job.locationId);
                    const jobData = getJobData(newMember.job.buildingName, newMember.job.jobTitle);
                    const availableJobs = getAvailableJobs(jobLocation);
                    const isJobAvailable = availableJobs.some(j => 
                        j.buildingName === newMember.job.buildingName && 
                        j.jobTitle === newMember.job.jobTitle
                    );

                    if (!jobLocation || !jobData || !isJobAvailable) {
                        newMember.jobInvalid = true;
                        newMember.job = null;
                    }
                }
                return newMember;
            });

        } else {
            // Mode création
            familyNameInput.value = '';
        }
        
        updateTempMembersUI();
        updateFamilyModalButtons();
        document.getElementById('add-member-btn').textContent = "Ajouter ce membre";

        memberRaceSelect.innerHTML = Object.keys(RACES_DATA.races).map(race => `<option value="${race}">${race}</option>`).join('');
        memberWorkLocationSelect.innerHTML = '<option value="">-- Lieu --</option>' + currentRegion.places.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
        handleWorkLocationChange();
        
        familyModal.showModal();
    }
    
    function handleWorkLocationChange() {
        memberWorkBuildingSelect.innerHTML = '<option value="">-- Bâtiment --</option>';
        memberWorkBuildingSelect.disabled = true;
        handleWorkBuildingChange();
        const locationId = parseInt(memberWorkLocationSelect.value);
        if (!locationId) return;
        const location = currentRegion.places.find(p => p.id === locationId);
        if (location && location.config.buildings) {
            const buildingNames = Object.values(location.config.buildings).flat().map(b => b.name).sort();
            memberWorkBuildingSelect.innerHTML += buildingNames.map(bName => `<option value="${bName}">${bName}</option>`).join('');
            memberWorkBuildingSelect.disabled = false;
        }
    }

    function handleWorkBuildingChange() {
        memberWorkJobSelect.innerHTML = '<option value="">-- Poste --</option>';
        memberWorkJobSelect.disabled = true;
        const locationId = parseInt(memberWorkLocationSelect.value);
        const buildingName = memberWorkBuildingSelect.value;
        if (!locationId || !buildingName) return;

        const location = currentRegion.places.find(p => p.id === locationId);
        const buildingData = getBuildingData(buildingName);

        if (location && !location.demographics) {
            location.demographics = { raceDistribution: {}, raceDistributionTotal: 0, allowInterracialMarriage: true, population: [], families: [] };
        }
        
        if (!location || !buildingData || !buildingData.emplois) return;

        const filledJobs = new Map();
        location.demographics.population.forEach(p => {
            if (p.job && p.job.buildingName === buildingName) {
                const key = p.job.jobTitle;
                filledJobs.set(key, (filledJobs.get(key) || 0) + 1);
            }
        });
        tempMembers.forEach(m => {
            if (m.job && m.job.buildingName === buildingName) {
                const key = m.job.jobTitle;
                filledJobs.set(key, (filledJobs.get(key) || 0) + 1);
            }
        });

        buildingData.emplois.forEach(job => {
            const totalPosts = job.postes;
            const filledCount = filledJobs.get(job.titre) || 0;
            if (filledCount < totalPosts) {
                 memberWorkJobSelect.innerHTML += `<option value="${job.titre}">${job.titre} (${totalPosts - filledCount} dispo.)</option>`;
            }
        });
        memberWorkJobSelect.disabled = memberWorkJobSelect.options.length <= 1;
    }

    function saveTempMember() {
        if (!memberFirstNameInput.value || !memberAgeInput.value) { alert("Le prénom et l'âge sont requis."); return; }
        
        const job = memberWorkLocationSelect.value && memberWorkBuildingSelect.value && memberWorkJobSelect.value
            ? { locationId: parseInt(memberWorkLocationSelect.value), buildingName: memberWorkBuildingSelect.value, jobTitle: memberWorkJobSelect.value }
            : null;
        
        const memberData = {
            id: `member_${Date.now()}_${Math.random()}`, firstName: memberFirstNameInput.value,
            lastName: familyNameInput.value, race: memberRaceSelect.value,
            age: parseInt(memberAgeInput.value), gender: memberGenderSelect.value,
            isCustom: true, job,
            parents: [], childrenIds: [], spouseId: null,
        };
        if(job) Object.assign(memberData, { salary: 0, stats: {}, prestige: 0 });
        
        if (editingMemberIndex > -1) {
            const originalId = tempMembers[editingMemberIndex].id;
            tempMembers[editingMemberIndex] = {...memberData, id: originalId};
            editingMemberIndex = -1;
            document.getElementById('add-member-btn').textContent = "Ajouter ce membre";
        } else {
            tempMembers.push(memberData);
        }

        updateTempMembersUI();
        
        memberFirstNameInput.value = ''; memberAgeInput.value = '';
        memberWorkLocationSelect.value = ''; handleWorkLocationChange();
        memberFirstNameInput.focus();
    }

    function updateTempMembersUI() {
        familyMembersList.innerHTML = tempMembers.length === 0 ? '<p>Aucun membre ajouté.</p>' :
            tempMembers.map((member, index) => {
                const jobInfo = member.job ? ` - ${member.job.jobTitle}` : ' - Sans emploi';
                let invalidJobWarning = '';
                if (member.jobInvalid) {
                    invalidJobWarning = '<span class="invalid-job-warning">(Emploi précédent invalide !)</span>';
                }
                const isEditingClass = index === editingMemberIndex ? 'editing' : '';
                return `<div class="temp-member-item ${isEditingClass}">
                          <span class="member-info" data-index="${index}">${member.firstName} (${member.race}, ${member.age} ans)${jobInfo}${invalidJobWarning}</span>
                          <button type="button" class="btn-delete-temp" data-index="${index}">X</button>
                        </div>`;
            }).join('');
        updateFamilyModalButtons();
    }

    function populateMemberForm(index) {
        editingMemberIndex = index;
        const member = tempMembers[index];

        memberFirstNameInput.value = member.firstName;
        memberRaceSelect.value = member.race;
        memberAgeInput.value = member.age;
        memberGenderSelect.value = member.gender;

        if (member.job) {
            memberWorkLocationSelect.value = member.job.locationId;
            handleWorkLocationChange();
            memberWorkBuildingSelect.value = member.job.buildingName;
            handleWorkBuildingChange();
            memberWorkJobSelect.value = member.job.jobTitle;
        } else {
            memberWorkLocationSelect.value = '';
            handleWorkLocationChange();
        }

        document.getElementById('add-member-btn').textContent = "Mettre à jour ce membre";
        updateTempMembersUI();
    }
    
    function updateFamilyModalButtons() {
        const canSubmit = tempMembers.length > 0 && familyNameInput.value.trim() !== '';
        confirmAddFamilyBtn.disabled = !canSubmit;
        saveFamilyTemplateBtn.disabled = !canSubmit;
    }

    function saveFamilyTemplate() {
        if (tempMembers.length === 0 || !familyNameInput.value.trim()) {
            alert("Le nom de famille et au moins un membre sont requis pour sauvegarder un modèle.");
            return;
        }

        const templateId = editingFamilyTemplateIdInput.value || `template_${Date.now()}`;
        
        const familyTemplate = {
            id: templateId,
            name: familyNameInput.value.trim(),
            members: tempMembers.map(m => ({...m, lastName: familyNameInput.value.trim()})) // Ensure lastName is updated
        };
        
        addOrUpdateFamilyTemplate(familyTemplate);
        alert(`Modèle de famille "${familyTemplate.name}" sauvegardé avec succès !`);
        familyModal.close();
    }
    
    function addFamilyToPlace(e) {
        e.preventDefault();
        
        const familyName = familyNameInput.value.trim();
        
        if (selectedPlace.demographics.families.some(family => family.name.toLowerCase() === familyName.toLowerCase())) {
            alert(`Une famille nommée "${familyName}" existe déjà à ${selectedPlace.name}. Veuillez choisir un autre nom.`);
            return;
        }

        const familyId = `fam_custom_${Date.now()}`;
        const newFamily = { id: familyId, name: familyName, locationId: selectedPlace.id, memberIds: [], isCustom: true };

        const membersToAdd = [];
        for (const tempMember of tempMembers) {
            const newMember = { ...tempMember };
            newMember.id = `custom_${Date.now()}_${Math.random()}`;
            newMember.familyId = familyId;
            newMember.lastName = familyName;
            
            if (newMember.job) {
                const jobLocation = currentRegion.places.find(p => p.id === newMember.job.locationId);
                const jobData = getJobData(newMember.job.buildingName, newMember.job.jobTitle);
                
                if (!jobLocation || !jobData) {
                    alert(`Erreur : L'emploi pour ${newMember.firstName} n'est plus valide. Veuillez le corriger.`);
                    return;
                }

                const experienceData = applyInitialExperience(newMember, jobData);
                Object.assign(newMember, {
                    salary: calculateInitialSalary(jobData),
                    stats: experienceData.stats,
                    prestige: experienceData.prestige
                });
            }
            newFamily.memberIds.push(newMember.id);
            membersToAdd.push(newMember);
        }
        
        selectedPlace.demographics.families.push(newFamily);
        membersToAdd.forEach(member => {
             const locationForJob = member.job ? currentRegion.places.find(p => p.id === member.job.locationId) : selectedPlace;
             if (!locationForJob.demographics) {
                 locationForJob.demographics = { population: [], families: [] };
             }
             locationForJob.demographics.population.push(member);
        });

        familyModal.close();
        saveData();
        selectPlace(selectedPlace.id);
        updateDashboard();
        document.getElementById(`status-icon-${selectedPlace.id}`).textContent = '🟢';
        alert(`La famille ${familyName} a été ajoutée à ${selectedPlace.name}.`);
    }


    function resetAllPopulation() {
        if (!selectedPlace) return;
        if (!confirm(`Êtes-vous sûr de vouloir supprimer TOUTE la population et toutes les familles de "${selectedPlace.name}" ? Cette action est irréversible.`)) {
            return;
        }
        selectedPlace.demographics.population = [];
        selectedPlace.demographics.families = [];
        document.getElementById(`status-icon-${selectedPlace.id}`).textContent = '🟡';
        saveData();
        updatePlaceStats();
        updatePopulationUI();
        updateDashboard();
    }

    function resetGen0Population() {
        if (!selectedPlace) return;
        
        const customFamilies = selectedPlace.demographics.families.filter(f => f.isCustom);
        const customMemberIds = new Set(customFamilies.flatMap(f => f.memberIds));
        const customPopulation = selectedPlace.demographics.population.filter(p => customMemberIds.has(p.id));
        selectedPlace.demographics.families = customFamilies;
        selectedPlace.demographics.population = customPopulation;
        const isConfigured = selectedPlace.demographics.population.length > 0;
        document.getElementById(`status-icon-${selectedPlace.id}`).textContent = isConfigured ? '🟢' : '🟡';
        saveData();
        updatePlaceStats();
        updatePopulationUI();
        updateDashboard();
    }
    
    function openCharacterModal(personId) {
        const allPopulation = currentRegion.places.flatMap(p => (p.demographics ? p.demographics.population : []));
        const person = allPopulation.find(p => p.id === personId);
        if (!person) return;
    
        // --- Informations de base ---
        document.getElementById('char-modal-title').textContent = `Détails de ${person.firstName}`;
        document.getElementById('char-modal-fullname').textContent = `${person.firstName} ${person.lastName}`;
        document.getElementById('char-modal-race').textContent = person.race;
        document.getElementById('char-modal-age').textContent = person.age;
        document.getElementById('char-modal-gender').textContent = person.gender;
        
        // --- Informations professionnelles ---
        const monthlyGainsContainer = document.getElementById('char-modal-monthly-gains');
        monthlyGainsContainer.innerHTML = '';
        
        if (person.job) {
            const workPlace = currentRegion.places.find(p => p.id === person.job.locationId);
            document.getElementById('char-modal-job').textContent = person.job.jobTitle;
            document.getElementById('char-modal-workplace').textContent = `${person.job.buildingName} (${workPlace.name})`;
            document.getElementById('char-modal-salary').textContent = (person.salary || 0).toLocaleString();
            document.getElementById('char-modal-prestige').textContent = (person.prestige || 0).toFixed(2);
    
            const jobData = getJobData(person.job.buildingName, person.job.jobTitle);
            if (jobData && jobData.gainsMensuels) {
                const prestigeGain = jobData.gainsMensuels.prestige || 0;
                monthlyGainsContainer.innerHTML += `<div class="char-detail-item"><strong>Prestige/mois :</strong> +${prestigeGain.toFixed(2)}</div>`;
                if(jobData.gainsMensuels.stats){
                    const statGains = Object.entries(jobData.gainsMensuels.stats)
                        .map(([stat, val]) => {
                            const additiveGain = val; 
                            const sign = '+';
                            return `${sign}${additiveGain.toFixed(2)} ${stat.slice(0,3)}.`;
                        });
                    monthlyGainsContainer.innerHTML += `<div class="char-detail-item" style="grid-column: span 2;"><strong>Stats/mois :</strong> ${statGains.join(', ')}</div>`;
                }
            } else {
                 monthlyGainsContainer.innerHTML = '<p>Aucun gain de carrière défini pour ce poste.</p>';
            }
    
        } else {
            ['job', 'workplace', 'salary', 'prestige'].forEach(id => document.getElementById(`char-modal-${id}`).textContent = 'N/A');
            monthlyGainsContainer.innerHTML = '<p>Sans emploi, pas de gains mensuels.</p>';
        }
    
        // --- Attributs ---
        const statsList = document.getElementById('char-modal-stats');
        statsList.innerHTML = '';
        if (person.stats) {
            const statMap = {
                intelligence: 'Int', force: 'For', constitution: 'Con',
                dexterite: 'Dex', sagesse: 'Sag', charisme: 'Cha'
            };
    
            for (const [stat, value] of Object.entries(person.stats)) {
                const dndString = convertToDnD(value);
                const statShort = statMap[stat] || stat.slice(0,3);
    
                statsList.innerHTML += `
                    <li>
                        <span><strong>${stat.charAt(0).toUpperCase() + stat.slice(1)}:</strong> ${Math.round(value)}</span>
                        <span class="dnd-stat"><strong>${statShort}:</strong> ${dndString}</span>
                    </li>`;
            }
        }
        
        // --- Informations familiales ---
        const familyInfoContainer = document.getElementById('char-modal-family-info');
        let familyHTML = '<ul>';
        let hasFamilyInfo = false;
    
        // Parents
        if (person.parents && person.parents.length > 0) {
            const parents = person.parents.map(id => allPopulation.find(p => p.id === id)).filter(p => p);
            if (parents.length > 0) {
                const parentLinks = parents.map(p => `<span class="character-link" data-person-id="${p.id}">${p.firstName} ${p.lastName}</span>`).join(' et ');
                familyHTML += `<li><strong>Parents :</strong> ${parentLinks}</li>`;
                hasFamilyInfo = true;
            }
        }
        // Conjoint
        if (person.spouseId) {
            const spouse = allPopulation.find(p => p.id === person.spouseId);
            if (spouse) {
                 familyHTML += `<li><strong>Conjoint(e) :</strong> <span class="character-link" data-person-id="${spouse.id}">${spouse.firstName} ${spouse.lastName}</span></li>`;
                 hasFamilyInfo = true;
            }
        }
        // Enfants
        if (person.childrenIds && person.childrenIds.length > 0) {
            const children = person.childrenIds.map(id => allPopulation.find(p => p.id === id)).filter(p => p);
            if (children.length > 0) {
                const childrenLinks = children.map(c => `<span class="character-link" data-person-id="${c.id}">${c.firstName}</span>`).join(', ');
                familyHTML += `<li><strong>Enfant(s) :</strong> ${childrenLinks}</li>`;
                hasFamilyInfo = true;
            }
        }
        
        if (!hasFamilyInfo) {
            familyHTML += '<li>Aucun lien de parenté direct connu.</li>';
        }
        familyHTML += '</ul>';
        familyInfoContainer.innerHTML = familyHTML;
    
        // --- Aspirations Sociales ---
        document.getElementById('char-modal-desired-children').textContent = person.desiredChildren ?? 'N/A';
        document.getElementById('char-modal-desired-friends').textContent = person.desiredFriends ?? 'N/A';
        document.getElementById('char-modal-desired-acquaintances').textContent = person.desiredAcquaintances ?? 'N/A';
    
        characterDetailsModal.showModal();
    }


    // --- LOGIQUE DU TABLEAU DE BORD ---
    function updateDashboard() {
        let totalPop = 0, totalFam = 0;
        if(currentRegion) {
            currentRegion.places.forEach(p => { 
                if (p.demographics) { 
                    totalPop += p.demographics.population.length; 
                    totalFam += p.demographics.families.length; 
                }
            });
        }
        globalTotalPopulation.textContent = totalPop; 
        globalFamilyCount.textContent = totalFam;
        calculateAndDisplayDistanceMatrix();
    }
    
    function calculateAndDisplayDistanceMatrix() {
        if (!currentRegion || !currentRegion.roads || currentRegion.places.length < 2) {
            distanceMatrixContainer.innerHTML = '<p>Pas assez de lieux ou de routes pour calculer une matrice.</p>';
            return;
        }

        const places = currentRegion.places;
        const roadsData = currentRegion.roads;

        const travelModesToDisplay = { "Pied": "Pied", "Rapide": "Cheval", "Convoi": "Caravane" };
        const headerRow = '<th>Lieu</th><th>Mode</th>' + places.map(p => `<th title="${p.name}">${p.name.substring(0, 5)}...</th>`).join('');
        let tableHTML = `<table class="distance-matrix-table"><thead><tr>${headerRow}</tr></thead><tbody>`;

        places.forEach(p1 => {
            Object.entries(travelModesToDisplay).forEach(([displayName, modeKey], index) => {
                let rowHTML = '<tr>';
                if (index === 0) rowHTML += `<td rowspan="3" style="vertical-align: middle; text-align: left; font-weight: bold;">${p1.name}</td>`;
                rowHTML += `<td style="text-align: left;">${displayName}</td>`;

                places.forEach(p2 => {
                    if (p1.id === p2.id) {
                        rowHTML += '<td style="background-color: #ccc;">-</td>';
                    } else {
                        const roadKey = getRoadKey(p1.id, p2.id);
                        const roadInfo = roadsData[roadKey];
                        let travelTime = Infinity;

                        if (roadInfo && ROAD_TYPES[roadInfo.type].users.includes(modeKey)) {
                            const distanceKm = axialDistance(p1.coords, p2.coords) * (currentRegion.scale || 10);
                            const baseSpeed = TRAVEL_SPEEDS[modeKey];
                            const modifier = ROAD_MODIFIERS[roadInfo.type];
                            travelTime = distanceKm / (baseSpeed * modifier);
                        }
                        rowHTML += `<td>${formatTravelTime(travelTime)}</td>`;
                    }
                });
                rowHTML += '</tr>';
                tableHTML += rowHTML;
            });
        });

        tableHTML += '</tbody></table>';
        distanceMatrixContainer.innerHTML = tableHTML;
    }

    
    // --- INITIALISATION ---
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
        
        // Listeners pour la nouvelle modale de bibliothèque
        familyLibraryModal.querySelector('.modal-close-btn').addEventListener('click', () => familyLibraryModal.close());
        createNewTemplateBtn.addEventListener('click', () => {
            familyLibraryModal.close();
            openFamilyModal();
        });
        familyTemplatesList.addEventListener('click', handleLibraryActions);
        
        // Listeners pour la modale de création/édition
        familyForm.addEventListener('submit', addFamilyToPlace);
        familyModal.querySelector('.modal-close-btn').addEventListener('click', () => familyModal.close());
        cancelFamilyBtn.addEventListener('click', () => familyModal.close());
        saveFamilyTemplateBtn.addEventListener('click', saveFamilyTemplate);
        addMemberBtn.addEventListener('click', saveTempMember);
        familyNameInput.addEventListener('input', updateFamilyModalButtons);
        
        familyMembersList.addEventListener('click', e => { 
            const target = e.target;
            if (target.classList.contains('btn-delete-temp')) { 
                tempMembers.splice(parseInt(target.dataset.index), 1); 
                if(editingMemberIndex == target.dataset.index) {
                     editingMemberIndex = -1;
                     familyForm.reset();
                     document.getElementById('add-member-btn').textContent = "Ajouter ce membre";
                }
                updateTempMembersUI(); 
                handleWorkBuildingChange(); 
            } else if (target.closest('.member-info')) {
                const index = parseInt(target.closest('.member-info').dataset.index);
                populateMemberForm(index);
            }
        });

        memberWorkLocationSelect.addEventListener('change', handleWorkLocationChange);
        memberWorkBuildingSelect.addEventListener('change', handleWorkBuildingChange);

        document.body.addEventListener('click', e => { 
            if (e.target.classList.contains('character-link')) {
                const personId = e.target.dataset.personId;
                const openModals = document.querySelectorAll('dialog[open]');
                openModals.forEach(modal => modal.close());
                
                setTimeout(() => openCharacterModal(personId), 50);
            }
        });
        
        characterDetailsModal.querySelector('.modal-close-btn').addEventListener('click', () => characterDetailsModal.close());
        
        interracialMarriageToggle.addEventListener('change', (e) => {
            if(selectedPlace) {
                selectedPlace.demographics.allowInterracialMarriage = e.target.checked;
                saveData();
            }
        });
    }

    init();
});