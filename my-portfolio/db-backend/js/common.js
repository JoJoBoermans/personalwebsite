/**
 * Common JavaScript functionality for all portfolio pages
 * Works reliably across Visual Studio Code Live Server, GitHub Pages, and other platforms
 */

// Ensure functions are available globally for onclick handlers
(function(window) {
    'use strict';

    // Mobile menu functionality - works across all pages
    window.toggleMobileMenu = function() {
        const navMenu = document.getElementById('nav-menu');
        const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        const body = document.body;
        
        if (navMenu) {
            const isActive = navMenu.classList.contains('active');
            
            if (isActive) {
                navMenu.classList.remove('active');
                body.classList.remove('mobile-menu-open');
                if (mobileMenuBtn) {
                    mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
                }
            } else {
                navMenu.classList.add('active');
                body.classList.add('mobile-menu-open');
                if (mobileMenuBtn) {
                    mobileMenuBtn.innerHTML = '<i class="fas fa-times"></i>';
                }
            }
        }
    };

    window.closeMobileMenu = function() {
        const navMenu = document.getElementById('nav-menu');
        const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        const body = document.body;
        
        if (navMenu) {
            navMenu.classList.remove('active');
            body.classList.remove('mobile-menu-open');
            if (mobileMenuBtn) {
                mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
            }
        }
    };

    // Smooth scrolling for anchor links
    window.smoothScrollTo = function(target) {
        const element = document.querySelector(target);
        if (element) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    };

    // Initialize common functionality when DOM is ready
    function initializeCommon() {
        // Close mobile menu when clicking outside
        document.addEventListener('click', function(event) {
            const navMenu = document.getElementById('nav-menu');
            const nav = document.querySelector('.nav');
            
            if (navMenu && navMenu.classList.contains('active')) {
                if (!nav || !nav.contains(event.target)) {
                    window.closeMobileMenu();
                }
            }
        });

        // Close mobile menu on window resize to desktop size
        window.addEventListener('resize', function() {
            if (window.innerWidth > 900) {
                window.closeMobileMenu();
            }
        });

        // Enhanced smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const target = this.getAttribute('href');
                if (target && target !== '#') {
                    window.smoothScrollTo(target);
                }
            });
        });

        console.log('Common JavaScript initialized successfully');
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeCommon);
    } else {
        initializeCommon();
    }

})(window);