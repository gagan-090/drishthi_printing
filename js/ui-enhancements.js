/**
 * UI Enhancements for Home Page
 * Handles modern animations, interactions, and visual effects
 */

class UIEnhancements {
  constructor() {
    this.init();
  }

  init() {
    this.setupScrollReveal();
    this.setupParallaxEffects();
    this.setupEnhancedHover();
    this.setupSmoothAnimations();
    this.setupIntersectionObserver();
    this.setupPerformanceOptimizations();
  }

  /**
   * Setup scroll reveal animations
   */
  setupScrollReveal() {
    const revealElements = document.querySelectorAll('.scroll-reveal');
    
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          revealObserver.unobserve(entry.target);
        }
      });
    }, observerOptions);

    revealElements.forEach(element => {
      revealObserver.observe(element);
    });
  }

  /**
   * Setup parallax effects for hero elements
   */
  setupParallaxEffects() {
    const heroElements = document.querySelectorAll('.hero-image, .hero-visual img');
    
    if (window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
      window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.3;
        
        heroElements.forEach(element => {
          element.style.transform = `translateY(${rate}px)`;
        });
      }, { passive: true });
    }
  }

  /**
   * Setup enhanced hover effects
   */
  setupEnhancedHover() {
    // Enhanced service card interactions
    const serviceCards = document.querySelectorAll('.service-card');
    
    serviceCards.forEach(card => {
      card.addEventListener('mouseenter', (e) => {
        this.createRippleEffect(e.target, e);
        this.enhanceCardHover(card, true);
      });
      
      card.addEventListener('mouseleave', () => {
        this.enhanceCardHover(card, false);
      });
    });

    // Enhanced product card interactions
    const productCards = document.querySelectorAll('.product-card, .new-product-card');
    
    productCards.forEach(card => {
      card.addEventListener('mouseenter', (e) => {
        this.createShimmerEffect(card);
      });
    });

    // Enhanced button interactions
    const buttons = document.querySelectorAll('.btn-primary');
    
    buttons.forEach(button => {
      button.addEventListener('click', (e) => {
        this.createClickWave(e);
      });
    });
  }

  /**
   * Create ripple effect on card hover
   */
  createRippleEffect(element, event) {
    const ripple = document.createElement('div');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.cssText = `
      position: absolute;
      border-radius: 50%;
      background: rgba(99, 102, 241, 0.1);
      transform: scale(0);
      animation: ripple 0.6s linear;
      left: ${x}px;
      top: ${y}px;
      width: ${size}px;
      height: ${size}px;
      pointer-events: none;
      z-index: 1;
    `;
    
    element.style.position = 'relative';
    element.style.overflow = 'hidden';
    element.appendChild(ripple);
    
    setTimeout(() => {
      ripple.remove();
    }, 600);
  }

  /**
   * Enhance card hover with additional effects
   */
  enhanceCardHover(card, isHovering) {
    const image = card.querySelector('img');
    const content = card.querySelector('.service-content, .product-content');
    
    if (isHovering) {
      if (image) {
        image.style.transform = 'scale(1.1) rotate(1deg)';
        image.style.filter = 'brightness(1.1) saturate(1.2)';
      }
      
      if (content) {
        content.style.transform = 'translateY(-2px)';
      }
      
      // Add glow effect
      card.style.boxShadow = '0 20px 40px rgba(99, 102, 241, 0.2), 0 0 0 1px rgba(99, 102, 241, 0.1)';
    } else {
      if (image) {
        image.style.transform = '';
        image.style.filter = '';
      }
      
      if (content) {
        content.style.transform = '';
      }
      
      card.style.boxShadow = '';
    }
  }

  /**
   * Create shimmer effect on product cards
   */
  createShimmerEffect(card) {
    const shimmer = document.createElement('div');
    shimmer.style.cssText = `
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(
        90deg,
        transparent,
        rgba(255, 255, 255, 0.4),
        transparent
      );
      animation: shimmer 0.8s ease-out;
      pointer-events: none;
      z-index: 2;
    `;
    
    card.style.position = 'relative';
    card.style.overflow = 'hidden';
    card.appendChild(shimmer);
    
    setTimeout(() => {
      shimmer.remove();
    }, 800);
  }

  /**
   * Create click wave effect on buttons
   */
  createClickWave(event) {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    const wave = document.createElement('div');
    wave.style.cssText = `
      position: absolute;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.3);
      transform: scale(0);
      animation: clickWave 0.5s ease-out;
      left: ${x}px;
      top: ${y}px;
      width: ${size}px;
      height: ${size}px;
      pointer-events: none;
      z-index: 1;
    `;
    
    button.style.position = 'relative';
    button.style.overflow = 'hidden';
    button.appendChild(wave);
    
    setTimeout(() => {
      wave.remove();
    }, 500);
  }

  /**
   * Setup smooth animations with staggered delays
   */
  setupSmoothAnimations() {
    const animateElements = document.querySelectorAll('[data-animation]');
    
    const animationObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          const delay = parseInt(entry.target.dataset.delay) || index * 100;
          const animation = entry.target.dataset.animation;
          
          setTimeout(() => {
            entry.target.classList.add(`animate-${animation}`);
          }, delay);
          
          animationObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -20px 0px'
    });

    animateElements.forEach(element => {
      animationObserver.observe(element);
    });
  }

  /**
   * Setup intersection observer for performance
   */
  setupIntersectionObserver() {
    // Lazy load images with enhanced effects
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          
          // Create loading placeholder
          img.style.filter = 'blur(5px)';
          img.style.transition = 'filter 0.3s ease';
          
          // Load actual image
          img.src = img.dataset.src;
          img.onload = () => {
            img.style.filter = 'blur(0)';
            img.classList.add('loaded');
          };
          
          imageObserver.unobserve(img);
        }
      });
    });

    images.forEach(img => {
      imageObserver.observe(img);
    });
  }

  /**
   * Setup performance optimizations
   */
  setupPerformanceOptimizations() {
    // Throttle scroll events
    let scrollTimeout;
    window.addEventListener('scroll', () => {
      if (!scrollTimeout) {
        scrollTimeout = setTimeout(() => {
          this.handleScroll();
          scrollTimeout = null;
        }, 16); // 60fps
      }
    }, { passive: true });

    // Optimize animations based on device capabilities
    if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
      document.documentElement.classList.add('low-performance');
    }

    // Disable heavy animations on low battery
    if ('getBattery' in navigator) {
      navigator.getBattery().then(battery => {
        if (battery.level < 0.2) {
          document.documentElement.classList.add('reduced-animations');
        }
      });
    }
  }

  /**
   * Handle scroll events with optimizations
   */
  handleScroll() {
    const scrolled = window.pageYOffset;
    
    // Update scroll progress
    const scrollProgress = document.getElementById('scrollProgress');
    if (scrollProgress) {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrolled / maxScroll) * 100;
      scrollProgress.style.width = `${progress}%`;
    }

    // Add scroll-based effects
    const header = document.querySelector('.header');
    if (header) {
      if (scrolled > 100) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }
  }

  /**
   * Initialize enhanced newsletter form
   */
  setupEnhancedNewsletter() {
    const newsletterForm = document.querySelector('.newsletter-modern-form, .newsletter-form');
    
    if (newsletterForm) {
      const input = newsletterForm.querySelector('input[type="email"]');
      const button = newsletterForm.querySelector('button[type="submit"]');
      
      if (input && button) {
        input.addEventListener('focus', () => {
          newsletterForm.classList.add('focused');
        });
        
        input.addEventListener('blur', () => {
          newsletterForm.classList.remove('focused');
        });
        
        // Enhanced form submission with loading states
        newsletterForm.addEventListener('submit', (e) => {
          e.preventDefault();
          button.classList.add('loading');
          button.textContent = 'Subscribing...';
          
          // Simulate API call
          setTimeout(() => {
            button.classList.remove('loading');
            button.classList.add('success');
            button.textContent = 'Subscribed!';
            
            setTimeout(() => {
              button.classList.remove('success');
              button.textContent = 'Subscribe';
            }, 2000);
          }, 1500);
        });
      }
    }
  }
}

// CSS animations
const enhancedAnimations = `
  @keyframes ripple {
    to {
      transform: scale(2);
      opacity: 0;
    }
  }
  
  @keyframes shimmer {
    to {
      left: 100%;
    }
  }
  
  @keyframes clickWave {
    to {
      transform: scale(1);
      opacity: 0;
    }
  }
  
  .header.scrolled {
    background: rgba(255, 255, 255, 0.95) !important;
    backdrop-filter: blur(20px) !important;
    box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1) !important;
  }
  
  [data-theme="dark"] .header.scrolled {
    background: rgba(17, 24, 39, 0.95) !important;
  }
  
  .low-performance * {
    animation-duration: 0.1s !important;
    transition-duration: 0.1s !important;
  }
  
  .reduced-animations * {
    animation: none !important;
    transition: none !important;
  }
  
  .newsletter-modern-form.focused .newsletter-input-group {
    transform: translateY(-2px);
    box-shadow: 0 10px 40px rgba(255, 215, 0, 0.3);
  }
  
  .btn.loading {
    position: relative;
    pointer-events: none;
  }
  
  .btn.loading::after {
    content: "";
    position: absolute;
    width: 16px;
    height: 16px;
    border: 2px solid transparent;
    border-top: 2px solid currentColor;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
  }
  
  .btn.success {
    background: var(--success-color) !important;
  }
  
  @keyframes spin {
    to {
      transform: translateY(-50%) rotate(360deg);
    }
  }
`;

// Inject CSS animations
const style = document.createElement('style');
style.textContent = enhancedAnimations;
document.head.appendChild(style);

// Initialize UI enhancements when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new UIEnhancements();
  });
} else {
  new UIEnhancements();
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = UIEnhancements;
}

