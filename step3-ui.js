//
// FICHIER : step3-ui.js (Version complète et finale)
// Gère l'interface utilisateur (affichage, interactions, événements) pour l'étape 3.
// Lit les données depuis l'objet global `sim` et les rend en HTML.
//
document.addEventListener('DOMContentLoaded', () => {

    // --- ÉLÉMENTS DU DOM & VARIABLES GLOBALES ---
    const regionSelect = document.getElementById('region-select');
    const runSimBtn = document.getElementById('run-sim-btn');
    const advanceMonthBtn = document.getElementById('advance-month-btn');
    const speedSlider = document.getElementById('speed-slider');
    const simulationWorkspace = document.getElementById('simulation-workspace');
    const statYear = document.getElementById('stat-year');
    const statMonth = document.getElementById('stat-month');
    const statPopulation = document.getElementById('stat-population');
    const personModal = document.getElementById('person-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const searchInput = document.getElementById('person-search');
    const searchResults = document.getElementById('search-results');
    const detailsModal = document.getElementById('details-modal');
    
    let popDisplayContainer;
    // Variable pour suivre l'état de l'infobulle ouverte
    let openTooltipState = null;
    
    const sim = window.sim;
    const SimEngine = window.SimEngine;
    const RACES_DATA = window.EcoSimData.racesData;
    const BUILDINGS_DATA = window.EcoSimData.buildings;

    // --- GESTIONNAIRES DE LANCEMENT ---

    function init() {
        SimEngine.loadDataFromStorage();
        if (sim.currentRegion && sim.currentRegion.places) {
            sim.currentRegion.places.forEach(p => {
                if (p.treasury === undefined) p.treasury = 50000 / SimEngine.GLOBAL_ECONOMY_DIVISOR;
                p.tempPrestigePenalty = 0;
                p.tempPenaltyDuration = 0;
                p.tempMenaceIncrease = 0;
                p.tempMenaceDuration = 0;
            });
        }
    
        const resultsPanel = document.getElementById('results-panel');
        if (sim.currentRegion) {
            regionSelect.innerHTML = `<option>${sim.currentRegion.name}</option>`;
            const allValid = sim.currentRegion.places.every(p => p.config && p.config.isValidated);
            if (!allValid) {
                resultsPanel.innerHTML = `<h2>Configuration Incomplète</h2><p>Veuillez retourner à l'<strong>Étape 2</strong> et valider la configuration de tous les lieux.</p>`;
            } else {
                resultsPanel.innerHTML = `
                    <h2>Prêt à Lancer</h2>
                    <p>Choisissez un mode de départ pour la simulation :</p>
                    <button id="generate-g0-presim-btn" class="btn-primary">Lancer avec Pré-simulation (Recommandé)</button>
                    <button id="generate-g0-pure-btn" class="btn">Lancer avec Génération 0 Pure</button>
                    <p class="sim-explanation" style="max-width: 800px; margin-top:10px;">
                        <b>Pré-simulation :</b> Simule 100 ans en arrière-plan pour créer une population avec une histoire, des âges variés et une structure sociale organique.
                        <br><b>Génération 0 Pure :</b> Démarre instantanément avec la population fondatrice, tous de jeunes adultes. Idéal pour un départ rapide.
                    </p>
                `;
                document.getElementById('generate-g0-presim-btn').addEventListener('click', handleG0GenerationWithPresim);
                document.getElementById('generate-g0-pure-btn').addEventListener('click', handlePureG0Generation);
            }
        } else {
            resultsPanel.innerHTML = `<h2>Aucune Région Valide</h2><p>Créez et configurez une région aux étapes précédentes.</p>`;
        }
        setupEventListeners();
    }

    async function handleG0GenerationWithPresim() {
        const resultsPanel = document.getElementById('results-panel');
        resultsPanel.innerHTML = `
            <div id="loading-container">
                <h3>Pré-simulation de 100 ans en cours...</h3>
                <p>Création d'un monde vivant, veuillez patienter.</p>
                <progress id="loading-bar" value="0" max="100"></progress>
                <span id="loading-year">0 / 100</span>
                <p class="sim-explanation">Cette première génération crée une base de population historique. Une fois terminée, vous pourrez continuer la simulation année par année à partir de ce point.</p>
            </div>`;
        SimEngine.handleG0Base();
        await SimEngine.runHiddenSimulation(100);
        sim.eventLog = [];
        sim.year = 0;
        sim.month = 0;
        setupSimulationUI();
        populateHistoryLogFromSimLog();
        updateUI();
        runSimBtn.disabled = false;
        advanceMonthBtn.disabled = false;
    }
    
    function handlePureG0Generation() {
        SimEngine.handleG0Base();
        sim.eventLog = [];
        sim.year = 0;
        sim.month = 0;
        setupSimulationUI();
        populateHistoryLogFromSimLog();
        updateUI();
        runSimBtn.disabled = false;
        advanceMonthBtn.disabled = false;
    }

    // --- GESTION DE L'INTERFACE UTILISATEUR ET AFFICHAGE ---

    function updateOpenTooltip() {
        if (!openTooltipState || !detailsModal.style.display || detailsModal.style.display === 'none') {
            return;
        }
        const city = sim.currentRegion.places.find(p => p.id === openTooltipState.cityId);
        if (city) {
            const { title, content } = getStatDetails(openTooltipState.stat, city);
            document.getElementById('details-modal-title').textContent = title;
            document.getElementById('details-modal-content').innerHTML = content;
        }
    }
    
    function showPersonModal(personId) {
        const person = sim.population.find(p => p.id === personId);
        if (!person) return;

        modalTitle.textContent = `${person.firstName} ${person.lastName}`;
        
        const createPersonLink = (pId) => {
            const p = sim.population.find(ind => ind.id === pId);
            return p ? `<span class="person-name-clickable" data-person-id="${p.id}">${p.firstName} ${p.lastName}</span>` : 'Inconnu';
        };

        const status = person.isAlive ? 'Vivant' : `Décédé(e) à ${person.age} ans (An ${person.deathYear})`;
        const age = person.isAlive ? `${person.age} ans` : `(Né en ${person.birthYear})`;
        
        let jobInfo = 'Sans Emploi';
        if (person.job) {
             jobInfo = `${person.job.role} (Tier ${person.job.tier})`;
        }

        const buildingInfo = person.job?.building ? `à <em>${person.job.building}</em>` : '';
        let civilHtml = `<ul>
            <li><strong>Statut:</strong> ${status}</li>
            <li><strong>Âge:</strong> ${age}</li>
            <li><strong>Race:</strong> ${person.race}</li>
            <li><strong>Ville:</strong> ${person.cityName}</li>
            <li><strong>Emploi:</strong> ${jobInfo} ${buildingInfo}</li>
        </ul>`;

        // --- SECTION FAMILLE ---
        let familyHtml = '<ul>';
        
        // Parents
        if (person.parents.length > 0) familyHtml += `<li><strong>Parents:</strong> ${person.parents.map(createPersonLink).join(' & ')}</li>`;
        
        // Conjoint
        if (person.spouseId) {
            const spouse = sim.population.find(p => p.id === person.spouseId);
            if (spouse && spouse.isAlive) {
                familyHtml += `<li><strong>Conjoint(e):</strong> ${createPersonLink(person.spouseId)}</li>`;
            } else if (spouse) {
                 familyHtml += `<li><strong>Conjoint(e):</strong> Veuf/Veuve de ${createPersonLink(person.spouseId)}</li>`;
            }
        } else if (person.wasMarried) {
             familyHtml += `<li><strong>Conjoint(e):</strong> Veuf/Veuve</li>`;
        }
        
        // Enfants
        if (person.children.length > 0) familyHtml += `<li><strong>Enfants:</strong> ${person.children.map(createPersonLink).join(', ')}</li>`;
        
        // Frères et Soeurs
        if (person.parents.length > 0) {
            const parent1 = sim.population.find(p => p.id === person.parents[0]);
            if (parent1) {
                const siblingIds = parent1.children.filter(childId => childId !== person.id);
                if (siblingIds.length > 0) {
                    familyHtml += `<li><strong>Frères & Sœurs:</strong> ${siblingIds.map(createPersonLink).join(', ')}</li>`;
                }
            }
        }
        
        // Oncles et Tantes (Paternel)
        const father = sim.population.find(p => person.parents.includes(p.id) && p.gender === 'M');
        if (father && father.parents.length > 0) {
            const paternalGrandparent = sim.population.find(p => p.id === father.parents[0]);
            if (paternalGrandparent) {
                const paternalUnclesAuntsIds = paternalGrandparent.children.filter(childId => childId !== father.id);
                if (paternalUnclesAuntsIds.length > 0) {
                    familyHtml += `<li><strong>Oncles & Tantes (Paternel):</strong> ${paternalUnclesAuntsIds.map(createPersonLink).join(', ')}</li>`;
                }
            }
        }

        // Oncles et Tantes (Maternel)
        const mother = sim.population.find(p => person.parents.includes(p.id) && p.gender === 'F');
        if (mother && mother.parents.length > 0) {
            const maternalGrandparent = sim.population.find(p => p.id === mother.parents[0]);
            if (maternalGrandparent) {
                const maternalUnclesAuntsIds = maternalGrandparent.children.filter(childId => childId !== mother.id);
                if (maternalUnclesAuntsIds.length > 0) {
                    familyHtml += `<li><strong>Oncles & Tantes (Maternel):</strong> ${maternalUnclesAuntsIds.map(createPersonLink).join(', ')}</li>`;
                }
            }
        }

        // Nom de Famille
        familyHtml += `<li><strong>Famille:</strong> ${sim.families[person.familyId]?.originalName || 'N/A'}</li></ul>`;

        let wealthHtml = `<ul>
            <li><strong>Trésorerie:</strong> ${SimEngine.formatCurrency(person.money)}</li>
            <li><strong>Prestige:</strong> ${Math.round(person.prestige)}</li>
        </ul>`;

        let statsHtml = '<ul>';
        if (person.stats) {
            for (const [stat, value] of Object.entries(person.stats)) {
                statsHtml += `<li><strong>${stat}:</strong> ${value.toFixed(2)}</li>`;
            }
        } else {
            statsHtml += '<li>Statistiques non disponibles.</li>';
        }
        statsHtml += '</ul>';

        const personEvents = sim.eventLog.filter(e => e.familyId === person.familyId && e.message.includes(person.firstName)).slice(0, 50);
        
        let historyHtml = '<div id="person-history">';
        if (personEvents.length > 0) {
            personEvents.forEach(e => {
                const cleanMessage = e.message.replace(/<[^>]*>?/gm, '');
                historyHtml += `<div class="history-entry"><strong>An ${e.year}, M ${e.month+1}</strong> ${cleanMessage}</div>`;
            });
        } else {
            historyHtml += '<p>Aucun événement marquant enregistré.</p>';
        }
        historyHtml += '</div>';

        // --- SECTION CERCLE SOCIAL [CORRIGÉ] ---
        const { relationships } = person;

        const friendsList = relationships.friends.length > 0
            ? relationships.friends.map(id => createPersonLink(id)).join(', ')
            : 'Aucun';

        const acquaintancesList = relationships.acquaintances.length > 0
            ? relationships.acquaintances.map(id => createPersonLink(id)).join(', ')
            : 'Aucune';

        const rivalsList = relationships.rivals.length > 0
            ? relationships.rivals.map(id => createPersonLink(id)).join(', ')
            : 'Aucun';

        // Les compteurs sont maintenant masqués en permanence
        let socialHtml = `<ul>
            <li><strong>Amis:</strong> ${friendsList}</li>
            <li><strong>Connaissances:</strong> ${acquaintancesList}</li>
            <li><strong>Rivaux:</strong> ${rivalsList}</li>
        </ul>`;

        modalBody.innerHTML = `
            <div class="modal-grid">
                <div class="modal-section"><h4>État Civil</h4>${civilHtml}</div>
                <div class="modal-section"><h4>Famille & Relations</h4>${familyHtml}</div>
                <div class="modal-section"><h4>Richesse & Influence</h4>${wealthHtml}</div>
                <div class="modal-section"><h4>Caractéristiques</h4>${statsHtml}</div>
                <div class="modal-section modal-full-width"><h4>Cercle Social</h4>${socialHtml}</div>
                <div class="modal-section modal-full-width"><h4>Historique des événements</h4>${historyHtml}</div>
            </div>`;
        
        personModal.style.display = 'flex';
        modalBody.querySelectorAll('.person-name-clickable').forEach(link => {
            link.addEventListener('click', (e) => {
                const newPersonId = parseInt(e.target.closest('.person-name-clickable').dataset.personId);
                showPersonModal(newPersonId);
            });
        });
    }
    
    function handleSearchInput() {
        const query = searchInput.value.toLowerCase().trim();
        if (query.length < 2) {
            searchResults.style.display = 'none';
            return;
        }
        const results = sim.population
            .filter(p => p.isAlive && (p.firstName.toLowerCase().includes(query) || p.lastName.toLowerCase().includes(query)))
            .slice(0, 5);
        if (results.length > 0) {
            searchResults.innerHTML = results.map(p => `
                <div class="search-item" data-person-id="${p.id}">
                    <span class="search-item-name">${p.firstName} ${p.lastName}</span>
                    <span class="search-item-details">${p.age} ans, ${p.job?.role || 'Sans-emploi'} à ${p.cityName}</span>
                </div>
            `).join('');
            searchResults.style.display = 'block';
        } else {
            searchResults.style.display = 'none';
        }
    }

    function selectPersonFromSearch(personId) {
        showPersonModal(personId);
        searchInput.value = '';
        searchResults.style.display = 'none';
    }

    function renderPersonAndDescendants(person, familyMemberMap, globalPopulationMap, renderedIds) {
        if (!person || renderedIds.has(person.id)) return '';
    
        const spouse = person.spouseId ? globalPopulationMap.get(person.spouseId) : null;
    
        if (spouse && renderedIds.has(spouse.id)) return ''; 
    
        renderedIds.add(person.id);
        if (spouse) {
            renderedIds.add(spouse.id);
        }
    
        const personJob = person.job;
        const personJobString = (personJob?.isCriminal) ? `<span class="job-criminal">${personJob.role}</span>` :
                              (personJob?.building ? `${personJob.role}` : (personJob?.role || 'Sans-emploi'));
        
        const isMarriedOut = person.birthFamilyId && person.familyId !== person.birthFamilyId;
        const statusClass = person.isAlive ? '' : 'deceased';
        const personStatusClass = `${statusClass} ${isMarriedOut ? 'married-out' : ''}`;
        
        const ageString = person.isAlive ? (person.age < 1 ? `${person.ageInMonths % 12}m` : `${person.age}a`) : `(d. ${person.deathYear})`;
        
        let nodeContent = `<div class="node-plate ${personStatusClass}">
            <span class="person-name-clickable" data-person-id="${person.id}">${person.firstName} ${person.lastName}</span>
            ${ (person.maidenName && person.maidenName !== 'Temp') ? `<br><small>(née ${person.maidenName})</small>`: ''}
            <br><small>(${ageString}, ${person.race[0]})</small>
            <br><small class="person-job">${personJobString}</small>
            ${isMarriedOut ? `<br><small class="remarried-note">Mariée ${sim.families[person.familyId]?.originalName || ''}</small>` : ''}
        </div>`;
    
        if (spouse) {
            const spouseJob = spouse.job;
            const spouseJobString = (spouseJob?.isCriminal) ? `<span class="job-criminal">${spouseJob.role}</span>` :
                                  (spouseJob?.building ? `${spouseJob.role}` : (spouseJob?.role || 'Sans-emploi'));
            const spouseStatusClass = spouse.isAlive ? '' : 'deceased';
            const spouseAgeString = spouse.isAlive ? (spouse.age < 1 ? `${spouse.ageInMonths % 12}m` : `${spouse.age}a`) : `(d. ${spouse.deathYear})`;
            const isSpouseMarriedOut = spouse.birthFamilyId && spouse.familyId !== spouse.birthFamilyId;
            const spouseFinalStatusClass = `${spouseStatusClass} ${isSpouseMarriedOut ? 'married-out' : ''}`;
            
            nodeContent += ` & <div class="node-plate ${spouseFinalStatusClass}">
                <span class="person-name-clickable" data-person-id="${spouse.id}">${spouse.firstName} ${spouse.lastName}</span>
                ${ (spouse.maidenName && spouse.maidenName !== 'Temp') ? `<br><small>(née ${spouse.maidenName})</small>`: ''}
                <br><small>(${spouseAgeString}, ${spouse.race[0]})</small>
                <br><small class="person-job">${spouseJobString}</small>
                 ${isSpouseMarriedOut ? `<br><small class="remarried-note">Mariée ${sim.families[spouse.familyId]?.originalName || ''}</small>` : ''}
            </div>`;
        }
    
        const children = person.children.map(childId => familyMemberMap.get(childId)).filter(Boolean);
        let childrenHtml = '';
        if (children.length > 0) {
            childrenHtml = '<ul>';
            children.forEach(child => {
                childrenHtml += renderPersonAndDescendants(child, familyMemberMap, globalPopulationMap, renderedIds);
            });
            childrenHtml += '</ul>';
        }
        return `<li><div class="node-couple">${nodeContent}</div>${childrenHtml}</li>`;
    }

    function generateCityPopulationHtml(city) {
        let cityHtml = '';
        let familyIdsInCity = [...new Set(sim.population.filter(p => p.cityId === city.id && p.birthFamilyId).map(p => p.birthFamilyId))];
    
        familyIdsInCity.sort((idA, idB) => (sim.families[idB]?.totalPrestige || 0) - (sim.families[idA]?.totalPrestige || 0));
        
        const globalPopulationMap = new Map(sim.population.map(p => [p.id, p]));
    
        familyIdsInCity.forEach(familyId => {
            const familyData = sim.families[familyId];
            if (!familyData) return;
            
            const allFamilyMembers = sim.population.filter(p => p.birthFamilyId === familyId);
            
            const isFamilyExtinct = allFamilyMembers.length > 0 && allFamilyMembers.every(p => !p.isAlive);
            const familyClass = isFamilyExtinct ? 'extinct-family' : '';
    
            const familyMemberMap = new Map(allFamilyMembers.map(p => [p.id, p]));
            
            const renderedInMainTreeIds = new Set();
            let mainTreeHtml = '';
            
            const roots = allFamilyMembers.filter(p => !p.parents.some(parentId => familyMemberMap.has(parentId)));
            
            roots.forEach(person => {
                mainTreeHtml += renderPersonAndDescendants(person, familyMemberMap, globalPopulationMap, renderedInMainTreeIds);
            });
    
            const ancestorList = allFamilyMembers.filter(p => !p.isAlive && !renderedInMainTreeIds.has(p.id));
            let ancestorHtml = ancestorList.sort((a,b) => (a.birthYear - b.birthYear)).map(ancestor => `<div class="ancestor-entry">${renderSimplePersonString(ancestor)}</div>`).join('');
            if(ancestorHtml === '') ancestorHtml = '<p>Aucun autre ancêtre enregistré.</p>';
            const familyLog = sim.eventLog.filter(e => e.familyId === familyId).slice(0, 100);
            let familyLogHtml = familyLog.map(e => `<li class="log-entry">${e.message.replace(/<[^>]*>?/gm, '')} (An ${e.year})</li>`).join('');
            if(familyLog.length === 0) familyLogHtml = "<li>Aucun événement enregistré.</li>";
            cityHtml += `
                <details open class="family-container ${familyClass}">
                    <summary>${familyData.originalName} (Influence: ${Math.round(familyData.totalPrestige || 0)})</summary>
                    <div class="family-content">
                        <details class="family-section" open>
                            <summary class="section-summary">Arbre Principal</summary>
                            <div class="family-tree-container">
                                <div class="tree-controls">
                                    <span class="zoom-text">ALT+Molette pour Zoom/Dézoom</span>
                                    <button class="tree-btn" data-action="zoom-reset">Reset</button>
                                </div>
                                <svg class="tree-connector-svg"></svg>
                                <div class="tree">
                                    <ul>${mainTreeHtml || "<p>Aucun membre vivant.</p>"}</ul>
                                </div>
                            </div>
                        </details>
                        <details class="family-section">
                            <summary class="section-summary">Ancêtres</summary>
                            <div class="ancestor-container">${ancestorHtml}</div>
                        </details>
                        <details class="family-section">
                            <summary class="section-summary">Journal de Famille</summary>
                            <ul class="family-log-container">${familyLogHtml}</ul>
                        </details>
                    </div>
                </details>`;
        });
        return cityHtml;
    }

    function getCoordsRelativeToTree(element, treeElement) {
        let top = element.offsetTop;
        let left = element.offsetLeft;
        let parent = element.offsetParent;

        while (parent && parent !== treeElement) {
            top += parent.offsetTop;
            left += parent.offsetLeft;
            parent = parent.offsetParent;
        }
        return { top, left };
    }

    function drawTreeConnectors(treeContainer, scale = 1.0) {
        const svg = treeContainer.querySelector('.tree-connector-svg');
        const tree = treeContainer.querySelector('.tree');
        if (!svg || !tree) return;

        svg.innerHTML = '';
        svg.style.width = `${tree.scrollWidth}px`;
        svg.style.height = `${tree.scrollHeight}px`;
        svg.style.transformOrigin = 'top left';
        svg.style.transform = `scale(${scale})`;

        const allCouples = Array.from(tree.querySelectorAll('.node-couple'));

        allCouples.forEach(parentCouple => {
            const childrenUl = parentCouple.nextElementSibling;
            if (!childrenUl || childrenUl.tagName !== 'UL') return;

            const childrenLi = Array.from(childrenUl.children);
            if (childrenLi.length === 0) return;

            const parentNodes = parentCouple.querySelectorAll('.node-plate');
            if (parentNodes.length === 0) return;

            const coupleCoords = getCoordsRelativeToTree(parentCouple, tree);
            let pCenterX;

            if (parentNodes.length > 1) {
                const p1 = parentNodes[0];
                const p2 = parentNodes[1];
                const midPointInCouple = (p1.offsetLeft + p1.offsetWidth + p2.offsetLeft) / 2;
                pCenterX = coupleCoords.left + midPointInCouple;
            } else {
                pCenterX = coupleCoords.left + parentCouple.offsetWidth / 2;
            }

            const pBottomY = coupleCoords.top + parentCouple.offsetHeight;
            const horizontalLineY = pBottomY + 25;

            const parentPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            parentPath.setAttribute('d', `M ${pCenterX} ${pBottomY} V ${horizontalLineY}`);
            svg.appendChild(parentPath);

            const childrenNodes = childrenLi.map(li => li.querySelector('.node-couple')).filter(Boolean);
            if (childrenNodes.length === 0) return;

            const firstChildNode = childrenNodes[0];
            const lastChildNode = childrenNodes[childrenNodes.length - 1];

            const firstChildCoords = getCoordsRelativeToTree(firstChildNode, tree);
            const lastChildCoords = getCoordsRelativeToTree(lastChildNode, tree);

            const hLineStartX = firstChildCoords.left + firstChildNode.offsetWidth / 2;
            const hLineEndX = lastChildCoords.left + lastChildNode.offsetWidth / 2;

            if (childrenNodes.length > 1) {
                const hLinePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                hLinePath.setAttribute('d', `M ${hLineStartX} ${horizontalLineY} H ${hLineEndX}`);
                svg.appendChild(hLinePath);
            }

            childrenNodes.forEach(childNode => {
                const childCoords = getCoordsRelativeToTree(childNode, tree);
                const cCenterX = childCoords.left + childNode.offsetWidth / 2;
                const cTopY = childCoords.top;
                
                const childPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                childPath.setAttribute('d', `M ${cCenterX} ${horizontalLineY} V ${cTopY}`);
                svg.appendChild(childPath);
            });
        });
    }
    
    function throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    }

    function initTreeControls(container) {
        const tree = container.querySelector('.tree');
        if (!tree) return;
        const zoomResetBtn = container.querySelector('[data-action="zoom-reset"]');
        
        let scale = 1.0;
        let isDragging = false;
        let startX, startY, scrollLeft, scrollTop;

        const updateZoom = () => {
            tree.style.transform = `scale(${scale})`;
        };

        const throttledDrawConnectors = throttle((s) => drawTreeConnectors(container, s), 50);

        zoomResetBtn.addEventListener('click', () => {
            scale = 1.0;
            updateZoom();
            container.scrollLeft = (tree.scrollWidth - container.clientWidth) / 2;
            container.scrollTop = 0;
            drawTreeConnectors(container, 1.0);
        });

        container.addEventListener('wheel', (e) => {
            if (!e.altKey) return;
            
            e.preventDefault();
            e.stopPropagation();

            const rect = container.getBoundingClientRect();
            
            const mouseX = e.clientX - rect.left + container.scrollLeft;
            const mouseY = e.clientY - rect.top + container.scrollTop;
            
            const oldScale = scale;
            
            const zoomFactor = e.deltaY < 0 ? 1.05 : 0.95;
            scale = Math.max(0.1, Math.min(2.0, scale * zoomFactor));

            updateZoom();
            
            const newScrollX = (mouseX * (scale / oldScale)) - (e.clientX - rect.left);
            const newScrollY = (mouseY * (scale / oldScale)) - (e.clientY - rect.top);

            container.scrollLeft = newScrollX;
            container.scrollTop = newScrollY;

            throttledDrawConnectors(scale);

        }, { passive: false });

        container.addEventListener('mousedown', (e) => {
            if (e.target.closest('button') || e.target.closest('.person-name-clickable')) return;
            isDragging = true;
            container.classList.add('dragging');
            startX = e.pageX - container.offsetLeft;
            startY = e.pageY - container.offsetTop;
            scrollLeft = container.scrollLeft;
            scrollTop = container.scrollTop;
        });

        container.addEventListener('mouseleave', () => { isDragging = false; container.classList.remove('dragging'); });
        container.addEventListener('mouseup', () => { isDragging = false; container.classList.remove('dragging'); });

        container.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            e.preventDefault();
            const x = e.pageX - container.offsetLeft;
            const y = e.pageY - container.offsetTop;
            container.scrollLeft = scrollLeft - (x - startX);
            container.scrollTop = scrollTop - (y - startY);
        });

        container.scrollLeft = (tree.scrollWidth - container.clientWidth) / 2;
    }

    function displayPopulation() {
        if (!popDisplayContainer) return;
        SimEngine.calculateAllFamilyPrestige();
        const activeTab = popDisplayContainer.querySelector('.tab-nav .active');
        const activeCityId = activeTab ? activeTab.dataset.cityId : (sim.currentRegion.places[0] ? sim.currentRegion.places[0].id : null);
        const scrollPositions = {};
        document.querySelectorAll('.family-tree-container').forEach((c, i) => {
            scrollPositions[i] = { top: c.scrollTop, left: c.scrollLeft };
        });
        let cityNavHTML = '', cityPanelsHTML = '';
        sim.currentRegion.places.forEach((city, index) => {
            const cityPop = sim.population.filter(p => p.isAlive && p.cityId === city.id).length;
            const isActive = city.id == activeCityId;
            cityNavHTML += `<button class="tab-button ${isActive ? 'active' : ''}" data-city-id="${city.id}">${city.name} (${cityPop})</button>`;
            cityPanelsHTML += `<div class="tab-panel ${isActive ? 'active' : ''}" data-panel-for="${city.id}" id="city-panel-${index}">${generateCityPopulationHtml(city)}</div>`;
        });
        popDisplayContainer.innerHTML = `<div class="tab-nav">${cityNavHTML}</div><div class="tab-panels">${cityPanelsHTML}</div>`;
        
        document.querySelectorAll('.family-tree-container').forEach((container, i) => {
            initTreeControls(container);
            drawTreeConnectors(container, 1.0);
            const savedPos = scrollPositions[i];
            if (savedPos) {
                container.scrollTop = savedPos.top;
                container.scrollLeft = savedPos.left;
            }
        });

        const yearlyStatsContainer = document.getElementById('yearly-stats');
        const cumulativeStatsContainer = document.getElementById('cumulative-stats');
        yearlyStatsContainer.innerHTML = `<h4>Statistiques (Année ${sim.year})</h4><ul><li>Naissances : ${sim.eventLog.filter(e => e.year === sim.year && e.message.includes("Naissance")).length}</li><li>Décès : ${sim.eventLog.filter(e => e.year === sim.year && e.message.includes("décédé")).length}</li><li>Mariages : ${sim.eventLog.filter(e => e.year === sim.year && e.message.includes("Mariage")).length}</li></ul>`;
        cumulativeStatsContainer.innerHTML = `<h4>Statistiques (Cumulé)</h4><ul><li>Naissances : ${sim.eventLog.filter(e => e.message.includes("Naissance")).length}</li><li>Décès : ${sim.eventLog.filter(e => e.message.includes("décédé")).length}</li><li>Mariages : ${sim.eventLog.filter(e => e.message.includes("Mariage")).length}</li></ul>`;
    }

    function renderSimplePersonString(person) { let personString = `<span class="person-name-clickable" data-person-id="${person.id}"><b>${person.firstName} ${person.lastName}</b></span> (${person.gender}, ${person.race}, ${person.birthYear || '?'}-${person.deathYear || '?'})`; if (person.maidenName) personString += ` (née ${person.maidenName})`; return personString; }
    
    function updateUI() { 
        statYear.textContent = sim.year; 
        statMonth.textContent = sim.month + 1; 
        statPopulation.textContent = sim.population.filter(p => p.isAlive).length; 
        if (popDisplayContainer) displayPopulation(); 
        const historyPanel = document.getElementById('history-panel'); 
        if (historyPanel) { 
            const activeTab = historyPanel.querySelector('.tab-button.active'); 
            if (activeTab) {
                updateCityStats(activeTab.dataset.tabId);
            }
        } 
    }
    
    function setupSimulationUI() { 
        let historyTabsNav = `<button class="tab-button active" data-tab-id="general">Général</button>`; 
        let historyTabsPanels = `<div class="tab-panel active" id="history-panel-general"></div>`; 
        sim.currentRegion.places.forEach(city => { 
            historyTabsNav += `<button class="tab-button" data-tab-id="${city.id}">${city.name}</button>`; 
            historyTabsPanels += `<div class="tab-panel" id="history-panel-city-${city.id}"></div>`; 
        }); 
        simulationWorkspace.innerHTML = `
            <div id="sim-container">
                <div id="sim-display-panel">
                    <div id="population-display"></div>
                    <div id="stats-container">
                        <div id="yearly-stats"></div>
                        <div id="cumulative-stats"></div>
                    </div>
                </div>
                <div id="history-panel">
                    <div id="city-stats-panel"></div>
                    <h4>Journal des Événements</h4>
                    <div class="tab-nav">${historyTabsNav}</div>
                    <div class="tab-panels" id="history-log-content">${historyTabsPanels}</div>
                </div>
            </div>`; 
        popDisplayContainer = document.getElementById('population-display'); 
        const historyPanel = document.getElementById('history-panel'); 
        historyPanel.querySelector('.tab-nav').addEventListener('click', (e) => { 
            const button = e.target.closest('.tab-button'); 
            if (!button) return; 
            historyPanel.querySelector('.tab-nav .active')?.classList.remove('active'); 
            historyPanel.querySelector('.tab-panels .active')?.classList.remove('active'); 
            button.classList.add('active'); 
            const panelId = button.dataset.tabId === 'general' ? '#history-panel-general' : `#history-panel-city-${button.dataset.tabId}`; 
            historyPanel.querySelector(panelId)?.classList.add('active'); 
            updateCityStats(button.dataset.tabId); 
        }); 
        popDisplayContainer.addEventListener('click', (e) => { 
            const button = e.target.closest('.tab-button'); 
            if (button) { 
                const navBar = button.parentElement; 
                const panelContainer = navBar.nextElementSibling; 
                navBar.querySelector('.active')?.classList.remove('active'); 
                panelContainer.querySelector('.active')?.classList.remove('active'); 
                button.classList.add('active'); 
                panelContainer.querySelector(`[data-panel-for="${button.dataset.cityId}"]`)?.classList.add('active'); 
            } else if (e.target.closest('.person-name-clickable')) { 
                const personId = parseInt(e.target.closest('.person-name-clickable').dataset.personId); 
                showPersonModal(personId); 
            } 
        }); 
        updateCityStats('general'); 
    }

    function populateHistoryLogFromSimLog() { sim.eventLog.forEach(eventData => { const logEntry = document.createElement('div'); logEntry.innerHTML = eventData.message.startsWith('<h3>') ? eventData.message : `<p>${eventData.message}</p>`; const generalPanel = document.getElementById('history-panel-general'); if (generalPanel) generalPanel.appendChild(logEntry.cloneNode(true)); if (eventData.cityId !== null) { const cityPanel = document.getElementById(`history-panel-city-${eventData.cityId}`); if (cityPanel) cityPanel.appendChild(logEntry.cloneNode(true)); } }); }
    
    function updateCityStats(cityId) {
        const container = document.getElementById('city-stats-panel');
        if (!cityId || cityId === 'general') {
            container.innerHTML = '';
            return;
        }
        const city = sim.currentRegion.places.find(p => p.id == cityId);
        if (!city) return;
        const cityJobs = sim.jobSlots.filter(j => j.cityId == cityId && (j.buildingName === "Caserne" || city.config.buildings[j.buildingName]?.active));
        const totalJobs = cityJobs.length;
        const filledJobs = cityJobs.filter(j => j.isFilled).length;
        const dynamicPrestige = city.dynamicStats?.prestige ?? 'N/A';
        const dynamicMenace = city.dynamicStats?.menace ?? 'N/A';
        const oisifs = city.dynamicStats?.oisifs ?? 'N/A';
        const cityStateData = SimEngine.CITY_STATES[city.state] || SimEngine.CITY_STATES['Stable'];
        const buildingCount = Object.values(city.config.buildings).filter(b => b.active).reduce((sum, b) => sum + b.count, 0);
        const populationCount = sim.population.filter(p => p.isAlive && p.cityId == cityId).length;
        const militiaCount = sim.jobSlots.filter(j=> j.isFilled && j.cityId === city.id && SimEngine.GUARD_ROLES.includes(j.role)).length;
        
        container.innerHTML = `
            <h4>STATISTIQUES DE ${city.name.toUpperCase()} (${city.type})</h4>
            <div class="city-stats-grid">
                <div> <strong>État:</strong> <span style="color:${cityStateData.color}; font-weight:bold;">${cityStateData.name}</span> <span class="stat-tooltip-trigger" data-stat="etat" data-city-id="${city.id}">?</span> </div>
                <div> <strong>Population:</strong> ${populationCount} <span class="stat-tooltip-trigger" data-stat="population" data-city-id="${city.id}">?</span> </div>
                <div> <strong>Emplois:</strong> ${filledJobs} / ${totalJobs} <span class="stat-tooltip-trigger" data-stat="emplois" data-city-id="${city.id}">?</span> </div>
                <div> <strong>Bâtiments:</strong> ${buildingCount} <span class="stat-tooltip-trigger" data-stat="batiments" data-city-id="${city.id}">?</span> </div>
                <div> <strong>Prestige:</strong> ${Math.round(dynamicPrestige)} <span class="stat-tooltip-trigger" data-stat="prestige" data-city-id="${city.id}">?</span> </div>
                <div> <strong>Menace:</strong> ${Math.round(dynamicMenace)} <span class="stat-tooltip-trigger" data-stat="menace" data-city-id="${city.id}">?</span> </div>
                <div> <strong>Miliciens:</strong> ${militiaCount} <span class="stat-tooltip-trigger" data-stat="milice" data-city-id="${city.id}">?</span> </div>
                <div> <strong>Oisifs:</strong> ${oisifs} <span class="stat-tooltip-trigger" data-stat="oisifs" data-city-id="${city.id}">?</span> </div>
                <div> <strong>Trésorerie:</strong> ${SimEngine.formatCurrency(city.treasury || 0)} <span class="stat-tooltip-trigger" data-stat="tresorerie" data-city-id="${city.id}">?</span> </div>
            </div>`;
    }

    function getStatDetails(stat, city) {
        let title = "Détails";
        let content = "Information non disponible.";

        const cityPop = sim.population.filter(p => p.isAlive && p.cityId === city.id);
        const adults = cityPop.filter(p => p.age >= (RACES_DATA.races[p.race]?.ageAdulte || 18));
        const oisifsList = adults.filter(p => p.job?.role === "Sans-emploi");
        const format = (value) => SimEngine.formatCurrency(value);
        const placeBuildingsData = BUILDINGS_DATA[city.type] || {};

        switch(stat) {
            case 'tresorerie': {
                title = `Bilan Financier de ${city.name}`;
                
let totalTaxesEntreprises = 0;
                let totalTaxesRichesse = 0;
                
                for (const buildingName in city.config.buildings) {
                    const buildingInstance = city.config.buildings[buildingName];
                    // On vérifie que le bâtiment est actif
                    if (buildingInstance.active) {
                        // Utilisons directement le chiffre d'affaires réel du mois, déjà calculé par le moteur.
                        // Cela reflète exactement les variations mensuelles.
                        const turnoverDuMois = buildingInstance.monthlyTurnover || 0;
                        totalTaxesEntreprises += turnoverDuMois * 0.25;
                    }
                }

                cityPop.forEach(person => {
                    let personMoneyInPO = person.money / (10000 / SimEngine.GLOBAL_ECONOMY_DIVISOR);
                    let taxAmount = 0;
                    const WEALTH_TAX_BRACKETS = [{ threshold: 20, rate: 0.70 }, { threshold: 10, rate: 0.10 }];
                    for(const bracket of WEALTH_TAX_BRACKETS) {
                        if (personMoneyInPO > bracket.threshold) {
                            taxAmount += (personMoneyInPO - bracket.threshold) * bracket.rate;
                            personMoneyInPO = bracket.threshold;
                        }
                    }
                    if (taxAmount > 0) totalTaxesRichesse += taxAmount * (10000 / SimEngine.GLOBAL_ECONOMY_DIVISOR);
                });

                let totalDepensesPubliques = 0;
                const adminCategory = placeBuildingsData["Bâtiments Administratifs"];
                if (adminCategory) {
                     for (const buildingName in adminCategory) {
                        const buildingInstance = city.config.buildings[buildingName];
                        const buildingData = adminCategory[buildingName];
                        if (buildingInstance && buildingInstance.active) {
                            totalDepensesPubliques += SimEngine.parseCurrency(buildingData.chargeFixe) * buildingInstance.count;
                        }
                    }
                }
                
                const totalSalesTax = city.monthlySalesTax || 0;
                const totalRevenus = totalTaxesEntreprises + totalTaxesRichesse + totalSalesTax;
                const solde = totalRevenus - totalDepensesPubliques;

                content = `
                    <p>Bilan financier prévisionnel pour le mois en cours. Inclut les taxes sur les ventes déjà perçues.</p>
                    <h4>Revenus Mensuels (Estimés & Réels)</h4>
                    <ul>
                        <li>Taxe sur les entreprises (25%): <strong>+${format(totalTaxesEntreprises)}</strong></li>
                        <li>Taxe sur les ventes (40%): <strong>+${format(totalSalesTax)}</strong></li>
                        <li>Impôt sur la richesse: <strong>+${format(totalTaxesRichesse)}</strong></li>
                        <li style="border-top: 1px solid grey; padding-top: 5px;"><strong>Total: +${format(totalRevenus)}</strong></li>
                    </ul>
                    <h4>Dépenses Publiques Mensuelles</h4>
                    <ul>
                        <li>Entretien des services publics: <strong>-${format(totalDepensesPubliques)}</strong></li>
                    </ul>
                    <h4>Solde Mensuel Prévisionnel</h4>
                    <strong style="color: ${solde >= 0 ? 'green' : 'red'};">${solde >= 0 ? '+' : ''}${format(solde)}</strong>
                `;
                break;
            }
            case 'batiments': {
                title = `Performance Économique de ${city.name}`;
                let totalMonthlyTurnover = 0;
                let totalShoppingRevenue = 0;
                let totalSalaries = 0;
                
                let buildingListHtml = '<ul style="font-size: 0.9em; list-style-type: none; padding-left: 0;">';
                
                for (const buildingName in city.config.buildings) {
                    const buildingInstance = city.config.buildings[buildingName];
                    if (!buildingInstance.active || buildingName === "Caserne") continue;

                    const monthlyTurnover = buildingInstance.monthlyTurnover || 0;
                    const monthlyShoppingRevenue = buildingInstance.monthlyShoppingRevenue || 0;
                    const totalBuildingRevenue = monthlyTurnover + monthlyShoppingRevenue;

                    totalMonthlyTurnover += monthlyTurnover;
                    totalShoppingRevenue += monthlyShoppingRevenue;

                    const employees = cityPop.filter(p => p.job?.building === buildingName);
                    const totalSlots = sim.jobSlots.filter(j => j.buildingName === buildingName && j.cityId === city.id).length;
                    
                    let salariesForBuilding = 0;
                    let buildingData;
                    for (const category in placeBuildingsData) {
                       if(placeBuildingsData[category][buildingName]) buildingData = placeBuildingsData[category][buildingName];
                    }
                    employees.forEach(emp => {
                         const baseSalary = (SimEngine.BASE_SALARIES[emp.job.tier] || 0);
                         const bonus = buildingData?.bonusFixePC || 0;
                         salariesForBuilding += (baseSalary + bonus) / SimEngine.GLOBAL_ECONOMY_DIVISOR;
                    });
                    totalSalaries += salariesForBuilding;

                    buildingListHtml += `<li style="margin-bottom: 5px; border-bottom: 1px dashed #ccc; padding-bottom: 5px;">
                        <strong>${buildingName} (x${buildingInstance.count})</strong><br>
                        <small>
                            Employés: ${employees.length}/${totalSlots} | Revenus: ${format(totalBuildingRevenue)}
                        </small>
                    </li>`;
                }
                buildingListHtml += '</ul>';

                const grandTotalRevenue = totalMonthlyTurnover + totalShoppingRevenue;
                const totalTaxes = totalMonthlyTurnover * 0.15;
                const netResult = grandTotalRevenue - totalSalaries - totalTaxes;

                content = `
                    <p>Performance réelle des bâtiments productifs pour le mois en cours.</p>
                    <h4>Bilan Économique Global (Mensuel)</h4>
                    <ul>
                        <li>Revenus d'activité (CA): <strong>${format(totalMonthlyTurnover)}</strong></li>
                        <li>Revenus des ventes directes: <strong>${format(totalShoppingRevenue)}</strong></li>
                        <li>Masse salariale versée: <strong>-${format(totalSalaries)}</strong></li>
                        <li>Taxes sur le CA versées: <strong>-${format(totalTaxes)}</strong></li>
                        <li style="border-top: 1px solid grey; padding-top: 5px;">
                            Bénéfice net des entreprises: 
                            <strong style="color: ${netResult >= 0 ? 'green' : 'red'};">${format(netResult)}</strong>
                        </li>
                    </ul>
                    <h4>Détails par Bâtiment</h4>
                    ${buildingListHtml}
                `;
                break;
            }
            case 'population': {
                title = `Analyse Sociale de ${city.name}`;
                const tiers = {0:{c:0,s:0},1:{c:0,s:0},2:{c:0,s:0},3:{c:0,s:0},4:{c:0,s:0},5:{c:0,s:0},6:{c:0,s:0}};
                
                adults.forEach(p => {
                    if (p.job && tiers.hasOwnProperty(p.job.tier)) {
                        const tier = p.job.tier;
                        const salary = (SimEngine.BASE_SALARIES[tier] || 0) / SimEngine.GLOBAL_ECONOMY_DIVISOR;
                        tiers[tier].c++;
                        tiers[tier].s += salary;
                    }
                });
                
                const raceDistribution = cityPop.reduce((acc, p) => { acc[p.race] = (acc[p.race] || 0) + 1; return acc; }, {});
                const sortedRaces = Object.entries(raceDistribution).sort((a,b) => b[1] - a[1]);

                content = `
                    <h4>Démographie</h4>
                    <ul>
                        <li>Adultes: ${adults.length}, Enfants: ${cityPop.length - adults.length}</li>
                        <li>Répartition: ${sortedRaces.map(([r,c]) => `${r} (${c})`).join(', ')}</li>
                    </ul>
                    <h4>Structure des Salaires (par mois)</h4>
                    <table style="width:100%; font-size:0.9em; text-align:left;">
                        <thead>
                            <tr><th>Tier</th><th>#</th><th>Salaire Moyen</th></tr>
                        </thead>
                        <tbody>
                            ${Object.keys(tiers).map(t => {
                                const count = tiers[t].c;
                                const avgSalary = count > 0 ? tiers[t].s / count : 0;
                                return count > 0 ? `<tr><td>Tier ${t}</td><td>${count}</td><td>${format(avgSalary)}</td></tr>` : '';
                            }).join('')}
                        </tbody>
                    </table>
                     <p>Le coût de la vie et les impôts personnels sont ensuite déduits de ces salaires.</p>
                `;
                break;
            }
            case 'etat': {
                title = `État de ${city.name}`;
                const cityStateData = SimEngine.CITY_STATES[city.state];
                const unemploymentRatio = adults.length > 0 ? oisifsList.length / adults.length : 0;
                const prestigeRatio = (city.baseStats.prestige > 0) ? city.dynamicStats.prestige / city.baseStats.prestige : 1;
                const menaceRatio = city.baseStats.menace > 0 ? city.dynamicStats.menace / city.baseStats.menace : (city.dynamicStats.menace > 0 ? 2 : 1);
                const healthScore = (prestigeRatio * 0.8) - (menaceRatio * 0.3) - (unemploymentRatio * 0.2);
                content = `
                    <p>L'état actuel <strong>${cityStateData.name}</strong> affecte l'économie de la cité, appliquant un modificateur de <strong>${(cityStateData.mod * 100).toFixed(0)}%</strong> au chiffre d'affaires des entreprises.</p>
                    <p>Il est calculé chaque année sur la base d'un score de santé.</p>
                    <h4>Calcul du score (${healthScore.toFixed(2)})</h4>
                    <ul>
                        <li>Ratio de Prestige: ${prestigeRatio.toFixed(2)}</li>
                        <li>Ratio de Menace: ${menaceRatio.toFixed(2)}</li>
                        <li>Ratio de Chômage: ${unemploymentRatio.toFixed(2)}</li>
                    </ul>`;
                break;
            }
            case 'emplois': {
                title = `Emplois à ${city.name}`;
                const cityJobs = sim.jobSlots.filter(j => j.cityId === city.id && (j.buildingName === "Caserne" || city.config.buildings[j.buildingName]?.active));
                const filledJobs = cityJobs.filter(j => j.isFilled);
                const unemploymentRate = adults.length > 0 ? (100 * oisifsList.length / adults.length).toFixed(0) : 0;
                const buildingJobCounts = {};
                cityJobs.forEach(j => {
                    if(!buildingJobCounts[j.buildingName]) buildingJobCounts[j.buildingName] = {filled: 0, total: 0};
                    buildingJobCounts[j.buildingName].total++;
                    if(j.isFilled) buildingJobCounts[j.buildingName].filled++;
                });

                content = `
                    <h4>Vue d'ensemble</h4>
                    <ul>
                        <li>Postes pourvus: ${filledJobs.length} / ${cityJobs.length}</li>
                        <li>Taux d'occupation: ${cityJobs.length > 0 ? (100 * filledJobs.length / cityJobs.length).toFixed(0) : 0}%</li>
                        <li>Taux de chômage (adultes): ${unemploymentRate}%</li>
                    </ul>
                    <h4>Postes par Bâtiment</h4>
                    <ul style="font-size:0.9em; max-height: 150px; overflow-y:auto;">
                        ${Object.entries(buildingJobCounts).map(([name, counts]) => `<li>${name}: ${counts.filled}/${counts.total}</li>`).join('')}
                    </ul>
                    `;
                break;
            }
            case 'prestige': {
                title = `Prestige de ${city.name}`;
                const prestigeFromUnemployment = Math.floor(oisifsList.length * 0.07);
                content = `
                    <p>Le prestige représente l'attractivité et l'honneur de la cité. Un prestige élevé attire les opportunités.</p>
                    <h4>Calcul du Prestige Dynamique (${Math.round(city.dynamicStats.prestige)})</h4>
                    <ul>
                        <li>Prestige de base (Bâtiments): <strong>${city.baseStats.prestige}</strong></li>
                        <li>Malus (Oisiveté): <strong>-${prestigeFromUnemployment}</strong></li>
                        ${city.tempPrestigePenalty > 0 ? `<li>Malus temporaire (Événements): <strong>-${city.tempPrestigePenalty}</strong></li>` : ''}
                    </ul>
                    <p>Du prestige additionnel peut être gagné via des projets civiques financés par un excès de trésorerie.</p>`;
                break;
            }
            case 'menace': {
                title = `Menace à ${city.name}`;
                const menaceFromUnemployment = Math.floor(oisifsList.length * 0.13);
                const criminals = adults.filter(p => p.job?.isCriminal);
                const menaceFromCriminals = criminals.reduce((sum, c) => sum + (SimEngine.CRIMINAL_MENACE_ADDITION[c.job.role] || 0), 0);
                const militiaCount = sim.jobSlots.filter(j=> j.isFilled && j.cityId === city.id && SimEngine.GUARD_ROLES.includes(j.role)).length;
                const militiaMenaceReduction = militiaCount * 10;
                const rawMenace = city.dynamicStats.rawMenace;
                content = `
                    <p>La menace représente le niveau de danger et d'insécurité. Une menace élevée peut entraîner des événements négatifs.</p>
                    <h4>Calcul de la Menace Nette (${Math.round(city.dynamicStats.menace)})</h4>
                    <p><em>Formule : (Total Brut) - (Réduction par la Milice)</em></p>
                    
                    <strong>Sources de Menace Brute (${Math.round(rawMenace)})</strong>
                    <ul>
                        <li>Menace de base (Bâtiments): ${city.baseStats.menace}</li>
                        <li>Oisiveté (${oisifsList.length}): +${menaceFromUnemployment}</li>
                        <li>Criminalité (${criminals.length}): +${menaceFromCriminals}</li>
                         ${(city.tempMenaceIncrease || 0) > 0 ? `<li>Migration récente: +${city.tempMenaceIncrease}</li>` : ''}
                    </ul>
                    <strong>Réduction de la Menace</strong>
                    <ul>
                         <li>Milice active (${militiaCount}): <strong>-${militiaMenaceReduction}</strong></li>
                    </ul>`;
                break;
            }
            case 'milice': {
                title = `Forces de l'ordre de ${city.name}`;
                const guardDetails = sim.jobSlots.filter(j => j.isFilled && j.cityId === city.id && SimEngine.GUARD_ROLES.includes(j.role));
                const militiaCount = guardDetails.length;
                const militiaMenaceReduction = militiaCount * 10;
                const rolesCount = guardDetails.reduce((acc, j) => { acc[j.role] = (acc[j.role] || 0) + 1; return acc; }, {});
                const sortedRoles = Object.entries(rolesCount).sort((a,b) => b[1]-a[1]);
                content = `
                    <p>Les forces de l'ordre réduisent la menace à raison de <strong>10 points par garde</strong>. Le recrutement à la caserne est déclenché par une augmentation de la menace brute.</p>
                    <ul>
                        <li>Gardes actifs: <strong>${militiaCount}</strong></li>
                        <li>Réduction de menace totale: <strong>-${militiaMenaceReduction}</strong></li>
                    </ul>
                    <h4>Composition des forces</h4>
                    <ul>
                        ${sortedRoles.map(([role, count]) => `<li>${role}: ${count}</li>`).join('') || '<li>Aucun membre actif</li>'}
                    </ul>`;
                break;
            }
            case 'oisifs': {
                title = `Oisifs à ${city.name}`;
                const unemploymentRate = adults.length > 0 ? (100 * oisifsList.length / adults.length).toFixed(0) : 0;
                const menaceFromUnemployment = Math.floor(oisifsList.length * 0.13);
                const prestigeFromUnemployment = Math.floor(oisifsList.length * 0.07);
                content = `
                    <p>Un "oisif" est un adulte en âge de travailler mais sans emploi. L'oisiveté a un impact direct sur la stabilité de la cité.</p>
                    <ul>
                        <li>Nombre d'oisifs: <strong>${oisifsList.length}</strong></li>
                        <li>Taux de chômage des adultes: ${unemploymentRate}%</li>
                    </ul>
                    <h4>Impact Négatif Mensuel</h4>
                    <ul>
                        <li>Augmentation de la Menace: <strong>+${menaceFromUnemployment}</strong></li>
                        <li>Réduction du Prestige: <strong>-${prestigeFromUnemployment}</strong></li>
                    </ul>`;
                break;
            }
            default: 
                content = `Les détails pour "<strong>${stat}</strong>" seront bientôt disponibles.`;
                title = `Détails de "${stat}"`; 
        } 
        return { title, content }; 
    }

    // --- EVENEMENTS ET CONTROLES ---
    let simInterval;

    function advanceMonth() { 
        SimEngine.advanceMonthLogicOnly(); 
        updateUI();
        updateOpenTooltip();
    }
    
    function runSimulation() { 
        if (sim.isRunning) { 
            clearInterval(simInterval); 
            sim.isRunning = false; 
            runSimBtn.textContent = "Lancer"; 
        } else { 
            sim.isRunning = true; 
            simInterval = setInterval(advanceMonth, 2100 - speedSlider.value); 
            runSimBtn.textContent = "Pauser"; 
        } 
    }

    function setupEventListeners() {
        runSimBtn.addEventListener('click', runSimulation);
        advanceMonthBtn.addEventListener('click', advanceMonth);
        speedSlider.addEventListener('input', () => {
            if (sim.isRunning) {
                clearInterval(simInterval);
                simInterval = setInterval(advanceMonth, 2100 - speedSlider.value);
            }
        });
        searchInput.addEventListener('input', handleSearchInput);
        searchResults.addEventListener('click', (e) => {
            const item = e.target.closest('.search-item');
            if (item) selectPersonFromSearch(parseInt(item.dataset.personId));
        });
        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target)) searchResults.style.display = 'none';
        });
        
        modalCloseBtn.addEventListener('click', () => {
            personModal.style.display = 'none';
        });
        personModal.addEventListener('click', (e) => {
            if (e.target === personModal) {
                personModal.style.display = 'none';
            }
        });

        document.body.addEventListener('click', (e) => {
            if (e.target.matches('.stat-tooltip-trigger')) {
                const stat = e.target.dataset.stat;
                const cityId = parseInt(e.target.dataset.cityId, 10);
                if (!sim.currentRegion || isNaN(cityId)) return;
                
                openTooltipState = { stat, cityId };
                
                const city = sim.currentRegion.places.find(p => p.id === cityId);
                if (!city) return;

                const { title, content } = getStatDetails(stat, city);
                detailsModal.querySelector('#details-modal-title').textContent = title;
                detailsModal.querySelector('#details-modal-content').innerHTML = content;
                detailsModal.style.display = 'block';
                detailsModal.style.left = `${(window.innerWidth / 2) - (detailsModal.offsetWidth / 2)}px`;
                detailsModal.style.top = `${(window.innerHeight / 2) - (detailsModal.offsetHeight / 2)}px`;
            }
        });
        initDraggableModal();
    }

    function initDraggableModal() { 
        const header = detailsModal.querySelector('.modal-header'); 
        const closeBtn = detailsModal.querySelector('.close-btn'); 
        let isDragging = false; 
        let offset = { x: 0, y: 0 }; 
        
        header.addEventListener('mousedown', (e) => { 
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON') return; 
            isDragging = true; 
            offset.x = e.clientX - detailsModal.offsetLeft; 
            offset.y = e.clientY - detailsModal.offsetTop; 
            header.style.cursor = 'grabbing'; 
            document.body.style.userSelect = 'none'; 
        }); 
        document.addEventListener('mousemove', (e) => { 
            if (!isDragging) return; 
            e.preventDefault(); 
            let newX = e.clientX - offset.x; 
            let newY = e.clientY - offset.y; 
            newX = Math.max(0, Math.min(newX, window.innerWidth - detailsModal.offsetWidth)); 
            newY = Math.max(0, Math.min(newY, window.innerHeight - detailsModal.offsetHeight)); 
            detailsModal.style.left = `${newX}px`; 
            detailsModal.style.top = `${newY}px`; 
        }); 
        document.addEventListener('mouseup', () => { 
            isDragging = false; 
            header.style.cursor = 'move'; 
            document.body.style.userSelect = 'auto'; 
        }); 
        
        closeBtn.addEventListener('click', () => {
            detailsModal.style.display = 'none';
            openTooltipState = null;
        }); 
    }
    
    // --- Lancement de l'initialisation de l'UI ---
    init();
});