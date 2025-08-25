#!/usr/bin/env python3
"""
Remove all dark mode functionality from the website
"""

import os
import re
from pathlib import Path

def remove_dark_mode_from_html(file_path):
    """Remove dark mode related code from HTML files"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Remove inline theme initialization script
        theme_script_pattern = r'    <!-- Prevent theme flash.*?</script>\s*\n\s*\n    <!-- Load full theme manager -->\s*\n    <script src="(?:\.\.\/)?js\/theme-init\.js"></script>'
        content = re.sub(theme_script_pattern, '', content, flags=re.DOTALL)
        
        # Remove dark mode CSS link
        content = re.sub(r'    <link rel="stylesheet" href="(?:\.\.\/)?css\/dark-mode\.css">\s*\n', '', content)
        
        # Remove theme toggle button
        theme_button_pattern = r'                        <button class="btn-theme-toggle".*?</button>\s*\n'
        content = re.sub(theme_button_pattern, '', content, flags=re.DOTALL)
        
        # Remove dark mode script loading
        content = re.sub(r'    <script src="(?:\.\.\/)?js\/dark-mode\.js"></script>\s*\n', '', content)
        
        # Remove any data-theme attributes
        content = re.sub(r' data-theme="[^"]*"', '', content)
        
        # Remove dark class from body/html
        content = re.sub(r' class="[^"]*dark[^"]*"', lambda m: m.group(0).replace('dark', '').replace('  ', ' ').rstrip(' "') + '"' if m.group(0).replace('dark', '').strip(' "') else '', content)
        
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"✅ Cleaned: {file_path}")
            return True
        else:
            print(f"⚠️  No changes: {file_path}")
            return False
            
    except Exception as e:
        print(f"❌ Error processing {file_path}: {e}")
        return False

def remove_dark_mode_files():
    """Remove dark mode related files"""
    files_to_remove = [
        'js/dark-mode.js',
        'js/theme-init.js', 
        'css/dark-mode.css',
        'debug_theme.html',
        'implement_dark_mode.py',
        'fix_theme_flash_services.py'
    ]
    
    removed_count = 0
    for file_path in files_to_remove:
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
                print(f"🗑️  Removed: {file_path}")
                removed_count += 1
            except Exception as e:
                print(f"❌ Error removing {file_path}: {e}")
        else:
            print(f"⚠️  Not found: {file_path}")
    
    return removed_count

def main():
    """Main function to remove all dark mode functionality"""
    print("🧹 Removing dark mode from website...")
    
    # Remove dark mode files
    print("\n📁 Removing dark mode files:")
    removed_files = remove_dark_mode_files()
    
    # Clean HTML files
    print("\n📄 Cleaning HTML files:")
    html_files = []
    
    # Add main HTML files
    main_files = ['index.html', 'contact.html', 'categories.html']
    for file in main_files:
        if os.path.exists(file):
            html_files.append(file)
    
    # Add service files
    services_dir = Path('services')
    if services_dir.exists():
        html_files.extend(services_dir.glob('*.html'))
    
    cleaned_count = 0
    for html_file in html_files:
        if remove_dark_mode_from_html(html_file):
            cleaned_count += 1
    
    print(f"\n✨ Summary:")
    print(f"   - Removed {removed_files} dark mode files")
    print(f"   - Cleaned {cleaned_count} HTML files")
    print(f"   - Total files processed: {len(html_files)}")
    print("\n🎉 Dark mode completely removed from website!")

if __name__ == "__main__":
    main()