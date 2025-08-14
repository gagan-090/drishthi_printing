#!/usr/bin/env python3
"""
Complete navbar update script - adds HTML structure, CSS, and JS to all service files
"""

import os
import glob
import re

def get_navbar_html():
    """Get the complete navbar HTML structure"""
    return '''    <!-- Skip to Content (Accessibility) -->
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
                        <img src="../assets/images/logo.svg" alt="Shristi Press Logo" width="120" height="40"
                            class="logo-image">
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
                        <button class="btn-theme-toggle" id="themeToggle" aria-label="Toggle dark mode"
                            title="Toggle dark mode">
                            <span class="theme-icon light-icon" aria-hidden="true">☀️</span>
                            <span class="theme-icon dark-icon" aria-hidden="true">🌙</span>
                        </button>
                        <button class="btn btn-primary">Get Started</button>
                    </div>
                </div>

                <button class="navbar-toggle" id="navbarToggle" aria-label="Toggle navigation menu"
                    aria-expanded="false">
                    <span class="hamburger-line"></span>
                    <span class="hamburger-line"></span>
                    <span class="hamburger-line"></span>
                </button>
            </div>
        </nav>
    </header>

'''

def remove_existing_headers(content):
    """Remove any existing headers, navs, or navigation elements"""
    # Remove header tags
    content = re.sub(r'<header.*?</header>', '', content, flags=re.DOTALL)
    
    # Remove standalone nav tags
    content = re.sub(r'<nav.*?</nav>', '', content, flags=re.DOTALL)
    
    # Remove contact bars
    content = re.sub(r'<div class="contact-bar">.*?</div>\s*</div>\s*</div>', '', content, flags=re.DOTALL)
    
    # Remove any loading screens or overlays that might interfere
    content = re.sub(r'<div id="loading-screen".*?</div>', '', content, flags=re.DOTALL)
    
    return content

def add_css_if_missing(content):
    """Add main CSS if not already present"""
    if '../css/style.css' not in content:
        css_link = '''    <!-- Main Site Styles -->
    <link rel="stylesheet" href="../css/style.css">'''
        content = re.sub(r'</head>', f'{css_link}\n</head>', content)
    return content

def add_js_if_missing(content):
    """Add main JS if not already present"""
    if '../js/script.js' not in content:
        js_script = '''    <!-- Main Site Scripts -->
    <script defer src="../js/script.js"></script>'''
        content = re.sub(r'</body>', f'{js_script}\n</body>', content)
    return content

def update_service_file(filepath):
    """Complete navbar update for a service file"""
    print(f"Processing {filepath}...")
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Check if already has proper navbar
        if 'header class="header"' in content and 'contact-bar' in content:
            print(f"  ✓ {filepath} already has proper navbar")
            return
        
        # Remove existing headers/navs
        content = remove_existing_headers(content)
        
        # Find body tag and add navbar after it
        body_match = re.search(r'(<body[^>]*>)', content)
        if not body_match:
            print(f"  ❌ Could not find body tag in {filepath}")
            return
        
        body_tag = body_match.group(1)
        body_end = body_match.end()
        
        # Insert navbar after body tag
        navbar_html = get_navbar_html()
        content = content[:body_end] + '\n' + navbar_html + '\n' + content[body_end:]
        
        # Add CSS and JS
        content = add_css_if_missing(content)
        content = add_js_if_missing(content)
        
        # Write updated content
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"  ✅ Successfully updated {filepath}")
        
    except Exception as e:
        print(f"  ❌ Error processing {filepath}: {e}")

def main():
    """Main function"""
    print("Complete navbar update for all service files...")
    print("=" * 60)
    
    # Get all service files
    service_files = glob.glob('services/*.html')
    service_files = [f for f in service_files if 'navbar-template' not in f]
    
    print(f"Found {len(service_files)} service files to process")
    print()
    
    # Process each file
    for service_file in service_files:
        update_service_file(service_file)
        print()
    
    print("=" * 60)
    print("✅ Complete navbar update finished!")

if __name__ == "__main__":
    main()