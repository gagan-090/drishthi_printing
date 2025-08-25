#!/usr/bin/env python3
"""
Simple script to fix service links in all service pages
"""

import os
import re
from pathlib import Path

def fix_service_links():
    """Fix service links in all service pages"""
    
    services_dir = Path('services')
    if not services_dir.exists():
        print("❌ Services directory not found")
        return
    
    # Get all HTML files in services directory
    service_files = list(services_dir.glob('*.html'))
    print(f"📁 Found {len(service_files)} service files to fix")
    
    fixed_count = 0
    for file_path in service_files:
        if file_path.name.endswith('.backup'):
            continue
            
        print(f"Fixing: {file_path}")
        
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Replace all href="services/ with href="
        old_content = content
        content = content.replace('href="services/', 'href="')
        
        # Also fix the main navigation links
        content = content.replace('href="#home"', 'href="../index.html#home"')
        content = content.replace('href="#services"', 'href="../index.html#services"')
        content = content.replace('href="#products"', 'href="../index.html#products"')
        content = content.replace('href="#about"', 'href="../index.html#about"')
        content = content.replace('href="#blog"', 'href="../index.html#blog"')
        content = content.replace('href="contact.html"', 'href="../contact.html"')
        content = content.replace('href="#"', 'href="../index.html"')
        
        # Write back if content changed
        if content != old_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            fixed_count += 1
            print(f"✅ Fixed: {file_path}")
        else:
            print(f"ℹ️  No changes needed: {file_path}")
    
    print(f"\n🎉 Fixed {fixed_count} service files")
    print("All service links now use relative paths correctly!")

if __name__ == "__main__":
    fix_service_links()
