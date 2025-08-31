#!/usr/bin/env python3
"""
Translation Usage Analyzer
Finds unused translation keys in messages/en.json and messages/tr.json
"""

import json
import os
import re
import subprocess
from pathlib import Path

def flatten_dict(d, parent_key='', sep='.'):
    """
    Flatten a nested dictionary into dot-separated keys
    e.g., {"nav": {"home": "Home"}} -> {"nav.home": "Home"}
    """
    items = []
    for k, v in d.items():
        new_key = f"{parent_key}{sep}{k}" if parent_key else k
        if isinstance(v, dict):
            items.extend(flatten_dict(v, new_key, sep=sep).items())
        else:
            items.append((new_key, v))
    return dict(items)

def extract_translation_keys_from_json(file_path):
    """Extract all translation keys from a JSON file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        return set(flatten_dict(data).keys())
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
        return set()

def search_translation_usage_in_files(src_dir):
    """Search for translation key usage in TypeScript/JavaScript files"""
    used_keys = set()
    
    # Try ripgrep first, fall back to find/grep if not available
    ripgrep_available = False
    try:
        subprocess.run(['rg', '--version'], capture_output=True, check=True)
        ripgrep_available = True
    except (FileNotFoundError, subprocess.CalledProcessError):
        pass
    
    if ripgrep_available:
        print("  Using ripgrep for fast search...")
        try:
            # Search for t('key') and t("key") patterns
            result = subprocess.run([
                'rg', '-r', '$1', r't\([\'"]([^\'"]+)[\'"]\)', '--no-heading', '--no-filename', '-o', src_dir
            ], capture_output=True, text=True)
            
            if result.returncode == 0:
                for line in result.stdout.strip().split('\n'):
                    if line.strip():
                        used_keys.add(line.strip())
                        
            # Search for t('key', {params}) patterns  
            result = subprocess.run([
                'rg', '-r', '$1', r't\([\'"]([^\'"]+)[\'"]\s*,', '--no-heading', '--no-filename', '-o', src_dir
            ], capture_output=True, text=True)
            
            if result.returncode == 0:
                for line in result.stdout.strip().split('\n'):
                    if line.strip():
                        used_keys.add(line.strip())
        except Exception as e:
            print(f"  Ripgrep search failed: {e}")
            ripgrep_available = False
    
    if not ripgrep_available:
        # Fallback to find/grep
        print("  Using find/grep fallback...")
        try:
            result = subprocess.run([
                'find', src_dir, '-name', '*.tsx', '-o', '-name', '*.ts', '-o', '-name', '*.js', '-o', '-name', '*.jsx'
            ], capture_output=True, text=True, check=True)
            
            files = [f for f in result.stdout.strip().split('\n') if f and not f.endswith('.d.ts')]
            print(f"  Found {len(files)} files to analyze...")
            
            for file_path in files:
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    # More precise regex patterns for translation functions
                    patterns = [
                        r'(?<!\w)t\([\'"]([a-zA-Z][a-zA-Z0-9._-]*)[\'"][\),]',  # t('key') or t('key',
                        r'(?<!\w)t\([\'"]([a-zA-Z][a-zA-Z0-9._-]*)[\'"]$',      # t('key' at end of line
                    ]
                    
                    for pattern in patterns:
                        matches = re.findall(pattern, content)
                        for match in matches:
                            if match and match.strip():
                                used_keys.add(match.strip())
                    
                except Exception as e:
                    print(f"    Error reading {file_path}: {e}")
                    
        except subprocess.CalledProcessError as e:
            print(f"  Find command failed: {e}")
    
    return used_keys

def main():
    # Get the directory of this script
    script_dir = Path(__file__).parent
    
    # Paths to translation files
    en_file = script_dir / "messages" / "en.json"
    tr_file = script_dir / "messages" / "tr.json"
    src_dir = str(script_dir / "src")
    
    print("🔍 Analyzing translation usage...")
    print(f"📁 Source directory: {src_dir}")
    print(f"📄 English translations: {en_file}")
    print(f"📄 Turkish translations: {tr_file}")
    print()
    
    # Extract all translation keys from JSON files
    print("📋 Extracting translation keys from JSON files...")
    en_keys = extract_translation_keys_from_json(en_file)
    tr_keys = extract_translation_keys_from_json(tr_file)
    
    print(f"   English keys: {len(en_keys)}")
    print(f"   Turkish keys: {len(tr_keys)}")
    
    # Find keys that exist in one file but not the other
    en_only = en_keys - tr_keys
    tr_only = tr_keys - en_keys
    all_keys = en_keys | tr_keys
    
    if en_only:
        print(f"   ⚠️  Keys only in English: {len(en_only)}")
    if tr_only:
        print(f"   ⚠️  Keys only in Turkish: {len(tr_only)}")
    
    print(f"   📊 Total unique keys: {len(all_keys)}")
    print()
    
    # Search for translation usage in source files
    print("🔍 Searching for translation usage in source files...")
    used_keys = search_translation_usage_in_files(src_dir)
    print(f"   Found {len(used_keys)} used translation keys")
    print()
    
    # Find unused keys
    unused_keys = all_keys - used_keys
    
    # Results
    print("📊 ANALYSIS RESULTS")
    print("=" * 50)
    print(f"Total translation keys defined: {len(all_keys)}")
    print(f"Translation keys used in code:  {len(used_keys)}")
    print(f"Unused translation keys:        {len(unused_keys)}")
    print(f"Usage rate:                     {(len(used_keys) / len(all_keys) * 100):.1f}%")
    print()
    
    # Save detailed results to file
    report_file = script_dir / "translation_analysis_report.txt"
    with open(report_file, 'w', encoding='utf-8') as f:
        f.write("TRANSLATION USAGE ANALYSIS REPORT\n")
        f.write("=" * 50 + "\n")
        f.write(f"Generated on: {Path(__file__).stat().st_mtime}\n\n")
        
        f.write(f"Total translation keys defined: {len(all_keys)}\n")
        f.write(f"Translation keys used in code:  {len(used_keys)}\n")
        f.write(f"Unused translation keys:        {len(unused_keys)}\n")
        f.write(f"Usage rate:                     {(len(used_keys) / len(all_keys) * 100):.1f}%\n\n")
        
        if en_only:
            f.write(f"Keys only in English: {len(en_only)}\n")
            for key in sorted(en_only):
                f.write(f"  [EN] [  ] {key}\n")
            f.write("\n")
            
        if tr_only:
            f.write(f"Keys only in Turkish: {len(tr_only)}\n")
            for key in sorted(tr_only):
                f.write(f"  [  ] [TR] {key}\n")
            f.write("\n")
        
        if unused_keys:
            f.write("UNUSED TRANSLATION KEYS\n")
            f.write("=" * 30 + "\n")
            sorted_unused = sorted(unused_keys)
            for key in sorted_unused:
                in_en = "EN" if key in en_keys else "  "
                in_tr = "TR" if key in tr_keys else "  "
                f.write(f"[{in_en}] [{in_tr}] {key}\n")
            f.write("\n")
        
        f.write("USED KEYS (for verification)\n")
        f.write("=" * 30 + "\n")
        for key in sorted(used_keys):
            in_en = "EN" if key in en_keys else "❌"
            in_tr = "TR" if key in tr_keys else "❌"
            f.write(f"[{in_en}] [{in_tr}] {key}\n")

    if unused_keys:
        print("🗑️  UNUSED TRANSLATION KEYS")
        print("=" * 50)
        print("These keys are defined in JSON files but never used in the codebase:")
        print()
        
        # Show first 20 unused keys
        sorted_unused = sorted(unused_keys)
        for key in sorted_unused[:20]:
            in_en = "EN" if key in en_keys else "  "
            in_tr = "TR" if key in tr_keys else "  "
            print(f"  [{in_en}] [{in_tr}] {key}")
        
        if len(unused_keys) > 20:
            print(f"  ... and {len(unused_keys) - 20} more unused keys")
            
        print()
        print(f"💡 You can safely remove these {len(unused_keys)} unused keys from your translation files.")
        print(f"📄 Full report saved to: {report_file}")
    else:
        print("✅ All translation keys are being used! No cleanup needed.")
    
    # Show some used keys for verification
    print()
    print("✅ SAMPLE USED KEYS (for verification)")
    print("=" * 50)
    sample_used = sorted(list(used_keys))[:10]
    for key in sample_used:
        in_en = "EN" if key in en_keys else "❌"
        in_tr = "TR" if key in tr_keys else "❌" 
        print(f"  [{in_en}] [{in_tr}] {key}")
    
    if len(used_keys) > 10:
        print(f"  ... and {len(used_keys) - 10} more")

if __name__ == "__main__":
    main()