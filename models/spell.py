"""
Spell model for Boss Creator system.
Handles spell definitions that can be assigned to bosses.
"""

from datetime import datetime
from . import db


class Spell(db.Model):
    """
    Spell model for boss creation system.
    
    Attributes:
        id (int): Primary key
        name (str): Spell name
        description (str): Spell description
        damage (int): Base damage dealt by spell
        mana_cost (int): Mana/magic cost to cast
        cooldown (int): Cooldown in seconds
        player_effects (str): JSON string of effects applied to player
        visual_effects (str): JSON string of visual/display effects
        animation_trigger (str): Animation name to trigger
        created_by (int): User ID who created this spell
        created_at (datetime): Creation timestamp
        updated_at (datetime): Last update timestamp
    """
    
    __tablename__ = 'spells'
    # Uses default kidsathome database (no bind_key)
    
    # Primary fields
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    
    # Spell properties
    damage = db.Column(db.Integer, default=0, nullable=False)
    mana_cost = db.Column(db.Integer, default=0, nullable=False)
    cooldown = db.Column(db.Integer, default=0, nullable=False)  # in seconds
    
    # Effects (stored as JSON strings)
    player_effects = db.Column(db.Text, nullable=True)  # JSON: {"type": "poison", "duration": 5, "damage_per_tick": 10}
    visual_effects = db.Column(db.Text, nullable=True)  # JSON: {"particle": "fire", "color": "#FF0000", "size": "large"}
    animation_trigger = db.Column(db.String(100), nullable=True)  # e.g., "cast_fireball", "summon_minion"
    
    # Ownership
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    is_public = db.Column(db.Boolean, default=False, nullable=False)  # Can others use this?
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    bosses = db.relationship('Boss', secondary='boss_spells', back_populates='spells')
    
    def __repr__(self):
        return f'<Spell {self.name}>'
    
    def to_dict(self):
        """
        Convert spell object to dictionary.
        
        Returns:
            dict: Spell data
        """
        import json
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'damage': self.damage,
            'mana_cost': self.mana_cost,
            'cooldown': self.cooldown,
            'player_effects': json.loads(self.player_effects) if self.player_effects else None,
            'visual_effects': json.loads(self.visual_effects) if self.visual_effects else None,
            'animation_trigger': self.animation_trigger,
            'created_by': self.created_by,
            'is_public': self.is_public,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    @classmethod
    def create_spell(cls, name, description=None, damage=0, mana_cost=0, cooldown=0,
                     player_effects=None, visual_effects=None, animation_trigger=None,
                     created_by=None, is_public=False):
        """
        Create a new spell.
        
        Args:
            name (str): Spell name
            description (str): Spell description
            damage (int): Base damage
            mana_cost (int): Mana cost
            cooldown (int): Cooldown in seconds
            player_effects (dict): Effects on player (will be JSON encoded)
            visual_effects (dict): Visual effects (will be JSON encoded)
            animation_trigger (str): Animation name
            created_by (int): User ID
            is_public (bool): Whether spell is public
            
        Returns:
            Spell: New spell instance
        """
        import json
        
        spell = cls(
            name=name,
            description=description,
            damage=damage,
            mana_cost=mana_cost,
            cooldown=cooldown,
            player_effects=json.dumps(player_effects) if player_effects else None,
            visual_effects=json.dumps(visual_effects) if visual_effects else None,
            animation_trigger=animation_trigger,
            created_by=created_by,
            is_public=is_public
        )
        return spell

