document.addEventListener('DOMContentLoaded', () => {
    // Clés de stockage local
    const CUSTOM_BUILDINGS_KEY = 'ecoSimRPG_custom_buildings';
    const CUSTOM_TAG_DEFINITIONS_KEY = 'ecoSimRPG_custom_tag_definitions';

    // ... (le reste des définitions de TAG_CATEGORIES est inchangé) ...
    const TAG_CATEGORIES = {
        '🍽️ Nourriture & Boissons': ['grain', 'légumes', 'fruits', 'raisins', 'miel', 'lait', 'gibier', 'poisson', 'champignons_communs', 'champignons_rares', 'farine', 'viande', 'pain_patisseries', 'bière', 'hydromel', 'vin', 'fromage', 'alcools_fins', 'baies_sauvages', 'fruits_exotiques', 'gastronomie_luxe', 'alcools_legendaires', 'gestion_nourriture', 'reserve_strategique_nourriture', 'commerce_alimentaire'],
        '🌿 Matériaux Bruts & Nature': ['cire', 'laine_brute', 'bétail', 'bois_brut', 'peaux_brutes', 'fourrures', 'herbes_communes', 'herbes_rares', 'minerai_de_fer', 'charbon', 'pierre', 'or_brut', 'sable_de_verre', 'argent_brut', 'pierres_precieuses', 'fleurs', 'fleurs_rares', 'betes_exotiques', 'betes_magiques'],
        '🧱 Matériaux Transformés': ['bois_transformé', 'tissu', 'cuir', 'pieces_metalliques', 'pierre_taillee', 'fourrures_traitees', 'or_raffine', 'argent_raffine', 'pierres_taillees', 'verre', 'acier_special', 'papier', 'encre'],
        '⚔️ Armement & Équipement': ['outils_simples', 'armes_simples', 'armes_armures_qualite', 'equipement_de_siege', 'navires', 'navires_marchands', 'navires_de_guerre', 'commandement_militaire', 'armes_armures_prestige', 'defense_magique', 'equipement_optique'],
        '👑 Biens de Luxe & Habillement': ['vêtements_simples', 'vêtements_qualite', 'vêtements_luxe', 'bijoux_simples', 'orfevrerie', 'bijoux_luxe', 'tabac', 'verrerie_art', 'vitraux', 'vetements_royaux', 'orfevrerie_maitre'],
        '🎓 Savoir & Éducation': ['savoir_écrit', 'savoir_arcanique', 'savoir_avance', 'savoir_astronomique', 'savoir_universel', 'savoir_interdit', 'recherche_fondamentale', 'recherche_medicale', 'livres', 'parchemins_imprimes', 'lois_imprimées', 'propagande', 'artefacts_magiques', 'parchemins_puissants', 'artefacts_rares', 'cartographie_precise', 'navigation_astronomique', 'exploration', 'heraldique'],
        '🏛️ Services & Gouvernance': ['administration', 'sécurité', 'justice', 'contrats', 'commerce', 'transport_courrier', 'hébergement', 'divertissement', 'divertissement_qualite', 'divertissement_luxe', 'soin', 'finance_publique', 'finance_privee', 'commerce_maritime', 'administration_royale', 'haute_politique', 'diplomatie', 'justice_supreme', 'finance_royale', 'monnaie', 'gestion_noblesse', 'conseil_arcanique_royal', 'haute_medecine', 'contre_espionnage', 'renseignement', 'haute_finance', 'investissement_speculatif', 'bourse', 'divertissement_prestige'],
        '🧪 Potions & Alchimie': ['remèdes_simples', 'potions_simples', 'potions_complexes', 'savoir_alchimique']
    };


    // Sélecteurs DOM
    const editorView = document.getElementById('editor-view');
    const customBuildingsList = document.getElementById('custom-buildings-list');
    const newBuildingBtn = document.getElementById('new-building-btn');
    const buildingForm = document.getElementById('building-form');
    const welcomeEditor = document.getElementById('welcome-editor');

    let customBuildings = [];
    let currentlyEditingBuildingId = null;
    let activeFilter = 'All';
    let jobCounter = 0;
    
    let customTagDefinitions = {};
    let sortedNativeTags = [];
    let sortedCustomTags = [];

    // --- LOGIQUE DE SAUVEGARDE PASSIVE (Refactorisation) ---

    // NOUVELLE FONCTION : Centralise la logique de sauvegarde pour le bâtiment en cours d'édition.
    function saveCurrentBuildingData() {
        if (!currentlyEditingBuildingId || buildingForm.classList.contains('hidden')) {
            // Ne pas sauvegarder si aucun bâtiment n'est sélectionné ou si le formulaire est caché
            return;
        }

        const form = document.getElementById('building-form');
        const formData = new FormData(form);
        const providedTags = Array.from(form.querySelectorAll('input[name="provides-tags"]:checked')).map(cb => cb.value);

        const buildingData = {
            id: currentlyEditingBuildingId, // Utilise l'ID existant
            name: formData.get('building-name'),
            description: formData.get('description'),
            type: formData.get('place-type'),
            category: formData.get('category'),
            providesTags: providedTags,
            requiresTags: {},
            emplois: []
        };
        
        const requiredTagsNames = formData.getAll('req-tag-name');
        const requiredTagsDist = formData.getAll('req-tag-dist');
        requiredTagsNames.forEach((name, index) => {
            if (name) {
                buildingData.requiresTags[name] = { distance: parseInt(requiredTagsDist[index] || 0) };
            }
        });
        
        form.querySelectorAll('.job-fieldset').forEach(fieldset => {
            const index = fieldset.dataset.jobIndex;
            const jobTitle = formData.get(`job-titre-${index}`);
            if (!jobTitle) return;

            const allowedRaces = Array.from(fieldset.querySelectorAll(`input[name="job-races-${index}"]:checked`)).map(cb => cb.value);
            const job = {
                titre: jobTitle,
                tier: parseInt(formData.get(`job-tier-${index}`) || 3),
                postes: parseInt(formData.get(`job-postes-${index}`) || 1),
                ageMin: parseInt(formData.get(`job-age-min-${index}`)) || null,
                ageMax: parseInt(formData.get(`job-age-max-${index}`)) || null,
                salaire: { totalEnCuivre: parseInt(formData.get(`job-salaire-${index}`) || 30) },
                prerequis: { prestige: parseInt(formData.get(`job-prestige-${index}`) || 0) },
                gainsMensuels: {
                    prestige: parseInt(formData.get(`job-gain-prestige-${index}`) || 1),
                    stats: {
                        intelligence: parseFloat(formData.get(`job-stat-int-${index}`) || 0),
                        force: parseFloat(formData.get(`job-stat-for-${index}`) || 0),
                        constitution: parseFloat(formData.get(`job-stat-con-${index}`) || 0),
                        dexterite: parseFloat(formData.get(`job-stat-dex-${index}`) || 0),
                        sagesse: parseFloat(formData.get(`job-stat-sag-${index}`) || 0),
                        charisme: parseFloat(formData.get(`job-stat-cha-${index}`) || 0),
                    }
                },
                allowedRaces: allowedRaces.length > 0 ? allowedRaces : 'mixte',
                gender: formData.get(`job-gender-${index}`) || 'unisex'
            };
            buildingData.emplois.push(job);
        });

        const buildingIndex = customBuildings.findIndex(b => b.id === currentlyEditingBuildingId);
        if (buildingIndex !== -1) {
            customBuildings[buildingIndex] = buildingData;
            saveCustomBuildings(); // Sauvegarde dans le localStorage
        }
    }


    /**
     * ==========================================================
     * ==            FONCTION MODIFIÉE handleFormSubmit        ==
     * ==========================================================
     */
    function handleFormSubmit(e) {
        e.preventDefault();
        const form = document.getElementById('building-form');
        const formData = new FormData(form);
        const buildingName = formData.get('building-name');
    
        // CAS 1 : C'est un NOUVEAU bâtiment qui n'a pas encore d'ID. On le "crée".
        if (!currentlyEditingBuildingId) {
            if (!buildingName.trim()) {
                displayTemporaryMessage("Le nom du bâtiment est obligatoire pour le créer.", "error");
                return;
            }
    
            // Création de l'objet bâtiment de base
            const newBuilding = {
                id: `custom_${Date.now()}`,
                name: buildingName,
                type: formData.get('place-type') || 'Hameau', // Valeur par défaut
                category: formData.get('category') || 'Production', // Valeur par défaut
                description: '',
                providesTags: [],
                requiresTags: {},
                emplois: []
            };
            
            customBuildings.push(newBuilding);
            saveCustomBuildings(); // Sauvegarde dans le localStorage
            
            currentlyEditingBuildingId = newBuilding.id; // On définit le nouveau bâtiment comme celui en cours d'édition
    
            renderBuildingList(); // Met à jour la liste de gauche
            renderBuildingForm(newBuilding); // AFFICHE LE FORMULAIRE COMPLET ET DÉVERROUILLÉ
    
            displayTemporaryMessage(`Bâtiment "${buildingName}" créé ! Vous pouvez maintenant l'éditer.`, "success");
    
        } 
        // CAS 2 : Le bâtiment existe déjà, on fait une sauvegarde normale.
        else {
            saveCurrentBuildingData(); // Cette fonction contient déjà toute la logique de sauvegarde
            displayTemporaryMessage(`Bâtiment "${buildingName}" sauvegardé !`, "success");
        }
    }
    
    function loadCustomTagDefinitions() {
        const data = localStorage.getItem(CUSTOM_TAG_DEFINITIONS_KEY);
        customTagDefinitions = data ? JSON.parse(data) : {};
    }

    function loadCustomBuildings() {
        const storedBuildings = localStorage.getItem(CUSTOM_BUILDINGS_KEY);
        customBuildings = storedBuildings ? JSON.parse(storedBuildings) : [];
    }


    function saveCustomBuildings() {
        localStorage.setItem(CUSTOM_BUILDINGS_KEY, JSON.stringify(customBuildings));
    }
    
    // ==========================================================
    // ==         NOUVELLE FONCTION renderBuildingList         ==
    // ==========================================================
    function renderBuildingList() {
        customBuildingsList.innerHTML = ''; // On vide la liste comme avant
    
        // 1. On filtre les bâtiments selon le filtre actif (Hameau, Village, etc.)
        const buildingsToRender = customBuildings.filter(building => activeFilter === 'All' || building.type === activeFilter);
    
        // 2. On groupe les bâtiments filtrés par leur catégorie
        const groupedBuildings = buildingsToRender.reduce((acc, building) => {
            // On utilise une catégorie par défaut si un bâtiment n'en a pas
            const category = building.category || 'Sans catégorie'; 
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(building);
            return acc;
        }, {});
    
        // 3. On définit l'ordre d'affichage souhaité pour les catégories
        const categoryOrder = ['Administration', 'Production', 'Indépendant', 'Agricole', 'Chasse/Nature', 'Sans catégorie'];
        
        // On trie les catégories présentes dans la liste selon notre ordre défini
        const sortedCategories = Object.keys(groupedBuildings).sort((a, b) => {
            const indexA = categoryOrder.indexOf(a);
            const indexB = categoryOrder.indexOf(b);
            // Gère les catégories non définies en les plaçant à la fin, triées alphabétiquement
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            return indexA - indexB;
        });
    
        // 4. On parcourt chaque catégorie triée pour générer le HTML
        sortedCategories.forEach(category => {
            // On crée et ajoute le séparateur pour la catégorie
            const header = document.createElement('li');
            header.classList.add('category-separator');
            header.textContent = category;
            customBuildingsList.appendChild(header);
    
            // On récupère les bâtiments de la catégorie et on les trie par nom
            const buildingsInCategory = groupedBuildings[category];
            buildingsInCategory.sort((a, b) => a.name.localeCompare(b.name));
    
            // On génère la liste des bâtiments pour cette catégorie
            buildingsInCategory.forEach(building => {
                const li = document.createElement('li');
                li.innerHTML = `<span>${building.name}</span><span class="building-list-type-badge">${building.type}</span>`;
                li.dataset.id = building.id;
                if (building.id === currentlyEditingBuildingId) {
                    li.classList.add('active');
                }
                customBuildingsList.appendChild(li);
            });
        });
    }

    function setupFilterListeners() {
        const filterContainer = document.getElementById('building-filters');
        filterContainer.addEventListener('click', (e) => {
            if (e.target.matches('.tab-btn')) {
                activeFilter = e.target.dataset.filter;
                filterContainer.querySelector('.tab-btn.active').classList.remove('active');
                e.target.classList.add('active');
                renderBuildingList();
            }
        });
    }

    function handleNewBuilding() {
        currentlyEditingBuildingId = null; // Important: on passe en mode création
        renderBuildingForm({});
    }

    function handleSelectBuilding(e) {
        // On s'assure de ne pas réagir au clic sur un séparateur
        const li = e.target.closest('li:not(.category-separator)');
        if (li) {
            const buildingId = li.dataset.id;
            currentlyEditingBuildingId = buildingId;
            const buildingData = customBuildings.find(b => b.id === buildingId);
            renderBuildingForm(buildingData); // Affiche le formulaire avec les données
            renderBuildingList(); // Met à jour la classe 'active'
        }
    }
    
    function handleDeleteBuilding() {
        if (!currentlyEditingBuildingId) return;
        if (confirm(`Êtes-vous sûr de vouloir supprimer le bâtiment "${customBuildings.find(b => b.id === currentlyEditingBuildingId)?.name}" ?`)) {
            customBuildings = customBuildings.filter(b => b.id !== currentlyEditingBuildingId);
            saveCustomBuildings();
            currentlyEditingBuildingId = null;
            renderBuildingList();
            renderBuildingForm(); 
        }
    }

    function handleCopyBuilding() {
        if (!currentlyEditingBuildingId) {
            displayTemporaryMessage("Sélectionnez un bâtiment avant de le copier.", "error");
            return;
        }
        const sourceBuilding = customBuildings.find(b => b.id === currentlyEditingBuildingId);
        if (!sourceBuilding) return;
        const targetType = document.getElementById('copy-target-type').value;
        const newBuilding = JSON.parse(JSON.stringify(sourceBuilding));
        newBuilding.id = `custom_${Date.now()}`;
        newBuilding.name += " (Copie)";
        newBuilding.type = targetType;
        customBuildings.push(newBuilding);
        saveCustomBuildings();
        currentlyEditingBuildingId = newBuilding.id;
        renderBuildingList();
        renderBuildingForm(newBuilding);
        displayTemporaryMessage(`Copié vers "${targetType}".`, "success");
    }

    function displayTemporaryMessage(message, type = 'success') {
        const messageContainer = document.getElementById('form-feedback-message');
        if (!messageContainer) return;
        messageContainer.textContent = message;
        messageContainer.className = `form-feedback ${type}`;
        messageContainer.style.opacity = '1';
        setTimeout(() => {
            messageContainer.style.opacity = '0';
        }, 3000);
    }

    /**
     * ==========================================================
     * ==         FONCTION MODIFIÉE renderBuildingForm         ==
     * ==========================================================
     */
    function renderBuildingForm(building = null) {
        if (!building) {
            buildingForm.classList.add('hidden');
            welcomeEditor.classList.remove('hidden');
            if(!currentlyEditingBuildingId) {
                 buildingForm.innerHTML = ''; 
            }
            return;
        }
    
        welcomeEditor.classList.add('hidden');
        buildingForm.classList.remove('hidden');
    
        // NOUVELLE LOGIQUE : Détecter si c'est un nouveau bâtiment non sauvegardé
        const isNewUnsavedBuilding = !building.id;
        
        // Le reste de votre code de préparation des tags reste ici...
        const groupedNativeTags = { 'Autres': [] };
        const categoryOrder = Object.keys(TAG_CATEGORIES);
        categoryOrder.forEach(cat => groupedNativeTags[cat] = []);
        const tagToCategory = {};
        for (const category in TAG_CATEGORIES) {
            TAG_CATEGORIES[category].forEach(tag => { tagToCategory[tag] = category; });
        }
        sortedNativeTags.forEach(tag => {
            const category = tagToCategory[tag] || 'Autres';
            if (!groupedNativeTags[category]) groupedNativeTags[category] = [];
            groupedNativeTags[category].push(tag);
        });
        const finalCategoryOrder = categoryOrder.concat(['Autres']).filter(cat => groupedNativeTags[cat] && groupedNativeTags[cat].length > 0);
        const nativeTagAccordionsHTML = finalCategoryOrder.map(category => {
            const tagsInCategory = groupedNativeTags[category];
            const initialCheckedCount = tagsInCategory.filter(tag => building?.providesTags?.includes(tag)).length;
            const checkboxesHTML = tagsInCategory.map(tag => `<div class="checkbox-item"><input type="checkbox" id="provides-tag-cb-${tag.replace(/\s+/g, '-')}" name="provides-tags" value="${tag}" ${building?.providesTags?.includes(tag) ? 'checked' : ''}><label for="provides-tag-cb-${tag.replace(/\s+/g, '-')}">${tag}</label></div>`).join('');
            return `<details class="tag-accordion"><summary class="tag-accordion-header">${category} <span class="tag-count">${initialCheckedCount}/${tagsInCategory.length}</span></summary><div class="tag-accordion-content">${checkboxesHTML}</div></details>`;
        }).join('');
    
        let customTagAccordionsHTML;
        const customCategoriesPaths = Object.keys(customTagDefinitions);
        if (customCategoriesPaths.length === 0) {
            customTagAccordionsHTML = `<p class="empty-tab-message">Aucun tag personnalisé trouvé. Vous pouvez en créer dans le "Livre (Economie)".</p>`;
        } else {
            const customTagTree = buildCustomTagTree(customCategoriesPaths);
            customTagAccordionsHTML = renderAccordionTreeHTML(customTagTree, building, customTagDefinitions);
    
            if (customTagAccordionsHTML.trim() === '') {
                 customTagAccordionsHTML = `<p class="empty-tab-message">Aucune catégorie personnalisée ne contient de tags.</p>`;
            }
        }
    
        buildingForm.innerHTML = `
            <div class="form-actions">
                <div class="form-actions-group" style="flex-grow: 1; align-items: center; gap: 15px;">
                    <label for="building-name" style="margin-bottom:0; font-weight:bold; white-space: nowrap;">Nom du Bâtiment :</label>
                    <input type="text" id="building-name" name="building-name" value="${building?.name || ''}" required style="flex-grow: 1; max-width: 500px;" placeholder="Entrez un nom pour commencer...">
                    
                    <button type="submit" class="btn-primary">${isNewUnsavedBuilding ? 'Créer le Bâtiment' : 'Sauvegarder le Bâtiment'}</button>
                </div>
                <div id="form-feedback-message" class="form-feedback" style="text-align: center;"></div>
    
                <div class="form-actions-group right" style="${isNewUnsavedBuilding ? 'display: none;' : ''}">
                    <button type="button" id="delete-building-btn" class="btn-delete">Supprimer</button>
                    <div class="copy-action-wrapper">
                         <label>Copier le bâtiment vers :</label>
                         <select id="copy-target-type">
                            <option value="Hameau">Hameau</option><option value="Village">Village</option><option value="Bourg">Bourg</option><option value="Ville">Ville</option><option value="Capitale">Capitale</option>
                         </select>
                         <button type="button" id="copy-building-btn" class="btn-secondary">Copier</button>
                    </div>
                </div>
            </div>
    
            <div id="main-form-content" class="${isNewUnsavedBuilding ? 'is-disabled' : ''}">
                
                ${isNewUnsavedBuilding ? `
                    <div class="disabled-overlay">
                        <div class="disabled-overlay-message">
                            Veuillez nommer et créer le bâtiment pour débloquer l'édition complète.
                        </div>
                    </div>
                ` : ''}
    
                <div class="form-section">
                    <h4>Informations Générales</h4>
                    <div class="form-grid" style="grid-template-columns: 1fr 1fr;">
                        <div class="form-group"><label for="place-type">Disponibilité</label><select id="place-type" name="place-type"><option value="Hameau" ${building?.type === 'Hameau' ? 'selected' : ''}>Hameau</option><option value="Village" ${building?.type === 'Village' ? 'selected' : ''}>Village</option><option value="Bourg" ${building?.type === 'Bourg' ? 'selected' : ''}>Bourg</option><option value="Ville" ${building?.type === 'Ville' ? 'selected' : ''}>Ville</option><option value="Capitale" ${building?.type === 'Capitale' ? 'selected' : ''}>Capitale</option></select></div>
                        <div class="form-group"><label for="category">Catégorie</label><select id="category" name="category"><option value="Administration" ${building?.category === 'Administration' ? 'selected' : ''}>Administration</option><option value="Production" ${building?.category === 'Production' ? 'selected' : ''}>Production</option><option value="Indépendant" ${building?.category === 'Indépendant' ? 'selected' : ''}>Indépendant</option><option value="Agricole" ${building?.category === 'Agricole' ? 'selected' : ''}>Agricole</option><option value="Chasse/Nature" ${building?.category === 'Chasse/Nature' ? 'selected' : ''}>Chasse/Nature</option></select></div>
                    </div>
                    <div class="form-group" style="margin-top: 20px;"><label for="description">Description</label><textarea id="description" name="description">${building?.description || ''}</textarea></div>
                </div>
                
                <div class="form-section">
                    <h4>Économie (Tags) <span class="tooltip"><span class="tooltip-icon">?</span><span class="tooltip-text">La liaison des bâtiments par les tags influe sur la logique de création des lieux et les relations sociales des PNJ simulés (cercle social).</span></span></h4>
                    <div class="form-grid-dense" style="grid-template-columns: 1fr 1fr; gap: 40px;">
                        <div>
                            <div id="provided-tags-summary" class="tags-summary"></div>
                            <div class="tab-container">
                                <nav class="tab-nav">
                                    <button type="button" class="tab-link active" data-tab="fournis-natif">Tags Fournis (Natif)</button>
                                    <button type="button" class="tab-link" data-tab="fournis-perso">Tags Fournis (Personnalisé)</button>
                                </nav>
                                <div id="fournis-natif" class="tab-content active"><div class="tags-accordion-container">${nativeTagAccordionsHTML}</div></div>
                                <div id="fournis-perso" class="tab-content"><div class="tags-accordion-container">${customTagAccordionsHTML}</div></div>
                            </div>
                        </div>
                        <div>
                            <div id="required-tags-summary" class="tags-summary"></div>
                            <div class="tab-container">
                                 <nav class="tab-nav">
                                    <button type="button" class="tab-link active" data-tab="requis-natif">Tags Requis (Natif)</button>
                                    <button type="button" class="tab-link" data-tab="requis-perso">Tags Requis (Personnalisé)</button>
                                </nav>
                                <div id="requis-natif" class="tab-content active">
                                    <label>Besoins du bâtiment (natifs) :</label>
                                    <div id="requires-tags-container-natif"></div>
                                    <button type="button" id="add-req-tag-btn-natif" class="btn-secondary" style="margin-top: 10px;">+ Ajouter Prérequis</button>
                                </div>
                                 <div id="requis-perso" class="tab-content">
                                    <label>Besoins du bâtiment (personnalisés) :</label>
                                    <div id="requires-tags-container-perso"></div>
                                    <button type="button" id="add-req-tag-btn-perso" class="btn-secondary" style="margin-top: 10px;">+ Ajouter Prérequis</button>
                                 </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="form-section">
                    <h4>Emplois</h4>
                    <div id="jobs-container"></div>
                    <button type="button" id="add-job-btn" class="btn-secondary" style="margin-top: 10px;">+ Ajouter un Emploi</button>
                </div>
            </div> `;
        
        // Si ce n'est pas un nouveau bâtiment, on attache les listeners et on remplit les champs
        if (!isNewUnsavedBuilding) {
            jobCounter = 0;
            if (building?.requiresTags) {
                Object.entries(building.requiresTags).forEach(([tagName, data]) => {
                    if (sortedNativeTags.includes(tagName)) addRequiredNativeTagField(tagName, data.distance);
                    else addRequiredCustomTagField(tagName, data.distance);
                });
            }
            if (building?.emplois) {
                building.emplois.forEach(addJobField);
            }
    
            document.getElementById('add-req-tag-btn-natif').addEventListener('click', () => addRequiredNativeTagField());
            document.getElementById('add-req-tag-btn-perso').addEventListener('click', () => addRequiredCustomTagField());
            document.getElementById('add-job-btn').addEventListener('click', () => addJobField());
            document.getElementById('delete-building-btn').addEventListener('click', handleDeleteBuilding);
            document.getElementById('copy-building-btn').addEventListener('click', handleCopyBuilding);
            
            buildingForm.removeEventListener('change', handleFormChange);
            buildingForm.addEventListener('change', handleFormChange);
            
            buildingForm.removeEventListener('click', handleFormClicks);
            buildingForm.addEventListener('click', handleFormClicks); 
            
            updateProvidedTagsSummary();
            updateRequiredTagsSummary();
        }
        
        // On attache toujours le listener de soumission du formulaire
        buildingForm.removeEventListener('submit', handleFormSubmit);
        buildingForm.addEventListener('submit', handleFormSubmit);
    }

    function handleFormChange(e) {
        if (e.target.matches('input[name="provides-tags"]')) {
            updateTagAccordionCount(e.target);
        }
        updateProvidedTagsSummary();
        updateRequiredTagsSummary();
        
        // La sauvegarde passive se fait ici, elle met à jour l'objet JS
        saveCurrentBuildingData(); 
    
        // Si la catégorie a été changée, on redessine la liste pour refléter le changement
        if (e.target.id === 'category') {
            renderBuildingList();
        }
    }

    /**
     * NOUVELLE FONCTION : Synchronise les onglets "Natif" et "Personnalisé".
     * Quand un onglet est cliqué, tous les onglets du même type (natif/perso)
     * deviennent actifs sur toute la page.
     * @param {HTMLElement} clickedTabButton Le bouton d'onglet qui a été cliqué.
     */
    function synchronizeTabs(clickedTabButton) {
        const form = clickedTabButton.closest('#building-form');
        if (!form) return;

        // 1. Déterminer si l'onglet cliqué est de type "natif" ou "perso".
        const tabName = clickedTabButton.dataset.tab;
        const targetType = tabName.includes('natif') ? 'natif' : 'perso';

        // 2. Parcourir tous les liens d'onglets dans le formulaire.
        form.querySelectorAll('.tab-link').forEach(link => {
            if (link.dataset.tab.includes(targetType)) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        // 3. Parcourir tous les contenus d'onglets dans le formulaire.
        form.querySelectorAll('.tab-content').forEach(content => {
            if (content.id.includes(targetType)) {
                content.classList.add('active');
            } else {
                content.classList.remove('active');
            }
        });
    }

    function handleFormClicks(e) {
        if (e.target.classList.contains('remove-btn')) {
            e.target.closest('fieldset').remove();
            updateRequiredTagsSummary(); 
            saveCurrentBuildingData();
        }
        if (e.target.classList.contains('accordion-trigger')) {
            const fieldset = e.target.closest('.job-accordion');
            if (fieldset) fieldset.classList.toggle('is-open');
        }
        if (e.target.classList.contains('tab-link')) {
            synchronizeTabs(e.target);
        }
    }

    function addJobField(job = null) {
        const container = document.getElementById('jobs-container');
        const index = jobCounter++;
        const fieldset = document.createElement('fieldset');
        fieldset.className = 'dynamic-fieldset job-fieldset job-accordion';
        fieldset.dataset.jobIndex = index;

        const allRaces = (window.EcoSimData && window.EcoSimData.racesData) ? Object.keys(window.EcoSimData.racesData.races) : [];
        const raceCheckboxes = allRaces.map(race => {
            let isSelected = job?.allowedRaces?.includes(race) || !job?.allowedRaces || job?.allowedRaces === 'mixte';
            const checkboxId = `job-${index}-race-cb-${race}`;
            return `<div class="checkbox-item"><input type="checkbox" id="${checkboxId}" name="job-races-${index}" value="${race}" ${isSelected ? 'checked' : ''}><label for="${checkboxId}">${race}</label></div>`;
        }).join('');
        const genderValue = job?.gender || 'unisex';
        const initialTitle = job?.titre || '';
        const legendText = initialTitle || `Nouvel Emploi ${index + 1}`;
        fieldset.innerHTML = `
            <legend class="accordion-trigger">${legendText}</legend>
            <button type="button" class="remove-btn">&times;</button>
            <div class="accordion-content">
                <div class="form-grid-dense">
                    <div class="form-group" style="grid-column: 1 / span 4;"><label>Titre de l'emploi</label><input type="text" name="job-titre-${index}" value="${initialTitle}" placeholder="Ex: Forgeron Apprenti"></div>
                    <div class="form-group" style="grid-column: 5 / span 2;"><label>Postes</label><input type="number" name="job-postes-${index}" value="${job?.postes || 1}" min="1"></div>
                    <div class="form-group" style="grid-column: 7 / span 2;"><label>Tier</label><input type="number" name="job-tier-${index}" value="${job?.tier || 3}" min="1" max="5"></div>
                    <div class="form-group"><label>Âge Min</label><input type="number" name="job-age-min-${index}" value="${job?.ageMin || ''}" placeholder="16"></div>
                    <div class="form-group"><label>Âge Max</label><input type="number" name="job-age-max-${index}" value="${job?.ageMax || ''}" placeholder="60"></div>
                    <div class="form-group" style="grid-column: 3 / span 3;"><label>Salaire (PC)</label><input type="number" name="job-salaire-${index}" value="${job?.salaire?.totalEnCuivre || 30}"></div>
                    <div class="form-group" style="grid-column: 6 / span 3;"><label>Genre</label><select name="job-gender-${index}"><option value="unisex" ${genderValue === 'unisex' ? 'selected' : ''}>Mixte</option><option value="homme" ${genderValue === 'homme' ? 'selected' : ''}>Homme</option><option value="femme" ${genderValue === 'femme' ? 'selected' : ''}>Femme</option></select></div>
                    <div class="form-group" style="grid-column: 1 / span 5;"><label>Races Autorisées</label><div class="checkbox-container small">${raceCheckboxes}</div></div>
                    <div class="form-group" style="grid-column: 6 / span 3; display: flex; flex-direction: column; gap: 10px; justify-content: center;">
                        <div><label>Prestige Requis</label><input type="number" name="job-prestige-${index}" value="${job?.prerequis?.prestige || 0}"></div>
                        <div><label>Gain Prestige / mois</label><input type="number" name="job-gain-prestige-${index}" value="${job?.gainsMensuels?.prestige || 1}"></div>
                    </div>
                    <div class="form-group" style="grid-column: 1 / -1;"><label class="centered-label">Gains de Stats / mois</label><div class="stats-grid">
                        <div class="form-group"><label>Int</label><input type="number" step="0.1" name="job-stat-int-${index}" value="${job?.gainsMensuels?.stats?.intelligence || 0}"></div>
                        <div class="form-group"><label>For</label><input type="number" step="0.1" name="job-stat-for-${index}" value="${job?.gainsMensuels?.stats?.force || 0}"></div>
                        <div class="form-group"><label>Con</label><input type="number" step="0.1" name="job-stat-con-${index}" value="${job?.gainsMensuels?.stats?.constitution || 0}"></div>
                        <div class="form-group"><label>Dex</label><input type="number" step="0.1" name="job-stat-dex-${index}" value="${job?.gainsMensuels?.stats?.dexterite || 0}"></div>
                        <div class="form-group"><label>Sag</label><input type="number" step="0.1" name="job-stat-sag-${index}" value="${job?.gainsMensuels?.stats?.sagesse || 0}"></div>
                        <div class="form-group"><label>Cha</label><input type="number" step="0.1" name="job-stat-cha-${index}" value="${job?.gainsMensuels?.stats?.charisme || 0}"></div>
                    </div></div>
                </div>
            </div>
        `;
        container.appendChild(fieldset);
        const titleInput = fieldset.querySelector(`[name="job-titre-${index}"]`);
        const legend = fieldset.querySelector('legend');
        titleInput.addEventListener('input', () => {
            legend.textContent = titleInput.value || `Nouvel Emploi ${index + 1}`;
        });
    }

    function addRequiredNativeTagField(name = '', dist = 0) {
        const container = document.getElementById('requires-tags-container-natif');
        if (!container) return; 
        const fieldset = document.createElement('fieldset');
        fieldset.className = 'dynamic-fieldset required-tag-fieldset';
    
        const nativeTagOptions = sortedNativeTags.map(tag => `<option value="${tag}" ${name === tag ? 'selected' : ''}>${tag}</option>`).join('');
        
        const requiredTagsDropdownHTML = `
            <select name="req-tag-name">
                <option value="">-- Choisir un tag natif --</option>
                ${nativeTagOptions}
            </select>
        `;
    
        fieldset.innerHTML = `
            <button type="button" class="remove-btn">&times;</button>
            <div class="form-grid-dense" style="grid-template-columns: 2fr 1fr; align-items: flex-end;">
                <div class="form-group"><label>Nom du Tag</label>${requiredTagsDropdownHTML}</div>
                <div class="form-group"><label>Dist. Max</label><input type="number" name="req-tag-dist" value="${dist}" placeholder="km"></div>
            </div>
        `;
        container.appendChild(fieldset);
    }
    
    function addRequiredCustomTagField(name = '', dist = 0) {
        const container = document.getElementById('requires-tags-container-perso');
        if (!container) return;
        const fieldset = document.createElement('fieldset');
        fieldset.className = 'dynamic-fieldset required-tag-fieldset';
    
        const customTagOptions = sortedCustomTags.map(tag => `<option value="${tag}" ${name === tag ? 'selected' : ''}>${tag}</option>`).join('');
        
        const requiredTagsDropdownHTML = `
            <select name="req-tag-name">
                <option value="">-- Choisir un tag personnalisé --</option>
                ${customTagOptions.length > 0 ? customTagOptions : '<option value="" disabled>Aucun tag personnalisé</option>'}
            </select>
        `;
    
        fieldset.innerHTML = `
            <button type="button" class="remove-btn">&times;</button>
            <div class="form-grid-dense" style="grid-template-columns: 2fr 1fr; align-items: flex-end;">
                <div class="form-group"><label>Nom du Tag</label>${requiredTagsDropdownHTML}</div>
                <div class="form-group"><label>Dist. Max</label><input type="number" name="req-tag-dist" value="${dist}" placeholder="km"></div>
            </div>
        `;
        container.appendChild(fieldset);
    }

    function buildCustomTagTree(paths) {
        const tree = {};
        const SEPARATOR = ' > ';
        paths.forEach(path => {
            let currentLevel = tree;
            path.split(SEPARATOR).forEach(part => {
                if (!currentLevel[part]) {
                    currentLevel[part] = {};
                }
                currentLevel = currentLevel[part];
            });
        });
        return tree;
    }

    function renderAccordionTreeHTML(node, building, allDefinitions, pathParts = []) {
        let html = '';
        const SEPARATOR = ' > ';

        Object.keys(node).sort().forEach(key => {
            const currentPathParts = [...pathParts, key];
            const fullPath = currentPathParts.join(SEPARATOR);
            
            const tagsForThisPath = allDefinitions[fullPath] || [];
            const children = node[key];
            const hasChildren = Object.keys(children).length > 0;
            
            const childrenHTML = renderAccordionTreeHTML(children, building, allDefinitions, currentPathParts);

            if (tagsForThisPath.length === 0 && childrenHTML.trim() === '') {
                return;
            }

            const checkedCount = tagsForThisPath.filter(tag => building?.providesTags?.includes(tag)).length;
            const totalCount = tagsForThisPath.length;

            const checkboxesHTML = tagsForThisPath.map(tag => 
                `<div class="checkbox-item"><input type="checkbox" id="provides-tag-cb-${tag.replace(/\s+/g, '-')}" name="provides-tags" value="${tag}" ${building?.providesTags?.includes(tag) ? 'checked' : ''}><label for="provides-tag-cb-${tag.replace(/\s+/g, '-')}">${tag}</label></div>`
            ).join('');

            html += `<details class="tag-accordion">`;
            html += `  <summary class="tag-accordion-header">${key} <span class="tag-count">${checkedCount}/${totalCount}</span></summary>`;
            html += `  <div class="tag-accordion-content">`;
            
            if (checkboxesHTML.length > 0) {
                html += checkboxesHTML;
            }

            if (childrenHTML.length > 0) {
                html += `<div class="nested-accordion-container">${childrenHTML}</div>`;
            }
            
            html += `  </div>`;
            html += `</details>`;
        });

        return html;
    }

    function updateProvidedTagsSummary() {
        const summaryContainer = document.getElementById('provided-tags-summary');
        if (!summaryContainer) return;
        const selectedTags = Array.from(document.querySelectorAll('input[name="provides-tags"]:checked')).map(cb => cb.value);
        if (selectedTags.length > 0) {
            summaryContainer.innerHTML = `Produira : <strong>${selectedTags.join(', ')}</strong>.`;
        } else {
            summaryContainer.innerHTML = 'Ne produit aucune ressource spécifique.';
        }
    }

    function updateRequiredTagsSummary() {
        const summaryContainer = document.getElementById('required-tags-summary');
        if (!summaryContainer) return;
        const selectedTags = Array.from(document.querySelectorAll('select[name="req-tag-name"]')).map(s => s.value).filter(Boolean);
        if (selectedTags.length > 0) {
            summaryContainer.innerHTML = `Nécessitera : <strong>${selectedTags.join(', ')}</strong>.`;
        } else {
            summaryContainer.innerHTML = 'Ne nécessite aucune ressource spécifique.';
        }
    }
    
    function updateTagAccordionCount(checkboxElement) {
        const accordion = checkboxElement.closest('.tag-accordion');
        if (!accordion) return;

        const directContent = accordion.querySelector('.tag-accordion-content');
        const header = accordion.querySelector('.tag-accordion-header');
        const countSpan = header.querySelector('.tag-count');
        if (countSpan) {
            const directCheckboxes = Array.from(directContent.children).filter(el => el.classList.contains('checkbox-item')).map(el => el.querySelector('input'));
            const checkedCount = directCheckboxes.filter(cb => cb.checked).length;
            countSpan.textContent = `${checkedCount}/${directCheckboxes.length}`;
        }
    }


    function extractAndCategorizeTags() {
        const nativeTags = new Set();
        const allBuildings = window.EcoSimData.buildings;
        if (allBuildings) {
            for (const settlementType in allBuildings) {
                for (const category in allBuildings[settlementType]) {
                    for (const buildingName in allBuildings[settlementType][category]) {
                        const buildingData = allBuildings[settlementType][category][buildingName];
                        if (buildingData.providesTags) buildingData.providesTags.forEach(tag => nativeTags.add(tag));
                        if (buildingData.requiresTags) Object.keys(buildingData.requiresTags).forEach(tag => nativeTags.add(tag));
                    }
                }
            }
        }
        sortedNativeTags = Array.from(nativeTags).sort((a, b) => a.localeCompare(b));

        const customTags = new Set();
        for (const categoryPath in customTagDefinitions) {
            if (Array.isArray(customTagDefinitions[categoryPath])) {
                customTagDefinitions[categoryPath].forEach(tag => customTags.add(tag));
            }
        }
        sortedCustomTags = Array.from(customTags).sort((a, b) => a.localeCompare(b));
    }


    // --- Initialisation ---
    newBuildingBtn.addEventListener('click', handleNewBuilding);
    customBuildingsList.addEventListener('click', handleSelectBuilding);

    loadCustomTagDefinitions();
    extractAndCategorizeTags();
    setupFilterListeners();
    
    // Lancement direct de l'éditeur
    loadCustomBuildings();
    renderBuildingList();
});