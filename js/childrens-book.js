// ===== CHILDREN'S BOOK PRINTING JAVASCRIPT =====

class ChildrensBookPrinting {
    constructor() {
        this.currentSlide = 0;
        this.totalSlides = 3;
        this.autoPlayInterval = null;
        this.currentTab = 'paper';
        this.priceData = {
            basePrices: {
                '8.5x11': { perfect: 15, saddle: 12, spiral: 14, hardcover: 25 },
                '6x9': { perfect: 12, saddle: 10, spiral: 11, hardcover: 22 },
                '5.5x8.5': { perfect: 10, saddle: 8, spiral: 9, hardcover: 20 },
                '8x10': { perfect: 14, saddle: 11, spiral: 13, hardcover: 24 }
            },
            coverPrices: {
                matte: 2,
                gloss: 3,
                uncoated: 1
            },
            interiorPrices: {
                '70gsm': 0,
                '80gsm': 1,
                '100gsm': 2
            },
            quantityDiscounts: {
                100: 0,
                250: 0.05,
                500: 0.10,
                1000: 0.15,
                2500: 0.20,
                5000: 0.25
            }
        };
        this.init();
    }

    init() {
        this.initCarousel();
        this.initPriceCalculator();
        this.initTabs();
        this.initAnimations();
        this.bindEvents();
        console.log('Children\'s Book Printing initialized successfully!');
    }

    // ===== CAROUSEL FUNCTIONALITY =====
    initCarousel() {
        this.startAutoPlay();
        this.updateCarouselIndicators();
    }

    nextSlide() {
        this.currentSlide = (this.currentSlide + 1) % this.totalSlides;
        this.updateCarousel();
    }

    prevSlide() {
        this.currentSlide = (this.currentSlide - 1 + this.totalSlides) % this.totalSlides;
        this.updateCarousel();
    }

    goToSlide(index) {
        this.currentSlide = index;
        this.updateCarousel();
        this.resetAutoPlay();
    }

    updateCarousel() {
        const slides = document.querySelectorAll('.carousel-slide');
        const indicators = document.querySelectorAll('.indicator');

        slides.forEach((slide, index) => {
            slide.classList.toggle('active', index === this.currentSlide);
        });

        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === this.currentSlide);
        });
    }

    updateCarouselIndicators() {
        const indicators = document.querySelectorAll('.indicator');
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === this.currentSlide);
        });
    }

    startAutoPlay() {
        this.autoPlayInterval = setInterval(() => {
            this.nextSlide();
        }, 5000);
    }

    stopAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    }

    resetAutoPlay() {
        this.stopAutoPlay();
        this.startAutoPlay();
    }

    // ===== PRICE CALCULATOR =====
    initPriceCalculator() {
        this.calculatePrice();
        this.initPageSlider();
    }

    initPageSlider() {
        const slider = document.getElementById('pages');
        const pageDisplay = document.getElementById('pageCount');
        
        if (slider && pageDisplay) {
            slider.addEventListener('input', (e) => {
                pageDisplay.textContent = e.target.value;
                this.calculatePrice();
            });
        }
    }

    calculatePrice() {
        const quantity = parseInt(document.getElementById('quantity')?.value) || 100;
        const size = document.getElementById('size')?.value || '8.5x11';
        const binding = document.getElementById('binding')?.value || 'sewing';
        const pages = parseInt(document.getElementById('pages')?.value) || 24;
        const bookType = document.querySelector('.book-type-option.active')?.dataset.type || 'hardcover';
        const cover = document.querySelector('.cover-option.active')?.dataset.cover || 'digital';
        const lamination = document.querySelector('.lamination-option.active')?.dataset.lamination || 'matte';
        const thickness = document.querySelector('.thickness-option.active')?.dataset.thickness || '2mm';

        // Calculate base price based on book type
        let basePrice = 15;
        switch (bookType) {
            case 'hardcover':
                basePrice = 25;
                break;
            case 'softcover':
                basePrice = 12;
                break;
            case 'saddle':
                basePrice = 8;
                break;
            case 'board':
                basePrice = 30;
                break;
        }

        // Add size multiplier
        const sizeMultipliers = {
            '8.5x11': 1.2,
            '6x9': 1.0,
            '5.5x8.5': 0.9,
            '8x10': 1.1
        };
        basePrice *= sizeMultipliers[size] || 1.0;

        // Add page cost
        const pageMultiplier = Math.ceil(pages / 4) * 0.8;
        
        // Add premium options cost
        let optionsCost = 0;
        if (cover === 'offset') optionsCost += 3;
        if (cover === 'leather') optionsCost += 8;
        if (lamination === 'gloss') optionsCost += 1;
        if (lamination === 'soft') optionsCost += 2;
        if (thickness === '2.5mm') optionsCost += 1;
        if (thickness === '3mm') optionsCost += 2;

        // Calculate per unit price
        const unitPrice = basePrice + pageMultiplier + optionsCost;
        const subtotal = unitPrice * quantity;

        // Apply quantity discount
        let discount = 0;
        const discountTiers = Object.keys(this.priceData.quantityDiscounts)
            .map(Number)
            .sort((a, b) => b - a);

        for (const tier of discountTiers) {
            if (quantity >= tier) {
                discount = this.priceData.quantityDiscounts[tier];
                break;
            }
        }

        const discountAmount = subtotal * discount;
        const total = subtotal - discountAmount;

        // Calculate estimated weight (for display)
        const weight = Math.round((pages * quantity * 0.1) / 100) / 10; // Rough estimate

        // Update UI
        this.updateModernPriceDisplay(total, unitPrice, weight, discountAmount, discount);
    }

    updateModernPriceDisplay(total, unitPrice, weight, discountAmount, discountPercent) {
        const formatINR = (amount) => {
            return new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
                maximumFractionDigits: 0
            }).format(amount);
        };

        // Update price elements
        const currentPriceEl = document.querySelector('.current-price');
        const originalPriceEl = document.querySelector('.original-price');
        const weightEl = document.querySelector('.price-note strong');
        const discountBadgeEl = document.querySelector('.discount-badge');

        if (currentPriceEl) {
            currentPriceEl.textContent = formatINR(total);
        }
        
        if (originalPriceEl) {
            originalPriceEl.textContent = `Unit Price: ${formatINR(unitPrice)}`;
        }

        if (weightEl && weightEl.parentElement) {
            weightEl.parentElement.innerHTML = `<strong>Estimated weight:</strong> ${weight} kg`;
        }

        if (discountBadgeEl && discountPercent > 0) {
            discountBadgeEl.textContent = `Save ${Math.round(discountPercent * 100)}% now`;
            discountBadgeEl.style.display = 'inline-block';
        } else if (discountBadgeEl) {
            discountBadgeEl.style.display = 'none';
        }

        // Add price animation
        this.animatePriceUpdate();
    }

    updatePriceDisplay(subtotal, discountAmount, total, discountPercent) {
        // Fallback for old price display (if still present)
        this.updateModernPriceDisplay(total, total / 100, 24, discountAmount, discountPercent);
    }

    animatePriceUpdate() {
        const priceElements = document.querySelectorAll('#totalPrice, #basePrice, #optionsPrice, #discountAmount');
        priceElements.forEach(el => {
            if (el) {
                el.style.transform = 'scale(1.05)';
                el.style.transition = 'transform 0.2s ease';
                setTimeout(() => {
                    el.style.transform = 'scale(1)';
                }, 200);
            }
        });
    }

    // ===== QUANTITY CONTROLS =====
    updateQuantity(change) {
        const quantityInput = document.getElementById('quantity');
        if (!quantityInput) return;

        let currentValue = parseInt(quantityInput.value) || 100;
        let newValue = currentValue + change;

        // Ensure within bounds
        const min = parseInt(quantityInput.min) || 1;
        const max = parseInt(quantityInput.max) || 10000;
        newValue = Math.max(min, Math.min(max, newValue));

        quantityInput.value = newValue;
        this.calculatePrice();

        // Add visual feedback
        quantityInput.style.transform = 'scale(1.05)';
        setTimeout(() => {
            quantityInput.style.transform = 'scale(1)';
        }, 150);
    }

    // ===== TABS FUNCTIONALITY =====
    initTabs() {
        this.updateTabIndicator();
    }

    switchTab(tabName) {
        // Update active tab button
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });

        // Update active tab panel
        document.querySelectorAll('.tab-panel').forEach(panel => {
            panel.classList.toggle('active', panel.id === `${tabName}-tab`);
        });

        this.currentTab = tabName;
        this.updateTabIndicator();

        // Trigger AOS refresh for new content
        if (typeof AOS !== 'undefined') {
            AOS.refresh();
        }
    }

    updateTabIndicator() {
        const activeBtn = document.querySelector(`.tab-btn[data-tab="${this.currentTab}"]`);
        const indicator = document.querySelector('.tab-indicator');
        
        if (activeBtn && indicator) {
            const btnRect = activeBtn.getBoundingClientRect();
            const navRect = activeBtn.parentElement.getBoundingClientRect();
            const left = btnRect.left - navRect.left;
            const width = btnRect.width;
            
            indicator.style.left = `${left}px`;
            indicator.style.width = `${width}px`;
        }
    }

    // ===== ANIMATIONS =====
    initAnimations() {
        // GSAP animations if available
        if (typeof gsap !== 'undefined') {
            this.initGSAPAnimations();
        }

        // Intersection Observer for scroll animations
        this.initScrollAnimations();
    }

    initGSAPAnimations() {
        // Hero text animation
        gsap.from('.hero-title-childrens', {
            duration: 1,
            y: 50,
            opacity: 0,
            ease: 'power3.out',
            delay: 0.2
        });

        gsap.from('.hero-description-childrens', {
            duration: 1,
            y: 30,
            opacity: 0,
            ease: 'power3.out',
            delay: 0.4
        });

        gsap.from('.hero-actions-childrens', {
            duration: 1,
            y: 30,
            opacity: 0,
            ease: 'power3.out',
            delay: 0.6
        });

        // Price calculator animation
        gsap.from('.calculator-form', {
            duration: 1,
            x: -50,
            opacity: 0,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: '.price-calculator-section',
                start: 'top 80%'
            }
        });

        gsap.from('.price-summary', {
            duration: 1,
            x: 50,
            opacity: 0,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: '.price-calculator-section',
                start: 'top 80%'
            }
        });
    }

    initScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);

        // Observe elements for animation
        document.querySelectorAll('.book-type-card, .paper-option, .binding-option, .finish-option').forEach(el => {
            observer.observe(el);
        });
    }

    // ===== EVENT BINDING =====
    bindEvents() {
        // Carousel controls
        const prevBtn = document.querySelector('.carousel-btn.prev');
        const nextBtn = document.querySelector('.carousel-btn.next');
        const indicators = document.querySelectorAll('.indicator');

        if (prevBtn) prevBtn.addEventListener('click', () => this.prevSlide());
        if (nextBtn) nextBtn.addEventListener('click', () => this.nextSlide());

        indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => this.goToSlide(index));
        });

        // Carousel hover pause
        const carousel = document.querySelector('.image-carousel');
        if (carousel) {
            carousel.addEventListener('mouseenter', () => this.stopAutoPlay());
            carousel.addEventListener('mouseleave', () => this.startAutoPlay());
        }

        // Book type selection
        const bookTypeOptions = document.querySelectorAll('.book-type-option');
        bookTypeOptions.forEach(option => {
            option.addEventListener('click', () => {
                bookTypeOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                this.calculatePrice();
            });
        });

        // Cover options
        const coverOptions = document.querySelectorAll('.cover-option');
        coverOptions.forEach(option => {
            option.addEventListener('click', () => {
                coverOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                this.calculatePrice();
            });
        });

        // Lamination options
        const laminationOptions = document.querySelectorAll('.lamination-option');
        laminationOptions.forEach(option => {
            option.addEventListener('click', () => {
                laminationOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                this.calculatePrice();
            });
        });

        // Surface options
        const surfaceOptions = document.querySelectorAll('.surface-option');
        surfaceOptions.forEach(option => {
            option.addEventListener('click', () => {
                surfaceOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                this.calculatePrice();
            });
        });

        // Thickness options
        const thicknessOptions = document.querySelectorAll('.thickness-option');
        thicknessOptions.forEach(option => {
            option.addEventListener('click', () => {
                thicknessOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                this.calculatePrice();
            });
        });

        // Spine options
        const spineOptions = document.querySelectorAll('.spine-option');
        spineOptions.forEach(option => {
            option.addEventListener('click', () => {
                spineOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                this.calculatePrice();
            });
        });

        // End sheet options
        const endsheetOptions = document.querySelectorAll('.endsheet-option');
        endsheetOptions.forEach(option => {
            option.addEventListener('click', () => {
                endsheetOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                this.calculatePrice();
            });
        });

        // Price calculator inputs
        const calculatorInputs = document.querySelectorAll('.config-select, #pages');
        calculatorInputs.forEach(input => {
            input.addEventListener('change', () => this.calculatePrice());
            input.addEventListener('input', () => this.calculatePrice());
        });

        // Checkboxes
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => this.calculatePrice());
        });

        // Tab buttons
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
        });

        // CTA buttons
        const ctaButtons = document.querySelectorAll('.hero-cta, .quote-btn, .cart-btn, .book-cta');
        ctaButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleCTAClick(e));
        });

        // Window resize for tab indicator
        window.addEventListener('resize', () => {
            setTimeout(() => this.updateTabIndicator(), 100);
        });

        // Smooth scroll for internal links
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => this.handleSmoothScroll(e));
        });

        // Form validation
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        });
    }

    // ===== EVENT HANDLERS =====
    handleCTAClick(e) {
        const button = e.target.closest('button');
        if (!button) return;

        // Add click animation
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = 'scale(1)';
        }, 150);

        // Handle different CTA types
        if (button.classList.contains('hero-cta') || button.classList.contains('price-cta')) {
            this.scrollToCalculator();
        } else if (button.classList.contains('book-cta')) {
            this.scrollToCalculator();
        }

        // Track analytics (if available)
        if (typeof gtag !== 'undefined') {
            gtag('event', 'click', {
                event_category: 'CTA',
                event_label: button.textContent.trim()
            });
        }
    }

    handleSmoothScroll(e) {
        const href = e.target.getAttribute('href');
        if (!href || !href.startsWith('#')) return;

        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
            const offsetTop = target.offsetTop - 100; // Account for fixed header
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    }

    handleFormSubmit(e) {
        e.preventDefault();
        const form = e.target;
        
        // Basic form validation
        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                isValid = false;
                field.classList.add('error');
                setTimeout(() => field.classList.remove('error'), 3000);
            }
        });

        if (isValid) {
            this.submitForm(form);
        } else {
            this.showNotification('Please fill in all required fields', 'error');
        }
    }

    // ===== UTILITY METHODS =====
    scrollToCalculator() {
        const calculator = document.querySelector('.price-calculator-section');
        if (calculator) {
            const offsetTop = calculator.offsetTop - 100;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    }

    submitForm(form) {
        // Show loading state
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn?.textContent;
        
        if (submitBtn) {
            submitBtn.textContent = 'Processing...';
            submitBtn.disabled = true;
        }

        // Simulate form submission (replace with actual API call)
        setTimeout(() => {
            this.showNotification('Thank you! We\'ll contact you soon.', 'success');
            form.reset();
            this.calculatePrice(); // Recalculate with default values
            
            if (submitBtn) {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        }, 2000);
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '16px 24px',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '500',
            zIndex: '10000',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease',
            backgroundColor: type === 'success' ? '#22c55e' : type === 'error' ? '#ef4444' : '#6366f1'
        });

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Remove after delay
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }

    // ===== CLEANUP =====
    destroy() {
        this.stopAutoPlay();
        // Remove event listeners if needed
        console.log('Children\'s Book Printing destroyed');
    }
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the children's book printing functionality
    window.childrensBookPrinting = new ChildrensBookPrinting();
    
    // Initialize theme manager and navigation from main script
    if (typeof ThemeManager !== 'undefined') {
        window.themeManager = new ThemeManager();
    }
    
    if (typeof NavigationManager !== 'undefined') {
        window.navigationManager = new NavigationManager();
    }
    
    // Initialize file upload functionality
    initFileUpload();
    
    // Add app loaded class for animations
    setTimeout(() => {
        document.body.classList.add('app-loaded');
    }, 100);
    
    console.log('Children\'s Book Printing page loaded successfully!');
});

// ===== ADDITIONAL UTILITIES =====

// Lazy loading for images
function initLazyLoading() {
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src || img.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    }
}

// Performance monitoring
function trackPerformance() {
    if ('performance' in window) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                const perfData = performance.getEntriesByType('navigation')[0];
                const loadTime = perfData.loadEventEnd - perfData.loadEventStart;
                
                console.log(`Page load time: ${loadTime}ms`);
                
                // Track with analytics if available
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'timing_complete', {
                        name: 'load',
                        value: Math.round(loadTime)
                    });
                }
            }, 0);
        });
    }
}

// Initialize additional features
document.addEventListener('DOMContentLoaded', function() {
    initLazyLoading();
    trackPerformance();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChildrensBookPrinting;
}

// ===== CHILDREN'S BOOK PRINTING ENHANCEMENTS =====

document.addEventListener('DOMContentLoaded', function() {
    // Initialize enhanced hero section features
    initEnhancedHero();
    initAnimatedCounters();
    initInteractiveElements();
    initParallaxEffects();
});

// Enhanced Hero Section Initialization
function initEnhancedHero() {
    const heroSection = document.querySelector('.hero-clean');
    if (!heroSection) return;

    // Add scroll-triggered animations
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        
        // Parallax effect for background elements
        const bgElements = heroSection.querySelectorAll('.bg-circle-clean');
        bgElements.forEach((element, index) => {
            const speed = 0.1 + (index * 0.05);
            element.style.transform = `translateY(${rate * speed}px)`;
        });
    });

    // Add mouse move effects
    heroSection.addEventListener('mousemove', (e) => {
        const { clientX, clientY } = e;
        const { innerWidth, innerHeight } = window;
        
        const x = (clientX / innerWidth - 0.5) * 20;
        const y = (clientY / innerHeight - 0.5) * 20;
        
        // Subtle movement for floating elements
        const floatingElements = heroSection.querySelectorAll('.float-element-clean');
        floatingElements.forEach((element, index) => {
            const delay = index * 0.1;
            element.style.transform = `translate(${x * delay}px, ${y * delay}px)`;
        });
    });
}

// Animated Counters for Stats
function initAnimatedCounters() {
    const counters = document.querySelectorAll('[data-count]');
    
    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = parseInt(counter.getAttribute('data-count'));
                animateCounter(counter, target);
                observer.unobserve(counter);
            }
        });
    }, observerOptions);
    
    counters.forEach(counter => observer.observe(counter));
}

function animateCounter(element, target) {
    let current = 0;
    const increment = target / 50;
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        
        // Format number with commas
        const formatted = Math.floor(current).toLocaleString();
        element.textContent = formatted + '+';
        
        // Add animation class
        element.classList.add('counter-animated');
    }, 30);
}

// Interactive Elements
function initInteractiveElements() {
    // Enhanced feature card interactions
    const featureCards = document.querySelectorAll('.feature-card-clean');
    featureCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.02)';
            this.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
            this.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.05)';
        });
    });

    // Enhanced guarantee card interactions
    const guaranteeCards = document.querySelectorAll('.guarantee-card-clean');
    guaranteeCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.02)';
            this.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
            this.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.05)';
        });
    });

    // Enhanced button interactions
    const primaryButton = document.querySelector('.btn-primary-modern');
    if (primaryButton) {
        primaryButton.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px) scale(1.02)';
        });
        
        primaryButton.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    }
}

// Parallax Effects for Book Illustration
function initParallaxEffects() {
    const bookIllustration = document.querySelector('.book-illustration-clean');
    if (!bookIllustration) return;

    let ticking = false;
    
    function updateParallax() {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.3;
        
        // Subtle parallax for book
        bookIllustration.style.transform = `translateY(${rate}px)`;
        
        // Parallax for floating elements
        const floatingElements = bookIllustration.querySelectorAll('.float-element-clean');
        floatingElements.forEach((element, index) => {
            const speed = 0.1 + (index * 0.05);
            element.style.transform = `translateY(${rate * speed}px)`;
        });
        
        ticking = false;
    }
    
    function requestTick() {
        if (!ticking) {
            requestAnimationFrame(updateParallax);
            ticking = true;
        }
    }
    
    window.addEventListener('scroll', requestTick);
    
    // Mouse move effect for book
    bookIllustration.addEventListener('mousemove', (e) => {
        const { clientX, clientY } = e;
        const { innerWidth, innerHeight } = window;
        
        const x = (clientX / innerWidth - 0.5) * 15;
        const y = (clientY / innerHeight - 0.5) * 15;
        
        bookIllustration.style.transform = `perspective(1000px) rotateY(${x}deg) rotateX(${-y}deg)`;
    });
    
    bookIllustration.addEventListener('mouseleave', () => {
        bookIllustration.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg)';
    });
}

// Enhanced Social Share Functionality
function initSocialShare() {
    const socialLinks = document.querySelectorAll('.social-link-modern');
    
    socialLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const platform = this.classList.contains('facebook') ? 'Facebook' :
                           this.classList.contains('instagram') ? 'Instagram' :
                           this.classList.contains('whatsapp') ? 'WhatsApp' :
                           this.classList.contains('pinterest') ? 'Pinterest' : 'Social Media';
            
            // Add click animation
            this.style.transform = 'scale(0.9)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
            
            // Show success message
            showShareMessage(platform);
        });
    });
}

function showShareMessage(platform) {
    // Create temporary success message
    const message = document.createElement('div');
    message.className = 'share-success-message';
    message.innerHTML = `
        <div class="message-content">
            <span class="message-icon">✅</span>
            <span>Shared on ${platform}! You've earned 5% off!</span>
        </div>
    `;
    
    document.body.appendChild(message);
    
    // Animate in
    setTimeout(() => message.classList.add('show'), 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        message.classList.remove('show');
        setTimeout(() => message.remove(), 300);
    }, 3000);
}

// Enhanced Book Animation
function initBookAnimations() {
    const bookCover = document.querySelector('.book-cover');
    const bookPages = document.querySelectorAll('.page');
    
    if (!bookCover) return;
    
    // Add page flip animation
    bookPages.forEach((page, index) => {
        page.style.animationDelay = `${index * 0.2}s`;
        page.classList.add('page-flip');
    });
    
    // Enhanced book hover effect
    bookCover.addEventListener('mouseenter', function() {
        this.style.transform = 'rotateY(-25deg) scale(1.05)';
        this.style.boxShadow = '0 30px 60px rgba(139, 92, 246, 0.4)';
    });
    
    bookCover.addEventListener('mouseleave', function() {
        this.style.transform = 'rotateY(-10deg) scale(1)';
        this.style.boxShadow = '0 20px 40px rgba(139, 92, 246, 0.3)';
    });
}

// Initialize all features
document.addEventListener('DOMContentLoaded', function() {
    initSocialShare();
    initBookAnimations();
    
    // Add CSS for success message
    addSuccessMessageStyles();
});

// Add CSS for success message
function addSuccessMessageStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .share-success-message {
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            padding: 16px 24px;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3);
            transform: translateX(400px);
            transition: transform 0.3s ease;
            z-index: 1000;
            max-width: 300px;
        }
        
        .share-success-message.show {
            transform: translateX(0);
        }
        
        .message-content {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        
        .message-icon {
            font-size: 20px;
        }
        
        .counter-animated {
            animation: counterPulse 0.6s ease-out;
        }
        
        @keyframes counterPulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
        }
        
        .page-flip {
            animation: pageFlip 0.8s ease-out forwards;
        }
        
        @keyframes pageFlip {
            0% { transform: rotateY(0deg); }
            100% { transform: rotateY(-5deg); }
        }
    `;
    document.head.appendChild(style);
}

// Enhanced scroll animations
function initScrollAnimations() {
    const elements = document.querySelectorAll('.feature-card, .guarantee-card, .stat-item-modern');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    elements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Initialize scroll animations
document.addEventListener('DOMContentLoaded', function() {
    initScrollAnimations();
});

// ===== FILE UPLOAD FUNCTIONALITY =====

// Initialize file upload functionality
function initFileUpload() {
    const uploadZone = document.getElementById('uploadZone');
    const fileInput = document.getElementById('fileInput');
    const uploadedFiles = document.getElementById('uploadedFiles');
    const fileList = document.getElementById('fileList');
    const uploadBtn = document.getElementById('uploadBtn');
    const clearBtn = document.getElementById('clearBtn');
    
    let files = [];
    
    if (!uploadZone || !fileInput) return;
    
    // Drag and drop functionality
    uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.classList.add('drag-over');
    });
    
    uploadZone.addEventListener('dragleave', () => {
        uploadZone.classList.remove('drag-over');
    });
    
    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('drag-over');
        const droppedFiles = Array.from(e.dataTransfer.files);
        handleFiles(droppedFiles);
    });
    
    // Click to browse files
    uploadZone.addEventListener('click', () => {
        fileInput.click();
    });
    
    // File input change
    fileInput.addEventListener('change', (e) => {
        const selectedFiles = Array.from(e.target.files);
        handleFiles(selectedFiles);
    });
    
    // Handle selected files
    function handleFiles(newFiles) {
        // Filter files by type and size
        const validFiles = newFiles.filter(file => {
            const isValidType = isValidFileType(file);
            const isValidSize = file.size <= 100 * 1024 * 1024; // 100MB limit
            
            if (!isValidType) {
                showNotification(`File type not supported: ${file.name}`, 'error');
            }
            if (!isValidSize) {
                showNotification(`File too large: ${file.name} (max 100MB)`, 'error');
            }
            
            return isValidType && isValidSize;
        });
        
        if (validFiles.length > 0) {
            files = [...files, ...validFiles];
            updateFileList();
            updateUploadButton();
            showNotification(`${validFiles.length} file(s) added successfully!`, 'success');
        }
    }
    
    // Validate file type
    function isValidFileType(file) {
        const validTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/postscript',
            'image/jpeg',
            'image/png',
            'image/tiff',
            'application/illustrator',
            'application/x-photoshop'
        ];
        
        return validTypes.includes(file.type) || 
               file.name.toLowerCase().endsWith('.ai') ||
               file.name.toLowerCase().endsWith('.psd') ||
               file.name.toLowerCase().endsWith('.indd');
    }
    
    // Update file list display
    function updateFileList() {
        if (files.length === 0) {
            uploadedFiles.style.display = 'none';
            return;
        }
        
        uploadedFiles.style.display = 'block';
        fileList.innerHTML = '';
        
        files.forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            
            const fileSize = formatFileSize(file.size);
            const fileExtension = getFileExtension(file.name);
            
            fileItem.innerHTML = `
                <div class="file-info">
                    <div class="file-icon">${fileExtension.toUpperCase()}</div>
                    <div class="file-details">
                        <div class="file-name">${file.name}</div>
                        <div class="file-size">${fileSize}</div>
                    </div>
                </div>
                <div class="file-actions">
                    <button class="btn-remove" onclick="removeFile(${index})" aria-label="Remove file">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M18 6L6 18M6 6l12 12"/>
                        </svg>
                    </button>
                </div>
            `;
            
            fileList.appendChild(fileItem);
        });
    }
    
    // Update upload button state
    function updateUploadButton() {
        uploadBtn.disabled = files.length === 0;
        clearBtn.style.display = files.length > 0 ? 'block' : 'none';
    }
    
    // Remove file
    window.removeFile = function(index) {
        files.splice(index, 1);
        updateFileList();
        updateUploadButton();
        showNotification('File removed successfully!', 'success');
    };
    
    // Clear all files
    clearBtn.addEventListener('click', () => {
        files = [];
        updateFileList();
        updateUploadButton();
        fileInput.value = '';
        showNotification('All files cleared!', 'success');
    });
    
    // Upload files
    uploadBtn.addEventListener('click', () => {
        if (files.length === 0) return;
        
        // Show loading state
        uploadBtn.disabled = true;
        uploadBtn.innerHTML = `
            <span>Uploading...</span>
            <div class="btn-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="animate-spin">
                    <path d="M21 12a9 9 0 11-6.219-8.56"/>
                </svg>
            </div>
        `;
        
        // Simulate upload process
        setTimeout(() => {
            showNotification('Files uploaded successfully! Redirecting to quote...', 'success');
            
            // Reset button
            setTimeout(() => {
                uploadBtn.disabled = false;
                uploadBtn.innerHTML = `
                    <span>Upload Files & Continue</span>
                    <div class="btn-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M5 12h14M12 5l7 7-7 7"/>
                        </svg>
                    </div>
                `;
                
                // Scroll to tabs section
                const tabsSection = document.querySelector('.tabs-section');
                if (tabsSection) {
                    tabsSection.scrollIntoView({ behavior: 'smooth' });
                }
            }, 2000);
        }, 2000);
    });
}

// Utility functions
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getFileExtension(filename) {
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#6366f1'};
        color: white;
        padding: 16px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        max-width: 400px;
        animation: slideInRight 0.3s ease;
    `;
    
    // Add keyframe animation
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

