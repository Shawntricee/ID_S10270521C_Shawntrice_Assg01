'use strict';

class GalleryManager {
    constructor() {
        this.initializeVariables();
        this.setupEventListeners();
        this.initializeLayout();
        this.initializeVideoSection();
    }

    initializeVariables() {
        // DOM Elements
        this.filterButtons = document.querySelectorAll('.filter-btn');
        this.galleryItems = document.querySelectorAll('.gallery-item');
        this.searchInput = document.querySelector('.search-input');
        this.modal = document.getElementById('carModal');
        this.modalContent = this.modal?.querySelector('.modal-content');
        this.closeButton = this.modal?.querySelector('.close-button');
        
        // State management
        this.currentFilter = 'all';
        this.isModalOpen = false;
        this.activeFilters = new Set(['all']);
        this.lastScrollPosition = window.pageYOffset;
        
        // Performance optimization
        this.searchDebounceTimer = null;
        this.scrollRAF = null;
        this.resizeRAF = null;
    }

    initializeVideoSection() {
        // Get video section elements
        const videoSection = document.querySelector('.video-showcase');
        const videoContainer = document.querySelector('.video-container');
        
        if (!videoSection || !videoContainer) return;

        // Intersection Observer for video section
        const videoObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Add animation class when section is visible
                    entry.target.classList.add('animate');
                    
                    // Load video iframe when section is visible (optimization)
                    const iframe = entry.target.querySelector('iframe');
                    if (iframe && !iframe.src) {
                        iframe.src = iframe.dataset.src;
                    }
                    
                    videoObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.2,
            rootMargin: '50px'
        });

        // Observe video section
        videoObserver.observe(videoSection);

        // Performance optimization for video loading
        this.optimizeVideoLoading();

        // Add scroll-based parallax effect
        this.initializeParallaxEffect();
    }

    optimizeVideoLoading() {
        const iframe = document.querySelector('.video-container iframe');
        if (!iframe) return;

        // Store the src in data attribute for lazy loading
        iframe.dataset.src = iframe.src;
        iframe.removeAttribute('src');

        // Add loading class for animation
        iframe.closest('.video-container').classList.add('loading');
    }

    initializeParallaxEffect() {
        const videoSection = document.querySelector('.video-showcase');
        if (!videoSection) return;

        window.addEventListener('scroll', () => {
            if (this.scrollRAF) return;
            
            this.scrollRAF = requestAnimationFrame(() => {
                const scrolled = window.pageYOffset;
                const rate = scrolled * 0.3;
                
                if (window.innerWidth > 768) { // Only on desktop
                    videoSection.style.transform = `translateY(${rate}px)`;
                }
                
                this.scrollRAF = null;
            });
        });
    }

    setupEventListeners() {
        // Filter buttons
        this.filterButtons.forEach(button => {
            button.addEventListener('click', (e) => this.handleFilter(e));
            
            // Keyboard accessibility
            button.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.handleFilter(e);
                }
            });
        });

        // Search functionality
        if (this.searchInput) {
            this.searchInput.addEventListener('input', () => {
                clearTimeout(this.searchDebounceTimer);
                this.searchDebounceTimer = setTimeout(() => {
                    this.filterItems();
                }, 300);
            });
        }

        // Modal handling
        this.galleryItems.forEach(item => {
            const detailsButton = item.querySelector('.view-details-btn');
            if (detailsButton) {
                detailsButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.openModal(item);
                });
            }
        });

        if (this.modal) {
            // Close button
            this.closeButton?.addEventListener('click', () => this.closeModal());
            
            // Click outside
            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal) {
                    this.closeModal();
                }
            });
            
            // Escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.isModalOpen) {
                    this.closeModal();
                }
            });
        }

        // Optimized scroll handling
        window.addEventListener('scroll', () => {
            if (this.scrollRAF) return;
            this.scrollRAF = requestAnimationFrame(() => {
                this.handleScroll();
                this.scrollRAF = null;
            });
        });

        // Optimized resize handling
        window.addEventListener('resize', () => {
            if (this.resizeRAF) return;
            this.resizeRAF = requestAnimationFrame(() => {
                this.handleResize();
                this.resizeRAF = null;
            });
        });

        // Handle image loading
        this.setupLazyLoading();
    }

    initializeLayout() {
        // Show all items initially
        this.galleryItems.forEach(item => {
            item.classList.add('show');
            this.fadeInElement(item);
        });

        // Set initial active filter
        const defaultFilter = document.querySelector('.filter-btn[data-filter="all"]');
        if (defaultFilter) {
            defaultFilter.classList.add('active');
        }

        // Initialize masonry layout if needed
        this.initializeMasonryLayout();
    }

    handleFilter(e) {
        const button = e.target;
        const filter = button.getAttribute('data-filter');

        // Update UI
        this.filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        // Update state
        this.currentFilter = filter;
        this.filterItems();

        // Smooth scroll to gallery section
        document.querySelector('.gallery-section')?.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }

    filterItems() {
        const searchTerm = this.searchInput?.value.toLowerCase() || '';
        
        this.galleryItems.forEach(item => {
            const title = item.querySelector('h2')?.textContent.toLowerCase() || '';
            const description = item.querySelector('p')?.textContent.toLowerCase() || '';
            const category = item.getAttribute('data-category');
            
            const matchesFilter = this.currentFilter === 'all' || category === this.currentFilter;
            const matchesSearch = title.includes(searchTerm) || description.includes(searchTerm);

            if (matchesFilter && matchesSearch) {
                this.showItem(item);
            } else {
                this.hideItem(item);
            }
        });

        // Update layout after filtering
        this.updateLayout();
    }

    showItem(item) {
        item.classList.add('show');
        this.fadeInElement(item);
    }

    hideItem(item) {
        item.classList.remove('show');
        item.style.opacity = '0';
    }

    fadeInElement(element, delay = 0) {
        setTimeout(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, delay);
    }

    openModal(item) {
        if (!this.modal) return;

        const image = item.querySelector('img')?.src;
        const title = item.querySelector('h2')?.textContent;
        const description = item.querySelector('p')?.textContent;

        const modalImage = this.modal.querySelector('.modal-image');
        const modalTitle = this.modal.querySelector('.modal-title');
        const modalDescription = this.modal.querySelector('.modal-description');

        if (modalImage) modalImage.src = image || '';
        if (modalTitle) modalTitle.textContent = title || '';
        if (modalDescription) modalDescription.textContent = description || '';

        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        this.isModalOpen = true;

        // Focus management
        this.closeButton?.focus();
    }

    closeModal() {
        if (!this.modal) return;

        this.modal.classList.remove('active');
        document.body.style.overflow = '';
        this.isModalOpen = false;

        // Return focus
        const activeItem = document.querySelector('.gallery-item.active');
        activeItem?.querySelector('.view-details-btn')?.focus();
    }

    setupLazyLoading() {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    const dataSrc = img.getAttribute('data-src');
                    if (dataSrc) {
                        img.src = dataSrc;
                        img.removeAttribute('data-src');
                        imageObserver.unobserve(img);
                    }
                }
            });
        }, {
            rootMargin: '50px'
        });

        document.querySelectorAll('.gallery-item img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }

    initializeMasonryLayout() {
        // Optional: Add masonry layout if needed
        // This is a placeholder for potential masonry implementation
    }

    updateLayout() {
        // Update layout after filtering or resizing
        // This is a placeholder for layout updates
    }

    handleScroll() {
        // Handle any scroll-based animations or loading
        this.lastScrollPosition = window.pageYOffset;
    }

    handleResize() {
        // Update layout on resize
        this.updateLayout();
    }

    cleanup() {
        // Cleanup method
        if (this.searchDebounceTimer) {
            clearTimeout(this.searchDebounceTimer);
        }
        if (this.scrollRAF) {
            cancelAnimationFrame(this.scrollRAF);
        }
        if (this.resizeRAF) {
            cancelAnimationFrame(this.resizeRAF);
        }
        if (this.scrollRAF) {
            cancelAnimationFrame(this.scrollRAF);
        }
    }
}

// Initialize gallery when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.galleryManager = new GalleryManager();
});