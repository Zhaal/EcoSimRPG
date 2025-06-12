document.addEventListener('DOMContentLoaded', () => {
    // --- SÉLECTEURS D'ÉLÉMENTS DU DOM ---
    const regionSelect = document.getElementById('region-select');
    const placesList = document.getElementById('places-config-list');
    const configFormContainer = document.getElementById('config-form-container');
    const configForm = document.getElementById('place-config-form');
    const configFormTitle = document.getElementById('config-form-title');
    const configPlaceholder = document.getElementById('config-placeholder');
    const capitalStatsContent = document.getElementById('capital-stats-content');
    const buildingTooltip = document.getElementById('building-tooltip');
    const simulateRevenueBtn = document.getElementById('simulate-revenue-btn');
    const simulationModal = document.getElementById('revenue-simulation-modal');
    const closeSimulationModalBtn = document.getElementById('close-simulation-modal');

    // --- SÉLECTEURS DE LA FENÊTRE MODALE ---
    const simEcoSystemSelect = document.getElementById('sim-eco-system');
    const simEtatInitialSelect = document.getElementById('sim-etat-initial');
    const crisisSlider = document.getElementById('crisis-slider');
    const crisisSliderValue = document.getElementById('crisis-slider-value');
    
    // --- NOUVEAUX SÉLECTEURS POUR LA MODALE DES SALAIRES ---
    const salaryModal = document.getElementById('draggable-salary-modal');
    const salaryModalTitle = document.getElementById('draggable-modal-title');
    const salaryModalContent = document.getElementById('draggable-modal-content');
    const salaryModalCloseBtn = document.getElementById('draggable-modal-close');
    const btnAvgSalaries = document.getElementById('btn-avg-salaries');
    const btnAdminSalaries = document.getElementById('btn-admin-salaries');
    const btnEnterpriseSalaries = document.getElementById('btn-enterprise-salaries');


    // --- VARIABLES D'ÉTAT ---
    const STORAGE_KEY = 'ecoSimRPG_data';
    let regions = [];
    let currentRegion = null;
    let selectedPlace = null;
    
    // --- CONSTANTES DE CONFIGURATION ---
    const PLACE_TYPE_DEFAULTS = {
        'Capitale': { "Ressource principale": "Commerce" },
        'Ville': { "Ressource principale": "Artisanat" },
        'Bourg': { "Ressource principale": "Agriculture" },
        'Village': { "Ressource principale": "Bois" },
        'Hameau': { "Ressource principale": "Chasse" },
    };
    const etatRevenueModifier = {
        'Prospère': 1.20, 'Croissante': 1.10, 'Stable': 1.0, 
        'Fragile': 0.90, 'Difficile': 0.75, 'Décadente': 0.60, 'En crise': 0.50
    };

    // --- FONCTIONS DE GESTION DES DONNÉES ---
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

    // --- FONCTIONS D'AFFICHAGE ET D'INTERFACE ---
    function populateRegionSelect() {
        regionSelect.innerHTML = '<option value="">Aucune région sélectionnée</option>';
        regions.forEach((region, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = region.name;
            regionSelect.appendChild(option);
        });
    }

    function displayPlacesList() {
        placesList.innerHTML = '';
        if (!currentRegion) {
            placesList.innerHTML = '<li class="placeholder-text">Sélectionnez d\'abord une région.</li>';
            return;
        }
        if (currentRegion.places.length === 0) {
            placesList.innerHTML = '<li class="placeholder-text">Aucun lieu dans cette région.</li>';
            return;
        }

        currentRegion.places.forEach(place => {
            const li = document.createElement('li');
            li.dataset.placeId = place.id;
            li.innerHTML = `
                <div>${place.name}</div>
                <div class="place-type">(${place.type})</div>
            `;
            if(selectedPlace && selectedPlace.id === place.id) {
                li.classList.add('active');
            }
            li.addEventListener('click', () => handlePlaceSelection(place.id));
            placesList.appendChild(li);
        });
    }

    function displayConfigForm() {
        if (!selectedPlace) {
            configPlaceholder.hidden = false;
            configForm.hidden = true;
            configFormTitle.textContent = 'Configuration du Lieu';
            return;
        }

        configPlaceholder.hidden = true;
        configForm.hidden = false;
        
        if (selectedPlace.type === 'Capitale') {
            displayCapitaleConfigForm(selectedPlace);
            return;
        }
        
    }

    function displayCapitaleConfigForm(place) {
        configFormTitle.textContent = `Configuration Avancée : ${place.name}`;
        configForm.innerHTML = ''; 

        const capitalBuildings = EcoSimData.buildings['Capitale'];

        if (!place.config || place.config.systemeEconomique === undefined) {
            const defaults = PLACE_TYPE_DEFAULTS[place.type] || {};
            place.config = {
                "Ressource principale": defaults["Ressource principale"] || "Commerce",
                systemeEconomique: 'Libéral',
                etatInitial: 'Stable',
                citeBelliqueuse: false,
                pegrePresente: false,
                taxeSource: 10,
                batiments: {}
            };
            for (const category in capitalBuildings) {
                place.config.batiments[category] = {};
                for (const buildingName in capitalBuildings[category]) {
                    place.config.batiments[category][buildingName] = category === "Bâtiments Administratifs";
                }
            }
            saveData();
        }
        const config = place.config;

        let formHTML = `
            <div class="capital-config-grid">
                <div class="config-column">
                    <fieldset>
                        <legend>Situation économique et sociale</legend>
                        <div class="form-group">
                            <label for="cap-eco-system">Système économique :</label>
                            <select id="cap-eco-system" name="systemeEconomique" data-config-key="systemeEconomique">
                                <option value="Communiste" ${config.systemeEconomique === 'Communiste' ? 'selected' : ''}>Communiste</option>
                                <option value="Libéral" ${config.systemeEconomique === 'Libéral' ? 'selected' : ''}>Libéral</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="cap-start-state">État de départ :</label>
                            <select id="cap-start-state" name="etatInitial" data-config-key="etatInitial">
                                ${Object.keys(etatRevenueModifier).map(e => `<option value="${e}" ${config.etatInitial === e ? 'selected' : ''}>${e}</option>`).join('')}
                            </select>
                             <p class="remark">Influence le prestige, la menace et la nourriture.</p>
                        </div>
                    </fieldset>

                    <fieldset>
                        <legend>Caractéristiques supplémentaires</legend>
                        <div class="form-group-checkbox">
                            <input type="checkbox" id="cap-belliqueuse" name="citeBelliqueuse" data-config-key="citeBelliqueuse" ${config.citeBelliqueuse ? 'checked' : ''}>
                            <label for="cap-belliqueuse">Cité Belliqueuse</label>
                        </div>
                         <div class="form-group-checkbox">
                            <input type="checkbox" id="cap-pegre" name="pegrePresente" data-config-key="pegrePresente" ${config.pegrePresente ? 'checked' : ''}>
                            <label for="cap-pegre">Pègre présente</label>
                        </div>
                    </fieldset>
                </div>
                <div class="config-column-large">
                    <fieldset>
                        <legend>Bâtiments et activités</legend>
                        <p class="remark">Déterminent les emplois, services, attractivité et production.</p>
                        <div class="building-actions">
                            <button type="button" class="btn-secondary btn-sm" id="btn-check-all">Tout cocher</button>
                            <button type="button" class="btn-secondary btn-sm" id="btn-uncheck-all">Tout décocher</button>
                            <button type="button" class="btn-secondary btn-sm" id="btn-check-random">Coche Aléatoire</button>
                        </div>
                        <div class="buildings-container">
                            ${Object.entries(capitalBuildings).map(([category, buildings]) => `
                                <div class="building-category">
                                    <h5>${category}</h5>
                                    <div class="building-list">
                                        ${Object.entries(buildings).map(([name, info]) => {
                                            const idName = name.replace(/\s|'/g, '-');
                                            const isAdministrative = category === "Bâtiments Administratifs";
                                            return `
                                            <div class="form-group-checkbox small">
                                                <input type="checkbox" id="building-${idName}" name="${name}" data-category="${category}" 
                                                       ${isAdministrative ? 'checked disabled' : (config.batiments[category]?.[name] ? 'checked' : '')}>
                                                <label for="building-${idName}">
                                                    <span title="${info.description}">${name}</span>
                                                    <span class="info-icon" data-category="${category}" data-name="${name}">?</span>
                                                </label>
                                            </div>
                                        `}).join('')}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </fieldset>
                </div>
            </div>
        `;
        configForm.innerHTML = formHTML;
        bindCapitalFormEvents();
    }

    function updateCapitalStats() {
        if (!selectedPlace || selectedPlace.type !== 'Capitale') {
            capitalStatsContent.innerHTML = '<p class="placeholder-text">Sélectionnez une capitale pour afficher ses statistiques.</p>';
            if(simulateRevenueBtn) simulateRevenueBtn.hidden = true;
            return;
        }

        const config = selectedPlace.config;
        const capitalBuildings = EcoSimData.buildings['Capitale'];
        let totalPrestige = 0;
        let totalMenace = 0;
        let populationRequise = 0;
        let revenusBrutsPrive = 0;
        let chargesPrivees = 0;
        let chargesPubliques = 0;

        for (const category in config.batiments) {
            for (const buildingName in config.batiments[category]) {
                if (config.batiments[category][buildingName]) {
                    const details = capitalBuildings[category]?.[buildingName];
                    if (!details) continue;

                    populationRequise += calculatePopulationFromJobs(details);
                    totalPrestige += details.prestige || 0;
                    totalMenace += details.menace || 0;
                    
                    const buildingCharge = parsePO(details.chargeFixe) + (parsePO(details.chargeMax) / 12);
                    if (category === 'Bâtiments Administratifs') {
                        chargesPubliques += buildingCharge;
                    } else {
                        revenusBrutsPrive += parsePO(details.chiffreAffairesMax);
                        chargesPrivees += buildingCharge;
                    }
                }
            }
        }
        
        const beneficeNetPrive = revenusBrutsPrive - chargesPrivees;
        
        const etatPrestige = { 'Prospère': 50, 'Croissante': 25, 'Stable': 0, 'Fragile': -10, 'Difficile': -25, 'Décadente': -50, 'En crise': -100 };
        const etatMenace = { 'Prospère': -10, 'Croissante': 0, 'Stable': 5, 'Fragile': 10, 'Difficile': 20, 'Décadente': 30, 'En crise': 50 };
        totalPrestige += etatPrestige[config.etatInitial] || 0;
        totalMenace += etatMenace[config.etatInitial] || 0;

        if (config.citeBelliqueuse) {
            totalPrestige += 10;
            totalMenace += 20;
        }
        if (config.pegrePresente) {
            totalPrestige -= 15;
            totalMenace += 30;
        }

        capitalStatsContent.innerHTML = `
            <div class="stat-item"><strong>Prestige Total:</strong> <span>${totalPrestige}</span></div>
            <div class="stat-item"><strong>Menace Totale:</strong> <span>${totalMenace}</span></div>
            <div class="stat-item"><strong>Total des Postes:</strong> <span>${populationRequise.toLocaleString('fr-FR')}</span></div>
            <div class="stat-item"><strong>Système:</strong> <span>${config.systemeEconomique}</span></div>
            <div class="stat-item"><strong>État:</strong> <span>${config.etatInitial}</span></div>
            <hr style="border-top: 1px solid var(--color-border); margin: 8px 0;">
            <div class="stat-item"><strong>Revenus Bruts (privé):</strong> <span>${EcoSim.formatCurrency(revenusBrutsPrive)}</span></div>
            <div class="stat-item"><strong>Bénéfice Net (privé):</strong> <span style="color: ${beneficeNetPrive >= 0 ? 'var(--color-forest-green)' : 'var(--color-error)'}">${EcoSim.formatCurrency(beneficeNetPrive)}</span></div>
            <div class="stat-item"><strong>Charges Publiques:</strong> <span>${EcoSim.formatCurrency(chargesPubliques)}</span></div>
        `;
        if(simulateRevenueBtn) simulateRevenueBtn.hidden = false;
    }

    // --- FONCTIONS DE SIMULATION ---
    function runAndDisplaySimulation(activeCrises = {}) {
        if (!selectedPlace || selectedPlace.type !== 'Capitale') return;

        const tempPlace = JSON.parse(JSON.stringify(selectedPlace));

        tempPlace.config.systemeEconomique = document.getElementById('sim-eco-system').value;
        tempPlace.config.etatInitial = document.getElementById('sim-etat-initial').value;

        const capitalBuildings = EcoSimData.buildings['Capitale'];
        let results;

        const taxSettingsFieldset = document.getElementById('tax-settings-fieldset');
        taxSettingsFieldset.style.display = tempPlace.config.systemeEconomique === 'Libéral' ? 'block' : 'none';

        if (tempPlace.config.systemeEconomique === 'Libéral') {
            const taxRates = {
                sales: parseFloat(document.getElementById('tax-sales').value) || 0,
                profit: parseFloat(document.getElementById('tax-profit').value) || 0,
                property: parseFloat(document.getElementById('tax-property').value) || 0,
                payroll: parseFloat(document.getElementById('tax-payroll').value) || 0,
            };
            results = EcoSim.calculateLiberalEconomy(tempPlace, activeCrises, capitalBuildings, etatRevenueModifier, taxRates);
        } else { // Communiste
            results = EcoSim.calculateCommunistEconomy(tempPlace, activeCrises, capitalBuildings, etatRevenueModifier);
        }
        
        window.currentSimulationResults = results;
        displaySimulationResults(results, tempPlace.config);
    }
    
    function displaySimulationResults(results, currentSimConfig) {
        const fm = (n) => n.toLocaleString('fr-FR');
        const fmp = (n) => EcoSim.formatCurrency(n);
    
        document.getElementById('simulation-params').innerHTML = `
            <div class="form-group">
                <label for="sim-eco-system">Système économique :</label>
                <select id="sim-eco-system" name="systemeEconomique">
                    <option value="Libéral" ${currentSimConfig.systemeEconomique === 'Libéral' ? 'selected' : ''}>Libéral</option>
                    <option value="Communiste" ${currentSimConfig.systemeEconomique === 'Communiste' ? 'selected' : ''}>Communiste</option>
                </select>
            </div>
            <div class="form-group">
                <label for="sim-etat-initial">État de départ :</label>
                <select id="sim-etat-initial" name="etatInitial">
                    ${Object.keys(etatRevenueModifier).map(e => `<option value="${e}" ${currentSimConfig.etatInitial === e ? 'selected' : ''}>${e}</option>`).join('')}
                </select>
            </div>
        `;
        document.getElementById('sim-eco-system').addEventListener('change', () => runAndDisplaySimulation({}));
        document.getElementById('sim-etat-initial').addEventListener('change', () => runAndDisplaySimulation({}));
    
        const gdpClass = results.gdp >= 0 ? 'positive' : 'negative';
        const employmentClass = results.employment.rate >= 90 ? 'positive' : (results.employment.rate >= 75 ? 'neutral' : 'negative');
        
        let keyIndicatorsHTML = `<div style="display: flex; justify-content: space-between; gap: 20px; flex-wrap: wrap;">`;
        keyIndicatorsHTML += `<div style="flex: 1; min-width: 250px;">`;
        keyIndicatorsHTML += `<p><strong>PIB (Prod. Interne Brute):</strong> <span class="${gdpClass}">${fmp(results.gdp)}</span></p>`;
        keyIndicatorsHTML += `<p class="remark" style="margin-top: -5px;">Valeur totale des biens et services produits.</p>`;
        keyIndicatorsHTML += `<p style="margin-top: 10px;"><strong>Taux d'emploi:</strong> <span class="${employmentClass}">${results.employment.rate.toFixed(1)}%</span></p>`;
        keyIndicatorsHTML += `<p class="remark" style="margin-top: -5px;">${fm(results.employment.employed)} employés sur ${fm(results.employment.totalJobs)} postes.</p>`;
        keyIndicatorsHTML += `</div>`;

        if (currentSimConfig.systemeEconomique === 'Libéral' && results.publicFinance) {
            const taxes = results.publicFinance.revenueDetail;
            keyIndicatorsHTML += `<div class="tax-breakdown" style="flex: 1; min-width: 250px; border-left: 1px solid var(--color-border); padding-left: 20px;">`;
            keyIndicatorsHTML += `
                <p style="margin-top:0;">
                    <strong>Détail des Impôts (Revenus de la Cité):</strong>
                </p>
                <ul style="list-style-position: inside; padding-left: 5px; font-size: 0.9em; color: var(--color-dark-text); margin:0;">
                    <li>Ventes: <span style="font-weight:bold; color: var(--color-forest-green);">${fmp(taxes.sales)}</span></li>
                    <li>Bénéfices: <span style="font-weight:bold; color: var(--color-forest-green);">${fmp(taxes.profit)}</span></li>
                    <li>Taxe Foncière: <span style="font-weight:bold; color: var(--color-forest-green);">${fmp(taxes.property)}</span></li>
                    <li>Charges Salariales: <span style="font-weight:bold; color: var(--color-forest-green);">${fmp(taxes.payroll)}</span></li>
                </ul>
            `;
            keyIndicatorsHTML += `</div>`;
        }
        keyIndicatorsHTML += `</div>`;
        document.getElementById('key-indicators').innerHTML = keyIndicatorsHTML;
        
        document.getElementById('social-distribution').innerHTML = `
            <p><strong>Total Emplois Pourvus: </strong> ${fm(results.employment.employed)} / ${fm(results.employment.totalJobs)}</p>
            <p style="font-size:0.85em;">
                T0: ${results.jobsByTier[0]} | T1: ${results.jobsByTier[1]} | T2: ${results.jobsByTier[2]} | 
                T3: ${results.jobsByTier[3]} | T4: ${results.jobsByTier[4]} | T5: ${results.jobsByTier[5]}
            </p>
        `;
    
        let tableHTML = `<table class="simulation-table"><thead><tr><th>Bâtiment</th><th>Revenu</th><th>Entretien</th><th>Salaires</th><th>Coût Total</th><th>Bénéfice Net</th><th>Taxe Vente</th><th>Taxe Profit</th><th>Taxe Prop.</th><th>Taxe Salari.</th></tr></thead><tbody>`;
        for (const category in results.categories) {
            const categoryData = results.categories[category];
            if (categoryData.buildings.length > 0) {
                tableHTML += `<tr><td colspan="10" class="category-header">${category}</td></tr>`;
                categoryData.buildings.forEach(b => {
                    const netClass = b.net > 0 ? 'positive' : (b.net < 0 ? 'negative' : '');
                    
                    tableHTML += `<tr>
                        <td>${b.name}</td>
                        <td>${fmp(b.revenue)}</td>
                        <td>${fmp(b.fixedCost)}</td>
                        <td>${fmp(b.salaryCost)}</td>
                        <td>${fmp(b.totalCost)}</td>
                        <td class="${netClass}">${fmp(b.net)}</td>
                        <td>${fmp(b.taxes?.sales)}</td>
                        <td>${fmp(b.taxes?.profit)}</td>
                        <td>${fmp(b.taxes?.property)}</td>
                        <td>${fmp(b.taxes?.payroll)}</td>
                    </tr>`;
                });
                const catTotals = categoryData.totals;
                const catNetClass = catTotals.net > 0 ? 'positive' : 'negative';
                
                const catTaxes = catTotals.taxes || { sales: 0, profit: 0, property: 0, payroll: 0 };

                tableHTML += `<tr class="subtotal-row">
                    <td>Total ${category}</td>
                    <td>${fmp(catTotals.revenue)}</td>
                    <td>${fmp(catTotals.fixedCost)}</td>
                    <td>${fmp(catTotals.salaryCost)}</td>
                    <td>${fmp(catTotals.totalCost)}</td>
                    <td class="${catNetClass}">${fmp(catTotals.net)}</td>
                    <td>${fmp(catTaxes.sales)}</td>
                    <td>${fmp(catTaxes.profit)}</td>
                    <td>${fmp(catTaxes.property)}</td>
                    <td>${fmp(catTaxes.payroll)}</td>
                </tr>`;
            }
        }
        tableHTML += '</tbody></table>';
        document.getElementById('simulation-details-container').innerHTML = tableHTML;
    
        let summaryHTML = '';
        if (currentSimConfig.systemeEconomique === 'Libéral') {
             const balanceClass = results.publicFinance.balance >= 0 ? 'positive' : 'negative';
             summaryHTML = `
                 <fieldset style="padding: 10px;">
                    <legend>Bilan Financier Mensuel</legend>
                    <div class="financial-summary-grid">
                        <div class="summary-box neutral">
                            <h4>Total des Taxes</h4>
                            <p>${fmp(results.publicFinance.revenue)}</p>
                            <small>(Revenus de la Cité)</small>
                        </div>
                        <div class="summary-box negative">
                            <h4>Charges Publiques</h4>
                            <p>${fmp(results.publicFinance.costs)}</p>
                            <small>(Entretien des services publics)</small>
                        </div>
                        <div class="summary-box ${balanceClass}">
                            <h4>Solde de la Cité</h4>
                            <p>${fmp(results.publicFinance.balance)}</p>
                            <small>(Excédent ou déficit mensuel)</small>
                        </div>
                    </div>
                 </fieldset>
             `;
        } else { // Communist
             const communalNet = results.communalNet || 0;
             const balanceClass = communalNet >= 0 ? 'positive' : 'negative';
             summaryHTML = `
                 <fieldset style="padding: 10px;">
                    <legend>Bilan Financier Mensuel</legend>
                    <div class="financial-summary-grid">
                         <div class="summary-box ${balanceClass}">
                             <h4>Bilan Communautaire</h4>
                             <p>${fmp(communalNet)}</p>
                             <small>(Bénéfice ou perte de la communauté)</small>
                         </div>
                    </div>
                 </fieldset>
             `;
        }
        document.getElementById('financial-summary').innerHTML = summaryHTML;
    }


    // --- FONCTIONS UTILITAIRES ---
    const parsePO = (valueString) => {
        if (!valueString || typeof valueString !== 'string') return 0;
        const match = valueString.match(/^([\d\s]+)/);
        return match ? parseInt(match[1].replace(/\s/g, ''), 10) : 0;
    };

    const calculatePopulationFromJobs = (building) => {
        if (!building || !building.emplois) return 0;
        return building.emplois.reduce((total, jobString) => {
            const match = jobString.match(/(\d+)\s+poste/);
            return total + (match ? parseInt(match[1], 10) : 0);
        }, 0);
    };

    function makeModalDraggable(modal, header) {
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        header.onmousedown = dragMouseDown;

        function dragMouseDown(e) {
            e = e || window.event;
            e.preventDefault();
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
        }

        function elementDrag(e) {
            e = e || window.event;
            e.preventDefault();
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            modal.style.top = (modal.offsetTop - pos2) + "px";
            modal.style.left = (modal.offsetLeft - pos1) + "px";
        }

        function closeDragElement() {
            document.onmouseup = null;
            document.onmousemove = null;
        }
    }
    
    function showAverageSalariesModal() {
        const results = window.currentSimulationResults;
        if (!results || !results.categories) return;
        
        salaryModalTitle.textContent = "Salaires Moyens par Tiers";

        const salariesByTier = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [] };

        for (const categoryName in results.categories) {
            for (const building of results.categories[categoryName].buildings) {
                if (building.salariesPerEmployee && building.jobsByTier) {
                    for (let tier = 0; tier <= 5; tier++) {
                        const numEmployees = building.jobsByTier[tier] || 0;
                        if (numEmployees > 0) {
                            const individualSalary = building.salariesPerEmployee[tier] || 0;
                            for (let i = 0; i < numEmployees; i++) {
                                salariesByTier[tier].push(individualSalary);
                            }
                        }
                    }
                }
            }
        }
        
        let contentHTML = '<div class="average-salary-grid">';
        for (let tier = 0; tier <= 5; tier++) {
            const salaries = salariesByTier[tier];
            let averageSalary = 0;
            if (salaries.length > 0) {
                const sum = salaries.reduce((a, b) => a + b, 0);
                averageSalary = sum / salaries.length;
            }
            contentHTML += `
                <div class="average-salary-item">
                    <span class="tier-title">Tiers ${tier}</span>
                    <span class="salary-value">${EcoSim.formatCurrency(averageSalary)}/mois</span>
                    <span class="employee-count">${salaries.length} employés</span>
                </div>
            `;
        }
        contentHTML += '</div>';
        
        salaryModalContent.innerHTML = contentHTML;
        salaryModal.hidden = false;
    }

    function showBuildingSalariesModal(type) {
        const results = window.currentSimulationResults;
        if (!results) return;

        const isAdmin = type === 'admin';
        salaryModalTitle.textContent = isAdmin ? "Salaires par Bâtiment Administratif" : "Salaires par Entreprise";

        const buildings = [];
        for (const categoryName in results.categories) {
            if ((isAdmin && categoryName === "Bâtiments Administratifs") || (!isAdmin && categoryName !== "Bâtiments Administratifs")) {
                results.categories[categoryName].buildings.forEach(b => buildings.push({ ...b, category: categoryName }));
            }
        }
        
        let noticeHTML = '';
        if (isAdmin) {
            noticeHTML = `
                <div class="admin-perks-notice">
                    <h5 class="notice-title">Note sur les avantages</h5>
                    <p>Les employés des bâtiments administratifs bénéficient de la gratuité du logement et de la nourriture.</p>
                    <ul>
                        <li><strong>Tiers 1-2 :</strong> Logement de Tiers A</li>
                        <li><strong>Tiers 3 :</strong> Logement de Tiers B</li>
                        <li><strong>Tiers 4-5 :</strong> Logement de Tiers C</li>
                    </ul>
                </div>
            `;
        }
        
        let contentHTML = `
            ${noticeHTML}
            <div class="form-group">
                <label for="building-salary-select">Choisir un bâtiment :</label>
                <select id="building-salary-select">
                    <option value="">-- Sélectionnez --</option>
                    ${buildings.map(b => `<option value="${b.name}">${b.name}</option>`).join('')}
                </select>
            </div>
            <div id="salary-details-container">
                 <p class="placeholder-text">Sélectionnez un bâtiment pour voir le détail des salaires.</p>
            </div>
        `;
        salaryModalContent.innerHTML = contentHTML;

        const select = document.getElementById('building-salary-select');
        select.addEventListener('change', (event) => {
            const buildingName = event.target.value;
            const detailsContainer = document.getElementById('salary-details-container');
            if (!buildingName) {
                detailsContainer.innerHTML = '<p class="placeholder-text">Sélectionnez un bâtiment pour voir le détail des salaires.</p>';
                return;
            }
            
            const building = buildings.find(b => b.name === buildingName);
            if (!building) return;
            
            const buildingData = EcoSimData.buildings['Capitale'][building.category]?.[building.name];
            const jobsByTierMap = {};
            if (buildingData && buildingData.emplois) {
                buildingData.emplois.forEach(jobString => {
                    const tierMatch = jobString.match(/Tiers (\d+)/);
                    const jobNameMatch = jobString.match(/:\s*([^()]+)/);
                    if (tierMatch && jobNameMatch) {
                        const tier = parseInt(tierMatch[1], 10);
                        const jobName = jobNameMatch[1].trim();
                        if (!jobsByTierMap[tier]) {
                            jobsByTierMap[tier] = [];
                        }
                        jobsByTierMap[tier].push(jobName);
                    }
                });
            }

            let detailsHTML = '';
            for (let tier = 0; tier <= 5; tier++) {
                const individualSalary = building.salariesPerEmployee?.[tier] || 0;
                const numEmployees = building.jobsByTier?.[tier] || 0;
                if (numEmployees > 0) {
                     detailsHTML += `
                        <div class="tier-salary-group">
                            <h5>Tiers ${tier}</h5>
                            <span class="salary-info">${numEmployees} employé(s) à ${EcoSim.formatCurrency(individualSalary)}/mois</span>
                            ${(jobsByTierMap[tier] && jobsByTierMap[tier].length > 0) ? `
                                <div class="job-list-title">Postes :</div>
                                <div class="job-list">
                                    ${jobsByTierMap[tier].map(job => `<span class="job-name">${job}</span>`).join('')}
                                </div>
                            ` : ''}
                        </div>`;
                }
            }
            detailsContainer.innerHTML = detailsHTML || '<p>Aucune donnée de salaire pour ce bâtiment.</p>';
        });

        salaryModal.hidden = false;
    }

    // --- GESTION DES ÉVÉNEMENTS ---
    function handleRegionChange() {
        const selectedIndex = regionSelect.value;
        selectedPlace = null;
        currentRegion = selectedIndex !== "" ? regions[selectedIndex] : null;
        displayPlacesList();
        displayConfigForm();
        updateCapitalStats(); 
    }

    function handlePlaceSelection(placeId) {
        selectedPlace = currentRegion.places.find(p => p.id === placeId);
        displayPlacesList(); 
        displayConfigForm();
        updateCapitalStats(); 
    }
    
    function handleCapitaleConfigChange(event) {
        if (!selectedPlace || !selectedPlace.config) return;
        const key = event.target.dataset.configKey;
        const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
        selectedPlace.config[key] = value;
        saveData();
        updateCapitalStats();
    }

    function handleCapitaleBuildingChange(event) {
        if (!selectedPlace || !selectedPlace.config) return;
        const checkbox = event.target;
        const category = checkbox.dataset.category;
        const buildingName = checkbox.name;

        if (category === 'Bâtiments Administratifs') {
            checkbox.checked = true;
            return;
        }

        if (selectedPlace.config.batiments[category]) {
            selectedPlace.config.batiments[category][buildingName] = checkbox.checked;
            saveData();
            updateCapitalStats();
        }
    }
    
    function showBuildingTooltip(event) {
        const icon = event.target;
        const category = icon.dataset.category;
        const name = icon.dataset.name;
        const building = EcoSimData.buildings['Capitale'][category]?.[name];
        
        if (!building) return;
    
        let buildingSimResult = null;
        if (simulationModal.style.display === 'flex' && window.currentSimulationResults) {
            const categoryResult = window.currentSimulationResults.categories[category];
            if (categoryResult) {
                buildingSimResult = categoryResult.buildings.find(b => b.name === name);
            }
        }
    
        const formatValue = (value) => value !== undefined ? value.toLocaleString('fr-FR') : 'N/A';
        const formatMoney = (value) => {
             const po = parsePO(value);
             return po > 0 ? EcoSim.formatCurrency(po) : value;
        }
    
        let tooltipContent = `
            <h4>${name}</h4>
            <p class="description">${building.description}</p>
            <hr>
            <div class="stats-grid">
        `;
    
        if (building.prestige !== undefined) {
            tooltipContent += `<span>Prestige</span><span>+${formatValue(building.prestige)}</span>`;
        }
        if (building.menace !== undefined) {
            const menaceClass = building.menace > 0 ? 'menace-pos' : 'menace-neg';
            tooltipContent += `<span>Menace</span><span class="${menaceClass}">${building.menace > 0 ? '+' : ''}${formatValue(building.menace)}</span>`;
        }
        if (building.coutConstruction) {
            tooltipContent += `<span>Coût Construction</span><span>${formatMoney(building.coutConstruction)}</span>`;
        }
        if (building.chiffreAffairesMax) {
            tooltipContent += `<span>Revenu Max.</span><span>${formatMoney(building.chiffreAffairesMax)}</span>`;
        }
         if (building.beneficeMax) {
            tooltipContent += `<span>Bénéfice Max.</span><span>${formatMoney(building.beneficeMax)}</span>`;
        }
        if (building.chargeFixe) {
            tooltipContent += `<span>Charge Fixe</span><span>${formatMoney(building.chargeFixe)}</span>`;
        }
        if (building.chargeMax) {
            tooltipContent += `<span>Masse Salariale Annuelle</span><span>${formatMoney(building.chargeMax)}</span>`;
        }
    
        tooltipContent += `</div>`;
    
        if (building.emplois && building.emplois.length > 0) {
            tooltipContent += `<hr><h5>Emplois & Salaires individuels (simulés)</h5><ul>`;
            building.emplois.forEach(job => {
                let salaryInfo = '';
                const tierMatch = job.match(/Tiers (\d+)/);
                if (buildingSimResult && tierMatch && buildingSimResult.salariesPerEmployee) {
                    const tier = tierMatch[1];
                    const individualSalary = buildingSimResult.salariesPerEmployee[tier];
                    if (individualSalary !== undefined) {
                        salaryInfo = ` <span style="color: var(--color-forest-green); font-weight: bold;">(${EcoSim.formatCurrency(individualSalary)}/mois)</span>`;
                    }
                }
                tooltipContent += `<li>${job.split('(mixte)')[0]}${salaryInfo}</li>`;
            });
            tooltipContent += `</ul>`;
        }
    
        buildingTooltip.innerHTML = tooltipContent;
        buildingTooltip.hidden = false;
        moveBuildingTooltip(event);
    }

    function hideBuildingTooltip() {
        buildingTooltip.hidden = true;
    }

    function moveBuildingTooltip(event) {
        let x = event.clientX + 15;
        let y = event.clientY + 15;
        if (x + buildingTooltip.offsetWidth > window.innerWidth) x = window.innerWidth - buildingTooltip.offsetWidth - 10;
        if (y + buildingTooltip.offsetHeight > window.innerHeight) y = window.innerHeight - buildingTooltip.offsetHeight - 10;
        buildingTooltip.style.left = `${x}px`;
        buildingTooltip.style.top = `${y}px`;
    }

    function checkAllBuildings(isChecked) {
        const checkboxes = configForm.querySelectorAll('.building-list input[type="checkbox"]:not(:disabled)');
        checkboxes.forEach(cb => {
            if (cb.checked !== isChecked) {
                 cb.checked = isChecked;
                 cb.dispatchEvent(new Event('change', { bubbles: true }));
            }
        });
    }
    
    function bindCapitalFormEvents() {
        configForm.querySelectorAll('[data-config-key]').forEach(element => {
            element.addEventListener('change', handleCapitaleConfigChange);
        });
         configForm.querySelectorAll('.building-list input[type="checkbox"]').forEach(element => {
            element.addEventListener('change', handleCapitaleBuildingChange);
        });
        document.getElementById('btn-check-all').addEventListener('click', () => checkAllBuildings(true));
        document.getElementById('btn-uncheck-all').addEventListener('click', () => checkAllBuildings(false));
        document.getElementById('btn-check-random').addEventListener('click', () => {
            configForm.querySelectorAll('.building-list input[type="checkbox"]:not(:disabled)').forEach(cb => {
                cb.checked = Math.random() > 0.6;
                cb.dispatchEvent(new Event('change', { bubbles: true }));
            });
        });
        configForm.querySelectorAll('.info-icon').forEach(icon => {
            icon.addEventListener('mouseenter', showBuildingTooltip);
            icon.addEventListener('mouseleave', hideBuildingTooltip);
            icon.addEventListener('mousemove', moveBuildingTooltip);
        });
    }

    // --- INITIALISATION ---
    function initialize() {
        loadData();
        if (regionSelect.options.length > 1) {
            regionSelect.value = 0; 
        }
        handleRegionChange();

        regionSelect.addEventListener('change', handleRegionChange);

        simulateRevenueBtn.addEventListener('click', () => {
            if(selectedPlace && selectedPlace.type === 'Capitale') {
                simulationModal.style.display = 'flex';
                document.getElementById('simulation-modal-title').textContent = `Simulation Économique : ${selectedPlace.name}`;
                
                const config = selectedPlace.config;
                simEcoSystemSelect.value = config.systemeEconomique;

                simEtatInitialSelect.innerHTML = ''; 
                for (const etat in etatRevenueModifier) {
                    const option = document.createElement('option');
                    option.value = etat;
                    option.textContent = etat;
                    simEtatInitialSelect.appendChild(option);
                }
                simEtatInitialSelect.value = config.etatInitial;
                
                if (config.systemeEconomique === 'Libéral') {
                    document.getElementById('tax-sales').value = 5;
                    document.getElementById('tax-profit').value = 10;
                    document.getElementById('tax-property').value = 0.05;
                    document.getElementById('tax-payroll').value = 2;
                }

                runAndDisplaySimulation({});
            }
        });
        
        document.getElementById('tax-settings').addEventListener('change', () => {
             if (simulationModal.style.display === 'flex') runAndDisplaySimulation({});
        });
        simEcoSystemSelect.addEventListener('change', () => runAndDisplaySimulation({}));
        simEtatInitialSelect.addEventListener('change', () => runAndDisplaySimulation({}));
        crisisSlider.addEventListener('input', () => {
            crisisSliderValue.textContent = crisisSlider.value;
            runAndDisplaySimulation({});
        });

        closeSimulationModalBtn.addEventListener('click', () => {
            simulationModal.style.display = 'none';
        });
        simulationModal.addEventListener('click', (event) => {
            if (event.target === simulationModal) simulationModal.style.display = 'none';
        });

        makeModalDraggable(salaryModal, salaryModal.querySelector('.draggable-modal-header'));
        salaryModalCloseBtn.addEventListener('click', () => salaryModal.hidden = true);
        btnAvgSalaries.addEventListener('click', showAverageSalariesModal);
        btnAdminSalaries.addEventListener('click', () => showBuildingSalariesModal('admin'));
        btnEnterpriseSalaries.addEventListener('click', () => showBuildingSalariesModal('enterprise'));
    }
    
    initialize();
});