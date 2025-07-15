// Contenu du fichier step5.js
/**
 * EcoSimRPG - step5.js
 * Page d'exploitation et d'impression des données de simulation.
 * VERSION 13.8 - MODIFICATION : Intégration des bonus de caractéristiques raciaux.
 * - La fonction `getDisplayStats` ajoute maintenant les bonus définis dans `races.js`
 * - aux scores de base avant d'appliquer les modificateurs d'âge et de genre.
 */
document.addEventListener('DOMContentLoaded', () => {

    // --- CONSTANTES & CONFIGURATION ---
    const STORAGE_KEY = 'ecoSimRPG_map_data';
    const LAST_REGION_KEY = 'ecoSimRPG_last_region_id';
    const BUILDING_DATA = window.EcoSimData.buildings;
    const RACES_DATA = window.EcoSimData.racesData;
    const TRAVEL_SPEEDS = { Pied: 30, Cheval: 70, Caravane: 25 };
    const ROAD_TYPES = {
        'royal':      { name: 'Route Royale',       modifier: 1.0,  users: ['Pied', 'Cheval', 'Caravane'] },
        'comtal':     { name: 'Route Comtale',      modifier: 0.90, users: ['Pied', 'Cheval', 'Caravane'] },
        'marchand':   { name: 'Voie Marchande',     modifier: 0.80, users: ['Pied', 'Cheval', 'Caravane'] },
        'seigneurial':{ name: 'Chemin Seigneurial', modifier: 0.70, users: ['Pied', 'Cheval', 'Caravane'] },
        'traverse':   { name: 'Chemin de Traverse', modifier: 0.60, users: ['Pied', 'Cheval'] },
        'forestier':  { name: 'Sentier Forestier',  modifier: 0.50, users: ['Pied', 'Cheval'] },
        'montagne':   { name: 'Sentier de Montagne',modifier: 0.40, users: ['Pied', 'Cheval'] }
    };
    
    const CALENDARS = {
        generic: {
            name: "Générique",
            daysInMonth: 30,
            months: ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"]
        },
        dnd5e: {
            name: "D&D 5e (Calendrier de Harptos)",
            daysInMonth: 30,
            months: ["Hammer", "Alturiak", "Ches", "Tarsakh", "Mirtul", "Kythorn", "Flamerule", "Eleasis", "Eleint", "Marpenoth", "Uktar", "Nightal"]
        },
        pathfinder: {
            name: "Pathfinder (Calendrier d'Absalom)",
            daysInMonth: 28,
            months: ["Abadius", "Calistril", "Pharast", "Gozran", "Desnus", "Sarenith", "Erastus", "Arodus", "Rova", "Lamashan", "Neth", "Kuthona"]
        }
    };


    // --- SÉLECTEURS DOM ---
    const locationSelect = document.getElementById('location-select');
    const buildingSelect = document.getElementById('building-select');
    const characterSelect = document.getElementById('character-select');
    const systemSelect = document.getElementById('system-select');
    const calendarSelect = document.getElementById('calendar-select');
    const printBtn = document.getElementById('print-btn');
    const contentArea = document.getElementById('content-area');
    const globalSearchInput = document.getElementById('global-character-search');
    const globalSearchResults = document.getElementById('global-search-results');
    const notificationBanner = document.getElementById('notification-banner');


    // --- ÉTAT DE L'APPLICATION ---
    let regions = [];
    let currentRegion = null;
    let selectedLocation = null;
    let currentGameSystem = 'dnd5';
    let selectedCalendar = 'generic'; 
    let simulationEndYear = 1; 
    let notificationTimeout;

    // --- FONCTIONS DE NOTIFICATION ---
    function showNotification(message, type = 'info', duration = 5000) {
        if (!notificationBanner) return;
        if (notificationTimeout) {
            clearTimeout(notificationTimeout);
        }
        notificationBanner.textContent = message;
        notificationBanner.className = `notification-banner ${type}`; 
        
        notificationBanner.classList.remove('show');
        void notificationBanner.offsetWidth; 
        notificationBanner.classList.add('show');

        notificationTimeout = setTimeout(() => {
            notificationBanner.classList.remove('show');
        }, duration);
    }

    // --- HELPER CLASS for Pathfinding ---
    class PriorityQueue {
        constructor() { this.values = []; }
        enqueue(element, priority) { this.values.push({ element, priority }); this.sort(); }
        dequeue() { return this.values.shift(); }
        isEmpty() { return this.values.length === 0; }
        sort() { this.values.sort((a, b) => a.priority - b.priority); }
    }

    // --- GESTION DE LA NAVIGATION (MODIFIÉE) ---
    function updateAllNavLinksState(region) {
        const navStep2 = document.getElementById('nav-step2');
        const navStep3 = document.getElementById('nav-step3');
        const navStep4 = document.getElementById('nav-step4');
        const navStep5 = document.getElementById('nav-step5');

        const isStep2Ready = region && region.places && region.places.length > 0;
        if (navStep2) {
            if (isStep2Ready) navStep2.classList.remove('nav-disabled');
            else navStep2.classList.add('nav-disabled');
        }

        const isStep3Ready = isStep2Ready && region.places.every(place => place.config && place.config.isValidated === true);
        if (navStep3) {
            if (isStep3Ready) navStep3.classList.remove('nav-disabled');
            else navStep3.classList.add('nav-disabled');
        }

        const isStep4Ready = isStep3Ready && region.places.some(place => place.demographics && place.demographics.population.length > 0);
        if (navStep4) {
            if (isStep4Ready) navStep4.classList.remove('nav-disabled');
            else navStep4.classList.add('nav-disabled');
        }
        
        const isSimFinished = region && region.log && region.log.some(e => e.year >= 60);
        const isStep5Ready = isStep4Ready && isSimFinished;

        if (navStep5) {
            if (isStep5Ready) {
                navStep5.classList.remove('nav-disabled');
            } else {
                navStep5.classList.add('nav-disabled');
            }
        }
    }

    // --- FONCTIONS UTILITAIRES & GÉNÉALOGIQUES ---
    function seededRandom(seed) {
        let hash = 0;
        if (seed.length === 0) return hash;
        for (let i = 0; i < seed.length; i++) {
            const char = seed.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        const x = Math.sin(hash++) * 10000;
        return x - Math.floor(x);
    }
    
    const getBuildingData = (buildingName) => {
        for (const type in BUILDING_DATA) {
            for (const category in BUILDING_DATA[type]) {
                if (BUILDING_DATA[type][category][buildingName]) {
                    return BUILDING_DATA[type][category][buildingName];
                }
            }
        }
        return null;
    };
    const getJobData = (buildingName, jobTitle) => {
        const building = getBuildingData(buildingName);
        if (building && building.emplois) {
            return building.emplois.find(j => j.titre === jobTitle) || null;
        }
        return null;
    };
    const axialDistance = (a, b) => {
        if (!a || !b) return Infinity;
        const dq = a.q - b.q;
        const dr = a.r - b.r;
        const ds = -dq - dr;
        return (Math.abs(dq) + Math.abs(dr) + Math.abs(ds)) / 2;
    };
    const getRoadKey = (id1, id2) => [id1, id2].sort((a, b) => a - b).join('-');
    const formatTravelTime = (timeInDays) => {
        if (isNaN(timeInDays) || timeInDays < 0 || timeInDays === Infinity) return "N/A";
        const days = Math.floor(timeInDays);
        const hours = Math.round((timeInDays - days) * 24);
        let parts = [];
        if (days > 0) parts.push(`${days}j`);
        if (hours > 0) parts.push(`${hours}h`);
        return parts.length > 0 ? parts.join(' ') : "< 1h";
    };

    /**
     * Convertit un total de pièces de cuivre en une chaîne de caractères formatée (po, pa, pc).
     * @param {number} totalCopper Le montant total en pièces de cuivre.
     * @returns {string} La chaîne de caractères formatée (ex: "1po 2pa 3pc").
     */
    const formatCurrency = (totalCopper) => {
        if (isNaN(totalCopper) || totalCopper === null || totalCopper === undefined) return 'N/A';
        const po = Math.floor(totalCopper / 100);
        const pa = Math.floor((totalCopper % 100) / 10);
        const pc = totalCopper % 10;
        return `${po}po ${pa}pa ${pc}pc`;
    };

    const convertToDnD = (rawValue) => {
        if (rawValue < 1) return { score: 3, modifier: -4 };
        let dndScore;
        if (rawValue <= 20) {
            dndScore = (2 / 19) * (rawValue - 1) + 9;
        } else {
            const logMin = Math.log(20);
            const logMax = Math.log(20000);
            const scoreMin = 11;
            const scoreMax = 20;
            dndScore = ((scoreMax - scoreMin) / (logMax - logMin)) * (Math.log(rawValue) - logMin) + scoreMin;
        }
        const finalScore = Math.min(20, Math.max(1, Math.round(dndScore)));
        const modifier = Math.floor((finalScore - 10) / 2);
        return { score: finalScore, modifier: modifier };
    };

    function getDisplayStats(person) {
        const raceData = RACES_DATA.races[person.race];
        if (!raceData) {
            let finalStats = {};
            for (const stat in person.stats) {
                finalStats[stat] = convertToDnD(person.stats[stat]).score;
            }
            return finalStats;
        }
    
        let modifiedScores = {};
        for (const stat in person.stats) {
            modifiedScores[stat] = convertToDnD(person.stats[stat] || 1).score;
        }
    
        // Appliquer les bonus de caractéristiques raciaux
        if (raceData.bonusCarac) {
            const bonusMapping = {
                'Force': 'force',
                'Dextérité': 'dexterite',
                'Constitution': 'constitution',
                'Intelligence': 'intelligence',
                'Sagesse': 'sagesse',
                'Charisme': 'charisme'
            };
    
            for (const statName in raceData.bonusCarac) {
                const mappedStat = bonusMapping[statName];
                if (mappedStat && typeof modifiedScores[mappedStat] === 'number') {
                    modifiedScores[mappedStat] += raceData.bonusCarac[statName];
                }
            }
        }
    
        const isChildOrTeen = person.age < raceData.ageTravail;
        if (isChildOrTeen) {
            if (person.age < raceData.ageApprentissage) {
                for (const stat in modifiedScores) {
                    modifiedScores[stat] = Math.round(modifiedScores[stat] * 0.4);
                }
            } else {
                const startAge = raceData.ageApprentissage;
                const endAge = raceData.ageTravail;
                const apprenticeshipDuration = endAge - startAge;
                const startFactor = 0.4;
                const endFactor = 1.0;
                let progress = (apprenticeshipDuration > 0) ? (person.age - startAge) / apprenticeshipDuration : 1.0;
                const scalingFactor = startFactor + (endFactor - startFactor) * progress;
                for (const stat in modifiedScores) {
                    const baseScore = convertToDnD(person.stats[stat] || 1).score;
                    modifiedScores[stat] = Math.round(baseScore * scalingFactor);
                }
            }
        }
    
        if (person.gender === 'Femme') {
            modifiedScores.force -= 2;
            modifiedScores.constitution -= 1;
            modifiedScores.dexterite += 1;
            modifiedScores.charisme += 2;
        }
    
        const middleAgeThreshold = raceData.esperanceVieMax * 0.5;
        const oldAgeThreshold = raceData.esperanceVieMax * 0.7;
        const veryOldAgeThreshold = raceData.esperanceVieMax * 0.85;
    
        if (person.age > veryOldAgeThreshold) {
            modifiedScores.force -= 4;
            modifiedScores.dexterite -= 4;
            modifiedScores.constitution -= 5;
            modifiedScores.sagesse += 2;
            modifiedScores.intelligence += 1;
        } else if (person.age > oldAgeThreshold) {
            modifiedScores.force -= 2;
            modifiedScores.dexterite -= 2;
            modifiedScores.constitution -= 3;
            modifiedScores.sagesse += 1;
        } else if (person.age > middleAgeThreshold) {
            modifiedScores.force -= 1;
            modifiedScores.constitution -= 1;
        }
    
        let finalScores = {};
        for (const stat in modifiedScores) {
            finalScores[stat] = Math.max(1, modifiedScores[stat]);
        }
        return finalScores;
    }

    const getPersonById = (id, scope) => scope.find(p => p.id === id);
    const getParents = (person, scope) => (person.parents || []).map(id => getPersonById(id, scope)).filter(Boolean);
    const getSiblings = (person, scope) => {
        const parents = getParents(person, scope);
        if (parents.length === 0) return [];
        const parentIds = parents.map(p => p.id);
        const allChildren = new Set();
        populationScope.forEach(p => {
            if (p.parents && p.parents.some(parentId => parentIds.includes(parentId))) {
                allChildren.add(p);
            }
        });
        return Array.from(allChildren).filter(p => p.id !== person.id);
    };
    const getChildren = (person, scope) => {
        const commonChildren = new Set(person.childrenIds || []);
        const spouse = getSpouse(person, scope);
        if (spouse && spouse.childrenIds) {
            spouse.childrenIds.forEach(id => commonChildren.add(id));
        }
        return Array.from(commonChildren).map(id => getPersonById(id, scope)).filter(Boolean);
    };
    const getSpouse = (person, scope) => person.spouseId ? getPersonById(person.spouseId, scope) : null;
    const getUnclesAunts = (person, scope) => { const parents = getParents(person, scope); const unclesAunts = new Set(); parents.forEach(p => getSiblings(p, scope).forEach(s => unclesAunts.add(s))); return Array.from(unclesAunts); };
    const getCousins = (person, scope) => { const unclesAunts = getUnclesAunts(person, scope); const cousins = new Set(); unclesAunts.forEach(ua => getChildren(ua, scope).forEach(c => cousins.add(c))); return Array.from(cousins); };
    
    function getFormattedNameHTML(person) {
        if (!person) return '';
        let nameHTML = `${person.firstName} ${person.lastName.toUpperCase()}`;
        if (person.gender === 'Femme' && person.maidenName && person.maidenName !== person.lastName) {
            // MODIFICATION : Le format est maintenant "Prénom NOM (née NOMDEMJEUNEFILE)"
            nameHTML = `${person.firstName} ${person.lastName.toUpperCase()} (née ${person.maidenName.toUpperCase()})`;
        }
        const nameClass = person.gender === 'Homme' ? 'male' : 'female';
        return `<span class="${nameClass}">${nameHTML}</span>`;
    }

    function getPersonJobTitle(person) {
        if (!person) return 'N/A';
        const raceData = RACES_DATA.races[person.race];
        if (person.isAlive) {
            if (raceData && person.age < raceData.ageTravail) {
                return person.age >= raceData.ageApprentissage ? 'Apprenti(e)' : 'Enfant';
            }
            return person.job?.jobTitle || person.royalTitle || (person.status === 'Retraité(e)' ? `Retraité(e) (Ancien métier: ${person.lastJobTitle || 'non spécifié'})` : 'Sans profession');
        }
        return `Décédé(e) (Ancien métier: ${person.jobBeforeDeath || 'non spécifié'})`;
    }
    
    function getFantasyDate(year, seed) {
        const calendar = CALENDARS[selectedCalendar];
        
        const randomMonth = seededRandom(seed + "month");
        const randomDay = seededRandom(seed + "day");

        const day = Math.floor(randomDay * calendar.daysInMonth) + 1;
        const month = calendar.months[Math.floor(randomMonth * calendar.months.length)];
        
        return `${day}${day === 1 ? 'er' : ''} jour de ${month}, Année ${year}`;
    }

function getPersonEvents(personId, log, campaignYear) {
    if (!log) return '<li>Aucune mention marginale enregistrée.</li>';

    const person = window.populationScope.find(p => p.id === personId);
    if (!person) return '<li>Personnage introuvable.</li>';
    
    const mentions = [];
    const refYear = campaignYear || 0;

    // --- Traitement de l'événement de Mariage (Logique de cohérence V3) ---
    let marriageEvent = null;
    const spouse = person.spouseId ? window.populationScope.find(p => p.id === person.spouseId) : null;

    if (person.gender === 'Homme' && person.spouseId) {
        marriageEvent = log.find(e => e.type === 'marriage' && e.personId === person.id);
    } else if (person.gender === 'Femme' && person.spouseId) {
        marriageEvent = log.find(e => e.type === 'marriage' && e.personId === person.spouseId);
    }
    
    if (marriageEvent && person.spouseId) {
        const marriageYear = marriageEvent.year;
        const displayMarriageYear = refYear === 0 ? marriageYear : refYear + marriageYear;
        const yearsMarried = simulationEndYear - marriageYear;
        const an_s = yearsMarried >= 2 ? 'ans' : 'an';
        
        if (yearsMarried >= 0) {
            mentions.push(`S'est marié(e) en l'an ${displayMarriageYear}. Uni(e) depuis ${yearsMarried} ${an_s}.`);
        }

    } else if (!marriageEvent && person.spouseId && spouse) {
        // Logique d'inférence pour la Génération 0
        const personRaceData = RACES_DATA.races[person.race];
        const spouseRaceData = RACES_DATA.races[spouse.race];

        if (personRaceData && spouseRaceData) {
            // **MODIFICATION**: Utiliser l'âge adulte le plus élevé des deux races pour la cohérence.
            const effectiveAgeAdulte = Math.max(personRaceData.ageAdulte || 18, spouseRaceData.ageAdulte || 18);
            
            const youngestAge = Math.min(person.age, spouse.age);
            const maxYearsMarried = youngestAge - effectiveAgeAdulte;
            
            if (maxYearsMarried > 1) {
                const coupleSeed = [person.id, person.spouseId].sort().join('-');
                const yearsMarried = Math.floor(seededRandom(coupleSeed) * (maxYearsMarried - 1)) + 1;
                const marriageSimYear = simulationEndYear - yearsMarried;
                const displayMarriageYear = refYear === 0 ? marriageSimYear : refYear + marriageSimYear;
                const an_s = yearsMarried >= 2 ? 'ans' : 'an';
                
                mentions.push(`S'est marié(e) en l'an ${displayMarriageYear}. Uni(e) depuis ${yearsMarried} ${an_s}.`);
            }
        }
    }

    // --- Traitement de l'événement de Travail (Log ou Inférence) ---
    if (person.isAlive || person.jobBeforeDeath) {
        const lastJobEvent = log
            .filter(e => e.type === 'job' && e.personId === personId)
            .sort((a, b) => b.tick - a.tick)[0];

        const currentJob = person.isAlive ? person.job : null;
        const jobTitle = person.isAlive ? (currentJob?.jobTitle) : person.jobBeforeDeath;

        if (lastJobEvent && jobTitle) {
            const jobStartDate = lastJobEvent.year;
            const personBirthYear = simulationEndYear - person.age;
            const ageAtHiring = jobStartDate - personBirthYear;
            const yearsInJob = (person.isAlive ? simulationEndYear : person.deathYear) - jobStartDate;
            const an_s_job = yearsInJob >= 2 ? 'ans' : 'an';
            
            if (yearsInJob >= 0 && ageAtHiring >= 0) {
                const statusText = person.isAlive ? `En poste depuis ${yearsInJob} ${an_s_job}` : `A exercé pendant ${yearsInJob} ${an_s_job}`;
                 mentions.push(`A débuté comme ${jobTitle} à l'âge de ${ageAtHiring} ans. ${statusText}.`);
            }

        } else if (!lastJobEvent && jobTitle && person.isAlive) { 
            const raceData = RACES_DATA.races[person.race];
            if (raceData) {
                const ageTravail = raceData.ageTravail;
                const maxYearsInJob = person.age - ageTravail;

                if (maxYearsInJob > 0) {
                    const yearsInJob = Math.floor(seededRandom(person.id + 'jobStartDate') * (maxYearsInJob)) + 1;
                    const ageAtHiring = person.age - yearsInJob;
                    const an_s_job = yearsInJob >= 2 ? 'ans' : 'an';
                    mentions.push(`A débuté comme ${jobTitle} à l'âge de ${ageAtHiring} ans. En poste depuis ${yearsInJob} ${an_s_job}.`);
                }
            }
        }
    }

    if (!person.isAlive) {
        const simDeathYear = person.deathYear;
        const displayDeathYear = simDeathYear ? (refYear === 0 ? simDeathYear : refYear + simDeathYear) : 'inconnue';
        const deathMention = `Est décédé(e) en l'an ${displayDeathYear} à l'âge de ${person.ageAtDeath || person.age} ans. Cause: ${person.causeOfDeath || 'inconnue'}.`;
        mentions.push(deathMention);
    }

    if (mentions.length === 0) {
        return '<li>Aucune mention marginale enregistrée.</li>';
    }

    return mentions.map(mention => `<li>${mention}</li>`).join('');
}


    const findShortestPath = (startNodeId, endNodeId, allPlaces, allRoads, scale, travelMode) => {
        const distances = {};
        const prev = {};
        const pq = new PriorityQueue();
        const nodes = new Map(allPlaces.map(p => [p.id, p]));

        for (const place of allPlaces) {
            distances[place.id] = Infinity;
            prev[place.id] = null;
        }
        distances[startNodeId] = 0;
        pq.enqueue(startNodeId, 0);

        while (!pq.isEmpty()) {
            const { element: uNodeId } = pq.dequeue();

            if (uNodeId === endNodeId) {
                const path = [];
                let currentId = endNodeId;
                while (currentId) {
                    path.unshift(nodes.get(currentId));
                    currentId = prev[currentId];
                }

                if (path.length === 0 || path[0].id !== startNodeId) return null;

                let totalDistance = 0;
                const legs = [];
                for (let i = 0; i < path.length - 1; i++) {
                    const placeA = path[i];
                    const placeB = path[i + 1];
                    const legDistance = axialDistance(placeA.coords, placeB.coords) * (currentRegion.scale || 10);
                    totalDistance += legDistance;

                    const roadKey = getRoadKey(placeA.id, placeB.id);
                    const roadInfo = allRoads[roadKey];
                    const roadType = ROAD_TYPES[roadInfo.type];
                    const legTime = legDistance / (TRAVEL_SPEEDS[travelMode] * (roadType?.modifier || 1));
                    legs.push({ from: placeA.name, to: placeB.name, distance: legDistance, time: legTime, roadTypeName: roadType.name });
                }

                return { path, legs, totalDistance, totalTime: distances[endNodeId] };
            }
            if (uNodeId === null || distances[uNodeId] === Infinity) continue;

            const uNode = nodes.get(uNodeId);
            const neighbors = [];
            for (const roadKey in allRoads) {
                const [id1, id2] = roadKey.split('-').map(Number);
                if (id1 === uNodeId) {
                    neighbors.push(nodes.get(id2));
                } else if (id2 === uNodeId) {
                    neighbors.push(nodes.get(id1));
                }
            }

            for (const vNode of neighbors) {
                if (!vNode) continue;

                const roadKey = getRoadKey(uNodeId, vNode.id);
                const roadInfo = allRoads[roadKey];
                if (!roadInfo) continue;

                const roadType = ROAD_TYPES[roadInfo.type];
                if (!roadType || !roadType.users.includes(travelMode)) continue;

                const distance = axialDistance(uNode.coords, vNode.coords) * (currentRegion.scale || 10);
                const travelTime = distance / (TRAVEL_SPEEDS[travelMode] * roadType.modifier);
                const newTotalTime = distances[uNodeId] + travelTime;

                if (newTotalTime < distances[vNode.id]) {
                    distances[vNode.id] = newTotalTime;
                    prev[vNode.id] = uNodeId;
                    pq.enqueue(vNode.id, newTotalTime);
                }
            }
        }
        return null;
    };

    // --- FONCTIONS DE RENDU HTML ---

    function renderDistanceMatrix(location) {
        let html = `<h3>Distances & Temps de trajet</h3><table>`;
        html += `<thead><tr><th>Destination</th><th>Distance</th><th>Route</th><th>Pied</th><th>Cheval</th><th>Caravane</th></tr></thead><tbody>`;

        const getDistanceBreakdownHtml = (path) => {
            if (!path) return { html: 'N/A', isList: false };
            if (path.legs.length <= 1) {
                return { html: `${path.totalDistance.toFixed(0)} km`, isList: false };
            }
            const legsHtml = path.legs.map((leg, i) => `<li><span>(${i + 1})</span> ${leg.distance.toFixed(0)} km</li>`).join('');
            const totalHtml = `<li><span class="total">Total: ${path.totalDistance.toFixed(0)} km</span></li>`;
            const finalHtml = `<ul class="distance-steps numbered">${legsHtml}${totalHtml}</ul>`;
            return { html: finalHtml, isList: true };
        };
    
        const getTimeBreakdownHtml = (path) => {
            if (!path) return { html: 'N/A', isList: false };
            if (path.legs.length <= 1) {
                return { html: formatTravelTime(path.totalTime), isList: false };
            }
            const legsHtml = path.legs.map((leg, i) => `<li><span>(${i + 1})</span> ${formatTravelTime(leg.time)}</li>`).join('');
            const totalHtml = `<li><span class="total">Total: ${formatTravelTime(path.totalTime)}</span></li>`;
            const finalHtml = `<ul class="time-steps numbered">${legsHtml}${totalHtml}</ul>`;
            return { html: finalHtml, isList: true };
        };
    
        currentRegion.places.forEach(otherPlace => {
            if (otherPlace.id === location.id) return;
    
            const directDistance = axialDistance(location.coords, otherPlace.coords) * (currentRegion.scale || 10);
            const roadKey = getRoadKey(location.id, otherPlace.id);
            const road = currentRegion.roads[roadKey];
            const roadType = road ? ROAD_TYPES[road.type] : null;
    
            html += `<tr><td>${location.name} → ${otherPlace.name}</td>`;
    
            if(roadType) {
                html += `<td>${directDistance.toFixed(0)} km</td>
                <td class="cell-has-list">${roadType.name.split(' / ')[0]}</td>
                <td>${roadType.users.includes('Pied') ? formatTravelTime(directDistance / (TRAVEL_SPEEDS.Pied * roadType.modifier)) : 'N/A'}</td>
                <td>${roadType.users.includes('Cheval') ? formatTravelTime(directDistance / (TRAVEL_SPEEDS.Cheval * roadType.modifier)) : 'N/A'}</td>
                <td>${roadType.users.includes('Caravane') ? formatTravelTime(directDistance / (TRAVEL_SPEEDS.Caravane * roadType.modifier)) : 'N/A'}</td>`;
            } else {
                const pathByFoot = findShortestPath(location.id, otherPlace.id, currentRegion.places, currentRegion.roads, (currentRegion.scale || 10), 'Pied');
    
                if (pathByFoot) {
                    const distanceInfo = getDistanceBreakdownHtml(pathByFoot);
                    html += `<td class="${distanceInfo.isList ? 'cell-has-list' : ''}">${distanceInfo.html}</td>`;
    
                    let routeStepsHtml = `<ul class="route-steps numbered">${pathByFoot.legs.map((leg, i) => `<li><span>(${i + 1})</span>${leg.from} → ${leg.to} <span class="road-type-leg">(${leg.roadTypeName.split(' / ')[0]})</span></li>`).join('')}</ul>`;
                    html += `<td class="cell-has-list">${routeStepsHtml}</td>`;
                    
                    const pathByHorse = findShortestPath(location.id, otherPlace.id, currentRegion.places, currentRegion.roads, (currentRegion.scale || 10), 'Cheval');
                    const pathByCaravan = findShortestPath(location.id, otherPlace.id, currentRegion.places, currentRegion.roads, (currentRegion.scale || 10), 'Caravane');
                    
                    const timeFootInfo = getTimeBreakdownHtml(pathByFoot);
                    const timeHorseInfo = getTimeBreakdownHtml(pathByHorse);
                    const timeCaravanInfo = getTimeBreakdownHtml(pathByCaravan);

                    html += `<td class="${timeFootInfo.isList ? 'cell-has-list' : ''}">${timeFootInfo.html}</td>`;
                    html += `<td class="${timeHorseInfo.isList ? 'cell-has-list' : ''}">${timeHorseInfo.html}</td>`;
                    html += `<td class="${timeCaravanInfo.isList ? 'cell-has-list' : ''}">${timeCaravanInfo.html}</td>`;
    
                } else {
                    html += `<td>${directDistance.toFixed(0)} km (à vol d'oiseau)</td><td colspan="4">Aucun itinéraire terrestre</td>`;
                }
            }
            html += `</tr>`;
        });
        html += `</tbody></table>`;
        return `<div class="distance-matrix">${html}</div>`;
    }

    function renderJobRoster(location) {
        let html = `<h3>Emplois & Occupants du lieu</h3>`;
        const population = location.demographics.population;
        const buildings = location.config.buildings;
    
        html += '<div class="job-roster-enhanced">';
    
        for (const category in buildings) {
            html += `<h4>${category}</h4>`;
            buildings[category].forEach(building => {
                const buildingData = getBuildingData(building.name);
                if (!buildingData) return;
    
                html += `<div class="building-card">
                            <h5>${building.name}</h5>`;
    
                if (buildingData.description) {
                    html += `<p class="building-description">${buildingData.description}</p>`;
                }
    
                if (buildingData.providesTags && buildingData.providesTags.length > 0) {
                    html += `<div class="production-tags">
                                <strong>Produit :</strong> 
                                ${buildingData.providesTags.map(tag => `<span class="tag">${tag}</span>`).join(' ')}
                             </div>`;
                }
    
                html += '<ul class="job-list">';
    
                if (buildingData.emplois) {
                    buildingData.emplois.forEach(jobDef => {
                        const occupants = population.filter(p => p.isAlive && p.job?.buildingName === building.name && p.job?.jobTitle === jobDef.titre);
                        const occupantsHtml = occupants.length > 0
                            ? occupants.map(o => getFormattedNameHTML(o)).join(', ')
                            : `<i>Vacant</i>`;
                        
                        const salaryInCopper = jobDef.salaire?.totalEnCuivre;
                        let salaryDisplayHtml = 'N/A';
                        if (typeof salaryInCopper === 'number' && !isNaN(salaryInCopper)) {
                            salaryDisplayHtml = `${salaryInCopper} pc (${formatCurrency(salaryInCopper)})`;
                        }
    
                        html += `<li class="job-entry">
                                    <div class="job-title">
                                        <strong>${jobDef.titre} (${occupants.length}/${jobDef.postes})</strong>
                                        <span class="job-salary">Salaire: ${salaryDisplayHtml}</span>
                                    </div>
                                    <div class="occupants-list">${occupantsHtml}</div>
                                 </li>`;
                    });
                }
                html += '</ul></div>'; // Fin de .building-card et .job-list
            });
        }
        html += '</div>'; // Fin de .job-roster-enhanced
        return html;
    }

    function renderNarrativeFamilyBooklet(family, location, allPopulationScope, log, campaignYear) {
        let html = `<div class="family-booklet">`;

        const ruler = allPopulationScope.find(p => p.locationId === location.id && p.job && getJobData(p.job.buildingName, p.job.jobTitle)?.tier === 0);
        const archivistName = ruler ? `${ruler.firstName} ${ruler.lastName}` : `l'Administration de ${location.name}`;
        html += `
            <div class="booklet-header">
                <h2>LIVRET DE FAMILLE DU CLAN ${family.name.toUpperCase()}</h2>
                <p>Délivré sous l'autorité de ${location.name}<br>
                Sceau du Gardien des Archives, ${archivistName}</p>
            </div>
        `;

        const members = family.memberIds.map(id => allPopulationScope.find(p => p.id === id)).filter(Boolean);
        if (members.length === 0) return '';

        let couple = [];
        const processedIds = new Set();

        const oldestMember = members.sort((a,b) => b.age - a.age)[0];
        const spouse = getSpouse(oldestMember, allPopulationScope);
        if (spouse && members.some(m => m.id === spouse.id)) {
            couple = [oldestMember, spouse];
        } else {
            couple = [oldestMember];
        }

        const man = couple.find(p => p.gender === 'Homme');
        const woman = couple.find(p => p.gender === 'Femme');

        if (man) { html += renderPersonSection(man, 'ÉPOUX', allPopulationScope, log, campaignYear, location); processedIds.add(man.id); }
        if (woman) { html += renderPersonSection(woman, 'ÉPOUSE', allPopulationScope, log, campaignYear, location); processedIds.add(woman.id); }

        if (man && woman) {
            const marriageEvent = log?.find(e => e.type === 'marriage' && e.personId === man.id);
            let marriageSimYear;

            if (marriageEvent) {
                marriageSimYear = marriageEvent.year;
            } else {
                const manRaceData = RACES_DATA.races[man.race];
                const womanRaceData = RACES_DATA.races[woman.race];

                if (manRaceData && womanRaceData) {
                    // **MODIFICATION**: Utiliser l'âge adulte le plus élevé des deux races.
                    const effectiveAgeAdulte = Math.max(manRaceData.ageAdulte || 18, womanRaceData.ageAdulte || 18);
                    const youngestAgeOfCouple = Math.min(man.age, woman.age);
                    const maxYearsMarried = youngestAgeOfCouple - effectiveAgeAdulte;
                    
                    if (maxYearsMarried > 1) {
                        const coupleSeed = [man.id, woman.id].sort().join('-');
                        const yearsMarried = Math.floor(seededRandom(coupleSeed) * (maxYearsMarried - 1)) + 1;
                        marriageSimYear = simulationEndYear - yearsMarried;
                    } else {
                        marriageSimYear = simulationEndYear - 1; 
                    }
                } else {
                     marriageSimYear = simulationEndYear - 1;
                }
            }

            const refYear = campaignYear || 0;
            const displayMarriageYear = refYear === 0 ? marriageSimYear : refYear + marriageSimYear;
            const marriageSeed = [man.id, woman.id].sort().join('-');
            
            html += `
                <div class="booklet-section marriage-section">
                    <h3>MARIAGE</h3>
                    <p><strong>Célébré le :</strong> ${getFantasyDate(displayMarriageYear, marriageSeed)}</p>
                    <p><strong>Lieu :</strong> ${location.name}</p>
                    <p><strong>Mentions :</strong> Le couple a juré fidélité, unissant leurs destins devant la communauté.</p>
                </div>
            `;
        }

        const children = getChildren(couple[0], allPopulationScope).filter(c => members.some(m => m.id === c.id));
        if (children.length > 0) {
            html += `<div class="booklet-section children-section"><h3>ENFANTS</h3>`;
            children.sort((a,b) => a.age - b.age).forEach((child, index) => {
                html += renderPersonSection(child, `ENFANT ${index + 1}`, allPopulationScope, log, campaignYear, location);
                processedIds.add(child.id);
            });
            html += `</div>`;
        }
        
        const remainingMembers = members.filter(m => !processedIds.has(m.id));
        if(remainingMembers.length > 0) {
            html += `<div class="booklet-section other-members-section"><h3>AUTRES MEMBRES RATTACHÉS</h3>`;
            remainingMembers.forEach(member => {
                 html += renderPersonSection(member, 'MEMBRE', allPopulationScope, log, campaignYear, location);
            });
            html += `</div>`;
        }

        html += `</div>`;
        return html;
    }

    function renderPersonSection(person, role, allPopulationScope, log, campaignYear, location) {
        if (!person) return '';
        const simBirthYear = simulationEndYear - person.age;
        const refYear = campaignYear || 0;
        const displayBirthYear = refYear === 0 ? simBirthYear : refYear + simBirthYear;
        const parents = getParents(person, allPopulationScope);
        const father = parents.find(p => p.gender === 'Homme');
        const mother = parents.find(p => p.gender === 'Femme');
        const spouse = getSpouse(person, allPopulationScope);

        let html = `<div class="booklet-person-details"><h4>${role}</h4>`;
        html += `
            <dl>
                <dt>Nom :</dt><dd>${getFormattedNameHTML(person)}</dd>
                <dt>Né(e) le :</dt><dd>${getFantasyDate(displayBirthYear, person.id.toString())} (${person.isAlive ? person.age + ' ans' : 'décédé(e)'})</dd>
                <dt>Lieu de naissance :</dt><dd>${person.locationId ? allPopulationScope.find(p => p.id === person.locationId)?.locationName || location.name : location.name}</dd>
                <dt>Race :</dt><dd>${person.race}</dd>
                <dt>Profession exercée :</dt><dd>${getPersonJobTitle(person)}</dd>
                <dt>Père :</dt><dd>${father ? father.firstName + ' ' + father.lastName.toUpperCase() : 'Inconnu'} ${father && !father.isAlive ? '(décédé)' : ''}</dd>
                <dt>Mère :</dt><dd>${mother ? mother.firstName + ' ' + mother.lastName.toUpperCase() : 'Inconnue'} ${mother && !mother.isAlive ? '(décédée)' : ''}</dd>
                <dt>Conjoint(e) :</dt><dd>${spouse ? getFormattedNameHTML(spouse) + (!spouse.isAlive ? ' (décédé(e))' : '') : 'Célibataire'}</dd>
            </dl>
            <h5>MENTIONS MARGINALES :</h5>
            <ul class="mentions-marginales">
                ${getPersonEvents(person.id, log, campaignYear)}
            </ul>
        `;
        html += `</div>`;
        return html;
    }

    function renderFamilies(location, campaignYear) {
        let html = `<div id="family-booklets-container">`;
        const { families, population } = location.demographics;
        const allPopulationScope = currentRegion.places.flatMap(p => p.demographics.population.map(person => ({...person, locationName: p.name})));
        const log = currentRegion.log || []; 

        families
            .filter(f => f.memberIds.some(id => population.find(p => p.id === id))) 
            .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
            .forEach(family => {
                html += renderNarrativeFamilyBooklet(family, location, allPopulationScope, log, campaignYear);
            });

        html += `</div>`;
        return html;
    }


    function renderCharacterSheets(location) {
        let html = `<div id="character-sheets-container">`;
        const population = location.demographics.population;
        population
            .filter(person => person.isAlive)
            .sort((a,b) => (a.lastName || '').localeCompare(b.lastName || '') || (a.firstName || '').localeCompare(b.firstName || ''))
            .forEach(person => {
                const allPopulation = currentRegion.places.flatMap(p => p.demographics.population);
                html += renderSingleCharacterSheet(person, allPopulation)
            });
        html += `</div>`;
        return html;
    }


    function renderBuildingView(buildingName, location) {
        const buildingData = getBuildingData(buildingName);
        const population = location.demographics.population;
        let html = `<div class="print-section building-details-view"><h2><span class="location-title">${location.name}</span> &gt; ${buildingName}</h2>`;
        html += `<p>${buildingData.description}</p>`;

        if (buildingData?.emplois) {
            html += `<h3>Personnel</h3><div class="job-roster"><ul>`;
            buildingData.emplois.forEach(jobDef => {
                const occupants = population.filter(p => p.job?.buildingName === buildingName && p.job?.jobTitle === jobDef.titre);
                const occupantsHtml = occupants.length > 0 ? occupants.map(o => `${getFormattedNameHTML(o)} (${o.age} ans)`).join(', ') : `<i>Vacant</i>`;
                html += `<li><strong>${jobDef.titre} (${occupants.length}/${jobDef.postes}):</strong> ${occupantsHtml}</li>`;
            });
            html += `</ul></div>`;
        }
        html += `</div>`;
        contentArea.innerHTML = html;
    }

    function renderCharacterView(personId, location) {
        const person = getPersonById(personId, location.demographics.population);
        if (!person || !person.isAlive) {
            renderLocationView(selectedLocation);
            return;
        }
        const allPopulation = currentRegion.places.flatMap(p => p.demographics.population);

        let html = `<div class="print-section character-sheet-full-view"><h2><span class="location-title">${location.name}</span> &gt; Dossier de Personnage</h2>`;
        html += renderSingleCharacterSheet(person, allPopulation);
        html += `</div>`;
        contentArea.innerHTML = html;
    }
    
    function renderPathfinderSkills(mods) {
        const { strMod, dexMod, intMod, wisMod, chaMod } = mods;
        const skills = [
            { name: "Acrobaties", mod: dexMod }, { name: "Artisanat (____________)", mod: intMod }, { name: "Artisanat (____________)", mod: intMod }, { name: "Artisanat (____________)", mod: intMod },
            { name: "Art de la magie*", mod: chaMod }, { name: "Bluff", mod: chaMod }, { name: "Connaissances (exploration)*", mod: intMod }, { name: "Connaissances (folklore local)*", mod: intMod },
            { name: "Connaissances (géographie)*", mod: intMod }, { name: "Connaissances (histoire)*", mod: intMod }, { name: "Connaissances (ingénierie)*", mod: intMod }, { name: "Connaissances (mystères)*", mod: intMod },
            { name: "Connaissances (nature)*", mod: intMod }, { name: "Connaissances (noblesse)*", mod: intMod }, { name: "Connaissances (plans)*", mod: intMod }, { name: "Connaissances (religion)*", mod: intMod },
            { name: "Déguisement", mod: chaMod }, { name: "Diplomatie", mod: chaMod }, { name: "Discrétion", mod: dexMod }, { name: "Dressage*", mod: chaMod }, { name: "Équitation", mod: dexMod }, { name: "Escalade", mod: strMod },
            { name: "Escamotage*", mod: dexMod }, { name: "Estimation", mod: intMod }, { name: "Intimidation", mod: chaMod }, { name: "Linguistique*", mod: intMod }, { name: "Natation", mod: strMod }, { name: "Perception", mod: wisMod },
            { name: "Premiers secours", mod: wisMod }, { name: "Profession* (____________)", mod: wisMod }, { name: "Profession* (____________)", mod: wisMod }, { name: "Représentation (____________)", mod: chaMod },
            { name: "Représentation (____________)", mod: chaMod }, { name: "Sabotage*", mod: dexMod }, { name: "Survie", mod: wisMod }, { name: "Utilisation d'objets magiques*", mod: chaMod }, { name: "Vol", mod: dexMod }
        ];
    
        const totalBonus = (mod) => mod >= 0 ? `+${mod}` : mod;
    
        const skillsHtml = skills.map(skill => `
            <li class="pf-skill-item">
                <span class="pf-skill-name">${skill.name}</span>
                <span class="pf-skill-total">${totalBonus(skill.mod)}</span>
            </li>
        `).join('');
    
        return `
        <aside class="pathfinder-skills-container">
            <h4>Compétences</h4>
            <ul class="pathfinder-skills-list">
                ${skillsHtml}
            </ul>
        </aside>`;
    }

    function renderSingleCharacterSheet(person, populationScope) {
        if (!person) return '';

        const raceData = RACES_DATA.races[person.race];
        const finalScores = getDisplayStats(person);
        const str = finalScores.force, dex = finalScores.dexterite, con = finalScores.constitution,
              int = finalScores.intelligence, wis = finalScores.sagesse, cha = finalScores.charisme;
        const strMod = Math.floor((str - 10) / 2), dexMod = Math.floor((dex - 10) / 2), conMod = Math.floor((con - 10) / 2),
              intMod = Math.floor((int - 10) / 2), wisMod = Math.floor((wis - 10) / 2), chaMod = Math.floor((cha - 10) / 2);

        const caValue = 10 + conMod;
        const iniValue = dexMod;
        const formattedIniValue = `${iniValue >= 0 ? '+' : ''}${iniValue}`;
        
        let skillsSectionHtml = '';
        if (currentGameSystem === 'pathfinder') {
            skillsSectionHtml = renderPathfinderSkills({ strMod, dexMod, intMod, wisMod, chaMod });
        } else { // D&D 5e (default)
            const skills = [
                { name: "Acrobaties", mod: dexMod, base: '(Dex)' }, { name: "Arcanes", mod: intMod, base: '(Int)' }, { name: "Athlétisme", mod: strMod, base: '(For)' },
                { name: "Discrétion", mod: dexMod, base: '(Dex)' }, { name: "Dressage", mod: wisMod, base: '(Sag)' }, { name: "Escamotage", mod: dexMod, base: '(Dex)' }, { name: "Histoire", mod: intMod, base: '(Int)' },
                { name: "Intimidation", mod: chaMod, base: '(Cha)' }, { name: "Intuition", mod: wisMod, base: '(Sag)' }, { name: "Investigation", mod: intMod, base: '(Int)' }, { name: "Médecine", mod: wisMod, base: '(Sag)' },
                { name: "Nature", mod: intMod, base: '(Int)' }, { name: "Perception", mod: wisMod, base: '(Sag)' }, { name: "Persuasion", mod: chaMod, base: '(Cha)' }, { name: "Religion", mod: intMod, base: '(Int)' },
                { name: "Représentation", mod: chaMod, base: '(Cha)' }, { name: "Survie", mod: wisMod, base: '(Sag)' }, { name: "Tromperie", mod: chaMod, base: '(Cha)' }
            ];
            const skillsHtml = skills.map(skill => `<li class="skill-item"><span class="skill-mod">${skill.mod >= 0 ? '+' : ''}${skill.mod}</span><span class="skill-name">${skill.name} <span class="skill-base">${skill.base}</span></span></li>`).join('');
            skillsSectionHtml = `<aside class="skills-list-container"><h4>Compétences</h4><ul>${skillsHtml}</ul></aside>`;
        }

        const spouse = getSpouse(person, populationScope), children = getChildren(person, populationScope), parents = getParents(person, populationScope),
              siblings = getSiblings(person, populationScope), father = parents.find(p => p.gender === 'Homme'), mother = parents.find(p => p.gender === 'Femme'),
              paternalUnclesAunts = father ? getSiblings(father, populationScope) : [], maternalUnclesAunts = mother ? getSiblings(mother, populationScope) : [];
        const jobTitle = getPersonJobTitle(person);
        const personLocation = currentRegion.places.find(p => p.id === person.locationId);
        const ageLine = `${person.age} ans`;
        const residence = personLocation ? personLocation.name : 'Inconnue';
        
        let totalCopper = 0;
        const randomCopperBonus = Math.floor(Math.random() * (499 - 5 + 1)) + 5;
        if (person.isAlive && raceData && person.age >= raceData.ageTravail) {
            if (person.job && person.job.buildingName && person.job.jobTitle) {
                const jobData = getJobData(person.job.buildingName, person.job.jobTitle);
                if (jobData && jobData.salaire && typeof jobData.salaire.totalEnCuivre === 'number') {
                    totalCopper = (jobData.salaire.totalEnCuivre * 12) + randomCopperBonus;
                }
            } else totalCopper = randomCopperBonus;
        } else totalCopper = randomCopperBonus;
        const goldPieces = Math.floor(totalCopper / 1000), silverPieces = Math.floor((totalCopper % 1000) / 10), copperPieces = totalCopper % 10;
        const formattedMoney = `${goldPieces}po ${silverPieces}pa ${copperPieces}pc`;

        const formatPersonLink = p => `${getFormattedNameHTML(p)} (${p.isAlive ? p.age + ' ans' : 'décédé(e)'}) <i>(${getPersonJobTitle(p)})</i>`;
        const friends = (person.friendIds || []).map(id => getPersonById(id, populationScope)).filter(Boolean);
        const acquaintances = (person.acquaintanceIds || []).map(id => getPersonById(id, populationScope)).filter(Boolean);
        const friendsListHtml = friends.length > 0 ? friends.map(f => `<li>${getFormattedNameHTML(f)} <i>(${getPersonJobTitle(f)})</i></li>`).join('') : '<li>Aucun</li>';
        const acquaintancesListHtml = acquaintances.length > 0 ? acquaintances.map(a => `<li>${getFormattedNameHTML(a)} <i>(${getPersonJobTitle(a)})</i></li>`).join('') : '<li>Aucune</li>';

        return `
        <div class="character-sheet dossier-view">
            <header class="char-sheet-header"><h3>${getFormattedNameHTML(person)}</h3><p>${person.race} / ${person.gender} / Résidant à ${residence} / Argent: ${formattedMoney}</p></header>
            <div class="char-sheet-main-grid">
                <aside class="char-sheet-stats">
                    <div class="stat-box"><span class="label">Force</span><span class="score">${str}</span><span class="modifier">${strMod >= 0 ? '+' : ''}${strMod}</span></div>
                    <div class="stat-box"><span class="label">Dextérité</span><span class="score">${dex}</span><span class="modifier">${dexMod >= 0 ? '+' : ''}${dexMod}</span></div>
                    <div class="stat-box"><span class="label">Constitution</span><span class="score">${con}</span><span class="modifier">${conMod >= 0 ? '+' : ''}${conMod}</span></div>
                    <div class="stat-box"><span class="label">Intelligence</span><span class="score">${int}</span><span class="modifier">${intMod >= 0 ? '+' : ''}${intMod}</span></div>
                    <div class="stat-box"><span class="label">Sagesse</span><span class="score">${wis}</span><span class="modifier">${wisMod >= 0 ? '+' : ''}${wisMod}</span></div>
                    <div class="stat-box"><span class="label">Charisme</span><span class="score">${cha}</span><span class="modifier">${chaMod >= 0 ? '+' : ''}${chaMod}</span></div>
                    <div class="combat-stats-container"><div class="combat-box"><div class="combat-value">${caValue}</div><div class="combat-label">CA</div></div><div class="combat-box"><div class="combat-value">${formattedIniValue}</div><div class="combat-label">INITIATIVE</div></div></div>
                </aside>
                <div class="char-sheet-main-content">
                    <section class="char-sheet-info"><div class="info-block"><h4>État Civil & Occupation</h4><div class="info-line"><span><strong>Âge :</strong> ${ageLine} </span><span><strong>Prestige :</strong> ${person.prestige ? person.prestige.toFixed(0) : '0'} </span><span><strong>Occupation :</strong> ${jobTitle}</span></div></div></section>
                    ${skillsSectionHtml}
                </div>
            </div>
            <div class="char-sheet-details">
                <div class="details-section"><h4>Cercle Social & Familial</h4><div class="social-grid">
                    <div><strong>Parents:</strong><ul>${parents.length > 0 ? parents.map(p => `<li>${formatPersonLink(p)}</li>`).join('') : '<li>Inconnus</li>'}</ul></div>
                    <div><strong>Fratrie:</strong><ul>${siblings.length > 0 ? siblings.map(s => `<li>${formatPersonLink(s)}</li>`).join('') : '<li>Aucune</li>'}</ul></div>
                    <div><strong>Oncles & Tantes (Paternel):</strong><ul>${paternalUnclesAunts.length > 0 ? paternalUnclesAunts.map(p => `<li>${formatPersonLink(p)}</li>`).join('') : '<li>Aucun</li>'}</ul></div>
                    <div><strong>Oncles & Tantes (Maternel):</strong><ul>${maternalUnclesAunts.length > 0 ? maternalUnclesAunts.map(p => `<li>${formatPersonLink(p)}</li>`).join('') : '<li>Aucun</li>'}</ul></div>
                    <div><strong>Conjoint(e):</strong><p>${spouse ? formatPersonLink(spouse) : 'Célibataire'}</p></div>
                    <div><strong>Enfants:</strong><ul>${children.length > 0 ? children.map(c => `<li>${formatPersonLink(c)}</li>`).join('') : '<li>Aucun</li>'}</ul></div>
                </div></div>
                <div class="details-section"><h4>Relations</h4><div class="social-grid">
                    <div><strong>Amis:</strong><ul>${friendsListHtml}</ul></div>
                    <div><strong>Connaissances:</strong><ul>${acquaintancesListHtml}</ul></div>
                </div></div>
            </div>
        </div>`;
    }

    function renderLocationView(location) {
        const hasPopulation = location.demographics?.population.length > 0;
    
        let tabLinks = '';
        let tabContent = '';
    
        if (hasPopulation) {
            tabLinks = `
                <button class="tab-link active" data-tab="tab-characters">Fiches des Personnages</button>
                <button class="tab-link" data-tab="tab-jobs">Emplois & Occupants</button>
                <button class="tab-link" data-tab="tab-families">Les Familles du lieu</button>
                <button class="tab-link" data-tab="tab-distances">Distances & Temps de trajet</button>
            `;
            tabContent = `
                <div id="tab-characters" class="tab-content active">${renderCharacterSheets(location)}</div>
                 <div id="tab-jobs" class="tab-content">${renderJobRoster(location)}</div>
                <div id="tab-families" class="tab-content">
                    <div class="campaign-date-input-container">
                         <label for="campaign-year">Année de votre campagne :</label>
                         <input type="number" id="campaign-year" placeholder="Ex: 1350" value="1350">
                    </div>
                    ${renderFamilies(location, 1350)}
                </div>
                <div id="tab-distances" class="tab-content">${renderDistanceMatrix(location)}</div>
            `;
        } else {
             tabLinks = `<button class="tab-link active" data-tab="tab-distances">Distances & Temps de trajet</button><button class="tab-link" data-tab="tab-jobs">Emplois & Occupants</button>`;
            tabContent = `<div id="tab-distances" class="tab-content active">${renderDistanceMatrix(location)}</div><div id="tab-jobs" class="tab-content">${renderJobRoster(location)}</div>`;
        }
    
        const finalHtml = `<h2><span class="location-title">${location.name}</span></h2><div class="tabs-container"><div class="tab-links">${tabLinks}</div><div class="tab-content-container">${tabContent}</div></div>`;
        contentArea.innerHTML = finalHtml;
    
        contentArea.querySelector('.tab-links').addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON') {
                const tabId = e.target.dataset.tab;
                if (e.target.classList.contains('active')) return;

                if (tabId === 'tab-families') {
                    showNotification("Conseil : Choisissez votre Calendrier et renseignez l'année de début de votre campagne pour un calcul précis des dates.", 'info', 9000);
                }

                contentArea.querySelectorAll('.tab-link').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                contentArea.querySelectorAll('.tab-content').forEach(content => { content.classList.remove('active'); if (content.id === tabId) content.classList.add('active'); });
            }
        });

        const campaignYearInput = contentArea.querySelector('#campaign-year');
        if (campaignYearInput) {
            campaignYearInput.addEventListener('input', () => {
                const parsedYear = parseInt(campaignYearInput.value, 10);
                const newYear = isNaN(parsedYear) ? 1350 : parsedYear;
                const bookletsContainer = contentArea.querySelector('#family-booklets-container');
                if (bookletsContainer) {
                    const newBookletsHTML = renderFamilies(location, newYear);
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = newBookletsHTML;
                    const newContainer = tempDiv.firstChild;
                    if(newContainer) bookletsContainer.replaceWith(newContainer);
                }
            });
        }
    }

    function populateSelectors(location) { /* No longer used */ }
    
    function init() {
        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) {
            contentArea.innerHTML = '<h1>Aucune donnée de simulation trouvée.</h1><p>Veuillez compléter les étapes précédentes.</p>';
            return;
        }
        regions = JSON.parse(data);
        const lastRegionId = localStorage.getItem(LAST_REGION_KEY);
        currentRegion = regions.find(r => r.id == lastRegionId) || regions[0];

        updateAllNavLinksState(currentRegion);

        if (!currentRegion?.places?.length) {
            contentArea.innerHTML = '<h1>Région non valide ou vide.</h1><p>Retournez aux étapes précédentes.</p>';
            return;
        }

        window.populationScope = currentRegion.places.flatMap(p => p.demographics.population);
        
        if (currentRegion.simulationClock && currentRegion.simulationClock.year) {
            simulationEndYear = currentRegion.simulationClock.year;
        } else if (currentRegion.log && currentRegion.log.length > 0) {
            simulationEndYear = currentRegion.log.reduce((latestYear, event) => event.year > latestYear ? event.year : latestYear, 1);
        } else {
            simulationEndYear = 1;
        }

        locationSelect.innerHTML = currentRegion.places.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
        selectedLocation = currentRegion.places[0];

        populateSelectors(selectedLocation);
        renderLocationView(selectedLocation);

        locationSelect.addEventListener('change', (e) => {
            selectedLocation = currentRegion.places.find(p => p.id == e.target.value);
            populateSelectors(selectedLocation);
            renderLocationView(selectedLocation);
        });

        systemSelect.addEventListener('change', (e) => {
            currentGameSystem = e.target.value;
            renderLocationView(selectedLocation);
        });
        
        calendarSelect.addEventListener('change', (e) => {
            selectedCalendar = e.target.value;
            renderLocationView(selectedLocation); 
        });

        globalSearchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            globalSearchResults.innerHTML = '';
            if (query.length < 2) { globalSearchResults.style.display = 'none'; return; }
            const matches = window.populationScope.filter(person => person.isAlive && `${person.firstName} ${person.lastName}`.toLowerCase().includes(query)).slice(0, 10);
            if (matches.length > 0) {
                matches.forEach(person => {
                    const personLocation = currentRegion.places.find(p => p.id === person.locationId);
                    const item = document.createElement('div');
                    item.classList.add('search-result-item');
                    item.textContent = `${person.firstName} ${person.lastName} (${personLocation.name})`;
                    item.dataset.personId = person.id;
                    item.addEventListener('click', () => {
                        const clickedPerson = window.populationScope.find(p => p.id === person.id);
                        const clickedLocation = currentRegion.places.find(l => l.id === clickedPerson.locationId);
                        if (clickedPerson && clickedLocation) {
                            selectedLocation = clickedLocation;
                            locationSelect.value = clickedLocation.id;
                            populateSelectors(clickedLocation);
                            renderCharacterView(clickedPerson.id, clickedLocation);
                            globalSearchInput.value = '';
                            globalSearchResults.style.display = 'none';
                        }
                    });
                    globalSearchResults.appendChild(item);
                });
                globalSearchResults.style.display = 'block';
            } else { globalSearchResults.style.display = 'none'; }
        });

        document.addEventListener('click', (e) => { if (!globalSearchInput.contains(e.target)) globalSearchResults.style.display = 'none'; });
        printBtn.addEventListener('click', () => window.print());
        
        const saveBtn = document.getElementById('save-json-btn');
        if(saveBtn) {
            saveBtn.addEventListener('click', () => {
                if (!currentRegion) {
                    alert("Aucune région n'est chargée pour la sauvegarde.");
                    return;
                }
                const jsonData = JSON.stringify(currentRegion, null, 2);
                const blob = new Blob([jsonData], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `EcoSimRPG_Region_${currentRegion.name.replace(/\s+/g, '_')}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            });
        }

        const loadBtn = document.getElementById('load-json-btn');
        const fileInput = document.getElementById('json-file-input');
        if(loadBtn && fileInput) {
            loadBtn.addEventListener('click', () => {
                fileInput.click();
            });

            fileInput.addEventListener('change', (event) => {
                const file = event.target.files[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const importedRegion = JSON.parse(e.target.result);
                        
                        if (!importedRegion.id || !importedRegion.name || !importedRegion.places) {
                            throw new Error("Le fichier JSON ne semble pas être une région valide.");
                        }

                        let existingRegions = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
                        const regionIndex = existingRegions.findIndex(r => r.id === importedRegion.id);

                        if (regionIndex > -1) {
                            existingRegions[regionIndex] = importedRegion;
                        } else {
                            existingRegions.push(importedRegion);
                        }

                        localStorage.setItem(STORAGE_KEY, JSON.stringify(existingRegions));
                        localStorage.setItem(LAST_REGION_KEY, importedRegion.id);

                        alert(`La région "${importedRegion.name}" a été chargée avec succès ! La page va être rechargée.`);
                        location.reload();

                    } catch (error) {
                        alert('Erreur lors de la lecture ou de l\'analyse du fichier JSON :\n' + error.message);
                    } finally {
                        fileInput.value = '';
                    }
                };
                reader.readAsText(file);
            });
        }

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
                            message = "Veuillez d'abord générer la population initiale (Étape 3)."; 
                            break;
                        case 'nav-step5': 
                            message = "Cette étape est déverrouillée une fois que la simulation (Étape 4) a atteint 60 ans."; 
                            break;
                    }
                    alert(message);
                }
            });
        }
    }

    init();
});