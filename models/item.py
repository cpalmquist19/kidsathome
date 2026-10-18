"""
Item model for Boss Creator system.
Handles item definitions that can be assigned to bosses or dropped as loot.
"""

from datetime import datetime
from . import db


class Item(db.Model):
    """
    Item model for boss creation system.
    
    Attributes:
        id (int): Primary key
        name (str): Item name
        description (str): Item description
        item_type (str): Type of item (weapon, armor, consumable, material, etc.)
        rarity (str): Item rarity (common, uncommon, rare, epic, legendary)
        player_effects (str): JSON string of effects applied to player when used/equipped
        visual_effects (str): JSON string of visual/display effects
        animation_trigger (str): Animation name to trigger
        is_droppable (bool): Whether item can be dropped as loot
        drop_chance (float): Drop chance percentage (0-100)
        created_by (int): User ID who created this item
        created_at (datetime): Creation timestamp
        updated_at (datetime): Last update timestamp
    """
    
    __tablename__ = 'items'
    # Uses default kidsathome database (no bind_key)
    
    # Primary fields
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    
    # Item properties
    item_type = db.Column(db.String(50), nullable=False)  # weapon, armor, consumable, material, etc.
    rarity = db.Column(db.String(20), default='common', nullable=False)  # common, uncommon, rare, epic, legendary
    
    # Effects (stored as JSON strings)
    player_effects = db.Column(db.Text, nullable=True)  # JSON: {"health_bonus": 50, "damage_bonus": 10}
    visual_effects = db.Column(db.Text, nullable=True)  # JSON: {"glow": "gold", "particles": "sparkle"}
    animation_trigger = db.Column(db.String(100), nullable=True)  # e.g., "item_pickup", "item_use"
    
    # Loot properties
    is_droppable = db.Column(db.Boolean, default=True, nullable=False)
    drop_chance = db.Column(db.Float, default=0.0, nullable=False)  # 0-100 percentage
    
    # Ownership
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    is_public = db.Column(db.Boolean, default=False, nullable=False)  # Can others use this?
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    bosses = db.relationship('Boss', secondary='boss_items', back_populates='items')
    
    def __repr__(self):
        return f'<Item {self.name}>'
    
    def to_dict(self):
        """
        Convert item object to dictionary.
        
        Returns:
            dict: Item data
        """
        import json
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'item_type': self.item_type,
            'rarity': self.rarity,
            'player_effects': json.loads(self.player_effects) if self.player_effects else None,
            'visual_effects': json.loads(self.visual_effects) if self.visual_effects else None,
            'animation_trigger': self.animation_trigger,
            'is_droppable': self.is_droppable,
            'drop_chance': self.drop_chance,
            'created_by': self.created_by,
            'is_public': self.is_public,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    @classmethod
    def create_item(cls, name, item_type, description=None, rarity='common',
                   player_effects=None, visual_effects=None, animation_trigger=None,
                   is_droppable=True, drop_chance=0.0,
                   created_by=None, is_public=False):
        """
        Create a new item.
        
        Args:
            name (str): Item name
            item_type (str): Type of item
            description (str): Item description
            rarity (str): Item rarity
            player_effects (dict): Effects on player (will be JSON encoded)
            visual_effects (dict): Visual effects (will be JSON encoded)
            animation_trigger (str): Animation name
            is_droppable (bool): Whether droppable
            drop_chance (float): Drop chance percentage
            created_by (int): User ID
            is_public (bool): Whether item is public
            
        Returns:
            Item: New item instance
        """
        import json
        
        item = cls(
            name=name,
            description=description,
            item_type=item_type,
            rarity=rarity,
            player_effects=json.dumps(player_effects) if player_effects else None,
            visual_effects=json.dumps(visual_effects) if visual_effects else None,
            animation_trigger=animation_trigger,
            is_droppable=is_droppable,
            drop_chance=drop_chance,
            created_by=created_by,
            is_public=is_public
        )
        return item

