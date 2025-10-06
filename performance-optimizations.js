/**
 * EcoSimRPG - Performance Optimizations
 * Optimisations de performance pour le rendu Canvas et les calculs
 */

(function() {
    'use strict';

    // ==================== OPTIMISATIONS CANVAS ====================

    /**
     * Cache pour les centres d'hexagones
     * Évite les recalculs répétés
     */
    const hexCenterCache = new Map();

    /**
     * Version optimisée de getHexCenter avec cache
     */
    function getHexCenterOptimized(q, r, hexSize) {
        const key = `${q},${r}`;
        if (hexCenterCache.has(key)) {
            return hexCenterCache.get(key);
        }

        const center = {
            x: hexSize.w * q + hexSize.w / 2 * r,
            y: hexSize.h * 3/4 * r
        };

        hexCenterCache.set(key, center);
        return center;
    }

    /**
     * Nettoie le cache si trop grand (>1000 entrées)
     */
    function cleanHexCenterCache() {
        if (hexCenterCache.size > 1000) {
            const entriesToKeep = Array.from(hexCenterCache.entries()).slice(-500);
            hexCenterCache.clear();
            entriesToKeep.forEach(([key, value]) => hexCenterCache.set(key, value));
        }
    }

    // ==================== OPTIMISATION DES CALCULS ====================

    /**
     * Cache pour les distances axiales
     */
    const distanceCache = new Map();

    /**
     * Version optimisée de axialDistance avec cache
     */
    function axialDistanceOptimized(a, b) {
        if (!a || !b) return Infinity;

        const key = `${a.q},${a.r}-${b.q},${b.r}`;
        if (distanceCache.has(key)) {
            return distanceCache.get(key);
        }

        const dq = a.q - b.q;
        const dr = a.r - b.r;
        const ds = -dq - dr;
        const distance = (Math.abs(dq) + Math.abs(dr) + Math.abs(ds)) / 2;

        distanceCache.set(key, distance);
        return distance;
    }

    /**
     * Nettoie le cache des distances si trop grand
     */
    function cleanDistanceCache() {
        if (distanceCache.size > 1000) {
            distanceCache.clear();
        }
    }

    // ==================== DEBOUNCE & THROTTLE ====================

    /**
     * Debounce - Retarde l'exécution jusqu'à ce qu'il n'y ait plus d'appels
     */
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Throttle - Limite le nombre d'exécutions dans le temps
     */
    function throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // ==================== OPTIMISATION DU RENDU ====================

    /**
     * RequestAnimationFrame pool pour éviter les appels multiples
     */
    let rafId = null;
    let rafCallbacks = [];

    function optimizedRequestAnimationFrame(callback) {
        rafCallbacks.push(callback);

        if (rafId === null) {
            rafId = requestAnimationFrame(() => {
                const callbacks = rafCallbacks.slice();
                rafCallbacks = [];
                rafId = null;

                callbacks.forEach(cb => {
                    try {
                        cb();
                    } catch (e) {
                        console.error('RAF callback error:', e);
                    }
                });
            });
        }

        return rafId;
    }

    /**
     * Culling - Ne dessine que ce qui est visible
     */
    function getVisibleHexRange(canvas, view, hexSize) {
        const padding = 2; // Marge pour éviter les coupures

        // Calculer les coins du canvas dans l'espace monde
        const corners = [
            { x: -view.x / view.zoom, y: -view.y / view.zoom },
            { x: (canvas.width - view.x) / view.zoom, y: -view.y / view.zoom },
            { x: -view.x / view.zoom, y: (canvas.height - view.y) / view.zoom },
            { x: (canvas.width - view.x) / view.zoom, y: (canvas.height - view.y) / view.zoom }
        ];

        // Convertir en coordonnées hexagonales
        const hexCorners = corners.map(corner => {
            const r_frac = corner.y * 4 / (3 * hexSize.h);
            const q_frac = corner.x / hexSize.w - r_frac / 2;
            return {
                q: Math.round(q_frac),
                r: Math.round(r_frac)
            };
        });

        const qMin = Math.min(...hexCorners.map(c => c.q)) - padding;
        const qMax = Math.max(...hexCorners.map(c => c.q)) + padding;
        const rMin = Math.min(...hexCorners.map(c => c.r)) - padding;
        const rMax = Math.max(...hexCorners.map(c => c.r)) + padding;

        return { qMin, qMax, rMin, rMax };
    }

    // ==================== OPTIMISATION DES IMAGES ====================

    /**
     * Pré-calcul des dimensions d'image selon le zoom
     */
    const imageScaleCache = new Map();

    function getScaledImageDimensions(originalWidth, originalHeight, zoom) {
        const zoomLevel = Math.round(zoom * 10) / 10; // Arrondir pour le cache
        const key = `${originalWidth}x${originalHeight}@${zoomLevel}`;

        if (imageScaleCache.has(key)) {
            return imageScaleCache.get(key);
        }

        const dims = {
            width: originalWidth * zoom,
            height: originalHeight * zoom
        };

        imageScaleCache.set(key, dims);
        return dims;
    }

    // ==================== LAZY LOADING ====================

    /**
     * Charge les images de manière asynchrone avec priorité
     */
    function lazyLoadImage(src, priority = 'low') {
        return new Promise((resolve, reject) => {
            const img = new Image();

            // Utiliser l'attribut loading si disponible
            if ('loading' in HTMLImageElement.prototype) {
                img.loading = priority === 'high' ? 'eager' : 'lazy';
            }

            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    }

    // ==================== DÉTECTION DE PERFORMANCE ====================

    /**
     * Détecte si l'appareil est lent et ajuste les paramètres
     */
    function detectPerformance() {
        const fps = [];
        let lastTime = performance.now();
        let frameCount = 0;

        function measureFrame() {
            const now = performance.now();
            const delta = now - lastTime;
            lastTime = now;

            if (delta > 0) {
                fps.push(1000 / delta);
                frameCount++;

                if (frameCount >= 60) {
                    const avgFps = fps.reduce((a, b) => a + b, 0) / fps.length;
                    return avgFps;
                }
            }

            requestAnimationFrame(measureFrame);
        }

        return new Promise((resolve) => {
            measureFrame();
            setTimeout(() => {
                const avgFps = fps.reduce((a, b) => a + b, 0) / fps.length;
                resolve({
                    fps: avgFps,
                    isLowPerformance: avgFps < 30,
                    isHighPerformance: avgFps > 55
                });
            }, 1000);
        });
    }

    // ==================== BATCH RENDERING ====================

    /**
     * Regroupe les opérations de rendu similaires
     */
    class BatchRenderer {
        constructor(ctx) {
            this.ctx = ctx;
            this.batches = new Map();
        }

        addImage(img, x, y, w, h) {
            const key = img.src;
            if (!this.batches.has(key)) {
                this.batches.set(key, []);
            }
            this.batches.get(key).push({ img, x, y, w, h });
        }

        flush() {
            this.batches.forEach((items, key) => {
                items.forEach(({ img, x, y, w, h }) => {
                    this.ctx.drawImage(img, x, y, w, h);
                });
            });
            this.batches.clear();
        }
    }

    // ==================== WORKER POUR CALCULS LOURDS ====================

    /**
     * Crée un worker pour les calculs intensifs (si supporté)
     */
    function createCalculationWorker() {
        if (typeof Worker === 'undefined') {
            return null;
        }

        const workerCode = `
            self.onmessage = function(e) {
                const { type, data } = e.data;

                if (type === 'calculateDistances') {
                    const { places } = data;
                    const distances = {};

                    for (let i = 0; i < places.length; i++) {
                        for (let j = i + 1; j < places.length; j++) {
                            const a = places[i];
                            const b = places[j];
                            const dq = a.coords.q - b.coords.q;
                            const dr = a.coords.r - b.coords.r;
                            const ds = -dq - dr;
                            const dist = (Math.abs(dq) + Math.abs(dr) + Math.abs(ds)) / 2;

                            const key = [a.id, b.id].sort((x, y) => x - y).join('-');
                            distances[key] = dist;
                        }
                    }

                    self.postMessage({ type: 'distances', data: distances });
                }
            };
        `;

        const blob = new Blob([workerCode], { type: 'application/javascript' });
        return new Worker(URL.createObjectURL(blob));
    }

    // ==================== EXPORT GLOBAL ====================

    window.EcoSimOptimizations = {
        // Cache
        hexCenterCache,
        distanceCache,
        cleanHexCenterCache,
        cleanDistanceCache,

        // Fonctions optimisées
        getHexCenterOptimized,
        axialDistanceOptimized,

        // Utilitaires
        debounce,
        throttle,
        optimizedRequestAnimationFrame,

        // Rendu
        getVisibleHexRange,
        getScaledImageDimensions,
        BatchRenderer,

        // Performance
        detectPerformance,
        lazyLoadImage,
        createCalculationWorker
    };

    console.log('🚀 Optimisations de performance chargées');

})();
