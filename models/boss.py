"""
Boss model for Kids at Home application.
Handles boss battle data and statistics.
"""

from datetime import datetime
from . import db


class Boss(db.Model):
    """
    Boss model for boss battle system.
    
    Attributes:
        id (int): Primary key
        name (str): Boss name
        title (str): Boss title/description
        max_health (int): Maximum health points
        current_health (int): Current health points
        total_damage_taken (int): Total damage taken across all battles
        rounds_fought (int): Total number of battle rounds
        total_participants (int): Total number of unique participants
        is_active (bool): Whether boss is currently active
        created_at (datetime): Boss creation timestamp
        last_battle (datetime): Last battle timestamp
    """
    
    __tablename__ = 'bosses'
    
    # Primary fields
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    title = db.Column(db.String(200), nullable=False)
    
    # Health and battle stats
    max_health = db.Column(db.Integer, nullable=False, default=1000000)
    current_health = db.Column(db.Integer, nullable=False, default=1000000)
    total_damage_taken = db.Column(db.Integer, default=0, nullable=False)
    rounds_fought = db.Column(db.Integer, default=0, nullable=False)
    total_participants = db.Column(db.Integer, default=0, nullable=False)
    
    # Status
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    last_battle = db.Column(db.DateTime, nullable=True)
    
    def __repr__(self):
        return f'<Boss {self.name}>'
    
    def to_dict(self):
        """
        Convert boss object to dictionary.
        
        Returns:
            dict: Boss data
        """
        return {
            'id': self.id,
            'name': self.name,
            'title': self.title,
            'max_health': self.max_health,
            'current_health': self.current_health,
            'total_damage_taken': self.total_damage_taken,
            'rounds_fought': self.rounds_fought,
            'total_participants': self.total_participants,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_battle': self.last_battle.isoformat() if self.last_battle else None,
            'health_percentage': self.get_health_percentage()
        }
    
    def get_health_percentage(self):
        """
        Get current health as percentage of max health.
        
        Returns:
            float: Health percentage (0-100)
        """
        if self.max_health == 0:
            return 0
        return (self.current_health / self.max_health) * 100
    
    def take_damage(self, damage):
        """
        Apply damage to the boss.
        
        Args:
            damage (int): Amount of damage to apply
            
        Returns:
            bool: True if boss is defeated, False otherwise
        """
        self.current_health = max(0, self.current_health - damage)
        # Note: total_damage_taken is managed separately as a global stat
        self.last_battle = datetime.utcnow()
        
        # Check if boss is defeated
        if self.current_health <= 0:
            self.is_active = False
            return True
        return False
    
    def reset_boss(self):
        """Reset boss to full health and active status."""
        self.current_health = self.max_health
        self.is_active = True
        self.last_battle = datetime.utcnow()
    
    def add_participant(self):
        """Increment participant count."""
        self.total_participants += 1
    
    def increment_rounds(self):
        """Increment rounds fought count."""
        self.rounds_fought += 1
    
    def add_total_damage(self, damage):
        """Add damage to total damage taken (for global stat management)."""
        self.total_damage_taken += damage
    
    @classmethod
    def get_active_boss(cls):
        """
        Get the currently active boss.
        
        Returns:
            Boss or None: Active boss if found, None otherwise
        """
        return cls.query.filter_by(is_active=True).first()
    
    @classmethod
    def create_cosmic_leviathan(cls):
        """
        Create the Cosmic Leviathan boss with default stats.
        
        Returns:
            Boss: New Cosmic Leviathan boss instance
        """
        return cls(
            name="The Cosmic Leviathan",
            title="Ancient Destroyer of Worlds",
            max_health=1000000,
            current_health=1000000,
            is_active=True
        )
    
    @classmethod
    def get_boss_stats(cls):
        """
        Get global boss battle statistics.
        
        Returns:
            dict: Global boss battle stats
        """
        active_boss = cls.get_active_boss()
        if not active_boss:
            return {
                'total_participants': 0,
                'global_damage': 0,
                'rounds_fought': 0,
                'boss_health': 0,
                'boss_health_percentage': 0
            }
        
        return {
            'total_participants': active_boss.total_participants,
            'global_damage': active_boss.total_damage_taken,
            'rounds_fought': active_boss.rounds_fought,
            'boss_health': active_boss.current_health,
            'boss_health_percentage': active_boss.get_health_percentage()
        }
