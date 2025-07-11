// simulation-liberal.js

var EcoSim = window.EcoSim || {};

/**
 * Calcule l'économie mensuelle pour une capitale en système libéral.
 * VERSION MISE À JOUR
 *
 * @param {object} place - L'objet de la capitale.
 * @param {object} activeCrises - Les crises actives (non utilisé ici, mais gardé pour la forme).
 * @param {object} buildingDetails - Les détails de tous les bâtiments.
 * @param {object} revenueModifiers - Les modificateurs de revenus basés sur l'état.
 * @param {object} taxRates - Les taux d'imposition actuels.
 * @param {object} crisisModifiers - L'objet contenant les modificateurs de la crise actuelle.
 */
EcoSim.calculateLiberalEconomy = function(place, activeCrises, buildingDetails, revenueModifiers, taxRates, crisisModifiers) {
    const config = place.config;
    const PO_TO_PC_CONVERSION = 10000; // 1 PO = 100 PA = 10000 PC

    const salaryWeights = {
        0: 150, 1: 25, 2: 10, 3: 5, 4: 2, 5: 1
    };

    // --- Fonctions Utilitaires Internes ---
    const parsePO = (valueString) => {
        if (!valueString || typeof valueString !== 'string') return 0;
        const match = valueString.match(/^([\d\s]+)/);
        return match ? parseInt(match[1].replace(/\s/g, ''), 10) : 0;
    };

    const countJobsByTier = (building) => {
        let tiers = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        if (!building || !building.emplois) return tiers;
        
        const jobRegex = /Tiers (\d+).*?\((\d+)\s+poste/;
        building.emplois.forEach(jobString => {
            const match = jobString.match(jobRegex);
            if (match && match[1] && match[2]) {
                const tier = parseInt(match[1], 10);
                const count = parseInt(match[2], 10);
                if (tiers[tier] !== undefined) {
                    tiers[tier] += count;
                }
            }
        });
        return tiers;
    };

    // --- Initialisation des structures de résultats ---
    let sim = {
        categories: {},
        jobsByTier: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    };

    const modifiers = crisisModifiers || { laborEfficiency: 1.0 };

    // --- PASSE DE CALCUL ---
    for (const category in buildingDetails) {
        sim.categories[category] = {
            buildings: [],
            totals: { revenue: 0, fixedCost: 0, salaryCost: 0, totalCost: 0, net: 0, taxes: { sales: 0, profit: 0, property: 0, payroll: 0 } }
        };
        for (const buildingName in buildingDetails[category]) {
            if (config.batiments[category]?.[buildingName]) {
                const details = buildingDetails[category][buildingName];
                const jobsByTier = countJobsByTier(details);
                
                const fixedCost = parsePO(details.chargeFixe);
                const salaryPoolInPO = Math.floor(parsePO(details.chargeMax) / 12);
                
                const salaryPoolInPC = salaryPoolInPO * PO_TO_PC_CONVERSION;

                let totalWeightedPay = 0;
                for (let tier = 0; tier <= 5; tier++) {
                    totalWeightedPay += (jobsByTier[tier] || 0) * (salaryWeights[tier] || 0);
                }

                const payPointValueInPC = totalWeightedPay > 0 ? salaryPoolInPC / totalWeightedPay : 0;

                let salariesPerEmployee = {};
                for (let tier = 0; tier <= 5; tier++) {
                    const grossSalaryInPC = payPointValueInPC * (salaryWeights[tier] || 0);
                    const capitationTaxInPC = grossSalaryInPC * (taxRates.payroll / 100);
                    const netSalaryInPC = grossSalaryInPC - capitationTaxInPC;
                    salariesPerEmployee[tier] = netSalaryInPC / PO_TO_PC_CONVERSION;
                }

                const isAdministrative = category === "Bâtiments Administratifs";
                
                let revenue = 0;
                if (!isAdministrative) {
                    revenue = parsePO(details.chiffreAffairesMax) * modifiers.laborEfficiency;
                }
                
                const effectiveSalaryPoolInPO = salaryPoolInPO * modifiers.laborEfficiency;
                const totalCost = fixedCost + effectiveSalaryPoolInPO;
                const preTaxNetProfit = revenue - totalCost;

                let taxes = { sales: 0, profit: 0, property: 0, payroll: 0 };
                let finalNetProfit = preTaxNetProfit;

                if (!isAdministrative) {
                    taxes.sales = revenue * (taxRates.sales / 100);
                    taxes.property = parsePO(details.coutConstruction) * (taxRates.property / 100);
                    
                    const profitBaseForTaille = preTaxNetProfit - taxes.sales - taxes.property;
                    taxes.profit = Math.max(0, profitBaseForTaille) * (taxRates.profit / 100);
                    taxes.payroll = effectiveSalaryPoolInPO * (taxRates.payroll / 100);
                    finalNetProfit = profitBaseForTaille - taxes.profit;
                }


                sim.categories[category].buildings.push({
                    name: buildingName,
                    revenue: revenue,
                    fixedCost: fixedCost,
                    salaryCost: effectiveSalaryPoolInPO,
                    totalCost: totalCost,
                    net: finalNetProfit,
                    jobsByTier: jobsByTier,
                    salariesPerEmployee: salariesPerEmployee,
                    taxes: taxes
                });
            }
        }
    }

    // --- PASSE D'AGRÉGATION ---
    let totalTaxesCollected = { sales: 0, property: 0, profit: 0, payroll: 0, total: 0 };
    let totalPublicCosts = 0;

    for (const category in sim.categories) {
        for (const building of sim.categories[category].buildings) {
            const catTotals = sim.categories[category].totals;
            catTotals.revenue += building.revenue;
            catTotals.fixedCost += building.fixedCost;
            catTotals.salaryCost += building.salaryCost;
            catTotals.totalCost += building.totalCost;
            catTotals.net += building.net;
            if (building.taxes) {
                catTotals.taxes.sales += building.taxes.sales;
                catTotals.taxes.profit += building.taxes.profit;
                catTotals.taxes.property += building.taxes.property;
                catTotals.taxes.payroll += building.taxes.payroll;
            }
            for(let i=0; i<=5; i++) {
                sim.jobsByTier[i] += building.jobsByTier[i] || 0;
            }
        }
        
        if (category !== "Bâtiments Administratifs") {
            totalTaxesCollected.sales += sim.categories[category].totals.taxes.sales;
            totalTaxesCollected.profit += sim.categories[category].totals.taxes.profit;
            totalTaxesCollected.property += sim.categories[category].totals.taxes.property;
            totalTaxesCollected.payroll += sim.categories[category].totals.taxes.payroll;
        } else {
            totalPublicCosts = sim.categories[category].totals.totalCost;
        }
    }

    totalTaxesCollected.total = totalTaxesCollected.sales + totalTaxesCollected.profit + totalTaxesCollected.property + totalTaxesCollected.payroll;
    const cityBalance = totalTaxesCollected.total - totalPublicCosts;

    // --- Assemblage final de l'objet de résultats ---
    const totalJobsOffered = Object.values(sim.jobsByTier).reduce((a, b) => a + b, 0);
    const totalEmployed = Math.floor(totalJobsOffered * modifiers.laborEfficiency);
    const totalGdp = Object.values(sim.categories).reduce((sum, cat) => sum + (cat.totals.revenue || 0), 0);

    return {
        categories: sim.categories,
        jobsByTier: sim.jobsByTier,
        gdp: totalGdp,
        employment: {
            rate: (totalJobsOffered > 0 ? (totalEmployed / totalJobsOffered) * 100 : 100),
            employed: totalEmployed,
            totalJobs: totalJobsOffered
        },
        publicFinance: {
            revenue: totalTaxesCollected.total,
            costs: totalPublicCosts,
            balance: cityBalance,
            revenueDetail: totalTaxesCollected
        },
        specialSalaries: {} 
    };
};