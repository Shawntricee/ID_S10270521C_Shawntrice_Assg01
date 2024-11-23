// Gallery functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize variables
    const filterButtons = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');
    const searchInput = document.querySelector('.search-input');
    const modal = document.getElementById('carModal');
    const modalImage = modal.querySelector('.modal-image');
    const modalTitle = modal.querySelector('.modal-details h2');
    const modalDescription = modal.querySelector('.modal-details p');
    const closeButton = modal.querySelector('.close-button');

    // Show all items initially
    galleryItems.forEach(item => {
        item.classList.add('show');
    });

    // Filter functionality
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            button.classList.add('active');

            const filter = button.getAttribute('data-filter');
            
            galleryItems.forEach(item => {
                // Remove show class from all items
                item.classList.remove('show');
                
                // Add show class based on filter
                if (filter === 'all' || item.getAttribute('data-category') === filter) {
                    item.classList.add('show');
                    // Add animation delay for smooth appearance
                    item.style.animationDelay = '0.1s';
                }
            });

            // Scroll to top of gallery section smoothly
            document.querySelector('.gallery-section').scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        });
    });

    // Search functionality
    searchInput.addEventListener('input', filterItems);

    function filterItems() {
        const searchTerm = searchInput.value.toLowerCase();
        const activeFilter = document.querySelector('.filter-btn.active').getAttribute('data-filter');

        galleryItems.forEach(item => {
            const title = item.querySelector('h2').textContent.toLowerCase();
            const description = item.querySelector('p').textContent.toLowerCase();
            const category = item.getAttribute('data-category');
            
            const matchesSearch = title.includes(searchTerm) || description.includes(searchTerm);
            const matchesFilter = activeFilter === 'all' || category === activeFilter;

            if (matchesSearch && matchesFilter) {
                item.classList.add('show');
            } else {
                item.classList.remove('show');
            }
        });
    }

    // Modal functionality
    galleryItems.forEach(item => {
        const detailsButton = item.querySelector('.view-details-btn');
        
        detailsButton.addEventListener('click', (e) => {
            e.preventDefault();
            
            const image = item.querySelector('img').src;
            const title = item.querySelector('h2').textContent;
            const description = item.querySelector('p').textContent;

            modalImage.src = image;
            modalTitle.textContent = title;
            modalDescription.textContent = description;
            modal.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
        });
    });

    // Close modal
    closeButton.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Close modal with escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });

    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
    }

    // Lazy loading for images
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                // Replace src with the data-src
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
                observer.unobserve(img);
            }
        });
    }, {
        root: null,
        rootMargin: '50px',
        threshold: 0.1
    });

    // Observe all images that have a data-src attribute
    document.querySelectorAll('.item-image img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });

    // Smooth scroll for gallery items
    const observerOptions = {
        root: null,
        threshold: 0.1,
        rootMargin: '0px'
    };

    const appearOnScroll = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('appear');
            observer.unobserve(entry.target);
        });
    }, observerOptions);

    galleryItems.forEach(item => {
        appearOnScroll.observe(item);
    });

    // Handle mobile touch events for image interaction
    let touchStartY = 0;
    let touchEndY = 0;

    document.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
    }, false);

    document.addEventListener('touchend', (e) => {
        touchEndY = e.changedTouches[0].clientY;
        handleSwipe();
    }, false);

    function handleSwipe() {
        const difference = touchStartY - touchEndY;
        const sensitivity = 50; // minimum distance for swipe

        if (Math.abs(difference) > sensitivity) {
            // Scroll to next/previous image based on swipe direction
            const currentPosition = window.scrollY;
            const windowHeight = window.innerHeight;

            if (difference > 0) {
                // Swipe up - scroll to next image
                window.scrollTo({
                    top: currentPosition + windowHeight,
                    behavior: 'smooth'
                });
            } else {
                // Swipe down - scroll to previous image
                window.scrollTo({
                    top: currentPosition - windowHeight,
                    behavior: 'smooth'
                });
            }
        }
    }

    // Add resize handler for mobile height adjustment
    window.addEventListener('resize', () => {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    });

    // Initial call for mobile height
    window.dispatchEvent(new Event('resize'));
});