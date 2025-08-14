// Simple verification script to test navigation
console.log('Testing navigation implementation...');

// Check if service cards have proper links
const serviceCards = document.querySelectorAll('.service-card-link');
console.log('Found service card links:', serviceCards.length);

serviceCards.forEach((card, index) => {
    console.log(`Card ${index + 1}: ${card.href}`);
});

// Check if category tabs exist
const categoryTabs = document.querySelectorAll('.category-tab');
console.log('Found category tabs:', categoryTabs.length);

categoryTabs.forEach((tab, index) => {
    console.log(`Tab ${index + 1}: ${tab.dataset.category}`);
});

// Check if category sections exist
const categorySections = document.querySelectorAll('.category-section');
console.log('Found category sections:', categorySections.length);

categorySections.forEach((section, index) => {
    console.log(`Section ${index + 1}: ${section.id}`);
});

// Test hash navigation
function testHashNavigation() {
    const testHashes = ['book-printing', 'paper-box', 'marketing', 'stationery'];
    
    testHashes.forEach(hash => {
        const tab = document.querySelector(`[data-category="${hash}"]`);
        const section = document.getElementById(hash);
        
        console.log(`Hash ${hash}:`);
        console.log(`  Tab exists: ${!!tab}`);
        console.log(`  Section exists: ${!!section}`);
    });
}

// Run test if on categories page
if (window.location.pathname.includes('categories.html')) {
    setTimeout(testHashNavigation, 1000);
}