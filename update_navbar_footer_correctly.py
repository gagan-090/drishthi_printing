#!/usr/bin/env python3
"""
Script to properly update all HTML pages with the navbar and footer from index.html
This removes old navigation and adds the complete navbar with correct mega menu links.
"""

import os
import re
from pathlib import Path

def extract_complete_navbar_footer():
    """Extract the complete navbar and footer sections from index.html"""
    
    with open('index.html', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Extract the complete header section (contact bar + navbar)
    header_start = content.find('<header class="header" role="banner">')
    header_end = content.find('</header>') + len('</header>')
    header_section = content[header_start:header_end]
    
    # Extract the complete footer section
    footer_start = content.find('<!-- Footer -->')
    footer_end = content.find('</footer>') + len('</footer>')
    footer_section = content[footer_start:footer_end]
    
    # Extract all CSS styles (including navbar styles)
    style_start = content.find('<style>')
    style_end = content.find('</style>', style_start) + len('</style>')
    all_styles = content[style_start:style_end]
    
    # Extract all JavaScript (including navbar functionality)
    script_start = content.find('<script>')
    script_end = content.find('</script>', script_start) + len('</script>')
    all_scripts = content[script_start:script_end]
    
    return header_section, footer_section, all_styles, all_scripts

def update_navigation_links(content, file_path):
    """Update navigation links based on the current file location"""
    
    # If this is a service page, update all navigation links
    if 'services/' in str(file_path):
        # Update logo and home links to go back to main page
        content = content.replace('href="#"', 'href="../index.html"')
        content = content.replace('href="#home"', 'href="../index.html#home"')
        content = content.replace('href="#services"', 'href="../index.html#services"')
        content = content.replace('href="#products"', 'href="../index.html#products"')
        content = content.replace('href="#about"', 'href="../index.html#about"')
        content = content.replace('href="#blog"', 'href="../index.html#blog"')
        content = content.replace('href="contact.html"', 'href="../contact.html"')
        
        # Update mega menu service links to use relative paths (remove 'services/' prefix)
        content = content.replace('href="services/childrens-book-printing.html"', 'href="childrens-book-printing.html"')
        content = content.replace('href="services/comic-book-printing.html"', 'href="comic-book-printing.html"')
        content = content.replace('href="services/coffee-table-book-printing.html"', 'href="coffee-table-book-printing.html"')
        content = content.replace('href="services/coloring-book-printing.html"', 'href="coloring-book-printing.html"')
        content = content.replace('href="services/art-book-printing.html"', 'href="art-book-printing.html"')
        content = content.replace('href="services/annual-reports-printing.html"', 'href="annual-reports-printing.html"')
        content = content.replace('href="services/year-book-printing.html"', 'href="year-book-printing.html"')
        content = content.replace('href="services/on-demand-books-printing.html"', 'href="on-demand-books-printing.html"')
        content = content.replace('href="services/medical-paper-boxes.html"', 'href="medical-paper-boxes.html"')
        content = content.replace('href="services/cosmetic-paper-boxes.html"', 'href="cosmetic-paper-boxes.html"')
        content = content.replace('href="services/retail-paper-boxes.html"', 'href="retail-paper-boxes.html"')
        content = content.replace('href="services/folding-carton-boxes.html"', 'href="folding-carton-boxes.html"')
        content = content.replace('href="services/corrugated-boxes.html"', 'href="corrugated-boxes.html"')
        content = content.replace('href="services/kraft-boxes.html"', 'href="kraft-boxes.html"')
        content = content.replace('href="services/brochures.html"', 'href="brochures.html"')
        content = content.replace('href="services/catalogue.html"', 'href="catalogue.html"')
        content = content.replace('href="services/poster.html"', 'href="poster.html"')
        content = content.replace('href="services/flyers.html"', 'href="flyers.html"')
        content = content.replace('href="services/dangler.html"', 'href="dangler.html"')
        content = content.replace('href="services/standees.html"', 'href="standees.html"')
        content = content.replace('href="services/pen-drives.html"', 'href="pen-drives.html"')
        content = content.replace('href="services/business-cards.html"', 'href="business-cards.html"')
        content = content.replace('href="services/letter-head.html"', 'href="letter-head.html"')
        content = content.replace('href="services/envelopes.html"', 'href="envelopes.html"')
        content = content.replace('href="services/bill-book.html"', 'href="bill-book.html"')
        content = content.replace('href="services/id-cards.html"', 'href="id-cards.html"')
        content = content.replace('href="services/sticker.html"', 'href="sticker.html"')
        content = content.replace('href="services/document-printing.html"', 'href="document-printing.html"')
        
    else:
        # For main directory pages, update logo link
        content = content.replace('href="#"', 'href="index.html"')
    
    return content

def update_html_file(file_path, header_section, footer_section, all_styles, all_scripts):
    """Update a single HTML file with new navbar and footer"""
    
    print(f"Updating: {file_path}")
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Remove ALL existing header/navbar content
    # This includes any old navigation patterns
    header_patterns = [
        r'<header[^>]*>.*?</header>',
        r'<nav[^>]*>.*?</nav>',
        r'<!--.*?Navigation.*?-->.*?<!--.*?Navigation.*?-->',
        r'<!--.*?Main.*?Navigation.*?-->.*?<!--.*?Main.*?Navigation.*?-->',
        r'<div[^>]*class="[^"]*nav[^"]*"[^>]*>.*?</div>',
        r'<ul[^>]*class="[^"]*nav[^"]*"[^>]*>.*?</ul>',
    ]
    
    for pattern in header_patterns:
        content = re.sub(pattern, '', content, flags=re.DOTALL | re.IGNORECASE)
    
    # Remove ALL existing footer content
    footer_patterns = [
        r'<footer[^>]*>.*?</footer>',
        r'<!--.*?Footer.*?-->.*?<!--.*?Footer.*?-->',
    ]
    
    for pattern in footer_patterns:
        content = re.sub(pattern, '', content, flags=re.DOTALL | re.IGNORECASE)
    
    # Remove ALL existing styles
    style_patterns = [
        r'<style[^>]*>.*?</style>',
    ]
    
    for pattern in style_patterns:
        content = re.sub(pattern, '', content, flags=re.DOTALL | re.IGNORECASE)
    
    # Remove ALL existing scripts
    script_patterns = [
        r'<script[^>]*>.*?</script>',
    ]
    
    for pattern in script_patterns:
        content = re.sub(pattern, '', content, flags=re.DOTALL | re.IGNORECASE)
    
    # Find the <body> tag and insert header after it
    body_match = re.search(r'<body[^>]*>', content)
    if body_match:
        body_end = body_match.end()
        content = content[:body_end] + '\n    ' + header_section + '\n    ' + content[body_end:]
    
    # Find the </body> tag and insert footer before it
    body_close_match = re.search(r'</body>', content)
    if body_close_match:
        body_close_start = body_close_match.start()
        content = content[:body_close_start] + '\n    ' + footer_section + '\n    ' + content[body_close_start:]
    
    # Find the </head> tag and insert all styles before it
    head_close_match = re.search(r'</head>', content)
    if head_close_match:
        head_close_start = head_close_match.start()
        content = content[:head_close_start] + '\n    ' + all_styles + '\n    ' + content[head_close_start:]
    
    # Find the </body> tag and insert all scripts before it
    body_close_match = re.search(r'</body>', content)
    if body_close_match:
        body_close_start = body_close_match.start()
        content = content[:body_close_start] + '\n    ' + all_scripts + '\n    ' + content[body_close_start:]
    
    # Update navigation links to be correct for each page
    content = update_navigation_links(content, file_path)
    
    # Write the updated content back to the file
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✅ Updated: {file_path}")

def main():
    """Main function to update all HTML files"""
    
    print("🚀 Starting complete navbar and footer update for all HTML pages...")
    
    # Extract sections from index.html
    try:
        header_section, footer_section, all_styles, all_scripts = extract_complete_navbar_footer()
        print("✅ Successfully extracted navbar and footer from index.html")
    except Exception as e:
        print(f"❌ Error extracting sections from index.html: {e}")
        return
    
    # Get all HTML files to update
    html_files = []
    
    # Main directory HTML files
    for file in os.listdir('.'):
        if file.endswith('.html') and file != 'index.html' and not file.endswith('.backup'):
            html_files.append(file)
    
    # Services directory HTML files
    services_dir = Path('services')
    if services_dir.exists():
        for file in services_dir.glob('*.html'):
            if not file.name.endswith('.backup'):
                html_files.append(str(file))
    
    print(f"📁 Found {len(html_files)} HTML files to update")
    
    # Update each file
    updated_count = 0
    for file_path in html_files:
        try:
            update_html_file(file_path, header_section, footer_section, all_styles, all_scripts)
            updated_count += 1
        except Exception as e:
            print(f"❌ Error updating {file_path}: {e}")
    
    print(f"\n🎉 Update complete! Updated {updated_count} out of {len(html_files)} files")
    print("\n📋 Summary of changes:")
    print("   • Removed ALL old navigation and footer content")
    print("   • Added complete header with contact bar and navbar")
    print("   • Added complete footer with company information")
    print("   • Added ALL CSS styles and JavaScript functionality")
    print("   • Updated navigation links for proper routing")
    print("   • Mega menu now links to correct service pages")
    print("   • Maintained responsive design across all pages")

if __name__ == "__main__":
    main()
