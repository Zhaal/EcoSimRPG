/**
 * EcoSimRPG - autorun.js (VERSION 6.0 - Synchronisation Complète & Suivi des Familles)
 *
 * DESCRIPTION :
 * Moteur de simulation autonome, mis à jour pour intégrer fidèlement les règles
 * de simulation détaillées des fichiers step1, step2, step3 et step4.
 * Cette version intègre les dernières mécaniques de simulation pour une cohérence maximale,
 * y compris la gestion avancée du statut des familles.
 *
 * MÉCANISMES SYNCHRONISÉS :
 * - Étape 1 (Carte) : Distribution des types de lieux et connectivité de la capitale alignées sur step1.js.
 * - Étape 2 (Économie) : Résolution des dépendances avec une logique de diversité et de priorité alignée sur step2.js.
 * - Étape 3 (Population) : Calcul de l'expérience initiale (Gen.0) avec malus d'âge et application des titres dynastiques, aligné sur step3.js.
 * - Étape 4 (Simulation) : Intégration complète des règles les plus récentes de step4.js :
 * - Mortalité (vieillesse, accident, surpopulation, influence familiale).
 * - NOUVEAU : Gestion du statut des familles ('active', 'migrated', 'extinct') pour éviter la suppression et permettre un suivi historique.
 * - Succession dynastique complète (primogéniture, électif).
 * - Mariages stratégiques basés sur le statut social et la compatibilité.
 * - Croissance des stats/prestige avec malus d'âge/expérience et gain passif.
 * - Retraite dynamique basée sur la pénibilité du métier.
 * - Promotions hiérarchiques, migration économique et migration amoureuse.
 * - Attribution étendue des titres dynastiques (parents, frères/sœurs, neveux/nièces).
 * - Logique d'interactions sociales pour créer des amis et connaissances.
 *
 * UTILISATION :
 * Ce script est autonome. Il est exécuté par autorun.html et ne nécessite pas d'interaction.
 */
document.addEventListener('DOMContentLoaded', () => {

    class AutorunOrchestrator {
        constructor(simulationYears) {
            // Configuration
            this.simulationYears = simulationYears;
            this.logElement = document.getElementById('progress-log');
            if (!this.logElement) console.warn("Élément de log 'progress-log' introuvable.");

            // Données de base
            this.BUILDING_DATA = window.EcoSimData.buildings;
            this.RACES_DATA = window.EcoSimData.racesData;
            this.PLACE_TYPE_HIERARCHY = { "Hameau": 1, "Village": 2, "Bourg": 3, "Ville": 4, "Capitale": 5 };

            if (!this.BUILDING_DATA || !this.RACES_DATA) {
                const errorMsg = "Les données de base (buildings.js, races.js) n'ont pas pu être chargées.";
                this.log(errorMsg, 'error');
                throw new Error(errorMsg);
            }

            // État de la simulation
            this.regions = [];
            this.currentRegion = null;
            this.initialSimulationData = null; // Snapshot pour la mortalité par surpopulation
        }

        log(message, type = 'info') {
            if (!this.logElement) {
                console.log(`[${type.toUpperCase()}] ${message.replace(/<[^>]*>?/gm, '')}`);
                return;
            }
            const li = document.createElement('li');
            li.innerHTML = `[${new Date().toLocaleTimeString()}] ${message}`;
            li.className = type;
            this.logElement.appendChild(li);
            this.logElement.scrollTop = this.logElement.scrollHeight;
        }

        async _yield() {
            await new Promise(resolve => setTimeout(resolve, 0));
        }

        async run() {
            try {
                const regionName = prompt("Veuillez entrer un nom pour votre nouvelle région :", "Royaume d'Aethelgard");
                if (!regionName || regionName.trim() === '') {
                    this.log('Opération annulée par l\'utilisateur.', 'error');
                    alert("La génération a été annulée.");
                    return;
                }

                this.log('🚀 Démarrage de la génération automatique...');
                this.loadData();

                await this._step1_createMap(regionName);
                await this._step2_buildEconomy();
                await this._step3_generatePopulation();
                await this._step4_simulateWorld();

                this.log('🎉 <strong>Génération complète terminée !</strong>', 'success');
                this.log('Sauvegarde des données finales et redirection vers la page de visualisation...', 'info');
                await this.saveData();
                setTimeout(() => {
                    window.location.href = 'step5.html';
                }, 2000);

            } catch (error) {
                this.log(`❌ <strong>ERREUR CRITIQUE :</strong> ${error.message}`, 'error');
                console.error("Détails de l'erreur :", error, error.stack);
                alert("Une erreur majeure est survenue durant la génération automatique. Vérifiez la console (F12) pour les détails techniques.");
            }
        }

        async saveData() {
            localStorage.setItem('ecoSimRPG_map_data', JSON.stringify(this.regions));
            if (this.currentRegion) {
                localStorage.setItem('ecoSimRPG_last_region_id', this.currentRegion.id);
            }
        }

        loadData() {
            const data = localStorage.getItem('ecoSimRPG_map_data');
            this.regions = data ? JSON.parse(data) : [];
            const lastRegionId = localStorage.getItem('ecoSimRPG_last_region_id');
            if (lastRegionId) {
                this.currentRegion = this.regions.find(r => r.id == lastRegionId) || null;
            }
        }

        // --- ÉTAPE 1: Création de la Carte (Logique de step1.js) ---
        async _step1_createMap(regionName) {
            this.log(`🗺️  Étape 1 : Création de la région "<strong>${regionName}</strong>"...`);
            const newRegion = { id: Date.now(), name: regionName, scale: 10, places: [], roads: {} };
            this.regions.push(newRegion);
            this.currentRegion = newRegion;

            const placeCount = 25;
            const placeNames = ["Aethelgard", "Baeldor", "Crystalgate", "Dunharrow", "Eldoria", "Faelivrin",
    "Glimmerwood", "Highgarden", "Ironcliff", "Silvercreek", "Valoria", "Windhaven",
    "Dragon's Rest", "Starfall",
    "Thornhollow", "Moonspire", "Stormreach", "Frostmere", "Shadowfen", "Whiteridge",
    "Ambermoor", "Nightshade", "Ravenhall", "Oakenshield", "Mistvale", "Darkmere",
    "Emberfall", "Brightforge", "Sunhollow", "Grimwatch", "Rimehold", "Hollowdeep",
    "Ashenfield", "Duskmire", "Seabreak", "Winterglen", "Myrefall", "Skyridge",
    "Hawkwind", "Blackbriar", "Wolfsden", "Goldenthorne", "Thundertop", "Evermist",
    "Redreach", "Ironwood", "Verdanshire", "Stonehollow", "Wyrmgate", "Brighthollow",
    "Stormhelm", "Moonfen", "Cindervale", "Greywatch", "Ravenshade", "Silvershade",
    "Ivyridge", "Cloudspire", "Ashenmoor", "Nightglen", "Duskwatch", "Frosthollow",
    "Stormvale", "Wildmere", "Twilight Reach", "Windspire", "Thornspire", "Ebonvale",
    "Hearthglen", "Northwatch", "Mistridge", "Shadowhollow", "Brightmoor", "Grimspire",
    "Stonegate", "Snowvale", "Ironhold", "Emberridge", "Rookfell", "Moonreach",
    "Duskfall", "Winterhall", "Sablefen", "Ravensong", "Cloudreach", "Brightpeak",
    "Sablewatch", "Sunspire", "Glacierrest", "Hollowpine", "Feyvale", "Ashgrove",
    "Crownspire", "Verdantdeep", "Thundertree", "Wolfspire", "Nightforge", "Silverdeep",
    "Redpine", "Ironspire", "Gloomreach", "Cragwatch", "Violet Hollow", "Mournvale",
    "Aiguebelle", "Beaurivage", "Châteaunoir", "Fauconnerre", "Luneroc", "Montclar",
    "Pierrelune", "Valdoré", "Verchamps", "Bellombre", "Clairefont", "Hauterive",
    "Noyeroc", "Rochefort", "Sombreval", "Verlac", "Auberive", "Boischantant",
    "Clairmarais", "Fleurac", "Griselande", "Lombreuil", "Pointebrume", "Sauveterre",
    "Vieux-Bourg", "Bastide-la-Forêt", "Chanteloup", "Croix-du-Sud", "Épineuil", "Froideval",
    "Lafayette", "Marais-d'Argent", "Pont-de-Brume", "Sainte-Colombe-des-Bois", "Trouvence", "Valbrume",
    "Bellegarde", "Cœur-d'Acier", "Froidemantel", "Havre-Gris", "Mornesource", "Orbec",
    "Rivière-aux-Serpents", "Terre-Sauvage", "Villeneuve-la-Hardi", "Aussillon", "Brumeval", "Cendrelac",
    "Étoile-du-Matin", "Gouffre-Gelé", "Hivernesse", "Lande-Morte", "Port-d'Acier", "Rochelion",
    "Solitude", "Val-d'Espoir", "Belleroche", "Cimefroide", "Drakonheim", "Espérance",
    "Fort-le-Corbeau", "Gué-des-Loups", "Longue-Vue", "Mont-Dragon", "Pierre-Écrite", "Sérénité",
    "Tours-de-Garde", "Val-Silencieux", "Couronneige", "Feuillemorte", "Roncenoir", "Lys-d'Argent",
    "Adlerstein", "Bergfried", "Donnerfels", "Eisenwacht", "Falkenhorst", "Geisterwald",
    "Hochland", "Kaltburg", "Mondlicht", "Nebelstein", "Rabenfels", "Schattenburg",
    "Silberbach", "Sturmfels", "Wolfenstein", "Zwergenbinge", "Altdorf", "Drachenfels",
    "Eichenherz", "Finsterwalde", "Grauhof", "Heldenfall", "Kaiserstadt", "Löwenherz",
    "Mittwinter", "Nordwind", "Odenwald", "Reichenau", "Schwanensee", "Tannengrün",
    "Unterberg", "Weißenburg", "Bärenklau", "Dornach", "Felsbrunn", "Goldbach",
    "Himmelspforte", "Krähenberg", "Moorwasser", "Nachtwacht", "Rittershafen", "Schwarzwald",
    "Steinfaust", "Teufelsmoor", "Westwacht", "Zornesfeste", "Aschenbach", "Blutfalken",
    "Dunkeltal", "Erlenhof", "Freistadt", "Graustein", "Holzbrücke", "Klippenrand",
    "Morgenstern", "Nebelhafen", "Rabenwald", "Schildwacht", "Sonnenberg", "Todestal",
    "Winterfeste", "Adlershof", "Drachenwacht", "Eisenfaust", "Falkenstein", "Geierfeste",
    "Hagelsturm", "Kreuzweg", "Lindenhof", "Mühldorf", "Rebenhain", "Schlangengrube", "Altavista", "Buenagua",           "Cazadragones", "El Cruce", "Fuenteoscura", "Garrablanca",
    "Lanzafuego", "Montaña Negra", "Piedra del Sol", "Ríoseco", "Sierranevada", "Valle de los Héroes",
    "Villadorada", "Aguasclaras", "Bosque de Sombras", "Corazón de Hierro", "Estrella del Norte", "Gavilán",
    "Laguna Estigia", "Mirador del Rey", "Paso del Diablo", "Puertoroca", "Sangrefría", "Tierras Baldías",
    "Valle Salado", "Zarzagosa", "Alborada", "Calavera", "Dos Ríos", "Frontera Salvaje",
    "Guardia Eterna", "Las Almas Perdidas", "Montefrío", "Ojo del Grifo", "Peñascal", "Roca del Cuervo",
    "Sombraverde", "Tormenta Eterna", "Valle de la Luna", "Almadena", "Colina del Viento", "El Despertar",
    "Faro de la Esperanza", "Hondonada del Lobo", "Luz de la Mañana", "Nido de Águilas", "Pico del Trueno",
    "Riachuelo de Plata", "Sendero Oculto", "Torre Vigía", "Valle de las Espinas", "Brisamarina", "Campo Dorado",
    "Cueva del Dragón", "Fortaleza del Sol", "Isla Perdida", "Llanura de Huesos", "Mirada del Buitre", "Pueblo Escondido"];

            let allPlaces = [];
            const occupied = new Set();
            const radius = Math.ceil(Math.sqrt(placeCount)) + 4;
            for (let i = 0; i < placeCount; i++) {
                let q, r;
                do {
                    q = Math.floor(Math.random() * (radius * 2 + 1)) - radius;
                    r = Math.floor(Math.random() * (radius * 2 + 1)) - radius;
                } while (occupied.has(`${q},${r}`));
                occupied.add(`${q},${r}`);
                allPlaces.push({ id: Date.now() + i, name: `${placeNames[Math.floor(Math.random() * placeNames.length)]}_${i}`, coords: { q, r } });
            }

            const typesToCreate = [];
            if (placeCount > 0) typesToCreate.push('Capitale');
            let typePool = [];
            if (placeCount > 1) {
                const rem = placeCount - 1;
                typePool.push(...Array(Math.round(rem * 0.15)).fill('Ville'));
                typePool.push(...Array(Math.round(rem * 0.25)).fill('Bourg'));
                typePool.push(...Array(Math.round(rem * 0.30)).fill('Village'));
                while(typePool.length < rem) typePool.push('Hameau');
            }
            typePool.sort(() => Math.random() - 0.5);
            typesToCreate.push(...typePool);
            allPlaces.forEach((place, index) => place.type = typesToCreate[index]);
            this.currentRegion.places = allPlaces;

            const allEdges = [];
            for (let i = 0; i < allPlaces.length; i++) {
                for (let j = i + 1; j < allPlaces.length; j++) {
                    allEdges.push({ a: allPlaces[i], b: allPlaces[j], dist: this._axialDistance(allPlaces[i].coords, allPlaces[j].coords) });
                }
            }
            allEdges.sort((a, b) => a.dist - b.dist);

            const parent = {};
            allPlaces.forEach(p => parent[p.id] = p.id);
            const find = i => (parent[i] === i) ? i : (parent[i] = find(parent[i]));
            const union = (i, j) => { const rootI = find(i); const rootJ = find(j); if (rootI !== rootJ) parent[rootI] = rootJ; };
            
            const mstEdges = [];
            allEdges.forEach(edge => { if (find(edge.a.id) !== find(edge.b.id)) { union(edge.a.id, edge.b.id); mstEdges.push(edge); } });

            const guaranteedRoads = [];
            const capital = allPlaces.find(p => p.type === 'Capitale');
            if (capital) {
                const importantPlaces = allPlaces.filter(p => p.type === 'Ville' || p.type === 'Bourg');
                importantPlaces.forEach(place => {
                    const roadExists = mstEdges.some(edge => (edge.a.id === capital.id && edge.b.id === place.id) || (edge.b.id === capital.id && edge.a.id === place.id));
                    if (!roadExists) {
                        const missingEdge = allEdges.find(edge => (edge.a.id === capital.id && edge.b.id === place.id) || (edge.b.id === capital.id && edge.a.id === place.id));
                        if(missingEdge) guaranteedRoads.push(missingEdge);
                    }
                });
            }
            const finalEdges = [...new Set([...mstEdges, ...guaranteedRoads])];

            const roadKeys = new Set(finalEdges.map(edge => this._getRoadKey(edge.a.id, edge.b.id)));
            const extraRoadsPercentage = 0.15;
            const potentialExtraEdges = allEdges.filter(edge => !roadKeys.has(this._getRoadKey(edge.a.id, edge.b.id)));
            const numExtraRoads = Math.floor(potentialExtraEdges.length * extraRoadsPercentage);
            for (let i = 0; i < numExtraRoads && i < potentialExtraEdges.length; i++) { roadKeys.add(this._getRoadKey(potentialExtraEdges[i].a.id, potentialExtraEdges[i].b.id)); }

            roadKeys.forEach(key => {
                const [id1, id2] = key.split('-').map(Number);
                const placeA = allPlaces.find(p => p.id === id1);
                const placeB = allPlaces.find(p => p.id === id2);
                this.currentRegion.roads[key] = { type: this._determineRoadType(placeA, placeB) };
            });
            this.log('Lieux et routes générés.', 'info');
            await this.saveData();
            this.log('✅ Étape 1 terminée.', 'success');
        }

        // --- ÉTAPE 2: Construction Économique (Logique de step2.js) ---
        async _step2_buildEconomy() {
            this.log('🏛️ Étape 2 : Construction de l\'économie...');
            this.loadData();
            if (!this.currentRegion) throw new Error("Aucune région trouvée après l'étape 1.");

            const placeConfigs = new Map();
            const builtByPlaceType = new Map();

            this.currentRegion.places.forEach(place => {
                placeConfigs.set(place.id, { buildings: {}, totalBuildings: 0, maxBuildings: this._getBuildingQuotaForPlace(place.type) });
                if (!builtByPlaceType.has(place.type)) builtByPlaceType.set(place.type, new Set());
                if (!place.config) place.config = {};
            });

            this.log("Installation des bâtiments administratifs de base...");
            this.currentRegion.places.forEach(place => {
                const config = placeConfigs.get(place.id);
                const adminCategory = "Bâtiments Administratifs";
                const availableBuildings = this.BUILDING_DATA[place.type];
                if (availableBuildings && availableBuildings[adminCategory]) {
                    config.buildings[adminCategory] = [];
                    for (const name in availableBuildings[adminCategory]) {
                        config.buildings[adminCategory].push({ name, description: availableBuildings[adminCategory][name].description });
                        config.totalBuildings++;
                        builtByPlaceType.get(place.type).add(name);
                    }
                }
            });

            let attempts = 0;
            const maxAttempts = this.currentRegion.places.length * 25;
            while (attempts < maxAttempts) {
                const { unmet } = this._getRegionalNeeds(placeConfigs);
                if (unmet.size === 0) {
                    this.log('Tous les besoins économiques sont satisfaits.', 'info');
                    break;
                }
                const bestCandidate = this._findBestBuildingToAdd(unmet, placeConfigs, builtByPlaceType);
                if (bestCandidate) {
                    const { place, name, category, data } = bestCandidate;
                    const config = placeConfigs.get(place.id);
                    if (!config.buildings[category]) config.buildings[category] = [];
                    config.buildings[category].push({ name, description: data.description });
                    config.totalBuildings++;
                    builtByPlaceType.get(place.type).add(name);
                } else {
                    this.log(`Impossible de satisfaire les besoins restants : ${[...unmet].join(', ')}. Arrêt de l'optimisation.`, 'info');
                    break;
                }
                attempts++;
                if (attempts % 15 === 0) {
                    this.log(`...résolution des dépendances (essai ${attempts}/${maxAttempts})`, 'info');
                    await this._yield();
                }
            }
            if (attempts >= maxAttempts) this.log('Limite de tentatives atteinte pour la résolution des besoins économiques.', 'warning');
            
            this.currentRegion.places.forEach(place => {
                place.config.buildings = placeConfigs.get(place.id).buildings;
                place.config.isValidated = true;
            });
            await this.saveData();
            this.log('✅ Étape 2 terminée.', 'success');
        }

        // --- ÉTAPE 3: Génération de la Population (Logique de step3.js) ---
        async _step3_generatePopulation() {
            this.log('🧬 Étape 3 : Peuplement initial du monde...');
            this.loadData();
            if (!this.currentRegion) throw new Error("Aucune région trouvée après l'étape 2.");

            for (const place of this.currentRegion.places) {
                if (!place.config.isValidated) continue;
                place.demographics = { raceDistribution: {}, allowInterracialMarriage: true, population: [], families: [], inheritanceLaw: 'primogeniture_male' };
                this._randomizeRacesForPlace(place);
                let availableJobs = this._getAvailableJobs(place);
                
                availableJobs.sort((a,b) => (this._getJobData(a.buildingName, a.jobTitle)?.tier ?? 5) - (this._getJobData(b.buildingName, b.jobTitle)?.tier ?? 5));
                
                let individualsToCreate = [];
                const racePool = [];
                Object.entries(place.demographics.raceDistribution).forEach(([race, percent]) => {
                    const count = Math.round(availableJobs.length * (percent / 100));
                    for (let i = 0; i < count; i++) racePool.push(race);
                });
                while (racePool.length < availableJobs.length) racePool.push(Object.keys(this.RACES_DATA.races)[0]);
                if (racePool.length > availableJobs.length) racePool.splice(availableJobs.length);

                availableJobs.forEach(job => {
                    const raceIndex = Math.floor(Math.random() * racePool.length);
                    const selectedRace = racePool.splice(raceIndex, 1)[0];
                    individualsToCreate.push(this._createIndividualForJob(job, selectedRace, place.id));
                });
                
                this._formFamilies(individualsToCreate, place);

                const ruler = place.demographics.population.find(p => p.job && this._getJobData(p.job.buildingName, p.job.jobTitle)?.tier === 0);
                if (ruler) {
                    this._applyDynasticTitles(ruler, place.demographics.population);
                }
            }
            await this.saveData();
            this.log('✅ Étape 3 terminée.', 'success');
        }

        // --- ÉTAPE 4: Simulation Complète (Logique de step4.js) ---
        async _step4_simulateWorld() {
            this.log(`⏳ Étape 4 : Simulation du monde sur <strong>${this.simulationYears}</strong> ans...`);
            this.loadData();
            if (!this.currentRegion) throw new Error("Aucune région trouvée après l'étape 3.");
            
            this.initialSimulationData = JSON.parse(JSON.stringify(this.regions)); 
            const simState = { currentTick: 0, currentMonth: 1, currentYear: 1, log: [] };
            const totalTicks = this.simulationYears * 12;

            this.currentRegion.places.forEach(place => { place.state = { satisfaction: 100, production: {}, consumption: {}, shortages: [], surpluses: [] }; });

            for (let i = 0; i < totalTicks; i++) {
                if (i > 0) { simState.currentTick++; simState.currentMonth++; if (simState.currentMonth > 12) { simState.currentMonth = 1; simState.currentYear++; } }

                this._handleProductionAndConsumption();
                const allPopulation = this.currentRegion.places.flatMap(p => p.demographics.population);
                const allFamilies = this.currentRegion.places.flatMap(p => p.demographics.families);
                
                let rulers = allPopulation.filter(p => p.isAlive && p.job && this._getJobData(p.job.buildingName, p.job.jobTitle)?.tier === 0);
                let dynastyMemberIds = this._getRulingDynastyMemberIds(rulers, allPopulation);
                const { rulingFamilies } = this._findRulersAndFamilies(allPopulation, allFamilies);

                if (simState.currentMonth === 1) { allPopulation.forEach(p => { if (p.isAlive) p.age++; }); }
                allPopulation.forEach(person => { if (person.isAlive && person.job) person.totalMonthsWorked = (person.totalMonthsWorked || 0) + 1; });

                this.currentRegion.places.forEach(place => {
                    this._handleRetirement(place.demographics.population, place);
                    this._handleDeaths(place, simState);
                    rulers = allPopulation.filter(p => p.isAlive && p.job && this._getJobData(p.job.buildingName, p.job.jobTitle)?.tier === 0);
                    dynastyMemberIds = this._getRulingDynastyMemberIds(rulers, allPopulation);
                    this._handleMarriages(place.demographics.population, place, dynastyMemberIds);
                    this._handlePregnancyAndBirths(place, simState);
                    this._handlePromotionsAndJobChanges(place.demographics.population, place, dynastyMemberIds);
                    this._assignJobs(place.demographics.population, place, dynastyMemberIds);
                    this._handleSocialInteractions(place.demographics.population, place);
                });

                this._handleStatAndPrestigeGrowth(allPopulation, rulingFamilies, dynastyMemberIds);
                
                if (simState.currentTick % 5 === 0) { 
                    this._handleMigration(dynastyMemberIds); 
                    this._handleLoveMigration(dynastyMemberIds);
                }
                rulers.forEach(ruler => { this._applyDynasticTitles(ruler, allPopulation); });

                if ((i + 1) % 12 === 0) {
                    this.log(`Année ${simState.currentYear} de simulation terminée.`, 'info');
                    await this._yield();
                }
            }

            this.currentRegion.simulationLog = simState.log;
            await this.saveData();
            this.log('✅ Étape 4 terminée.', 'success');
        }

        _logEvent(message, type, details) {
            // Stub function to prevent errors. The log is not saved in this autorun version.
        }

        // --- PORTAGE DES FONCTIONS UTILITAIRES & DE SIMULATION ---

        _getJobData(buildingName, jobTitle) { try { const b = this._getBuildingData(buildingName); return b?.emplois.find(j => j.titre === jobTitle) || null; } catch (e) { return null; } }
        _getBuildingData(buildingName) { for (const type in this.BUILDING_DATA) { for (const cat in this.BUILDING_DATA[type]) { if (this.BUILDING_DATA[type][cat][buildingName]) return this.BUILDING_DATA[type][cat][buildingName]; } } return null; }
        _getRoadKey(id1, id2) { return [id1, id2].sort((a, b) => a - b).join('-'); }
        _axialDistance(a, b) { const dq = a.q - b.q; const dr = a.r - b.r; return (Math.abs(dq) + Math.abs(dr) + Math.abs(-dq - dr)) / 2; }
        _getBuildingQuotaForPlace(type) { return { "Hameau": 14, "Village": 21, "Bourg": 31, "Ville": 46, "Capitale": 66 }[type] || 15; }
        _determineRoadType(a, b) { const h = { "Capitale": 0, "Ville": 1, "Bourg": 2, "Village": 3, "Hameau": 4 }; const score = (h[a.type] + h[b.type]) / 2; if (score <= 0.5) return 'royal'; if (score <= 1.5) return 'comtal'; if (score <= 2.5) return 'marchand'; return 'seigneurial'; }
        _getPersonById(id, scope) { return scope.find(p => p.id === id); }
        _getParents(person, scope) { return (person.parents || []).map(id => this._getPersonById(id, scope)).filter(Boolean); }
        _getChildren(person, scope) { const childrenIds = new Set(person.childrenIds || []); const spouse = person.spouseId ? this._getPersonById(person.spouseId, scope) : null; if (spouse && spouse.childrenIds) { spouse.childrenIds.forEach(id => childrenIds.add(id)); } return Array.from(childrenIds).map(id => this._getPersonById(id, scope)).filter(Boolean); }
        _getSiblings(person, scope) { const parents = this._getParents(person, scope); if (parents.length === 0) return []; const siblingIds = new Set(); parents.forEach(p => { if (p.childrenIds) p.childrenIds.forEach(childId => siblingIds.add(childId)); }); return Array.from(siblingIds).filter(id => id !== person.id).map(id => this._getPersonById(id, scope)).filter(Boolean); }
        _getAvailableJobs(place) { if (!place.config || !place.config.buildings) return []; const availableJobs = []; const filledJobs = place.demographics.population.filter(p => p.isAlive && p.job).reduce((acc, p) => { const key = `${p.job.buildingName}-${p.job.jobTitle}`; acc[key] = (acc[key] || 0) + 1; return acc; }, {}); Object.values(place.config.buildings).flat().forEach(building => { const buildingData = this._getBuildingData(building.name); if (buildingData && buildingData.emplois) { buildingData.emplois.forEach(job => { const key = `${building.name}-${job.titre}`; const totalSlots = job.postes; const filledSlots = filledJobs[key] || 0; for (let i = 0; i < (totalSlots - filledSlots); i++) availableJobs.push({ buildingName: building.name, jobTitle: job.titre }); }); } }); return availableJobs; }

        // --- Helpers Étape 2 ---
        _getRegionalNeeds(placeConfigs) { const allProviders = new Set(); const allRequired = new Set(); placeConfigs.forEach(config => { Object.values(config.buildings).flat().forEach(building => { const data = this._getBuildingData(building.name); if (!data) return; (data.providesTags || []).forEach(tag => allProviders.add(tag)); Object.keys(data.requiresTags || {}).forEach(tag => allRequired.add(tag)); }); }); const unmet = new Set([...allRequired].filter(tag => !allProviders.has(tag))); return { unmet }; }
        _findBestBuildingToAdd(unmetNeeds, placeConfigs, builtByPlaceType) {
            let candidates = [];
            const DIVERSITY_PENALTY = 25;
            this.currentRegion.places.forEach(place => {
                const config = placeConfigs.get(place.id);
                if (config.totalBuildings >= config.maxBuildings) return;
                const placeTier = this.PLACE_TYPE_HIERARCHY[place.type];

                for (const buildingType in this.BUILDING_DATA) {
                    const buildingTier = this.PLACE_TYPE_HIERARCHY[buildingType];
                    if (placeTier >= buildingTier) {
                        for (const category in this.BUILDING_DATA[buildingType]) {
                            if (category === "Bâtiments Administratifs") continue;
                            for (const name in this.BUILDING_DATA[buildingType][category]) {
                                if (Object.values(config.buildings).flat().some(b => b.name === name)) continue;
                                const data = this.BUILDING_DATA[buildingType][category][name];
                                let priorityScore = 0;
                                if ((data.providesTags || []).some(tag => unmetNeeds.has(tag))) {
                                    priorityScore = 100;
                                }
                                if(priorityScore > 0){
                                    let diversityScore = builtByPlaceType.get(place.type)?.has(name) ? DIVERSITY_PENALTY : 0;
                                    candidates.push({ place, name, category, data, score: priorityScore - diversityScore + Math.random() });
                                }
                            }
                        }
                    }
                }
            });
            if(candidates.length === 0) return null;
            candidates.sort((a, b) => b.score - a.score);
            return candidates[0];
        }

        // --- Helpers Étape 3 ---
        _randomizeRacesForPlace(place) { const raceNames = Object.keys(this.RACES_DATA.races); let dist = {}; let total = 100; for (let i = 0; i < raceNames.length - 1; i++) { const value = Math.floor(Math.random() * (total + 1)); dist[raceNames[i]] = value; total -= value; } dist[raceNames[raceNames.length - 1]] = total; place.demographics.raceDistribution = dist; }
        _getAgeForTier(tier, raceData) { const adultAge = raceData.ageAdulte || 18; const maxAge = raceData.esperanceVieMax || 100; let minAge, maxAgeRange; switch (tier) { case 0: case 1: minAge = Math.max(adultAge, Math.floor(maxAge * 0.4)); maxAgeRange = Math.floor(maxAge * 0.2); break; case 2: minAge = Math.max(adultAge, Math.floor(maxAge * 0.3)); maxAgeRange = Math.floor(maxAge * 0.2); break; case 3: minAge = Math.max(adultAge, Math.floor(maxAge * 0.2)); maxAgeRange = Math.floor(maxAge * 0.15); break; case 4: minAge = adultAge + 2; maxAgeRange = 10; break; default: minAge = adultAge; maxAgeRange = 7; break; } return Math.min(minAge + Math.floor(Math.random() * (maxAgeRange + 1)), maxAge - 1); }
        _getWeightedDesiredChildren() { const weights = [0, 1, 1, 2, 2, 2, 3, 3]; return weights[Math.floor(Math.random() * weights.length)]; }
        _createIndividualForJob(job, race, locationId) {
            const raceData = this.RACES_DATA.races[race];
            const jobData = this._getJobData(job.buildingName, job.jobTitle);
            const gender = Math.random() < 0.5 ? 'Homme' : 'Femme';
            const firstName = raceData[gender === 'Homme' ? 'prenomsM' : 'prenomsF'][Math.floor(Math.random() * raceData.prenomsM.length)];
            const age = this._getAgeForTier(jobData.tier, raceData);
            const person = { id: `p_${Date.now()}_${Math.random()}`, firstName, race, gender, age, job, locationId, isAlive: true, isCustom: false, status: 'Actif', parents: [], childrenIds: [], totalMonthsWorked: 0, desiredChildren: this._getWeightedDesiredChildren(), prestige: 0, prestigeBuffer: 0, stats: { intelligence: 10, force: 10, constitution: 10, dexterite: 10, sagesse: 10, charisme: 10 }, statsBuffer: { intelligence: 0, force: 0, constitution: 0, dexterite: 0, sagesse: 0, charisme: 0 }, friendIds: [], acquaintanceIds: [], maxFriends: Math.floor(Math.random() * 5) + 1, maxAcquaintances: Math.floor(Math.random() * 12) + 0 };
            const { prestige, stats } = this._applyInitialExperience(person, jobData);
            person.prestige = prestige; person.stats = stats;
            return person;
        }
        _applyInitialExperience(person, jobData) {
            const raceData = this.RACES_DATA.races[person.race];
            if (!raceData || !jobData) return { prestige: 0, stats: { intelligence: 10, force: 10, constitution: 10, dexterite: 10, sagesse: 10, charisme: 10 } };
            const experienceInMonths = Math.max(0, person.age - raceData.ageAdulte) * 12;
            let prestige = jobData.prerequis?.prestige || 0;
            let stats = { intelligence: 10, force: 10, constitution: 10, dexterite: 10, sagesse: 10, charisme: 10 };
            if (jobData.gainsMensuels) {
                let ageMultiplier = 1.0;
                const DECAY_START_AGE = raceData.esperanceVieMax * 0.7;
                if (person.age >= DECAY_START_AGE) { ageMultiplier = Math.max(0, 1.0 - (person.age - DECAY_START_AGE) / (raceData.esperanceVieMax - DECAY_START_AGE)); }
                prestige += (jobData.gainsMensuels.prestige || 0) * experienceInMonths * ageMultiplier * (0.8 + Math.random() * 0.4);
                if (jobData.gainsMensuels.stats) { for (const stat in jobData.gainsMensuels.stats) { stats[stat] += jobData.gainsMensuels.stats[stat] * experienceInMonths * ageMultiplier * (0.8 + Math.random() * 0.4); } }
            }
            Object.keys(stats).forEach(k => stats[k] = Math.max(1, Math.round(stats[k])));
            return { prestige: Math.round(prestige), stats };
        }
        _formFamilies(individuals, place) {
            let men = individuals.filter(p => p.gender === 'Homme');
            let women = individuals.filter(p => p.gender === 'Femme');
            const usedNames = new Set();
            while (men.length > 0 && women.length > 0) {
                const man = men.pop();
                const womanIndex = women.findIndex(w => Math.abs(w.age - man.age) <= 10 && (w.race === man.race || (this.RACES_DATA.compatibilites[man.race] || []).includes(w.race)));
                if (womanIndex !== -1) {
                    const woman = women.splice(womanIndex, 1)[0];
                    let familyName;
                    do { familyName = this.RACES_DATA.races[man.race].noms[Math.floor(Math.random() * this.RACES_DATA.races[man.race].noms.length)]; } while (usedNames.has(familyName));
                    usedNames.add(familyName);
                    const family = { id: `fam_${Date.now()}_${Math.random()}`, name: familyName, locationId: place.id, memberIds: [man.id, woman.id], isCustom: false, status: 'active' };
                    man.lastName = woman.lastName = familyName; woman.maidenName = woman.lastName;
                    man.familyId = woman.familyId = family.id;
                    man.spouseId = woman.id; woman.spouseId = man.id;
                    const childCount = Math.min(man.desiredChildren, woman.desiredChildren);
                    for (let i = 0; i < childCount; i++) {
                        const child = this._createChild(man, woman);
                        child.age = Math.floor(Math.random() * (Math.min(man.age, woman.age) - this.RACES_DATA.races[child.race].ageAdulte));
                        if (child.age < 0) continue;
                        family.memberIds.push(child.id); man.childrenIds.push(child.id); woman.childrenIds.push(child.id); place.demographics.population.push(child);
                    }
                    place.demographics.families.push(family);
                }
            }
            [...men, ...women].forEach(p => { let familyName; do { familyName = this.RACES_DATA.races[p.race].noms[Math.floor(Math.random() * this.RACES_DATA.races[p.race].noms.length)]; } while (usedNames.has(familyName)); usedNames.add(familyName); p.lastName = familyName; const family = { id: `fam_${Date.now()}_${Math.random()}`, name: p.lastName, locationId: place.id, memberIds: [p.id], isCustom: false, status: 'active' }; p.familyId = family.id; place.demographics.families.push(family); });
            place.demographics.population.push(...individuals);
        }
        _createChild(father, mother) { const childGender = Math.random() > 0.5 ? 'Homme' : 'Femme'; const mixedRaceKey = [father.race, mother.race].sort().join('-'); const childRace = this.RACES_DATA.racesMixtes[mixedRaceKey] || father.race; const raceData = this.RACES_DATA.races[childRace]; const names = childGender === 'Homme' ? raceData.prenomsM : raceData.prenomsF; const firstName = names[Math.floor(Math.random() * names.length)]; return { id: `p_child_${Date.now()}_${Math.random()}`, firstName, lastName: father.lastName, race: childRace, gender: childGender, age: 0, isAlive: true, job: null, locationId: father.locationId, familyId: father.familyId, parents: [father.id, mother.id], childrenIds: [], isCustom: false, prestige: 0, prestigeBuffer: 0, stats: { intelligence: 5, force: 5, constitution: 5, dexterite: 5, sagesse: 5, charisme: 5 }, statsBuffer: { intelligence: 0, force: 0, constitution: 0, dexterite: 0, sagesse: 0, charisme: 0 }, status: 'Actif', friendIds: [], acquaintanceIds: [], maxFriends: Math.floor(Math.random() * 5) + 1, maxAcquaintances: Math.floor(Math.random() * 12) + 7, desiredChildren: this._getWeightedDesiredChildren(), totalMonthsWorked: 0 }; }

        // --- Fonctions de Simulation (portées et mises à jour de step4.js) ---
        _handleProductionAndConsumption() { this.currentRegion.places.forEach(place => { place.state.production = {}; if (place.config?.buildings) { Object.values(place.config.buildings).flat().forEach(building => { const buildingData = this._getBuildingData(building.name); if (buildingData?.providesTags) { buildingData.providesTags.forEach(tag => { place.state.production[tag] = (place.state.production[tag] || 0) + 1; }); } }); } }); this.currentRegion.places.forEach(place => { place.state.consumption = {}; place.state.shortages = []; let totalNeeds = 0; let metNeeds = 0; if (place.config?.buildings) { Object.values(place.config.buildings).flat().forEach(building => { const buildingData = this._getBuildingData(building.name); if (buildingData?.requiresTags) { Object.keys(buildingData.requiresTags).forEach(tag => { totalNeeds++; place.state.consumption[tag] = (place.state.consumption[tag] || 0) + 1; let found = false; if (place.state.production[tag] && place.state.production[tag] > 0) { place.state.production[tag]--; metNeeds++; found = true; } else { for (const otherPlace of this.currentRegion.places) { if (otherPlace.id !== place.id && otherPlace.state.production[tag] && otherPlace.state.production[tag] > 0) { otherPlace.state.production[tag]--; metNeeds++; found = true; break; } } } if (!found) place.state.shortages.push(tag); }); } }); } place.state.satisfaction = Math.round((place.state.satisfaction * 0.9) + ((totalNeeds > 0 ? (metNeeds / totalNeeds) : 1) * 100 * 0.1)); place.state.surpluses = Object.keys(place.state.production).filter(tag => place.state.production[tag] > 0); }); }
        
        _handleRetirement(population, place) { population.forEach(person => { if (!person.isAlive || !person.job || person.status === 'Retraité(e)') return; const raceData = this.RACES_DATA.races[person.race]; if (!raceData) return; const jobData = this._getJobData(person.job.buildingName, person.job.jobTitle); if (!jobData || jobData.tier === undefined || jobData.tier === 0) return; let retirementAge = -1; const lifespan = raceData.esperanceVieMax; switch (jobData.tier) { case 1: retirementAge = Math.floor(lifespan * 0.85); break; case 2: retirementAge = Math.floor(lifespan * 0.80); break; case 3: retirementAge = Math.floor(lifespan * 0.75); break; case 4: case 5: retirementAge = Math.floor(lifespan * 0.70); break; default: retirementAge = Math.floor(lifespan * 0.99); break; } if (retirementAge > 0 && person.age >= retirementAge) { person.lastJobTitle = person.job.jobTitle; person.job = null; person.status = 'Retraité(e)'; } }); }
        
        _handleDeaths(place, simState) { const initialPlaceData = this.initialSimulationData.find(r => r.id === this.currentRegion.id)?.places.find(p => p.id === place.id); if (!initialPlaceData) return; const initialPopCount = initialPlaceData.demographics.population.length; const currentPopCount = place.demographics.population.filter(p => p.isAlive).length; const isOverpopulated = initialPopCount > 0 && currentPopCount > (initialPopCount * 1.50); let overpopulationFactor = isOverpopulated ? currentPopCount / (initialPopCount * 1.50) : 1.0; const familyInfluences = new Map(); if (isOverpopulated) { place.demographics.families.forEach(family => { const influence = family.memberIds.map(id => this._getPersonById(id, place.demographics.population)).filter(Boolean).reduce((sum, member) => sum + (member.prestige || 0), 0); familyInfluences.set(family.id, influence); }); } place.demographics.population.forEach((person) => { if (!person.isAlive) return; const raceData = this.RACES_DATA.races[person.race]; if (!raceData) return; let deathEvent = false; let causeOfDeath = null; if (isOverpopulated) { const familyInfluence = familyInfluences.get(person.familyId) || 0; const influenceModifier = 1 / (1 + (familyInfluence / 50)); let overpopulationDeathChance = (0.050 * overpopulationFactor) * influenceModifier; if (person.age > raceData.esperanceVieMax * 0.5) { const ageScaling = 1 + 15 * ((person.age - raceData.esperanceVieMax * 0.2) / (raceData.esperanceVieMax * 0.2)); overpopulationDeathChance *= ageScaling; } if (Math.random() < overpopulationDeathChance) { deathEvent = true; causeOfDeath = 'maladie'; } } if (!deathEvent && person.age > raceData.esperanceVieMax * 0.7) { const ageRatio = (person.age - (raceData.esperanceVieMax * 0.7)) / (raceData.esperanceVieMax * 0.3); const oldAgeDeathChance = Math.pow(ageRatio, 3) * 0.05; if (Math.random() < oldAgeDeathChance) { deathEvent = true; causeOfDeath = 'vieillesse'; } } if (!deathEvent && Math.random() < 0.0001) { deathEvent = true; causeOfDeath = 'accident'; } if (deathEvent) { person.isAlive = false; person.ageAtDeath = person.age; person.deathYear = simState.currentYear; person.causeOfDeath = causeOfDeath; person.jobBeforeDeath = person.job ? person.job.jobTitle : (person.royalTitle || 'Sans emploi'); if (person.job && this._getJobData(person.job.buildingName, person.job.jobTitle)?.tier === 0) { this._handleSuccession(person, place); } if (person.job) person.job = null; const family = place.demographics.families.find(f => f.id === person.familyId); if (family) { const hasLivingMembers = family.memberIds.some(memberId => this._getPersonById(memberId, place.demographics.population)?.isAlive); if (!hasLivingMembers) { family.status = 'extinct'; } } } }); }
        
        _handleSuccession(deceasedRuler, place) {
            const allPopulation = this.currentRegion.places.flatMap(p => p.demographics.population);
            const job = deceasedRuler.job;
            const law = place.demographics.inheritanceLaw || 'primogeniture_male';
            let newRuler = null;

            if (law === 'elective') {
                const familyMembers = allPopulation.filter(p => p.familyId === deceasedRuler.familyId && p.isAlive && p.age >= this.RACES_DATA.races[p.race].ageAdulte);
                if (familyMembers.length > 0) newRuler = familyMembers.sort((a, b) => (b.prestige || 0) - (a.prestige || 0))[0];
            } else {
                const findHeirRecursive = (person) => {
                    if (!person || !person.isAlive || person.familyId !== deceasedRuler.familyId) return null;
                    const isEligible = person.age >= this.RACES_DATA.races[person.race].ageAdulte && (law === 'primogeniture_absolute' || (law === 'primogeniture_male' && person.gender === 'Homme') || (law === 'primogeniture_female' && person.gender === 'Femme'));
                    if (isEligible) return person;
                    const children = this._getChildren(person, allPopulation).filter(c => c.isAlive && c.familyId === deceasedRuler.familyId).sort((a, b) => b.age - a.age);
                    for (const child of children) { const heir = findHeirRecursive(child); if (heir) return heir; }
                    return null;
                };
                const children = this._getChildren(deceasedRuler, allPopulation).filter(c => c.isAlive && c.familyId === deceasedRuler.familyId).sort((a, b) => b.age - a.age);
                for (const child of children) { newRuler = findHeirRecursive(child); if (newRuler) break; }
                if (!newRuler) {
                    const siblings = this._getSiblings(deceasedRuler, allPopulation).filter(s => s.isAlive && s.familyId === deceasedRuler.familyId).sort((a, b) => b.age - a.age);
                    for (const sibling of siblings) { newRuler = findHeirRecursive(sibling); if (newRuler) break; }
                }
            }

            if (newRuler) {
                newRuler.job = job; newRuler.status = 'Actif'; delete newRuler.royalTitle; this._applyDynasticTitles(newRuler, allPopulation);
            } else {
                const familyScores = place.demographics.families.map(family => { const members = family.memberIds.map(id => this._getPersonById(id, allPopulation)).filter(p => p?.isAlive); return { family, score: members.reduce((sum, p) => sum + (p.prestige || 0), 0) }; }).sort((a, b) => b.score - a.score);
                if (familyScores.length > 0 && familyScores[0].score > -1) {
                    const newRulingFamily = familyScores[0].family;
                    const adultMembers = newRulingFamily.memberIds.map(id => this._getPersonById(id, allPopulation)).filter(p => p?.isAlive && p.age >= this.RACES_DATA.races[p.race].ageAdulte).sort((a, b) => (b.prestige || 0) - (a.prestige || 0));
                    if (adultMembers.length > 0) { const chosenRuler = adultMembers[0]; chosenRuler.job = job; chosenRuler.status = 'Actif'; delete chosenRuler.royalTitle; this._applyDynasticTitles(chosenRuler, allPopulation); }
                }
            }
        }
        _findBestPartnerForSimulation(person, potentialPartners) {
            let bestPartner = null; let highestScore = -1;
            const personJobTier = person.job ? (this._getJobData(person.job.buildingName, person.job.jobTitle)?.tier ?? 5) : 5;
            for (const partner of potentialPartners) {
                let currentScore = 50;
                const partnerJobTier = partner.job ? (this._getJobData(partner.job.buildingName, partner.job.jobTitle)?.tier ?? 5) : 5;
                const tierDifference = Math.abs(personJobTier - partnerJobTier);
                if (tierDifference === 0) currentScore += 100; else if (tierDifference === 1) currentScore += 40;
                if (person.job && partner.job && person.job.buildingName === partner.job.buildingName) currentScore += 25;
                if (Math.abs((person.prestige || 0) - (partner.prestige || 0)) / Math.max(person.prestige || 1, 1) < 0.25) currentScore += 30;
                if (currentScore > highestScore) { highestScore = currentScore; bestPartner = partner; }
            }
            return highestScore > 75 ? bestPartner : null;
        }
        _handleMarriages(population, place, dynastyMemberIds) {
            let singleMen = population.filter(p => p.isAlive && p.gender === 'Homme' && !p.spouseId && !p.hasBeenMarried && p.age >= this.RACES_DATA.races[p.race].ageAdulte);
            let singleWomen = population.filter(p => p.isAlive && p.gender === 'Femme' && !p.spouseId && !p.hasBeenMarried && p.age >= this.RACES_DATA.races[p.race].ageAdulte);
            if (singleMen.length === 0 || singleWomen.length === 0) return;
            const allPopulationForGenealogy = this.currentRegion.places.flatMap(p => p.demographics.population);
            singleMen.forEach(man => {
                if (Math.random() < 0.1) {
                    const forbiddenIds = new Set();
                    this._getDescendantMap(man, allPopulationForGenealogy).forEach((gen, personId) => { if (personId !== man.id) forbiddenIds.add(personId); });
                    this._getParents(man, allPopulationForGenealogy).forEach(parent => { forbiddenIds.add(parent.id); this._getParents(parent, allPopulationForGenealogy).forEach(gp => forbiddenIds.add(gp.id)); });
                    this._getSiblings(man, allPopulationForGenealogy).forEach(sibling => forbiddenIds.add(sibling.id));
                    const potentialWives = singleWomen.filter(woman => !forbiddenIds.has(woman.id) && Math.abs(man.age - woman.age) <= 10 && (woman.race === man.race || (this.RACES_DATA.compatibilites[man.race] || []).includes(woman.race)));
                    if (potentialWives.length > 0) {
                        const wife = this._findBestPartnerForSimulation(man, potentialWives);
                        if (wife) {
                            singleWomen = singleWomen.filter(w => w.id !== wife.id);
                            man.spouseId = wife.id; wife.spouseId = man.id; man.hasBeenMarried = true; wife.hasBeenMarried = true; wife.maidenName = wife.lastName; wife.lastName = man.lastName;
                            const oldFamily = this.currentRegion.places.flatMap(p => p.demographics.families).find(f => f.id === wife.familyId);
                            if (oldFamily) {
                                const indexInOldFamily = oldFamily.memberIds.indexOf(wife.id);
                                if (indexInOldFamily > -1) oldFamily.memberIds.splice(indexInOldFamily, 1);
                                if (oldFamily.memberIds.length === 0) {
                                    const placeOfOldFamily = this.currentRegion.places.find(p => p.id === oldFamily.locationId);
                                    if (placeOfOldFamily) {
                                        const familyInPlace = placeOfOldFamily.demographics.families.find(f => f.id === oldFamily.id);
                                        if(familyInPlace) familyInPlace.status = 'migrated';
                                    }
                                }
                            }
                            wife.familyId = man.familyId;
                            const newFamily = this.currentRegion.places.flatMap(p => p.demographics.families).find(f => f.id === man.familyId);
                            if (newFamily && !newFamily.memberIds.includes(wife.id)) newFamily.memberIds.push(wife.id);
                            if (dynastyMemberIds.has(man.id) && !dynastyMemberIds.has(wife.id)) { wife.job = null; wife.royalTitle = 'Famille Gouvernante'; } else if (dynastyMemberIds.has(wife.id) && !dynastyMemberIds.has(man.id)) { man.job = null; man.royalTitle = 'Famille Gouvernante'; }
                        }
                    }
                }
            });
        }
        _handlePregnancyAndBirths(place, simState) { const population = place.demographics.population; population.filter(p => p.isAlive && p.gender === 'Femme' && p.spouseId && !p.isPregnant && p.status !== 'En congé maternité').forEach(woman => { const raceData = this.RACES_DATA.races[woman.race]; const adultAge = raceData.ageAdulte; const fertileAgeMax = raceData.esperanceVieMax * 0.5; if (woman.age >= adultAge && woman.age <= fertileAgeMax) { const husband = population.find(p => p.id === woman.spouseId); if (!husband) return; if (woman.desiredChildren === undefined) woman.desiredChildren = this._getWeightedDesiredChildren(); if (husband.desiredChildren === undefined) husband.desiredChildren = this._getWeightedDesiredChildren(); const targetChildrenCount = Math.min(woman.desiredChildren, husband.desiredChildren); const currentChildrenCount = woman.childrenIds ? woman.childrenIds.length : 0; if (currentChildrenCount < targetChildrenCount) { const fertilityMultiplier = Math.max(0, 1 - ((woman.age - adultAge) / (fertileAgeMax - adultAge))); let birthChance = 0.25 * fertilityMultiplier; if (Math.random() < birthChance) { woman.isPregnant = true; woman.pregnancyStart = simState.currentTick; } } } }); population.filter(p => p.isPregnant && (simState.currentTick - p.pregnancyStart) >= this.RACES_DATA.races[p.race].dureeGestationMois).forEach(mother => { mother.isPregnant = false; const father = population.find(p => p.id === mother.spouseId); if (!father) return; const motherJobTier = mother.job ? (this._getJobData(mother.job.buildingName, mother.job.jobTitle)?.tier ?? 5) : 5; let stillbirthChance = [0, 0, 0.02, 0.05, 0.10, 0.15][motherJobTier]; if (Math.random() >= stillbirthChance) { const newChild = this._createChild(father, mother); population.push(newChild); if (!father.childrenIds) father.childrenIds = []; if (!mother.childrenIds) mother.childrenIds = []; father.childrenIds.push(newChild.id); mother.childrenIds.push(newChild.id); const family = place.demographics.families.find(f => f.id === father.familyId); if (family && !family.memberIds.includes(newChild.id)) family.memberIds.push(newChild.id); if (mother.job && this._getJobData(mother.job.buildingName, mother.job.jobTitle)?.tier > 1) { mother.job = null; mother.status = 'En congé maternité'; mother.maternityLeaveEndTick = simState.currentTick + (this.RACES_DATA.races[newChild.race].ageApprentissage * 12); } } }); }
        
        _handleStatAndPrestigeGrowth(population, rulingFamilies, dynastyMemberIds) { rulingFamilies.forEach(({ ruler, jobData }) => { if (!ruler || !jobData?.gainsMensuels) return; const descendantMap = this._getDescendantMap(ruler, population); descendantMap.forEach((generation, personId) => { const person = this._getPersonById(personId, population); if (!person?.isAlive) return; let percentage = (generation <= 1) ? 1.0 : (generation === 2 ? 0.7 : 0.4); this._applyGainsToPerson(person, jobData.gainsMensuels, percentage); }); }); population.forEach(person => { if (!person.isAlive) return; const raceData = this.RACES_DATA.races[person.race]; if (dynastyMemberIds.has(person.id)) return; if (person.job && person.age >= raceData.ageTravail) { const jobData = this._getJobData(person.job.buildingName, person.job.jobTitle); if (jobData?.gainsMensuels) { let ageMultiplier = 1.0; const decayStartAge = raceData.esperanceVieMax * 0.7; if (person.age >= decayStartAge) { ageMultiplier = Math.max(0, 1.0 - (person.age - decayStartAge) / (raceData.esperanceVieMax - decayStartAge)); } let workTimeMultiplier = 1.0; const yearsWorked = (person.totalMonthsWorked || 0) / 12; if (yearsWorked >= 25) { workTimeMultiplier = Math.max(0, 1.0 - (yearsWorked - 25) / 25); } const finalMultiplier = ageMultiplier * workTimeMultiplier; const modifiedGains = { prestige: (jobData.gainsMensuels.prestige || 0) * finalMultiplier, stats: {} }; for (const stat in jobData.gainsMensuels.stats) modifiedGains.stats[stat] = (jobData.gainsMensuels.stats[stat] || 0) * finalMultiplier; this._applyGainsToPerson(person, modifiedGains, 1.0); } } else if (person.parents?.length > 0 && person.age >= raceData.ageApprentissage && person.age < raceData.ageTravail) { let parentPrestigeGain = 0; let parentStatGains = { intelligence: 0, force: 0, constitution: 0, dexterite: 0, sagesse: 0, charisme: 0 }; person.parents.forEach(parentId => { const parent = this._getPersonById(parentId, population); if (parent?.job) { const jobData = this._getJobData(parent.job.buildingName, parent.job.jobTitle); if (jobData?.gainsMensuels) { parentPrestigeGain += (jobData.gainsMensuels.prestige || 0) * 0.5; for (const stat in jobData.gainsMensuels.stats) parentStatGains[stat] += (jobData.gainsMensuels.stats[stat] || 0) * 0.5; } } }); this._applyGainsToPerson(person, { prestige: parentPrestigeGain, stats: parentStatGains }, 1.0); } else if (!person.job && !person.royalTitle && person.age >= raceData.ageTravail) { const passiveGain = 0.1 + Math.random() * 0.2; this._applyGainsToPerson(person, { prestige: passiveGain, stats: { intelligence: passiveGain, force: passiveGain, constitution: passiveGain, dexterite: passiveGain, sagesse: passiveGain, charisme: passiveGain } }, 1.0); } }); }
        
        _applyGainsToPerson(person, gains, percentage) { person.prestigeBuffer = (person.prestigeBuffer || 0) + (gains.prestige || 0) * percentage; if (person.prestigeBuffer >= 1) { const gain = Math.floor(person.prestigeBuffer); person.prestige = (person.prestige || 0) + gain; person.prestigeBuffer -= gain; } if (gains.stats) { if(!person.statsBuffer) person.statsBuffer = { intelligence: 0, force: 0, constitution: 0, dexterite: 0, sagesse: 0, charisme: 0 }; for (const stat in gains.stats) { person.statsBuffer[stat] = (person.statsBuffer[stat] || 0) + gains.stats[stat] * percentage; if (person.statsBuffer[stat] >= 1) { const gain = Math.floor(person.statsBuffer[stat]); if (person.stats) { person.stats[stat] = (person.stats[stat] || 0) + gain; person.statsBuffer[stat] -= gain; } } } } }
        _handlePromotionsAndJobChanges(population, place, dynastyMemberIds) { let availableJobs = this._getAvailableJobs(place).sort((a, b) => (this._getJobData(a.buildingName, a.jobTitle)?.tier ?? 99) - (this._getJobData(b.buildingName, b.jobTitle)?.tier ?? 99)); const employedPopulation = population.filter(p => p.isAlive && p.job && p.status === 'Actif' && !dynastyMemberIds.has(p.id)); if (employedPopulation.length === 0) return; for (let i = 0; i < availableJobs.length; i++) { const vacantJob = availableJobs[i]; const vacantJobData = this._getJobData(vacantJob.buildingName, vacantJob.jobTitle); if (!vacantJobData || vacantJobData.tier === 0) continue; const candidates = employedPopulation.filter(p => { const currentJobData = this._getJobData(p.job.buildingName, p.job.jobTitle); return currentJobData && currentJobData.tier > vacantJobData.tier && p.job.buildingName === vacantJob.buildingName && (p.prestige || 0) >= (vacantJobData.prerequis.prestige || 0); }).sort((a, b) => (b.prestige || 0) - (a.prestige || 0)); if (candidates.length > 0) { const bestCandidate = candidates[0]; const oldJobTitle = bestCandidate.job.jobTitle; const oldBuildingName = bestCandidate.job.buildingName; bestCandidate.job = { locationId: place.id, buildingName: vacantJob.buildingName, jobTitle: vacantJob.jobTitle }; availableJobs.splice(i--, 1); availableJobs.push({ buildingName: oldBuildingName, jobTitle: oldJobTitle }); } } }
        _assignJobs(population, place, dynastyMemberIds) { let availableJobs = this._getAvailableJobs(place); if (availableJobs.length === 0) return; const unemployedAdults = population.filter(p => p.isAlive && !p.job && !p.royalTitle && p.status === 'Actif' && !dynastyMemberIds.has(p.id) && p.age >= this.RACES_DATA.races[p.race].ageTravail).sort((a, b) => (b.prestige || 0) - (a.prestige || 0)); unemployedAdults.forEach(person => { if (availableJobs.length === 0) return; const suitableJobIndex = availableJobs.findIndex(job => { const jobData = this._getJobData(job.buildingName, job.jobTitle); return jobData && jobData.tier !== 0 && (person.prestige || 0) >= (jobData.prerequis?.prestige || 0); }); if (suitableJobIndex > -1) { const [jobToAssign] = availableJobs.splice(suitableJobIndex, 1); person.job = { locationId: place.id, buildingName: jobToAssign.buildingName, jobTitle: jobToAssign.jobTitle }; } }); }
        
        _handleSocialInteractions(population, place) { const adults = population.filter(p => p.isAlive && p.age >= this.RACES_DATA.races[p.race].ageAdulte); if (adults.length < 2) return; const colleaguesByBuilding = {}; adults.forEach(p => { if (p.job) { if (!colleaguesByBuilding[p.job.buildingName]) colleaguesByBuilding[p.job.buildingName] = []; colleaguesByBuilding[p.job.buildingName].push(p); } }); for (const building in colleaguesByBuilding) { const workers = colleaguesByBuilding[building]; if (workers.length < 2) continue; for (let i = 0; i < workers.length; i++) { for (let j = i + 1; j < workers.length; j++) { const p1 = workers[i]; const p2 = workers[j]; if (Math.random() < 0.15 && p1.acquaintanceIds.length < p1.maxAcquaintances && p2.acquaintanceIds.length < p2.maxAcquaintances && !p1.acquaintanceIds.includes(p2.id) && !p1.friendIds.includes(p2.id)) { p1.acquaintanceIds.push(p2.id); p2.acquaintanceIds.push(p1.id); } } } } const sampledAdults = adults.sort(() => 0.5 - Math.random()).slice(0, Math.max(10, Math.floor(adults.length * 0.2))); sampledAdults.forEach(person => { if (person.acquaintanceIds?.length > 0 && person.friendIds.length < person.maxFriends) { const acquaintanceToUpgradeId = person.acquaintanceIds[Math.floor(Math.random() * person.acquaintanceIds.length)]; const acquaintance = adults.find(p => p.id === acquaintanceToUpgradeId); if (acquaintance && acquaintance.friendIds.length < acquaintance.maxFriends && Math.random() < 0.05) { person.friendIds.push(acquaintance.id); person.acquaintanceIds = person.acquaintanceIds.filter(id => id !== acquaintance.id); acquaintance.friendIds.push(person.id); acquaintance.acquaintanceIds = acquaintance.acquaintanceIds.filter(id => id !== person.id); } } }); }
        
        _handleMigration(dynastyMemberIds) { const allAvailableJobsByPlace = new Map(); this.currentRegion.places.forEach(p => allAvailableJobsByPlace.set(p.id, this._getAvailableJobs(p))); const allUnemployed = []; this.currentRegion.places.forEach(place => { const unemployed = place.demographics.population.filter(p => p.isAlive && !p.job && p.status === 'Actif' && p.age >= this.RACES_DATA.races[p.race].ageTravail && !dynastyMemberIds.has(p.id)); unemployed.forEach(p => allUnemployed.push({ person: p, sourcePlace: place })); }); if (allUnemployed.length === 0) return; const personToMoveData = allUnemployed[Math.floor(Math.random() * allUnemployed.length)]; const { person, sourcePlace } = personToMoveData; let bestOffer = { destination: null, job: null, score: 0 }; for (const destinationPlace of this.currentRegion.places) { if (destinationPlace.id === sourcePlace.id) continue; const availableJobs = allAvailableJobsByPlace.get(destinationPlace.id); if (availableJobs.length > 0) { const distance = this._axialDistance(sourcePlace.coords, destinationPlace.coords); const score = (destinationPlace.state.satisfaction / Math.max(distance, 1)) * Math.random(); if (score > bestOffer.score) { bestOffer = { destination: destinationPlace, job: availableJobs[0], score: score }; } } } if (bestOffer.destination) { const { destination, job } = bestOffer; const personIndex = sourcePlace.demographics.population.findIndex(p => p.id === person.id); if (personIndex > -1) sourcePlace.demographics.population.splice(personIndex, 1); person.locationId = destination.id; person.job = { locationId: destination.id, buildingName: job.buildingName, jobTitle: job.jobTitle }; destination.demographics.population.push(person); const family = sourcePlace.demographics.families.find(f => f.id === person.familyId); if (family) { const memberIndex = family.memberIds.indexOf(person.id); if (memberIndex > -1) family.memberIds.splice(memberIndex, 1); if (family.memberIds.length === 0) { family.status = 'migrated'; } } const newFamily = { id: `fam_mig_${Date.now()}_${Math.random()}`, name: person.lastName, locationId: destination.id, memberIds: [person.id], isCustom: false, status: 'active' }; destination.demographics.families.push(newFamily); person.familyId = newFamily.id; } }
        
        _handleLoveMigration(dynastyMemberIds) {
            const allPlaces = this.currentRegion.places;
            if (allPlaces.length < 2) return;
            allPlaces.forEach(sourcePlace => {
                const potentialMigrants = sourcePlace.demographics.population.filter(p => {
                    const raceData = this.RACES_DATA.races[p.race];
                    return raceData && p.isAlive && !p.spouseId && p.status === 'Actif' && p.age >= (raceData.ageAdulte + 3) && !dynastyMemberIds.has(p.id);
                });
                potentialMigrants.forEach(person => {
                    const raceData = this.RACES_DATA.races[person.race];
                    const yearsSingle = person.age - (raceData.ageAdulte + 3);
                    let migrationChance = Math.min(0.1, 0.005 * (1 + (yearsSingle * 0.1)));
                    if (Math.random() < migrationChance) {
                        const possibleDestinations = allPlaces.filter(p => p.id !== sourcePlace.id);
                        if (possibleDestinations.length > 0) {
                            const destinationPlace = possibleDestinations[Math.floor(Math.random() * possibleDestinations.length)];
                            const personIndex = sourcePlace.demographics.population.findIndex(p => p.id === person.id);
                            if (personIndex > -1) sourcePlace.demographics.population.splice(personIndex, 1); else return;
                            person.locationId = destinationPlace.id; person.job = null;
                            destinationPlace.demographics.population.push(person);
                            const oldFamily = sourcePlace.demographics.families.find(f => f.id === person.familyId);
                            if (oldFamily) {
                                const memberIndex = oldFamily.memberIds.indexOf(person.id);
                                if (memberIndex > -1) oldFamily.memberIds.splice(memberIndex, 1);
                                if (oldFamily.memberIds.length === 0) { oldFamily.status = 'migrated'; }
                            }
                            const newFamily = { id: `fam_lovemig_${Date.now()}_${Math.random()}`, name: person.lastName, locationId: destinationPlace.id, memberIds: [person.id], isCustom: false, status: 'active' };
                            destinationPlace.demographics.families.push(newFamily);
                            person.familyId = newFamily.id;
                        }
                    }
                });
            });
        }
        
        _applyDynasticTitles(ruler, population) {
            const assignTitle = (person, title) => { if (person?.isAlive && person.royalTitle !== title) { person.royalTitle = title; person.job = null; } };
            delete ruler.royalTitle;
            const spouse = this._getPersonById(ruler.spouseId, population); if (spouse) assignTitle(spouse, 'Famille Gouvernante');
            const parents = this._getParents(ruler, population); parents.forEach(parent => { if (parent?.isAlive && this._getJobData(parent.job?.buildingName, parent.job?.jobTitle)?.tier !== 0) { assignTitle(parent, parent.gender === 'Homme' ? 'Patriarche' : 'Matriarche'); const parentSpouse = this._getPersonById(parent.spouseId, population); if (parentSpouse && !parents.some(p => p.id === parentSpouse.id)) assignTitle(parentSpouse, 'Famille Gouvernante'); } });
            this._getChildren(ruler, population).forEach(child => { if (child?.isAlive) { assignTitle(child, child.gender === 'Homme' ? 'Héritier' : 'Héritière'); const childSpouse = this._getPersonById(child.spouseId, population); if(childSpouse) assignTitle(childSpouse, 'Famille Gouvernante'); this._getChildren(child, population).forEach(grandChild => { if (grandChild?.isAlive) { assignTitle(grandChild, 'Noble de la Cour'); const grandChildSpouse = this._getPersonById(grandChild.spouseId, population); if(grandChildSpouse) assignTitle(grandChildSpouse, 'Famille Gouvernante'); } }); } });
            this._getSiblings(ruler, population).forEach(sibling => { if (sibling?.isAlive) { assignTitle(sibling, sibling.gender === 'Homme' ? 'Frère du pouvoir' : 'Sœur du pouvoir'); const siblingSpouse = this._getPersonById(sibling.spouseId, population); if(siblingSpouse) assignTitle(siblingSpouse, 'Famille Gouvernante'); this._getChildren(sibling, population).forEach(nephew => { if (nephew?.isAlive) { assignTitle(nephew, 'Noble de la Cour'); const nephewSpouse = this._getPersonById(nephew.spouseId, population); if(nephewSpouse) assignTitle(nephewSpouse, 'Famille Gouvernante'); this._getChildren(nephew, population).forEach(grandNephew => { if (grandNephew?.isAlive) { assignTitle(grandNephew, 'Noble de la Cour'); const grandNephewSpouse = this._getPersonById(grandNephew.spouseId, population); if(grandNephewSpouse) assignTitle(grandNephewSpouse, 'Famille Gouvernante'); } }); } }); } });
        }
        
        _getDescendantMap(ruler, population) { const descendantMap = new Map(); const queue = [{ personId: ruler.id, generation: 0 }]; const visited = new Set(); descendantMap.set(ruler.id, 0); visited.add(ruler.id); const spouse = this._getPersonById(ruler.spouseId, population); if (spouse?.isAlive && !visited.has(spouse.id)) { descendantMap.set(spouse.id, 0); visited.add(spouse.id); } while (queue.length > 0) { const { personId, generation } = queue.shift(); const person = this._getPersonById(personId, population); if (person?.childrenIds) { person.childrenIds.forEach(childId => { if (!visited.has(childId)) { visited.add(childId); queue.push({ personId: childId, generation: generation + 1 }); descendantMap.set(childId, generation + 1); } }); } } return descendantMap; }
        _getRulingDynastyMemberIds(rulers, population) { const dynastyIds = new Set(); rulers.forEach(ruler => { if (dynastyIds.has(ruler.id)) return; const descendants = this._getDescendantMap(ruler, population); descendants.forEach((generation, personId) => { dynastyIds.add(personId); const person = this._getPersonById(personId, population); if (person?.spouseId) dynastyIds.add(person.spouseId); }); this._getSiblings(ruler, population).forEach(sibling => { if (sibling) { dynastyIds.add(sibling.id); if (sibling.spouseId) dynastyIds.add(sibling.spouseId); this._getChildren(sibling, population).forEach(nephew => { if (nephew) { dynastyIds.add(nephew.id); if (nephew.spouseId) dynastyIds.add(nephew.spouseId); } }); } }); this._getParents(ruler, population).forEach(parent => { if (parent) { dynastyIds.add(parent.id); if (parent.spouseId) dynastyIds.add(parent.spouseId); } }); }); return dynastyIds; }
        _findRulersAndFamilies(population, families) { const rulingFamilies = new Map(); const rulingFamilyMemberIds = new Set(); population.forEach(person => { if (person.isAlive && person.job) { const jobData = this._getJobData(person.job.buildingName, person.job.jobTitle); if (jobData?.tier === 0) { rulingFamilies.set(person.familyId, { ruler: person, jobData }); } } }); rulingFamilies.forEach(({ ruler }) => { const family = families.find(f => f.id === ruler.familyId); if (family) family.memberIds.forEach(id => rulingFamilyMemberIds.add(id)); }); return { rulingFamilies, rulingFamilyMemberIds }; }

    }

    // Lancement de l'orchestrateur
    const orchestrator = new AutorunOrchestrator(60);
    window.EcoSimAutorun = orchestrator;

    setTimeout(() => {
        orchestrator.run().catch(err => {
            console.error("Autorun failed to complete:", err);
            orchestrator.log(`Autorun failed: ${err.message}`, 'error');
        });
    }, 500);
});