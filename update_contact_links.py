#!/usr/bin/env python3
"""
Script to update all contact links from #contact to contact.html
"""

import os
import glob

def update_contact_links():
    """Update all contact links in HTML files"""
    
    # Get all HTML files in services directory
    service_files = glob.glob('services/*.html')
    
    # Also include other HTML files
    other_files = ['index.html', 'categories.html', 'test_navigation.html']
    
    all_files = service_files + other_files
    
    replacements = [
        ('href="../index.html#contact"', 'href="../contact.html"'),
        ('href="index.html#contact"', 'href="contact.html"'),
        ('href="#contact"', 'href="contact.html"'),
    ]
    
    updated_files = []
    
    for file_path in all_files:
        if os.path.exists(file_path):
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                original_content = content
                
                # Apply all replacements
                for old_link, new_link in replacements:
                    content = content.replace(old_link, new_link)
                
                # Only write if content changed
                if content != original_content:
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.write(content)
                    updated_files.append(file_path)
                    print(f"Updated: {file_path}")
                
            except Exception as e:
                print(f"Error updating {file_path}: {e}")
    
    print(f"\nTotal files updated: {len(updated_files)}")
    return updated_files

if __name__ == "__main__":
    update_contact_links()