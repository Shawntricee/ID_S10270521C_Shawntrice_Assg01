class SiteManager {
    constructor() {
        this.initializeVariables();
        this.setupEventListeners();
        this.initializeAnimations();
    }

    initializeVariables() {
        this.navbar = document.querySelector('.navbar');
        this.mobileNavToggle = document.querySelector('.mobile-nav-toggle');
        this.navLinks = document.querySelector('.nav-links');
        
        this.contactForm = document.getElementById('contactForm');
        
        this.timelineItems = document.querySelectorAll('.timeline-item');
        
        this.statsItems = document.querySelectorAll('.stat-item');
        
        this.lastScrollPosition = 0;
    }

    setupEventListeners() {
        if (this.mobileNavToggle) {
            this.mobileNavToggle.addEventListener('click', () => this.toggleMobileNav());
        }

        window.addEventListener('scroll', () => this.handleScroll());

        if (this.contactForm) {
            this.contactForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }

        document.addEventListener('click', (e) => {
            if (this.navLinks && this.navLinks.classList.contains('active')) {
                if (!e.target.closest('.nav-links') && !e.target.closest('.mobile-nav-toggle')) {
                    this.navLinks.classList.remove('active');
                }
            }
        });

        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => this.handleSmoothScroll(e));
        });
    }

    toggleMobileNav() {
        this.navLinks.classList.toggle('active');
        this.mobileNavToggle.classList.toggle('active');
    }

    handleScroll() {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 50) {
            this.navbar.classList.add('scrolled');
        } else {
            this.navbar.classList.remove('scrolled');
        }

        if (currentScroll > this.lastScrollPosition && currentScroll > 500) {
            this.navbar.classList.add('nav-hidden');
        } else {
            this.navbar.classList.remove('nav-hidden');
        }

        this.lastScrollPosition = currentScroll;

        this.animateOnScroll();
    }

    async handleFormSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const submitBtn = form.querySelector('button[type="submit"]');
        
        if (!this.validateForm(form)) return;

        try {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';

            await new Promise(resolve => setTimeout(resolve, 1500));
            
            this.showNotification('Message sent successfully!', 'success');
            form.reset();
        } catch (error) {
            this.showNotification('Failed to send message. Please try again.', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Send Message';
        }
    }

    validateForm(form) {
        let isValid = true;
        const fields = form.querySelectorAll('input, textarea');

        fields.forEach(field => {
            if (field.hasAttribute('required') && !field.value.trim()) {
                this.showFieldError(field, 'This field is required');
                isValid = false;
            }

            if (field.type === 'email' && field.value.trim()) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(field.value)) {
                    this.showFieldError(field, 'Please enter a valid email address');
                    isValid = false;
                }
            }
        });

        return isValid;
    }

    showFieldError(field, message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        
        const existingError = field.parentElement.querySelector('.error-message');
        if (existingError) existingError.remove();
        
        field.parentElement.appendChild(errorDiv);
        field.classList.add('error');

        setTimeout(() => {
            errorDiv.remove();
            field.classList.remove('error');
        }, 3000);
    }

    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    handleSmoothScroll(e) {
        const targetId = e.currentTarget.getAttribute('href');
        if (targetId === '#') return;

        e.preventDefault();
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });

            if (this.navLinks) {
                this.navLinks.classList.remove('active');
            }
        }
    }

    initializeAnimations() {
        this.setupScrollAnimations();
        
        if (this.statsItems.length) {
            this.initializeStatsCounter();
        }

        if (this.timelineItems.length) {
            this.initializeTimelineAnimations();
        }
    }

    setupScrollAnimations() {
        const options = {
            root: null,
            rootMargin: '0px',
            threshold: 0.2
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate');
                    observer.unobserve(entry.target);
                }
            });
        }, options);

        document.querySelectorAll('.animate-on-scroll').forEach(element => {
            observer.observe(element);
        });
    }

    initializeStatsCounter() {
        const options = {
            root: null,
            rootMargin: '0px',
            threshold: 0.5
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateValue(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, options);

        this.statsItems.forEach(item => observer.observe(item));
    }

    animateValue(element) {
        const value = element.dataset.value;
        const suffix = element.dataset.suffix || '';
        const duration = 2000;
        const steps = 50;
        const stepValue = value / steps;
        let current = 0;

        const timer = setInterval(() => {
            current += stepValue;
            if (current >= value) {
                element.textContent = value + suffix;
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current) + suffix;
            }
        }, duration / steps);
    }

    initializeTimelineAnimations() {
        const options = {
            root: null,
            rootMargin: '-50px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target);
                }
            });
        }, options);

        this.timelineItems.forEach(item => observer.observe(item));
    }

    animateOnScroll() {
        const animatedElements = document.querySelectorAll('.scroll-animate:not(.animated)');
        
        animatedElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementBottom = element.getBoundingClientRect().bottom;
            
            if (elementTop < window.innerHeight && elementBottom > 0) {
                element.classList.add('animated');
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const site = new SiteManager();
});