//
// FICHIER : simulation-engine.js
// Contient le moteur de simulation (règles, calculs, état des données).
//
document.addEventListener('DOMContentLoaded', () => {

    // --- DONNÉES DE CONFIGURATION ET CONSTANTES ---
    const RACES_DATA = window.EcoSimData.racesData;
    const BUILDINGS_DATA = window.EcoSimData.buildings;
    const PREGNANCY_DURATION_MONTHS = 9;
    const MAX_CHILDREN_PER_COUPLE = 5;
    const HIDDEN_SIM_YEARS = 100;
    const GLOBAL_ECONOMY_DIVISOR = 100;
    const PO_UNIT = 10000 / GLOBAL_ECONOMY_DIVISOR;
    const TAX_RATE = 0.25;
    const SALES_TAX_RATE = 0.40;
    const BASE_SALARIES = { 0: 40000, 1: 25000, 2: 15000, 3: 10000, 4: 6000, 5: 4000, 6: 2500 };
    const MILITIA_MENACE_REDUCTION = 10;
    const GUARD_ROLES = ["Recrue", "Soldat", "Sergent", "Garde", "Milicien", "Patrouilleur", "Garde du Palais", "Garde Municipal", "Garde d’Élite", "Garde Judiciaire", "Capitaine"];
    const TREASURY_MENACE_THRESHOLD = 100 * PO_UNIT;
    const TREASURY_MENACE_FACTOR = 1 / (10 * PO_UNIT);
    const CITY_STATES = {
        "Florissante": { mod: 0.25, color: '#2ecc71', name: "Florissante" },
        "Prospère": { mod: 0.15, color: '#27ae60', name: "Prospère" },
        "Stable": { mod: 0.0, color: '#3498db', name: "Stable" },
        "Fragile": { mod: -0.15, color: '#f39c12', name: "Fragile" },
        "En Crise": { mod: -0.30, color: '#e67e22', name: "En Crise" },
        "Sur le Déclin": { mod: -0.50, color: '#c0392b', name: "Sur le Déclin" }
    };
    const BUILDING_AGING_FACTOR = 0.005;
    const BUILDING_CLOSURE_THRESHOLD = 12;
    const BUILDING_ABANDON_THRESHOLD = 6;
    const WEALTH_TAX_BRACKETS = [{ threshold: 20, rate: 0.70 }, { threshold: 10, rate: 0.10 }];
    const LIFESTYLE_COST = { base: 20, perTier: [300, 150, 70, 30, 10, 5], wealthFactor: 0.001 };
    const ROYAL_TAX_THRESHOLD = 10000000;
    const ROYAL_TAX_RATE = 0.05;
    const POVERTY_LINE = 5 * PO_UNIT;
    const WEALTH_LINE = 500 * PO_UNIT;
    const FAMILY_DONATION_RATE = 0.05;
    const CRIMINAL_PRESTIGE_THRESHOLD = 10;
    const CRIMINAL_CHANCE = 0.05;
    const CRIMINAL_INCOME = { "Voleur": 10 * PO_UNIT, "Charlatan": 8 * PO_UNIT };
    const CRIMINAL_MENACE_ADDITION = { "Voleur": 15, "Charlatan": 10 };
    const MIGRATION_CHANCE_PER_MONTH = 0.05;
    const MIGRATION_MENACE_INCREASE = 15;
    const MIGRATION_MENACE_DURATION = 6;
    const TRAVEL_ATTACK_CHANCE_MOD = 0.1;
    const TRAVEL_DEATH_CHANCE_ON_ATTACK = 0.25;

    // NOUVELLES CONSTANTES POUR LES RELATIONS SOCIALES
    const ACQUAINTANCE_CHANCE_PER_MONTH = 0.15; // 15% de chance de devenir connaissance avec un collègue chaque mois
    const FRIENDSHIP_CHANCE_PER_MONTH = 0.05;   // 5% de chance qu'une connaissance devienne un ami
    const RIVALRY_CHANCE_PER_MONTH = 0.03;      // 3% de chance de développer une rivalité
    const FAMILY_FRIEND_ACQUAINTANCE_CHANCE = 0.05; // Chance qu'un ami de la famille devienne une connaissance
    const STAT_INHERITANCE_RATE = 0.10;         // Les enfants héritent de 10% des gains de stats mensuels de leurs parents

    // --- ÉTAT GLOBAL DE LA SIMULATION ---
    // Cette variable sera accessible par le fichier step3-ui.js
    window.sim = {
        regions: [], currentRegion: null, year: 0, month: 0,
        population: [], families: {}, eventLog: [], isRunning: false,
        nextPersonId: 0, jobSlots: [], nextJobSlotId: 0,
    };

    // --- LOGIQUE PRINCIPALE ---
    function advanceMonthLogicOnly() {
    sim.currentRegion.places.forEach(city => {
        city.monthlySalesTax = 0;
        if (city.config?.buildings) {
            for (const buildingName in city.config.buildings) {
                const buildingInstance = city.config.buildings[buildingName];
                if (buildingInstance) {
                    buildingInstance.monthlyTurnover = 0;
                    buildingInstance.monthlyShoppingRevenue = 0;
                    buildingInstance.monthlyTransactionCount = 0;
                }
            }
        }
    });
        sim.month++;
        if (sim.month > 11) {
            sim.month = 0;
            sim.year++;
            logEvent(`<h3>--- Année ${sim.year} ---</h3>`);
            updateCityState();
            handleBuildingMaintenance();
            if (sim.year > 0) {
                 handleRoyalTaxesAndSubsidies();
                 handleCityProjectsAndTreasury();
            }
        }

        sim.currentRegion.places.forEach(city => {
            if (city.tempPenaltyDuration > 0) {
                city.tempPenaltyDuration--;
                if (city.tempPenaltyDuration === 0) city.tempPrestigePenalty = 0;
            }
            if (city.tempMenaceDuration > 0) {
                city.tempMenaceDuration--;
                if (city.tempMenaceDuration === 0) city.tempMenaceIncrease = 0;
            }
        });

        const livingPopulation = sim.population.filter(p => p.isAlive);
        livingPopulation.forEach(p => {
            p.ageInMonths++;
            if (p.ageInMonths % 12 === 0) {
                p.age = Math.floor(p.ageInMonths / 12);
                const adultAge = RACES_DATA.races[p.race]?.ageAdulte || 18;
                // NOUVEAU LOG : Atteinte de l'âge adulte
                if (p.age === adultAge) {
                    logEvent(`🎉 ${p.firstName} ${p.lastName} a atteint l'âge adulte !`, p.cityId, p.familyId);
                }
            }
        });

        handleDeaths(livingPopulation);
        handleMarriages(livingPopulation);
        handlePregnancy(livingPopulation);
        handleBirths(livingPopulation);
        assignJobs();
        handleSocialRelationships(livingPopulation); // NOUVEL APPEL
        handleMigration();
        handleCriminality();
        handleEconomyAndSalaries(); 
        handleIndividualFinances();
        handlePublicSectorFunding();
        handleShoppingAndServices();
        handleSocialSafetyNet(); 
        
        updateDynamicCityStats();
        handleBarracksLogic();
        handlePrestigeGain();
    }

    // --- FONCTION UTILITAIRE POUR LES EMPLOIS ---
    function freeUpJobSlot(person) {
        if (!person || !person.job || person.job.role === "Sans-emploi") return;
        const jobSlot = sim.jobSlots.find(j => j.personId === person.id);
        if (jobSlot) {
            if(person.isAlive) { 
                logEvent(`💼 Le poste de ${jobSlot.role} à ${jobSlot.buildingName} est désormais vacant.`, person.cityId, person.familyId);
            }
            jobSlot.isFilled = false;
            jobSlot.personId = null;
        }
        person.job = { role: "Sans-emploi", tier: 99, building: null };
    }

    // --- CRÉATION / DÉCÈS / MARIAGE ---
    function createPerson(raceName, familyName, familyId, gender, age = null, cityId, cityName, parents = []) {
        const raceInfo = RACES_DATA.races[raceName];
        if (!raceInfo) return null;
        const nameList = (gender === 'M') ? raceInfo.prenomsM : raceInfo.prenomsF;
        return {
            id: sim.nextPersonId++, firstName: nameList[Math.floor(Math.random() * nameList.length)],
            lastName: familyName, maidenName: null,
            age: age !== null ? age : 0, 
            ageInMonths: age !== null ? age * 12 : 0,
            gender,
            race: raceName, isAlive: true, 
            familyId: familyId || null, 
            birthFamilyId: familyId || null, 
            cityId, cityName, originCityId: cityId, originCityName: cityName,
            wasMarried: false, job: null, prestige: 0, 
            money: (age !== null && age > 0) ? 10 * PO_UNIT : 0,
            prestigeBuffer: 0, 
            isPregnant: false, pregnancyTerm: 0,
            parents, spouseId: null, children: [],
            birthYear: sim.year, birthMonth: sim.month,
            deathYear: null, deathMonth: null, causeOfDeath: null,
            marriageDate: null,
            stats: { "Intelligence": 0, "Force": 0, "Constitution": 0, "Dexterite": 0, "Sagesse": 0, "Charisme": 0 },
            relationships: { acquaintances: [], friends: [], rivals: [] },
            maxFriends: Math.floor(Math.random() * 5) + 1,       // 1 à 5
            maxAcquaintances: Math.floor(Math.random() * 12) + 7, // 7 à 18
            maxRivals: Math.floor(Math.random() * 3) + 1,         // 1 à 3
            militiaTerm: null,
        };
    }

    function handleDeaths(livingPopulation) {
        livingPopulation.forEach(person => {
            if (!person.isAlive) return;
            
            const raceInfo = RACES_DATA.races[person.race];
            let deathChance = 0.0001;
    
            const mortalityStartAge = raceInfo.esperanceVieMax * 0.7;
            
            if (person.age > mortalityStartAge) {
                const ageFactor = (person.age - mortalityStartAge) / (raceInfo.esperanceVieMax - mortalityStartAge);
                const ageRelatedRisk = Math.pow(ageFactor, 4) * 0.08;
                deathChance += ageRelatedRisk;
            }
    
            const monthlyDeathChance = Math.min(0.95, deathChance / 12);
    
            if (Math.random() < monthlyDeathChance) {
                logEvent(`🕊️ ${person.firstName} ${person.lastName} est décédé(e) de causes naturelles à ${person.age} ans.`, person.cityId, person.familyId);
                person.isAlive = false;
                person.prestige = 0;
                person.deathYear = sim.year;
                person.deathMonth = sim.month;
                person.causeOfDeath = "De causes naturelles";
                
                freeUpJobSlot(person);
    
                const spouse = sim.population.find(p => p.id === person.spouseId);
                if (spouse) {
                    spouse.spouseId = null;
                    spouse.wasMarried = true;
                }
            }
        });
    }

    function handleMarriages(livingPopulation) {
        const adultAge = 18;
    
        const isEligible = (p) => {
            if (!p.isAlive) return false;
            if (!p.spouseId) return true; 
            const spouse = sim.population.find(s => s.id === p.spouseId);
            return !spouse || !spouse.isAlive;
        };
    
        const singleMen = livingPopulation.filter(p => p.gender === 'M' && p.age >= adultAge && isEligible(p));
        let singleWomen = livingPopulation.filter(p => p.gender === 'F' && p.age >= adultAge && isEligible(p));
    
        singleMen.forEach(man => {
            if (!man.familyId) return; // Un homme doit avoir une famille pour se marier
            const raceInfo = RACES_DATA.races[man.race];
            const peakMarriageAge = raceInfo.ageAdulte + 15;
            const maxMarriageAge = raceInfo.esperanceVieMax * 0.8;
            
            let baseChance = 0.2;
    
            if (man.age > peakMarriageAge) {
                const ageProgress = (man.age - peakMarriageAge) / (maxMarriageAge - peakMarriageAge);
                baseChance *= Math.max(0, 1 - ageProgress);
            }
            
            if (Math.random() > baseChance) return; 
    
            const suitableWives = singleWomen.filter(w => 
                isEligible(w) &&
                w.cityId === man.cityId && 
                (RACES_DATA.compatibilites[man.race]?.includes(w.race) || man.race === w.race) &&
                Math.abs(man.age - w.age) <= 10
            );
    
            if (!suitableWives.length) return;
    
            const chosenWoman = suitableWives[Math.floor(Math.random() * suitableWives.length)];
            
            const familyId = man.familyId;
            const familyName = man.lastName;
            const marriageDate = { year: sim.year, month: sim.month };
    
            const maidenNameToSet = chosenWoman.maidenName || chosenWoman.lastName;
    
            Object.assign(man, { spouseId: chosenWoman.id, wasMarried: true, marriageDate });
            
            Object.assign(chosenWoman, { 
                spouseId: man.id, 
                wasMarried: true, 
                maidenName: maidenNameToSet,
                lastName: familyName, 
                familyId: familyId, 
                marriageDate 
            });
    
            if (sim.families[familyId] && !sim.families[familyId].members.includes(chosenWoman.id)) {
                sim.families[familyId].members.push(chosenWoman.id);
            }
    
            logEvent(`⚭ Mariage de ${man.firstName} ${man.lastName} et ${chosenWoman.firstName} ${maidenNameToSet}. Elle rejoint la famille ${familyName}.`, man.cityId, familyId);
            
            singleWomen = singleWomen.filter(w => w.id !== chosenWoman.id);
        });
    }

    function handlePregnancy(livingPopulation) {
        const women = livingPopulation.filter(p => p.gender === 'F' && p.isAlive && p.spouseId !== null);
        const yearlyBirthProbabilities = [0.55, 0.30, 0.15, 0.05, 0.05];
        women.forEach(woman => {
            if (woman.isPregnant) { woman.pregnancyTerm++; return; }
            if (woman.children.length >= MAX_CHILDREN_PER_COUPLE) return;
            const raceInfo = RACES_DATA.races[woman.race];
            const menopauseAge = raceInfo.esperanceVieMax * 0.5;
            if (woman.age >= (raceInfo.ageAdulte || 18) && woman.age < menopauseAge) {
                const ageFactor = (menopauseAge - woman.age) / (menopauseAge - (raceInfo.ageAdulte || 18)); 
                const yearlyChance = yearlyBirthProbabilities[woman.children.length] || 0;
                if (Math.random() < ((1 - Math.pow(1 - yearlyChance, 1 / 12)) * ageFactor)) {
                    woman.isPregnant = true;
                    woman.pregnancyTerm = 1;
                }
            }
        });
    }

    function handleBirths(livingPopulation) {
        const newChildren = [];
        livingPopulation.filter(p => p.isAlive && p.isPregnant).forEach(mother => {
            if (mother.pregnancyTerm >= PREGNANCY_DURATION_MONTHS) {
                const father = livingPopulation.find(f => f.id === mother.spouseId);
                if(father) {
                    const raceKey1 = `${father.race}-${mother.race}`, raceKey2 = `${mother.race}-${father.race}`;
                    const childRace = RACES_DATA.racesMixtes[raceKey1] || RACES_DATA.racesMixtes[raceKey2] || father.race;
                    const child = createPerson(childRace, father.lastName, father.familyId, Math.random() < 0.5 ? 'M' : 'F', 0, father.cityId, father.cityName, [father.id, mother.id]);
                    if(child){
                        father.children.push(child.id);
                        mother.children.push(child.id);
                        if (sim.families[child.familyId]) sim.families[child.familyId].members.push(child.id);
                        newChildren.push(child);
                        logEvent(`👶 Naissance de ${child.firstName} ${father.lastName}, enfant de ${father.firstName} et ${mother.firstName}.`, father.cityId, father.familyId);
                    }
                }
                mother.isPregnant = false;
                mother.pregnancyTerm = 0;
            }
        });
        if (newChildren.length > 0) sim.population.push(...newChildren);
    }
    
    // --- GESTION DE L'EMPLOI, DE L'ÉCONOMIE ET DU SOCIAL ---

    function assignJobs() {
        // Balayage pour corriger les incohérences (ex: un job sans poste)
        sim.population.forEach(p => {
            if (p.isAlive && p.job && p.job.role !== "Sans-emploi") {
                const jobSlot = sim.jobSlots.find(j => j.personId === p.id);
                if (!jobSlot) {
                    p.job = { role: "Sans-emploi", tier: 99, building: null };
                }
            }
        });
    
        const livingAdults = sim.population.filter(p => p.isAlive && p.age >= (RACES_DATA.races[p.race]?.ageAdulte || 18));
        
        livingAdults.forEach(p => { if (p.job && p.job.isCriminal) p.job = null; });
        
        const unemployed = livingAdults.filter(p => !p.job || p.job.role === "Sans-emploi").sort((a, b) => b.prestige - a.prestige);
    
        unemployed.forEach(person => {
            // On exclut la caserne des attributions d'emplois civils
            const potentialJobsForPerson = sim.jobSlots.filter(job => 
                !job.isFilled && 
                person.cityId === job.cityId && 
                person.prestige >= job.requiredPrestige &&
                job.buildingName !== "Caserne" // <-- EXCLUSION
            ).sort((a,b) => a.tier - b.tier);
    
            if (potentialJobsForPerson.length > 0) {
                const jobSlot = potentialJobsForPerson[0];
                const randomModifier = 0.95 + Math.random() * 0.1; 
                person.job = { role: jobSlot.role, tier: jobSlot.tier, building: jobSlot.buildingName, randomModifier: randomModifier };
                jobSlot.isFilled = true;
                jobSlot.personId = person.id;
                // NOUVEAU LOG : Prise de poste
                logEvent(`💼 ${person.firstName} ${person.lastName}, qui était sans-emploi, a trouvé un poste de ${jobSlot.role} à ${jobSlot.buildingName}.`, person.cityId, person.familyId);
            }
        });
    
        sim.population.filter(p => p.isAlive && p.age >= 18 && !p.job).forEach(p => { 
            p.job = { role: "Sans-emploi", tier: 99, building: null }; 
        });
    }

    function handleSocialRelationships(livingPopulation) {
        const adults = livingPopulation.filter(p => p.age >= (RACES_DATA.races[p.race]?.ageAdulte || 18));
        const populationById = new Map(sim.population.map(p => [p.id, p]));
    
        adults.forEach(person => {
            if (!person.relationships) return;
    
            // 1. Gérer les connaissances (collègues)
            if (person.job && person.job.building) {
                const colleagues = adults.filter(other =>
                    other.id !== person.id &&
                    other.job?.building === person.job.building &&
                    other.cityId === person.cityId
                );
    
                colleagues.forEach(colleague => {
                    const alreadyRelated = person.relationships.acquaintances.includes(colleague.id) || person.relationships.friends.includes(colleague.id) || person.relationships.rivals.includes(colleague.id);
                    // Vérifier les limites des deux côtés
                    if (!alreadyRelated &&
                        person.relationships.acquaintances.length < (person.maxAcquaintances || 18) &&
                        colleague.relationships.acquaintances.length < (colleague.maxAcquaintances || 18) &&
                        Math.random() < ACQUAINTANCE_CHANCE_PER_MONTH) {
    
                        person.relationships.acquaintances.push(colleague.id);
                        colleague.relationships.acquaintances.push(person.id);
                        logEvent(`🤝 ${person.firstName} ${person.lastName} et ${colleague.firstName} ${colleague.lastName} sont désormais des connaissances (collègues à ${person.job.building}).`, person.cityId, person.familyId);
                    }
                });
            }
    
            // 2. Évolution de connaissance à ami
            if (person.relationships.acquaintances.length > 0) {
                const newFriends = [];
                person.relationships.acquaintances = person.relationships.acquaintances.filter(acquaintanceId => {
                    const friend = populationById.get(acquaintanceId);
                    // Vérifier si l'amitié est possible et si les limites ne sont pas atteintes pour les deux
                    if (friend && friend.isAlive &&
                        person.relationships.friends.length < (person.maxFriends || 5) &&
                        friend.relationships.friends.length < (friend.maxFriends || 5) &&
                        Math.random() < FRIENDSHIP_CHANCE_PER_MONTH) {
    
                        newFriends.push(acquaintanceId);
                        return false; // Retirer de la liste des connaissances
                    }
                    return true;
                });
    
                newFriends.forEach(friendId => {
                    const friend = populationById.get(friendId);
                    if (friend) {
                        person.relationships.friends.push(friendId);
                        // Mettre à jour la liste de l'ami aussi
                        friend.relationships.acquaintances = friend.relationships.acquaintances.filter(id => id !== person.id);
                        if (!friend.relationships.friends.includes(person.id)) {
                            friend.relationships.friends.push(person.id);
                        }
                        logEvent(`🧑‍🤝‍🧑 ${person.firstName} ${person.lastName} et ${friend.firstName} ${friend.lastName} sont maintenant amis.`, person.cityId, person.familyId);
                    }
                });
            }
    
            // 3. Création de rivalités [CORRIGÉ]
            // On vérifie d'abord si la personne a de la place pour de nouveaux rivaux
            if (person.job && person.job.tier < 99 && person.relationships.rivals.length < (person.maxRivals || 3)) {
                 const potentialRivals = adults.filter(other =>
                    other.id !== person.id &&
                    other.job?.tier === person.job.tier && // Même tier social
                    other.cityId === person.cityId && // Même ville
                    !person.relationships.friends.includes(other.id) &&
                    !person.relationships.rivals.includes(other.id)
                );
    
                // On utilise une boucle for..of pour pouvoir l'interrompre
                for (const rival of potentialRivals) {
                    // Vérification à nouveau de la limite, au cas où plusieurs rivaux seraient ajoutés dans la même boucle
                    if (person.relationships.rivals.length >= (person.maxRivals || 3)) {
                        break; // La liste de rivaux de la personne est pleine pour ce mois-ci
                    }
    
                    // Vérifier que le rival potentiel a aussi de la place
                    if (rival.relationships.rivals.length < (rival.maxRivals || 3) && Math.random() < RIVALRY_CHANCE_PER_MONTH) {
                        person.relationships.rivals.push(rival.id);
                        rival.relationships.rivals.push(person.id);
                        logEvent(`⚔️ Une rivalité est née entre ${person.firstName} ${person.lastName} (${person.job.role}) et ${rival.firstName} ${rival.lastName} (${rival.job.role}).`, person.cityId, person.familyId);
                    }
                }
            }
    
            // 4. Gérer les connaissances via la famille
            if (person.familyId && person.relationships.acquaintances.length < (person.maxAcquaintances || 18)) {
                const familyMembers = adults.filter(p => p.isAlive && p.id !== person.id && p.familyId === person.familyId);
    
                familyMembers.forEach(familyMember => {
                    familyMember.relationships.friends.forEach(friendId => {
                        // Vérifier si la liste de connaissances de la personne est déjà pleine
                        if (person.relationships.acquaintances.length >= (person.maxAcquaintances || 18)) return;
    
                        const potentialAcquaintance = populationById.get(friendId);
                        if (!potentialAcquaintance || !potentialAcquaintance.isAlive) return;
    
                        // Vérifier aussi si la liste de la connaissance potentielle est pleine
                        if (potentialAcquaintance.relationships.acquaintances.length >= (potentialAcquaintance.maxAcquaintances || 18)) return;
                        
                        if (potentialAcquaintance.id === person.id) return;
    
                        const alreadyRelated = person.relationships.acquaintances.includes(friendId) ||
                                               person.relationships.friends.includes(friendId) ||
                                               person.relationships.rivals.includes(friendId);
    
                        if (!alreadyRelated && Math.random() < FAMILY_FRIEND_ACQUAINTANCE_CHANCE) {
                            person.relationships.acquaintances.push(friendId);
                            potentialAcquaintance.relationships.acquaintances.push(person.id);
                            logEvent(`🤝 Par le biais de la famille, ${person.firstName} ${person.lastName} et ${potentialAcquaintance.firstName} ${potentialAcquaintance.lastName} deviennent connaissances.`, person.cityId, person.familyId);
                        }
                    });
                });
            }
        });
    }

    function handleBarracksLogic() {
        const TERM_OF_SERVICE_YEARS = 3; // Durée de base pour une recrue
        const TERM_EXTENSION_SOLDIER = 5;  // Extension pour une promotion Soldat
        const TERM_EXTENSION_SERGEANT = 10; // Extension pour une promotion Sergent
        const PROMOTION_THRESHOLD_SOLDIER = 3; // Années de service requises pour passer de Recrue à Soldat
        const PROMOTION_THRESHOLD_SERGEANT = 8; // Années de service TOTALES requises pour passer de Soldat à Sergent (ex: 3 recrue + 5 soldat)

        sim.currentRegion.places.forEach(city => {
            const now = { year: sim.year, month: sim.month };
            const cityBarracksSlots = sim.jobSlots.filter(j => j.cityId === city.id && j.buildingName === "Caserne");
            const soldiersInCity = sim.population.filter(p => p.isAlive && p.cityId === city.id && p.job?.building === "Caserne");

            // --- GESTION DES PROMOTIONS (de haut en bas) ---

            // 1. Promotion Soldat -> Sergent
            const openSergentSlots = cityBarracksSlots.filter(j => !j.isFilled && j.role === "Sergent");
            if (openSergentSlots.length > 0) {
                const sergentCandidates = soldiersInCity
                    .filter(p => p.job?.role === 'Soldat' && p.militiaTerm && (sim.year - p.militiaTerm.startYear) >= PROMOTION_THRESHOLD_SERGEANT)
                    .sort((a, b) => b.prestige - a.prestige); // Prioriser les plus prestigieux

                const numToPromote = Math.min(openSergentSlots.length, sergentCandidates.length);
                for (let i = 0; i < numToPromote; i++) {
                    const candidate = sergentCandidates[i];
                    const newSlot = openSergentSlots[i];
                    
                    freeUpJobSlot(candidate); // Libère le poste de Soldat

                    // Promotion et nouveau contrat
                    candidate.job = { role: newSlot.role, tier: newSlot.tier, building: newSlot.buildingName, randomModifier: 1.0 };
                    newSlot.isFilled = true;
                    newSlot.personId = candidate.id;
                    candidate.militiaTerm.endYear = sim.year + TERM_EXTENSION_SERGEANT;
                    candidate.militiaTerm.endMonth = sim.month;
                    
                    logEvent(`🎖️ ${candidate.firstName} ${candidate.lastName} est promu(e) au rang de Sergent et prolonge son service de ${TERM_EXTENSION_SERGEANT} ans.`, city.id, candidate.familyId);
                }
            }

            // 2. Promotion Recrue -> Soldat
            const openSoldatSlots = cityBarracksSlots.filter(j => !j.isFilled && j.role === "Soldat");
            if (openSoldatSlots.length > 0) {
                const soldatCandidates = soldiersInCity
                    .filter(p => p.job?.role === 'Recrue' && p.militiaTerm && (sim.year - p.militiaTerm.startYear) >= PROMOTION_THRESHOLD_SOLDIER)
                    .sort((a, b) => b.prestige - a.prestige); // Prioriser les plus prestigieux

                const numToPromote = Math.min(openSoldatSlots.length, soldatCandidates.length);
                for (let i = 0; i < numToPromote; i++) {
                    const candidate = soldatCandidates[i];
                    const newSlot = openSoldatSlots[i];
                    
                    freeUpJobSlot(candidate); // Libère le poste de Recrue

                    // Promotion et nouveau contrat
                    candidate.job = { role: newSlot.role, tier: newSlot.tier, building: newSlot.buildingName, randomModifier: 1.0 };
                    newSlot.isFilled = true;
                    newSlot.personId = candidate.id;
                    candidate.militiaTerm.endYear = sim.year + TERM_EXTENSION_SOLDIER;
                    candidate.militiaTerm.endMonth = sim.month;
                    
                    logEvent(`🎖️ ${candidate.firstName} ${candidate.lastName} est promu(e) au rang de Soldat et prolonge son service de ${TERM_EXTENSION_SOLDIER} ans.`, city.id, candidate.familyId);
                }
            }
            
            // --- GESTION DES FINS DE SERVICE (pour ceux qui ne sont pas promus) ---
            const allSoldiers = sim.population.filter(p => p.isAlive && p.job?.building === "Caserne" && p.militiaTerm);
            allSoldiers.forEach(soldier => {
                const term = soldier.militiaTerm;
                const isTermOver = now.year > term.endYear || (now.year === term.endYear && now.month >= term.endMonth);
                if (isTermOver) {
                    logEvent(`📜 ${soldier.firstName} ${soldier.lastName} a terminé son service à la Caserne.`, city.id, soldier.familyId);
                    soldier.militiaTerm = null;
                    freeUpJobSlot(soldier);
                }
            });

            // --- LOGIQUE DE RECRUTEMENT (si la menace a augmenté) ---
            const menaceHasIncreased = city.dynamicStats.rawMenace > (city.dynamicStats.previousRawMenace || 0);

            if (menaceHasIncreased) {
                const availableRecruitSlots = cityBarracksSlots.filter(j => !j.isFilled && j.role === "Recrue");
                const unemployed = sim.population.filter(p => p.isAlive && p.cityId === city.id && p.job?.role === "Sans-emploi");

                if (availableRecruitSlots.length > 0 && unemployed.length > 0) {
                    const numToRecruit = Math.min(availableRecruitSlots.length, unemployed.length);
                    const recruits = unemployed.slice(0, numToRecruit);

                    recruits.forEach((person, index) => {
                        const jobSlot = availableRecruitSlots[index];
                        
                        person.job = { role: jobSlot.role, tier: jobSlot.tier, building: jobSlot.buildingName, randomModifier: 1.0 };
                        jobSlot.isFilled = true;
                        jobSlot.personId = person.id;

                        person.militiaTerm = {
                            startYear: sim.year,
                            endYear: sim.year + TERM_OF_SERVICE_YEARS,
                            endMonth: sim.month
                        };

                        logEvent(`📣 En réponse à la menace, ${person.firstName} ${person.lastName} est recruté(e) pour ${TERM_OF_SERVICE_YEARS} ans de service.`, city.id, person.familyId);
                    });
                }
            }

            // Mise à jour de la menace du mois précédent pour la prochaine comparaison
            city.dynamicStats.previousRawMenace = city.dynamicStats.rawMenace;
        });
    }

    function handleMigration() {
        const candidates = sim.population.filter(p => p.isAlive && p.age >= (RACES_DATA.races[p.race]?.ageAdulte || 18) && p.job?.role === "Sans-emploi");
        candidates.forEach(candidate => {
            if (Math.random() > MIGRATION_CHANCE_PER_MONTH) return;
            const originCity = sim.currentRegion.places.find(c => c.id === candidate.cityId);
            if (!originCity) return;
            const potentialDestinations = findPotentialDestinations(candidate, originCity);
            if (potentialDestinations.length === 0) return;
            const bestDestination = potentialDestinations.sort((a, b) => b.score - a.score)[0];
            const migratingFamily = getMigratingFamily(candidate);
            const travelResult = simulateTravel(migratingFamily, originCity, bestDestination.city);
            const candidateSurvived = travelResult.survivors.some(p => p.id === candidate.id);
            if (candidateSurvived) {
                logEvent(`✈️ La famille de ${candidate.firstName} ${candidate.lastName} a migré de ${originCity.name} à ${bestDestination.city.name}.`, originCity.id, candidate.familyId);
                travelResult.survivors.forEach(person => {
                    person.cityId = bestDestination.city.id;
                    person.cityName = bestDestination.city.name;
                    if(person.id !== candidate.id && person.age < (RACES_DATA.races[person.race]?.ageAdulte || 18)) {
                        person.job = { role: "Sans-emploi", tier: 99, building: null };
                    }
                });
                const newJobSlot = sim.jobSlots.find(j => j.cityId === bestDestination.city.id && !j.isFilled);
                if (newJobSlot) {
                    const assignedCandidate = travelResult.survivors.find(p => p.id === candidate.id);
                    if(assignedCandidate) {
                        const randomModifier = 0.95 + Math.random() * 0.1;
                        assignedCandidate.job = { role: newJobSlot.role, tier: newJobSlot.tier, building: newJobSlot.buildingName, randomModifier: randomModifier };
                        newJobSlot.isFilled = true;
                        newJobSlot.personId = assignedCandidate.id;
                    }
                }
                bestDestination.city.tempMenaceIncrease = (bestDestination.city.tempMenaceIncrease || 0) + MIGRATION_MENACE_INCREASE;
                bestDestination.city.tempMenaceDuration = MIGRATION_MENACE_DURATION;
            } else if (travelResult.survivors.length > 0) {
                logEvent(`💔 Voyage tragique pour la famille de ${candidate.firstName} ${candidate.lastName}. Le migrant principal a péri, mais des survivants ont atteint ${bestDestination.city.name}.`, originCity.id, candidate.familyId);
                travelResult.survivors.forEach(person => {
                    person.cityId = bestDestination.city.id;
                    person.cityName = bestDestination.city.name;
                    person.job = { role: "Sans-emploi", tier: 99, building: null };
                });
            } else {
                 logEvent(`☠️ La famille de ${candidate.firstName} ${candidate.lastName} a péri entièrement en tentant de rejoindre ${bestDestination.city.name}.`, originCity.id, candidate.familyId);
            }
        });
    }

    function getMigratingFamily(person) {
        const family = [person];
        const spouse = sim.population.find(p => p.id === person.spouseId);
        if (spouse && spouse.isAlive && spouse.job?.role === "Sans-emploi") {
            family.push(spouse);
        }
        const children = person.children.map(id => sim.population.find(p => p.id === id)).filter(c => c && c.isAlive && c.age < (RACES_DATA.races[c.race]?.ageAdulte || 18));
        family.push(...children);
        return family;
    }

    function simulateTravel(family, origin, destination) {
        const axialDistance = (a, b) => (Math.abs(a.q - b.q) + Math.abs(a.r - b.r) + Math.abs(a.q + a.r - (b.q + b.r))) / 2;
        const distKm = axialDistance(origin.coords, destination.coords) * (sim.currentRegion.scale || 1);
        const originMenaceRatio = origin.dynamicStats.menace / (origin.baseStats.menace || 1);
        const destMenaceRatio = destination.dynamicStats.menace / (destination.baseStats.menace || 1);
        const dangerScore = (distKm / 100) + (originMenaceRatio + destMenaceRatio) / 2;
        const attackChance = Math.min(0.5, dangerScore * TRAVEL_ATTACK_CHANCE_MOD);
        let survivors = [...family];
        if (Math.random() < attackChance) {
            logEvent(`⚔️ La famille a été attaquée en route vers ${destination.name}!`, origin.id, family[0].familyId);
            survivors = family.filter(person => {
                const dies = Math.random() < TRAVEL_DEATH_CHANCE_ON_ATTACK;
                if (dies) {
                    person.isAlive = false;
                    person.deathYear = sim.year;
                    person.deathMonth = sim.month;
                    person.causeOfDeath = "Tué(e) lors d'une embuscade en voyage";
                    logEvent(`☠️ ${person.firstName} a péri lors de l'attaque.`, origin.id, person.familyId);
                }
                return !dies;
            });
        }
        return { survivors };
    }

    function findPotentialDestinations(person, originCity) {
        const destinations = [];
        const otherCities = sim.currentRegion.places.filter(c => c.id !== originCity.id);
        otherCities.forEach(city => {
            const availableJobs = sim.jobSlots.filter(j => j.cityId === city.id && !j.isFilled).length;
            if (availableJobs > 0) {
                const menaceRatio = city.dynamicStats.menace / (city.baseStats.menace || 1);
                const score = (availableJobs * 5) - (menaceRatio * 10);
                if (score > 0) {
                    destinations.push({ city, score });
                }
            }
        });
        return destinations;
    }

    // --- FONCTIONS UTILITAIRES ET D'INITIALISATION DE DONNÉES ---
    function logEvent(message, cityId = null, familyId = null) {
        const eventData = { year: sim.year, month: sim.month, cityId, familyId, message };
        sim.eventLog.unshift(eventData);
        
        // On ne montre pas les achats et les performances dans le journal principal
        if (message.startsWith('🛒') || message.startsWith('📈')) return;

        if (document.getElementById('history-panel-general')) {
            const logEntry = document.createElement('div');
            logEntry.innerHTML = message.startsWith('<h3>') ? message : `<p>${message}</p>`;
            document.getElementById('history-panel-general').prepend(logEntry.cloneNode(true));
            if (cityId !== null) {
                const cityPanel = document.getElementById(`history-panel-city-${cityId}`);
                if (cityPanel) cityPanel.prepend(logEntry.cloneNode(true));
            }
        }
    }
    function parseJobString(jobString) { const tierMatch = jobString.match(/Tiers (\d+|0)/); const roleMatch = jobString.match(/:\s*([^()]+)/); const postsMatch = jobString.match(/(\d+)\s+poste/); const prestigeReqMatch = jobString.match(/(\d+)\s+prestige requis/); const prestigeGainMatch = jobString.match(/(\d+)\s+prestige\/mois/); return { tier: tierMatch ? parseInt(tierMatch[1]) : 99, role: roleMatch ? roleMatch[1].trim() : 'N/A', posts: postsMatch ? parseInt(postsMatch[1]) : 0, prestigeRequired: prestigeReqMatch ? parseInt(prestigeReqMatch[1]) : 0, prestigePerMonth: prestigeGainMatch ? parseInt(prestigeGainMatch[1]) : 0 }; }
    function parseStatGains(jobString) { const gains = {}; const statRegex = /(\d+\.?\d*)\s+(Intelligence|Force|Constitution|Dexterite|Sagesse|Charisme)\/mois/g; let match; while ((match = statRegex.exec(jobString)) !== null) { const value = parseFloat(match[1]); const statName = match[2]; gains[statName] = value; } return gains; }
    function loadDataFromStorage() { const data = localStorage.getItem('ecoSimRPG_map_data'); sim.regions = data ? JSON.parse(data) : []; const lastRegionId = localStorage.getItem('ecoSimRPG_last_region_id'); if (lastRegionId) { sim.currentRegion = sim.regions.find(r => r.id == lastRegionId) || null; } }
    function saveData() { localStorage.setItem('ecoSimRPG_map_data', JSON.stringify(sim.regions)); }
    function parseCurrency(valueString) { if (!valueString || typeof valueString !== 'string') return 0; let rawPC = 0; const pcInParenMatch = valueString.match(/\(([\d\s,]+)\s*PC\)/); if (pcInParenMatch) { rawPC = parseInt(pcInParenMatch[1].replace(/[\s,]/g, '')); } else { const poMatch = valueString.match(/([\d\s,]+)\s*PO/); if (poMatch) { rawPC = parseInt(poMatch[1].replace(/[\s,]/g, '')) * 10000; } else { const pcMatch = valueString.match(/([\d\s,]+)\s*pc/i); if (pcMatch) rawPC = parseInt(pcMatch[1].replace(/[\s,]/g, '')); } } return rawPC / GLOBAL_ECONOMY_DIVISOR; }
    function formatCurrency(totalPC) {
        if (totalPC === 0) return "0 pc";
        const isNegative = totalPC < 0;
        if(isNegative) totalPC = -totalPC;

        const flooredTotalPC = Math.floor(totalPC * GLOBAL_ECONOMY_DIVISOR);
        const po = Math.floor(flooredTotalPC / 10000);
        const pa = Math.floor((flooredTotalPC % 10000) / 100);
        const pc = flooredTotalPC % 100;
        let result = [];
        if (po > 0) result.push(`${po} po`);
        if (pa > 0) result.push(`${pa} pa`);
        if (pc > 0) result.push(`${pc} pc`);
        
        const formattedString = result.length > 0 ? result.join(', ') : "0 pc";
        return isNegative ? `-${formattedString}` : formattedString;
    }
    
    function handleG0Base() {
        const universalBarracksBuilding = {
            "Caserne": {
                description: "Bâtiment militaire de base pour la formation et le logement des troupes locales. Le recrutement est déclenché par une augmentation de la menace.",
                prestige: 15, menace: -20, chargeFixe: "50 PO/mois",
                emplois: [
                    "Tiers 5 : Recrue (20 postes, 0 prestige requis, 2 prestige/mois, 0.1 Intelligence/mois, 1.0 Force/mois, 1.2 Constitution/mois, 0.8 Dexterite/mois, 0.4 Sagesse/mois, 0.5 Charisme/mois, mixte)",
                    "Tiers 4 : Soldat (10 postes, 10 prestige requis, 5 prestige/mois, 0.3 Intelligence/mois, 1.5 Force/mois, 1.6 Constitution/mois, 1.2 Dexterite/mois, 0.6 Sagesse/mois, 0.8 Charisme/mois, mixte)",
                    "Tiers 3 : Sergent (5 postes, 25 prestige requis, 10 prestige/mois, 0.8 Intelligence/mois, 1.8 Force/mois, 2.0 Constitution/mois, 1.5 Dexterite/mois, 1.0 Sagesse/mois, 1.5 Charisme/mois, mixte)"
                ]
            }
        };
        for (const settlementType in BUILDINGS_DATA) {
            if (!BUILDINGS_DATA[settlementType]["Bâtiments Administratifs"]) {
                BUILDINGS_DATA[settlementType]["Bâtiments Administratifs"] = {};
            }
            Object.assign(BUILDINGS_DATA[settlementType]["Bâtiments Administratifs"], universalBarracksBuilding);
        }
    
        initializeG0Population_noUI();
        calculateAllBaseCityStats();
        updateDynamicCityStats();
    }
    
    async function runHiddenSimulation(totalYears) { const loadingBar = document.getElementById('loading-bar'); const loadingYearDisplay = document.getElementById('loading-year'); for (let y = 1; y <= totalYears; y++) { for (let m = 0; m < 12; m++) { advanceMonthLogicOnly(); } const percentage = Math.round((y / totalYears) * 100); if (loadingBar) loadingBar.value = percentage; if (loadingYearDisplay) loadingYearDisplay.textContent = `${y} / ${totalYears}`; await new Promise(resolve => setTimeout(resolve, 10)); } }
    
    function initializeG0Population_noUI() {
        Object.assign(sim, { population: [], families: {}, eventLog: [], nextPersonId: 0, year: 0, month: 0 });
        sim.currentRegion.places.forEach(city => {
            city.state = city.config.initialState || 'Stable';
            let totalPostsInCity = 0;
            const cityPopulation = [];
            const placeBuildingsData = BUILDINGS_DATA[city.type] || {};

            if (city.config?.buildings) {
                for (const buildingName in city.config.buildings) {
                    const buildingConfig = city.config.buildings[buildingName];
                    if (buildingConfig.active) {
                        let buildingData = null;
                        for (const category in placeBuildingsData) {
                            if (placeBuildingsData[category][buildingName]) {
                                buildingData = placeBuildingsData[category][buildingName];
                                break;
                            }
                        }
                        if (buildingData?.emplois) {
                            buildingData.emplois.forEach(jobString => {
                                const postsMatch = jobString.match(/(\d+)\s+poste/);
                                if (postsMatch) {
                                    totalPostsInCity += parseInt(postsMatch[1]) * buildingConfig.count;
                                }
                            });
                        }
                    }
                }
            }

            for (let i = 0; i < totalPostsInCity; i++) {
                const demo = city.config.demographics;
                let cumulative = 0;
                let chosenRace = Object.keys(demo)[0];
                const rand = Math.random() * 100;
                for (const race in demo) {
                    cumulative += (demo[race] || 0);
                    if (rand < cumulative) {
                        chosenRace = race;
                        break;
                    }
                }
                const person = createPerson(chosenRace, 'Temp', null, Math.random() < 0.5 ? 'M' : 'F', Math.floor(Math.random() * 7) + 18, city.id, city.name);
                if (person) {
                    cityPopulation.push(person);
                }
            }
            sim.population.push(...cityPopulation);
        });
        
        initializeJobSlots();

        sim.currentRegion.places.forEach(city => {
            const cityJobs = sim.jobSlots.filter(j => j.cityId === city.id).sort((a, b) => a.tier - b.tier);
            const cityPopulationToAssign = sim.population.filter(p => p.cityId === city.id && p.isAlive);
            const shuffledCityPopulation = cityPopulationToAssign.sort(() => 0.5 - Math.random());
            cityJobs.forEach((jobSlot, index) => {
                if (index < shuffledCityPopulation.length) {
                    const person = shuffledCityPopulation[index];
                    const randomModifier = 0.95 + Math.random() * 0.1;
                    person.job = { role: jobSlot.role, tier: jobSlot.tier, building: jobSlot.buildingName, randomModifier: randomModifier };
                    jobSlot.isFilled = true;
                    jobSlot.personId = person.id;
                }
            });
        });
        
        performG0Marriages();
        handlePrestigeGain();
    }

    function performG0Marriages() { 
        const singleMen = sim.population.filter(p => p.gender === 'M' && !p.spouseId); 
        let singleWomen = sim.population.filter(p => p.gender === 'F' && !p.spouseId); 
        singleMen.forEach(man => { 
            const suitableWives = singleWomen.filter(w => !w.spouseId && w.cityId === man.cityId && (man.race === w.race || RACES_DATA.compatibilites[man.race]?.includes(w.race))); 
            if (!suitableWives.length) return; 
            const chosenWoman = suitableWives[Math.floor(Math.random() * suitableWives.length)]; 
            if (chosenWoman) { 
                const familyId = `F${Object.keys(sim.families).length}`; 
                const familyName = RACES_DATA.races[man.race].noms[Math.floor(Math.random() * RACES_DATA.races[man.race].noms.length)]; 
                const marriageDate = { year: sim.year, month: sim.month }; 
                Object.assign(man, { spouseId: chosenWoman.id, familyId, birthFamilyId: familyId, lastName: familyName, wasMarried: true, marriageDate }); 
                Object.assign(chosenWoman, { spouseId: man.id, familyId, birthFamilyId: familyId, maidenName: chosenWoman.lastName, lastName: familyName, wasMarried: true, marriageDate }); 
                sim.families[familyId] = { originalName: familyName, members: [man.id, chosenWoman.id], location: man.cityName, totalPrestige: 0 }; 
                logEvent(`⚭ La famille ${familyName} est fondée par le mariage de ${man.firstName} ${man.lastName} et ${chosenWoman.firstName} ${chosenWoman.lastName} à ${man.cityName}.`, man.cityId, familyId); 
                singleWomen = singleWomen.filter(w => w.id !== chosenWoman.id); 
            } 
        }); 
        const remainingSingles = sim.population.filter(p => !p.familyId); 
        remainingSingles.forEach(person => { 
            const familyId = `F${Object.keys(sim.families).length}`; 
            const familyName = RACES_DATA.races[person.race].noms[Math.floor(Math.random() * RACES_DATA.races[person.race].noms.length)]; 
            person.lastName = familyName; 
            person.familyId = familyId; 
            person.birthFamilyId = familyId; 
            sim.families[familyId] = { originalName: familyName, members: [person.id], location: person.cityName, totalPrestige: 0 }; 
            logEvent(`🏠 La famille ${familyName} est fondée par un individu seul, ${person.firstName} ${person.lastName}, à ${person.cityName}.`, person.cityId, familyId); 
        }); 
    }
    
    function initializeJobSlots() {
        sim.jobSlots = [];
        sim.nextJobSlotId = 0;
        sim.currentRegion.places.forEach(place => {
            if (!place.config.buildings["Caserne"]) {
                place.config.buildings["Caserne"] = { active: true, count: 1 };
            }
            if (!place.config?.buildings) return;
            for (const buildingName in place.config.buildings) {
                const buildingInstance = place.config.buildings[buildingName];
                if (buildingInstance.active) {
                    buildingInstance.treasury = 50000 / GLOBAL_ECONOMY_DIVISOR;
                    buildingInstance.age = 0;
                    buildingInstance.consecutiveUnprofitableMonths = 0;
                    buildingInstance.monthsWithoutWorkers = 0;
        buildingInstance.monthlyTurnover = 0;
        buildingInstance.monthlyShoppingRevenue = 0;
        buildingInstance.monthlyTransactionCount = 0;
                    let buildingDataRef;
                    for (const category in BUILDINGS_DATA[place.type]) {
                        if (BUILDINGS_DATA[place.type][category][buildingName]) {
                            buildingDataRef = BUILDINGS_DATA[place.type][category][buildingName];
                            break;
                        }
                    }
                    buildingInstance.baseMaintenance = parseCurrency(buildingDataRef?.chargeFixe) * 0.1 || 10;
                }
            }
            const placeBuildingsData = BUILDINGS_DATA[place.type] || {};
            for (const buildingName in place.config.buildings) {
                const buildingInstance = place.config.buildings[buildingName];
                if (!buildingInstance.active) continue;
                for (const category in placeBuildingsData) {
                    const buildingData = placeBuildingsData[category][buildingName];
                    if (buildingData) {
                        addJobSlotsForBuildingInstance(place, buildingName, buildingData, buildingInstance.count);
                        break;
                    }
                }
            }
        });
    }

    function addJobSlotsForBuildingInstance(place, buildingName, buildingData, count) { if (buildingData?.emplois) { buildingData.emplois.forEach(jobString => { const jobInfo = parseJobString(jobString); for (let i = 0; i < (jobInfo.posts * count); i++) { sim.jobSlots.push({ id: sim.nextJobSlotId++, cityId: place.id, buildingName: buildingName, role: jobInfo.role, tier: jobInfo.tier, requiredPrestige: jobInfo.prestigeRequired, isFilled: false, personId: null }); } }); } }
    
function handlePublicSectorFunding() {
    sim.currentRegion.places.forEach(city => {
        if (!city.config?.buildings) return;

        const treasuryBefore = city.treasury;

        const placeBuildingsData = BUILDINGS_DATA[city.type] || {};
        const adminCategory = placeBuildingsData["Bâtiments Administratifs"];
        if (!adminCategory) return;
        for (const buildingName in adminCategory) {
            const buildingInstance = city.config.buildings[buildingName];
            const buildingData = adminCategory[buildingName];
            if (buildingInstance && buildingInstance.active) {
                const budget = parseCurrency(buildingData.chargeFixe) * buildingInstance.count;
                city.treasury -= budget;
                buildingInstance.treasury += budget;
                if (city.treasury < 0 && (sim.month % 3 === 0)) {
                     logEvent(`- La trésorerie de ${city.name} est en déficit ! La dette s'élève désormais à ${formatCurrency(city.treasury)}.`, city.id);
                }
            }
        }

        const treasuryAfter = city.treasury;
        const change = treasuryAfter - treasuryBefore;
        if (change !== 0) {
            // This console log is for debugging, not user-facing events.
            // console.log(`[DEBUG/Dépenses Publiques] Ville ${city.id}: Trésorerie passe de ${formatCurrency(treasuryBefore)} à ${formatCurrency(treasuryAfter)} (Delta: ${formatCurrency(change)})`);
        }
    });
}
    
function handleEconomyAndSalaries() {
    sim.currentRegion.places.forEach(city => {
        if (!city.config?.buildings) return;

        for (const buildingName in city.config.buildings) {
            const buildingInstance = city.config.buildings[buildingName];
            if (!buildingInstance.active) continue;

            let buildingData;
            let buildingCategoryName; // <<< CORRECTION : Variable pour stocker la catégorie
            for (const category in BUILDINGS_DATA[city.type]) {
                if (BUILDINGS_DATA[city.type][category][buildingName]) {
                    buildingData = BUILDINGS_DATA[city.type][category][buildingName];
                    buildingCategoryName = category; // <<< CORRECTION : On sauvegarde le nom de la catégorie
                    break;
                }
            }
            if (!buildingData) continue;

            const employees = sim.population.filter(p => p.isAlive && p.job?.building === buildingName && p.cityId === city.id);
            
            if (employees.length === 0 && buildingName !== "Caserne") {
                buildingInstance.monthsWithoutWorkers++;
                if (buildingInstance.monthsWithoutWorkers >= BUILDING_ABANDON_THRESHOLD) {
                    logEvent(`🏚️ Le bâtiment ${buildingName} à ${city.name} a fermé car il est resté sans employé pendant ${BUILDING_ABANDON_THRESHOLD} mois.`, city.id);
                    buildingInstance.active = false;
                    sim.jobSlots.filter(j => j.buildingName === buildingName && j.cityId === city.id).forEach(slot => {
                       if(slot.personId) {
                           const person = sim.population.find(p=>p.id === slot.personId);
                           if(person) freeUpJobSlot(person);
                       }
                    });
                    calculateAllBaseCityStats();
                    continue;
                }
            } else {
                buildingInstance.monthsWithoutWorkers = 0;
            }
            
            let totalSalariesPaidByBuilding = 0;
            employees.forEach(employee => {
                if (!employee.job) return;
                const baseSalary = BASE_SALARIES[employee.job.tier] || 0;
                const fixedBonus = buildingData.bonusFixePC || 0;
                const randomModifier = employee.job.randomModifier || 1.0;
                const salaryInPC = (baseSalary + fixedBonus) * randomModifier;
                const finalSalaryInSimUnits = salaryInPC / GLOBAL_ECONOMY_DIVISOR;
                employee.money += finalSalaryInSimUnits;
                buildingInstance.treasury -= finalSalaryInSimUnits;
                totalSalariesPaidByBuilding += finalSalaryInSimUnits;
            });

            const cityStateData = CITY_STATES[city.state] || CITY_STATES['Stable'];
            const stateModifier = cityStateData.mod;
            const totalSlotsForBuilding = sim.jobSlots.filter(j => j.buildingName === buildingName && j.cityId === city.id).length;
            const workforceRatio = totalSlotsForBuilding > 0 ? employees.length / totalSlotsForBuilding : 0;
            
            let actualTurnover = 0;
            if (buildingData.chiffreAffairesMax) {
                const maxTurnover = parseCurrency(buildingData.chiffreAffairesMax);
                const baseTurnover = maxTurnover * (0.9 + Math.random() * 0.2);
                actualTurnover = baseTurnover * (1 + stateModifier) * workforceRatio;

                // NOUVEAU LOG : Performance exceptionnelle (désactivé)
                // if (actualTurnover > maxTurnover * 1.05) { // Si le CA dépasse 105% du CA max de base
                //      logEvent(`📈 Excellente performance pour ${buildingName} à ${city.name}, qui a dépassé son chiffre d'affaires prévisionnel ce mois-ci !`, city.id);
                // }
            }
            
            buildingInstance.monthlyTurnover = actualTurnover;
            buildingInstance.treasury += actualTurnover;

            const profit = actualTurnover - totalSalariesPaidByBuilding;
            if (profit < 0) {
                buildingInstance.consecutiveUnprofitableMonths++;
                // <<< CORRECTION : On vérifie que le bâtiment n'est PAS administratif AVANT de logger le message de difficulté
                if (buildingCategoryName !== "Bâtiments Administratifs") {
                    if (buildingInstance.consecutiveUnprofitableMonths > 0 && buildingInstance.consecutiveUnprofitableMonths % 3 === 0) {
                        logEvent(`📉 L'entreprise ${buildingName} à ${city.name} rencontre des difficultés financières pour le ${buildingInstance.consecutiveUnprofitableMonths}ème mois consécutif.`, city.id);
                    }
                }
            } else {
                buildingInstance.consecutiveUnprofitableMonths = 0;
            }

            if (actualTurnover > 0) {
                const taxAmount = actualTurnover * TAX_RATE;
                buildingInstance.treasury -= taxAmount;
                if (city.treasury !== undefined) {
                    city.treasury += taxAmount;
                }
            }
        }
    });
}

function handleIndividualFinances() {
    sim.population.forEach(person => {
        if (!person.isAlive) return;
        let personMoneyInPO = person.money / PO_UNIT;
        let taxAmount = 0;
        for(const bracket of WEALTH_TAX_BRACKETS) {
            if (personMoneyInPO > bracket.threshold) {
                taxAmount += (personMoneyInPO - bracket.threshold) * bracket.rate;
                personMoneyInPO = bracket.threshold;
            }
        }
        if (taxAmount > 0) {
            const taxInSimUnits = taxAmount * PO_UNIT;
            person.money -= taxInSimUnits;
            const city = sim.currentRegion.places.find(p => p.id === person.cityId);
            if(city) city.treasury += taxInSimUnits;
        }
        const tier = person.job?.tier ?? 6;
        const baseCost = LIFESTYLE_COST.base + (LIFESTYLE_COST.perTier[tier] || 0);
        const wealthCost = person.money * LIFESTYLE_COST.wealthFactor;
        const monthlyExpenses = baseCost + wealthCost;
        person.money -= monthlyExpenses;
        if (person.money < 0) person.money = 0; 
    });
}
    
function handleShoppingAndServices() {
    const SHOPPING_THRESHOLD = 15 * PO_UNIT * (1 - 0.4); 
    const SHOPPING_CHANCE = 0.25; 
    const potentialShoppers = sim.population.filter(p => p.isAlive && p.money > SHOPPING_THRESHOLD && Math.random() < SHOPPING_CHANCE);
    potentialShoppers.forEach(shopper => {
        const city = sim.currentRegion.places.find(c => c.id === shopper.cityId);
        if (!city || !city.config?.buildings) return;
        const placeBuildingsData = BUILDINGS_DATA[city.type] || {};
        const shoppableBuildingNames = [];
        for (const category in placeBuildingsData) {
            if (category === "Bâtiments Administratifs") continue;
            for (const buildingName in placeBuildingsData[category]) {
                const buildingInstance = city.config.buildings[buildingName];
                if (buildingInstance && buildingInstance.active) {
                    shoppableBuildingNames.push(buildingName);
                }
            }
        }
        if (shoppableBuildingNames.length === 0) return;
        const chosenBuildingName = shoppableBuildingNames[Math.floor(Math.random() * shoppableBuildingNames.length)];
        let buildingData;
        for (const category in placeBuildingsData) {
            if (placeBuildingsData[category][chosenBuildingName]) {
                buildingData = placeBuildingsData[category][chosenBuildingName];
                break;
            }
        }
        if (!buildingData || !buildingData.bonusFixePC) return;
        const priceInPC = (Math.random() * 0.2 + 0.2) * buildingData.bonusFixePC;
        const priceInSimUnits = priceInPC / GLOBAL_ECONOMY_DIVISOR;
        const taxOnPurchase = priceInSimUnits * SALES_TAX_RATE;
        const totalCost = priceInSimUnits + taxOnPurchase;
        if (shopper.money < totalCost) return;
        const buildingInstance = city.config.buildings[chosenBuildingName];
        if (!buildingInstance) return;
        buildingInstance.monthlyShoppingRevenue += priceInSimUnits;
        buildingInstance.monthlyTransactionCount++;
        shopper.money -= totalCost;
        buildingInstance.treasury += priceInSimUnits;
        city.monthlySalesTax = (city.monthlySalesTax || 0) + taxOnPurchase;
        city.treasury += taxOnPurchase;
        logEvent(`🛒 ${shopper.firstName} a dépensé ${formatCurrency(totalCost)} (dont ${formatCurrency(taxOnPurchase)} de taxe) à ${chosenBuildingName}.`, shopper.cityId, shopper.familyId);
    });
}

    function handleSocialSafetyNet() { 
        const poorPeople = sim.population.filter(p => p.isAlive && p.money < POVERTY_LINE); 
        const populationById = new Map(sim.population.map(p => [p.id, p])); 
        poorPeople.forEach(poorPerson => { 
            const familyMembersIds = new Set([...(poorPerson.parents || []), ...(sim.families[poorPerson.familyId]?.members || [])]); 
            const adultChildren = sim.population.filter(p => p.parents && p.parents.includes(poorPerson.id) && p.age >= (RACES_DATA.races[p.race]?.ageAdulte || 18)); 
            adultChildren.forEach(child => familyMembersIds.add(child.id)); 
            familyMembersIds.delete(poorPerson.id); 
            familyMembersIds.forEach(memberId => { 
                const member = populationById.get(memberId); 
                if (member && member.isAlive && member.money > WEALTH_LINE) { 
                    const donation = (member.money - WEALTH_LINE) * FAMILY_DONATION_RATE; 
                    if (donation > 0) { 
                        member.money -= donation; 
                        poorPerson.money += donation; 
                        // NOUVEAU LOG : Aide familiale
                        logEvent(`❤️ En difficulté, ${poorPerson.firstName} ${poorPerson.lastName} a reçu une aide de ${formatCurrency(donation)} de la part d'un membre de sa famille, ${member.firstName} ${member.lastName}.`, poorPerson.cityId, poorPerson.familyId);
                    } 
                } 
            }); 
        }); 
    }
    
    function handleCriminality() { const candidates = sim.population.filter(p => p.isAlive && p.job?.role === "Sans-emploi" && p.age >= (RACES_DATA.races[p.race]?.ageAdulte || 18) && p.prestige < CRIMINAL_PRESTIGE_THRESHOLD && p.money < POVERTY_LINE); candidates.forEach(person => { if (Math.random() < CRIMINAL_CHANCE) { const criminalRole = Math.random() < 0.5 ? "Voleur" : "Charlatan"; person.job = { role: criminalRole, tier: 10, building: "Pègre", isCriminal: true }; person.money += CRIMINAL_INCOME[criminalRole]; logEvent(`🚨 ${person.firstName} ${person.lastName}, sombrant dans la misère, est devenu(e) ${criminalRole.toLowerCase()} à ${person.cityName}.`, person.cityId, person.familyId); } }); }
    
// REFACTOR: Gestion du prestige et de l'héritage des stats
function handlePrestigeGain() {
    const monthlyPrestigeGains = new Map();
    const monthlyStatGains = new Map();
    const populationById = new Map(sim.population.map(p => [p.id, p]));

    // Étape 1 : Calculer les gains de base (prestige et stats) pour chaque adulte qui travaille.
    sim.population.forEach(person => {
        // <<< CORRIGÉ : Remplacement de p.race par person.race
        if (!person.isAlive || !person.job || person.job.isCriminal || !person.job.building || person.age < (RACES_DATA.races[person.race]?.ageAdulte || 18)) return;

        const city = sim.currentRegion.places.find(p => p.id === person.cityId);
        if (!city) return;

        const buildingData = BUILDINGS_DATA[city.type];
        if (!buildingData) return;

        for (const category in buildingData) {
            if (buildingData[category][person.job.building]) {
                const jobStrings = buildingData[category][person.job.building].emplois;
                const jobString = jobStrings.find(j => j.includes(person.job.role));
                if (jobString) {
                    // Gain de prestige direct pour la personne
                    const jobInfo = parseJobString(jobString);
                    person.prestige += jobInfo.prestigePerMonth;
                    monthlyPrestigeGains.set(person.id, jobInfo.prestigePerMonth);

                    // Stockage des gains de stats pour l'héritage par les enfants
                    const statGains = parseStatGains(jobString);
                    monthlyStatGains.set(person.id, statGains);

                    // Appliquer les gains de stats directement à la personne
                    if (person.stats) {
                        for (const stat in statGains) {
                            if (person.stats.hasOwnProperty(stat)) {
                                person.stats[stat] += statGains[stat];
                            }
                        }
                    }
                    break;
                }
            }
        }
    });

    // Étape 2 : Gérer l'héritage (Prestige et Stats) pour les enfants et petits-enfants.
    const livingChildren = sim.population.filter(p => p.isAlive && p.age < (RACES_DATA.races[p.race]?.ageAdulte || 18));
    
    livingChildren.forEach(child => {
        if (!child.parents || child.parents.length === 0) return;

        // --- Héritage du Prestige (logique conservée) ---
        const parent1PrestigeGain = monthlyPrestigeGains.get(child.parents[0]) || 0;
        const parent2PrestigeGain = monthlyPrestigeGains.get(child.parents[1]) || 0;
        child.prestigeBuffer += 0.10 * (parent1PrestigeGain + parent2PrestigeGain);

        let totalGrandparentPrestigeGain = 0;
        const parent1 = populationById.get(child.parents[0]);
        const parent2 = populationById.get(child.parents[1]);
        if (parent1 && parent1.parents) parent1.parents.forEach(gpId => totalGrandparentPrestigeGain += monthlyPrestigeGains.get(gpId) || 0);
        if (parent2 && parent2.parents) parent2.parents.forEach(gpId => totalGrandparentPrestigeGain += monthlyPrestigeGains.get(gpId) || 0);
        child.prestigeBuffer += 0.05 * totalGrandparentPrestigeGain;

        if (child.prestigeBuffer >= 1.0) {
            const wholePrestigeGained = Math.floor(child.prestigeBuffer);
            child.prestige += wholePrestigeGained;
            child.prestigeBuffer -= wholePrestigeGained;
        }

        // --- NOUVEAU: Héritage des Statistiques (Parent -> Enfant uniquement) ---
        if (child.stats) {
            child.parents.forEach(parentId => {
                const parentStatGains = monthlyStatGains.get(parentId);
                if (parentStatGains) {
                    for (const stat in parentStatGains) {
                        if (child.stats.hasOwnProperty(stat)) {
                            child.stats[stat] += parentStatGains[stat] * STAT_INHERITANCE_RATE;
                        }
                    }
                }
            });
        }
    });
}

    function updateDynamicCityStats() { 
        if (!sim.currentRegion) return; 
        const livingPopulation = sim.population.filter(p => p.isAlive); 
        sim.currentRegion.places.forEach(city => { 
            const cityAdults = livingPopulation.filter(p => p.cityId === city.id && p.age >= (RACES_DATA.races[p.race]?.ageAdulte || 18)); 
            const oisifs = cityAdults.filter(p => !p.job || p.job.role === "Sans-emploi").length; 
            const menaceFromUnemployment = Math.floor(oisifs * 0.13); 
            const prestigeFromUnemployment = Math.floor(oisifs * 0.07); 
            let menaceFromCriminals = 0; 
            const criminals = cityAdults.filter(p => p.job?.isCriminal); 
            criminals.forEach(criminal => menaceFromCriminals += (CRIMINAL_MENACE_ADDITION[criminal.job.role] || 0)); 
            let menaceFromWealth = 0;
            if (city.treasury > TREASURY_MENACE_THRESHOLD) {
                const excessTreasury = city.treasury - TREASURY_MENACE_THRESHOLD;
                menaceFromWealth = Math.floor(excessTreasury * TREASURY_MENACE_FACTOR);
            }
            const basePrestige = city.baseStats?.prestige || 0; 
            const baseMenace = city.baseStats?.menace || 0; 
            const tempPenalty = city.tempPrestigePenalty || 0; 
            const menaceFromMigration = city.tempMenaceIncrease || 0; 
            city.dynamicStats.prestige = basePrestige - prestigeFromUnemployment - tempPenalty; 
            let rawMenace = baseMenace + menaceFromUnemployment + menaceFromCriminals + menaceFromMigration + menaceFromWealth;
            city.dynamicStats.rawMenace = rawMenace;
            const filledGuardSlots = sim.jobSlots.filter(j => j.isFilled && j.cityId === city.id && GUARD_ROLES.includes(j.role));
            rawMenace -= filledGuardSlots.length * 10;
            city.dynamicStats.menace = Math.max(0, rawMenace);
            city.dynamicStats.oisifs = oisifs; 
        }); 
    }
    
    function updateCityState() { sim.currentRegion.places.forEach(city => { const adults = sim.population.filter(p => p.isAlive && p.cityId === city.id && p.age >= (RACES_DATA.races[p.race]?.ageAdulte || 18)); const adultCount = adults.length; if (adultCount === 0) { city.state = "Stable"; return; } const unemployedCount = adults.filter(p => p.job?.role === "Sans-emploi").length; const unemploymentRatio = unemployedCount / adultCount; const prestigeRatio = (city.baseStats.prestige > 0) ? city.dynamicStats.prestige / city.baseStats.prestige : 1; let menaceRatio; if (city.baseStats.menace > 0) menaceRatio = city.dynamicStats.menace / city.baseStats.menace; else menaceRatio = (city.dynamicStats.menace > 0) ? 2 : 1; const healthScore = (prestigeRatio * 0.8) - (menaceRatio * 0.5) - (unemploymentRatio * 0.2); let oldState = city.state; if (healthScore > 1.2) city.state = "Florissante"; else if (healthScore > 0.8) city.state = "Prospère"; else if (healthScore > 0.2) city.state = "Stable"; else if (healthScore > -0.4) city.state = "Fragile"; else if (healthScore > -0.8) city.state = "En Crise"; else city.state = "Sur le Déclin"; if(oldState !== city.state) logEvent(`L'état de ${city.name} a changé de '${oldState}' à '${city.state}' (Score: ${healthScore.toFixed(2)})`, city.id); }); }
    function handleBuildingMaintenance() { sim.currentRegion.places.forEach(city => { if (!city.config?.buildings) return; for (const buildingName in city.config.buildings) { const buildingInstance = city.config.buildings[buildingName]; if (buildingInstance.active) buildingInstance.age++; } }); }
    
    function handleCityProjectsAndTreasury() {
        sim.currentRegion.places.forEach(city => {
            let cheapestBuildingCost = Infinity;
            const availableBuildings = BUILDINGS_DATA[city.type] || {};
            for (const category in availableBuildings) {
                if (category === "Bâtiments Administratifs") continue;
                for (const buildingName in availableBuildings[category]) {
                    const buildingData = availableBuildings[category][buildingName];
                    if (buildingData.coutConstruction) {
                        const cost = parseCurrency(buildingData.coutConstruction);
                        if (cost > 0 && cost < cheapestBuildingCost) {
                            cheapestBuildingCost = cost;
                        }
                    }
                }
            }
            if (cheapestBuildingCost === Infinity) { cheapestBuildingCost = 50000; }
            const treasuryLimit = cheapestBuildingCost * 2.0;
            if (city.treasury <= treasuryLimit) return;
            const unemployed = sim.population.filter(p => p.cityId === city.id && p.isAlive && p.age >= (RACES_DATA.races[p.race]?.ageAdulte || 18) && p.job?.role === "Sans-emploi");
            if (unemployed.length > 0) {
                const affordableBuildings = [];
                const placeBuildingsData = BUILDINGS_DATA[city.type] || {};
                for (const category in placeBuildingsData) {
                    if (category === "Bâtiments Administratifs") continue;
                    for (const buildingName in placeBuildingsData[category]) {
                        const buildingData = placeBuildingsData[category][buildingName];
                        const cost = parseCurrency(buildingData.coutConstruction);
                        if (cost > 0 && city.treasury > cost) {
                            affordableBuildings.push({ name: buildingName, cost, data: buildingData });
                        }
                    }
                }
                if (affordableBuildings.length > 0) {
                    const buildingsWithCounts = affordableBuildings.map(building => ({ ...building, count: city.config.buildings[building.name]?.count || 0 }));
                    const minCount = Math.min(...buildingsWithCounts.map(b => b.count));
                    const bestOptions = buildingsWithCounts.filter(b => b.count === minCount);
                    const buildingToBuild = bestOptions[Math.floor(Math.random() * bestOptions.length)];
                    city.treasury -= buildingToBuild.cost;
                    let config = city.config.buildings[buildingToBuild.name];
                    if (config?.active) {
                        config.count++;
                    } else {
                        city.config.buildings[buildingToBuild.name] = { active: true, count: 1, age: 0, consecutiveUnprofitableMonths: 0, monthsWithoutWorkers: 0, treasury: 50000 / GLOBAL_ECONOMY_DIVISOR, baseMaintenance: parseCurrency(buildingToBuild.data.chargeFixe) * 0.1 || 10 };
                    }
                    addJobSlotsForBuildingInstance(city, buildingToBuild.name, buildingToBuild.data, 1);
                    logEvent(`🏗️ Pour réduire le chômage, ${city.name} a dépensé ${formatCurrency(buildingToBuild.cost)} pour construire : ${buildingToBuild.name}.`, city.id);
                    calculateAllBaseCityStats();
                    return;
                }
            }
            const excess = city.treasury - treasuryLimit;
            city.treasury -= excess;
            const prestigeGain = Math.floor(excess / (100 * PO_UNIT));
            city.baseStats.prestige += prestigeGain;
            logEvent(`🏛️ ${city.name} a investi ${formatCurrency(excess)} dans des projets civiques, gagnant ${prestigeGain} prestige.`, city.id);
        });
    }
    
    function handleRoyalTaxesAndSubsidies() { 
        sim.currentRegion.places.forEach(city => { 
            if (city.treasury > ROYAL_TAX_THRESHOLD) { 
                const taxableAmount = city.treasury - ROYAL_TAX_THRESHOLD; 
                const tax = taxableAmount * ROYAL_TAX_RATE; 
                city.treasury -= tax; 
                logEvent(`📜 La Couronne a prélevé une taxe royale de ${formatCurrency(tax)} sur les coffres excédentaires de ${city.name}.`, city.id); 
            } 
        }); 
    }

    function calculateAllFamilyPrestige() { if (!sim.families) return; const livingPopulation = sim.population.filter(p => p.isAlive); for (const familyId in sim.families) { const familyMembers = livingPopulation.filter(p => p.familyId === familyId); const totalPrestige = familyMembers.reduce((sum, member) => sum + (member.prestige || 0), 0); sim.families[familyId].totalPrestige = totalPrestige; } }
    
    function calculateAllBaseCityStats() {
        if (!sim.currentRegion) return;
        sim.currentRegion.places.forEach(city => {
            let basePrestige = 0;
            let baseMenace = 0;
            if (city.config && city.config.buildings) {
                const placeBuildingsData = BUILDINGS_DATA[city.type] || {};
                for (const buildingName in city.config.buildings) {
                    const buildingInstance = city.config.buildings[buildingName];
                    if (!buildingInstance.active) continue;
                    let buildingData = null;
                    for (const category in placeBuildingsData) {
                        if (placeBuildingsData[category][buildingName]) {
                            buildingData = placeBuildingsData[category][buildingName];
                            break;
                        }
                    }
                    if (buildingData) {
                        basePrestige += (buildingData.prestige || 0) * buildingInstance.count;
                        baseMenace += (buildingData.menace || 0) * buildingInstance.count;
                    }
                }
            }
            city.baseStats = { prestige: basePrestige, menace: baseMenace };
            if (!city.dynamicStats) {
                city.dynamicStats = { prestige: basePrestige, menace: baseMenace, rawMenace: baseMenace, previousRawMenace: baseMenace, oisifs: 0 };
            }
        });
    }

// --- MISE À DISPOSITION GLOBALE DES FONCTIONS DU MOTEUR ---
// Pour que step3-ui.js puisse les appeler.
window.SimEngine = {
    advanceMonthLogicOnly,
    runHiddenSimulation,
    handleG0Base,
    loadDataFromStorage,
    calculateAllFamilyPrestige,
    formatCurrency,
    parseCurrency,
    CITY_STATES,
    GUARD_ROLES,
    GLOBAL_ECONOMY_DIVISOR,
    BASE_SALARIES, 
    CRIMINAL_MENACE_ADDITION
};
});