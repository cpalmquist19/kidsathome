#!/usr/bin/env python3
"""
Test the actual login process
"""

from flask_app import app
from models import UserModel, db
from werkzeug.security import check_password_hash

def test_login_process():
    with app.app_context():
        print("🔍 Testing Login Process")
        print("=" * 40)
        
        # Simulate the exact login logic from the route
        username = 'spacecadet37'
        password = input("Enter your password: ")
        
        print(f"Testing login for username: {username}")
        
        # Step 1: Find user
        user = UserModel.find_by_username(username)
        print(f"✅ User found: {user is not None}")
        
        if not user:
            print("❌ User not found!")
            return
            
        # Step 2: Check if user is active
        print(f"✅ User active: {user.is_active}")
        
        # Step 3: Check password
        password_valid = user.check_password(password)
        print(f"✅ Password valid: {password_valid}")
        
        if password_valid:
            print("🎉 Login should succeed!")
        else:
            print("❌ Login would fail - password incorrect")
            
        # Let's also test the raw password hash
        print(f"\n🔍 Debug info:")
        print(f"Password hash: {user.password_hash[:50]}...")
        print(f"Hash length: {len(user.password_hash)}")
        
        # Test with werkzeug directly
        direct_check = check_password_hash(user.password_hash, password)
        print(f"Direct werkzeug check: {direct_check}")

if __name__ == '__main__':
    test_login_process()
