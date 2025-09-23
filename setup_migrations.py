#!/usr/bin/env python3
"""
Simple setup script for Flask-Migrate
Run this after installing the new requirements
"""

import subprocess
import sys
import os

def run_command(command, description):
    """Run a command and handle errors"""
    print(f"🔄 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Error {description}: {e.stderr}")
        return False

def main():
    print("🚀 Setting up Flask-Migrate for Kids at Home")
    print("=" * 50)
    
    # Check if we're in the right directory
    if not os.path.exists('flask_app.py'):
        print("❌ Please run this script from the project root directory")
        sys.exit(1)
    
    # Install new requirements
    if not run_command("pip install -r requirements.txt", "Installing requirements"):
        print("❌ Failed to install requirements. Please check your Python environment.")
        sys.exit(1)
    
    # Initialize migrations if they don't exist
    if not os.path.exists('migrations'):
        print("\n📁 Initializing migrations...")
        if not run_command("flask db init", "Initializing migration repository"):
            print("❌ Failed to initialize migrations")
            sys.exit(1)
    
    # Create initial migration
    print("\n📄 Creating initial migration...")
    if not run_command("flask db migrate -m \"Initial migration - users, password_reset_tokens, generated_systems, user_activity\"", "Creating initial migration"):
        print("❌ Failed to create initial migration")
        sys.exit(1)
    
    # Apply migrations
    print("\n⬆️  Applying migrations...")
    if not run_command("flask db upgrade", "Applying migrations"):
        print("❌ Failed to apply migrations")
        sys.exit(1)
    
    print("\n🎉 Migration setup complete!")
    print("\nYour database now has proper migration support.")
    print("\nNext time you make schema changes:")
    print("1. flask db migrate -m \"Your description\"")
    print("2. flask db upgrade")
    print("\nTo rollback: flask db downgrade")
    print("To see history: flask db history")

if __name__ == '__main__':
    main()
