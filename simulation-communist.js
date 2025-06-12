// simulation-communist.js

// On étend le même "namespace" global.
var EcoSim = window.EcoSim || {};

EcoSim.calculateCommunistEconomy = function(place, activeCrises, buildingDetails, revenueModifiers) {
    const config = place.config;
    let economy = {
        categories: {},
        totals: { revenue: 0, fixedCost: 0, salaryCost: 0, totalCost: 0, net: 0, jobs: 0 },
        jobsByTier: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    };

    // Constantes spécifiques à la simulation
    const crisisModifiers = {
        famine: { revenue: -0.2, food_revenue: -0.5, menace: 20 },
        revolte: { tax: 0.5, menace: 15 }, // Moins d'impact direct ici
        crise_commerciale: { revenue: -0.3, prestige: -10 }
    };
    const parsePO = (valueString) => {
        if (!valueString || typeof valueString !== 'string') return 0;
        const match = valueString.match(/^([\d\s]+)/);
        return match ? parseInt(match[1].replace(/\s/g, ''), 10) : 0;
    };
     const calculatePopulationFromJobs = (building) => {
        if (!building || !building.emplois) return 0;
        let totalPopulation = 0;
        const postRegex = /(\d+)\s+poste/;
        building.emplois.forEach(jobString => {
            const match = jobString.match(postRegex);
            if (match && match[1]) totalPopulation += parseInt(match[1], 10);
        });
        return totalPopulation;
    };
    const countJobsByTier = (building) => {
        let tiers = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        if (!building || !building.emplois) return tiers;
        const jobRegex = /Tiers (\d+).*\((\d+)\s+poste/;
        building.emplois.forEach(jobString => {
            const match = jobString.match(jobRegex);
            if (match && match[1] && match[2]) {
                const tier = parseInt(match[1], 10);
                const count = parseInt(match[2], 10);
                if (tiers[tier] !== undefined) tiers[tier] += count;
            }
        });
        return tiers;
    };

    // Modificateurs de base
    let revenueModifier = revenueModifiers[config.etatInitial] || 1.0;
    if (config.citeBelliqueuse) revenueModifier += 0.05;
    if (config.pegrePresente) revenueModifier -= 0.1;

    // Modificateurs de crise
    if (activeCrises.famine) revenueModifier += crisisModifiers.famine.revenue;
    if (activeCrises.crise_commerciale) revenueModifier += crisisModifiers.crise_commerciale.revenue;
    // La révolte fiscale a moins de sens ici, on pourrait l'interpréter comme une baisse de productivité.
    if (activeCrises.revolte) revenueModifier -= 0.1;

    // Calcul pour chaque bâtiment
    for (const category in buildingDetails) {
        economy.categories[category] = {
            buildings: [],
            totals: { revenue: 0, fixedCost: 0, salaryCost: 0, totalCost: 0, net: 0, jobs: 0 }
        };

        for (const buildingName in buildingDetails[category]) {
            if (config.batiments[category]?.[buildingName]) {
                const details = buildingDetails[category][buildingName];
                let buildingRevenue = parsePO(details.chiffreAffairesMax);
                const buildingFixedCost = parsePO(details.chargeFixe);
                const buildingSalaryCost = parsePO(details.chargeMax);
                const buildingJobs = calculatePopulationFromJobs(details);
                const buildingJobsByTier = countJobsByTier(details);

                let buildingRevenueModifier = revenueModifier;
                if (activeCrises.famine && (category === "Bâtiments Agricoles" || category === "Chasse/Nature")) {
                     buildingRevenueModifier += crisisModifiers.famine.food_revenue;
                }
                buildingRevenue = Math.floor(buildingRevenue * buildingRevenueModifier);
                if (category === "Bâtiments Administratifs") buildingRevenue = 0;

                const buildingTotalCost = buildingFixedCost + buildingSalaryCost;
                const buildingNet = buildingRevenue - buildingTotalCost;

                economy.categories[category].buildings.push({
                    name: buildingName,
                    revenue: buildingRevenue, fixedCost: buildingFixedCost, salaryCost: buildingSalaryCost,
                    totalCost: buildingTotalCost, net: buildingNet, jobs: buildingJobs
                });
                
                const catTotals = economy.categories[category].totals;
                catTotals.revenue += buildingRevenue;
                catTotals.fixedCost += buildingFixedCost;
                catTotals.salaryCost += buildingSalaryCost;
                catTotals.totalCost += buildingTotalCost;
                catTotals.net += buildingNet;
                catTotals.jobs += buildingJobs;

                for(let i=0; i<=5; i++) {
                    economy.jobsByTier[i] += buildingJobsByTier[i];
                }
            }
        }
    }
    
    // Calculs finaux spécifiques au système Communiste
    let totalRevenue = 0;
    let totalCosts = 0;
    let totalSalaries = 0;
    for(const category in economy.categories) {
       totalRevenue += economy.categories[category].totals.revenue;
       totalCosts += economy.categories[category].totals.fixedCost;
       totalSalaries += economy.categories[category].totals.salaryCost;
    }
    economy.communalNet = totalRevenue - totalCosts - totalSalaries;
    economy.salaryCoverage = totalSalaries > 0 ? Math.min(100, ((totalRevenue - totalCosts) / totalSalaries) * 100) : 100;
    economy.cityTaxRevenue = 0; // Pas de taxe directe dans ce modèle

    economy.totals.jobs = Object.values(economy.jobsByTier).reduce((a, b) => a + b, 0);

    return economy;
};