document.addEventListener('DOMContentLoaded', function() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');
    const searchInput = document.querySelector('.search-input');
    const modal = document.getElementById('carModal');
    const modalImage = modal.querySelector('.modal-image');
    const modalTitle = modal.querySelector('.modal-details h2');
    const modalDescription = modal.querySelector('.modal-details p');
    const closeButton = modal.querySelector('.close-button');

    galleryItems.forEach(item => {
        item.classList.add('show');
    });

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const filter = button.getAttribute('data-filter');
            
            galleryItems.forEach(item => {
                item.classList.remove('show');
                
                if (filter === 'all' || item.getAttribute('data-category') === filter) {
                    item.classList.add('show');
                    item.style.animationDelay = '0.1s';
                }
            });

            document.querySelector('.gallery-section').scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        });
    });

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
            document.body.style.overflow = 'hidden';
        });
    });

    closeButton.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });

    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
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

    document.querySelectorAll('.item-image img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });

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
        const sensitivity = 50;

        if (Math.abs(difference) > sensitivity) {
            const currentPosition = window.scrollY;
            const windowHeight = window.innerHeight;

            if (difference > 0) {
                window.scrollTo({
                    top: currentPosition + windowHeight,
                    behavior: 'smooth'
                });
            } else {
                window.scrollTo({
                    top: currentPosition - windowHeight,
                    behavior: 'smooth'
                });
            }
        }
    }

    window.addEventListener('resize', () => {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    });

    window.dispatchEvent(new Event('resize'));
});