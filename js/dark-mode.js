/**
 * Dark Mode Manager for Service Pages
 * Handles theme switching, persistence, and system preference detection
 */
class DarkModeManager {
    constructor() {
        this.storageKey = 'theme-preference';
        this.init();
    }

    init() {
        // Set initial theme
        this.setInitialTheme();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Listen for system theme changes
        this.setupSystemThemeListener();
        
        // Setup keyboard shortcuts
        this.setupKeyboardShortcuts();
        
        // Initialize theme toggle buttons
        this.initializeToggleButtons();
    }

    setInitialTheme() {
        // Check for saved preference
        const savedTheme = localStorage.getItem(this.storageKey);
        
        if (savedTheme) {
            this.setTheme(savedTheme);
        } else {
            // Check system preference
            const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            this.setTheme(systemPrefersDark ? 'dark' : 'light');
        }
    }

    setTheme(theme) {
        // Update document attribute
        document.documentElement.setAttribute('data-theme', theme);
        
        // Update body class for Tailwind compatibility
        if (theme === 'dark') {
            document.body.classList.add('dark');
        } else {
            document.body.classList.remove('dark');
        }
        
        // Save preference
        localStorage.setItem(this.storageKey, theme);
        
        // Update toggle buttons
        this.updateToggleButtons(theme);
        
        // Dispatch custom event
        this.dispatchThemeChangeEvent(theme);
        
        // Update meta theme-color for mobile browsers
        this.updateMetaThemeColor(theme);
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
        
        // Add visual feedback
        this.addToggleFeedback();
    }

    getCurrentTheme() {
        return document.documentElement.getAttribute('data-theme') || 'light';
    }

    setupEventListeners() {
        // Theme toggle buttons
        document.addEventListener('click', (e) => {
            if (e.target.matches('.btn-theme-toggle, .theme-toggle, [data-theme-toggle]')) {
                e.preventDefault();
                this.toggleTheme();
            }
        });

        // Handle dynamically added toggle buttons
        document.addEventListener('DOMContentLoaded', () => {
            this.initializeToggleButtons();
        });
    }

    setupSystemThemeListener() {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        mediaQuery.addEventListener('change', (e) => {
            // Only auto-switch if user hasn't manually set a preference
            const savedTheme = localStorage.getItem(this.storageKey);
            if (!savedTheme) {
                this.setTheme(e.matches ? 'dark' : 'light');
            }
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + Shift + D to toggle theme
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
                e.preventDefault();
                this.toggleTheme();
            }
        });
    }

    initializeToggleButtons() {
        const toggleButtons = document.querySelectorAll('.btn-theme-toggle, .theme-toggle, [data-theme-toggle]');
        
        toggleButtons.forEach(button => {
            // Ensure button has proper structure
            if (!button.querySelector('.theme-icon')) {
                this.createToggleButtonStructure(button);
            }
            
            // Set initial state
            this.updateToggleButton(button, this.getCurrentTheme());
            
            // Add accessibility attributes
            button.setAttribute('aria-label', 'Toggle dark mode');
            button.setAttribute('title', 'Toggle dark mode (Ctrl+Shift+D)');
        });
    }

    createToggleButtonStructure(button) {
        // Clear existing content
        button.innerHTML = '';
        
        // Add theme icons
        const lightIcon = document.createElement('span');
        lightIcon.className = 'theme-icon light-icon';
        lightIcon.setAttribute('aria-hidden', 'true');
        lightIcon.textContent = '☀️';
        
        const darkIcon = document.createElement('span');
        darkIcon.className = 'theme-icon dark-icon';
        darkIcon.setAttribute('aria-hidden', 'true');
        darkIcon.textContent = '🌙';
        
        button.appendChild(lightIcon);
        button.appendChild(darkIcon);
        
        // Add CSS classes if not present
        if (!button.classList.contains('btn-theme-toggle')) {
            button.classList.add('btn-theme-toggle');
        }
    }

    updateToggleButtons(theme) {
        const toggleButtons = document.querySelectorAll('.btn-theme-toggle, .theme-toggle, [data-theme-toggle]');
        toggleButtons.forEach(button => {
            this.updateToggleButton(button, theme);
        });
    }

    updateToggleButton(button, theme) {
        const lightIcon = button.querySelector('.light-icon');
        const darkIcon = button.querySelector('.dark-icon');
        
        if (lightIcon && darkIcon) {
            if (theme === 'dark') {
                lightIcon.style.opacity = '0';
                darkIcon.style.opacity = '1';
                button.setAttribute('aria-label', 'Switch to light mode');
                button.setAttribute('title', 'Switch to light mode (Ctrl+Shift+D)');
            } else {
                lightIcon.style.opacity = '1';
                darkIcon.style.opacity = '0';
                button.setAttribute('aria-label', 'Switch to dark mode');
                button.setAttribute('title', 'Switch to dark mode (Ctrl+Shift+D)');
            }
        }
    }

    addToggleFeedback() {
        // Create ripple effect
        const toggleButtons = document.querySelectorAll('.btn-theme-toggle, .theme-toggle, [data-theme-toggle]');
        
        toggleButtons.forEach(button => {
            button.style.transform = 'scale(0.95)';
            setTimeout(() => {
                button.style.transform = 'scale(1)';
            }, 150);
        });
        
        // Show toast notification
        this.showThemeChangeNotification();
    }

    showThemeChangeNotification() {
        const theme = this.getCurrentTheme();
        const message = theme === 'dark' ? 'Dark mode enabled' : 'Light mode enabled';
        const icon = theme === 'dark' ? '🌙' : '☀️';
        
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.theme-notification');
        existingNotifications.forEach(notification => notification.remove());
        
        // Create notification
        const notification = document.createElement('div');
        notification.className = 'theme-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${icon}</span>
                <span class="notification-message">${message}</span>
            </div>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--card-bg);
            color: var(--text-primary);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 12px 16px;
            box-shadow: 0 4px 12px var(--shadow-color);
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            font-size: 14px;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 8px;
        `;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Auto remove
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 2000);
    }

    dispatchThemeChangeEvent(theme) {
        const event = new CustomEvent('themechange', {
            detail: { theme }
        });
        document.dispatchEvent(event);
    }

    updateMetaThemeColor(theme) {
        let metaThemeColor = document.querySelector('meta[name="theme-color"]');
        
        if (!metaThemeColor) {
            metaThemeColor = document.createElement('meta');
            metaThemeColor.name = 'theme-color';
            document.head.appendChild(metaThemeColor);
        }
        
        const color = theme === 'dark' ? '#1e293b' : '#ffffff';
        metaThemeColor.content = color;
    }

    // Utility methods for external use
    isDarkMode() {
        return this.getCurrentTheme() === 'dark';
    }

    isLightMode() {
        return this.getCurrentTheme() === 'light';
    }

    // Method to sync theme across tabs
    syncThemeAcrossTabs() {
        window.addEventListener('storage', (e) => {
            if (e.key === this.storageKey && e.newValue) {
                this.setTheme(e.newValue);
            }
        });
    }

    // Method to handle theme-specific image loading
    updateThemeSpecificImages() {
        const images = document.querySelectorAll('[data-light-src], [data-dark-src]');
        const currentTheme = this.getCurrentTheme();
        
        images.forEach(img => {
            const lightSrc = img.getAttribute('data-light-src');
            const darkSrc = img.getAttribute('data-dark-src');
            
            if (currentTheme === 'dark' && darkSrc) {
                img.src = darkSrc;
            } else if (currentTheme === 'light' && lightSrc) {
                img.src = lightSrc;
            }
        });
    }

    // Method to handle theme-specific content
    updateThemeSpecificContent() {
        const elements = document.querySelectorAll('[data-light-content], [data-dark-content]');
        const currentTheme = this.getCurrentTheme();
        
        elements.forEach(element => {
            const lightContent = element.getAttribute('data-light-content');
            const darkContent = element.getAttribute('data-dark-content');
            
            if (currentTheme === 'dark' && darkContent) {
                element.textContent = darkContent;
            } else if (currentTheme === 'light' && lightContent) {
                element.textContent = lightContent;
            }
        });
    }

    // Method to handle Tailwind CSS dark mode classes
    updateTailwindClasses() {
        const elements = document.querySelectorAll('[data-tw-dark]');
        const currentTheme = this.getCurrentTheme();
        
        elements.forEach(element => {
            const darkClasses = element.getAttribute('data-tw-dark').split(' ');
            
            if (currentTheme === 'dark') {
                element.classList.add(...darkClasses);
            } else {
                element.classList.remove(...darkClasses);
            }
        });
    }

    // Method to initialize theme for dynamically loaded content
    initializeForDynamicContent(container) {
        // Initialize toggle buttons in the container
        const toggleButtons = container.querySelectorAll('.btn-theme-toggle, .theme-toggle, [data-theme-toggle]');
        toggleButtons.forEach(button => {
            if (!button.querySelector('.theme-icon')) {
                this.createToggleButtonStructure(button);
            }
            this.updateToggleButton(button, this.getCurrentTheme());
        });
        
        // Update theme-specific images
        this.updateThemeSpecificImages();
        
        // Update theme-specific content
        this.updateThemeSpecificContent();
        
        // Update Tailwind classes
        this.updateTailwindClasses();
    }
}

// Initialize dark mode manager
const darkModeManager = new DarkModeManager();

// Sync theme across tabs
darkModeManager.syncThemeAcrossTabs();

// Listen for theme changes to update dynamic content
document.addEventListener('themechange', (e) => {
    darkModeManager.updateThemeSpecificImages();
    darkModeManager.updateThemeSpecificContent();
    darkModeManager.updateTailwindClasses();
});

// Export for use in other scripts
window.DarkModeManager = DarkModeManager;
window.darkModeManager = darkModeManager;

// Add CSS for theme notifications
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    .theme-notification {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 8px;
    }
    
    .notification-icon {
        font-size: 16px;
    }
    
    .notification-message {
        font-size: 14px;
        font-weight: 500;
    }
`;

document.head.appendChild(notificationStyles);

// Initialize theme-specific content on page load
document.addEventListener('DOMContentLoaded', () => {
    darkModeManager.updateThemeSpecificImages();
    darkModeManager.updateThemeSpecificContent();
    darkModeManager.updateTailwindClasses();
});

// Handle page visibility changes to sync theme
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        const savedTheme = localStorage.getItem(darkModeManager.storageKey);
        if (savedTheme && savedTheme !== darkModeManager.getCurrentTheme()) {
            darkModeManager.setTheme(savedTheme);
        }
    }
});