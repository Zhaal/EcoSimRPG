/**
 * EcoSimRPG - Enhancements JavaScript
 * Nouvelles fonctionnalités : Mode sombre, Raccourcis clavier, Historique, Recherche, Statistiques
 */

(function() {
    'use strict';

    // ==================== CONFIGURATION ====================
    const STORAGE_KEYS = {
        THEME: 'ecoSimRPG_theme',
        HISTORY: 'ecoSimRPG_history',
        MAP_DATA: 'ecoSimRPG_map_data'
    };

    const MAX_HISTORY_SIZE = 50;

    // ==================== ÉTAT GLOBAL ====================
    const AppState = {
        theme: 'light',
        history: [],
        historyIndex: -1,
        searchResults: [],
        stats: {}
    };

    // ==================== MODE SOMBRE ====================
    class ThemeManager {
        constructor() {
            this.loadTheme();
            this.createToggleButton();
        }

        loadTheme() {
            const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME) || 'light';
            this.setTheme(savedTheme, false);
        }

        setTheme(theme, save = true) {
            AppState.theme = theme;
            document.documentElement.setAttribute('data-theme', theme);

            if (save) {
                localStorage.setItem(STORAGE_KEYS.THEME, theme);
            }

            this.updateToggleIcon();
        }

        toggleTheme() {
            const newTheme = AppState.theme === 'light' ? 'dark' : 'light';
            this.setTheme(newTheme);
            this.showNotification(`Mode ${newTheme === 'dark' ? 'sombre' : 'clair'} activé`, 'info');
        }

        createToggleButton() {
            const button = document.createElement('button');
            button.id = 'theme-toggle';
            button.setAttribute('aria-label', 'Changer le thème');
            button.innerHTML = '🌙';
            button.onclick = () => this.toggleTheme();
            document.body.appendChild(button);
        }

        updateToggleIcon() {
            const button = document.getElementById('theme-toggle');
            if (button) {
                button.innerHTML = AppState.theme === 'light' ? '🌙' : '☀️';
            }
        }

        showNotification(message, type = 'info') {
            const banner = document.getElementById('notification-banner');
            if (banner) {
                banner.textContent = message;
                banner.className = `notification-banner ${type} show`;
                setTimeout(() => banner.classList.remove('show'), 3000);
            }
        }
    }

    // ==================== HISTORIQUE (UNDO/REDO) ====================
    class HistoryManager {
        constructor() {
            this.createControls();
            this.loadHistory();
        }

        createControls() {
            const container = document.createElement('div');
            container.id = 'history-controls';
            container.innerHTML = `
                <button id="undo-btn" class="history-btn tooltip" title="Annuler (Ctrl+Z)" disabled>
                    ↶
                    <span class="tooltiptext">Annuler (Ctrl+Z)</span>
                </button>
                <button id="redo-btn" class="history-btn tooltip" title="Refaire (Ctrl+Y)" disabled>
                    ↷
                    <span class="tooltiptext">Refaire (Ctrl+Y)</span>
                </button>
            `;
            document.body.appendChild(container);

            document.getElementById('undo-btn').onclick = () => this.undo();
            document.getElementById('redo-btn').onclick = () => this.redo();
        }

        loadHistory() {
            try {
                const saved = localStorage.getItem(STORAGE_KEYS.HISTORY);
                if (saved) {
                    const data = JSON.parse(saved);
                    AppState.history = data.history || [];
                    AppState.historyIndex = data.index || -1;
                }
            } catch (e) {
                console.error('Erreur chargement historique:', e);
            }
            this.updateButtons();
        }

        saveHistory() {
            try {
                localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify({
                    history: AppState.history.slice(-MAX_HISTORY_SIZE),
                    index: AppState.historyIndex
                }));
            } catch (e) {
                console.error('Erreur sauvegarde historique:', e);
            }
        }

        saveState(description = 'Action') {
            try {
                const currentData = localStorage.getItem(STORAGE_KEYS.MAP_DATA);
                if (!currentData) return;

                // Supprimer l'historique après l'index actuel
                AppState.history = AppState.history.slice(0, AppState.historyIndex + 1);

                // Ajouter le nouvel état
                AppState.history.push({
                    data: currentData,
                    description,
                    timestamp: Date.now()
                });

                AppState.historyIndex = AppState.history.length - 1;

                // Limiter la taille
                if (AppState.history.length > MAX_HISTORY_SIZE) {
                    AppState.history.shift();
                    AppState.historyIndex--;
                }

                this.saveHistory();
                this.updateButtons();
            } catch (e) {
                console.error('Erreur sauvegarde état:', e);
            }
        }

        undo() {
            if (AppState.historyIndex <= 0) return;

            AppState.historyIndex--;
            this.restoreState();
            themeManager.showNotification('Action annulée', 'info');
        }

        redo() {
            if (AppState.historyIndex >= AppState.history.length - 1) return;

            AppState.historyIndex++;
            this.restoreState();
            themeManager.showNotification('Action rétablie', 'info');
        }

        restoreState() {
            const state = AppState.history[AppState.historyIndex];
            if (state) {
                localStorage.setItem(STORAGE_KEYS.MAP_DATA, state.data);
                location.reload(); // Recharger pour appliquer l'état
            }
            this.updateButtons();
        }

        updateButtons() {
            const undoBtn = document.getElementById('undo-btn');
            const redoBtn = document.getElementById('redo-btn');

            if (undoBtn) {
                undoBtn.disabled = AppState.historyIndex <= 0;
            }
            if (redoBtn) {
                redoBtn.disabled = AppState.historyIndex >= AppState.history.length - 1;
            }
        }
    }

    // ==================== RACCOURCIS CLAVIER ====================
    class KeyboardShortcuts {
        constructor() {
            this.shortcuts = {
                'ctrl+z': () => historyManager.undo(),
                'ctrl+y': () => historyManager.redo(),
                'ctrl+shift+z': () => historyManager.redo(),
                'ctrl+s': (e) => {
                    e.preventDefault();
                    const saveBtn = document.getElementById('save-json-btn');
                    if (saveBtn && !saveBtn.disabled) saveBtn.click();
                },
                'ctrl+o': (e) => {
                    e.preventDefault();
                    const loadBtn = document.getElementById('load-json-btn');
                    if (loadBtn) loadBtn.click();
                },
                'ctrl+f': (e) => {
                    e.preventDefault();
                    const searchInput = document.getElementById('place-search');
                    if (searchInput) searchInput.focus();
                },
                'ctrl+k': (e) => {
                    e.preventDefault();
                    this.toggleShortcutsPanel();
                },
                'ctrl+d': (e) => {
                    e.preventDefault();
                    themeManager.toggleTheme();
                },
                'esc': () => {
                    const panel = document.getElementById('keyboard-shortcuts-panel');
                    if (panel && panel.classList.contains('active')) {
                        panel.classList.remove('active');
                    }
                }
            };

            this.init();
            this.createShortcutsPanel();
        }

        init() {
            document.addEventListener('keydown', (e) => {
                const key = this.getKeyCombo(e);
                if (this.shortcuts[key]) {
                    this.shortcuts[key](e);
                }
            });
        }

        getKeyCombo(e) {
            const parts = [];
            if (e.ctrlKey) parts.push('ctrl');
            if (e.shiftKey) parts.push('shift');
            if (e.altKey) parts.push('alt');

            const key = e.key.toLowerCase();
            if (key !== 'control' && key !== 'shift' && key !== 'alt') {
                parts.push(key === 'escape' ? 'esc' : key);
            }

            return parts.join('+');
        }

        toggleShortcutsPanel() {
            const panel = document.getElementById('keyboard-shortcuts-panel');
            if (panel) {
                panel.classList.toggle('active');
            }
        }

        createShortcutsPanel() {
            const panel = document.createElement('div');
            panel.id = 'keyboard-shortcuts-panel';
            panel.innerHTML = `
                <h2 style="margin-top:0; color: var(--accent-gold);">⌨️ Raccourcis Clavier</h2>
                <div class="shortcut-item">
                    <span>Annuler</span>
                    <span class="shortcut-key">Ctrl + Z</span>
                </div>
                <div class="shortcut-item">
                    <span>Refaire</span>
                    <span class="shortcut-key">Ctrl + Y</span>
                </div>
                <div class="shortcut-item">
                    <span>Sauvegarder</span>
                    <span class="shortcut-key">Ctrl + S</span>
                </div>
                <div class="shortcut-item">
                    <span>Charger</span>
                    <span class="shortcut-key">Ctrl + O</span>
                </div>
                <div class="shortcut-item">
                    <span>Rechercher</span>
                    <span class="shortcut-key">Ctrl + F</span>
                </div>
                <div class="shortcut-item">
                    <span>Mode sombre</span>
                    <span class="shortcut-key">Ctrl + D</span>
                </div>
                <div class="shortcut-item">
                    <span>Raccourcis</span>
                    <span class="shortcut-key">Ctrl + K</span>
                </div>
                <div class="shortcut-item">
                    <span>Fermer panneau</span>
                    <span class="shortcut-key">Esc</span>
                </div>
                <button onclick="this.parentElement.classList.remove('active')"
                        style="margin-top: 20px; width: 100%; padding: 10px;
                               background: var(--accent-gold); border: 2px solid var(--border-color);
                               border-radius: 8px; cursor: pointer; font-weight: bold;">
                    Fermer
                </button>
            `;
            document.body.appendChild(panel);

            // Bouton pour ouvrir les raccourcis
            const helpBtn = document.createElement('button');
            helpBtn.innerHTML = '❓';
            helpBtn.className = 'tooltip';
            helpBtn.style.cssText = `
                position: fixed; bottom: 80px; left: 20px;
                width: 45px; height: 45px; border-radius: 50%;
                background: var(--accent-gold); border: 2px solid var(--border-color);
                cursor: pointer; font-size: 20px; z-index: 9997;
                box-shadow: 0 4px 12px var(--shadow-color);
            `;
            helpBtn.onclick = () => this.toggleShortcutsPanel();
            helpBtn.innerHTML += '<span class="tooltiptext">Aide & Raccourcis (Ctrl+K)</span>';
            document.body.appendChild(helpBtn);
        }
    }

    // ==================== RECHERCHE DE LIEUX ====================
    class SearchManager {
        constructor() {
            this.createSearchBar();
        }

        createSearchBar() {
            // Vérifier si on est sur step1.html
            const placesList = document.getElementById('places-list');
            if (!placesList) return;

            const container = document.createElement('div');
            container.id = 'search-container';
            container.className = 'tooltip';
            container.innerHTML = `
                <input type="text" id="place-search" placeholder="Rechercher un lieu..."
                       autocomplete="off" />
                <span id="search-icon">🔍</span>
                <span class="tooltiptext">Rechercher un lieu par nom (Ctrl+F)</span>
            `;

            placesList.parentElement.insertBefore(container, placesList);

            const input = document.getElementById('place-search');
            input.addEventListener('input', (e) => this.search(e.target.value));
        }

        search(query) {
            const placeItems = document.querySelectorAll('.place-item');
            const normalizedQuery = query.toLowerCase().trim();

            placeItems.forEach(item => {
                const placeName = item.querySelector('.place-name')?.textContent.toLowerCase() || '';
                const matches = placeName.includes(normalizedQuery);

                if (query === '') {
                    item.style.display = '';
                    item.classList.remove('search-result-highlight');
                } else if (matches) {
                    item.style.display = '';
                    item.classList.add('search-result-highlight');
                } else {
                    item.style.display = 'none';
                    item.classList.remove('search-result-highlight');
                }
            });
        }
    }

    // ==================== STATISTIQUES ====================
    class StatsManager {
        constructor() {
            this.createStatsPanel();
        }

        createStatsPanel() {
            // Vérifier si on est sur une page avec des régions
            if (!document.getElementById('region-select')) return;

            const panel = document.createElement('div');
            panel.id = 'stats-panel';
            panel.innerHTML = '<h3 style="margin-top:0; color: var(--accent-gold);">📊 Statistiques</h3>';
            document.body.appendChild(panel);

            const toggle = document.createElement('button');
            toggle.id = 'stats-toggle';
            toggle.className = 'tooltip';
            toggle.innerHTML = '📊 Stats<span class="tooltiptext">Afficher les statistiques</span>';
            toggle.onclick = () => this.togglePanel();
            document.body.appendChild(toggle);

            setInterval(() => this.updateStats(), 2000);
        }

        togglePanel() {
            const panel = document.getElementById('stats-panel');
            if (panel) {
                panel.classList.toggle('active');
            }
        }

        updateStats() {
            const panel = document.getElementById('stats-panel');
            if (!panel || !panel.classList.contains('active')) return;

            try {
                const data = localStorage.getItem(STORAGE_KEYS.MAP_DATA);
                if (!data) return;

                const regions = JSON.parse(data);
                const stats = this.calculateStats(regions);
                this.renderStats(stats);
            } catch (e) {
                console.error('Erreur calcul stats:', e);
            }
        }

        calculateStats(regions) {
            let totalPlaces = 0;
            let totalRoads = 0;
            let totalPopulation = 0;
            let placeTypes = {};

            regions.forEach(region => {
                totalPlaces += region.places?.length || 0;
                totalRoads += Object.keys(region.roads || {}).length;

                region.places?.forEach(place => {
                    placeTypes[place.type] = (placeTypes[place.type] || 0) + 1;
                    if (place.demographics?.population) {
                        totalPopulation += place.demographics.population.length;
                    }
                });
            });

            return {
                regions: regions.length,
                totalPlaces,
                totalRoads,
                totalPopulation,
                placeTypes
            };
        }

        renderStats(stats) {
            const panel = document.getElementById('stats-panel');
            if (!panel) return;

            let html = '<h3 style="margin-top:0; color: var(--accent-gold);">📊 Statistiques</h3>';

            html += '<div class="stat-card"><h4>Vue d\'ensemble</h4>';
            html += `<div class="stat-item"><span>Régions</span><span class="stat-value">${stats.regions}</span></div>`;
            html += `<div class="stat-item"><span>Lieux totaux</span><span class="stat-value">${stats.totalPlaces}</span></div>`;
            html += `<div class="stat-item"><span>Routes</span><span class="stat-value">${stats.totalRoads}</span></div>`;
            html += `<div class="stat-item"><span>Population</span><span class="stat-value">${stats.totalPopulation}</span></div>`;
            html += '</div>';

            if (Object.keys(stats.placeTypes).length > 0) {
                html += '<div class="stat-card"><h4>Types de lieux</h4>';
                for (const [type, count] of Object.entries(stats.placeTypes)) {
                    html += `<div class="stat-item"><span>${type}</span><span class="stat-value">${count}</span></div>`;
                }
                html += '</div>';
            }

            panel.innerHTML = html;
        }
    }

    // ==================== EXPORT/IMPORT COMPLET ====================
    class ExportImportManager {
        constructor() {
            this.enhanceExportImport();
        }

        enhanceExportImport() {
            const topBar = document.getElementById('top-bar');
            if (!topBar) return;

            // Bouton export complet
            const exportAllBtn = document.createElement('button');
            exportAllBtn.id = 'export-all-btn';
            exportAllBtn.className = 'tooltip';
            exportAllBtn.innerHTML = '💾 Tout exporter<span class="tooltiptext">Exporter toutes les régions (Ctrl+Shift+S)</span>';
            exportAllBtn.onclick = () => this.exportAll();

            // Bouton import complet
            const importAllBtn = document.createElement('button');
            importAllBtn.id = 'import-all-btn';
            importAllBtn.className = 'tooltip';
            importAllBtn.innerHTML = '📂 Tout importer<span class="tooltiptext">Importer toutes les régions</span>';
            importAllBtn.onclick = () => this.importAll();

            const controlGroup = document.createElement('div');
            controlGroup.className = 'control-group';
            controlGroup.appendChild(exportAllBtn);
            controlGroup.appendChild(importAllBtn);
            topBar.appendChild(controlGroup);

            // Input caché pour l'import
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.id = 'import-all-file';
            fileInput.accept = '.json';
            fileInput.style.display = 'none';
            fileInput.onchange = (e) => this.handleImportFile(e);
            document.body.appendChild(fileInput);
        }

        exportAll() {
            try {
                const allData = {
                    regions: JSON.parse(localStorage.getItem(STORAGE_KEYS.MAP_DATA) || '[]'),
                    customBuildings: localStorage.getItem('ecoSimRPG_buildings_custom'),
                    customRaces: localStorage.getItem('ecoSimRPG_races_custom'),
                    theme: localStorage.getItem(STORAGE_KEYS.THEME),
                    exportDate: new Date().toISOString(),
                    version: '1.0'
                };

                const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `EcoSimRPG_Complete_${Date.now()}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);

                themeManager.showNotification('Export complet réussi !', 'success');
            } catch (e) {
                console.error('Erreur export:', e);
                themeManager.showNotification('Erreur lors de l\'export', 'error');
            }
        }

        importAll() {
            document.getElementById('import-all-file').click();
        }

        handleImportFile(e) {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);

                    if (!confirm('Voulez-vous vraiment importer ces données ? Cela remplacera toutes vos données actuelles.')) {
                        return;
                    }

                    if (data.regions) {
                        localStorage.setItem(STORAGE_KEYS.MAP_DATA, JSON.stringify(data.regions));
                    }
                    if (data.customBuildings) {
                        localStorage.setItem('ecoSimRPG_buildings_custom', data.customBuildings);
                    }
                    if (data.customRaces) {
                        localStorage.setItem('ecoSimRPG_races_custom', data.customRaces);
                    }
                    if (data.theme) {
                        localStorage.setItem(STORAGE_KEYS.THEME, data.theme);
                    }

                    themeManager.showNotification('Import réussi ! Rechargement...', 'success');
                    setTimeout(() => location.reload(), 1500);
                } catch (error) {
                    console.error('Erreur import:', error);
                    themeManager.showNotification('Erreur lors de l\'import', 'error');
                }
            };
            reader.readAsText(file);
        }
    }

    // ==================== INITIALISATION ====================
    let themeManager, historyManager, keyboardShortcuts, searchManager, statsManager, exportImportManager;

    function init() {
        console.log('🚀 EcoSimRPG Enhancements chargés');

        themeManager = new ThemeManager();
        historyManager = new HistoryManager();
        keyboardShortcuts = new KeyboardShortcuts();
        searchManager = new SearchManager();
        statsManager = new StatsManager();
        exportImportManager = new ExportImportManager();

        // Sauvegarder l'état initial après un court délai
        setTimeout(() => {
            historyManager.saveState('État initial');
        }, 1000);

        // Intercepter les sauvegardes pour l'historique
        window.addEventListener('storage', (e) => {
            if (e.key === STORAGE_KEYS.MAP_DATA) {
                historyManager.saveState('Modification');
            }
        });
    }

    // Attendre le chargement du DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Exposer globalement pour utilisation externe
    window.EcoSimEnhancements = {
        themeManager,
        historyManager,
        keyboardShortcuts,
        searchManager,
        statsManager,
        exportImportManager
    };

})();
