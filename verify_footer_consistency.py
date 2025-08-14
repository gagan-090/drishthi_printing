#!/usr/bin/env python3
"""
Script to verify footer consistency across all service pages
"""

import os
import re
from pathlib import Path

def check_footer_consistency():
    """Check footer consistency across service pages"""
    services_dir = Path('services')
    html_files = [f for f in services_dir.glob('*.html') if f.name != 'navbar-template.html']
    
    print(f"Checking footer consistency across {len(html_files)} service pages...")
    print("=" * 60)
    
    consistent_count = 0
    issues = []
    
    for html_file in html_files:
        try:
            with open(html_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Check for standardized footer
            has_footer_class = 'class="footer"' in content
            has_footer_content = 'footer-content' in content
            has_footer_sections = content.count('footer-section') >= 4
            has_proper_links = '../css/style.css' in content
            has_logo_link = '../assets/images/logo.svg' in content
            
            status = "✅ CONSISTENT"
            file_issues = []
            
            if not has_footer_class:
                file_issues.append("Missing footer class")
            if not has_footer_content:
                file_issues.append("Missing footer-content structure")
            if not has_footer_sections:
                file_issues.append("Insufficient footer sections")
            if not has_proper_links:
                file_issues.append("Missing CSS link")
            if not has_logo_link:
                file_issues.append("Missing logo link")
            
            if file_issues:
                status = "❌ ISSUES"
                issues.append(f"{html_file.name}: {', '.join(file_issues)}")
            else:
                consistent_count += 1
            
            print(f"{status} - {html_file.name}")
            
        except Exception as e:
            print(f"❌ ERROR - {html_file.name}: {str(e)}")
            issues.append(f"{html_file.name}: Read error")
    
    print("=" * 60)
    print(f"✅ Consistent pages: {consistent_count}/{len(html_files)}")
    
    if issues:
        print(f"\n❌ Issues found in {len(issues)} pages:")
        for issue in issues:
            print(f"  - {issue}")
    else:
        print("\n🎉 All service pages have consistent footer implementation!")
    
    return len(issues) == 0

def check_css_footer_styles():
    """Check if footer CSS styles are properly defined"""
    css_file = Path('css/style.css')
    
    print("\nChecking footer CSS styles...")
    print("-" * 40)
    
    try:
        with open(css_file, 'r', encoding='utf-8') as f:
            css_content = f.read()
        
        required_styles = [
            '.footer {',
            '.footer-content {',
            '.footer-section {',
            '.footer-brand {',
            '.footer-logo {',
            '.footer-title {',
            '.footer-links {',
            '.footer-contact {',
            '.footer-bottom {',
            '.social-links {'
        ]
        
        missing_styles = []
        for style in required_styles:
            if style not in css_content:
                missing_styles.append(style)
        
        if missing_styles:
            print("❌ Missing CSS styles:")
            for style in missing_styles:
                print(f"  - {style}")
            return False
        else:
            print("✅ All required footer CSS styles are present")
            return True
            
    except Exception as e:
        print(f"❌ Error reading CSS file: {str(e)}")
        return False

def main():
    """Main verification function"""
    print("🔍 Footer Consistency Verification")
    print("=" * 60)
    
    footer_consistent = check_footer_consistency()
    css_styles_ok = check_css_footer_styles()
    
    print("\n" + "=" * 60)
    if footer_consistent and css_styles_ok:
        print("🎉 SUCCESS: All footer implementations are consistent!")
    else:
        print("⚠️  Some issues were found. Please review the output above.")

if __name__ == "__main__":
    main()