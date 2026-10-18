"""
Modifier model for Boss Creator system.
Handles stat modifiers that can be applied to bosses or players.
"""

from datetime import datetime
from . import db


class Modifier(db.Model):
    """
    Modifier model for boss creation system.
    
    Attributes:
        id (int): Primary key
        name (str): Modifier name
        description (str): Modifier description
        stat_type (str): Stat being modified (speed, damage, health, etc.)
        modifier_value (float): Percentage or flat value change
        modifier_type (str): Type of modifier (percentage, flat, multiplier)
        duration (int): Duration in seconds (0 = permanent)
        stackable (bool): Whether modifier can stack
        player_effects (str): JSON string of effects applied to player
        visual_effects (str): JSON string of visual/display effects
        animation_trigger (str): Animation name to trigger
        created_by (int): User ID who created this modifier
        created_at (datetime): Creation timestamp
        updated_at (datetime): Last update timestamp
    """
    
    __tablename__ = 'modifiers'
    # Uses default kidsathome database (no bind_key)
    
    # Primary fields
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    
    # Modifier properties
    stat_type = db.Column(db.String(50), nullable=False)  # speed, damage, health, defense, etc.
    modifier_value = db.Column(db.Float, nullable=False)  # e.g., 10.0 for 10% or +10
    modifier_type = db.Column(db.String(20), default='percentage', nullable=False)  # percentage, flat, multiplier
    duration = db.Column(db.Integer, default=0, nullable=False)  # 0 = permanent
    stackable = db.Column(db.Boolean, default=False, nullable=False)
    
    # Effects (stored as JSON strings)
    player_effects = db.Column(db.Text, nullable=True)  # JSON: {"glow": true, "size_increase": 1.2}
    visual_effects = db.Column(db.Text, nullable=True)  # JSON: {"aura": "red", "particles": "sparkle"}
    animation_trigger = db.Column(db.String(100), nullable=True)  # e.g., "power_up", "speed_boost"
    
    # Ownership
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    is_public = db.Column(db.Boolean, default=False, nullable=False)  # Can others use this?
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    bosses = db.relationship('Boss', secondary='boss_modifiers', back_populates='modifiers')
    
    def __repr__(self):
        return f'<Modifier {self.name}>'
    
    def to_dict(self):
        """
        Convert modifier object to dictionary.
        
        Returns:
            dict: Modifier data
        """
        import json
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'stat_type': self.stat_type,
            'modifier_value': self.modifier_value,
            'modifier_type': self.modifier_type,
            'duration': self.duration,
            'stackable': self.stackable,
            'player_effects': json.loads(self.player_effects) if self.player_effects else None,
            'visual_effects': json.loads(self.visual_effects) if self.visual_effects else None,
            'animation_trigger': self.animation_trigger,
            'created_by': self.created_by,
            'is_public': self.is_public,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    @classmethod
    def create_modifier(cls, name, stat_type, modifier_value, modifier_type='percentage',
                       description=None, duration=0, stackable=False,
                       player_effects=None, visual_effects=None, animation_trigger=None,
                       created_by=None, is_public=False):
        """
        Create a new modifier.
        
        Args:
            name (str): Modifier name
            stat_type (str): Stat being modified
            modifier_value (float): Value change
            modifier_type (str): Type (percentage, flat, multiplier)
            description (str): Modifier description
            duration (int): Duration in seconds (0 = permanent)
            stackable (bool): Whether stackable
            player_effects (dict): Effects on player (will be JSON encoded)
            visual_effects (dict): Visual effects (will be JSON encoded)
            animation_trigger (str): Animation name
            created_by (int): User ID
            is_public (bool): Whether modifier is public
            
        Returns:
            Modifier: New modifier instance
        """
        import json
        
        modifier = cls(
            name=name,
            description=description,
            stat_type=stat_type,
            modifier_value=modifier_value,
            modifier_type=modifier_type,
            duration=duration,
            stackable=stackable,
            player_effects=json.dumps(player_effects) if player_effects else None,
            visual_effects=json.dumps(visual_effects) if visual_effects else None,
            animation_trigger=animation_trigger,
            created_by=created_by,
            is_public=is_public
        )
        return modifier

