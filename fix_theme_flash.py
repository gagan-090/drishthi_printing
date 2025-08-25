import os
import re

def fix_theme_flash_in_file(filepath):
    """Fix theme flash issue in an HTML file"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Skip if already fixed (has the inline script)
    if 'Prevent theme flash on page load' in content:
        print(f"  ✓ Already fixed: {filepath}")
        return False
    
    # Remove data-theme="light" from html tag
    content = re.sub(r'<html([^>]*)\s+data-theme="light"([^>]*)>', r'<html\1\2>', content)
    
    # Find where to insert the script
    # Look for the last stylesheet link before </head> or before <!-- Structured Data -->
    # or before the first script tag
    
    # Try to find the pattern with css/style.css or ../css/style.css
    style_pattern = r'(<link[^>]*href="[^"]*css/style\.css"[^>]*>)'
    match = re.search(style_pattern, content)
    
    if not match:
        # Try to find any stylesheet link
        style_pattern = r'(<link[^>]*rel="stylesheet"[^>]*>(?!.*<link[^>]*rel="stylesheet"))'
        match = re.search(style_pattern, content, re.DOTALL)
    
    if match:
        # Insert the script after the last stylesheet
        insert_position = match.end()
        
        # Determine the correct path prefix based on the file location
        if 'services/' in filepath or 'services\\' in filepath:
            # Service pages need ../js/dark-mode.js
            script = '''

    <!-- Prevent theme flash on page load -->
    <script>
        // This runs immediately to prevent theme flash
        (function() {
            const savedTheme = localStorage.getItem('theme-preference');
            if (savedTheme) {
                document.documentElement.setAttribute('data-theme', savedTheme);
            } else {
                // Check system preference
                const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                document.documentElement.setAttribute('data-theme', systemPrefersDark ? 'dark' : 'light');
            }
        })();
    </script>'''
        else:
            # Root pages
            script = '''

    <!-- Prevent theme flash on page load -->
    <script>
        // This runs immediately to prevent theme flash
        (function() {
            const savedTheme = localStorage.getItem('theme-preference');
            if (savedTheme) {
                document.documentElement.setAttribute('data-theme', savedTheme);
            } else {
                // Check system preference
                const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                document.documentElement.setAttribute('data-theme', systemPrefersDark ? 'dark' : 'light');
            }
        })();
    </script>'''
        
        content = content[:insert_position] + script + content[insert_position:]
        
        # Write the updated content
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"  ✓ Fixed: {filepath}")
        return True
    else:
        print(f"  ⚠ Could not find insertion point: {filepath}")
        return False

def main():
    """Fix theme flash in all HTML files"""
    print("Fixing theme flash issue in all HTML files...")
    print("=" * 50)
    
    fixed_count = 0
    skipped_count = 0
    failed_count = 0
    
    # Process root HTML files
    for filename in os.listdir('.'):
        if filename.endswith('.html') and not filename.endswith('.backup'):
            filepath = filename
            result = fix_theme_flash_in_file(filepath)
            if result:
                fixed_count += 1
            elif result is False:
                skipped_count += 1
            else:
                failed_count += 1
    
    # Process service HTML files
    services_dir = 'services'
    if os.path.exists(services_dir):
        for filename in os.listdir(services_dir):
            if filename.endswith('.html') and not filename.endswith('.backup'):
                filepath = os.path.join(services_dir, filename)
                result = fix_theme_flash_in_file(filepath)
                if result:
                    fixed_count += 1
                elif result is False:
                    skipped_count += 1
                else:
                    failed_count += 1
    
    print("=" * 50)
    print(f"Summary:")
    print(f"  Fixed: {fixed_count} files")
    print(f"  Already fixed: {skipped_count} files")
    print(f"  Failed: {failed_count} files")
    print("\nTheme flash issue has been resolved!")

if __name__ == "__main__":
    main()

