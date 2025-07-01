/**
 * EcoSimRPG - step2.js
 * VERSION 9.3 - Ajustement des quotas et confirmation de la diversité
 * - MODIFIÉ : Le quota de bâtiments pour chaque type de lieu a été augmenté de 4.
 * - CONSERVÉ : L'étape de "peuplement de base" garantit au moins 2 bâtiments par catégorie lors de la génération automatique.
 * - CORRIGÉ : Réintégration de la fonction `logToOverlay` qui avait été accidentellement supprimée, causant une ReferenceError.
 * - CONSERVÉ : Le panneau d'état de la région (mode manuel) est correctement masqué lors du re-lancement de la génération automatique.
 * - CONSERVÉ : Le panneau "État des Lieux" (pendant la génération) affiche un pourcentage.
 * - CONSERVÉ : Toutes les jauges du panneau "État des Lieux" passent à 100% à la fin de la génération.
 */
document.addEventListener('DOMContentLoaded', () => {
    // --- CONSTANTES & CONFIGURATION ---
    const STORAGE_KEY = 'ecoSimRPG_map_data';
    const LAST_REGION_KEY = 'ecoSimRPG_last_region_id';
    const BUILDING_DATA = window.EcoSimData.buildings;
    const ITEMS_PER_PAGE = 3;
    const DIVERSITY_PENALTY = 25; // Malus de score si un bâtiment existe déjà dans un lieu de même type

    const PLACE_TYPE_HIERARCHY = {
        "Hameau": 1,
        "Village": 2,
        "Bourg": 3,
        "Ville": 4,
        "Capitale": 5
    };

    // --- SELECTEURS DOM ---
    const mainContentWrapper = document.querySelector('.main-content-wrapper');
    const placesContainer = document.getElementById('places-container');
    const generationOverlay = document.getElementById('generation-overlay');
    const generationLog = document.getElementById('generation-log');
    const placeStatusPanel = document.getElementById('place-status-panel');
    const regionNameDisplay = document.getElementById('region-name-display');
    const navStep3 = document.getElementById('nav-step3');
    const validateAllBtn = document.getElementById('validate-all-btn');
    const rerollRegionBtn = document.getElementById('reroll-region-btn');
    const manualConfigBtn = document.getElementById('manual-config-btn');
    const validationModal = document.getElementById('validation-modal');
    const analysisModal = document.getElementById('analysis-modal');
    const analysisModalTitle = document.getElementById('analysis-modal-title');
    const internalAnalysisContainer = document.querySelector('#internal-analysis .analysis-details');
    const externalAnalysisContainer = document.querySelector('#external-analysis .analysis-details');
    const statusPanel = document.getElementById('status-panel');
    const statusContent = document.getElementById('status-content');
    const addBuildingModal = document.getElementById('add-building-modal');
    const addBuildingModalTitle = document.getElementById('add-building-modal-title');
    const addBuildingModalContent = document.getElementById('add-building-modal-content');
    const paginationControls = document.getElementById('pagination-controls');
    const prevPageBtn = document.getElementById('prev-page-btn');
    const nextPageBtn = document.getElementById('next-page-btn');
    const pageInfo = document.getElementById('page-info');

    // Nouveaux sélecteurs pour la modale de choix
    const sourceSelectionModal = document.getElementById('source-selection-modal');
    const selectAutoBtn = document.getElementById('select-auto-btn');
    const selectManualBtn = document.getElementById('select-manual-btn');
    const selectCustomBtn = document.getElementById('select-custom-btn');

    // --- ETAT DE L'APPLICATION ---
    let regions = [];
    let currentRegion = null;
    let isManualMode = false;
    let unmetRegionalTags = new Set();
    let currentPage = 1;
    let placeStatusElements = new Map();

    // --- FONCTIONS UTILITAIRES ---
    function axialDistance(a, b) {
        if (!a || !b) return Infinity;
        const dq = a.q - b.q;
        const dr = a.r - b.r;
        const ds = -dq - dr;
        return (Math.abs(dq) + Math.abs(dr) + Math.abs(ds)) / 2;
    }

    function getBuildingData(buildingName) {
        for (const type in BUILDING_DATA) {
            for (const category in BUILDING_DATA[type]) {
                if (BUILDING_DATA[type][category][buildingName]) {
                    return { ...BUILDING_DATA[type][category][buildingName],
                        category: category,
                        originalType: type
                    };
                }
            }
        }
        return null;
    }

    function calculatePlaceStats(place) {
        let buildingCount = 0;
        let jobCount = 0;

        if (place.config && place.config.buildings) {
            for (const category in place.config.buildings) {
                for (const building of place.config.buildings[category]) {
                    buildingCount++;
                    const buildingData = getBuildingData(building.name);
                    if (buildingData && buildingData.emplois) {
                        for (const emploi of buildingData.emplois) {
                            jobCount += emploi.postes;
                        }
                    }
                }
            }
        }
        return {
            buildingCount,
            jobCount
        };
    }

    function getTagsForPlace(place, tagType) {
        const tags = new Set();
        if (!place.config || !place.config.buildings) return tags;
        for (const category in place.config.buildings) {
            for (const building of place.config.buildings[category]) {
                const buildingData = getBuildingData(building.name);
                if (!buildingData) continue;
                if (tagType === 'providesTags' && buildingData.providesTags) {
                    buildingData.providesTags.forEach(tag => tags.add(tag));
                } else if (tagType === 'requiresTags' && buildingData.requiresTags) {
                    Object.keys(buildingData.requiresTags).forEach(tag => tags.add(tag));
                }
            }
        }
        return tags;
    }

    // --- FONCTIONS POUR LE PANNEAU D'ÉTAT ---
    function initializePlaceStatusPanel() {
        placeStatusPanel.innerHTML = '';
        placeStatusElements.clear();
        if (!currentRegion) return;

        const sortedPlaces = [...currentRegion.places].sort((a, b) => (PLACE_TYPE_HIERARCHY[a.type] - PLACE_TYPE_HIERARCHY[b.type]) || a.name.localeCompare(b.name));

        for (const place of sortedPlaces) {
            const maxBuildings = getBuildingQuotaForPlace(place.type);
            const item = document.createElement('div');
            item.className = 'place-status-item';
            item.innerHTML = `
                <div class="name">
                    <span>${place.name} (${place.type})</span>
                    <span class="count" id="count-${place.id}">0%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-bar-fill" id="fill-${place.id}"></div>
                </div>
            `;
            placeStatusPanel.appendChild(item);
            placeStatusElements.set(place.id, {
                count: document.getElementById(`count-${place.id}`),
                fill: document.getElementById(`fill-${place.id}`),
                max: maxBuildings
            });
        }
    }

    function updatePlaceFillStatus(placeId, current, max) {
        const elements = placeStatusElements.get(placeId);
        if (elements) {
            const percentage = max > 0 ? (current / max) * 100 : 0;
            elements.count.textContent = `${Math.round(percentage)}%`;
            elements.fill.style.width = `${Math.min(percentage, 100)}%`;
        }
    }

    // --- LOGIQUE DE GÉNÉRATION (Automatique et Immersive) ---
    // CORRIGÉ : Fonction réintégrée
    async function logToOverlay(message, delay = 100) {
        if (generationLog) {
            const li = document.createElement('li');
            li.innerHTML = message;
            generationLog.appendChild(li);
            generationLog.scrollTop = generationLog.scrollHeight;
        }
        await new Promise(resolve => setTimeout(resolve, delay));
    }

    async function generateRegionConfiguration() {
        if (!currentRegion) return;

        if (generationLog) generationLog.innerHTML = '';
        await logToOverlay("Lancement des architectes virtuels...", 200);
        await logToOverlay("Analyse de la topographie et des ressources régionales...", 200);

        const placeConfigs = new Map();
        const builtByPlaceType = new Map(); // Pour la diversité

        currentRegion.places.forEach(place => {
            placeConfigs.set(place.id, {
                buildings: {},
                totalBuildings: 0,
                maxBuildings: getBuildingQuotaForPlace(place.type)
            });
            if (!builtByPlaceType.has(place.type)) {
                builtByPlaceType.set(place.type, new Set());
            }
            if (!place.config) place.config = {};
        });

        await logToOverlay("Établissement des bâtiments administratifs de base...", 200);
        currentRegion.places.forEach(place => {
            const config = placeConfigs.get(place.id);
            const adminCategory = "Bâtiments Administratifs";
            const availableBuildings = BUILDING_DATA[place.type];
            if (availableBuildings && availableBuildings[adminCategory]) {
                config.buildings[adminCategory] = [];
                for (const name in availableBuildings[adminCategory]) {
                    config.buildings[adminCategory].push({
                        name,
                        description: availableBuildings[adminCategory][name].description
                    });
                    config.totalBuildings++;
                    builtByPlaceType.get(place.type).add(name);
                }
            }
            updatePlaceFillStatus(place.id, config.totalBuildings, config.maxBuildings);
        });
        
        // =================================================================
        // ▼▼▼▼▼▼▼▼▼▼▼▼▼▼ BLOC DE CODE POUR LA DIVERSITÉ MINIMALE ▼▼▼▼▼▼▼▼▼▼▼▼▼
        // =================================================================

        await logToOverlay("Garantie de la diversité structurelle de base...", 150);

        // Boucle sur chaque lieu pour assurer une diversité de base
        for (const place of currentRegion.places) {
            const config = placeConfigs.get(place.id);
            const availableCategories = BUILDING_DATA[place.type] || {};

            // Boucle sur chaque catégorie de bâtiment disponible pour ce type de lieu
            for (const categoryName in availableCategories) {
                // Les bâtiments administratifs sont déjà gérés, on les ignore
                if (categoryName === "Bâtiments Administratifs") continue;

                // Assure que le tableau pour cette catégorie existe dans la configuration
                if (!config.buildings[categoryName]) {
                    config.buildings[categoryName] = [];
                }
                
                // Calcule combien de bâtiments il manque pour atteindre notre objectif de 2
                let buildingsToAddCount = 2 - config.buildings[categoryName].length;
                if (buildingsToAddCount <= 0) continue; // On a déjà atteint ou dépassé l'objectif

                // Crée une liste des bâtiments potentiels (non encore construits) pour cette catégorie
                const potentialBuildings = Object.keys(availableCategories[categoryName])
                    .filter(name => !Object.values(config.buildings).flat().some(b => b.name === name));
                
                // Mélange la liste pour une sélection aléatoire
                potentialBuildings.sort(() => 0.5 - Math.random());

                // Ajoute les bâtiments manquants
                for (let i = 0; i < buildingsToAddCount && i < potentialBuildings.length; i++) {
                    // Vérifie qu'on ne dépasse pas le quota total du lieu
                    if (config.totalBuildings >= config.maxBuildings) {
                        await logToOverlay(`Quota de bâtiments atteint pour ${place.name}, ajout pour la catégorie ${categoryName} interrompu.`, 50);
                        break; 
                    }
                    
                    const buildingNameToAdd = potentialBuildings[i];
                    const buildingData = availableCategories[categoryName][buildingNameToAdd];

                    config.buildings[categoryName].push({
                        name: buildingNameToAdd,
                        description: buildingData.description
                    });
                    config.totalBuildings++;
                    builtByPlaceType.get(place.type).add(buildingNameToAdd); // Met à jour le suivi pour la diversité
                    await logToOverlay(`Ajout de base: <strong>${buildingNameToAdd}</strong> à <strong>${place.name}</strong> pour assurer la diversité.`, 50);
                    updatePlaceFillStatus(place.id, config.totalBuildings, config.maxBuildings);
                }
            }
        }
        
        // =================================================================
        // ▲▲▲▲▲▲▲▲▲▲▲▲▲▲ FIN DU BLOC DE CODE POUR LA DIVERSITÉ ▲▲▲▲▲▲▲▲▲▲▲▲▲
        // =================================================================

        let attempts = 0;
        const maxAttempts = 500;
        while (attempts < maxAttempts) {
            const regionallyProvidedTags = new Set();
            const allRequiredTags = new Set();

            placeConfigs.forEach((config) => {
                Object.values(config.buildings).flat().forEach(building => {
                    const buildingData = getBuildingData(building.name);
                    if (!buildingData) return;
                    buildingData.providesTags.forEach(tag => regionallyProvidedTags.add(tag));
                    if (buildingData.requiresTags) {
                        Object.keys(buildingData.requiresTags).forEach(tag => allRequiredTags.add(tag));
                    }
                });
            });

            const unmetRegionalNeeds = new Set([...allRequiredTags].filter(tag => !regionallyProvidedTags.has(tag)));

            let allPlacesMeetMinimum = true;
            for (const place of currentRegion.places) {
                const config = placeConfigs.get(place.id);
                let nonAdminCount = 0;
                for (const category in config.buildings) {
                    if (category !== "Bâtiments Administratifs") nonAdminCount += config.buildings[category].length;
                }
                if (nonAdminCount < 3) {
                    allPlacesMeetMinimum = false;
                    break;
                }
            }

            if (unmetRegionalNeeds.size === 0 && allPlacesMeetMinimum) {
                await logToOverlay("✅ Région viable et suffisamment dense. Finalisation.", 500);
                break;
            }

            if (unmetRegionalNeeds.size > 0) {
                await logToOverlay(`Besoins non satisfaits : <strong>${[...unmetRegionalNeeds].join(', ')}</strong>`);
            } else {
                await logToOverlay("Région viable, mais lieux peu denses. Optimisation...", 50);
            }

            let candidatePool = [];
            const needsExceptionalSearch = unmetRegionalNeeds.size > 0;
            
            for (const place of currentRegion.places) {
                const config = placeConfigs.get(place.id);
                const placeTier = PLACE_TYPE_HIERARCHY[place.type];

                for (const buildingType in BUILDING_DATA) {
                    const buildingTier = PLACE_TYPE_HIERARCHY[buildingType];
                    const isNativeType = (buildingType === place.type);
                    const canBuildExceptionally = (needsExceptionalSearch && placeTier >= buildingTier && !isNativeType);

                    if (isNativeType || canBuildExceptionally) {
                         for (const category in BUILDING_DATA[buildingType]) {
                            if (category === "Bâtiments Administratifs") continue;
                            for (const name in BUILDING_DATA[buildingType][category]) {
                                if (Object.values(config.buildings).flat().some(b => b.name === name)) continue;

                                const buildingData = BUILDING_DATA[buildingType][category][name];
                                
                                const buildingsInSameTypePlace = builtByPlaceType.get(place.type);
                                let diversityScore = 0;
                                if (buildingsInSameTypePlace && buildingsInSameTypePlace.has(name)) {
                                    diversityScore = DIVERSITY_PENALTY;
                                }

                                let priorityScore = 0;
                                const providesNeededTag = buildingData.providesTags.some(tag => unmetRegionalNeeds.has(tag));
                                 if (providesNeededTag) {
                                     priorityScore = 100;
                                 } else if (unmetRegionalNeeds.size === 0) {
                                     let nonAdminCount = Object.values(config.buildings).flat().filter(b => getBuildingData(b.name) ?.category !== "Bâtiments Administratifs").length;
                                     if (nonAdminCount < 3) priorityScore = 50;
                                 }
                                
                                if (priorityScore > 0) {
                                    candidatePool.push({
                                        place,
                                        name,
                                        category,
                                        data: buildingData,
                                        score: priorityScore - diversityScore + Math.random()
                                    });
                                }
                            }
                        }
                    }
                }
            }

            if (candidatePool.length === 0) {
                await logToOverlay("Aucun candidat pertinent trouvé. Arrêt de l'optimisation.", 500);
                break;
            }

            candidatePool.sort((a, b) => b.score - a.score);
            const bestCandidateToAdd = candidatePool[0];

            if (bestCandidateToAdd) {
                const { place, name, category, data } = bestCandidateToAdd;
                const config = placeConfigs.get(place.id);

                if (!config.buildings[category]) config.buildings[category] = [];
                config.buildings[category].push({ name, description: data.description });
                config.totalBuildings++;
                builtByPlaceType.get(place.type).add(name);

                await logToOverlay(`Construction de <strong>${name}</strong> à <strong>${place.name}</strong>...`);
                updatePlaceFillStatus(place.id, config.totalBuildings, config.maxBuildings);
            } else {
                break;
            }
            attempts++;
        }

        await logToOverlay("Finalisation du plan de la région...", 200);
        for (const [placeId, elements] of placeStatusElements.entries()) {
            const placeConfig = placeConfigs.get(placeId);
            // On met à jour avec le nombre final de bâtiments pour atteindre 100% de la barre "remplie"
            // (même si le quota max n'est pas atteint, visuellement c'est plus satisfaisant)
            updatePlaceFillStatus(placeId, placeConfig.totalBuildings, placeConfig.totalBuildings); 
        }

        currentRegion.places.forEach(place => {
            place.config.buildings = placeConfigs.get(place.id).buildings;
        });
        await logToOverlay("Architecture terminée. Affichage de la carte...", 1000);
    }
    
    // =================================================================
    // ▼▼▼▼▼▼▼▼▼▼▼▼▼▼ BLOC DE CODE MODIFIÉ ▼▼▼▼▼▼▼▼▼▼▼▼▼
    // =================================================================
    function getBuildingQuotaForPlace(placeType) {
        switch (placeType) {
            case "Hameau":   return 14; // 10 + 4
            case "Village":  return 21; // 17 + 4
            case "Bourg":    return 31; // 27 + 4
            case "Ville":    return 46; // 42 + 4
            case "Capitale": return 66; // 62 + 4
            default:         return 16; // 12 + 4
        }
    }
    // =================================================================
    // ▲▲▲▲▲▲▲▲▲▲▲▲▲▲ FIN DU BLOC DE CODE MODIFIÉ ▲▲▲▲▲▲▲▲▲▲▲▲▲
    // =================================================================


    // --- GESTION DE L'AFFICHAGE ET DES DONNÉES ---
    function loadData() {
        const data = localStorage.getItem(STORAGE_KEY);
        regions = data ? JSON.parse(data) : [];
        const lastRegionId = localStorage.getItem(LAST_REGION_KEY);
        if (lastRegionId) {
            currentRegion = regions.find(r => r.id == lastRegionId) || null;
        }

        if (currentRegion && currentRegion.places.some(p => p.config && Object.keys(p.config.buildings || {}).length > 0)) {
            selectCustomBtn.disabled = false;
            selectCustomBtn.addEventListener('click', () => {
                sourceSelectionModal.close();
                mainContentWrapper.style.visibility = 'visible';
                isManualMode = false;
                displayPlaces();
            });
        }
    }

    function saveData() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(regions));
        updateNavLinksState();
    }

    function displayPlaces() {
        if (!currentRegion) {
            placesContainer.innerHTML = `<p>Aucune région sélectionnée. Retournez à l'étape 1.</p>`;
            paginationControls.style.display = 'none';
            return;
        }

        regionNameDisplay.textContent = `Région : ${currentRegion.name}`;

        const sortedPlaces = [...currentRegion.places].sort((a, b) => {
            const tierA = PLACE_TYPE_HIERARCHY[a.type] || 99;
            const tierB = PLACE_TYPE_HIERARCHY[b.type] || 99;
            if (tierA !== tierB) return tierA - tierB;
            return a.name.localeCompare(b.name);
        });

        const totalPages = Math.ceil(sortedPlaces.length / ITEMS_PER_PAGE);
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        const placesToShow = sortedPlaces.slice(startIndex, endIndex);

        placesContainer.innerHTML = '';
        placesToShow.forEach(place => {
            const placeCard = document.createElement('div');
            placeCard.className = 'place-card';
            placeCard.id = `place-${place.id}`;
            placeCard.innerHTML = isManualMode ? createManualPlaceCardHTML(place) : createAutoPlaceCardHTML(place);
            placesContainer.appendChild(placeCard);
        });

        updatePaginationUI(totalPages);

        if (isManualMode) {
            validateManualConfiguration();
        }
    }

    function updatePaginationUI(totalPages) {
        if (totalPages <= 1) {
            paginationControls.style.display = 'none';
            return;
        }

        paginationControls.style.display = 'flex';
        pageInfo.textContent = `Page ${currentPage} / ${totalPages}`;
        prevPageBtn.disabled = (currentPage === 1);
        nextPageBtn.disabled = (currentPage >= totalPages);
    }

    function createAutoPlaceCardHTML(place) {
        const categoryIcons = { "Bâtiments Administratifs": "🏛️", "Bâtiments de Production": "🏭", "Bâtiments Indépendants": "🏘️", "Bâtiments Agricoles": "🌾", "Chasse/Nature": "🌲" };
        const { buildingCount, jobCount } = calculatePlaceStats(place);
        const statsHTML = `<small>${place.type} &bull; 🏛️ ${buildingCount} Bâtiments &bull; 👥 ${jobCount} Emplois</small>`;
        let headerHTML = `<h2><div>${place.name}${statsHTML}</div><span class="info-icon" data-place-id="${place.id}" title="Analyser le lieu">ℹ️</span></h2>`;
        let buildingsHTML = '';
        const orderedCategories = ["Bâtiments Administratifs", "Bâtiments Agricoles", "Chasse/Nature", "Bâtiments de Production", "Bâtiments Indépendants"];

        if(place.config && place.config.buildings) {
            for (const category of orderedCategories) {
                if (place.config.buildings[category] && place.config.buildings[category].length > 0) {
                    const isMandatory = category === "Bâtiments Administratifs";
                    buildingsHTML += `<div class="building-category"><h3><span class="icon">${categoryIcons[category] || '🏢'}</span>${category}${isMandatory ? '<span class="mandatory-badge">Obligatoire</span>' : ''}</h3><ul class="building-list">${place.config.buildings[category].sort((a,b) => a.name.localeCompare(b.name)).map(b => `<li class="building-item"><div class="name-desc"><div class="name">${b.name}</div><div class="desc">${b.description}</div></div></li>`).join('')}</ul></div>`;
                }
            }
        }
        return `<div class="place-card-header">${headerHTML}</div><div class="place-card-body">${buildingsHTML}</div>`;
    }

    function createManualPlaceCardHTML(place) {
        const categoryIcons = { "Bâtiments Administratifs": "🏛️", "Bâtiments de Production": "🏭", "Bâtiments Indépendants": "🏘️", "Bâtiments Agricoles": "🌾", "Chasse/Nature": "🌲" };
        const allCategoriesForType = Object.keys(BUILDING_DATA[place.type] || {});
        const orderedCategories = [...new Set(["Bâtiments Administratifs", "Bâtiments Agricoles", "Chasse/Nature", "Bâtiments de Production", "Bâtiments Indépendants", ...allCategoriesForType])];
    
        const { buildingCount, jobCount } = calculatePlaceStats(place);
        const statsHTML = `<small>${place.type} &bull; 🏛️ ${buildingCount} Bâtiments &bull; 👥 ${jobCount} Emplois</small>`;
        
        // MODIFICATION : Le bouton est ajouté directement à l'en-tête (headerHTML)
        let headerHTML = `<h2><div>${place.name}${statsHTML}</div></h2><button class="btn-add-building" data-place-id="${place.id}" data-place-type="${place.type}">Ajouter un Bâtiment...</button>`;
        let buildingsHTML = '';
        
        if (place.config && place.config.buildings) {
            for (const category of orderedCategories) {
                if (place.config.buildings[category] && place.config.buildings[category].length > 0) {
                    const isAdministrative = category === "Bâtiments Administratifs";
                    
                    buildingsHTML += `<div class="building-category"><h3><span class="icon">${categoryIcons[category] || '🏢'}</span>${category}${isAdministrative ? '<span class="mandatory-badge">Obligatoire</span>' : ''}</h3>`;
    
                    buildingsHTML += `<ul class="building-list">${place.config.buildings[category].sort((a,b) => a.name.localeCompare(b.name)).map(b => {
                        const buildingData = getBuildingData(b.name);
                        const removeButtonHTML = isAdministrative
                            ? '' 
                            : `<button class="btn-remove-building" data-place-id="${place.id}" data-building-name="${b.name}">Retirer</button>`;
                        
                        return `<li class="building-item">
                                    <div class="name-desc">
                                        <div class="name">${b.name}</div>
                                        <div class="desc">${buildingData?.description || ''}</div>
                                    </div>
                                    ${removeButtonHTML}
                                </li>`;
                    }).join('')}</ul></div>`;
                }
            }
        }
        
        // SUPPRESSION de l'ancienne ligne qui ajoutait le bouton ici
        
        return `<div class="place-card-header">${headerHTML}</div><div class="place-card-body">${buildingsHTML}</div>`;
    }

    function openAddBuildingModal(placeId, placeType) {
        const place = currentRegion.places.find(p => p.id == placeId);
        if (!place) return;
    
        const currentBuildingNames = new Set();
        if (place.config && place.config.buildings) {
            for (const cat in place.config.buildings) {
                place.config.buildings[cat].forEach(b => currentBuildingNames.add(b.name));
            }
        }
    
        addBuildingModalTitle.textContent = `Ajouter un Bâtiment à ${place.name}`;
        let nativeRecommendedHTML = '';
        let otherNativeHTML = '';
        let exceptionalRecommendedHTML = '';
    
        const allBuildingsForType = BUILDING_DATA[placeType] || {};
        for (const category in allBuildingsForType) {
            let categoryNativeRecommended = '';
            let categoryOtherNative = '';
    
            for (const buildingName in allBuildingsForType[category]) {
                const data = allBuildingsForType[category][buildingName];
                
                if (category === "Bâtiments Administratifs" || currentBuildingNames.has(buildingName)) continue;
    
                const providesNeededTag = data.providesTags.some(tag => unmetRegionalTags.has(tag));
                const buildingItemHTML = `
                    <div class="building-list-item ${providesNeededTag ? 'recommended-building' : ''}">
                        <div>
                            <div class="name">${buildingName} ${providesNeededTag ? '⭐' : ''}</div>
                            <div class="desc">${data.description}</div>
                            <div class="tags">
                                <span class="tag-provides">Produit:</span> ${data.providesTags.join(', ') || 'Rien'}
                                <br>
                                <span class="tag-requires">Requiert:</span> ${data.requiresTags ? Object.keys(data.requiresTags).join(', ') : 'Rien'}
                            </div>
                        </div>
                        <button class="btn-add-this-building" data-place-id="${placeId}" data-building-name="${buildingName}">Ajouter</button>
                    </div>`;
                
                if (providesNeededTag) {
                    categoryNativeRecommended += buildingItemHTML;
                } else {
                    categoryOtherNative += buildingItemHTML;
                }
            }
            if (categoryNativeRecommended) nativeRecommendedHTML += `<h4>${category}</h4>${categoryNativeRecommended}`;
            if (categoryOtherNative) otherNativeHTML += `<h4>${category}</h4>${categoryOtherNative}`;
        }
    
        let anyNativeRecommendationExistsInRegion = false;
        if (unmetRegionalTags.size > 0) {
            for (const p of currentRegion.places) {
                const buildingsForPlaceType = BUILDING_DATA[p.type] || {};
                for (const category in buildingsForPlaceType) {
                    for (const buildingName in buildingsForPlaceType[category]) {
                        if (buildingsForPlaceType[category][buildingName].providesTags.some(tag => unmetRegionalTags.has(tag))) {
                            anyNativeRecommendationExistsInRegion = true;
                            break;
                        }
                    }
                    if (anyNativeRecommendationExistsInRegion) break;
                }
                if (anyNativeRecommendationExistsInRegion) break;
            }
        }
        
        const showExceptionalRecommendations = !anyNativeRecommendationExistsInRegion;
    
        if (showExceptionalRecommendations && unmetRegionalTags.size > 0) {
            for (const buildingType in BUILDING_DATA) {
                if (buildingType === placeType) continue;
    
                for (const category in BUILDING_DATA[buildingType]) {
                    if (category === "Bâtiments Administratifs") continue;
    
                    for (const buildingName in BUILDING_DATA[buildingType][category]) {
                        if (currentBuildingNames.has(buildingName)) continue;
                        
                        const data = BUILDING_DATA[buildingType][category][buildingName];
                        if (data.providesTags.some(tag => unmetRegionalTags.has(tag))) {
                            exceptionalRecommendedHTML += `
                                <div class="building-list-item exceptional-recommendation">
                                    <div>
                                        <div class="name">${buildingName} ⭐</div>
                                        <div class="desc">${data.description}</div>
                                        <div class="tags">
                                            <span class="tag-provides">Produit:</span> ${data.providesTags.join(', ') || 'Rien'}
                                            <br>
                                            <small><i>Ce bâtiment (type: ${buildingType}) n'est pas natif de ce lieu mais peut résoudre un manque critique.</i></small>
                                        </div>
                                    </div>
                                    <button class="btn-add-this-building" data-place-id="${placeId}" data-building-name="${buildingName}">Ajouter</button>
                                </div>`;
                        }
                    }
                }
            }
        }
    
        let finalContentHTML = '';
        if (nativeRecommendedHTML) {
            finalContentHTML += `<h3>Bâtiments Recommandés (Natifs)</h3><p class="desc">Ces bâtiments produisent des ressources manquantes dans votre région.</p>${nativeRecommendedHTML}`;
        }
        if (showExceptionalRecommendations && exceptionalRecommendedHTML) {
            finalContentHTML += `<hr><h3>Recommandations Exceptionnelles</h3><p class="desc">Aucun lieu ne peut produire nativement certaines ressources manquantes. Les bâtiments suivants sont suggérés.</p>${exceptionalRecommendedHTML}`;
        }
        if (otherNativeHTML) {
             if (finalContentHTML) finalContentHTML += '<hr>';
            finalContentHTML += `<h3>Autres Bâtiments Disponibles (Natifs)</h3>${otherNativeHTML}`;
        }
        if (!finalContentHTML) {
            finalContentHTML = "<p>Aucun bâtiment supplémentaire ne peut être ajouté à ce lieu pour le moment.</p>";
        }
    
        addBuildingModalContent.innerHTML = finalContentHTML;
        addBuildingModal.showModal();
    }
    
    function addBuildingToPlace(placeId, buildingName) {
        const place = currentRegion.places.find(p => p.id == placeId);
        const buildingData = getBuildingData(buildingName);
        if(!place || !buildingData) return;

        const { category, description } = buildingData;
        if (!place.config.buildings[category]) {
            place.config.buildings[category] = [];
        }
        place.config.buildings[category].push({ name: buildingName, description });
        
        addBuildingModal.close();
        displayPlaces();
        saveData();
    }

    function removeBuildingFromPlace(placeId, buildingName) {
         const place = currentRegion.places.find(p => p.id == placeId);
         if (!place) return;
         for(const category in place.config.buildings) {
            if(category === "Bâtiments Administratifs") continue;

            const index = place.config.buildings[category].findIndex(b => b.name === buildingName);
            if (index > -1) {
                place.config.buildings[category].splice(index, 1);
                displayPlaces();
                saveData();
                return;
            }
         }
    }

    function validateManualConfiguration() {
        if (!isManualMode) return;
        unmetRegionalTags.clear();
        const allProviders = new Map();
        const allRequirements = [];
        currentRegion.places.forEach(p => {
            if (!p.config.buildings) return;
            for (const category in p.config.buildings) {
                p.config.buildings[category].forEach(b => {
                    const buildingData = getBuildingData(b.name);
                    if (buildingData.providesTags) {
                        buildingData.providesTags.forEach(tag => {
                            if (!allProviders.has(tag)) allProviders.set(tag, []);
                            allProviders.get(tag).push({ placeId: p.id, placeName: p.name });
                        });
                    }
                    if (buildingData.requiresTags) {
                        for (const tag in buildingData.requiresTags) {
                            allRequirements.push({
                                place: p, buildingName: b.name, requiredTag: tag,
                                neededDist: buildingData.requiresTags[tag].distance
                            });
                        }
                    }
                });
            }
        });
        let isAllValid = true;
        let errorsHTML = '';
        let hasErrors = false;
        allRequirements.forEach(req => {
            if (!allProviders.has(req.requiredTag)) {
                isAllValid = false;
                hasErrors = true;
                unmetRegionalTags.add(req.requiredTag);
                errorsHTML += `<li class="status-invalid"><div><strong>${req.buildingName}</strong> (à ${req.place.name}) requiert <strong>${req.requiredTag}</strong>.<br><small><em>Source introuvable !</em></small></div></li>`;
            }
        });
        let finalStatusHTML = '<ul>';
        if (!hasErrors) {
             if (allRequirements.length > 0) {
                finalStatusHTML += '<li><p style="color: var(--color-forest-green); text-align: center;">✅ Tous les prérequis sont satisfaits !</p></li>';
             } else {
                finalStatusHTML += '<li><p>Ajoutez des bâtiments pour vérifier les prérequis.</p></li>';
             }
        } else {
            finalStatusHTML += errorsHTML;
        }
        finalStatusHTML += '</ul>';
        statusContent.innerHTML = finalStatusHTML;
        validateAllBtn.disabled = !isAllValid;
    }

    function openAnalysisModal(placeId) {
        const place = currentRegion.places.find(p => p.id == placeId);
        if (!place) return;
        analysisModal.querySelector('#analysis-modal-title').textContent = `Analyse de ${place.name} (${place.type})`;
        const regionalProviders = getRegionalProviders();
        const placeProvides = getTagsForPlace(place, 'providesTags');
        internalAnalysisContainer.innerHTML = generateInternalAnalysisHTML(place, placeProvides, regionalProviders);
        externalAnalysisContainer.innerHTML = generateExternalAnalysisHTML(place, placeProvides, regionalProviders);
        analysisModal.showModal();
    }
    
    function getRegionalProviders() {
        const providersMap = new Map();
        if (!currentRegion) return providersMap;
        currentRegion.places.forEach(place => {
            getTagsForPlace(place, 'providesTags').forEach(tag => {
                if (!providersMap.has(tag)) providersMap.set(tag, []);
                if (!providersMap.get(tag).some(p => p.name === place.name)) {
                     providersMap.get(tag).push({name: place.name, id: place.id, coords: place.coords});
                }
            });
        });
        return providersMap;
    }
    
    function getClosestProviderInfo(requiredTag, currentPlace, regionalProviders) {
        const providerData = regionalProviders.get(requiredTag) || [];
        const providers = providerData.filter(p => p.id !== currentPlace.id);
        if (providers.length === 0) return { isMet: false, distance: Infinity, providerName: "Aucun" };
        let closestDistance = Infinity;
        let closestProvider = null;
        for (const provider of providers) {
            const dist = axialDistance(currentPlace.coords, provider.coords) * (currentRegion.scale || 10);
            if (dist < closestDistance) {
                closestDistance = dist;
                closestProvider = provider;
            }
        }
        return { isMet: true, distance: closestDistance, providerName: closestProvider.name };
    }

    function generateInternalAnalysisHTML(place, placeProvides, regionalProviders) {
        let html = '<ul>';
        if (!place.config.buildings) return '<p>Pas de bâtiments à analyser.</p>';

        const orderedBuildings = Object.values(place.config.buildings).flat().sort((a,b) => a.name.localeCompare(b.name));

        for (const building of orderedBuildings) {
            const buildingData = getBuildingData(building.name);
            if (!buildingData) continue;
            html += `<li><strong>${building.name}</strong><ul>`;
            if (buildingData.providesTags.length > 0) {
                html += `<li><span class="tag-provides">Produit :</span> ${buildingData.providesTags.join(', ')}</li>`;
            }
            if (buildingData.requiresTags && Object.keys(buildingData.requiresTags).length > 0) {
                const satisfactionDetails = Object.keys(buildingData.requiresTags).map(tag => {
                    const requiredDist = buildingData.requiresTags[tag].distance;
                    if (placeProvides.has(tag)) return `${tag} ✅ (local)`;
                    
                    const providerInfo = getClosestProviderInfo(tag, place, regionalProviders);
                    if (providerInfo.isMet) {
                        return `${tag} ✅ (import: ${providerInfo.providerName} à ${Math.round(providerInfo.distance)}km)`;
                    }
                    return `${tag} ❌ (source introuvable!)`;
                }).join('; ');
                html += `<li><span class="tag-requires">Requiert :</span> ${satisfactionDetails}</li>`;
            }
            html += '</ul></li>';
        }
        return html + '</ul>';
    }

    function generateExternalAnalysisHTML(place, placeProvides, regionalProviders) {
        const placeRequires = getTagsForPlace(place, 'requiresTags');
        const imports = [...placeRequires].filter(tag => !placeProvides.has(tag));
        const exports = [...placeProvides];
        let html = '<ul>';
        if (imports.length > 0) {
            html += '<li><strong><span class="tag-requires">Importations Nécessaires</span></strong><ul>';
            imports.forEach(tag => {
                const providerInfo = getClosestProviderInfo(tag, place, regionalProviders);
                if (providerInfo.isMet) {
                    html += `<li>${tag} <span class="tag-source">(Source: <strong>${providerInfo.providerName}</strong> à ${Math.round(providerInfo.distance)}km)</span></li>`;
                } else {
                    html += `<li>${tag} <span class="tag-source">(<strong>Aucune source régionale !</strong>) ❌</span></li>`;
                }
            });
            html += '</ul></li>';
        } else {
            html += '<li><strong><span class="tag-requires">Importations :</span></strong> Ce lieu est autosuffisant.</li>';
        }
        if (exports.length > 0) {
            html += `<li><strong><span class="tag-provides">Exportations Disponibles</span></strong><ul>${exports.sort().map(tag => `<li>${tag}</li>`).join('')}</ul></li>`;
        } else {
            html += '<li><strong><span class="tag-provides">Exportations :</span></strong> Ce lieu ne produit aucun surplus apparent.</li>';
        }
        return html + '</ul>';
    }

    function checkAllPlacesValidated() {
        if (!currentRegion || !currentRegion.places || currentRegion.places.length === 0) return false;
        if (isManualMode) {
            return !validateAllBtn.disabled;
        }
        return currentRegion.places.every(place => place.config && Object.keys(place.config.buildings).length > 0);
    }

    function updateNavLinksState() {
        if (checkAllPlacesValidated()) {
            navStep3.classList.remove('nav-disabled');
        } else {
            navStep3.classList.add('nav-disabled');
        }
    }
    
    function handleValidateAll() {
        const canProceed = isManualMode ? !validateAllBtn.disabled : true;
        if (!canProceed) {
            return alert("Impossible de valider : tous les prérequis ne sont pas satisfaits en mode manuel.");
        }
        
        if (confirm("Finaliser cette configuration et passer à l'étape de simulation ?")) {
            currentRegion.places.forEach(place => place.config.isValidated = true);
            saveData();
            validationModal.showModal();
            setTimeout(() => { window.location.href = "step3.html"; }, 2500);
        }
    }

    // --- FONCTIONS DE DÉMARRAGE ---
    async function startAutomaticGeneration() {
        sourceSelectionModal.close();
        mainContentWrapper.style.visibility = 'visible';

        statusPanel.classList.add('hidden');
        
        initializePlaceStatusPanel();
        generationOverlay.style.display = 'flex';
        
        currentRegion.places.forEach(place => {
            place.config = { buildings: {}, isValidated: false };
        });

        await generateRegionConfiguration();

        saveData();
        generationOverlay.style.display = 'none';
        isManualMode = false;
        validateAllBtn.disabled = false;
        currentPage = 1;
        displayPlaces();
    }

    function startManualConfiguration() {
        sourceSelectionModal.close();
        mainContentWrapper.style.visibility = 'visible';
        
        currentPage = 1;
        isManualMode = true;
        statusPanel.classList.remove('hidden');

        currentRegion.places.forEach(place => {
            place.config = { buildings: {}, isValidated: false }; 
            const adminCategory = "Bâtiments Administratifs";
            const availableBuildings = BUILDING_DATA[place.type];
            if (availableBuildings && availableBuildings[adminCategory]) {
                place.config.buildings[adminCategory] = [];
                for (const name in availableBuildings[adminCategory]) {
                    const buildingData = availableBuildings[adminCategory][name];
                    place.config.buildings[adminCategory].push({ name, description: buildingData.description });
                }
            }
        });

        displayPlaces();
        saveData();
    }

    // --- INITIALISATION ---
    function init() {
        loadData();
        
        if(!sourceSelectionModal) return;

        selectAutoBtn.addEventListener('click', startAutomaticGeneration);
        selectManualBtn.addEventListener('click', startManualConfiguration);
        
        rerollRegionBtn.addEventListener('click', () => {
            if (confirm("Relancer la génération automatique ? La configuration actuelle sera effacée.")) {
                startAutomaticGeneration();
            }
        });
        
        manualConfigBtn.addEventListener('click', () => {
            if (confirm("Passer en mode manuel ? La configuration actuelle sera effacée.")) {
                startManualConfiguration();
            }
        });

        validateAllBtn.addEventListener('click', handleValidateAll);
        
        placesContainer.addEventListener('click', (e) => {
            const target = e.target;
            if (target.closest('.info-icon')) openAnalysisModal(target.closest('.info-icon').dataset.placeId);
            if (target.matches('.btn-add-building')) openAddBuildingModal(target.dataset.placeId, target.dataset.placeType);
            if (target.matches('.btn-remove-building')) removeBuildingFromPlace(target.dataset.placeId, target.dataset.buildingName);
        });

        addBuildingModal.addEventListener('click', (e) => {
            if (e.target.matches('.btn-add-this-building')) {
                addBuildingToPlace(e.target.dataset.placeId, e.target.dataset.buildingName);
            }
        });

        nextPageBtn.addEventListener('click', () => {
            currentPage++;
            displayPlaces();
        });
        prevPageBtn.addEventListener('click', () => {
            currentPage--;
            displayPlaces();
        });
    }

    init();
});