"""
User model for Kids at Home application.
Handles user authentication, registration, and profile management.
"""

from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
from . import db


class UserModel(db.Model, UserMixin):
    """
    User model for authentication and user management.
    
    Attributes:
        id (int): Primary key
        username (str): Unique username (max 50 chars)
        email (str): Unique email address (max 100 chars)
        password_hash (str): Hashed password
        is_active (bool): Whether user account is active
        created_at (datetime): Account creation timestamp
        last_login (datetime): Last login timestamp
    """
    
    __tablename__ = 'users'
    
    # Primary fields
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False, index=True)
    email = db.Column(db.String(100), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    last_login = db.Column(db.DateTime, nullable=True)
    
    # Relationships
    password_reset_tokens = db.relationship(
        'PasswordResetToken', 
        backref='user', 
        lazy=True, 
        cascade='all, delete-orphan'
    )
    generated_systems = db.relationship(
        'GeneratedSystem', 
        backref='user', 
        lazy=True, 
        cascade='all, delete-orphan'
    )
    user_activities = db.relationship(
        'UserActivity', 
        backref='user', 
        lazy=True, 
        cascade='all, delete-orphan'
    )
    
    def __repr__(self):
        return f'<User {self.username}>'
    
    def set_password(self, password):
        """
        Set password hash from plain text password.
        
        Args:
            password (str): Plain text password
        """
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        """
        Check if provided password matches the stored hash.
        
        Args:
            password (str): Plain text password to check
            
        Returns:
            bool: True if password matches, False otherwise
        """
        return check_password_hash(self.password_hash, password)
    
    def get_id(self):
        """
        Get user ID as string (required by Flask-Login).
        
        Returns:
            str: User ID as string
        """
        return str(self.id)
    
    def update_last_login(self):
        """Update the last login timestamp to current time."""
        self.last_login = datetime.utcnow()
    
    def to_dict(self):
        """
        Convert user object to dictionary (excluding sensitive data).
        
        Returns:
            dict: User data without password hash
        """
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_login': self.last_login.isoformat() if self.last_login else None
        }
    
    @classmethod
    def find_by_username(cls, username):
        """
        Find user by username.
        
        Args:
            username (str): Username to search for
            
        Returns:
            UserModel or None: User if found, None otherwise
        """
        return cls.query.filter_by(username=username, is_active=True).first()
    
    @classmethod
    def find_by_email(cls, email):
        """
        Find user by email.
        
        Args:
            email (str): Email to search for
            
        Returns:
            UserModel or None: User if found, None otherwise
        """
        return cls.query.filter_by(email=email, is_active=True).first()
    
    @classmethod
    def create_user(cls, username, email, password):
        """
        Create a new user with hashed password.
        
        Args:
            username (str): Username
            email (str): Email address
            password (str): Plain text password
            
        Returns:
            UserModel: New user instance
        """
        user = cls(username=username, email=email)
        user.set_password(password)
        return user
    
    @classmethod
    def is_username_taken(cls, username):
        """
        Check if username is already taken.
        
        Args:
            username (str): Username to check
            
        Returns:
            bool: True if username is taken, False otherwise
        """
        return cls.query.filter_by(username=username).first() is not None
    
    @classmethod
    def is_email_taken(cls, email):
        """
        Check if email is already taken.
        
        Args:
            email (str): Email to check
            
        Returns:
            bool: True if email is taken, False otherwise
        """
        return cls.query.filter_by(email=email).first() is not None
