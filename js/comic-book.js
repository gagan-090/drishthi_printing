// Comic Book Page JavaScript
class ComicBookPage {
    constructor() {
        this.pricingData = {
            basePrices: {
                'saddle': { 25: 180, 50: 220, 100: 285, 250: 580, 500: 980 },
                'perfect': { 25: 220, 50: 285, 100: 380, 250: 750, 500: 1280 },
                'hardcover': { 25: 380, 50: 480, 100: 680, 250: 1380, 500: 2280 }
            },
            paperUpgrades: {
                '80gsm': 0,
                '100gsm': 25
            },
            bindingCosts: {
                'saddle': 0,
                'perfect': 141,
                'hardcover': 285
            }
        };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.setupAnimations();
        this.setupPricingCalculator();
        this.calculatePrice();
    }
    
    setupEventListeners() {
        // Mobile menu toggle
        const mobileToggle = document.querySelector('.mobile-toggle');
        const navMenu = document.querySelector('.nav-menu');
        
        if (mobileToggle && navMenu) {
            mobileToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                mobileToggle.classList.toggle('active');
            });
        }
        
        // Smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
        
        // Header scroll effect
        window.addEventListener('scroll', () => {
            const header = document.querySelector('.header');
            if (window.scrollY > 100) {
                header.style.background = 'rgba(255, 255, 255, 0.98)';
                header.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.1)';
            } else {
                header.style.background = 'rgba(255, 255, 255, 0.95)';
                header.style.boxShadow = 'none';
            }
        });
    }
    
    setupAnimations() {
        if (typeof gsap !== 'undefined') {
            // Hero animations
            gsap.timeline({ delay: 0.3 })
                .from('.hero-badge', { opacity: 0, y: 30, duration: 0.8 })
                .from('.hero-title .title-line', { opacity: 0, y: 50, stagger: 0.2, duration: 0.8 }, '-=0.4')
                .from('.hero-description', { opacity: 0, y: 30, duration: 0.8 }, '-=0.4')
                .from('.hero-features .feature', { opacity: 0, x: -20, stagger: 0.1, duration: 0.6 }, '-=0.4')
                .from('.hero-buttons .btn-primary, .hero-buttons .btn-secondary', { opacity: 0, y: 20, stagger: 0.1, duration: 0.6 }, '-=0.2')
                .from('.hero-stats .stat', { opacity: 0, y: 20, stagger: 0.1, duration: 0.6 }, '-=0.4')
                .from('.comic-showcase', { opacity: 0, x: 100, duration: 1 }, '-=0.8');
            
            // Scroll triggered animations
            gsap.utils.toArray('.feature-card').forEach((card, index) => {
                gsap.from(card, {
                    opacity: 0,
                    y: 50,
                    duration: 0.8,
                    delay: index * 0.1,
                    scrollTrigger: {
                        trigger: card,
                        start: 'top 85%',
                        toggleActions: 'play none none reverse'
                    }
                });
            });
        }
        
        // Intersection Observer for fade-in animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, observerOptions);
        
        document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right').forEach(el => {
            observer.observe(el);
        });
    }
    
    setupPricingCalculator() {
        // Quantity buttons
        const qtyButtons = document.querySelectorAll('.qty-btn');
        const customQty = document.getElementById('customQty');
        
        qtyButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                qtyButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                customQty.value = btn.dataset.qty;
                this.calculatePrice();
            });
        });
        
        // Custom quantity input
        if (customQty) {
            customQty.addEventListener('input', () => {
                qtyButtons.forEach(btn => btn.classList.remove('active'));
                this.calculatePrice();
            });
        }
        
        // Page count slider and input
        const pageRange = document.getElementById('pageRange');
        const pageCount = document.getElementById('pageCount');
        
        if (pageRange && pageCount) {
            pageRange.addEventListener('input', () => {
                pageCount.value = pageRange.value;
                this.calculatePrice();
            });
            
            pageCount.addEventListener('input', () => {
                pageRange.value = pageCount.value;
                this.calculatePrice();
            });
        }
        
        // Paper selection
        const paperOptions = document.querySelectorAll('.paper-option');
        paperOptions.forEach(option => {
            option.addEventListener('click', () => {
                paperOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                this.calculatePrice();
            });
        });
        
        // Binding selection
        const bindingOptions = document.querySelectorAll('.binding-option');
        bindingOptions.forEach(option => {
            option.addEventListener('click', () => {
                bindingOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                this.calculatePrice();
            });
        });
        
        // Size selection
        const sizeSelect = document.getElementById('bookSize');
        if (sizeSelect) {
            sizeSelect.addEventListener('change', this.calculatePrice.bind(this));
        }
    }
    
    calculatePrice() {
        try {
            // Get current selections
            const quantity = parseInt(document.getElementById('customQty')?.value || 100);
            const pageCount = parseInt(document.getElementById('pageCount')?.value || 32);
            const selectedPaper = document.querySelector('.paper-option.active')?.dataset.paper || '80gsm';
            const selectedBinding = document.querySelector('.binding-option.active')?.dataset.binding || 'saddle';
            
            // Calculate base cost
            const basePrices = this.pricingData.basePrices[selectedBinding];
            let baseCost = this.interpolatePrice(basePrices, quantity);
            
            // Adjust for page count
            if (pageCount !== 32) {
                baseCost *= (pageCount / 32);
            }
            
            // Calculate upgrades
            const paperCost = this.pricingData.paperUpgrades[selectedPaper] || 0;
            const bindingCost = this.pricingData.bindingCosts[selectedBinding] || 0;
            
            // Calculate total
            const total = Math.round(baseCost + paperCost + bindingCost);
            const perUnit = (total / quantity).toFixed(2);
            
            // Update UI
            this.updatePriceDisplay({
                baseCost: baseCost.toFixed(2),
                paperCost: paperCost.toFixed(2),
                bindingCost: bindingCost.toFixed(2),
                total: total,
                perUnit: perUnit
            });
            
        } catch (error) {
            console.error('Price calculation error:', error);
        }
    }
    
    interpolatePrice(priceTable, quantity) {
        const quantities = Object.keys(priceTable).map(Number).sort((a, b) => a - b);
        
        if (quantity <= quantities[0]) {
            return priceTable[quantities[0]];
        }
        
        if (quantity >= quantities[quantities.length - 1]) {
            const basePrice = priceTable[quantities[quantities.length - 1]];
            const baseQty = quantities[quantities.length - 1];
            return basePrice * (quantity / baseQty) * 0.9; // Volume discount
        }
        
        // Linear interpolation between two closest points
        for (let i = 0; i < quantities.length - 1; i++) {
            const lowerQty = quantities[i];
            const upperQty = quantities[i + 1];
            
            if (quantity >= lowerQty && quantity <= upperQty) {
                const lowerPrice = priceTable[lowerQty];
                const upperPrice = priceTable[upperQty];
                const ratio = (quantity - lowerQty) / (upperQty - lowerQty);
                return lowerPrice + (upperPrice - lowerPrice) * ratio;
            }
        }
        
        return priceTable[quantities[0]];
    }
    
    updatePriceDisplay(prices) {
        // Update price elements with smooth animation
        const elements = {
            baseCost: document.getElementById('baseCost'),
            paperCost: document.getElementById('paperCost'),
            bindingCost: document.getElementById('bindingCost'),
            totalPrice: document.getElementById('totalPrice'),
            unitPrice: document.getElementById('unitPrice')
        };
        
        // Animate price changes
        if (typeof gsap !== 'undefined') {
            Object.values(elements).forEach(el => {
                if (el) {
                    gsap.fromTo(el, 
                        { scale: 1.1, color: '#667eea' },
                        { scale: 1, color: 'inherit', duration: 0.3 }
                    );
                }
            });
        }
        
        // Update values
        if (elements.baseCost) elements.baseCost.textContent = `$${prices.baseCost}`;
        if (elements.paperCost) elements.paperCost.textContent = `$${prices.paperCost}`;
        if (elements.bindingCost) elements.bindingCost.textContent = `$${prices.bindingCost}`;
        if (elements.totalPrice) elements.totalPrice.textContent = `$${prices.total}`;
        if (elements.unitPrice) elements.unitPrice.textContent = `$${prices.perUnit}`;
        
        // Update order button
        const orderBtn = document.querySelector('.btn-order');
        if (orderBtn) {
            orderBtn.innerHTML = `Order Now - $${prices.total} <i class="btn-icon">🛒</i>`;
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ComicBookPage();
});

// Handle page visibility for performance
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Pause animations when page is hidden
        if (typeof gsap !== 'undefined') {
            gsap.globalTimeline.pause();
        }
    } else {
        // Resume animations when page is visible
        if (typeof gsap !== 'undefined') {
            gsap.globalTimeline.resume();
        }
    }
});
