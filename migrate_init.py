#!/usr/bin/env python3
"""
Migration initialization script for Kids at Home project.
This script helps set up Flask-Migrate for the first time.
"""

import os
import sys
from flask import Flask
from flask_migrate import Migrate, init, migrate, upgrade
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Create Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key')
app.config['SQLALCHEMY_DATABASE_URI'] = f"mysql+pymysql://{os.environ.get('DB_USER', 'root')}:{os.environ.get('DB_PASSWORD', '')}@{os.environ.get('DB_HOST', 'localhost')}:{os.environ.get('DB_PORT', 3306)}/{os.environ.get('DB_NAME', 'kidsathome')}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize extensions
db = SQLAlchemy(app)
migrate = Migrate(app, db)

# Import models (this will register them with SQLAlchemy)
from flask_app import UserModel, PasswordResetToken, GeneratedSystem, UserActivity

def init_migrations():
    """Initialize Flask-Migrate for the first time"""
    print("Initializing Flask-Migrate...")
    try:
        with app.app_context():
            init()
            print("✅ Migration repository initialized successfully!")
            print("📁 Created 'migrations' directory")
            return True
    except Exception as e:
        print(f"❌ Error initializing migrations: {e}")
        return False

def create_initial_migration():
    """Create the initial migration with all current models"""
    print("Creating initial migration...")
    try:
        with app.app_context():
            migrate(message="Initial migration - users, password_reset_tokens, generated_systems, user_activity")
            print("✅ Initial migration created successfully!")
            print("📄 Check the 'migrations/versions' directory for the migration file")
            return True
    except Exception as e:
        print(f"❌ Error creating initial migration: {e}")
        return False

def apply_migrations():
    """Apply all pending migrations"""
    print("Applying migrations...")
    try:
        with app.app_context():
            upgrade()
            print("✅ All migrations applied successfully!")
            return True
    except Exception as e:
        print(f"❌ Error applying migrations: {e}")
        return False

def main():
    """Main function to set up migrations"""
    print("🚀 Setting up Flask-Migrate for Kids at Home project")
    print("=" * 50)
    
    # Check if migrations directory exists
    if os.path.exists('migrations'):
        print("⚠️  Migrations directory already exists!")
        print("   If you want to reinitialize, delete the 'migrations' directory first.")
        return
    
    # Initialize migrations
    if not init_migrations():
        return
    
    # Create initial migration
    if not create_initial_migration():
        return
    
    # Apply migrations
    if not apply_migrations():
        return
    
    print("\n🎉 Migration setup complete!")
    print("\nNext steps:")
    print("1. Run 'flask db migrate -m \"Your message\"' to create new migrations")
    print("2. Run 'flask db upgrade' to apply migrations")
    print("3. Run 'flask db downgrade' to rollback migrations")
    print("4. Run 'flask db history' to see migration history")

if __name__ == '__main__':
    main()
