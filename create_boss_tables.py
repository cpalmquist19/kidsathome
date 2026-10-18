#!/usr/bin/env python3
"""
Script to create all boss creator tables in the database.
Run this script to initialize the database with all the new models.
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import Flask app and models
from flask_app import app, db, get_monsters_database_uri
from models import (Boss, Spell, Attack, Modifier, Item, 
                    boss_spells, boss_attacks, boss_modifiers, boss_items)

def create_tables():
    """Create all database tables in the monsters database"""
    try:
        print("=" * 60)
        print("Creating Boss Creator Database Tables")
        print("=" * 60)
        
        # Get monsters database info
        monsters_uri = get_monsters_database_uri()
        db_name = monsters_uri.split('/')[-1] if '/' in monsters_uri else 'unknown'
        print(f"Monsters Database URI: {monsters_uri.split('@')[-1] if '@' in monsters_uri else monsters_uri}")
        print(f"Target database name: {db_name}")
        print()
        
        # Check if database exists first
        print("Checking database connection...")
        with app.app_context():
            try:
                # Try to connect to the database
                monsters_engine = db.get_engine(bind_key='monsters')
                # Test connection by executing a simple query
                with monsters_engine.connect() as conn:
                    result = conn.execute(db.text("SELECT DATABASE()"))
                    current_db = result.scalar()
                    print(f"Connected to database: {current_db}")
            except Exception as db_error:
                error_msg = str(db_error)
                if "Unknown database" in error_msg:
                    print(f"\nERROR: Database '{db_name}' does not exist!")
                    print(f"Please create the database first:")
                    print(f"  CREATE DATABASE {db_name};")
                    print(f"\nOr update your .env file:")
                    print(f"  LOCAL_MONSTERS_DB_NAME=monsters")
                    return False
                else:
                    raise db_error
        
        print("Creating tables...")
        print("  - Spells, Attacks, Modifiers, Items in kidsathome database")
        print("  - Monsters table in monsters database")
        print()
        
        with app.app_context():
            # Create tables in kidsathome database (spells, attacks, modifiers, items)
            print("Creating tables in kidsathome database...")
            db.create_all()  # Creates tables without bind_key (default database)
            
            # Create monsters table in monsters database
            print("Creating monsters table in monsters database...")
            db.create_all(bind_key='monsters')  # Creates only tables with bind_key='monsters'
            
            # Verify tables in kidsathome database
            default_engine = db.engine
            inspector = db.inspect(default_engine)
            kidsathome_tables = [t for t in inspector.get_table_names() if t in ['spells', 'attacks', 'modifiers', 'items']]
            
            # Verify tables in monsters database
            monsters_engine = db.get_engine(bind_key='monsters')
            inspector = db.inspect(monsters_engine)
            monsters_tables = inspector.get_table_names()
            
            print(f"\nSuccessfully created tables:")
            if kidsathome_tables:
                print(f"  In kidsathome database ({len(kidsathome_tables)} tables):")
                for table in sorted(kidsathome_tables):
                    print(f"    - {table}")
            if monsters_tables:
                print(f"  In monsters database ({len(monsters_tables)} tables):")
                for table in sorted(monsters_tables):
                    print(f"    - {table}")
            
            print("\n" + "=" * 60)
            print("Database initialization complete!")
            print("=" * 60)
            return True
            
    except Exception as e:
        print(f"\nERROR: Error creating tables: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    # Check if database name is set correctly
    environment = os.environ.get('FLASK_ENV', 'development')
    if environment == 'production':
        db_name = os.environ.get('PRODUCTION_MONSTERS_DB_NAME', 'monsters')
        print(f"Environment: Production")
    else:
        db_name = os.environ.get('LOCAL_MONSTERS_DB_NAME', 'monsters')
        print(f"Environment: Development")
    
    print(f"Target monsters database: {db_name}")
    print()
    
    if not db_name:
        print("ERROR: Monsters database name not set!")
        print("   Set LOCAL_MONSTERS_DB_NAME=monsters for development")
        print("   Or PRODUCTION_MONSTERS_DB_NAME=monsters for production")
        sys.exit(1)
    
    success = create_tables()
    sys.exit(0 if success else 1)

