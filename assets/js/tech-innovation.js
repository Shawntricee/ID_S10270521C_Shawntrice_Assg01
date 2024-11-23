document.addEventListener('DOMContentLoaded', function() {
    window.addEventListener('scroll', function() {
        const parallax = document.querySelector('.parallax-bg');
        if (parallax) {
            let scrollPosition = window.pageYOffset;
            parallax.style.transform = `translateY(${scrollPosition * 0.5}px)`;
        }
    });

    const demoButtons = document.querySelectorAll('.demo-btn');
    const demoVisual = document.getElementById('demoVisual');
    const infoContents = document.querySelectorAll('.info-content');

    demoButtons.forEach(button => {
        button.addEventListener('click', () => {
            const demo = button.dataset.demo;
            
            demoButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            updateDemoVisual(demo);

            infoContents.forEach(content => {
                content.classList.remove('active');
                if (content.dataset.demo === demo) {
                    content.classList.add('active');
                }
            });
        });
    });

    const powerCtx = document.getElementById('powerChart')?.getContext('2d');
    const aeroCtx = document.getElementById('aeroChart')?.getContext('2d');

    if (powerCtx) {
        new Chart(powerCtx, {
            type: 'line',
            data: {
                labels: ['1000', '2000', '3000', '4000', '5000', '6000', '7000', '8000'],
                datasets: [{
                    label: 'Power (HP)',
                    data: [100, 200, 350, 500, 650, 750, 780, 760],
                    borderColor: '#ff3000',
                    tension: 0.4
                },
                {
                    label: 'Torque (Nm)',
                    data: [500, 600, 650, 680, 670, 650, 620, 580],
                    borderColor: '#00ff00',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: '#ffffff'
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#ffffff'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#ffffff'
                        }
                    }
                }
            }
        });
    }

    if (aeroCtx) {
        new Chart(aeroCtx, {
            type: 'bar',
            data: {
                labels: ['50', '100', '150', '200', '250'],
                datasets: [{
                    label: 'Downforce (kg)',
                    data: [50, 150, 280, 450, 650],
                    backgroundColor: '#ff3000'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: '#ffffff'
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#ffffff'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#ffffff'
                        }
                    }
                }
            }
        });
    }

    function updateDemoVisual(tech) {
        const visual = document.getElementById('demoVisual');
        if (!visual) return;

        visual.innerHTML = '';

        switch(tech) {
            case 'aero':
                createAeroDemo(visual);
                break;
            case 'power':
                createPowerDemo(visual);
                break;
            case 'chassis':
                createChassisDemo(visual);
                break;
        }
    }

    function createAeroDemo(container) {
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("viewBox", "0 0 400 200");
        svg.style.width = "100%";
        svg.style.height = "100%";

        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", "M50,100 C100,100 150,80 200,80 S300,100 350,100");
        path.setAttribute("stroke", "#ff3000");
        path.setAttribute("fill", "none");
        path.setAttribute("stroke-width", "2");

        svg.appendChild(path);
        container.appendChild(svg);
    }

    function createPowerDemo(container) {
        const engineDiv = document.createElement('div');
        engineDiv.className = 'engine-demo';
        engineDiv.innerHTML = `
            <div class="engine-block">
                <div class="piston"></div>
                <div class="spark"></div>
            </div>
        `;
        container.appendChild(engineDiv);
    }

    function createChassisDemo(container) {
        const chassisDiv = document.createElement('div');
        chassisDiv.className = 'chassis-demo';
        chassisDiv.innerHTML = `
            <div class="frame">
                <div class="stress-point"></div>
                <div class="stress-point"></div>
                <div class="stress-point"></div>
            </div>
        `;
        container.appendChild(chassisDiv);
    }

    if (document.querySelector('.demo-btn')) {
        updateDemoVisual('aero');
    }

    const observerOptions = {
        threshold: 0.2
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.innovation-card, .safety-card, .metric-card').forEach(element => {
        observer.observe(element);
    });
});