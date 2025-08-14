#!/usr/bin/env python3
"""
Script to update all service files with the main website navbar
Removes existing headers and adds the navbar from index.html
"""

import os
import re
from pathlib import Path

def extract_navbar_from_index():
    """Extract the navbar structure from index.html"""
    with open('index.html', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find the header section
    header_start = content.find('    <!-- Header -->')
    header_end = content.find('    </header>') + len('    </header>')
    
    if header_start == -1 or header_end == -1:
        raise ValueError("Could not find header section in index.html")
    
    navbar_html = content[header_start:header_end]
    
    # Update paths for service files (add ../ prefix)
    navbar_html = navbar_html.replace('href="#', 'href="../index.html#')
    navbar_html = navbar_html.replace('src="assets/', 'src="../assets/')
    navbar_html = navbar_html.replace('href="services\\', 'href="')
    navbar_html = navbar_html.replace('href="services/', 'href="')
    navbar_html = navbar_html.replace('href="#home"', 'href="../index.html#home"')
    navbar_html = navbar_html.replace('href="#services"', 'href="../index.html#services"')
    navbar_html = navbar_html.replace('href="#products"', 'href="../index.html#products"')
    navbar_html = navbar_html.replace('href="#about"', 'href="../index.html#about"')
    navbar_html = navbar_html.replace('href="#blog"', 'href="../index.html#blog"')
    navbar_html = navbar_html.replace('href="#contact"', 'href="../contact.html"')
    
    return navbar_html

def remove_existing_header(content):
    """Remove existing header from service file content"""
    # Find and remove everything from <header> to </header>
    header_pattern = r'<header.*?</header>'
    content = re.sub(header_pattern, '', content, flags=re.DOTALL)
    
    # Also remove any standalone contact bars or navbars
    contact_bar_pattern = r'<div class="contact-bar">.*?</div>\s*</div>\s*</div>'
    content = re.sub(contact_bar_pattern, '', content, flags=re.DOTALL)
    
    nav_pattern = r'<nav.*?</nav>'
    content = re.sub(nav_pattern, '', content, flags=re.DOTALL)
    
    return content

def update_service_file(filepath, navbar_html):
    """Update a single service file with the new navbar"""
    print(f"Updating {filepath}...")
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Remove existing header
    content = remove_existing_header(content)
    
    # Find the body tag and insert navbar after it
    body_match = re.search(r'(<body[^>]*>)', content)
    if not body_match:
        print(f"Warning: Could not find body tag in {filepath}")
        return
    
    body_tag = body_match.group(1)
    body_end = body_match.end()
    
    # Insert navbar after body tag
    new_content = (
        content[:body_end] + 
        '\n    <!-- Skip to Content (Accessibility) -->\n' +
        '    <a href="#main-content" class="skip-link">Skip to main content</a>\n\n' +
        navbar_html + '\n\n' +
        content[body_end:]
    )
    
    # Write updated content back to file
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print(f"✓ Updated {filepath}")

def main():
    """Main function to update all service files"""
    print("Starting navbar update process...")
    
    # Extract navbar from index.html
    try:
        navbar_html = extract_navbar_from_index()
        print("✓ Extracted navbar from index.html")
    except Exception as e:
        print(f"Error extracting navbar: {e}")
        return
    
    # Get all service files
    services_dir = Path('services')
    service_files = list(services_dir.glob('*.html'))
    
    # Exclude navbar-template.html if it exists
    service_files = [f for f in service_files if f.name != 'navbar-template.html']
    
    print(f"Found {len(service_files)} service files to update")
    
    # Update each service file
    for service_file in service_files:
        try:
            update_service_file(service_file, navbar_html)
        except Exception as e:
            print(f"Error updating {service_file}: {e}")
    
    print("\n✓ Navbar update process completed!")
    print(f"Updated {len(service_files)} service files")

if __name__ == "__main__":
    main()