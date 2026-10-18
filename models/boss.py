"""
Boss model for Kids at Home application.
Handles boss battle data and statistics, including user-created custom bosses.
"""

from datetime import datetime
from . import db

# Association tables for many-to-many relationships
# These tables are in the monsters database and link monsters to spells/attacks/etc in kidsathome
# Note: We can't use foreign keys for cross-database references (spells/attacks/etc are in kidsathome)
boss_spells = db.Table('boss_spells',
    db.Column('boss_id', db.Integer, db.ForeignKey('monsters.id'), primary_key=True),
    db.Column('spell_id', db.Integer, primary_key=True, comment='References spells.id in kidsathome database'),
    info={'bind_key': 'monsters'}  # Use monsters database
)

boss_attacks = db.Table('boss_attacks',
    db.Column('boss_id', db.Integer, db.ForeignKey('monsters.id'), primary_key=True),
    db.Column('attack_id', db.Integer, primary_key=True, comment='References attacks.id in kidsathome database'),
    info={'bind_key': 'monsters'}  # Use monsters database
)

boss_modifiers = db.Table('boss_modifiers',
    db.Column('boss_id', db.Integer, db.ForeignKey('monsters.id'), primary_key=True),
    db.Column('modifier_id', db.Integer, primary_key=True, comment='References modifiers.id in kidsathome database'),
    info={'bind_key': 'monsters'}  # Use monsters database
)

boss_items = db.Table('boss_items',
    db.Column('boss_id', db.Integer, db.ForeignKey('monsters.id'), primary_key=True),
    db.Column('item_id', db.Integer, primary_key=True, comment='References items.id in kidsathome database'),
    info={'bind_key': 'monsters'}  # Use monsters database
)


class Boss(db.Model):
    """
    Boss model for boss battle system and custom boss creation.
    
    Attributes:
        id (int): Primary key
        name (str): Boss name
        title (str): Boss title/description
        max_health (int): Maximum health points
        current_health (int): Current health points
        max_mana (int): Maximum mana/magic points
        current_mana (int): Current mana/magic points
        total_damage_taken (int): Total damage taken across all battles
        rounds_fought (int): Total number of battle rounds
        total_participants (int): Total number of unique participants
        is_active (bool): Whether boss is currently active
        is_custom (bool): Whether this is a user-created custom boss
        created_by (int): User ID who created this boss (for custom bosses)
        is_public (bool): Whether custom boss is public/shared
        created_at (datetime): Boss creation timestamp
        last_battle (datetime): Last battle timestamp
        spells: Many-to-many relationship with Spell
        attacks: Many-to-many relationship with Attack
        modifiers: Many-to-many relationship with Modifier
        items: Many-to-many relationship with Item
    """
    
    __tablename__ = 'monsters'  # Use 'monsters' table name to avoid conflict with 'bosses' in kidsathome
    __bind_key__ = 'monsters'  # Use monsters database
    
    # Primary fields
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)  # Removed unique constraint for custom bosses
    title = db.Column(db.String(200), nullable=False)
    
    # Health and battle stats
    max_health = db.Column(db.Integer, nullable=False, default=1000000)
    current_health = db.Column(db.Integer, nullable=False, default=1000000)
    max_mana = db.Column(db.Integer, default=0, nullable=False)
    current_mana = db.Column(db.Integer, default=0, nullable=False)
    total_damage_taken = db.Column(db.Integer, default=0, nullable=False)
    rounds_fought = db.Column(db.Integer, default=0, nullable=False)
    total_participants = db.Column(db.Integer, default=0, nullable=False)
    
    # Status and ownership
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    is_custom = db.Column(db.Boolean, default=False, nullable=False)  # True for user-created bosses
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    is_public = db.Column(db.Boolean, default=False, nullable=False)  # Can others use this custom boss?
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    last_battle = db.Column(db.DateTime, nullable=True)
    
    # Many-to-many relationships
    spells = db.relationship('Spell', secondary=boss_spells, back_populates='bosses', lazy='dynamic')
    attacks = db.relationship('Attack', secondary=boss_attacks, back_populates='bosses', lazy='dynamic')
    modifiers = db.relationship('Modifier', secondary=boss_modifiers, back_populates='bosses', lazy='dynamic')
    items = db.relationship('Item', secondary=boss_items, back_populates='bosses', lazy='dynamic')
    
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
            'max_mana': self.max_mana,
            'current_mana': self.current_mana,
            'total_damage_taken': self.total_damage_taken,
            'rounds_fought': self.rounds_fought,
            'total_participants': self.total_participants,
            'is_active': self.is_active,
            'is_custom': self.is_custom,
            'created_by': self.created_by,
            'is_public': self.is_public,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_battle': self.last_battle.isoformat() if self.last_battle else None,
            'health_percentage': self.get_health_percentage(),
            'spells': [spell.to_dict() for spell in self.spells.all()] if self.spells else [],
            'attacks': [attack.to_dict() for attack in self.attacks.all()] if self.attacks else [],
            'modifiers': [modifier.to_dict() for modifier in self.modifiers.all()] if self.modifiers else [],
            'items': [item.to_dict() for item in self.items.all()] if self.items else []
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
            max_mana=0,
            current_mana=0,
            is_active=True,
            is_custom=False
        )
    
    @classmethod
    def create_custom_boss(cls, name, title, max_health, max_mana=0, created_by=None, is_public=False):
        """
        Create a custom boss created by a user.
        
        Args:
            name (str): Boss name
            title (str): Boss title/description
            max_health (int): Maximum health
            max_mana (int): Maximum mana
            created_by (int): User ID
            is_public (bool): Whether boss is public
            
        Returns:
            Boss: New custom boss instance
        """
        return cls(
            name=name,
            title=title,
            max_health=max_health,
            current_health=max_health,
            max_mana=max_mana,
            current_mana=max_mana,
            is_active=True,
            is_custom=True,
            created_by=created_by,
            is_public=is_public
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
