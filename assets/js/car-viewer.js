class CarViewer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.currentFrame = 0;
        this.totalFrames = 36;
        this.currentColor = 'red';
        this.isDragging = false;
        this.startX = 0;
        this.frames = new Map();
        
        this.initialize();
    }

    initialize() {
        this.setupColorSelector();
        this.setupEventListeners();
        this.preloadImages();
    }

    setupColorSelector() {
        const colorBtns = document.querySelectorAll('.color-btn');
        colorBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.changeColor(btn.dataset.color);
                colorBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
    }

    setupEventListeners() {
        this.container.addEventListener('mousedown', (e) => this.startDragging(e));
        document.addEventListener('mousemove', (e) => this.drag(e));
        document.addEventListener('mouseup', () => this.stopDragging());

        this.container.addEventListener('touchstart', (e) => this.startDragging(e));
        document.addEventListener('touchmove', (e) => this.drag(e));
        document.addEventListener('touchend', () => this.stopDragging());

        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') this.rotate(-1);
            if (e.key === 'ArrowRight') this.rotate(1);
        });
    }

    async preloadImages() {
        this.showLoadingIndicator(true);
        
        try {
            const colors = ['red', 'blue', 'black', 'silver'];
            
            for (const color of colors) {
                this.frames.set(color, []);
                
                for (let i = 0; i < this.totalFrames; i++) {
                    const img = new Image();
                    img.src = this.getImageUrl(color, i);
                    await new Promise(resolve => {
                        img.onload = resolve;
                        img.onerror = resolve;
                    });
                    this.frames.get(color).push(img);
                }
            }
            
            this.updateFrame();
        } catch (error) {
            console.error('Error preloading images:', error);
        } finally {
            this.showLoadingIndicator(false);
        }
    }

    getImageUrl(color, frame) {
        const frameNumber = frame.toString().padStart(2, '0');
        return `/assets/images/cars/${color}/frame${frameNumber}.webp`;
    }

    startDragging(e) {
        this.isDragging = true;
        this.startX = e.type === 'mousedown' ? e.pageX : e.touches[0].pageX;
        this.container.style.cursor = 'grabbing';
    }

    drag(e) {
        if (!this.isDragging) return;

        e.preventDefault();
        const currentX = e.type === 'mousemove' ? e.pageX : e.touches[0].pageX;
        const diff = currentX - this.startX;
        
        if (Math.abs(diff) > 5) {
            const direction = diff > 0 ? -1 : 1;
            this.rotate(direction);
            this.startX = currentX;
        }
    }

    stopDragging() {
        this.isDragging = false;
        this.container.style.cursor = 'grab';
    }

    rotate(direction) {
        this.currentFrame = (this.currentFrame + direction + this.totalFrames) % this.totalFrames;
        this.updateFrame();
    }

    changeColor(color) {
        if (this.currentColor === color) return;
        
        this.currentColor = color;
        this.updateFrame();
    }

    updateFrame() {
        const frames = this.frames.get(this.currentColor);
        if (!frames || !frames[this.currentFrame]) return;

        const currentImage = frames[this.currentFrame];
        this.container.style.backgroundImage = `url(${currentImage.src})`;
    }

    showLoadingIndicator(show) {
        const loadingOverlay = document.querySelector('.loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.classList.toggle('active', show);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('carViewer')) {
        const viewer = new CarViewer('carViewer');
    }
});