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
})();
