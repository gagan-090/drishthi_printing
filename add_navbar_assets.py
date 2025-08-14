#!/usr/bin/env python3
"""
Script to add the proper CSS and JS files to all service files for navbar functionality
"""

import os
import glob
import re

def add_navbar_assets_to_file(filepath):
    """Add navbar CSS and JS to a service file"""
    print(f"Processing {filepath}...")
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check if already has the main CSS
    if '../css/style.css' in content:
        print(f"  ✓ {filepath} already has main CSS")
        return
    
    # Add CSS link in head section
    css_link = '''    <!-- Main Site Styles -->
    <link rel="stylesheet" href="../css/style.css">'''
    
    # Find the head closing tag and add CSS before it
    head_close_pattern = r'</head>'
    if re.search(head_close_pattern, content):
        content = re.sub(head_close_pattern, f'{css_link}\n</head>', content)
        print(f"  ✓ Added CSS to {filepath}")
    else:
        print(f"  ⚠ Could not find </head> in {filepath}")
        return
    
    # Add JavaScript before closing body tag
    js_script = '''    <!-- Main Site Scripts -->
    <script defer src="../js/script.js"></script>'''
    
    # Find the body closing tag and add JS before it
    body_close_pattern = r'</body>'
    if re.search(body_close_pattern, content):
        content = re.sub(body_close_pattern, f'{js_script}\n</body>', content)
        print(f"  ✓ Added JS to {filepath}")
    else:
        print(f"  ⚠ Could not find </body> in {filepath}")
        return
    
    # Write updated content back to file
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"  ✅ Successfully updated {filepath}")

def main():
    """Main function to add navbar assets to all service files"""
    print("Adding navbar CSS and JS to all service files...")
    print("=" * 60)
    
    # Get all HTML files in services directory
    service_files = glob.glob('services/*.html')
    service_files = [f for f in service_files if 'navbar-template' not in f]
    
    print(f"Found {len(service_files)} service files to update")
    print()
    
    # Process each service file
    for service_file in service_files:
        try:
            add_navbar_assets_to_file(service_file)
        except Exception as e:
            print(f"  ❌ Error processing {service_file}: {e}")
        print()
    
    print("=" * 60)
    print("✅ Navbar assets addition completed!")

if __name__ == "__main__":
    main()