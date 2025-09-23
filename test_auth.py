#!/usr/bin/env python3
"""
Test script for authentication system
"""

from flask_app import app
from models import UserModel, db

def test_authentication():
    with app.app_context():
        print("🔍 Testing Authentication System")
        print("=" * 40)
        
        # Test user lookup
        username = 'spacecadet37'
        user = UserModel.find_by_username(username)
        
        print(f"✅ User found: {user is not None}")
        if user:
            print(f"✅ User active: {user.is_active}")
            print(f"✅ User class: {type(user)}")
            print(f"✅ Has check_password method: {hasattr(user, 'check_password')}")
            print(f"✅ Password hash length: {len(user.password_hash) if user.password_hash else 0}")
            
            # Test with wrong password
            wrong_result = user.check_password('wrongpassword')
            print(f"✅ Wrong password test: {wrong_result}")
            
            # Test the exact login logic
            print("\n🔍 Testing login logic:")
            if user and user.check_password('wrongpassword'):
                print("❌ This should be False")
            else:
                print("✅ Login logic working correctly")
                
        else:
            print("❌ User not found!")

if __name__ == '__main__':
    test_authentication()
