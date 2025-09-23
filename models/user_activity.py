"""
User activity model for Kids at Home application.
Tracks user interactions and page visits.
"""

from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta
from . import db


class UserActivity(db.Model):
    """
    User activity model for tracking user interactions and page visits.
    
    Attributes:
        id (int): Primary key
        user_id (int): Foreign key to users table (optional)
        session_id (str): Session identifier
        page_visited (str): Page or route visited
        visit_time (datetime): Visit timestamp
        ip_address (str): IP address of the user
    """
    
    __tablename__ = 'user_activity'
    
    # Primary fields
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True, index=True)
    session_id = db.Column(db.String(255), nullable=True, index=True)
    page_visited = db.Column(db.String(255), nullable=True, index=True)
    ip_address = db.Column(db.String(45), nullable=True)
    
    # Timestamps
    visit_time = db.Column(db.DateTime, default=datetime.utcnow, nullable=False, index=True)
    
    def __repr__(self):
        return f'<UserActivity {self.page_visited} at {self.visit_time}>'
    
    @classmethod
    def log_activity(cls, page_visited, user_id=None, session_id=None, ip_address=None):
        """
        Log a new user activity.
        
        Args:
            page_visited (str): Page or route visited
            user_id (int, optional): ID of logged-in user
            session_id (str, optional): Session identifier
            ip_address (str, optional): User's IP address
            
        Returns:
            UserActivity: New activity record
        """
        activity = cls(
            user_id=user_id,
            session_id=session_id,
            page_visited=page_visited,
            ip_address=ip_address
        )
        db.session.add(activity)
        db.session.commit()
        return activity
    
    @classmethod
    def get_user_activity(cls, user_id, limit=50):
        """
        Get activity for a specific user.
        
        Args:
            user_id (int): User ID
            limit (int): Maximum number of activities to return
            
        Returns:
            list: List of UserActivity objects
        """
        return cls.query.filter_by(user_id=user_id)\
                       .order_by(cls.visit_time.desc())\
                       .limit(limit).all()
    
    @classmethod
    def get_recent_activity(cls, hours=24, limit=100):
        """
        Get recent activity across all users.
        
        Args:
            hours (int): Hours to look back
            limit (int): Maximum number of activities to return
            
        Returns:
            list: List of UserActivity objects
        """
        since = datetime.utcnow() - timedelta(hours=hours)
        return cls.query.filter(cls.visit_time >= since)\
                       .order_by(cls.visit_time.desc())\
                       .limit(limit).all()
    
    @classmethod
    def get_page_stats(cls, hours=24):
        """
        Get statistics about page visits.
        
        Args:
            hours (int): Hours to look back
            
        Returns:
            dict: Page visit statistics
        """
        since = datetime.utcnow() - timedelta(hours=hours)
        
        # Get page visit counts
        page_counts = db.session.query(
            cls.page_visited,
            db.func.count(cls.id).label('count')
        ).filter(
            cls.visit_time >= since,
            cls.page_visited.isnot(None)
        ).group_by(cls.page_visited).all()
        
        # Get unique visitors
        unique_visitors = db.session.query(
            db.func.count(db.func.distinct(cls.user_id))
        ).filter(
            cls.visit_time >= since,
            cls.user_id.isnot(None)
        ).scalar() or 0
        
        # Get total visits
        total_visits = cls.query.filter(cls.visit_time >= since).count()
        
        return {
            'page_counts': dict(page_counts),
            'unique_visitors': unique_visitors,
            'total_visits': total_visits,
            'time_period_hours': hours
        }
    
    @classmethod
    def cleanup_old_activity(cls, days=30):
        """
        Remove old activity records to keep database size manageable.
        
        Args:
            days (int): Days of activity to keep
            
        Returns:
            int: Number of records removed
        """
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        old_activities = cls.query.filter(cls.visit_time < cutoff_date).all()
        count = len(old_activities)
        
        for activity in old_activities:
            db.session.delete(activity)
        
        db.session.commit()
        return count
    
    def to_dict(self):
        """
        Convert activity object to dictionary.
        
        Returns:
            dict: Activity data
        """
        return {
            'id': self.id,
            'user_id': self.user_id,
            'session_id': self.session_id,
            'page_visited': self.page_visited,
            'ip_address': self.ip_address,
            'visit_time': self.visit_time.isoformat() if self.visit_time else None
        }
