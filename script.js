// Attend que le DOM soit entièrement chargé avant d'exécuter le script
document.addEventListener('DOMContentLoaded', () => {

    // --- SÉLECTEURS D'ÉLÉMENTS DU DOM ---
    const regionSelect = document.getElementById('region-select');
    const newRegionNameInput = document.getElementById('new-region-name');
    const createRegionBtn = document.getElementById('create-region-btn');
    const deleteRegionBtn = document.getElementById('delete-region-btn');
    const hexDistanceInput = document.getElementById('hex-distance');
    const nextStepBtn = document.getElementById('next-step-btn');
    const nextStepError = document.getElementById('next-step-error');
    const placesList = document.getElementById('places-list');
    const zoomInBtn = document.getElementById('zoom-in-btn');
    const zoomOutBtn = document.getElementById('zoom-out-btn');
    const placeModal = document.getElementById('place-modal');
    const placeForm = document.getElementById('place-form');
    const confirmPlaceBtn = document.getElementById('confirm-place-btn');
    const cancelPlaceBtn = document.getElementById('cancel-place-btn');
    const placeNameInput = document.getElementById('place-name');
    const placeTypeSelect = document.getElementById('place-type');
    const canvas = document.getElementById('hex-map');
    const mapContainer = document.getElementById('map-container');
    const ctx = canvas.getContext('2d');
    const showDistancesToggle = document.getElementById('show-distances-toggle');


    // --- Random Generation Elements ---
    const generateMapBtn = document.getElementById('generate-map-btn');
    const randomPlaceCountInput = document.getElementById('random-place-count');
    const placementStrategySelect = document.getElementById('placement-strategy');
    const rangedOptionsDiv = document.getElementById('ranged-options');
    const minRangeInput = document.getElementById('min-range');
    const maxRangeInput = document.getElementById('max-range');


    // --- VARIABLES D'ÉTAT DE L'APPLICATION ---
    let regions = [];
    let currentRegion = null;
    let hexSize = 30;
    let selectedHex = null; // Pour créer un nouveau lieu
    let selectedPlaceForLines = null; // Pour afficher les distances après un clic
    let hoveredPlace = null; // Pour afficher les distances au survol
    let placeNames = {}; // Pour stocker les noms de lieux depuis le JSON
    
    const hexImage = new Image();
    hexImage.src = 'terrain_hex.jpg';
    hexImage.onload = () => {
        drawMap();
    };

    // --- State for dragging map vs place ---
    let isMouseDown = false;
    let isMapDragging = false;
    let isPlaceDragging = false;
    let draggedPlace = null;
    let dragStartCoords = { x: 0, y: 0 };
    let lastMouseX = 0;
    let lastMouseY = 0;

    let offsetX = 0;
    let offsetY = 0;

    let animationFrameId = null;
    let pulseEffect = null;

    const STORAGE_KEY = 'ecoSimRPG_data';

    // Objet pour stocker les images préchargées des lieux
    const placeImages = {};
    const PLACE_TYPES = ['Capitale', 'Ville', 'Bourg', 'Village', 'Hameau'];


    // Fonction pour précharger les images des types de lieux
    function preloadPlaceImages() {
        PLACE_TYPES.forEach(type => {
            const img = new Image();
            img.src = `${type.toLowerCase()}.jpg`; 
            placeImages[type] = img;
        });
    }

    // Fonction pour charger les noms de lieux depuis le fichier JSON
    async function loadPlaceNames() {
        try {
            const response = await fetch('lieux.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            placeNames = await response.json();
        } catch (error) {
            console.error("Erreur lors du chargement de lieux.json:", error);
            // Initialiser avec des tableaux vides en cas d'erreur
            PLACE_TYPES.forEach(type => {
                if (!placeNames[type]) placeNames[type] = [];
            });
        }
    }

    function loadData() {
        const savedData = localStorage.getItem(STORAGE_KEY);
        if (savedData) {
            regions = JSON.parse(savedData);
        }
        populateRegionSelect();
    }

    function saveData() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(regions));
    }

    function populateRegionSelect() {
        const selectedValue = regionSelect.value;
        regionSelect.innerHTML = '<option value="">Aucune région sélectionnée</option>';
        regions.forEach((region, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = region.name;
            regionSelect.appendChild(option);
        });
        regionSelect.value = selectedValue;
    }

    function handleCreateRegion() {
        const name = newRegionNameInput.value.trim();
        if (!name) {
            alert('Veuillez entrer un nom pour la nouvelle région.');
            return;
        }
        const newRegion = {
            id: Date.now(),
            name: name,
            hexDistance: 1,
            places: []
        };
        regions.push(newRegion);
        saveData();
        populateRegionSelect();
        regionSelect.value = regions.length - 1;
        handleRegionChange();
        newRegionNameInput.value = '';
    }

    function handleDeleteRegion() {
        const selectedIndex = regionSelect.value;
        if (selectedIndex === "" || !currentRegion) {
            alert("Aucune région n'est sélectionnée.");
            return;
        }

        if (confirm(`Êtes-vous sûr de vouloir supprimer la région "${currentRegion.name}" ? Cette action est irréversible.`)) {
            regions.splice(selectedIndex, 1);
            saveData();
            currentRegion = null;
            populateRegionSelect();
            handleRegionChange(); // This will reset the UI
        }
    }

    function handleRegionChange() {
        const selectedIndex = regionSelect.value;
        if (selectedIndex !== "") {
            currentRegion = regions[selectedIndex];
            hexDistanceInput.value = currentRegion.hexDistance;
            offsetX = 0;
            offsetY = 0;
            selectedPlaceForLines = null;
            hoveredPlace = null;
        } else {
            currentRegion = null;
        }
        updateUIForRegion();
    }
    
    function handleHexDistanceChange() {
        if (currentRegion) {
            const distance = parseFloat(hexDistanceInput.value);
            if (distance > 0) {
                currentRegion.hexDistance = distance;
                saveData();
                drawMap();
            }
        }
    }

    function updateUIForRegion() {
        const isRegionSelected = !!currentRegion;
        hexDistanceInput.disabled = !isRegionSelected;
        deleteRegionBtn.disabled = !isRegionSelected;
        generateMapBtn.disabled = !isRegionSelected;
        
        canvas.style.cursor = isRegionSelected ? 'grab' : 'default';
        
        updatePlacesList();
        updateNextStepButton();
        drawMap();
    }

    function updatePlacesList() {
        placesList.innerHTML = '';
        if (currentRegion && currentRegion.places.length > 0) {
            currentRegion.places.forEach(place => {
                const li = document.createElement('li');
                li.dataset.placeId = place.id;
                
                li.innerHTML = `
                    <div class="place-info" data-action="select" title="Afficher/Cacher les distances">
                        <div>${place.name}</div>
                        <div class="place-type">(${place.type})</div>
                    </div>
                    <div class="place-actions">
                        <button class="btn-edit" data-action="edit" title="Éditer ce lieu">Éditer</button>
                        <button class="btn-center" data-action="center" title="Centrer la vue sur ce lieu">Centrer</button>
                        <button class="delete-place-btn" data-action="delete" title="Supprimer ce lieu">X</button>
                    </div>
                `;
                placesList.appendChild(li);
            });
        } else {
            placesList.innerHTML = '<li class="placeholder">Aucun lieu pour le moment.</li>';
        }
    }

    function handleDeletePlace(placeId) {
        if (!currentRegion) return;
        const placeIndex = currentRegion.places.findIndex(p => p.id === placeId);
        if (placeIndex > -1) {
            currentRegion.places.splice(placeIndex, 1);
            
            if (selectedPlaceForLines && selectedPlaceForLines.id === placeId) {
                selectedPlaceForLines = null;
            }
            if (hoveredPlace && hoveredPlace.id === placeId) {
                hoveredPlace = null;
            }

            saveData();
            updatePlacesList();
            updateNextStepButton();
            drawMap();
        }
    }

    function updateNextStepButton() {
        const enabled = currentRegion && currentRegion.places.length > 0;
        nextStepBtn.disabled = !enabled;
        nextStepError.hidden = enabled;
    }
    
    function resizeCanvas() {
        canvas.width = mapContainer.clientWidth;
        canvas.height = mapContainer.clientHeight;
        drawMap();
    }
    
    function drawHex(x, y, size, customStroke = null) {
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle_deg = 60 * i - 30;
            const angle_rad = Math.PI / 180 * angle_deg;
            ctx.lineTo(x + size * Math.cos(angle_rad), y + size * Math.sin(angle_rad));
        }
        ctx.closePath();

        if (hexImage.complete && hexImage.naturalHeight !== 0) {
            ctx.save();
            ctx.clip();
            ctx.drawImage(hexImage, x - size, y - size, size * 2, size * 2);
            ctx.restore();
        } else {
            ctx.fillStyle = '#bdc3c7';
            ctx.fill();
        }

        ctx.strokeStyle = customStroke || '#7f8c8d';
        ctx.lineWidth = customStroke ? 3 : 1;
        ctx.stroke();
        ctx.lineWidth = 1;
    }
    
    function drawMap() {
        if (!canvas.getContext) return;

        if (pulseEffect && Date.now() > pulseEffect.startTime + pulseEffect.duration) {
            pulseEffect = null;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (!currentRegion) return;

        const hexWidth = Math.sqrt(3) * hexSize;
        const hexHeight = 2 * hexSize;
        
        const startCol = Math.floor(-offsetX / hexWidth) - 1;
        const endCol = Math.floor((canvas.width - offsetX) / hexWidth) + 1;
        const startRow = Math.floor(-offsetY / (hexHeight * 0.75)) - 1;
        const endRow = Math.floor((canvas.height - offsetY) / (hexHeight * 0.75)) + 1;

        for (let row = startRow; row <= endRow; row++) {
            for (let col = startCol; col <= endCol; col++) {
                const x = col * hexWidth + (row % 2) * (hexWidth / 2);
                const y = row * hexHeight * 0.75;
                drawHex(x + offsetX, y + offsetY, hexSize);
            }
        }
        
        if (showDistancesToggle.checked) {
            let placeToDrawLinesFrom = null;

            // Priority: dragged > hovered > selected
            if (isPlaceDragging && draggedPlace) {
                placeToDrawLinesFrom = draggedPlace;
            } else {
                placeToDrawLinesFrom = hoveredPlace || selectedPlaceForLines;
            }
            
            if (placeToDrawLinesFrom && currentRegion.places.length > 1) {
                const sourceCoords = placeToDrawLinesFrom.coords;
                const startX = sourceCoords.q * hexWidth + (sourceCoords.r % 2) * (hexWidth / 2) + offsetX;
                const startY = sourceCoords.r * hexHeight * 0.75 + offsetY;
    
                currentRegion.places.forEach(targetPlace => {
                    if (targetPlace.id === placeToDrawLinesFrom.id) return;
    
                    const targetCoords = targetPlace.coords;
                    const endX = targetCoords.q * hexWidth + (targetCoords.r % 2) * (hexWidth / 2) + offsetX;
                    const endY = targetCoords.r * hexHeight * 0.75 + offsetY;
    
                    ctx.beginPath();
                    ctx.setLineDash([8, 8]);
                    ctx.moveTo(startX, startY);
                    ctx.lineTo(endX, endY);
                    ctx.strokeStyle = 'black';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                    ctx.setLineDash([]);
    
                    const hexDist = calculateHexDistance(sourceCoords, targetCoords);
                    const realDist = (hexDist * currentRegion.hexDistance).toFixed(1);
                    const text = `${realDist} km`;
                    
                    const midX = (startX + endX) / 2;
                    const midY = (startY + endY) / 2;
    
                    ctx.font = `bold ${Math.max(10, hexSize / 2.5)}px ${getComputedStyle(document.body).getPropertyValue('--font-body')}`;
                    const textMetrics = ctx.measureText(text);
                    ctx.fillStyle = `rgba(244, 235, 208, 0.75)`;
                    ctx.fillRect(midX - textMetrics.width / 2 - 4, midY - (hexSize / 2.5) + 2, textMetrics.width + 8, (hexSize / 2.5) + 4);
                    
                    ctx.fillStyle = 'black';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(text, midX, midY);
                });
            }
        }
        
        currentRegion.places.forEach(place => {
            const { q, r } = place.coords;
            const hexWidth = Math.sqrt(3) * hexSize;
            const hexHeight = 2 * hexSize;
            const x = q * hexWidth + (r % 2) * (hexWidth / 2) + offsetX;
            const y = r * hexHeight * 0.75 + offsetY;
        
            let currentHexSize = hexSize;
            let customStroke = null;
            if (pulseEffect && pulseEffect.id === place.id) {
                const elapsed = Date.now() - pulseEffect.startTime;
                const progress = elapsed / pulseEffect.duration;
                const pulse = Math.sin(progress * Math.PI * 2) * 4;
                currentHexSize += pulse;
                customStroke = `rgba(255, 255, 100, ${1 - progress})`;
            }
        
            const placeImg = placeImages[place.type];
            
            ctx.save();
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                const angle_deg = 60 * i - 30;
                const angle_rad = Math.PI / 180 * angle_deg;
                let size = currentHexSize;
                if(isPlaceDragging && draggedPlace && draggedPlace.id === place.id) {
                    size += Math.sin(Date.now() / 100) * 2;
                }
                ctx.lineTo(x + size * Math.cos(angle_rad), y + size * Math.sin(angle_rad));
            }
            ctx.closePath();
            ctx.clip();
        
            if (placeImg && placeImg.complete && placeImg.naturalHeight !== 0) {
                ctx.drawImage(placeImg, x - currentHexSize, y - currentHexSize, currentHexSize * 2, currentHexSize * 2);
            } else {
                ctx.fillStyle = '#c0392b';
                ctx.fill();
            }
        
            ctx.restore(); 
            
            const placeIsSelected = (selectedPlaceForLines && selectedPlaceForLines.id === place.id);
            const placeIsHovered = (hoveredPlace && hoveredPlace.id === place.id);

            if ((showDistancesToggle.checked && (placeIsSelected || placeIsHovered) && !isPlaceDragging) || customStroke) {
                ctx.lineWidth = 3;
                ctx.strokeStyle = customStroke || (placeIsHovered ? '#FFD700' : '#FFFFFF'); // Gold for hover, White for select
                ctx.beginPath();
                for (let i = 0; i < 6; i++) {
                    const angle_deg = 60 * i - 30;
                    const angle_rad = Math.PI / 180 * angle_deg;
                    ctx.lineTo(x + currentHexSize * Math.cos(angle_rad), y + currentHexSize * Math.sin(angle_rad));
                }
                ctx.closePath();
                ctx.stroke();
            }
        
            const nameFontSize = Math.max(9, currentHexSize / 3.5);
            const typeFontSize = Math.max(8, currentHexSize / 4.5);
            const fontName = getComputedStyle(document.body).getPropertyValue('--font-body');

            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            const nameY = y - (nameFontSize / 2);
            ctx.font = `bold ${nameFontSize}px ${fontName}`;
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 3;
            ctx.strokeText(place.name, x, nameY);
            ctx.fillStyle = 'white';
            ctx.fillText(place.name, x, nameY);

            const typeY = y + (nameFontSize / 2) + 2;
            ctx.font = `italic ${typeFontSize}px ${fontName}`;
            ctx.lineWidth = 2;
            ctx.strokeText(`(${place.type})`, x, typeY);
            ctx.fillStyle = '#DDDDDD';
            ctx.fillText(`(${place.type})`, x, typeY);
        });
    }
    
    function pixelToHex(x, y) {
        const adjustedX = x - offsetX;
        const adjustedY = y - offsetY;
        const hexWidth = Math.sqrt(3) * hexSize;
        const hexHeight = 2 * hexSize;
        const r_approx = adjustedY / (hexHeight * 0.75);
        const r = Math.round(r_approx);
        const x_offset = (r % 2) * (hexWidth / 2);
        const q_approx = (adjustedX - x_offset) / hexWidth;
        const q = Math.round(q_approx);
        return { q, r };
    }

    function getPlaceAtHex(hexCoords) {
        if (!currentRegion) return null;
        return currentRegion.places.find(p => p.coords.q === hexCoords.q && p.coords.r === hexCoords.r);
    }

    function calculateHexDistance(coords1, coords2) {
        const dq = Math.abs(coords1.q - coords2.q);
        const dr = Math.abs(coords1.r - coords2.r);
        const ds = Math.abs((-coords1.q - coords1.r) - (-coords2.q - coords2.r));
        return Math.max(dq, dr, ds);
    }
    
    // --- MODAL MANAGEMENT ---
    
    function openCreatePlaceModal(hexCoords) {
        selectedHex = hexCoords;
        placeForm.removeAttribute('data-editing-id');
        placeModal.querySelector('h3').textContent = 'Créer un Nouveau Lieu';
        confirmPlaceBtn.textContent = 'Créer';
        placeNameInput.value = '';
        placeTypeSelect.value = '';
        placeModal.showModal();
    }

    function openEditPlaceModal(placeId) {
        const placeToEdit = currentRegion.places.find(p => p.id === placeId);
        if (!placeToEdit) return;

        selectedHex = null; // Not creating
        placeForm.dataset.editingId = placeId;
        placeModal.querySelector('h3').textContent = 'Éditer le Lieu';
        confirmPlaceBtn.textContent = 'Modifier';
        placeNameInput.value = placeToEdit.name;
        placeTypeSelect.value = placeToEdit.type;
        placeModal.showModal();
    }

    function handlePlaceFormSubmit(event) {
        event.preventDefault();
        const name = placeNameInput.value.trim();
        const type = placeTypeSelect.value;
        const editingId = placeForm.dataset.editingId;

        if (!name || !type) {
            alert("Veuillez remplir tous les champs.");
            return;
        }

        if (editingId) { // --- EDIT MODE ---
            const placeToUpdate = currentRegion.places.find(p => p.id === parseInt(editingId));
            if(placeToUpdate) {
                placeToUpdate.name = name;
                placeToUpdate.type = type;
            }
        } else { // --- CREATE MODE ---
            if (!selectedHex) return;
            const newPlace = {
                id: Date.now(),
                name,
                type,
                coords: selectedHex
            };
            currentRegion.places.push(newPlace);
        }

        saveData();
        updatePlacesList();
        updateNextStepButton();
        drawMap();
        placeModal.close();
    }


    function animatePanAndPulse(placeId) {
        if (!currentRegion || isMapDragging || isPlaceDragging) return;
        if (animationFrameId) cancelAnimationFrame(animationFrameId);

        const place = currentRegion.places.find(p => p.id === placeId);
        if (!place) return;

        const hexWidth = Math.sqrt(3) * hexSize;
        const hexHeight = 2 * hexSize;

        const placePixelX = place.coords.q * hexWidth + (place.coords.r % 2) * (hexWidth / 2);
        const placePixelY = place.coords.r * hexHeight * 0.75;
        const targetOffsetX = canvas.width / 2 - placePixelX;
        const targetOffsetY = canvas.height / 2 - placePixelY;

        const startOffsetX = offsetX;
        const startOffsetY = offsetY;
        const duration = 600;
        let startTime = null;

        function animationStep(timestamp) {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = progress < 0.5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2;

            offsetX = startOffsetX + (targetOffsetX - startOffsetX) * easeProgress;
            offsetY = startOffsetY + (targetOffsetY - startOffsetY) * easeProgress;
            drawMap();

            if (progress < 1) {
                animationFrameId = requestAnimationFrame(animationStep);
            } else {
                animationFrameId = null;
                pulseEffect = { id: placeId, startTime: Date.now(), duration: 1000 };
                function pulseAnimation() {
                    if (pulseEffect) {
                        drawMap();
                        requestAnimationFrame(pulseAnimation);
                    } else {
                        drawMap();
                    }
                }
                pulseAnimation();
            }
        }
        animationFrameId = requestAnimationFrame(animationStep);
    }
    
    // --- RANDOM MAP GENERATION ---

    function handleGenerateMap() {
        if (!currentRegion) {
            alert("Veuillez d'abord créer ou sélectionner une région.");
            return;
        }
        if (currentRegion.places.length > 0 && !confirm("Attention : Ceci va supprimer tous les lieux existants sur la carte. Continuer ?")) {
            return;
        }

        const numPlaces = parseInt(randomPlaceCountInput.value);
        if (numPlaces < 1) return;

        // Créer une copie des noms disponibles pour cette génération
        const availableNames = JSON.parse(JSON.stringify(placeNames));
        for (const type in availableNames) {
            availableNames[type].sort(() => Math.random() - 0.5); // Mélanger
        }

        const strategy = placementStrategySelect.value;
        currentRegion.places = []; // Clear existing places
        const occupiedCoords = new Set();
        const MAX_TRIES = 100;

        let placeTypesToAssign = [
            'Capitale',
            ...Array(numPlaces - 1).fill(0).map(() => ['Ville', 'Bourg', 'Village', 'Hameau'][Math.floor(Math.random() * 4)])
        ].sort(() => Math.random() - 0.5); // Randomize order, but Capital is always there

        const getNewName = (type) => {
            if (availableNames[type] && availableNames[type].length > 0) {
                return availableNames[type].pop();
            }
            return `${type} ${currentRegion.places.length + 1}`; // Fallback
        };

        if (strategy === 'random') {
            const radius = Math.ceil(Math.sqrt(numPlaces) * 1.5) + 2;
            for (let i = 0; i < numPlaces; i++) {
                let coords;
                let tries = 0;
                do {
                    const q = Math.floor(Math.random() * (2 * radius + 1)) - radius;
                    const r = Math.floor(Math.random() * (2 * radius + 1)) - radius;
                    coords = { q, r };
                    tries++;
                } while (occupiedCoords.has(`${coords.q},${coords.r}`) && tries < MAX_TRIES);

                if (tries < MAX_TRIES) {
                    const type = placeTypesToAssign.pop() || 'Village';
                    const name = getNewName(type);
                    currentRegion.places.push({ id: Date.now() + i, name: name, type, coords });
                    occupiedCoords.add(`${coords.q},${coords.r}`);
                }
            }
        } else { // Ranged strategy
            const min = parseInt(minRangeInput.value);
            const max = parseInt(maxRangeInput.value);
            if (min > max) {
                alert("La distance minimale ne peut pas être supérieure à la maximale.");
                return;
            }

            // Place first one (Capital) at 0,0
            let firstCoords = { q: 0, r: 0 };
            const capitalType = 'Capitale';
            const capitalName = getNewName(capitalType);
            currentRegion.places.push({ id: Date.now(), name: capitalName, type: capitalType, coords: firstCoords });
            occupiedCoords.add(`0,0`);
            placeTypesToAssign = placeTypesToAssign.filter(t => t !== 'Capitale');

            for (let i = 1; i < numPlaces; i++) {
                let found = false;
                let tries = 0;
                while (!found && tries < MAX_TRIES) {
                    const refPlace = currentRegion.places[Math.floor(Math.random() * currentRegion.places.length)];
                    const dist = Math.floor(Math.random() * (max - min + 1)) + min;
                    
                    let ringCoords = getHexRing(refPlace.coords, dist);
                    ringCoords = ringCoords.sort(() => Math.random() - 0.5); // Shuffle

                    for(const potentialCoords of ringCoords) {
                         if (!occupiedCoords.has(`${potentialCoords.q},${potentialCoords.r}`)) {
                            const type = placeTypesToAssign.pop() || 'Village';
                            const name = getNewName(type);
                            currentRegion.places.push({ id: Date.now() + i, name: name, type, coords: potentialCoords });
                            occupiedCoords.add(`${potentialCoords.q},${potentialCoords.r}`);
                            found = true;
                            break;
                         }
                    }
                    tries++;
                }
            }
        }
        
        saveData();
        updateUIForRegion();
        if (currentRegion.places.length > 0) {
            animatePanAndPulse(currentRegion.places[0].id);
        }
    }

    function getHexRing(center, radius) {
        const results = [];
        if (radius === 0) {
            results.push(center);
            return results;
        }
        let hex = {q: center.q + radius, r: center.r}; // Start at one corner

        for (let i = 0; i < 6; i++) {
            for (let j = 0; j < radius; j++) {
                results.push(hex);
                 // Move to the next hex on the ring edge
                const directions = [{q:0, r:-1}, {q:-1, r:0}, {q:-1, r:+1}, {q:0, r:+1}, {q:+1, r:0}, {q:+1, r:-1}];
                const dir = directions[i];
                hex = {q: hex.q + dir.q, r: hex.r + dir.r};
            }
        }
        return results;
    }


    // --- ÉCOUTEURS D'ÉVÉNEMENTS ---
    
    placesList.addEventListener('click', (event) => {
        const target = event.target;
        const li = target.closest('li');
        if (!li || !li.dataset.placeId || !currentRegion) return;
    
        const actionElement = target.closest('[data-action]');
        if (!actionElement) return;
    
        const placeId = parseInt(li.dataset.placeId, 10);
        const action = actionElement.dataset.action;
    
        if (action === 'delete') {
            handleDeletePlace(placeId);
        } else if (action === 'select') {
            const place = currentRegion.places.find(p => p.id === placeId);
            if (selectedPlaceForLines && selectedPlaceForLines.id === placeId) {
                selectedPlaceForLines = null; // Unselect if clicked again
            } else {
                selectedPlaceForLines = place;
            }
            hoveredPlace = null; // Clear hover when selecting
            drawMap();
        } else if (action === 'center') {
            animatePanAndPulse(placeId);
        } else if (action === 'edit') {
            openEditPlaceModal(placeId);
        }
    });

    createRegionBtn.addEventListener('click', handleCreateRegion);
    deleteRegionBtn.addEventListener('click', handleDeleteRegion);
    regionSelect.addEventListener('change', handleRegionChange);
    hexDistanceInput.addEventListener('change', handleHexDistanceChange);
    placeForm.addEventListener('submit', handlePlaceFormSubmit);
    cancelPlaceBtn.addEventListener('click', () => placeModal.close());
    showDistancesToggle.addEventListener('change', drawMap);
    
    // --- New Event Listeners ---
    generateMapBtn.addEventListener('click', handleGenerateMap);
    placementStrategySelect.addEventListener('change', () => {
        rangedOptionsDiv.hidden = placementStrategySelect.value !== 'ranged';
    });

    canvas.addEventListener('wheel', (event) => {
        event.preventDefault();
        if (!currentRegion) return;
    
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
    
        const oldHexSize = hexSize;
        const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
        const newHexSize = Math.max(15, Math.min(60, oldHexSize * zoomFactor));
    
        if (newHexSize === oldHexSize) return;
    
        const mapX = (mouseX - offsetX);
        const mapY = (mouseY - offsetY);
        
        offsetX = mouseX - mapX * (newHexSize / oldHexSize);
        offsetY = mouseY - mapY * (newHexSize / oldHexSize);
    
        hexSize = newHexSize;
        drawMap();
    }, { passive: false });


    canvas.addEventListener('dblclick', (event) => {
        if (!currentRegion || isMapDragging || isPlaceDragging) return;
        
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const hexCoords = pixelToHex(x, y);

        if (!getPlaceAtHex(hexCoords)) {
            openCreatePlaceModal(hexCoords);
        }
    });
    
    canvas.addEventListener('mousedown', (event) => {
        if (!currentRegion || event.button !== 0) return;
        
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
        pulseEffect = null;

        isMouseDown = true;
        lastMouseX = event.clientX;
        lastMouseY = event.clientY;
        
        const rect = canvas.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const clickY = event.clientY - rect.top;
        const hexCoords = pixelToHex(clickX, clickY);
        const clickedPlace = getPlaceAtHex(hexCoords);

        if (clickedPlace) {
            isPlaceDragging = true;
            draggedPlace = clickedPlace;
            dragStartCoords = { ...clickedPlace.coords };
            selectedPlaceForLines = null; // Clear selection when dragging
            hoveredPlace = null;
            canvas.style.cursor = 'grabbing';
        } else {
            isMapDragging = true;
            canvas.style.cursor = 'grabbing';
        }
    });

    window.addEventListener('mousemove', (event) => {
        if (!currentRegion) return;

        if (isMouseDown) { // Logic for when dragging
            const dx = event.clientX - lastMouseX;
            const dy = event.clientY - lastMouseY;
            lastMouseX = event.clientX;
            lastMouseY = event.clientY;
    
            if (isPlaceDragging && draggedPlace) {
                const rect = canvas.getBoundingClientRect();
                const mouseX = event.clientX - rect.left;
                const mouseY = event.clientY - rect.top;
                const newHexCoords = pixelToHex(mouseX, mouseY);
    
                if (newHexCoords.q !== draggedPlace.coords.q || newHexCoords.r !== draggedPlace.coords.r) {
                     draggedPlace.coords = newHexCoords;
                     drawMap();
                }
            } else if (isMapDragging) {
                offsetX += dx;
                offsetY += dy;
                drawMap();
            }
        } else { // Logic for when just moving the mouse (not dragging)
             const rect = canvas.getBoundingClientRect();
             const mouseX = event.clientX - rect.left;
             const mouseY = event.clientY - rect.top;
             const hexCoords = pixelToHex(mouseX, mouseY);
             const placeUnderMouse = getPlaceAtHex(hexCoords);

             // Handle hover for distances
             if (hoveredPlace?.id !== placeUnderMouse?.id) {
                 hoveredPlace = placeUnderMouse;
                 drawMap();
             }
             
             // Handle cursor style
             if (placeUnderMouse) {
                 canvas.style.cursor = 'move';
             } else {
                 canvas.style.cursor = 'grab';
             }
        }
    });

    window.addEventListener('mouseup', (event) => {
        if (!isMouseDown || !currentRegion) return;

        const wasDragging = isMapDragging || (isPlaceDragging && (draggedPlace.coords.q !== dragStartCoords.q || draggedPlace.coords.r !== dragStartCoords.r));
        
        if (isPlaceDragging && draggedPlace) {
            const rect = canvas.getBoundingClientRect();
            const mouseX = event.clientX - rect.left;
            const mouseY = event.clientY - rect.top;
            const finalHexCoords = pixelToHex(mouseX, mouseY);
            
            const occupyingPlace = getPlaceAtHex(finalHexCoords);
            if(occupyingPlace && occupyingPlace.id !== draggedPlace.id) {
                draggedPlace.coords = dragStartCoords; // Revert position
                alert("Vous ne pouvez pas déplacer un lieu sur un autre.");
            } else {
                draggedPlace.coords = finalHexCoords;
                saveData();
            }
            // After dropping, this place becomes the selected one for lines
            selectedPlaceForLines = draggedPlace;
        }

        if (!wasDragging) { // This was a simple click, not a drag
             const rect = canvas.getBoundingClientRect();
             const clickX = event.clientX - rect.left;
             const clickY = event.clientY - rect.top;
             const hexCoords = pixelToHex(clickX, clickY);
             const clickedPlace = getPlaceAtHex(hexCoords);
             
             if(clickedPlace){
                if(selectedPlaceForLines && selectedPlaceForLines.id === clickedPlace.id){
                    selectedPlaceForLines = null; // Unselect if clicked again
                } else {
                    selectedPlaceForLines = clickedPlace;
                }
             } else {
                 selectedPlaceForLines = null; // Clicked on empty space
             }
        }
        
        hoveredPlace = null;
        isMouseDown = false;
        isMapDragging = false;
        isPlaceDragging = false;
        draggedPlace = null;
        canvas.style.cursor = 'grab';
        drawMap();
    });

    canvas.addEventListener('mouseout', () => {
        if (hoveredPlace) {
            hoveredPlace = null;
            drawMap();
        }
    });

    zoomInBtn.addEventListener('click', () => { hexSize = Math.min(60, hexSize + 5); drawMap(); });
    zoomOutBtn.addEventListener('click', () => { hexSize = Math.max(15, hexSize - 5); drawMap(); });
    window.addEventListener('resize', resizeCanvas);

    async function initialize() {
        await loadPlaceNames();
        preloadPlaceImages();
        loadData();
        if (regionSelect.options.length > 1) {
            regionSelect.value = 0; // Select the first region on load if it exists
        }
        handleRegionChange();
        resizeCanvas();
        placementStrategySelect.dispatchEvent(new Event('change'));
    }

    initialize();
});