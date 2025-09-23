# MySQL Setup Guide for KidsAtHome.io

## Overview
This project now has full MySQL support with proper connection management, error handling, and example usage patterns.

## Prerequisites
- MySQL server running (local or remote)
- Database user with appropriate permissions
- Python MySQL connector (already installed: `mysql-connector-python==9.1.0`)

## Configuration

### 1. Environment Variables
Create a `.env` file in the project root with the following variables:

```env
# Flask Configuration
SECRET_KEY=your_secret_key_here

# MySQL Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=kidsathome
DB_PORT=3306

# OpenAI Configuration (if using)
OPENAI_API_KEY=your_openai_api_key_here
```

### 2. Database Setup
1. Create a MySQL database:
   ```sql
   CREATE DATABASE kidsathome CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

2. Create a user with appropriate permissions:
   ```sql
   CREATE USER 'kidsathome_user'@'localhost' IDENTIFIED BY 'your_password';
   GRANT ALL PRIVILEGES ON kidsathome.* TO 'kidsathome_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

3. The application will automatically create required tables on startup.

## Features Implemented

### 1. Secure Connection Management
- ✅ Environment variable configuration (no hardcoded credentials)
- ✅ Connection timeout and error handling
- ✅ Automatic connection cleanup with decorators
- ✅ Proper charset and Unicode support

### 2. Database Utilities
- `get_db_connection()` - Secure database connection with error handling
- `close_db_connection()` - Safe connection cleanup
- `with_db_connection` - Decorator for automatic connection management
- `init_database()` - Automatic table creation

### 3. Example Tables
- `generated_systems` - Store generated system data as JSON
- `user_activity` - Track user visits and activity

### 4. Example API Endpoints
- `GET /api/system-stats` - Returns database statistics
- `POST /api/save-system` - Saves generated system data

## Usage Examples

### Using the Database Decorator
```python
@app.route('/api/example')
@with_db_connection
def example_endpoint(db):
    cursor = db.cursor()
    cursor.execute("SELECT * FROM generated_systems LIMIT 10")
    results = cursor.fetchall()
    return jsonify(results)
```

### Manual Connection Management
```python
def manual_db_operation():
    connection = get_db_connection()
    if not connection:
        return "Database connection failed"
    
    try:
        cursor = connection.cursor()
        cursor.execute("SELECT COUNT(*) FROM generated_systems")
        count = cursor.fetchone()[0]
        return f"Total systems: {count}"
    finally:
        close_db_connection(connection)
```

## Security Features
- No hardcoded credentials in source code
- SQL injection protection with parameterized queries
- Connection timeout limits
- Proper error handling without exposing sensitive information

## Production Considerations
1. Use environment-specific `.env` files
2. Consider connection pooling for high-traffic applications
3. Regular database backups
4. Monitor connection limits and performance
5. Use SSL/TLS for remote database connections

## Testing
Test your MySQL setup by:
1. Starting the Flask application
2. Visiting `/api/system-stats` to verify database connectivity
3. Checking application logs for successful table creation

## Troubleshooting
- **Connection refused**: Check if MySQL server is running
- **Access denied**: Verify database credentials and user permissions
- **Database doesn't exist**: Create the database manually or check DB_NAME
- **Import errors**: Ensure `mysql-connector-python` is installed

## Next Steps
Consider adding:
- Database migrations for schema changes
- Connection pooling for better performance
- Database backup/restore utilities
- User authentication with database storage
- Analytics and reporting features
