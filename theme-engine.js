/**
 * Liquid Glass Diplomacy — Premium Theme Engine v2
 * Multi-strategy toggle injection, cross-portal persistence, canvas interception.
 */

(function () {
    'use strict';

    // ─── 1. Canvas 2D Prototype Interception ──────────────────────────────────

    const isLightMode = () =>
        document.body?.classList.contains('light-theme') ||
        document.documentElement.classList.contains('light-theme');

    // strokeStyle → pastel Wisteria / Blush
    const origStrokeDesc = Object.getOwnPropertyDescriptor(CanvasRenderingContext2D.prototype, 'strokeStyle');
    if (origStrokeDesc && origStrokeDesc.set) {
        Object.defineProperty(CanvasRenderingContext2D.prototype, 'strokeStyle', {
            get: origStrokeDesc.get,
            set: function (color) {
                if (isLightMode() && typeof color === 'string') {
                    const c = color.trim().toLowerCase();
                    if (c === '#22223b' || c === '#4a4e69')        color = 'rgba(180,159,204,0.35)';
                    else if (c === '#9a8c98' || c === '#c9ada7')   color = 'rgba(234,215,215,0.55)';
                }
                origStrokeDesc.set.call(this, color);
            }
        });
    }

    // fillStyle → Blush vignette on dark clears
    const origFillDesc = Object.getOwnPropertyDescriptor(CanvasRenderingContext2D.prototype, 'fillStyle');
    if (origFillDesc && origFillDesc.set) {
        Object.defineProperty(CanvasRenderingContext2D.prototype, 'fillStyle', {
            get: origFillDesc.get,
            set: function (color) {
                if (isLightMode() && typeof color === 'string') {
                    const c = color.trim().toLowerCase();
                    if (c === '#161310' || c === '#0b090a' || c === '#110e0b' || c === '#1a181b')
                        color = '#ead7d7';
                }
                origFillDesc.set.call(this, color);
            }
        });
    }

    // fillRect → radial vignette for full-screen clears
    const origFillRect = CanvasRenderingContext2D.prototype.fillRect;
    CanvasRenderingContext2D.prototype.fillRect = function (x, y, w, h) {
        if (isLightMode() && w >= this.canvas.width * 0.9 && h >= this.canvas.height * 0.9) {
            const g = this.createRadialGradient(
                this.canvas.width / 2, this.canvas.height / 2, 0,
                this.canvas.width / 2, this.canvas.height / 2,
                Math.max(this.canvas.width, this.canvas.height) * 0.8
            );
            g.addColorStop(0, '#ffffff');
            g.addColorStop(1, '#ead7d7');
            origFillDesc.set.call(this, g);
        }
        origFillRect.call(this, x, y, w, h);
    };

    // addColorStop → pastel gradient remapping
    const origAddColorStop = CanvasGradient.prototype.addColorStop;
    CanvasGradient.prototype.addColorStop = function (offset, color) {
        if (isLightMode() && typeof color === 'string') {
            const c = color.trim().toLowerCase();
            if (c === '#161310' || c === '#0b090a' || c === '#1a181b' || c === '#110e0b') color = '#ead7d7';
            else if (c === '#22223b' || c === '#2a2752')                                  color = '#ffffff';
            else if (c === '#c9ada7' || c === '#9a8c98')                                  color = 'rgba(180,159,204,0.35)';
        }
        origAddColorStop.call(this, offset, color);
    };

    // ─── 2. Theme State Application ───────────────────────────────────────────

    const LOGO_DARK  = 'RITMUNLogo.png';
    const LOGO_LIGHT = 'RITMUNLogo-light.png';

    function swapLogos(isLight) {
        // Swap every img whose src ends with our logo filenames
        document.querySelectorAll('img').forEach(img => {
            const src = img.getAttribute('src') || '';
            if (isLight && src.includes(LOGO_DARK) && !src.includes(LOGO_LIGHT)) {
                img.setAttribute('src', src.replace(LOGO_DARK, LOGO_LIGHT));
                img.dataset.logoSwapped = 'true';
            } else if (!isLight && img.dataset.logoSwapped === 'true' && src.includes(LOGO_LIGHT)) {
                img.setAttribute('src', src.replace(LOGO_LIGHT, LOGO_DARK));
                delete img.dataset.logoSwapped;
            }
        });
    }

    function applyTheme(isLight) {
        // Apply to both <html> and <body> for maximum CSS specificity coverage
        const action = isLight ? 'add' : 'remove';
        document.documentElement.classList[action]('light-theme');
        document.documentElement.classList[isLight ? 'remove' : 'add']('dark');
        if (document.body) {
            document.body.classList[action]('light-theme');
        }
        // Swap logo after class is applied (DOM may not be ready on first call)
        if (document.readyState !== 'loading') {
            swapLogos(isLight);
        } else {
            document.addEventListener('DOMContentLoaded', () => swapLogos(isLight), { once: true });
        }
        // Notify other scripts (e.g. TextPressure) that the theme changed
        document.dispatchEvent(new CustomEvent('themeChanged', { detail: { isLight } }));
    }

    function loadAndApply() {
        const stored = localStorage.getItem('ritmunsoc-theme');
        applyTheme(stored !== 'dark');
    }

    // Apply immediately to kill flash of unstyled dark content
    loadAndApply();

    // ─── 3. Build the Toggle Button ───────────────────────────────────────────

    function buildToggleBtn() {
        const btn = document.createElement('button');
        btn.id = 'theme-toggle-btn';
        btn.className = 'theme-toggle-btn';
        btn.setAttribute('aria-label', 'Toggle light / dark theme');
        btn.setAttribute('title', 'Toggle theme');

        // Dual-state SVG — paths rendered stacked, opacity toggled via CSS
        btn.innerHTML = `
            <svg class="theme-toggle-svg" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2"
                 stroke-linecap="round" stroke-linejoin="round"
                 aria-hidden="true">
                <!-- Sun (light-mode icon) -->
                <g class="sun-icon">
                    <circle cx="12" cy="12" r="5"/>
                    <line x1="12" y1="1"  x2="12" y2="3"/>
                    <line x1="12" y1="21" x2="12" y2="23"/>
                    <line x1="4.22" y1="4.22"  x2="5.64" y2="5.64"/>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                    <line x1="1"  y1="12" x2="3"  y2="12"/>
                    <line x1="21" y1="12" x2="23" y2="12"/>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                    <line x1="18.36" y1="5.64"  x2="19.78" y2="4.22"/>
                </g>
                <!-- Moon (dark-mode icon) -->
                <path class="moon-icon" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>`;

        btn.addEventListener('click', () => {
            const nowLight = document.body.classList.contains('light-theme');
            const next = !nowLight;
            localStorage.setItem('ritmunsoc-theme', next ? 'light' : 'dark');
            applyTheme(next);
        });

        return btn;
    }

    // ─── 4. Universal Multi-Strategy Injection ────────────────────────────────

    function inject() {
        // Avoid duplicates
        if (document.getElementById('theme-toggle-btn')) return;

        const btn = buildToggleBtn();

        // Strategy A: Standard pages — insert before the mobile hamburger button
        const hamburger = document.getElementById('mobile-menu-toggle');
        if (hamburger && hamburger.parentElement) {
            hamburger.parentElement.insertBefore(btn, hamburger);
            return;
        }

        // Strategy B: Dashboard pages — header flex row (profile pill is last child)
        const headerFlex = document.querySelector('header > div.flex');
        if (headerFlex) {
            headerFlex.appendChild(btn);
            return;
        }

        // Strategy C: Simple headers without a hamburger (e.g. resources-workspace)
        const headerEl = document.querySelector('header');
        if (headerEl) {
            // Find the rightmost block-level container inside header
            const rightDiv = headerEl.querySelector('div:last-child');
            if (rightDiv) {
                rightDiv.appendChild(btn);
            } else {
                headerEl.appendChild(btn);
            }
            return;
        }

        // Strategy D: Absolute fallback — fixed floating button bottom-right
        btn.style.cssText = `
            position: fixed;
            bottom: 24px;
            right: 24px;
            z-index: 9999;
        `;
        document.body.appendChild(btn);
    }

    // ─── 5. Run Injection ─────────────────────────────────────────────────────

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            inject();
            loadAndApply(); // re-apply after body is live
        });
    } else {
        inject();
        loadAndApply();
    }

})();
