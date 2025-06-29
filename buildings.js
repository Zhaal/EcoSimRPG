// On s'assure que l'espace de nom et la section des bâtiments existent.
// On attache explicitement l'objet à `window` pour garantir sa portée globale.
window.EcoSimData = window.EcoSimData || {};

// --- MODIFICATION ICI ---
// On utilise un alias local qui ne cause pas de conflit de déclaration.
// On utilise "EcoSimData" qui est déjà global grâce à races.js
// et on lui attache la propriété "buildings"
EcoSimData.buildings = EcoSimData.buildings || {};

// Le reste du fichier peut maintenant utiliser "EcoSimData" sans problème.
// Exemple : EcoSimData.buildings['Hameau'] = { ... };

// --- Rappel du système monétaire pour les calculs ---
// 1 po (pièce d'or) = 10 pa (pièce d'argent) = 100 pc (pièce de cuivre)
// Le salaire est stocké en 'totalEnCuivre' pour faciliter les opérations mathématiques.

/* --- LISTE DES TAGS UTILISÉS ---
Services: "administration", "sécurité", "justice", "savoir_écrit", "contrats", "commerce", "transport_courrier", "hébergement", "divertissement", "divertissement_qualite", "divertissement_luxe", "soin"
Ressources Brutes: "grain", "légumes", "fruits", "raisins", "miel", "cire", "laine_brute", "lait", "bétail", "bois_brut", "gibier", "poisson", "peaux_brutes", "fourrures", "herbes_communes", "herbes_rares", "champignons_communs", "champignons_rares", "minerai_de_fer", "charbon", "pierre"
Biens Transformés: "farine", "bois_transformé", "tissu", "cuir", "viande", "pieces_metalliques", "pierre_taillee", "fourrures_traitees"
Biens Finis: "pain_patisseries", "vêtements_simples", "vêtements_qualite", "vêtements_luxe", "outils_simples", "armes_simples", "armes_armures_qualite", "equipement_de_siege", "navires", "navires_marchands", "navires_de_guerre", "remèdes_simples", "potions_simples", "potions_complexes", "bière", "hydromel", "vin", "fromage", "alcools_fins", "tabac"
Savoir: "savoir_alchimique", "savoir_arcanique", "savoir_avance"
Gestion: "gestion_nourriture", "finance_publique", "finance_privee"
--- */

EcoSimData.buildings['Hameau'] = {
    "Bâtiments Administratifs": {
        "Salle Communale": {
            description: "Lieu de réunion pour les décisions du hameau.",
            providesTags: ["administration"],
            emplois: [
                { tier: 2, titre: "Chef du Hameau", postes: 1, salaire: { totalEnCuivre: 64 }, prerequis: { prestige: 10 }, gainsMensuels: { prestige: 5, stats: { intelligence: 1, force: 0.5, constitution: 0.5, dexterite: 0.5, sagesse: 1, charisme: 1 } }, type: "mixte" },
                { tier: 3, titre: "Aide Communale", postes: 1, salaire: { totalEnCuivre: 23 }, prerequis: { prestige: 0 }, gainsMensuels: { prestige: 2, stats: { intelligence: 0.5, force: 0.5, constitution: 0.5, dexterite: 0.5, sagesse: 1, charisme: 0.5 } }, type: "mixte" }
            ]
        },
        "Poste de Garde": {
            description: "Assure la sécurité et la surveillance du hameau.",
            providesTags: ["sécurité"],
            requiresTags: { "outils_simples": { distance: 5 }, "vêtements_simples": { distance: 5 } },
            emplois: [
                { tier: 3, titre: "Capitaine de la Garde", postes: 1, salaire: { totalEnCuivre: 50 }, prerequis: { prestige: 8 }, gainsMensuels: { prestige: 4, stats: { intelligence: 0.6, force: 1, constitution: 1, dexterite: 0.8, sagesse: 1, charisme: 0.9 } }, type: "mixte" },
                { tier: 4, titre: "Garde du Hameau", postes: 4, salaire: { totalEnCuivre: 35 }, prerequis: { prestige: 2 }, gainsMensuels: { prestige: 2, stats: { intelligence: 0.3, force: 1, constitution: 1, dexterite: 0.6, sagesse: 0.8, charisme: 0.3 } }, type: "mixte" }
            ]
        },
        "Bureau du Scribe": {
            description: "Enregistrement des documents officiels, des naissances et des contrats.",
            providesTags: ["savoir_écrit", "contrats"],
            requiresTags: { "administration": { distance: 1 } },
            emplois: [
                { tier: 3, titre: "Scribe", postes: 1, salaire: { totalEnCuivre: 45 }, prerequis: { prestige: 5 }, gainsMensuels: { prestige: 3, stats: { intelligence: 1.5, force: 0.1, constitution: 0.3, dexterite: 1, sagesse: 1, charisme: 0.5 } }, type: "mixte" }
            ]
        }
    },
    "Bâtiments de Production": {
        "Atelier de Forgeron": {
            description: "Fabrication d’outils agricoles de base et de pièces métalliques.",
            providesTags: ["outils_simples", "pieces_metalliques"],
            requiresTags: { "minerai_de_fer": { distance: 8 }, "charbon": { distance: 8 } },
            emplois: [
                { tier: 3, titre: "Forgeron", postes: 1, salaire: { totalEnCuivre: 53 }, prerequis: { prestige: 8 }, gainsMensuels: { prestige: 4, stats: { intelligence: 0.5, force: 1, constitution: 1, dexterite: 0.5, sagesse: 0.5, charisme: 1 } }, type: "mixte" },
                { tier: 4, titre: "Aide Forgeron", postes: 1, salaire: { totalEnCuivre: 33 }, prerequis: { prestige: 0 }, gainsMensuels: { prestige: 2, stats: { intelligence: 0.2, force: 1, constitution: 1, dexterite: 0.3, sagesse: 0.2, charisme: 0.3 } }, type: "mixte" }
            ]
        },
        "Atelier de Couture": {
            description: "Fabrication de vêtements simples.",
            providesTags: ["vêtements_simples"],
            requiresTags: { "tissu": { distance: 5 } },
            emplois: [
                { tier: 3, titre: "Couturier", postes: 1, salaire: { totalEnCuivre: 48 }, prerequis: { prestige: 6 }, gainsMensuels: { prestige: 3, stats: { intelligence: 1, force: 0.2, constitution: 0.5, dexterite: 1.5, sagesse: 1, charisme: 0.8 } }, type: "mixte" },
                { tier: 5, titre: "Aide Couturier", postes: 2, salaire: { totalEnCuivre: 28 }, prerequis: { prestige: 0 }, gainsMensuels: { prestige: 2, stats: { intelligence: 0.5, force: 0.1, constitution: 0.3, dexterite: 1, sagesse: 0.5, charisme: 0.6 } }, type: "mixte" }
            ]
        },
        "Scierie": {
            description: "Découpe du bois pour la construction et le chauffage.",
            providesTags: ["bois_transformé"],
            requiresTags: { "bois_brut": { distance: 5 } },
            emplois: [
                { tier: 4, titre: "Bûcheron", postes: 4, salaire: { totalEnCuivre: 38 }, prerequis: { prestige: 4 }, gainsMensuels: { prestige: 3, stats: { intelligence: 0.2, force: 1, constitution: 1, dexterite: 0.5, sagesse: 0.3, charisme: 0.2 } }, type: "mixte" },
                { tier: 4, titre: "Scieur", postes: 2, salaire: { totalEnCuivre: 42 }, prerequis: { prestige: 5 }, gainsMensuels: { prestige: 3, stats: { intelligence: 0.4, force: 1, constitution: 1, dexterite: 1, sagesse: 0.4, charisme: 0.3 } }, type: "mixte" }
            ]
        },
        "Boulangerie": {
            description: "Production de pain et de pâtisseries simples.",
            providesTags: ["pain_patisseries"],
            requiresTags: { "farine": { distance: 3 }, "bois_transformé": { distance: 10 } },
            emplois: [
                { tier: 3, titre: "Boulanger", postes: 1, salaire: { totalEnCuivre: 46 }, prerequis: { prestige: 6 }, gainsMensuels: { prestige: 3, stats: { intelligence: 0.8, force: 0.5, constitution: 0.8, dexterite: 1, sagesse: 1, charisme: 0.7 } }, type: "mixte" },
                { tier: 5, titre: "Apprenti Boulanger", postes: 2, salaire: { totalEnCuivre: 24 }, prerequis: { prestige: 0 }, gainsMensuels: { prestige: 2, stats: { intelligence: 0.4, force: 0.3, constitution: 0.5, dexterite: 0.8, sagesse: 0.5, charisme: 0.5 } }, type: "mixte" }
            ]
        }
    },
    "Bâtiments Indépendants": {
        "Taverne": {
            description: "Petite taverne pour les habitants.",
            providesTags: ["divertissement", "hébergement"],
            requiresTags: { "pain_patisseries": { distance: 2 }, "viande": { distance: 4 }, "bois_transformé": { distance: 5 } },
            emplois: [
                { tier: 3, titre: "Tavernier", postes: 1, salaire: { totalEnCuivre: 49 }, prerequis: { prestige: 6 }, gainsMensuels: { prestige: 3, stats: { intelligence: 0.8, force: 0.5, constitution: 0.8, dexterite: 0.5, sagesse: 0.8, charisme: 1.6 } }, type: "mixte" },
                { tier: 5, titre: "Aide de Taverne", postes: 4, salaire: { totalEnCuivre: 22 }, prerequis: { prestige: 0 }, gainsMensuels: { prestige: 2, stats: { intelligence: 0.3, force: 0.4, constitution: 0.6, dexterite: 0.7, sagesse: 0.3, charisme: 1.2 } }, type: "mixte" }
            ]
        },
        "Échoppe de l'Apothicaire": {
            description: "Vente de remèdes, d'herbes et de potions simples.",
            providesTags: ["remèdes_simples"],
            requiresTags: { "herbes_communes": { distance: 3 } },
            emplois: [
                { tier: 3, titre: "Apothicaire", postes: 1, salaire: { totalEnCuivre: 55 }, prerequis: { prestige: 8 }, gainsMensuels: { prestige: 4, stats: { intelligence: 1, force: 0.1, constitution: 0.4, dexterite: 0.8, sagesse: 1, charisme: 0.4 } }, type: "mixte" },
                { tier: 4, titre: "Herboriste", postes: 2, salaire: { totalEnCuivre: 30 }, prerequis: { prestige: 2 }, gainsMensuels: { prestige: 2, stats: { intelligence: 0.8, force: 0.3, constitution: 0.6, dexterite: 0.8, sagesse: 1, charisme: 0.3 } }, type: "mixte" }
            ]
        },
        "Relais Postal": {
            description: "Point de collecte et de distribution du courrier pour le hameau.",
            providesTags: ["commerce", "transport_courrier"],
            requiresTags: { "administration": { distance: 1 }, "sécurité": { distance: 3 } },
            emplois: [
                { tier: 4, titre: "Maître de Poste", postes: 1, salaire: { totalEnCuivre: 40 }, prerequis: { prestige: 5 }, gainsMensuels: { prestige: 3, stats: { intelligence: 1, force: 0.4, constitution: 0.5, dexterite: 0.8, sagesse: 0.8, charisme: 1.5 } }, type: "mixte" },
                { tier: 5, titre: "Messager", postes: 2, salaire: { totalEnCuivre: 25 }, prerequis: { prestige: 1 }, gainsMensuels: { prestige: 2, stats: { intelligence: 0.3, force: 0.6, constitution: 1, dexterite: 1, sagesse: 0.5, charisme: 0.4 } }, type: "mixte" }
            ]
        }
    },
    "Bâtiments Agricoles": {
        "Fermes": {
            description: "Petites fermes pour céréales et légumes.",
            providesTags: ["grain", "légumes"],
            emplois: [
                { tier: 4, titre: "Fermier", postes: 6, salaire: { totalEnCuivre: 21 }, prerequis: { prestige: 8 }, gainsMensuels: { prestige: 4, stats: { intelligence: 0.3, force: 1, constitution: 1, dexterite: 0.5, sagesse: 0.5, charisme: 0.5 } }, type: "mixte" },
                { tier: 5, titre: "Journalier Agricole", postes: 6, salaire: { totalEnCuivre: 15 }, prerequis: { prestige: 0 }, gainsMensuels: { prestige: 2, stats: { intelligence: 0.1, force: 1, constitution: 1, dexterite: 0.4, sagesse: 0.1, charisme: 0.2 } }, type: "mixte" }
            ]
        },
        "Vergers": {
            description: "Petits vergers pour fruits.",
            providesTags: ["fruits"],
            emplois: [
                { tier: 4, titre: "Jardinier", postes: 3, salaire: { totalEnCuivre: 23 }, prerequis: { prestige: 6 }, gainsMensuels: { prestige: 3, stats: { intelligence: 0.5, force: 0.5, constitution: 0.8, dexterite: 1, sagesse: 1, charisme: 0.5 } }, type: "mixte" },
                { tier: 5, titre: "Cueilleur", postes: 5, salaire: { totalEnCuivre: 13 }, prerequis: { prestige: 0 }, gainsMensuels: { prestige: 2, stats: { intelligence: 0.2, force: 0.4, constitution: 0.6, dexterite: 1, sagesse: 0.8, charisme: 0.2 } }, type: "mixte" }
            ]
        },
        "Ruchers": {
            description: "Petites ruches pour le miel.",
            providesTags: ["miel", "cire"],
            emplois: [
                { tier: 4, titre: "Apiculteur", postes: 1, salaire: { totalEnCuivre: 29 }, prerequis: { prestige: 6 }, gainsMensuels: { prestige: 3, stats: { intelligence: 1, force: 0.2, constitution: 0.6, dexterite: 0.8, sagesse: 1.8, charisme: 0.4 } }, type: "mixte" },
                { tier: 5, titre: "Aide Apicole", postes: 2, salaire: { totalEnCuivre: 27 }, prerequis: { prestige: 0 }, gainsMensuels: { prestige: 2, stats: { intelligence: 0.6, force: 0.1, constitution: 0.4, dexterite: 0.5, sagesse: 1.2, charisme: 0.2 } }, type: "mixte" }
            ]
        },
        "Moulin à Eau": {
            description: "Moud le grain des fermes locales en farine.",
            providesTags: ["farine"],
            requiresTags: { "grain": { distance: 3 } },
            emplois: [
                { tier: 3, titre: "Meunier", postes: 1, salaire: { totalEnCuivre: 44 }, prerequis: { prestige: 7 }, gainsMensuels: { prestige: 3, stats: { intelligence: 0.6, force: 1, constitution: 1, dexterite: 0.7, sagesse: 0.9, charisme: 0.8 } }, type: "mixte" },
                { tier: 5, titre: "Aide-Meunier", postes: 1, salaire: { totalEnCuivre: 26 }, prerequis: { prestige: 0 }, gainsMensuels: { prestige: 2, stats: { intelligence: 0.2, force: 0.8, constitution: 0.8, dexterite: 0.5, sagesse: 0.4, charisme: 0.3 } }, type: "mixte" }
            ]
        },
        "Bergerie": {
            description: "Élevage de moutons pour la laine et la viande.",
            providesTags: ["laine_brute", "viande", "tissu"],
            emplois: [
                { tier: 4, titre: "Berger", postes: 2, salaire: { totalEnCuivre: 32 }, prerequis: { prestige: 5 }, gainsMensuels: { prestige: 3, stats: { intelligence: 0.4, force: 0.6, constitution: 1, dexterite: 0.6, sagesse: 1, charisme: 0.4 } }, type: "mixte" },
                { tier: 5, titre: "Tondeur de Moutons", postes: 3, salaire: { totalEnCuivre: 19 }, prerequis: { prestige: 1 }, gainsMensuels: { prestige: 2, stats: { intelligence: 0.2, force: 0.5, constitution: 0.6, dexterite: 1, sagesse: 0.5, charisme: 0.2 } }, type: "mixte" }
            ]
        }
    },
    "Chasse/Nature": {
        // BÂTIMENT AJOUTÉ
        "Cabane de Bûcheron": {
            description: "Poste avancé pour l'abattage du bois.",
            providesTags: ["bois_brut"],
            emplois: [
                { tier: 4, titre: "Bûcheron", postes: 4, salaire: { totalEnCuivre: 38 }, prerequis: { prestige: 4 }, gainsMensuels: { prestige: 3, stats: { intelligence: 0.2, force: 1, constitution: 1, dexterite: 0.5, sagesse: 0.3, charisme: 0.2 } }, type: "mixte" }
            ]
        },
        // BÂTIMENT AJOUTÉ
        "Mine de Surface": {
            description: "Extrait le minerai de fer et le charbon des veines proches.",
            providesTags: ["minerai_de_fer", "charbon"],
            emplois: [
                { tier: 4, titre: "Mineur", postes: 3, salaire: { totalEnCuivre: 37 }, prerequis: { prestige: 3 }, gainsMensuels: { prestige: 2, stats: { intelligence: 0.2, force: 1, constitution: 1, dexterite: 0.4, sagesse: 0.3, charisme: 0.1 } }, type: "mixte" }
            ]
        },
        "Cabane de Chasse": {
            description: "Abri pour les chasseurs du hameau.",
            providesTags: ["gibier", "peaux_brutes"],
            emplois: [
                { tier: 4, titre: "Chasseur", postes: 5, salaire: { totalEnCuivre: 39 }, prerequis: { prestige: 6 }, gainsMensuels: { prestige: 3, stats: { intelligence: 0.5, force: 0.8, constitution: 1, dexterite: 1, sagesse: 1, charisme: 0.5 } }, type: "mixte" },
                { tier: 5, titre: "Aide de Chasse", postes: 6, salaire: { totalEnCuivre: 21 }, prerequis: { prestige: 0 }, gainsMensuels: { prestige: 2, stats: { intelligence: 0.2, force: 0.6, constitution: 0.8, dexterite: 1, sagesse: 0.8, charisme: 0.2 } }, type: "mixte" }
            ]
        },
        "Étang": {
            description: "Petit étang pour la pêche.",
            providesTags: ["poisson"],
            emplois: [
                { tier: 4, titre: "Pêcheur", postes: 6, salaire: { totalEnCuivre: 17 }, prerequis: { prestige: 6 }, gainsMensuels: { prestige: 3, stats: { intelligence: 0.2, force: 0.8, constitution: 1, dexterite: 0.8, sagesse: 1, charisme: 0.3 } }, type: "mixte" },
                { tier: 5, titre: "Aide-pêcheur", postes: 3, salaire: { totalEnCuivre: 9 }, prerequis: { prestige: 0 }, gainsMensuels: { prestige: 2, stats: { intelligence: 0.1, force: 0.6, constitution: 1, dexterite: 0.6, sagesse: 0.8, charisme: 0.1 } }, type: "mixte" }
            ]
        },
        "Cabane du Trappeur": {
            description: "Collecte de peaux et de fourrures.",
            providesTags: ["peaux_brutes", "fourrures"],
            emplois: [
                { tier: 4, titre: "Trappeur", postes: 3, salaire: { totalEnCuivre: 36 }, prerequis: { prestige: 5 }, gainsMensuels: { prestige: 3, stats: { intelligence: 0.6, force: 0.7, constitution: 0.8, dexterite: 1, sagesse: 1, charisme: 0.2 } }, type: "mixte" }
            ]
        },
        "Champignonnière": {
            description: "Culture et récolte de champignons dans une cave ou un abri humide.",
            providesTags: ["champignons_communs"],
            emplois: [
                { tier: 5, titre: "Cultivateur de champignons", postes: 3, salaire: { totalEnCuivre: 20 }, prerequis: { prestige: 3 }, gainsMensuels: { prestige: 2, stats: { intelligence: 0.8, force: 0.3, constitution: 0.6, dexterite: 0.5, sagesse: 1, charisme: 0.1 } }, type: "mixte" }
            ]
        }
    }
};

EcoSimData.buildings['Village'] = {
    "Bâtiments Administratifs": {
        "Mairie": {
            description: "Centre administratif du village, gère les affaires publiques et les registres.",
            providesTags: ["administration"],
            emplois: [
                { tier: 2, titre: "Maire du Village", postes: 1, salaire: { totalEnCuivre: 85 }, prerequis: { prestige: 15 }, gainsMensuels: { prestige: 6, stats: { intelligence: 1.1, force: 0.5, constitution: 0.6, dexterite: 0.5, sagesse: 1.1, charisme: 1.1 } }, type: "mixte" },
                { tier: 3, titre: "Adjoint au Maire", postes: 2, salaire: { totalEnCuivre: 45 }, prerequis: { prestige: 5 }, gainsMensuels: { prestige: 3, stats: { intelligence: 1, force: 0.5, constitution: 0.5, dexterite: 0.6, sagesse: 1, charisme: 1 } }, type: "mixte" }
            ]
        },
        "Garnison du Village": {
            description: "Assure la protection du village et l'entraînement des miliciens.",
            providesTags: ["sécurité"],
            requiresTags: { "armes_simples": { distance: 5 }, "vêtements_simples": { distance: 5 }, "viande": { distance: 5 } },
            emplois: [
                { tier: 3, titre: "Capitaine de la Milice", postes: 1, salaire: { totalEnCuivre: 70 }, prerequis: { prestige: 12 }, gainsMensuels: { prestige: 5, stats: { intelligence: 0.8, force: 1.1, constitution: 1.1, dexterite: 1, sagesse: 1, charisme: 1.1 } }, type: "mixte" },
                { tier: 4, titre: "Milicien", postes: 8, salaire: { totalEnCuivre: 50 }, prerequis: { prestige: 3 }, gainsMensuels: { prestige: 2, stats: { intelligence: 0.4, force: 1.1, constitution: 1.1, dexterite: 0.8, sagesse: 0.8, charisme: 0.5 } }, type: "mixte" }
            ]
        },
        "Bureau des Greffiers": {
            description: "Rédaction et archivage des actes légaux, contrats et recensements du village.",
            providesTags: ["savoir_écrit", "contrats"],
            requiresTags: { "administration": { distance: 1 } },
            emplois: [
                { tier: 3, titre: "Greffier en Chef", postes: 1, salaire: { totalEnCuivre: 65 }, prerequis: { prestige: 8 }, gainsMensuels: { prestige: 4, stats: { intelligence: 1.1, force: 0.2, constitution: 0.4, dexterite: 1.1, sagesse: 1.1, charisme: 0.7 } }, type: "mixte" },
                { tier: 4, titre: "Clerc", postes: 2, salaire: { totalEnCuivre: 40 }, prerequis: { prestige: 2 }, gainsMensuels: { prestige: 2, stats: { intelligence: 1, force: 0.1, constitution: 0.3, dexterite: 1, sagesse: 0.8, charisme: 0.5 } }, type: "mixte" }
            ]
        }
    },
    "Bâtiments de Production": {
        "Forge du Village": {
            description: "Fabrication d'outils, d'armes simples et de pièces de métal.",
            providesTags: ["outils_simples", "armes_simples", "pieces_metalliques"],
            requiresTags: { "minerai_de_fer": { distance: 12 }, "charbon": { distance: 12 } },
            emplois: [
                { tier: 3, titre: "Maître Forgeron", postes: 1, salaire: { totalEnCuivre: 75 }, prerequis: { prestige: 10 }, gainsMensuels: { prestige: 5, stats: { intelligence: 0.6, force: 1.1, constitution: 1.1, dexterite: 0.7, sagesse: 0.8, charisme: 1 } }, type: "mixte" },
                { tier: 4, titre: "Compagnon Forgeron", postes: 2, salaire: { totalEnCuivre: 48 }, prerequis: { prestige: 2 }, gainsMensuels: { prestige: 2, stats: { intelligence: 0.3, force: 1.1, constitution: 1, dexterite: 0.5, sagesse: 0.4, charisme: 0.5 } }, type: "mixte" }
            ]
        },
        "Atelier de Tailleur": {
            description: "Confection de vêtements de qualité et de bannières.",
            providesTags: ["vêtements_qualite"],
            requiresTags: { "tissu": { distance: 10 }, "cuir": { distance: 10 } },
            emplois: [
                { tier: 3, titre: "Maître Tailleur", postes: 1, salaire: { totalEnCuivre: 68 }, prerequis: { prestige: 8 }, gainsMensuels: { prestige: 4, stats: { intelligence: 1, force: 0.3, constitution: 0.5, dexterite: 1.1, sagesse: 1, charisme: 1 } }, type: "mixte" },
                { tier: 5, titre: "Apprenti Tailleur", postes: 3, salaire: { totalEnCuivre: 42 }, prerequis: { prestige: 1 }, gainsMensuels: { prestige: 2, stats: { intelligence: 0.6, force: 0.2, constitution: 0.4, dexterite: 1.1, sagesse: 0.6, charisme: 0.7 } }, type: "mixte" }
            ]
        },
        "Grande Scierie": {
            description: "Découpe du bois en planches et poutres pour les constructions importantes.",
            providesTags: ["bois_transformé"],
            requiresTags: { "bois_brut": { distance: 8 } },
            emplois: [
                { tier: 4, titre: "Maître Scieur", postes: 2, salaire: { totalEnCuivre: 62 }, prerequis: { prestige: 7 }, gainsMensuels: { prestige: 4, stats: { intelligence: 0.5, force: 1.1, constitution: 1.1, dexterite: 1, sagesse: 0.5, charisme: 0.4 } }, type: "mixte" },
                { tier: 4, titre: "Ouvrier de Scierie", postes: 4, salaire: { totalEnCuivre: 45 }, prerequis: { prestige: 2 }, gainsMensuels: { prestige: 2, stats: { intelligence: 0.3, force: 1.1, constitution: 1, dexterite: 0.8, sagesse: 0.3, charisme: 0.3 } }, type: "mixte" }
            ]
        },
        "Boulangerie du Village": {
            description: "Production d'une variété de pains, tourtes et pâtisseries pour tout le village.",
            providesTags: ["pain_patisseries"],
            requiresTags: { "farine": { distance: 5 }, "bois_transformé": { distance: 12 }, "fruits": { distance: 5 } },
            emplois: [
                { tier: 3, titre: "Maître Boulanger", postes: 1, salaire: { totalEnCuivre: 66 }, prerequis: { prestige: 7 }, gainsMensuels: { prestige: 4, stats: { intelligence: 0.9, force: 0.6, constitution: 0.8, dexterite: 1.1, sagesse: 1, charisme: 0.9 } }, type: "mixte" },
                { tier: 5, titre: "Mitron", postes: 3, salaire: { totalEnCuivre: 38 }, prerequis: { prestige: 1 }, gainsMensuels: { prestige: 2, stats: { intelligence: 0.5, force: 0.4, constitution: 0.6, dexterite: 1, sagesse: 0.5, charisme: 0.6 } }, type: "mixte" }
            ]
        }
    },
    "Bâtiments Indépendants": {
        "Auberge du Relais": {
            description: "Auberge accueillant voyageurs et locaux, sert repas et boissons.",
            providesTags: ["divertissement", "hébergement"],
            requiresTags: { "bière": { distance: 5 }, "pain_patisseries": { distance: 2 }, "viande": { distance: 5 }, "gibier": { distance: 8 } },
            emplois: [
                { tier: 3, titre: "Aubergiste", postes: 1, salaire: { totalEnCuivre: 72 }, prerequis: { prestige: 9 }, gainsMensuels: { prestige: 4, stats: { intelligence: 0.9, force: 0.6, constitution: 0.8, dexterite: 0.7, sagesse: 1, charisme: 1.1 } }, type: "mixte" },
                { tier: 5, titre: "Serveur/Serveuse", postes: 5, salaire: { totalEnCuivre: 35 }, prerequis: { prestige: 1 }, gainsMensuels: { prestige: 2, stats: { intelligence: 0.4, force: 0.5, constitution: 0.7, dexterite: 0.9, sagesse: 0.4, charisme: 1.1 } }, type: "mixte" }
            ]
        },
        "Herboristerie et Apothicairerie": {
            description: "Préparation et vente de remèdes, potions et onguents plus complexes.",
            providesTags: ["remèdes_simples", "potions_simples"],
            requiresTags: { "herbes_communes": { distance: 5 }, "herbes_rares": { distance: 10 } },
            emplois: [
                { tier: 3, titre: "Maître Apothicaire", postes: 1, salaire: { totalEnCuivre: 80 }, prerequis: { prestige: 11 }, gainsMensuels: { prestige: 5, stats: { intelligence: 1.1, force: 0.2, constitution: 0.5, dexterite: 1, sagesse: 1.1, charisme: 0.6 } }, type: "mixte" },
                { tier: 4, titre: "Collecteur d'Herbes Rares", postes: 3, salaire: { totalEnCuivre: 45 }, prerequis: { prestige: 4 }, gainsMensuels: { prestige: 3, stats: { intelligence: 0.9, force: 0.4, constitution: 0.7, dexterite: 0.9, sagesse: 1.1, charisme: 0.4 } }, type: "mixte" }
            ]
        },
        "Comptoir Commercial": {
            description: "Point d'échange pour les caravanes, gestion du courrier et des colis.",
            providesTags: ["commerce", "transport_courrier"],
            requiresTags: { "administration": { distance: 2 }, "sécurité": { distance: 5 } },
            emplois: [
                { tier: 4, titre: "Maître du Comptoir", postes: 1, salaire: { totalEnCuivre: 60 }, prerequis: { prestige: 7 }, gainsMensuels: { prestige: 4, stats: { intelligence: 1.1, force: 0.4, constitution: 0.6, dexterite: 0.8, sagesse: 0.9, charisme: 1.1 } }, type: "mixte" },
                { tier: 5, titre: "Messager à Cheval", postes: 3, salaire: { totalEnCuivre: 40 }, prerequis: { prestige: 2 }, gainsMensuels: { prestige: 2, stats: { intelligence: 0.4, force: 0.7, constitution: 1.1, dexterite: 1.1, sagesse: 0.6, charisme: 0.5 } }, type: "mixte" }
            ]
        }
    },
    "Bâtiments Agricoles": {
        "Grandes Fermes": {
            description: "Fermes étendues pour la culture intensive de céréales et de légumes.",
            providesTags: ["grain", "légumes"],
            emplois: [
                { tier: 4, titre: "Maître Fermier", postes: 4, salaire: { totalEnCuivre: 42 }, prerequis: { prestige: 9 }, gainsMensuels: { prestige: 4, stats: { intelligence: 0.5, force: 1.1, constitution: 1.1, dexterite: 0.6, sagesse: 0.8, charisme: 0.6 } }, type: "mixte" },
                { tier: 5, titre: "Ouvrier Agricole", postes: 10, salaire: { totalEnCuivre: 28 }, prerequis: { prestige: 0 }, gainsMensuels: { prestige: 1, stats: { intelligence: 0.2, force: 1, constitution: 1.1, dexterite: 0.5, sagesse: 0.2, charisme: 0.3 } }, type: "mixte" }
            ]
        },
        "Vergers du Village": {
            description: "Vergers organisés pour une production de fruits diversifiés.",
            providesTags: ["fruits"],
            emplois: [
                { tier: 4, titre: "Arboriculteur", postes: 4, salaire: { totalEnCuivre: 38 }, prerequis: { prestige: 7 }, gainsMensuels: { prestige: 3, stats: { intelligence: 0.7, force: 0.6, constitution: 0.8, dexterite: 1.1, sagesse: 1.1, charisme: 0.5 } }, type: "mixte" },
                { tier: 5, titre: "Saisonnier", postes: 8, salaire: { totalEnCuivre: 25 }, prerequis: { prestige: 0 }, gainsMensuels: { prestige: 1, stats: { intelligence: 0.3, force: 0.5, constitution: 0.7, dexterite: 1.1, sagesse: 0.8, charisme: 0.3 } }, type: "mixte" }
            ]
        },
        "Grands Ruchers": {
            description: "Ensemble de ruches pour une production de miel et de cire à plus grande échelle.",
            providesTags: ["miel", "cire", "hydromel"],
            emplois: [
                { tier: 4, titre: "Maître Apiculteur", postes: 2, salaire: { totalEnCuivre: 48 }, prerequis: { prestige: 8 }, gainsMensuels: { prestige: 4, stats: { intelligence: 1.1, force: 0.3, constitution: 0.7, dexterite: 1, sagesse: 1.1, charisme: 0.5 } }, type: "mixte" },
                { tier: 5, titre: "Gardien des Ruches", postes: 3, salaire: { totalEnCuivre: 35 }, prerequis: { prestige: 1 }, gainsMensuels: { prestige: 2, stats: { intelligence: 0.8, force: 0.2, constitution: 0.5, dexterite: 0.7, sagesse: 1.1, charisme: 0.3 } }, type: "mixte" }
            ]
        },
        "Moulin à Vent": {
            description: "Moud le grain en farine pour le village et les environs, plus efficace que le moulin à eau.",
            providesTags: ["farine"],
            requiresTags: { "grain": { distance: 5 } },
            emplois: [
                { tier: 3, titre: "Maître Meunier", postes: 1, salaire: { totalEnCuivre: 64 }, prerequis: { prestige: 8 }, gainsMensuels: { prestige: 4, stats: { intelligence: 0.7, force: 1, constitution: 1, dexterite: 0.8, sagesse: 1, charisme: 0.9 } }, type: "mixte" },
                { tier: 5, titre: "Garçon Meunier", postes: 2, salaire: { totalEnCuivre: 38 }, prerequis: { prestige: 1 }, gainsMensuels: { prestige: 2, stats: { intelligence: 0.3, force: 0.9, constitution: 0.9, dexterite: 0.6, sagesse: 0.5, charisme: 0.4 } }, type: "mixte" }
            ]
        },
        "Étable Communale": {
            description: "Élevage de bétail (vaches, moutons) pour le lait, la viande et la laine.",
            providesTags: ["viande", "lait", "laine_brute", "peaux_brutes", "bétail", "tissu"],
            emplois: [
                { tier: 4, titre: "Éleveur", postes: 3, salaire: { totalEnCuivre: 50 }, prerequis: { prestige: 6 }, gainsMensuels: { prestige: 3, stats: { intelligence: 0.5, force: 0.8, constitution: 1, dexterite: 0.7, sagesse: 1.1, charisme: 0.5 } }, type: "mixte" },
                { tier: 5, titre: "Vacher / Berger", postes: 5, salaire: { totalEnCuivre: 33 }, prerequis: { prestige: 1 }, gainsMensuels: { prestige: 2, stats: { intelligence: 0.3, force: 0.7, constitution: 1.1, dexterite: 0.8, sagesse: 1, charisme: 0.3 } }, type: "mixte" }
            ]
        }
    },
    "Chasse/Nature": {
        "Loge de Chasse": {
            description: "Base organisée pour les expéditions de chasse et la gestion des territoires.",
            providesTags: ["gibier", "peaux_brutes", "fourrures"],
            emplois: [
                { tier: 4, titre: "Maître Chasseur", postes: 3, salaire: { totalEnCuivre: 58 }, prerequis: { prestige: 8 }, gainsMensuels: { prestige: 4, stats: { intelligence: 0.6, force: 0.9, constitution: 1, dexterite: 1.1, sagesse: 1.1, charisme: 0.6 } }, type: "mixte" },
                { tier: 5, titre: "Pisteur", postes: 6, salaire: { totalEnCuivre: 39 }, prerequis: { prestige: 2 }, gainsMensuels: { prestige: 2, stats: { intelligence: 0.4, force: 0.7, constitution: 0.9, dexterite: 1.1, sagesse: 1, charisme: 0.3 } }, type: "mixte" }
            ]
        },
        "Pêcherie": {
            description: "Installation sur une rivière ou un lac pour la pêche et l'élevage de poissons.",
            providesTags: ["poisson"],
            emplois: [
                { tier: 4, titre: "Maître Pêcheur", postes: 4, salaire: { totalEnCuivre: 40 }, prerequis: { prestige: 7 }, gainsMensuels: { prestige: 3, stats: { intelligence: 0.4, force: 0.9, constitution: 1.1, dexterite: 1, sagesse: 1.1, charisme: 0.4 } }, type: "mixte" },
                { tier: 5, titre: "Préparateur de poisson", postes: 5, salaire: { totalEnCuivre: 22 }, prerequis: { prestige: 1 }, gainsMensuels: { prestige: 2, stats: { intelligence: 0.2, force: 0.7, constitution: 1, dexterite: 0.8, sagesse: 0.9, charisme: 0.2 } }, type: "mixte" }
            ]
        },
        "Comptoir du Pelletier": {
            description: "Achat, traitement et vente de peaux et de fourrures.",
            providesTags: ["cuir", "fourrures_traitees"],
            requiresTags: { "peaux_brutes": { distance: 8 }, "fourrures": { distance: 8 } },
            emplois: [
                { tier: 4, titre: "Maître Pelletier", postes: 2, salaire: { totalEnCuivre: 55 }, prerequis: { prestige: 7 }, gainsMensuels: { prestige: 4, stats: { intelligence: 0.8, force: 0.6, constitution: 0.8, dexterite: 1.1, sagesse: 1.1, charisme: 0.5 } }, type: "mixte" },
                { tier: 5, titre: "Apprenti Trappeur", postes: 4, salaire: { totalEnCuivre: 40 }, prerequis: { prestige: 2 }, gainsMensuels: { prestige: 2, stats: { intelligence: 0.5, force: 0.6, constitution: 0.8, dexterite: 1.1, sagesse: 1, charisme: 0.3 } }, type: "mixte" }
            ]
        },
        "Cave de Culture": {
            description: "Culture de champignons rares et de racines pour les apothicaires et cuisiniers.",
            providesTags: ["champignons_rares"],
            requiresTags: { "champignons_communs": { distance: 0 } },
            emplois: [
                { tier: 5, titre: "Maître cultivateur de champignons", postes: 2, salaire: { totalEnCuivre: 38 }, prerequis: { prestige: 5 }, gainsMensuels: { prestige: 3, stats: { intelligence: 1, force: 0.4, constitution: 0.7, dexterite: 0.6, sagesse: 1.1, charisme: 0.2 } }, type: "mixte" },
                { tier: 5, titre: "Aide-Cultivateur", postes: 4, salaire: { totalEnCuivre: 24 }, prerequis: { prestige: 1 }, gainsMensuels: { prestige: 1, stats: { intelligence: 0.8, force: 0.3, constitution: 0.6, dexterite: 0.5, sagesse: 1, charisme: 0.1 } }, type: "mixte" }
            ]
        }
    }
};

EcoSimData.buildings['Bourg'] = {
    "Bâtiments Administratifs": {
        "Hôtel de Ville": {
            description: "Centre névralgique du pouvoir administratif du bourg, où siège le conseil.",
            providesTags: ["administration"],
            emplois: [
                { tier: 1, titre: "Bourgmestre", postes: 1, salaire: { totalEnCuivre: 120 }, prerequis: { prestige: 20 }, gainsMensuels: { prestige: 8, stats: { intelligence: 1.1, force: 0.6, constitution: 0.7, dexterite: 0.6, sagesse: 1.1, charisme: 1.1 } }, type: "mixte" },
                { tier: 2, titre: "Échevin", postes: 3, salaire: { totalEnCuivre: 75 }, prerequis: { prestige: 10 }, gainsMensuels: { prestige: 5, stats: { intelligence: 1.1, force: 0.5, constitution: 0.6, dexterite: 0.7, sagesse: 1.1, charisme: 1.1 } }, type: "mixte" }
            ]
        },
        "Garde du Bourg": {
            description: "Force de police professionnelle assurant la loi et l'ordre dans le bourg.",
            providesTags: ["sécurité"],
            requiresTags: { "armes_armures_qualite": { distance: 2 }, "vêtements_qualite": { distance: 5 } },
            emplois: [
                { tier: 2, titre: "Capitaine de la Garde", postes: 1, salaire: { totalEnCuivre: 95 }, prerequis: { prestige: 16 }, gainsMensuels: { prestige: 6, stats: { intelligence: 0.9, force: 1.1, constitution: 1.1, dexterite: 1.1, sagesse: 1, charisme: 1.1 } }, type: "mixte" },
                { tier: 3, titre: "Garde d'Élite", postes: 12, salaire: { totalEnCuivre: 65 }, prerequis: { prestige: 5 }, gainsMensuels: { prestige: 3, stats: { intelligence: 0.5, force: 1.1, constitution: 1.1, dexterite: 1, sagesse: 0.8, charisme: 0.6 } }, type: "mixte" }
            ]
        },
        "Tribunal du Bourg": {
            description: "Tribunal où sont réglés les litiges civils et criminels mineurs.",
            providesTags: ["justice"],
            requiresTags: { "administration": { distance: 1 }, "savoir_écrit": { distance: 2 } },
            emplois: [
                { tier: 2, titre: "Juge du Bourg", postes: 1, salaire: { totalEnCuivre: 105 }, prerequis: { prestige: 18 }, gainsMensuels: { prestige: 7, stats: { intelligence: 1.1, force: 0.3, constitution: 0.5, dexterite: 0.8, sagesse: 1.1, charisme: 1 } }, type: "mixte" },
                { tier: 3, titre: "Greffier Judiciaire", postes: 2, salaire: { totalEnCuivre: 70 }, prerequis: { prestige: 8 }, gainsMensuels: { prestige: 4, stats: { intelligence: 1.1, force: 0.2, constitution: 0.4, dexterite: 1.1, sagesse: 1, charisme: 0.6 } }, type: "mixte" }
            ]
        },
        "Bureau du Percepteur": {
            description: "Collecte des taxes et gestion des finances publiques du bourg.",
            providesTags: ["finance_publique"],
            requiresTags: { "administration": { distance: 1 }, "commerce": { distance: 2 }, "sécurité": { distance: 1 } },
            emplois: [
                { tier: 3, titre: "Percepteur", postes: 2, salaire: { totalEnCuivre: 80 }, prerequis: { prestige: 12 }, gainsMensuels: { prestige: 5, stats: { intelligence: 1.1, force: 0.4, constitution: 0.6, dexterite: 0.9, sagesse: 1, charisme: 0.9 } }, type: "mixte" }
            ]
        }
    },
    "Bâtiments de Production": {
        "Manufacture d'Armes": {
            description: "Forge spécialisée dans la production d'armes et d'armures de qualité.",
            providesTags: ["armes_armures_qualite"],
            requiresTags: { "pieces_metalliques": { distance: 5 }, "cuir": { distance: 8 }, "bois_transformé": { distance: 8 } },
            emplois: [
                { tier: 2, titre: "Armurier", postes: 1, salaire: { totalEnCuivre: 110 }, prerequis: { prestige: 15 }, gainsMensuels: { prestige: 6, stats: { intelligence: 0.8, force: 1.1, constitution: 1.1, dexterite: 1, sagesse: 0.9, charisme: 1 } }, type: "mixte" },
                { tier: 3, titre: "Artisan Forgeron", postes: 3, salaire: { totalEnCuivre: 70 }, prerequis: { prestige: 5 }, gainsMensuels: { prestige: 3, stats: { intelligence: 0.5, force: 1.1, constitution: 1.1, dexterite: 0.8, sagesse: 0.5, charisme: 0.6 } }, type: "mixte" }
            ]
        },
        "Guilde des Couturiers": {
            description: "Atelier de confection de vêtements raffinés, de tapisseries et de broderies.",
            providesTags: ["vêtements_luxe"],
            requiresTags: { "tissu": { distance: 5 }, "fourrures_traitees": { distance: 10 }, "cire": { distance: 10 } },
            emplois: [
                { tier: 2, titre: "Maître de la Guilde", postes: 1, salaire: { totalEnCuivre: 90 }, prerequis: { prestige: 12 }, gainsMensuels: { prestige: 5, stats: { intelligence: 1.1, force: 0.3, constitution: 0.6, dexterite: 1.1, sagesse: 1.1, charisme: 1.1 } }, type: "mixte" },
                { tier: 4, titre: "Couturier", postes: 4, salaire: { totalEnCuivre: 65 }, prerequis: { prestige: 4 }, gainsMensuels: { prestige: 3, stats: { intelligence: 0.8, force: 0.2, constitution: 0.5, dexterite: 1.1, sagesse: 0.8, charisme: 0.8 } }, type: "mixte" }
            ]
        },
        "Chantier Naval": {
            description: "Construction de barques de rivière, de bateaux de pêche et réparation navale.",
            providesTags: ["navires"],
            requiresTags: { "bois_transformé": { distance: 5 }, "pieces_metalliques": { distance: 8 }, "tissu": { distance: 8 } },
            emplois: [
                { tier: 3, titre: "Maître Charpentier Naval", postes: 1, salaire: { totalEnCuivre: 85 }, prerequis: { prestige: 10 }, gainsMensuels: { prestige: 5, stats: { intelligence: 0.8, force: 1.1, constitution: 1.1, dexterite: 1.1, sagesse: 0.7, charisme: 0.5 } }, type: "mixte" },
                { tier: 4, titre: "Charpentier de marine", postes: 5, salaire: { totalEnCuivre: 60 }, prerequis: { prestige: 3 }, gainsMensuels: { prestige: 2, stats: { intelligence: 0.4, force: 1.1, constitution: 1, dexterite: 0.9, sagesse: 0.4, charisme: 0.4 } }, type: "mixte" }
            ]
        },
        "Grande Boulangerie-Pâtisserie": {
            description: "Production à grande échelle pour le bourg, incluant pains spéciaux et pâtisseries fines.",
            providesTags: ["pain_patisseries"],
            requiresTags: { "farine": { distance: 5 }, "fruits": { distance: 5 }, "miel": { distance: 8 }, "lait": { distance: 5 } },
            emplois: [
                { tier: 2, titre: "Artisan Boulanger", postes: 2, salaire: { totalEnCuivre: 88 }, prerequis: { prestige: 9 }, gainsMensuels: { prestige: 5, stats: { intelligence: 1, force: 0.7, constitution: 0.9, dexterite: 1.1, sagesse: 1.1, charisme: 1 } }, type: "mixte" },
                { tier: 4, titre: "Pâtissier", postes: 4, salaire: { totalEnCuivre: 55 }, prerequis: { prestige: 2 }, gainsMensuels: { prestige: 3, stats: { intelligence: 0.7, force: 0.5, constitution: 0.7, dexterite: 1.1, sagesse: 0.8, charisme: 0.7 } }, type: "mixte" }
            ]
        },
        "Brasserie": {
            description: "Production de bière et d'ale pour les auberges et la population locale.",
            providesTags: ["bière"],
            requiresTags: { "grain": { distance: 8 } },
            emplois: [
                { tier: 3, titre: "Maître Brasseur", postes: 1, salaire: { totalEnCuivre: 82 }, prerequis: { prestige: 10 }, gainsMensuels: { prestige: 5, stats: { intelligence: 1, force: 0.8, constitution: 1, dexterite: 0.8, sagesse: 1.1, charisme: 0.8 } }, type: "mixte" },
                { tier: 4, titre: "Garçon de Brasserie", postes: 4, salaire: { totalEnCuivre: 50 }, prerequis: { prestige: 2 }, gainsMensuels: { prestige: 2, stats: { intelligence: 0.4, force: 1, constitution: 1.1, dexterite: 0.7, sagesse: 0.5, charisme: 0.5 } }, type: "mixte" }
            ]
        }
    },
    "Bâtiments Indépendants": {
        "Hôtel des Voyageurs": {
            description: "Grande auberge de qualité offrant chambres privées, un restaurant et une écurie.",
            providesTags: ["divertissement_qualite", "hébergement"],
            requiresTags: { "vin": { distance: 5 }, "pain_patisseries": { distance: 2 }, "viande": { distance: 4 }, "sécurité": { distance: 1 } },
            emplois: [
                { tier: 2, titre: "Aubergiste", postes: 1, salaire: { totalEnCuivre: 98 }, prerequis: { prestige: 13 }, gainsMensuels: { prestige: 5, stats: { intelligence: 1, force: 0.7, constitution: 0.9, dexterite: 0.8, sagesse: 1.1, charisme: 1.1 } }, type: "mixte" },
                { tier: 4, titre: "Cuisinier", postes: 2, salaire: { totalEnCuivre: 60 }, prerequis: { prestige: 4 }, gainsMensuels: { prestige: 3, stats: { intelligence: 0.8, force: 0.6, constitution: 0.8, dexterite: 1.1, sagesse: 0.9, charisme: 0.7 } }, type: "mixte" }
            ]
        },
        "Laboratoire d'Alchimie": {
            description: "Création de potions puissantes, de réactifs alchimiques et de transmutations mineures.",
            providesTags: ["potions_complexes", "savoir_alchimique"],
            requiresTags: { "herbes_rares": { distance: 10 }, "potions_simples": { distance: 2 }, "champignons_rares": { distance: 10 }, "sécurité": { distance: 2 } },
            emplois: [
                { tier: 2, titre: "Maître Alchimiste", postes: 1, salaire: { totalEnCuivre: 115 }, prerequis: { prestige: 17 }, gainsMensuels: { prestige: 7, stats: { intelligence: 1.1, force: 0.3, constitution: 0.6, dexterite: 1.1, sagesse: 1.1, charisme: 0.7 } }, type: "mixte" },
                { tier: 3, titre: "Assistant Alchimiste", postes: 2, salaire: { totalEnCuivre: 68 }, prerequis: { prestige: 6 }, gainsMensuels: { prestige: 3, stats: { intelligence: 1.1, force: 0.2, constitution: 0.5, dexterite: 1, sagesse: 1, charisme: 0.5 } }, type: "mixte" }
            ]
        },
        "Guilde des Marchands": {
            description: "Centre pour le commerce, les contrats de caravanes et la finance.",
            providesTags: ["commerce", "finance_privee"],
            requiresTags: { "sécurité": { distance: 2 }, "contrats": { distance: 2 } },
            emplois: [
                { tier: 2, titre: "Maître de Guilde", postes: 1, salaire: { totalEnCuivre: 110 }, prerequis: { prestige: 15 }, gainsMensuels: { prestige: 6, stats: { intelligence: 1.1, force: 0.5, constitution: 0.7, dexterite: 0.8, sagesse: 1.1, charisme: 1.1 } }, type: "mixte" },
                { tier: 4, titre: "Marchand", postes: 5, salaire: { totalEnCuivre: 70 }, prerequis: { prestige: 5 }, gainsMensuels: { prestige: 3, stats: { intelligence: 1, force: 0.4, constitution: 0.6, dexterite: 0.7, sagesse: 0.9, charisme: 1.1 } }, type: "mixte" }
            ]
        },
        "Théâtre du Bourg": {
            description: "Lieu de divertissement proposant des pièces, des concerts et des spectacles.",
            providesTags: ["divertissement_qualite"],
            requiresTags: { "sécurité": { distance: 2 }, "bois_transformé": { distance: 10 }, "vêtements_qualite": { distance: 5 } },
            emplois: [
                { tier: 3, titre: "Maître de Troupe", postes: 1, salaire: { totalEnCuivre: 85 }, prerequis: { prestige: 10 }, gainsMensuels: { prestige: 5, stats: { intelligence: 1, force: 0.4, constitution: 0.6, dexterite: 0.8, sagesse: 1, charisme: 1.1 } }, type: "mixte" },
                { tier: 4, titre: "Acteur / Barde", postes: 6, salaire: { totalEnCuivre: 58 }, prerequis: { prestige: 4 }, gainsMensuels: { prestige: 3, stats: { intelligence: 0.6, force: 0.5, constitution: 0.7, dexterite: 1.1, sagesse: 0.6, charisme: 1.1 } }, type: "mixte" }
            ]
        }
    },
    "Bâtiments Agricoles": {
        "Domaines Agricoles": {
            description: "Vastes exploitations agricoles gérées par des intendants, employant de nombreux ouvriers.",
            providesTags: ["grain", "légumes", "bétail"],
            emplois: [
                { tier: 3, titre: "Intendant de Domaine", postes: 3, salaire: { totalEnCuivre: 65 }, prerequis: { prestige: 10 }, gainsMensuels: { prestige: 5, stats: { intelligence: 0.8, force: 1, constitution: 1.1, dexterite: 0.7, sagesse: 1, charisme: 0.8 } }, type: "mixte" },
                { tier: 5, titre: "Ouvrier Agricole", postes: 15, salaire: { totalEnCuivre: 40 }, prerequis: { prestige: 1 }, gainsMensuels: { prestige: 2, stats: { intelligence: 0.3, force: 1.1, constitution: 1.1, dexterite: 0.6, sagesse: 0.3, charisme: 0.4 } }, type: "mixte" }
            ]
        },
        "Vignobles": {
            description: "Culture de la vigne sur les coteaux ensoleillés pour la production de vin.",
            providesTags: ["raisins", "vin"],
            emplois: [
                { tier: 3, titre: "Vigneron", postes: 3, salaire: { totalEnCuivre: 62 }, prerequis: { prestige: 9 }, gainsMensuels: { prestige: 4, stats: { intelligence: 0.8, force: 0.7, constitution: 0.9, dexterite: 1.1, sagesse: 1.1, charisme: 0.6 } }, type: "mixte" },
                { tier: 5, titre: "Vendangeur", postes: 10, salaire: { totalEnCuivre: 35 }, prerequis: { prestige: 0 }, gainsMensuels: { prestige: 1, stats: { intelligence: 0.3, force: 0.6, constitution: 0.8, dexterite: 1.1, sagesse: 0.8, charisme: 0.4 } }, type: "mixte" }
            ]
        },
        "Grands Ruchers": { // This one makes hydromel
            description: "Exploitation apicole produisant du miel, de l'hydromel et de la cire de haute qualité.",
            providesTags: ["hydromel", "miel", "cire"],
            requiresTags: { "miel": { distance: 0 } },
            emplois: [
                { tier: 3, titre: "Hydromellier", postes: 2, salaire: { totalEnCuivre: 70 }, prerequis: { prestige: 10 }, gainsMensuels: { prestige: 5, stats: { intelligence: 1.1, force: 0.4, constitution: 0.8, dexterite: 1.1, sagesse: 1.1, charisme: 0.6 } }, type: "mixte" },
                { tier: 4, titre: "Apiculteur", postes: 4, salaire: { totalEnCuivre: 50 }, prerequis: { prestige: 3 }, gainsMensuels: { prestige: 3, stats: { intelligence: 0.9, force: 0.3, constitution: 0.6, dexterite: 0.8, sagesse: 1.1, charisme: 0.4 } }, type: "mixte" }
            ]
        },
        "Grand Moulin": {
            description: "Grand moulin (à eau ou à vent) capable de traiter le grain de toute la région.",
            providesTags: ["farine"],
            requiresTags: { "grain": { distance: 8 } },
            emplois: [
                { tier: 2, titre: "Maître Meunier Propriétaire", postes: 1, salaire: { totalEnCuivre: 85 }, prerequis: { prestige: 11 }, gainsMensuels: { prestige: 5, stats: { intelligence: 0.8, force: 1.1, constitution: 1.1, dexterite: 0.9, sagesse: 1, charisme: 1 } }, type: "mixte" },
                { tier: 4, titre: "Ouvrier Meunier", postes: 4, salaire: { totalEnCuivre: 52 }, prerequis: { prestige: 2 }, gainsMensuels: { prestige: 2, stats: { intelligence: 0.4, force: 1, constitution: 1, dexterite: 0.7, sagesse: 0.6, charisme: 0.5 } }, type: "mixte" }
            ]
        },
        "Grand Domaine d'Élevage": {
            description: "Élevage à grande échelle de chevaux, de bétail ou de moutons pour la vente.",
            providesTags: ["bétail", "viande", "lait", "laine_brute", "cuir"],
            emplois: [
                { tier: 3, titre: "Éleveur", postes: 2, salaire: { totalEnCuivre: 75 }, prerequis: { prestige: 9 }, gainsMensuels: { prestige: 4, stats: { intelligence: 0.6, force: 0.9, constitution: 1.1, dexterite: 0.8, sagesse: 1.1, charisme: 0.7 } }, type: "mixte" },
                { tier: 4, titre: "Palefrenier / Vacher", postes: 8, salaire: { totalEnCuivre: 48 }, prerequis: { prestige: 2 }, gainsMensuels: { prestige: 2, stats: { intelligence: 0.4, force: 0.8, constitution: 1.1, dexterite: 1, sagesse: 1, charisme: 0.4 } }, type: "mixte" }
            ]
        },
        "Fromagerie": {
            description: "Transformation du lait en une variété de fromages.",
            providesTags: ["fromage"],
            requiresTags: { "lait": { distance: 3 } },
            emplois: [
                { tier: 3, titre: "Fromager", postes: 1, salaire: { totalEnCuivre: 68 }, prerequis: { prestige: 8 }, gainsMensuels: { prestige: 4, stats: { intelligence: 0.9, force: 0.6, constitution: 0.8, dexterite: 1, sagesse: 1.1, charisme: 0.7 } }, type: "mixte" },
                { tier: 4, titre: "Aide-Fromager", postes: 3, salaire: { totalEnCuivre: 45 }, prerequis: { prestige: 2 }, gainsMensuels: { prestige: 2, stats: { intelligence: 0.5, force: 0.5, constitution: 0.7, dexterite: 0.8, sagesse: 0.9, charisme: 0.5 } }, type: "mixte" }
            ]
        }
    },
    "Chasse/Nature": {
        "Guilde des Chasseurs": {
            description: "Organisation qui gère les droits de chasse, propose des contrats et vend du gibier.",
            providesTags: ["gibier", "peaux_brutes", "fourrures"],
            requiresTags: { "sécurité": { distance: 2 } },
            emplois: [
                { tier: 3, titre: "Maître de la Guilde des Chasseurs", postes: 1, salaire: { totalEnCuivre: 80 }, prerequis: { prestige: 12 }, gainsMensuels: { prestige: 5, stats: { intelligence: 0.8, force: 1, constitution: 1.1, dexterite: 1.1, sagesse: 1.1, charisme: 0.8 } }, type: "mixte" },
                { tier: 4, titre: "Chasseur", postes: 8, salaire: { totalEnCuivre: 55 }, prerequis: { prestige: 5 }, gainsMensuels: { prestige: 3, stats: { intelligence: 0.5, force: 0.8, constitution: 1, dexterite: 1.1, sagesse: 1.1, charisme: 0.5 } }, type: "mixte" }
            ]
        },
        "Port de Pêche": {
            description: "Installations portuaires pour une flotte de bateaux de pêche, avec un marché aux poissons.",
            providesTags: ["poisson"],
            requiresTags: { "navires": { distance: 1 } },
            emplois: [
                { tier: 3, titre: "Capitaine de Pêche", postes: 4, salaire: { totalEnCuivre: 65 }, prerequis: { prestige: 9 }, gainsMensuels: { prestige: 4, stats: { intelligence: 0.6, force: 1, constitution: 1.1, dexterite: 1.1, sagesse: 1.1, charisme: 0.6 } }, type: "mixte" },
                { tier: 5, titre: "Matelot-pêcheur", postes: 10, salaire: { totalEnCuivre: 40 }, prerequis: { prestige: 2 }, gainsMensuels: { prestige: 2, stats: { intelligence: 0.3, force: 0.8, constitution: 1.1, dexterite: 1, sagesse: 0.9, charisme: 0.3 } }, type: "mixte" }
            ]
        },
        "Tannerie": {
            description: "Traitement des peaux brutes pour en faire du cuir de différentes qualités.",
            providesTags: ["cuir"],
            requiresTags: { "peaux_brutes": { distance: 5 } },
            emplois: [
                { tier: 3, titre: "Maître Tanneur", postes: 2, salaire: { totalEnCuivre: 78 }, prerequis: { prestige: 8 }, gainsMensuels: { prestige: 4, stats: { intelligence: 0.6, force: 1.1, constitution: 1.1, dexterite: 0.8, sagesse: 0.7, charisme: 0.4 } }, type: "mixte" },
                { tier: 4, titre: "Ouvrier Tanneur", postes: 5, salaire: { totalEnCuivre: 45 }, prerequis: { prestige: 1 }, gainsMensuels: { prestige: 2, stats: { intelligence: 0.2, force: 1, constitution: 1.1, dexterite: 0.6, sagesse: 0.3, charisme: 0.2 } }, type: "mixte" }
            ]
        },
        "Serre Botanique": {
            description: "Culture de plantes rares, d'herbes médicinales exotiques et de fleurs ornementales.",
            providesTags: ["herbes_rares", "fleurs"],
            emplois: [
                { tier: 3, titre: "Botaniste", postes: 2, salaire: { totalEnCuivre: 65 }, prerequis: { prestige: 9 }, gainsMensuels: { prestige: 4, stats: { intelligence: 1.1, force: 0.4, constitution: 0.7, dexterite: 0.8, sagesse: 1.1, charisme: 0.5 } }, type: "mixte" },
                { tier: 4, titre: "Jardinier", postes: 4, salaire: { totalEnCuivre: 42 }, prerequis: { prestige: 3 }, gainsMensuels: { prestige: 2, stats: { intelligence: 0.9, force: 0.3, constitution: 0.6, dexterite: 0.7, sagesse: 1.1, charisme: 0.3 } }, type: "mixte" }
            ]
        },
        "Maîtrise des Eaux et Forêts": {
            description: "Gestion durable des forêts, surveillance des terres sauvages et organisation de l'abattage.",
            providesTags: ["bois_brut"],
            requiresTags: { "administration": { distance: 2 } },
            emplois: [
                { tier: 3, titre: "Maître Forestier", postes: 2, salaire: { totalEnCuivre: 72 }, prerequis: { prestige: 10 }, gainsMensuels: { prestige: 5, stats: { intelligence: 0.8, force: 1.1, constitution: 1.1, dexterite: 1, sagesse: 1.1, charisme: 0.7 } }, type: "mixte" },
                { tier: 4, titre: "Bûcheron", postes: 8, salaire: { totalEnCuivre: 50 }, prerequis: { prestige: 3 }, gainsMensuels: { prestige: 2, stats: { intelligence: 0.4, force: 1.1, constitution: 1.1, dexterite: 0.8, sagesse: 0.6, charisme: 0.4 } }, type: "mixte" }
            ]
        }
    }
};

EcoSimData.buildings['Ville'] = {
    "Bâtiments Administratifs": {
        "Palais du Gouverneur": {
            description: "Siège du pouvoir exécutif de la ville, où sont prises les décisions stratégiques.",
            providesTags: ["administration"],
            emplois: [
                { tier: 1, titre: "Gouverneur de la Ville", postes: 1, salaire: { totalEnCuivre: 250 }, prerequis: { prestige: 30 }, gainsMensuels: { prestige: 10, stats: { intelligence: 1.2, force: 0.7, constitution: 0.8, dexterite: 0.7, sagesse: 1.2, charisme: 1.2 } }, type: "mixte" },
                { tier: 2, titre: "Magistrat de la Cité", postes: 5, salaire: { totalEnCuivre: 150 }, prerequis: { prestige: 18 }, gainsMensuels: { prestige: 7, stats: { intelligence: 1.2, force: 0.6, constitution: 0.7, dexterite: 0.8, sagesse: 1.2, charisme: 1.2 } }, type: "mixte" }
            ]
        },
        "Caserne du Guet": {
            description: "Quartier général du Guet de la ville, responsable de la sécurité sur une grande échelle.",
            providesTags: ["sécurité"],
            requiresTags: { "armes_armures_qualite": { distance: 2 }, "vêtements_qualite": { distance: 5 }, "gestion_nourriture": { distance: 1 } },
            emplois: [
                { tier: 2, titre: "Commandant du Guet", postes: 1, salaire: { totalEnCuivre: 180 }, prerequis: { prestige: 22 }, gainsMensuels: { prestige: 8, stats: { intelligence: 1, force: 1.2, constitution: 1.2, dexterite: 1.1, sagesse: 1.1, charisme: 1.2 } }, type: "mixte" },
                { tier: 3, titre: "Officier du Guet", postes: 20, salaire: { totalEnCuivre: 90 }, prerequis: { prestige: 8 }, gainsMensuels: { prestige: 4, stats: { intelligence: 0.6, force: 1.2, constitution: 1.2, dexterite: 1, sagesse: 0.9, charisme: 0.8 } }, type: "mixte" }
            ]
        },
        "Palais de Justice": {
            description: "Principal organe judiciaire de la ville, traitant les affaires majeures et les appels.",
            providesTags: ["justice"],
            requiresTags: { "administration": { distance: 1 }, "savoir_écrit": { distance: 1 } },
            emplois: [
                { tier: 1, titre: "Haut-Juge", postes: 1, salaire: { totalEnCuivre: 220 }, prerequis: { prestige: 28 }, gainsMensuels: { prestige: 9, stats: { intelligence: 1.2, force: 0.4, constitution: 0.6, dexterite: 0.9, sagesse: 1.2, charisme: 1.1 } }, type: "mixte" },
                { tier: 2, titre: "Avocat de la Cour", postes: 4, salaire: { totalEnCuivre: 130 }, prerequis: { prestige: 15 }, gainsMensuels: { prestige: 6, stats: { intelligence: 1.2, force: 0.3, constitution: 0.5, dexterite: 1, sagesse: 1.1, charisme: 1 } }, type: "mixte" }
            ]
        },
        "Trésor de la Cité": {
            description: "Centre financier de la ville, gérant la fiscalité, la monnaie et les dépenses publiques.",
            providesTags: ["finance_publique"],
            requiresTags: { "administration": { distance: 1 }, "commerce": { distance: 1 } },
            emplois: [
                { tier: 2, titre: "Grand Argentier", postes: 1, salaire: { totalEnCuivre: 160 }, prerequis: { prestige: 20 }, gainsMensuels: { prestige: 7, stats: { intelligence: 1.2, force: 0.5, constitution: 0.7, dexterite: 1, sagesse: 1.1, charisme: 1 } }, type: "mixte" },
                { tier: 3, titre: "Intendant des Finances", postes: 4, salaire: { totalEnCuivre: 100 }, prerequis: { prestige: 10 }, gainsMensuels: { prestige: 4, stats: { intelligence: 1.2, force: 0.4, constitution: 0.6, dexterite: 1.1, sagesse: 1, charisme: 0.8 } }, type: "mixte" }
            ]
        }
    },
    "Bâtiments de Production": {
        "Arsenal de la Ville": {
            description: "Complexe de forges produisant en masse des équipements militaires de haute qualité.",
            providesTags: ["armes_armures_qualite", "equipement_de_siege"],
            requiresTags: { "pieces_metalliques": { distance: 5 }, "bois_transformé": { distance: 10 } },
            emplois: [
                { tier: 2, titre: "Maître Armurier de l'Arsenal", postes: 2, salaire: { totalEnCuivre: 190 }, prerequis: { prestige: 20 }, gainsMensuels: { prestige: 8, stats: { intelligence: 0.9, force: 1.2, constitution: 1.2, dexterite: 1.1, sagesse: 1, charisme: 1.1 } }, type: "mixte" },
                { tier: 3, titre: "Ingénieur de Siège", postes: 4, salaire: { totalEnCuivre: 110 }, prerequis: { prestige: 10 }, gainsMensuels: { prestige: 5, stats: { intelligence: 1.2, force: 0.8, constitution: 0.9, dexterite: 1, sagesse: 0.8, charisme: 0.7 } }, type: "mixte" }
            ]
        },
        "Atelier de Haute Couture": {
            description: "Ateliers de luxe créant des vêtements pour la noblesse et les riches marchands.",
            providesTags: ["vêtements_luxe"],
            requiresTags: { "tissu": { distance: 5 }, "fourrures_traitees": { distance: 8 } },
            emplois: [
                { tier: 2, titre: "Maître Couturier", postes: 2, salaire: { totalEnCuivre: 160 }, prerequis: { prestige: 18 }, gainsMensuels: { prestige: 7, stats: { intelligence: 1.1, force: 0.4, constitution: 0.7, dexterite: 1.2, sagesse: 1.1, charisme: 1.2 } }, type: "mixte" },
                { tier: 4, titre: "Artisan Tisserand", postes: 8, salaire: { totalEnCuivre: 85 }, prerequis: { prestige: 6 }, gainsMensuels: { prestige: 4, stats: { intelligence: 0.9, force: 0.3, constitution: 0.6, dexterite: 1.2, sagesse: 0.9, charisme: 0.9 } }, type: "mixte" }
            ]
        },
        "Grands Chantiers Navals": {
            description: "Construction de navires marchands, de galères de guerre et de navires d'exploration.",
            providesTags: ["navires_marchands", "navires_de_guerre"],
            requiresTags: { "bois_transformé": { distance: 10 }, "pieces_metalliques": { distance: 10 }, "tissu": { distance: 10 } },
            emplois: [
                { tier: 2, titre: "Architecte Naval", postes: 2, salaire: { totalEnCuivre: 150 }, prerequis: { prestige: 16 }, gainsMensuels: { prestige: 6, stats: { intelligence: 1.2, force: 1, constitution: 1, dexterite: 1.1, sagesse: 0.9, charisme: 0.8 } }, type: "mixte" },
                { tier: 3, titre: "Maître de Cale", postes: 8, salaire: { totalEnCuivre: 95 }, prerequis: { prestige: 5 }, gainsMensuels: { prestige: 3, stats: { intelligence: 0.5, force: 1.2, constitution: 1.1, dexterite: 1, sagesse: 0.6, charisme: 0.6 } }, type: "mixte" }
            ]
        },
        "Grands Fournils de la Cité": {
            description: "Vastes fournils assurant l'approvisionnement en pain de toute la ville.",
            providesTags: ["pain_patisseries"],
            requiresTags: { "farine": { distance: 10 }, "gestion_nourriture": { distance: 1 } },
            emplois: [
                { tier: 3, titre: "Contremaître des Fournils", postes: 2, salaire: { totalEnCuivre: 120 }, prerequis: { prestige: 12 }, gainsMensuels: { prestige: 5, stats: { intelligence: 1.1, force: 0.8, constitution: 1, dexterite: 1.1, sagesse: 1.1, charisme: 1 } }, type: "mixte" },
                { tier: 4, titre: "Boulanger", postes: 10, salaire: { totalEnCuivre: 80 }, prerequis: { prestige: 4 }, gainsMensuels: { prestige: 3, stats: { intelligence: 0.8, force: 0.7, constitution: 0.9, dexterite: 1.2, sagesse: 1, charisme: 0.8 } }, type: "mixte" }
            ]
        },
        "Distillerie d'Alcools Fins": {
            description: "Production de spiritueux, liqueurs et alcools de prestige pour l'exportation.",
            providesTags: ["alcools_fins"],
            requiresTags: { "fruits": { distance: 15 }, "grain": { distance: 15 }, "herbes_rares": { distance: 15 } },
            emplois: [
                { tier: 2, titre: "Maître Distillateur", postes: 2, salaire: { totalEnCuivre: 140 }, prerequis: { prestige: 15 }, gainsMensuels: { prestige: 6, stats: { intelligence: 1.2, force: 0.7, constitution: 0.9, dexterite: 1, sagesse: 1.2, charisme: 0.9 } }, type: "mixte" },
                { tier: 4, titre: "Maître de Chai", postes: 6, salaire: { totalEnCuivre: 75 }, prerequis: { prestige: 4 }, gainsMensuels: { prestige: 3, stats: { intelligence: 0.6, force: 0.9, constitution: 1.1, dexterite: 0.8, sagesse: 0.8, charisme: 0.6 } }, type: "mixte" }
            ]
        }
    },
    "Bâtiments Indépendants": {
        "Opéra Royal": {
            description: "Scène prestigieuse pour les opéras, les ballets et les concerts symphoniques.",
            providesTags: ["divertissement_luxe"],
            requiresTags: { "administration": { distance: 2 }, "sécurité": { distance: 2 } },
            emplois: [
                { tier: 2, titre: "Directeur de l'Opéra", postes: 1, salaire: { totalEnCuivre: 170 }, prerequis: { prestige: 18 }, gainsMensuels: { prestige: 7, stats: { intelligence: 1.1, force: 0.5, constitution: 0.7, dexterite: 1, sagesse: 1.1, charisme: 1.2 } }, type: "mixte" },
                { tier: 3, titre: "Soliste d'Opéra", postes: 4, salaire: { totalEnCuivre: 110 }, prerequis: { prestige: 10 }, gainsMensuels: { prestige: 5, stats: { intelligence: 0.7, force: 0.6, constitution: 0.9, dexterite: 1.1, sagesse: 0.7, charisme: 1.2 } }, type: "mixte" }
            ]
        },
        "Académie des Arcanes": {
            description: "Institution d'enseignement et de recherche sur la magie et l'alchimie.",
            providesTags: ["savoir_arcanique", "potions_complexes"],
            requiresTags: { "herbes_rares": { distance: 15 }, "savoir_écrit": { distance: 2 }, "sécurité": { distance: 2 } },
            emplois: [
                { tier: 1, titre: "Archimage de l'Académie", postes: 1, salaire: { totalEnCuivre: 280 }, prerequis: { prestige: 35 }, gainsMensuels: { prestige: 12, stats: { intelligence: 1.2, force: 0.4, constitution: 0.7, dexterite: 1.1, sagesse: 1.2, charisme: 1 } }, type: "mixte" },
                { tier: 2, titre: "Professeur", postes: 5, salaire: { totalEnCuivre: 160 }, prerequis: { prestige: 20 }, gainsMensuels: { prestige: 8, stats: { intelligence: 1.2, force: 0.3, constitution: 0.6, dexterite: 1, sagesse: 1.2, charisme: 0.8 } }, type: "mixte" }
            ]
        },
        "Halle aux Marchands": {
            description: "Coeur économique où les grandes maisons marchandes négocient des contrats et des matières premières.",
            providesTags: ["commerce", "finance_privee"],
            requiresTags: { "sécurité": { distance: 2 }, "contrats": { distance: 2 }, "justice": { distance: 1 } },
            emplois: [
                { tier: 1, titre: "Prince Marchand", postes: 3, salaire: { totalEnCuivre: 230 }, prerequis: { prestige: 25 }, gainsMensuels: { prestige: 9, stats: { intelligence: 1.2, force: 0.6, constitution: 0.8, dexterite: 0.9, sagesse: 1.2, charisme: 1.2 } }, type: "mixte" },
                { tier: 3, titre: "Courtier", postes: 10, salaire: { totalEnCuivre: 120 }, prerequis: { prestige: 12 }, gainsMensuels: { prestige: 5, stats: { intelligence: 1.1, force: 0.5, constitution: 0.7, dexterite: 0.8, sagesse: 1, charisme: 1.2 } }, type: "mixte" }
            ]
        },
        "Université": {
            description: "Centre d'études supérieures pour la philosophie, la science, l'histoire et la médecine.",
            providesTags: ["savoir_avance", "soin"],
            requiresTags: { "savoir_écrit": { distance: 2 }, "administration": { distance: 2 } },
            emplois: [
                { tier: 1, titre: "Recteur de l'Université", postes: 1, salaire: { totalEnCuivre: 260 }, prerequis: { prestige: 32 }, gainsMensuels: { prestige: 11, stats: { intelligence: 1.2, force: 0.4, constitution: 0.6, dexterite: 0.7, sagesse: 1.2, charisme: 1.1 } }, type: "mixte" },
                { tier: 2, titre: "Érudit / Chercheur", postes: 12, salaire: { totalEnCuivre: 140 }, prerequis: { prestige: 18 }, gainsMensuels: { prestige: 7, stats: { intelligence: 1.2, force: 0.3, constitution: 0.5, dexterite: 0.9, sagesse: 1.2, charisme: 0.8 } }, type: "mixte" }
            ]
        }
    },
    "Bâtiments Agricoles": {
        "Office des Vivres": {
            description: "Organisme gérant l'importation de nourriture des campagnes et la distribution dans la ville.",
            providesTags: ["gestion_nourriture"],
            requiresTags: { "commerce": { distance: 0 }, "grain": { distance: 25 }, "viande": { distance: 25 }, "poisson": { distance: 25 } },
            emplois: [
                { tier: 2, titre: "Intendant des Vivres", postes: 1, salaire: { totalEnCuivre: 130 }, prerequis: { prestige: 15 }, gainsMensuels: { prestige: 6, stats: { intelligence: 1.1, force: 0.8, constitution: 1, dexterite: 0.8, sagesse: 1.1, charisme: 1.1 } }, type: "mixte" },
                { tier: 3, titre: "Approvisionneur de la Cité", postes: 10, salaire: { totalEnCuivre: 80 }, prerequis: { prestige: 5 }, gainsMensuels: { prestige: 3, stats: { intelligence: 1, force: 0.9, constitution: 1.1, dexterite: 0.9, sagesse: 0.8, charisme: 0.7 } }, type: "mixte" }
            ]
        },
        "Halle aux Vins": {
            description: "Caves de vieillissement et de commerce des vins les plus fins du royaume.",
            providesTags: ["vin"],
            requiresTags: { "raisins": { distance: 20 }, "commerce": { distance: 0 } },
            emplois: [
                { tier: 2, titre: "Maître Sommelier", postes: 2, salaire: { totalEnCuivre: 125 }, prerequis: { prestige: 14 }, gainsMensuels: { prestige: 6, stats: { intelligence: 1, force: 0.6, constitution: 0.8, dexterite: 1.1, sagesse: 1.2, charisme: 1 } }, type: "mixte" },
                { tier: 4, titre: "Caviste", postes: 8, salaire: { totalEnCuivre: 70 }, prerequis: { prestige: 4 }, gainsMensuels: { prestige: 3, stats: { intelligence: 0.7, force: 0.7, constitution: 0.9, dexterite: 1, sagesse: 1, charisme: 0.6 } }, type: "mixte" }
            ]
        },
        "Marché aux Bestiaux": {
            description: "Grande place pour la vente de bétail, de chevaux et d'animaux d'élevage.",
            providesTags: ["bétail"],
            requiresTags: { "commerce": { distance: 0 } },
            emplois: [
                { tier: 3, titre: "Marchand de bestiaux", postes: 4, salaire: { totalEnCuivre: 100 }, prerequis: { prestige: 10 }, gainsMensuels: { prestige: 5, stats: { intelligence: 0.8, force: 1, constitution: 1.1, dexterite: 0.9, sagesse: 1.1, charisme: 0.9 } }, type: "mixte" },
                { tier: 4, titre: "Soigneur d'Écurie", postes: 12, salaire: { totalEnCuivre: 65 }, prerequis: { prestige: 3 }, gainsMensuels: { prestige: 2, stats: { intelligence: 0.5, force: 0.9, constitution: 1.2, dexterite: 1.1, sagesse: 1, charisme: 0.5 } }, type: "mixte" }
            ]
        },
        "Halles Centrales": {
            description: "Marché couvert central pour les produits frais : fruits, légumes, fromages, etc.",
            providesTags: ["commerce_alimentaire"],
            requiresTags: { "légumes": { distance: 15 }, "fruits": { distance: 15 }, "fromage": { distance: 15 } },
            emplois: [
                { tier: 3, titre: "Intendant des Halles", postes: 2, salaire: { totalEnCuivre: 110 }, prerequis: { prestige: 12 }, gainsMensuels: { prestige: 5, stats: { intelligence: 1, force: 0.9, constitution: 1, dexterite: 1, sagesse: 1.1, charisme: 1.1 } }, type: "mixte" },
                { tier: 4, titre: "Marchand Primeur", postes: 15, salaire: { totalEnCuivre: 75 }, prerequis: { prestige: 4 }, gainsMensuels: { prestige: 3, stats: { intelligence: 0.8, force: 0.7, constitution: 0.8, dexterite: 0.9, sagesse: 0.9, charisme: 1 } }, type: "mixte" }
            ]
        },
        "Abattoirs de la Ville": {
            description: "Installations centralisées pour l'abattage et la préparation de la viande.",
            providesTags: ["viande"],
            requiresTags: { "bétail": { distance: 2 } },
            emplois: [
                { tier: 3, titre: "Maître Boucher", postes: 4, salaire: { totalEnCuivre: 95 }, prerequis: { prestige: 8 }, gainsMensuels: { prestige: 4, stats: { intelligence: 0.6, force: 1.1, constitution: 1.1, dexterite: 1.2, sagesse: 0.7, charisme: 0.6 } }, type: "mixte" },
                { tier: 4, titre: "Ouvrier d'Abattoir", postes: 15, salaire: { totalEnCuivre: 60 }, prerequis: { prestige: 1 }, gainsMensuels: { prestige: 1, stats: { intelligence: 0.2, force: 1.2, constitution: 1.2, dexterite: 0.8, sagesse: 0.3, charisme: 0.3 } }, type: "mixte" }
            ]
        },
        "Comptoir des Tabacs et Herbes": {
            description: "Traitement et conditionnement de tabac et d'herbes à fumer ou à priser.",
            providesTags: ["tabac"],
            requiresTags: { "herbes_communes": { distance: 20 }, "commerce": { distance: 0 } },
            emplois: [
                { tier: 3, titre: "Maître Herboriste", postes: 2, salaire: { totalEnCuivre: 90 }, prerequis: { prestige: 9 }, gainsMensuels: { prestige: 4, stats: { intelligence: 1, force: 0.6, constitution: 0.8, dexterite: 1, sagesse: 1.2, charisme: 0.8 } }, type: "mixte" },
                { tier: 4, titre: "Artisan Préparateur", postes: 10, salaire: { totalEnCuivre: 55 }, prerequis: { prestige: 2 }, gainsMensuels: { prestige: 2, stats: { intelligence: 0.4, force: 0.5, constitution: 0.7, dexterite: 0.9, sagesse: 0.7, charisme: 0.5 } }, type: "mixte" }
            ]
        }
    },
    "Chasse/Nature": {
        "Guilde des Pelletiers": {
            description: "Contrôle le commerce des fourrures et des peaux précieuses dans la ville et pour l'export.",
            providesTags: ["cuir", "fourrures_traitees"],
            requiresTags: { "peaux_brutes": { distance: 20 }, "fourrures": { distance: 20 }, "commerce": { distance: 0 } },
            emplois: [
                { tier: 2, titre: "Maître de la Guilde", postes: 1, salaire: { totalEnCuivre: 145 }, prerequis: { prestige: 16 }, gainsMensuels: { prestige: 6, stats: { intelligence: 1.1, force: 0.8, constitution: 0.9, dexterite: 1.1, sagesse: 1.2, charisme: 1.1 } }, type: "mixte" },
                { tier: 3, titre: "Négociant en fourrures", postes: 6, salaire: { totalEnCuivre: 90 }, prerequis: { prestige: 8 }, gainsMensuels: { prestige: 4, stats: { intelligence: 1, force: 0.6, constitution: 0.8, dexterite: 1.2, sagesse: 1.1, charisme: 0.8 } }, type: "mixte" }
            ]
        },
        "Docks et Marché au Poisson": {
            description: "Centre névralgique de la pêche, réceptionnant les prises de haute mer et de rivière.",
            providesTags: ["poisson", "commerce_maritime"],
            requiresTags: { "navires": { distance: 2 }, "sécurité": { distance: 1 } },
            emplois: [
                { tier: 3, titre: "Armateur de Pêche", postes: 4, salaire: { totalEnCuivre: 115 }, prerequis: { prestige: 12 }, gainsMensuels: { prestige: 5, stats: { intelligence: 0.8, force: 1.1, constitution: 1.2, dexterite: 1.1, sagesse: 1.1, charisme: 0.9 } }, type: "mixte" },
                { tier: 4, titre: "Débardeur", postes: 20, salaire: { totalEnCuivre: 65 }, prerequis: { prestige: 2 }, gainsMensuels: { prestige: 2, stats: { intelligence: 0.4, force: 1.2, constitution: 1.2, dexterite: 0.9, sagesse: 0.5, charisme: 0.4 } }, type: "mixte" }
            ]
        },
        "Quartier des Tanneurs": {
            description: "Zone industrielle dédiée au traitement à grande échelle du cuir pour l'artisanat.",
            providesTags: ["cuir"],
            requiresTags: { "peaux_brutes": { distance: 10 } },
            emplois: [
                { tier: 3, titre: "Propriétaire de Tannerie", postes: 3, salaire: { totalEnCuivre: 110 }, prerequis: { prestige: 10 }, gainsMensuels: { prestige: 5, stats: { intelligence: 0.7, force: 1.2, constitution: 1.2, dexterite: 1, sagesse: 0.8, charisme: 0.5 } }, type: "mixte" },
                { tier: 4, titre: "Artisan du Cuir", postes: 10, salaire: { totalEnCuivre: 70 }, prerequis: { prestige: 3 }, gainsMensuels: { prestige: 3, stats: { intelligence: 0.4, force: 1, constitution: 1.1, dexterite: 1.1, sagesse: 0.5, charisme: 0.4 } }, type: "mixte" }
            ]
        },
        "Jardin Botanique Royal": {
            description: "Collection de plantes exotiques et rares à des fins de recherche, de conservation et d'agrément.",
            providesTags: ["herbes_rares", "fleurs"],
            requiresTags: { "administration": { distance: 2 }, "savoir_avance": { distance: 1 } },
            emplois: [
                { tier: 2, titre: "Conservateur du Jardin", postes: 1, salaire: { totalEnCuivre: 130 }, prerequis: { prestige: 15 }, gainsMensuels: { prestige: 6, stats: { intelligence: 1.2, force: 0.5, constitution: 0.8, dexterite: 1, sagesse: 1.2, charisme: 0.8 } }, type: "mixte" },
                { tier: 3, titre: "Horticulteur", postes: 6, salaire: { totalEnCuivre: 80 }, prerequis: { prestige: 6 }, gainsMensuels: { prestige: 4, stats: { intelligence: 1.1, force: 0.4, constitution: 0.7, dexterite: 0.9, sagesse: 1.2, charisme: 0.6 } }, type: "mixte" }
            ]
        },
        "Ménagerie de la Ville": {
            description: "Parc abritant des créatures et des bêtes exotiques pour l'étude et le divertissement.",
            providesTags: ["betes_exotiques"],
            requiresTags: { "gibier": { distance: 15 }, "viande": { distance: 2 }, "sécurité": { distance: 2 } },
            emplois: [
                { tier: 3, titre: "Maître des Bêtes", postes: 3, salaire: { totalEnCuivre: 105 }, prerequis: { prestige: 14 }, gainsMensuels: { prestige: 6, stats: { intelligence: 1, force: 1.1, constitution: 1.1, dexterite: 1, sagesse: 1.2, charisme: 0.9 } }, type: "mixte" },
                { tier: 4, titre: "Gardien de la Ménagerie", postes: 10, salaire: { totalEnCuivre: 70 }, prerequis: { prestige: 4 }, gainsMensuels: { prestige: 3, stats: { intelligence: 0.6, force: 1, constitution: 1.1, dexterite: 0.9, sagesse: 1, charisme: 0.6 } }, type: "mixte" }
            ]
        }
    }
};


// --- NOUVEAUX BÂTIMENTS POUR HAMEAU ---
EcoSimData.buildings['Hameau']["Chasse/Nature"]["Cabane de l'Orpailleur"] = {
    description: "Un chercheur d'or solitaire qui tamise le lit de la rivière à la recherche de pépites.",
    providesTags: ["or_brut"],
    requiresTags: { "outils_simples": { distance: 5 } },
    emplois: [
        { tier: 4, titre: "Orpailleur", postes: 1, salaire: { totalEnCuivre: 41 }, prerequis: { prestige: 3 }, gainsMensuels: { prestige: 2, stats: { intelligence: 0.3, force: 0.8, constitution: 1, dexterite: 0.8, sagesse: 1, charisme: 0.1 } }, type: "mixte" }
    ]
};
EcoSimData.buildings['Hameau']["Chasse/Nature"]["Carrière de Pierre"] = {
    description: "Extraction de blocs de pierre bruts pour la construction, une tâche ardue et dangereuse.",
    providesTags: ["pierre"],
    requiresTags: { "outils_simples": { distance: 3 } },
    emplois: [
        { tier: 4, titre: "Carrier", postes: 3, salaire: { totalEnCuivre: 36 }, prerequis: { prestige: 2 }, gainsMensuels: { prestige: 2, stats: { intelligence: 0.1, force: 1.2, constitution: 1.2, dexterite: 0.5, sagesse: 0.2, charisme: 0.1 } }, type: "mixte" }
    ]
};
EcoSimData.buildings['Hameau']["Bâtiments de Production"]["Four à Charbon"] = {
    description: "Une meule de terre et de bois qui transforme lentement le bois en charbon pour les forges.",
    providesTags: ["charbon"],
    requiresTags: { "bois_brut": { distance: 2 } },
    emplois: [
        { tier: 4, titre: "Charbonnier", postes: 2, salaire: { totalEnCuivre: 34 }, prerequis: { prestige: 3 }, gainsMensuels: { prestige: 2, stats: { intelligence: 0.4, force: 0.9, constitution: 1.1, dexterite: 0.6, sagesse: 0.8, charisme: 0.2 } }, type: "mixte" }
    ]
};

// --- NOUVEAUX BÂTIMENTS POUR VILLAGE ---
EcoSimData.buildings['Village']["Bâtiments de Production"]["Atelier du Tailleur de Pierre"] = {
    description: "Transforme les blocs bruts de la carrière en pierres de construction prêtes à l'emploi.",
    providesTags: ["pierre_taillee"],
    requiresTags: { "pierre": { distance: 8 }, "outils_simples": { distance: 3 } },
    emplois: [
        { tier: 3, titre: "Maître Tailleur de Pierre", postes: 1, salaire: { totalEnCuivre: 73 }, prerequis: { prestige: 9 }, gainsMensuels: { prestige: 4, stats: { intelligence: 0.6, force: 1.1, constitution: 1.1, dexterite: 0.9, sagesse: 0.7, charisme: 0.5 } }, type: "mixte" },
        { tier: 4, titre: "Apprenti Tailleur", postes: 2, salaire: { totalEnCuivre: 46 }, prerequis: { prestige: 2 }, gainsMensuels: { prestige: 2, stats: { intelligence: 0.3, force: 1, constitution: 1, dexterite: 0.7, sagesse: 0.4, charisme: 0.3 } }, type: "mixte" }
    ]
};
EcoSimData.buildings['Village']["Bâtiments de Production"]["Sablière"] = {
    description: "Exploitation d'un gisement de sable fin, une ressource essentielle pour la fabrication du verre.",
    providesTags: ["sable_de_verre"],
    emplois: [
        { tier: 5, titre: "Ouvrier Sablier", postes: 4, salaire: { totalEnCuivre: 29 }, prerequis: { prestige: 0 }, gainsMensuels: { prestige: 1, stats: { intelligence: 0.1, force: 1, constitution: 1, dexterite: 0.5, sagesse: 0.1, charisme: 0.1 } }, type: "mixte" }
    ]
};
EcoSimData.buildings['Village']["Bâtiments Indépendants"]["Verrerie Simple"] = {
    description: "Un petit atelier qui fabrique du verre et des objets utilitaires comme des fioles et des vitres.",
    providesTags: ["verre", "verrerie_utilitaire"],
    requiresTags: { "sable_de_verre": { distance: 5 }, "charbon": { distance: 10 } },
    emplois: [
        { tier: 3, titre: "Maître Verrier", postes: 1, salaire: { totalEnCuivre: 78 }, prerequis: { prestige: 10 }, gainsMensuels: { prestige: 5, stats: { intelligence: 1, force: 0.5, constitution: 0.8, dexterite: 1.1, sagesse: 1, charisme: 0.8 } }, type: "mixte" },
        { tier: 4, titre: "Souffleur de Verre", postes: 2, salaire: { totalEnCuivre: 52 }, prerequis: { prestige: 3 }, gainsMensuels: { prestige: 2, stats: { intelligence: 0.6, force: 0.4, constitution: 0.7, dexterite: 1.2, sagesse: 0.8, charisme: 0.5 } }, type: "mixte" }
    ]
};

// --- NOUVEAUX BÂTIMENTS POUR BOURG ---
EcoSimData.buildings['Bourg']["Chasse/Nature"]["Mine de Métaux Précieux"] = {
    description: "Une mine bien organisée pour extraire l'or, l'argent et les gemmes des profondeurs de la terre.",
    providesTags: ["or_brut", "argent_brut", "pierres_precieuses"],
    requiresTags: { "bois_transformé": { distance: 10 }, "outils_simples": { distance: 5 }, "sécurité": { distance: 3 } },
    emplois: [
        { tier: 3, titre: "Maître Mineur", postes: 1, salaire: { totalEnCuivre: 90 }, prerequis: { prestige: 12 }, gainsMensuels: { prestige: 5, stats: { intelligence: 0.7, force: 1.1, constitution: 1.2, dexterite: 0.8, sagesse: 0.9, charisme: 0.6 } }, type: "mixte" },
        { tier: 4, titre: "Mineur de Fond", postes: 8, salaire: { totalEnCuivre: 60 }, prerequis: { prestige: 3 }, gainsMensuels: { prestige: 2, stats: { intelligence: 0.3, force: 1.2, constitution: 1.2, dexterite: 0.6, sagesse: 0.4, charisme: 0.2 } }, type: "mixte" }
    ]
};
EcoSimData.buildings['Bourg']["Bâtiments de Production"]["Fonderie de Métaux Précieux"] = {
    description: "Purifie les minerais bruts pour en extraire des lingots d'or et d'argent purs.",
    providesTags: ["or_raffine", "argent_raffine"],
    requiresTags: { "or_brut": { distance: 8 }, "argent_brut": { distance: 8 }, "charbon": { distance: 8 } },
    emplois: [
        { tier: 3, titre: "Maître Fondeur", postes: 1, salaire: { totalEnCuivre: 100 }, prerequis: { prestige: 14 }, gainsMensuels: { prestige: 6, stats: { intelligence: 1, force: 0.8, constitution: 1, dexterite: 0.9, sagesse: 1, charisme: 0.7 } }, type: "mixte" }
    ]
};
EcoSimData.buildings['Bourg']["Bâtiments de Production"]["Atelier du Lapidaire"] = {
    description: "Un artisan aux doigts de fée qui taille les pierres précieuses brutes pour révéler tout leur éclat.",
    providesTags: ["pierres_taillees"],
    requiresTags: { "pierres_precieuses": { distance: 10 }, "outils_simples": { distance: 2 } },
    emplois: [
        { tier: 3, titre: "Maître Lapidaire", postes: 1, salaire: { totalEnCuivre: 95 }, prerequis: { prestige: 13 }, gainsMensuels: { prestige: 6, stats: { intelligence: 1.1, force: 0.2, constitution: 0.5, dexterite: 1.2, sagesse: 1.1, charisme: 0.8 } }, type: "mixte" }
    ]
};
EcoSimData.buildings['Bourg']["Bâtiments de Production"]["Joaillerie"] = {
    description: "Fabrique et vend des bijoux de qualité pour une clientèle aisée.",
    providesTags: ["bijoux_simples"],
    requiresTags: { "or_raffine": { distance: 5 }, "argent_raffine": { distance: 5 }, "pierres_taillees": { distance: 5 }, "sécurité": { distance: 1 } },
    emplois: [
        { tier: 2, titre: "Maître Joaillier", postes: 1, salaire: { totalEnCuivre: 110 }, prerequis: { prestige: 16 }, gainsMensuels: { prestige: 7, stats: { intelligence: 1.1, force: 0.3, constitution: 0.6, dexterite: 1.2, sagesse: 1, charisme: 1.1 } }, type: "mixte" },
        { tier: 4, titre: "Artisan Joaillier", postes: 3, salaire: { totalEnCuivre: 70 }, prerequis: { prestige: 6 }, gainsMensuels: { prestige: 3, stats: { intelligence: 0.8, force: 0.2, constitution: 0.5, dexterite: 1.1, sagesse: 0.8, charisme: 0.9 } }, type: "mixte" }
    ]
};

// --- NOUVEAUX BÂTIMENTS POUR VILLE ---
EcoSimData.buildings['Ville']["Bâtiments de Production"]["Atelier d'Orfèvrerie"] = {
    description: "Un maître artisan qui crée des pièces uniques, des couronnes et des bijoux de grand luxe pour la noblesse.",
    providesTags: ["orfevrerie", "bijoux_luxe"],
    requiresTags: { "or_raffine": { distance: 8 }, "pierres_taillees": { distance: 8 }, "savoir_alchimique": { distance: 2 }, "finance_privee": { distance: 1 } },
    emplois: [
        { tier: 1, titre: "Maître Orfèvre", postes: 1, salaire: { totalEnCuivre: 240 }, prerequis: { prestige: 26 }, gainsMensuels: { prestige: 10, stats: { intelligence: 1.2, force: 0.4, constitution: 0.7, dexterite: 1.2, sagesse: 1.1, charisme: 1.2 } }, type: "mixte" },
        { tier: 3, titre: "Compagnon Orfèvre", postes: 4, salaire: { totalEnCuivre: 130 }, prerequis: { prestige: 12 }, gainsMensuels: { prestige: 5, stats: { intelligence: 1, force: 0.3, constitution: 0.6, dexterite: 1.2, sagesse: 0.9, charisme: 1 } }, type: "mixte" }
    ]
};
EcoSimData.buildings['Ville']["Bâtiments de Production"]["Papeterie"] = {
    description: "Fabrique du papier de haute qualité à partir de vieux tissus ou de pulpe de bois.",
    providesTags: ["papier"],
    requiresTags: { "tissu": { distance: 10 }, "bois_transformé": { distance: 10 } },
    emplois: [
        { tier: 3, titre: "Maître Papetier", postes: 1, salaire: { totalEnCuivre: 100 }, prerequis: { prestige: 11 }, gainsMensuels: { prestige: 5, stats: { intelligence: 0.8, force: 1, constitution: 1, dexterite: 0.9, sagesse: 0.9, charisme: 0.6 } }, type: "mixte" }
    ]
};
EcoSimData.buildings['Ville']["Bâtiments de Production"]["Atelier d'Encre"] = {
    description: "Prépare des encres de différentes couleurs à partir de suie, de gommes et de pigments.",
    providesTags: ["encre"],
    requiresTags: { "charbon": { distance: 15 }, "cire": { distance: 15 }, "herbes_rares": { distance: 10 } },
    emplois: [
        { tier: 3, titre: "Maître Encreur", postes: 1, salaire: { totalEnCuivre: 90 }, prerequis: { prestige: 10 }, gainsMensuels: { prestige: 4, stats: { intelligence: 1.1, force: 0.4, constitution: 0.6, dexterite: 1, sagesse: 1.1, charisme: 0.5 } }, type: "mixte" }
    ]
};
EcoSimData.buildings['Ville']["Bâtiments de Production"]["Imprimerie"] = {
    description: "Une presse révolutionnaire qui permet de copier des livres et des décrets en grande quantité.",
    providesTags: ["livres", "parchemins_imprimes", "savoir_écrit"],
    requiresTags: { "papier": { distance: 2 }, "encre": { distance: 3 }, "pieces_metalliques": { distance: 5 }, "savoir_écrit": { distance: 1 } },
    emplois: [
        { tier: 2, titre: "Maître Imprimeur", postes: 1, salaire: { totalEnCuivre: 150 }, prerequis: { prestige: 18 }, gainsMensuels: { prestige: 7, stats: { intelligence: 1.2, force: 0.6, constitution: 0.8, dexterite: 1.1, sagesse: 1, charisme: 1 } }, type: "mixte" },
        { tier: 4, titre: "Opérateur de Presse", postes: 5, salaire: { totalEnCuivre: 80 }, prerequis: { prestige: 6 }, gainsMensuels: { prestige: 3, stats: { intelligence: 0.7, force: 0.8, constitution: 0.9, dexterite: 1, sagesse: 0.6, charisme: 0.5 } }, type: "mixte" }
    ]
};
EcoSimData.buildings['Ville']["Bâtiments Indépendants"]["Observatoire"] = {
    description: "Une tour pour cartographier les étoiles, équippée de lentilles et de cartes célestes complexes.",
    providesTags: ["savoir_astronomique"],
    requiresTags: { "savoir_avance": { distance: 1 }, "verre": { distance: 10 }, "pieces_metalliques": { distance: 8 } },
    emplois: [
        { tier: 2, titre: "Astronome Royal", postes: 1, salaire: { totalEnCuivre: 180 }, prerequis: { prestige: 22 }, gainsMensuels: { prestige: 8, stats: { intelligence: 1.2, force: 0.3, constitution: 0.6, dexterite: 1, sagesse: 1.2, charisme: 0.9 } }, type: "mixte" },
        { tier: 3, titre: "Assistant Astronome", postes: 3, salaire: { totalEnCuivre: 110 }, prerequis: { prestige: 10 }, gainsMensuels: { prestige: 4, stats: { intelligence: 1.2, force: 0.2, constitution: 0.5, dexterite: 0.9, sagesse: 1.2, charisme: 0.7 } }, type: "mixte" }
    ]
};
EcoSimData.buildings['Ville']["Bâtiments Indépendants"]["Verrerie d'Art"] = {
    description: "Crée des objets en verre d'une finesse inégalée, des vitraux pour les temples et des miroirs de luxe.",
    providesTags: ["verrerie_art", "vitraux", "equipement_optique"],
    requiresTags: { "verre": { distance: 15 }, "or_raffine": { distance: 10 }, "charbon": { distance: 15 } },
    emplois: [
        { tier: 2, titre: "Artiste Verrier", postes: 2, salaire: { totalEnCuivre: 140 }, prerequis: { prestige: 17 }, gainsMensuels: { prestige: 7, stats: { intelligence: 1.1, force: 0.4, constitution: 0.7, dexterite: 1.2, sagesse: 1, charisme: 1.1 } }, type: "mixte" }
    ]
};

EcoSimData.buildings['Capitale'] = {
    "Bâtiments Administratifs": {
        "Palais Royal": {
            description: "Le cœur du pouvoir, résidence du monarque et centre de l'administration suprême du royaume.",
            providesTags: ["administration_royale", "haute_politique", "diplomatie"],
            requiresTags: { "sécurité": { distance: 0 }, "justice_supreme": { distance: 1 }, "vêtements_luxe": { distance: 5 }, "gastronomie_luxe": { distance: 2 } },
            emplois: [
                { tier: 0, titre: "Monarque", postes: 1, salaire: { totalEnCuivre: 2000 }, prerequis: { prestige: 100 }, gainsMensuels: { prestige: 50, stats: { intelligence: 1.5, force: 1, constitution: 1, dexterite: 1, sagesse: 1.5, charisme: 2 } }, type: "mixte" },
                { tier: 1, titre: "Conseiller Principal", postes: 3, salaire: { totalEnCuivre: 500 }, prerequis: { prestige: 50 }, gainsMensuels: { prestige: 15, stats: { intelligence: 1.5, force: 0.5, constitution: 0.8, dexterite: 0.8, sagesse: 1.5, charisme: 1.2 } }, type: "mixte" },
                { tier: 2, titre: "Chambellan Royal", postes: 5, salaire: { totalEnCuivre: 300 }, prerequis: { prestige: 30 }, gainsMensuels: { prestige: 10, stats: { intelligence: 1.2, force: 0.6, constitution: 0.8, dexterite: 1, sagesse: 1.2, charisme: 1.1 } }, type: "mixte" }
            ]
        },
        "Haute Cour de Justice": {
            description: "Le tribunal suprême du royaume, où les lois sont interprétées et les cas les plus graves sont jugés.",
            providesTags: ["justice_supreme"],
            requiresTags: { "administration_royale": { distance: 1 }, "savoir_avance": { distance: 2 } },
            emplois: [
                { tier: 1, titre: "Juge Suprême", postes: 1, salaire: { totalEnCuivre: 600 }, prerequis: { prestige: 60 }, gainsMensuels: { prestige: 18, stats: { intelligence: 1.5, force: 0.3, constitution: 0.6, dexterite: 0.8, sagesse: 1.5, charisme: 1 } }, type: "mixte" },
                { tier: 2, titre: "Procureur Royal", postes: 4, salaire: { totalEnCuivre: 350 }, prerequis: { prestige: 35 }, gainsMensuels: { prestige: 12, stats: { intelligence: 1.4, force: 0.4, constitution: 0.6, dexterite: 0.9, sagesse: 1.2, charisme: 1.1 } }, type: "mixte" }
            ]
        },
        "Trésor Royal & Hôtel de la Monnaie": {
            description: "Gère les finances du royaume, collecte les impôts centraux et frappe la monnaie officielle.",
            providesTags: ["finance_royale", "monnaie"],
            requiresTags: { "administration_royale": { distance: 1 }, "haute_finance": { distance: 1 }, "or_raffine": { distance: 10 }, "argent_raffine": { distance: 10 } },
            emplois: [
                { tier: 1, titre: "Grand Trésorier", postes: 1, salaire: { totalEnCuivre: 550 }, prerequis: { prestige: 55 }, gainsMensuels: { prestige: 16, stats: { intelligence: 1.5, force: 0.5, constitution: 0.7, dexterite: 1, sagesse: 1.3, charisme: 1 } }, type: "mixte" },
                { tier: 2, titre: "Maître de la Monnaie", postes: 2, salaire: { totalEnCuivre: 320 }, prerequis: { prestige: 32 }, gainsMensuels: { prestige: 10, stats: { intelligence: 1.2, force: 0.6, constitution: 0.8, dexterite: 1.1, sagesse: 1, charisme: 0.8 } }, type: "mixte" }
            ]
        },
        "État-Major Militaire": {
            description: "Le quartier général de toutes les armées du royaume, où les grandes stratégies sont planifiées.",
            providesTags: ["commandement_militaire"],
            requiresTags: { "administration_royale": { distance: 1 }, "armes_armures_prestige": { distance: 2 }, "navires_de_guerre": { distance: 15 } },
            emplois: [
                { tier: 1, titre: "Grand Maréchal", postes: 1, salaire: { totalEnCuivre: 650 }, prerequis: { prestige: 65 }, gainsMensuels: { prestige: 20, stats: { intelligence: 1.3, force: 1.2, constitution: 1.2, dexterite: 1.1, sagesse: 1.2, charisme: 1.5 } }, type: "mixte" },
                { tier: 2, titre: "Stratège Militaire", postes: 5, salaire: { totalEnCuivre: 380 }, prerequis: { prestige: 38 }, gainsMensuels: { prestige: 13, stats: { intelligence: 1.5, force: 0.8, constitution: 0.9, dexterite: 1, sagesse: 1.1, charisme: 1 } }, type: "mixte" }
            ]
        },
        "Ambassades": {
            description: "Quartier diplomatique hébergeant les représentants des nations étrangères.",
            providesTags: ["diplomatie"],
            requiresTags: { "administration_royale": { distance: 1 }, "sécurité": { distance: 0 }, "divertissement_luxe": { distance: 2 } },
            emplois: [
                { tier: 2, titre: "Ambassadeur", postes: 5, salaire: { totalEnCuivre: 400 }, prerequis: { prestige: 40 }, gainsMensuels: { prestige: 14, stats: { intelligence: 1.3, force: 0.5, constitution: 0.7, dexterite: 0.8, sagesse: 1.2, charisme: 1.4 } }, type: "mixte" },
                { tier: 3, titre: "Attaché Diplomatique", postes: 10, salaire: { totalEnCuivre: 250 }, prerequis: { prestige: 25 }, gainsMensuels: { prestige: 8, stats: { intelligence: 1.2, force: 0.4, constitution: 0.6, dexterite: 0.9, sagesse: 1.1, charisme: 1.3 } }, type: "mixte" }
            ]
        },
        "Bureau des Hérauts et de la Noblesse": {
            description: "Archive les généalogies, enregistre les titres de noblesse et conçoit les armoiries des grandes familles du royaume.",
            providesTags: ["gestion_noblesse", "heraldique"],
            requiresTags: { "administration_royale": { distance: 1 }, "savoir_universel": { distance: 2 }, "livres": { distance: 3 } },
            emplois: [
                { tier: 2, titre: "Roi d'Armes", postes: 1, salaire: { totalEnCuivre: 380 }, prerequis: { prestige: 35 }, gainsMensuels: { prestige: 12, stats: { intelligence: 1.3, force: 0.4, constitution: 0.7, dexterite: 1, sagesse: 1.2, charisme: 1.3 } }, type: "mixte" },
                { tier: 3, titre: "Héraut Généalogiste", postes: 4, salaire: { totalEnCuivre: 220 }, prerequis: { prestige: 20 }, gainsMensuels: { prestige: 7, stats: { intelligence: 1.2, force: 0.3, constitution: 0.6, dexterite: 0.9, sagesse: 1.1, charisme: 1 } }, type: "mixte" }
            ]
        },
        "Conseil Arcanique Royal": {
            description: "Un conseil de mages puissants qui conseillent le monarque sur les menaces et les opportunités d'ordre magique.",
            providesTags: ["conseil_arcanique_royal", "defense_magique"],
            requiresTags: { "haute_politique": { distance: 1 }, "savoir_arcanique": { distance: 2 }, "savoir_interdit": { distance: 2 } },
            emplois: [
                { tier: 1, titre: "Archimage Conseiller", postes: 2, salaire: { totalEnCuivre: 620 }, prerequis: { prestige: 60 }, gainsMensuels: { prestige: 20, stats: { intelligence: 1.8, force: 0.4, constitution: 0.7, dexterite: 1, sagesse: 1.6, charisme: 1.2 } }, type: "mixte" },
                { tier: 2, titre: "Mage de Cour", postes: 5, salaire: { totalEnCuivre: 390 }, prerequis: { prestige: 38 }, gainsMensuels: { prestige: 13, stats: { intelligence: 1.6, force: 0.3, constitution: 0.6, dexterite: 0.9, sagesse: 1.4, charisme: 1 } }, type: "mixte" }
            ]
        }
    },
    "Bâtiments de Production": {
        "Manufacture Royale d'Armements": {
            description: "Produit les meilleures armes et armures, souvent enchantées, pour l'élite du royaume.",
            providesTags: ["armes_armures_prestige"],
            requiresTags: { "acier_special": { distance: 2 }, "or_raffine": { distance: 10 }, "savoir_arcanique": { distance: 3 } },
            emplois: [
                { tier: 1, titre: "Maître Arcaniste-Forgeron", postes: 2, salaire: { totalEnCuivre: 450 }, prerequis: { prestige: 45 }, gainsMensuels: { prestige: 15, stats: { intelligence: 1.3, force: 1.2, constitution: 1.1, dexterite: 1.1, sagesse: 1.2, charisme: 1 } }, type: "mixte" },
                { tier: 3, titre: "Artisan d'Élite", postes: 15, salaire: { totalEnCuivre: 200 }, prerequis: { prestige: 15 }, gainsMensuels: { prestige: 6, stats: { intelligence: 0.8, force: 1.1, constitution: 1.1, dexterite: 1.2, sagesse: 0.8, charisme: 0.7 } }, type: "mixte" }
            ]
        },
        "Ateliers de Haute Orfèvrerie": {
            description: "Crée des bijoux et objets d'art d'une valeur inestimable pour la royauté et la noblesse.",
            providesTags: ["orfevrerie_maitre", "bijoux_luxe"],
            requiresTags: { "or_raffine": { distance: 5 }, "argent_raffine": { distance: 5 }, "pierres_taillees": { distance: 5 }, "savoir_alchimique": { distance: 3 } },
            emplois: [
                { tier: 1, titre: "Maître Orfèvre Royal", postes: 3, salaire: { totalEnCuivre: 480 }, prerequis: { prestige: 48 }, gainsMensuels: { prestige: 16, stats: { intelligence: 1.2, force: 0.4, constitution: 0.7, dexterite: 1.5, sagesse: 1.2, charisme: 1.3 } }, type: "mixte" },
                { tier: 3, titre: "Compagnon Orfèvre", postes: 10, salaire: { totalEnCuivre: 220 }, prerequis: { prestige: 18 }, gainsMensuels: { prestige: 7, stats: { intelligence: 1, force: 0.3, constitution: 0.6, dexterite: 1.4, sagesse: 1, charisme: 1.1 } }, type: "mixte" }
            ]
        },
        "Fonderie d'Acier Spécial": {
            description: "Produit des alliages de métaux rares et résistants pour les constructions stratégiques et l'armement.",
            providesTags: ["acier_special"],
            requiresTags: { "minerai_de_fer": { distance: 25 }, "charbon": { distance: 25 }, "savoir_alchimique": { distance: 5 } },
            emplois: [
                { tier: 2, titre: "Maître Fondeur", postes: 4, salaire: { totalEnCuivre: 300 }, prerequis: { prestige: 25 }, gainsMensuels: { prestige: 9, stats: { intelligence: 1, force: 1.2, constitution: 1.2, dexterite: 0.8, sagesse: 1, charisme: 0.8 } }, type: "mixte" },
                { tier: 4, titre: "Ouvrier Spécialisé", postes: 20, salaire: { totalEnCuivre: 150 }, prerequis: { prestige: 8 }, gainsMensuels: { prestige: 3, stats: { intelligence: 0.5, force: 1.2, constitution: 1.2, dexterite: 0.7, sagesse: 0.6, charisme: 0.5 } }, type: "mixte" }
            ]
        },
        "Imprimerie Royale": {
            description: "Imprime les édits royaux, les livres officiels et la propagande du royaume.",
            providesTags: ["propagande", "livres", "lois_imprimées"],
            requiresTags: { "papier": { distance: 5 }, "encre": { distance: 5 }, "savoir_avance": { distance: 1 } },
            emplois: [
                { tier: 2, titre: "Maître Imprimeur Royal", postes: 1, salaire: { totalEnCuivre: 280 }, prerequis: { prestige: 28 }, gainsMensuels: { prestige: 9, stats: { intelligence: 1.3, force: 0.7, constitution: 0.9, dexterite: 1.1, sagesse: 1.1, charisme: 1 } }, type: "mixte" },
                { tier: 3, titre: "Compositeur-Typographe", postes: 8, salaire: { totalEnCuivre: 160 }, prerequis: { prestige: 12 }, gainsMensuels: { prestige: 5, stats: { intelligence: 1, force: 0.5, constitution: 0.7, dexterite: 1.2, sagesse: 0.8, charisme: 0.7 } }, type: "mixte" }
            ]
        },
        "Atelier des Artefacts Magiques": {
            description: "Un lieu secret où les plus grands artisans et mages collaborent pour créer des objets magiques d'une puissance légendaire.",
            providesTags: ["artefacts_magiques", "parchemins_puissants"],
            requiresTags: { "savoir_arcanique": { distance: 1 }, "orfevrerie_maitre": { distance: 2 }, "pierres_taillees": { distance: 8 }, "recherche_fondamentale": { distance: 1 } },
            emplois: [
                { tier: 1, titre: "Maître Artificier", postes: 2, salaire: { totalEnCuivre: 650 }, prerequis: { prestige: 65 }, gainsMensuels: { prestige: 22, stats: { intelligence: 1.7, force: 0.5, constitution: 0.8, dexterite: 1.4, sagesse: 1.5, charisme: 1.1 } }, type: "mixte" },
                { tier: 2, titre: "Enchanteur", postes: 6, salaire: { totalEnCuivre: 400 }, prerequis: { prestige: 40 }, gainsMensuels: { prestige: 14, stats: { intelligence: 1.5, force: 0.4, constitution: 0.7, dexterite: 1.2, sagesse: 1.3, charisme: 0.9 } }, type: "mixte" }
            ]
        },
        "Manufacture de Vêtements de Cour": {
            description: "L'atelier de mode le plus prestigieux, créant des tenues extravagantes qui définissent le style de la noblesse du royaume.",
            providesTags: ["vetements_royaux"],
            requiresTags: { "vêtements_luxe": { distance: 5 }, "bijoux_luxe": { distance: 5 }, "tissu": { distance: 20 } },
            emplois: [
                { tier: 2, titre: "Grand Couturier de la Cour", postes: 3, salaire: { totalEnCuivre: 350 }, prerequis: { prestige: 34 }, gainsMensuels: { prestige: 11, stats: { intelligence: 1.2, force: 0.4, constitution: 0.7, dexterite: 1.6, sagesse: 1.1, charisme: 1.5 } }, type: "mixte" },
                { tier: 3, titre: "Brodeur d'Or", postes: 10, salaire: { totalEnCuivre: 210 }, prerequis: { prestige: 18 }, gainsMensuels: { prestige: 6, stats: { intelligence: 1, force: 0.3, constitution: 0.6, dexterite: 1.4, sagesse: 0.9, charisme: 1 } }, type: "mixte" }
            ]
        }
    },
    "Bâtiments Indépendants": {
        "Grande Bibliothèque Royale": {
            description: "Le plus grand dépôt de savoir du royaume, contenant des textes anciens, rares et interdits.",
            providesTags: ["savoir_universel", "savoir_interdit"],
            requiresTags: { "livres": { distance: 2 }, "savoir_avance": { distance: 1 }, "savoir_arcanique": { distance: 1 } },
            emplois: [
                { tier: 1, titre: "Archiviste Royal", postes: 1, salaire: { totalEnCuivre: 520 }, prerequis: { prestige: 52 }, gainsMensuels: { prestige: 17, stats: { intelligence: 1.5, force: 0.3, constitution: 0.6, dexterite: 0.8, sagesse: 1.5, charisme: 1.1 } }, type: "mixte" },
                { tier: 2, titre: "Maître-Savant", postes: 10, salaire: { totalEnCuivre: 290 }, prerequis: { prestige: 29 }, gainsMensuels: { prestige: 9, stats: { intelligence: 1.4, force: 0.2, constitution: 0.5, dexterite: 0.7, sagesse: 1.4, charisme: 0.9 } }, type: "mixte" }
            ]
        },
        "Opéra Impérial": {
            description: "Le summum de l'art et de la culture, accueillant les spectacles les plus grandioses pour l'élite.",
            providesTags: ["divertissement_prestige"],
            requiresTags: { "administration_royale": { distance: 2 }, "vêtements_luxe": { distance: 3 }, "orfevrerie": { distance: 5 } },
            emplois: [
                { tier: 2, titre: "Intendant de l'Opéra", postes: 1, salaire: { totalEnCuivre: 310 }, prerequis: { prestige: 31 }, gainsMensuels: { prestige: 10, stats: { intelligence: 1.1, force: 0.5, constitution: 0.7, dexterite: 1, sagesse: 1.1, charisme: 1.5 } }, type: "mixte" },
                { tier: 3, titre: "Diva / Primo Uomo", postes: 5, salaire: { totalEnCuivre: 240 }, prerequis: { prestige: 24 }, gainsMensuels: { prestige: 8, stats: { intelligence: 0.8, force: 0.6, constitution: 0.9, dexterite: 1.1, sagesse: 0.8, charisme: 1.8 } }, type: "mixte" }
            ]
        },
        "Académie Royale des Sciences et des Arts": {
            description: "Finance et dirige la recherche fondamentale, les inventions et les grandes explorations.",
            providesTags: ["recherche_fondamentale", "savoir_avance", "exploration"],
            requiresTags: { "savoir_universel": { distance: 1 }, "finance_royale": { distance: 1 }, "savoir_arcanique": { distance: 2 } },
            emplois: [
                { tier: 1, titre: "Archisavant", postes: 3, salaire: { totalEnCuivre: 580 }, prerequis: { prestige: 58 }, gainsMensuels: { prestige: 18, stats: { intelligence: 1.8, force: 0.3, constitution: 0.6, dexterite: 0.9, sagesse: 1.5, charisme: 1 } }, type: "mixte" },
                { tier: 2, titre: "Inventeur / Explorateur", postes: 10, salaire: { totalEnCuivre: 330 }, prerequis: { prestige: 33 }, gainsMensuels: { prestige: 11, stats: { intelligence: 1.5, force: 0.8, constitution: 1, dexterite: 1.2, sagesse: 1.2, charisme: 1.1 } }, type: "mixte" }
            ]
        },
        "Guilde des Banquiers": {
            description: "Le cœur financier du royaume, gérant les dettes, les investissements et les fortunes des plus puissants.",
            providesTags: ["haute_finance"],
            requiresTags: { "finance_royale": { distance: 1 }, "justice_supreme": { distance: 2 }, "commerce_maritime": { distance: 10 } },
            emplois: [
                { tier: 1, titre: "Grand Banquier", postes: 4, salaire: { totalEnCuivre: 700 }, prerequis: { prestige: 70 }, gainsMensuels: { prestige: 22, stats: { intelligence: 1.4, force: 0.5, constitution: 0.8, dexterite: 0.9, sagesse: 1.3, charisme: 1.5 } }, type: "mixte" },
                { tier: 2, titre: "Financier", postes: 12, salaire: { totalEnCuivre: 400 }, prerequis: { prestige: 40 }, gainsMensuels: { prestige: 14, stats: { intelligence: 1.3, force: 0.4, constitution: 0.7, dexterite: 0.8, sagesse: 1.2, charisme: 1.3 } }, type: "mixte" }
            ]
        },
        "Bourse Royale": {
            description: "Une institution financière où les actions des plus grandes guildes, compagnies marchandes et expéditions sont échangées.",
            providesTags: ["bourse", "investissement_speculatif"],
            requiresTags: { "haute_finance": { distance: 1 }, "commerce_maritime": { distance: 10 }, "exploration": { distance: 2 } },
            emplois: [
                { tier: 1, titre: "Gouverneur de la Bourse", postes: 1, salaire: { totalEnCuivre: 750 }, prerequis: { prestige: 75 }, gainsMensuels: { prestige: 25, stats: { intelligence: 1.5, force: 0.5, constitution: 0.8, dexterite: 1, sagesse: 1.4, charisme: 1.6 } }, type: "mixte" },
                { tier: 2, titre: "Grand Courtier", postes: 15, salaire: { totalEnCuivre: 450 }, prerequis: { prestige: 45 }, gainsMensuels: { prestige: 15, stats: { intelligence: 1.4, force: 0.4, constitution: 0.7, dexterite: 0.9, sagesse: 1.3, charisme: 1.4 } }, type: "mixte" }
            ]
        },
        "Collège de Médecine Royal": {
            description: "L'institution médicale la plus avancée, formant les meilleurs médecins et chirurgiens, et menant des recherches sur les maladies rares.",
            providesTags: ["haute_medecine", "recherche_medicale"],
            requiresTags: { "savoir_avance": { distance: 1 }, "soin": { distance: 1 }, "potions_complexes": { distance: 5 } },
            emplois: [
                { tier: 1, titre: "Médecin Royal", postes: 2, salaire: { totalEnCuivre: 550 }, prerequis: { prestige: 55 }, gainsMensuels: { prestige: 18, stats: { intelligence: 1.6, force: 0.4, constitution: 0.7, dexterite: 1.2, sagesse: 1.7, charisme: 1 } }, type: "mixte" },
                { tier: 2, titre: "Chirurgien-Maître", postes: 6, salaire: { totalEnCuivre: 370 }, prerequis: { prestige: 37 }, gainsMensuels: { prestige: 12, stats: { intelligence: 1.3, force: 0.6, constitution: 0.8, dexterite: 1.5, sagesse: 1.4, charisme: 0.8 } }, type: "mixte" }
            ]
        },
        "Guilde des Cartographes et Astronomes": {
            description: "Produit les cartes du monde connu et des cieux les plus précises, et fabrique des instruments de navigation de pointe.",
            providesTags: ["cartographie_precise", "navigation_astronomique"],
            requiresTags: { "savoir_astronomique": { distance: 1 }, "equipement_optique": { distance: 5 }, "exploration": { distance: 1 } },
            emplois: [
                { tier: 2, titre: "Maître Cartographe Royal", postes: 2, salaire: { totalEnCuivre: 360 }, prerequis: { prestige: 36 }, gainsMensuels: { prestige: 12, stats: { intelligence: 1.5, force: 0.3, constitution: 0.6, dexterite: 1.3, sagesse: 1.4, charisme: 0.9 } }, type: "mixte" },
                { tier: 3, titre: "Astronome Émérite", postes: 5, salaire: { totalEnCuivre: 230 }, prerequis: { prestige: 22 }, gainsMensuels: { prestige: 8, stats: { intelligence: 1.4, force: 0.2, constitution: 0.5, dexterite: 1.1, sagesse: 1.5, charisme: 0.7 } }, type: "mixte" }
            ]
        }
    },
    "Bâtiments Agricoles & Alimentaires": {
        "Greniers Royaux": {
            description: "D'immenses entrepôts stockant des réserves stratégiques de nourriture pour la capitale.",
            providesTags: ["reserve_strategique_nourriture", "gestion_nourriture"],
            requiresTags: { "administration_royale": { distance: 1 }, "grain": { distance: 30 }, "viande": { distance: 30 } },
            emplois: [
                { tier: 2, titre: "Intendant des Greniers", postes: 2, salaire: { totalEnCuivre: 260 }, prerequis: { prestige: 26 }, gainsMensuels: { prestige: 8, stats: { intelligence: 1.2, force: 0.8, constitution: 1, dexterite: 0.9, sagesse: 1.1, charisme: 1 } }, type: "mixte" },
                { tier: 4, titre: "Gestionnaire des Stocks", postes: 15, salaire: { totalEnCuivre: 140 }, prerequis: { prestige: 10 }, gainsMensuels: { prestige: 4, stats: { intelligence: 1, force: 0.9, constitution: 1.1, dexterite: 1, sagesse: 0.8, charisme: 0.7 } }, type: "mixte" }
            ]
        },
        "Cuisines Royales": {
            description: "Un complexe culinaire préparant des festins extravagants pour la cour.",
            providesTags: ["gastronomie_luxe"],
            requiresTags: { "viande": { distance: 15 }, "fruits_exotiques": { distance: 2 }, "vin": { distance: 15 }, "alcools_fins": { distance: 10 }, "herbes_rares": { distance: 10 } },
            emplois: [
                { tier: 2, titre: "Chef des Cuisines Royales", postes: 1, salaire: { totalEnCuivre: 290 }, prerequis: { prestige: 29 }, gainsMensuels: { prestige: 9, stats: { intelligence: 1, force: 0.7, constitution: 0.9, dexterite: 1.3, sagesse: 1.2, charisme: 1.1 } }, type: "mixte" },
                { tier: 3, titre: "Maître queux", postes: 10, salaire: { totalEnCuivre: 180 }, prerequis: { prestige: 14 }, gainsMensuels: { prestige: 5, stats: { intelligence: 0.8, force: 0.6, constitution: 0.8, dexterite: 1.2, sagesse: 1.1, charisme: 0.9 } }, type: "mixte" }
            ]
        },
        "Jardins Suspendus": {
            description: "Merveille architecturale et botanique, produisant des fleurs et fruits exotiques pour le plaisir de la cour.",
            providesTags: ["fleurs_rares", "fruits_exotiques"],
            requiresTags: { "savoir_avance": { distance: 2 }, "pierre_taillee": { distance: 10 } },
            emplois: [
                { tier: 2, titre: "Maître Botaniste Royal", postes: 2, salaire: { totalEnCuivre: 270 }, prerequis: { prestige: 27 }, gainsMensuels: { prestige: 9, stats: { intelligence: 1.4, force: 0.5, constitution: 0.8, dexterite: 1, sagesse: 1.4, charisme: 0.8 } }, type: "mixte" },
                { tier: 4, titre: "Horticulteur Exotique", postes: 12, salaire: { totalEnCuivre: 150 }, prerequis: { prestige: 9 }, gainsMensuels: { prestige: 4, stats: { intelligence: 1, force: 0.4, constitution: 0.7, dexterite: 0.9, sagesse: 1.3, charisme: 0.6 } }, type: "mixte" }
            ]
        },
        "Caves de Maturation d'Alcools Rares": {
            description: "Des caves souterraines où les meilleurs vins et spiritueux du royaume vieillissent pendant des décennies pour atteindre une qualité inégalée.",
            providesTags: ["alcools_legendaires"],
            requiresTags: { "alcools_fins": { distance: 10 }, "vin": { distance: 20 }, "verrerie_art": { distance: 8 } },
            emplois: [
                { tier: 2, titre: "Maître de Chai Royal", postes: 2, salaire: { totalEnCuivre: 320 }, prerequis: { prestige: 30 }, gainsMensuels: { prestige: 10, stats: { intelligence: 1.1, force: 0.7, constitution: 0.9, dexterite: 1, sagesse: 1.5, charisme: 1.2 } }, type: "mixte" },
                { tier: 4, titre: "Sommelier de la Cour", postes: 5, salaire: { totalEnCuivre: 190 }, prerequis: { prestige: 15 }, gainsMensuels: { prestige: 5, stats: { intelligence: 1, force: 0.5, constitution: 0.7, dexterite: 1.1, sagesse: 1.3, charisme: 1.1 } }, type: "mixte" }
            ]
        }
    },
    "Chasse/Nature & Exploration": {
        "Ménagerie Royale": {
            description: "Abrite une collection de bêtes exotiques et magiques provenant de tout le royaume et au-delà.",
            providesTags: ["betes_exotiques", "betes_magiques"],
            requiresTags: { "administration_royale": { distance: 2 }, "sécurité": { distance: 1 }, "soin": { distance: 3 } },
            emplois: [
                { tier: 2, titre: "Maître de la Ménagerie", postes: 1, salaire: { totalEnCuivre: 300 }, prerequis: { prestige: 30 }, gainsMensuels: { prestige: 10, stats: { intelligence: 1.2, force: 1.1, constitution: 1.1, dexterite: 1.1, sagesse: 1.3, charisme: 1.2 } }, type: "mixte" },
                { tier: 3, titre: "Soigneur de Créatures Magiques", postes: 6, salaire: { totalEnCuivre: 190 }, prerequis: { prestige: 15 }, gainsMensuels: { prestige: 6, stats: { intelligence: 1, force: 0.9, constitution: 1, dexterite: 1, sagesse: 1.2, charisme: 0.8 } }, type: "mixte" }
            ]
        },
        "Guilde des Explorateurs Royaux": {
            description: "Organisation finançant et gérant des expéditions vers des terres inconnues à la recherche de richesses et de connaissances.",
            providesTags: ["exploration", "artefacts_rares"],
            requiresTags: { "haute_finance": { distance: 1 }, "commandement_militaire": { distance: 2 }, "savoir_universel": { distance: 1 } },
            emplois: [
                { tier: 1, titre: "Maître de Guilde", postes: 1, salaire: { totalEnCuivre: 500 }, prerequis: { prestige: 50 }, gainsMensuels: { prestige: 16, stats: { intelligence: 1.4, force: 1, constitution: 1.1, dexterite: 1.2, sagesse: 1.3, charisme: 1.4 } }, type: "mixte" },
                { tier: 2, titre: "Cartographe / Capitaine d'Expédition", postes: 8, salaire: { totalEnCuivre: 340 }, prerequis: { prestige: 34 }, gainsMensuels: { prestige: 11, stats: { intelligence: 1.2, force: 1.1, constitution: 1.2, dexterite: 1.3, sagesse: 1.2, charisme: 1 } }, type: "mixte" }
            ]
        },
        "Bureau du Renseignement Royal": {
            description: "Une agence secrète dédiée au contre-espionnage, à la collecte d'informations et aux opérations clandestines pour protéger le royaume.",
            providesTags: ["contre_espionnage", "renseignement"],
            requiresTags: { "diplomatie": { distance: 1 }, "haute_finance": { distance: 1 }, "justice_supreme": { distance: 2 } },
            emplois: [
                { tier: 1, titre: "Maître-Espion", postes: 1, salaire: { totalEnCuivre: 680 }, prerequis: { prestige: 70 }, gainsMensuels: { prestige: 23, stats: { intelligence: 1.6, force: 0.8, constitution: 1, dexterite: 1.4, sagesse: 1.5, charisme: 1.2 } }, type: "mixte" },
                { tier: 2, titre: "Analyste / Agent de Terrain", postes: 10, salaire: { totalEnCuivre: 410 }, prerequis: { prestige: 42 }, gainsMensuels: { prestige: 14, stats: { intelligence: 1.4, force: 0.7, constitution: 0.9, dexterite: 1.3, sagesse: 1.2, charisme: 1.1 } }, type: "mixte" }
            ]
        }
    }
};

// --- NOUVEAU BÂTIMENT POUR HAMEAU ---
EcoSimData.buildings['Hameau']["Chasse/Nature"]["Cabane de Cueilleur"] = {
    description: "Une petite cabane pour les cueilleurs qui parcourent les bois à la recherche d'herbes médicinales et de baies comestibles.",
    providesTags: ["herbes_communes", "baies_sauvages"],
    emplois: [
        { 
            tier: 4, 
            titre: "Cueilleur", 
            postes: 2, 
            salaire: { totalEnCuivre: 31 }, 
            prerequis: { prestige: 2 }, 
            gainsMensuels: { 
                prestige: 2, 
                stats: { intelligence: 0.4, force: 0.3, constitution: 1, dexterite: 1, sagesse: 1, charisme: 0.2 } 
            }, 
            type: "mixte" 
        }
    ]
};

// --- NOUVEAU BÂTIMENT POUR VILLAGE ---
EcoSimData.buildings['Village']["Chasse/Nature"]["Cabane de Cueilleur"] = {
    description: "Un camp de base pour les cueilleurs organisés du village, assurant un approvisionnement régulier en herbes et en baies.",
    providesTags: ["herbes_communes", "baies_sauvages"],
    emplois: [
        { 
            tier: 3, 
            titre: "Maître Cueilleur", 
            postes: 1, 
            salaire: { totalEnCuivre: 60 }, 
            prerequis: { prestige: 8 }, 
            gainsMensuels: { 
                prestige: 4, 
                stats: { intelligence: 0.8, force: 0.4, constitution: 1.1, dexterite: 1.1, sagesse: 1.2, charisme: 0.6 } 
            }, 
            type: "mixte" 
        },
        { 
            tier: 4, 
            titre: "Cueilleur", 
            postes: 4, 
            salaire: { totalEnCuivre: 40 }, 
            prerequis: { prestige: 2 }, 
            gainsMensuels: { 
                prestige: 2, 
                stats: { intelligence: 0.4, force: 0.3, constitution: 1, dexterite: 1, sagesse: 1, charisme: 0.2 } 
            }, 
            type: "mixte" 
        }
    ]
};


// --- BLOC UNIFIÉ POUR BÂTIMENT GÉNÉRIQUE ---
// Ce script ajoute automatiquement le "Bureau de l'Écrivain Public" à tous les types de lieux.

(() => {
    // 1. Définition du nouveau bâtiment générique
    const bureauEcrivainPublic = {
        description: "Un service essentiel pour la rédaction et la validation de documents légaux, de lettres et de contrats pour les citoyens, quelle que soit la taille de la localité.",
        providesTags: ["savoir_écrit", "contrats"],
        requiresTags: { "administration": { distance: 2 } },
        emplois: [
            { 
                tier: 3, 
                titre: "Écrivain Public", 
                postes: 1, 
                salaire: { totalEnCuivre: 60 }, 
                prerequis: { prestige: 7 }, 
                gainsMensuels: { 
                    prestige: 4, 
                    stats: { intelligence: 1.2, force: 0.1, constitution: 0.3, dexterite: 1.2, sagesse: 1.0, charisme: 0.7 } 
                }, 
                type: "mixte" 
            }
        ]
    };

    // 2. Liste de tous les types de lieux où ajouter le bâtiment
    const typesDeLieux = ['Bourg', 'Ville', 'Capitale'];

    // 3. Boucle pour ajouter le bâtiment à chaque type de lieu
    typesDeLieux.forEach(type => {
        // Vérification de sécurité pour s'assurer que la structure existe
        if (window.EcoSimData && window.EcoSimData.buildings && window.EcoSimData.buildings[type] && window.EcoSimData.buildings[type]["Bâtiments Indépendants"]) {
            window.EcoSimData.buildings[type]["Bâtiments Indépendants"]["Bureau de l'Écrivain Public"] = bureauEcrivainPublic;
        } else {
            console.warn(`La catégorie "Bâtiments Indépendants" n'a pas été trouvée pour le type de lieu: ${type}. Le bâtiment générique n'a pas été ajouté.`);
        }
    });

    console.log("Bâtiment générique 'Bureau de l'Écrivain Public' ajouté à tous les types de lieux.");
})();