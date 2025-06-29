document.addEventListener('DOMContentLoaded', () => {
    // Clés de stockage local
    const USER_KEY = 'ecoSimRPG_user';
    const CUSTOM_BUILDINGS_KEY = 'ecoSimRPG_custom_buildings';
    const CUSTOM_TAG_DEFINITIONS_KEY = 'ecoSimRPG_custom_tag_definitions';
    const SUBSCRIPTIONS_KEY = 'ecoSimRPG_subscriptions';

    // URL vers votre catalogue central sur GitHub
    const COMMUNITY_INDEX_URL = 'https://raw.githubusercontent.com/Zhaal/EcoSimRPG/main/partages/community-index.json';

    // Sélecteurs DOM
    const loginView = document.getElementById('login-view');
    const editorView = document.getElementById('editor-view');
    const loginForm = document.getElementById('login-form');
    const userInfoDisplay = document.getElementById('user-info');
    const logoutBtn = document.getElementById('logout-btn');
    const feedbackMessage = document.getElementById('feedback-message');
    
    const exportBtn = document.getElementById('export-btn');
    const importInput = document.getElementById('import-input');
    const importBtn = document.getElementById('import-btn');

    const subscriptionsList = document.getElementById('subscriptions-list');

    let currentUser = null;
    let subscriptions = [];

    // --- LOGIQUE D'AUTHENTIFICATION ---
    function checkUser() {
        const storedUser = localStorage.getItem(USER_KEY);
        if (storedUser) {
            currentUser = JSON.parse(storedUser);
            showEditor();
        } else {
            showLogin();
        }
    }

    function handleLogin(e) {
        e.preventDefault();
        currentUser = {
            pseudo: document.getElementById('user-pseudo').value,
            lastname: document.getElementById('user-lastname').value,
            password: document.getElementById('user-password').value
        };
        localStorage.setItem(USER_KEY, JSON.stringify(currentUser));
        showEditor();
    }

    function handleLogout() {
        currentUser = null;
        localStorage.removeItem(USER_KEY);
        showLogin();
    }

    function showLogin() {
        loginView.classList.remove('hidden');
        editorView.classList.add('hidden');
        if(loginForm) loginForm.reset();
    }

    function showEditor() {
        loginView.classList.add('hidden');
        editorView.classList.remove('hidden');
        userInfoDisplay.innerHTML = `Connecté : <br><strong>${currentUser.pseudo} ${currentUser.lastname}</strong>`;
        
        loadSubscriptions();
        renderAllSubscriptions();
        loadAndDisplayCommunityList();
    }

    function displayFeedback(message, type = 'success', duration = 3000) {
        feedbackMessage.textContent = message;
        feedbackMessage.className = `feedback ${type}`;
        feedbackMessage.style.opacity = '1';
        setTimeout(() => {
            feedbackMessage.style.opacity = '0';
        }, duration);
    }

    // --- LOGIQUE D'EXPORTATION ---
    function handleExport() {
        const customBuildings = JSON.parse(localStorage.getItem(CUSTOM_BUILDINGS_KEY) || '[]');
        const customTags = JSON.parse(localStorage.getItem(CUSTOM_TAG_DEFINITIONS_KEY) || '{}');

        if (customBuildings.length === 0 && Object.keys(customTags).length === 0) {
            displayFeedback("Vous n'avez aucune création à exporter.", 'error');
            return;
        }
        
        const exportData = {
            author: {
                pseudo: currentUser.pseudo,
                lastname: currentUser.lastname
            },
            timestamp: new Date().toISOString(),
            version: "1.0",
            content: {
                buildings: customBuildings,
                tags: customTags
            }
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const a = document.createElement('a');
        a.href = url;
        const filename = `ecosimrpg_share_${currentUser.pseudo.toLowerCase()}_${new Date().toISOString().slice(0,10)}.json`;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        displayFeedback('Fichier d\'exportation généré !', 'success');
    }

    // --- LOGIQUE D'IMPORTATION ---
    function handleImportClick() {
        importInput.click();
    }

    function handleFileImport(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);

                if (!importedData.author || !importedData.author.pseudo || !importedData.content) {
                   throw new Error("Format de fichier invalide.");
                }

                if (importedData.author.pseudo !== currentUser.pseudo || importedData.author.lastname !== currentUser.lastname) {
                    throw new Error(`Ce fichier appartient à ${importedData.author.pseudo} ${importedData.author.lastname}. Vous ne pouvez pas l'importer.`);
                }
                
                localStorage.setItem(CUSTOM_BUILDINGS_KEY, JSON.stringify(importedData.content.buildings || []));
                localStorage.setItem(CUSTOM_TAG_DEFINITIONS_KEY, JSON.stringify(importedData.content.tags || {}));

                displayFeedback('Données importées et remplacées avec succès !', 'success');

            } catch (error) {
                displayFeedback(`Erreur d'importation : ${error.message}`, 'error', 5000);
            } finally {
                importInput.value = '';
            }
        };
        reader.readAsText(file);
    }
    
    // --- NOUVELLE LOGIQUE DE CATALOGUE ET D'ABONNEMENT ---

    function loadSubscriptions() {
        subscriptions = JSON.parse(localStorage.getItem(SUBSCRIPTIONS_KEY) || '[]');
    }

    function saveSubscriptions() {
        localStorage.setItem(SUBSCRIPTIONS_KEY, JSON.stringify(subscriptions));
    }

    async function loadAndDisplayCommunityList() {
        const container = document.getElementById('community-list-container');
        try {
            const response = await fetch(COMMUNITY_INDEX_URL);
            if (!response.ok) throw new Error(`Erreur réseau: ${response.statusText}`);
            const communityPacks = await response.json();
            
            renderCommunityList(communityPacks);

        } catch (error) {
            console.error("Impossible de charger le catalogue de la communauté:", error);
            container.innerHTML = `<div class="error-feedback">Le catalogue de la communauté n'a pas pu être chargé.</div>`;
        }
    }

    function renderCommunityList(packs) {
        const container = document.getElementById('community-list-container');
        const subscribedUrls = new Set(subscriptions.map(sub => sub.url));

        let html = packs.map(pack => `
            <div class="community-pack">
                <div class="pack-checkbox">
                    <input type="checkbox" 
                           id="${pack.id}" 
                           data-url="${pack.url}" 
                           ${subscribedUrls.has(pack.url) ? 'checked' : ''}>
                </div>
                <label for="${pack.id}" class="pack-details">
                    <span class="pack-title">${pack.title}</span>
                    <span class="pack-author">par ${pack.author}</span>
                    <span class="pack-description">${pack.description}</span>
                </label>
            </div>
        `).join('');

        container.innerHTML = html;
        
        container.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', handleCheckboxChange);
        });
    }

    async function handleCheckboxChange(event) {
        const checkbox = event.target;
        const url = checkbox.dataset.url;

        if (checkbox.checked) {
            await handleSubscribe(url);
        } else {
            handleUnsubscribe(url);
        }
    }

    async function handleSubscribe(url) {
        if (!url || subscriptions.find(sub => sub.url === url)) return;
        
        displayFeedback(`Abonnement en cours...`, 'success', 1500);

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Le serveur a répondu: ${response.status}`);
            const data = await response.json();
            if (!data.author || !data.content) throw new Error("Format de fichier distant invalide.");

            const newSubscription = { id: `sub_${Date.now()}`, url, data };
            subscriptions.push(newSubscription);
            saveSubscriptions();
            renderAllSubscriptions();
            displayFeedback(`Abonnement à "${data.author.pseudo}" réussi !`, 'success');

        } catch (error) {
            console.error("Erreur d'abonnement:", error);
            displayFeedback(`Erreur : ${error.message}`, 'error');
            const checkbox = document.querySelector(`input[data-url="${url}"]`);
            if(checkbox) checkbox.checked = false;
        }
    }
    
    function handleUnsubscribe(url) {
        const subIndex = subscriptions.findIndex(sub => sub.url === url);
        if (subIndex > -1) {
            const authorName = subscriptions[subIndex].data.author.pseudo;
            subscriptions.splice(subIndex, 1);
            saveSubscriptions();
            renderAllSubscriptions();
            displayFeedback(`Vous n'êtes plus abonné à ${authorName}.`, 'success');
        }
    }
    
    function renderAllSubscriptions() {
        subscriptionsList.innerHTML = ''; 
        if (subscriptions.length === 0) {
            subscriptionsList.innerHTML = `
                 <div class="welcome-panel">
                    <h3>Abonnez-vous à une création</h3>
                    <p>Cochez une case dans le catalogue ci-dessus pour voir les bâtiments et tags créés par d'autres utilisateurs s'afficher ici.</p>
                </div>`;
        } else {
            const sortedSubs = [...subscriptions].sort((a, b) => a.data.author.pseudo.localeCompare(b.data.author.pseudo));
            sortedSubs.forEach(renderSubscriptionCard);
        }
    }

    function renderSubscriptionCard(subscription) {
        const { id, data } = subscription;
        const buildings = data.content.buildings || [];
        const tagCategories = Object.keys(data.content.tags || {});

        const buildingListHTML = buildings.length > 0
            ? `<ul>${buildings.map(b => `<li>${b.name} (${b.type})</li>`).join('')}</ul>`
            : `<p><em>Aucun bâtiment.</em></p>`;
            
        const tagListHTML = tagCategories.length > 0
            ? `<ul>${tagCategories.map(c => `<li>${c}</li>`).join('')}</ul>`
            : `<p><em>Aucune catégorie de tags.</em></p>`;
        
        const cardHTML = `
            <div class="subscription-card-header">
                <h4>Créations de ${data.author.pseudo} ${data.author.lastname}</h4>
                <span class="timestamp">Partagé le : ${new Date(data.timestamp).toLocaleDateString()}</span>
            </div>
            <div class="subscription-card-content">
                <div class="content-section">
                    <h5>Bâtiments Personnalisés (${buildings.length})</h5>
                    ${buildingListHTML}
                </div>
                <div class="content-section">
                    <h5>Catégories de Tags (${tagCategories.length})</h5>
                    ${tagListHTML}
                </div>
            </div>
        `;

        const cardContainer = document.createElement('div');
        cardContainer.className = 'subscription-card';
        cardContainer.id = id;
        cardContainer.innerHTML = cardHTML;
        subscriptionsList.appendChild(cardContainer);
    }

    // --- Initialisation des écouteurs d'événements ---
    loginForm.addEventListener('submit', handleLogin);
    logoutBtn.addEventListener('click', handleLogout);
    exportBtn.addEventListener('click', handleExport);
    importBtn.addEventListener('click', handleImportClick);
    importInput.addEventListener('change', handleFileImport);

    // Démarrage de l'application
    checkUser();
});