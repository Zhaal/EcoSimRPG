// crises.js

// On étend le namespace global pour y inclure nos nouvelles fonctions de crise.
var EcoSim = window.EcoSim || {};

/**
 * Calcule les modificateurs de crise en fonction de l'intensité du curseur.
 *
 * @param {number} intensity - La valeur du curseur (-100 à 100).
 * @returns {object} Un objet contenant les modificateurs à appliquer.
 * { prestige: number, menace: number, laborEfficiency: number }
 */
EcoSim.applyCrisisModifiers = function(intensity) {
    let modifiers = {
        prestige: 0,
        menace: 0,
        laborEfficiency: 1.0 // Efficacité de la main-d'œuvre à 100% par défaut
    };

    if (intensity > 0) {
        // --- SURPOPULATION / CRISE SOCIALE ---
        // Chaque point d'intensité augmente la menace et baisse le prestige.
        modifiers.menace = Math.floor(intensity * 2.5); 
        modifiers.prestige = -Math.floor(intensity * 3); // -30 Prestige à l'intensité max

    } else if (intensity < 0) {
        // --- PÉNURIE DE MAIN D'ŒUVRE ---
        // L'intensité négative représente le pourcentage de postes non pourvus.
        // Par exemple, -30 signifie qu'il manque 30% de la main d'œuvre.
        const laborShortagePercentage = Math.abs(intensity) / 100;
        modifiers.laborEfficiency = 1.0 - laborShortagePercentage;
    }

    return modifiers;
};