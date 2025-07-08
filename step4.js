/**
 * EcoSimRPG - step4.js
 * Moteur principal de la simulation.
 * VERSION 15.0 - Amélioration des journaux d'événements
 * - Les naissances sont désormais enregistrées dans l'historique des parents.
 * - L'attribution d'un titre dynastique est enregistrée comme un événement.
 * - La perte d'un ami (par décès) est ajoutée à l'historique du personnage survivant.
 * - Le passage à l'âge adulte (âge de travailler) est enregistré comme une étape de vie.
 */
document.addEventListener('DOMContentLoaded', () => {

    // --- CONSTANTES & CONFIGURATION ---
    const STORAGE_KEY = 'ecoSimRPG_map_data';
    const LAST_REGION_KEY = 'ecoSimRPG_last_region_id';
    const BUILDING_DATA = window.EcoSimData.buildings;
    const RACES_DATA = window.EcoSimData.racesData;
    const TICK_SPEEDS = { 1: 1000, 2: 500, 3: 250, 4: 100, 5: 25 }; // ms par tick

    // --- SÉLECTEURS DOM ---
    const startSimBtn = document.getElementById('start-sim-btn');
    const pauseSimBtn = document.getElementById('pause-sim-btn');
    const resetSimBtn = document.getElementById('reset-sim-btn');
    const speedControl = document.getElementById('speed-control');
    const speedDisplay = document.getElementById('speed-display');
    const currentDateDisplay = document.getElementById('current-date');
    const globalPopulationDisplay = document.getElementById('global-population');
    const globalFamiliesDisplay = document.getElementById('global-families');
    
    const locationTabs = document.getElementById('location-tabs');
    const characterSearchInput = document.getElementById('character-search');
    const searchResultsContainer = document.getElementById('search-results');
    const familySelector = document.getElementById('family-selector');
    const familyInfluenceValue = document.getElementById('family-influence-value');
    
    const eventLog = document.getElementById('event-log');
    const eventLogFamilyTitle = document.getElementById('event-log-family-title');

    const familyTreeDisplayAreaWrapper = document.getElementById('family-tree-display-area-wrapper');
    const familyTreeDisplayArea = document.getElementById('family-tree-display-area');
    const characterDetailsModal = document.getElementById('character-details-modal');
    
    // --- ÉTAT DE LA SIMULATION ---
    let regions = [];
    let currentRegion = null;
    let simulationState = {};
    let selectedLocationId = null;
    let selectedFamilyId = null;
    let isPanningTree = false;
    let startPanX, startPanY, scrollLeftStart, scrollTopStart;
    let treeZoomLevel = 1.0;
    let initialSimulationData = null;
let lastEventLogTick = -1;
let lastEventLogViewId = null;

    // --- NOUVEAU : GESTION DE LA NAVIGATION ---
    /**
     * Met à jour l'état (activé/désactivé) de tous les liens de navigation principaux.
     * @param {object | null} region - L'objet de la région actuelle.
     */
    function updateAllNavLinksState(region) {
        const navStep2 = document.getElementById('nav-step2');
        const navStep3 = document.getElementById('nav-step3');
        const navStep4 = document.getElementById('nav-step4');
        const navStep5 = document.getElementById('nav-step5');

        // Étape 2: Doit avoir une région avec au moins un lieu.
        const isStep2Ready = region && region.places && region.places.length > 0;
        if (navStep2) {
            if (isStep2Ready) navStep2.classList.remove('nav-disabled');
            else navStep2.classList.add('nav-disabled');
        }

        // Étape 3: Tous les lieux de l'étape 2 doivent être marqués comme valides.
        const isStep3Ready = isStep2Ready && region.places.every(place => place.config && place.config.isValidated === true);
        if (navStep3) {
            if (isStep3Ready) navStep3.classList.remove('nav-disabled');
            else navStep3.classList.add('nav-disabled');
        }

        // Étape 4 & 5: Au moins un lieu doit avoir une population générée (depuis l'étape 3).
        const isStep4Ready = isStep3Ready && region.places.some(place => place.demographics && place.demographics.population.length > 0);
        if (navStep4) {
            if (isStep4Ready) navStep4.classList.remove('nav-disabled');
            else navStep4.classList.add('nav-disabled');
        }
        if (navStep5) {
            if (isStep4Ready) navStep5.classList.remove('nav-disabled'); // L'étape 5 est débloquée avec la 4.
            else navStep5.classList.add('nav-disabled');
        }
    }


// --- FONCTIONS DE LOG ---
function logEvent(message, type = 'system', details = {}) {
    const event = {
        message, type,
        year: simulationState.currentYear,
        month: simulationState.currentMonth,
        tick: simulationState.currentTick, // Ajout de cette ligne
        familyId: details.familyId || null,
        personId: details.personId || null,
    };
    simulationState.log.unshift(event); 
    if (simulationState.log.length > 5000) { 
        simulationState.log.pop();
    }
}

function updateEventLogUI() {
    const currentViewId = selectedFamilyId || 'global';

    // Si la vue a changé (ex: passage de Global à Famille), on vide tout et on rafraîchit.
    if (currentViewId !== lastEventLogViewId) {
        eventLog.innerHTML = '';
        lastEventLogTick = -1; // Réinitialise le compteur de ticks
        lastEventLogViewId = currentViewId;
    }

    let allRelevantEvents;
    // On filtre les événements pertinents pour la vue actuelle
    if (selectedFamilyId) {
        const family = currentRegion.places.flatMap(p => p.demographics.families).find(f => f.id === selectedFamilyId);
        eventLogFamilyTitle.textContent = `Famille ${family?.name || 'Inconnue'}`;
        allRelevantEvents = simulationState.log.filter(e => e.familyId === selectedFamilyId);
    } else {
        eventLogFamilyTitle.textContent = 'Journal Global';
        allRelevantEvents = simulationState.log.filter(e => e.type === 'system' || !e.familyId);
    }

    // On ne sélectionne que les événements qui n'ont pas encore été affichés
    const newEvents = allRelevantEvents.filter(e => e.tick > lastEventLogTick);

    if (newEvents.length > 0) {
        // On met à jour le dernier tick affiché avec le plus récent des nouveaux événements
        lastEventLogTick = newEvents[0].tick;

        // On ajoute les nouveaux événements en haut de la liste (prepend)
        // On parcourt la liste à l'envers pour que les événements apparaissent dans l'ordre chronologique
        for (let i = newEvents.length - 1; i >= 0; i--) {
            const event = newEvents[i];
            const li = document.createElement('li');
            li.className = `event-${event.type}`;
            li.innerHTML = `<strong>[An ${event.year}]</strong> ${event.message}`;
            eventLog.prepend(li); // C'est la méthode clé qui évite le clignotement
        }
    }

    // Cas spécial: si le journal est vide (1er chargement), on le remplit.
    if (eventLog.children.length === 0 && allRelevantEvents.length > 0) {
        const eventsToShow = allRelevantEvents.slice(0, 200);
        if (eventsToShow.length > 0) {
            lastEventLogTick = eventsToShow[0].tick;
        }
        eventsToShow.forEach(event => {
            const li = document.createElement('li');
            li.className = `event-${event.type}`;
            li.innerHTML = `<strong>[An ${event.year}]</strong> ${event.message}`;
            eventLog.appendChild(li);
        });
    }

    // On s'assure que le journal ne dépasse pas une certaine taille pour garder de bonnes performances
    const maxLogEntries = 200;
    while (eventLog.children.length > maxLogEntries) {
        eventLog.removeChild(eventLog.lastChild);
    }
}

    // --- FONCTIONS DE SIMULATION PRINCIPALES ---
    function mainLoop() {
        if (!simulationState.isRunning) return;

        if (simulationState.currentYear >= 60) {
            pauseSimulation();
            logEvent('🏁 Simulation terminée après 60 ans.', 'system');
            alert('La simulation est terminée car elle a atteint sa limite de 60 ans.');
            startSimBtn.disabled = true;
            updateEventLogUI();
            return;
        }

        simulationState.currentTick++;
        simulationState.currentMonth++;
        if (simulationState.currentMonth > 12) {
            simulationState.currentMonth = 1;
            simulationState.currentYear++;
        }
        updateDateUI();
        
        handleProductionAndConsumption();
        
        const allPopulation = currentRegion.places.flatMap(p => p.demographics.population);
        const allFamilies = currentRegion.places.flatMap(p => p.demographics.families);

        const rulers = allPopulation.filter(p => p.isAlive && p.job && getJobData(p.job.buildingName, p.job.jobTitle)?.tier === 0);
        const dynastyMemberIds = getRulingDynastyMemberIds(rulers, allPopulation);
        
        const { rulingFamilies } = findRulersAndFamilies(allPopulation, allFamilies);
        
        const allDynastyMembers = getRulingDynastyMemberIds(rulers, allPopulation);

        allPopulation.forEach(person => {
            if (person.isAlive && person.royalTitle && !allDynastyMembers.has(person.id)) {
                const isRuler = rulers.some(r => r.id === person.id);
                if (!isRuler) {
                    delete person.royalTitle;
                }
            }
        });

        rulers.forEach(ruler => {
            applyDynasticTitles(ruler, allPopulation);
        });


        currentRegion.places.forEach(place => {
            const population = place.demographics.population;
            const placeSatisfaction = place.state.satisfaction;

            if (simulationState.currentMonth === 1) {
                population.forEach(p => { 
                    if(p.isAlive) {
                        p.age++; 
                        const raceData = RACES_DATA.races[p.race];
                        if (raceData && p.age === raceData.ageTravail) {
                            logEvent(`💼 ${p.firstName} ${p.lastName} a atteint l'âge de travailler.`, 'system', { familyId: p.familyId, personId: p.id });
                        }
                    }
                });
            }
            
            population.forEach(person => {
                if (person.isAlive && person.job) {
                    person.totalMonthsWorked = (person.totalMonthsWorked || 0) + 1;
                }

                if (person.status === 'En congé maternité' && person.maternityLeaveEndTick && simulationState.currentTick >= person.maternityLeaveEndTick) {
                    person.status = 'Actif';
                    person.maternityLeaveEndTick = null;
                    logEvent(`💼 ${person.firstName} ${person.lastName} est de nouveau disponible pour travailler après son congé de maternité.`, 'system', { familyId: person.familyId, personId: person.id });
                }
            });
            
            handleSocialInteractions(population, place);
            handleRetirement(population, place);
            handleDeaths(population, place, placeSatisfaction);
            handleMarriages(population, place, dynastyMemberIds);
            handlePregnancyAndBirths(population, place, placeSatisfaction);
            
            handleStatAndPrestigeGrowth(allPopulation, rulingFamilies, dynastyMemberIds);

            handlePromotionsAndJobChanges(population, place, dynastyMemberIds);
            assignJobs(population, place, dynastyMemberIds);
        });

        if (simulationState.currentTick % 5 === 0) {
            handleMigration(dynastyMemberIds);
        }
        
        updateGlobalStats();
        updateLocationPopulationSummary();
        if (selectedFamilyId) {
             displaySelectedFamilyTree();
             updateEventLogUI();
        }
        saveData();
    }
    
    function handleProductionAndConsumption() {
        currentRegion.places.forEach(place => {
            place.state.production = {};
            if (place.config && place.config.buildings) {
                Object.values(place.config.buildings).flat().forEach(building => {
                    const buildingData = getBuildingData(building.name);
                    if (buildingData && buildingData.providesTags) {
                        buildingData.providesTags.forEach(tag => {
                            place.state.production[tag] = (place.state.production[tag] || 0) + 1;
                        });
                    }
                });
            }
        });

        currentRegion.places.forEach(place => {
            place.state.consumption = {};
            place.state.shortages = [];
            let totalNeeds = 0;
            let metNeeds = 0;

            if (place.config && place.config.buildings) {
                Object.values(place.config.buildings).flat().forEach(building => {
                    const buildingData = getBuildingData(building.name);
                    if (buildingData && buildingData.requiresTags) {
                        Object.keys(buildingData.requiresTags).forEach(tag => {
                            totalNeeds++;
                            place.state.consumption[tag] = (place.state.consumption[tag] || 0) + 1;
                            
                            if (place.state.production[tag] && place.state.production[tag] > 0) {
                                 place.state.production[tag]--;
                                 metNeeds++;
                            } else {
                                let imported = false;
                                for (const otherPlace of currentRegion.places) {
                                    if (otherPlace.id !== place.id && otherPlace.state.production[tag] && otherPlace.state.production[tag] > 0) {
                                        otherPlace.state.production[tag]--;
                                        metNeeds++;
                                        imported = true;
                                        break;
                                    }
                                }
                                if (!imported) {
                                    place.state.shortages.push(tag);
                                }
                            }
                        });
                    }
                });
            }
            
            const satisfactionRatio = totalNeeds > 0 ? (metNeeds / totalNeeds) : 1;
            place.state.satisfaction = Math.round((place.state.satisfaction * 0.9) + (satisfactionRatio * 100 * 0.1));
            place.state.surpluses = Object.keys(place.state.production).filter(tag => place.state.production[tag] > 0);
        });
    }
    
    function handleMigration(dynastyMemberIds) {
        const allAvailableJobsByPlace = new Map();
        currentRegion.places.forEach(p => allAvailableJobsByPlace.set(p.id, getAvailableJobs(p)));

        const allUnemployed = [];
        currentRegion.places.forEach(place => {
            const unemployed = place.demographics.population.filter(p => 
                p.isAlive && 
                !p.job &&
                p.status === 'Actif' && 
                p.age >= RACES_DATA.races[p.race].ageTravail &&
                !dynastyMemberIds.has(p.id)
            );
            unemployed.forEach(p => allUnemployed.push({ person: p, sourcePlace: place }));
        });

        if (allUnemployed.length === 0) return;

        const personToMoveData = allUnemployed[Math.floor(Math.random() * allUnemployed.length)];
        const { person, sourcePlace } = personToMoveData;
        
        let bestOffer = { destination: null, job: null, score: 0 };
        for (const destinationPlace of currentRegion.places) {
            if (destinationPlace.id === sourcePlace.id) continue;
            const availableJobs = allAvailableJobsByPlace.get(destinationPlace.id);
            if (availableJobs.length > 0) {
                const distance = axialDistance(sourcePlace.coords, destinationPlace.coords) * (currentRegion.scale || 10);
                const satisfaction = destinationPlace.state.satisfaction;
                const score = (satisfaction / Math.max(distance, 1)) * Math.random(); 
                if (score > bestOffer.score) {
                    bestOffer = {
                        destination: destinationPlace,
                        job: availableJobs[0],
                        score: score
                    };
                }
            }
        }

        if (bestOffer.destination) {
            const { destination, job } = bestOffer;
            const sourcePop = sourcePlace.demographics.population;
            const personIndex = sourcePop.findIndex(p => p.id === person.id);
            if (personIndex > -1) sourcePop.splice(personIndex, 1);
            
            person.locationId = destination.id;
            person.job = { locationId: destination.id, buildingName: job.buildingName, jobTitle: job.jobTitle };
            destination.demographics.population.push(person);

            const family = sourcePlace.demographics.families.find(f => f.id === person.familyId);
            if (family) {
                const memberIndex = family.memberIds.indexOf(person.id);
                if (memberIndex > -1) family.memberIds.splice(memberIndex, 1);
                if (family.memberIds.length === 0) {
                    const familyIndex = sourcePlace.demographics.families.findIndex(f => f.id === family.id);
                    if(familyIndex > -1) sourcePlace.demographics.families.splice(familyIndex, 1);
                }
            }
            const newFamily = {
                 id: `fam_mig_${Date.now()}_${Math.random()}`, name: person.lastName, locationId: destination.id, memberIds: [person.id], isCustom: false 
            };
            destination.demographics.families.push(newFamily);
            
            const oldFamilyId = person.familyId;
            person.familyId = newFamily.id;
            
            const message = `✈️ ${person.firstName} ${person.lastName} a migré de ${sourcePlace.name} à ${destination.name} pour un poste de ${job.jobTitle}.`;
            logEvent(message, 'migration', { familyId: oldFamilyId });
            logEvent(message, 'migration', { familyId: newFamily.id, personId: person.id });
        }
    }
    
function handleRetirement(population, place) {
    population.forEach(person => {
        if (!person.isAlive || !person.job || person.status === 'Retraité(e)') return;

        const raceData = RACES_DATA.races[person.race];
        if (!raceData) return;

        const jobData = getJobData(person.job.buildingName, person.job.jobTitle);
        if (!jobData || jobData.tier === undefined) return;

        // --- NOUVELLE LOGIQUE DE RETRAITE ---
        const jobTier = jobData.tier;
        const lifespan = raceData.esperanceVieMax;

        let retirementAge = -1;

        // Les dirigeants de Tiers 0 ne prennent pas leur retraite de cette manière.
        if (jobTier === 0) return;

        // On définit l'âge de la retraite en fonction de la pénibilité (Tiers)
        // Vous pouvez ajuster ces pourcentages comme vous le souhaitez.
        switch (jobTier) {
            case 1: // Emplois de prestige (Nobles, etc.)
                retirementAge = Math.floor(lifespan * 0.85); // Retraite à 85% de l'espérance de vie
                break;
            case 2: // Emplois intellectuels/de gestion (Marchands, Clercs...)
                retirementAge = Math.floor(lifespan * 0.80); // Retraite à 80%
                break;
            case 3: // Artisans qualifiés
                retirementAge = Math.floor(lifespan * 0.75); // Retraite à 75%
                break;
            case 4: // Travailleurs manuels, basse qualification
            case 5: // Emplois les plus basiques
                retirementAge = Math.floor(lifespan * 0.70); // Retraite à 70%
                break;
            default: // Si un Tiers n'est pas reconnu, on garde une valeur par défaut
                retirementAge = Math.floor(lifespan * 0.99);
                break;
        }
        // --- FIN DE LA NOUVELLE LOGIQUE ---


        if (retirementAge > 0 && person.age >= retirementAge) {
            const oldJobTitle = person.job.jobTitle;
            person.lastJobTitle = oldJobTitle; // Sauvegarde du dernier métier
            person.job = null;
            person.status = 'Retraité(e)';
            logEvent(`🧘 ${person.firstName} ${person.lastName} a pris sa retraite de son poste de ${oldJobTitle} à ${person.age} ans.`, 'system', { familyId: person.familyId, personId: person.id });
        }
    });
}

    function getWeightedDesiredChildren() {
        const weights = [ 0, 1, 1, 2, 2, 2, 3, 3 ];
        const randomIndex = Math.floor(Math.random() * weights.length);
        return weights[randomIndex];
    }
    
function applyDynasticTitles(ruler, population) {
    const allPopulation = population;

    delete ruler.royalTitle;

    const assignTitle = (person, title) => {
        if (person && person.isAlive && person.royalTitle !== title) {
            const oldTitle = person.royalTitle || (person.job ? person.job.jobTitle : 'sans statut');
            person.royalTitle = title;
            person.job = null;
            logEvent(`👑 ${person.firstName} ${person.lastName} a reçu le titre de "${title}", quittant son ancien statut de "${oldTitle}".`, 'social', { familyId: person.familyId, personId: person.id });
        }
    };
    
    // 1. Conjoint
    const spouse = getPersonById(ruler.spouseId, allPopulation);
    if (spouse) assignTitle(spouse, 'Famille Gouvernante');

    // 2. Parents
    const parents = getParents(ruler, allPopulation);
    parents.forEach(parent => {
        if (parent && parent.isAlive && getJobData(parent.job?.buildingName, parent.job?.jobTitle)?.tier !== 0) {
            assignTitle(parent, parent.gender === 'Homme' ? 'Patriarche' : 'Matriarche');
            const parentSpouse = getPersonById(parent.spouseId, allPopulation);
            if (parentSpouse && !parents.some(p => p.id === parentSpouse.id)) {
                assignTitle(parentSpouse, 'Famille Gouvernante');
            }
        }
    });

    // 3. Enfants et Petits-Enfants
    getChildren(ruler, allPopulation).forEach(child => {
        if (child && child.isAlive) {
            assignTitle(child, child.gender === 'Homme' ? 'Héritier' : 'Héritière');
            const childSpouse = getPersonById(child.spouseId, allPopulation);
            if(childSpouse) assignTitle(childSpouse, 'Famille Gouvernante');
            
            getChildren(child, allPopulation).forEach(grandChild => {
                if (grandChild && grandChild.isAlive) {
                    assignTitle(grandChild, 'Noble de la Cour');
                    const grandChildSpouse = getPersonById(grandChild.spouseId, allPopulation);
                    if(grandChildSpouse) assignTitle(grandChildSpouse, 'Famille Gouvernante');
                }
            });
        }
    });

    // 4. Frères/Sœurs et leurs descendants
    getSiblings(ruler, allPopulation).forEach(sibling => {
        if (sibling && sibling.isAlive) {
            assignTitle(sibling, sibling.gender === 'Homme' ? 'Frère du pouvoir' : 'Sœur du pouvoir');
            const siblingSpouse = getPersonById(sibling.spouseId, allPopulation);
            if(siblingSpouse) assignTitle(siblingSpouse, 'Famille Gouvernante');
            
            getChildren(sibling, allPopulation).forEach(nephew => {
                if (nephew && nephew.isAlive) {
                    assignTitle(nephew, 'Noble de la Cour');
                    const nephewSpouse = getPersonById(nephew.spouseId, allPopulation);
                    if(nephewSpouse) assignTitle(nephewSpouse, 'Famille Gouvernante');
                    
                    getChildren(nephew, allPopulation).forEach(grandNephew => {
                         if (grandNephew && grandNephew.isAlive) {
                            assignTitle(grandNephew, 'Noble de la Cour');
                            const grandNephewSpouse = getPersonById(grandNephew.spouseId, allPopulation);
                            if(grandNephewSpouse) assignTitle(grandNephewSpouse, 'Famille Gouvernante');
                         }
                    });
                }
            });
        }
    });
}

    function handleSuccession(deceasedPerson, place, population) {
        const job = deceasedPerson.job;
        const jobTitle = job.jobTitle;
        const allPopulation = currentRegion.places.flatMap(p => p.demographics.population);

        const inheritanceLaw = place.demographics.inheritanceLaw || 'primogeniture_male';
        logEvent(`📜 La loi de succession à ${place.name} est : ${inheritanceLaw}. Recherche d'un héritier pour ${deceasedPerson.firstName}.`, 'system', { familyId: deceasedPerson.familyId });

        let newRuler = null;

        if (inheritanceLaw === 'elective') {
            const familyMembers = allPopulation.filter(p =>
                p.familyId === deceasedPerson.familyId &&
                p.isAlive &&
                p.age >= RACES_DATA.races[p.race].ageAdulte
            );
            if (familyMembers.length > 0) {
                familyMembers.sort((a, b) => (b.prestige || 0) - (a.prestige || 0));
                newRuler = familyMembers[0];
                logEvent(`👑 Par élection familiale, ${newRuler.firstName} ${newRuler.lastName}, le plus prestigieux, hérite du titre de ${jobTitle}.`, 'system', { familyId: newRuler.familyId, personId: newRuler.id });
            }
        } else {
            function findPrimogenitureHeir(person) {
                if (!person || !person.isAlive || person.familyId !== deceasedPerson.familyId) {
                    return null;
                }

                const isEligible = person.isAlive && person.age >= RACES_DATA.races[person.race].ageAdulte &&
                                (inheritanceLaw === 'primogeniture_absolute' ||
                                    (inheritanceLaw === 'primogeniture_male' && person.gender === 'Homme') ||
                                    (inheritanceLaw === 'primogeniture_female' && person.gender === 'Femme'));
                if (isEligible) {
                    return person;
                }

                const children = getChildren(person, allPopulation)
                    .filter(c => c.isAlive && c.familyId === deceasedPerson.familyId)
                    .sort((a, b) => b.age - a.age);

                for (const child of children) {
                    const heir = findPrimogenitureHeir(child);
                    if (heir) return heir;
                }
                return null;
            }

            const children = getChildren(deceasedPerson, allPopulation)
                .filter(c => c.isAlive && c.familyId === deceasedPerson.familyId)
                .sort((a, b) => b.age - a.age);

            for (const child of children) {
                const heir = findPrimogenitureHeir(child);
                if (heir) {
                    newRuler = heir;
                    break; 
                }
            }

            if (!newRuler) {
                const siblings = getSiblings(deceasedPerson, allPopulation)
                    .filter(s => s.isAlive && s.familyId === deceasedPerson.familyId)
                    .sort((a, b) => b.age - a.age);

                for (const sibling of siblings) {
                    const heir = findPrimogenitureHeir(sibling);
                    if (heir) {
                        newRuler = heir;
                        break;
                    }
                }
            }
            
            if (newRuler) {
                logEvent(`👑 ${newRuler.firstName} ${newRuler.lastName} hérite du titre de ${jobTitle} par la loi de succession.`, 'system', { familyId: newRuler.familyId, personId: newRuler.id });
            }
        }

        if (newRuler) {
            newRuler.job = job;
            newRuler.status = 'Actif';
            delete newRuler.royalTitle;
            applyDynasticTitles(newRuler, allPopulation);
            return;
        }
        
        logEvent(`💀 La lignée de ${deceasedPerson.lastName} semble éteinte ou sans héritier valide. Le pouvoir est vacant.`, 'system', { familyId: deceasedPerson.familyId });

        const allFamiliesInPlace = place.demographics.families;
        const familyScores = allFamiliesInPlace.map(family => {
            const members = family.memberIds.map(id => getPersonById(id, allPopulation)).filter(p => p && p.isAlive);
            if (members.length === 0) return { family, score: -1 };
            const totalPrestige = members.reduce((sum, p) => sum + (p.prestige || 0), 0);
            return { family, score: totalPrestige };
        }).sort((a, b) => b.score - a.score);

        if (familyScores.length > 0 && familyScores[0].score > -1) {
            const newRulingFamily = familyScores[0].family;
            const adultMembers = newRulingFamily.memberIds
                .map(id => getPersonById(id, allPopulation))
                .filter(p => p && p.isAlive && p.age >= RACES_DATA.races[p.race].ageAdulte);

            if (adultMembers.length > 0) {
                adultMembers.sort((a, b) => (b.prestige || 0) - (a.prestige || 0));
                const chosenRuler = adultMembers[0];
                chosenRuler.job = job;
                chosenRuler.status = 'Actif';
                delete chosenRuler.royalTitle;
                logEvent(`👑 La famille ${chosenRuler.lastName}, la plus prestigieuse de ${place.name}, prend le contrôle. ${chosenRuler.firstName} est le nouveau ${jobTitle}.`, 'system', { familyId: chosenRuler.familyId, personId: chosenRuler.id });
                applyDynasticTitles(chosenRuler, allPopulation);
                return;
            }
        }

        logEvent(`Le poste de ${jobTitle} à ${place.name} est vacant et personne n'a pu être désigné pour le moment.`, 'system');
    }
    
    function handleDeaths(population, place, satisfaction) {
        const initialRegion = initialSimulationData.find(r => r.id === currentRegion.id);
        if (!initialRegion) return;
        const initialPlaceData = initialRegion.places.find(p => p.id === place.id);
        if (!initialPlaceData) return; 
    
        const initialPopCount = initialPlaceData.demographics.population.length;
        const currentPopCount = place.demographics.population.filter(p => p.isAlive).length;
        const isOverpopulated = initialPopCount > 0 && currentPopCount > (initialPopCount * 1.50);
        let overpopulationFactor = isOverpopulated ? currentPopCount / (initialPopCount * 1.50) : 1.0;
        
        const familyInfluences = new Map();
        if (isOverpopulated) {
            const allFamilies = place.demographics.families;
            const allPeople = place.demographics.population;
            allFamilies.forEach(family => {
                const influence = family.memberIds
                    .map(id => allPeople.find(p => p.id === id))
                    .filter(Boolean)
                    .reduce((sum, member) => sum + (member.prestige || 0), 0);
                familyInfluences.set(family.id, influence);
            });
        }
    
        population.forEach((person) => {
            if (!person.isAlive) return;
    
            const raceData = RACES_DATA.races[person.race];
            if (!raceData) return;
            const maxLifespan = raceData.esperanceVieMax;
            let causeOfDeath = null;
            let deathEvent = false;
    
            if (isOverpopulated) {
                const familyInfluence = familyInfluences.get(person.familyId) || 0;
                const influenceModifier = 1 / (1 + (familyInfluence / 50)); 
    
                let overpopulationDeathChance = (0.050 * overpopulationFactor) * influenceModifier; 
                if (person.age > maxLifespan * 0.5) {
                    const ageScaling = 1 + 15 * ((person.age - maxLifespan * 0.2) / (maxLifespan * 0.2));
                    overpopulationDeathChance *= ageScaling;
                }
                if (Math.random() < overpopulationDeathChance) {
                    deathEvent = true;
                    causeOfDeath = 'maladie';
                }
            }
    
            if (!deathEvent && person.age > maxLifespan * 0.7) {
                const ageRatio = (person.age - (maxLifespan * 0.7)) / (maxLifespan * 0.3);
                const oldAgeDeathChance = Math.pow(ageRatio, 3) * 0.05;
                if (Math.random() < oldAgeDeathChance) {
                    deathEvent = true;
                    causeOfDeath = 'vieillesse';
                }
            }
    
            if (!deathEvent) {
                const baseDeathChance = 0.0001;
                if (Math.random() < baseDeathChance) {
                    deathEvent = true;
                    causeOfDeath = 'accident';
                }
            }
    
            if (deathEvent) {
                let message = '';
                switch (causeOfDeath) {
                    case 'maladie':
                        message = `💀 ${person.firstName} ${person.lastName} est décédé(e) suite à une maladie à ${place.name} (âge: ${person.age}).`;
                        break;
                    case 'vieillesse':
                        message = `💀 ${person.firstName} ${person.lastName} est mort de vieillesse à ${person.age} ans à ${place.name}.`;
                        break;
                    case 'accident':
                    default:
                        message = `💥 ${person.firstName} ${person.lastName} est mort dans un accident tragique à ${person.age} ans à ${place.name}.`;
                        break;
                }
    
                person.ageAtDeath = person.age;
                person.deathYear = simulationState.currentYear;
                person.deathMonth = simulationState.currentMonth;
                person.causeOfDeath = causeOfDeath;
                
                const jobData = person.job ? getJobData(person.job.buildingName, person.job.jobTitle) : null;
                let finalJobTitle = 'Sans emploi';
                if (jobData) {
                    finalJobTitle = jobData.titre;
                } else if (person.lastJobTitle) {
                    finalJobTitle = person.lastJobTitle;
                } else if (person.royalTitle) {
                    finalJobTitle = person.royalTitle;
                }
                person.jobBeforeDeath = finalJobTitle;
                person.isAlive = false;
                
                if (jobData && jobData.tier === 0) {
                    handleSuccession(person, place, population);
                }
                
                if (person.job) { person.job = null; }

                // Log pour la personne décédée
                logEvent(message, 'death', { familyId: person.familyId, personId: person.id });

                // Log pour les amis survivants
                if (person.friendIds) {
                    person.friendIds.forEach(friendId => {
                        const friend = population.find(f => f.id === friendId);
                        if (friend && friend.isAlive) {
// Nouvelle ligne
const friendMessage = `😢 ${friend.firstName} ${friend.lastName} a appris le décès de son ami(e) ${person.firstName} ${person.lastName}.`;
                            logEvent(friendMessage, 'social', { familyId: friend.familyId, personId: friend.id });
                            if (friend.friendIds) {
                                const index = friend.friendIds.indexOf(person.id);
                                if (index > -1) friend.friendIds.splice(index, 1);
                            }
                        }
                    });
                }
                if (person.acquaintanceIds) {
                    person.acquaintanceIds.forEach(acqId => {
                        const acquaintance = population.find(a => a.id === acqId);
                        if (acquaintance && acquaintance.acquaintanceIds) {
                            const index = acquaintance.acquaintanceIds.indexOf(person.id);
                            if (index > -1) acquaintance.acquaintanceIds.splice(index, 1);
                        }
                    });
                }
            }
        });
    }

    function findBestPartnerForSimulation(person, potentialPartners) {
        let bestPartner = null;
        let highestScore = -1;

        const personJobData = person.job ? getJobData(person.job.buildingName, person.job.jobTitle) : null;
        const personJobTier = personJobData ? personJobData.tier : 5;

        for (const partner of potentialPartners) {
            let currentScore = 0;
            const partnerJobData = partner.job ? getJobData(partner.job.buildingName, partner.job.jobTitle) : null;
            const partnerJobTier = partnerJobData ? partnerJobData.tier : 5;

            currentScore += 50;

            const tierDifference = Math.abs(personJobTier - partnerJobTier);
            if (tierDifference === 0) {
                currentScore += 100;
            } else if (tierDifference === 1) {
                currentScore += 40;
            }
            
            if (person.job && partner.job && person.job.buildingName === partner.job.buildingName) {
                currentScore += 25;
            }
            
            const personPrestige = person.prestige || 0;
            const partnerPrestige = partner.prestige || 0;
            const prestigeDifferenceRatio = Math.abs(personPrestige - partnerPrestige) / Math.max(personPrestige, 1);
            if (prestigeDifferenceRatio < 0.25) {
                currentScore += 30;
            }

            if (currentScore > highestScore) {
                highestScore = currentScore;
                bestPartner = partner;
            }
        }

        return highestScore > 75 ? bestPartner : null;
    }
    
    function handleMarriages(population, place, satisfaction, dynastyMemberIds) {
        const singleMen = population.filter(p => 
            p.isAlive && p.gender === 'Homme' && !p.spouseId && p.hasBeenMarried !== true && p.age >= RACES_DATA.races[p.race].ageAdulte
        );

        let singleWomen = population.filter(p => 
            p.isAlive && p.gender === 'Femme' && !p.spouseId && p.hasBeenMarried !== true && p.age >= RACES_DATA.races[p.race].ageAdulte
        );
            
        if(singleMen.length === 0 || singleWomen.length === 0) return;

        const allPopulationForGenealogy = currentRegion.places.flatMap(p => p.demographics.population);

        singleMen.forEach(man => {
            let marriageChance = 0.1; 
            if(satisfaction < 60) marriageChance *= (satisfaction / 100);

            if (Math.random() < marriageChance) {
                const compatibleRaces = RACES_DATA.compatibilites[man.race] || [];
                
                const forbiddenIds = new Set();

                const descendantMap = getDescendantMap(man, allPopulationForGenealogy);
                descendantMap.forEach((generation, personId) => {
                    if (personId !== man.id) {
                        const person = getPersonById(personId, allPopulationForGenealogy);
                        if (person && person.gender === 'Femme') {
                        forbiddenIds.add(personId);
                        }
                    }
                });

                const parents = getParents(man, allPopulationForGenealogy);
                parents.forEach(parent => {
                    if(parent.gender === 'Femme') forbiddenIds.add(parent.id);
                    getParents(parent, allPopulationForGenealogy)
                        .filter(grandparent => grandparent.gender === 'Femme')
                        .forEach(grandparent => forbiddenIds.add(grandparent.id));
                });

                getSiblings(man, allPopulationForGenealogy).forEach(sibling => forbiddenIds.add(sibling.id));
                
                getUnclesAunts(man, allPopulationForGenealogy)
                    .filter(aunt => aunt.gender === 'Femme')
                    .forEach(aunt => forbiddenIds.add(aunt.id));
        
                getSiblings(man, allPopulationForGenealogy).forEach(sibling => {
                    getChildren(sibling, allPopulationForGenealogy)
                        .filter(niece => niece.gender === 'Femme')
                        .forEach(niece => forbiddenIds.add(niece.id));
                });

                const potentialWives = singleWomen.filter(woman =>
                    !forbiddenIds.has(woman.id) && 
                    Math.abs(man.age - woman.age) <= 10 &&
                    (woman.race === man.race || compatibleRaces.includes(woman.race))
                );

                if (potentialWives.length > 0) {
                    const wife = findBestPartnerForSimulation(man, potentialWives);
                    
                    if (wife) { 
                        const wifeIndexInSingleWomen = singleWomen.findIndex(w => w.id === wife.id);
                        if (wifeIndexInSingleWomen > -1) singleWomen.splice(wifeIndexInSingleWomen, 1);
                        
                        man.spouseId = wife.id;
                        wife.spouseId = man.id;
                        
                        man.hasBeenMarried = true;
                        wife.hasBeenMarried = true;

                        wife.maidenName = wife.lastName;
                        wife.lastName = man.lastName;
                        
                        const oldWifeFamilyId = wife.familyId;
                        
                        const oldFamily = currentRegion.places.flatMap(p => p.demographics.families).find(f => f.id === oldWifeFamilyId);
                        if (oldFamily) {
                            const indexInOldFamily = oldFamily.memberIds.indexOf(wife.id);
                            if (indexInOldFamily > -1) {
                                oldFamily.memberIds.splice(indexInOldFamily, 1);
                                if (oldFamily.memberIds.length === 0) {
                                    const placeOfOldFamily = currentRegion.places.find(p => p.id === oldFamily.locationId);
                                    if (placeOfOldFamily) {
                                        placeOfOldFamily.demographics.families = placeOfOldFamily.demographics.families.filter(f => f.id !== oldFamily.id);
                                    }
                                }
                            }
                        }

                        wife.familyId = man.familyId;
                        const newFamily = currentRegion.places.flatMap(p => p.demographics.families).find(f => f.id === man.familyId);
                        if (newFamily && !newFamily.memberIds.includes(wife.id)) {
                            newFamily.memberIds.push(wife.id);
                        }

                        const manIsDynasty = dynastyMemberIds.has(man.id);
                        const wifeIsDynasty = dynastyMemberIds.has(wife.id);

                        if (manIsDynasty && !wifeIsDynasty) {
                            const oldJobTitle = wife.job ? wife.job.jobTitle : 'aucun';
                            wife.job = null;
                            if (wife.royalTitle !== 'Famille Gouvernante') {
                                wife.royalTitle = 'Famille Gouvernante';
                                logEvent(`💍 En épousant ${man.firstName}, ${wife.firstName} a quitté son poste (${oldJobTitle}) pour rejoindre la "Famille Gouvernante".`, 'social', { familyId: man.familyId, personId: wife.id });
                            }
                        } else if (wifeIsDynasty && !manIsDynasty) {
                            const oldJobTitle = man.job ? man.job.jobTitle : 'aucun';
                            man.job = null;
                            if (man.royalTitle !== 'Famille Gouvernante') {
                                man.royalTitle = 'Famille Gouvernante';
                                logEvent(`💍 En épousant ${wife.firstName}, ${man.firstName} a quitté son poste (${oldJobTitle}) pour rejoindre la "Famille Gouvernante".`, 'social', { familyId: wife.familyId, personId: man.id });
                            }
                        }

                        const message = `💍 ${man.firstName} ${man.lastName} et ${wife.firstName} ${wife.lastName} (née ${wife.maidenName}) se sont mariés à ${place.name}.`;
                        logEvent(message, 'marriage', { familyId: man.familyId, personId: man.id });
                        logEvent(message, 'marriage', { familyId: oldWifeFamilyId, personId: wife.id });
                    }
                }
            }
        });
    }

    function handlePregnancyAndBirths(population, place, satisfaction) {
        population.filter(p => p.isAlive && p.gender === 'Femme' && p.spouseId && !p.isPregnant && p.status !== 'En congé maternité')
            .forEach(woman => {
                const raceData = RACES_DATA.races[woman.race];
                const adultAge = raceData.ageAdulte;
                const fertileAgeMax = raceData.esperanceVieMax * 0.5;
                
                if (woman.age >= adultAge && woman.age <= fertileAgeMax) {
                    const husband = population.find(p => p.id === woman.spouseId);
                    if (!husband) return;

                    if (woman.desiredChildren === undefined) woman.desiredChildren = getWeightedDesiredChildren();
                    if (husband.desiredChildren === undefined) husband.desiredChildren = getWeightedDesiredChildren();
                    
                    const targetChildrenCount = Math.min(woman.desiredChildren, husband.desiredChildren);
                    const currentChildrenCount = woman.childrenIds ? woman.childrenIds.length : 0;

                    if (currentChildrenCount < targetChildrenCount) {
                        const fertileWindow = fertileAgeMax - adultAge;
                        const ageIntoFertility = woman.age - adultAge; 
                        const fertilityMultiplier = Math.max(0, 1 - (ageIntoFertility / fertileWindow));

                        let birthChance = 0.25 * fertilityMultiplier; 
                        
                        if (satisfaction < 70) {
                            birthChance *= (satisfaction / 100);
                        }

                        if (Math.random() < birthChance) {
                            woman.isPregnant = true;
                            woman.pregnancyStart = simulationState.currentTick;
                        }
                    }
                }
            });

        population.filter(p => p.isPregnant && (simulationState.currentTick - p.pregnancyStart) >= RACES_DATA.races[p.race].dureeGestationMois)
            .forEach(mother => {
                mother.isPregnant = false;
                const father = population.find(p => p.id === mother.spouseId);
                if (!father) return;

                let motherJobTier = 5; 
                if (mother.job) {
                    const jobData = getJobData(mother.job.buildingName, mother.job.jobTitle);
                    if (jobData && typeof jobData.tier !== 'undefined') motherJobTier = jobData.tier;
                }

                let stillbirthChance = 0;
                switch (motherJobTier) {
                    case 0: case 1: stillbirthChance = 0; break;
                    case 2: stillbirthChance = 0.02; break; 
                    case 3: stillbirthChance = 0.05; break; 
                    case 4: stillbirthChance = 0.10; break;
                    case 5: stillbirthChance = 0.15; break;
                }

                if (Math.random() < stillbirthChance) {
                    const message = `💔 ${mother.firstName} ${mother.lastName} a tragiquement donné naissance à un enfant mort-né à ${place.name}.`;
                    logEvent(message, 'death', { familyId: mother.familyId, personId: mother.id });
                } else {
                    const childGender = Math.random() > 0.5 ? 'Homme' : 'Femme';
                    const mixedRaceKey = [father.race, mother.race].sort().join('-');
                    const childRace = RACES_DATA.racesMixtes[mixedRaceKey] || father.race;
                    const childRaceData = RACES_DATA.races[childRace];
                    const childFirstName = childGender === 'Homme' ? childRaceData.prenomsM[Math.floor(Math.random() * childRaceData.prenomsM.length)] : childRaceData.prenomsF[Math.floor(Math.random() * childRaceData.prenomsF.length)];
                    const newChild = {
                        id: `person_${Date.now()}_${Math.random()}`, firstName: childFirstName, lastName: father.lastName,
                        race: childRace, gender: childGender, age: 0, isAlive: true, locationId: mother.locationId,
                        familyId: father.familyId, parents: [father.id, mother.id].filter(Boolean), childrenIds: [], isCustom: false, prestige: 0,
                        prestigeBuffer: 0, stats: { intelligence: 5, force: 5, constitution: 5, dexterite: 5, sagesse: 5, charisme: 5 },
                        statsBuffer: { intelligence: 0, force: 0, constitution: 0, dexterite: 0, sagesse: 0, charisme: 0 },
                        status: 'Actif',
                        friendIds: [], acquaintanceIds: [],
                        maxFriends: Math.floor(Math.random() * 5) + 1,
                        maxAcquaintances: Math.floor(Math.random() * 12) + 7,
                        desiredChildren: getWeightedDesiredChildren(),
                        totalMonthsWorked: 0
                    };

                    const fatherInfo = getRulingFamilyInfoForPerson(father, population);
                    const motherInfo = getRulingFamilyInfoForPerson(mother, population);
                    const isFatherRulerOrHeir = (fatherInfo && (fatherInfo.isRuler || fatherInfo.isHeir));
                    const isMotherRulerOrHeir = (motherInfo && (motherInfo.isRuler || motherInfo.isHeir));
                    const isFatherNobleBranch = father.royalTitle === 'Frère du pouvoir' || father.royalTitle === 'Noble de la Cour';
                    const isMotherNobleBranch = mother.royalTitle === 'Sœur du pouvoir' || mother.royalTitle === 'Noble de la Cour';

                    if (isFatherRulerOrHeir || isMotherRulerOrHeir) {
                        newChild.royalTitle = newChild.gender === 'Homme' ? 'Héritier' : 'Héritière';
                    } else if (isFatherNobleBranch || isMotherNobleBranch) {
                        newChild.royalTitle = 'Noble de la Cour';
                    }

                    population.push(newChild);
                    if (!father.childrenIds) father.childrenIds = [];
                    if (!mother.childrenIds) mother.childrenIds = [];
                    father.childrenIds.push(newChild.id);
                    mother.childrenIds.push(newChild.id);

                    const family = currentRegion.places.flatMap(p => p.demographics.families).find(f => f.id === father.familyId);
                    if (family && !family.memberIds.includes(newChild.id)) { family.memberIds.push(newChild.id); }

                    // Log pour l'enfant, la famille, et les parents
                    const birthMessage = `👶 Naissance de ${newChild.firstName} ${newChild.lastName} est né de ${father.firstName} et ${mother.firstName} à ${place.name}.`;
                    logEvent(birthMessage, 'birth', { familyId: father.familyId, personId: newChild.id });
                    
// Nouveau code
const motherMessage = `👶 ${mother.firstName} ${mother.lastName} a donné naissance à ${newChild.firstName}.`;
logEvent(motherMessage, 'birth', { familyId: mother.familyId, personId: mother.id });

const fatherMessage = `👶 ${father.firstName} ${father.lastName} est devenu le père de ${newChild.firstName}.`;
logEvent(fatherMessage, 'birth', { familyId: father.familyId, personId: father.id });
                    
                    if (mother.job) {
                        const jobData = getJobData(mother.job.buildingName, mother.job.jobTitle);
                        if(jobData && jobData.tier > 1) { 
                             const oldJobTitle = mother.job.jobTitle;
                             mother.job = null;
                             mother.status = 'En congé maternité';
                             const leaveDurationInMonths = childRaceData.ageApprentissage * 12;
                             mother.maternityLeaveEndTick = simulationState.currentTick + leaveDurationInMonths;
                             logEvent(`🤱 ${mother.firstName} ${mother.lastName} quitte son poste de ${oldJobTitle} pour élever son enfant.`, 'system', { familyId: mother.familyId, personId: mother.id });
                        }
                    }
                }
            });
    }
    
    function handleStatAndPrestigeGrowth(population, rulingFamilies, dynastyMemberIds) {
        rulingFamilies.forEach(({ ruler, jobData }) => {
            if (!ruler || !jobData || !jobData.gainsMensuels) return;
    
            const gains = jobData.gainsMensuels;
            const descendantMap = getDescendantMap(ruler, population);
    
            descendantMap.forEach((generation, personId) => {
                const person = getPersonById(personId, population);
                if (!person || !person.isAlive) return;
    
                let percentage;
                if (generation <= 1) {
                    percentage = 1.0;
                } else if (generation === 2) {
                    percentage = 0.7;
                } else {
                    percentage = 0.4;
                }
    
                applyGainsToPerson(person, gains, percentage);
            });
        });
    
        population.forEach(person => {
            if (!person.isAlive || dynastyMemberIds.has(person.id)) return;
    
            if (person.desiredChildren === undefined) {
                person.desiredChildren = getWeightedDesiredChildren();
            }
    
            const raceData = RACES_DATA.races[person.race];
    
            if (person.job && person.age >= raceData.ageTravail) {
                const jobData = getJobData(person.job.buildingName, person.job.jobTitle);
                if (jobData && jobData.gainsMensuels) {
                    let ageMultiplier = 1.0;
                    const PEAK_GAIN_AGE = raceData.ageTravail + 20;
                    const DECAY_START_AGE = raceData.esperanceVieMax * 0.7;
                    
                    if (person.age > PEAK_GAIN_AGE) {
                        if (person.age >= DECAY_START_AGE) {
                            const decayProgress = (person.age - DECAY_START_AGE) / (raceData.esperanceVieMax - DECAY_START_AGE);
                            ageMultiplier = Math.max(0, 1.0 - decayProgress);
                        }
                    }

                    let workTimeMultiplier = 1.0;
                    const WORK_DECAY_START_YEARS = 25;
                    const WORK_CEASE_YEARS = 50;
                    const totalYearsWorked = (person.totalMonthsWorked || 0) / 12;

                    if (totalYearsWorked >= WORK_DECAY_START_YEARS) {
                        if (totalYearsWorked >= WORK_CEASE_YEARS) {
                            workTimeMultiplier = 0;
                        } else {
                            const decayRange = WORK_CEASE_YEARS - WORK_DECAY_START_YEARS;
                            const currentDecay = totalYearsWorked - WORK_DECAY_START_YEARS;
                            workTimeMultiplier = Math.max(0, 1.0 - (currentDecay / decayRange));
                        }
                    }
                    
                    const finalMultiplier = ageMultiplier * workTimeMultiplier;

                    const modifiedGains = {
                        prestige: (jobData.gainsMensuels.prestige || 0) * finalMultiplier,
                        stats: {}
                    };
                    for (const stat in jobData.gainsMensuels.stats) {
                        modifiedGains.stats[stat] = (jobData.gainsMensuels.stats[stat] || 0) * finalMultiplier;
                    }
                    applyGainsToPerson(person, modifiedGains, 1.0);
                }
            } 
            else if (person.parents && person.parents.length > 0 && person.age >= raceData.ageApprentissage && person.age < raceData.ageTravail) {
                let parentPrestigeGain = 0;
                let parentStatGains = { intelligence: 0, force: 0, constitution: 0, dexterite: 0, sagesse: 0, charisme: 0 };
                
                person.parents.forEach(parentId => {
                    const parent = getPersonById(parentId, population);
                    if (parent && parent.job) {
                        const jobData = getJobData(parent.job.buildingName, parent.job.jobTitle);
                        if (jobData && jobData.gainsMensuels) {
                            parentPrestigeGain += (jobData.gainsMensuels.prestige || 0) * 0.50;
                            for (const stat in jobData.gainsMensuels.stats) {
                                parentStatGains[stat] += (jobData.gainsMensuels.stats[stat] || 0) * 0.50;
                            }
                        }
                    }
                });
    
                const combinedGains = { prestige: parentPrestigeGain, stats: parentStatGains };
                applyGainsToPerson(person, combinedGains, 1.0);
            }
            // MODIFICATION : Ajout du gain passif pour les chômeurs
            else if (!person.job && !person.royalTitle && person.isAlive && person.age >= raceData.ageTravail) {
                const passiveGain = Math.random() * 0.2; // Gain aléatoire entre 0.1 et 0.3
                const gains = {
                    prestige: passiveGain,
                    stats: {
                        intelligence: passiveGain,
                        force: passiveGain,
                        constitution: passiveGain,
                        dexterite: passiveGain,
                        sagesse: passiveGain,
                        charisme: passiveGain
                    }
                };
                applyGainsToPerson(person, gains, 1.0);
            }
        });
    }
    
    function applyGainsToPerson(person, gains, percentage) {
        if (person.prestigeBuffer === undefined) person.prestigeBuffer = 0;
        if (!person.statsBuffer) person.statsBuffer = { intelligence: 0, force: 0, constitution: 0, dexterite: 0, sagesse: 0, charisme: 0 };
    
        person.prestigeBuffer += (gains.prestige || 0) * percentage;
        if (person.prestigeBuffer >= 1) {
            const gain = Math.floor(person.prestigeBuffer);
            person.prestige = (person.prestige || 0) + gain;
            person.prestigeBuffer -= gain;
        }
    
        if (gains.stats) {
            for (const stat in gains.stats) {
                person.statsBuffer[stat] = (person.statsBuffer[stat] || 0) + (gains.stats[stat] * percentage);
                if (person.statsBuffer[stat] >= 1) {
                    const gain = Math.floor(person.statsBuffer[stat]);
                    if (person.stats) {
                        person.stats[stat] = (person.stats[stat] || 0) + gain;
                        person.statsBuffer[stat] -= gain;
                    }
                }
            }
        }
    }
        
    function handlePromotionsAndJobChanges(population, place, dynastyMemberIds) {
        let availableJobs = getAvailableJobs(place);
        if (availableJobs.length === 0) return;
    
        availableJobs.sort((a, b) => {
            const tierA = getJobData(a.buildingName, a.jobTitle)?.tier ?? 99;
            const tierB = getJobData(b.buildingName, b.jobTitle)?.tier ?? 99;
            return tierA - tierB;
        });
    
        const employedPopulation = population.filter(p =>
            p.isAlive && p.job && p.status === 'Actif' && !dynastyMemberIds.has(p.id)
        );
        if (employedPopulation.length === 0) return;
    
        for (let i = 0; i < availableJobs.length; i++) {
            const vacantJob = availableJobs[i];
            const vacantJobData = getJobData(vacantJob.buildingName, vacantJob.jobTitle);
    
            if (!vacantJobData || vacantJobData.tier === 0) continue;
    
            const candidates = employedPopulation.filter(person => {
                const currentJobData = getJobData(person.job.buildingName, person.job.jobTitle);
                if (!currentJobData) return false;
    
                return currentJobData.tier > vacantJobData.tier &&
                       person.job.buildingName === vacantJob.buildingName &&
                       (person.prestige || 0) >= (vacantJobData.prerequis.prestige || 0);
            });
    
            if (candidates.length > 0) {
                candidates.sort((a, b) => (b.prestige || 0) - (a.prestige || 0));
                const bestCandidate = candidates[0];
    
                const oldJobTitle = bestCandidate.job.jobTitle;
                const oldBuildingName = bestCandidate.job.buildingName;
    
                bestCandidate.job = { locationId: place.id, buildingName: vacantJob.buildingName, jobTitle: vacantJob.jobTitle };
                
                logEvent(`⏫ ${bestCandidate.firstName} ${bestCandidate.lastName} a été promu(e) au poste de ${vacantJob.jobTitle}, quittant son poste de ${oldJobTitle}.`, 'job', { familyId: bestCandidate.familyId, personId: bestCandidate.id });
    
                availableJobs.splice(i, 1);
                i--;
    
                const newlyVacantJob = { buildingName: oldBuildingName, jobTitle: oldJobTitle };
                availableJobs.push(newlyVacantJob);
            }
        }
    }

    function assignJobs(population, place, dynastyMemberIds) {
        const availableJobs = getAvailableJobs(place);
        if (availableJobs.length === 0) {
            return;
        }

        const unemployedAdults = population.filter(p =>
            p.isAlive && !p.job && !p.royalTitle && p.status === 'Actif' && !dynastyMemberIds.has(p.id) && p.age >= RACES_DATA.races[p.race].ageTravail
        ).sort((a, b) => (b.prestige || 0) - (b.prestige || 0));

        unemployedAdults.forEach(person => {
            if (availableJobs.length === 0) return;
            
            const suitableJobIndex = availableJobs.findIndex(job => {
                const jobData = getJobData(job.buildingName, job.jobTitle);
                if (!jobData || !jobData.prerequis) return true;
                if(jobData.tier === 0) return false;

                return (person.prestige || 0) >= (jobData.prerequis.prestige || 0);
            });
    
            if (suitableJobIndex > -1) {
                const [jobToAssign] = availableJobs.splice(suitableJobIndex, 1);
    
                person.job = { locationId: place.id, buildingName: jobToAssign.buildingName, jobTitle: jobToAssign.jobTitle };
                logEvent(`💼 ${person.firstName} ${person.lastName} a été embauché comme ${person.job.jobTitle} à ${place.name}.`, 'job', { familyId: person.familyId, personId: person.id });
            }
        });
    }

    function handleSocialInteractions(population, place) {
        const adults = population.filter(p => p.isAlive && p.age >= RACES_DATA.races[p.race].ageAdulte);
        if (adults.length < 2) return;
    
        const sampleSize = Math.max(10, Math.floor(adults.length * 0.2));
        const sampledAdults = adults.sort(() => 0.5 - Math.random()).slice(0, sampleSize);
    
        const colleaguesByBuilding = {};
        adults.forEach(p => {
            if (p.job) {
                const key = p.job.buildingName;
                if (!colleaguesByBuilding[key]) colleaguesByBuilding[key] = [];
                colleaguesByBuilding[key].push(p);
            }
        });
    
        for (const building in colleaguesByBuilding) {
            const workers = colleaguesByBuilding[building];
            if (workers.length < 2) continue;
            for (let i = 0; i < workers.length; i++) {
                for (let j = i + 1; j < workers.length; j++) {
                    const p1 = workers[i];
                    const p2 = workers[j];
    
                    if (Math.random() < 0.15) {
                        if (p1.acquaintanceIds.length < p1.maxAcquaintances &&
                            p2.acquaintanceIds.length < p2.maxAcquaintances &&
                            !p1.acquaintanceIds.includes(p2.id) && !p1.friendIds.includes(p2.id)) {
                            
                            p1.acquaintanceIds.push(p2.id);
                            p2.acquaintanceIds.push(p1.id);
    
                            const message = `🤝 ${p1.firstName} ${p1.lastName} et ${p2.firstName} ${p2.lastName} ont fait connaissance.`;
                            logEvent(message, 'social', { familyId: p1.familyId, personId: p1.id });
                            logEvent(message, 'social', { familyId: p2.familyId, personId: p2.id });
                        }
                    }
                }
            }
        }
    
        sampledAdults.forEach(person => {
            if (!person.acquaintanceIds || person.acquaintanceIds.length === 0) return;
    
            const acquaintanceToUpgradeId = person.acquaintanceIds[Math.floor(Math.random() * person.acquaintanceIds.length)];
            const acquaintance = adults.find(p => p.id === acquaintanceToUpgradeId);
    
            if (acquaintance && Math.random() < 0.05) {
                 if (person.friendIds.length < person.maxFriends &&
                     acquaintance.friendIds.length < acquaintance.maxFriends) {
                    
                    person.friendIds.push(acquaintance.id);
                    person.acquaintanceIds = person.acquaintanceIds.filter(id => id !== acquaintance.id);
                    
                    acquaintance.friendIds.push(person.id);
                    acquaintance.acquaintanceIds = acquaintance.acquaintanceIds.filter(id => id !== person.id);
    
                    const message = `✨ ${person.firstName} ${person.lastName} et ${acquaintance.firstName} ${acquaintance.lastName} sont maintenant amis.`;
                    logEvent(message, 'social', { familyId: person.familyId, personId: person.id });
                    logEvent(message, 'social', { familyId: acquaintance.familyId, personId: acquaintance.id });
                 }
            }
        });
    
        sampledAdults.forEach(personA => {
            const familyMembers = getFamily(personA, adults);
            if(familyMembers.length === 0) return;
    
            const familyFriendPool = [];
            familyMembers.forEach(member => {
                if(member.friendIds) {
                    member.friendIds.forEach(friendId => {
                         const friend = adults.find(p => p.id === friendId);
                         if(friend && friend.id !== personA.id && !personA.friendIds.includes(friend.id) && !personA.acquaintanceIds.includes(friend.id)) {
                            familyFriendPool.push(friend);
                         }
                    });
                }
            });
    
            if(familyFriendPool.length > 0 && Math.random() < 0.05) {
                const personB = familyFriendPool[Math.floor(Math.random() * familyFriendPool.length)];
                if (personA.acquaintanceIds.length < personA.maxAcquaintances &&
                    personB.acquaintanceIds.length < personB.maxAcquaintances) {
                        
                    personA.acquaintanceIds.push(personB.id);
                    personB.acquaintanceIds.push(personA.id);
    
                    const message = `🤝 ${personA.firstName} ${personA.lastName} et ${personB.firstName} ${personB.lastName} ont fait connaissance par le biais de la famille.`;
                    logEvent(message, 'social', { familyId: personA.familyId, personId: personA.id });
                    logEvent(message, 'social', { familyId: personB.familyId, personId: personB.id });
                }
            }
        });
    }
    
    // --- FONCTIONS UTILITAIRES & UI ---
    function axialDistance(a, b) { if (!a || !b) return Infinity; const dq = a.q - b.q; const dr = a.r - b.r; return (Math.abs(dq) + Math.abs(dr) + Math.abs(-dq - dr)) / 2; }
    function getBuildingData(buildingName) { for (const type in BUILDING_DATA) { for (const category in BUILDING_DATA[type]) { if (BUILDING_DATA[type][category][buildingName]) { return BUILDING_DATA[type][category][buildingName]; } } } return null; }
    function getJobData(buildingName, jobTitle) { const building = getBuildingData(buildingName); if (building && building.emplois) { return building.emplois.find(j => j.titre === jobTitle) || null; } return null; }
    
    function getAvailableJobs(place) {
        if (!place.config || !place.config.buildings) return [];
        const availableJobs = [];
        const filledJobs = place.demographics.population
            .filter(p => p.isAlive && p.job)
            .reduce((acc, p) => {
                const key = `${p.job.buildingName}-${p.job.jobTitle}`;
                acc[key] = (acc[key] || 0) + 1;
                return acc;
            }, {});
    
        Object.values(place.config.buildings).flat().forEach(building => {
            const buildingData = getBuildingData(building.name);
            if (buildingData && buildingData.emplois) {
                buildingData.emplois.forEach(job => {
                    const key = `${building.name}-${job.titre}`;
                    const totalSlots = job.postes;
                    const filledSlots = filledJobs[key] || 0;
                    const availableSlots = totalSlots - filledSlots;
                    for (let i = 0; i < availableSlots; i++) {
                        availableJobs.push({ buildingName: building.name, jobTitle: job.titre });
                    }
                });
            }
        });
        return availableJobs;
    }
    
    function loadData() { const data = localStorage.getItem(STORAGE_KEY); regions = data ? JSON.parse(data) : []; const lastRegionId = localStorage.getItem(LAST_REGION_KEY); if (lastRegionId) { currentRegion = regions.find(r => r.id == lastRegionId) || null; } }
    
    // MODIFICATION : Appel à updateAllNavLinksState dans saveData
    function saveData() { 
        localStorage.setItem(STORAGE_KEY, JSON.stringify(regions)); 
        updateAllNavLinksState(currentRegion);
    }
    function updateDateUI() { currentDateDisplay.textContent = `Mois ${simulationState.currentMonth}, Année ${simulationState.currentYear}`; }

    function updateGlobalStats() {
        if (!currentRegion) return;
        const allLivingPopulation = currentRegion.places.flatMap(place => place.demographics.population.filter(p => p.isAlive));
        const allLivingPopulationIds = new Set(allLivingPopulation.map(p => p.id));
        const allFamilies = currentRegion.places.flatMap(place => place.demographics.families);
        const activeFamilies = allFamilies.filter(family => family.memberIds.some(memberId => allLivingPopulationIds.has(memberId)));
        globalPopulationDisplay.textContent = allLivingPopulation.length;
        globalFamiliesDisplay.textContent = activeFamilies.length;
    }

    function updateLocationPopulationSummary() {
        if (!currentRegion) return;
        const summaryContainer = document.getElementById('location-population-summary');
        if (!summaryContainer) return;

        let summaryHTML = '<h4>Population par Lieu</h4><ul>';
        currentRegion.places.forEach(place => {
            const livingPop = place.demographics.population.filter(p => p.isAlive).length;
            const availableJobs = getAvailableJobs(place);
            const availableJobsCount = availableJobs.length;

            summaryHTML += `<li><strong>${place.name}:</strong> <span>${livingPop} hab. | ${availableJobsCount} poste(s) vacant(s)</span>`;
            if (availableJobsCount > 0) {
                const jobCounts = availableJobs.reduce((acc, job) => {
                    acc[job.jobTitle] = (acc[job.jobTitle] || 0) + 1;
                    return acc;
                }, {});
                summaryHTML += `<ul class="vacant-jobs-list">`;
                for (const [title, count] of Object.entries(jobCounts).sort((a,b) => a[0].localeCompare(b[0]))) {
                    summaryHTML += `<li>- ${title} (${count})</li>`;
                }
                summaryHTML += `</ul>`;
            }
            summaryHTML += `</li>`;
        });
        summaryHTML += '</ul>';
        summaryContainer.innerHTML = summaryHTML;
    }
    
    function updateLocationTabs() {
        if (!currentRegion) return;
        locationTabs.innerHTML = '';
        currentRegion.places.forEach(place => {
            const tab = document.createElement('button');
            tab.className = 'location-tab';
            tab.textContent = place.name;
            tab.dataset.placeId = place.id;
            if (place.id === selectedLocationId) {
                tab.classList.add('active');
            }
            tab.addEventListener('click', () => {
                selectedLocationId = place.id;
                selectedFamilyId = null;
                characterSearchInput.value = '';
                updateLocationTabs();
                updateFamilySelector();
                displaySelectedFamilyTree();
                updateEventLogUI();
            });
            locationTabs.appendChild(tab);
        });
    }

    function updateFamilySelector() {
        if (!selectedLocationId) {
            familySelector.innerHTML = '<option value="">-- Choisissez un lieu --</option>';
            return;
        }
        
        const place = currentRegion.places.find(p => p.id === selectedLocationId);
        if (!place) return;

        const allLivingPopulationIds = new Set(currentRegion.places.flatMap(p => p.demographics.population).filter(p => p.isAlive).map(p => p.id));

        const sortedFamilies = place.demographics.families
            .filter(f => f.memberIds.some(id => allLivingPopulationIds.has(id)))
            .sort((a, b) => a.name.localeCompare(b.name));

        familySelector.innerHTML = '<option value="">-- Aucune --</option>';
        sortedFamilies.forEach(family => {
            const option = document.createElement('option');
            option.value = family.id;
            option.textContent = `${family.name}`;
            familySelector.appendChild(option);
        });

        familySelector.value = selectedFamilyId || "";
    }

    function displaySelectedFamilyTree() {
        if (!selectedFamilyId) {
            familyTreeDisplayArea.innerHTML = '<p>Sélectionnez une famille pour afficher son arbre généalogique.</p>';
            familyInfluenceValue.textContent = 'N/A';
            return;
        }
    
        const allPopulation = currentRegion.places.flatMap(p => p.demographics.population);
        const family = currentRegion.places.flatMap(p => p.demographics.families).find(f => f.id === selectedFamilyId);
    
        if (!family) {
            familyTreeDisplayArea.innerHTML = `<p>Erreur : Famille introuvable.</p>`;
            familyInfluenceValue.textContent = 'Erreur';
            return;
        }
    
        const familyMemberMap = new Map();
        family.memberIds.forEach(id => {
            const person = allPopulation.find(p => p.id === id);
            if (person) familyMemberMap.set(id, person);
        });

        const allFamilyMembers = Array.from(familyMemberMap.values());
        const totalInfluence = allFamilyMembers.reduce((sum, member) => sum + (member.prestige || 0), 0);
        familyInfluenceValue.textContent = totalInfluence.toFixed(2);
    
        if (allFamilyMembers.length === 0) {
            familyTreeDisplayArea.innerHTML = '<p>Aucun membre trouvé pour cette famille.</p>';
            return;
        }
    
        const mainTreeRoots = allFamilyMembers.filter(p => {
            if (!p.parents || p.parents.length === 0) return true;
            return !p.parents.some(parentId => allFamilyMembers.find(m => m.id === parentId));
        }).sort((a, b) => (b.age || 0) - (a.age || 0));

        if (mainTreeRoots.length === 0 && allFamilyMembers.length > 0) {
            familyTreeDisplayArea.innerHTML = renderTreeHTML(buildGenealogyTree(allFamilyMembers[0].id, allPopulation, new Set()), allPopulation);
        } else {
            let treeHTML = '<ul>';
            const processedMainTree = new Set();
            mainTreeRoots.forEach(rootPerson => {
                if (processedMainTree.has(rootPerson.id)) return;
                const treeData = buildGenealogyTree(rootPerson.id, allPopulation, processedMainTree);
                if (treeData) {
                    treeHTML += renderTreeHTML(treeData, allPopulation);
                }
            });
            treeHTML += '</ul>';
            familyTreeDisplayArea.innerHTML = treeHTML;
        }
    }

    function buildGenealogyTree(personId, populationScope, processedNodes) {
        const person = populationScope.find(p => p.id === personId);
        if (!person || processedNodes.has(personId)) return null; 

        processedNodes.add(personId);
        const node = { person, spouse: null, children: [] };

        if (person.spouseId) {
            const foundSpouse = populationScope.find(p => p.id === person.spouseId);
            if (foundSpouse) {
                node.spouse = foundSpouse;
                processedNodes.add(foundSpouse.id);
            }
        }

        const childrenIds = new Set(person.childrenIds || []); 
        if (node.spouse && node.spouse.childrenIds) { 
            node.spouse.childrenIds.forEach(id => childrenIds.add(id)); 
        } 

        if (childrenIds.size > 0) {
            childrenIds.forEach(childId => {
                const childNode = buildGenealogyTree(childId, populationScope, processedNodes);
                if (childNode) node.children.push(childNode);
            });
        }
        return node;
    }
    
    function getPersonDisplayHTML(person, allPopulation) {
        if (!person) return '';

        if (!person.isAlive) {
            const genderSymbol = person.gender === 'Homme' ? '♂' : '♀';
            const jobText = person.jobBeforeDeath ? `Était ${person.jobBeforeDeath}` : 'Décédé(e) sans emploi';
            let nameHTML = `${person.firstName} ${person.lastName}`;
            if (person.gender === 'Femme' && person.maidenName && person.maidenName !== person.lastName) {
                nameHTML += ` (Née ${person.maidenName})`;
            }
            return `
                <span class="name status-dead">${nameHTML} ${genderSymbol}</span>
                <span class="details">(Mort en l'An ${person.deathYear}, Mois ${person.deathMonth} à l'âge de ${person.ageAtDeath} ans)</span>
                <span class="details job-details">${jobText}</span>
            `;
        }
    
        const genderClass = person.gender === 'Homme' ? 'gender-male' : 'gender-female';
        const genderSymbol = person.gender === 'Homme' ? '♂' : '♀';
        const pregnancyIndicator = person.isPregnant ? ' 🤰' : '';
    
        let jobInfo = 'Sans emploi';
        const raceData = RACES_DATA.races[person.race];
        const rulingFamilyInfo = getRulingFamilyInfoForPerson(person, allPopulation);

        if (person.royalTitle) {
            jobInfo = person.royalTitle;
        } else if (person.job && person.job.jobTitle) {
            const jobData = getJobData(person.job.buildingName, person.job.jobTitle);
            if (jobData && jobData.tier === 0) {
                jobInfo = jobData.titre;
            } else {
                jobInfo = person.job.jobTitle;
            }
        } else if (person.status === 'Retraité(e)') {
            jobInfo = `Retraité(e) (${person.lastJobTitle || 'ancien métier'})`;
        } else if (person.status === 'En congé maternité') {
            jobInfo = 'Congé maternité';
        } else if (person.age < raceData.ageTravail) {
            jobInfo = 'Enfant';
        } else if (rulingFamilyInfo) {
            if (rulingFamilyInfo.isHeir) { jobInfo = person.gender === 'Femme' ? 'Héritière' : 'Héritier'; }
            else if (rulingFamilyInfo.isRulerSpouse || rulingFamilyInfo.isHeirSpouse) { jobInfo = 'Famille Gouvernante'; }
            else if (rulingFamilyInfo.isParentOfRuler) { jobInfo = person.gender === 'Femme' ? 'Matriarche' : 'Patriarche'; }
        }

        let nameHTML = `${person.firstName} ${person.lastName}`;
        if (person.gender === 'Femme' && person.maidenName && person.maidenName !== person.lastName) {
            nameHTML += ` (Née ${person.maidenName})`;
        }
        
        return `
            <span class="name ${genderClass}">${nameHTML} ${genderSymbol}${pregnancyIndicator}</span>
            <span class="details">(${person.race}, ${person.age} ans)</span>
            <span class="details job-details">${jobInfo}</span>
        `;
    }

    function renderTreeHTML(node, allPopulation) {
        if (!node || !node.person) return '';
    
        const personIdAttr = `data-person-id="${node.person.id}"`;
        const spouseIdAttr = node.spouse ? `data-spouse-id="${node.spouse.id}"` : '';
    
        let personHTML = `<div class="person-node" ${personIdAttr} ${spouseIdAttr}>
                            <div class="person-info">${getPersonDisplayHTML(node.person, allPopulation)}</div>`;

        if (node.spouse) {
            personHTML += `<div class="spouse-separator">&</div>
                           <div class="person-info">${getPersonDisplayHTML(node.spouse, allPopulation)}</div>`;
        }
        personHTML += `</div>`;
    
        let childrenHTML = '';
        if (node.children && node.children.length > 0) {
            childrenHTML += '<ul>';
            node.children
                .sort((a,b) => (b.person?.age || 0) - (a.person?.age || 0))
                .forEach(childNode => childrenHTML += renderTreeHTML(childNode, allPopulation));
            childrenHTML += '</ul>';
        }
        return `<li>${personHTML}${childrenHTML}</li>`;
    }
    
    function getPersonById(id, scope) { return scope.find(p => p.id === id); }
    function getParents(person, scope) { if (!person.parents || person.parents.length === 0) return []; return person.parents.map(id => getPersonById(id, scope)).filter(Boolean); }
    function getSiblings(person, scope) { 
        const parents = getParents(person, scope); 
        if (parents.length === 0) return []; 
        const siblingIds = new Set();
        parents.forEach(p => { if (p.childrenIds) { p.childrenIds.forEach(childId => siblingIds.add(childId)); } });
        return Array.from(siblingIds).filter(id => id !== person.id).map(id => getPersonById(id, scope)).filter(Boolean); 
    }
    function getChildren(person, scope) { 
        const childrenIds = new Set(person.childrenIds || []); 
        const spouse = person.spouseId ? getPersonById(person.spouseId, scope) : null; 
        if(spouse && spouse.childrenIds) { spouse.childrenIds.forEach(id => childrenIds.add(id)); } 
        return Array.from(childrenIds).map(id => getPersonById(id, scope)).filter(Boolean); 
    }
    function getFamily(person, scope) { const familyMembers = new Set(); const family = currentRegion.places.flatMap(p => p.demographics.families).find(f => f.id === person.familyId); if(family) { family.memberIds.forEach(id => { const member = getPersonById(id, scope); if(member) familyMembers.add(member); }); } return Array.from(familyMembers); }
    function getUnclesAunts(person, scope) { const parents = getParents(person, scope); const unclesAunts = new Set(); parents.forEach(p => { getSiblings(p, scope).forEach(s => unclesAunts.add(s)); }); return Array.from(unclesAunts); }
    function getCousins(person, scope) { const unclesAunts = getUnclesAunts(person, scope); const cousins = new Set(); unclesAunts.forEach(ua => { getChildren(ua, scope).forEach(c => cousins.add(c)); }); return Array.from(cousins); }

    function findRulersAndFamilies(population, families) {
        const rulingFamilies = new Map();
        const rulingFamilyMemberIds = new Set();
        population.forEach(person => {
            if (person.isAlive && person.job) {
                const jobData = getJobData(person.job.buildingName, person.job.jobTitle);
                if (jobData && jobData.tier === 0) {
                    rulingFamilies.set(person.familyId, { ruler: person, jobData });
                }
            }
        });
        rulingFamilies.forEach(({ ruler }) => {
            const family = families.find(f => f.id === ruler.familyId);
            if (family) { family.memberIds.forEach(id => rulingFamilyMemberIds.add(id)); }
        });
        return { rulingFamilies, rulingFamilyMemberIds };
    }
    
    function getDescendantMap(ruler, population) {
        const descendantMap = new Map();
        const queue = [{ personId: ruler.id, generation: 0 }];
        const visited = new Set();
        descendantMap.set(ruler.id, 0);
        visited.add(ruler.id);
        const spouse = getPersonById(ruler.spouseId, population);
        if (spouse && spouse.isAlive && !visited.has(spouse.id)) {
            descendantMap.set(spouse.id, 0);
            visited.add(spouse.id);
        }
        while (queue.length > 0) {
            const { personId, generation } = queue.shift();
            const person = getPersonById(personId, population);
            if (person && person.childrenIds) {
                person.childrenIds.forEach(childId => {
                    if (!visited.has(childId)) {
                        visited.add(childId);
                        queue.push({ personId: childId, generation: generation + 1 });
                        descendantMap.set(childId, generation + 1);
                    }
                });
            }
        }
        return descendantMap;
    }
    
    function getRulingDynastyMemberIds(rulers, population) {
        const dynastyIds = new Set();
        rulers.forEach(ruler => {
            if (dynastyIds.has(ruler.id)) return;
            const descendants = getDescendantMap(ruler, population);
            descendants.forEach((generation, personId) => {
                dynastyIds.add(personId);
                const person = getPersonById(personId, population);
                if (person && person.spouseId) {
                    dynastyIds.add(person.spouseId);
                }
            });
            const siblings = getSiblings(ruler, population);
            siblings.forEach(sibling => {
                if(sibling) {
                    dynastyIds.add(sibling.id);
                    if (sibling.spouseId) dynastyIds.add(sibling.spouseId);
                    const nephewsAndNieces = getChildren(sibling, population);
                    nephewsAndNieces.forEach(nephew => {
                        if (nephew) {
                            dynastyIds.add(nephew.id);
                            if (nephew.spouseId) dynastyIds.add(nephew.spouseId);
                        }
                    });
                }
            });
            const parents = getParents(ruler, population);
            parents.forEach(parent => {
                if(parent) {
                    dynastyIds.add(parent.id);
                    if (parent.spouseId) dynastyIds.add(parent.spouseId);
                }
            });
        });
        return dynastyIds;
    }
    
    function getRulingFamilyInfoForPerson(person, allPopulation) {
        const rulers = allPopulation.filter(p => p.isAlive && p.job && getJobData(p.job.buildingName, p.job.jobTitle)?.tier === 0);
        if (rulers.length === 0) return null;
        for (const ruler of rulers) {
            if (person.id === ruler.id) return { isRuler: true };
            if (person.id === ruler.spouseId) return { isRulerSpouse: true, rulerJobTitle: getJobData(ruler.job.buildingName, ruler.job.jobTitle)?.titre };
            const descendantMap = getDescendantMap(ruler, allPopulation);
            if (descendantMap.has(person.id) && descendantMap.get(person.id) > 0) {
                return { isHeir: true };
            }
            for (const descendantId of descendantMap.keys()) {
                if (descendantId === ruler.id || descendantId === ruler.spouseId) continue;
                const descendant = getPersonById(descendantId, allPopulation);
                if (descendant && descendant.spouseId === person.id) return { isHeirSpouse: true };
            }
            const parentsOfRuler = getParents(ruler, allPopulation);
            if (parentsOfRuler.some(p => p.id === person.id)) return { isParentOfRuler: true };
        }
        return null;
    }

    function openCharacterModal(personId, spouseId = null) {
        const allPopulation = currentRegion.places.flatMap(p => p.demographics ? p.demographics.population : []);
        const person = getPersonById(personId, allPopulation);
        if (!person) return;
        const spouse = spouseId ? getPersonById(spouseId, allPopulation) : null;
        const tabsContainer = characterDetailsModal.querySelector('#char-modal-tabs-container');
        tabsContainer.innerHTML = ''; 
        const viewTabs = characterDetailsModal.querySelectorAll('.char-view-tab');
        const viewContents = characterDetailsModal.querySelectorAll('.char-tab-content');
        viewTabs.forEach(tab => tab.classList.remove('active'));
        viewContents.forEach(content => content.classList.remove('active'));
        characterDetailsModal.querySelector('.char-view-tab[data-tab="general"]').classList.add('active');
        characterDetailsModal.querySelector('#char-tab-general').classList.add('active');
        const displayPersonData = (p) => {
            populateGeneralTab(p, allPopulation);
            populateSocialTab(p, allPopulation);
            populateHistoryTab(p);
        };
        const createTab = (p, isActive) => {
            const personTabButton = document.createElement('button');
            personTabButton.className = 'char-modal-tab person-tab';
            if (isActive) personTabButton.classList.add('active');
            personTabButton.innerHTML = `${p.firstName} ${p.gender === 'Homme' ? '♂' : '♀'}`;
            personTabButton.dataset.personId = p.id;
            personTabButton.addEventListener('click', (e) => {
                tabsContainer.querySelectorAll('.person-tab').forEach(t => t.classList.remove('active'));
                e.currentTarget.classList.add('active');
                displayPersonData(p);
            });
            tabsContainer.prepend(personTabButton);
        };
        if (spouse) createTab(spouse, false);
        createTab(person, true);
        displayPersonData(person);
        characterDetailsModal.showModal();
    }

    function populateGeneralTab(person, scope) {
        let fullName = `${person.firstName} ${person.lastName}`;
        if (person.gender === 'Femme' && person.maidenName && person.maidenName !== person.lastName) {
            fullName += ` (née ${person.maidenName})`;
        }
        characterDetailsModal.querySelector('#char-modal-fullname').textContent = fullName;
        characterDetailsModal.querySelector('#char-modal-race').textContent = person.race;
        characterDetailsModal.querySelector('#char-modal-gender').textContent = person.gender;
        characterDetailsModal.querySelector('#char-modal-age').textContent = person.age;
        characterDetailsModal.querySelector('#char-modal-lifespan').textContent = RACES_DATA.races[person.race]?.esperanceVieMax || 'Inconnue';
        let statusText;
        const deathCauseContainer = characterDetailsModal.querySelector('#char-modal-death-cause-container');
        if (person.isAlive) {
            statusText = person.status || 'Actif';
            if (person.isPregnant) statusText += ' (Enceinte)';
            deathCauseContainer.style.display = 'none';
        } else {
            statusText = `Décédé(e) (An ${person.deathYear}, Mois ${person.deathMonth} à l'âge de ${person.ageAtDeath} ans)`;
            if (person.causeOfDeath) {
                let causeText;
                switch(person.causeOfDeath) {
                    case 'maladie': causeText = 'Maladie'; break;
                    case 'vieillesse': causeText = 'Vieillesse'; break;
                    case 'accident': causeText = 'Accident'; break;
                    default: causeText = person.causeOfDeath;
                }
                characterDetailsModal.querySelector('#char-modal-death-cause').textContent = causeText;
                deathCauseContainer.style.display = 'block';
            } else {
                deathCauseContainer.style.display = 'none';
            }
        }
        characterDetailsModal.querySelector('#char-modal-status').textContent = statusText;
        characterDetailsModal.querySelector('#char-modal-location').textContent = currentRegion.places.find(p => p.id === person.locationId)?.name || 'Inconnue';
        characterDetailsModal.querySelector('#char-modal-desired-children').textContent = typeof person.desiredChildren === 'number' ? person.desiredChildren : 'Non spécifié';
        let jobText = 'N/A', workplaceText = 'N/A', salaryText = '0';
        let gainsHTML = '<p>Aucun gain de carrière défini.</p>';
        if (!person.isAlive) {
            jobText = person.jobBeforeDeath || 'Sans emploi';
        } else {
            const rulingInfo = getRulingFamilyInfoForPerson(person, scope);
            if (person.job) {
                const jobData = getJobData(person.job.buildingName, person.job.jobTitle);
                const workPlace = currentRegion.places.find(p => p.id === person.job.locationId);
                jobText = person.job.jobTitle;
                workplaceText = `${person.job.buildingName} (${workPlace?.name || 'Inconnu'})`;
                salaryText = jobData?.salaire.totalEnCuivre || 'N/A';
                if (jobData?.gainsMensuels) {
                    gainsHTML = `<p class="gain-item"><strong>Prestige/mois :</strong> +${(jobData.gainsMensuels.prestige || 0).toFixed(2)}</p>`;
                    if (jobData.gainsMensuels.stats) {
                        const statGains = Object.entries(jobData.gainsMensuels.stats).map(([stat, val]) => `+${val.toFixed(2)} ${stat.slice(0, 3)}.`);
                        gainsHTML += `<p class="gain-item"><strong>Stats/mois :</strong> ${statGains.join(', ')}</p>`;
                    }
                }
            } else if (person.royalTitle) {
                jobText = person.royalTitle;
                workplaceText = 'Famille Dirigeante';
                salaryText = 'N/A';
                gainsHTML = "<p>Bénéficie des avantages liés à sa position noble.</p>";
            } else if (rulingInfo) {
                if (rulingInfo.isHeir) jobText = person.gender === 'Femme' ? 'Héritière' : 'Héritier';
                else if (rulingInfo.isRulerSpouse || rulingInfo.isHeirSpouse) jobText = 'Famille Gouvernante';
                else if (rulingInfo.isParentOfRuler) jobText = person.gender === 'Femme' ? 'Matriarche' : 'Patriarche';
                gainsHTML = "<p>Bénéficie des revenus de sa famille.</p>";
            } else if (person.status === 'Retraité(e)') {
                jobText = `Retraité(e) (${person.lastJobTitle || 'ancien métier'})`;
                gainsHTML = `<p>A pris sa retraite du poste de ${person.lastJobTitle || 'non spécifié'}.</p>`;
            } else if (person.status === 'En congé maternité') {
                jobText = person.status;
                gainsHTML = `<p>${person.status}.</p>`;
            }
        }
        characterDetailsModal.querySelector('#char-modal-job').textContent = jobText;
        characterDetailsModal.querySelector('#char-modal-workplace').textContent = workplaceText;
        characterDetailsModal.querySelector('#char-modal-salary').textContent = salaryText;
        characterDetailsModal.querySelector('#char-modal-monthly-gains').innerHTML = gainsHTML;
        characterDetailsModal.querySelector('#char-modal-prestige').textContent = (person.prestige || 0).toFixed(2);
        const totalMonthsWorkedElement = characterDetailsModal.querySelector('#char-modal-total-months-worked');
        if (totalMonthsWorkedElement) {
            totalMonthsWorkedElement.textContent = person.totalMonthsWorked ?? 0;
        }
        const statsList = characterDetailsModal.querySelector('#char-modal-stats');
        statsList.innerHTML = '';
        if (person.stats) {
            for (const [stat, value] of Object.entries(person.stats)) {
                statsList.innerHTML += `<li><span>${stat.charAt(0).toUpperCase() + stat.slice(1)}</span> <span class="dnd-stat">${Math.round(value)}</span></li>`;
            }
        }
        const familySummaryContainer = characterDetailsModal.querySelector('#char-modal-family-summary');
        let familyHTML = '<ul>';
        const createLink = p => {
             if (!p) return 'N/A';
             return `<span class="character-link" data-person-id="${p.id}">${p.firstName} ${p.lastName}</span> ${p.isAlive ? `(${p.age} ans)` : `(décédé(e))`}`;
        };
        const parents = getParents(person, scope);
        familyHTML += `<li><strong>Parents:</strong> ${parents.length > 0 ? parents.map(createLink).join(' & ') : 'Inconnus'}</li>`;
        let spouse = person.spouseId ? getPersonById(person.spouseId, scope) : null;
        familyHTML += `<li><strong>Conjoint(e):</strong> ${spouse ? createLink(spouse) : 'Aucun(e)'}</li>`;
        const children = getChildren(person, scope);
        familyHTML += `<li><strong>Enfants:</strong> ${children.length > 0 ? children.length : '0'}</li>`;
        familyHTML += '</ul>';
        familySummaryContainer.innerHTML = familyHTML;
    }

    function populateSocialTab(person, scope) {
        const container = characterDetailsModal.querySelector('#social-family-circle');
        let html = '<ul class="social-list">';
        const createLink = p => {
            if (!p) return '';
            return `<span class="character-link" data-person-id="${p.id}">${p.firstName} ${p.lastName}</span> ${p.isAlive ? `(${p.age} ans)` : `(décédé(e) à ${p.ageAtDeath} ans)`}`;
        };
        const parents = getParents(person, scope);
        if(parents.length > 0) html += `<li><strong>Parents:</strong> ${parents.map(createLink).join(' & ')}</li>`;
        let spouse = person.spouseId ? getPersonById(person.spouseId, scope) : null;
        if(spouse) html += `<li><strong>Conjoint(e):</strong> ${createLink(spouse)}</li>`;
        const siblings = getSiblings(person, scope);
        if(siblings.length > 0) html += `<li><strong>Frères & Sœurs:</strong><ul>${siblings.map(p => `<li>${createLink(p)}</li>`).join('')}</ul></li>`;
        const children = getChildren(person, scope);
        if(children.length > 0) html += `<li><strong>Enfants:</strong><ul>${children.map(p => `<li>${createLink(p)}</li>`).join('')}</ul></li>`;
        const unclesAunts = getUnclesAunts(person, scope);
        if(unclesAunts.length > 0) html += `<li><strong>Oncles & Tantes:</strong><ul>${unclesAunts.map(p => `<li>${createLink(p)}</li>`).join('')}</ul></li>`;
        const cousins = getCousins(person, scope);
        if(cousins.length > 0) html += `<li><strong>Cousins:</strong><ul>${cousins.map(p => `<li>${createLink(p)}</li>`).join('')}</ul></li>`;
        html += '</ul>';
        container.innerHTML = `<h4>Cercle Familial</h4>${html}`;
        const friendsContainer = characterDetailsModal.querySelector('#social-friends');
        const friends = (person.friendIds || []).map(id => getPersonById(id, scope)).filter(Boolean);
        friendsContainer.innerHTML = `<h4>Amis (${friends.length}/${person.maxFriends})</h4>`;
        friendsContainer.innerHTML += friends.length > 0 ? `<ul class="social-list">${friends.map(p => `<li>${createLink(p)}</li>`).join('')}</ul>` : '<p>Aucun ami pour le moment.</p>';
        const acqContainer = characterDetailsModal.querySelector('#social-acquaintances');
        const acquaintances = (person.acquaintanceIds || []).map(id => getPersonById(id, scope)).filter(Boolean);
        acqContainer.innerHTML = `<h4>Connaissances (${acquaintances.length}/${person.maxAcquaintances})</h4>`;
        acqContainer.innerHTML += acquaintances.length > 0 ? `<ul class="social-list">${acquaintances.map(p => `<li>${createLink(p)}</li>`).join('')}</ul>` : '<p>Aucune connaissance pour le moment.</p>';
    }

    function populateHistoryTab(person) {
        const historyLog = characterDetailsModal.querySelector('#char-history-log');
        const personEvents = simulationState.log.filter(e => e.personId === person.id);
        historyLog.innerHTML = personEvents.length > 0 ? personEvents.map(e => `<li><strong>[An ${e.year}]</strong> ${e.message}</li>`).join('') : '<li>Aucun événement majeur enregistré pour ce personnage.</li>';
    }

    function startSimulation() { if (simulationState.isRunning) return; simulationState.isRunning = true; startSimBtn.disabled = true; pauseSimBtn.disabled = false; resetSimBtn.disabled = true; simulationState.intervalId = setInterval(mainLoop, simulationState.tickSpeed); logEvent('▶️ Simulation démarrée.', 'system'); updateEventLogUI(); }
    function pauseSimulation() { if (!simulationState.isRunning) return; simulationState.isRunning = false; startSimBtn.disabled = false; pauseSimBtn.disabled = true; resetSimBtn.disabled = false; clearInterval(simulationState.intervalId); logEvent('⏸️ Simulation en pause.', 'system'); updateEventLogUI(); }
    function handleSpeedChange() { const speedValue = speedControl.value; simulationState.tickSpeed = TICK_SPEEDS[speedValue]; speedDisplay.textContent = `x${speedValue}`; if (simulationState.isRunning) { clearInterval(simulationState.intervalId); simulationState.intervalId = setInterval(mainLoop, simulationState.tickSpeed); } }
    
    function handleResetClick() {
        if (confirm("Réinitialiser la simulation à l'Année 1, Mois 1 ? Toute la progression (naissances, morts, événements, etc.) sera perdue, mais la population initiale sera conservée.")) {
            pauseSimulation();
            if (initialSimulationData) {
                regions = JSON.parse(JSON.stringify(initialSimulationData));
                const lastRegionId = localStorage.getItem(LAST_REGION_KEY);
                if (lastRegionId) { currentRegion = regions.find(r => r.id == lastRegionId) || null; }
            }
            setupInitialState();
            logEvent('🔄 Simulation réinitialisée.', 'system');
            updateEventLogUI();
        }
    }

    function makeModalDraggable(modal, handle) {
        let isDragging = false, startX, startY, initialLeft, initialTop;
        handle.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('modal-close-btn') || e.target.classList.contains('char-modal-tab')) return;
            isDragging = true;
            startX = e.clientX; startY = e.clientY;
            const rect = modal.getBoundingClientRect();
            initialLeft = rect.left; initialTop = rect.top;
            handle.style.cursor = 'grabbing';
            document.body.style.userSelect = 'none';
        });
        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            e.preventDefault();
            modal.style.left = `${initialLeft + e.clientX - startX}px`;
            modal.style.top = `${initialTop + e.clientY - startY}px`;
            modal.style.transform = '';
        });
        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                handle.style.cursor = 'move';
                document.body.style.userSelect = '';
            }
        });
    }

    function setupInitialState() {
        if (!currentRegion || !currentRegion.places.some(p => p.config?.isValidated)) {
            document.body.innerHTML = `<div class="error-container"><h1>Erreur de Simulation</h1><p>Aucune donnée de simulation valide trouvée.</p><a href="step3.html" class="btn btn-primary">Retourner à l'Étape 3</a></div>`;
            return false;
        }
        currentRegion.places.forEach(place => { place.state = { satisfaction: 100, production: {}, consumption: {}, shortages: [], surpluses: [] }; });
        treeZoomLevel = 1.0;
        if(familyTreeDisplayArea) familyTreeDisplayArea.style.transform = `scale(${treeZoomLevel})`;
        simulationState = { isRunning: false, currentTick: 0, currentMonth: 1, currentYear: 1, tickSpeed: TICK_SPEEDS[speedControl.value] || 1000, intervalId: null, log: [] };
        updateGlobalStats();
        updateLocationPopulationSummary();
        updateDateUI();
        selectedLocationId = currentRegion.places[0]?.id;
        updateLocationTabs();
        updateFamilySelector();
        displaySelectedFamilyTree();
        updateEventLogUI();
        startSimBtn.disabled = false;
        pauseSimBtn.disabled = true;
        resetSimBtn.disabled = false;
        return true;
    }

    function init() {
        loadData();
        if(regions) initialSimulationData = JSON.parse(JSON.stringify(regions));
        
        // NOUVEAU : Appel initial pour la mise à jour de la navigation
        updateAllNavLinksState(currentRegion);
        
        if (!setupInitialState()) return;

        logEvent('Simulation prête à démarrer...', 'system');
        updateEventLogUI();
        startSimBtn.addEventListener('click', startSimulation);
        pauseSimBtn.addEventListener('click', pauseSimulation);
        resetSimBtn.addEventListener('click', handleResetClick);
        speedControl.addEventListener('input', handleSpeedChange);
        familySelector.addEventListener('change', () => {
            selectedFamilyId = familySelector.value;
            characterSearchInput.value = '';
            displaySelectedFamilyTree();
            updateEventLogUI();
        });
        familyTreeDisplayAreaWrapper.addEventListener('click', e => {
            const personNode = e.target.closest('.person-node');
            if (personNode) {
                const personInfoClicked = e.target.closest('.person-info');
                const allPersonInfos = personNode.querySelectorAll('.person-info');
                let clickedPersonId = personNode.dataset.personId;
                let otherPersonId = personNode.dataset.spouseId || null;
                if (otherPersonId && allPersonInfos.length > 1 && personInfoClicked === allPersonInfos[1]) {
                    [clickedPersonId, otherPersonId] = [otherPersonId, clickedPersonId];
                }
                if (clickedPersonId) openCharacterModal(clickedPersonId, otherPersonId);
            }
        });
        characterSearchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            searchResultsContainer.innerHTML = '';
            if (query.length < 2) return;
            const allPopulation = currentRegion.places.flatMap(p => p.demographics.population);
            const results = allPopulation.filter(p => p.firstName.toLowerCase().includes(query) || p.lastName.toLowerCase().includes(query)).slice(0, 10);
            results.forEach(person => {
                const item = document.createElement('div');
                item.className = 'search-result-item';
                item.textContent = `${person.firstName} ${person.lastName} (${person.age}, ${currentRegion.places.find(p=>p.id===person.locationId).name})`;
                item.addEventListener('click', () => {
                    characterSearchInput.value = `${person.firstName} ${person.lastName}`;
                    searchResultsContainer.innerHTML = '';
                    selectedFamilyId = person.familyId;
                    selectedLocationId = person.locationId;
                    updateLocationTabs();
                    updateFamilySelector();
                    displaySelectedFamilyTree();
                    updateEventLogUI();
                });
                searchResultsContainer.appendChild(item);
            });
        });
        familyTreeDisplayAreaWrapper.addEventListener('mousedown', e => {
            if (e.target.closest('.person-node')) return;
            isPanningTree = true;
            startPanX = e.pageX - familyTreeDisplayAreaWrapper.offsetLeft;
            startPanY = e.pageY - familyTreeDisplayAreaWrapper.offsetTop;
            scrollLeftStart = familyTreeDisplayAreaWrapper.scrollLeft;
            scrollTopStart = familyTreeDisplayAreaWrapper.scrollTop;
            familyTreeDisplayAreaWrapper.style.cursor = 'grabbing';
        });
        familyTreeDisplayAreaWrapper.addEventListener('mouseleave', () => { isPanningTree = false; familyTreeDisplayAreaWrapper.style.cursor = 'grab'; });
        familyTreeDisplayAreaWrapper.addEventListener('mouseup', () => { isPanningTree = false; familyTreeDisplayAreaWrapper.style.cursor = 'grab'; });
        familyTreeDisplayAreaWrapper.addEventListener('mousemove', e => {
            if (!isPanningTree) return;
            e.preventDefault();
            const walkX = (e.pageX - familyTreeDisplayAreaWrapper.offsetLeft - startPanX);
            const walkY = (e.pageY - familyTreeDisplayAreaWrapper.offsetTop - startPanY);
            familyTreeDisplayAreaWrapper.scrollLeft = scrollLeftStart - walkX;
            familyTreeDisplayAreaWrapper.scrollTop = scrollTopStart - walkY;
        });
        familyTreeDisplayAreaWrapper.addEventListener('wheel', e => {
            if (e.altKey) {
                e.preventDefault();
                treeZoomLevel += e.deltaY < 0 ? 0.1 : -0.1;
                treeZoomLevel = Math.max(0.3, Math.min(treeZoomLevel, 2.5));
                familyTreeDisplayArea.style.transformOrigin = 'top center';
                familyTreeDisplayArea.style.transform = `scale(${treeZoomLevel})`;
            }
        });
        if(characterDetailsModal) {
            characterDetailsModal.querySelector('.modal-close-btn').addEventListener('click', () => characterDetailsModal.close());
            makeModalDraggable(characterDetailsModal, characterDetailsModal.querySelector('#char-modal-header'));
            characterDetailsModal.addEventListener('click', e => {
                if (e.target.classList.contains('character-link')) {
                    const personId = e.target.dataset.personId;
                    const allPopulation = currentRegion.places.flatMap(p => p.demographics ? p.demographics.population : []);
                    const linkedPerson = allPopulation.find(p => p.id === personId);
                    if (linkedPerson) {
                        characterDetailsModal.close();
                        setTimeout(() => openCharacterModal(linkedPerson.id), 50);
                    }
                }
            });
        }
        const viewTabControls = document.getElementById('char-view-tab-controls');
        if (viewTabControls) {
            viewTabControls.addEventListener('click', (e) => {
                if (e.target.matches('.char-view-tab')) {
                    const tabName = e.target.dataset.tab;
                    viewTabControls.querySelectorAll('.char-view-tab').forEach(tab => tab.classList.remove('active'));
                    e.target.classList.add('active');
                    const contentContainer = document.getElementById('char-tab-content-container');
                    contentContainer.querySelectorAll('.char-tab-content').forEach(content => content.classList.remove('active'));
                    contentContainer.querySelector(`#char-tab-${tabName}`).classList.add('active');
                }
            });
        }
        const jobsByTierModal = document.getElementById('jobs-by-tier-modal');
        const viewJobsBtn = document.getElementById('view-jobs-btn');
        const jobsByTierContent = document.getElementById('jobs-by-tier-content');
        if (viewJobsBtn && jobsByTierModal) {
            viewJobsBtn.addEventListener('click', () => {
                const allJobsByTier = { 0: new Set(), 1: new Set(), 2: new Set(), 3: new Set(), 4: new Set(), 5: new Set() };
                for (const placeType in BUILDING_DATA) {
                    for (const category in BUILDING_DATA[placeType]) {
                        for (const buildingName in BUILDING_DATA[placeType][category]) {
                            const building = BUILDING_DATA[placeType][category][buildingName];
                            if (building.emplois) {
                                building.emplois.forEach(job => {
                                    if (allJobsByTier[job.tier] !== undefined) {
                                        allJobsByTier[job.tier].add(`${job.titre} <i>(Bâtiment: ${buildingName})</i>`);
                                    }
                                });
                            }
                        }
                    }
                }
                let modalHTML = '';
                for (const tier in allJobsByTier) {
                    if (allJobsByTier[tier].size > 0) {
                        modalHTML += `<h4>Tier ${tier}</h4><ul>`;
                        Array.from(allJobsByTier[tier]).sort().forEach(jobInfo => { modalHTML += `<li>${jobInfo}</li>`; });
                        modalHTML += '</ul>';
                    }
                }
                jobsByTierContent.innerHTML = modalHTML;
                jobsByTierModal.showModal();
            });
            jobsByTierModal.querySelector('.modal-close-btn').addEventListener('click', () => { jobsByTierModal.close(); });
        }
        
        // NOUVEAU : Écouteur de clics pour les liens de navigation désactivés
        const floatingMenu = document.querySelector('.floating-menu');
        if (floatingMenu) {
            floatingMenu.addEventListener('click', (e) => {
                const link = e.target.closest('a');
                if (link && link.classList.contains('nav-disabled')) {
                    e.preventDefault();
                    let message = "Cette étape est verrouillée.";
                    switch(link.id) {
                        case 'nav-step2':
                            message = "Veuillez d'abord créer une région et y ajouter au moins un lieu (Étape 1).";
                            break;
                        case 'nav-step3':
                            message = "Veuillez configurer et valider la structure économique de tous les lieux (Étape 2).";
                            break;
                        case 'nav-step4':
                        case 'nav-step5':
                            message = "Veuillez d'abord générer la population initiale (Étape 3).";
                            break;
                    }
                    alert(message);
                }
            });
        }
    }

    function runSimulationForYears(targetYears) {
        return new Promise((resolve, reject) => {
            loadData(); 
            if (!setupInitialState()) {
                reject(new Error("Échec de l'initialisation de la simulation."));
                return;
            }
            simulationState.tickSpeed = 1;
            startSimulation();
            const checkInterval = setInterval(() => {
                if (simulationState.currentYear >= targetYears) {
                    clearInterval(checkInterval);
                    pauseSimulation();
                    saveData();
                    resolve();
                }
            }, 100);
        });
    }

    window.EcoSimStep4 = {
        run: runSimulationForYears
    };

    if (document.querySelector('.page-container-step4')) {
        init();
    }
});