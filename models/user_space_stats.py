"""
User Space Stats model for Kids at Home application.
Tracks simplified statistics for Space Explorer game.
"""

from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from . import db


class UserSpaceStats(db.Model):
    """
    User Space Stats model for tracking Space Explorer game statistics.
    
    Attributes:
        id (int): Primary key
        user_id (int): Foreign key to users table
        total_systems_generated (int): Total number of systems generated
        rarest_discovery_name (str): Name of the rarest system found
        rarest_discovery_type (str): Star type of rarest discovery
        rarity_class (str): Rarity classification (Common, Uncommon, Rare, Epic, Legendary, Mythical, Secret, Godly)
        discovery_chance (int): Probability of finding the rarest object (1 in X format)
        habitable_worlds_found (int): Total number of habitable planets discovered
        legendary_systems_saved (int): Number of legendary+ systems auto-saved
        last_discovery_date (datetime): Timestamp of most recent discovery
        created_at (datetime): Record creation timestamp
        updated_at (datetime): Last update timestamp
    """
    
    __tablename__ = 'user_space_stats'
    
    # Primary fields
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, unique=True, index=True)
    
    # Stats fields
    total_systems_generated = db.Column(db.Integer, default=0, nullable=False)
    rarest_discovery_name = db.Column(db.String(255), nullable=True)
    rarest_discovery_type = db.Column(db.String(10), nullable=True)
    rarity_class = db.Column(db.String(20), nullable=True)
    discovery_chance = db.Column(db.Integer, nullable=True)
    habitable_worlds_found = db.Column(db.Integer, default=0, nullable=False)
    legendary_systems_saved = db.Column(db.Integer, default=0, nullable=False)
    hyper_planets_found = db.Column(db.Integer, default=0, nullable=False)
    
    # Timestamps
    last_discovery_date = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    def __repr__(self):
        return f'<UserSpaceStats {self.user_id}: {self.total_systems_generated} systems>'
    
    @classmethod
    def get_or_create(cls, user_id):
        """
        Get existing stats or create new record for user.
        
        Args:
            user_id (int): User ID
            
        Returns:
            UserSpaceStats: Stats record for user
        """
        stats = cls.query.filter_by(user_id=user_id).first()
        if not stats:
            stats = cls(user_id=user_id)
            db.session.add(stats)
            db.session.commit()
        return stats
    
    def update_system_generated(self, system_data, is_random_generation=True):
        """
        Update stats when a new system is generated.
        
        Args:
            system_data (dict): Generated system data
            is_random_generation (bool): Whether this was a random discovery
        """
        self.total_systems_generated += 1
        self.last_discovery_date = datetime.utcnow()
        
        # Only update rarity stats for random generations
        if is_random_generation:
            self._update_rarity_stats(system_data)
        
        # Always update habitable worlds count
        self._update_habitable_worlds(system_data)
        
        # Update legendary systems saved if applicable
        self._update_legendary_systems(system_data)
        
        db.session.commit()
    
    def _update_rarity_stats(self, system_data):
        """Update rarity-related statistics."""
        star_type = system_data.get('star', {}).get('type', 'M')
        star_name = system_data.get('star', {}).get('name', 'Unknown')
        giant_type = system_data.get('giantType', 'main')
        
        # Calculate rarity score (lower = rarer)
        rarity_score = self._calculate_rarity_score(star_type, giant_type)
        current_rarity_score = self.discovery_chance or float('inf')
        
        # Update if this is rarer than current rarest
        if rarity_score < current_rarity_score:
            self.rarest_discovery_name = star_name
            self.rarest_discovery_type = star_type
            self.rarity_class = self._get_rarity_class(star_type)
            self.discovery_chance = int(rarity_score)
    
    def _update_habitable_worlds(self, system_data):
        """Update habitable worlds count."""
        planets = system_data.get('planets', [])
        habitable_count = sum(1 for planet in planets if planet.get('habitable', False))
        self.habitable_worlds_found += habitable_count
    
    def _update_legendary_systems(self, system_data):
        """Update legendary systems saved count."""
        star_type = system_data.get('star', {}).get('type', 'M')
        rarity_class = self._get_rarity_class(star_type)
        
        # Auto-save legendary+ systems
        if rarity_class in ['Legendary', 'Mythical', 'Secret', 'Godly']:
            self.legendary_systems_saved += 1
    
    def update_hyper_planets(self, hyper_planets_count):
        """
        Update hyper planets found count.
        
        Args:
            hyper_planets_count (int): Number of hyper planets to add
        """
        self.hyper_planets_found += hyper_planets_count
        self.updated_at = datetime.utcnow()
        db.session.commit()
    
    def _calculate_rarity_score(self, star_type, giant_type='main'):
        """Calculate rarity score based on star type and giant type."""
        # Base weights from the game
        base_weights = {
            'O': 1, 'B': 13, 'A': 60, 'F': 300, 'G': 700, 'K': 1200, 'M': 7600,
            'D': 120, 'N': 3, 'P': 2, 'MGTR': 1, 'QS': 0.1, 'QK': 0.0001,
            'BH': 0.05, 'WH': 0.0001, 'WORM': 0.0001, 'SC': 0.00002,
            'NEB': 0.00002, 'GAL': 0.000004, 'GF': 0.000000001,
            'SV': 0.000000001, 'BD': 9000, 'HS': 0.0001, 'IGVPO': 0.0000001
        }
        
        base_weight = base_weights.get(star_type, 1000)
        
        # Giant types make stars rarer
        giant_multipliers = {
            'main': 1.0,
            'giant': 0.1,      # 10x rarer
            'super': 0.01,     # 100x rarer
            'hyper': 0.001     # 1000x rarer
        }
        
        multiplier = giant_multipliers.get(giant_type, 1.0)
        return base_weight * multiplier
    
    def _get_rarity_class(self, star_type):
        """Get rarity class name for star type."""
        rarity_classes = {
            'GF': 'Godly', 'SV': 'Godly',
            'GAL': 'Secret', 'NEB': 'Secret', 'SC': 'Secret', 'IGVPO': 'Secret',
            'QK': 'Mythical', 'WH': 'Mythical', 'WORM': 'Mythical', 'HS': 'Mythical',
            'QS': 'Legendary', 'BH': 'Legendary', 'O': 'Legendary',
            'MGTR': 'Epic', 'P': 'Epic', 'N': 'Epic',
            'A': 'Rare', 'B': 'Rare',
            'D': 'Uncommon', 'F': 'Uncommon',
            'K': 'Common', 'G': 'Common', 'BD': 'Common',
            'M': 'Very Common'
        }
        return rarity_classes.get(star_type, 'Common')
    
    def to_dict(self):
        """
        Convert stats object to dictionary.
        
        Returns:
            dict: Stats data
        """
        return {
            'id': self.id,
            'user_id': self.user_id,
            'total_systems_generated': self.total_systems_generated,
            'rarest_discovery_name': self.rarest_discovery_name,
            'rarest_discovery_type': self.rarest_discovery_type,
            'rarity_class': self.rarity_class,
            'discovery_chance': self.discovery_chance,
            'habitable_worlds_found': self.habitable_worlds_found,
            'legendary_systems_saved': self.legendary_systems_saved,
            'hyper_planets_found': self.hyper_planets_found,
            'last_discovery_date': self.last_discovery_date.isoformat() if self.last_discovery_date else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    @classmethod
    def get_leaderboard_data(cls, limit=10):
        """
        Get leaderboard data sorted by rarest discovery.
        
        Args:
            limit (int): Maximum number of users to return
            
        Returns:
            list: List of user stats with user information
        """
        from .user import UserModel
        
        return db.session.query(cls, UserModel)\
            .join(UserModel, cls.user_id == UserModel.id)\
            .filter(cls.rarest_discovery_name.isnot(None))\
            .order_by(cls.discovery_chance.asc())\
            .limit(limit)\
            .all()
