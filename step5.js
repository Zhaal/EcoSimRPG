/**
 * EcoSimRPG - step5.js
 * Page d'exploitation et d'impression des données de simulation.
 * VERSION 7.0 - Dossiers de Personnage Détaillés
 * - Refonte complète de l'affichage des personnages pour inclure un historique de vie.
 * - Ajout de fonctions de rendu pour la chronologie, la carrière et les liens sociaux.
 * - Ajustement de la récupération des données pour les liens familiaux étendus.
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
        const A = 2.352;
        const B = -0.83;
        const dndScore = Math.round(A * Math.log(rawValue) + B);
        const finalScore = Math.max(3, dndScore);
        const modifier = Math.floor((finalScore - 10) / 2);
        return { score: finalScore, modifier: modifier };
    };

    function getDisplayStats(person) {
        const raceData = RACES_DATA.races[person.race];
        if (!raceData) return { ...person.stats };

        let modifiedStats = { ...person.stats };

        if (person.gender === 'Femme') {
            modifiedStats.force *= 0.85;
            modifiedStats.constitution *= 0.90;
            modifiedStats.dexterite *= 1.10;
            modifiedStats.charisme *= 1.15;
        }

        const middleAgeThreshold = raceData.esperanceVieMax * 0.5;
        const oldAgeThreshold = raceData.esperanceVieMax * 0.7;
        const activityPenalty = (!person.job && person.age > middleAgeThreshold) ? 1.5 : 1.0;

        if (person.age > oldAgeThreshold) {
            const yearsPastThreshold = person.age - oldAgeThreshold;
            modifiedStats.force = Math.max(0, modifiedStats.force - yearsPastThreshold * 4.0 * activityPenalty);
            modifiedStats.dexterite = Math.max(0, modifiedStats.dexterite - yearsPastThreshold * 4.0 * activityPenalty);
            modifiedStats.constitution = Math.max(0, modifiedStats.constitution - yearsPastThreshold * 5.0 * activityPenalty);
            modifiedStats.sagesse += yearsPastThreshold * 1.2;
            modifiedStats.intelligence += yearsPastThreshold * 0.6;
        } else if (person.age > middleAgeThreshold) {
            const yearsPastThreshold = person.age - middleAgeThreshold;
            modifiedStats.force = Math.max(0, modifiedStats.force - yearsPastThreshold * 1.2 * activityPenalty);
            modifiedStats.constitution = Math.max(0, modifiedStats.constitution - yearsPastThreshold * 1.8 * activityPenalty);
            modifiedStats.sagesse += yearsPastThreshold * 0.8;
            modifiedStats.intelligence += yearsPastThreshold * 0.6;
        }

        return modifiedStats;
    }
    
    const getPersonById = (id, scope) => scope.find(p => p.id === id);
    const getParents = (person, scope) => (person.parents || []).map(id => getPersonById(id, scope)).filter(Boolean);
    const getSiblings = (person, scope) => {
        const parents = getParents(person, scope);
        if (parents.length === 0) return [];
        const parent = parents[0];
        const siblingIds = new Set(parent.childrenIds || []);
        if (parents[1] && parents[1].childrenIds) {
            parents[1].childrenIds.forEach(id => siblingIds.add(id));
        }
        return Array.from(siblingIds).filter(id => id !== person.id).map(id => getPersonById(id, scope)).filter(Boolean);
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
                    const legDistance = axialDistance(placeA.coords, placeB.coords) * scale;
                    totalDistance += legDistance;

                    const roadKey = getRoadKey(placeA.id, placeB.id);
                    const roadInfo = allRoads[roadKey];
                    const roadType = ROAD_TYPES[roadInfo.type];
                    const legTime = legDistance / (TRAVEL_SPEEDS[travelMode] * (roadType?.modifier || 1));
                    legs.push({ from: placeA.name, to: placeB.name, distance: legDistance, time: legTime });
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

                const distance = axialDistance(uNode.coords, vNode.coords) * scale;
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
                    let routeStepsHtml = `<ul class="route-steps numbered">${referencePath.legs.map((leg, i) => `<li><span>(${i + 1})</span>${leg.from} → ${leg.to}</li>`).join('')}</ul>`;
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
        let html = `<h2>Familles de ${location.name}</h2><div id="families-grid">`;
        const { families, population } = location.demographics;
        families.sort((a,b) => (a.name || '').localeCompare(b.name || '')).forEach(family => {
            html += `<div class="family-card"><h3>Famille ${family.name}</h3><ul>`;
            const members = family.memberIds.map(id => population.find(p => p.id === id)).filter(Boolean);
            members.sort((a,b) => (b.age || 0) - (a.age || 0)).forEach(member => {
                 html += `<li><strong>${member.firstName}</strong> (${member.age} ans) - ${member.job ? member.job.jobTitle : (member.royalTitle || 'Sans emploi')}</li>`;
            });
            html += `</ul></div>`;
        });
        html += `</div>`;
        return html;
    }

    function renderCharacterSheets(location) {
        let html = `<h2>Fiches des Personnages</h2><div id="character-sheets-container">`;
        const population = location.demographics.population;
        population.sort((a,b) => (a.lastName || '').localeCompare(b.lastName || '') || (a.firstName || '').localeCompare(b.firstName || ''));
        population.forEach(person => { html += renderSingleCharacterSheet(person, population) });
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
        // NOUVEAU : On récupère la population de toute la région pour trouver les liens familiaux hors de la ville
        const allPopulation = currentRegion.places.flatMap(p => p.demographics.population);

        let html = `<div class="print-section character-sheet-full-view"><h2><span class="location-title">${location.name}</span> &gt; Dossier de Personnage</h2>`;
        html += renderSingleCharacterSheet(person, allPopulation); // On passe maintenant la population totale
        html += `</div>`;
        contentArea.innerHTML = html;
    }

    /**
     * NOUVEAU (v7.0): Affiche une chronologie des événements de la vie du personnage.
     * Suppose que person.eventLog est un tableau d'objets {age: number, event: string}
     */
    function renderTimeline(person) {
        // NOTE: La simulation doit générer cet historique. Nous simulons ici quelques entrées possibles.
        const eventLog = person.eventLog || [];
        if (person.birthYear) {
             eventLog.unshift({ age: 0, event: `Naissance à ${person.locationOfBirth || 'lieu inconnu'}.` });
        }
        if (!person.isAlive) {
            eventLog.push({ age: person.ageAtDeath, event: `Décès. Cause : ${person.causeOfDeath || 'inconnue'}.` });
        }
        
        if (eventLog.length <= 1) return '<p>Aucun événement marquant enregistré.</p>';

        let html = '<dl class="life-timeline">';
        eventLog.sort((a, b) => a.age - b.age).forEach(entry => {
            html += `<dt>Âge : ${entry.age}</dt><dd>${entry.event}</dd>`;
        });
        html += '</dl>';
        return html;
    }

    /**
     * NOUVEAU (v7.0): Affiche l'historique de carrière du personnage.
     * Suppose que person.jobHistory est un tableau d'objets {jobTitle, buildingName, startAge, endAge}
     */
    function renderCareerHistory(person) {
        // NOTE: La simulation doit générer cet historique.
        const jobHistory = person.jobHistory || (person.job ? [{...person.job, startAge: RACES_DATA.races[person.race].ageTravail, endAge: null}] : []);
        
        if (jobHistory.length === 0) return `<p>${person.royalTitle || 'N\'a jamais occupé d\'emploi formel.'}</p>`;

        let html = '<ul class="career-history">';
        jobHistory.forEach(job => {
            const duration = job.endAge ? `(de ${job.startAge} à ${job.endAge} ans)` : `(depuis l'âge de ${job.startAge} ans)`;
            html += `<li><strong>${job.jobTitle}</strong>, <em>${job.buildingName}</em> ${duration}</li>`;
        });
        html += '</ul>';
        return html;
    }


    /**
     * FONCTION PRINCIPALE DE RENDU - ENTIÈREMENT REVUE
     */
    function renderSingleCharacterSheet(person, populationScope) {
        if (!person) return '';
        
        // Calculs des statistiques
        const displayStats = getDisplayStats(person);
        const { score: str, modifier: strMod } = convertToDnD(displayStats.force);
        const { score: dex, modifier: dexMod } = convertToDnD(displayStats.dexterite);
        const { score: con, modifier: conMod } = convertToDnD(displayStats.constitution);
        const { score: int, modifier: intMod } = convertToDnD(displayStats.intelligence);
        const { score: wis, modifier: wisMod } = convertToDnD(displayStats.sagesse);
        const { score: cha, modifier: chaMod } = convertToDnD(displayStats.charisme);
        
        // Récupération des informations sociales
        const spouse = getSpouse(person, populationScope);
        const children = getChildren(person, populationScope);
        const parents = getParents(person, populationScope);
        const siblings = getSiblings(person, populationScope);
        const jobTitle = person.job?.jobTitle || person.royalTitle || 'Sans emploi';
        const status = person.isAlive ? `Vivant(e)` : `Décédé(e)`;
        const causeOfDeath = !person.isAlive ? `<p><strong>Cause du décès :</strong> ${person.causeOfDeath || 'Non spécifiée'}</p>` : '';
        const ageLine = person.isAlive ? `${person.age} ans` : `Mort(e) à l'âge de ${person.ageAtDeath} ans`;
        const residence = person.currentLocation || 'Inconnue';

        // Formatage de la liste de personnes pour les liens familiaux
        const formatPersonLink = p => `${p.firstName} ${p.lastName} (${p.isAlive ? p.age + ' ans' : 'décédé(e)'})`;

        return `
        <div class="character-sheet dossier-view">
            <header class="char-sheet-header">
                <h3>${person.firstName} ${person.lastName}</h3>
                <p>${person.race} / ${person.gender} / Résidant à ${residence}</p>
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
                    <div class="info-block">
                        <h4>État Civil & Statut</h4>
                        <p><strong>Âge :</strong> ${ageLine}</p>
                        <p><strong>Statut :</strong> ${status}</p>
                        ${causeOfDeath}
                        <p><strong>Prestige social :</strong> ${person.prestige ? person.prestige.toFixed(0) : '0'}</p>
                         <p><strong>Occupation actuelle :</strong> ${jobTitle}</p>
                    </div>
                </section>
            </div>

            <div class="char-sheet-details">
                <div class="details-section">
                    <h4>Chronologie de vie</h4>
                    ${renderTimeline(person)}
                </div>
                
                <div class="details-section">
                    <h4>Parcours Professionnel</h4>
                    ${renderCareerHistory(person)}
                </div>

                <div class="details-section">
                    <h4>Cercle Social & Familial</h4>
                    <div class="social-grid">
                        <div><strong>Parents:</strong>
                            <ul>${parents.length > 0 ? parents.map(p => `<li>${formatPersonLink(p)}</li>`).join('') : '<li>Inconnus</li>'}</ul>
                        </div>
                        <div><strong>Fratrie:</strong>
                            <ul>${siblings.length > 0 ? siblings.map(s => `<li>${formatPersonLink(s)}</li>`).join('') : '<li>Aucune</li>'}</ul>
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

        printBtn.addEventListener('click', () => window.print());
        navStep5.classList.remove('nav-disabled');
    }

    init();
});