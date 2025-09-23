# Models Package

This package contains all the database models for the Kids at Home application.

## Models

### UserModel (`user.py`)
- **Purpose**: User authentication and profile management
- **Key Features**:
  - Secure password hashing
  - Username and email uniqueness validation
  - Last login tracking
  - Relationship management with other models

### PasswordResetToken (`password_reset.py`)
- **Purpose**: Secure password reset functionality
- **Key Features**:
  - Token expiration management
  - One-time use tokens
  - Automatic cleanup of expired tokens

### GeneratedSystem (`generated_system.py`)
- **Purpose**: Store space system generation data
- **Key Features**:
  - JSON data storage for system configurations
  - User association (optional for anonymous users)
  - System analysis methods (habitable planets, star types, etc.)
  - Statistics and reporting

### UserActivity (`user_activity.py`)
- **Purpose**: Track user interactions and analytics
- **Key Features**:
  - Page visit logging
  - Session tracking
  - User behavior analytics
  - Automatic cleanup of old data

## Usage

### Importing Models
```python
from models import UserModel, PasswordResetToken, GeneratedSystem, UserActivity
```

### Creating Records
```python
# Create a new user
user = UserModel.create_user('username', 'email@example.com', 'password')
db.session.add(user)
db.session.commit()

# Create a password reset token
token = PasswordResetToken.create_token(user.id, 'secure_token_string')
db.session.add(token)
db.session.commit()

# Log user activity
activity = UserActivity.log_activity('login', user_id=user.id)
```

### Querying Records
```python
# Find user by username
user = UserModel.find_by_username('username')

# Get user's generated systems
systems = GeneratedSystem.get_user_systems(user.id)

# Get recent activity
activities = UserActivity.get_recent_activity(hours=24)
```

## Model Relationships

```
UserModel (1) ←→ (many) PasswordResetToken
UserModel (1) ←→ (many) GeneratedSystem
UserModel (1) ←→ (many) UserActivity
```

## Best Practices

1. **Always use model methods** instead of direct SQLAlchemy queries when available
2. **Use transactions** for related operations
3. **Handle exceptions** properly in model operations
4. **Use the cleanup methods** periodically to maintain database performance
5. **Validate data** before creating records

## Migration Notes

When modifying models:
1. Update the model class
2. Create a migration: `flask db migrate -m "Description"`
3. Apply the migration: `flask db upgrade`
4. Test the changes thoroughly
