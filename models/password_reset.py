"""
Password reset token model for Kids at Home application.
Handles password reset functionality with secure tokens.
"""

from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta
from . import db


class PasswordResetToken(db.Model):
    """
    Password reset token model for secure password reset functionality.
    
    Attributes:
        id (int): Primary key
        user_id (int): Foreign key to users table
        token (str): Unique reset token
        expires_at (datetime): Token expiration timestamp
        used (bool): Whether token has been used
        created_at (datetime): Token creation timestamp
    """
    
    __tablename__ = 'password_reset_tokens'
    
    # Primary fields
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    token = db.Column(db.String(255), unique=True, nullable=False, index=True)
    expires_at = db.Column(db.DateTime, nullable=False, index=True)
    used = db.Column(db.Boolean, default=False, nullable=False)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    
    def __repr__(self):
        return f'<PasswordResetToken {self.token[:8]}...>'
    
    def is_valid(self):
        """
        Check if token is valid (not used and not expired).
        
        Returns:
            bool: True if token is valid, False otherwise
        """
        return not self.used and self.expires_at > datetime.utcnow()
    
    def is_expired(self):
        """
        Check if token has expired.
        
        Returns:
            bool: True if token is expired, False otherwise
        """
        return self.expires_at <= datetime.utcnow()
    
    def mark_as_used(self):
        """Mark token as used."""
        self.used = True
    
    @classmethod
    def create_token(cls, user_id, token, expires_in_hours=1):
        """
        Create a new password reset token.
        
        Args:
            user_id (int): ID of user requesting password reset
            token (str): Secure token string
            expires_in_hours (int): Hours until token expires (default: 1)
            
        Returns:
            PasswordResetToken: New token instance
        """
        expires_at = datetime.utcnow() + timedelta(hours=expires_in_hours)
        return cls(
            user_id=user_id,
            token=token,
            expires_at=expires_at
        )
    
    @classmethod
    def find_valid_token(cls, token):
        """
        Find a valid (unused and not expired) token.
        
        Args:
            token (str): Token to search for
            
        Returns:
            PasswordResetToken or None: Valid token if found, None otherwise
        """
        return cls.query.filter_by(
            token=token,
            used=False
        ).filter(cls.expires_at > datetime.utcnow()).first()
    
    @classmethod
    def cleanup_expired_tokens(cls):
        """
        Remove expired tokens from database.
        This can be run as a periodic cleanup task.
        
        Returns:
            int: Number of tokens removed
        """
        expired_tokens = cls.query.filter(cls.expires_at <= datetime.utcnow()).all()
        count = len(expired_tokens)
        
        for token in expired_tokens:
            db.session.delete(token)
        
        db.session.commit()
        return count
    
    def to_dict(self):
        """
        Convert token object to dictionary (excluding sensitive data).
        
        Returns:
            dict: Token data without the actual token value
        """
        return {
            'id': self.id,
            'user_id': self.user_id,
            'expires_at': self.expires_at.isoformat() if self.expires_at else None,
            'used': self.used,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'is_valid': self.is_valid(),
            'is_expired': self.is_expired()
        }
