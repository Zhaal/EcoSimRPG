/**
 * EcoSimRPG - step5.js
 * Page d'exploitation et d'impression des données de simulation.
 * VERSION 7.8 (Corrigée par l'assistant)
 * - Correction de l'erreur "ReferenceError: renderLocationInfo is not defined" en réintégrant la fonction manquante.
 * VERSION 7.7 (Modifiée par l'assistant)
 * - Remplacement de la mise en page par une grille compacte à 3 colonnes.
 * - Correction de la formule de l'Initiative (Mod. Dex seul).
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
        'comtal':     { name: 'Route Comtale',      modifier: 0.85, users: ['Pied', 'Cheval', 'Caravane'] },
        'marchand':   { name: 'Voie Marchande',     modifier: 0.70, users: ['Pied', 'Cheval', 'Caravane'] },
        'seigneurial':{ name: 'Chemin Seigneurial', modifier: 0.60, users: ['Pied', 'Cheval', 'Caravane'] },
        'traverse':   { name: 'Chemin de Traverse', modifier: 0.50, users: ['Pied', 'Cheval'] },
        'forestier':  { name: 'Sentier Forestier',  modifier: 0.40, users: ['Pied', 'Cheval'] },
        'montagne':   { name: 'Sentier de Montagne',modifier: 0.25, users: ['Pied', 'Cheval'] }
    };

    // --- SÉLECTEURS DOM ---
    const locationSelect = document.getElementById('location-select');
    const buildingSelect = document.getElementById('building-select');
    const characterSelect = document.getElementById('character-select');
    const printBtn = document.getElementById('print-btn');
    const contentArea = document.getElementById('content-area');
    const navStep5 = document.getElementById('nav-step5');
    const globalSearchInput = document.getElementById('global-character-search');
    const globalSearchResults = document.getElementById('global-search-results');


    // --- ÉTAT DE L'APPLICATION ---
    let regions = [];
    let currentRegion = null;
    let selectedLocation = null;

    // --- HELPER CLASS for Pathfinding ---
    class PriorityQueue {
        constructor() { this.values = []; }
        enqueue(element, priority) { this.values.push({ element, priority }); this.sort(); }
        dequeue() { return this.values.shift(); }
        isEmpty() { return this.values.length === 0; }
        sort() { this.values.sort((a, b) => a.priority - b.priority); }
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

    // CORRECTION : Réintégration de la fonction renderLocationInfo
    function renderLocationInfo(location) {
        let html = `<h2><span class="location-title">${location.name}</span></h2>`;
        html += `<div id="location-details-grid">`;

        html += `<div class="distance-matrix"><h3>Distances & Temps de trajet</h3><table>`;
        html += `<thead><tr><th>Destination</th><th>Distance</th><th>Route</th><th>Pied</th><th>Cheval</th><th>Caravane</th></tr></thead><tbody>`;

        currentRegion.places.forEach(otherPlace => {
            if (otherPlace.id === location.id) return;

            const directDistance = axialDistance(location.coords, otherPlace.coords) * (currentRegion.scale || 10);
            const roadKey = getRoadKey(location.id, otherPlace.id);
            const road = currentRegion.roads[roadKey];
            const roadType = road ? ROAD_TYPES[road.type] : null;

            html += `<tr><td>${otherPlace.name}</td>`;

            if(roadType) {
                html += `<td>${directDistance.toFixed(0)} km</td>
                <td>${roadType.name.split(' / ')[0]}</td>
                <td>${roadType.users.includes('Pied') ? formatTravelTime(directDistance / (TRAVEL_SPEEDS.Pied * roadType.modifier)) : 'N/A'}</td>
                <td>${roadType.users.includes('Cheval') ? formatTravelTime(directDistance / (TRAVEL_SPEEDS.Cheval * roadType.modifier)) : 'N/A'}</td>
                <td>${roadType.users.includes('Caravane') ? formatTravelTime(directDistance / (TRAVEL_SPEEDS.Caravane * roadType.modifier)) : 'N/A'}</td>`;
            } else {
                const pathByFoot = findShortestPath(location.id, otherPlace.id, currentRegion.places, currentRegion.roads, (currentRegion.scale || 10), 'Pied');
                const referencePath = pathByFoot;

                if (referencePath) {
                    html += `<td>${referencePath.totalDistance.toFixed(0)} km</td>`;
                    let routeStepsHtml = `<ul class="route-steps numbered">${referencePath.legs.map((leg, i) => `<li><span>(${i + 1})</span>${leg.from} → ${leg.to} <span class="road-type-leg">(${leg.roadTypeName.split(' / ')[0]})</span></li>`).join('')}</ul>`;
                    html += `<td>${routeStepsHtml}</td>`;
                    const pathByHorse = findShortestPath(location.id, otherPlace.id, currentRegion.places, currentRegion.roads, (currentRegion.scale || 10), 'Cheval');
                    const pathByCaravan = findShortestPath(location.id, otherPlace.id, currentRegion.places, currentRegion.roads, (currentRegion.scale || 10), 'Caravane');
                    html += `<td>${formatTravelTime(referencePath.totalTime)}</td>`;
                    html += `<td>${pathByHorse ? formatTravelTime(pathByHorse.totalTime) : 'N/A'}</td>`;
                    html += `<td>${pathByCaravan ? formatTravelTime(pathByCaravan.totalTime) : 'N/A'}</td>`;
                } else {
                    html += `<td>${directDistance.toFixed(0)} km (à vol d'oiseau)</td><td colspan="4">Aucun itinéraire terrestre</td>`;
                }
            }
            html += `</tr>`;
        });
        html += `</tbody></table></div>`;

        html += `<div class="job-roster"><h3>Emplois & Occupants</h3>`;
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
        html += `</div></div>`;
        return html;
    }

    function renderFamilies(location) {
        let html = `<h2>Familles du lieu : ${location.name}</h2><div id="families-grid">`;
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
        let html = `<h2>Fiches des Personnages</h2><div id="character-sheets-container">`;
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

                <aside class="skills-list-container">
                    <h4>Compétences</h4>
                    <ul>${skillsHtml}</ul>
                </aside>
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
        let finalHtml = `<div class="print-section" id="location-info-section">${renderLocationInfo(location)}</div>`;
        if (location.demographics?.population.length > 0) {
            finalHtml += `<div class="print-section" id="families-section">${renderFamilies(location)}</div>`;
            finalHtml += `<div class="print-section" id="characters-section">${renderCharacterSheets(location)}</div>`;
        }
        contentArea.innerHTML = finalHtml;
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
        navStep5.classList.remove('nav-disabled');
    }

    init();
});