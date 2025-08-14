#!/usr/bin/env python3
"""
Script to update all service pages with standardized footer
"""

import os
import re
from pathlib import Path

def read_footer_template():
    """Read the footer template"""
    with open('services/footer-template.html', 'r', encoding='utf-8') as f:
        return f.read()

def update_service_footer(file_path, footer_template):
    """Update footer in a service page"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Different footer patterns to match
        footer_patterns = [
            # Pattern 1: Simple footer
            r'<footer class="bg-gray-900 text-white py-16">.*?</footer>',
            # Pattern 2: Enhanced footer
            r'<footer class="bg-gradient-to-br.*?</footer>',
            # Pattern 3: Main footer
            r'<footer class="main-footer">.*?</footer>',
            # Pattern 4: Footer with specific background
            r'<footer class="bg-dark text-white py-16">.*?</footer>',
            # Pattern 5: Any footer tag
            r'<footer[^>]*>.*?</footer>',
        ]
        
        # Try to find and replace existing footer
        footer_replaced = False
        for pattern in footer_patterns:
            if re.search(pattern, content, re.DOTALL | re.IGNORECASE):
                content = re.sub(pattern, footer_template, content, flags=re.DOTALL | re.IGNORECASE)
                footer_replaced = True
                break
        
        # If no footer found, add before closing body tag
        if not footer_replaced:
            if '</body>' in content:
                content = content.replace('</body>', f'{footer_template}\n\n</body>')
            else:
                content += f'\n\n{footer_template}'
        
        # Ensure proper CSS link is present
        if '../css/style.css' not in content and 'css/style.css' not in content:
            # Add CSS link in head section
            head_pattern = r'(<head[^>]*>)'
            if re.search(head_pattern, content, re.IGNORECASE):
                css_link = '\n    <link rel="stylesheet" href="../css/style.css">'
                content = re.sub(head_pattern, r'\1' + css_link, content, flags=re.IGNORECASE)
        
        # Write updated content
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"✅ Updated: {file_path}")
        return True
        
    except Exception as e:
        print(f"❌ Error updating {file_path}: {str(e)}")
        return False

def main():
    """Main function to update all service pages"""
    services_dir = Path('services')
    footer_template = read_footer_template()
    
    # Get all HTML files in services directory (except template)
    html_files = [f for f in services_dir.glob('*.html') if f.name != 'footer-template.html']
    
    print(f"Found {len(html_files)} service pages to update...")
    print("-" * 50)
    
    updated_count = 0
    for html_file in html_files:
        if update_service_footer(html_file, footer_template):
            updated_count += 1
    
    print("-" * 50)
    print(f"✅ Successfully updated {updated_count}/{len(html_files)} service pages")
    
    # Clean up template file
    try:
        os.remove('services/footer-template.html')
        print("🧹 Cleaned up template file")
    except:
        pass

if __name__ == "__main__":
    main()