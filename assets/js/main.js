'use strict';

class SiteManager {
    constructor() {
        this.initializeVariables();
        this.setupEventListeners();
        this.initializeAnimations();
    }

    initializeVariables() {
        // DOM Elements
        this.navbar = document.querySelector('.navbar');
        this.mobileNavToggle = document.querySelector('.mobile-nav-toggle');
        this.navLinks = document.querySelector('.nav-links');
        this.statsItems = Array.from(document.querySelectorAll('.stat-item'));
        this.techItems = Array.from(document.querySelectorAll('.tech-item'));
        this.modelCards = Array.from(document.querySelectorAll('.model-card'));
        
        // State variables
        this.lastScrollPosition = window.pageYOffset;
        this.isNavVisible = true;
        this.isMobileMenuOpen = false;
        this.animatedElements = new WeakSet();
        
        // Animation frames
        this.scrollRAF = null;
        this.resizeRAF = null;
    }

    setupEventListeners() {
        // Optimized scroll handling
        window.addEventListener('scroll', () => {
            if (this.scrollRAF) return;
            this.scrollRAF = requestAnimationFrame(() => {
                this.handleScroll();
                this.scrollRAF = null;
            });
        });

        // Mobile navigation
        if (this.mobileNavToggle) {
            this.mobileNavToggle.addEventListener('click', () => this.toggleMobileNav());
            this.mobileNavToggle.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.toggleMobileNav();
                }
            });
        }

        // Close mobile menu on outside click
        document.addEventListener('click', (e) => {
            if (this.isMobileMenuOpen && 
                !e.target.closest('.nav-links') && 
                !e.target.closest('.mobile-nav-toggle')) {
                this.closeMobileNav();
            }
        });

        // Smooth scrolling
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => this.handleSmoothScroll(e));
        });

        // Window resize handling
        window.addEventListener('resize', () => {
            if (this.resizeRAF) return;
            this.resizeRAF = requestAnimationFrame(() => {
                this.handleResize();
                this.resizeRAF = null;
            });
        });

        // Escape key handling
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isMobileMenuOpen) {
                this.closeMobileNav();
            }
        });
    }

    handleScroll() {
        const currentScroll = window.pageYOffset;
        const scrollDelta = currentScroll - this.lastScrollPosition;

        // Navbar visibility
        if (currentScroll > 100) {
            if (scrollDelta > 0 && this.isNavVisible) {
                this.navbar.classList.add('nav-hidden');
                this.isNavVisible = false;
            } else if (scrollDelta < 0 && !this.isNavVisible) {
                this.navbar.classList.remove('nav-hidden');
                this.isNavVisible = true;
            }
        }

        // Navbar background
        this.navbar.classList.toggle('scrolled', currentScroll > 50);

        this.lastScrollPosition = currentScroll;
        this.animateOnScroll();
    }

    handleResize() {
        // Reset mobile menu on larger screens
        if (window.innerWidth > 768 && this.isMobileMenuOpen) {
            this.closeMobileNav();
        }

        // Update viewport height for mobile browsers
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }

    toggleMobileNav() {
        this.isMobileMenuOpen = !this.isMobileMenuOpen;
        this.mobileNavToggle.setAttribute('aria-expanded', this.isMobileMenuOpen);
        this.navLinks.classList.toggle('active');
        document.body.style.overflow = this.isMobileMenuOpen ? 'hidden' : '';
    }

    closeMobileNav() {
        this.isMobileMenuOpen = false;
        this.mobileNavToggle.setAttribute('aria-expanded', 'false');
        this.navLinks.classList.remove('active');
        document.body.style.overflow = '';
    }

    initializeAnimations() {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.2
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.animatedElements.has(entry.target)) {
                    this.animatedElements.add(entry.target);
                    entry.target.classList.add('animate');
                    
                    if (entry.target.classList.contains('stat-item')) {
                        this.animateValue(entry.target);
                    }
                }
            });
        }, observerOptions);

        document.querySelectorAll('.animate-on-scroll').forEach(element => {
            observer.observe(element);
        });

        // Initialize specific animations for stats and tech items
        if (this.statsItems.length) {
            this.initializeStatsCounter();
        }

        if (this.techItems.length) {
            this.initializeTechItems();
        }
    }

    animateValue(element) {
        const valueDisplay = element.querySelector('.stat-value');
        if (!valueDisplay) return;

        const value = parseFloat(element.dataset.value);
        const suffix = element.dataset.suffix || '';
        const duration = 2000;
        const steps = 60;
        const stepTime = duration / steps;
        
        let current = 0;
        let startTime = null;

        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;

            if (progress < duration) {
                current = (progress / duration) * value;
                valueDisplay.textContent = this.formatNumber(current) + suffix;
                requestAnimationFrame(animate);
            } else {
                valueDisplay.textContent = this.formatNumber(value) + suffix;
            }
        };

        requestAnimationFrame(animate);
    }

    formatNumber(number) {
        return number % 1 === 0 ? 
            Math.round(number).toLocaleString() : 
            number.toFixed(1);
    }

    initializeStatsCounter() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.animatedElements.has(entry.target)) {
                    this.animatedElements.add(entry.target);
                    this.animateValue(entry.target);
                }
            });
        }, {
            threshold: 0.5
        });

        this.statsItems.forEach(item => observer.observe(item));
    }

    initializeTechItems() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.animatedElements.has(entry.target)) {
                    this.animatedElements.add(entry.target);
                    entry.target.classList.add('animate');
                }
            });
        }, {
            threshold: 0.2
        });

        this.techItems.forEach(item => observer.observe(item));
    }

    handleSmoothScroll(e) {
        const targetId = e.currentTarget.getAttribute('href');
        if (targetId === '#') return;

        e.preventDefault();
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            if (this.isMobileMenuOpen) {
                this.closeMobileNav();
            }

            const headerOffset = this.navbar.offsetHeight;
            const elementPosition = targetElement.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    }

    animateOnScroll() {
        document.querySelectorAll('.animate-on-scroll:not(.animate)').forEach(element => {
            const position = element.getBoundingClientRect();
            
            if (position.top < window.innerHeight * 0.8) {
                element.classList.add('animate');
                
                if (element.classList.contains('stat-item') && !this.animatedElements.has(element)) {
                    this.animatedElements.add(element);
                    this.animateValue(element);
                }
            }
        });
    }
}

// Initialize site when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.site = new SiteManager();
});