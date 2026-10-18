"""
Attack model for Boss Creator system.
Handles attack definitions that can be assigned to bosses.
"""

from datetime import datetime
from . import db


class Attack(db.Model):
    """
    Attack model for boss creation system.
    
    Attributes:
        id (int): Primary key
        name (str): Attack name
        description (str): Attack description
        damage (int): Base damage dealt
        damage_type (str): Type of damage (physical, fire, ice, etc.)
        cooldown (int): Cooldown in seconds
        player_effects (str): JSON string of effects applied to player
        visual_effects (str): JSON string of visual/display effects
        animation_trigger (str): Animation name to trigger
        is_aoe (bool): Whether attack is area of effect
        aoe_radius (float): AOE radius if applicable
        created_by (int): User ID who created this attack
        created_at (datetime): Creation timestamp
        updated_at (datetime): Last update timestamp
    """
    
    __tablename__ = 'attacks'
    # Uses default kidsathome database (no bind_key)
    
    # Primary fields
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    
    # Attack properties
    damage = db.Column(db.Integer, default=0, nullable=False)
    damage_type = db.Column(db.String(50), default='physical', nullable=False)  # physical, fire, ice, poison, etc.
    cooldown = db.Column(db.Integer, default=0, nullable=False)  # in seconds
    is_aoe = db.Column(db.Boolean, default=False, nullable=False)
    aoe_radius = db.Column(db.Float, nullable=True)
    
    # Effects (stored as JSON strings)
    player_effects = db.Column(db.Text, nullable=True)  # JSON: {"stun": 2, "bleed": 5}
    visual_effects = db.Column(db.Text, nullable=True)  # JSON: {"particle": "slash", "color": "#FF0000"}
    animation_trigger = db.Column(db.String(100), nullable=True)  # e.g., "sword_slash", "claw_attack"
    
    # Ownership
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    is_public = db.Column(db.Boolean, default=False, nullable=False)  # Can others use this?
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    bosses = db.relationship('Boss', secondary='boss_attacks', back_populates='attacks')
    
    def __repr__(self):
        return f'<Attack {self.name}>'
    
    def to_dict(self):
        """
        Convert attack object to dictionary.
        
        Returns:
            dict: Attack data
        """
        import json
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'damage': self.damage,
            'damage_type': self.damage_type,
            'cooldown': self.cooldown,
            'is_aoe': self.is_aoe,
            'aoe_radius': self.aoe_radius,
            'player_effects': json.loads(self.player_effects) if self.player_effects else None,
            'visual_effects': json.loads(self.visual_effects) if self.visual_effects else None,
            'animation_trigger': self.animation_trigger,
            'created_by': self.created_by,
            'is_public': self.is_public,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    @classmethod
    def create_attack(cls, name, description=None, damage=0, damage_type='physical',
                     cooldown=0, is_aoe=False, aoe_radius=None,
                     player_effects=None, visual_effects=None, animation_trigger=None,
                     created_by=None, is_public=False):
        """
        Create a new attack.
        
        Args:
            name (str): Attack name
            description (str): Attack description
            damage (int): Base damage
            damage_type (str): Type of damage
            cooldown (int): Cooldown in seconds
            is_aoe (bool): Whether AOE
            aoe_radius (float): AOE radius
            player_effects (dict): Effects on player (will be JSON encoded)
            visual_effects (dict): Visual effects (will be JSON encoded)
            animation_trigger (str): Animation name
            created_by (int): User ID
            is_public (bool): Whether attack is public
            
        Returns:
            Attack: New attack instance
        """
        import json
        
        attack = cls(
            name=name,
            description=description,
            damage=damage,
            damage_type=damage_type,
            cooldown=cooldown,
            is_aoe=is_aoe,
            aoe_radius=aoe_radius,
            player_effects=json.dumps(player_effects) if player_effects else None,
            visual_effects=json.dumps(visual_effects) if visual_effects else None,
            animation_trigger=animation_trigger,
            created_by=created_by,
            is_public=is_public
        )
        return attack

