document.addEventListener('DOMContentLoaded', () => {

    // --- CONSTANTES & CONFIGURATION ---
    const STORAGE_KEY = 'ecoSimRPG_map_data';
    const LAST_REGION_KEY = 'ecoSimRPG_last_region_id'; 
    const PLACE_TYPE_HIERARCHY = ['Capitale', 'Ville', 'Bourg', 'Village', 'Hameau'];
    const PLACE_TYPES = {
        Capitale: { img: null, file: 'capitale.jpg' },
        Ville: { img: null, file: 'ville.jpg' },
        Bourg: { img: null, file: 'bourg.jpg' },
        Village: { img: null, file: 'village.jpg' },
        Hameau: { img: null, file: 'hameau.jpg' },
    };
    const ROAD_TYPES = {
        'royal': { 
            name: 'Grandes Routes Royales / Impériales', 
            modifier: 1.0, 
            users: ['Caravane', 'Cheval', 'Pied'],
            desc: 'Pavées, drainées, sûres et rapides. Praticables toute l’année.',
            color: '#D4A017', // Or
            dash: [] 
        },
        'comtal': { 
            name: 'Routes Comtales / Ducales', 
            modifier: 0.85, 
            users: ['Caravane', 'Cheval', 'Pied'],
            desc: 'Pavage partiel, bonne tenue en saison sèche, ralenties sinon.',
            color: '#E53935', // Rouge vif
            dash: [15, 5] 
        },
        'marchand': { 
            name: 'Chemins de Halle / Voies Marchandes', 
            modifier: 0.70, 
            users: ['Caravane', 'Cheval', 'Pied'],
            desc: 'Vitales mais vulnérables aux intempéries (boue, ornières).',
            color: '#D84315', // Orange foncé
            dash: [10, 5]
        },
        'seigneurial': { 
            name: 'Chemins Seigneuriaux', 
            modifier: 0.60, 
            users: ['Caravane', 'Cheval', 'Pied'],
            desc: 'Très boueux en automne/printemps, souvent mal entretenus.',
            color: '#212121', // Noir / Gris très foncé
            dash: [8, 8]
        },
        'traverse': { 
            name: 'Chemins de Traverse / Raccourcis', 
            modifier: 0.50, 
            users: ['Cheval', 'Pied'],
            desc: 'Étroits, sinueux, mal drainés. Non praticables pour les charrettes.',
            color: '#1E88E5', // Bleu vif
            dash: [5, 5]
        },
        'forestier': { 
            name: 'Sentiers Forestiers / Sentes', 
            modifier: 0.40, 
            users: ['Cheval', 'Pied'],
            desc: 'Traîtres par temps humide. Utilisés par chasseurs et hors-la-loi.',
            color: '#8E24AA', // Violet
            dash: [3, 7]
        },
        'montagne': { 
            name: 'Sentiers de Montagne / Passes', 
            modifier: 0.25, 
            users: ['Cheval', 'Pied'],
            desc: 'Dangereux, utilisables uniquement en été. Infranchissables l’hiver.',
            color: '#00BCD4', // Cyan
            dash: [2, 4]
        }
    };
    const TRAVEL_SPEEDS = { // en km par jour
        Pied: 30,
        Cheval: 70,
        Caravane: 20
    };
    const DEFAULT_ROAD_TYPE = 'marchand';
    const HEX_TERRAIN = { img: null, file: 'terrain_hex.jpg' };
const RANDOM_NAMES = [
    "Aethelgard", "Baeldor", "Crystalgate", "Dunharrow", "Eldoria", "Faelivrin",
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

    // Noms à consonance française
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
    "Cueva del Dragón", "Fortaleza del Sol", "Isla Perdida", "Llanura de Huesos", "Mirada del Buitre", "Pueblo Escondido",
    "Salvatierra", "Sierpes-río", "Tierras de Nadie", "Villaquietud"
];

    // --- SELECTEURS DOM ---
    const canvas = document.getElementById('hex-map');
    const ctx = canvas ? canvas.getContext('2d') : null;
    const mapContainer = document.getElementById('map-container');
    const regionSelect = document.getElementById('region-select');
    const newRegionNameInput = document.getElementById('new-region-name');
    const createRegionBtn = document.getElementById('create-region-btn');
    const deleteRegionBtn = document.getElementById('delete-region-btn');
    const generateMapBtn = document.getElementById('generate-map-btn');
    const randomPlaceCountInput = document.getElementById('random-place-count');
    const placesList = document.getElementById('places-list');
    const placeModal = document.getElementById('place-modal');
    const placeForm = document.getElementById('place-form');
    const modalTitle = document.getElementById('modal-title');
    const placeNameInput = document.getElementById('place-name');
    const placeTypeSelect = document.getElementById('place-type');
    const confirmPlaceBtn = document.getElementById('confirm-place-btn');
    const cancelPlaceBtn = document.getElementById('cancel-place-btn');
    const roadModal = document.getElementById('road-modal');
    const roadForm = document.getElementById('road-form');
    const roadTypeSelect = document.getElementById('road-type-select');
    const confirmRoadBtn = document.getElementById('confirm-road-btn');
    const cancelRoadBtn = document.getElementById('cancel-road-btn');
    const deleteRoadBtn = document.getElementById('delete-road-btn');
    const roadInfo = document.getElementById('road-info');
    const navStep2 = document.getElementById('nav-step2');
    const navStep3 = document.getElementById('nav-step3');
    const floatingMenu = document.querySelector('.floating-menu');
    const scaleInput = document.getElementById('scale-input');
    const showRoadsToggle = document.getElementById('show-roads-toggle');
    const clearRoadFilterBtn = document.getElementById('clear-road-filter-btn');
    const roadLegend = document.getElementById('road-legend');
    const notificationBanner = document.getElementById('notification-banner');

    // --- ETAT DE L'APPLICATION ---
    let hexSize = { w: 100, h: 114 }; 
    let regions = [];
    let currentRegion = null;
    let view = { x: 0, y: 0, zoom: 1 };
    let isPanning = false;
    let isDraggingPlace = false;
    let draggedPlace = null;
    let lastMouse = { x: 0, y: 0 };
    let tempHexCoords = null;
    let hoveredHex = null; 
    let pulsingPlaceId = null;
    let pulseInterval = null; 
    let panAnimationId = null; 
    let roadHitBoxes = [];
    let placeIconHitBoxes = []; 
    let activeRoadForModal = null;
    let hoveredRoad = null;
    let showRoads = true; 
    let highlightedRoadsForPlaceId = null;
    let animationInProgress = false;
    let distanceModePlaceId = null; 
    let distanceModeActionHitBoxes = []; 
    
    let currentlyAnimatingRoads = []; 
    let currentlyFadingPlaces = [];
    let animatedRoadsToDraw = []; 

    // --- FONCTIONS DE NOTIFICATION ---
    let notificationTimeout;
    function showNotification(message, type = 'info', duration = 3000) {
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

    // --- FONCTIONS DE PRE-CHARGEMENT ---
    function loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    }

    async function preloadAssets() {
        try {
            const placePromises = Object.entries(PLACE_TYPES).map(async ([key, value]) => {
                PLACE_TYPES[key].img = await loadImage(value.file);
            });
            const terrainPromise = loadImage(HEX_TERRAIN.file).then(img => {
                HEX_TERRAIN.img = img;
                hexSize = { w: img.width, h: img.height };
            });

            await Promise.all([...placePromises, terrainPromise]);
            console.log("Toutes les ressources ont été chargées.");
        } catch (error) {
            console.error("Erreur lors du chargement des images:", error);
            if(ctx) alert("Impossible de charger les textures de la carte. L'application ne peut pas démarrer. Vérifiez que les fichiers images (terrain_hex.jpg, etc.) sont accessibles.");
        }
    }

    // --- LOGIQUE DE LA GRILLE HEXAGONALE ---
    function roundAxial(frac) {
        const frac_q = frac.q;
        const frac_r = frac.r;
        const frac_s = -frac_q - frac_r;

        let q = Math.round(frac_q);
        let r = Math.round(frac_r);
        let s = Math.round(frac_s);

        const q_diff = Math.abs(q - frac_q);
        const r_diff = Math.abs(r - frac_r);
        const s_diff = Math.abs(s - frac_s);

        if (q_diff > r_diff && q_diff > s_diff) {
            q = -r - s;
        } else if (r_diff > s_diff) {
            r = -q - s;
        } else {
            s = -q - r;
        }
        return { q: q, r: r };
    }

    function getHexCenter(q, r) {
        const x = hexSize.w * q + hexSize.w / 2 * r;
        const y = hexSize.h * 3/4 * r;
        return { x, y };
    }

    function getPixelToHex(pixelX, pixelY) {
        const worldX = (pixelX - view.x) / view.zoom;
        const worldY = (pixelY - view.y) / view.zoom;

        const r_frac = worldY * 4 / (3 * hexSize.h);
        const q_frac = worldX / hexSize.w - r_frac / 2;
        
        return roundAxial({ q: q_frac, r: r_frac });
    }
    
    function axialDistance(a, b) {
        if (!a || !b) return Infinity;
        const dq = a.q - b.q;
        const dr = a.r - b.r;
        const ds = -dq - dr;
        return (Math.abs(dq) + Math.abs(dr) + Math.abs(ds)) / 2;
    }

    // --- GESTION DES DONNEES ---
    function saveData() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(regions));
        updateNavLinksState();
    }

    function updateRegionSelect() {
        if (!regionSelect) return;
        const selectedId = regionSelect.value;
        regionSelect.innerHTML = '<option value="">Aucune région</option>';
        
        regions.forEach(region => {
            const option = document.createElement('option');
            option.value = region.id;
            option.textContent = region.name;
            regionSelect.appendChild(option);
        });
        
        if (regions.some(r => r.id == selectedId)) {
            regionSelect.value = selectedId;
        }
    }

    function loadData() {
        const data = localStorage.getItem(STORAGE_KEY);
        if (data) {
            regions = JSON.parse(data);
            regions.forEach(region => {
                if (!region.roads) {
                    region.roads = {};
                }
            });
        }
        updateRegionSelect();

        const lastRegionId = localStorage.getItem(LAST_REGION_KEY);
        if (lastRegionId && regions.some(r => r.id == lastRegionId)) {
            if (regionSelect) regionSelect.value = lastRegionId;
        }
    }
    
    // --- RENDU GRAPHIQUE ---
    function resizeCanvas() {
        if (!canvas || !mapContainer) return;
        canvas.width = mapContainer.clientWidth;
        canvas.height = mapContainer.clientHeight;
        drawMap();
    }

    function generateRoadLegend() {
        if (!roadLegend) return;
        roadLegend.innerHTML = '<h4>Légende des routes</h4>';
        for (const [key, road] of Object.entries(ROAD_TYPES)) {
            const item = document.createElement('div');
            item.className = 'legend-item';
            const svgNS = "http://www.w3.org/2000/svg";
            const svg = document.createElementNS(svgNS, 'svg');
            svg.setAttribute('width', '30');
            svg.setAttribute('height', '5');
            svg.classList.add('legend-svg');
            const line = document.createElementNS(svgNS, 'line');
            line.setAttribute('x1', '0');
            line.setAttribute('y1', '2.5');
            line.setAttribute('x2', '30');
            line.setAttribute('y2', '2.5');
            line.setAttribute('stroke', road.color);
            line.setAttribute('stroke-width', '2');
            if (road.dash && road.dash.length > 0) {
                line.setAttribute('stroke-dasharray', road.dash.join(' '));
            }
            svg.appendChild(line);
            item.appendChild(svg);
            const name = document.createElement('span');
            name.textContent = road.name.split(' / ')[0];
            item.appendChild(name);
            roadLegend.appendChild(item);
        }
    }

    function drawMap() {
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(view.x, view.y);
        ctx.scale(view.zoom, view.zoom);
        
        const hexCornersPx = [ getPixelToHex(0, 0), getPixelToHex(canvas.width, 0), getPixelToHex(0, canvas.height), getPixelToHex(canvas.width, canvas.height) ];
        const qMin = Math.min(...hexCornersPx.map(c => c.q)), qMax = Math.max(...hexCornersPx.map(c => c.q));
        const rMin = Math.min(...hexCornersPx.map(c => c.r)), rMax = Math.max(...hexCornersPx.map(c => c.r));
        const overlap = 8;
        for (let r = rMin - 2; r <= rMax + 2; r++) { 
            for (let q = qMin - 2; q <= qMax + 2; q++) { 
                if (HEX_TERRAIN.img) { 
                    const center = getHexCenter(q, r); 
                    ctx.drawImage(HEX_TERRAIN.img, center.x - (hexSize.w + overlap) / 2, center.y - (hexSize.h + overlap) / 2, hexSize.w + overlap, hexSize.h + overlap); 
                } 
            } 
        }
        
        if (animationInProgress) {
            animatedRoadsToDraw.forEach(road => drawSingleRoad(road.start, road.end));
            currentlyAnimatingRoads.forEach(road => drawSingleRoad(road.start, road.end, road.progress));
        } else if (currentRegion) {
            drawAllDistances();
        }

        if (currentRegion) {
            placeIconHitBoxes = []; 
            currentRegion.places.forEach(place => {
                if (currentlyFadingPlaces.some(p => p.place.id === place.id)) return;
                if (draggedPlace && draggedPlace.id === place.id) return;
                drawPlace(place);
            });
            
            currentlyFadingPlaces.forEach(fading => {
                ctx.save();
                ctx.globalAlpha = fading.alpha;
                drawPlace(fading.place);
                ctx.restore();
            });
        }

        if (isDraggingPlace && draggedPlace) {
            const placeImg = PLACE_TYPES[draggedPlace.type]?.img;
            if (placeImg) {
                const drawX = (lastMouse.x - view.x) / view.zoom - hexSize.w / 2;
                const drawY = (lastMouse.y - view.y) / view.zoom - hexSize.h / 2;
                ctx.globalAlpha = 0.7;
                ctx.drawImage(placeImg, drawX, drawY, hexSize.w, hexSize.h);
                ctx.globalAlpha = 1;
            }
        }
        ctx.restore();
    }
    
    function drawPlace(place) {
        if (!ctx) return;
        const placeImg = PLACE_TYPES[place.type]?.img;
        if (!placeImg) return;
        
        const center = getHexCenter(place.coords.q, place.coords.r);
        
        if (pulsingPlaceId === place.id) {
            ctx.save();
            const pulseScale = 1 + (Math.sin(Date.now() * 0.005) * 0.05);
            ctx.translate(center.x, center.y);
            ctx.scale(pulseScale, pulseScale);
            ctx.drawImage(placeImg, -hexSize.w/2, -hexSize.h/2, hexSize.w, hexSize.h);
            ctx.restore();
        } else {
            ctx.drawImage(placeImg, center.x - hexSize.w/2, center.y - hexSize.h/2, hexSize.w, hexSize.h);
        }

        if (animationInProgress || !ctx) return;

        ctx.save();
        const iconFontSize = 30 / view.zoom;
        ctx.font = `bold ${iconFontSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom'; 
        ctx.strokeStyle = 'black';
        ctx.fillStyle = 'white';
        ctx.lineWidth = 4 / view.zoom;
        const iconY = center.y - hexSize.h / 2 - (5 / view.zoom);
        const iconX = center.x;
        ctx.strokeText('↔️', iconX, iconY);
        ctx.fillText('↔️', iconX, iconY);
        const iconMetrics = ctx.measureText('↔️');
        const hitboxHeight = iconMetrics.actualBoundingBoxAscent + iconMetrics.actualBoundingBoxDescent;
        ctx.restore();

        const iconHitboxWorld = { x: iconX - iconMetrics.width / 2, y: iconY - hitboxHeight, width: iconMetrics.width, height: hitboxHeight };
        
        placeIconHitBoxes.push({
            x: iconHitboxWorld.x * view.zoom + view.x,
            y: iconHitboxWorld.y * view.zoom + view.y,
            width: iconHitboxWorld.width * view.zoom,
            height: iconHitboxWorld.height * view.zoom,
            placeId: place.id
        });
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
    
    function determineRoadType(placeA, placeB) {
        const hierarchyA = PLACE_TYPE_HIERARCHY.indexOf(placeA.type);
        const hierarchyB = PLACE_TYPE_HIERARCHY.indexOf(placeB.type);
        const avgScore = (hierarchyA + hierarchyB) / 2;
        if (avgScore <= 0.5) return 'royal';
        if (avgScore <= 1.5) return 'comtal';
        if (avgScore <= 2.5) return 'marchand';
        if (avgScore <= 3.5) return 'seigneurial';
        return 'traverse';
    }

    function drawSingleRoad(placeA, placeB, progress = 1.0) {
        if (!ctx) return;
        const roadKey = getRoadKey(placeA.id, placeB.id);
        let roadData = currentRegion.roads[roadKey] || { type: determineRoadType(placeA, placeB) };
        const roadTypeInfo = ROAD_TYPES[roadData.type];
    
        let centerA = getHexCenter(placeA.coords.q, placeA.coords.r);
        let centerB = getHexCenter(placeB.coords.q, placeB.coords.r);
        
        if (isDraggingPlace && draggedPlace) {
            const draggedWorldPos = {
                x: (lastMouse.x - view.x) / view.zoom,
                y: (lastMouse.y - view.y) / view.zoom
            };
            if (placeA.id === draggedPlace.id) {
                centerA = draggedWorldPos;
            }
            if (placeB.id === draggedPlace.id) {
                centerB = draggedWorldPos;
            }
        }

        ctx.beginPath();
        ctx.strokeStyle = roadTypeInfo.color;
        const scaledDash = roadTypeInfo.dash.length > 0 ? roadTypeInfo.dash.map(d => Math.max(1, d / view.zoom)) : [];
        ctx.setLineDash(scaledDash);
        ctx.lineWidth = 3 / view.zoom;

        ctx.moveTo(centerA.x, centerA.y);
    
        if (progress < 1.0) {
            ctx.lineTo(centerA.x + (centerB.x - centerA.x) * progress, centerA.y + (centerB.y - centerA.y) * progress);
        } else {
            ctx.lineTo(centerB.x, centerB.y);
        }
        
        ctx.stroke();
        ctx.setLineDash([]);
    }

    function drawAllDistances() {
        if (!currentRegion || currentRegion.places.length < 2 || !ctx) return;
    
        roadHitBoxes = [];
        distanceModeActionHitBoxes = []; 
    
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const bodyFont = document.body ? getComputedStyle(document.body).getPropertyValue('--font-body') : 'sans-serif';
    
        if (distanceModePlaceId) {
            const sourcePlace = currentRegion.places.find(p => p.id === distanceModePlaceId);
            if (!sourcePlace) {
                distanceModePlaceId = null;
                ctx.restore();
                return;
            }

            ctx.font = `bold ${14 / view.zoom}px ${bodyFont}`;
            ctx.fillStyle = 'white';
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 4 / view.zoom;
            ctx.textAlign = 'center';
    
            currentRegion.places.forEach(targetPlace => {
                const centerB = getHexCenter(targetPlace.coords.q, targetPlace.coords.r);

                ctx.textBaseline = 'top';
                const textY = centerB.y + (hexSize.h / 2) + (5 / view.zoom);
                ctx.strokeText(targetPlace.name, centerB.x, textY);
                ctx.fillText(targetPlace.name, centerB.x, textY);

                if (targetPlace.id === sourcePlace.id) return;
    
                const centerA = getHexCenter(sourcePlace.coords.q, sourcePlace.coords.r);
                const distance = axialDistance(sourcePlace.coords, targetPlace.coords) * (currentRegion.scale || 1);
    
                ctx.beginPath();
                ctx.strokeStyle = '#212121';
                ctx.setLineDash([5 / view.zoom, 5 / view.zoom]);
                ctx.lineWidth = 1.5 / view.zoom;
                ctx.moveTo(centerA.x, centerA.y);
                ctx.lineTo(centerB.x, centerB.y);
                ctx.stroke();
                ctx.setLineDash([]);
    
                ctx.textBaseline = 'middle';
                ctx.lineWidth = 4 / view.zoom;

                const dx = centerB.x - centerA.x;
                const dy = centerB.y - centerA.y;
                const len = Math.sqrt(dx * dx + dy * dy);
                let displayX, displayY;
    
                if (len > 0) {
                    const ux = dx / len;
                    const uy = dy / len;
                    const offsetDistance = 50 / view.zoom;
                    displayX = centerB.x - ux * offsetDistance;
                    displayY = centerB.y - uy * offsetDistance;
                } else {
                    displayX = centerB.x;
                    displayY = centerB.y - (50 / view.zoom);
                }
    
                const distText = `${distance.toFixed(0)} km`;
                ctx.strokeText(distText, displayX, displayY);
                ctx.fillText(distText, displayX, displayY);
    
                const roadKey = getRoadKey(sourcePlace.id, targetPlace.id);
                const roadExists = !!currentRegion.roads[roadKey];
                const actionIcon = roadExists ? '➖' : '➕';
                const action = roadExists ? 'remove' : 'add';
                
                const originalFillStyle = ctx.fillStyle;
                if (roadExists) {
                    ctx.fillStyle = '#B71C1C';
                }
    
                const actionIconYOffset = 25 / view.zoom;
                const actionIconFontSize = 22 / view.zoom;
                ctx.font = `${actionIconFontSize}px Arial`;
                ctx.fillText(actionIcon, displayX, displayY - actionIconYOffset);
    
                ctx.fillStyle = originalFillStyle;
    
                const actionIconMetrics = ctx.measureText(actionIcon);
                const hitboxWidth = actionIconMetrics.width > actionIconFontSize ? actionIconMetrics.width : actionIconFontSize;
                const actionIconHitboxWorld = {
                    x: displayX - (hitboxWidth / 2),
                    y: (displayY - actionIconYOffset) - (actionIconFontSize / 2),
                    width: hitboxWidth,
                    height: actionIconFontSize
                };
                distanceModeActionHitBoxes.push({
                    x: actionIconHitboxWorld.x * view.zoom + view.x,
                    y: actionIconHitboxWorld.y * view.zoom + view.y,
                    width: actionIconHitboxWorld.width * view.zoom,
                    height: actionIconHitboxWorld.height * view.zoom,
                    roadKey: roadKey,
                    action: action
                });
            });
    
        } else if (showRoads) {
            const drawnRoads = new Set();
            for (let i = 0; i < currentRegion.places.length; i++) {
                for (let j = i + 1; j < currentRegion.places.length; j++) {
                    const placeA = currentRegion.places[i];
                    const placeB = currentRegion.places[j];
                    const roadKey = getRoadKey(placeA.id, placeB.id);
    
                    if (drawnRoads.has(roadKey) || !currentRegion.roads[roadKey]) continue;
    
                    drawSingleRoad(placeA, placeB);
                    drawnRoads.add(roadKey);
    
                    let centerA = getHexCenter(placeA.coords.q, placeA.coords.r);
                    let centerB = getHexCenter(placeB.coords.q, placeB.coords.r);

                    if (isDraggingPlace && draggedPlace) {
                        const draggedWorldPos = {
                            x: (lastMouse.x - view.x) / view.zoom,
                            y: (lastMouse.y - view.y) / view.zoom
                        };
                        if (placeA.id === draggedPlace.id) centerA = draggedWorldPos;
                        if (placeB.id === draggedPlace.id) centerB = draggedWorldPos;
                    }
                    
                    const midX = (centerA.x + centerB.x) / 2;
                    const midY = (centerA.y + centerB.y) / 2;
                    
                    let distance;
                    if (isDraggingPlace && (placeA.id === draggedPlace.id || placeB.id === draggedPlace.id)) {
                        const pixelDistance = Math.sqrt(Math.pow(centerB.x - centerA.x, 2) + Math.pow(centerB.y - centerA.y, 2));
                        const pixelsPerHex = hexSize.w; 
                        distance = (pixelDistance / pixelsPerHex) * (currentRegion.scale || 1);
                    } else {
                        distance = axialDistance(placeA.coords, placeB.coords) * (currentRegion.scale || 1);
                    }

                    const gearFontSize = 20 / view.zoom;
                    ctx.font = `${gearFontSize}px Arial`;
                    ctx.fillText('⚙️', midX, midY - (25 / view.zoom));
    
                    const gearMetrics = ctx.measureText('⚙️');
                    const hitboxWidth = gearMetrics.width > gearFontSize ? gearMetrics.width : gearFontSize;
                    const gearHitboxWorld = { x: midX - (hitboxWidth / 2), y: midY - (25 / view.zoom) - (gearFontSize / 2), width: hitboxWidth, height: gearFontSize };
                    roadHitBoxes.push({ x: gearHitboxWorld.x * view.zoom + view.x, y: gearHitboxWorld.y * view.zoom + view.y, width: gearHitboxWorld.width * view.zoom, height: gearHitboxWorld.height * view.zoom, roadKey: roadKey });
    
                    ctx.font = `bold ${14 / view.zoom}px ${bodyFont}`;
                    ctx.fillStyle = 'white';
                    ctx.strokeStyle = 'black';
                    ctx.lineWidth = 4 / view.zoom;
                    const distText = `${distance.toFixed(0)} km`;
                    ctx.strokeText(distText, midX, midY);
                    ctx.fillText(distText, midX, midY);
    
                    ctx.font = `italic ${12 / view.zoom}px ${bodyFont}`;
                    ctx.fillStyle = '#f0f0f0';
                    ctx.strokeStyle = 'black';
                    ctx.lineWidth = 2.5 / view.zoom;
    
                    let yOffset = 20 / view.zoom;
                    const roadTypeInfo = ROAD_TYPES[currentRegion.roads[roadKey].type];
                    for (const [mode, speed] of Object.entries(TRAVEL_SPEEDS)) {
                        let timeText;
                        if (roadTypeInfo.users.includes(mode)) {
                            const timeInDays = distance / (speed * roadTypeInfo.modifier);
                            timeText = `${mode}: ${formatTravelTime(timeInDays)}`;
                        } else {
                            timeText = `${mode}: N/A`;
                        }
                        ctx.strokeText(timeText, midX, midY + yOffset);
                        ctx.fillText(timeText, midX, midY + yOffset);
                        yOffset += 16 / view.zoom;
                    }
                }
            }
        }
        ctx.restore();
    }


    // --- GESTION DES INTERACTIONS UTILISATEUR ---
    
    function handleScaleChange() {
        if (currentRegion && scaleInput) {
            const newScale = parseFloat(scaleInput.value);
            if (!isNaN(newScale) && newScale > 0) {
                currentRegion.scale = newScale;
                saveData();
                drawMap();
            }
        }
    }

    function handleCreateRegion() {
        if (!newRegionNameInput) return;
        const name = newRegionNameInput.value.trim();
        if (name) {
            const newRegion = {
                id: Date.now(),
                name: name,
                scale: 10,
                places: [],
                roads: {}
            };
            regions.push(newRegion);
            saveData();
            updateRegionSelect();
            if(regionSelect) regionSelect.value = newRegion.id;
            handleRegionChange();
            newRegionNameInput.value = '';
        } else {
            alert("Veuillez donner un nom à la région.");
        }
    }

    function handleDeleteRegion() {
        if (currentRegion && confirm(`Êtes-vous sûr de vouloir supprimer la région "${currentRegion.name}" ? Cette action est irréversible.`)) {
            regions = regions.filter(r => r.id !== currentRegion.id);
            saveData();
            currentRegion = null;
            if(regionSelect) regionSelect.value = '';
            handleRegionChange();
        }
    }
    
    function handleRegionChange() {
        const selectedId = regionSelect ? parseInt(regionSelect.value) : null;
        currentRegion = regions.find(r => r.id === selectedId) || null;
        
        highlightedRoadsForPlaceId = null; 
        distanceModePlaceId = null;
        if(clearRoadFilterBtn) clearRoadFilterBtn.style.display = 'none';
        
        localStorage.setItem(LAST_REGION_KEY, currentRegion ? currentRegion.id : '');
        updateUIForRegion();
    }

    function updateUIForRegion() {
        const hasRegion = !!currentRegion;
        if(deleteRegionBtn) deleteRegionBtn.disabled = !hasRegion;
        if(generateMapBtn) generateMapBtn.disabled = !hasRegion;
        if(scaleInput) scaleInput.disabled = !hasRegion;

        if (hasRegion) {
            const rightPanelH3 = document.querySelector('#right-panel h3');
            if(rightPanelH3) rightPanelH3.textContent = `Lieux de ${currentRegion.name}`;
            if(scaleInput) scaleInput.value = currentRegion.scale || 10;
        } else {
            const rightPanelH3 = document.querySelector('#right-panel h3');
            if(rightPanelH3) rightPanelH3.textContent = 'Aucune région sélectionnée';
            if(scaleInput) scaleInput.value = 10;
        }
        updatePlacesList();
        updateNavLinksState(); 
        drawMap();
    }

    function updatePlacesList() {
        if (!placesList) return;
        placesList.innerHTML = '';
        if (!currentRegion) {
            placesList.innerHTML = `<li style="padding: 15px; text-align: center;">Créez votre première région pour commencer.</li>`;
            return;
        }
        if (currentRegion.places.length === 0) {
            placesList.innerHTML = `<li style="padding: 15px; text-align: center;">Cette région est vide.<br>Double-cliquez sur la carte pour ajouter un lieu.</li>`;
        }
        
        currentRegion.places
            .sort((a,b) => {
                const indexA = PLACE_TYPE_HIERARCHY.indexOf(a.type);
                const indexB = PLACE_TYPE_HIERARCHY.indexOf(b.type);
                return indexA - indexB;
            })
            .forEach(place => {
                const li = document.createElement('li');
                li.className = 'place-item';
                li.dataset.placeId = place.id;
                li.innerHTML = `
                    <div class="info">
                        <span class="place-name">${place.name}</span>
                        <span class="place-type">${place.type}</span>
                    </div>
                    <div class="actions">
                        <button class="btn-edit btn-center" title="Centrer la carte">🎯</button>
                        <button class="btn-edit" title="Éditer">✏️</button>
                        <button class="btn-delete" title="Supprimer">🗑️</button>
                    </div>
                `;
                placesList.appendChild(li);
            });
    }

    function handlePlaceListClick(e) {
        const target = e.target.closest('button');
        if (!target) return;
        const placeItem = target.closest('.place-item');
        const placeId = parseInt(placeItem.dataset.placeId);
        const place = currentRegion.places.find(p => p.id === placeId);
        if (!place) return;
        
        if (target.classList.contains('btn-center')) {
            centerOnPlace(place);
        } else if (target.classList.contains('btn-edit')) {
            openPlaceModal(place.coords, place);
        } else if (target.classList.contains('btn-delete')) {
            if (confirm(`Supprimer le lieu "${place.name}" ?`)) {
                const roadsToDelete = Object.keys(currentRegion.roads).filter(key => key.split('-').includes(String(placeId)));
                roadsToDelete.forEach(key => delete currentRegion.roads[key]);

                currentRegion.places = currentRegion.places.filter(p => p.id !== placeId);
                if(highlightedRoadsForPlaceId === placeId) {
                    highlightedRoadsForPlaceId = null;
                    if(clearRoadFilterBtn) clearRoadFilterBtn.style.display = 'none';
                }
                if (distanceModePlaceId === placeId) {
                    distanceModePlaceId = null;
                    if(clearRoadFilterBtn) clearRoadFilterBtn.style.display = 'none';
                }
                showNotification(`Lieu "${place.name}" et routes associées supprimés.`, 'info');
                saveData();
                updatePlacesList();
                drawMap();
            }
        }
    }
    
    function openPlaceModal(coords, placeToEdit = null) {
        if (!placeModal) return;
        placeForm.dataset.editingId = '';
        if (placeToEdit) {
            modalTitle.textContent = "Éditer le Lieu";
            confirmPlaceBtn.textContent = "Modifier";
            placeNameInput.value = placeToEdit.name;
            placeTypeSelect.value = placeToEdit.type;
            placeForm.dataset.editingId = placeToEdit.id;
        } else {
            modalTitle.textContent = "Créer un Nouveau Lieu";
            confirmPlaceBtn.textContent = "Créer";
            placeForm.reset();
            tempHexCoords = coords;
        }
        placeModal.showModal();
    }

    function openRoadModal(roadKey) {
        if (!currentRegion || !roadModal) return;
        activeRoadForModal = roadKey;
        const [placeA, placeB] = getPlacesFromRoadKey(roadKey);
        const roadData = currentRegion.roads[roadKey] || { type: determineRoadType(placeA, placeB) };
        
        roadTypeSelect.value = roadData.type;
        roadTypeSelect.dispatchEvent(new Event('change'));

        confirmRoadBtn.textContent = "Appliquer";
        deleteRoadBtn.style.display = 'inline-block';
        roadModal.showModal();
    }
    
    function getPlacesFromRoadKey(roadKey) {
        const [id1, id2] = roadKey.split('-').map(Number);
        const place1 = currentRegion.places.find(p => p.id === id1);
        const place2 = currentRegion.places.find(p => p.id === id2);
        return [place1, place2];
    }

    function handlePlaceFormSubmit(e) {
        e.preventDefault();
        const name = placeNameInput.value.trim();
        const type = placeTypeSelect.value;
        if (!name || !type) return alert("Veuillez remplir tous les champs.");

        const editingId = parseInt(placeForm.dataset.editingId);
        if(editingId) { 
            const place = currentRegion.places.find(p => p.id === editingId);
            if (place) {
                place.name = name;
                place.type = type;
            }
        } else { 
            let newPlace = {
                id: Date.now(),
                name: name,
                type: type,
                coords: tempHexCoords
            };
            
            if(currentRegion.places.length > 0) {
                let closest = { dist: Infinity, place: null };
                currentRegion.places.forEach(p => {
                    const d = axialDistance(p.coords, newPlace.coords);
                    if (d < closest.dist) {
                        closest.dist = d;
                        closest.place = p;
                    }
                });
                if(closest.place) {
                    const roadKey = getRoadKey(newPlace.id, closest.place.id);
                    currentRegion.roads[roadKey] = {
                        type: determineRoadType(newPlace, closest.place)
                    };
                }
            }
            currentRegion.places.push(newPlace);
        }
        saveData();
        updatePlacesList();
        drawMap();
        placeModal.close();
    }

    function handleRoadFormSubmit(e) {
        e.preventDefault();
        if (!currentRegion || !activeRoadForModal) return;
    
        const newType = roadTypeSelect.value;
        
        if (!currentRegion.roads[activeRoadForModal]) {
            const [placeA, placeB] = getPlacesFromRoadKey(activeRoadForModal);
            currentRegion.roads[activeRoadForModal] = { type: determineRoadType(placeA, placeB) };
        }
        
        currentRegion.roads[activeRoadForModal].type = newType;
        
        saveData();
        drawMap();
        roadModal.close();
    }

    function handleDeleteRoad() {
        if (!currentRegion || !activeRoadForModal) return;

        if (currentRegion.roads[activeRoadForModal]) {
            delete currentRegion.roads[activeRoadForModal];
        }
        
        saveData();
        drawMap();
        roadModal.close();
        showNotification('Route supprimée.', 'info');
    }

    function centerOnPlace(place) {
        if (!canvas) return;
        if (pulseInterval) clearInterval(pulseInterval);
        if (panAnimationId) cancelAnimationFrame(panAnimationId);
        const startX = view.x, startY = view.y;
        const center = getHexCenter(place.coords.q, place.coords.r);
        const targetX = -center.x * view.zoom + canvas.width / 2;
        const targetY = -center.y * view.zoom + canvas.height / 2;
        const duration = 300;
        let startTime = null;
        
        function panAnimation(currentTime) {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);
            const easedProgress = progress * (2 - progress);
            view.x = startX + (targetX - startX) * easedProgress;
            view.y = startY + (targetY - startY) * easedProgress;
            drawMap();
            if (progress < 1) panAnimationId = requestAnimationFrame(panAnimation);
            else panAnimationId = null;
        }
        panAnimationId = requestAnimationFrame(panAnimation);

        pulsingPlaceId = place.id;
        pulseInterval = setInterval(drawMap, 16);
        setTimeout(() => {
            clearInterval(pulseInterval);
            pulseInterval = null;
            pulsingPlaceId = null;
            drawMap(); 
        }, 1500);
    }

    function getPlaceAt(hexCoords) {
        if (!currentRegion) return null;
        return currentRegion.places.find(p => p.coords.q === hexCoords.q && p.coords.r === hexCoords.r);
    }
    
    function animateViewToFitAllPlaces(places, duration = 350) {
        return new Promise(resolve => {
            if (!places || places.length === 0 || !canvas) return resolve();
            let minQ = Infinity, maxQ = -Infinity, minR = Infinity, maxR = -Infinity;
            places.forEach(p => {
                minQ = Math.min(minQ, p.coords.q); maxQ = Math.max(maxQ, p.coords.q);
                minR = Math.min(minR, p.coords.r); maxR = Math.max(maxR, p.coords.r);
            });
            const corners = [getHexCenter(minQ, minR), getHexCenter(maxQ, minR), getHexCenter(minQ, maxR), getHexCenter(maxQ, maxR)];
            const minX = Math.min(...corners.map(c => c.x)) - hexSize.w, maxX = Math.max(...corners.map(c => c.x)) + hexSize.w;
            const minY = Math.min(...corners.map(c => c.y)) - hexSize.h, maxY = Math.max(...corners.map(c => c.y)) + hexSize.h;
            
            const targetZoom = Math.min(canvas.width / (maxX - minX), canvas.height / (maxY - minY)) * 0.9;
            const targetX = canvas.width / 2 - (minX + (maxX - minX) / 2) * targetZoom;
            const targetY = canvas.height / 2 - (minY + (maxY - minY) / 2) * targetZoom;

            const startX = view.x, startY = view.y, startZoom = view.zoom;
            let startTime = null;
            function viewAnimation(timestamp) {
                if (!startTime) startTime = timestamp;
                const progress = Math.min((timestamp - startTime) / duration, 1);
                const easedProgress = progress * (2 - progress);
                view.x = startX + (targetX - startX) * easedProgress;
                view.y = startY + (targetY - startY) * easedProgress;
                view.zoom = startZoom + (targetZoom - startZoom) * easedProgress;
                drawMap();
                if (progress < 1) requestAnimationFrame(viewAnimation);
                else resolve();
            }
            requestAnimationFrame(viewAnimation);
        });
    }

    function animateMultiplePlacesFadeIn(placesToFade, duration = 300) {
        return new Promise(resolve => {
            placesToFade.forEach(p => currentlyFadingPlaces.push({ place: p, alpha: 0 }));
            let startTime = null;
            function animationStep(timestamp) {
                if (!startTime) startTime = timestamp;
                const progress = Math.min((timestamp - startTime) / duration, 1);
                currentlyFadingPlaces.forEach(f => f.alpha = progress);
                drawMap();
                if (progress < 1) requestAnimationFrame(animationStep);
                else {
                    currentlyFadingPlaces = [];
                    resolve();
                }
            }
            requestAnimationFrame(animationStep);
        });
    }

    function animateMultipleRoads(connections, duration = 400) {
        return new Promise(resolve => {
            connections.forEach(c => currentlyAnimatingRoads.push({ ...c, progress: 0 }));
            let startTime = null;
            function animationStep(timestamp) {
                if (!startTime) startTime = timestamp;
                const progress = Math.min((timestamp - startTime) / duration, 1);
                const easedProgress = Math.sin((progress * Math.PI) / 2); 
                currentlyAnimatingRoads.forEach(r => r.progress = easedProgress);
                drawMap();
                if (progress < 1) requestAnimationFrame(animationStep);
                else {
                    currentlyAnimatingRoads = [];
                    resolve();
                }
            }
            requestAnimationFrame(animationStep);
        });
    }


    async function handleGenerateMap() {
        if (!currentRegion || animationInProgress) return;
        if (currentRegion.places.length > 0 && !confirm("Cette action va supprimer tous les lieux et routes existants dans cette région. Continuer ?")) return;
    
        animationInProgress = true;
        if(generateMapBtn) {
            generateMapBtn.disabled = true;
            generateMapBtn.textContent = "Génération...";
        }
        if(document.body) document.body.style.cursor = 'wait';
    
        currentRegion.places = [];
        currentRegion.roads = {};
        highlightedRoadsForPlaceId = null;
        distanceModePlaceId = null;
        if(clearRoadFilterBtn) clearRoadFilterBtn.style.display = 'none';
        animatedRoadsToDraw = [];
        currentlyAnimatingRoads = [];
        currentlyFadingPlaces = [];
        updatePlacesList();
        drawMap(); 
    
        const totalCount = randomPlaceCountInput ? parseInt(randomPlaceCountInput.value) : 15;
        if (totalCount <= 0) {
            animationInProgress = false;
            if(generateMapBtn) {
                generateMapBtn.disabled = !currentRegion;
                generateMapBtn.textContent = "Carte Aléatoire";
            }
            if(document.body) document.body.style.cursor = 'default';
            return;
        }
    
        let allPlaces = [];
        const occupied = new Set();
        const radius = Math.ceil(Math.sqrt(totalCount)) + 3;
        for (let i = 0; i < totalCount; i++) {
            let q, r;
            do {
                q = Math.floor(Math.random() * (radius * 2 + 1)) - radius;
                r = Math.floor(Math.random() * (radius * 2 + 1)) - radius;
            } while (occupied.has(`${q},${r}`));
            occupied.add(`${q},${r}`);
            allPlaces.push({ id: Date.now() + i, name: RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)], coords: { q, r } });
        }
        
        const typesToCreate = [];
        if (totalCount > 0) typesToCreate.push('Capitale');
        let typePool = [];
        if (totalCount > 1) {
            const rem = totalCount - 1;
            typePool.push(...Array(Math.round(rem * 0.15)).fill('Ville'));
            typePool.push(...Array(Math.round(rem * 0.25)).fill('Bourg'));
            typePool.push(...Array(Math.round(rem * 0.30)).fill('Village'));
            while(typePool.length < rem) typePool.push('Hameau');
        }
        typePool.sort(() => Math.random() - 0.5);
        typesToCreate.push(...typePool);
        allPlaces.forEach((place, index) => place.type = typesToCreate[index]);
        allPlaces.sort((a, b) => PLACE_TYPE_HIERARCHY.indexOf(a.type) - PLACE_TYPE_HIERARCHY.indexOf(b.type));

        const allEdges = [];
        for (let i = 0; i < allPlaces.length; i++) {
            for (let j = i + 1; j < allPlaces.length; j++) {
                allEdges.push({ a: allPlaces[i], b: allPlaces[j], dist: axialDistance(allPlaces[i].coords, allPlaces[j].coords) });
            }
        }
        allEdges.sort((a, b) => a.dist - b.dist);
        
        const parent = {};
        allPlaces.forEach(p => parent[p.id] = p.id);
        const find = i => (parent[i] === i) ? i : (parent[i] = find(parent[i]));
        const union = (i, j) => {
            const rootI = find(i);
            const rootJ = find(j);
            if (rootI !== rootJ) parent[rootI] = rootJ;
        };
        
        const mstEdges = [];
        allEdges.forEach(edge => {
            if (find(edge.a.id) !== find(edge.b.id)) {
                union(edge.a.id, edge.b.id);
                mstEdges.push(edge);
            }
        });

        const guaranteedRoads = [];
        const capital = allPlaces.find(p => p.type === 'Capitale');
        if (capital) {
            const importantPlaces = allPlaces.filter(p => p.type === 'Ville' || p.type === 'Bourg');
            importantPlaces.forEach(place => {
                const roadExists = mstEdges.some(edge => (edge.a.id === capital.id && edge.b.id === place.id) || (edge.b.id === capital.id && edge.a.id === place.id));
                if (!roadExists) {
                    const missingEdge = allEdges.find(edge => (edge.a.id === capital.id && edge.b.id === place.id) || (edge.b.id === capital.id && edge.a.id === place.id));
                    if(missingEdge) {
                        guaranteedRoads.push(missingEdge);
                    }
                }
            });
        }
        
        const startCapital = allPlaces.find(p => p.type === 'Capitale');
        if (startCapital) {
            const discoveredPlaceIds = new Set([startCapital.id]);
            currentRegion.places.push(startCapital);
            
            await animateViewToFitAllPlaces([startCapital], 250);
            await animateMultiplePlacesFadeIn([startCapital], 250);
            updatePlacesList();
            saveData();

            let availableRoads = [...mstEdges];
            while(discoveredPlaceIds.size < allPlaces.length) {
                let nextEdge = null;
                let edgeIndex = -1;

                for(let i=0; i < availableRoads.length; i++) {
                    const edge = availableRoads[i];
                    const aDiscovered = discoveredPlaceIds.has(edge.a.id);
                    const bDiscovered = discoveredPlaceIds.has(edge.b.id);
                    if (aDiscovered !== bDiscovered) {
                        nextEdge = edge;
                        edgeIndex = i;
                        break;
                    }
                }
                
                if(!nextEdge) break; 

                availableRoads.splice(edgeIndex, 1);
                
                const newPlace = discoveredPlaceIds.has(nextEdge.a.id) ? nextEdge.b : nextEdge.a;
                const existingPlace = discoveredPlaceIds.has(nextEdge.a.id) ? nextEdge.a : nextEdge.b;
                const connection = { start: existingPlace, end: newPlace };
                
                await animateViewToFitAllPlaces([...currentRegion.places, newPlace], 300);
                await animateMultipleRoads([connection], 350);
                
                animatedRoadsToDraw.push(connection);
                
                currentRegion.places.push(newPlace);
                discoveredPlaceIds.add(newPlace.id);

                const roadKey = getRoadKey(newPlace.id, existingPlace.id);
                currentRegion.roads[roadKey] = {
                    type: determineRoadType(newPlace, existingPlace)
                };

                await animateMultiplePlacesFadeIn([newPlace], 200);

                updatePlacesList();
                saveData();
            }
        } else { // Handle case with no capital
            currentRegion.places = allPlaces;
        }

        if(guaranteedRoads.length > 0) {
            const connections = guaranteedRoads.map(edge => ({ start: edge.a, end: edge.b }));
            await animateMultipleRoads(connections, 450);
            guaranteedRoads.forEach(edge => {
                 animatedRoadsToDraw.push({start: edge.a, end: edge.b});
                 const roadKey = getRoadKey(edge.a.id, edge.b.id);
                 currentRegion.roads[roadKey] = {
                    type: determineRoadType(edge.a, edge.b)
                 };
            });
            saveData();
        }

        animationInProgress = false;
        animatedRoadsToDraw = [];
        drawMap(); 
        if(generateMapBtn) {
            generateMapBtn.disabled = !currentRegion;
            generateMapBtn.textContent = "Carte Aléatoire";
        }
        if(document.body) document.body.style.cursor = 'default';
    }
    
    function checkAllPlacesValidated(region) {
        if (!region || !region.places || region.places.length === 0) {
            return false;
        }
        return region.places.every(place => place.config && place.config.isValidated === true);
    }

    function updateNavLinksState() {
        if (!navStep2 || !navStep3) return;
        const isStep2Ready = currentRegion && currentRegion.places.length > 0;
        const isStep3Ready = checkAllPlacesValidated(currentRegion);

        if (isStep2Ready) {
            navStep2.classList.remove('nav-disabled');
        } else {
            navStep2.classList.add('nav-disabled');
        }
        
        if (isStep3Ready) {
            navStep3.classList.remove('nav-disabled');
        } else {
            navStep3.classList.add('nav-disabled');
        }
    }

    function populateRoadModal() {
        if (!roadTypeSelect) return;
        roadTypeSelect.innerHTML = '';
        for (const [key, value] of Object.entries(ROAD_TYPES)) {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = value.name;
            roadTypeSelect.appendChild(option);
        }
    }
    
    function makeModalDraggable(modal, handle) {
        if (!modal || !handle) return;
        let isDragging = false;
        let startX, startY, initialLeft, initialTop;

        handle.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            initialLeft = modal.offsetLeft;
            initialTop = modal.offsetTop;
            modal.style.transform = '';
            handle.style.cursor = 'grabbing';
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            e.preventDefault();
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            modal.style.left = `${initialLeft + dx}px`;
            modal.style.top = `${initialTop + dy}px`;
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                handle.style.cursor = 'move';
            }
        });
    }

    function setupEventListeners() {
        if (!canvas) return; // Guard for headless execution
        window.addEventListener('resize', resizeCanvas);
        createRegionBtn.addEventListener('click', handleCreateRegion);
        deleteRegionBtn.addEventListener('click', handleDeleteRegion);
        regionSelect.addEventListener('change', handleRegionChange);
        generateMapBtn.addEventListener('click', handleGenerateMap);
        placesList.addEventListener('click', handlePlaceListClick);
        placeForm.addEventListener('submit', handlePlaceFormSubmit);
        cancelPlaceBtn.addEventListener('click', () => placeModal.close());
        scaleInput.addEventListener('change', handleScaleChange);
        
        showRoadsToggle.addEventListener('change', () => {
            showRoads = showRoadsToggle.checked;
            if (showRoads) {
                distanceModePlaceId = null;
                clearRoadFilterBtn.style.display = 'none';
            }
            drawMap();
        });

        clearRoadFilterBtn.addEventListener('click', () => {
            distanceModePlaceId = null; 
            showRoads = true; 
            showRoadsToggle.checked = true;
            clearRoadFilterBtn.textContent = "Voir toutes";
            clearRoadFilterBtn.style.display = 'none';
            drawMap();
        });

        roadForm.addEventListener('submit', handleRoadFormSubmit);
        cancelRoadBtn.addEventListener('click', () => roadModal.close());
        deleteRoadBtn.addEventListener('click', handleDeleteRoad);
        roadTypeSelect.addEventListener('change', () => {
            const selectedType = ROAD_TYPES[roadTypeSelect.value];
            if (selectedType && roadInfo) {
                roadInfo.innerHTML = `<strong>Usagers&nbsp;:</strong> ${selectedType.users.join(', ')}<br>
                                      <strong>Description&nbsp;:</strong> ${selectedType.desc}`;
            }
        });
        
        if (floatingMenu) {
            floatingMenu.addEventListener('click', (e) => {
                const link = e.target.closest('a');
                if (link && link.classList.contains('nav-disabled')) {
                    e.preventDefault();
                    if (link.id === 'nav-step3') {
                         alert("Veuillez d'abord configurer et valider TOUS les lieux dans l'Étape 2 pour accéder à la simulation.");
                    } else {
                         alert("Veuillez d'abord créer une région et y ajouter au moins un lieu pour accéder à cette étape.");
                    }
                }
            });
        }
        
        canvas.addEventListener('mousedown', (e) => {
            if (pulseInterval) clearInterval(pulseInterval);
            if (panAnimationId) cancelAnimationFrame(panAnimationId);
            pulseInterval = null;
            panAnimationId = null;
            pulsingPlaceId = null;

            if (e.button !== 0 || animationInProgress) return;

            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            const iconClicked = placeIconHitBoxes.some(box => mouseX >= box.x && mouseX <= box.x + box.width && mouseY >= box.y && mouseY <= box.y + box.height);
            if (hoveredRoad || iconClicked) return;

            lastMouse = { x: mouseX, y: mouseY };
            
            const hexCoords = getPixelToHex(mouseX, mouseY);
            const place = getPlaceAt(hexCoords);

            if (place) {
                isDraggingPlace = true;
                draggedPlace = place;
            } else {
                isPanning = true;
                canvas.classList.add('is-dragging');
            }
        });

        canvas.addEventListener('mousemove', (e) => {
            if (animationInProgress) return;

            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            let isCursorPointer = false;
            
            if (!isPanning && !isDraggingPlace) {
                const hoveredPlaceIcon = placeIconHitBoxes.find(box => 
                    mouseX >= box.x && mouseX <= box.x + box.width &&
                    mouseY >= box.y && mouseY <= box.y + box.height
                );
                if (hoveredPlaceIcon) {
                    isCursorPointer = true;
                }

                const hoveredRoadIcon = roadHitBoxes.find(box => 
                    mouseX >= box.x && mouseX <= box.x + box.width &&
                    mouseY >= box.y && mouseY <= box.y + box.height
                );
                if (hoveredRoadIcon) {
                    isCursorPointer = true;
                    hoveredRoad = hoveredRoadIcon.roadKey;
                } else {
                    hoveredRoad = null;
                }
                
                canvas.style.cursor = isCursorPointer ? 'pointer' : 'grab';
            }
             
            if (isPanning) {
                view.x += mouseX - lastMouse.x;
                view.y += mouseY - lastMouse.y;
                drawMap();
            } else if (isDraggingPlace) {
                lastMouse = { x: mouseX, y: mouseY };
                drawMap();
            } else {
                 const currentHex = getPixelToHex(mouseX,mouseY);
                 if(!hoveredHex || hoveredHex.q !== currentHex.q || hoveredHex.r !== currentHex.r) {
                     hoveredHex = currentHex;
                     drawMap();
                 }
            }
            
            if (!isDraggingPlace) {
                lastMouse = { x: mouseX, y: mouseY };
            }
        });

        window.addEventListener('mouseup', (e) => {
            if (animationInProgress) return;
            if (isPanning) {
                isPanning = false;
                if(canvas) canvas.classList.remove('is-dragging');
            }
            if (isDraggingPlace && draggedPlace) {
                const rect = canvas.getBoundingClientRect();
                const mouseX = e.clientX - rect.left;
                const mouseY = e.clientY - rect.top;
                const targetHex = getPixelToHex(mouseX, mouseY);
                
                if (!getPlaceAt(targetHex)) {
                    draggedPlace.coords = targetHex;
                }

                isDraggingPlace = false;
                draggedPlace = null;
                saveData();
                updatePlacesList(); 
                drawMap();
            }
        });

        canvas.addEventListener('wheel', (e) => {
            if (animationInProgress) return;
            e.preventDefault();
            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
            const oldZoom = view.zoom;
            view.zoom = Math.max(0.02, Math.min(5, view.zoom * zoomFactor));

            view.x = mouseX - (mouseX - view.x) * (view.zoom / oldZoom);
            view.y = mouseY - (mouseY - view.y) * (view.zoom / oldZoom);

            drawMap();
        }, { passive: false });

        canvas.addEventListener('dblclick', (e) => {
             if (animationInProgress) return;
             if (!currentRegion) {
                 alert("Veuillez créer ou sélectionner une région avant d'ajouter un lieu.");
                 return;
             }
             const rect = canvas.getBoundingClientRect();
             const mouseX = e.clientX - rect.left;
             const mouseY = e.clientY - rect.top;
             const hexCoords = getPixelToHex(mouseX, mouseY);
             const place = getPlaceAt(hexCoords); 

             if (place) {
                openPlaceModal(place.coords, place);
             } else {
                 openPlaceModal(hexCoords);
             }
        });
        
        canvas.addEventListener('click', async (e) => {
            if (animationInProgress) return;
            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
        
            if (distanceModePlaceId) {
                const clickedActionIcon = distanceModeActionHitBoxes.find(box =>
                    mouseX >= box.x && mouseX <= box.x + box.width &&
                    mouseY >= box.y && mouseY <= box.y + box.height
                );
        
                if (clickedActionIcon) {
                    const roadKey = clickedActionIcon.roadKey;
                    
                    if (clickedActionIcon.action === 'add') {
                        const [placeA, placeB] = getPlacesFromRoadKey(roadKey);
                        currentRegion.roads[roadKey] = {
                            type: determineRoadType(placeA, placeB)
                        };
                        distanceModePlaceId = null;
                        if(clearRoadFilterBtn) {
                            clearRoadFilterBtn.style.display = 'none';
                            clearRoadFilterBtn.textContent = "Voir toutes";
                        }
                        showRoads = true;
                        if(showRoadsToggle) showRoadsToggle.checked = true;
                        saveData();
                        await animateMultipleRoads([{ start: placeA, end: placeB }], 350);
                        showNotification('Route créée avec succès.', 'success');
                        
                        drawMap();
                        return;
                    } else if (clickedActionIcon.action === 'remove') {
                        delete currentRegion.roads[roadKey];
                        showNotification('Route supprimée.', 'info');
                        saveData();
                        drawMap();
                        return;
                    }
                }
            }
        
            const clickedPlaceIcon = placeIconHitBoxes.find(box =>
                mouseX >= box.x && mouseX <= box.x + box.width &&
                mouseY >= box.y && mouseY <= box.y + box.height
            );
        
            if (clickedPlaceIcon) {
                distanceModePlaceId = clickedPlaceIcon.placeId; 
                showRoads = false; 
                if(showRoadsToggle) showRoadsToggle.checked = false;
                if(clearRoadFilterBtn) {
                    clearRoadFilterBtn.style.display = 'inline-block';
                    clearRoadFilterBtn.textContent = "Quitter Mesure";
                }
                drawMap();
                return;
            }
        
            const clickedRoadIcon = roadHitBoxes.find(box =>
                mouseX >= box.x && mouseX <= box.x + box.width &&
                mouseY >= box.y && mouseY <= box.y + box.height
            );
            if (clickedRoadIcon) {
                openRoadModal(clickedRoadIcon.roadKey);
            }
        });

        canvas.addEventListener('mouseleave', () => {
            if(hoveredHex) {
                hoveredHex = null;
                drawMap();
            }
        });
    }
    
    async function init() {
        await preloadAssets();
        populateRoadModal();
        generateRoadLegend();
        loadData(); 
        handleRegionChange(); 
        resizeCanvas();
        setupEventListeners();
        makeModalDraggable(placeModal, document.getElementById('place-modal-header'));
        makeModalDraggable(roadModal, document.getElementById('road-modal-header'));
        if (canvas) {
            view.x = canvas.width / 2;
            view.y = canvas.height / 2;
        }
        view.zoom = 0.15;
        drawMap();
        updateNavLinksState(); 
    }

function createRegionWithName(name) {
    if (name) {
        const newRegion = {
            id: Date.now(),
            name: name,
            scale: 10,
            places: [],
            roads: {}
        };
        regions.push(newRegion);
        currentRegion = newRegion;
        localStorage.setItem(LAST_REGION_KEY, currentRegion.id);
        saveData();
        console.log(`Région '${name}' créée pour l'automatisation.`);
        return newRegion;
    } else {
        console.error("Le nom de la région ne peut pas être vide.");
        return null;
    }
}


window.EcoSimStep1 = {
    createRegion: handleCreateRegion,
    createRegionWithName: createRegionWithName,
    run: handleGenerateMap
};

if (document.getElementById('hex-map')) {
    init();
}

});