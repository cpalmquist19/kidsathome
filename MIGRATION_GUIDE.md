# Database Migration Guide

This project now uses Flask-Migrate for database schema management. This provides proper versioning, rollback capabilities, and migration tracking.

## Setup

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Initialize Migrations (First Time Only)
```bash
python migrate_init.py
```

This will:
- Create the `migrations` directory
- Generate the initial migration file
- Apply the migration to create all tables

### 3. Manual Migration Commands

#### Initialize migrations (if not using the script):
```bash
flask db init
```

#### Create a new migration:
```bash
flask db migrate -m "Description of changes"
```

#### Apply migrations:
```bash
flask db upgrade
```

#### Rollback migrations:
```bash
flask db downgrade
```

#### View migration history:
```bash
flask db history
```

#### Show current migration status:
```bash
flask db current
```

## Migration Workflow

### Making Schema Changes

1. **Modify your models** in `flask_app.py`
2. **Create migration**: `flask db migrate -m "Add new field to users table"`
3. **Review the migration file** in `migrations/versions/`
4. **Apply migration**: `flask db upgrade`
5. **Test your changes**

### Example: Adding a new field

```python
# In flask_app.py, modify UserModel
class UserModel(db.Model, UserMixin):
    # ... existing fields ...
    new_field = db.Column(db.String(100), nullable=True)  # Add this
```

Then run:
```bash
flask db migrate -m "Add new_field to users"
flask db upgrade
```

## Database Models

The following models are managed by migrations:

- **UserModel**: User accounts and authentication
- **PasswordResetToken**: Password reset functionality
- **GeneratedSystem**: Stored system generation data
- **UserActivity**: User activity tracking

## Environment Variables

Make sure these are set in your `.env` file:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=kidsathome
DB_PORT=3306
```

## Troubleshooting

### Migration conflicts
If you have conflicts, you can:
1. Check the migration history: `flask db history`
2. Rollback to a specific version: `flask db downgrade <revision>`
3. Manually edit migration files if needed

### Database connection issues
- Verify your database credentials in `.env`
- Ensure MySQL is running
- Check that the database exists

### Reset migrations (DANGER - will lose data)
```bash
# Only do this in development!
rm -rf migrations/
flask db init
flask db migrate -m "Initial migration"
flask db upgrade
```

## Production Deployment

1. **Never run migrations directly in production**
2. **Test migrations in staging first**
3. **Backup your database before applying migrations**
4. **Use proper deployment scripts**

## Migration Best Practices

- Always review generated migration files before applying
- Use descriptive migration messages
- Test migrations on a copy of production data
- Keep migrations small and focused
- Don't edit migration files after they've been applied to production
