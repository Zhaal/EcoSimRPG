/**
 * EcoSimRPG - step2.js
 * VERSION 7.6 - Génération minimaliste mais dense
 * - MODIFIÉ : La génération automatique s'arrête maintenant seulement si la région est viable ET que chaque lieu possède au moins 3 bâtiments non administratifs.
 * - MODIFIÉ : Le scoring des bâtiments candidats a été ajusté pour d'abord chercher la viabilité, puis pour combler les lieux manquant de bâtiments.
 */
document.addEventListener('DOMContentLoaded', () => {
    // --- CONSTANTES & CONFIGURATION ---
    const STORAGE_KEY = 'ecoSimRPG_map_data';
    const LAST_REGION_KEY = 'ecoSimRPG_last_region_id';
    const BUILDING_DATA = window.EcoSimData.buildings;
    const RAW_RESOURCE_TAGS = ["grain", "légumes", "fruits", "raisins", "miel", "cire", "laine_brute", "lait", "bétail", "bois_brut", "gibier", "poisson", "peaux_brutes", "fourrures", "herbes_communes", "herbes_rares", "champignons_communs", "champignons_rares", "minerai_de_fer", "charbon", "pierre"];
    const ITEMS_PER_PAGE = 3; 

    const PLACE_TYPE_HIERARCHY = { 
        "Hameau": 1, 
        "Village": 2, 
        "Bourg": 3, 
        "Ville": 4, 
        "Capitale": 5 
    };

    // --- SELECTEURS DOM ---
    const placesContainer = document.getElementById('places-container');
    const generationOverlay = document.getElementById('generation-overlay');
    const regionNameDisplay = document.getElementById('region-name-display');
    const navStep3 = document.getElementById('nav-step-3');
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

    // --- ETAT DE L'APPLICATION ---
    let regions = [];
    let currentRegion = null;
    let isManualMode = false;
    let unmetRegionalTags = new Set(); 
    let currentPage = 1;

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
                    return { ...BUILDING_DATA[type][category][buildingName], category: category, originalType: type };
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
        return { buildingCount, jobCount };
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
    
    // --- LOGIQUE DE GÉNÉRATION (Automatique) ---

    function generateRegionConfiguration() {
        if (!currentRegion) return;
        
        const placeTypeHierarchy = { "Hameau": 1, "Village": 2, "Bourg": 3, "Ville": 4, "Capitale": 5 };
    
        const placeConfigs = new Map();
        currentRegion.places.forEach(place => {
            placeConfigs.set(place.id, {
                buildings: {},
                providedTags: new Set(),
                totalBuildings: 0,
                maxBuildings: getBuildingQuotaForPlace(place.type)
            });
            if (!place.config) place.config = {}; 
        });
    
        currentRegion.places.forEach(place => {
            const config = placeConfigs.get(place.id);
            const adminCategory = "Bâtiments Administratifs";
            const availableBuildings = BUILDING_DATA[place.type];
            if (availableBuildings && availableBuildings[adminCategory]) {
                config.buildings[adminCategory] = [];
                for (const name in availableBuildings[adminCategory]) {
                    const buildingData = availableBuildings[adminCategory][name];
                    config.buildings[adminCategory].push({ name, description: buildingData.description });
                    buildingData.providesTags.forEach(tag => config.providedTags.add(tag));
                    config.totalBuildings++;
                }
            }
        });
    
        let attempts = 0;
        const maxAttempts = 500; // Augmentation pour donner plus de chances de remplir les conditions
        while (attempts < maxAttempts) {
            
            const regionallyProvidedTags = new Set();
            const allRequiredTags = new Set();
    
            placeConfigs.forEach((config, placeId) => {
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
    
            // NOUVEAU : Vérifier si tous les lieux respectent le minimum de bâtiments
            let allPlacesMeetMinimum = true;
            for (const place of currentRegion.places) {
                const config = placeConfigs.get(place.id);
                let nonAdminCount = 0;
                for (const category in config.buildings) {
                    if (category !== "Bâtiments Administratifs") {
                        nonAdminCount += config.buildings[category].length;
                    }
                }
                if (nonAdminCount < 3) {
                    allPlacesMeetMinimum = false;
                    break;
                }
            }
    
            // MODIFIÉ : La boucle s'arrête si la région est viable ET que le minimum de bâtiments est atteint
            if (unmetRegionalNeeds.size === 0 && allPlacesMeetMinimum) {
                console.log("Configuration viable et minimale atteinte. Arrêt de la génération.");
                break;
            }
    
            let candidatePool = [];
            const needsExceptionalSearch = unmetRegionalNeeds.size > 0;
    
            for (const place of currentRegion.places) {
                const config = placeConfigs.get(place.id);
                const placeTier = placeTypeHierarchy[place.type];
    
                for (const buildingType in BUILDING_DATA) {
                    const buildingTier = placeTypeHierarchy[buildingType];
                    const isNativeType = (buildingType === place.type);
                    const canBuildExceptionally = (needsExceptionalSearch && placeTier >= buildingTier && !isNativeType);
    
                    if (isNativeType || canBuildExceptionally) {
                        const availableBuildingsForType = BUILDING_DATA[buildingType];
                        for (const category in availableBuildingsForType) {
                            if (category === "Bâtiments Administratifs") continue; // On ne rajoute jamais de bâtiments admin
    
                            for (const name in availableBuildingsForType[category]) {
                                const buildingData = availableBuildingsForType[category][name];
                                const isAlreadyBuilt = Object.values(config.buildings).flat().some(b => b.name === name);
                                if (isAlreadyBuilt) continue;
                                
                                const providesNeededTag = buildingData.providesTags.some(tag => unmetRegionalNeeds.has(tag));
                                if (canBuildExceptionally && !providesNeededTag) continue;
    
                                const dependencyScore = calculateDependencyScore(buildingData, regionallyProvidedTags);
                                
                                // NOUVEAU : Logique de scoring pour atteindre le minimum de bâtiments
                                let priorityScore = 0;
                                if (providesNeededTag) {
                                    priorityScore = 100; // Priorité absolue : résoudre un manque
                                    if (canBuildExceptionally) priorityScore += 50;
                                } else if (unmetRegionalNeeds.size === 0) {
                                    // Si la région est viable, on cherche à remplir le minimum de 3 bâtiments
                                    let nonAdminCount = 0;
                                    for (const cat in config.buildings) {
                                        if (cat !== "Bâtiments Administratifs") {
                                            nonAdminCount += config.buildings[cat].length;
                                        }
                                    }
                                    if (nonAdminCount < 3) {
                                        priorityScore = 50; // Priorité secondaire : "étoffer" le lieu
                                    }
                                }
                                
                                if (priorityScore > 0) { // On ajoute seulement les candidats utiles
                                    candidatePool.push({
                                        place,
                                        name,
                                        category,
                                        data: buildingData,
                                        score: priorityScore - (dependencyScore * 10) - (isNativeType ? 0 : 5) + Math.random()
                                    });
                                }
                            }
                        }
                    }
                }
            }
    
            if (candidatePool.length === 0) break;
    
            candidatePool.sort((a, b) => b.score - a.score);
            const bestCandidateToAdd = candidatePool[0];
    
            if (bestCandidateToAdd) {
                const { place, name, category, data } = bestCandidateToAdd;
                const config = placeConfigs.get(place.id);
                const isFull = config.totalBuildings >= config.maxBuildings;
                const isEssential = data.providesTags.some(tag => unmetRegionalNeeds.has(tag));
    
                if (!isFull || isEssential) {
                    if (!config.buildings[category]) config.buildings[category] = [];
                    config.buildings[category].push({ name, description: data.description });
                    config.totalBuildings++;
                    if (isFull && isEssential) {
                        console.log(`Quota dépassé à ${place.name} pour ajouter le bâtiment essentiel : ${name}`);
                    }
                }
            } else {
                break; 
            }
            attempts++;
        }
    
        currentRegion.places.forEach(place => {
            place.config.buildings = placeConfigs.get(place.id).buildings;
        });
    }

    function calculateDependencyScore(buildingData, regionallyProvidedTags) {
        if (!buildingData.requiresTags || Object.keys(buildingData.requiresTags).length === 0) {
            return 0;
        }
        let missingDependencies = 0;
        for (const tag of Object.keys(buildingData.requiresTags)) {
            if (!regionallyProvidedTags.has(tag)) {
                missingDependencies++;
            }
        }
        return missingDependencies;
    }

    function getBuildingQuotaForPlace(placeType) {
        // Définit un quota "souple" de bâtiments par type de lieu.
        // La génération s'arrêtera avant si la viabilité est atteinte.
        // Ce quota peut être dépassé si un bâtiment essentiel doit être ajouté.
        switch (placeType) {
            case "Hameau":   return 8;
            case "Village":  return 15;
            case "Bourg":    return 25;
            case "Ville":    return 40;
            case "Capitale": return 60;
            default:         return 10;
        }
    }
    

    // --- GESTION DE L'AFFICHAGE ET DES DONNÉES ---
    
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
        updateNavLinksState();
    }
    
    async function displayPlaces() {
        if (!currentRegion) {
            placesContainer.innerHTML = `<p>Aucune région sélectionnée. Retournez à l'étape 1.</p>`;
            paginationControls.style.display = 'none';
            return;
        }

        regionNameDisplay.textContent = `Région : ${currentRegion.name}`;
        
        const needsAutoGeneration = !isManualMode && currentRegion.places.some(p => !p.config || !p.config.buildings || Object.keys(p.config.buildings).length === 0 || !p.config.isValidated);
        
        if (needsAutoGeneration) {
            generationOverlay.style.display = 'flex';
            await new Promise(resolve => setTimeout(resolve, 50));
            currentRegion.places.forEach(place => {
                if (!place.config) place.config = {};
                place.config.isValidated = false;
            });
            generateRegionConfiguration();
            saveData();
        }

        const sortedPlaces = [...currentRegion.places].sort((a, b) => {
            const tierA = PLACE_TYPE_HIERARCHY[a.type] || 99;
            const tierB = PLACE_TYPE_HIERARCHY[b.type] || 99;

            if (tierA !== tierB) {
                return tierA - tierB;
            }
            
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

        if (needsAutoGeneration) {
            generationOverlay.style.display = 'none';
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

        for (const category of orderedCategories) {
            if (place.config.buildings[category] && place.config.buildings[category].length > 0) {
                const isMandatory = category === "Bâtiments Administratifs";
                buildingsHTML += `<div class="building-category"><h3><span class="icon">${categoryIcons[category] || '🏢'}</span>${category}${isMandatory ? '<span class="mandatory-badge">Obligatoire</span>' : ''}</h3><ul class="building-list">${place.config.buildings[category].sort((a,b) => a.name.localeCompare(b.name)).map(b => `<li class="building-item"><div class="name-desc"><div class="name">${b.name}</div><div class="desc">${b.description}</div></div></li>`).join('')}</ul></div>`;
            }
        }
        return `<div class="place-card-header">${headerHTML}</div><div class="place-card-body">${buildingsHTML}</div>`;
    }

    // --- GESTION DU MODE MANUEL ---

    function createManualPlaceCardHTML(place) {
        const categoryIcons = { "Bâtiments Administratifs": "🏛️", "Bâtiments de Production": "🏭", "Bâtiments Indépendants": "🏘️", "Bâtiments Agricoles": "🌾", "Chasse/Nature": "🌲" };
        const allCategoriesForType = Object.keys(BUILDING_DATA[place.type] || {});
        const orderedCategories = [...new Set(["Bâtiments Administratifs", "Bâtiments Agricoles", "Chasse/Nature", "Bâtiments de Production", "Bâtiments Indépendants", ...allCategoriesForType])];
    
        const { buildingCount, jobCount } = calculatePlaceStats(place);
        const statsHTML = `<small>${place.type} &bull; 🏛️ ${buildingCount} Bâtiments &bull; 👥 ${jobCount} Emplois</small>`;
        let headerHTML = `<h2><div>${place.name}${statsHTML}</div></h2>`;
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
    
        buildingsHTML += `<button class="btn-add-building" data-place-id="${place.id}" data-place-type="${place.type}">Ajouter un Bâtiment...</button>`;
        
        return `<div class="place-card-header">${headerHTML}</div><div class="place-card-body">${buildingsHTML}</div>`;
    }
    
    function handleManualModeClick() {
        if (confirm("Passer en mode manuel ? La configuration actuelle des bâtiments sera effacée. Les bâtiments administratifs seront ajoutés par défaut et sont obligatoires.")) {
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
    
        // ÉTAPE 1: Construire les listes pour les bâtiments natifs de ce lieu.
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
    
        // ÉTAPE 2: Déterminer si des recommandations exceptionnelles sont nécessaires.
        // On les montre SEULEMENT si AUCUN lieu dans la région ne peut fournir une solution native.
        let anyNativeRecommendationExistsInRegion = false;
        if (unmetRegionalTags.size > 0) {
            for (const p of currentRegion.places) {
                const buildingsForPlaceType = BUILDING_DATA[p.type] || {};
                for (const category in buildingsForPlaceType) {
                    for (const buildingName in buildingsForPlaceType[category]) {
                        const buildingData = buildingsForPlaceType[category][buildingName];
                        if (buildingData.providesTags.some(tag => unmetRegionalTags.has(tag))) {
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
    
        // ÉTAPE 3: Construire la liste des recommandations exceptionnelles si applicable.
        if (showExceptionalRecommendations && unmetRegionalTags.size > 0) {
            for (const buildingType in BUILDING_DATA) {
                if (buildingType === placeType) continue; 
    
                const availableBuildings = BUILDING_DATA[buildingType];
                for (const category in availableBuildings) {
                    if (category === "Bâtiments Administratifs") continue;
    
                    for (const buildingName in availableBuildings[category]) {
                        if (currentBuildingNames.has(buildingName)) continue;
                        
                        const data = availableBuildings[category][buildingName];
                        const providesCriticalTag = data.providesTags.some(tag => unmetRegionalTags.has(tag));
    
                        if (providesCriticalTag) {
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
    
        // ÉTAPE 4: NOUVEL ORDRE D'ASSEMBLAGE de la modale.
        let finalContentHTML = '';
        
        if (nativeRecommendedHTML) {
            finalContentHTML += `<h3>Bâtiments Recommandés (Natifs)</h3>
                                 <p class="desc">Ces bâtiments produisent des ressources manquantes dans votre région.</p>
                                 ${nativeRecommendedHTML}`;
        }
    
        // Les recommandations exceptionnelles viennent ici, si elles doivent être affichées.
        if (showExceptionalRecommendations && exceptionalRecommendedHTML) {
            finalContentHTML += `<hr><h3>Recommandations Exceptionnelles</h3>
                                 <p class="desc">Aucun lieu dans votre région ne peut produire nativement certaines ressources manquantes. Les bâtiments suivants sont suggérés pour combler ce manque critique.</p>
                                 ${exceptionalRecommendedHTML}`;
        }
    
        if (otherNativeHTML) {
             if (finalContentHTML) finalContentHTML += '<hr>'; // Ajoute un séparateur seulement si quelque chose précède.
            finalContentHTML += `<h3>Autres Bâtiments Disponibles (Natifs)</h3>
                                 ${otherNativeHTML}`;
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

    // --- GESTION DE LA VALIDATION MANUELLE ---
    
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
                                place: p,
                                buildingName: b.name,
                                requiredTag: tag,
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
            const providers = allProviders.get(req.requiredTag);
            let isValid = providers && providers.length > 0;
    
            if (!isValid) {
                isAllValid = false;
                hasErrors = true;
                unmetRegionalTags.add(req.requiredTag);
    
                const sourceText = "Source introuvable !";
                errorsHTML += `
                    <li class="status-invalid">
                        <div>
                            <strong>${req.buildingName}</strong> (à ${req.place.name}) requiert <strong>${req.requiredTag}</strong>.
                            <br><small><em>${sourceText}</em></small>
                        </div>
                    </li>`;
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

    // --- GESTION DES MODALES D'ANALYSE ---
    function openAnalysisModal(placeId) {
        const place = currentRegion.places.find(p => p.id == placeId);
        if (!place) return;

        analysisModalTitle.textContent = `Analyse de ${place.name} (${place.type})`;
        
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
            const provided = getTagsForPlace(place, 'providesTags');
            provided.forEach(tag => {
                if (!providersMap.has(tag)) providersMap.set(tag, []);
                if (!providersMap.get(tag).some(p => p.name === place.name)) {
                     providersMap.get(tag).push({name: place.name, id: place.id, coords: place.coords});
                }
            });
        });
        return providersMap;
    }
    
    function getClosestProviderInfo(requiredTag, currentPlace, allPlaces, regionalProviders) {
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
        const orderedBuildings = [];
        if (!place.config.buildings) return '<p>Pas de bâtiments à analyser.</p>';

        for (const category in place.config.buildings) {
            for (const building of place.config.buildings[category]) {
                orderedBuildings.push(building);
            }
        }
        orderedBuildings.sort((a,b) => a.name.localeCompare(b.name));

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
                    if (placeProvides.has(tag)) {
                        return `${tag} ✅ (local)`;
                    }
                    const providerInfo = getClosestProviderInfo(tag, place, currentRegion.places, regionalProviders);
                    if (providerInfo.isMet) {
                        if (providerInfo.distance <= requiredDist) {
                            return `${tag} ✅ (import: ${providerInfo.providerName} à ${Math.round(providerInfo.distance)}km)`;
                        } else {
                            return `${tag} ✅ (import lointain: ${providerInfo.providerName} à <strong>${Math.round(providerInfo.distance)}km</strong>, surcoût)`;
                        }
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
                const providerInfo = getClosestProviderInfo(tag, place, currentRegion.places, regionalProviders);
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

    // --- FONCTIONS DE VALIDATION ET NAVIGATION ---
    function checkAllPlacesValidated() {
        if (!currentRegion || !currentRegion.places || currentRegion.places.length === 0) return false;
        if (isManualMode) {
            return !validateAllBtn.disabled;
        }
        return currentRegion.places.every(place => place.config && place.config.isValidated === true);
    }

    function updateNavLinksState() {
        const isStep3Ready = checkAllPlacesValidated();
        if (isStep3Ready) {
            navStep3.classList.remove('nav-disabled');
        } else {
            navStep3.classList.add('nav-disabled');
        }
    }
    
    function handleValidateAll() {
        if (isManualMode) {
             if (validateAllBtn.disabled) return alert("Impossible de valider : tous les prérequis ne sont pas satisfaits.");
             if (confirm("La configuration est valide. Voulez-vous la finaliser et passer à la simulation ?")) {
                currentRegion.places.forEach(place => place.config.isValidated = true);
                saveData();
                validationModal.showModal();
                setTimeout(() => { window.location.href = "step3.html"; }, 2500);
            }
        } else { 
            if (!currentRegion || currentRegion.places.length === 0) return alert("Il n'y a aucun lieu à valider.");
            if (currentRegion.places.every(p => p.config.isValidated)) { 
                 window.location.href = 'step3.html';
                 return;
            }
            if (confirm("Valider la configuration auto de TOUS les lieux et passer à la simulation ?")) {
                currentRegion.places.forEach(place => place.config.isValidated = true);
                saveData();
                validationModal.showModal();
                setTimeout(() => { window.location.href = "step3.html"; }, 2500);
            }
        }
    }

    // --- INITIALISATION ---
    function init() {
        loadData();
        displayPlaces();
        updateNavLinksState();
        
        rerollRegionBtn.addEventListener('click', () => {
            if (confirm("Relancer la génération automatique ? La configuration actuelle (manuelle ou auto) sera effacée.")) {
                currentPage = 1; 
                isManualMode = false;
                statusPanel.classList.add('hidden');
                validateAllBtn.disabled = false;
                if(currentRegion) {
                    currentRegion.places.forEach(p => { 
                        p.config = { buildings: {}, isValidated: false };
                    });
                }
                displayPlaces();
                saveData();
            }
        });
        manualConfigBtn.addEventListener('click', handleManualModeClick);
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