document.addEventListener('DOMContentLoaded', () => {

    // --- CONSTANTES & CONFIGURATION ---
    const STORAGE_KEY = 'ecoSimRPG_map_data';
    const LAST_REGION_KEY = 'ecoSimRPG_last_region_id'; 
    const PLACE_TYPES = {
        Capitale: { img: null, file: 'capitale.jpg' },
        Ville: { img: null, file: 'ville.jpg' },
        Bourg: { img: null, file: 'bourg.jpg' },
        Village: { img: null, file: 'village.jpg' },
        Hameau: { img: null, file: 'hameau.jpg' },
    };
    const HEX_TERRAIN = { img: null, file: 'terrain_hex.jpg' };
    const RANDOM_NAMES = ["Aethelgard", "Baeldor", "Crystalgate", "Dunharrow", "Eldoria", "Faelivrin", "Glimmerwood", "Highgarden", "Ironcliff", "Silvercreek", "Valoria", "Windhaven", "Dragon's Rest", "Starfall"];

    // --- SELECTEURS DOM ---
    const canvas = document.getElementById('hex-map');
    const ctx = canvas.getContext('2d');
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
    const navStep2 = document.getElementById('nav-step-2');
    const navStep3 = document.getElementById('nav-step-3');
    const floatingMenu = document.querySelector('.floating-menu');
    
    // --- ETAT DE L'APPLICATION ---
    let hexSize = { w: 100, h: 114 }; // Sera mis à jour après chargement de l'image
    let regions = [];
    let currentRegion = null;
    let view = { x: 0, y: 0, zoom: 1 };
    let isPanning = false;
    let isDraggingPlace = false;
    let draggedPlace = null;
    let lastMouse = { x: 0, y: 0 };
    let tempHexCoords = null;
    let selectedPlaceForDistance = null;
    let hoveredPlace = null;
    let hoveredHex = null; 
    let pulsingPlaceId = null;
    let pulseInterval = null; 
    let panAnimationId = null; // Pour l'animation de glissement

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
            alert("Impossible de charger les textures de la carte. L'application ne peut pas démarrer. Vérifiez que les fichiers images (terrain_hex.jpg, etc.) sont accessibles.");
        }
    }

    // --- LOGIQUE DE LA GRILLE HEXAGONALE (Coordonnées axiales) ---
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
        const dq = a.q - b.q;
        const dr = a.r - b.r;
        const ds = -dq - dr;
        return (Math.abs(dq) + Math.abs(dr) + Math.abs(ds)) / 2;
    }

    function getHexCorners(center, size) {
        const corners = [];
        const hexRadius = size.h / 2; 
        for (let i = 0; i < 6; i++) {
            const angle_rad = Math.PI / 3 * i + Math.PI / 6; // pointy top
            corners.push({
                x: center.x + hexRadius * Math.cos(angle_rad),
                y: center.y + hexRadius * Math.sin(angle_rad)
            });
        }
        return corners;
    }


    // --- GESTION DES DONNEES (LocalStorage) ---
    function saveData() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(regions));
        updateNavLinksState();
    }

    function updateRegionSelect() {
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
        }
        updateRegionSelect();

        const lastRegionId = localStorage.getItem(LAST_REGION_KEY);
        if (lastRegionId && regions.some(r => r.id == lastRegionId)) {
            regionSelect.value = lastRegionId;
        }
    }
    
    // --- RENDU GRAPHIQUE ---
    function resizeCanvas() {
        canvas.width = mapContainer.clientWidth;
        canvas.height = mapContainer.clientHeight;
        drawMap();
    }

    function drawMap() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(view.x, view.y);
        ctx.scale(view.zoom, view.zoom);
        
        const hexCornersPx = [
            getPixelToHex(0, 0),
            getPixelToHex(canvas.width, 0),
            getPixelToHex(0, canvas.height),
            getPixelToHex(canvas.width, canvas.height)
        ];

        const qMin = Math.min(...hexCornersPx.map(c => c.q));
        const qMax = Math.max(...hexCornersPx.map(c => c.q));
        const rMin = Math.min(...hexCornersPx.map(c => c.r));
        const rMax = Math.max(...hexCornersPx.map(c => c.r));

        const overlap = 8; 

        for (let r = rMin - 2; r <= rMax + 2; r++) {
            for (let q = qMin - 2; q <= qMax + 2; q++) {
                const center = getHexCenter(q, r);
                const drawW = hexSize.w + overlap;
                const drawH = hexSize.h + overlap;
                const drawX = center.x - drawW / 2;
                const drawY = center.y - drawH / 2;
                
                if (HEX_TERRAIN.img) {
                   ctx.drawImage(HEX_TERRAIN.img, drawX, drawY, drawW, drawH);
                }

                if (hoveredHex && q === hoveredHex.q && r === hoveredHex.r) {
                    const corners = getHexCorners(center, hexSize);
                    ctx.strokeStyle = 'rgba(212, 160, 23, 0.9)'; // --color-gold
                    ctx.lineWidth = 4 / view.zoom;
                    ctx.beginPath();
                    ctx.moveTo(corners[0].x, corners[0].y);
                    for (let i = 1; i < 6; i++) {
                        ctx.lineTo(corners[i].x, corners[i].y);
                    }
                    ctx.closePath();
                    ctx.stroke();
                }
            }
        }

        if (currentRegion) {
            currentRegion.places.forEach(place => {
                if(draggedPlace && draggedPlace.id === place.id) return;
                drawPlace(place);
            });

            if (isDraggingPlace && draggedPlace) {
                const currentHexUnderMouse = getPixelToHex(lastMouse.x, lastMouse.y);
                const tempOriginPlace = { ...draggedPlace, coords: currentHexUnderMouse };
                drawDistancesFrom(tempOriginPlace);
            } else if(selectedPlaceForDistance) {
                drawDistancesFrom(selectedPlaceForDistance);
            } else if (hoveredPlace) {
                drawDistancesFrom(hoveredPlace);
            }
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
        const placeImg = PLACE_TYPES[place.type]?.img;
        if (!placeImg) return;
        
        const center = getHexCenter(place.coords.q, place.coords.r);
        const scaledW = hexSize.w;
        const scaledH = hexSize.h;

        if (pulsingPlaceId === place.id) {
            ctx.save();
            const pulseScale = 1 + (Math.sin(Date.now() * 0.005) * 0.05);
            ctx.translate(center.x, center.y);
            ctx.scale(pulseScale, pulseScale);
            ctx.drawImage(placeImg, -scaledW/2, -scaledH/2, scaledW, scaledH);
            ctx.restore();
        } else {
             ctx.drawImage(placeImg, center.x - scaledW/2, center.y - scaledH/2, scaledW, scaledH);
        }
    }

    function drawDistancesFrom(originPlace) {
        if (!currentRegion) return;
        const originCenter = getHexCenter(originPlace.coords.q, originPlace.coords.r);
        
        ctx.save();
        ctx.strokeStyle = 'rgba(212, 160, 23, 0.8)';
        ctx.fillStyle = 'white';
        const bodyStyle = getComputedStyle(document.body);
        ctx.font = `bold ${14 / view.zoom}px ${bodyStyle.getPropertyValue('--font-body')}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        currentRegion.places.forEach(targetPlace => {
            if(originPlace.id === targetPlace.id) return;
            
            const targetCenter = getHexCenter(targetPlace.coords.q, targetPlace.coords.r);
            
            ctx.beginPath();
            ctx.setLineDash([5 / view.zoom, 3 / view.zoom]);
            ctx.moveTo(originCenter.x, originCenter.y);
            ctx.lineTo(targetCenter.x, targetCenter.y);
            ctx.lineWidth = 2 / view.zoom;
            ctx.stroke();
            
            const distance = axialDistance(originPlace.coords, targetPlace.coords) * (currentRegion.scale || 1);
            const midX = (originCenter.x + targetCenter.x) / 2;
            const midY = (originCenter.y + targetCenter.y) / 2;
            ctx.setLineDash([]);
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 3 / view.zoom;
            ctx.strokeText(`${distance.toFixed(0)} km`, midX, midY);
            ctx.fillText(`${distance.toFixed(0)} km`, midX, midY);
        });
        
        ctx.restore();
    }

    // --- GESTION DES INTERACTIONS UTILISATEUR ---
    function handleCreateRegion() {
        const name = newRegionNameInput.value.trim();
        if (name) {
            const newRegion = {
                id: Date.now(),
                name: name,
                scale: 1, 
                places: []
            };
            regions.push(newRegion);
            saveData();
            updateRegionSelect();
            regionSelect.value = newRegion.id;
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
            regionSelect.value = '';
            handleRegionChange();
        }
    }
    
    function handleRegionChange() {
        const selectedId = parseInt(regionSelect.value);
        currentRegion = regions.find(r => r.id === selectedId) || null;
        selectedPlaceForDistance = null;
        hoveredPlace = null;
        
        localStorage.setItem(LAST_REGION_KEY, currentRegion ? currentRegion.id : '');

        updateUIForRegion();
    }

    function updateUIForRegion() {
        const hasRegion = !!currentRegion;
        deleteRegionBtn.disabled = !hasRegion;
        generateMapBtn.disabled = !hasRegion;
        if (hasRegion) {
            document.getElementById('right-panel').querySelector('h3').textContent = `Lieux de ${currentRegion.name}`;
        } else {
            document.getElementById('right-panel').querySelector('h3').textContent = 'Aucune région sélectionnée';
        }
        updatePlacesList();
        updateNavLinksState(); 
        drawMap();
    }

    function updatePlacesList() {
        placesList.innerHTML = '';
        if (!currentRegion) {
            placesList.innerHTML = `<li style="padding: 15px; text-align: center;">Créez votre première région pour commencer.</li>`;
            return;
        }
        if (currentRegion.places.length === 0) {
            placesList.innerHTML = `<li style="padding: 15px; text-align: center;">Cette région est vide.<br>Double-cliquez sur la carte pour ajouter un lieu.</li>`;
        }
        
        currentRegion.places
            .sort((a,b) => a.name.localeCompare(b.name))
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
                currentRegion.places = currentRegion.places.filter(p => p.id !== placeId);
                if(selectedPlaceForDistance && selectedPlaceForDistance.id === placeId) selectedPlaceForDistance = null;
                saveData();
                updatePlacesList();
                drawMap();
            }
        }
    }
    
    function openPlaceModal(coords, placeToEdit = null) {
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
             currentRegion.places.push({
                id: Date.now(),
                name: name,
                type: type,
                coords: tempHexCoords
            });
        }
        saveData();
        updatePlacesList();
        drawMap();
        placeModal.close();
    }

    // --- MODIFIÉ : Ajout de l'animation de glissement ---
    function centerOnPlace(place) {
        if (pulseInterval) clearInterval(pulseInterval);
        if (panAnimationId) cancelAnimationFrame(panAnimationId);

        // --- Début de la logique de l'animation de glissement ---
        const startX = view.x;
        const startY = view.y;
        const center = getHexCenter(place.coords.q, place.coords.r);
        const targetX = -center.x * view.zoom + canvas.width / 2;
        const targetY = -center.y * view.zoom + canvas.height / 2;
        
        const duration = 500; // Durée de l'animation en ms
        let startTime = null;

        function panAnimation(currentTime) {
            if (!startTime) startTime = currentTime;
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / duration, 1);
            
            // Fonction d'"easing" pour un mouvement plus naturel (ralentit à la fin)
            const easedProgress = progress * (2 - progress);

            view.x = startX + (targetX - startX) * easedProgress;
            view.y = startY + (targetY - startY) * easedProgress;

            drawMap();

            if (progress < 1) {
                panAnimationId = requestAnimationFrame(panAnimation);
            } else {
                panAnimationId = null;
            }
        }
        panAnimationId = requestAnimationFrame(panAnimation);
        // --- Fin de la logique de l'animation de glissement ---

        // Démarre l'animation de pulsation en parallèle
        pulsingPlaceId = place.id;
        pulseInterval = setInterval(drawMap, 16);

        setTimeout(() => {
            clearInterval(pulseInterval);
            pulseInterval = null;
            pulsingPlaceId = null;
            drawMap(); 
        }, 2500);
    }


    function getPlaceAt(hexCoords) {
        if (!currentRegion) return null;
        return currentRegion.places.find(p => p.coords.q === hexCoords.q && p.coords.r === hexCoords.r);
    }

    function handleGenerateMap() {
        if (!currentRegion) return;
        if(currentRegion.places.length > 0 && !confirm("Cette action va supprimer tous les lieux existants dans cette région. Continuer ?")) {
            return;
        }
        
        currentRegion.places = [];
        const count = parseInt(randomPlaceCountInput.value);
        const occupied = new Set();
        const radius = Math.ceil(Math.sqrt(count)) + 2;

        for(let i=0; i<count; i++) {
            let q, r;
            do {
                q = Math.floor(Math.random() * (radius * 2 + 1)) - radius;
                r = Math.floor(Math.random() * (radius * 2 + 1)) - radius;
            } while (occupied.has(`${q},${r}`));
            
            occupied.add(`${q},${r}`);
            const name = RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)];
            const type = Object.keys(PLACE_TYPES)[Math.floor(Math.random() * Object.keys(PLACE_TYPES).length)];
            
             currentRegion.places.push({
                id: Date.now() + i,
                name: `${name} ${i+1}`,
                type: type,
                coords: {q, r}
            });
        }
        
        saveData();
        updatePlacesList();
        drawMap();
    }
    
    // NOUVELLE FONCTION : Vérifie si tous les lieux de la région ont été validés à l'étape 2
    function checkAllPlacesValidated(region) {
        if (!region || !region.places || region.places.length === 0) {
            return false;
        }
        // La méthode .every() vérifie si TOUS les éléments d'un tableau passent un test.
        // Ici, on vérifie si chaque lieu a une configuration et si cette config est marquée comme valide.
        return region.places.every(place => place.config && place.config.isValidated === true);
    }

    // FONCTION MISE A JOUR : Gère l'état actif/inactif des liens de navigation
    function updateNavLinksState() {
        const isStep2Ready = currentRegion && currentRegion.places.length > 0;
        const isStep3Ready = checkAllPlacesValidated(currentRegion);

        // Gère le lien vers l'Étape 2
        if (isStep2Ready) {
            navStep2.classList.remove('nav-disabled');
        } else {
            navStep2.classList.add('nav-disabled');
        }
        
        // Gère le lien vers l'Étape 3 basé sur la validation de tous les lieux
        if (isStep3Ready) {
            navStep3.classList.remove('nav-disabled');
        } else {
            navStep3.classList.add('nav-disabled');
        }
    }

    // --- EVENT LISTENERS ---
    function setupEventListeners() {
        window.addEventListener('resize', resizeCanvas);
        createRegionBtn.addEventListener('click', handleCreateRegion);
        deleteRegionBtn.addEventListener('click', handleDeleteRegion);
        regionSelect.addEventListener('change', handleRegionChange);
        generateMapBtn.addEventListener('click', handleGenerateMap);
        placesList.addEventListener('click', handlePlaceListClick);
        placeForm.addEventListener('submit', handlePlaceFormSubmit);
        cancelPlaceBtn.addEventListener('click', () => placeModal.close());
        
        floatingMenu.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link && link.classList.contains('nav-disabled')) {
                e.preventDefault();
                if (link.id === 'nav-step-3') {
                     alert("Veuillez d'abord configurer et valider TOUS les lieux dans l'Étape 2 pour accéder à la simulation.");
                } else {
                     alert("Veuillez d'abord créer une région et y ajouter au moins un lieu pour accéder à cette étape.");
                }
            }
        });
        
        canvas.addEventListener('mousedown', (e) => {
            // Arrête toutes les animations en cours si l'utilisateur interagit
            if (pulseInterval) clearInterval(pulseInterval);
            if (panAnimationId) cancelAnimationFrame(panAnimationId);
            pulseInterval = null;
            panAnimationId = null;
            pulsingPlaceId = null;

            if (e.button !== 0) return;
            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            lastMouse = { x: mouseX, y: mouseY };
            
            const hexCoords = getPixelToHex(mouseX, mouseY);
            const place = getPlaceAt(hexCoords);

            if (place) {
                isDraggingPlace = true;
                draggedPlace = place;
                selectedPlaceForDistance = place;
            } else {
                isPanning = true;
                canvas.classList.add('is-dragging');
            }
        });

        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
             
            if (isPanning) {
                view.x += mouseX - lastMouse.x;
                view.y += mouseY - lastMouse.y;
                drawMap();
            } else if (isDraggingPlace) {
                lastMouse = { x: mouseX, y: mouseY };
                drawMap();
            } else {
                 const hexCoords = getPixelToHex(mouseX, mouseY);
                 const place = getPlaceAt(hexCoords);
                 
                 let needsRedraw = false;
                 if (hoveredPlace !== place) {
                     hoveredPlace = place;
                     needsRedraw = true;
                 }

                 const currentHex = getPixelToHex(mouseX,mouseY);
                 if(!hoveredHex || hoveredHex.q !== currentHex.q || hoveredHex.r !== currentHex.r) {
                     hoveredHex = currentHex;
                     needsRedraw = true;
                 }
                 
                 if(needsRedraw) drawMap();
            }
            
            if (!isDraggingPlace) {
                lastMouse = { x: mouseX, y: mouseY };
            }
        });

        window.addEventListener('mouseup', (e) => {
            if (isPanning) {
                isPanning = false;
                canvas.classList.remove('is-dragging');
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
             if (!currentRegion) {
                 alert("Veuillez créer ou sélectionner une région avant d'ajouter un lieu.");
                 return;
             }
             const rect = canvas.getBoundingClientRect();
             const mouseX = e.clientX - rect.left;
             const mouseY = e.clientY - rect.top;
             const hexCoords = getPixelToHex(mouseX, mouseY);
             if (!getPlaceAt(hexCoords)) {
                 openPlaceModal(hexCoords);
             }
        });
        
        canvas.addEventListener('click', (e) => {
            setTimeout(() => {
                if (isDraggingPlace || isPanning) return;
                
                const rect = canvas.getBoundingClientRect();
                const mouseX = e.clientX - rect.left;
                const mouseY = e.clientY - rect.top;
                const hexCoords = getPixelToHex(mouseX, mouseY);
                const place = getPlaceAt(hexCoords);
                
                if (place) {
                     if (selectedPlaceForDistance && selectedPlaceForDistance.id === place.id) {
                        selectedPlaceForDistance = null; 
                     } else {
                        selectedPlaceForDistance = place;
                     }
                } else {
                    selectedPlaceForDistance = null; 
                }
                drawMap();
            }, 50); 
        });

        canvas.addEventListener('mouseleave', () => {
            if(hoveredHex) {
                hoveredHex = null;
                drawMap();
            }
        });
    }
    
    // --- INITIALISATION ---
    async function init() {
        await preloadAssets();
        loadData(); 
        handleRegionChange(); 
        resizeCanvas();
        setupEventListeners();
        view.x = canvas.width / 2;
        view.y = canvas.height / 2;
        view.zoom = 0.15;
        drawMap();
        updateNavLinksState(); 
    }

    init();
});