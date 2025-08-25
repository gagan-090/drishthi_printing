#!/usr/bin/env python3
"""
Script to update all HTML pages with the navbar and footer from index.html
This ensures consistency across the entire website.
"""

import os
import re
import shutil
from pathlib import Path

def extract_sections_from_index():
    """Extract navbar and footer sections from index.html"""
    
    with open('index.html', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Extract header section (contact bar + navbar)
    header_start = content.find('<header class="header" role="banner">')
    header_end = content.find('</header>') + len('</header>')
    header_section = content[header_start:header_end]
    
    # Extract footer section
    footer_start = content.find('<!-- Footer -->')
    footer_end = content.find('</footer>') + len('</footer>')
    footer_section = content[footer_start:footer_end]
    
    # Extract CSS styles for navbar and footer
    style_start = content.find('<!-- Hero Section Styles -->')
    style_end = content.find('</style>', style_start) + len('</style>')
    navbar_styles = content[style_start:style_end]
    
    # Extract JavaScript for navbar
    script_start = content.find('<!-- Navbar JavaScript -->')
    script_end = content.find('</script>', script_start) + len('</script>')
    navbar_script = content[script_start:script_end]
    
    return header_section, footer_section, navbar_styles, navbar_script

def update_html_file(file_path, header_section, footer_section, navbar_styles, navbar_script):
    """Update a single HTML file with new navbar and footer"""
    
    print(f"Updating: {file_path}")
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Remove existing header/navbar if present
    # Look for common header patterns
    header_patterns = [
        r'<header[^>]*>.*?</header>',
        r'<nav[^>]*>.*?</nav>',
        r'<!--.*?Navigation.*?-->.*?<!--.*?Navigation.*?-->',
    ]
    
    for pattern in header_patterns:
        content = re.sub(pattern, '', content, flags=re.DOTALL | re.IGNORECASE)
    
    # Remove existing footer if present
    footer_patterns = [
        r'<footer[^>]*>.*?</footer>',
        r'<!--.*?Footer.*?-->.*?<!--.*?Footer.*?-->',
    ]
    
    for pattern in footer_patterns:
        content = re.sub(pattern, '', content, flags=re.DOTALL | re.IGNORECASE)
    
    # Remove existing navbar styles if present
    style_patterns = [
        r'<!--.*?Navbar.*?Styles.*?-->.*?</style>',
        r'<!--.*?Hero.*?Section.*?Styles.*?-->.*?</style>',
    ]
    
    for pattern in style_patterns:
        content = re.sub(pattern, '', content, flags=re.DOTALL | re.IGNORECASE)
    
    # Remove existing navbar JavaScript if present
    script_patterns = [
        r'<!--.*?Navbar.*?JavaScript.*?-->.*?</script>',
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
    
    # Find the </head> tag and insert navbar styles before it
    head_close_match = re.search(r'</head>', content)
    if head_close_match:
        head_close_start = head_close_match.start()
        content = content[:head_close_start] + '\n    ' + navbar_styles + '\n    ' + content[head_close_start:]
    
    # Find the </body> tag and insert navbar JavaScript before it
    body_close_match = re.search(r'</body>', content)
    if body_close_match:
        body_close_start = body_close_match.start()
        content = content[:body_close_start] + '\n    ' + navbar_script + '\n    ' + content[body_close_start:]
    
    # Update navigation links to be relative to the current file
    # If this is a service page, update the logo link
    if 'services/' in str(file_path):
        content = content.replace('href="#"', 'href="../index.html"')
        content = content.replace('href="#home"', 'href="../index.html#home"')
        content = content.replace('href="#services"', 'href="../index.html#services"')
        content = content.replace('href="#products"', 'href="../index.html#products"')
        content = content.replace('href="#about"', 'href="../index.html#about"')
        content = content.replace('href="#blog"', 'href="../index.html#blog"')
        content = content.replace('href="contact.html"', 'href="../contact.html"')
    else:
        content = content.replace('href="#"', 'href="index.html"')
    
    # Write the updated content back to the file
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✅ Updated: {file_path}")

def main():
    """Main function to update all HTML files"""
    
    print("🚀 Starting navbar and footer update for all HTML pages...")
    
    # Extract sections from index.html
    try:
        header_section, footer_section, navbar_styles, navbar_script = extract_sections_from_index()
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
            update_html_file(file_path, header_section, footer_section, navbar_styles, navbar_script)
            updated_count += 1
        except Exception as e:
            print(f"❌ Error updating {file_path}: {e}")
    
    print(f"\n🎉 Update complete! Updated {updated_count} out of {len(html_files)} files")
    print("\n📋 Summary of changes:")
    print("   • Added consistent header with contact bar and navbar")
    print("   • Added consistent footer with company information")
    print("   • Added navbar styles and JavaScript functionality")
    print("   • Updated navigation links for proper routing")
    print("   • Maintained responsive design across all pages")

if __name__ == "__main__":
    main()
