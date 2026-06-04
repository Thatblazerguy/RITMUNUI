/**
 * RITMUNSOC — Premium Page Loader & Transition System
 * Handles the RITMUNLogo.png loader overlay on page load and between tab navigation.
 */

(function () {
    'use strict';

    // Helper to hide loader
    function hideLoader() {
        const loader = document.getElementById('page-loader');
        if (loader) {
            // Wait 500ms on load for visual comfort, then fade out
            setTimeout(() => {
                loader.style.opacity = '0';
                loader.style.pointerEvents = 'none';
            }, 500);
        }
    }

    // Helper to show loader and navigate
    function showLoaderAndNavigate(href) {
        const loader = document.getElementById('page-loader');
        if (loader) {
            // Snappy fade-in for exit transition
            loader.style.transition = 'opacity 400ms ease-in-out';
            loader.style.pointerEvents = 'auto';
            loader.style.opacity = '1';

            // Wait for fade-in to complete, then navigate
            setTimeout(() => {
                window.location.href = href;
            }, 400);
        } else {
            // Fallback if loader element is missing
            window.location.href = href;
        }
    }

    // Intercept clicks on links for smooth transition
    function setupNavTransitions() {
        document.addEventListener('click', function (e) {
            // Find closest anchor tag
            const anchor = e.target.closest('a');
            if (!anchor) return;

            const href = anchor.getAttribute('href');
            
            // Ignore if no href, external links, empty hashes, target="_blank", or javascript:
            if (!href) return;
            if (href.startsWith('#') || href.startsWith('javascript:')) return;
            if (anchor.getAttribute('target') === '_blank') return;
            if (anchor.hostname && anchor.hostname !== window.location.hostname) return;

            // Prevent default navigation and trigger loader transition
            e.preventDefault();
            showLoaderAndNavigate(href);
        });
    }

    // Run on script execution (DOMContentLoaded/Defer phase)
    if (document.readyState === 'complete') {
        hideLoader();
    } else {
        window.addEventListener('load', hideLoader);
    }

    // Handle back/forward cache (bfcache) to hide loader on history navigation
    window.addEventListener('pageshow', function (event) {
        if (event.persisted) {
            const loader = document.getElementById('page-loader');
            if (loader) {
                loader.style.opacity = '0';
                loader.style.pointerEvents = 'none';
            }
        }
    });

    // Initialize transitions
    setupNavTransitions();

    // ─── TextRoll Mobile Sidebar Animation ───
    function initMobileMenuTextRoll() {
        const style = document.createElement('style');
        style.innerHTML = `
            .text-roll-wrapper {
                position: relative;
                display: block;
                overflow: hidden;
                line-height: 1;
                padding-bottom: 0.1em;
            }
            .text-roll-row {
                display: flex;
            }
            .text-roll-row.absolute-row {
                position: absolute;
                inset: 0;
            }
            .text-roll-char {
                display: inline-block;
                transition: transform 500ms cubic-bezier(0.65, 0, 0.35, 1);
                transform: translateY(0);
            }
            .text-roll-row.absolute-row .text-roll-char {
                transform: translateY(100%);
            }
            .mobile-menu-link:hover .text-roll-row:not(.absolute-row) .text-roll-char {
                transform: translateY(-100%);
            }
            .mobile-menu-link:hover .text-roll-row.absolute-row .text-roll-char {
                transform: translateY(0);
            }
        `;
        document.head.appendChild(style);

        const links = document.querySelectorAll('#mobile-menu nav a');
        links.forEach(link => {
            const text = link.textContent.trim();
            link.textContent = '';
            // Ensure the link handles the inline-flex wrapper properly
            link.style.display = 'flex';
            link.style.alignItems = 'center';

            const wrapper = document.createElement('span');
            wrapper.className = 'text-roll-wrapper text-on-surface-variant group-hover:text-primary transition-colors';

            const row1 = document.createElement('div');
            row1.className = 'text-roll-row';

            const row2 = document.createElement('div');
            row2.className = 'text-roll-row absolute-row text-primary';

            const stagger = 0.035;
            const len = text.length;

            for (let i = 0; i < len; i++) {
                const l = text[i];
                const delay = stagger * Math.abs(i - (len - 1) / 2);
                
                const char1 = document.createElement('span');
                char1.className = 'text-roll-char';
                char1.textContent = l === ' ' ? '\u00A0' : l;
                char1.style.transitionDelay = `${delay}s`;
                
                const char2 = document.createElement('span');
                char2.className = 'text-roll-char';
                char2.textContent = l === ' ' ? '\u00A0' : l;
                char2.style.transitionDelay = `${delay}s`;

                row1.appendChild(char1);
                row2.appendChild(char2);
            }

            wrapper.appendChild(row1);
            wrapper.appendChild(row2);
            link.appendChild(wrapper);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMobileMenuTextRoll);
    } else {
        initMobileMenuTextRoll();
    }
})();
