// Main JavaScript file for shared functionality
document.addEventListener('DOMContentLoaded', function() {
    // Common functionality across all pages
    
    // Mobile menu toggle (if needed)
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
        });
    }
    
    // Any other shared JavaScript functionality
});