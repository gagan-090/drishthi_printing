#!/usr/bin/env python3
"""
Script to update all service pages with consistent navbar
"""

import os
import re

# The consistent navbar HTML to replace the individual headers
CONSISTENT_NAVBAR = '''    <!-- Scroll Progress Bar -->
    <div class="scroll-progress" id="scrollProgress" aria-hidden="true"></div>

    <!-- Skip to Content (Accessibility) -->
    <a href="#main-content" class="skip-link">Skip to main content</a>

    <!-- Header -->
    <header class="header" role="banner">
        <!-- Contact Bar -->
        <div class="contact-bar">
            <div class="container">
                <div class="contact-bar-content">
                    <div class="contact-info">
                        <div class="contact-item contact-essential">
                            <span class="contact-icon">📧</span>
                            <a href="mailto:info@shristipress.com" class="contact-link">
                                <span class="contact-full">info@shristipress.com</span>
                                <span class="contact-short">Email</span>
                            </a>
                        </div>
                        <div class="contact-item contact-essential">
                            <span class="contact-icon">📞</span>
                            <a href="tel:+919876543210" class="contact-link">
                                <span class="contact-full">+91 98765 43210</span>
                                <span class="contact-short">Call</span>
                            </a>
                        </div>
                        <div class="contact-item contact-optional">
                            <span class="contact-icon">💬</span>
                            <a href="https://wa.me/919876543210" class="contact-link" target="_blank">WhatsApp</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <nav class="navbar" role="navigation" aria-label="Main navigation">
            <div class="container">
                <div class="navbar-brand">
                    <a href="../index.html" class="logo" aria-label="Shristi Press Home">
                        <img src="../assets/images/logo.svg" alt="Shristi Press Logo" width="120" height="40" class="logo-image">
                    </a>
                </div>

                <div class="navbar-menu" id="navbarMenu">
                    <ul class="navbar-nav" role="menubar">
                        <li role="none"><a href="../index.html#home" role="menuitem">Home</a></li>
                        <li class="mega-menu-item" role="none">
                            <a href="../index.html#services" role="menuitem" aria-haspopup="true" aria-expanded="false">
                                Services
                                <span class="dropdown-arrow" aria-hidden="true">▼</span>
                            </a>
                            <div class="mega-menu" role="menu" aria-label="Services submenu">
                                <div class="mega-menu-content">
                                    <div class="mega-menu-columns">
                                        <div class="mega-menu-column">
                                            <h3 class="mega-menu-heading">Book Printing</h3>
                                            <ul class="mega-menu-links">
                                                <li><a href="childrens-book-printing.html">Children's Book Printing</a></li>
                                                <li><a href="comic-book-printing.html">Comic Book Printing</a></li>
                                                <li><a href="coffee-table-book-printing.html">Coffee Table Book Printing</a></li>
                                                <li><a href="coloring-book-printing.html">Coloring Book Printing</a></li>
                                                <li><a href="art-book-printing.html">Art Book Printing</a></li>
                                                <li><a href="annual-reports-printing.html">Annual Reports Printing</a></li>
                                                <li><a href="year-book-printing.html">Year Book Printing</a></li>
                                                <li><a href="on-demand-books-printing.html">On Demand Books Printing</a></li>
                                            </ul>
                                        </div>
                                        <div class="mega-menu-column">
                                            <h3 class="mega-menu-heading">Paper Box Printing</h3>
                                            <ul class="mega-menu-links">
                                                <li><a href="medical-paper-boxes.html">Medical Paper Boxes</a></li>
                                                <li><a href="cosmetic-paper-boxes.html">Cosmetic Paper Boxes</a></li>
                                                <li><a href="retail-paper-boxes.html">Retail Paper Boxes</a></li>
                                                <li><a href="folding-carton-boxes.html">Folding Carton Boxes</a></li>
                                                <li><a href="corrugated-boxes.html">Corrugated Boxes</a></li>
                                                <li><a href="kraft-boxes.html">Kraft Boxes</a></li>
                                            </ul>
                                        </div>
                                        <div class="mega-menu-column">
                                            <h3 class="mega-menu-heading">Marketing Product</h3>
                                            <ul class="mega-menu-links">
                                                <li><a href="brochures.html">Brochures</a></li>
                                                <li><a href="catalogue.html">Catalogue</a></li>
                                                <li><a href="poster.html">Poster</a></li>
                                                <li><a href="flyers.html">Flyers</a></li>
                                                <li><a href="dangler.html">Dangler</a></li>
                                                <li><a href="standees.html">Standees</a></li>
                                                <li><a href="pen-drives.html">Pen Drives</a></li>
                                            </ul>
                                        </div>
                                        <div class="mega-menu-column">
                                            <h3 class="mega-menu-heading">Stationery Product</h3>
                                            <ul class="mega-menu-links">
                                                <li><a href="business-cards.html">Business Card</a></li>
                                                <li><a href="letter-head.html">Letter Head</a></li>
                                                <li><a href="envelopes.html">Envelopes</a></li>
                                                <li><a href="bill-book.html">Bill Book</a></li>
                                                <li><a href="id-cards.html">ID Cards</a></li>
                                                <li><a href="sticker.html">Sticker</a></li>
                                                <li><a href="document-printing.html">Document Printing</a></li>
                                            </ul>
                                        </div>
                                    </div>
                                    <div class="mega-menu-image-panel">
                                        <div class="image-panel-content">
                                            <img src="../assets/images/hero-book.png" alt="Professional printing showcase" class="panel-image">
                                            <div class="panel-overlay">
                                                <h4 class="panel-title">Premium Quality</h4>
                                                <h3 class="panel-heading">Printing Excellence</h3>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </li>
                        <li role="none"><a href="../index.html#products" role="menuitem">Products</a></li>
                        <li role="none"><a href="../index.html#about" role="menuitem">About</a></li>
                        <li role="none"><a href="../index.html#blog" role="menuitem">Blog</a></li>
                        <li role="none"><a href="../index.html#contact" role="menuitem">Contact</a></li>
                    </ul>

                    <div class="navbar-actions">
                        <button class="btn-theme-toggle" id="themeToggle" aria-label="Toggle dark mode" title="Toggle dark mode">
                            <span class="theme-icon light-icon" aria-hidden="true">☀️</span>
                            <span class="theme-icon dark-icon" aria-hidden="true">🌙</span>
                        </button>
                        <button class="btn btn-primary">Get Started</button>
                    </div>
                </div>

                <button class="navbar-toggle" id="navbarToggle" aria-label="Toggle navigation menu" aria-expanded="false">
                    <span class="hamburger-line"></span>
                    <span class="hamburger-line"></span>
                    <span class="hamburger-line"></span>
                </button>
            </div>
        </nav>
    </header>'''

def update_service_page(file_path):
    """Update a single service page with the consistent navbar"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Find the old header section (from <header to </header>)
        header_pattern = r'<header[^>]*>.*?</header>'
        
        # Check if the file already has the new navbar
        if 'contact-bar' in content and 'navbar' in content:
            print(f"✓ {os.path.basename(file_path)} already updated")
            return False
        
        # Replace the old header with the new one
        new_content = re.sub(header_pattern, CONSISTENT_NAVBAR, content, flags=re.DOTALL)
        
        # Update title to use "Shristi Press" instead of "Drishthi Printing"
        new_content = re.sub(r'Drishthi Printing', 'Shristi Press', new_content)
        
        # Add the main CSS file reference if not present
        if '../css/style.css' not in new_content:
            # Find the line with services.css and add style.css before it
            new_content = re.sub(
                r'(<link rel="stylesheet" href="../css/services.css">)',
                r'    <link rel="stylesheet" href="../css/style.css">\n    \1',
                new_content
            )
        
        # Add the main script.js reference if not present
        if '../js/script.js' not in new_content:
            # Find the line with services.js and add script.js before it
            new_content = re.sub(
                r'(<script src="../js/services.js">)',
                r'    <script src="../js/script.js"></script>\n    \1',
                new_content
            )
        
        # Update main tag to include proper attributes
        new_content = re.sub(
            r'<main class="pt-20">',
            r'<main id="main-content" class="pt-20" role="main">',
            new_content
        )
        
        # Write the updated content back to the file
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        print(f"✓ Updated {os.path.basename(file_path)}")
        return True
        
    except Exception as e:
        print(f"✗ Error updating {os.path.basename(file_path)}: {e}")
        return False

def main():
    """Main function to update all service pages"""
    services_dir = "services"
    
    if not os.path.exists(services_dir):
        print(f"Services directory '{services_dir}' not found!")
        return
    
    # Get all HTML files in the services directory
    service_files = [f for f in os.listdir(services_dir) if f.endswith('.html')]
    
    if not service_files:
        print("No HTML files found in services directory!")
        return
    
    print(f"Found {len(service_files)} service files to update...")
    print()
    
    updated_count = 0
    for service_file in service_files:
        file_path = os.path.join(services_dir, service_file)
        if update_service_page(file_path):
            updated_count += 1
    
    print()
    print(f"Update complete! Updated {updated_count} out of {len(service_files)} files.")
    
    # Clean up the template file
    if os.path.exists("services/navbar-template.html"):
        os.remove("services/navbar-template.html")
        print("Cleaned up template file.")

if __name__ == "__main__":
    main()


