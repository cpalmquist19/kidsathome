"""
Models package for Kids at Home application.
This module initializes the database and imports all models.
"""

from flask_sqlalchemy import SQLAlchemy

# Initialize SQLAlchemy instance
# This will be imported by the main Flask app
db = SQLAlchemy()

# Import all models to register them with SQLAlchemy
from .user import UserModel
from .password_reset import PasswordResetToken
from .generated_system import GeneratedSystem
from .user_activity import UserActivity
from .user_space_stats import UserSpaceStats
from .boss import Boss

# List of all models for easy access
__all__ = [
    'db',
    'UserModel',
    'PasswordResetToken', 
    'GeneratedSystem',
    'UserActivity',
    'UserSpaceStats',
    'Boss'
]

def init_db(app):
    """
    Initialize the database with the Flask app.
    
    Args:
        app: Flask application instance
    """
    db.init_app(app)
    
    # Create all tables
    with app.app_context():
        # db.create_all()
        print("✅ Database models initialized successfully")

def get_all_models():
    """
    Get a list of all model classes.
    
    Returns:
        list: List of model classes
    """
    return [
        UserModel,
        PasswordResetToken,
        GeneratedSystem,
        UserActivity,
        UserSpaceStats,
        Boss
    ]
