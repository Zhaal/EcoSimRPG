document.addEventListener('DOMContentLoaded', () => {
    // --- Clés de stockage et gestion utilisateur ---
    const CUSTOM_TAG_DEFINITIONS_KEY = 'ecoSimRPG_custom_tag_definitions';

    // --- Sélecteurs DOM ---
    const editorView = document.getElementById('editor-view');
    const categoryTreeList = document.getElementById('category-tree-list');
    const newCategoryPathInput = document.getElementById('new-category-path');
    const addCategoryBtn = document.getElementById('add-category-btn');
    const tagDetailsPanel = document.getElementById('tag-details-panel');
    const welcomePanel = document.getElementById('welcome-panel');
    const tagDetailsContent = document.getElementById('tag-details-content');
    const feedbackMessage = document.getElementById('feedback-message');

    let customTagDefinitions = {};
    let activeCategoryPath = null;
    const SEPARATOR = ' > ';
    
    // --- Gestion des définitions de Tags ---
    function loadDefinitions() {
        const storedDefinitions = localStorage.getItem(CUSTOM_TAG_DEFINITIONS_KEY);
        customTagDefinitions = storedDefinitions ? JSON.parse(storedDefinitions) : {};
    }

    function saveDefinitions() {
        // Le paramètre showFeedback a été retiré car la sauvegarde est toujours silencieuse.
        localStorage.setItem(CUSTOM_TAG_DEFINITIONS_KEY, JSON.stringify(customTagDefinitions));
        // L'affichage du message de succès manuel n'est plus nécessaire.
    }

    function displayFeedback(message, type) {
        feedbackMessage.textContent = message;
        feedbackMessage.className = `feedback ${type}`;
        feedbackMessage.style.opacity = '1';
        setTimeout(() => {
            feedbackMessage.style.opacity = '0';
        }, 3000);
    }
    
    // --- Rendu de l'interface ---
    function buildTree(paths) {
        const tree = {};
        paths.sort((a, b) => a.localeCompare(b)).forEach(path => {
            let currentLevel = tree;
            path.split(SEPARATOR).forEach(part => {
                if (!currentLevel[part]) {
                    currentLevel[part] = {};
                }
                currentLevel = currentLevel[part];
            });
        });
        return tree;
    }

    function createTreeHTML(node, path = '', depth = 0) {
        let html = '';
        Object.keys(node).sort().forEach(key => {
            const currentPath = path ? `${path}${SEPARATOR}${key}` : key;
            html += `
                <div class="category-node ${currentPath === activeCategoryPath ? 'active' : ''}" 
                     data-path="${currentPath}" 
                     style="padding-left: ${12 + depth * 20}px;">
                     <span class="category-node-name">${key}</span>
                     <button class="add-child-btn" data-path="${currentPath}" title="Ajouter une sous-catégorie">+</button>
                </div>
            `;
            html += createTreeHTML(node[key], currentPath, depth + 1);
        });
        return html;
    }


    function renderCategoryTree() {
        const paths = Object.keys(customTagDefinitions);
        const tree = buildTree(paths);
        const currentScroll = categoryTreeList.scrollTop;
        categoryTreeList.innerHTML = createTreeHTML(tree);
        categoryTreeList.scrollTop = currentScroll;
    }
    
    function renderTagDetails(path) {
        activeCategoryPath = path;
        const tags = customTagDefinitions[path] || [];

        welcomePanel.classList.add('hidden');
        tagDetailsContent.classList.remove('hidden');

        const tagsHTML = tags.length > 0 
            ? tags.map(tag => `
                <li class="tag-item" data-tag="${tag}">
                    <span>${tag}</span>
                    <button class="delete-tag-btn" title="Supprimer le tag">&times;</button>
                </li>
            `).join('')
            : '<p class="empty-message">Cette catégorie est vide. Ajoutez un tag pour commencer.</p>';

        tagDetailsContent.innerHTML = `
            <div class="category-header">
                <h2>${path.split(SEPARATOR).pop()}</h2>
                <button class="btn-delete delete-category-btn">Supprimer la Catégorie</button>
            </div>
            <ul class="tags-container">${tagsHTML}</ul>
            <div class="add-tag-form">
                <input type="text" class="new-tag-name" placeholder="Nom du nouveau tag...">
                <button class="add-tag-btn btn-secondary">+ Ajouter Tag</button>
            </div>
        `;
        renderCategoryTree();
        tagDetailsContent.querySelector('.new-tag-name')?.focus();
    }

    // --- Actions et Événements ---

    function commitNewSubCategory(inputField, parentPath) {
        const childName = inputField.value.trim();
        if (childName) {
            const newPath = `${parentPath}${SEPARATOR}${childName}`;
            if (customTagDefinitions[newPath]) {
                displayFeedback('Cette catégorie existe déjà.', 'error');
            } else {
                customTagDefinitions[newPath] = [];
                activeCategoryPath = newPath;
                saveDefinitions(); // Sauvegarde passive
                renderTagDetails(newPath);
            }
        }
        inputField.closest('.inline-input-node')?.remove();
    }

    function handleAddChildCategory(parentPath, parentNode) {
        document.querySelector('.inline-input-node')?.remove();

        const depth = parentPath.split(SEPARATOR).length;
        const inputNode = document.createElement('div');
        inputNode.className = 'inline-input-node';
        inputNode.style.marginLeft = `${12 + depth * 20}px`;
        inputNode.innerHTML = `<input type="text" class="inline-input" placeholder="Nom sous-catégorie...">`;
        
        parentNode.after(inputNode);
        const inputField = inputNode.querySelector('input');
        inputField.focus();

        inputField.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                commitNewSubCategory(inputField, parentPath);
            } else if (e.key === 'Escape') {
                inputNode.remove();
            }
        });

        inputField.addEventListener('blur', () => {
            setTimeout(() => commitNewSubCategory(inputField, parentPath), 150);
        });
    }
    
    function handleAddTopLevelCategory() {
        const path = newCategoryPathInput.value.trim();
        if (path) {
            if (!customTagDefinitions[path]) {
                customTagDefinitions[path] = [];
                newCategoryPathInput.value = '';
                activeCategoryPath = path;
                saveDefinitions(); // Sauvegarde passive
                renderTagDetails(path);
            } else {
                displayFeedback('Cette catégorie existe déjà.', 'error');
            }
        }
    }

    addCategoryBtn.addEventListener('click', handleAddTopLevelCategory);

    newCategoryPathInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); 
            handleAddTopLevelCategory();
        }
    });
    
    function handleAddTag() {
        if (!activeCategoryPath) return;
        const input = tagDetailsContent.querySelector('.new-tag-name');
        if (!input) return;

        const tagName = input.value.trim();
        if (tagName && !customTagDefinitions[activeCategoryPath].includes(tagName)) {
            customTagDefinitions[activeCategoryPath].push(tagName);
            customTagDefinitions[activeCategoryPath].sort((a,b) => a.localeCompare(b));
            input.value = '';
            saveDefinitions(); // Sauvegarde passive
            renderTagDetails(activeCategoryPath);
        } else if (tagName) {
             displayFeedback('Ce tag existe déjà dans cette catégorie.', 'error');
        }
    }
    
    categoryTreeList.addEventListener('click', e => {
        const node = e.target.closest('.category-node');
        if (!node) return;

        if (e.target.classList.contains('add-child-btn')) {
            e.stopPropagation();
            handleAddChildCategory(node.dataset.path, node);
        } else if (!document.querySelector('.inline-input-node')) {
            renderTagDetails(node.dataset.path);
        }
    });

    tagDetailsContent.addEventListener('click', e => {
        if (!activeCategoryPath) return;
        const target = e.target;

        if (target.classList.contains('delete-category-btn')) {
            if (confirm(`Vraiment supprimer la catégorie "${activeCategoryPath}" et ses tags ?`)) {
                delete customTagDefinitions[activeCategoryPath];
                activeCategoryPath = null;
                saveDefinitions(); // Sauvegarde passive
                tagDetailsContent.classList.add('hidden');
                welcomePanel.classList.remove('hidden');
                renderCategoryTree();
            }
        } else if (target.classList.contains('add-tag-btn')) {
            handleAddTag();
        } else if (target.closest('.delete-tag-btn')) {
            const tagItem = target.closest('.tag-item');
            const tagName = tagItem.dataset.tag;
            customTagDefinitions[activeCategoryPath] = customTagDefinitions[activeCategoryPath].filter(t => t !== tagName);
            saveDefinitions(); // Sauvegarde passive
            renderTagDetails(activeCategoryPath);
        }
    });

    tagDetailsContent.addEventListener('keydown', e => {
        if (e.target.classList.contains('new-tag-name') && e.key === 'Enter') {
            e.preventDefault();
            handleAddTag();
        }
    });
    
    // Initialisation
    loadDefinitions();
    renderCategoryTree();
});