// ressources.js

// On étend le namespace global pour y inclure nos nouvelles fonctions utilitaires.
var EcoSim = window.EcoSim || {};

/**
 * Formate une valeur numérique (représentant des Pièces d'Or) en une chaîne de caractères
 * détaillée avec les Pièces d'Or (PO), d'Argent (PA) et de Cuivre (PC).
 * La fonction masque les unités nulles pour plus de lisibilité.
 * * Règle de conversion : 1 PO = 100 PA, 1 PA = 100 PC.
 *
 * @param {number} valueInPO - La valeur en Pièces d'Or (peut être un nombre à virgule).
 * @returns {string} Une chaîne de caractères formatée (ex: "12 PO 54 PA 23 PC").
 */
EcoSim.formatCurrency = function(valueInPO) {
    if (typeof valueInPO !== 'number' || isNaN(valueInPO)) {
        return "N/A";
    }

    // On utilise une petite marge pour les problèmes de flottants
    const totalPC = Math.round(valueInPO * 10000);

    if (totalPC === 0) {
        return "0 PC";
    }
    
    const sign = totalPC < 0 ? '-' : '';
    const absTotalPC = Math.abs(totalPC);

    const po = Math.floor(absTotalPC / 10000);
    const remainderAfterPO = absTotalPC % 10000;
    const pa = Math.floor(remainderAfterPO / 100);
    const pc = remainderAfterPO % 100;

    let parts = [];
    if (po > 0) {
        parts.push(`${po} PO`);
    }
    if (pa > 0) {
        parts.push(`${pa} PA`);
    }
    if (pc > 0) {
        parts.push(`${pc} PC`);
    }

    return sign + parts.join(' ');
};

/*
 * NOTE POUR LE FUTUR :
 * Ce fichier pourra être étendu pour gérer d'autres ressources.
 * Par exemple :
 *
 * EcoSim.ressources = {
 * nourriture: 1000,
 * bois: 500,
 * pierre: 300,
 * prestigeGlobal: 50,
 * menaceGlobale: 10
 * };
 *
 * EcoSim.updateRessource = function(ressource, quantite) {
 * if (EcoSim.ressources[ressource] !== undefined) {
 * EcoSim.ressources[ressource] += quantite;
 * }
 * };
 */