// ============================================
// PARTICLE SYSTEM FOR BACKGROUND
// ============================================
class ParticleSystem {
    constructor() {
        this.canvas = document.getElementById('particle-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.mouse = { x: 0, y: 0 };
        this.maxParticles = 100;
        
        this.init();
        this.animate();
        this.setupEventListeners();
    }

    init() {
        this.resize();
        this.createParticles();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createParticles() {
        for (let i = 0; i < this.maxParticles; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                radius: Math.random() * 2 + 1,
                opacity: Math.random() * 0.5 + 0.2
            });
        }
    }

    setupEventListeners() {
        window.addEventListener('resize', () => this.resize());
        
        document.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
    }

    updateParticles() {
        this.particles.forEach(particle => {
            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;

            // Boundary wrapping
            if (particle.x < 0) particle.x = this.canvas.width;
            if (particle.x > this.canvas.width) particle.x = 0;
            if (particle.y < 0) particle.y = this.canvas.height;
            if (particle.y > this.canvas.height) particle.y = 0;

            // Mouse interaction (subtle attraction)
            const dx = this.mouse.x - particle.x;
            const dy = this.mouse.y - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 150) {
                const force = (150 - distance) / 150;
                particle.vx += dx * force * 0.0001;
                particle.vy += dy * force * 0.0001;
            }

            // Limit velocity
            particle.vx *= 0.99;
            particle.vy *= 0.99;
        });
    }

    drawParticles() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw connections
        this.ctx.strokeStyle = 'rgba(92, 240, 209, 0.14)';
        this.ctx.lineWidth = 1;
        
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 120) {
                    this.ctx.globalAlpha = (120 - distance) / 120 * 0.3;
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.stroke();
                }
            }
        }
        
        // Draw particles
        this.particles.forEach(particle => {
            this.ctx.globalAlpha = particle.opacity;
            this.ctx.fillStyle = '#5cf0d1';
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        this.ctx.globalAlpha = 1;
    }

    animate() {
        this.updateParticles();
        this.drawParticles();
        requestAnimationFrame(() => this.animate());
    }
}

// ============================================
// SKILLS CONSTELLATION VISUALIZATION
// ============================================
class SkillsVisualization {
    constructor() {
        this.canvas = document.getElementById('skills-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.skills = [];
        this.animationFrame = 0;
        
        this.init();
        // Store globally for resize handler
        window.skillsVisualization = this;
    }

    init() {
        this.resize();
        this.loadSkills();
        this.animate();
    }

    resize() {
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
    }

    loadSkills() {
        const skillItems = document.querySelectorAll('.skill-item');
        skillItems.forEach((item, index) => {
            const skillName = item.dataset.skill;
            const skillLevel = parseInt(item.dataset.level);
            
            this.skills.push({
                name: skillName,
                level: skillLevel,
                x: 0,
                y: 0,
                targetX: 0,
                targetY: 0,
                radius: skillLevel / 2 + 10,
                brightness: skillLevel / 100,
                angle: (index / skillItems.length) * Math.PI * 2,
                distance: skillLevel * 1.5 + 50
            });
        });
        
        this.updatePositions();
    }

    updatePositions() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        this.skills.forEach(skill => {
            skill.targetX = centerX + Math.cos(skill.angle) * skill.distance;
            skill.targetY = centerY + Math.sin(skill.angle) * skill.distance;
            
            // Smooth movement
            skill.x += (skill.targetX - skill.x) * 0.1;
            skill.y += (skill.targetY - skill.y) * 0.1;
        });
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw connections
        this.ctx.strokeStyle = 'rgba(0, 245, 255, 0.2)';
        this.ctx.lineWidth = 1;
        
        for (let i = 0; i < this.skills.length; i++) {
            for (let j = i + 1; j < this.skills.length; j++) {
                const dx = this.skills[i].x - this.skills[j].x;
                const dy = this.skills[i].y - this.skills[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 200) {
                    this.ctx.globalAlpha = (200 - distance) / 200 * 0.3;
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.skills[i].x, this.skills[i].y);
                    this.ctx.lineTo(this.skills[j].x, this.skills[j].y);
                    this.ctx.stroke();
                }
            }
        }
        
        // Draw skill nodes
        this.skills.forEach(skill => {
            // Glow effect
            const gradient = this.ctx.createRadialGradient(
                skill.x, skill.y, 0,
                skill.x, skill.y, skill.radius * 2
            );
            gradient.addColorStop(0, `rgba(0, 245, 255, ${skill.brightness})`);
            gradient.addColorStop(1, 'rgba(0, 245, 255, 0)');
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(skill.x, skill.y, skill.radius * 2, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Main circle
            this.ctx.fillStyle = `rgba(0, 245, 255, ${skill.brightness})`;
            this.ctx.beginPath();
            this.ctx.arc(skill.x, skill.y, skill.radius, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Skill name
            this.ctx.fillStyle = '#00f5ff';
            this.ctx.font = '12px JetBrains Mono';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(skill.name, skill.x, skill.y);
        });
        
        this.ctx.globalAlpha = 1;
    }

    animate() {
        this.animationFrame++;
        this.updatePositions();
        this.draw();
        
        // Slow rotation
        this.skills.forEach(skill => {
            skill.angle += 0.0005;
        });
        
        requestAnimationFrame(() => this.animate());
    }
}

// ============================================
// TITLE CYCLER
// ============================================
class TitleCycler {
    constructor() {
        this.titles = [
            'علی اصغر حسن‌نژاد',
            'توسعه‌دهنده اندروید',
            'برنامه‌نویس جاوا',
            'طراح تجربه کاربری موبایل',
            'سازنده اپلیکیشن‌های بومی',
            'مهندس نرم‌افزار',
            'علاقه‌مند به کدنویسی'
        ];
        this.currentIndex = 0;
        this.currentText = '';
        this.isDeleting = false;
        this.typeSpeed = 100;
        
        this.element = document.getElementById('title-cycler');
        this.type();
    }

    type() {
        const currentTitle = this.titles[this.currentIndex];
        
        if (this.isDeleting) {
            this.currentText = currentTitle.substring(0, this.currentText.length - 1);
            this.typeSpeed = 50;
        } else {
            this.currentText = currentTitle.substring(0, this.currentText.length + 1);
            this.typeSpeed = 100;
        }
        
        this.element.textContent = this.currentText;
        
        if (!this.isDeleting && this.currentText === currentTitle) {
            this.typeSpeed = 2000; // Pause at end
            this.isDeleting = true;
        } else if (this.isDeleting && this.currentText === '') {
            this.isDeleting = false;
            this.currentIndex = (this.currentIndex + 1) % this.titles.length;
            this.typeSpeed = 500;
        }
        
        setTimeout(() => this.type(), this.typeSpeed);
    }
}

// ============================================
// NUMBER COUNTER ANIMATION
// ============================================
function animateCounter(element, target, duration = 2000) {
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 16);
}

function initStatCounters() {
    const statNumbers = document.querySelectorAll('.stat-number');
    if (statNumbers.length === 0) {
        return;
    }
    
    // Use IntersectionObserver to trigger animation when stats are visible
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const stat = entry.target;
                const target = parseInt(stat.getAttribute('data-target'), 10);
                if (!isNaN(target) && stat.textContent === '0') {
                    animateCounter(stat, target);
                }
                observer.unobserve(stat);
            }
        });
    }, { threshold: 0.5 });
    
    statNumbers.forEach(stat => {
        stat.textContent = '0';
        observer.observe(stat);
    });
}

// ============================================
// SKILL PROGRESS BARS
// ============================================
function animateSkillBars() {
    const skillBars = document.querySelectorAll('.skill-progress');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const progress = entry.target;
                const targetWidth = progress.dataset.progress + '%';
                progress.style.width = targetWidth;
                observer.unobserve(progress);
            }
        });
    }, { threshold: 0.5 });
    
    skillBars.forEach(bar => observer.observe(bar));
}

// ============================================
// CLI TYPING EFFECT
// ============================================
class CLITyping {
    constructor() {
        this.commands = [
            'ping رزومه --channel="همکاری"',
            'send --message="سلام! آماده گفتگو هستم"',
            'open --project="فرصت جدید"',
            'git push --branch="مسیر_حرفه‌ای"'
        ];
        this.currentIndex = 0;
        this.currentText = '';
        this.isDeleting = false;
        this.typeSpeed = 50;
        
        this.element = document.getElementById('typing-command');
        if (!this.element) {
            // Element removed (contact form deleted); skip typing effect
            return;
        }
        this.type();
    }

    type() {
        const currentCommand = this.commands[this.currentIndex];
        
        if (this.isDeleting) {
            this.currentText = currentCommand.substring(0, this.currentText.length - 1);
            this.typeSpeed = 30;
        } else {
            this.currentText = currentCommand.substring(0, this.currentText.length + 1);
            this.typeSpeed = 50;
        }
        
        this.element.textContent = this.currentText;
        
        if (!this.isDeleting && this.currentText === currentCommand) {
            this.typeSpeed = 3000;
            this.isDeleting = true;
        } else if (this.isDeleting && this.currentText === '') {
            this.isDeleting = false;
            this.currentIndex = (this.currentIndex + 1) % this.commands.length;
            this.typeSpeed = 500;
        }
        
        setTimeout(() => this.type(), this.typeSpeed);
    }
}

// ============================================
// MATRIX EFFECT FOR LOADING
// ============================================
function createMatrixEffect() {
    const chars = '۰۱۲۳۴۵۶۷۸۹<>[]{}/آابپتثجچحخدذرزسشصضطظعغفقکگلمنوهی';
    const matrixContainer = document.querySelector('.matrix-text');
    
    function generateMatrix() {
        let text = '';
        for (let i = 0; i < 100; i++) {
            text += chars[Math.floor(Math.random() * chars.length)] + ' ';
        }
        return text;
    }
    
    setInterval(() => {
        matrixContainer.textContent = generateMatrix();
    }, 100);
}

// ============================================
// SMOOTH SCROLL
// ============================================
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ============================================
// SCROLL ANIMATIONS
// ============================================
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    const animatedElements = document.querySelectorAll('.timeline-item, .project-card, .skill-category');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// ============================================
// CONTACT FORM HANDLING
// ============================================
function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) {
        return; // Form doesn't exist, skip initialization
    }
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const submitButton = form.querySelector('.form-submit');
        const originalText = submitButton.innerHTML;

        const name = form.elements['name'].value.trim();
        const email = form.elements['email'].value.trim();
        const message = form.elements['message'].value.trim();

        const toAddress = 'alihassannegad44@gmail.com';
        const subject = `پیام جدید از رزومه - ${name || 'بدون نام'}`;
        const body = [
            `نام: ${name || 'وارد نشده'}`,
            `ایمیل: ${email || 'وارد نشده'}`,
            '',
            'متن پیام:',
            message || '—'
        ].join('\n');

        const mailtoLink = `mailto:${toAddress}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

        submitButton.innerHTML = '<span>در حال آماده‌سازی...</span>';
        submitButton.disabled = true;

        // Open default mail client with prefilled email
        window.location.href = mailtoLink;

        // Quick UI feedback
        setTimeout(() => {
            submitButton.innerHTML = '<span>باز شد ✅</span>';
            submitButton.style.borderColor = '#27c93f';
            submitButton.style.color = '#27c93f';

            setTimeout(() => {
                submitButton.innerHTML = originalText;
                submitButton.disabled = false;
                submitButton.style.borderColor = '';
                submitButton.style.color = '';
                form.reset();
            }, 1800);
        }, 800);
    });
}

// ============================================
// NAVIGATION ACTIVE STATE
// ============================================
function initNavigation() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    window.addEventListener('scroll', () => {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.pageYOffset >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

// ============================================
// LOADING SCREEN
// ============================================
function initLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    
    // Create matrix effect
    createMatrixEffect();
    
    // Hide loading screen after delay
    setTimeout(() => {
        loadingScreen.classList.add('hidden');
        // Initialize everything after loading
        setTimeout(() => {
            initApp();
        }, 500);
    }, 2000);
}

// ============================================
// INITIALIZE APPLICATION
// ============================================
function initApp() {
    // Initialize particle system
    new ParticleSystem();
    
    // Initialize skills visualization
    new SkillsVisualization();
    
    // Initialize title cycler
    new TitleCycler();
    
    // Initialize CLI typing
    new CLITyping();
    
    // Animate counters (experience/projects)
    initStatCounters();
    
    // Animate skill bars
    animateSkillBars();
    
    // Initialize smooth scroll
    initSmoothScroll();
    
    // Initialize scroll animations
    initScrollAnimations();
    
    // Initialize contact form
    initContactForm();
    
    // Initialize navigation
    initNavigation();
    
    // Handle window resize for skills canvas
    window.addEventListener('resize', () => {
        const skillsViz = window.skillsVisualization;
        if (skillsViz) {
            skillsViz.resize();
        }
    });
}

// ============================================
// START APPLICATION
// ============================================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLoadingScreen);
} else {
    initLoadingScreen();
}
