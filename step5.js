/**
 * EcoSimRPG - step5.js
 * Page d'exploitation et d'impression des données de simulation.
 * VERSION 9.2 - Amélioration de l'affichage des distances et de l'alignement
 * - La colonne "Distance" affiche désormais le détail de chaque étape pour les trajets indirects.
 * - L'alignement des cellules du tableau de distance est amélioré pour une meilleure lisibilité.
 */
document.addEventListener('DOMContentLoaded', () => {

    // --- CONSTANTES & CONFIGURATION ---
    const STORAGE_KEY = 'ecoSimRPG_map_data';
    const LAST_REGION_KEY = 'ecoSimRPG_last_region_id';
    const BUILDING_DATA = window.EcoSimData.buildings;
    const RACES_DATA = window.EcoSimData.racesData;
    const TRAVEL_SPEEDS = { Pied: 30, Cheval: 70, Caravane: 20 };
    const ROAD_TYPES = {
        'royal':      { name: 'Route Royale',       modifier: 1.0,  users: ['Pied', 'Cheval', 'Caravane'] },
        'comtal':     { name: 'Route Comtale',      modifier: 0.90, users: ['Pied', 'Cheval', 'Caravane'] },
        'marchand':   { name: 'Voie Marchande',     modifier: 0.80, users: ['Pied', 'Cheval', 'Caravane'] },
        'seigneurial':{ name: 'Chemin Seigneurial', modifier: 0.70, users: ['Pied', 'Cheval', 'Caravane'] },
        'traverse':   { name: 'Chemin de Traverse', modifier: 0.60, users: ['Pied', 'Cheval'] },
        'forestier':  { name: 'Sentier Forestier',  modifier: 0.50, users: ['Pied', 'Cheval'] },
        'montagne':   { name: 'Sentier de Montagne',modifier: 0.40, users: ['Pied', 'Cheval'] }
    };

    // --- SÉLECTEURS DOM ---
    const locationSelect = document.getElementById('location-select');
    const buildingSelect = document.getElementById('building-select');
    const characterSelect = document.getElementById('character-select');
    const systemSelect = document.getElementById('system-select');
    const printBtn = document.getElementById('print-btn');
    const contentArea = document.getElementById('content-area');
    const globalSearchInput = document.getElementById('global-character-search');
    const globalSearchResults = document.getElementById('global-search-results');


    // --- ÉTAT DE L'APPLICATION ---
    let regions = [];
    let currentRegion = null;
    let selectedLocation = null;
    let currentGameSystem = 'dnd5'; // 'dnd5' or 'pathfinder'

    // --- HELPER CLASS for Pathfinding ---
    class PriorityQueue {
        constructor() { this.values = []; }
        enqueue(element, priority) { this.values.push({ element, priority }); this.sort(); }
        dequeue() { return this.values.shift(); }
        isEmpty() { return this.values.length === 0; }
        sort() { this.values.sort((a, b) => a.priority - b.priority); }
    }

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

    // --- FONCTIONS UTILITAIRES & GÉNÉALOGIQUES ---
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
    const getChildren = (person, scope) => (person.childrenIds || []).map(id => getPersonById(id, scope)).filter(Boolean);
    const getSpouse = (person, scope) => person.spouseId ? getPersonById(person.spouseId, scope) : null;
    const getUnclesAunts = (person, scope) => { const parents = getParents(person, scope); const unclesAunts = new Set(); parents.forEach(p => getSiblings(p, scope).forEach(s => unclesAunts.add(s))); return Array.from(unclesAunts); };
    const getCousins = (person, scope) => { const unclesAunts = getUnclesAunts(person, scope); const cousins = new Set(); unclesAunts.forEach(ua => getChildren(ua, scope).forEach(c => cousins.add(c))); return Array.from(cousins); };

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

        // Helper pour générer le HTML du détail de la distance
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
    
        // Helper pour générer le HTML du détail du temps de trajet
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
        let html = `<h3>Emplois & Occupants</h3>`;
        const population = location.demographics.population;
        const buildings = location.config.buildings;
        for (const category in buildings) {
            html += `<h4>${category}</h4>`;
            buildings[category].forEach(building => {
                html += `<div><h5>${building.name}</h5><ul>`;
                const buildingData = getBuildingData(building.name);
                if (buildingData?.emplois) {
                    buildingData.emplois.forEach(jobDef => {
                        const occupants = population.filter(p => p.job?.buildingName === building.name && p.job?.jobTitle === jobDef.titre);
                        html += `<li><strong>${jobDef.titre} (${occupants.length}/${jobDef.postes}):</strong> ${occupants.length > 0 ? occupants.map(o => `${o.firstName} ${o.lastName}`).join(', ') : `<i>Vacant</i>`}</li>`;
                    });
                }
                html += `</ul></div>`;
            });
        }
        return `<div class="job-roster">${html}</div>`;
    }

    function renderFamilies(location) {
        let html = `<div id="families-grid">`;
        const { families, population } = location.demographics;
        families.sort((a,b) => (a.name || '').localeCompare(b.name || '')).forEach(family => {
            html += `<div class="family-card"><h3>Famille ${family.name}</h3><ul>`;
            const members = family.memberIds.map(id => population.find(p => p.id === id)).filter(Boolean);
            members.sort((a,b) => (b.age || 0) - (a.age || 0)).forEach(member => {
                 const ageText = member.isAlive ? `${member.age} ans` : `décédé(e) à ${member.ageAtDeath || member.age} ans`;
                 let jobText = member.job?.jobTitle || member.royalTitle;

                 const raceData = RACES_DATA.races[member.race];
                 const isChild = member.isAlive && raceData && member.age < raceData.ageTravail;
                 const isApprentice = member.isAlive && raceData && member.age >= raceData.ageApprentissage && member.age < raceData.ageTravail;

                 if (isChild) {
                    jobText = isApprentice ? 'Apprenti' : 'Enfant';
                 } else if (member.isAlive) {
                     jobText = jobText || 'Sans emploi';
                 } else {
                     jobText = jobText || 'aucun emploi connu';
                 }

                 let nameClass = '';
                 if (member.gender === 'Homme') {
                     nameClass = 'male';
                 } else if (member.gender === 'Femme') {
                     nameClass = 'female';
                 }

                 let formattedName = `<span class="${nameClass}">${member.firstName}</span>`;
                 if (!member.isAlive) {
                     formattedName = `<s>${formattedName}</s>`;
                 }

                 html += `<li><strong>${formattedName} ${family.name}</strong> (${ageText}) - ${jobText}</li>`;
            });
            html += `</ul></div>`;
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
                html += `<li><strong>${jobDef.titre} (${occupants.length}/${jobDef.postes}):</strong> ${occupants.length > 0 ? occupants.map(o => `${o.firstName} ${o.lastName} (${o.age} ans)`).join(', ') : `<i>Vacant</i>`}</li>`;
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
            { name: "Acrobaties", mod: dexMod },
            { name: "Artisanat (____________)", mod: intMod },
            { name: "Artisanat (____________)", mod: intMod },
            { name: "Artisanat (____________)", mod: intMod },
            { name: "Art de la magie*", mod: chaMod },
            { name: "Bluff", mod: chaMod },
            { name: "Connaissances (exploration)*", mod: intMod },
            { name: "Connaissances (folklore local)*", mod: intMod },
            { name: "Connaissances (géographie)*", mod: intMod },
            { name: "Connaissances (histoire)*", mod: intMod },
            { name: "Connaissances (ingénierie)*", mod: intMod },
            { name: "Connaissances (mystères)*", mod: intMod },
            { name: "Connaissances (nature)*", mod: intMod },
            { name: "Connaissances (noblesse)*", mod: intMod },
            { name: "Connaissances (plans)*", mod: intMod },
            { name: "Connaissances (religion)*", mod: intMod },
            { name: "Déguisement", mod: chaMod },
            { name: "Diplomatie", mod: chaMod },
            { name: "Discrétion", mod: dexMod },
            { name: "Dressage*", mod: chaMod },
            { name: "Équitation", mod: dexMod },
            { name: "Escalade", mod: strMod },
            { name: "Escamotage*", mod: dexMod },
            { name: "Estimation", mod: intMod },
            { name: "Intimidation", mod: chaMod },
            { name: "Linguistique*", mod: intMod },
            { name: "Natation", mod: strMod },
            { name: "Perception", mod: wisMod },
            { name: "Premiers secours", mod: wisMod },
            { name: "Profession* (____________)", mod: wisMod },
            { name: "Profession* (____________)", mod: wisMod },
            { name: "Représentation (____________)", mod: chaMod },
            { name: "Représentation (____________)", mod: chaMod },
            { name: "Sabotage*", mod: dexMod },
            { name: "Survie", mod: wisMod },
            { name: "Utilisation d'objets magiques*", mod: chaMod },
            { name: "Vol", mod: dexMod }
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

        const finalScores = getDisplayStats(person);
        const str = finalScores.force;
        const dex = finalScores.dexterite;
        const con = finalScores.constitution;
        const int = finalScores.intelligence;
        const wis = finalScores.sagesse;
        const cha = finalScores.charisme;

        const strMod = Math.floor((str - 10) / 2);
        const dexMod = Math.floor((dex - 10) / 2);
        const conMod = Math.floor((con - 10) / 2);
        const intMod = Math.floor((int - 10) / 2);
        const wisMod = Math.floor((wis - 10) / 2);
        const chaMod = Math.floor((cha - 10) / 2);

        const caValue = 10 + conMod;
        const iniValue = dexMod;
        const formattedIniValue = `${iniValue >= 0 ? '+' : ''}${iniValue}`;
        
        let skillsSectionHtml = '';
        if (currentGameSystem === 'pathfinder') {
            skillsSectionHtml = renderPathfinderSkills({ strMod, dexMod, intMod, wisMod, chaMod });
        } else { // D&D 5e (default)
            const skills = [
                { name: "Acrobaties", mod: dexMod, base: '(Dex)' }, { name: "Arcanes", mod: intMod, base: '(Int)' },
                { name: "Athlétisme", mod: strMod, base: '(For)' }, { name: "Discrétion", mod: dexMod, base: '(Dex)' },
                { name: "Dressage", mod: wisMod, base: '(Sag)' }, { name: "Escamotage", mod: dexMod, base: '(Dex)' },
                { name: "Histoire", mod: intMod, base: '(Int)' }, { name: "Intimidation", mod: chaMod, base: '(Cha)' },
                { name: "Intuition", mod: wisMod, base: '(Sag)' }, { name: "Investigation", mod: intMod, base: '(Int)' },
                { name: "Médecine", mod: wisMod, base: '(Sag)' }, { name: "Nature", mod: intMod, base: '(Int)' },
                { name: "Perception", mod: wisMod, base: '(Sag)' }, { name: "Persuasion", mod: chaMod, base: '(Cha)' },
                { name: "Religion", mod: intMod, base: '(Int)' }, { name: "Représentation", mod: chaMod, base: '(Cha)' },
                { name: "Survie", mod: wisMod, base: '(Sag)' }, { name: "Tromperie", mod: chaMod, base: '(Cha)' }
            ];
    
            const skillsHtml = skills.map(skill => `
                <li class="skill-item">
                    <span class="skill-mod">${skill.mod >= 0 ? '+' : ''}${skill.mod}</span>
                    <span class="skill-name">${skill.name} <span class="skill-base">${skill.base}</span></span>
                </li>
            `).join('');

            skillsSectionHtml = `
            <aside class="skills-list-container">
                <h4>Compétences</h4>
                <ul>${skillsHtml}</ul>
            </aside>`;
        }


        const spouse = getSpouse(person, populationScope);
        const children = getChildren(person, populationScope);
        const parents = getParents(person, populationScope);
        const siblings = getSiblings(person, populationScope);
        const father = parents.find(p => p.gender === 'Homme');
        const mother = parents.find(p => p.gender === 'Femme');
        const paternalUnclesAunts = father ? getSiblings(father, populationScope) : [];
        const maternalUnclesAunts = mother ? getSiblings(mother, populationScope) : [];

        let jobTitle = 'N/A';
        const raceData = RACES_DATA.races[person.race];
        if (person.isAlive) {
            if (raceData && person.age < raceData.ageTravail) {
                jobTitle = person.age >= raceData.ageApprentissage ? 'Apprenti' : 'Enfant';
            } else if (person.status === 'Retraité(e)') {
                jobTitle = `Retraité(e) (anciennement ${person.lastJobTitle || 'non spécifié'})`;
            } else {
                jobTitle = person.job?.jobTitle || person.royalTitle || 'Sans emploi';
            }
        } else {
            jobTitle = person.jobBeforeDeath || 'Décédé(e) sans emploi';
        }

        const personLocation = currentRegion.places.find(p => p.id === person.locationId);
        const status = person.isAlive ? `Vivant(e)` : `Décédé(e) (à ${person.ageAtDeath} ans)`;
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
            } else {
                totalCopper = randomCopperBonus;
            }
        } else {
            totalCopper = randomCopperBonus;
        }

        const goldPieces = Math.floor(totalCopper / 1000);
        totalCopper %= 1000;
        const silverPieces = Math.floor(totalCopper / 10);
        const copperPieces = totalCopper % 10;
        const formattedMoney = `${goldPieces}po ${silverPieces}pa ${copperPieces}pc`;

        const formatPersonLink = p => `${p.firstName} ${p.lastName} (${p.isAlive ? p.age + ' ans' : 'décédé(e)'})`;

        return `
        <div class="character-sheet dossier-view">
            <header class="char-sheet-header">
                <h3>${person.firstName} ${person.lastName}</h3>
                <p>${person.race} / ${person.gender} / Résidant à ${residence} / Argent: ${formattedMoney}</p>
            </header>

            <div class="char-sheet-main-grid">
                <aside class="char-sheet-stats">
                    <div class="stat-box"><span class="label">Force</span><span class="score">${str}</span><span class="modifier">${strMod >= 0 ? '+' : ''}${strMod}</span></div>
                    <div class="stat-box"><span class="label">Dextérité</span><span class="score">${dex}</span><span class="modifier">${dexMod >= 0 ? '+' : ''}${dexMod}</span></div>
                    <div class="stat-box"><span class="label">Constitution</span><span class="score">${con}</span><span class="modifier">${conMod >= 0 ? '+' : ''}${conMod}</span></div>
                    <div class="stat-box"><span class="label">Intelligence</span><span class="score">${int}</span><span class="modifier">${intMod >= 0 ? '+' : ''}${intMod}</span></div>
                    <div class="stat-box"><span class="label">Sagesse</span><span class="score">${wis}</span><span class="modifier">${wisMod >= 0 ? '+' : ''}${wisMod}</span></div>
                    <div class="stat-box"><span class="label">Charisme</span><span class="score">${cha}</span><span class="modifier">${chaMod >= 0 ? '+' : ''}${chaMod}</span></div>
                </aside>

                <div class="char-sheet-main-content">
                    <section class="char-sheet-info">
                        <div class="combat-stats-container">
                            <div class="combat-box">
                                <div class="combat-value">${caValue}</div>
                                <div class="combat-label">CA</div>
                            </div>
                            <div class="combat-box">
                                <div class="combat-value">${formattedIniValue}</div>
                                <div class="combat-label">INITIATIVE</div>
                            </div>
                        </div>
                        <div class="info-block">
                            <h4>État Civil & Statut</h4>
                            <p><strong>Âge :</strong> ${ageLine}</p>
                            <p><strong>Statut :</strong> ${status}</p>
                            <p><strong>Prestige :</strong> ${person.prestige ? person.prestige.toFixed(0) : '0'}</p>
                            <p><strong>Occupation :</strong> ${jobTitle}</p>
                        </div>
                    </section>
                    ${skillsSectionHtml}
                </div>
            </div>

            <div class="char-sheet-details">
                <div class="details-section">
                    <h4>Cercle Social & Familial</h4>
                    <div class="social-grid">
                        <div><strong>Parents:</strong>
                            <ul>${parents.length > 0 ? parents.map(p => `<li>${formatPersonLink(p)}</li>`).join('') : '<li>Inconnus</li>'}</ul>
                        </div>
                        <div><strong>Fratrie:</strong>
                            <ul>${siblings.length > 0 ? siblings.map(s => `<li>${formatPersonLink(s)}</li>`).join('') : '<li>Aucune</li>'}</ul>
                        </div>
                        <div><strong>Oncles & Tantes (Paternel):</strong>
                            <ul>${paternalUnclesAunts.length > 0 ? paternalUnclesAunts.map(p => `<li>${formatPersonLink(p)}</li>`).join('') : '<li>Aucun</li>'}</ul>
                        </div>
                        <div><strong>Oncles & Tantes (Maternel):</strong>
                           <ul>${maternalUnclesAunts.length > 0 ? maternalUnclesAunts.map(p => `<li>${formatPersonLink(p)}</li>`).join('') : '<li>Aucun</li>'}</ul>
                        </div>
                        <div><strong>Conjoint(e):</strong>
                            <p>${spouse ? formatPersonLink(spouse) : 'Célibataire'}</p>
                        </div>
                        <div><strong>Enfants:</strong>
                             <ul>${children.length > 0 ? children.map(c => `<li>${formatPersonLink(c)}</li>`).join('') : '<li>Aucun</li>'}</ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
    }

    function renderLocationView(location) {
        const hasPopulation = location.demographics?.population.length > 0;
    
        let tabLinks = `
            <button class="tab-link active" data-tab="tab-distances">Distances & Temps de trajet</button>
            <button class="tab-link" data-tab="tab-jobs">Emplois & Occupants</button>
        `;
        let tabContent = `
            <div id="tab-distances" class="tab-content active">
                ${renderDistanceMatrix(location)}
            </div>
            <div id="tab-jobs" class="tab-content">
                ${renderJobRoster(location)}
            </div>
        `;
    
        if (hasPopulation) {
            tabLinks += `
                <button class="tab-link" data-tab="tab-families">Les Familles du lieu</button>
                <button class="tab-link" data-tab="tab-characters">Fiches des Personnages</button>
            `;
            tabContent += `
                <div id="tab-families" class="tab-content">
                    ${renderFamilies(location)}
                </div>
                <div id="tab-characters" class="tab-content">
                    ${renderCharacterSheets(location)}
                </div>
            `;
        }
    
        const finalHtml = `
            <h2><span class="location-title">${location.name}</span></h2>
            <div class="tabs-container">
                <div class="tab-links">
                    ${tabLinks}
                </div>
                <div class="tab-content-container">
                    ${tabContent}
                </div>
            </div>`;
    
        contentArea.innerHTML = finalHtml;
    
        // Add event listeners for the new tabs
        contentArea.querySelector('.tab-links').addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON') {
                const tabId = e.target.dataset.tab;
                
                // Don't do anything if the clicked tab is already active
                if (e.target.classList.contains('active')) return;
    
                // Update button active state
                contentArea.querySelectorAll('.tab-link').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
    
                // Update content active state
                contentArea.querySelectorAll('.tab-content').forEach(content => {
                    content.classList.remove('active');
                    if (content.id === tabId) {
                        content.classList.add('active');
                    }
                });
            }
        });
    }

    function populateSelectors(location) {
        buildingSelect.innerHTML = '<option value="">-- Tous les Bâtiments --</option>';
        if (location.config?.buildings) {
            const buildingNames = new Set(Object.values(location.config.buildings).flat().map(b => b.name));
            [...buildingNames].sort().forEach(name => buildingSelect.innerHTML += `<option value="${name}">${name}</option>`);
        }
        characterSelect.innerHTML = '<option value="">-- Tous les Personnages --</option>';
        if (location.demographics?.population) {
            location.demographics.population
                .filter(person => person.isAlive)
                .sort((a,b) => (a.lastName || '').localeCompare(b.lastName || '') || (a.firstName || '').localeCompare(b.firstName || ''))
                .forEach(person => characterSelect.innerHTML += `<option value="${person.id}">${person.firstName} ${person.lastName}</option>`);
        }
    }
    
    function init() {
        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) {
            contentArea.innerHTML = '<h1>Aucune donnée de simulation trouvée.</h1><p>Veuillez compléter les étapes précédentes.</p>';
            return;
        }
        regions = JSON.parse(data);
        const lastRegionId = localStorage.getItem(LAST_REGION_KEY);
        currentRegion = regions.find(r => r.id == lastRegionId) || regions[0];

        // NOUVEAU : Appel initial pour la mise à jour de la navigation
        updateAllNavLinksState(currentRegion);

        if (!currentRegion?.places?.length) {
            contentArea.innerHTML = '<h1>Région non valide ou vide.</h1><p>Retournez aux étapes précédentes.</p>';
            return;
        }

        window.populationScope = currentRegion.places.flatMap(p => p.demographics.population);

        locationSelect.innerHTML = currentRegion.places.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
        selectedLocation = currentRegion.places[0];

        populateSelectors(selectedLocation);
        renderLocationView(selectedLocation);

        locationSelect.addEventListener('change', (e) => {
            selectedLocation = currentRegion.places.find(p => p.id == e.target.value);
            populateSelectors(selectedLocation);
            renderLocationView(selectedLocation);
            buildingSelect.value = "";
            characterSelect.value = "";
        });

        buildingSelect.addEventListener('change', (e) => {
            const buildingName = e.target.value;
            characterSelect.value = "";
            if (buildingName) renderBuildingView(buildingName, selectedLocation);
            else renderLocationView(selectedLocation);
        });

        characterSelect.addEventListener('change', (e) => {
            const personId = e.target.value;
            buildingSelect.value = "";
            if (personId) renderCharacterView(personId, selectedLocation);
            else renderLocationView(selectedLocation);
        });

        systemSelect.addEventListener('change', (e) => {
            currentGameSystem = e.target.value;
            // Re-render the current view to reflect the change
            const selectedBuilding = buildingSelect.value;
            const selectedCharacter = characterSelect.value;

            if (selectedCharacter) {
                renderCharacterView(selectedCharacter, selectedLocation);
            } else if (selectedBuilding) {
                renderBuildingView(selectedBuilding, selectedLocation);
            } else {
                renderLocationView(selectedLocation);
            }
        });

        globalSearchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            globalSearchResults.innerHTML = '';

            if (query.length < 2) {
                globalSearchResults.style.display = 'none';
                return;
            }

            const matches = window.populationScope.filter(person =>
                person.isAlive && `${person.firstName} ${person.lastName}`.toLowerCase().includes(query)
            ).slice(0, 10);

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

                            characterSelect.value = clickedPerson.id;
                            buildingSelect.value = "";

                            renderCharacterView(clickedPerson.id, clickedLocation);

                            globalSearchInput.value = '';
                            globalSearchResults.style.display = 'none';
                        }
                    });
                    globalSearchResults.appendChild(item);
                });
                globalSearchResults.style.display = 'block';
            } else {
                globalSearchResults.style.display = 'none';
            }
        });

        document.addEventListener('click', (e) => {
            if (!globalSearchInput.contains(e.target)) {
                globalSearchResults.style.display = 'none';
            }
        });

        printBtn.addEventListener('click', () => window.print());

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

    init();
});