#!/usr/bin/env python3
"""
Script to update all service pages with slim footer (without contact section)
"""

import os
import re
from pathlib import Path

def read_slim_footer_template():
    """Read the slim footer template"""
    with open('services/footer-template-slim.html', 'r', encoding='utf-8') as f:
        return f.read()

def update_service_footer_slim(file_path, footer_template):
    """Update footer in a service page with slim version"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Different footer patterns to match
        footer_patterns = [
            # Pattern 1: Enhanced Footer Section
            r'<!-- Enhanced Footer Section -->.*?</footer>',
            # Pattern 2: Slim Footer Section
            r'<!-- Slim Footer Section -->.*?</footer>',
            # Pattern 3: Any footer with class="footer"
            r'<footer class="footer"[^>]*>.*?</footer>',
            # Pattern 4: Any footer tag
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
        
        # Write updated content
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"✅ Updated: {file_path}")
        return True
        
    except Exception as e:
        print(f"❌ Error updating {file_path}: {str(e)}")
        return False

def main():
    """Main function to update all service pages with slim footer"""
    services_dir = Path('services')
    footer_template = read_slim_footer_template()
    
    # Get all HTML files in services directory (except templates)
    html_files = [f for f in services_dir.glob('*.html') 
                  if f.name not in ['footer-template.html', 'footer-template-slim.html', 'navbar-template.html']]
    
    print(f"Updating {len(html_files)} service pages with slim footer...")
    print("-" * 60)
    
    updated_count = 0
    for html_file in html_files:
        if update_service_footer_slim(html_file, footer_template):
            updated_count += 1
    
    print("-" * 60)
    print(f"✅ Successfully updated {updated_count}/{len(html_files)} service pages")
    
    # Clean up template file
    try:
        os.remove('services/footer-template-slim.html')
        print("🧹 Cleaned up template file")
    except:
        pass

if __name__ == "__main__":
    main()