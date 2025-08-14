#!/usr/bin/env python3
"""
Script to check which service files have been updated with the new navbar
"""

import os
import glob

def check_navbar_status():
    """Check the navbar status of all service files"""
    # Get all HTML files in services directory
    service_files = glob.glob('services/*.html')
    service_files = [f for f in service_files if 'navbar-template' not in f]
    
    print('Checking navbar status in service files:')
    print('=' * 60)
    
    updated_files = []
    needs_update = []
    
    for file_path in service_files:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            has_new_navbar = 'header class="header"' in content
            has_contact_bar = 'contact-bar' in content
            has_old_navbar = ('nav class="bg-white shadow-lg' in content or 
                            'nav class="fixed top-0' in content or
                            'PrintCraft' in content)
            
            if has_new_navbar and has_contact_bar:
                status = '✓ Updated'
                updated_files.append(file_path)
            elif has_old_navbar:
                status = '⚠ Needs Update'
                needs_update.append(file_path)
            else:
                status = '? Unknown'
                needs_update.append(file_path)
            
            print(f'{os.path.basename(file_path):35} - {status}')
            
        except Exception as e:
            print(f'{os.path.basename(file_path):35} - Error: {e}')
    
    print('\n' + '=' * 60)
    print(f'Summary:')
    print(f'Updated files: {len(updated_files)}')
    print(f'Files needing update: {len(needs_update)}')
    
    if needs_update:
        print(f'\nFiles that need manual update:')
        for file_path in needs_update:
            print(f'  - {os.path.basename(file_path)}')

if __name__ == "__main__":
    check_navbar_status()