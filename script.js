document.addEventListener('DOMContentLoaded', () => {

    // 1. حساب تمدد القائمة الدائرية وتفعيل/إلغاء كلاس الـ X (open)
    const toggler = document.querySelector('.navbar-toggler');
    const navCollapse = document.getElementById('navbarNav');

    if (toggler && navCollapse) {
        toggler.addEventListener('click', (e) => {
            const rect = toggler.getBoundingClientRect();
            const clickX = rect.left + rect.width / 2;
            const clickY = rect.top + rect.height / 2;

            navCollapse.style.setProperty('--click-x', `${clickX}px`);
            navCollapse.style.setProperty('--click-y', `${clickY}px`);
            
            // تبديل الكلاس open لتحويل الزر إلى X أو إرجاعه
            toggler.classList.toggle('open');
        });
    }

    // 2. حساب وإنشاء دوران المكعب الخماسي 3D
    const cube = document.getElementById('cubeContainer');
    const faces = document.querySelectorAll('.cube-face');
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    const totalFaces = faces.length; // 5 أقسام
    const angleStep = 360 / totalFaces; // 72 درجة بين كل وجه
    let radius = 0;

    function setupCube() {
        if (window.innerWidth > 991) {
            radius = Math.round((window.innerWidth / 2) / Math.tan(Math.PI / totalFaces));
            faces.forEach((face, index) => {
                const angle = index * angleStep;
                face.style.transform = `rotateY(${angle}deg) translateZ(${radius}px)`;
            });
            const activeLink = document.querySelector('.navbar-nav .nav-link.active');
            if (activeLink) {
                rotateToSection(activeLink.getAttribute('href'));
            }
        } else {
            faces.forEach(face => {
                face.style.transform = 'none';
            });
            cube.style.transform = 'none';
        }
    }

    function rotateToSection(targetId) {
        const targetIndex = Array.from(faces).findIndex(face => `#${face.id}` === targetId);

        if (targetIndex !== -1) {
            navLinks.forEach(link => {
                if (link.getAttribute('href') === targetId) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            });

            if (window.innerWidth > 991) {
                const targetAngle = -targetIndex * angleStep;
                cube.style.transform = `translateZ(-${radius}px) rotateY(${targetAngle}deg)`;
            } else {
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }
            }
        }
    }

    setupCube();
    window.addEventListener('resize', setupCube);

    // ربط ضغط روابط الـ Navbar والتنقل بالدوران وإغلاق الدائرة وإعادة الزر لوضعه الطبيعي
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId && targetId !== '#') {
                e.preventDefault();
                rotateToSection(targetId);

                if (navCollapse && navCollapse.classList.contains('show')) {
                    const bsCollapse = bootstrap.Collapse.getInstance(navCollapse);
                    if (bsCollapse) bsCollapse.hide();
                    if (window.innerWidth <= 991 && toggler) {
                        toggler.classList.remove('open');
                    }
                }
            }
        });
    });

    // 3. 3D Tilt Effect الكروت
    if (window.innerWidth > 991) {
        document.querySelectorAll('.tilt-element').forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                
                card.style.transform = `perspective(1000px) rotateX(${-y / 20}deg) rotateY(${x / 20}deg) translateY(-6px)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)`;
            });
        });
    }

    // 4. Tech Canvas Animation
    const canvas = document.getElementById('tech-canvas');
    const ctx = canvas.getContext('2d');

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let mouse = { x: null, y: null, radius: 140 };
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });
    window.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });

    const particles = [];
    const particleCount = Math.min(Math.floor(window.innerWidth / 14), 70);

    class TechParticle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 0.7;
            this.vy = (Math.random() - 0.5) * 0.7;
            this.size = Math.random() * 2.2 + 1;
            this.color = Math.random() > 0.35 ? 'rgba(212, 175, 55, ' : 'rgba(255, 255, 255, ';
            this.baseAlpha = Math.random() * 0.45 + 0.2;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
            if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

            if (mouse.x !== null && mouse.y !== null) {
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < mouse.radius) {
                    let force = (mouse.radius - dist) / mouse.radius;
                    this.x -= (dx / dist) * force * 1.5;
                    this.y -= (dy / dist) * force * 1.5;
                }
            }
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color + this.baseAlpha + ')';
            ctx.fill();
        }
    }

    for (let i = 0; i < particleCount; i++) {
        particles.push(new TechParticle());
    }

    function connectParticles() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                let dx = particles[i].x - particles[j].x;
                let dy = particles[i].y - particles[j].y;
                let dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 130) {
                    let opacity = 0.22 - (dist / 130) * 0.22;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(212, 175, 55, ${opacity})`;
                    ctx.lineWidth = 0.6;
                    ctx.stroke();
                }
            }
        }
    }

    function animateTechCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        connectParticles();
        requestAnimationFrame(animateTechCanvas);
    }
    animateTechCanvas();

    // 5. Year & Cursor
    document.getElementById('year').textContent = new Date().getFullYear();

    const cursor = document.getElementById('cursor');
    window.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    });

    document.querySelectorAll('a, button').forEach(element => {
        element.addEventListener('mouseenter', () => {
            cursor.style.transform = 'translate(-50%, -50%) scale(1.5)';
            cursor.style.borderColor = '#b38f27';
        });
        element.addEventListener('mouseleave', () => {
            cursor.style.transform = 'translate(-50%, -50%) scale(1)';
            cursor.style.borderColor = '#d4af37';
        });
    });

    // 6. Sound & Ripple
    function playWaterSound() {
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();

            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.12);

            gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.12);

            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);

            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.12);
        } catch (e) {
            console.log("الصوت يعمل فور التفاعل:", e);
        }
    }

    document.querySelectorAll('.interactive-btn, .btn-water-fluid, .btn-custom-outline, .nav-link, .lang-switch-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            playWaterSound();

            const circle = document.createElement('span');
            const diameter = Math.max(this.clientWidth, this.clientHeight);
            const radius = diameter / 2;

            circle.style.width = circle.style.height = `${diameter}px`;
            circle.style.left = `${e.clientX - this.getBoundingClientRect().left - radius}px`;
            circle.style.top = `${e.clientY - this.getBoundingClientRect().top - radius}px`;
            circle.classList.add('water-ripple');

            const existingRipple = this.getElementsByClassName('water-ripple')[0];
            if (existingRipple) {
                existingRipple.remove();
            }

            this.appendChild(circle);

            setTimeout(() => {
                circle.remove();
            }, 500);
        });
    });

});

// 7. Language Toggle Function
let currentLang = 'ar';
function toggleLanguage() {
    const htmlRoot = document.getElementById('htmlRoot');
    const langSwitchBtn = document.getElementById('langSwitchBtn');
    const bootstrapCSS = document.getElementById('bootstrapCSS');
    
    if (currentLang === 'ar') {
        currentLang = 'en';
        htmlRoot.setAttribute('dir', 'ltr');
        htmlRoot.setAttribute('lang', 'en');
        bootstrapCSS.setAttribute('href', 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css');
        langSwitchBtn.innerHTML = '🌐 العربية';
    } else {
        currentLang = 'ar';
        htmlRoot.setAttribute('dir', 'rtl');
        htmlRoot.setAttribute('lang', 'ar');
        bootstrapCSS.setAttribute('href', 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.rtl.min.css');
        langSwitchBtn.innerHTML = '🌐 English';
    }

    document.querySelectorAll('[data-ar]').forEach(el => {
        const text = el.getAttribute(`data-${currentLang}`);
        if (text) {
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.placeholder = text;
            } else {
                el.innerText = text;
            }
        }
    });
}