class SpecsPopup {
    constructor() {
        this.tabButtons = document.querySelectorAll('.tab-btn');
        this.tabPanels = document.querySelectorAll('.tab-panel');
        this.specItems = document.querySelectorAll('.spec-item');
        
        this.initialize();
    }

    initialize() {
        this.setupTabs();
        this.setupAnimations();
        this.loadSpecifications();
    }

    setupTabs() {
        this.tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTab = button.dataset.tab;
                this.switchTab(targetTab);
            });
        });
    }

    switchTab(targetTab) {
        this.tabButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === targetTab);
        });

        this.tabPanels.forEach(panel => {
            if (panel.dataset.panel === targetTab) {
                panel.classList.add('active');
                this.animateSpecItems(panel);
            } else {
                panel.classList.remove('active');
            }
        });
    }

    animateSpecItems(panel) {
        const items = panel.querySelectorAll('.spec-item');
        items.forEach((item, index) => {
            item.style.animationDelay = `${index * 0.1}s`;
            item.classList.add('animate');
        });
    }

    setupAnimations() {
        const options = {
            root: null,
            rootMargin: '0px',
            threshold: 0.2
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate');
                }
            });
        }, options);

        this.specItems.forEach(item => observer.observe(item));
    }

    loadSpecifications() {
        const specifications = {
            performance: {
                engine: 'Twin-Turbo V8',
                power: '780 HP',
                torque: '800 Nm',
                acceleration: '2.8s 0-60 mph',
                topSpeed: '220+ mph'
            },
            features: {
                suspension: 'Adaptive Air Suspension',
                brakes: 'Carbon Ceramic',
                transmission: '8-Speed Dual-Clutch',
                drivetrain: 'All-Wheel Drive'
            },
            dimensions: {
                length: '4,789 mm',
                width: '2,007 mm',
                height: '1,197 mm',
                weight: '1,545 kg'
            }
        };

        this.updateSpecifications(specifications);
    }

    updateSpecifications(specs) {
        Object.entries(specs).forEach(([category, values]) => {
            const panel = document.querySelector(`[data-panel="${category}"]`);
            if (!panel) return;

            const grid = panel.querySelector('.specs-grid');
            if (!grid) return;

            grid.innerHTML = Object.entries(values).map(([key, value]) => `
                <div class="spec-item">
                    <h3>${this.formatLabel(key)}</h3>
                    <p>${value}</p>
                </div>
            `).join('');
        });
    }

    formatLabel(key) {
        return key.charAt(0).toUpperCase() + 
               key.slice(1).replace(/([A-Z])/g, ' $1').trim();
    }

    static createComparison(specs1, specs2) {
        const comparisonTable = document.createElement('div');
        comparisonTable.className = 'specs-comparison';

        Object.keys(specs1).forEach(category => {
            const section = document.createElement('div');
            section.className = 'comparison-section';
            section.innerHTML = `
                <h3>${this.formatLabel(category)}</h3>
                <table>
                    <tr>
                        <th>Specification</th>
                        <th>Model 1</th>
                        <th>Model 2</th>
                    </tr>
                    ${Object.entries(specs1[category]).map(([key, value]) => `
                        <tr>
                            <td>${this.formatLabel(key)}</td>
                            <td>${value}</td>
                            <td>${specs2[category][key] || '-'}</td>
                        </tr>
                    `).join('')}
                </table>
            `;
            comparisonTable.appendChild(section);
        });

        return comparisonTable;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.specs-tabs')) {
        const specsPopup = new SpecsPopup();
    }
});