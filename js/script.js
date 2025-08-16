// ===== GLOBAL VARIABLES =====
let isLoading = false;
let currentTestimonial = 0;
let testimonials = [];
let products = [];
let blogPosts = [];

// ===== UTILITY FUNCTIONS =====
console.log('🚀 Script.js loaded successfully!');

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

const throttle = (func, limit) => {
  let inThrottle;
  return function () {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }
};

// ===== THEME MANAGEMENT =====
class ThemeManager {
  constructor() {
    this.currentTheme = localStorage.getItem('theme') || 'light';
    this.init();
  }

  init() {
    this.setTheme(this.currentTheme);
    this.bindEvents();
  }

  setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    this.currentTheme = theme;
  }

  toggleTheme() {
    const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  bindEvents() {
    const themeToggle = $('#themeToggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => this.toggleTheme());
    }
  }
}

// ===== NAVIGATION MANAGEMENT =====
class NavigationManager {
  constructor() {
    this.navbar = $('.navbar');
    this.header = $('.header'); // Add header reference for auto-hide
    this.navbarToggle = $('#navbarToggle');
    this.navbarMenu = $('#navbarMenu');
    this.isMenuOpen = false;
    this.lastScrollY = 0;
    this.isNavbarVisible = true;
    this.scrollThreshold = 60; // Minimum scroll distance to trigger hide/show  
    this.scrollDelta = 3; // Minimum scroll delta to trigger direction detection
    this.init();
  }

  init() {
    this.bindEvents();
    this.handleScroll();
  }

  bindEvents() {
    // Mobile menu toggle
    if (this.navbarToggle) {
      this.navbarToggle.addEventListener('click', () => this.toggleMobileMenu());
    }

    // Close menu when clicking on links
    const navLinks = $$('.navbar-nav a');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        this.closeMobileMenu();
        // Also close all mega menus
        this.resetAllMegaMenus();
      });
    });

    // Smooth scroll for navigation links
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => this.handleSmoothScroll(e));
    });

    // Handle scroll events
    window.addEventListener('scroll', throttle(() => this.handleScroll(), 100));

    // Handle window resize to manage mega menu states
    window.addEventListener('resize', throttle(() => this.handleMegaMenuResizeImproved(), 250));

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!this.navbar.contains(e.target) && this.isMenuOpen) {
        this.closeMobileMenu();
      }
    });

    // Handle escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (this.isMenuOpen) {
          this.closeMobileMenu();
        }
        // Also close any open mega menus
        this.resetAllMegaMenus();
      }
    });

    // Mega menu functionality - using CSS-only approach
    this.initSimpleMegaMenu();
  }

  initMegaMenu() {
    const megaMenuItems = $$('.mega-menu-item');
    let currentOpenMenu = null;
    let isInNavigationArea = false;

    // Create a large invisible navigation area that covers the entire nav + mega menu
    const navigationArea = document.createElement('div');
    navigationArea.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: transparent;
      z-index: 998;
      pointer-events: none;
      display: none;
    `;
    document.body.appendChild(navigationArea);

    megaMenuItems.forEach(item => {
      const trigger = item.querySelector('a');
      const megaMenu = item.querySelector('.mega-menu');

      if (!trigger || !megaMenu) {
        return;
      }

      // Desktop hover behavior
      if (window.innerWidth > 1024) {
        
        // Mouse enter nav item - open mega menu
        item.addEventListener('mouseenter', () => {
          // Close any other open menu
          if (currentOpenMenu && currentOpenMenu !== item) {
            currentOpenMenu.classList.remove('mega-menu-active');
            this.hideMegaMenu(currentOpenMenu);
          }
          
          // Open this menu
          this.showMegaMenu(item);
          item.classList.add('mega-menu-active');
          currentOpenMenu = item;
          
          // Show navigation area
          navigationArea.style.display = 'block';
          isInNavigationArea = true;
        });

        // Mouse enter mega menu - keep it open
        megaMenu.addEventListener('mouseenter', () => {
          if (currentOpenMenu === item) {
            isInNavigationArea = true;
          }
        });

        // Mobile click behavior
        if (window.innerWidth <= 1024) {
          trigger.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleMegaMenu(item);
          });
        }

        // Handle keyboard navigation
        trigger.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (window.innerWidth <= 1024) {
              this.toggleMegaMenu(item);
            }
          }
        });

        // Close mega menu when clicking outside
        document.addEventListener('click', (e) => {
          if (!item.contains(e.target)) {
            this.hideMegaMenu(item);
            if (window.innerWidth <= 1024) {
              item.classList.remove('active');
            }
          }
        });

        // Enhanced keyboard navigation for mega menu links
        const megaMenuLinks = megaMenu.querySelectorAll('a');
        megaMenuLinks.forEach((link, index) => {
          link.addEventListener('click', () => {
            if (window.innerWidth <= 1024) {
              this.resetAllMegaMenus();
            }
          });

          link.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              const nextLink = megaMenuLinks[index + 1] || megaMenuLinks[0];
              nextLink.focus();
            } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              const prevLink = megaMenuLinks[index - 1] || megaMenuLinks[megaMenuLinks.length - 1];
              prevLink.focus();
            } else if (e.key === 'Escape') {
              e.preventDefault();
              this.hideMegaMenu(item);
              if (window.innerWidth <= 1024) {
                item.classList.remove('active');
              }
              trigger.focus();
            }
          });
        });
      }
    });

    // Global mouse tracking - only close when cursor leaves entire navigation area
    document.addEventListener('mousemove', (e) => {
      const target = e.target;
      const isOverNav = target.closest('.navbar') || target.closest('.mega-menu') || target.closest('.mega-menu-item');
      
      if (isOverNav) {
        isInNavigationArea = true;
      } else {
        // Only close if we're really outside the navigation area
        if (isInNavigationArea && currentOpenMenu) {
          setTimeout(() => {
            if (!isInNavigationArea) {
              currentOpenMenu.classList.remove('mega-menu-active');
              this.hideMegaMenu(currentOpenMenu);
              currentOpenMenu = null;
              navigationArea.style.display = 'none';
            }
          }, 200);
        }
        isInNavigationArea = false;
      }
    });
  }

  showMegaMenu(item) {
    const megaMenu = item.querySelector('.mega-menu');
    const trigger = item.querySelector('a');

    if (megaMenu && trigger) {
      // Close all other mega menus first
      this.closeAllOtherMegaMenus(item);
      
      // Calculate the center position based on viewport width
      const viewportWidth = window.innerWidth;
      const megaMenuWidth = Math.min(1400, viewportWidth - 40); // 40px for margins

      // Add active class first for CSS transitions
      item.classList.add('mega-menu-active');
      
      // Set styles with a small delay to allow CSS transitions
      requestAnimationFrame(() => {
        megaMenu.style.width = `${megaMenuWidth}px`;
        megaMenu.style.left = '50%';
        megaMenu.style.transform = 'translateX(-50%) translateY(0)';
        megaMenu.style.opacity = '1';
        megaMenu.style.visibility = 'visible';
        megaMenu.style.pointerEvents = 'auto';
        megaMenu.style.zIndex = '9999';
      });
      
      trigger.setAttribute('aria-expanded', 'true');
    }
  }

  hideMegaMenu(item) {
    const megaMenu = item.querySelector('.mega-menu');
    const trigger = item.querySelector('a');

    if (megaMenu && trigger) {
      // Remove active class first to trigger CSS transitions
      item.classList.remove('mega-menu-active');
      
      // Reset styles after transition
      setTimeout(() => {
        megaMenu.style.opacity = '0';
        megaMenu.style.visibility = 'hidden';
        megaMenu.style.transform = 'translateX(-50%) translateY(-20px)';
        megaMenu.style.pointerEvents = 'none';
        
        // For mobile devices, also reset display property
        if (window.innerWidth <= 1024) {
          megaMenu.style.display = 'none';
        }
      }, 300); // Slightly longer than CSS transition

      trigger.setAttribute('aria-expanded', 'false');
      item.classList.remove('active');
    }
  }

  toggleMegaMenu(item) {
    const isActive = item.classList.contains('active');

    // Close all other mega menus
    $$('.mega-menu-item').forEach(otherItem => {
      if (otherItem !== item) {
        otherItem.classList.remove('active');
        this.hideMegaMenu(otherItem);
      }
    });

    if (isActive) {
      item.classList.remove('active');
      this.hideMegaMenu(item);
    } else {
      item.classList.add('active');
      const megaMenu = item.querySelector('.mega-menu');
      const trigger = item.querySelector('a');

      if (megaMenu && trigger) {
        // For mobile devices, ensure display is set to block
        if (window.innerWidth <= 1024) {
          megaMenu.style.display = 'block';
        }
        trigger.setAttribute('aria-expanded', 'true');
      }
    }
  }

  handleMegaMenuResize() {
    const megaMenuItems = $$('.mega-menu-item');

    megaMenuItems.forEach(item => {
      if (window.innerWidth > 1024) {
        // Desktop: reset to hover behavior
        item.classList.remove('active');
        this.hideMegaMenu(item);
      } else {
        // Mobile: ensure proper mobile behavior
        const megaMenu = item.querySelector('.mega-menu');
        if (megaMenu) {
          // Reset all styles for mobile
          megaMenu.style.opacity = '';
          megaMenu.style.visibility = '';
          megaMenu.style.transform = '';
          megaMenu.style.display = item.classList.contains('active') ? 'block' : 'none';
        }
      }
    });
  }

  resetAllMegaMenus() {
    const megaMenuItems = $$('.mega-menu-item');
    megaMenuItems.forEach(item => {
      item.classList.remove('active');
      this.hideMegaMenu(item);
    });
  }

  closeAllOtherMegaMenus(currentItem) {
    const megaMenuItems = $$('.mega-menu-item');
    megaMenuItems.forEach(item => {
      if (item !== currentItem) {
        item.classList.remove('mega-menu-active');
        this.hideMegaMenu(item);
      }
    });
  }

  toggleMobileMenu() {
    this.isMenuOpen = !this.isMenuOpen;
    this.navbarMenu.classList.toggle('active');
    this.navbarToggle.classList.toggle('active');
    this.navbarToggle.setAttribute('aria-expanded', this.isMenuOpen);

    // Prevent body scroll when menu is open
    document.body.style.overflow = this.isMenuOpen ? 'hidden' : '';
  }

  closeMobileMenu() {
    this.isMenuOpen = false;
    this.navbarMenu.classList.remove('active');
    this.navbarToggle.classList.remove('active');
    this.navbarToggle.setAttribute('aria-expanded', false);
    document.body.style.overflow = '';

    // Close all mega menus when mobile menu is closed
    $$('.mega-menu-item').forEach(item => {
      item.classList.remove('active');
      this.hideMegaMenu(item);
    });
  }

  handleSmoothScroll(e) {
    const href = e.target.getAttribute('href');
    if (href && href.startsWith('#')) {
      e.preventDefault();
      const target = $(href);
      if (target) {
        const offsetTop = target.offsetTop - 80; // Account for fixed navbar
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        });
      }
    }
  }

  handleScroll() {
    const currentScrollY = window.scrollY;
    const scrolled = currentScrollY > 50;
    const scrollDifference = Math.abs(currentScrollY - this.lastScrollY);

    // Add scrolled class for styling
    if (this.header) {
      this.header.classList.toggle('scrolled', scrolled);
    }

    // Handle navbar hide/show based on scroll direction
    if (currentScrollY > this.scrollThreshold && scrollDifference > this.scrollDelta) {
      const isScrollingDown = currentScrollY > this.lastScrollY;
      const isScrollingUp = currentScrollY < this.lastScrollY;

      if (isScrollingDown && this.isNavbarVisible) {
        // Hide navbar when scrolling down
        this.hideNavbar();
      } else if (isScrollingUp && !this.isNavbarVisible) {
        // Show navbar when scrolling up
        this.showNavbar();
      }
    } else if (currentScrollY <= this.scrollThreshold && !this.isNavbarVisible) {
      // Always show navbar at the top
      this.showNavbar();
    }

    this.lastScrollY = currentScrollY;
  }

  hideNavbar() {
    if (this.header) {
      this.header.classList.add('navbar-hidden');
      this.isNavbarVisible = false;
    }
  }

  showNavbar() {
    if (this.header) {
      this.header.classList.remove('navbar-hidden');
      this.isNavbarVisible = true;
    }
  }

  // Improved mega menu functionality with better performance
  initMegaMenuImproved() {
    const megaMenuItems = $$('.mega-menu-item');
    const allNavItems = $$('.navbar-nav li');

    // Clear any existing event listeners to prevent duplicates
    this.cleanupMegaMenuEvents();

    // Store references for cleanup
    if (!this.megaMenuEventHandlers) {
      this.megaMenuEventHandlers = new Map();
    }

    // Simple approach: Add mouseenter to ALL nav items
    allNavItems.forEach(navItem => {
      const isMegaMenuItem = navItem.classList.contains('mega-menu-item');

      if (window.innerWidth > 1024) {
        const navMouseEnterHandler = () => {
          // Always close all mega menus first
          this.resetAllMegaMenus();

          // If this is a mega menu item, show it after a brief delay
          if (isMegaMenuItem) {
            setTimeout(() => {
              this.showMegaMenu(navItem);
            }, 50);
          }
        };

        navItem.addEventListener('mouseenter', navMouseEnterHandler);
        this.megaMenuEventHandlers.set(navItem, { mouseenter: navMouseEnterHandler });
      }
    });

    // Handle mobile click behavior for mega menu items
    megaMenuItems.forEach(item => {
      const trigger = item.querySelector('a');
      const megaMenu = item.querySelector('.mega-menu');

      if (!trigger || !megaMenu) return;

      if (window.innerWidth <= 1024) {
        // Mobile click behavior
        const clickHandler = (e) => {
          e.preventDefault();
          this.toggleMegaMenu(item);
        };

        trigger.addEventListener('click', clickHandler);

        // Store mobile handlers separately
        const existingHandlers = this.megaMenuEventHandlers.get(item) || {};
        this.megaMenuEventHandlers.set(item, { ...existingHandlers, click: clickHandler });
      }

      // Add hover area to mega menu content to prevent closing when moving mouse into it
      if (window.innerWidth > 1024) {
        const megaMenuEnterHandler = () => {
          // Keep the menu open when hovering over the mega menu content
          clearTimeout(this._globalHideTimeout);
        };

        const megaMenuLeaveHandler = () => {
          // Close menu when leaving the mega menu content
          this._globalHideTimeout = setTimeout(() => {
            this.resetAllMegaMenus();
          }, 300);
        };

        megaMenu.addEventListener('mouseenter', megaMenuEnterHandler);
        megaMenu.addEventListener('mouseleave', megaMenuLeaveHandler);

        const existingHandlers = this.megaMenuEventHandlers.get(item) || {};
        this.megaMenuEventHandlers.set(item, {
          ...existingHandlers,
          megaMenuEnter: megaMenuEnterHandler,
          megaMenuLeave: megaMenuLeaveHandler
        });
      }

      // Keyboard navigation
      const keydownHandler = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (window.innerWidth <= 1024) {
            this.toggleMegaMenu(item);
          } else {
            this.showMegaMenu(item);
          }
        } else if (e.key === 'Escape') {
          e.preventDefault();
          this.hideMegaMenu(item);
          item.classList.remove('active');
        }
      };

      trigger.addEventListener('keydown', keydownHandler);

      // Enhanced keyboard navigation for mega menu links
      const megaMenuLinks = megaMenu.querySelectorAll('a');
      megaMenuLinks.forEach((link, index) => {
        link.addEventListener('click', () => {
          this.resetAllMegaMenus();
        });

        link.addEventListener('keydown', (e) => {
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            const nextLink = megaMenuLinks[index + 1] || megaMenuLinks[0];
            nextLink.focus();
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            const prevLink = megaMenuLinks[index - 1] || megaMenuLinks[megaMenuLinks.length - 1];
            prevLink.focus();
          } else if (e.key === 'Escape') {
            e.preventDefault();
            this.hideMegaMenu(item);
            item.classList.remove('active');
            trigger.focus();
          }
        });
      });
    });

    // Global click handler to close menus (only one instance)
    if (!this.globalClickHandler) {
      this.globalClickHandler = (e) => {
        const clickedMegaMenuItem = e.target.closest('.mega-menu-item');
        if (!clickedMegaMenuItem) {
          this.resetAllMegaMenus();
        }
      };
      document.addEventListener('click', this.globalClickHandler);
    }

    // Add navbar mouseleave to close menus when leaving navbar area
    if (window.innerWidth > 1024 && !this.navbarLeaveHandler) {
      this.navbarLeaveHandler = () => {
        this._globalHideTimeout = setTimeout(() => {
          this.resetAllMegaMenus();
        }, 300);
      };

      this.navbar.addEventListener('mouseleave', this.navbarLeaveHandler);
    }
  }

  cleanupMegaMenuEvents() {
    if (this.megaMenuEventHandlers) {
      this.megaMenuEventHandlers.forEach((handlers, item) => {
        const megaMenu = item.querySelector('.mega-menu');
        Object.entries(handlers).forEach(([event, handler]) => {
          if (event === 'click') {
            const trigger = item.querySelector('a');
            if (trigger) trigger.removeEventListener('click', handler);
          } else if (event === 'megaMenuEnter' && megaMenu) {
            megaMenu.removeEventListener('mouseenter', handler);
          } else if (event === 'megaMenuLeave' && megaMenu) {
            megaMenu.removeEventListener('mouseleave', handler);
          } else if (event === 'mouseenter' || event === 'mouseleave') {
            // Handle both mega menu items and regular nav items
            item.removeEventListener(event, handler);
          } else {
            item.removeEventListener(event, handler);
          }
        });
      });
      this.megaMenuEventHandlers.clear();
    }

    if (this.globalClickHandler) {
      document.removeEventListener('click', this.globalClickHandler);
      this.globalClickHandler = null;
    }

    if (this.navbarLeaveHandler) {
      this.navbar.removeEventListener('mouseleave', this.navbarLeaveHandler);
      this.navbarLeaveHandler = null;
    }
  }

  hideMegaMenuFast(item) {
    const megaMenu = item.querySelector('.mega-menu');
    const trigger = item.querySelector('a');

    if (megaMenu && trigger) {
      megaMenu.style.opacity = '0';
      megaMenu.style.visibility = 'hidden';
      trigger.setAttribute('aria-expanded', 'false');
      item.classList.remove('active', 'mega-menu-active');
    }
  }

  resetAllMegaMenus() {
    $$('.mega-menu-item').forEach(item => {
      // Clear any pending timeouts
      clearTimeout(item._showTimeout);
      clearTimeout(item._hideTimeout);
      clearTimeout(this._globalHideTimeout);

      // Use fast hide for immediate closing
      this.hideMegaMenuFast(item);
      item.classList.remove('active');
    });
  }

  handleMegaMenuResizeImproved() {
    // Close all menus during resize to prevent positioning issues
    this.resetAllMegaMenus();

    // Reinitialize mega menu with new screen size
    this.initMegaMenuImproved();
  }

  // Simple CSS-based mega menu with minimal JavaScript
  initSimpleMegaMenu() {
    const megaMenuItems = $$('.mega-menu-item');
    const allNavItems = $$('.navbar-nav li');
    
    // Desktop: Add hover handlers to close mega menus when hovering non-mega items
    if (window.innerWidth > 1024) {
      allNavItems.forEach(navItem => {
        const isMegaMenuItem = navItem.classList.contains('mega-menu-item');
        
        if (!isMegaMenuItem) {
          navItem.addEventListener('mouseenter', () => {
            // Hide all mega menus by adding a class
            megaMenuItems.forEach(item => {
              item.classList.add('force-hide');
            });
          });
          
          navItem.addEventListener('mouseleave', () => {
            // Remove force hide class
            megaMenuItems.forEach(item => {
              item.classList.remove('force-hide');
            });
          });
        }
      });
    }
    
    // Mobile click behavior
    megaMenuItems.forEach(item => {
      const trigger = item.querySelector('a');
      
      if (!trigger) return;

      if (window.innerWidth <= 1024) {
        trigger.addEventListener('click', (e) => {
          e.preventDefault();
          
          // Close other menus
          megaMenuItems.forEach(otherItem => {
            if (otherItem !== item) {
              otherItem.classList.remove('active');
            }
          });
          
          // Toggle this menu
          item.classList.toggle('active');
        });
      }
    });

    // Close menus when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.mega-menu-item')) {
        megaMenuItems.forEach(item => {
          item.classList.remove('active');
        });
      }
    });
  }
}

// ===== SCROLL ANIMATIONS =====
class ScrollAnimations {
  constructor() {
    this.elements = $$('[data-animation]');
    this.init();
  }

  init() {
    this.createObserver();
    this.updateScrollProgress();
  }

  createObserver() {
    const options = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
        }
      });
    }, options);

    this.elements.forEach(element => {
      this.observer.observe(element);
    });

    // Handle scroll progress
    window.addEventListener('scroll', throttle(() => this.updateScrollProgress(), 16));
  }

  updateScrollProgress() {
    const scrollProgress = $('#scrollProgress');
    if (scrollProgress) {
      const scrollTop = window.scrollY;
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercentage = (scrollTop / documentHeight) * 100;
      scrollProgress.style.width = `${Math.min(scrollPercentage, 100)}%`;
    }
  }
}

// ===== DATA LOADER =====
class DataLoader {
  async loadData() {
    try {
      console.log('Loading data from products.json...');
      const response = await fetch('data/products.json');
      if (!response.ok) throw new Error('Failed to load data');
      const data = await response.json();

      console.log('Data loaded successfully:', data);

      products = data.featuredProducts || [];
      testimonials = data.testimonials || [];
      blogPosts = data.blogPosts || [];

      console.log('Products array:', products);

      this.renderProducts();
      this.renderBestsellingProducts();
      this.renderBlogPosts();
      this.initTestimonials();
    } catch (error) {
      console.error('Error loading data:', error);
      this.loadFallbackData();
    }
  }

  loadFallbackData() {
    console.log('Loading fallback data...');
    // Fallback data in case JSON loading fails
    products = [
      { id: 1, name: "Business Card Pack", price: "₹9.99", category: "Business Cards" },
      { id: 2, name: "Brochure Design", price: "₹24.99", category: "Brochures" },
      { id: 3, name: "Folder Design", price: "₹19.99", category: "Folders" }
    ];

    blogPosts = [
      {
        id: 1,
        title: "Why smartly you should use to be the perfect customer process",
        excerpt: "Learn optimization techniques...",
        date: "March 20, 2024",
        category: "Tips"
      }
    ];

    console.log('Fallback products:', products);

    this.renderProducts();
    this.renderBestsellingProducts();
    this.renderBlogPosts();
  }

  renderProducts() {
    const productsGrid = $('#productsGrid');
    if (!productsGrid) {
      console.log('Products grid not found');
      return;
    }

    // Fresh product data with top-class animations
    const freshProducts = [
      {
        id: 1,
        name: "Premium Business Cards",
        price: 999,
        originalPrice: 1499,
        category: "Business Cards",
        badge: "🔥 HOT SELLER",
        rating: 4.9,
        reviews: 2847,
        features: ["Premium 400gsm Paper", "UV Coating", "24hr Delivery"],
        image: "https://www.expandbuzz.com/wp-content/uploads/2024/04/Business-Card-Design-4.jpg"
      },
      {
        id: 2,
        name: "Corporate Brochures",
        price: 2499,
        originalPrice: 3499,
        category: "Brochures",
        badge: "✨ NEW ARRIVAL",
        rating: 4.8,
        reviews: 1956,
        features: ["Tri-fold Design", "Glossy Finish", "Full Color Print"],
        image: "https://uicreative.s3.ap-southeast-1.amazonaws.com/wp-content/uploads/2021/01/29094652/brochure-company-brochure-8-1.jpg"
      },
      {
        id: 3,
        name: "Executive Folders",
        price: 1899,
        originalPrice: 2599,
        category: "Folders",
        badge: "⭐ POPULAR",
        rating: 4.7,
        reviews: 1234,
        features: ["Matte Lamination", "Die Cut", "Pocket Design"],
        image: "https://5.imimg.com/data5/SELLER/Default/2023/6/313616004/UT/AW/RA/2558270/executive-document-file-folder.jpeg"
      },
      {
        id: 4,
        name: "Annual Reports",
        price: 3499,
        originalPrice: 4999,
        category: "Reports",
        badge: "🏆 PREMIUM",
        rating: 4.9,
        reviews: 892,
        features: ["Wire-O Binding", "High Resolution", "Laminated Cover"],
        image: "https://as1.ftcdn.net/v2/jpg/10/30/37/74/1000_F_1030377466_NoBjUyHP7exQcbqrAJgDpRBVSHpeysVn.jpg"
      },
      {
        id: 5,
        name: "Marketing Magazines",
        price: 4999,
        originalPrice: 6999,
        category: "Magazines",
        badge: "💎 LUXURY",
        rating: 4.8,
        reviews: 567,
        features: ["Perfect Binding", "Silk Paper", "Vibrant Colors"],
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRR_xNd1WXMxfxl6a1IHN7NU0Y5NKDrNkpU5A&s"
      }
    ];

    const formatINR = (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);

    const productsHTML = freshProducts.map((product, index) => {
      const discountPct = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
      const stars = Array.from({ length: 5 }).map((_, i) =>
        `<span class="star-new ${i < Math.floor(product.rating) ? 'filled' : ''}">★</span>`
      ).join('');

      return `
        <div class="product-card-new" data-animation="slide-up" data-delay="${index * 150}">
          <div class="product-badge-new">${product.badge}</div>
          <div class="product-image-container-new">
            <img src="${product.image}" alt="${product.name}" loading="lazy" class="product-image-new">
            <div class="product-overlay-new">
              <div class="overlay-buttons">
                <button class="btn-quick-view-new" aria-label="Quick view ${product.name}">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2"/>
                    <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </button>
                <button class="btn-cart-new" aria-label="Add ${product.name} to cart" data-product-id="${product.id}">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M9 22a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" stroke="currentColor" stroke-width="2"/>
                    <path d="M20 22a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" stroke="currentColor" stroke-width="2"/>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
          <div class="product-info-new">
            <div class="product-category-new">${product.category}</div>
            <h3 class="product-name-new">${product.name}</h3>
            <div class="product-rating-new">
              <div class="stars-new">${stars}</div>
              <span class="rating-text-new">${product.rating}/5 (${product.reviews.toLocaleString('en-IN')} reviews)</span>
            </div>
            <div class="product-features-new">
              ${product.features.map(f => `<span class="feature-tag-new">${f}</span>`).join('')}
            </div>
            <div class="product-pricing-new">
              <span class="price-new">${formatINR(product.price)}</span>
              <span class="price-original-new">${formatINR(product.originalPrice)}</span>
              <span class="discount-badge-new">-${discountPct}%</span>
            </div>
            <button class="btn-order-now-new">Order Now</button>
          </div>
        </div>
      `;
    }).join('');

    productsGrid.innerHTML = productsHTML;

    // Initialize new product interactions
    this.initNewProductInteractions();
  }

  initNewProductInteractions() {
    const cards = $$('.product-card-new');

    cards.forEach((card, index) => {
      // Add entrance animation
      card.style.opacity = '0';
      card.style.transform = 'translateY(30px)';

      setTimeout(() => {
        card.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, index * 150);

      // Hover effects
      card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-8px) scale(1.02)';
        card.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15)';
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0) scale(1)';
        card.style.boxShadow = '';
      });

      // Quick view button
      const quickViewBtn = card.querySelector('.btn-quick-view-new');
      if (quickViewBtn) {
        quickViewBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.showQuickViewModal(card);
        });
      }

      // Add to cart button
      const cartBtn = card.querySelector('.btn-cart-new');
      if (cartBtn) {
        cartBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.addToCartNew(card);
        });
      }

      // Order now button
      const orderBtn = card.querySelector('.btn-order-now-new');
      if (orderBtn) {
        orderBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.handleOrderNowNew(card);
        });
      }
    });
  }

  showQuickViewModal(card) {
    const productName = card.querySelector('.product-name-new').textContent;
    const productPrice = card.querySelector('.price-new').textContent;

    // Create modal
    const modal = document.createElement('div');
    modal.className = 'quick-view-modal-new';
    modal.innerHTML = `
      <div class="modal-overlay-new"></div>
      <div class="modal-content-new">
        <div class="modal-header-new">
          <h3>${productName}</h3>
          <button class="modal-close-new">&times;</button>
        </div>
        <div class="modal-body-new">
          <p>Quick view for ${productName} - ${productPrice}</p>
          <button class="btn-customize-new">Customize & Order</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Show modal
    setTimeout(() => modal.classList.add('active'), 10);

    // Close modal
    const closeBtn = modal.querySelector('.modal-close-new');
    const overlay = modal.querySelector('.modal-overlay-new');

    const closeModal = () => {
      modal.classList.remove('active');
      setTimeout(() => modal.remove(), 300);
    };

    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', closeModal);
  }

  addToCartNew(card) {
    const productName = card.querySelector('.product-name-new').textContent;
    const cartBtn = card.querySelector('.btn-cart-new');

    // Animate button
    cartBtn.style.transform = 'scale(0.9)';
    setTimeout(() => {
      cartBtn.style.transform = 'scale(1)';
    }, 150);

    // Show notification
    this.showNotificationNew(`${productName} added to cart!`, 'success');
  }

  handleOrderNowNew(card) {
    const productName = card.querySelector('.product-name-new').textContent;
    const orderBtn = card.querySelector('.btn-order-now-new');

    // Add ripple effect
    const ripple = document.createElement('span');
    ripple.className = 'ripple-new';
    orderBtn.appendChild(ripple);

    setTimeout(() => ripple.remove(), 600);

    // Show notification
    this.showNotificationNew(`Ordering ${productName}...`, 'info');
  }

  showNotificationNew(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification-new notification-${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => notification.classList.add('show'), 10);

    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  normalizePrice(price, formatter) {
    if (typeof price === 'number') return formatter(price);
    if (typeof price === 'string') {
      // Try to parse numbers from strings like "$9.99", "₹9.99", "9.99"
      const numeric = parseFloat(price.replace(/[^0-9.]/g, ''));
      if (!isNaN(numeric)) return formatter(numeric);
    }
    return price;
  }

  renderBestsellingProducts() {
    const bestsellingGrid = document.querySelector('.bestselling-grid');
    if (!bestsellingGrid) {
      console.log('Bestselling grid not found');
      return;
    }
    if (!Array.isArray(products)) {
      console.log('Products not loaded:', products);
      return;
    }

    console.log('Rendering bestselling products:', products);

    const formatINR = (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(value);

    const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

    const featurePresets = {
      'Business Cards': ['Premium Paper', 'UV Coating', '24hr Turnaround'],
      'Brochures': ['Tri-fold', 'Glossy Finish', 'Full Color'],
      'Folders': ['Matte Lamination', 'Die Cut', 'Pocket Slot'],
      'Reports': ['Wire-O Bind', 'High Resolution', 'Cover Lamination'],
      'Magazines': ['Perfect Bind', 'Vibrant Colors', 'Silk Stock']
    };

    const svgEye = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`;

    const svgCart = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M9 22a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M20 22a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`;

    const cardsHTML = products.map((product, index) => {
      const basePrice = typeof product.price === 'number'
        ? product.price
        : parseFloat(String(product.price).replace(/[^0-9.]/g, '')) || 0;
      const originalPrice = basePrice > 0 ? +(basePrice * 1.3).toFixed(2) : 0;
      const discountPct = originalPrice > 0 ? Math.round(((originalPrice - basePrice) / originalPrice) * 100) : 0;
      const rating = getRandomInt(4, 5);
      const reviews = getRandomInt(800, 3200).toLocaleString('en-IN');
      const category = product.category || 'Popular';
      const features = featurePresets[category] || ['High Quality', 'Fast Turnaround', 'Best Value'];
      const badgeText = `#${index + 1} ${index === 0 ? 'Bestseller' : index === 1 ? 'Popular' : index === 2 ? 'Trending' : 'Hot'}`;

      const stars = Array.from({ length: 5 }).map((_, i) => `<span class="star ${i < rating ? 'filled' : ''}">★</span>`).join('');
      const placeholder = `data:image/svg+xml;base64,${this.generateProductImageSVG(product.name)}`;
      const imgSrc = product.image ? product.image : placeholder;

      return `
        <div class="bestselling-card" data-animation="slide-up" data-delay="${(index + 1) * 100}">
          <div class="product-badge">${badgeText}</div>
          <div class="product-image-container">
            <img src="${imgSrc}" alt="${product.name}" loading="lazy" class="product-image" />
            <div class="product-overlay">
              <div class="overlay-content">
                <button class="btn-quick-view" aria-label="Quick view">${svgEye}</button>
                <button class="btn-add-cart" aria-label="Add to cart">${svgCart}</button>
              </div>
            </div>
          </div>
          <div class="product-info">
            <div class="product-category">${category}</div>
            <h3 class="product-name">${product.name}</h3>
            <div class="product-rating">
              <div class="stars">${stars}</div>
              <span class="rating-text">(${reviews} reviews)</span>
            </div>
            <div class="product-features">
              ${features.slice(0, 3).map(f => `<span class="feature-tag">${f}</span>`).join('')}
            </div>
            <div class="product-pricing">
              <span class="price">${formatINR(basePrice)}</span>
              <span class="price-original">${originalPrice ? formatINR(originalPrice) : ''}</span>
              ${discountPct ? `<span class="discount-badge">-${discountPct}%</span>` : ''}
            </div>
            <button class="btn-order-now">Order Now</button>
          </div>
        </div>
      `;
    }).join('');

    bestsellingGrid.innerHTML = cardsHTML;

    console.log('Bestselling products rendered successfully');

    // Re-bind interactive behaviors for newly injected cards
    if (window.app && window.app.bestsellingProductsManager) {
      window.app.bestsellingProductsManager.init();
    }
  }

  renderBlogPosts() {
    const blogGrid = document.querySelector('.blog-grid');
    if (!blogGrid) {
      console.log('Blog grid not found');
      return;
    }

    const existingBlogCards = blogGrid.querySelectorAll('.blog-card').length > 0;

    if (existingBlogCards) {
      console.log('Blog cards already exist in HTML, initializing manager.');
      if (window.app && window.app.blogManager) {
        window.app.blogManager.init();
      }
      return;
    }
  }

  initTestimonials() {
    if (testimonials.length > 0) {
      this.showTestimonial(0);
      this.startTestimonialRotation();
    }
  }

  showTestimonial(index) {
    const testimonialText = $('#testimonialText');
    const testimonialAuthor = $('#testimonialAuthor');

    if (testimonialText && testimonialAuthor && testimonials[index]) {
      const testimonial = testimonials[index];
      testimonialText.textContent = `"${testimonial.text}"`;
      testimonialAuthor.textContent = `- ${testimonial.name}, ${testimonial.company}`;
    }
  }

  startTestimonialRotation() {
    setInterval(() => {
      currentTestimonial = (currentTestimonial + 1) % testimonials.length;
      this.showTestimonial(currentTestimonial);
    }, 5000);
  }

  bindCartEvents() {
    const cartButtons = $$('.btn-cart');
    cartButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const productId = button.getAttribute('data-product-id');
        this.addToCart(productId);
      });
    });
  }

  addToCart(productId) {
    const product = products.find(p => p.id == productId);
    if (product) {
      this.showCartModal(product);
      this.animateCartButton(event.target);
    }
  }

  showCartModal(product) {
    const modal = $('#cartModal');
    const modalText = $('#cartModalText');

    if (modal && modalText) {
      modalText.textContent = `${product.name} has been added to your cart!`;
      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');

      // Focus management
      const closeButton = modal.querySelector('.modal-close');
      if (closeButton) closeButton.focus();
    }
  }

  animateCartButton(button) {
    button.style.transform = 'scale(1.2)';
    setTimeout(() => {
      button.style.transform = '';
    }, 200);
  }

  generateProductImageSVG(name) {
    const colors = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];
    const color = colors[name.length % colors.length];
    const svg = `
      <svg width="200" height="150" viewBox="0 0 200 150" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="150" fill="#f3f4f6"/>
        <rect x="50" y="40" width="100" height="70" fill="${color}" opacity="0.2" stroke="${color}" stroke-width="2"/>
        <text x="100" y="80" font-family="Inter" font-size="12" fill="${color}" text-anchor="middle">${name.toUpperCase()}</text>
      </svg>`;
    return btoa(svg);
  }

  generateBlogImageSVG(title) {
    const colors = ['#6366f1', '#f59e0b', '#10b981', '#ef4444'];
    const color = colors[title.length % colors.length];
    const svg = `
      <svg width="300" height="200" viewBox="0 0 300 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="300" height="200" fill="#f3f4f6"/>
        <rect x="40" y="40" width="220" height="120" fill="${color}" opacity="0.1"/>
        <text x="150" y="105" font-family="Inter" font-size="14" fill="${color}" text-anchor="middle">BLOG POST</text>
      </svg>`;
    return btoa(svg);
  }
}

// ===== FORM VALIDATION =====
class FormValidator {
  constructor() {
    this.init();
  }

  init() {
    this.bindEvents();
  }

  bindEvents() {
    const newsletterForm = $('#newsletterForm');
    if (newsletterForm) {
      newsletterForm.addEventListener('submit', (e) => this.handleNewsletterSubmit(e));
    }

    // Real-time validation
    const emailInput = $('#emailInput');
    if (emailInput) {
      emailInput.addEventListener('blur', () => this.validateEmail(emailInput));
      emailInput.addEventListener('input', () => this.clearError(emailInput));
    }
  }

  handleNewsletterSubmit(e) {
    e.preventDefault();

    const emailInput = $('#emailInput');
    const isValid = this.validateEmail(emailInput);

    if (isValid) {
      this.submitNewsletter(emailInput.value);
    }
  }

  validateEmail(input) {
    const email = input.value.trim();
    const errorElement = $('#emailError');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
      this.showError(errorElement, 'Email address is required');
      return false;
    }

    if (!emailRegex.test(email)) {
      this.showError(errorElement, 'Please enter a valid email address');
      return false;
    }

    this.clearError(input);
    return true;
  }

  showError(errorElement, message) {
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = 'block';
    }
  }

  clearError(input) {
    const errorElement = $('#emailError');
    if (errorElement) {
      errorElement.textContent = '';
      errorElement.style.display = 'none';
    }
  }

  async submitNewsletter(email) {
    const submitButton = $('.newsletter-btn');
    const originalText = submitButton.textContent;

    try {
      // Show loading state
      submitButton.textContent = 'Subscribing...';
      submitButton.disabled = true;

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      this.showSuccessMessage();
      this.showNewsletterModal();

      // Reset form
      $('#emailInput').value = '';

    } catch (error) {
      this.showError($('#emailError'), 'Something went wrong. Please try again.');
    } finally {
      submitButton.textContent = originalText;
      submitButton.disabled = false;
    }
  }

  showSuccessMessage() {
    const successElement = $('#successMessage');
    if (successElement) {
      successElement.textContent = 'Thank you for subscribing!';
      successElement.style.display = 'block';
      setTimeout(() => {
        successElement.style.display = 'none';
      }, 3000);
    }
  }

  showNewsletterModal() {
    const modal = $('#newsletterModal');
    if (modal) {
      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');

      const closeButton = modal.querySelector('.modal-close');
      if (closeButton) closeButton.focus();
    }
  }
}

// ===== MODAL MANAGER =====
class ModalManager {
  constructor() {
    this.activeModal = null;
    this.init();
  }

  init() {
    this.bindEvents();
  }

  bindEvents() {
    // Close buttons
    const closeButtons = $$('.modal-close');
    closeButtons.forEach(button => {
      button.addEventListener('click', () => this.closeModal());
    });

    // Overlay clicks
    const overlays = $$('.modal-overlay');
    overlays.forEach(overlay => {
      overlay.addEventListener('click', () => this.closeModal());
    });

    // Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.activeModal) {
        this.closeModal();
      }
    });

    // Cart modal actions
    const continueShopping = $('#continueShopping');
    const viewCart = $('#viewCart');

    if (continueShopping) {
      continueShopping.addEventListener('click', () => this.closeModal());
    }

    if (viewCart) {
      viewCart.addEventListener('click', () => {
        this.closeModal();
        // Here you would typically navigate to cart page
        console.log('Navigate to cart');
      });
    }
  }

  openModal(modalId) {
    const modal = $(modalId);
    if (modal) {
      this.activeModal = modal;
      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');

      // Prevent body scroll
      document.body.style.overflow = 'hidden';

      // Focus management
      const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      }
    }
  }

  closeModal() {
    if (this.activeModal) {
      this.activeModal.classList.remove('active');
      this.activeModal.setAttribute('aria-hidden', 'true');
      this.activeModal = null;

      // Restore body scroll
      document.body.style.overflow = '';
    }
  }
}

// ===== BACK TO TOP =====
class BackToTop {
  constructor() {
    this.button = $('#backToTop');
    this.init();
  }

  init() {
    if (!this.button) return;

    this.bindEvents();
    this.handleScroll();
  }

  bindEvents() {
    this.button.addEventListener('click', () => this.scrollToTop());
    window.addEventListener('scroll', throttle(() => this.handleScroll(), 100));
  }

  handleScroll() {
    const showButton = window.scrollY > 500;
    this.button.classList.toggle('visible', showButton);
  }

  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
}

// ===== LAZY LOADING =====
class LazyLoader {
  constructor() {
    this.images = $$('img[loading="lazy"]');
    this.init();
  }

  init() {
    if ('IntersectionObserver' in window) {
      this.createObserver();
    } else {
      // Fallback for older browsers
      this.loadAllImages();
    }
  }

  createObserver() {
    const options = {
      rootMargin: '50px 0px',
      threshold: 0.01
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadImage(entry.target);
          this.observer.unobserve(entry.target);
        }
      });
    }, options);

    this.images.forEach(img => this.observer.observe(img));
  }

  loadImage(img) {
    img.src = img.src || img.dataset.src;
    img.classList.add('loaded');
  }

  loadAllImages() {
    this.images.forEach(img => this.loadImage(img));
  }
}

// ===== PERFORMANCE MONITOR =====
class PerformanceMonitor {
  constructor() {
    this.init();
  }

  init() {
    // Monitor Core Web Vitals
    this.measureCLS();
    this.measureFID();
    this.measureLCP();
  }

  measureCLS() {
    if ('LayoutShift' in window) {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            console.log('CLS:', entry.value);
          }
        }
      }).observe({ entryTypes: ['layout-shift'] });
    }
  }

  measureFID() {
    if ('PerformanceEventTiming' in window) {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const FID = entry.processingStart - entry.startTime;
          console.log('FID:', FID);
        }
      }).observe({ entryTypes: ['first-input'] });
    }
  }

  measureLCP() {
    if ('LargestContentfulPaint' in window) {
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        console.log('LCP:', lastEntry.startTime);
      }).observe({ entryTypes: ['largest-contentful-paint'] });
    }
  }
}

// ===== ACCESSIBILITY ENHANCEMENTS =====
class AccessibilityManager {
  constructor() {
    this.init();
  }

  init() {
    this.addSkipLinks();
    this.enhanceKeyboardNavigation();
    this.addARIALabels();
    this.handleFocusManagement();
  }

  addSkipLinks() {
    // Skip links are already in HTML, just ensure they work
    const skipLink = $('.skip-link');
    if (skipLink) {
      skipLink.addEventListener('click', (e) => {
        e.preventDefault();
        const target = $(skipLink.getAttribute('href'));
        if (target) {
          target.focus();
          target.scrollIntoView();
        }
      });
    }
  }

  enhanceKeyboardNavigation() {
    // Add keyboard support for interactive elements
    const interactiveElements = $$('[role="button"], .service-card, .product-card, .blog-card');

    interactiveElements.forEach(element => {
      if (!element.getAttribute('tabindex')) {
        element.setAttribute('tabindex', '0');
      }

      element.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          element.click();
        }
      });
    });
  }

  addARIALabels() {
    // Enhance existing ARIA labels
    const buttons = $$('button:not([aria-label]):not([aria-labelledby])');
    buttons.forEach(button => {
      const text = button.textContent.trim();
      if (text) {
        button.setAttribute('aria-label', text);
      }
    });
  }

  handleFocusManagement() {
    // Ensure focus is visible and properly managed
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        document.body.classList.add('keyboard-navigation');
      }
    });

    document.addEventListener('mousedown', () => {
      document.body.classList.remove('keyboard-navigation');
    });
  }
}

// ===== ERROR HANDLER =====
class ErrorHandler {
  constructor() {
    this.init();
  }

  init() {
    window.addEventListener('error', (e) => this.handleError(e));
    window.addEventListener('unhandledrejection', (e) => this.handlePromiseRejection(e));
  }

  handleError(error) {
    console.error('Global error:', error);
    this.showUserFriendlyError();
  }

  handlePromiseRejection(event) {
    console.error('Unhandled promise rejection:', event.reason);
    this.showUserFriendlyError();
  }

  showUserFriendlyError() {
    // You could show a toast notification or subtle error message
    console.log('Something went wrong, but the app continues to work');
  }
}

// ===== PRICE CALCULATOR MANAGER =====
class PriceCalculatorManager {
  constructor() {
    this.pricingData = {
      'business-cards': { base: 0.15, category: 'cards' },
      'brochures': { base: 0.85, category: 'print' },
      'folders': { base: 1.25, category: 'print' },
      'reports': { base: 2.50, category: 'binding' },
      'posters': { base: 3.75, category: 'large' },
      'banners': { base: 8.50, category: 'large' }
    };

    this.multipliers = {
      paper: {
        'standard': 1.0,
        'premium': 1.3,
        'luxury': 1.6,
        'recycled': 1.1
      },
      finish: {
        'matte': 1.0,
        'gloss': 1.1,
        'satin': 1.15,
        'velvet': 1.25,
        'uv': 1.4
      },
      color: {
        'bw': 1.0,
        'color': 1.5,
        'spot': 1.8,
        'metallic': 2.2
      },
      turnaround: {
        'rush': 2.5,
        'fast': 1.5,
        'standard': 1.0,
        'economy': 0.8
      }
    };

    this.init();
  }

  init() {
    this.bindEvents();
    this.generateQuoteNumber();
  }

  bindEvents() {
    const calculateBtn = $('#calculate-price');
    const resetBtn = $('#reset-calculator');
    const requestQuoteBtn = $('#request-quote');
    const saveBtn = $('#save-calculation');

    if (calculateBtn) {
      calculateBtn.addEventListener('click', () => this.calculatePrice());
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.resetCalculator());
    }

    if (requestQuoteBtn) {
      requestQuoteBtn.addEventListener('click', () => this.requestOfficialQuote());
    }

    if (saveBtn) {
      saveBtn.addEventListener('click', () => this.saveCalculation());
    }

    // Real-time calculation on change
    const selects = $$('.calc-select');
    selects.forEach(select => {
      select.addEventListener('change', () => this.calculatePrice());
    });
  }

  calculatePrice() {
    const productType = $('#product-type').value;
    const quantity = parseInt($('#quantity').value);
    const paperType = $('#paper-type').value;
    const finishType = $('#finish-type').value;
    const colorType = $('#colors').value;
    const turnaroundType = $('#turnaround').value;

    // Get base pricing
    const basePrice = this.pricingData[productType].base * quantity;

    // Calculate multipliers
    const paperMultiplier = this.multipliers.paper[paperType];
    const finishMultiplier = this.multipliers.finish[finishType];
    const colorMultiplier = this.multipliers.color[colorType];
    const turnaroundMultiplier = this.multipliers.turnaround[turnaroundType];

    // Calculate costs
    const paperCost = basePrice * (paperMultiplier - 1);
    const finishCost = basePrice * (finishMultiplier - 1);
    const colorCost = basePrice * (colorMultiplier - 1);
    const rushCost = basePrice * (turnaroundMultiplier - 1);

    const totalPrice = basePrice * paperMultiplier * finishMultiplier * colorMultiplier * turnaroundMultiplier;
    const unitPrice = totalPrice / quantity;

    // Update UI
    this.updatePriceDisplay({
      basePrice: basePrice,
      paperCost: paperCost,
      finishCost: finishCost,
      colorCost: colorCost,
      rushCost: rushCost,
      totalPrice: totalPrice,
      unitPrice: unitPrice,
      quantity: quantity,
      turnaroundType: turnaroundType
    });

    // Update delivery estimates
    this.updateDeliveryEstimates(turnaroundType);

    // Animate results
    this.animateResults();
  }

  updatePriceDisplay(prices) {
    const fmt = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 });
    $('#base-price').textContent = fmt.format(prices.basePrice);
    $('#paper-cost').textContent = fmt.format(prices.paperCost);
    $('#finish-cost').textContent = fmt.format(prices.finishCost);
    $('#color-cost').textContent = fmt.format(prices.colorCost);
    $('#rush-cost').textContent = fmt.format(prices.rushCost);
    $('#total-price').textContent = fmt.format(prices.totalPrice);
    $('#unit-price').textContent = `${fmt.format(prices.unitPrice)} per piece`;
  }

  updateDeliveryEstimates(turnaround) {
    const today = new Date();
    let readyDays, deliveryDays;

    switch (turnaround) {
      case 'rush':
        readyDays = 1;
        deliveryDays = 2;
        break;
      case 'fast':
        readyDays = 3;
        deliveryDays = 5;
        break;
      case 'standard':
        readyDays = 7;
        deliveryDays = 10;
        break;
      case 'economy':
        readyDays = 14;
        deliveryDays = 17;
        break;
    }

    const readyDate = new Date(today);
    readyDate.setDate(today.getDate() + readyDays);

    const deliveryDate = new Date(today);
    deliveryDate.setDate(today.getDate() + deliveryDays);

    $('#ready-date').textContent = readyDate.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });

    $('#delivery-date').textContent = deliveryDate.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  }

  animateResults() {
    const results = $('.calculator-results');
    if (results) {
      results.style.animation = 'none';
      results.offsetHeight; // Trigger reflow
      results.style.animation = 'fadeInUp 0.4s ease-out';
    }

    // Animate price numbers
    const priceElements = $$('.breakdown-item span:last-child, .breakdown-total span:last-child');
    priceElements.forEach((el, index) => {
      setTimeout(() => {
        el.style.animation = 'none';
        el.offsetHeight;
        el.style.animation = 'numberPop 0.3s ease-out';
      }, index * 50);
    });
  }

  resetCalculator() {
    // Reset all selects to first option
    $$('.calc-select').forEach(select => {
      select.selectedIndex = 0;
    });

    // Reset price display
    $$('#base-price, #paper-cost, #finish-cost, #color-cost, #rush-cost, #total-price').forEach(el => {
      if (el) el.textContent = '₹0.00';
    });

    const unitPrice = $('#unit-price');
    if (unitPrice) unitPrice.textContent = '₹0.00 per piece';

    // Reset dates
    $$('#ready-date, #delivery-date').forEach(el => {
      if (el) el.textContent = '-';
    });

    // Generate new quote number
    this.generateQuoteNumber();

    // Animate reset
    const form = $('.calculator-form');
    if (form) {
      form.style.animation = 'shake 0.5s ease-out';
      setTimeout(() => {
        form.style.animation = '';
      }, 500);
    }
  }

  generateQuoteNumber() {
    const quoteNum = 'QT-' + new Date().getFullYear() + '-' +
      String(Math.floor(Math.random() * 1000) + 1).padStart(3, '0');
    const quoteElement = $('#quote-number');
    if (quoteElement) {
      quoteElement.textContent = quoteNum;
    }
  }

  requestOfficialQuote() {
    const formData = {
      productType: $('#product-type').value,
      quantity: $('#quantity').value,
      paperType: $('#paper-type').value,
      finishType: $('#finish-type').value,
      colorType: $('#colors').value,
      turnaroundType: $('#turnaround').value,
      totalPrice: $('#total-price').textContent,
      quoteNumber: $('#quote-number').textContent
    };

    // Simulate quote request
    const modal = $('#quoteModal');
    const modalText = $('#quoteModalText');

    if (modal && modalText) {
      modalText.innerHTML = `
        <div style="text-align: center;">
          <h3 style="margin-bottom: 16px;">📋 Quote Request Submitted!</h3>
          <p><strong>Quote #:</strong> ${formData.quoteNumber}</p>
          <p><strong>Product:</strong> ${formData.productType.replace('-', ' ')}</p>
          <p><strong>Quantity:</strong> ${formData.quantity} pieces</p>
          <p><strong>Estimated Total:</strong> ${formData.totalPrice}</p>
          <br>
          <p style="color: #059669;">✅ Our team will contact you within 2 hours with your official quote!</p>
        </div>
      `;
      modal.classList.add('active');
    }

    // Animate success
    const btn = $('#request-quote');
    if (btn) {
      const originalText = btn.innerHTML;
      btn.innerHTML = '✅ Quote Requested!';
      btn.style.background = 'var(--success-color)';

      setTimeout(() => {
        btn.innerHTML = originalText;
        btn.style.background = '';
      }, 3000);
    }
  }

  saveCalculation() {
    const calculation = {
      timestamp: new Date().toISOString(),
      productType: $('#product-type').value,
      quantity: $('#quantity').value,
      paperType: $('#paper-type').value,
      finishType: $('#finish-type').value,
      colorType: $('#colors').value,
      turnaroundType: $('#turnaround').value,
      totalPrice: $('#total-price').textContent,
      quoteNumber: $('#quote-number').textContent
    };

    // Save to localStorage
    const savedCalculations = JSON.parse(localStorage.getItem('shristiPressCalculations') || '[]');
    savedCalculations.push(calculation);
    localStorage.setItem('shristiPressCalculations', JSON.stringify(savedCalculations));

    // Show success message
    const btn = $('#save-calculation');
    if (btn) {
      const originalText = btn.innerHTML;
      btn.innerHTML = '💾 Saved!';
      btn.style.background = 'var(--success-color)';

      setTimeout(() => {
        btn.innerHTML = originalText;
        btn.style.background = '';
      }, 2000);
    }

    console.log('Calculation saved:', calculation);
  }
}

// Add CSS animations for calculator
const calculatorStyles = `
@keyframes numberPop {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}
`;

if (!document.querySelector('#calculator-animations')) {
  const style = document.createElement('style');
  style.id = 'calculator-animations';
  style.textContent = calculatorStyles;
  document.head.appendChild(style);
}

// ===== BESTSELLING PRODUCTS MANAGER =====
class BestsellingProductsManager {
  constructor() {
    this.init();
  }

  init() {
    this.setupProductCards();
    this.setupQuickView();
    this.setupAddToCart();
    this.setupOrderButtons();
  }

  setupProductCards() {
    const cards = $$('.bestselling-card');

    cards.forEach((card, index) => {
      // Add staggered animation delay
      card.style.animationDelay = `${index * 0.1}s`;

      // Add hover effects
      card.addEventListener('mouseenter', () => {
        this.animateCardHover(card, true);
      });

      card.addEventListener('mouseleave', () => {
        this.animateCardHover(card, false);
      });
    });
  }

  animateCardHover(card, isHovering) {
    const image = card.querySelector('.product-image');
    const overlay = card.querySelector('.product-overlay');
    const badge = card.querySelector('.product-badge');

    if (isHovering) {
      // Animate badge
      badge.style.transform = 'scale(1.1) rotate(5deg)';

      // Animate image
      image.style.transform = 'scale(1.1) rotate(2deg)';

      // Show overlay with delay
      setTimeout(() => {
        overlay.style.opacity = '1';
      }, 150);
    } else {
      // Reset animations
      badge.style.transform = 'scale(1) rotate(0deg)';
      image.style.transform = 'scale(1) rotate(0deg)';
      overlay.style.opacity = '0';
    }
  }

  setupQuickView() {
    const quickViewButtons = $$('.btn-quick-view');

    quickViewButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.showQuickViewModal(button);
      });
    });
  }

  showQuickViewModal(button) {
    const card = button.closest('.bestselling-card');
    const productName = card.querySelector('.product-name').textContent;
    const productImage = card.querySelector('.product-image').src;
    const productPrice = card.querySelector('.price').textContent;

    // Create modal content
    const modalContent = `
      <div class="quick-view-modal">
        <div class="modal-content">
          <div class="modal-header">
            <h3>${productName}</h3>
            <button class="modal-close">&times;</button>
          </div>
          <div class="modal-body">
            <div class="product-preview">
              <img src="${productImage}" alt="${productName}">
            </div>
            <div class="product-details">
              <div class="price-display">${productPrice}</div>
              <p>Get detailed information about this product and customize your order.</p>
              <button class="btn-customize">Customize & Order</button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalContent);

    // Add modal styles
    this.addModalStyles();

    // Setup modal interactions
    this.setupModalInteractions();
  }

  addModalStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .quick-view-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        animation: modalFadeIn 0.3s ease;
      }
      
      .modal-content {
        background: white;
        border-radius: 16px;
        max-width: 600px;
        width: 90%;
        max-height: 80vh;
        overflow: hidden;
        animation: modalSlideIn 0.3s ease;
      }
      
      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px;
        border-bottom: 1px solid #e5e7eb;
      }
      
      .modal-close {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #6b7280;
        transition: color 0.3s ease;
      }
      
      .modal-close:hover {
        color: #ef4444;
      }
      
      .modal-body {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
        padding: 20px;
      }
      
      .product-preview img {
        width: 100%;
        height: 200px;
        object-fit: contain;
        border-radius: 8px;
      }
      
      .btn-customize {
        background: linear-gradient(135deg, #6366f1, #8b5cf6);
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
      }
      
      .btn-customize:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 25px rgba(99, 102, 241, 0.3);
      }
      
      @keyframes modalFadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      @keyframes modalSlideIn {
        from { transform: translateY(-50px) scale(0.9); }
        to { transform: translateY(0) scale(1); }
      }
      
      @media (max-width: 768px) {
        .modal-body {
          grid-template-columns: 1fr;
        }
      }
    `;
    document.head.appendChild(style);
  }

  setupModalInteractions() {
    const modal = document.querySelector('.quick-view-modal');
    const closeBtn = modal.querySelector('.modal-close');
    const customizeBtn = modal.querySelector('.btn-customize');

    // Close modal
    closeBtn.addEventListener('click', () => {
      this.closeModal(modal);
    });

    // Close on backdrop click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.closeModal(modal);
      }
    });

    // Customize button
    customizeBtn.addEventListener('click', () => {
      this.closeModal(modal);
      this.showCustomizationForm();
    });
  }

  closeModal(modal) {
    modal.style.animation = 'modalFadeOut 0.3s ease';
    setTimeout(() => {
      modal.remove();
    }, 300);
  }

  showCustomizationForm() {
    // Show notification
    this.showNotification('Customization form will open in a new window', 'info');
  }

  setupAddToCart() {
    const addToCartButtons = $$('.btn-add-cart');

    addToCartButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.addToCart(button);
      });
    });
  }

  addToCart(button) {
    const card = button.closest('.bestselling-card');
    const productName = card.querySelector('.product-name').textContent;
    const productPrice = card.querySelector('.price').textContent;

    // Animate button
    button.style.transform = 'scale(0.9)';
    setTimeout(() => {
      button.style.transform = 'scale(1)';
    }, 150);

    // Show success notification
    this.showNotification(`${productName} added to cart!`, 'success');

    // Update cart count (if cart exists)
    this.updateCartCount();
  }

  setupOrderButtons() {
    const orderButtons = $$('.btn-order-now');

    orderButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleOrderNow(button);
      });
    });
  }

  handleOrderNow(button) {
    const card = button.closest('.bestselling-card');
    const productName = card.querySelector('.product-name').textContent;

    // Add ripple effect
    this.createRippleEffect(button, new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));

    // Show order confirmation
    this.showNotification(`Ordering ${productName}...`, 'info');

    // Simulate order process
    setTimeout(() => {
      this.showNotification(`Order for ${productName} placed successfully!`, 'success');
    }, 2000);
  }

  createRippleEffect(button, event) {
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.classList.add('ripple');

    button.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
    }, 600);
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    // Add notification styles
    if (!document.querySelector('#notification-styles')) {
      const style = document.createElement('style');
      style.id = 'notification-styles';
      style.textContent = `
        .notification {
          position: fixed;
          top: 20px;
          right: 20px;
          padding: 12px 20px;
          border-radius: 8px;
          color: white;
          font-weight: 500;
          z-index: 1001;
          animation: slideInRight 0.3s ease;
        }
        
        .notification-success {
          background: linear-gradient(135deg, #10b981, #059669);
        }
        
        .notification-info {
          background: linear-gradient(135deg, #6366f1, #4f46e5);
        }
        
        .notification-error {
          background: linear-gradient(135deg, #ef4444, #dc2626);
        }
        
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(notification);

    // Auto remove after 3 seconds
    setTimeout(() => {
      notification.style.animation = 'slideOutRight 0.3s ease';
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 3000);
  }

  updateCartCount() {
    // This would integrate with a cart system
    console.log('Cart count updated');
  }
}

// ===== FEATURED PRODUCTS MANAGER (tilt, quick view) =====
class FeaturedProductsManager {
  constructor() {
    this.init();
  }

  init() {
    this.bindTilt();
    this.bindQuickView();
  }

  bindTilt() {
    const cards = $$('#productsGrid .product-card');
    cards.forEach(card => {
      const onMove = (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `rotateX(${(-y * 6).toFixed(2)}deg) rotateY(${(x * 6).toFixed(2)}deg) translateY(-4px)`;
      };
      const onLeave = () => {
        card.style.transform = '';
      };
      card.addEventListener('mousemove', onMove);
      card.addEventListener('mouseleave', onLeave);
      card.addEventListener('touchend', onLeave);
    });
  }

  bindQuickView() {
    const buttons = $$('#productsGrid .btn-quick-view');
    buttons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const card = btn.closest('.product-card');
        const name = card.querySelector('.product-name').textContent;
        const img = card.querySelector('img').src;
        const price = card.querySelector('.price').textContent;
        this.showQuickView(name, img, price);
      });
    });
  }

  showQuickView(name, img, price) {
    const modal = `
      <div class="quick-view-modal">
        <div class="modal-content">
          <div class="modal-header">
            <h3>${name}</h3>
            <button class="modal-close">&times;</button>
          </div>
          <div class="modal-body">
            <div class="product-preview"><img src="${img}" alt="${name}"></div>
            <div class="product-details">
              <div class="price-display">${price}</div>
              <button class="btn-customize">Customize & Order</button>
            </div>
          </div>
        </div>
      </div>`;

    document.body.insertAdjacentHTML('beforeend', modal);
    const close = document.querySelector('.quick-view-modal .modal-close');
    const backdrop = document.querySelector('.quick-view-modal');
    const destroy = () => backdrop && backdrop.remove();
    close && close.addEventListener('click', destroy);
    backdrop && backdrop.addEventListener('click', (e) => { if (e.target === backdrop) destroy(); });
  }
}

// ===== STATISTICS COUNTER MANAGER =====
class StatisticsCounterManager {
  constructor() {
    this.counters = [];
    this.hasAnimated = false;
    this.init();
  }

  init() {
    this.setupCounters();
    this.setupIntersectionObserver();
  }

  setupCounters() {
    const statNumbers = $$('.stat-number');

    statNumbers.forEach(counter => {
      const target = parseInt(counter.dataset.target);
      const suffix = counter.dataset.suffix || '';

      this.counters.push({
        element: counter,
        target: target,
        suffix: suffix,
        current: 0
      });
    });
  }

  setupIntersectionObserver() {
    const statsSection = $('.statistics-section');
    if (!statsSection) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.hasAnimated) {
          this.startCountAnimation();
          this.hasAnimated = true;
        }
      });
    }, {
      threshold: 0.5
    });

    observer.observe(statsSection);
  }

  startCountAnimation() {
    this.counters.forEach((counter, index) => {
      setTimeout(() => {
        this.animateCounter(counter);
      }, index * 200); // Stagger the animations
    });
  }

  animateCounter(counter) {
    const { element, target, suffix } = counter;
    const duration = 2000; // 2 seconds
    const stepTime = 16; // ~60fps
    const steps = duration / stepTime;
    const increment = target / steps;

    let current = 0;
    element.classList.add('counting');

    const timer = setInterval(() => {
      current += increment;

      if (current >= target) {
        current = target;
        clearInterval(timer);
        element.classList.remove('counting');
      }

      // Format the number
      const displayValue = this.formatNumber(Math.floor(current));
      element.textContent = displayValue + suffix;

      // Add some visual effects
      if (current >= target) {
        this.addCompletionEffect(element);
      }
    }, stepTime);
  }

  formatNumber(num) {
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace('.0', '') + 'K';
    }
    return num.toLocaleString();
  }

  addCompletionEffect(element) {
    // Add a pulse effect when counting completes
    element.style.transform = 'scale(1.1)';
    element.style.transition = 'transform 0.3s ease-out';

    setTimeout(() => {
      element.style.transform = 'scale(1)';
    }, 300);

    // Add a subtle glow effect
    element.style.textShadow = '0 0 20px rgba(99, 102, 241, 0.5)';
    setTimeout(() => {
      element.style.textShadow = '';
    }, 1000);
  }

  // Method to trigger animation manually (for testing)
  triggerAnimation() {
    if (!this.hasAnimated) {
      this.startCountAnimation();
      this.hasAnimated = true;
    }
  }

  // Reset counters (for development/testing)
  resetCounters() {
    this.hasAnimated = false;
    this.counters.forEach(counter => {
      counter.current = 0;
      counter.element.textContent = '0' + counter.suffix;
      counter.element.classList.remove('counting');
      counter.element.style.transform = '';
      counter.element.style.textShadow = '';
    });
  }
}

// ===== PRODUCT GALLERY MANAGER =====
class ProductGalleryManager {
  constructor() {
    this.currentProduct = 'business-cards';
    this.zoomLevel = 1;
    this.rotation = 0;
    this.init();
  }

  init() {
    this.bindEvents();
    this.setupProducts();
  }

  bindEvents() {
    // Tab switching
    const tabButtons = $$('.tab-btn');
    tabButtons.forEach(btn => {
      btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
    });

    // Preview controls
    const rotateLeft = $('#rotateLeft');
    const rotateRight = $('#rotateRight');
    const zoomIn = $('#zoomIn');
    const zoomOut = $('#zoomOut');

    if (rotateLeft) rotateLeft.addEventListener('click', () => this.rotateImage(-90));
    if (rotateRight) rotateRight.addEventListener('click', () => this.rotateImage(90));
    if (zoomIn) zoomIn.addEventListener('click', () => this.zoomImage(0.2));
    if (zoomOut) zoomOut.addEventListener('click', () => this.zoomImage(-0.2));

    // Add to cart
    const addToCartBtn = $('.add-to-cart-btn');
    if (addToCartBtn) {
      addToCartBtn.addEventListener('click', () => this.addToCart());
    }

    // Quick quote
    const quickQuoteBtn = $('.quick-quote-btn');
    if (quickQuoteBtn) {
      quickQuoteBtn.addEventListener('click', () => this.generateQuote());
    }
  }

  setupProducts() {
    this.products = {
      'business-cards': {
        name: 'Professional Business Cards',
        image: 'https://worksheets.clipart-library.com/images2/printing-business-cards-brisbane/printing-business-cards-brisbane-11.webp',
        price: '₹9.99',
        originalPrice: '₹14.99',
        rating: '4.9/5',
        reviews: '2,341'
      },
      'brochures': {
        name: 'Premium Brochures',
        image: 'https://cms-assets.tutsplus.com/cdn-cgi/image/width=360/uploads/users/346/posts/29623/image/professional-brochure-1.jpg',
        price: '₹24.99',
        originalPrice: '₹34.99',
        rating: '4.8/5',
        reviews: '1,892'
      },
      'folders': {
        name: 'Custom Folders',
        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ1r1zPUbRZ-0z0aQWgVp3L8zII66Mpp50S5Q&s',
        price: '₹19.99',
        originalPrice: '₹29.99',
        rating: '4.7/5',
        reviews: '1,456'
      },
      'reports': {
        name: 'Annual Reports',
        image: 'https://5.imimg.com/data5/SELLER/Default/2024/2/384846205/GK/WC/JI/4030281/professional-annual-report-printing-services.jpg',
        price: '₹49.99',
        originalPrice: '₹69.99',
        rating: '4.9/5',
        reviews: '987'
      }
    };
  }

  switchTab(productType) {
    if (!this.products[productType]) return;

    // Update active tab
    $$('.tab-btn').forEach(btn => btn.classList.remove('active'));
    $(`.tab-btn[data-tab="${productType}"]`).classList.add('active');

    // Update product details
    this.currentProduct = productType;
    this.updateProductDisplay();

    // Reset transformations
    this.zoomLevel = 1;
    this.rotation = 0;
    this.updateImageTransform();
  }

  updateProductDisplay() {
    const product = this.products[this.currentProduct];

    // Update image
    const previewImg = $('.preview-img');
    if (previewImg) {
      previewImg.src = product.image;
      previewImg.alt = `${product.name} Preview`;
    }

    // Update details
    const title = $('.product-title');
    const rating = $('.rating-text');
    const currentPrice = $('.price-current');
    const originalPrice = $('.price-original');

    if (title) title.textContent = product.name;
    if (rating) rating.textContent = `(${product.rating} - ${product.reviews} reviews)`;
    if (currentPrice) currentPrice.textContent = product.price;
    if (originalPrice) originalPrice.textContent = product.originalPrice;
  }

  rotateImage(degrees) {
    this.rotation += degrees;
    this.updateImageTransform();
  }

  zoomImage(delta) {
    this.zoomLevel = Math.max(0.5, Math.min(3, this.zoomLevel + delta));
    this.updateImageTransform();
  }

  updateImageTransform() {
    const previewImg = $('.preview-img');
    if (previewImg) {
      previewImg.style.transform = `scale(${this.zoomLevel}) rotate(${this.rotation}deg)`;
    }
  }

  addToCart() {
    const product = this.products[this.currentProduct];

    // Get selected options
    const material = $('.option-select').value;
    const finish = $$('.option-select')[1].value;
    const quantity = $$('.option-select')[2].value;

    // Show success animation
    this.animateAddToCart();

    // Show modal with details
    const modal = $('#cartModal');
    const modalText = $('#cartModalText');

    if (modal && modalText) {
      modalText.innerHTML = `
        <strong>${product.name}</strong> has been added to your cart!<br>
        <small>Material: ${material} | Finish: ${finish} | Quantity: ${quantity}</small>
      `;
      modal.classList.add('active');
    }

    console.log('Added to cart:', {
      product: product.name,
      material,
      finish,
      quantity,
      price: product.price
    });
  }

  generateQuote() {
    const product = this.products[this.currentProduct];

    // Simulate quote generation
    const quoteData = {
      product: product.name,
      basePrice: parseFloat(product.price.replace(/[^0-9.]/g, '')),
      material: $('.option-select').value,
      finish: $$('.option-select')[1].value,
      quantity: parseInt($$('.option-select')[2].value),
      deliveryTime: '3-5 business days',
      quoteId: 'QT' + Date.now()
    };

    // Calculate total
    const materialMultiplier = quoteData.material.includes('Premium') ? 1.3 : quoteData.material.includes('Luxury') ? 1.6 : 1;
    const finishMultiplier = quoteData.finish === 'Gloss' ? 1.1 : quoteData.finish === 'Velvet' ? 1.2 : 1;
    const total = (quoteData.basePrice * materialMultiplier * finishMultiplier * quoteData.quantity).toFixed(2);

    const fmt = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });
    alert(`
      📋 QUICK QUOTE
      
      Product: ${quoteData.product}
      Material: ${quoteData.material}
      Finish: ${quoteData.finish}
      Quantity: ${quoteData.quantity} items
      
      Total: ${fmt.format(total)}
      Delivery: ${quoteData.deliveryTime}
      Quote ID: ${quoteData.quoteId}
      
      Valid for 30 days. Contact us to place your order!
    `);
  }

  animateAddToCart() {
    const btn = $('.add-to-cart-btn');
    if (btn) {
      btn.style.transform = 'scale(0.95)';
      btn.style.background = 'var(--success-color)';
      btn.innerHTML = '✅ Added to Cart!';

      setTimeout(() => {
        btn.style.transform = '';
        btn.style.background = '';
        btn.innerHTML = '🛒 Add to Cart';
      }, 2000);
    }
  }
}

// ===== BLOG MANAGER =====
class BlogManager {
  constructor() {
    this.init();
  }

  init() {
    this.setupBlogCards();
    this.setupReadMoreButtons();
    this.setupViewAllPosts();
  }

  setupBlogCards() {
    const blogCards = $$('.blog-card');

    blogCards.forEach((card, index) => {
      // Add staggered animation delay
      card.style.animationDelay = `${index * 0.1}s`;

      // Add hover effects
      card.addEventListener('mouseenter', () => this.animateCardHover(card, true));
      card.addEventListener('mouseleave', () => this.animateCardHover(card, false));

      // Add click to expand excerpt
      const excerpt = card.querySelector('.blog-excerpt');
      if (excerpt) {
        excerpt.addEventListener('click', () => this.expandExcerpt(excerpt));
      }
    });
  }

  animateCardHover(card, isHovering) {
    const image = card.querySelector('.blog-image');
    const title = card.querySelector('.blog-title');
    const badge = card.querySelector('.blog-badge');

    if (isHovering) {
      card.style.transform = 'translateY(-8px) scale(1.02)';
      card.style.boxShadow = 'var(--shadow-xl)';
      card.style.borderColor = 'var(--primary-color)';

      if (image) {
        image.style.transform = 'scale(1.1) rotate(1deg)';
      }

      if (title) {
        title.style.color = 'var(--primary-color)';
      }

      if (badge) {
        badge.style.animation = 'pulse 1s infinite';
      }
    } else {
      card.style.transform = '';
      card.style.boxShadow = '';
      card.style.borderColor = '';

      if (image) {
        image.style.transform = '';
      }

      if (title) {
        title.style.color = '';
      }

      if (badge) {
        badge.style.animation = 'pulse 2s infinite';
      }
    }
  }

  expandExcerpt(excerpt) {
    if (excerpt.style.webkitLineClamp === 'none') {
      excerpt.style.webkitLineClamp = '3';
      excerpt.style.cursor = 'pointer';
    } else {
      excerpt.style.webkitLineClamp = 'none';
      excerpt.style.cursor = 'default';
    }
  }

  setupReadMoreButtons() {
    const readMoreButtons = $$('.btn-read-more');

    readMoreButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleReadMore(button);
      });

      // Add ripple effect
      button.addEventListener('click', (e) => this.createRippleEffect(button, e));
    });
  }

  handleReadMore(button) {
    const card = button.closest('.blog-card');
    const title = card.querySelector('.blog-title').textContent;
    const author = card.querySelector('.author-name').textContent;
    const category = card.querySelector('.blog-category').textContent;

    // Show blog post modal
    this.showBlogPostModal({
      title,
      author,
      category,
      content: this.generateBlogContent(title)
    });
  }

  showBlogPostModal(postData) {
    // Create modal HTML
    const modalHTML = `
      <div class="blog-modal" id="blog-modal">
        <div class="blog-modal-overlay"></div>
        <div class="blog-modal-content">
          <div class="blog-modal-header">
            <div class="blog-modal-meta">
              <span class="blog-modal-category">${postData.category}</span>
              <span class="blog-modal-author">By ${postData.author}</span>
            </div>
            <button class="blog-modal-close" aria-label="Close modal">×</button>
          </div>
          <div class="blog-modal-body">
            <h2 class="blog-modal-title">${postData.title}</h2>
            <div class="blog-modal-content-text">
              ${postData.content}
            </div>
          </div>
          <div class="blog-modal-footer">
            <button class="btn-share-post">Share Post</button>
            <button class="btn-bookmark-post">Bookmark</button>
          </div>
        </div>
      </div>
    `;

    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Add modal styles
    this.addModalStyles();

    // Show modal
    const modal = $('#blog-modal');
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('active'), 10);

    // Setup modal interactions
    this.setupModalInteractions(modal);
  }

  addModalStyles() {
    if (document.getElementById('blog-modal-styles')) return;

    const styles = `
      <style id="blog-modal-styles">
        .blog-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 1000;
          display: none;
          align-items: center;
          justify-content: center;
          padding: var(--space-4);
        }
        
        .blog-modal.active {
          display: flex;
        }
        
        .blog-modal-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(5px);
        }
        
        .blog-modal-content {
          position: relative;
          background: white;
          border-radius: var(--border-radius-lg);
          max-width: 800px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: var(--shadow-2xl);
          transform: scale(0.9);
          opacity: 0;
          transition: all 0.3s ease;
        }
        
        .blog-modal.active .blog-modal-content {
          transform: scale(1);
          opacity: 1;
        }
        
        .blog-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--space-6);
          border-bottom: 1px solid var(--gray-200);
        }
        
        .blog-modal-meta {
          display: flex;
          gap: var(--space-4);
        }
        
        .blog-modal-category {
          background: var(--primary-color);
          color: white;
          padding: var(--space-1) var(--space-3);
          border-radius: var(--border-radius-full);
          font-size: var(--text-xs);
          font-weight: 600;
        }
        
        .blog-modal-author {
          color: var(--gray-600);
          font-size: var(--text-sm);
        }
        
        .blog-modal-close {
          background: none;
          border: none;
          font-size: 24px;
          color: var(--gray-500);
          cursor: pointer;
          padding: var(--space-2);
          border-radius: var(--border-radius-full);
          transition: all 0.3s ease;
        }
        
        .blog-modal-close:hover {
          background: var(--gray-100);
          color: var(--gray-700);
        }
        
        .blog-modal-body {
          padding: var(--space-6);
        }
        
        .blog-modal-title {
          font-size: var(--text-2xl);
          font-weight: 700;
          color: var(--gray-900);
          margin-bottom: var(--space-4);
          line-height: 1.3;
        }
        
        .blog-modal-content-text {
          color: var(--gray-700);
          line-height: 1.8;
          font-size: var(--text-base);
        }
        
        .blog-modal-content-text p {
          margin-bottom: var(--space-4);
        }
        
        .blog-modal-content-text h3 {
          font-size: var(--text-lg);
          font-weight: 600;
          color: var(--gray-900);
          margin: var(--space-6) 0 var(--space-3) 0;
        }
        
        .blog-modal-footer {
          display: flex;
          gap: var(--space-4);
          padding: var(--space-6);
          border-top: 1px solid var(--gray-200);
        }
        
        .btn-share-post,
        .btn-bookmark-post {
          background: var(--gray-100);
          color: var(--gray-700);
          border: none;
          padding: var(--space-3) var(--space-6);
          border-radius: var(--border-radius-lg);
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .btn-share-post:hover,
        .btn-bookmark-post:hover {
          background: var(--primary-color);
          color: white;
        }
        
        @media (max-width: 768px) {
          .blog-modal-content {
            margin: var(--space-4);
            max-height: calc(100vh - 2rem);
          }
          
          .blog-modal-title {
            font-size: var(--text-xl);
          }
          
          .blog-modal-footer {
            flex-direction: column;
          }
        }
      </style>
    `;

    document.head.insertAdjacentHTML('beforeend', styles);
  }

  setupModalInteractions(modal) {
    const closeBtn = modal.querySelector('.blog-modal-close');
    const overlay = modal.querySelector('.blog-modal-overlay');
    const shareBtn = modal.querySelector('.btn-share-post');
    const bookmarkBtn = modal.querySelector('.btn-bookmark-post');

    // Close modal
    const closeModal = () => {
      modal.classList.remove('active');
      setTimeout(() => {
        modal.remove();
      }, 300);
    };

    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', closeModal);

    // Share post
    shareBtn.addEventListener('click', () => {
      this.sharePost();
    });

    // Bookmark post
    bookmarkBtn.addEventListener('click', () => {
      this.bookmarkPost();
    });

    // Close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeModal();
      }
    });
  }

  generateBlogContent(title) {
    // Generate sample blog content based on title
    const contentMap = {
      'Top Printing Trends to Watch in 2024': `
        <p>The printing industry is undergoing a remarkable transformation in 2024, driven by technological innovation, sustainability demands, and changing consumer preferences. Here are the key trends that are reshaping the landscape:</p>
        
        <h3>1. Sustainable Printing Solutions</h3>
        <p>Eco-friendly printing has moved from a nice-to-have to a must-have. Companies are increasingly adopting recycled papers, soy-based inks, and energy-efficient printing processes. The demand for sustainable packaging and marketing materials is at an all-time high.</p>
        
        <h3>2. Digital Transformation Integration</h3>
        <p>Print and digital are no longer separate entities. QR codes, augmented reality elements, and smart packaging are creating seamless experiences between physical and digital touchpoints. This integration is opening new possibilities for interactive marketing materials.</p>
        
        <h3>3. Personalization at Scale</h3>
        <p>Variable data printing technology has matured, allowing for highly personalized print materials without sacrificing efficiency. From personalized direct mail campaigns to customized product packaging, the possibilities are endless.</p>
        
        <h3>4. Advanced Finishing Techniques</h3>
        <p>Innovative finishing options like spot UV, embossing, foil stamping, and textured coatings are becoming more accessible and affordable. These techniques add premium feel to printed materials and help brands stand out in competitive markets.</p>
        
        <p>As we move through 2024, these trends will continue to evolve, creating new opportunities for businesses to leverage print as a powerful marketing and communication tool.</p>
      `,
      'Essential Design Tips for Print-Ready Files': `
        <p>Creating print-ready files requires attention to detail and understanding of technical specifications. Here's your comprehensive guide to ensuring perfect results every time:</p>
        
        <h3>1. Resolution and Image Quality</h3>
        <p>Always use high-resolution images (300 DPI minimum) for print projects. Vector graphics are preferred for logos and illustrations as they scale infinitely without quality loss. Avoid using web images (72 DPI) for print applications.</p>
        
        <h3>2. Color Management</h3>
        <p>Use CMYK color mode for most print projects, not RGB. Convert your colors to CMYK before sending files to ensure accurate color reproduction. Consider using Pantone colors for brand-critical elements.</p>
        
        <h3>3. Bleed and Safety Margins</h3>
        <p>Include 0.125" to 0.25" bleed on all sides where color extends to the edge. Keep important text and graphics within safety margins (typically 0.25" from trim edge) to avoid accidental cropping.</p>
        
        <h3>4. Font Considerations</h3>
        <p>Convert all fonts to outlines or embed them in your PDF. Use web-safe fonts or ensure all custom fonts are properly embedded. Avoid using fonts smaller than 6pt for readability.</p>
        
        <h3>5. File Format and Export</h3>
        <p>Export your final files as high-quality PDFs with proper compression settings. Include all fonts, images, and linked files. Test your files by printing a proof before final production.</p>
        
        <p>Following these guidelines will help ensure your print projects turn out exactly as envisioned, saving time and money in the long run.</p>
      `,
      'Sustainable Printing: Eco-Friendly Practices': `
        <p>Sustainability in printing is no longer optional—it's essential for businesses looking to reduce their environmental impact while meeting customer expectations. Here's how modern printing companies are going green:</p>
        
        <h3>1. Eco-Friendly Materials</h3>
        <p>The foundation of sustainable printing lies in material selection. Recycled papers, FSC-certified stocks, and biodegradable substrates are becoming standard choices. Soy-based and vegetable-based inks replace petroleum-based alternatives, reducing VOC emissions.</p>
        
        <h3>2. Energy-Efficient Processes</h3>
        <p>Modern printing facilities are investing in energy-efficient equipment and renewable energy sources. LED curing systems, smart power management, and waste heat recovery systems significantly reduce energy consumption.</p>
        
        <h3>3. Waste Reduction Strategies</h3>
        <p>Digital printing technology has revolutionized waste reduction by enabling print-on-demand and variable data printing. This eliminates overproduction and reduces inventory waste. Proper planning and efficient layout design also minimize paper waste.</p>
        
        <h3>4. Carbon Footprint Tracking</h3>
        <p>Many printing companies now offer carbon footprint calculations for projects, helping clients understand their environmental impact. This transparency allows businesses to make informed decisions about their printing choices.</p>
        
        <h3>5. End-of-Life Considerations</h3>
        <p>Sustainable printing extends beyond production to include end-of-life considerations. Using recyclable materials, providing recycling instructions, and designing for disassembly all contribute to a circular economy approach.</p>
        
        <p>By adopting these eco-friendly practices, printing companies can significantly reduce their environmental impact while providing high-quality, sustainable solutions to their clients.</p>
      `,
      'Complete Branding Guide for Small Businesses': `
        <p>Building a strong brand identity is crucial for small business success. This comprehensive guide will help you create a cohesive brand that resonates with your target audience and drives business growth.</p>
        
        <h3>1. Brand Foundation</h3>
        <p>Start by defining your brand's core values, mission, and vision. Understand your target audience and what makes your business unique. This foundation will guide all your branding decisions and ensure consistency across all touchpoints.</p>
        
        <h3>2. Visual Identity Development</h3>
        <p>Your logo, color palette, typography, and imagery should work together to create a memorable visual identity. Choose colors that reflect your brand personality and ensure your logo works across all applications and sizes.</p>
        
        <h3>3. Brand Voice and Messaging</h3>
        <p>Develop a consistent brand voice that reflects your personality and resonates with your audience. Create key messages that clearly communicate your value proposition and differentiate you from competitors.</p>
        
        <h3>4. Brand Application</h3>
        <p>Apply your brand consistently across all materials: business cards, letterhead, brochures, website, social media, and packaging. Consistency builds recognition and trust with your audience.</p>
        
        <h3>5. Brand Evolution</h3>
        <p>Your brand should evolve with your business while maintaining core elements that customers recognize. Regular brand audits help ensure your identity remains relevant and effective as your business grows.</p>
        
        <p>Remember, strong branding is an investment that pays dividends in customer recognition, trust, and loyalty. Take the time to get it right from the start.</p>
      `
    };

    return contentMap[title] || `
      <p>This is a sample blog post content. The full article would contain detailed information about the topic, including practical tips, industry insights, and actionable advice for readers.</p>
      
      <h3>Key Points</h3>
      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.</p>
      
      <h3>Practical Applications</h3>
      <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
      
      <p>Stay tuned for more detailed content and practical tips in our upcoming posts!</p>
    `;
  }

  sharePost() {
    if (navigator.share) {
      navigator.share({
        title: 'Blog Post',
        text: 'Check out this interesting article!',
        url: window.location.href
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      this.showNotification('Link copied to clipboard!', 'success');
    }
  }

  bookmarkPost() {
    this.showNotification('Post bookmarked!', 'success');
  }

  setupViewAllPosts() {
    const viewAllBtn = $('.btn-view-all-posts');
    if (viewAllBtn) {
      viewAllBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleViewAllPosts();
      });
    }
  }

  handleViewAllPosts() {
    this.showNotification('Blog archive coming soon!', 'info');
  }

  createRippleEffect(button, event) {
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.classList.add('ripple');

    button.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
    }, 600);
  }

  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-message">${message}</span>
        <button class="notification-close">×</button>
      </div>
    `;

    // Add notification styles if not already present
    if (!document.getElementById('notification-styles')) {
      const styles = `
        <style id="notification-styles">
          .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            border-radius: var(--border-radius-lg);
            box-shadow: var(--shadow-xl);
            padding: var(--space-4);
            z-index: 1001;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            border-left: 4px solid var(--primary-color);
          }
          
          .notification-success {
            border-left-color: #10b981;
          }
          
          .notification-info {
            border-left-color: #3b82f6;
          }
          
          .notification-content {
            display: flex;
            align-items: center;
            gap: var(--space-3);
          }
          
          .notification-message {
            color: var(--gray-700);
            font-size: var(--text-sm);
          }
          
          .notification-close {
            background: none;
            border: none;
            color: var(--gray-500);
            cursor: pointer;
            font-size: 18px;
            padding: 0;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .notification.show {
            transform: translateX(0);
          }
          
          .ripple {
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.6);
            transform: scale(0);
            animation: ripple-animation 0.6s linear;
            pointer-events: none;
          }
          
          @keyframes ripple-animation {
            to {
              transform: scale(4);
              opacity: 0;
            }
          }
        </style>
      `;
      document.head.insertAdjacentHTML('beforeend', styles);
    }

    // Add to page
    document.body.appendChild(notification);

    // Show notification
    setTimeout(() => notification.classList.add('show'), 10);

    // Setup close functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    });

    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
      }
    }, 5000);
  }
}

// ===== MAIN APP =====
class App {
  constructor() {
    this.init();
  }

  async init() {
    try {
      console.log('🚀 Starting app initialization...');

      // Initialize all managers
      this.themeManager = new ThemeManager();
      this.navigationManager = new NavigationManager();
      this.scrollAnimations = new ScrollAnimations();
      this.dataLoader = new DataLoader();
      this.formValidator = new FormValidator();
      this.modalManager = new ModalManager();
      this.backToTop = new BackToTop();
      this.lazyLoader = new LazyLoader();
      this.accessibilityManager = new AccessibilityManager();
      this.errorHandler = new ErrorHandler();
      this.priceCalculatorManager = new PriceCalculatorManager();
      this.statisticsCounterManager = new StatisticsCounterManager();
      this.bestsellingProductsManager = new BestsellingProductsManager();
      this.featuredProductsManager = new FeaturedProductsManager();
      this.newBestsellingProductsManager = new NewBestsellingProductsManager();
      this.productGalleryManager = new ProductGalleryManager();
      this.blogManager = new BlogManager();
      this.heroSliderManager = new HeroSliderManager();

      console.log('📦 Managers initialized, loading data...');

      // Load data
      await this.dataLoader.loadData();

      // Initialize performance monitoring (only in development)
      if (window.location.hostname === 'localhost') {
        this.performanceMonitor = new PerformanceMonitor();
      }

      // Mark app as loaded
      document.body.classList.add('app-loaded');

      console.log('✅ Shristi Press app initialized successfully');

    } catch (error) {
      console.error('❌ Failed to initialize app:', error);
    }
  }
}

// ===== DOCUMENT READY =====
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM Content Loaded - Initializing app...');
  try {
    // Initialize app
    window.app = new App();
  } catch (error) {
    console.error('❌ Error initializing app:', error);
  }

  // Remove the test product - let normal rendering handle it
});

// ===== SERVICE WORKER REGISTRATION =====
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('SW registered: ', registration);
    } catch (registrationError) {
      console.log('SW registration failed: ', registrationError);
    }
  });
}

// ===== UTILITY EXPORTS (for potential module usage) =====
window.ShristiPressUtils = {
  debounce,
  throttle,
  $,
  $$
};

// ===== HERO SLIDER MANAGER =====
class HeroSliderManager {
  constructor() {
    this.track = $('#heroTrack');
    this.slides = $$('.hero-slide');
    this.nextBtn = $('#nextHero');
    this.prevBtn = $('#prevHero');
    this.dotsContainer = $('#heroDots');
    this.current = 0;
    this.autoplayMs = 6000;
    this.timer = null;
    this.drag = { startX: 0, currentX: 0, isDragging: false };
    this.init();
  }

  init() {
    if (!this.track || this.slides.length === 0) return;
    this.createDots();
    this.update();
    this.bindEvents();
    this.startAutoplay();
  }

  bindEvents() {
    if (this.nextBtn) this.nextBtn.addEventListener('click', () => this.next());
    if (this.prevBtn) this.prevBtn.addEventListener('click', () => this.prev());

    // Keyboard
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') this.next();
      if (e.key === 'ArrowLeft') this.prev();
    });

    // Pause on hover
    this.track.addEventListener('mouseenter', () => this.stopAutoplay());
    this.track.addEventListener('mouseleave', () => this.startAutoplay());

    // Touch/Drag
    this.track.addEventListener('pointerdown', (e) => this.onDragStart(e));
    window.addEventListener('pointermove', (e) => this.onDragMove(e));
    window.addEventListener('pointerup', (e) => this.onDragEnd(e));

    // Resize
    window.addEventListener('resize', debounce(() => this.goTo(this.current, false), 150));

    // Subtle parallax on mouse move
    this.track.addEventListener('mousemove', (e) => {
      const activeSlideImg = this.slides[this.current]?.querySelector('.parallax');
      if (!activeSlideImg) return;
      const rect = this.track.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      activeSlideImg.style.transform = `translate(${x * 10}px, ${y * 6}px) scale(1.02)`;
    });
    this.track.addEventListener('mouseleave', () => {
      const activeSlideImg = this.slides[this.current]?.querySelector('.parallax');
      if (activeSlideImg) activeSlideImg.style.transform = '';
    });
  }

  createDots() {
    if (!this.dotsContainer) return;
    this.dotsContainer.innerHTML = '';
    this.dots = Array.from({ length: this.slides.length }).map((_, index) => {
      const btn = document.createElement('button');
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-label', `Go to slide ${index + 1}`);
      btn.addEventListener('click', () => this.goTo(index));
      this.dotsContainer.appendChild(btn);
      return btn;
    });
  }

  startAutoplay() {
    this.stopAutoplay();
    this.timer = setInterval(() => this.next(), this.autoplayMs);
  }

  stopAutoplay() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }

  next() { this.goTo((this.current + 1) % this.slides.length); }
  prev() { this.goTo((this.current - 1 + this.slides.length) % this.slides.length); }

  goTo(index, animate = true) {
    this.current = index;
    const offset = -index * 100;
    if (!animate) this.track.style.transition = 'none';
    this.track.style.transform = `translateX(${offset}%)`;
    if (!animate) requestAnimationFrame(() => { this.track.style.transition = ''; });
    this.update();
  }

  update() {
    this.slides.forEach((slide, i) => slide.classList.toggle('active', i === this.current));
    if (this.dots) this.dots.forEach((dot, i) => dot.classList.toggle('active', i === this.current));
  }

  onDragStart(e) {
    this.drag.isDragging = true;
    this.drag.startX = e.clientX;
    this.drag.currentX = e.clientX;
    this.track.style.cursor = 'grabbing';
    this.stopAutoplay();
  }

  onDragMove(e) {
    if (!this.drag.isDragging) return;
    this.drag.currentX = e.clientX;
    const delta = this.drag.currentX - this.drag.startX;
    const percent = (delta / window.innerWidth) * 100;
    this.track.style.transition = 'none';
    const offset = -this.current * 100 + percent;
    this.track.style.transform = `translateX(${offset}%)`;
  }

  onDragEnd(e) {
    if (!this.drag.isDragging) return;
    this.drag.isDragging = false;
    this.track.style.cursor = '';
    const delta = this.drag.currentX - this.drag.startX;
    const threshold = window.innerWidth * 0.15;
    this.track.style.transition = '';
    if (Math.abs(delta) > threshold) {
      if (delta < 0) this.next(); else this.prev();
    } else {
      this.goTo(this.current);
    }
    this.startAutoplay();
  }
}

class NewBestsellingProductsManager {
  constructor() {
    this.init();
  }

  init() {
    this.setupProductCards();
    this.setupQuickView();
    this.setupAddToCart();
    this.setupOrderButtons();
    this.setupViewAllButton();
  }

  setupProductCards() {
    const cards = document.querySelectorAll('.new-product-card');

    cards.forEach((card, index) => {
      // Simple hover effect
      card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-5px)';
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0)';
      });
    });
  }

  setupQuickView() {
    const quickViewButtons = document.querySelectorAll('.new-btn-quick-view');

    quickViewButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.showQuickViewModal(button);
      });
    });
  }

  showQuickViewModal(button) {
    const card = button.closest('.new-product-card');
    const productName = card.querySelector('.new-product-name').textContent;
    const productImage = card.querySelector('.new-product-image').src;
    const productPrice = card.querySelector('.new-price').textContent;

    // Create modal HTML
    const modalHTML = `
      <div class="new-quick-view-modal">
        <div class="new-modal-overlay"></div>
        <div class="new-modal-content">
          <div class="new-modal-header">
            <h3>${productName}</h3>
            <button class="new-modal-close">&times;</button>
          </div>
          <div class="new-modal-body">
            <div class="new-modal-image">
              <img src="${productImage}" alt="${productName}">
            </div>
            <div class="new-modal-details">
              <div class="new-modal-price">${productPrice}</div>
              <p>Get detailed information about this product and customize your order.</p>
              <button class="new-btn-customize">Customize Order</button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Show modal with animation
    setTimeout(() => {
      const modal = document.querySelector('.new-quick-view-modal');
      modal.classList.add('active');
    }, 10);

    // Setup close functionality
    const closeBtn = document.querySelector('.new-modal-close');
    const overlay = document.querySelector('.new-modal-overlay');

    const closeModal = () => {
      const modal = document.querySelector('.new-quick-view-modal');
      modal.classList.remove('active');
      setTimeout(() => modal.remove(), 300);
    };

    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', closeModal);
  }

  setupAddToCart() {
    const addToCartButtons = document.querySelectorAll('.new-btn-add-cart');

    addToCartButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.addToCart(button);
      });
    });
  }

  addToCart(button) {
    const card = button.closest('.new-product-card');
    const productName = card.querySelector('.new-product-name').textContent;

    // Create ripple effect
    this.createRippleEffect(button, new MouseEvent('click'));

    // Show notification
    this.showNotification(`${productName} added to cart!`, 'success');

    // Animate button
    button.style.transform = 'scale(0.9)';
    setTimeout(() => {
      button.style.transform = 'scale(1.1) rotate(5deg)';
    }, 100);
    setTimeout(() => {
      button.style.transform = '';
    }, 300);
  }

  setupOrderButtons() {
    const orderButtons = document.querySelectorAll('.new-btn-order-now');

    orderButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.handleOrderNow(button);
      });
    });
  }

  handleOrderNow(button) {
    const card = button.closest('.new-product-card');
    const productName = card.querySelector('.new-product-name').textContent;

    // Create ripple effect
    this.createRippleEffect(button, new MouseEvent('click'));

    // Show notification
    this.showNotification(`Ordering ${productName}...`, 'info');

    // Animate button
    button.style.transform = 'scale(0.95)';
    setTimeout(() => {
      button.style.transform = 'scale(1.05)';
    }, 150);
    setTimeout(() => {
      button.style.transform = '';
    }, 400);
  }

  createRippleEffect(button, event) {
    const ripple = document.createElement('span');
    ripple.className = 'new-ripple';

    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';

    button.appendChild(ripple);

    setTimeout(() => ripple.remove(), 600);
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `new-notification new-notification-${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => notification.classList.add('show'), 10);
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  setupViewAllButton() {
    const viewAllButton = document.querySelector('.new-btn-view-all-products');

    if (viewAllButton) {
      viewAllButton.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleViewAllProducts();
      });
    }
  }

  handleViewAllProducts() {
    // Create ripple effect
    this.createRippleEffect(document.querySelector('.new-btn-view-all-products'), new MouseEvent('click'));

    // Show notification
    this.showNotification('Opening all products...', 'info');

    // Simulate navigation
    setTimeout(() => {
      window.scrollTo({
        top: document.querySelector('.products-grid').offsetTop - 100,
        behavior: 'smooth'
      });
    }, 500);
  }
}
