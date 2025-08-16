#!/usr/bin/env python3
"""
Dark Mode Implementation Script for Service Pages
Automatically adds dark mode support to all service pages
"""

import os
import re
from pathlib import Path
from typing import List, Tuple

class DarkModeImplementer:
    def __init__(self):
        self.services_dir = Path("services")
        self.css_dir = Path("css")
        self.js_dir = Path("js")
        
    def get_service_files(self) -> List[Path]:
        """Get all HTML files in the services directory"""
        if not self.services_dir.exists():
            print(f"Services directory {self.services_dir} not found!")
            return []
        
        html_files = list(self.services_dir.glob("*.html"))
        print(f"Found {len(html_files)} service files")
        return html_files
    
    def backup_file(self, file_path: Path) -> Path:
        """Create a backup of the original file"""
        backup_path = file_path.with_suffix(f"{file_path.suffix}.backup")
        if not backup_path.exists():
            backup_path.write_text(file_path.read_text(encoding='utf-8'), encoding='utf-8')
            print(f"Created backup: {backup_path}")
        return backup_path
    
    def add_data_theme_attribute(self, content: str) -> str:
        """Add data-theme attribute to html tag"""
        # Check if data-theme already exists
        if 'data-theme=' in content:
            print("  - data-theme attribute already exists")
            return content
        
        # Add data-theme="light" to html tag
        html_pattern = r'<html([^>]*)>'
        
        def replace_html_tag(match):
            attributes = match.group(1)
            if 'data-theme=' not in attributes:
                if attributes.strip():
                    return f'<html{attributes} data-theme="light">'
                else:
                    return '<html lang="en" data-theme="light">'
            return match.group(0)
        
        updated_content = re.sub(html_pattern, replace_html_tag, content, flags=re.IGNORECASE)
        
        if updated_content != content:
            print("  - Added data-theme attribute to html tag")
        
        return updated_content
    
    def add_dark_mode_css(self, content: str) -> str:
        """Add dark mode CSS link to the head section"""
        # Check if dark mode CSS is already included
        if 'dark-mode.css' in content:
            print("  - Dark mode CSS already included")
            return content
        
        # Find the head section and add the CSS link
        head_pattern = r'(</head>)'
        css_link = '    <link rel="stylesheet" href="../css/dark-mode.css">\n'
        
        if re.search(head_pattern, content, re.IGNORECASE):
            updated_content = re.sub(
                head_pattern, 
                css_link + r'\1', 
                content, 
                flags=re.IGNORECASE
            )
            print("  - Added dark mode CSS link")
            return updated_content
        
        print("  - Could not find head section to add CSS")
        return content
    
    def add_dark_mode_js(self, content: str) -> str:
        """Add dark mode JavaScript to the page"""
        # Check if dark mode JS is already included
        if 'dark-mode.js' in content:
            print("  - Dark mode JS already included")
            return content
        
        # Find the closing body tag and add the script
        body_pattern = r'(</body>)'
        js_script = '    <script src="../js/dark-mode.js"></script>\n'
        
        if re.search(body_pattern, content, re.IGNORECASE):
            updated_content = re.sub(
                body_pattern, 
                js_script + r'\1', 
                content, 
                flags=re.IGNORECASE
            )
            print("  - Added dark mode JavaScript")
            return updated_content
        
        print("  - Could not find body section to add JavaScript")
        return content
    
    def ensure_theme_toggle_button(self, content: str) -> str:
        """Ensure theme toggle button exists in the navbar"""
        # Check if theme toggle button already exists
        if 'btn-theme-toggle' in content or 'themeToggle' in content:
            print("  - Theme toggle button already exists")
            return content
        
        # Look for navbar actions section
        navbar_actions_pattern = r'(<div class="navbar-actions"[^>]*>)(.*?)(</div>)'
        
        def add_theme_toggle(match):
            opening_tag = match.group(1)
            content_inside = match.group(2)
            closing_tag = match.group(3)
            
            # Theme toggle button HTML
            theme_button = '''
                        <button class="btn-theme-toggle" id="themeToggle" aria-label="Toggle dark mode"
                            title="Toggle dark mode">
                            <span class="theme-icon light-icon" aria-hidden="true">☀️</span>
                            <span class="theme-icon dark-icon" aria-hidden="true">🌙</span>
                        </button>'''
            
            return f"{opening_tag}{theme_button}{content_inside}{closing_tag}"
        
        updated_content = re.sub(
            navbar_actions_pattern, 
            add_theme_toggle, 
            content, 
            flags=re.DOTALL
        )
        
        if updated_content != content:
            print("  - Added theme toggle button to navbar")
            return updated_content
        
        # If navbar-actions doesn't exist, try to add it before the mobile toggle
        mobile_toggle_pattern = r'(<button class="navbar-toggle"[^>]*>)'
        
        def add_navbar_actions(match):
            mobile_toggle = match.group(1)
            navbar_actions = '''
                    <div class="navbar-actions">
                        <button class="btn-theme-toggle" id="themeToggle" aria-label="Toggle dark mode"
                            title="Toggle dark mode">
                            <span class="theme-icon light-icon" aria-hidden="true">☀️</span>
                            <span class="theme-icon dark-icon" aria-hidden="true">🌙</span>
                        </button>
                        <button class="btn btn-primary">Get Started</button>
                    </div>

                '''
            return f"{navbar_actions}{mobile_toggle}"
        
        final_content = re.sub(
            mobile_toggle_pattern,
            add_navbar_actions,
            updated_content,
            flags=re.DOTALL
        )
        
        if final_content != updated_content:
            print("  - Added navbar-actions section with theme toggle")
        
        return final_content
    
    def add_tailwind_dark_class(self, content: str) -> str:
        """Add Tailwind CSS dark mode configuration for pages using Tailwind"""
        if 'tailwindcss.com' not in content:
            return content
        
        # Look for Tailwind config and add darkMode: 'class'
        tailwind_config_pattern = r'(tailwind\.config\s*=\s*\{)(.*?)(\}\s*;?)'
        
        def update_tailwind_config(match):
            opening = match.group(1)
            config_content = match.group(2)
            closing = match.group(3)
            
            # Check if darkMode is already configured
            if 'darkMode:' in config_content:
                return match.group(0)
            
            # Add darkMode configuration
            dark_mode_config = "\n            darkMode: 'class',"
            
            return f"{opening}{dark_mode_config}{config_content}{closing}"
        
        updated_content = re.sub(
            tailwind_config_pattern,
            update_tailwind_config,
            content,
            flags=re.DOTALL
        )
        
        if updated_content != content:
            print("  - Added Tailwind dark mode configuration")
        
        return updated_content
    
    def process_service_file(self, file_path: Path) -> bool:
        """Process a single service file to add dark mode support"""
        print(f"\nProcessing: {file_path.name}")
        
        try:
            # Read the file
            content = file_path.read_text(encoding='utf-8')
            
            # Create backup
            self.backup_file(file_path)
            
            # Apply transformations
            updated_content = content
            updated_content = self.add_data_theme_attribute(updated_content)
            updated_content = self.add_dark_mode_css(updated_content)
            updated_content = self.add_dark_mode_js(updated_content)
            updated_content = self.ensure_theme_toggle_button(updated_content)
            updated_content = self.add_tailwind_dark_class(updated_content)
            
            # Write the updated content
            if updated_content != content:
                file_path.write_text(updated_content, encoding='utf-8')
                print(f"  ✅ Updated {file_path.name}")
                return True
            else:
                print(f"  ℹ️  No changes needed for {file_path.name}")
                return False
                
        except Exception as e:
            print(f"  ❌ Error processing {file_path.name}: {e}")
            return False
    
    def update_main_pages(self):
        """Update main pages (index.html, contact.html, etc.) with dark mode support"""
        main_pages = ['index.html', 'contact.html', 'categories.html']
        
        for page in main_pages:
            page_path = Path(page)
            if page_path.exists():
                print(f"\nProcessing main page: {page}")
                
                try:
                    content = page_path.read_text(encoding='utf-8')
                    self.backup_file(page_path)
                    
                    updated_content = content
                    updated_content = self.add_data_theme_attribute(updated_content)
                    
                    # For main pages, CSS path is different
                    if 'dark-mode.css' not in updated_content:
                        head_pattern = r'(</head>)'
                        css_link = '    <link rel="stylesheet" href="css/dark-mode.css">\n'
                        updated_content = re.sub(head_pattern, css_link + r'\1', updated_content, flags=re.IGNORECASE)
                        print(f"  - Added dark mode CSS link to {page}")
                    
                    # For main pages, JS path is different
                    if 'dark-mode.js' not in updated_content:
                        body_pattern = r'(</body>)'
                        js_script = '    <script src="js/dark-mode.js"></script>\n'
                        updated_content = re.sub(body_pattern, js_script + r'\1', updated_content, flags=re.IGNORECASE)
                        print(f"  - Added dark mode JavaScript to {page}")
                    
                    updated_content = self.ensure_theme_toggle_button(updated_content)
                    updated_content = self.add_tailwind_dark_class(updated_content)
                    
                    if updated_content != content:
                        page_path.write_text(updated_content, encoding='utf-8')
                        print(f"  ✅ Updated {page}")
                    else:
                        print(f"  ℹ️  No changes needed for {page}")
                        
                except Exception as e:
                    print(f"  ❌ Error processing {page}: {e}")
    
    def run(self):
        """Run the dark mode implementation"""
        print("🌙 Dark Mode Implementation Script")
        print("=" * 40)
        
        # Check if required files exist
        dark_mode_css = self.css_dir / "dark-mode.css"
        dark_mode_js = self.js_dir / "dark-mode.js"
        
        if not dark_mode_css.exists():
            print(f"❌ Dark mode CSS file not found: {dark_mode_css}")
            return
        
        if not dark_mode_js.exists():
            print(f"❌ Dark mode JS file not found: {dark_mode_js}")
            return
        
        print(f"✅ Found dark mode CSS: {dark_mode_css}")
        print(f"✅ Found dark mode JS: {dark_mode_js}")
        
        # Process service files
        service_files = self.get_service_files()
        if not service_files:
            print("No service files found to process")
            return
        
        processed_count = 0
        updated_count = 0
        
        for file_path in service_files:
            processed_count += 1
            if self.process_service_file(file_path):
                updated_count += 1
        
        # Process main pages
        self.update_main_pages()
        
        print("\n" + "=" * 40)
        print(f"🎉 Dark Mode Implementation Complete!")
        print(f"📊 Processed: {processed_count} service files")
        print(f"✏️  Updated: {updated_count} service files")
        print("\n📝 What was added:")
        print("   • data-theme='light' attribute to HTML tags")
        print("   • Dark mode CSS link in head section")
        print("   • Dark mode JavaScript before closing body tag")
        print("   • Theme toggle button in navigation")
        print("   • Tailwind dark mode configuration (where applicable)")
        print("\n🔧 Usage:")
        print("   • Click the theme toggle button (☀️/🌙) in the navigation")
        print("   • Use keyboard shortcut: Ctrl+Shift+D")
        print("   • Theme preference is saved automatically")
        print("   • Respects system dark mode preference")

if __name__ == "__main__":
    implementer = DarkModeImplementer()
    implementer.run()