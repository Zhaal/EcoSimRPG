// Fichier généré par l'Éditeur EcoSim le 16/07/2025 20:04:53

window.EcoSimData = window.EcoSimData || {};
EcoSimData.buildings = EcoSimData.buildings || {};

EcoSimData.buildings['Bourg'] = {
    "Bâtiments Administratifs": {
        "Hôtel de Ville": {
            "description": "Centre névralgique du pouvoir administratif du bourg, où siège le conseil.",
            "providesTags": [],
            "requiresTags": {
                "Vêtements de Luxe": {
                    "distance": 4
                }
            },
            "emplois": [
                {
                    "tier": 0,
                    "titre": "Bourgmestre",
                    "postes": 1,
                    "salaire": {
                        "totalEnCuivre": 615
                    },
                    "prerequis": {
                        "prestige": 200
                    },
                    "gainsMensuels": {
                        "prestige": 0.8,
                        "stats": {
                            "intelligence": 0.3,
                            "force": 0.2,
                            "constitution": 0.2,
                            "dexterite": 0.1,
                            "sagesse": 0.4,
                            "charisme": 0.4
                        }
                    },
                    "type": "mixte"
                },
                {
                    "tier": 2,
                    "titre": "Échevin",
                    "postes": 3,
                    "salaire": {
                        "totalEnCuivre": 75
                    },
                    "prerequis": {
                        "prestige": 100
                    },
                    "gainsMensuels": {
                        "prestige": 0.5,
                        "stats": {
                            "intelligence": 0.3,
                            "force": 0.1,
                            "constitution": 0.1,
                            "dexterite": 0.2,
                            "sagesse": 0.3,
                            "charisme": 0.2
                        }
                    },
                    "type": "mixte"
                }
            ]
        },
        "Garde du Bourg": {
            "description": "Force de police professionnelle assurant la loi et l'ordre dans le bourg.",
            "providesTags": [],
            "requiresTags": {
                "Armement de Qualité": {
                    "distance": 2
                },
                "Vêtements de Qualité": {
                    "distance": 5
                },
                "Potions Complexes": {
                    "distance": 4
                }
            },
            "emplois": [
                {
                    "tier": 2,
                    "titre": "Capitaine de la Garde",
                    "postes": 1,
                    "salaire": {
                        "totalEnCuivre": 95
                    },
                    "prerequis": {
                        "prestige": 160
                    },
                    "gainsMensuels": {
                        "prestige": 0.6,
                        "stats": {
                            "intelligence": 0.1,
                            "force": 0.3,
                            "constitution": 0.3,
                            "dexterite": 0.2,
                            "sagesse": 0.1,
                            "charisme": 0.1
                        }
                    },
                    "type": "mixte"
                },
                {
                    "tier": 3,
                    "titre": "Garde",
                    "postes": 12,
                    "salaire": {
                        "totalEnCuivre": 65
                    },
                    "prerequis": {
                        "prestige": 50
                    },
                    "gainsMensuels": {
                        "prestige": 0.3,
                        "stats": {
                            "intelligence": 0.1,
                            "force": 0.3,
                            "constitution": 0.2,
                            "dexterite": 0.2,
                            "sagesse": 0.1,
                            "charisme": 0.1
                        }
                    },
                    "type": "mixte"
                }
            ]
        },
        "Tribunal du Bourg": {
            "description": "Tribunal où sont réglés les litiges civils et criminels mineurs.",
            "providesTags": [],
            "requiresTags": {
                "Livres": {
                    "distance": 2
                }
            },
            "emplois": [
                {
                    "tier": 2,
                    "titre": "Juge",
                    "postes": 1,
                    "salaire": {
                        "totalEnCuivre": 105
                    },
                    "prerequis": {
                        "prestige": 180
                    },
                    "gainsMensuels": {
                        "prestige": 0.7,
                        "stats": {
                            "intelligence": 0.3,
                            "force": 0.1,
                            "constitution": 0.2,
                            "dexterite": 0.3,
                            "sagesse": 0.2,
                            "charisme": 0.3
                        }
                    },
                    "type": "mixte"
                },
                {
                    "tier": 3,
                    "titre": "Greffier",
                    "postes": 2,
                    "salaire": {
                        "totalEnCuivre": 70
                    },
                    "prerequis": {
                        "prestige": 80
                    },
                    "gainsMensuels": {
                        "prestige": 0.4,
                        "stats": {
                            "intelligence": 0.3,
                            "force": 0.1,
                            "constitution": 0.2,
                            "dexterite": 0.2,
                            "sagesse": 0.2,
                            "charisme": 0.3
                        }
                    },
                    "type": "mixte"
                }
            ]
        },
        "Bureau du Percepteur": {
            "description": "Collecte des taxes et gestion des finances publiques du bourg.",
            "providesTags": [],
            "requiresTags": {},
            "emplois": [
                {
                    "tier": 3,
                    "titre": "Percepteur",
                    "postes": 2,
                    "salaire": {
                        "totalEnCuivre": 80
                    },
                    "prerequis": {
                        "prestige": 120
                    },
                    "gainsMensuels": {
                        "prestige": 0.5,
                        "stats": {
                            "intelligence": 0.3,
                            "force": 0.1,
                            "constitution": 0.1,
                            "dexterite": 0.2,
                            "sagesse": 0.3,
                            "charisme": 0.2
                        }
                    },
                    "type": "mixte"
                }
            ]
        }
    },
    "Bâtiments de Production": {
        "Manufacture d'Armes": {
            "description": "Forge spécialisée dans la production d'armes et d'armures de qualité.",
            "providesTags": [
                "Armement de Qualité"
            ],
            "requiresTags": {
                "Pièces Métalliques": {
                    "distance": 5
                },
                "Cuir": {
                    "distance": 8
                },
                "Planches": {
                    "distance": 8
                }
            },
            "emplois": [
                {
                    "tier": 2,
                    "titre": "Armurier",
                    "postes": 1,
                    "salaire": {
                        "totalEnCuivre": 110
                    },
                    "prerequis": {
                        "prestige": 150
                    },
                    "gainsMensuels": {
                        "prestige": 0.6,
                        "stats": {
                            "intelligence": 0.2,
                            "force": 0.3,
                            "constitution": 0.2,
                            "dexterite": 0.3,
                            "sagesse": 0.1,
                            "charisme": 0.2
                        }
                    },
                    "type": "mixte"
                },
                {
                    "tier": 3,
                    "titre": "Artisan Forgeron",
                    "postes": 3,
                    "salaire": {
                        "totalEnCuivre": 70
                    },
                    "prerequis": {
                        "prestige": 50
                    },
                    "gainsMensuels": {
                        "prestige": 0.3,
                        "stats": {
                            "intelligence": 0.2,
                            "force": 0.2,
                            "constitution": 0.2,
                            "dexterite": 0.3,
                            "sagesse": 0.1,
                            "charisme": 0.1
                        }
                    },
                    "type": "mixte"
                }
            ]
        },
        "Guilde des Couturiers": {
            "description": "Atelier de confection de vêtements raffinés, de tapisseries et de broderies.",
            "providesTags": [
                "Vêtements de Luxe"
            ],
            "requiresTags": {
                "Tissu": {
                    "distance": 5
                },
                "Fourrures Traitées": {
                    "distance": 10
                },
                "Bijoux": {
                    "distance": 4
                }
            },
            "emplois": [
                {
                    "tier": 2,
                    "titre": "Maître de la Guilde des Couturiers",
                    "postes": 1,
                    "salaire": {
                        "totalEnCuivre": 90
                    },
                    "prerequis": {
                        "prestige": 120
                    },
                    "gainsMensuels": {
                        "prestige": 0.5,
                        "stats": {
                            "intelligence": 0.2,
                            "force": 0.1,
                            "constitution": 0.2,
                            "dexterite": 0.3,
                            "sagesse": 0.1,
                            "charisme": 0.2
                        }
                    },
                    "type": "mixte"
                },
                {
                    "tier": 4,
                    "titre": "Couturier",
                    "postes": 4,
                    "salaire": {
                        "totalEnCuivre": 65
                    },
                    "prerequis": {
                        "prestige": 40
                    },
                    "gainsMensuels": {
                        "prestige": 0.3,
                        "stats": {
                            "intelligence": 0.2,
                            "force": 0.1,
                            "constitution": 0.1,
                            "dexterite": 0.3,
                            "sagesse": 0.1,
                            "charisme": 0.1
                        }
                    },
                    "type": "mixte"
                }
            ]
        },
        "Chantier Naval": {
            "description": "Construction de barques de rivière, de bateaux de pêche et réparation navale.",
            "providesTags": [
                "Navires"
            ],
            "requiresTags": {
                "Planches": {
                    "distance": 5
                },
                "Pièces Métalliques": {
                    "distance": 8
                },
                "Tissu": {
                    "distance": 8
                }
            },
            "emplois": [
                {
                    "tier": 3,
                    "titre": "Maître Charpentier Naval",
                    "postes": 1,
                    "salaire": {
                        "totalEnCuivre": 85
                    },
                    "prerequis": {
                        "prestige": 100
                    },
                    "gainsMensuels": {
                        "prestige": 0.5,
                        "stats": {
                            "intelligence": 0.3,
                            "force": 0.2,
                            "constitution": 0.2,
                            "dexterite": 0.3,
                            "sagesse": 0.1,
                            "charisme": 0.1
                        }
                    },
                    "type": "mixte"
                },
                {
                    "tier": 4,
                    "titre": "Charpentier de marine",
                    "postes": 5,
                    "salaire": {
                        "totalEnCuivre": 60
                    },
                    "prerequis": {
                        "prestige": 30
                    },
                    "gainsMensuels": {
                        "prestige": 0.2,
                        "stats": {
                            "intelligence": 0.1,
                            "force": 0.2,
                            "constitution": 0.2,
                            "dexterite": 0.3,
                            "sagesse": 0.1,
                            "charisme": 0.1
                        }
                    },
                    "type": "mixte"
                }
            ]
        },
        "Grande Boulangerie-Pâtisserie": {
            "description": "Production à grande échelle pour le bourg, incluant pains spéciaux et pâtisseries fines.",
            "providesTags": [
                "Pain et Pâtisseries"
            ],
            "requiresTags": {
                "Farine": {
                    "distance": 5
                },
                "Fruits": {
                    "distance": 5
                },
                "Miel": {
                    "distance": 8
                },
                "Lait": {
                    "distance": 5
                },
                "Fromage": {
                    "distance": 6
                }
            },
            "emplois": [
                {
                    "tier": 2,
                    "titre": "Artisan Boulanger",
                    "postes": 2,
                    "salaire": {
                        "totalEnCuivre": 88
                    },
                    "prerequis": {
                        "prestige": 90
                    },
                    "gainsMensuels": {
                        "prestige": 0.5,
                        "stats": {
                            "intelligence": 0.1,
                            "force": 0.3,
                            "constitution": 0.3,
                            "dexterite": 0.2,
                            "sagesse": 0.1,
                            "charisme": 0.2
                        }
                    },
                    "type": "mixte"
                },
                {
                    "tier": 4,
                    "titre": "Pâtissier",
                    "postes": 4,
                    "salaire": {
                        "totalEnCuivre": 55
                    },
                    "prerequis": {
                        "prestige": 2
                    },
                    "gainsMensuels": {
                        "prestige": 0.3,
                        "stats": {
                            "intelligence": 0.2,
                            "force": 0.3,
                            "constitution": 0.3,
                            "dexterite": 0.4,
                            "sagesse": 0.1,
                            "charisme": 0.1
                        }
                    },
                    "type": "mixte"
                }
            ]
        },
        "Brasserie": {
            "description": "Production de bière et d'ale pour les auberges et la population locale.",
            "providesTags": [
                "Bière"
            ],
            "requiresTags": {
                "Grain": {
                    "distance": 8
                }
            },
            "emplois": [
                {
                    "tier": 3,
                    "titre": "Brasseur",
                    "postes": 1,
                    "salaire": {
                        "totalEnCuivre": 82
                    },
                    "prerequis": {
                        "prestige": 100
                    },
                    "gainsMensuels": {
                        "prestige": 0.5,
                        "stats": {
                            "intelligence": 0.2,
                            "force": 0.2,
                            "constitution": 0.3,
                            "dexterite": 0.1,
                            "sagesse": 0.1,
                            "charisme": 0.2
                        }
                    },
                    "type": "mixte"
                },
                {
                    "tier": 4,
                    "titre": "Garçon de Brasserie",
                    "postes": 4,
                    "salaire": {
                        "totalEnCuivre": 50
                    },
                    "prerequis": {
                        "prestige": 2
                    },
                    "gainsMensuels": {
                        "prestige": 0.2,
                        "stats": {
                            "intelligence": 0.1,
                            "force": 0.2,
                            "constitution": 0.3,
                            "dexterite": 0.4,
                            "sagesse": 0.2,
                            "charisme": 0.1
                        }
                    },
                    "type": "mixte"
                }
            ]
        },
        "Fonderie de Métaux Précieux": {
            "description": "Purifie les minerais bruts pour en extraire des lingots d'or et d'argent purs.",
            "providesTags": [
                "Or Raffiné",
                "Argent Raffiné"
            ],
            "requiresTags": {
                "Or Brut": {
                    "distance": 8
                },
                "Argent Brut": {
                    "distance": 8
                },
                "Charbon": {
                    "distance": 8
                },
                "Savoir Alchimique": {
                    "distance": 5
                }
            },
            "emplois": [
                {
                    "tier": 3,
                    "titre": "Fondeur",
                    "postes": 1,
                    "salaire": {
                        "totalEnCuivre": 100
                    },
                    "prerequis": {
                        "prestige": 140
                    },
                    "gainsMensuels": {
                        "prestige": 0.6,
                        "stats": {
                            "intelligence": 0.2,
                            "force": 0.3,
                            "constitution": 0.3,
                            "dexterite": 0.2,
                            "sagesse": 0.2,
                            "charisme": 0.1
                        }
                    },
                    "type": "mixte"
                }
            ]
        },
        "Atelier du Lapidaire": {
            "description": "Un artisan aux doigts de fée qui taille les pierres précieuses brutes pour révéler tout leur éclat.",
            "providesTags": [
                "Pierres Taillées"
            ],
            "requiresTags": {
                "Gemmes Brutes": {
                    "distance": 10
                },
                "Outils Simples": {
                    "distance": 2
                }
            },
            "emplois": [
                {
                    "tier": 3,
                    "titre": "Lapidaire",
                    "postes": 1,
                    "salaire": {
                        "totalEnCuivre": 95
                    },
                    "prerequis": {
                        "prestige": 130
                    },
                    "gainsMensuels": {
                        "prestige": 0.6,
                        "stats": {
                            "intelligence": 0.2,
                            "force": 0.1,
                            "constitution": 0.1,
                            "dexterite": 0.4,
                            "sagesse": 0.1,
                            "charisme": 0.2
                        }
                    },
                    "type": "mixte"
                }
            ]
        },
        "Joaillerie": {
            "description": "Fabrique et vend des bijoux de qualité pour une clientèle aisée.",
            "providesTags": [
                "Bijoux"
            ],
            "requiresTags": {
                "Or Raffiné": {
                    "distance": 5
                },
                "Argent Raffiné": {
                    "distance": 5
                },
                "Pierres Taillées": {
                    "distance": 5
                }
            },
            "emplois": [
                {
                    "tier": 2,
                    "titre": "Joaillier",
                    "postes": 1,
                    "salaire": {
                        "totalEnCuivre": 110
                    },
                    "prerequis": {
                        "prestige": 160
                    },
                    "gainsMensuels": {
                        "prestige": 0.7,
                        "stats": {
                            "intelligence": 0.2,
                            "force": 0.1,
                            "constitution": 0.1,
                            "dexterite": 0.4,
                            "sagesse": 0.1,
                            "charisme": 0.2
                        }
                    },
                    "type": "mixte"
                },
                {
                    "tier": 4,
                    "titre": "Artisan Joaillier",
                    "postes": 3,
                    "salaire": {
                        "totalEnCuivre": 70
                    },
                    "prerequis": {
                        "prestige": 60
                    },
                    "gainsMensuels": {
                        "prestige": 0.3,
                        "stats": {
                            "intelligence": 0.2,
                            "force": 0.1,
                            "constitution": 0.2,
                            "dexterite": 0.3,
                            "sagesse": 0.1,
                            "charisme": 0.1
                        }
                    },
                    "type": "mixte"
                }
            ]
        },
        "Atelier de Tissage": {
            "description": "De grands métiers à tisser transforment la laine en rouleaux de tissu de qualité pour les tailleurs et les chantiers navals.",
            "providesTags": [
                "Tissu"
            ],
            "requiresTags": {
                "Laine": {
                    "distance": 10
                }
            },
            "emplois": [
                {
                    "tier": 3,
                    "titre": "Tisserand",
                    "postes": 2,
                    "salaire": {
                        "totalEnCuivre": 72
                    },
                    "prerequis": {
                        "prestige": 70
                    },
                    "gainsMensuels": {
                        "prestige": 0.3,
                        "stats": {
                            "intelligence": 0.1,
                            "force": 0.1,
                            "constitution": 0.2,
                            "dexterite": 0.4,
                            "sagesse": 0.2,
                            "charisme": 0.1
                        }
                    },
                    "type": "mixte"
                },
                {
                    "tier": 4,
                    "titre": "Ouvrier Tisserand",
                    "postes": 6,
                    "salaire": {
                        "totalEnCuivre": 50
                    },
                    "prerequis": {
                        "prestige": 20
                    },
                    "gainsMensuels": {
                        "prestige": 0.1,
                        "stats": {
                            "intelligence": 0.1,
                            "force": 0.2,
                            "constitution": 0.2,
                            "dexterite": 0.3,
                            "sagesse": 0.1,
                            "charisme": 0.1
                        }
                    },
                    "type": "mixte"
                }
            ]
        }
    },
    "Bâtiments Indépendants": {
        "Hôtel des Voyageurs": {
            "description": "Grande auberge de qualité offrant chambres privées, un restaurant et une écurie.",
            "providesTags": [],
            "requiresTags": {
                "Vin": {
                    "distance": 5
                },
                "Bière": {
                    "distance": 3
                },
                "Pain et Pâtisseries": {
                    "distance": 2
                },
                "Viande": {
                    "distance": 4
                },
                "Fromage": {
                    "distance": 6
                },
                "Hydromel": {
                    "distance": 4
                },
                "Fleurs": {
                    "distance": 3
                }
            },
            "emplois": [
                {
                    "tier": 2,
                    "titre": "Aubergiste",
                    "postes": 1,
                    "salaire": {
                        "totalEnCuivre": 98
                    },
                    "prerequis": {
                        "prestige": 130
                    },
                    "gainsMensuels": {
                        "prestige": 0.5,
                        "stats": {
                            "intelligence": 0.2,
                            "force": 0.2,
                            "constitution": 0.3,
                            "dexterite": 0.2,
                            "sagesse": 0.1,
                            "charisme": 0.2
                        }
                    },
                    "type": "mixte"
                },
                {
                    "tier": 4,
                    "titre": "Cuisinier",
                    "postes": 2,
                    "salaire": {
                        "totalEnCuivre": 60
                    },
                    "prerequis": {
                        "prestige": 40
                    },
                    "gainsMensuels": {
                        "prestige": 0.3,
                        "stats": {
                            "intelligence": 0.1,
                            "force": 0.2,
                            "constitution": 0.2,
                            "dexterite": 0.2,
                            "sagesse": 0.1,
                            "charisme": 0.1
                        }
                    },
                    "type": "mixte"
                }
            ]
        },
        "Laboratoire d'Alchimie": {
            "description": "Création de potions puissantes, de réactifs alchimiques et de transmutations mineures.",
            "providesTags": [
                "Potions Complexes"
            ],
            "requiresTags": {
                "Herbes Rares": {
                    "distance": 10
                },
                "Potions Simples": {
                    "distance": 2
                },
                "Champignons Rares": {
                    "distance": 10
                },
                "Livres": {
                    "distance": 3
                }
            },
            "emplois": [
                {
                    "tier": 2,
                    "titre": "Maître Alchimiste",
                    "postes": 1,
                    "salaire": {
                        "totalEnCuivre": 115
                    },
                    "prerequis": {
                        "prestige": 170
                    },
                    "gainsMensuels": {
                        "prestige": 0.7,
                        "stats": {
                            "intelligence": 0.3,
                            "force": 0.1,
                            "constitution": 0.2,
                            "dexterite": 0.2,
                            "sagesse": 0.3,
                            "charisme": 0.2
                        }
                    },
                    "type": "mixte"
                },
                {
                    "tier": 3,
                    "titre": "Assistant Alchimiste",
                    "postes": 2,
                    "salaire": {
                        "totalEnCuivre": 68
                    },
                    "prerequis": {
                        "prestige": 60
                    },
                    "gainsMensuels": {
                        "prestige": 0.3,
                        "stats": {
                            "intelligence": 0.3,
                            "force": 0.1,
                            "constitution": 0.1,
                            "dexterite": 0.2,
                            "sagesse": 0.2,
                            "charisme": 0.1
                        }
                    },
                    "type": "mixte"
                }
            ]
        },
        "Guilde des Marchands": {
            "description": "Centre pour le commerce, les contrats de caravanes et la finance.",
            "providesTags": [],
            "requiresTags": {},
            "emplois": [
                {
                    "tier": 2,
                    "titre": "Maître de Guilde Marchandes",
                    "postes": 1,
                    "salaire": {
                        "totalEnCuivre": 110
                    },
                    "prerequis": {
                        "prestige": 150
                    },
                    "gainsMensuels": {
                        "prestige": 0.6,
                        "stats": {
                            "intelligence": 0.3,
                            "force": 0.2,
                            "constitution": 0.3,
                            "dexterite": 0.1,
                            "sagesse": 0.2,
                            "charisme": 0.1
                        }
                    },
                    "type": "mixte"
                },
                {
                    "tier": 4,
                    "titre": "Marchand",
                    "postes": 5,
                    "salaire": {
                        "totalEnCuivre": 70
                    },
                    "prerequis": {
                        "prestige": 50
                    },
                    "gainsMensuels": {
                        "prestige": 0.3,
                        "stats": {
                            "intelligence": 0.2,
                            "force": 0.2,
                            "constitution": 0.2,
                            "dexterite": 0.1,
                            "sagesse": 0.2,
                            "charisme": 0.3
                        }
                    },
                    "type": "mixte"
                }
            ]
        },
        "Théâtre du Bourg": {
            "description": "Lieu de divertissement proposant des pièces, des concerts et des spectacles.",
            "providesTags": [],
            "requiresTags": {
                "Planches": {
                    "distance": 10
                },
                "Vêtements de Qualité": {
                    "distance": 5
                },
                "Fleurs": {
                    "distance": 5
                }
            },
            "emplois": [
                {
                    "tier": 3,
                    "titre": "Maître de Troupe",
                    "postes": 1,
                    "salaire": {
                        "totalEnCuivre": 85
                    },
                    "prerequis": {
                        "prestige": 100
                    },
                    "gainsMensuels": {
                        "prestige": 0.5,
                        "stats": {
                            "intelligence": 0.2,
                            "force": 0.1,
                            "constitution": 0.2,
                            "dexterite": 0.3,
                            "sagesse": 0.1,
                            "charisme": 0.2
                        }
                    },
                    "type": "mixte"
                },
                {
                    "tier": 4,
                    "titre": "Acteur",
                    "postes": 6,
                    "salaire": {
                        "totalEnCuivre": 58
                    },
                    "prerequis": {
                        "prestige": 40
                    },
                    "gainsMensuels": {
                        "prestige": 0.3,
                        "stats": {
                            "intelligence": 0.2,
                            "force": 0.1,
                            "constitution": 0.1,
                            "dexterite": 0.3,
                            "sagesse": 0.2,
                            "charisme": 0.2
                        }
                    },
                    "type": "mixte"
                }
            ]
        },
        "Bibliothèque & Scriptorium": {
            "description": "Un lieu de savoir où les scribes copient des manuscrits et où les érudits étudient.",
            "providesTags": [
                "Livres"
            ],
            "requiresTags": {
                "Cuir": {
                    "distance": 8
                },
                "Cire": {
                    "distance": 10
                }
            },
            "emplois": [
                {
                    "tier": 3,
                    "titre": "Bibliothécaire",
                    "postes": 1,
                    "salaire": {
                        "totalEnCuivre": 75
                    },
                    "prerequis": {
                        "prestige": 90
                    },
                    "gainsMensuels": {
                        "prestige": 0.4,
                        "stats": {
                            "intelligence": 0.4,
                            "force": 0.1,
                            "constitution": 0.2,
                            "dexterite": 0.2,
                            "sagesse": 0.3,
                            "charisme": 0.1
                        }
                    },
                    "type": "mixte"
                },
                {
                    "tier": 4,
                    "titre": "Scribe",
                    "postes": 3,
                    "salaire": {
                        "totalEnCuivre": 55
                    },
                    "prerequis": {
                        "prestige": 30
                    },
                    "gainsMensuels": {
                        "prestige": 0.2,
                        "stats": {
                            "intelligence": 0.3,
                            "force": 0.1,
                            "constitution": 0.2,
                            "dexterite": 0.2,
                            "sagesse": 0.3,
                            "charisme": 0.1
                        }
                    },
                    "type": "mixte"
                }
            ]
        }
    },
    "Bâtiments Agricoles": {
        "Domaines Agricoles": {
            "description": "Vastes exploitations agricoles gérées par des intendants, employant de nombreux ouvriers.",
            "providesTags": [
                "Grain",
                "Légumes"
            ],
            "emplois": [
                {
                    "tier": 3,
                    "titre": "Intendant de Domaine",
                    "postes": 3,
                    "salaire": {
                        "totalEnCuivre": 65
                    },
                    "prerequis": {
                        "prestige": 100
                    },
                    "gainsMensuels": {
                        "prestige": 0.5,
                        "stats": {
                            "intelligence": 0.2,
                            "force": 0.1,
                            "constitution": 0.2,
                            "dexterite": 0.3,
                            "sagesse": 0.1,
                            "charisme": 0.2
                        }
                    },
                    "type": "mixte"
                },
                {
                    "tier": 5,
                    "titre": "Ouvrier Agricole",
                    "postes": 15,
                    "salaire": {
                        "totalEnCuivre": 40
                    },
                    "prerequis": {
                        "prestige": 10
                    },
                    "gainsMensuels": {
                        "prestige": 0.2,
                        "stats": {
                            "intelligence": 0.1,
                            "force": 0.2,
                            "constitution": 0.3,
                            "dexterite": 0.2,
                            "sagesse": 0.1,
                            "charisme": 0.1
                        }
                    },
                    "type": "mixte"
                }
            ],
            "requiresTags": {}
        },
        "Vignobles": {
            "description": "Culture de la vigne sur les coteaux ensoleillés pour la production de raisin.",
            "providesTags": [
                "Raisins"
            ],
            "emplois": [
                {
                    "tier": 3,
                    "titre": "Vigneron",
                    "postes": 3,
                    "salaire": {
                        "totalEnCuivre": 62
                    },
                    "prerequis": {
                        "prestige": 90
                    },
                    "gainsMensuels": {
                        "prestige": 0.4,
                        "stats": {
                            "intelligence": 0.1,
                            "force": 0.1,
                            "constitution": 0.2,
                            "dexterite": 0.2,
                            "sagesse": 0.2,
                            "charisme": 0.2
                        }
                    },
                    "type": "mixte"
                },
                {
                    "tier": 5,
                    "titre": "Vendangeur",
                    "postes": 15,
                    "salaire": {
                        "totalEnCuivre": 35
                    },
                    "prerequis": {
                        "prestige": 0
                    },
                    "gainsMensuels": {
                        "prestige": 0.1,
                        "stats": {
                            "intelligence": 0.1,
                            "force": 0.2,
                            "constitution": 0.2,
                            "dexterite": 0.3,
                            "sagesse": 0.1,
                            "charisme": 0.1
                        }
                    },
                    "type": "mixte"
                }
            ],
            "requiresTags": {}
        },
        "Cave à Vin": {
            "description": "Un chai où les raisins sont pressés et le jus est fermenté pour produire du vin.",
            "providesTags": [
                "Vin"
            ],
            "requiresTags": {
                "Raisins": {
                    "distance": 2
                },
                "Planches": {
                    "distance": 10
                }
            },
            "emplois": [
                {
                    "tier": 3,
                    "titre": "Maître de Chai",
                    "postes": 1,
                    "salaire": {
                        "totalEnCuivre": 75
                    },
                    "prerequis": {
                        "prestige": 80
                    },
                    "gainsMensuels": {
                        "prestige": 0.4,
                        "stats": {
                            "intelligence": 0.2,
                            "force": 0.1,
                            "constitution": 0.2,
                            "dexterite": 0.3,
                            "sagesse": 0.1,
                            "charisme": 0.1
                        }
                    },
                    "type": "mixte"
                }
            ]
        },
        "Grands Ruchers": {
            "description": "Exploitation apicole produisant du miel, de l'hydromel et de la cire de haute qualité.",
            "providesTags": [
                "Hydromel",
                "Miel",
                "Cire"
            ],
            "emplois": [
                {
                    "tier": 3,
                    "titre": "Hydromellier",
                    "postes": 2,
                    "salaire": {
                        "totalEnCuivre": 70
                    },
                    "prerequis": {
                        "prestige": 100
                    },
                    "gainsMensuels": {
                        "prestige": 0.5,
                        "stats": {
                            "intelligence": 0.2,
                            "force": 0.1,
                            "constitution": 0.2,
                            "dexterite": 0.1,
                            "sagesse": 0.2,
                            "charisme": 0.1
                        }
                    },
                    "type": "mixte"
                },
                {
                    "tier": 4,
                    "titre": "Apiculteur",
                    "postes": 4,
                    "salaire": {
                        "totalEnCuivre": 50
                    },
                    "prerequis": {
                        "prestige": 30
                    },
                    "gainsMensuels": {
                        "prestige": 0.3,
                        "stats": {
                            "intelligence": 0.2,
                            "force": 0.1,
                            "constitution": 0.3,
                            "dexterite": 0.3,
                            "sagesse": 0.2,
                            "charisme": 0.2
                        }
                    },
                    "type": "mixte"
                }
            ],
            "requiresTags": {}
        },
        "Grand Moulin": {
            "description": "Grand moulin (à eau ou à vent) capable de traiter le grain de toute la région.",
            "providesTags": [
                "Farine"
            ],
            "requiresTags": {
                "Grain": {
                    "distance": 8
                }
            },
            "emplois": [
                {
                    "tier": 2,
                    "titre": "Meunier",
                    "postes": 1,
                    "salaire": {
                        "totalEnCuivre": 85
                    },
                    "prerequis": {
                        "prestige": 110
                    },
                    "gainsMensuels": {
                        "prestige": 0.5,
                        "stats": {
                            "intelligence": 0.2,
                            "force": 0.2,
                            "constitution": 0.3,
                            "dexterite": 0.2,
                            "sagesse": 0.1,
                            "charisme": 0.1
                        }
                    },
                    "type": "mixte"
                },
                {
                    "tier": 4,
                    "titre": "Ouvrier Meunier",
                    "postes": 4,
                    "salaire": {
                        "totalEnCuivre": 52
                    },
                    "prerequis": {
                        "prestige": 20
                    },
                    "gainsMensuels": {
                        "prestige": 0.2,
                        "stats": {
                            "intelligence": 0.1,
                            "force": 0.2,
                            "constitution": 0.2,
                            "dexterite": 0.3,
                            "sagesse": 0.1,
                            "charisme": 0.1
                        }
                    },
                    "type": "mixte"
                }
            ]
        },
        "Grand Domaine d'Élevage": {
            "description": "Élevage à grande échelle de chevaux, de bétail ou de moutons pour la vente.",
            "providesTags": [
                "Bétail",
                "Lait",
                "Laine",
                "Peaux Brutes"
            ],
            "emplois": [
                {
                    "tier": 3,
                    "titre": "Éleveur",
                    "postes": 2,
                    "salaire": {
                        "totalEnCuivre": 75
                    },
                    "prerequis": {
                        "prestige": 90
                    },
                    "gainsMensuels": {
                        "prestige": 0.4,
                        "stats": {
                            "intelligence": 0.2,
                            "force": 0.2,
                            "constitution": 0.3,
                            "dexterite": 0.2,
                            "sagesse": 0.1,
                            "charisme": 0.1
                        }
                    },
                    "type": "mixte"
                },
                {
                    "tier": 4,
                    "titre": "Palefrenier",
                    "postes": 8,
                    "salaire": {
                        "totalEnCuivre": 48
                    },
                    "prerequis": {
                        "prestige": 20
                    },
                    "gainsMensuels": {
                        "prestige": 0.2,
                        "stats": {
                            "intelligence": 0.1,
                            "force": 0.2,
                            "constitution": 0.2,
                            "dexterite": 0.2,
                            "sagesse": 0.1,
                            "charisme": 0.1
                        }
                    },
                    "type": "mixte"
                }
            ],
            "requiresTags": {}
        },
        "Boucherie du Bourg": {
            "description": "Un établissement bien équipé pour abattre le bétail et préparer la viande pour les auberges et les habitants.",
            "providesTags": [
                "Viande"
            ],
            "requiresTags": {
                "Bétail": {
                    "distance": 2
                }
            },
            "emplois": [
                {
                    "tier": 3,
                    "titre": "Boucher",
                    "postes": 2,
                    "salaire": {
                        "totalEnCuivre": 78
                    },
                    "prerequis": {
                        "prestige": 80
                    },
                    "gainsMensuels": {
                        "prestige": 0.4,
                        "stats": {
                            "intelligence": 0.1,
                            "force": 0.3,
                            "constitution": 0.2,
                            "dexterite": 0.3,
                            "sagesse": 0.1,
                            "charisme": 0.1
                        }
                    },
                    "type": "mixte"
                }
            ]
        },
        "Fromagerie": {
            "description": "Transformation du lait en une variété de fromages.",
            "providesTags": [
                "Fromage"
            ],
            "requiresTags": {
                "Lait": {
                    "distance": 3
                }
            },
            "emplois": [
                {
                    "tier": 3,
                    "titre": "Fromager",
                    "postes": 1,
                    "salaire": {
                        "totalEnCuivre": 68
                    },
                    "prerequis": {
                        "prestige": 80
                    },
                    "gainsMensuels": {
                        "prestige": 0.4,
                        "stats": {
                            "intelligence": 0.2,
                            "force": 0.1,
                            "constitution": 0.3,
                            "dexterite": 0.3,
                            "sagesse": 0.1,
                            "charisme": 0.2
                        }
                    },
                    "type": "mixte"
                },
                {
                    "tier": 4,
                    "titre": "Aide-Fromager",
                    "postes": 3,
                    "salaire": {
                        "totalEnCuivre": 45
                    },
                    "prerequis": {
                        "prestige": 20
                    },
                    "gainsMensuels": {
                        "prestige": 0.2,
                        "stats": {
                            "intelligence": 0.1,
                            "force": 0.2,
                            "constitution": 0.2,
                            "dexterite": 0.2,
                            "sagesse": 0.1,
                            "charisme": 0.1
                        }
                    },
                    "type": "mixte"
                }
            ]
        }
    },
    "Chasse/Nature": {
        "Guilde des Chasseurs": {
            "description": "Organisation qui gère les droits de chasse, propose des contrats et vend du gibier.",
            "providesTags": [
                "Gibier",
                "Fourrures"
            ],
            "requiresTags": {},
            "emplois": [
                {
                    "tier": 3,
                    "titre": "Maître de la Guilde des Chasseurs",
                    "postes": 1,
                    "salaire": {
                        "totalEnCuivre": 80
                    },
                    "prerequis": {
                        "prestige": 120
                    },
                    "gainsMensuels": {
                        "prestige": 0.5,
                        "stats": {
                            "intelligence": 0.2,
                            "force": 0.2,
                            "constitution": 0.3,
                            "dexterite": 0.4,
                            "sagesse": 0.2,
                            "charisme": 0.1
                        }
                    },
                    "type": "mixte"
                },
                {
                    "tier": 4,
                    "titre": "Chasseur",
                    "postes": 10,
                    "salaire": {
                        "totalEnCuivre": 55
                    },
                    "prerequis": {
                        "prestige": 50
                    },
                    "gainsMensuels": {
                        "prestige": 0.3,
                        "stats": {
                            "intelligence": 0.1,
                            "force": 0.1,
                            "constitution": 0.2,
                            "dexterite": 0.3,
                            "sagesse": 0.1,
                            "charisme": 0.1
                        }
                    },
                    "type": "mixte"
                }
            ]
        },
        "Port de Pêche": {
            "description": "Installations portuaires pour une flotte de bateaux de pêche, avec un marché aux poissons.",
            "providesTags": [
                "Poisson"
            ],
            "requiresTags": {
                "Navires": {
                    "distance": 1
                }
            },
            "emplois": [
                {
                    "tier": 3,
                    "titre": "Capitaine de Pêche",
                    "postes": 4,
                    "salaire": {
                        "totalEnCuivre": 65
                    },
                    "prerequis": {
                        "prestige": 9
                    },
                    "gainsMensuels": {
                        "prestige": 0.4,
                        "stats": {
                            "intelligence": 0.2,
                            "force": 0.1,
                            "constitution": 0.3,
                            "dexterite": 0.3,
                            "sagesse": 0.1,
                            "charisme": 0.1
                        }
                    },
                    "type": "mixte"
                },
                {
                    "tier": 5,
                    "titre": "Matelot-pêcheur",
                    "postes": 10,
                    "salaire": {
                        "totalEnCuivre": 40
                    },
                    "prerequis": {
                        "prestige": 20
                    },
                    "gainsMensuels": {
                        "prestige": 0.2,
                        "stats": {
                            "intelligence": 0.1,
                            "force": 0.2,
                            "constitution": 0.2,
                            "dexterite": 0.3,
                            "sagesse": 0.2,
                            "charisme": 0.1
                        }
                    },
                    "type": "mixte"
                }
            ]
        },
        "Tannerie": {
            "description": "Traitement des peaux brutes pour en faire du cuir de différentes qualités.",
            "providesTags": [
                "Cuir",
                "Fourrures Traitées"
            ],
            "requiresTags": {
                "Peaux Brutes": {
                    "distance": 5
                },
                "Fourrures": {
                    "distance": 6
                }
            },
            "emplois": [
                {
                    "tier": 3,
                    "titre": "Tanneur",
                    "postes": 2,
                    "salaire": {
                        "totalEnCuivre": 78
                    },
                    "prerequis": {
                        "prestige": 80
                    },
                    "gainsMensuels": {
                        "prestige": 0.4,
                        "stats": {
                            "intelligence": 0.1,
                            "force": 0.2,
                            "constitution": 0.2,
                            "dexterite": 0.3,
                            "sagesse": 0.1,
                            "charisme": 0.1
                        }
                    },
                    "type": "mixte"
                },
                {
                    "tier": 4,
                    "titre": "Ouvrier Tanneur",
                    "postes": 5,
                    "salaire": {
                        "totalEnCuivre": 45
                    },
                    "prerequis": {
                        "prestige": 10
                    },
                    "gainsMensuels": {
                        "prestige": 0.2,
                        "stats": {
                            "intelligence": 0.1,
                            "force": 0.2,
                            "constitution": 0.3,
                            "dexterite": 0.3,
                            "sagesse": 0.1,
                            "charisme": 0.1
                        }
                    },
                    "type": "mixte"
                }
            ]
        },
        "Serre Botanique": {
            "description": "Culture de plantes rares, d'herbes médicinales exotiques et de fleurs ornementales.",
            "providesTags": [
                "Herbes Rares",
                "Champignons Rares",
                "Fleurs"
            ],
            "emplois": [
                {
                    "tier": 3,
                    "titre": "Botaniste",
                    "postes": 2,
                    "salaire": {
                        "totalEnCuivre": 65
                    },
                    "prerequis": {
                        "prestige": 90
                    },
                    "gainsMensuels": {
                        "prestige": 0.4,
                        "stats": {
                            "intelligence": 0.1,
                            "force": 0.1,
                            "constitution": 0.3,
                            "dexterite": 0.3,
                            "sagesse": 0.1,
                            "charisme": 0.1
                        }
                    },
                    "type": "mixte"
                },
                {
                    "tier": 4,
                    "titre": "Jardinier",
                    "postes": 4,
                    "salaire": {
                        "totalEnCuivre": 42
                    },
                    "prerequis": {
                        "prestige": 30
                    },
                    "gainsMensuels": {
                        "prestige": 0.2,
                        "stats": {
                            "intelligence": 0.1,
                            "force": 0.1,
                            "constitution": 0.2,
                            "dexterite": 0.1,
                            "sagesse": 0.1,
                            "charisme": 0.1
                        }
                    },
                    "type": "mixte"
                }
            ],
            "requiresTags": {}
        },
        "Maîtrise des Eaux et Forêts": {
            "description": "Gestion durable des forêts, surveillance des terres sauvages et organisation de l'abattage.",
            "providesTags": [
                "Bois"
            ],
            "requiresTags": {
                "Administration": {
                    "distance": 2
                }
            },
            "emplois": [
                {
                    "tier": 3,
                    "titre": "Forestier",
                    "postes": 2,
                    "salaire": {
                        "totalEnCuivre": 72
                    },
                    "prerequis": {
                        "prestige": 100
                    },
                    "gainsMensuels": {
                        "prestige": 0.5,
                        "stats": {
                            "intelligence": 0.1,
                            "force": 0.3,
                            "constitution": 0.3,
                            "dexterite": 0.2,
                            "sagesse": 0.1,
                            "charisme": 0.1
                        }
                    },
                    "type": "mixte"
                },
                {
                    "tier": 4,
                    "titre": "Bûcheron",
                    "postes": 8,
                    "salaire": {
                        "totalEnCuivre": 50
                    },
                    "prerequis": {
                        "prestige": 30
                    },
                    "gainsMensuels": {
                        "prestige": 0.2,
                        "stats": {
                            "intelligence": 0.1,
                            "force": 0.4,
                            "constitution": 0.3,
                            "dexterite": 0.2,
                            "sagesse": 0.1,
                            "charisme": 0.1
                        }
                    },
                    "type": "mixte"
                }
            ]
        },
        "Mine de Métaux Précieux": {
            "description": "Une mine bien organisée pour extraire l'or, l'argent et les gemmes des profondeurs de la terre.",
            "providesTags": [
                "Or Brut",
                "Argent Brut",
                "Gemmes Brutes"
            ],
            "requiresTags": {
                "Planches": {
                    "distance": 10
                },
                "Outils Simples": {
                    "distance": 5
                }
            },
            "emplois": [
                {
                    "tier": 3,
                    "titre": "Mineur",
                    "postes": 1,
                    "salaire": {
                        "totalEnCuivre": 90
                    },
                    "prerequis": {
                        "prestige": 120
                    },
                    "gainsMensuels": {
                        "prestige": 0.5,
                        "stats": {
                            "intelligence": 0.1,
                            "force": 0.4,
                            "constitution": 0.4,
                            "dexterite": 0.3,
                            "sagesse": 0.2,
                            "charisme": 0.1
                        }
                    },
                    "type": "mixte"
                },
                {
                    "tier": 4,
                    "titre": "Mineur de Fond",
                    "postes": 8,
                    "salaire": {
                        "totalEnCuivre": 60
                    },
                    "prerequis": {
                        "prestige": 30
                    },
                    "gainsMensuels": {
                        "prestige": 0.2,
                        "stats": {
                            "intelligence": 0.1,
                            "force": 0.3,
                            "constitution": 0.3,
                            "dexterite": 0.3,
                            "sagesse": 0.1,
                            "charisme": 0.1
                        }
                    },
                    "type": "mixte"
                }
            ]
        }
    }
};

EcoSimData.buildings['Capitale'] = {
    "Bâtiments Administratifs": {
        "Palais Royal": {
            "description": "Le cœur du pouvoir, résidence du monarque et centre de l'administration suprême du royaume.",
            "providesTags": [
                "Administration Royale",
                "Haute Politique"
            ],
            "requiresTags": {
                "Sécurité Renforcée": {
                    "distance": 1
                },
                "Justice Suprême": {
                    "distance": 1
                },
                "Vêtements Royaux": {
                    "distance": 1
                },
                "Gastronomie de Luxe": {
                    "distance": 2
                },
                "Haute Médecine": {
                    "distance": 1
                },
                "Renseignement": {
                    "distance": 1
                },
                "Alcools Légendaires": {
                    "distance": 2
                },
                "Conseil Arcanique Royal": {
                    "distance": 1
                },
                "Divertissement de Prestige": {
                    "distance": 2
                },
                "Gestion de la Noblesse": {
                    "distance": 1
                },
                "Propagande": {
                    "distance": 2
                }
            },
            "emplois": [
                {
                    "tier": 0,
                    "titre": "Dirigeant",
                    "postes": 1,
                    "salaire": {
                        "totalEnCuivre": 2000
                    },
                    "prerequis": {
                        "prestige": 100
                    },
                    "gainsMensuels": {
                        "prestige": 1,
                        "stats": {
                            "intelligence": 1,
                            "force": 0.6,
                            "constitution": 0.6,
                            "dexterite": 0.6,
                            "sagesse": 1,
                            "charisme": 1
                        }
                    },
                    "type": "mixte"
                },
                {
                    "tier": 1,
                    "titre": "Conseiller Principal",
                    "postes": 1,
                    "salaire": {
                        "totalEnCuivre": 500
                    },
                    "prerequis": {
                        "prestige": 50
                    },
                    "gainsMensuels": {
                        "prestige": 0.8,
                        "stats": {
                            "intelligence": 1,
                            "force": 0.3,
                            "constitution": 0.5,
                            "dexterite": 0.5,
                            "sagesse": 1,
                            "charisme": 0.8
                        }
                    },
                    "type": "mixte"
                },
                {
                    "tier": 2,
                    "titre": "Chambellan Royal",
                    "postes": 1,
                    "salaire": {
                        "totalEnCuivre": 300
                    },
                    "prerequis": {
                        "prestige": 30
                    },
                    "gainsMensuels": {
                        "prestige": 0.5,
                        "stats": {
                            "intelligence": 0.8,
                            "force": 0.4,
                            "constitution": 0.5,
                            "dexterite": 0.6,
                            "sagesse": 0.8,
                            "charisme": 0.7
                        }
                    },
                    "type": "mixte"
                }
            ]
        },
        "Haute Cour de Justice": {
            "description": "Le tribunal suprême du royaume, où les lois sont interprétées et les cas les plus graves sont jugés.",
            "providesTags": [
                "Justice Suprême"
            ],
            "requiresTags": {
                "Administration Royale": {
                    "distance": 1
                },
                "Savoir Avancé": {
                    "distance": 2
                },
                "Lois Imprimées": {
                    "distance": 2
                },
                "Héraldique": {
                    "distance": 1
                }
            },
            "emplois": [
                {
                    "tier": 1,
                    "titre": "Juge Suprême",
                    "postes": 1,
                    "salaire": {
                        "totalEnCuivre": 600
                    },
                    "prerequis": {
                        "prestige": 60
                    },
                    "gainsMensuels": {
                        "prestige": 0.9,
                        "stats": {
                            "intelligence": 1,
                            "force": 0.2,
                            "constitution": 0.4,
                            "dexterite": 0.5,
                            "sagesse": 1,
                            "charisme": 0.6
                        }
                    },
                    "type": "mixte"
                },
                {
                    "tier": 2,
                    "titre": "Procureur Royal",
                    "postes": 2,
                    "salaire": {
                        "totalEnCuivre": 350
                    },
                    "prerequis": {
                        "prestige": 35
                    },
                    "gainsMensuels": {
                        "prestige": 0.6,
                        "stats": {
                            "intelligence": 0.9,
                            "force": 0.2,
                            "constitution": 0.4,
                            "dexterite": 0.6,
                            "sagesse": 0.8,
                            "charisme": 0.7
                        }
                    },
                    "type": "mixte"
                }
            ]
        },
        "Trésor Royal & Hôtel de la Monnaie": {
            "description": "Gère les finances du royaume, collecte les impôts centraux et frappe la monnaie officielle.",
            "providesTags": [
                "Finances Royales",
                "Frappe de Monnaie"
            ],
            "requiresTags": {
                "Administration Royale": {
                    "distance": 1
                },
                "Haute Finance": {
                    "distance": 1
                },
                "Or Raffiné": {
                    "distance": 10
                },
                "Argent Raffiné": {
                    "distance": 10
                }
            },
            "emplois": [
                {
                    "tier": 1,
                    "titre": "Grand Trésorier",
                    "postes": 1,
                    "salaire": {
                        "totalEnCuivre": 550
                    },
                    "prerequis": {
                        "prestige": 55
                    },
                    "gainsMensuels": {
                        "prestige": 0.8,
                        "stats": {
                            "intelligence": 1,
                            "force": 0.3,
                            "constitution": 0.4,
                            "dexterite": 0.6,
                            "sagesse": 0.9,
                            "charisme": 0.6
                        }
                    },
                    "type": "mixte"
                },
                {
                    "tier": 2,
                    "titre": "Maître de la Monnaie",
                    "postes": 1,
                    "salaire": {
                        "totalEnCuivre": 320
                    },
                    "prerequis": {
                        "prestige": 32
                    },
                    "gainsMensuels": {
                        "prestige": 0.5,
                        "stats": {
                            "intelligence": 0.8,
                            "force": 0.4,
                            "constitution": 0.5,
                            "dexterite": 0.7,
                            "sagesse": 0.6,
                            "charisme": 0.5
                        }
                    },
                    "type": "mixte"
                }
            ]
        },
        "État-Major Militaire": {
            "description": "Le quartier général de toutes les armées du royaume, où les grandes stratégies sont planifiées.",
            "providesTags": [
                "Commandement Militaire",
                "Sécurité Renforcée"
            ],
            "requiresTags": {
                "Administration Royale": {
                    "distance": 1
                },
                "Armement de Prestige": {
                    "distance": 2
                },
                "Navires de Guerre": {
                    "distance": 5
                },
                "Défense Magique": {
                    "distance": 2
                },
                "Renseignement": {
                    "distance": 1
                },
                "Réserve Stratégique": {
                    "distance": 1
                }
            },
            "emplois": [
                {
                    "tier": 1,
                    "titre": "Grand Maréchal",
                    "postes": 1,
                    "salaire": {
                        "totalEnCuivre": 650
                    },
                    "prerequis": {
                        "prestige": 65
                    },
                    "gainsMensuels": {
                        "prestige": 1,
                        "stats": {
                            "intelligence": 0.9,
                            "force": 0.8,
                            "constitution": 0.8,
                            "dexterite": 0.7,
                            "sagesse": 0.8,
                            "charisme": 1
                        }
                    },
                    "type": "mixte"
                },
                {
                    "tier": 2,
                    "titre": "Stratège Militaire",
                    "postes": 3,
                    "salaire": {
                        "totalEnCuivre": 380
                    },
                    "prerequis": {
                        "prestige": 38
                    },
                    "gainsMensuels": {
                        "prestige": 0.7,
                        "stats": {
                            "intelligence": 1,
                            "force": 0.5,
                            "constitution": 0.6,
                            "dexterite": 0.6,
                            "sagesse": 0.7,
                            "charisme": 0.6
                        }
                    },
                    "type": "mixte"
                }
            ]
        },
        "Ambassades": {
            "description": "Quartier diplomatique hébergeant les représentants des nations étrangères.",
            "providesTags": [
                "Diplomatie"
            ],
            "requiresTags": {
                "Administration Royale": {
                    "distance": 1
                },
                "Sécurité": {
                    "distance": 0
                },
                "Divertissement de Prestige": {
                    "distance": 2
                },
                "Contre-espionnage": {
                    "distance": 1
                },
                "Héraldique": {
                    "distance": 1
                }
            },
            "emplois": [
                {
                    "tier": 2,
                    "titre": "Ambassadeur",
                    "postes": 2,
                    "salaire": {
                        "totalEnCuivre": 400
                    },
                    "prerequis": {
                        "prestige": 40
                    },
                    "gainsMensuels": {
                        "prestige": 0.7,
                        "stats": {
                            "intelligence": 0.9,
                            "force": 0.3,
                            "constitution": 0.4,
                            "dexterite": 0.5,
                            "sagesse": 0.8,
                            "charisme": 0.9
                        }
                    },
                    "type": "mixte"
                },
                {
                    "tier": 3,
                    "titre": "Attaché Diplomatique",
                    "postes": 4,
                    "salaire": {
                        "totalEnCuivre": 250
                    },
                    "prerequis": {
                        "prestige": 25
                    },
                    "gainsMensuels": {
                        "prestige": 0.4,
                        "stats": {
                            "intelligence": 0.8,
                            "force": 0.2,
                            "constitution": 0.4,
                            "dexterite": 0.6,
                            "sagesse": 0.7,
                            "charisme": 0.8
                        }
                    },
                    "type": "mixte"
                }
            ]
        },
        "Bureau des Hérauts et de la Noblesse": {
            "description": "Archive les généalogies, enregistre les titres de noblesse et conçoit les armoiries des grandes familles du royaume.",
            "providesTags": [
                "Gestion de la Noblesse",
                "Héraldique"
            ],
            "requiresTags": {
                "Administration Royale": {
                    "distance": 1
                },
                "Savoir Universel": {
                    "distance": 2
                },
                "Livres": {
                    "distance": 3
                }
            },
            "emplois": [
                {
                    "tier": 2,
                    "titre": "Hérauts",
                    "postes": 1,
                    "salaire": {
                        "totalEnCuivre": 380
                    },
                    "prerequis": {
                        "prestige": 35
                    },
                    "gainsMensuels": {
                        "prestige": 0.6,
                        "stats": {
                            "intelligence": 0.9,
                            "force": 0.2,
                            "constitution": 0.4,
                            "dexterite": 0.6,
                            "sagesse": 0.8,
                            "charisme": 0.8
                        }
                    },
                    "type": "mixte"
                },
                {
                    "tier": 3,
                    "titre": "Héraut Généalogiste",
                    "postes": 2,
                    "salaire": {
                        "totalEnCuivre": 220
                    },
                    "prerequis": {
                        "prestige": 20
                    },
                    "gainsMensuels": {
                        "prestige": 0.4,
                        "stats": {
                            "intelligence": 0.8,
                            "force": 0.2,
                            "constitution": 0.4,
                            "dexterite": 0.6,
                            "sagesse": 0.7,
                            "charisme": 0.6
                        }
                    },
                    "type": "mixte"
                }
            ]
        },
        "Conseil Arcanique Royal": {
            "description": "Un conseil de mages puissants qui conseillent le monarque sur les menaces et les opportunités d'ordre magique.",
            "providesTags": [
                "Conseil Arcanique Royal",
                "Défense Magique"
            ],
            "requiresTags": {
                "Haute Politique": {
                    "distance": 1
                },
                "Savoir Arcanique": {
                    "distance": 1
                },
                "Savoir Interdit": {
                    "distance": 1
                },
                "Artefacts Magiques": {
                    "distance": 2
                },
                "Bêtes Magiques": {
                    "distance": 3
                },
                "Parchemins Puissants": {
                    "distance": 1
                }
            },
            "emplois": [
                {
                    "tier": 1,
                    "titre": "Archimage Conseiller",
                    "postes": 1,
                    "salaire": {
                        "totalEnCuivre": 620
                    },
                    "prerequis": {
                        "prestige": 60
                    },
                    "gainsMensuels": {
                        "prestige": 1,
                        "stats": {
                            "intelligence": 1,
                            "force": 0.2,
                            "constitution": 0.4,
                            "dexterite": 0.6,
                            "sagesse": 1,
                            "charisme": 0.8
                        }
                    },
                    "type": "mixte"
                },
                {
                    "tier": 2,
                    "titre": "Mage de Cour",
                    "postes": 4,
                    "salaire": {
                        "totalEnCuivre": 390
                    },
                    "prerequis": {
                        "prestige": 38
                    },
                    "gainsMensuels": {
                        "prestige": 0.7,
                        "stats": {
                            "intelligence": 1,
                            "force": 0.2,
                            "constitution": 0.4,
                            "dexterite": 0.6,
                            "sagesse": 0.9,
                            "charisme": 0.6
                        }
                    },
                    "type": "mixte"
                }
            ]
        }
    },
    "Bâtiments de Production": {
        "Manufacture Royale d'Armements": {
            "description": "Produit les meilleures armes et armures, souvent enchantées, pour l'élite du royaume.",
            "providesTags": [
                "Armement de Prestige"
            ],
            "requiresTags": {
                "Acier Spécial": {
                    "distance": 2
                },
                "Or Raffiné": {
                    "distance": 10
                },
                "Savoir Arcanique": {
                    "distance": 3
                }
            },
            "emplois": [
                {
                    "tier": 1,
                    "titre": "Maître Arcaniste-Forgeron",
                    "postes": 1,
                    "salaire": {
                        "totalEnCuivre": 450
                    },
                    "prerequis": {
                        "prestige": 45
                    },
                    "gainsMensuels": {
                        "prestige": 0.8,
                        "stats": {
                            "intelligence": 0.9,
                            "force": 0.8,
                            "constitution": 0.7,
                            "dexterite": 0.7,
                            "sagesse": 0.8,
                            "charisme": 0.6
                        }
                    },
                    "type": "mixte"
                },
                {
                    "tier": 3,
                    "titre": "Artisan d'Élite",
                    "postes": 5,
                    "salaire": {
                        "totalEnCuivre": 200
                    },
                    "prerequis": {
                        "prestige": 15
                    },
                    "gainsMensuels": {
                        "prestige": 0.3,
                        "stats": {
                            "intelligence": 0.5,
                            "force": 0.7,
                            "constitution": 0.7,
                            "dexterite": 0.8,
                            "sagesse": 0.5,
                            "charisme": 0.4
                        }
                    },
                    "type": "mixte"
                }
            ]
        },
        "Ateliers de Haute Orfèvrerie": {
            "description": "Crée des bijoux et objets d'art d'une valeur inestimable pour la royauté et la noblesse.",
            "providesTags": [
                "Maîtrise d'Orfèvrerie",
                "Bijoux de Luxe"
            ],
            "requiresTags": {
                "Or Raffiné": {
                    "distance": 5
                },
                "Argent Raffiné": {
                    "distance": 5
                },
                "Pierres Taillées": {
                    "distance": 5
                },
                "Savoir Alchimique": {
                    "distance": 3
                }
            },
            "emplois": [
                {
                    "tier": 1,
                    "titre": "Maître Orfèvre Royal",
                    "postes": 1,
                    "salaire": {
                        "totalEnCuivre": 480
                    },
                    "prerequis": {
                        "prestige": 48
                    },
                    "gainsMensuels": {
                        "prestige": 0.8,
                        "stats": {
                            "intelligence": 0.8,
                            "force": 0.2,
                            "constitution": 0.4,
                            "dexterite": 1,
                            "sagesse": 0.8,
                            "charisme": 0.8
                        }
                    },
                    "type": "mixte"
                },
                {
                    "tier": 3,
                    "titre": "Compagnon Orfèvre",
                    "postes": 4,
                    "salaire": {
                        "totalEnCuivre": 220
                    },
                    "prerequis": {
                        "prestige": 18
                    },
                    "gainsMensuels": {
                        "prestige": 0.4,
                        "stats": {
                            "intelligence": 0.6,
                            "force": 0.2,
                            "constitution": 0.4,
                            "dexterite": 0.9,
                            "sagesse": 0.6,
                            "charisme": 0.7
                        }
                    },
                    "type": "mixte"
                }
            ]
        },
        "Fonderie d'Acier Spécial": {
            "description": "Produit des alliages de métaux rares et résistants pour les constructions stratégiques et l'armement.",
            "providesTags": [
                "Acier Spécial"
            ],
            "requiresTags": {
                "Minerai de Fer": {
                    "distance": 25
                },
                "Charbon": {
                    "distance": 25
                },
                "Savoir Alchimique": {
                    "distance": 5
                }
            },
            "emplois": [
                {
                    "tier": 2,
                    "titre": "Maître Fondeur",
                    "postes": 2,
                    "salaire": {
                        "totalEnCuivre": 300
                    },
                    "prerequis": {
                        "prestige": 25
                    },
                    "gainsMensuels": {
                        "prestige": 0.5,
                        "stats": {
                            "intelligence": 0.6,
                            "force": 0.8,
                            "constitution": 0.8,
                            "dexterite": 0.5,
                            "sagesse": 0.6,
                            "charisme": 0.5
                        }
                    },
                    "type": "mixte"
                },
                {
                    "tier": 4,
                    "titre": "Ouvrier Spécialisé",
                    "postes": 5,
                    "salaire": {
                        "totalEnCuivre": 150
                    },
                    "prerequis": {
                        "prestige": 8
                    },
                    "gainsMensuels": {
                        "prestige": 0.2,
                        "stats": {
                            "intelligence": 0.3,
                            "force": 0.8,
                            "constitution": 0.8,
                            "dexterite": 0.4,
                            "sagesse": 0.4,
                            "charisme": 0.3
                        }
                    },
                    "type": "mixte"
                }
            ]
        },
        "Imprimerie Royale": {
            "description": "Imprime les édits royaux, les livres officiels et la propagande du royaume.",
            "providesTags": [
                "Propagande",
                "Livres",
                "Lois Imprimées"
            ],
            "requiresTags": {
                "Papier": {
                    "distance": 5
                },
                "Encre": {
                    "distance": 5
                },
                "Savoir Avancé": {
                    "distance": 1
                }
            },
            "emplois": [
                {
                    "tier": 2,
                    "titre": "Maître Imprimeur Royal",
                    "postes": 1,
                    "salaire": {
                        "totalEnCuivre": 280
                    },
                    "prerequis": {
                        "prestige": 28
                    },
                    "gainsMensuels": {
                        "prestige": 0.5,
                        "stats": {
                            "intelligence": 0.9,
                            "force": 0.4,
                            "constitution": 0.6,
                            "dexterite": 0.7,
                            "sagesse": 0.7,
                            "charisme": 0.6
                        }
                    },
                    "type": "mixte"
                },
                {
                    "tier": 3,
                    "titre": "Compositeur-Typographe",
                    "postes": 4,
                    "salaire": {
                        "totalEnCuivre": 160
                    },
                    "prerequis": {
                        "prestige": 12
                    },
                    "gainsMensuels": {
                        "prestige": 0.3,
                        "stats": {
                            "intelligence": 0.6,
                            "force": 0.3,
                            "constitution": 0.4,
                            "dexterite": 0.8,
                            "sagesse": 0.5,
                            "charisme": 0.4
                        }
                    },
                    "type": "mixte"
                }
            ]
        },
        "Atelier des Artefacts Magiques": {
            "description": "Un lieu secret où les plus grands artisans et mages collaborent pour créer des objets magiques d'une puissance légendaire.",
            "providesTags": [
                "Artefacts Magiques",
                "Parchemins Puissants"
            ],
            "requiresTags": {
                "Savoir Arcanique": {
                    "distance": 1
                },
                "Maîtrise d'Orfèvrerie": {
                    "distance": 2
                },
                "Pierres Taillées": {
                    "distance": 8
                },
                "Recherche Fondamentale": {
                    "distance": 1
                }
            },
            "emplois": [
                {
                    "tier": 1,
                    "titre": "Maître Artificier",
                    "postes": 2,
                    "salaire": {
                        "totalEnCuivre": 650
                    },
                    "prerequis": {
                        "prestige": 65
                    },
                    "gainsMensuels": {
                        "prestige": 1,
                        "stats": {
                            "intelligence": 1,
                            "force": 0.3,
                            "constitution": 0.5,
                            "dexterite": 0.9,
                            "sagesse": 1,
                            "charisme": 0.7
                        }
                    },
                    "type": "mixte"
                },
                {
                    "tier": 2,
                    "titre": "Enchanteur",
                    "postes": 2,
                    "salaire": {
                        "totalEnCuivre": 400
                    },
                    "prerequis": {
                        "prestige": 40
                    },
                    "gainsMensuels": {
                        "prestige": 0.7,
                        "stats": {
                            "intelligence": 1,
                            "force": 0.2,
                            "constitution": 0.4,
                            "dexterite": 0.8,
                            "sagesse": 0.9,
                            "charisme": 0.6
                        }
                    },
                    "type": "mixte"
                }
            ]
        },
        "Manufacture de Vêtements de Cour": {
            "description": "L'atelier de mode le plus prestigieux, créant des tenues extravagantes qui définissent le style de la noblesse du royaume.",
            "providesTags": [
                "Vêtements Royaux"
            ],
            "requiresTags": {
                "Vêtements de Luxe": {
                    "distance": 5
                },
                "Bijoux de Luxe": {
                    "distance": 5
                },
                "Tissu": {
                    "distance": 20
                }
            },
            "emplois": [
                {
                    "tier": 2,
                    "titre": "Grand Couturier de la Cour",
                    "postes": 1,
                    "salaire": {
                        "totalEnCuivre": 350
                    },
                    "prerequis": {
                        "prestige": 34
                    },
                    "gainsMensuels": {
                        "prestige": 0.6,
                        "stats": {
                            "intelligence": 0.8,
                            "force": 0.2,
                            "constitution": 0.4,
                            "dexterite": 1,
                            "sagesse": 0.7,
                            "charisme": 1
                        }
                    },
                    "type": "mixte"
                },
                {
                    "tier": 3,
                    "titre": "Brodeur d'Or",
                    "postes": 4,
                    "salaire": {
                        "totalEnCuivre": 210
                    },
                    "prerequis": {
                        "prestige": 18
                    },
                    "gainsMensuels": {
                        "prestige": 0.3,
                        "stats": {
                            "intelligence": 0.6,
                            "force": 0.2,
                            "constitution": 0.4,
                            "dexterite": 0.9,
                            "sagesse": 0.6,
                            "charisme": 0.6
                        }
                    },
                    "type": "mixte"
                }
            ]
        }
    },
    "Bâtiments Indépendants": {
        "Grande Bibliothèque Royale": {
            "description": "Le plus grand dépôt de savoir du royaume, contenant des textes anciens, rares et interdits.",
            "providesTags": [
                "Savoir Universel",
                "Savoir Interdit",
                "Manuscrit"
            ],
            "requiresTags": {
                "Livres": {
                    "distance": 2
                },
                "Savoir Avancé": {
                    "distance": 1
                },
                "Savoir Arcanique": {
                    "distance": 1
                },
                "Artefacts Rares": {
                    "distance": 5
                }
            },
            "emplois": [
                {
                    "tier": 1,
                    "titre": "Archiviste Royal",
                    "postes": 1,
                    "salaire": {
                        "totalEnCuivre": 520
                    },
                    "prerequis": {
                        "prestige": 52
                    },
                    "gainsMensuels": {
                        "prestige": 0.9,
                        "stats": {
                            "intelligence": 1,
                            "force": 0.2,
                            "constitution": 0.4,
                            "dexterite": 0.5,
                            "sagesse": 1,
                            "charisme": 0.7
                        }
                    },
                    "type": "mixte"
                },
                {
                    "tier": 2,
                    "titre": "Maître-Savant",
                    "postes": 4,
                    "salaire": {
                        "totalEnCuivre": 290
                    },
                    "prerequis": {
                        "prestige": 29
                    },
                    "gainsMensuels": {
                        "prestige": 0.5,
                        "stats": {
                            "intelligence": 0.9,
                            "force": 0.1,
                            "constitution": 0.3,
                            "dexterite": 0.4,
                            "sagesse": 0.9,
                            "charisme": 0.6
                        }
                    },
                    "type": "mixte"
                }
            ]
        },
        "Opéra Impérial": {
            "description": "Le summum de l'art et de la culture, accueillant les spectacles les plus grandioses pour l'élite.",
            "providesTags": [
                "Divertissement de Prestige"
            ],
            "requiresTags": {
                "Administration Royale": {
                    "distance": 2
                },
                "Vêtements de Luxe": {
                    "distance": 3
                },
                "Maîtrise d'Orfèvrerie": {
                    "distance": 5
                }
            },
            "emplois": [
                {
                    "tier": 2,
                    "titre": "Intendant de l'Opéra",
                    "postes": 1,
                    "salaire": {
                        "totalEnCuivre": 310
                    },
                    "prerequis": {
                        "prestige": 31
                    },
                    "gainsMensuels": {
                        "prestige": 0.5,
                        "stats": {
                            "intelligence": 0.7,
                            "force": 0.3,
                            "constitution": 0.4,
                            "dexterite": 0.6,
                            "sagesse": 0.7,
                            "charisme": 1
                        }
                    },
                    "type": "mixte"
                },
                {
                    "tier": 3,
                    "titre": "Diva / Primo Uomo",
                    "postes": 4,
                    "salaire": {
                        "totalEnCuivre": 240
                    },
                    "prerequis": {
                        "prestige": 24
                    },
                    "gainsMensuels": {
                        "prestige": 0.4,
                        "stats": {
                            "intelligence": 0.5,
                            "force": 0.4,
                            "constitution": 0.6,
                            "dexterite": 0.7,
                            "sagesse": 0.5,
                            "charisme": 1
                        }
                    },
                    "type": "mixte"
                }
            ]
        },
        "Académie Royale des Sciences et des Arts": {
            "description": "Finance et dirige la recherche fondamentale, les inventions et les grandes explorations.",
            "providesTags": [
                "Recherche Fondamentale",
                "Savoir Avancé",
                "Savoir Alchimique"
            ],
            "requiresTags": {
                "Savoir Universel": {
                    "distance": 1
                },
                "Finances Royales": {
                    "distance": 1
                },
                "Savoir Arcanique": {
                    "distance": 2
                }
            },
            "emplois": [
                {
                    "tier": 1,
                    "titre": "Archisavant",
                    "postes": 1,
                    "salaire": {
                        "totalEnCuivre": 580
                    },
                    "prerequis": {
                        "prestige": 58
                    },
                    "gainsMensuels": {
                        "prestige": 0.9,
                        "stats": {
                            "intelligence": 1,
                            "force": 0.2,
                            "constitution": 0.4,
                            "dexterite": 0.6,
                            "sagesse": 1,
                            "charisme": 0.6
                        }
                    },
                    "type": "mixte"
                },
                {
                    "tier": 2,
                    "titre": "Inventeur",
                    "postes": 4,
                    "salaire": {
                        "totalEnCuivre": 330
                    },
                    "prerequis": {
                        "prestige": 33
                    },
                    "gainsMensuels": {
                        "prestige": 0.6,
                        "stats": {
                            "intelligence": 1,
                            "force": 0.5,
                            "constitution": 0.6,
                            "dexterite": 0.8,
                            "sagesse": 0.8,
                            "charisme": 0.7
                        }
                    },
                    "type": "mixte"
                }
            ]
        },
        "Guilde des Banquiers": {
            "description": "Le cœur financier du royaume, gérant les dettes, les investissements et les fortunes des plus puissants.",
            "providesTags": [
                "Haute Finance"
            ],
            "requiresTags": {
                "Finances Royales": {
                    "distance": 1
                },
                "Justice Suprême": {
                    "distance": 2
                },
                "Commerce Maritime": {
                    "distance": 10
                },
                "Frappe de Monnaie": {
                    "distance": 2
                },
                "Bourse": {
                    "distance": 1
                },
                "Investissement Spéculatif": {
                    "distance": 1
                }
            },
            "emplois": [
                {
                    "tier": 1,
                    "titre": "Grand Banquier",
                    "postes": 1,
                    "salaire": {
                        "totalEnCuivre": 700
                    },
                    "prerequis": {
                        "prestige": 70
                    },
                    "gainsMensuels": {
                        "prestige": 1,
                        "stats": {
                            "intelligence": 0.9,
                            "force": 0.3,
                            "constitution": 0.5,
                            "dexterite": 0.6,
                            "sagesse": 0.9,
                            "charisme": 1
                        }
                    },
                    "type": "mixte"
                },
                {
                    "tier": 2,
                    "titre": "Financier",
                    "postes": 4,
                    "salaire": {
                        "totalEnCuivre": 400
                    },
                    "prerequis": {
                        "prestige": 40
                    },
                    "gainsMensuels": {
                        "prestige": 0.7,
                        "stats": {
                            "intelligence": 0.9,
                            "force": 0.2,
                            "constitution": 0.4,
                            "dexterite": 0.5,
                            "sagesse": 0.8,
                            "charisme": 0.8
                        }
                    },
                    "type": "mixte"
                }
            ]
        },
        "Bourse Royale": {
            "description": "Une institution financière où les actions des plus grandes guildes, compagnies marchandes et expéditions sont échangées.",
            "providesTags": [
                "Bourse",
                "Investissement Spéculatif"
            ],
            "requiresTags": {
                "Haute Finance": {
                    "distance": 1
                },
                "Commerce Maritime": {
                    "distance": 10
                },
                "Exploration": {
                    "distance": 2
                }
            },
            "emplois": [
                {
                    "tier": 1,
                    "titre": "Gouverneur de la Bourse",
                    "postes": 1,
                    "salaire": {
                        "totalEnCuivre": 750
                    },
                    "prerequis": {
                        "prestige": 75
                    },
                    "gainsMensuels": {
                        "prestige": 1,
                        "stats": {
                            "intelligence": 1,
                            "force": 0.3,
                            "constitution": 0.5,
                            "dexterite": 0.6,
                            "sagesse": 0.9,
                            "charisme": 1
                        }
                    },
                    "type": "mixte"
                },
                {
                    "tier": 2,
                    "titre": "Grand Courtier",
                    "postes": 4,
                    "salaire": {
                        "totalEnCuivre": 450
                    },
                    "prerequis": {
                        "prestige": 45
                    },
                    "gainsMensuels": {
                        "prestige": 0.8,
                        "stats": {
                            "intelligence": 0.9,
                            "force": 0.2,
                            "constitution": 0.4,
                            "dexterite": 0.6,
                            "sagesse": 0.9,
                            "charisme": 0.9
                        }
                    },
                    "type": "mixte"
                }
            ]
        },
        "Collège de Médecine Royal": {
            "description": "L'institution médicale la plus avancée, formant les meilleurs médecins et chirurgiens, et menant des recherches sur les maladies rares.",
            "providesTags": [
                "Haute Médecine"
            ],
            "requiresTags": {
                "Savoir Avancé": {
                    "distance": 1
                },
                "Soins Médicaux": {
                    "distance": 1
                },
                "Potions Complexes": {
                    "distance": 5
                },
                "Recherche Médicale": {
                    "distance": 0
                }
            },
            "emplois": [
                {
                    "tier": 1,
                    "titre": "Médecin Royal",
                    "postes": 1,
                    "salaire": {
                        "totalEnCuivre": 550
                    },
                    "prerequis": {
                        "prestige": 55
                    },
                    "gainsMensuels": {
                        "prestige": 0.9,
                        "stats": {
                            "intelligence": 1,
                            "force": 0.2,
                            "constitution": 0.4,
                            "dexterite": 0.8,
                            "sagesse": 1,
                            "charisme": 0.6
                        }
                    },
                    "type": "mixte"
                },
                {
                    "tier": 2,
                    "titre": "Chirurgien-Maître",
                    "postes": 3,
                    "salaire": {
                        "totalEnCuivre": 370
                    },
                    "prerequis": {
                        "prestige": 37
                    },
                    "gainsMensuels": {
                        "prestige": 0.6,
                        "stats": {
                            "intelligence": 0.9,
                            "force": 0.4,
                            "constitution": 0.5,
                            "dexterite": 1,
                            "sagesse": 0.9,
                            "charisme": 0.5
                        }
                    },
                    "type": "mixte"
                }
            ]
        },
        "Guilde des Cartographes et Astronomes": {
            "description": "Produit les cartes du monde connu et des cieux les plus précises, et fabrique des instruments de navigation de pointe.",
            "providesTags": [
                "Cartographie de Précision",
                "Navigation Astronomique"
            ],
            "requiresTags": {
                "Savoir Astronomique": {
                    "distance": 1
                },
                "Équipement d'Optique": {
                    "distance": 5
                },
                "Exploration": {
                    "distance": 1
                }
            },
            "emplois": [
                {
                    "tier": 2,
                    "titre": "Maître Cartographe Royal",
                    "postes": 1,
                    "salaire": {
                        "totalEnCuivre": 360
                    },
                    "prerequis": {
                        "prestige": 36
                    },
                    "gainsMensuels": {
                        "prestige": 0.6,
                        "stats": {
                            "intelligence": 1,
                            "force": 0.2,
                            "constitution": 0.4,
                            "dexterite": 0.9,
                            "sagesse": 0.9,
                            "charisme": 0.6
                        }
                    },
                    "type": "mixte"
                },
                {
                    "tier": 3,
                    "titre": "Astronome Émérite",
                    "postes": 2,
                    "salaire": {
                        "totalEnCuivre": 230
                    },
                    "prerequis": {
                        "prestige": 22
                    },
                    "gainsMensuels": {
                        "prestige": 0.4,
                        "stats": {
                            "intelligence": 0.9,
                            "force": 0.1,
                            "constitution": 0.3,
                            "dexterite": 0.7,
                            "sagesse": 1,
                            "charisme": 0.4
                        }
                    },
                    "type": "mixte"
                }
            ]
        }
    },
    "Bâtiments Agricoles & Alimentaires": {
        "Entrepôts Royaux": {
            "description": "Vastes entrepôts sécurisés sur les quais, recevant les biens de tout le royaume et d'au-delà.",
            "providesTags": [
                "Vin",
                "Vêtements de Luxe",
                "Or Raffiné",
                "Argent Raffiné",
                "Pierres Taillées",
                "Tissu",
                "Papier",
                "Encre",
                "Verre",
                "Potions Complexes",
                "Savoir Alchimique",
                "Soins Médicaux",
                "Savoir Astronomique",
                "Acier Spécial",
                "Alcools Fins",
                "Minerai de Fer",
                "Charbon",
                "Contrats",
                "Sécurité",
                "Justice",
                "Vêtements de Qualité",
                "Pièces Métalliques",
                "Planches",
                "Cuir",
                "Fourrures Traitées",
                "Savoir Écrit",
                "Commerce",
                "Grain",
                "Viande",
                "Poisson",
                "Légumes",
                "Fruits",
                "Fromage",
                "Herbes Communes",
                "Recherche Médicale"
            ],
            "requiresTags": {
                "Commerce Maritime": {
                    "distance": 0
                },
                "Sécurité Renforcée": {
                    "distance": 1
                }
            },
            "emplois": [
                {
                    "tier": 2,
                    "titre": "Maître des Docks",
                    "postes": 1,
                    "salaire": {
                        "totalEnCuivre": 250
                    },
                    "prerequis": {
                        "prestige": 25
                    },
                    "gainsMensuels": {
                        "prestige": 0.6,
                        "stats": {
                            "intelligence": 0.7,
                            "force": 0.7,
                            "constitution": 0.7,
                            "dexterite": 0.6,
                            "sagesse": 0.7,
                            "charisme": 0.7
                        }
                    },
                    "type": "mixte"
                }
            ]
        },
        "Greniers Royaux": {
            "description": "D'immenses entrepôts stockant des réserves stratégiques de nourriture pour la capitale.",
            "providesTags": [
                "Réserve Stratégique",
                "Gestion des Vivres"
            ],
            "requiresTags": {
                "Administration Royale": {
                    "distance": 1
                },
                "Grain": {
                    "distance": 30
                },
                "Viande": {
                    "distance": 30
                }
            },
            "emplois": [
                {
                    "tier": 2,
                    "titre": "Intendant des Greniers",
                    "postes": 2,
                    "salaire": {
                        "totalEnCuivre": 260
                    },
                    "prerequis": {
                        "prestige": 26
                    },
                    "gainsMensuels": {
                        "prestige": 0.4,
                        "stats": {
                            "intelligence": 0.8,
                            "force": 0.5,
                            "constitution": 0.6,
                            "dexterite": 0.6,
                            "sagesse": 0.7,
                            "charisme": 0.6
                        }
                    },
                    "type": "mixte"
                },
                {
                    "tier": 4,
                    "titre": "Gestionnaire des Stocks",
                    "postes": 4,
                    "salaire": {
                        "totalEnCuivre": 140
                    },
                    "prerequis": {
                        "prestige": 10
                    },
                    "gainsMensuels": {
                        "prestige": 0.2,
                        "stats": {
                            "intelligence": 0.6,
                            "force": 0.6,
                            "constitution": 0.7,
                            "dexterite": 0.6,
                            "sagesse": 0.5,
                            "charisme": 0.4
                        }
                    },
                    "type": "mixte"
                }
            ]
        },
        "Cuisines Royales": {
            "description": "Un complexe culinaire préparant des festins extravagants pour la cour.",
            "providesTags": [
                "Gastronomie de Luxe"
            ],
            "requiresTags": {
                "Viande": {
                    "distance": 15
                },
                "Fruits Exotiques": {
                    "distance": 2
                },
                "Vin": {
                    "distance": 15
                },
                "Alcools Fins": {
                    "distance": 10
                },
                "Herbes Rares": {
                    "distance": 10
                },
                "Fleurs Rares": {
                    "distance": 3
                }
            },
            "emplois": [
                {
                    "tier": 2,
                    "titre": "Chef des Cuisines Royales",
                    "postes": 1,
                    "salaire": {
                        "totalEnCuivre": 290
                    },
                    "prerequis": {
                        "prestige": 29
                    },
                    "gainsMensuels": {
                        "prestige": 0.5,
                        "stats": {
                            "intelligence": 0.6,
                            "force": 0.4,
                            "constitution": 0.6,
                            "dexterite": 0.9,
                            "sagesse": 0.8,
                            "charisme": 0.7
                        }
                    },
                    "type": "mixte"
                },
                {
                    "tier": 3,
                    "titre": "Maître queux",
                    "postes": 2,
                    "salaire": {
                        "totalEnCuivre": 180
                    },
                    "prerequis": {
                        "prestige": 14
                    },
                    "gainsMensuels": {
                        "prestige": 0.3,
                        "stats": {
                            "intelligence": 0.5,
                            "force": 0.4,
                            "constitution": 0.5,
                            "dexterite": 0.8,
                            "sagesse": 0.7,
                            "charisme": 0.6
                        }
                    },
                    "type": "mixte"
                }
            ]
        },
        "Jardins Suspendus": {
            "description": "Merveille architecturale et botanique, produisant des fleurs et fruits exotiques pour le plaisir de la cour.",
            "providesTags": [
                "Fleurs Rares",
                "Fruits Exotiques"
            ],
            "requiresTags": {
                "Savoir Avancé": {
                    "distance": 2
                },
                "Pierre Taillée": {
                    "distance": 10
                }
            },
            "emplois": [
                {
                    "tier": 2,
                    "titre": "Maître Botaniste Royal",
                    "postes": 2,
                    "salaire": {
                        "totalEnCuivre": 270
                    },
                    "prerequis": {
                        "prestige": 27
                    },
                    "gainsMensuels": {
                        "prestige": 0.5,
                        "stats": {
                            "intelligence": 0.9,
                            "force": 0.3,
                            "constitution": 0.5,
                            "dexterite": 0.6,
                            "sagesse": 0.9,
                            "charisme": 0.5
                        }
                    },
                    "type": "mixte"
                },
                {
                    "tier": 4,
                    "titre": "Horticulteur Exotique",
                    "postes": 2,
                    "salaire": {
                        "totalEnCuivre": 150
                    },
                    "prerequis": {
                        "prestige": 9
                    },
                    "gainsMensuels": {
                        "prestige": 0.2,
                        "stats": {
                            "intelligence": 0.6,
                            "force": 0.2,
                            "constitution": 0.4,
                            "dexterite": 0.6,
                            "sagesse": 0.8,
                            "charisme": 0.4
                        }
                    },
                    "type": "mixte"
                }
            ]
        },
        "Caves de Maturation d'Alcools Rares": {
            "description": "Des caves souterraines où les meilleurs vins et spiritueux du royaume vieillissent pendant des décennies pour atteindre une qualité inégalée.",
            "providesTags": [
                "Alcools Légendaires"
            ],
            "requiresTags": {
                "Alcools Fins": {
                    "distance": 10
                },
                "Vin": {
                    "distance": 20
                },
                "Verrerie d'Art": {
                    "distance": 8
                }
            },
            "emplois": [
                {
                    "tier": 2,
                    "titre": "Maître de Chai Royal",
                    "postes": 2,
                    "salaire": {
                        "totalEnCuivre": 320
                    },
                    "prerequis": {
                        "prestige": 30
                    },
                    "gainsMensuels": {
                        "prestige": 0.5,
                        "stats": {
                            "intelligence": 0.7,
                            "force": 0.4,
                            "constitution": 0.6,
                            "dexterite": 0.6,
                            "sagesse": 1,
                            "charisme": 0.8
                        }
                    },
                    "type": "mixte"
                },
                {
                    "tier": 4,
                    "titre": "Sommelier de la Cour",
                    "postes": 2,
                    "salaire": {
                        "totalEnCuivre": 190
                    },
                    "prerequis": {
                        "prestige": 15
                    },
                    "gainsMensuels": {
                        "prestige": 0.3,
                        "stats": {
                            "intelligence": 0.6,
                            "force": 0.3,
                            "constitution": 0.4,
                            "dexterite": 0.7,
                            "sagesse": 0.9,
                            "charisme": 0.7
                        }
                    },
                    "type": "mixte"
                }
            ]
        }
    },
    "Chasse/Nature & Exploration": {
        "Ménagerie Royale": {
            "description": "Abrite une collection de bêtes exotiques et magiques provenant de tout le royaume et au-delà.",
            "providesTags": [
                "Bêtes Exotiques",
                "Bêtes Magiques"
            ],
            "requiresTags": {
                "Administration Royale": {
                    "distance": 2
                },
                "Sécurité": {
                    "distance": 1
                },
                "Soins Médicaux": {
                    "distance": 3
                }
            },
            "emplois": [
                {
                    "tier": 2,
                    "titre": "Maître de la Ménagerie",
                    "postes": 1,
                    "salaire": {
                        "totalEnCuivre": 300
                    },
                    "prerequis": {
                        "prestige": 30
                    },
                    "gainsMensuels": {
                        "prestige": 0.5,
                        "stats": {
                            "intelligence": 0.8,
                            "force": 0.7,
                            "constitution": 0.7,
                            "dexterite": 0.7,
                            "sagesse": 0.9,
                            "charisme": 0.8
                        }
                    },
                    "type": "mixte"
                },
                {
                    "tier": 3,
                    "titre": "Soigneur de Créatures Magiques",
                    "postes": 2,
                    "salaire": {
                        "totalEnCuivre": 190
                    },
                    "prerequis": {
                        "prestige": 15
                    },
                    "gainsMensuels": {
                        "prestige": 0.3,
                        "stats": {
                            "intelligence": 0.6,
                            "force": 0.6,
                            "constitution": 0.6,
                            "dexterite": 0.6,
                            "sagesse": 0.8,
                            "charisme": 0.5
                        }
                    },
                    "type": "mixte"
                }
            ]
        },
        "Guilde des Explorateurs Royaux": {
            "description": "Organisation finançant et gérant des expéditions vers des terres inconnues à la recherche de richesses et de connaissances.",
            "providesTags": [
                "Exploration",
                "Artefacts Rares",
                "Commerce Maritime"
            ],
            "requiresTags": {
                "Haute Finance": {
                    "distance": 1
                },
                "Commandement Militaire": {
                    "distance": 2
                },
                "Savoir Universel": {
                    "distance": 1
                },
                "Cartographie de Précision": {
                    "distance": 1
                },
                "Navigation Astronomique": {
                    "distance": 1
                }
            },
            "emplois": [
                {
                    "tier": 1,
                    "titre": "Maître de Guilde",
                    "postes": 1,
                    "salaire": {
                        "totalEnCuivre": 500
                    },
                    "prerequis": {
                        "prestige": 50
                    },
                    "gainsMensuels": {
                        "prestige": 0.8,
                        "stats": {
                            "intelligence": 0.9,
                            "force": 0.6,
                            "constitution": 0.7,
                            "dexterite": 0.8,
                            "sagesse": 0.9,
                            "charisme": 0.9
                        }
                    },
                    "type": "mixte"
                },
                {
                    "tier": 2,
                    "titre": "Capitaine d'Expédition",
                    "postes": 3,
                    "salaire": {
                        "totalEnCuivre": 340
                    },
                    "prerequis": {
                        "prestige": 34
                    },
                    "gainsMensuels": {
                        "prestige": 0.6,
                        "stats": {
                            "intelligence": 0.8,
                            "force": 0.7,
                            "constitution": 0.8,
                            "dexterite": 0.9,
                            "sagesse": 0.8,
                            "charisme": 0.6
                        }
                    },
                    "type": "mixte"
                }
            ]
        },
        "Bureau du Renseignement Royal": {
            "description": "Une agence secrète dédiée au contre-espionnage, à la collecte d'informations et aux opérations clandestines pour protéger le royaume.",
            "providesTags": [
                "Contre-espionnage",
                "Renseignement"
            ],
            "requiresTags": {
                "Diplomatie": {
                    "distance": 1
                },
                "Haute Finance": {
                    "distance": 1
                },
                "Justice Suprême": {
                    "distance": 2
                }
            },
            "emplois": [
                {
                    "tier": 1,
                    "titre": "Maître-Espion",
                    "postes": 1,
                    "salaire": {
                        "totalEnCuivre": 680
                    },
                    "prerequis": {
                        "prestige": 70
                    },
                    "gainsMensuels": {
                        "prestige": 1,
                        "stats": {
                            "intelligence": 1,
                            "force": 0.5,
                            "constitution": 0.6,
                            "dexterite": 0.9,
                            "sagesse": 1,
                            "charisme": 0.8
                        }
                    },
                    "type": "mixte"
                },
                {
                    "tier": 2,
                    "titre": "Analyste / Agent de Terrain",
                    "postes": 3,
                    "salaire": {
                        "totalEnCuivre": 410
                    },
                    "prerequis": {
                        "prestige": 42
                    },
                    "gainsMensuels": {
                        "prestige": 0.7,
                        "stats": {
                            "intelligence": 0.9,
                            "force": 0.4,
                            "constitution": 0.6,
                            "dexterite": 0.8,
                            "sagesse": 0.8,
                            "charisme": 0.7
                        }
                    },
                    "type": "mixte"
                }
            ]
        }
    }
};

EcoSimData.buildings['Hameau'] = {
    "Bâtiments Administratifs": {
        "Maison Commune": {
            "description": "Le cœur politique et social du hameau, où le conseil des anciens prend les décisions pour la communauté.",
            "providesTags": [
                "Administration"
            ],
            "requiresTags": {
                "Hébergement": {
                    "distance": 1
                },
                "Divertissement": {
                    "distance": 1
                },
                "Meubles Simples": {
                    "distance": 4
                },
                "Fondations Solides": {
                    "distance": 2
                }
            },
            "emplois": [
                {
                    "tier": 0,
                    "titre": "Chef du Hameau",
                    "postes": 1,
                    "salaire": {
                        "totalEnCuivre": 315
                    },
                    "prerequis": {
                        "prestige": 15
                    },
                    "gainsMensuels": {
                        "prestige": 0.5,
                        "stats": {
                            "intelligence": 0.6,
                            "force": 0.2,
                            "constitution": 0.3,
                            "dexterite": 0.3,
                            "sagesse": 0.6,
                            "charisme": 0.7
                        }
                    },
                    "type": "mixte"
                },
                {
                    "tier": 1,
                    "titre": "Ancien du Conseil",
                    "postes": 2,
                    "salaire": {
                        "totalEnCuivre": 40
                    },
                    "prerequis": {
                        "prestige": 5
                    },
                    "gainsMensuels": {
                        "prestige": 0.2,
                        "stats": {
                            "intelligence": 0.5,
                            "force": 0.2,
                            "constitution": 0.2,
                            "dexterite": 0.2,
                            "sagesse": 0.6,
                            "charisme": 0.4
                        }
                    },
                    "type": "mixte"
                }
            ]
        },
        "Poste de Garde": {
            "description": "Un édifice fortifié simple qui abrite la milice du hameau et sécurise les environs immédiats.",
            "providesTags": [
                "Sécurité"
            ],
            "requiresTags": {
                "Vêtements Simples": {
                    "distance": 5
                },
                "Armes Simples": {
                    "distance": 5
                },
                "Remèdes Simples": {
                    "distance": 4
                },
                "Bière": {
                    "distance": 2
                },
                "Murs en Pierre": {
                    "distance": 2
                }
            },
            "emplois": [
                {
                    "tier": 3,
                    "titre": "Sergent de la Milice",
                    "postes": 1,
                    "salaire": {
                        "totalEnCuivre": 50
                    },
                    "prerequis": {
                        "prestige": 6
                    },
                    "gainsMensuels": {
                        "prestige": 0.3,
                        "stats": {
                            "intelligence": 0.4,
                            "force": 0.7,
                            "constitution": 0.7,
                            "dexterite": 0.6,
                            "sagesse": 0.5,
                            "charisme": 0.5
                        }
                    },
                    "type": "mixte"
                },
                {
                    "tier": 4,
                    "titre": "Milicien",
                    "postes": 4,
                    "salaire": {
                        "totalEnCuivre": 30
                    },
                    "prerequis": {
                        "prestige": 1
                    },
                    "gainsMensuels": {
                        "prestige": 0.1,
                        "stats": {
                            "intelligence": 0.2,
                            "force": 0.6,
                            "constitution": 0.7,
                            "dexterite": 0.5,
                            "sagesse": 0.3,
                            "charisme": 0.2
                        }
                    },
                    "type": "mixte"
                }
            ]
        },
        "Tableau d'Affichage": {
            "description": "Un simple tableau en bois où sont affichés les contrats, les nouvelles et les annonces locales.",
            "providesTags": [
                "Contrats",
                "Informations Locales"
            ],
            "requiresTags": {
                "Administration": {
                    "distance": 1
                },
                "Planches": {
                    "distance": 3
                }
            },
            "emplois": [
                {
                    "tier": 4,
                    "titre": "Crieur Public",
                    "postes": 1,
                    "salaire": {
                        "totalEnCuivre": 25
                    },
                    "prerequis": {
                        "prestige": 1
                    },
                    "gainsMensuels": {
                        "prestige": 0.1,
                        "stats": {
                            "intelligence": 0.3,
                            "force": 0.3,
                            "constitution": 0.5,
                            "dexterite": 0.4,
                            "sagesse": 0.3,
                            "charisme": 0.6
                        }
                    },
                    "type": "mixte"
                }
            ]
        }
    },
    "Bâtiments de Production": {
        "Atelier du Forgeron": {
            "description": "Une forge simple où le métal est travaillé pour créer des outils, des clous et des armes de base.",
            "providesTags": [
                "Outils Simples",
                "Pièces Métalliques",
                "Armes Simples"
            ],
            "requiresTags": {
                "Minerai de Fer": {
                    "distance": 8
                },
                "Charbon": {
                    "distance": 5
                }
            },
            "emplois": [
                {
                    "tier": 3,
                    "titre": "Forgeron",
                    "postes": 1,
                    "salaire": {
                        "totalEnCuivre": 53
                    },
                    "prerequis": {
                        "prestige": 4
                    },
                    "gainsMensuels": {
                        "prestige": 0.3,
                        "stats": {
                            "intelligence": 0.4,
                            "force": 0.8,
                            "constitution": 0.8,
                            "dexterite": 0.5,
                            "sagesse": 0.4,
                            "charisme": 0.3
                        }
                    },
                    "type": "mixte"
                },
                {
                    "tier": 4,
                    "titre": "Aide-Forgeron",
                    "postes": 1,
                    "salaire": {
                        "totalEnCuivre": 33
                    },
                    "prerequis": {
                        "prestige": 0
                    },
                    "gainsMensuels": {
                        "prestige": 0.1,
                        "stats": {
                            "intelligence": 0.2,
                            "force": 0.7,
                            "constitution": 0.7,
                            "dexterite": 0.3,
                            "sagesse": 0.2,
                            "charisme": 0.2
                        }
                    },
                    "type": "mixte"
                }
            ]
        },
        "Atelier du Tisserand": {
            "description": "Un petit atelier où la laine des moutons est filée puis tissée pour produire des étoffes.",
            "providesTags": [
                "Tissu"
            ],
            "requiresTags": {
                "Laine": {
                    "distance": 2
                }
            },
            "emplois": [
                {
                    "tier": 4,
                    "titre": "Tisserand",
                    "postes": 2,
                    "salaire": {
                        "totalEnCuivre": 40
                    },
                    "prerequis": {
                        "prestige": 2
                    },
                    "gainsMensuels": {
                        "prestige": 0.2,
                        "stats": {
                            "intelligence": 0.3,
                            "force": 0.2,
                            "constitution": 0.4,
                            "dexterite": 0.7,
                            "sagesse": 0.4,
                            "charisme": 0.3
                        }
                    },
                    "type": "mixte"
                }
            ]
        },
        "Atelier de Couture": {
            "description": "Fabrication de vêtements simples et robustes. Peut utiliser des fourrures pour des doublures chaudes.",
            "providesTags": [
                "Vêtements Simples"
            ],
            "requiresTags": {
                "Tissu": {
                    "distance": 3
                },
                "Cuir": {
                    "distance": 5
                },
                "Fourrures Traitées": {
                    "distance": 5
                }
            },
            "emplois": [
                {
                    "tier": 3,
                    "titre": "Couturier",
                    "postes": 1,
                    "salaire": {
                        "totalEnCuivre": 48
                    },
                    "prerequis": {
                        "prestige": 3
                    },
                    "gainsMensuels": {
                        "prestige": 0.2,
                        "stats": {
                            "intelligence": 0.5,
                            "force": 0.1,
                            "constitution": 0.3,
                            "dexterite": 0.8,
                            "sagesse": 0.5,
                            "charisme": 0.4
                        }
                    },
                    "type": "mixte"
                },
                {
                    "tier": 5,
                    "titre": "Apprenti Couturier",
                    "postes": 2,
                    "salaire": {
                        "totalEnCuivre": 28
                    },
                    "prerequis": {
                        "prestige": 0
                    },
                    "gainsMensuels": {
                        "prestige": 0.1,
                        "stats": {
                            "intelligence": 0.3,
                            "force": 0.1,
                            "constitution": 0.2,
                            "dexterite": 0.6,
                            "sagesse": 0.3,
                            "charisme": 0.3
                        }
                    },
                    "type": "mixte"
                }
            ]
        },
        "Boulangerie": {
            "description": "Le four commun où le pain quotidien et quelques tourtes simples sont préparés.",
            "providesTags": [
                "Pain"
            ],
            "requiresTags": {
                "Farine": {
                    "distance": 3
                },
                "Bois": {
                    "distance": 10
                }
            },
            "emplois": [
                {
                    "tier": 3,
                    "titre": "Boulanger",
                    "postes": 1,
                    "salaire": {
                        "totalEnCuivre": 46
                    },
                    "prerequis": {
                        "prestige": 3
                    },
                    "gainsMensuels": {
                        "prestige": 0.2,
                        "stats": {
                            "intelligence": 0.4,
                            "force": 0.4,
                            "constitution": 0.6,
                            "dexterite": 0.7,
                            "sagesse": 0.5,
                            "charisme": 0.4
                        }
                    },
                    "type": "mixte"
                },
                {
                    "tier": 5,
                    "titre": "Apprenti Boulanger",
                    "postes": 1,
                    "salaire": {
                        "totalEnCuivre": 24
                    },
                    "prerequis": {
                        "prestige": 0
                    },
                    "gainsMensuels": {
                        "prestige": 0.1,
                        "stats": {
                            "intelligence": 0.2,
                            "force": 0.3,
                            "constitution": 0.4,
                            "dexterite": 0.5,
                            "sagesse": 0.3,
                            "charisme": 0.3
                        }
                    },
                    "type": "mixte"
                }
            ]
        },
        "Atelier du Charpentier": {
            "description": "Assemble planches et pièces métalliques pour fabriquer des meubles simples, des charrettes et réparer les bâtiments.",
            "providesTags": [
                "Meubles Simples",
                "Réparations"
            ],
            "requiresTags": {
                "Planches": {
                    "distance": 2
                },
                "Pièces Métalliques": {
                    "distance": 4
                },
                "Outils Simples": {
                    "distance": 1
                },
                "Contrats": {
                    "distance": 1
                }
            },
            "emplois": [
                {
                    "tier": 4,
                    "titre": "Charpentier",
                    "postes": 1,
                    "salaire": {
                        "totalEnCuivre": 45
                    },
                    "prerequis": {
                        "prestige": 3
                    },
                    "gainsMensuels": {
                        "prestige": 0.2,
                        "stats": {
                            "intelligence": 0.5,
                            "force": 0.7,
                            "constitution": 0.6,
                            "dexterite": 0.8,
                            "sagesse": 0.4,
                            "charisme": 0.3
                        }
                    },
                    "type": "mixte"
                }
            ]
        },
        "Chantier du Maçon": {
            "description": "Un petit chantier où les maçons taillent la pierre brute pour la construction des fondations et des murs.",
            "providesTags": [
                "Murs en Pierre",
                "Fondations Solides"
            ],
            "requiresTags": {
                "Pierre": {
                    "distance": 2
                },
                "Outils Simples": {
                    "distance": 3
                }
            },
            "emplois": [
                {
                    "tier": 4,
                    "titre": "Maçon",
                    "postes": 2,
                    "salaire": {
                        "totalEnCuivre": 43
                    },
                    "prerequis": {
                        "prestige": 2
                    },
                    "gainsMensuels": {
                        "prestige": 0.2,
                        "stats": {
                            "intelligence": 0.3,
                            "force": 0.8,
                            "constitution": 0.7,
                            "dexterite": 0.6,
                            "sagesse": 0.3,
                            "charisme": 0.2
                        }
                    },
                    "type": "mixte"
                }
            ]
        }
    },
    "Bâtiments Indépendants": {
        "Taverne": {
            "description": "Le lieu de rassemblement du hameau, où l'on sert des ragoûts simples, de la bière locale et où l'on peut louer un lit pour la nuit.",
            "providesTags": [
                "Divertissement",
                "Hébergement",
                "Bière"
            ],
            "requiresTags": {
                "Pain": {
                    "distance": 2
                },
                "Viande": {
                    "distance": 4
                },
                "Gibier": {
                    "distance": 4
                },
                "Légumes": {
                    "distance": 3
                },
                "Bois": {
                    "distance": 5
                },
                "Sécurité": {
                    "distance": 1
                },
                "Meubles Simples": {
                    "distance": 3
                }
            },
            "emplois": [
                {
                    "tier": 3,
                    "titre": "Tavernier",
                    "postes": 1,
                    "salaire": {
                        "totalEnCuivre": 37
                    },
                    "prerequis": {
                        "prestige": 3
                    },
                    "gainsMensuels": {
                        "prestige": 0.3,
                        "stats": {
                            "intelligence": 0.4,
                            "force": 0.4,
                            "constitution": 0.5,
                            "dexterite": 0.4,
                            "sagesse": 0.4,
                            "charisme": 0.7
                        }
                    },
                    "type": "mixte"
                },
                {
                    "tier": 5,
                    "titre": "Serveur",
                    "postes": 2,
                    "salaire": {
                        "totalEnCuivre": 22
                    },
                    "prerequis": {
                        "prestige": 0
                    },
                    "gainsMensuels": {
                        "prestige": 0.1,
                        "stats": {
                            "intelligence": 0.2,
                            "force": 0.3,
                            "constitution": 0.4,
                            "dexterite": 0.5,
                            "sagesse": 0.2,
                            "charisme": 0.5
                        }
                    },
                    "type": "mixte"
                }
            ]
        },
        "Échoppe de l'Herboriste": {
            "description": "Une petite boutique vendant des herbes séchées, des baies et quelques remèdes de grand-mère.",
            "providesTags": [
                "Remèdes Simples"
            ],
            "requiresTags": {
                "Herbes Communes": {
                    "distance": 3
                },
                "Baies Sauvages": {
                    "distance": 5
                },
                "Champignons": {
                    "distance": 5
                }
            },
            "emplois": [
                {
                    "tier": 4,
                    "titre": "Herboriste",
                    "postes": 1,
                    "salaire": {
                        "totalEnCuivre": 35
                    },
                    "prerequis": {
                        "prestige": 2
                    },
                    "gainsMensuels": {
                        "prestige": 0.2,
                        "stats": {
                            "intelligence": 0.6,
                            "force": 0.2,
                            "constitution": 0.4,
                            "dexterite": 0.5,
                            "sagesse": 0.8,
                            "charisme": 0.3
                        }
                    },
                    "type": "mixte"
                }
            ]
        }
    },
    "Bâtiments Agricoles": {
        "Fermes": {
            "description": "Les exploitations familiales qui cultivent les champs pour nourrir le hameau.",
            "providesTags": [
                "Grain",
                "Légumes"
            ],
            "requiresTags": {
                "Outils Simples": {
                    "distance": 3
                },
                "Informations Locales": {
                    "distance": 1
                }
            },
            "emplois": [
                {
                    "tier": 4,
                    "titre": "Fermier",
                    "postes": 8,
                    "salaire": {
                        "totalEnCuivre": 21
                    },
                    "prerequis": {
                        "prestige": 1
                    },
                    "gainsMensuels": {
                        "prestige": 0.1,
                        "stats": {
                            "intelligence": 0.2,
                            "force": 0.7,
                            "constitution": 0.8,
                            "dexterite": 0.4,
                            "sagesse": 0.3,
                            "charisme": 0.2
                        }
                    },
                    "type": "mixte"
                },
                {
                    "tier": 5,
                    "titre": "Valet de Ferme",
                    "postes": 10,
                    "salaire": {
                        "totalEnCuivre": 15
                    },
                    "prerequis": {
                        "prestige": 0
                    },
                    "gainsMensuels": {
                        "prestige": 0.05,
                        "stats": {
                            "intelligence": 0.1,
                            "force": 0.6,
                            "constitution": 0.7,
                            "dexterite": 0.3,
                            "sagesse": 0.1,
                            "charisme": 0.1
                        }
                    },
                    "type": "mixte"
                }
            ]
        },
        "Bergerie": {
            "description": "Un enclos et un abri simple pour le troupeau de moutons du hameau, fournissant laine et viande.",
            "providesTags": [
                "Laine",
                "Viande"
            ],
            "emplois": [
                {
                    "tier": 4,
                    "titre": "Berger",
                    "postes": 2,
                    "salaire": {
                        "totalEnCuivre": 32
                    },
                    "prerequis": {
                        "prestige": 2
                    },
                    "gainsMensuels": {
                        "prestige": 0.2,
                        "stats": {
                            "intelligence": 0.3,
                            "force": 0.5,
                            "constitution": 0.6,
                            "dexterite": 0.5,
                            "sagesse": 0.7,
                            "charisme": 0.3
                        }
                    },
                    "type": "mixte"
                },
                {
                    "tier": 5,
                    "titre": "Tondeur de Moutons",
                    "postes": 2,
                    "salaire": {
                        "totalEnCuivre": 19
                    },
                    "prerequis": {
                        "prestige": 1
                    },
                    "gainsMensuels": {
                        "prestige": 0.1,
                        "stats": {
                            "intelligence": 0.2,
                            "force": 0.4,
                            "constitution": 0.5,
                            "dexterite": 0.7,
                            "sagesse": 0.3,
                            "charisme": 0.1
                        }
                    },
                    "type": "mixte"
                }
            ]
        },
        "Moulin à Eau": {
            "description": "Utilise la force de la rivière pour moudre le grain des fermiers en farine.",
            "providesTags": [
                "Farine"
            ],
            "requiresTags": {
                "Grain": {
                    "distance": 3
                },
                "Planches": {
                    "distance": 10
                },
                "Réparations": {
                    "distance": 4
                },
                "Fondations Solides": {
                    "distance": 2
                }
            },
            "emplois": [
                {
                    "tier": 3,
                    "titre": "Meunier",
                    "postes": 1,
                    "salaire": {
                        "totalEnCuivre": 44
                    },
                    "prerequis": {
                        "prestige": 4
                    },
                    "gainsMensuels": {
                        "prestige": 0.3,
                        "stats": {
                            "intelligence": 0.4,
                            "force": 0.7,
                            "constitution": 0.7,
                            "dexterite": 0.5,
                            "sagesse": 0.6,
                            "charisme": 0.4
                        }
                    },
                    "type": "mixte"
                },
                {
                    "tier": 5,
                    "titre": "Aide-Meunier",
                    "postes": 1,
                    "salaire": {
                        "totalEnCuivre": 26
                    },
                    "prerequis": {
                        "prestige": 0
                    },
                    "gainsMensuels": {
                        "prestige": 0.1,
                        "stats": {
                            "intelligence": 0.2,
                            "force": 0.6,
                            "constitution": 0.6,
                            "dexterite": 0.4,
                            "sagesse": 0.3,
                            "charisme": 0.2
                        }
                    },
                    "type": "mixte"
                }
            ]
        }
    },
    "Chasse/Nature": {
        "Camp de Bûcherons": {
            "description": "Un campement rudimentaire en lisière de forêt pour l'abattage du bois.",
            "providesTags": [
                "Bois"
            ],
            "requiresTags": {
                "Outils Simples": {
                    "distance": 5
                }
            },
            "emplois": [
                {
                    "tier": 4,
                    "titre": "Bûcheron",
                    "postes": 3,
                    "salaire": {
                        "totalEnCuivre": 38
                    },
                    "prerequis": {
                        "prestige": 1
                    },
                    "gainsMensuels": {
                        "prestige": 0.1,
                        "stats": {
                            "intelligence": 0.2,
                            "force": 0.8,
                            "constitution": 0.8,
                            "dexterite": 0.5,
                            "sagesse": 0.3,
                            "charisme": 0.2
                        }
                    },
                    "type": "mixte"
                }
            ]
        },
        "Scierie Manuelle": {
            "description": "Une installation simple avec une scie à long cadre pour transformer les troncs en planches.",
            "providesTags": [
                "Planches"
            ],
            "requiresTags": {
                "Bois": {
                    "distance": 1
                }
            },
            "emplois": [
                {
                    "tier": 4,
                    "titre": "Scieur",
                    "postes": 4,
                    "salaire": {
                        "totalEnCuivre": 42
                    },
                    "prerequis": {
                        "prestige": 1
                    },
                    "gainsMensuels": {
                        "prestige": 0.1,
                        "stats": {
                            "intelligence": 0.3,
                            "force": 0.7,
                            "constitution": 0.7,
                            "dexterite": 0.6,
                            "sagesse": 0.2,
                            "charisme": 0.2
                        }
                    },
                    "type": "mixte"
                }
            ]
        },
        "Mine de Surface": {
            "description": "Une simple fosse d'où sont extraits le fer et le charbon de terre.",
            "providesTags": [
                "Minerai de Fer",
                "Charbon"
            ],
            "requiresTags": {
                "Outils Simples": {
                    "distance": 2
                }
            },
            "emplois": [
                {
                    "tier": 4,
                    "titre": "Mineur",
                    "postes": 3,
                    "salaire": {
                        "totalEnCuivre": 37
                    },
                    "prerequis": {
                        "prestige": 1
                    },
                    "gainsMensuels": {
                        "prestige": 0.2,
                        "stats": {
                            "intelligence": 0.2,
                            "force": 0.8,
                            "constitution": 0.9,
                            "dexterite": 0.4,
                            "sagesse": 0.3,
                            "charisme": 0.1
                        }
                    },
                    "type": "mixte"
                }
            ]
        },
        "Cabane de Chasse": {
            "description": "Un abri rustique servant de base aux chasseurs et trappeurs locaux.",
            "providesTags": [
                "Gibier",
                "Peaux Brutes",
                "Fourrures"
            ],
            "emplois": [
                {
                    "tier": 4,
                    "titre": "Chasseur",
                    "postes": 3,
                    "salaire": {
                        "totalEnCuivre": 39
                    },
                    "prerequis": {
                        "prestige": 2
                    },
                    "gainsMensuels": {
                        "prestige": 0.2,
                        "stats": {
                            "intelligence": 0.4,
                            "force": 0.6,
                            "constitution": 0.7,
                            "dexterite": 0.8,
                            "sagesse": 0.7,
                            "charisme": 0.3
                        }
                    },
                    "type": "mixte"
                }
            ]
        },
        "Tannerie et Pelleterie": {
            "description": "Une installation en plein air où les peaux sont traitées pour produire du cuir et où les fourrures sont préparées.",
            "providesTags": [
                "Cuir",
                "Fourrures Traitées"
            ],
            "requiresTags": {
                "Peaux Brutes": {
                    "distance": 2
                },
                "Fourrures": {
                    "distance": 2
                },
                "Bois": {
                    "distance": 5
                }
            },
            "emplois": [
                {
                    "tier": 4,
                    "titre": "Tanneur-Pelletier",
                    "postes": 1,
                    "salaire": {
                        "totalEnCuivre": 34
                    },
                    "prerequis": {
                        "prestige": 1
                    },
                    "gainsMensuels": {
                        "prestige": 0.1,
                        "stats": {
                            "intelligence": 0.2,
                            "force": 0.7,
                            "constitution": 0.8,
                            "dexterite": 0.5,
                            "sagesse": 0.3,
                            "charisme": 0.1
                        }
                    },
                    "type": "mixte"
                }
            ]
        },
        "Cabane de Cueilleur": {
            "description": "Un abri pour ceux qui parcourent les bois à la recherche de ce que la nature offre.",
            "providesTags": [
                "Herbes Communes",
                "Baies Sauvages",
                "Champignons"
            ],
            "emplois": [
                {
                    "tier": 4,
                    "titre": "Cueilleur",
                    "postes": 2,
                    "salaire": {
                        "totalEnCuivre": 31
                    },
                    "prerequis": {
                        "prestige": 1
                    },
                    "gainsMensuels": {
                        "prestige": 0.1,
                        "stats": {
                            "intelligence": 0.3,
                            "force": 0.3,
                            "constitution": 0.6,
                            "dexterite": 0.6,
                            "sagesse": 0.7,
                            "charisme": 0.2
                        }
                    },
                    "type": "mixte"
                }
            ]
        },
        "Carrière de Pierre": {
            "description": "Extraction de blocs de pierre bruts pour la construction, une tâche ardue et dangereuse.",
            "providesTags": [
                "Pierre"
            ],
            "requiresTags": {
                "Outils Simples": {
                    "distance": 3
                }
            },
            "emplois": [
                {
                    "tier": 4,
                    "titre": "Carrier",
                    "postes": 3,
                    "salaire": {
                        "totalEnCuivre": 36
                    },
                    "prerequis": {
                        "prestige": 1
                    },
                    "gainsMensuels": {
                        "prestige": 0.1,
                        "stats": {
                            "intelligence": 0.1,
                            "force": 0.8,
                            "constitution": 0.9,
                            "dexterite": 0.4,
                            "sagesse": 0.2,
                            "charisme": 0.2
                        }
                    },
                    "type": "mixte"
                }
            ]
        }
    }
};

EcoSimData.buildings['Village'] = {
    "Bâtiments Administratifs": {
        "Mairie": {
            "description": "Centre administratif du village, gère les affaires publiques, les registres et les relations avec le pouvoir central.",
            "providesTags": [
                "Administration"
            ],
            "requiresTags": {
                "Savoir Écrit": {
                    "distance": 1
                },
                "Vêtements de Qualité": {
                    "distance": 5
                },
                "Hébergement": {
                    "distance": 2
                },
                "Meubles": {
                    "distance": 4
                }
            },
            "emplois": [
                {
                    "tier": 0,
                    "titre": "Maire du Village",
                    "postes": 1,
                    "salaire": {
                        "totalEnCuivre": 85
                    },
                    "prerequis": {
                        "prestige": 15
                    },
                    "gainsMensuels": {
                        "prestige": 0.6,
                        "stats": {
                            "intelligence": 0.7,
                            "force": 0.3,
                            "constitution": 0.4,
                            "dexterite": 0.4,
                            "sagesse": 0.7,
                            "charisme": 0.8
                        }
                    },
                    "type": "mixte"
                },
                {
                    "tier": 2,
                    "titre": "Adjoint au Maire",
                    "postes": 2,
                    "salaire": {
                        "totalEnCuivre": 45
                    },
                    "prerequis": {
                        "prestige": 5
                    },
                    "gainsMensuels": {
                        "prestige": 0.3,
                        "stats": {
                            "intelligence": 0.6,
                            "force": 0.3,
                            "constitution": 0.3,
                            "dexterite": 0.4,
                            "sagesse": 0.6,
                            "charisme": 0.6
                        }
                    },
                    "type": "mixte"
                }
            ]
        },
        "Garnison du Village": {
            "description": "Assure la protection du village et l'entraînement des miliciens. Dispose d'une petite infirmerie.",
            "providesTags": [
                "Sécurité"
            ],
            "requiresTags": {
                "Armes Simples": {
                    "distance": 2
                },
                "Vêtements de Qualité": {
                    "distance": 3
                },
                "Viande": {
                    "distance": 5
                },
                "Remèdes Simples": {
                    "distance": 2
                },
                "Potions Simples": {
                    "distance": 2
                }
            },
            "emplois": [
                {
                    "tier": 3,
                    "titre": "Capitaine de la Milice",
                    "postes": 1,
                    "salaire": {
                        "totalEnCuivre": 70
                    },
                    "prerequis": {
                        "prestige": 12
                    },
                    "gainsMensuels": {
                        "prestige": 0.5,
                        "stats": {
                            "intelligence": 0.5,
                            "force": 0.8,
                            "constitution": 0.8,
                            "dexterite": 0.7,
                            "sagesse": 0.6,
                            "charisme": 0.7
                        }
                    },
                    "type": "mixte"
                },
                {
                    "tier": 4,
                    "titre": "Milicien",
                    "postes": 8,
                    "salaire": {
                        "totalEnCuivre": 50
                    },
                    "prerequis": {
                        "prestige": 3
                    },
                    "gainsMensuels": {
                        "prestige": 0.2,
                        "stats": {
                            "intelligence": 0.3,
                            "force": 0.7,
                            "constitution": 0.7,
                            "dexterite": 0.6,
                            "sagesse": 0.4,
                            "charisme": 0.3
                        }
                    },
                    "type": "mixte"
                }
            ]
        },
        "Bureau du Greffier": {
            "description": "Rédaction et archivage des actes légaux, contrats et recensements du village.",
            "providesTags": [
                "Contrats"
            ],
            "requiresTags": {
                "Administration": {
                    "distance": 1
                },
                "Savoir Écrit": {
                    "distance": 1
                },
                "Cire": {
                    "distance": 8
                }
            },
            "emplois": [
                {
                    "tier": 3,
                    "titre": "Greffier",
                    "postes": 1,
                    "salaire": {
                        "totalEnCuivre": 65
                    },
                    "prerequis": {
                        "prestige": 8
                    },
                    "gainsMensuels": {
                        "prestige": 0.4,
                        "stats": {
                            "intelligence": 0.8,
                            "force": 0.1,
                            "constitution": 0.2,
                            "dexterite": 0.7,
                            "sagesse": 0.7,
                            "charisme": 0.4
                        }
                    },
                    "type": "mixte"
                }
            ]
        }
    },
    "Bâtiments de Production": {
        "Forge du Village": {
            "description": "Fabrication d'outils améliorés, d'armes et d'armures simples pour la milice.",
            "providesTags": [
                "Outils Simples",
                "Armes Simples",
                "Pièces Métalliques"
            ],
            "requiresTags": {
                "Charbon": {
                    "distance": 12
                },
                "Minerai de Fer": {
                    "distance": 12
                }
            },
            "emplois": [
                {
                    "tier": 3,
                    "titre": "Maître Forgeron",
                    "postes": 1,
                    "salaire": {
                        "totalEnCuivre": 75
                    },
                    "prerequis": {
                        "prestige": 10
                    },
                    "gainsMensuels": {
                        "prestige": 0.5,
                        "stats": {
                            "intelligence": 0.4,
                            "force": 0.8,
                            "constitution": 0.8,
                            "dexterite": 0.5,
                            "sagesse": 0.5,
                            "charisme": 0.4
                        }
                    },
                    "type": "mixte"
                },
                {
                    "tier": 4,
                    "titre": "Compagnon Forgeron",
                    "postes": 2,
                    "salaire": {
                        "totalEnCuivre": 48
                    },
                    "prerequis": {
                        "prestige": 2
                    },
                    "gainsMensuels": {
                        "prestige": 0.2,
                        "stats": {
                            "intelligence": 0.2,
                            "force": 0.7,
                            "constitution": 0.7,
                            "dexterite": 0.4,
                            "sagesse": 0.3,
                            "charisme": 0.3
                        }
                    },
                    "type": "mixte"
                }
            ]
        },
        "Atelier de Tailleur": {
            "description": "Confection de vêtements de qualité, uniformes pour la garnison et bannières.",
            "providesTags": [
                "Vêtements de Qualité"
            ],
            "requiresTags": {
                "Tissu": {
                    "distance": 5
                },
                "Cuir": {
                    "distance": 5
                },
                "Fourrures Traitées": {
                    "distance": 8
                },
                "Commerce": {
                    "distance": 2
                }
            },
            "emplois": [
                {
                    "tier": 3,
                    "titre": "Maître Tailleur",
                    "postes": 1,
                    "salaire": {
                        "totalEnCuivre": 68
                    },
                    "prerequis": {
                        "prestige": 8
                    },
                    "gainsMensuels": {
                        "prestige": 0.4,
                        "stats": {
                            "intelligence": 0.6,
                            "force": 0.2,
                            "constitution": 0.3,
                            "dexterite": 0.8,
                            "sagesse": 0.6,
                            "charisme": 0.5
                        }
                    },
                    "type": "mixte"
                },
                {
                    "tier": 5,
                    "titre": "Apprenti Tailleur",
                    "postes": 3,
                    "salaire": {
                        "totalEnCuivre": 42
                    },
                    "prerequis": {
                        "prestige": 1
                    },
                    "gainsMensuels": {
                        "prestige": 0.2,
                        "stats": {
                            "intelligence": 0.4,
                            "force": 0.1,
                            "constitution": 0.2,
                            "dexterite": 0.7,
                            "sagesse": 0.4,
                            "charisme": 0.4
                        }
                    },
                    "type": "mixte"
                }
            ]
        },
        "Atelier du Charpentier et Maçon": {
            "description": "Construit et répare les bâtiments du village, fabrique des meubles et des structures en bois et en pierre.",
            "providesTags": [
                "Construction",
                "Meubles"
            ],
            "requiresTags": {
                "Planches": {
                    "distance": 3
                },
                "Pierre Taillée": {
                    "distance": 3
                },
                "Pièces Métalliques": {
                    "distance": 4
                },
                "Outils Simples": {
                    "distance": 2
                }
            },
            "emplois": [
                {
                    "tier": 3,
                    "titre": "Maître Artisan",
                    "postes": 1,
                    "salaire": {
                        "totalEnCuivre": 78
                    },
                    "prerequis": {
                        "prestige": 9
                    },
                    "gainsMensuels": {
                        "prestige": 0.4,
                        "stats": {
                            "intelligence": 0.5,
                            "force": 0.7,
                            "constitution": 0.7,
                            "dexterite": 0.6,
                            "sagesse": 0.5,
                            "charisme": 0.4
                        }
                    },
                    "type": "mixte"
                },
                {
                    "tier": 4,
                    "titre": "Charpentier",
                    "postes": 2,
                    "salaire": {
                        "totalEnCuivre": 50
                    },
                    "prerequis": {
                        "prestige": 3
                    },
                    "gainsMensuels": {
                        "prestige": 0.2,
                        "stats": {
                            "intelligence": 0.3,
                            "force": 0.6,
                            "constitution": 0.6,
                            "dexterite": 0.5,
                            "sagesse": 0.3,
                            "charisme": 0.3
                        }
                    },
                    "type": "mixte"
                },
                {
                    "tier": 4,
                    "titre": "Maçon",
                    "postes": 2,
                    "salaire": {
                        "totalEnCuivre": 50
                    },
                    "prerequis": {
                        "prestige": 3
                    },
                    "gainsMensuels": {
                        "prestige": 0.2,
                        "stats": {
                            "intelligence": 0.3,
                            "force": 0.6,
                            "constitution": 0.6,
                            "dexterite": 0.5,
                            "sagesse": 0.3,
                            "charisme": 0.3
                        }
                    },
                    "type": "mixte"
                }
            ]
        },
        "Atelier du Tailleur de Pierre": {
            "description": "Transforme les blocs bruts de la carrière en pierres de construction prêtes à l'emploi.",
            "providesTags": [
                "Pierre Taillée"
            ],
            "requiresTags": {
                "Pierre": {
                    "distance": 8
                },
                "Outils Simples": {
                    "distance": 3
                }
            },
            "emplois": [
                {
                    "tier": 3,
                    "titre": "Maître Tailleur de Pierre",
                    "postes": 1,
                    "salaire": {
                        "totalEnCuivre": 73
                    },
                    "prerequis": {
                        "prestige": 9
                    },
                    "gainsMensuels": {
                        "prestige": 0.4,
                        "stats": {
                            "intelligence": 0.4,
                            "force": 0.7,
                            "constitution": 0.8,
                            "dexterite": 0.6,
                            "sagesse": 0.5,
                            "charisme": 0.3
                        }
                    },
                    "type": "mixte"
                },
                {
                    "tier": 4,
                    "titre": "Apprenti Tailleur",
                    "postes": 2,
                    "salaire": {
                        "totalEnCuivre": 46
                    },
                    "prerequis": {
                        "prestige": 2
                    },
                    "gainsMensuels": {
                        "prestige": 0.2,
                        "stats": {
                            "intelligence": 0.2,
                            "force": 0.6,
                            "constitution": 0.7,
                            "dexterite": 0.5,
                            "sagesse": 0.3,
                            "charisme": 0.2
                        }
                    },
                    "type": "mixte"
                }
            ]
        },
        "Verrerie Simple": {
            "description": "Un petit atelier qui fabrique du verre et des objets utilitaires comme des fioles et des vitres.",
            "providesTags": [
                "Verre",
                "Verrerie Utilitaire"
            ],
            "requiresTags": {
                "Sable": {
                    "distance": 5
                },
                "Charbon": {
                    "distance": 10
                }
            },
            "emplois": [
                {
                    "tier": 3,
                    "titre": "Maître Verrier",
                    "postes": 1,
                    "salaire": {
                        "totalEnCuivre": 78
                    },
                    "prerequis": {
                        "prestige": 10
                    },
                    "gainsMensuels": {
                        "prestige": 0.5,
                        "stats": {
                            "intelligence": 0.6,
                            "force": 0.3,
                            "constitution": 0.5,
                            "dexterite": 0.8,
                            "sagesse": 0.6,
                            "charisme": 0.4
                        }
                    },
                    "type": "mixte"
                },
                {
                    "tier": 4,
                    "titre": "Souffleur de Verre",
                    "postes": 2,
                    "salaire": {
                        "totalEnCuivre": 52
                    },
                    "prerequis": {
                        "prestige": 3
                    },
                    "gainsMensuels": {
                        "prestige": 0.2,
                        "stats": {
                            "intelligence": 0.4,
                            "force": 0.2,
                            "constitution": 0.4,
                            "dexterite": 0.9,
                            "sagesse": 0.5,
                            "charisme": 0.3
                        }
                    },
                    "type": "mixte"
                }
            ]
        },
        "Sablière": {
            "description": "Exploitation d'un gisement de sable fin, une ressource essentielle pour la fabrication du verre.",
            "providesTags": [
                "Sable"
            ],
            "requiresTags": {},
            "emplois": [
                {
                    "tier": 5,
                    "titre": "Ouvrier Sablier",
                    "postes": 4,
                    "salaire": {
                        "totalEnCuivre": 29
                    },
                    "prerequis": {
                        "prestige": 0
                    },
                    "gainsMensuels": {
                        "prestige": 0.1,
                        "stats": {
                            "intelligence": 0.1,
                            "force": 0.6,
                            "constitution": 0.7,
                            "dexterite": 0.3,
                            "sagesse": 0.1,
                            "charisme": 0.1
                        }
                    },
                    "type": "mixte"
                }
            ]
        }
    },
    "Bâtiments Indépendants": {
        "Auberge du Relais": {
            "description": "Auberge accueillant voyageurs et locaux, sert repas chauds, bière et hydromel.",
            "providesTags": [
                "Divertissement",
                "Hébergement"
            ],
            "requiresTags": {
                "Bière": {
                    "distance": 5
                },
                "Hydromel": {
                    "distance": 2
                },
                "Pain et Pâtisseries": {
                    "distance": 2
                },
                "Viande": {
                    "distance": 5
                },
                "Poisson": {
                    "distance": 5
                },
                "Gibier": {
                    "distance": 8
                },
                "Miel": {
                    "distance": 2
                },
                "Sécurité": {
                    "distance": 3
                },
                "Verrerie Utilitaire": {
                    "distance": 4
                },
                "Meubles": {
                    "distance": 3
                }
            },
            "emplois": [
                {
                    "tier": 3,
                    "titre": "Aubergiste",
                    "postes": 1,
                    "salaire": {
                        "totalEnCuivre": 72
                    },
                    "prerequis": {
                        "prestige": 9
                    },
                    "gainsMensuels": {
                        "prestige": 0.4,
                        "stats": {
                            "intelligence": 0.5,
                            "force": 0.4,
                            "constitution": 0.5,
                            "dexterite": 0.4,
                            "sagesse": 0.6,
                            "charisme": 0.8
                        }
                    },
                    "type": "mixte"
                },
                {
                    "tier": 5,
                    "titre": "Serveur/Serveuse",
                    "postes": 5,
                    "salaire": {
                        "totalEnCuivre": 35
                    },
                    "prerequis": {
                        "prestige": 1
                    },
                    "gainsMensuels": {
                        "prestige": 0.2,
                        "stats": {
                            "intelligence": 0.3,
                            "force": 0.3,
                            "constitution": 0.4,
                            "dexterite": 0.6,
                            "sagesse": 0.3,
                            "charisme": 0.7
                        }
                    },
                    "type": "mixte"
                }
            ]
        },
        "Herboristerie et Apothicairerie": {
            "description": "Préparation et vente de remèdes, potions et onguents plus complexes.",
            "providesTags": [
                "Remèdes Simples",
                "Potions Simples"
            ],
            "requiresTags": {
                "Herbes Communes": {
                    "distance": 5
                },
                "Herbes Rares": {
                    "distance": 2
                },
                "Champignons Rares": {
                    "distance": 3
                },
                "Verre": {
                    "distance": 4
                }
            },
            "emplois": [
                {
                    "tier": 3,
                    "titre": "Maître Apothicaire",
                    "postes": 1,
                    "salaire": {
                        "totalEnCuivre": 80
                    },
                    "prerequis": {
                        "prestige": 11
                    },
                    "gainsMensuels": {
                        "prestige": 0.5,
                        "stats": {
                            "intelligence": 0.8,
                            "force": 0.1,
                            "constitution": 0.3,
                            "dexterite": 0.6,
                            "sagesse": 0.9,
                            "charisme": 0.4
                        }
                    },
                    "type": "mixte"
                }
            ]
        },
        "Comptoir Commercial": {
            "description": "Point d'échange pour les caravanes, gestion du courrier et des colis.",
            "providesTags": [
                "Commerce"
            ],
            "requiresTags": {
                "Administration": {
                    "distance": 2
                },
                "Sécurité": {
                    "distance": 5
                },
                "Contrats": {
                    "distance": 1
                }
            },
            "emplois": [
                {
                    "tier": 4,
                    "titre": "Maître du Comptoir",
                    "postes": 1,
                    "salaire": {
                        "totalEnCuivre": 60
                    },
                    "prerequis": {
                        "prestige": 7
                    },
                    "gainsMensuels": {
                        "prestige": 0.4,
                        "stats": {
                            "intelligence": 0.7,
                            "force": 0.2,
                            "constitution": 0.4,
                            "dexterite": 0.5,
                            "sagesse": 0.5,
                            "charisme": 0.7
                        }
                    },
                    "type": "mixte"
                },
                {
                    "tier": 5,
                    "titre": "Messager à Cheval",
                    "postes": 3,
                    "salaire": {
                        "totalEnCuivre": 40
                    },
                    "prerequis": {
                        "prestige": 2
                    },
                    "gainsMensuels": {
                        "prestige": 0.2,
                        "stats": {
                            "intelligence": 0.3,
                            "force": 0.5,
                            "constitution": 0.7,
                            "dexterite": 0.8,
                            "sagesse": 0.4,
                            "charisme": 0.3
                        }
                    },
                    "type": "mixte"
                }
            ]
        },
        "École du Village": {
            "description": "Une petite école où un maître enseigne la lecture, l'écriture et le calcul de base aux enfants du village.",
            "providesTags": [
                "Savoir Écrit"
            ],
            "requiresTags": {
                "Administration": {
                    "distance": 2
                },
                "Construction": {
                    "distance": 4
                }
            },
            "emplois": [
                {
                    "tier": 3,
                    "titre": "Maître d'École",
                    "postes": 1,
                    "salaire": {
                        "totalEnCuivre": 70
                    },
                    "prerequis": {
                        "prestige": 10
                    },
                    "gainsMensuels": {
                        "prestige": 0.5,
                        "stats": {
                            "intelligence": 0.8,
                            "force": 0.2,
                            "constitution": 0.3,
                            "dexterite": 0.4,
                            "sagesse": 0.8,
                            "charisme": 0.6
                        }
                    },
                    "type": "mixte"
                }
            ]
        }
    },
    "Bâtiments Agricoles": {
        "Grandes Fermes": {
            "description": "Fermes étendues pour la culture intensive de céréales et de légumes.",
            "providesTags": [
                "Grain",
                "Légumes",
                "Paille"
            ],
            "requiresTags": {
                "Outils Simples": {
                    "distance": 3
                }
            },
            "emplois": [
                {
                    "tier": 4,
                    "titre": "Maître Fermier",
                    "postes": 4,
                    "salaire": {
                        "totalEnCuivre": 42
                    },
                    "prerequis": {
                        "prestige": 9
                    },
                    "gainsMensuels": {
                        "prestige": 0.4,
                        "stats": {
                            "intelligence": 0.3,
                            "force": 0.7,
                            "constitution": 0.8,
                            "dexterite": 0.4,
                            "sagesse": 0.5,
                            "charisme": 0.4
                        }
                    },
                    "type": "mixte"
                },
                {
                    "tier": 5,
                    "titre": "Ouvrier Agricole",
                    "postes": 10,
                    "salaire": {
                        "totalEnCuivre": 28
                    },
                    "prerequis": {
                        "prestige": 0
                    },
                    "gainsMensuels": {
                        "prestige": 0.1,
                        "stats": {
                            "intelligence": 0.1,
                            "force": 0.6,
                            "constitution": 0.7,
                            "dexterite": 0.3,
                            "sagesse": 0.1,
                            "charisme": 0.2
                        }
                    },
                    "type": "mixte"
                }
            ]
        },
        "Boulangerie du Village": {
            "description": "Production d'une variété de pains, tourtes aux fruits et pâtisseries pour tout le village.",
            "providesTags": [
                "Pain et Pâtisseries"
            ],
            "requiresTags": {
                "Farine": {
                    "distance": 5
                },
                "Bois": {
                    "distance": 12
                },
                "Fruits": {
                    "distance": 5
                },
                "Miel": {
                    "distance": 6
                },
                "Lait": {
                    "distance": 4
                },
                "Baies Sauvages": {
                    "distance": 6
                }
            },
            "emplois": [
                {
                    "tier": 3,
                    "titre": "Maître Boulanger",
                    "postes": 1,
                    "salaire": {
                        "totalEnCuivre": 66
                    },
                    "prerequis": {
                        "prestige": 7
                    },
                    "gainsMensuels": {
                        "prestige": 0.4,
                        "stats": {
                            "intelligence": 0.5,
                            "force": 0.4,
                            "constitution": 0.5,
                            "dexterite": 0.8,
                            "sagesse": 0.6,
                            "charisme": 0.5
                        }
                    },
                    "type": "mixte"
                },
                {
                    "tier": 5,
                    "titre": "Mitron",
                    "postes": 3,
                    "salaire": {
                        "totalEnCuivre": 38
                    },
                    "prerequis": {
                        "prestige": 1
                    },
                    "gainsMensuels": {
                        "prestige": 0.2,
                        "stats": {
                            "intelligence": 0.3,
                            "force": 0.2,
                            "constitution": 0.4,
                            "dexterite": 0.6,
                            "sagesse": 0.3,
                            "charisme": 0.4
                        }
                    },
                    "type": "mixte"
                }
            ]
        },
        "Grands Ruchers": {
            "description": "Ensemble de ruches pour une production de miel et de cire, et la fermentation d'hydromel.",
            "providesTags": [
                "Miel",
                "Cire",
                "Hydromel"
            ],
            "requiresTags": {
                "Verrerie Utilitaire": {
                    "distance": 6
                }
            },
            "emplois": [
                {
                    "tier": 4,
                    "titre": "Maître Apiculteur",
                    "postes": 2,
                    "salaire": {
                        "totalEnCuivre": 48
                    },
                    "prerequis": {
                        "prestige": 8
                    },
                    "gainsMensuels": {
                        "prestige": 0.4,
                        "stats": {
                            "intelligence": 0.7,
                            "force": 0.2,
                            "constitution": 0.4,
                            "dexterite": 0.6,
                            "sagesse": 0.8,
                            "charisme": 0.3
                        }
                    },
                    "type": "mixte"
                },
                {
                    "tier": 5,
                    "titre": "Gardien des Ruches",
                    "postes": 3,
                    "salaire": {
                        "totalEnCuivre": 35
                    },
                    "prerequis": {
                        "prestige": 1
                    },
                    "gainsMensuels": {
                        "prestige": 0.2,
                        "stats": {
                            "intelligence": 0.5,
                            "force": 0.1,
                            "constitution": 0.3,
                            "dexterite": 0.4,
                            "sagesse": 0.7,
                            "charisme": 0.2
                        }
                    },
                    "type": "mixte"
                }
            ]
        },
        "Moulin à Vent": {
            "description": "Moud le grain en farine pour le village et les environs.",
            "providesTags": [
                "Farine"
            ],
            "requiresTags": {
                "Grain": {
                    "distance": 5
                },
                "Construction": {
                    "distance": 2
                }
            },
            "emplois": [
                {
                    "tier": 3,
                    "titre": "Maître Meunier",
                    "postes": 1,
                    "salaire": {
                        "totalEnCuivre": 64
                    },
                    "prerequis": {
                        "prestige": 8
                    },
                    "gainsMensuels": {
                        "prestige": 0.4,
                        "stats": {
                            "intelligence": 0.4,
                            "force": 0.6,
                            "constitution": 0.7,
                            "dexterite": 0.5,
                            "sagesse": 0.6,
                            "charisme": 0.5
                        }
                    },
                    "type": "mixte"
                },
                {
                    "tier": 5,
                    "titre": "Garçon Meunier",
                    "postes": 2,
                    "salaire": {
                        "totalEnCuivre": 38
                    },
                    "prerequis": {
                        "prestige": 1
                    },
                    "gainsMensuels": {
                        "prestige": 0.2,
                        "stats": {
                            "intelligence": 0.2,
                            "force": 0.5,
                            "constitution": 0.6,
                            "dexterite": 0.4,
                            "sagesse": 0.3,
                            "charisme": 0.4
                        }
                    },
                    "type": "mixte"
                }
            ]
        },
        "Étable Communale": {
            "description": "Élevage de bétail pour le lait, la laine et la vente aux bouchers.",
            "providesTags": [
                "Bétail",
                "Lait",
                "Laine",
                "Peaux Brutes"
            ],
            "requiresTags": {
                "Paille": {
                    "distance": 3
                }
            },
            "emplois": [
                {
                    "tier": 4,
                    "titre": "Éleveur",
                    "postes": 3,
                    "salaire": {
                        "totalEnCuivre": 50
                    },
                    "prerequis": {
                        "prestige": 6
                    },
                    "gainsMensuels": {
                        "prestige": 0.3,
                        "stats": {
                            "intelligence": 0.3,
                            "force": 0.5,
                            "constitution": 0.6,
                            "dexterite": 0.4,
                            "sagesse": 0.7,
                            "charisme": 0.3
                        }
                    },
                    "type": "mixte"
                },
                {
                    "tier": 5,
                    "titre": "Vacher / Berger",
                    "postes": 5,
                    "salaire": {
                        "totalEnCuivre": 33
                    },
                    "prerequis": {
                        "prestige": 1
                    },
                    "gainsMensuels": {
                        "prestige": 0.2,
                        "stats": {
                            "intelligence": 0.2,
                            "force": 0.4,
                            "constitution": 0.7,
                            "dexterite": 0.5,
                            "sagesse": 0.6,
                            "charisme": 0.2
                        }
                    },
                    "type": "mixte"
                }
            ]
        },
        "Boucherie": {
            "description": "Découpe et vend la viande du bétail élevé dans les étables.",
            "providesTags": [
                "Viande"
            ],
            "requiresTags": {
                "Bétail": {
                    "distance": 1
                },
                "Outils Simples": {
                    "distance": 3
                }
            },
            "emplois": [
                {
                    "tier": 4,
                    "titre": "Maître Boucher",
                    "postes": 1,
                    "salaire": {
                        "totalEnCuivre": 60
                    },
                    "prerequis": {
                        "prestige": 6
                    },
                    "gainsMensuels": {
                        "prestige": 0.3,
                        "stats": {
                            "intelligence": 0.4,
                            "force": 0.6,
                            "constitution": 0.6,
                            "dexterite": 0.7,
                            "sagesse": 0.4,
                            "charisme": 0.4
                        }
                    },
                    "type": "mixte"
                },
                {
                    "tier": 5,
                    "titre": "Garçon Boucher",
                    "postes": 2,
                    "salaire": {
                        "totalEnCuivre": 35
                    },
                    "prerequis": {
                        "prestige": 1
                    },
                    "gainsMensuels": {
                        "prestige": 0.1,
                        "stats": {
                            "intelligence": 0.2,
                            "force": 0.5,
                            "constitution": 0.6,
                            "dexterite": 0.5,
                            "sagesse": 0.2,
                            "charisme": 0.2
                        }
                    },
                    "type": "mixte"
                }
            ]
        }
    },
    "Chasse/Nature": {
        "Grande Scierie": {
            "description": "Découpe du bois en planches et poutres pour les constructions importantes.",
            "providesTags": [
                "Planches"
            ],
            "requiresTags": {
                "Bois": {
                    "distance": 8
                },
                "Outils Simples": {
                    "distance": 4
                }
            },
            "emplois": [
                {
                    "tier": 4,
                    "titre": "Maître Scieur",
                    "postes": 2,
                    "salaire": {
                        "totalEnCuivre": 62
                    },
                    "prerequis": {
                        "prestige": 7
                    },
                    "gainsMensuels": {
                        "prestige": 0.4,
                        "stats": {
                            "intelligence": 0.3,
                            "force": 0.8,
                            "constitution": 0.8,
                            "dexterite": 0.7,
                            "sagesse": 0.3,
                            "charisme": 0.2
                        }
                    },
                    "type": "mixte"
                },
                {
                    "tier": 4,
                    "titre": "Ouvrier de Scierie",
                    "postes": 4,
                    "salaire": {
                        "totalEnCuivre": 45
                    },
                    "prerequis": {
                        "prestige": 2
                    },
                    "gainsMensuels": {
                        "prestige": 0.2,
                        "stats": {
                            "intelligence": 0.2,
                            "force": 0.7,
                            "constitution": 0.7,
                            "dexterite": 0.5,
                            "sagesse": 0.2,
                            "charisme": 0.2
                        }
                    },
                    "type": "mixte"
                }
            ]
        },
        "Loge de Chasse": {
            "description": "Base organisée pour les expéditions de chasse et la gestion des territoires.",
            "providesTags": [
                "Gibier",
                "Fourrures",
                "Cuir"
            ],
            "requiresTags": {
                "Armes Simples": {
                    "distance": 3
                }
            },
            "emplois": [
                {
                    "tier": 4,
                    "titre": "Maître Chasseur",
                    "postes": 3,
                    "salaire": {
                        "totalEnCuivre": 58
                    },
                    "prerequis": {
                        "prestige": 8
                    },
                    "gainsMensuels": {
                        "prestige": 0.4,
                        "stats": {
                            "intelligence": 0.4,
                            "force": 0.6,
                            "constitution": 0.7,
                            "dexterite": 0.8,
                            "sagesse": 0.8,
                            "charisme": 0.4
                        }
                    },
                    "type": "mixte"
                },
                {
                    "tier": 5,
                    "titre": "Pisteur",
                    "postes": 6,
                    "salaire": {
                        "totalEnCuivre": 39
                    },
                    "prerequis": {
                        "prestige": 2
                    },
                    "gainsMensuels": {
                        "prestige": 0.2,
                        "stats": {
                            "intelligence": 0.3,
                            "force": 0.5,
                            "constitution": 0.6,
                            "dexterite": 0.7,
                            "sagesse": 0.6,
                            "charisme": 0.2
                        }
                    },
                    "type": "mixte"
                }
            ]
        },
        "Pêcherie": {
            "description": "Installation sur une rivière ou un lac pour la pêche et le fumage du poisson.",
            "providesTags": [
                "Poisson"
            ],
            "requiresTags": {
                "Bois": {
                    "distance": 6
                }
            },
            "emplois": [
                {
                    "tier": 4,
                    "titre": "Maître Pêcheur",
                    "postes": 4,
                    "salaire": {
                        "totalEnCuivre": 40
                    },
                    "prerequis": {
                        "prestige": 7
                    },
                    "gainsMensuels": {
                        "prestige": 0.3,
                        "stats": {
                            "intelligence": 0.3,
                            "force": 0.6,
                            "constitution": 0.7,
                            "dexterite": 0.7,
                            "sagesse": 0.8,
                            "charisme": 0.2
                        }
                    },
                    "type": "mixte"
                },
                {
                    "tier": 5,
                    "titre": "Préparateur de poisson",
                    "postes": 5,
                    "salaire": {
                        "totalEnCuivre": 22
                    },
                    "prerequis": {
                        "prestige": 1
                    },
                    "gainsMensuels": {
                        "prestige": 0.2,
                        "stats": {
                            "intelligence": 0.1,
                            "force": 0.4,
                            "constitution": 0.6,
                            "dexterite": 0.5,
                            "sagesse": 0.5,
                            "charisme": 0.1
                        }
                    },
                    "type": "mixte"
                }
            ]
        },
        "Comptoir du Pelletier": {
            "description": "Achat, traitement et vente de peaux et de fourrures.",
            "providesTags": [
                "Cuir",
                "Fourrures Traitées"
            ],
            "requiresTags": {
                "Peaux Brutes": {
                    "distance": 8
                },
                "Fourrures": {
                    "distance": 8
                }
            },
            "emplois": [
                {
                    "tier": 4,
                    "titre": "Maître Pelletier",
                    "postes": 2,
                    "salaire": {
                        "totalEnCuivre": 55
                    },
                    "prerequis": {
                        "prestige": 7
                    },
                    "gainsMensuels": {
                        "prestige": 0.4,
                        "stats": {
                            "intelligence": 0.5,
                            "force": 0.4,
                            "constitution": 0.5,
                            "dexterite": 0.7,
                            "sagesse": 0.7,
                            "charisme": 0.3
                        }
                    },
                    "type": "mixte"
                },
                {
                    "tier": 5,
                    "titre": "Apprenti Pelletier",
                    "postes": 4,
                    "salaire": {
                        "totalEnCuivre": 40
                    },
                    "prerequis": {
                        "prestige": 2
                    },
                    "gainsMensuels": {
                        "prestige": 0.2,
                        "stats": {
                            "intelligence": 0.3,
                            "force": 0.4,
                            "constitution": 0.5,
                            "dexterite": 0.7,
                            "sagesse": 0.6,
                            "charisme": 0.2
                        }
                    },
                    "type": "mixte"
                }
            ]
        },
        "Cave de Culture": {
            "description": "Culture de champignons rares et de racines pour les apothicaires et cuisiniers.",
            "providesTags": [
                "Champignons Rares"
            ],
            "requiresTags": {
                "Champignons": {
                    "distance": 0
                },
                "Bois": {
                    "distance": 5
                }
            },
            "emplois": [
                {
                    "tier": 4,
                    "titre": "Maître Myciculteur",
                    "postes": 2,
                    "salaire": {
                        "totalEnCuivre": 38
                    },
                    "prerequis": {
                        "prestige": 5
                    },
                    "gainsMensuels": {
                        "prestige": 0.3,
                        "stats": {
                            "intelligence": 0.6,
                            "force": 0.2,
                            "constitution": 0.4,
                            "dexterite": 0.3,
                            "sagesse": 0.8,
                            "charisme": 0.1
                        }
                    },
                    "type": "mixte"
                }
            ]
        },
        "Jardin de l'Herboriste": {
            "description": "Un jardin clos et bien entretenu où l'apothicaire cultive des herbes rares et délicates pour ses potions.",
            "providesTags": [
                "Herbes Rares"
            ],
            "requiresTags": {
                "Outils Simples": {
                    "distance": 4
                }
            },
            "emplois": [
                {
                    "tier": 4,
                    "titre": "Jardinier d'Herbes",
                    "postes": 2,
                    "salaire": {
                        "totalEnCuivre": 42
                    },
                    "prerequis": {
                        "prestige": 4
                    },
                    "gainsMensuels": {
                        "prestige": 0.3,
                        "stats": {
                            "intelligence": 0.5,
                            "force": 0.3,
                            "constitution": 0.5,
                            "dexterite": 0.6,
                            "sagesse": 0.8,
                            "charisme": 0.2
                        }
                    },
                    "type": "mixte"
                }
            ]
        },
        "Vergers du Village": {
            "description": "Vergers organisés pour une production de fruits diversifiés.",
            "providesTags": [
                "Fruits",
                "Baies Sauvages"
            ],
            "emplois": [
                {
                    "tier": 4,
                    "titre": "Arboriculteur",
                    "postes": 4,
                    "salaire": {
                        "totalEnCuivre": 38
                    },
                    "prerequis": {
                        "prestige": 7
                    },
                    "gainsMensuels": {
                        "prestige": 0.3,
                        "stats": {
                            "intelligence": 0.4,
                            "force": 0.4,
                            "constitution": 0.5,
                            "dexterite": 0.7,
                            "sagesse": 0.7,
                            "charisme": 0.3
                        }
                    },
                    "type": "mixte"
                },
                {
                    "tier": 5,
                    "titre": "Saisonnier",
                    "postes": 8,
                    "salaire": {
                        "totalEnCuivre": 25
                    },
                    "prerequis": {
                        "prestige": 0
                    },
                    "gainsMensuels": {
                        "prestige": 0.1,
                        "stats": {
                            "intelligence": 0.2,
                            "force": 0.3,
                            "constitution": 0.4,
                            "dexterite": 0.7,
                            "sagesse": 0.5,
                            "charisme": 0.2
                        }
                    },
                    "type": "mixte"
                }
            ]
        }
    }
};

EcoSimData.buildings['Ville'] = {
    "Bâtiments Administratifs": {
        "Palais du Gouverneur": {
            "description": "Siège du pouvoir exécutif de la ville, où sont prises les décisions stratégiques.",
            "providesTags": [
                "Administration"
            ],
            "requiresTags": {
                "Justice": {
                    "distance": 1
                },
                "Sécurité Renforcée": {
                    "distance": 1
                },
                "Finances Publiques": {
                    "distance": 1
                },
                "Divertissement de Luxe": {
                    "distance": 2
                },
                "Vitraux": {
                    "distance": 4
                },
                "Alcools Fins": {
                    "distance": 3
                },
                "Haute Société": {
                    "distance": 1
                }
            },
            "emplois": [
                {
                    "tier": 0,
                    "titre": "Gouverneur de la Ville",
                    "postes": 1,
                    "salaire": {
                        "totalEnCuivre": 840
                    },
                    "prerequis": {
                        "prestige": 30
                    },
                    "gainsMensuels": {
                        "prestige": 0.9,
                        "stats": {
                            "intelligence": 0.9,
                            "force": 0.4,
                            "constitution": 0.5,
                            "dexterite": 0.5,
                            "sagesse": 0.9,
                            "charisme": 1
                        }
                    },
                    "type": "mixte"
                },
                {
                    "tier": 1,
                    "titre": "Magistrat de la Cité",
                    "postes": 1,
                    "salaire": {
                        "totalEnCuivre": 150
                    },
                    "prerequis": {
                        "prestige": 18
                    },
                    "gainsMensuels": {
                        "prestige": 0.7,
                        "stats": {
                            "intelligence": 0.8,
                            "force": 0.3,
                            "constitution": 0.4,
                            "dexterite": 0.5,
                            "sagesse": 0.8,
                            "charisme": 0.8
                        }
                    },
                    "type": "mixte"
                }
            ]
        },
        "Caserne du Guet": {
            "description": "Quartier général du Guet de la ville, responsable de la sécurité sur une grande échelle.",
            "providesTags": [
                "Sécurité"
            ],
            "requiresTags": {
                "Armement de Qualité": {
                    "distance": 2
                },
                "Vêtements de Qualité": {
                    "distance": 5
                },
                "Gestion des Vivres": {
                    "distance": 1
                },
                "Soins Médicaux": {
                    "distance": 3
                }
            },
            "emplois": [
                {
                    "tier": 2,
                    "titre": "Commandant du Guet",
                    "postes": 1,
                    "salaire": {
                        "totalEnCuivre": 180
                    },
                    "prerequis": {
                        "prestige": 22
                    },
                    "gainsMensuels": {
                        "prestige": 0.8,
                        "stats": {
                            "intelligence": 0.7,
                            "force": 0.8,
                            "constitution": 0.9,
                            "dexterite": 0.7,
                            "sagesse": 0.7,
                            "charisme": 0.8
                        }
                    },
                    "type": "mixte"
                },
                {
                    "tier": 3,
                    "titre": "Officier du Guet",
                    "postes": 10,
                    "salaire": {
                        "totalEnCuivre": 90
                    },
                    "prerequis": {
                        "prestige": 8
                    },
                    "gainsMensuels": {
                        "prestige": 0.4,
                        "stats": {
                            "intelligence": 0.4,
                            "force": 0.8,
                            "constitution": 0.8,
                            "dexterite": 0.6,
                            "sagesse": 0.5,
                            "charisme": 0.5
                        }
                    },
                    "type": "mixte"
                }
            ]
        },
        "Palais de Justice": {
            "description": "Principal organe judiciaire de la ville, traitant les affaires majeures et les appels.",
            "providesTags": [
                "Justice"
            ],
            "requiresTags": {
                "Administration": {
                    "distance": 1
                },
                "Savoir Écrit": {
                    "distance": 1
                },
                "Documents Imprimés": {
                    "distance": 2
                }
            },
            "emplois": [
                {
                    "tier": 1,
                    "titre": "Haut-Juge",
                    "postes": 1,
                    "salaire": {
                        "totalEnCuivre": 220
                    },
                    "prerequis": {
                        "prestige": 28
                    },
                    "gainsMensuels": {
                        "prestige": 0.9,
                        "stats": {
                            "intelligence": 0.9,
                            "force": 0.2,
                            "constitution": 0.4,
                            "dexterite": 0.6,
                            "sagesse": 1,
                            "charisme": 0.7
                        }
                    },
                    "type": "mixte"
                },
                {
                    "tier": 2,
                    "titre": "Avocat de la Cour",
                    "postes": 2,
                    "salaire": {
                        "totalEnCuivre": 130
                    },
                    "prerequis": {
                        "prestige": 15
                    },
                    "gainsMensuels": {
                        "prestige": 0.6,
                        "stats": {
                            "intelligence": 0.8,
                            "force": 0.2,
                            "constitution": 0.3,
                            "dexterite": 0.7,
                            "sagesse": 0.7,
                            "charisme": 0.6
                        }
                    },
                    "type": "mixte"
                }
            ]
        },
        "Trésor de la Cité": {
            "description": "Centre financier de la ville, gérant la fiscalité, la monnaie et les dépenses publiques.",
            "providesTags": [
                "Finances Publiques"
            ],
            "requiresTags": {
                "Administration": {
                    "distance": 1
                },
                "Commerce": {
                    "distance": 1
                },
                "Documents Imprimés": {
                    "distance": 1
                },
                "Orfèvrerie": {
                    "distance": 3
                }
            },
            "emplois": [
                {
                    "tier": 2,
                    "titre": "Grand Argentier",
                    "postes": 1,
                    "salaire": {
                        "totalEnCuivre": 160
                    },
                    "prerequis": {
                        "prestige": 20
                    },
                    "gainsMensuels": {
                        "prestige": 0.7,
                        "stats": {
                            "intelligence": 0.8,
                            "force": 0.3,
                            "constitution": 0.5,
                            "dexterite": 0.7,
                            "sagesse": 0.7,
                            "charisme": 0.6
                        }
                    },
                    "type": "mixte"
                },
                {
                    "tier": 3,
                    "titre": "Intendant des Finances",
                    "postes": 1,
                    "salaire": {
                        "totalEnCuivre": 100
                    },
                    "prerequis": {
                        "prestige": 10
                    },
                    "gainsMensuels": {
                        "prestige": 0.4,
                        "stats": {
                            "intelligence": 0.8,
                            "force": 0.2,
                            "constitution": 0.4,
                            "dexterite": 0.7,
                            "sagesse": 0.6,
                            "charisme": 0.5
                        }
                    },
                    "type": "mixte"
                }
            ]
        },
        "Garnison d'Armée": {
            "description": "Base d'une force militaire professionnelle et permanente, protégeant la cité et ses intérêts.",
            "providesTags": [
                "Sécurité Renforcée"
            ],
            "requiresTags": {
                "Administration": {
                    "distance": 2
                },
                "Armement de Qualité": {
                    "distance": 1
                },
                "Équipement de Siège": {
                    "distance": 1
                },
                "Gestion des Vivres": {
                    "distance": 1
                },
                "Soins Médicaux": {
                    "distance": 2
                },
                "Navires de Guerre": {
                    "distance": 3
                }
            },
            "emplois": [
                {
                    "tier": 1,
                    "titre": "Général de la Cité",
                    "postes": 1,
                    "salaire": {
                        "totalEnCuivre": 280
                    },
                    "prerequis": {
                        "prestige": 35
                    },
                    "gainsMensuels": {
                        "prestige": 1,
                        "stats": {
                            "intelligence": 0.8,
                            "force": 0.9,
                            "constitution": 0.9,
                            "dexterite": 0.8,
                            "sagesse": 0.8,
                            "charisme": 0.9
                        }
                    },
                    "type": "mixte"
                },
                {
                    "tier": 2,
                    "titre": "Centurion",
                    "postes": 3,
                    "salaire": {
                        "totalEnCuivre": 160
                    },
                    "prerequis": {
                        "prestige": 18
                    },
                    "gainsMensuels": {
                        "prestige": 0.7,
                        "stats": {
                            "intelligence": 0.6,
                            "force": 0.8,
                            "constitution": 0.8,
                            "dexterite": 0.7,
                            "sagesse": 0.6,
                            "charisme": 0.7
                        }
                    },
                    "type": "mixte"
                }
            ]
        }
    },
    "Bâtiments de Production": {
        "Arsenal de la Ville": {
            "description": "Complexe de forges produisant en masse des équipements militaires de haute qualité.",
            "providesTags": [
                "Armement de Qualité",
                "Équipement de Siège"
            ],
            "requiresTags": {
                "Pièces Métalliques": {
                    "distance": 5
                },
                "Planches": {
                    "distance": 10
                },
                "Cuir": {
                    "distance": 8
                },
                "Savoir Arcanique": {
                    "distance": 4
                }
            },
            "emplois": [
                {
                    "tier": 2,
                    "titre": "Maître Ingénieur",
                    "postes": 1,
                    "salaire": {
                        "totalEnCuivre": 190
                    },
                    "prerequis": {
                        "prestige": 20
                    },
                    "gainsMensuels": {
                        "prestige": 0.8,
                        "stats": {
                            "intelligence": 0.9,
                            "force": 0.6,
                            "constitution": 0.7,
                            "dexterite": 0.7,
                            "sagesse": 0.6,
                            "charisme": 0.6
                        }
                    },
                    "type": "mixte"
                },
                {
                    "tier": 3,
                    "titre": "Ingénieur de Siège",
                    "postes": 3,
                    "salaire": {
                        "totalEnCuivre": 110
                    },
                    "prerequis": {
                        "prestige": 10
                    },
                    "gainsMensuels": {
                        "prestige": 0.5,
                        "stats": {
                            "intelligence": 0.8,
                            "force": 0.5,
                            "constitution": 0.6,
                            "dexterite": 0.6,
                            "sagesse": 0.5,
                            "charisme": 0.4
                        }
                    },
                    "type": "mixte"
                }
            ]
        },
        "Atelier de Haute Couture": {
            "description": "Ateliers de luxe créant des vêtements pour la noblesse et les riches marchands.",
            "providesTags": [
                "Vêtements de Luxe"
            ],
            "requiresTags": {
                "Tissu": {
                    "distance": 5
                },
                "Fourrures Traitées": {
                    "distance": 8
                },
                "Bijoux de Luxe": {
                    "distance": 4
                }
            },
            "emplois": [
                {
                    "tier": 2,
                    "titre": "Maître Couturier",
                    "postes": 2,
                    "salaire": {
                        "totalEnCuivre": 160
                    },
                    "prerequis": {
                        "prestige": 18
                    },
                    "gainsMensuels": {
                        "prestige": 0.7,
                        "stats": {
                            "intelligence": 0.7,
                            "force": 0.2,
                            "constitution": 0.4,
                            "dexterite": 0.9,
                            "sagesse": 0.7,
                            "charisme": 0.8
                        }
                    },
                    "type": "mixte"
                },
                {
                    "tier": 4,
                    "titre": "Artisan Tisserand",
                    "postes": 8,
                    "salaire": {
                        "totalEnCuivre": 85
                    },
                    "prerequis": {
                        "prestige": 6
                    },
                    "gainsMensuels": {
                        "prestige": 0.4,
                        "stats": {
                            "intelligence": 0.6,
                            "force": 0.2,
                            "constitution": 0.4,
                            "dexterite": 0.8,
                            "sagesse": 0.6,
                            "charisme": 0.6
                        }
                    },
                    "type": "mixte"
                }
            ]
        },
        "Grands Chantiers Navals": {
            "description": "Construction de navires marchands, de galères de guerre et de navires d'exploration.",
            "providesTags": [
                "Navires Marchands",
                "Navires de Guerre"
            ],
            "requiresTags": {
                "Planches": {
                    "distance": 2
                },
                "Pièces Métalliques": {
                    "distance": 4
                },
                "Tissu": {
                    "distance": 10
                },
                "Savoir Astronomique": {
                    "distance": 3
                },
                "Équipement d'Optique": {
                    "distance": 4
                }
            },
            "emplois": [
                {
                    "tier": 2,
                    "titre": "Architecte Naval",
                    "postes": 2,
                    "salaire": {
                        "totalEnCuivre": 150
                    },
                    "prerequis": {
                        "prestige": 16
                    },
                    "gainsMensuels": {
                        "prestige": 0.6,
                        "stats": {
                            "intelligence": 0.8,
                            "force": 0.6,
                            "constitution": 0.6,
                            "dexterite": 0.7,
                            "sagesse": 0.6,
                            "charisme": 0.5
                        }
                    },
                    "type": "mixte"
                },
                {
                    "tier": 3,
                    "titre": "Maître de Cale",
                    "postes": 3,
                    "salaire": {
                        "totalEnCuivre": 95
                    },
                    "prerequis": {
                        "prestige": 5
                    },
                    "gainsMensuels": {
                        "prestige": 0.3,
                        "stats": {
                            "intelligence": 0.3,
                            "force": 0.8,
                            "constitution": 0.7,
                            "dexterite": 0.6,
                            "sagesse": 0.4,
                            "charisme": 0.4
                        }
                    },
                    "type": "mixte"
                }
            ]
        },
        "Distillerie d'Alcools Fins": {
            "description": "Production de spiritueux, liqueurs et alcools de prestige pour l'exportation.",
            "providesTags": [
                "Alcools Fins"
            ],
            "requiresTags": {
                "Fruits": {
                    "distance": 15
                },
                "Grain": {
                    "distance": 15
                },
                "Herbes Rares": {
                    "distance": 15
                }
            },
            "emplois": [
                {
                    "tier": 2,
                    "titre": "Maître Distillateur",
                    "postes": 2,
                    "salaire": {
                        "totalEnCuivre": 140
                    },
                    "prerequis": {
                        "prestige": 15
                    },
                    "gainsMensuels": {
                        "prestige": 0.6,
                        "stats": {
                            "intelligence": 0.8,
                            "force": 0.4,
                            "constitution": 0.6,
                            "dexterite": 0.6,
                            "sagesse": 0.9,
                            "charisme": 0.6
                        }
                    },
                    "type": "mixte"
                },
                {
                    "tier": 4,
                    "titre": "Maître de Chai",
                    "postes": 6,
                    "salaire": {
                        "totalEnCuivre": 75
                    },
                    "prerequis": {
                        "prestige": 4
                    },
                    "gainsMensuels": {
                        "prestige": 0.3,
                        "stats": {
                            "intelligence": 0.4,
                            "force": 0.6,
                            "constitution": 0.7,
                            "dexterite": 0.5,
                            "sagesse": 0.5,
                            "charisme": 0.4
                        }
                    },
                    "type": "mixte"
                }
            ]
        },
        "Atelier d'Orfèvrerie": {
            "description": "Un maître artisan qui crée des pièces uniques, des couronnes et des bijoux de grand luxe pour la noblesse.",
            "providesTags": [
                "Orfèvrerie",
                "Bijoux de Luxe"
            ],
            "requiresTags": {
                "Or Raffiné": {
                    "distance": 8
                },
                "Pierres Taillées": {
                    "distance": 8
                },
                "Savoir Alchimique": {
                    "distance": 2
                },
                "Finances Privées": {
                    "distance": 1
                }
            },
            "emplois": [
                {
                    "tier": 1,
                    "titre": "Maître Orfèvre",
                    "postes": 1,
                    "salaire": {
                        "totalEnCuivre": 240
                    },
                    "prerequis": {
                        "prestige": 26
                    },
                    "gainsMensuels": {
                        "prestige": 1,
                        "stats": {
                            "intelligence": 0.8,
                            "force": 0.2,
                            "constitution": 0.4,
                            "dexterite": 1,
                            "sagesse": 0.7,
                            "charisme": 0.8
                        }
                    },
                    "type": "mixte"
                },
                {
                    "tier": 3,
                    "titre": "Compagnon Orfèvre",
                    "postes": 4,
                    "salaire": {
                        "totalEnCuivre": 130
                    },
                    "prerequis": {
                        "prestige": 12
                    },
                    "gainsMensuels": {
                        "prestige": 0.5,
                        "stats": {
                            "intelligence": 0.6,
                            "force": 0.2,
                            "constitution": 0.4,
                            "dexterite": 0.9,
                            "sagesse": 0.6,
                            "charisme": 0.6
                        }
                    },
                    "type": "mixte"
                }
            ]
        },
        "Imprimerie": {
            "description": "Une presse révolutionnaire qui permet de copier des livres et des décrets en grande quantité.",
            "providesTags": [
                "Livres",
                "Documents Imprimés"
            ],
            "requiresTags": {
                "Papier": {
                    "distance": 2
                },
                "Encre": {
                    "distance": 3
                },
                "Pièces Métalliques": {
                    "distance": 5
                },
                "Manuscrit": {
                    "distance": 1
                }
            },
            "emplois": [
                {
                    "tier": 2,
                    "titre": "Maître Imprimeur",
                    "postes": 1,
                    "salaire": {
                        "totalEnCuivre": 150
                    },
                    "prerequis": {
                        "prestige": 18
                    },
                    "gainsMensuels": {
                        "prestige": 0.7,
                        "stats": {
                            "intelligence": 0.8,
                            "force": 0.4,
                            "constitution": 0.5,
                            "dexterite": 0.7,
                            "sagesse": 0.6,
                            "charisme": 0.6
                        }
                    },
                    "type": "mixte"
                },
                {
                    "tier": 4,
                    "titre": "Opérateur de Presse",
                    "postes": 5,
                    "salaire": {
                        "totalEnCuivre": 80
                    },
                    "prerequis": {
                        "prestige": 6
                    },
                    "gainsMensuels": {
                        "prestige": 0.3,
                        "stats": {
                            "intelligence": 0.4,
                            "force": 0.5,
                            "constitution": 0.6,
                            "dexterite": 0.6,
                            "sagesse": 0.4,
                            "charisme": 0.3
                        }
                    },
                    "type": "mixte"
                }
            ]
        },
        "Verrerie d'Art": {
            "description": "Crée des objets en verre d'une finesse inégalée, des vitraux pour les temples et des miroirs de luxe.",
            "providesTags": [
                "Verrerie d'Art",
                "Vitraux",
                "Équipement d'Optique"
            ],
            "requiresTags": {
                "Verre": {
                    "distance": 2
                },
                "Or Raffiné": {
                    "distance": 10
                },
                "Charbon": {
                    "distance": 15
                }
            },
            "emplois": [
                {
                    "tier": 2,
                    "titre": "Artiste Verrier",
                    "postes": 2,
                    "salaire": {
                        "totalEnCuivre": 140
                    },
                    "prerequis": {
                        "prestige": 17
                    },
                    "gainsMensuels": {
                        "prestige": 0.7,
                        "stats": {
                            "intelligence": 0.7,
                            "force": 0.2,
                            "constitution": 0.4,
                            "dexterite": 0.9,
                            "sagesse": 0.6,
                            "charisme": 0.7
                        }
                    },
                    "type": "mixte"
                }
            ]
        }
    },
    "Bâtiments Indépendants": {
        "Opéra Royal": {
            "description": "Scène prestigieuse pour les opéras, les ballets et les concerts symphoniques.",
            "providesTags": [
                "Divertissement de Luxe"
            ],
            "requiresTags": {
                "Administration": {
                    "distance": 2
                },
                "Sécurité": {
                    "distance": 2
                },
                "Vêtements de Luxe": {
                    "distance": 3
                },
                "Vitraux": {
                    "distance": 5
                },
                "Bêtes Exotiques": {
                    "distance": 4
                }
            },
            "emplois": [
                {
                    "tier": 2,
                    "titre": "Directeur de l'Opéra",
                    "postes": 1,
                    "salaire": {
                        "totalEnCuivre": 170
                    },
                    "prerequis": {
                        "prestige": 18
                    },
                    "gainsMensuels": {
                        "prestige": 0.7,
                        "stats": {
                            "intelligence": 0.7,
                            "force": 0.3,
                            "constitution": 0.4,
                            "dexterite": 0.6,
                            "sagesse": 0.7,
                            "charisme": 0.9
                        }
                    },
                    "type": "mixte"
                },
                {
                    "tier": 3,
                    "titre": "Soliste d'Opéra",
                    "postes": 4,
                    "salaire": {
                        "totalEnCuivre": 110
                    },
                    "prerequis": {
                        "prestige": 10
                    },
                    "gainsMensuels": {
                        "prestige": 0.5,
                        "stats": {
                            "intelligence": 0.4,
                            "force": 0.4,
                            "constitution": 0.6,
                            "dexterite": 0.7,
                            "sagesse": 0.4,
                            "charisme": 1
                        }
                    },
                    "type": "mixte"
                }
            ]
        },
        "Académie des Arcanes": {
            "description": "Institution d'enseignement et de recherche sur la magie et l'alchimie.",
            "providesTags": [
                "Savoir Arcanique",
                "Potions Complexes"
            ],
            "requiresTags": {
                "Herbes Rares": {
                    "distance": 5
                },
                "Livres": {
                    "distance": 2
                },
                "Sécurité Renforcée": {
                    "distance": 2
                }
            },
            "emplois": [
                {
                    "tier": 1,
                    "titre": "Archimage de l'Académie",
                    "postes": 1,
                    "salaire": {
                        "totalEnCuivre": 280
                    },
                    "prerequis": {
                        "prestige": 35
                    },
                    "gainsMensuels": {
                        "prestige": 1,
                        "stats": {
                            "intelligence": 1,
                            "force": 0.2,
                            "constitution": 0.4,
                            "dexterite": 0.7,
                            "sagesse": 1,
                            "charisme": 0.6
                        }
                    },
                    "type": "mixte"
                },
                {
                    "tier": 2,
                    "titre": "Professeur",
                    "postes": 5,
                    "salaire": {
                        "totalEnCuivre": 160
                    },
                    "prerequis": {
                        "prestige": 20
                    },
                    "gainsMensuels": {
                        "prestige": 0.8,
                        "stats": {
                            "intelligence": 0.9,
                            "force": 0.2,
                            "constitution": 0.4,
                            "dexterite": 0.6,
                            "sagesse": 0.9,
                            "charisme": 0.5
                        }
                    },
                    "type": "mixte"
                }
            ]
        },
        "Halle aux Marchands": {
            "description": "Coeur économique où les grandes maisons marchandes négocient des contrats et des matières premières.",
            "providesTags": [
                "Commerce",
                "Finances Privées"
            ],
            "requiresTags": {
                "Sécurité": {
                    "distance": 2
                },
                "Contrats": {
                    "distance": 1
                },
                "Justice": {
                    "distance": 1
                },
                "Commerce Maritime": {
                    "distance": 1
                }
            },
            "emplois": [
                {
                    "tier": 1,
                    "titre": "Prince Marchand",
                    "postes": 3,
                    "salaire": {
                        "totalEnCuivre": 230
                    },
                    "prerequis": {
                        "prestige": 25
                    },
                    "gainsMensuels": {
                        "prestige": 0.9,
                        "stats": {
                            "intelligence": 0.8,
                            "force": 0.4,
                            "constitution": 0.5,
                            "dexterite": 0.6,
                            "sagesse": 0.8,
                            "charisme": 0.9
                        }
                    },
                    "type": "mixte"
                },
                {
                    "tier": 3,
                    "titre": "Courtier",
                    "postes": 4,
                    "salaire": {
                        "totalEnCuivre": 120
                    },
                    "prerequis": {
                        "prestige": 12
                    },
                    "gainsMensuels": {
                        "prestige": 0.5,
                        "stats": {
                            "intelligence": 0.7,
                            "force": 0.3,
                            "constitution": 0.4,
                            "dexterite": 0.5,
                            "sagesse": 0.6,
                            "charisme": 0.8
                        }
                    },
                    "type": "mixte"
                }
            ]
        },
        "Université": {
            "description": "Centre d'études supérieures pour la philosophie, la science, l'histoire et la médecine.",
            "providesTags": [
                "Savoir Avancé",
                "Soins Médicaux"
            ],
            "requiresTags": {
                "Savoir Écrit": {
                    "distance": 2
                },
                "Administration": {
                    "distance": 2
                },
                "Livres": {
                    "distance": 1
                }
            },
            "emplois": [
                {
                    "tier": 1,
                    "titre": "Recteur de l'Université",
                    "postes": 1,
                    "salaire": {
                        "totalEnCuivre": 260
                    },
                    "prerequis": {
                        "prestige": 32
                    },
                    "gainsMensuels": {
                        "prestige": 1,
                        "stats": {
                            "intelligence": 0.9,
                            "force": 0.2,
                            "constitution": 0.4,
                            "dexterite": 0.4,
                            "sagesse": 1,
                            "charisme": 0.7
                        }
                    },
                    "type": "mixte"
                },
                {
                    "tier": 2,
                    "titre": "Érudit / Chercheur",
                    "postes": 5,
                    "salaire": {
                        "totalEnCuivre": 140
                    },
                    "prerequis": {
                        "prestige": 18
                    },
                    "gainsMensuels": {
                        "prestige": 0.7,
                        "stats": {
                            "intelligence": 0.9,
                            "force": 0.2,
                            "constitution": 0.3,
                            "dexterite": 0.6,
                            "sagesse": 0.9,
                            "charisme": 0.5
                        }
                    },
                    "type": "mixte"
                }
            ]
        },
        "Observatoire": {
            "description": "Une tour pour cartographier les étoiles, équipée de lentilles et de cartes célestes complexes.",
            "providesTags": [
                "Savoir Astronomique"
            ],
            "requiresTags": {
                "Savoir Avancé": {
                    "distance": 1
                },
                "Verre": {
                    "distance": 10
                },
                "Pièces Métalliques": {
                    "distance": 8
                }
            },
            "emplois": [
                {
                    "tier": 2,
                    "titre": "Astronome Royal",
                    "postes": 1,
                    "salaire": {
                        "totalEnCuivre": 180
                    },
                    "prerequis": {
                        "prestige": 22
                    },
                    "gainsMensuels": {
                        "prestige": 0.8,
                        "stats": {
                            "intelligence": 0.9,
                            "force": 0.2,
                            "constitution": 0.4,
                            "dexterite": 0.6,
                            "sagesse": 1,
                            "charisme": 0.6
                        }
                    },
                    "type": "mixte"
                },
                {
                    "tier": 3,
                    "titre": "Assistant Astronome",
                    "postes": 3,
                    "salaire": {
                        "totalEnCuivre": 110
                    },
                    "prerequis": {
                        "prestige": 10
                    },
                    "gainsMensuels": {
                        "prestige": 0.4,
                        "stats": {
                            "intelligence": 0.8,
                            "force": 0.1,
                            "constitution": 0.3,
                            "dexterite": 0.6,
                            "sagesse": 0.9,
                            "charisme": 0.4
                        }
                    },
                    "type": "mixte"
                }
            ]
        },
        "Cercle des Nobles & Fumoir": {
            "description": "Un club privé où l'élite de la ville se détend, discute d'affaires et profite des plaisirs les plus fins.",
            "providesTags": [
                "Haute Société"
            ],
            "requiresTags": {
                "Vêtements de Luxe": {
                    "distance": 1
                },
                "Alcools Fins": {
                    "distance": 1
                },
                "Tabac": {
                    "distance": 1
                },
                "Finances Privées": {
                    "distance": 0
                },
                "Verrerie d'Art": {
                    "distance": 2
                }
            },
            "emplois": [
                {
                    "tier": 2,
                    "titre": "Maître du Cercle",
                    "postes": 1,
                    "salaire": {
                        "totalEnCuivre": 150
                    },
                    "prerequis": {
                        "prestige": 20
                    },
                    "gainsMensuels": {
                        "prestige": 0.8,
                        "stats": {
                            "intelligence": 0.7,
                            "force": 0.4,
                            "constitution": 0.5,
                            "dexterite": 0.6,
                            "sagesse": 0.7,
                            "charisme": 0.9
                        }
                    },
                    "type": "mixte"
                }
            ]
        },
        "Bibliothèque de la Cité": {
            "description": "Une grande bibliothèque publique abritant une vaste collection de livres et de manuscrits, avec un scriptorium actif.",
            "providesTags": [
                "Savoir Écrit",
                "Manuscrit"
            ],
            "requiresTags": {
                "Administration": {
                    "distance": 2
                },
                "Papier": {
                    "distance": 3
                },
                "Encre": {
                    "distance": 3
                }
            },
            "emplois": [
                {
                    "tier": 2,
                    "titre": "Conservateur en Chef",
                    "postes": 1,
                    "salaire": {
                        "totalEnCuivre": 140
                    },
                    "prerequis": {
                        "prestige": 15
                    },
                    "gainsMensuels": {
                        "prestige": 0.7,
                        "stats": {
                            "intelligence": 0.9,
                            "force": 0.2,
                            "constitution": 0.4,
                            "dexterite": 0.5,
                            "sagesse": 0.9,
                            "charisme": 0.6
                        }
                    },
                    "type": "mixte"
                }
            ]
        }
    },
    "Bâtiments Agricoles": {
        "Office des Vivres": {
            "description": "Organisme gérant l'importation de nourriture des campagnes et la distribution dans la ville.",
            "providesTags": [
                "Gestion des Vivres"
            ],
            "requiresTags": {
                "Commerce": {
                    "distance": 0
                },
                "Grain": {
                    "distance": 1
                },
                "Viande": {
                    "distance": 1
                },
                "Poisson": {
                    "distance": 1
                },
                "Commerce Alimentaire": {
                    "distance": 0
                }
            },
            "emplois": [
                {
                    "tier": 2,
                    "titre": "Intendant des Vivres",
                    "postes": 1,
                    "salaire": {
                        "totalEnCuivre": 130
                    },
                    "prerequis": {
                        "prestige": 15
                    },
                    "gainsMensuels": {
                        "prestige": 0.6,
                        "stats": {
                            "intelligence": 0.7,
                            "force": 0.5,
                            "constitution": 0.6,
                            "dexterite": 0.5,
                            "sagesse": 0.7,
                            "charisme": 0.7
                        }
                    },
                    "type": "mixte"
                },
                {
                    "tier": 3,
                    "titre": "Approvisionneur de la Cité",
                    "postes": 4,
                    "salaire": {
                        "totalEnCuivre": 80
                    },
                    "prerequis": {
                        "prestige": 5
                    },
                    "gainsMensuels": {
                        "prestige": 0.3,
                        "stats": {
                            "intelligence": 0.6,
                            "force": 0.6,
                            "constitution": 0.7,
                            "dexterite": 0.6,
                            "sagesse": 0.5,
                            "charisme": 0.4
                        }
                    },
                    "type": "mixte"
                }
            ]
        },
        "Halle aux Vins": {
            "description": "Caves de vieillissement et de commerce des vins les plus fins du royaume.",
            "providesTags": [
                "Vin"
            ],
            "requiresTags": {
                "Raisins": {
                    "distance": 20
                },
                "Commerce": {
                    "distance": 0
                }
            },
            "emplois": [
                {
                    "tier": 2,
                    "titre": "Maître Sommelier",
                    "postes": 2,
                    "salaire": {
                        "totalEnCuivre": 125
                    },
                    "prerequis": {
                        "prestige": 14
                    },
                    "gainsMensuels": {
                        "prestige": 0.6,
                        "stats": {
                            "intelligence": 0.6,
                            "force": 0.4,
                            "constitution": 0.5,
                            "dexterite": 0.7,
                            "sagesse": 0.9,
                            "charisme": 0.6
                        }
                    },
                    "type": "mixte"
                },
                {
                    "tier": 4,
                    "titre": "Caviste",
                    "postes": 8,
                    "salaire": {
                        "totalEnCuivre": 70
                    },
                    "prerequis": {
                        "prestige": 4
                    },
                    "gainsMensuels": {
                        "prestige": 0.3,
                        "stats": {
                            "intelligence": 0.4,
                            "force": 0.4,
                            "constitution": 0.6,
                            "dexterite": 0.6,
                            "sagesse": 0.6,
                            "charisme": 0.4
                        }
                    },
                    "type": "mixte"
                }
            ]
        },
        "Halles Centrales": {
            "description": "Marché couvert central pour les produits frais : fruits, légumes, fromages, etc.",
            "providesTags": [
                "Commerce Alimentaire"
            ],
            "requiresTags": {
                "Légumes": {
                    "distance": 1
                },
                "Fruits": {
                    "distance": 1
                },
                "Fromage": {
                    "distance": 1
                },
                "Viande": {
                    "distance": 1
                },
                "Poisson": {
                    "distance": 1
                }
            },
            "emplois": [
                {
                    "tier": 3,
                    "titre": "Intendant des Halles",
                    "postes": 2,
                    "salaire": {
                        "totalEnCuivre": 110
                    },
                    "prerequis": {
                        "prestige": 12
                    },
                    "gainsMensuels": {
                        "prestige": 0.5,
                        "stats": {
                            "intelligence": 0.6,
                            "force": 0.6,
                            "constitution": 0.6,
                            "dexterite": 0.6,
                            "sagesse": 0.7,
                            "charisme": 0.7
                        }
                    },
                    "type": "mixte"
                },
                {
                    "tier": 4,
                    "titre": "Marchand Primeur",
                    "postes": 6,
                    "salaire": {
                        "totalEnCuivre": 75
                    },
                    "prerequis": {
                        "prestige": 4
                    },
                    "gainsMensuels": {
                        "prestige": 0.3,
                        "stats": {
                            "intelligence": 0.5,
                            "force": 0.4,
                            "constitution": 0.5,
                            "dexterite": 0.6,
                            "sagesse": 0.5,
                            "charisme": 0.6
                        }
                    },
                    "type": "mixte"
                }
            ]
        },
        "Comptoir des Tabacs et Herbes": {
            "description": "Traitement et conditionnement de tabac et d'herbes à fumer ou à priser.",
            "providesTags": [
                "Tabac"
            ],
            "requiresTags": {
                "Herbes Communes": {
                    "distance": 20
                },
                "Commerce": {
                    "distance": 0
                }
            },
            "emplois": [
                {
                    "tier": 3,
                    "titre": "Maître Herboriste",
                    "postes": 1,
                    "salaire": {
                        "totalEnCuivre": 90
                    },
                    "prerequis": {
                        "prestige": 9
                    },
                    "gainsMensuels": {
                        "prestige": 0.4,
                        "stats": {
                            "intelligence": 0.6,
                            "force": 0.4,
                            "constitution": 0.5,
                            "dexterite": 0.6,
                            "sagesse": 0.8,
                            "charisme": 0.5
                        }
                    },
                    "type": "mixte"
                },
                {
                    "tier": 4,
                    "titre": "Artisan Préparateur",
                    "postes": 6,
                    "salaire": {
                        "totalEnCuivre": 55
                    },
                    "prerequis": {
                        "prestige": 2
                    },
                    "gainsMensuels": {
                        "prestige": 0.2,
                        "stats": {
                            "intelligence": 0.2,
                            "force": 0.3,
                            "constitution": 0.4,
                            "dexterite": 0.6,
                            "sagesse": 0.4,
                            "charisme": 0.3
                        }
                    },
                    "type": "mixte"
                }
            ]
        },
        "Fermes Périurbaines": {
            "description": "Ceinture de fermes nourrissant la ville en grain, légumes et autres denrées de base.",
            "providesTags": [
                "Grain",
                "Légumes",
                "Fruits",
                "Herbes Communes",
                "Lait",
                "Bétail",
                "Laine",
                "Peaux Brutes",
                "Raisins",
                "Fromage"
            ],
            "requiresTags": {},
            "emplois": [
                {
                    "tier": 3,
                    "titre": "Régisseur de Domaine",
                    "postes": 2,
                    "salaire": {
                        "totalEnCuivre": 80
                    },
                    "prerequis": {
                        "prestige": 8
                    },
                    "gainsMensuels": {
                        "prestige": 0.4,
                        "stats": {
                            "intelligence": 0.6,
                            "force": 0.5,
                            "constitution": 0.6,
                            "dexterite": 0.5,
                            "sagesse": 0.7,
                            "charisme": 0.6
                        }
                    },
                    "type": "mixte"
                }
            ]
        }
    },
    "Chasse/Nature": {
        "Docks et Marché au Poisson": {
            "description": "Centre névralgique de la pêche, réceptionnant les prises de haute mer et de rivière.",
            "providesTags": [
                "Poisson",
                "Commerce Maritime"
            ],
            "requiresTags": {
                "Navires Marchands": {
                    "distance": 0
                },
                "Sécurité": {
                    "distance": 1
                }
            },
            "emplois": [
                {
                    "tier": 3,
                    "titre": "Armateur de Pêche",
                    "postes": 4,
                    "salaire": {
                        "totalEnCuivre": 115
                    },
                    "prerequis": {
                        "prestige": 12
                    },
                    "gainsMensuels": {
                        "prestige": 0.5,
                        "stats": {
                            "intelligence": 0.5,
                            "force": 0.7,
                            "constitution": 0.8,
                            "dexterite": 0.7,
                            "sagesse": 0.7,
                            "charisme": 0.6
                        }
                    },
                    "type": "mixte"
                },
                {
                    "tier": 4,
                    "titre": "Débardeur",
                    "postes": 20,
                    "salaire": {
                        "totalEnCuivre": 65
                    },
                    "prerequis": {
                        "prestige": 2
                    },
                    "gainsMensuels": {
                        "prestige": 0.2,
                        "stats": {
                            "intelligence": 0.2,
                            "force": 0.8,
                            "constitution": 0.8,
                            "dexterite": 0.6,
                            "sagesse": 0.3,
                            "charisme": 0.2
                        }
                    },
                    "type": "mixte"
                }
            ]
        },
        "Jardin Botanique Royal": {
            "description": "Collection de plantes exotiques et rares à des fins de recherche, de conservation et d'agrément.",
            "providesTags": [
                "Herbes Rares",
                "Fleurs",
                "Potions Simples"
            ],
            "requiresTags": {
                "Administration": {
                    "distance": 2
                },
                "Savoir Avancé": {
                    "distance": 1
                }
            },
            "emplois": [
                {
                    "tier": 2,
                    "titre": "Conservateur du Jardin",
                    "postes": 1,
                    "salaire": {
                        "totalEnCuivre": 130
                    },
                    "prerequis": {
                        "prestige": 15
                    },
                    "gainsMensuels": {
                        "prestige": 0.6,
                        "stats": {
                            "intelligence": 0.8,
                            "force": 0.3,
                            "constitution": 0.5,
                            "dexterite": 0.6,
                            "sagesse": 0.9,
                            "charisme": 0.5
                        }
                    },
                    "type": "mixte"
                },
                {
                    "tier": 3,
                    "titre": "Horticulteur",
                    "postes": 6,
                    "salaire": {
                        "totalEnCuivre": 80
                    },
                    "prerequis": {
                        "prestige": 6
                    },
                    "gainsMensuels": {
                        "prestige": 0.4,
                        "stats": {
                            "intelligence": 0.7,
                            "force": 0.2,
                            "constitution": 0.4,
                            "dexterite": 0.6,
                            "sagesse": 0.8,
                            "charisme": 0.4
                        }
                    },
                    "type": "mixte"
                }
            ]
        },
        "Ménagerie de la Ville": {
            "description": "Parc abritant des créatures et des bêtes exotiques pour l'étude et le divertissement.",
            "providesTags": [
                "Bêtes Exotiques"
            ],
            "requiresTags": {
                "Gibier": {
                    "distance": 15
                },
                "Viande": {
                    "distance": 2
                },
                "Sécurité": {
                    "distance": 2
                }
            },
            "emplois": [
                {
                    "tier": 3,
                    "titre": "Maître des Bêtes",
                    "postes": 3,
                    "salaire": {
                        "totalEnCuivre": 105
                    },
                    "prerequis": {
                        "prestige": 14
                    },
                    "gainsMensuels": {
                        "prestige": 0.6,
                        "stats": {
                            "intelligence": 0.6,
                            "force": 0.7,
                            "constitution": 0.7,
                            "dexterite": 0.6,
                            "sagesse": 0.8,
                            "charisme": 0.6
                        }
                    },
                    "type": "mixte"
                },
                {
                    "tier": 4,
                    "titre": "Gardien de la Ménagerie",
                    "postes": 10,
                    "salaire": {
                        "totalEnCuivre": 70
                    },
                    "prerequis": {
                        "prestige": 4
                    },
                    "gainsMensuels": {
                        "prestige": 0.3,
                        "stats": {
                            "intelligence": 0.4,
                            "force": 0.6,
                            "constitution": 0.7,
                            "dexterite": 0.6,
                            "sagesse": 0.6,
                            "charisme": 0.4
                        }
                    },
                    "type": "mixte"
                }
            ]
        },
        "Quartier des Tanneurs": {
            "description": "Zone industrielle dédiée au traitement à grande échelle du cuir pour l'artisanat.",
            "providesTags": [
                "Cuir",
                "Fourrures Traitées"
            ],
            "requiresTags": {
                "Peaux Brutes": {
                    "distance": 2
                },
                "Fourrures": {
                    "distance": 2
                },
                "Herbes Communes": {
                    "distance": 10
                }
            },
            "emplois": [
                {
                    "tier": 3,
                    "titre": "Propriétaire de Tannerie",
                    "postes": 3,
                    "salaire": {
                        "totalEnCuivre": 110
                    },
                    "prerequis": {
                        "prestige": 10
                    },
                    "gainsMensuels": {
                        "prestige": 0.5,
                        "stats": {
                            "intelligence": 0.4,
                            "force": 0.8,
                            "constitution": 0.8,
                            "dexterite": 0.6,
                            "sagesse": 0.5,
                            "charisme": 0.3
                        }
                    },
                    "type": "mixte"
                },
                {
                    "tier": 4,
                    "titre": "Artisan du Cuir",
                    "postes": 10,
                    "salaire": {
                        "totalEnCuivre": 70
                    },
                    "prerequis": {
                        "prestige": 3
                    },
                    "gainsMensuels": {
                        "prestige": 0.3,
                        "stats": {
                            "intelligence": 0.2,
                            "force": 0.6,
                            "constitution": 0.7,
                            "dexterite": 0.7,
                            "sagesse": 0.3,
                            "charisme": 0.2
                        }
                    },
                    "type": "mixte"
                }
            ]
        },
        "Papeterie": {
            "description": "Fabrique du papier de haute qualité à partir de vieux tissus ou de pulpe de bois.",
            "providesTags": [
                "Papier"
            ],
            "requiresTags": {
                "Tissu": {
                    "distance": 10
                },
                "Planches": {
                    "distance": 10
                }
            },
            "emplois": [
                {
                    "tier": 3,
                    "titre": "Maître Papetier",
                    "postes": 1,
                    "salaire": {
                        "totalEnCuivre": 100
                    },
                    "prerequis": {
                        "prestige": 11
                    },
                    "gainsMensuels": {
                        "prestige": 0.5,
                        "stats": {
                            "intelligence": 0.5,
                            "force": 0.6,
                            "constitution": 0.6,
                            "dexterite": 0.6,
                            "sagesse": 0.6,
                            "charisme": 0.4
                        }
                    },
                    "type": "mixte"
                }
            ]
        },
        "Atelier d'Encre": {
            "description": "Prépare des encres de différentes couleurs à partir de suie, de gommes et de pigments.",
            "providesTags": [
                "Encre"
            ],
            "requiresTags": {
                "Charbon": {
                    "distance": 15
                },
                "Cire": {
                    "distance": 15
                },
                "Herbes Rares": {
                    "distance": 10
                }
            },
            "emplois": [
                {
                    "tier": 3,
                    "titre": "Maître Encreur",
                    "postes": 1,
                    "salaire": {
                        "totalEnCuivre": 90
                    },
                    "prerequis": {
                        "prestige": 10
                    },
                    "gainsMensuels": {
                        "prestige": 0.4,
                        "stats": {
                            "intelligence": 0.7,
                            "force": 0.2,
                            "constitution": 0.4,
                            "dexterite": 0.6,
                            "sagesse": 0.7,
                            "charisme": 0.3
                        }
                    },
                    "type": "mixte"
                }
            ]
        },
        "Carrières de la Cité": {
            "description": "De vastes carrières fournissant la pierre, le charbon et le minerai de fer nécessaires à l'industrie de la ville.",
            "providesTags": [
                "Pierre",
                "Charbon",
                "Minerai de Fer",
                "Pièces Métalliques",
                "Or Brut",
                "Argent Brut",
                "Gemmes Brutes"
            ],
            "requiresTags": {
                "Outils Simples": {
                    "distance": 5
                }
            },
            "emplois": [
                {
                    "tier": 3,
                    "titre": "Contremaître de Carrière",
                    "postes": 4,
                    "salaire": {
                        "totalEnCuivre": 85
                    },
                    "prerequis": {
                        "prestige": 9
                    },
                    "gainsMensuels": {
                        "prestige": 0.4,
                        "stats": {
                            "intelligence": 0.5,
                            "force": 0.7,
                            "constitution": 0.8,
                            "dexterite": 0.5,
                            "sagesse": 0.6,
                            "charisme": 0.5
                        }
                    },
                    "type": "mixte"
                }
            ]
        },
        "Forêts du Domaine": {
            "description": "Vastes forêts gérées par la cité pour un approvisionnement durable en bois et pour la chasse.",
            "providesTags": [
                "Bois",
                "Gibier",
                "Fourrures"
            ],
            "requiresTags": {
                "Administration": {
                    "distance": 4
                }
            },
            "emplois": [
                {
                    "tier": 3,
                    "titre": "Maître Forestier",
                    "postes": 2,
                    "salaire": {
                        "totalEnCuivre": 72
                    },
                    "prerequis": {
                        "prestige": 10
                    },
                    "gainsMensuels": {
                        "prestige": 0.5,
                        "stats": {
                            "intelligence": 0.5,
                            "force": 0.7,
                            "constitution": 0.8,
                            "dexterite": 0.6,
                            "sagesse": 0.8,
                            "charisme": 0.4
                        }
                    },
                    "type": "mixte"
                }
            ]
        }
    }
};