#######################################################
# IMPORTS
#######################################################
import io
import string
import time
from flask import Flask, g, current_app, render_template, jsonify, request, redirect, url_for, flash, session, send_from_directory, send_file
from flask_login import UserMixin, LoginManager, login_user, login_required, current_user, logout_user
from flask_migrate import Migrate
from functools import wraps
from werkzeug.utils import secure_filename, safe_join
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv
from datetime import date, datetime, timedelta
import mysql.connector
import locale
import os
import random
import ipaddress
import socket
from PIL import Image, ImageDraw, ImageFont
from io import BytesIO
from pathlib import Path
import openai
from urllib.parse import urljoin, urlparse
from urllib.error import HTTPError, URLError
from urllib.request import HTTPRedirectHandler, Request, build_opener
import json
import secrets
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

#######################################################
# FUTURE IDEAS
#######################################################
# 1. Collect Hyper Stars like we do Hyper Planets
# 2. Add a Launch All Hyper Stars button
# 3. and a launch 1 hyper star button
# 4. Add a Suck the Life out of the boss button (requires a IGVPO)
# 5. Make the boss drop items
# 6. The first item is the anti-matter core
# 7. We need a new materials box for the anti-matter core
# 8. If you don't kill the boss, you don't get the anti-matter core
# 9. But if you do 10 or more damage, you get a Hyper Particle
# 10. Hyper Particles and the Anti-Matter Core are connected to the Gravity Lab game


#######################################################
# ENVIRONMENT DETECTION AND CONFIGURATION
#######################################################

class DevelopmentConfig:
    """Development configuration with flexible settings"""
    DEBUG = True
    SQLALCHEMY_ECHO = False
    
    @staticmethod
    def get_database_uri():
        """Get development database URI with fallback defaults"""
        mysql_config = {
            'host': os.environ.get('LOCAL_MYSQL_HOST', 'localhost'),
            'port': int(os.environ.get('LOCAL_MYSQL_PORT', 3306)),
            'user': os.environ.get('LOCAL_MYSQL_USER', 'root'),
            'password': os.environ.get('LOCAL_MYSQL_PASSWORD', ''),
            'database': os.environ.get('LOCAL_MYSQL_DATABASE', 'kidsathome')
        }
        return f"mysql+pymysql://{mysql_config['user']}:{mysql_config['password']}@{mysql_config['host']}:{mysql_config['port']}/{mysql_config['database']}"

class ProductionConfig:
    """Production configuration with strict validation"""
    DEBUG = False
    SQLALCHEMY_ECHO = False
    
    @staticmethod
    def validate_production_config():
        """Validate that all required production environment variables are set"""
        required_vars = [
            'SECRET_KEY',
            'PRODUCTION_DB_HOST',
            'PRODUCTION_DB_USER',
            'PRODUCTION_DB_PASSWORD',
            'PRODUCTION_DB_NAME'
        ]
        
        missing_vars = []
        for var in required_vars:
            if not os.environ.get(var):
                missing_vars.append(var)
        
        if missing_vars:
            raise ValueError(f"Missing required environment variables for production: {', '.join(missing_vars)}")
    
    @staticmethod
    def get_database_uri():
        """Get production database URI with validation"""
        ProductionConfig.validate_production_config()
        mysql_config = {
            'host': os.environ.get('PRODUCTION_DB_HOST'),
            'port': int(os.environ.get('PRODUCTION_DB_PORT', 3306)),
            'user': os.environ.get('PRODUCTION_DB_USER'),
            'password': os.environ.get('PRODUCTION_DB_PASSWORD'),
            'database': os.environ.get('PRODUCTION_DB_NAME')
        }
        return f"mysql+pymysql://{mysql_config['user']}:{mysql_config['password']}@{mysql_config['host']}:{mysql_config['port']}/{mysql_config['database']}"

def get_environment():
    """
    Environment detection with multiple fallback methods.
    Priority: FLASK_ENV > LOCAL_MYSQL_* vars > production vars > default
    """
    # Method 1: Explicit FLASK_ENV variable (highest priority)
    flask_env = os.environ.get('FLASK_ENV')
    if flask_env in ['production', 'development']:
        return flask_env
    
    # Method 2: Check for local development indicators
    # If LOCAL_MYSQL_* variables are set, we're likely in development
    local_mysql_vars = [
        'LOCAL_MYSQL_HOST', 'LOCAL_MYSQL_USER', 'LOCAL_MYSQL_PASSWORD', 
        'LOCAL_MYSQL_DATABASE', 'LOCAL_MYSQL_PORT'
    ]
    has_local_vars = any(os.environ.get(var) for var in local_mysql_vars)
    
    if has_local_vars:
        return 'development'
    
    # Method 3: Check for production indicators
    production_vars = [
        'PRODUCTION_DB_HOST', 'PRODUCTION_DB_USER', 'PRODUCTION_DB_PASSWORD', 
        'PRODUCTION_DB_NAME'
    ]
    has_production_vars = all(os.environ.get(var) for var in production_vars)
    
    if has_production_vars:
        return 'production'
    
    # Method 4: Default to development for safety
    return 'development'

def get_database_uri():
    """Get database URI based on detected environment"""
    environment = get_environment()
    
    if environment == 'production':
        return ProductionConfig.get_database_uri()
    else:
        return DevelopmentConfig.get_database_uri()

def get_monsters_database_uri():
    """Get monsters database URI based on detected environment"""
    environment = get_environment()
    
    if environment == 'production':
        mysql_config = {
            'host': os.environ.get('PRODUCTION_DB_HOST'),
            'port': int(os.environ.get('PRODUCTION_DB_PORT', 3306)),
            'user': os.environ.get('PRODUCTION_DB_USER'),
            'password': os.environ.get('PRODUCTION_DB_PASSWORD'),
            'database': os.environ.get('PRODUCTION_MONSTERS_DB_NAME', 'monsters')
        }
    else:
        mysql_config = {
            'host': os.environ.get('LOCAL_MYSQL_HOST', 'localhost'),
            'port': int(os.environ.get('LOCAL_MYSQL_PORT', 3306)),
            'user': os.environ.get('LOCAL_MYSQL_USER', 'root'),
            'password': os.environ.get('LOCAL_MYSQL_PASSWORD', ''),
            'database': os.environ.get('LOCAL_MONSTERS_DB_NAME', 'monsters')
        }
    
    return f"mysql+pymysql://{mysql_config['user']}:{mysql_config['password']}@{mysql_config['host']}:{mysql_config['port']}/{mysql_config['database']}"

def log_startup_info():
    """Log comprehensive startup information for diagnostics"""
    environment = get_environment()
    
    # Get database info for logging
    if environment == 'production':
        mysql_host = os.environ.get('PRODUCTION_DB_HOST', 'unknown')
        mysql_database = os.environ.get('PRODUCTION_DB_NAME', 'unknown')
    else:
        mysql_host = os.environ.get('LOCAL_MYSQL_HOST', 'localhost')
        mysql_database = os.environ.get('LOCAL_MYSQL_DATABASE', 'kidsathome')
    
    print("=" * 60)
    print("🚀 KidsAtHome.io - Starting Up")
    print("=" * 60)
    print(f"Environment: {environment.upper()}")
    print(f"Debug Mode: {app.config.get('DEBUG', False)}")
    print(f"Database Host: {mysql_host}")
    print(f"Database: {mysql_database}")
    print("=" * 60)

#######################################################
# MAIN APP LOGIC
#######################################################
app = Flask(__name__, static_url_path='/static', static_folder='static')

APP_NAME = "KidsAtHome.io"

load_dotenv()

# Environment detection and configuration loading
config_name = get_environment()
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}

# Load configuration
app.config.from_object(config[config_name])

# Set secret key with validation
secret_key = os.environ.get('SECRET_KEY')
if not secret_key and config_name == 'production':
    print("❌ ERROR: SECRET_KEY is required for production environment!")
    exit(1)
elif not secret_key:
    secret_key = 'dev-secret-key-change-in-production'
    print("⚠️  WARNING: Using default secret key. Set SECRET_KEY environment variable for production!")

app.config['SECRET_KEY'] = secret_key
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 31536000  # Cache static files aggressively; versioned URLs will bust cache

# Set database URI based on detected environment
app.config['SQLALCHEMY_DATABASE_URI'] = get_database_uri()
# Set monsters database URI for boss creator models
app.config['SQLALCHEMY_BINDS'] = {
    'monsters': get_monsters_database_uri()
}
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Import models and initialize database
from models import (db, UserModel, PasswordResetToken, GeneratedSystem, UserActivity, 
                    UserSpaceStats, Boss)

# Initialize extensions
db.init_app(app)
migrate = Migrate(app, db)

# Initialize Flask-Login
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'
login_manager.login_message = 'Please log in to access this page.'
login_manager.login_message_category = 'info'

# Models are now imported from the models package

@login_manager.user_loader
def load_user(user_id):
    return UserModel.query.get(int(user_id))

def get_db_connection():
    """Get MySQL database connection using environment-aware credentials with proper error handling"""
    try:
        # Determine environment - use runtime detection if available, otherwise startup detection
        environment = get_runtime_environment()
        print(f"🔍 Environment detected: {environment}")
        
        if environment == 'development':
            # Use local database credentials
            db_config = {
                'host': os.environ.get('LOCAL_MYSQL_HOST', 'localhost'),
                'user': os.environ.get('LOCAL_MYSQL_USER', 'root'),
                'password': os.environ.get('LOCAL_MYSQL_PASSWORD', ''),
                'database': os.environ.get('LOCAL_MYSQL_DATABASE', 'kidsathome'),
                'port': int(os.environ.get('LOCAL_MYSQL_PORT', 3306))
            }
            print(f"🏠 Using LOCAL database: {db_config['host']}:{db_config['port']}/{db_config['database']}")
        else:
            # Use production database credentials
            db_config = {
                'host': os.environ.get('PRODUCTION_DB_HOST'),
                'user': os.environ.get('PRODUCTION_DB_USER'),
                'password': os.environ.get('PRODUCTION_DB_PASSWORD'),
                'database': os.environ.get('PRODUCTION_DB_NAME'),
                'port': int(os.environ.get('PRODUCTION_DB_PORT', 3306))
            }
            print(f"🚀 Using PRODUCTION database: {db_config['host']}:{db_config['port']}/{db_config['database']}")
        
        connection = mysql.connector.connect(
            host=db_config['host'],
            user=db_config['user'],
            password=db_config['password'],
            database=db_config['database'],
            port=db_config['port'],
            autocommit=True,
            charset='utf8mb4',
            use_unicode=True,
            connection_timeout=10,
            sql_mode='TRADITIONAL'
        )
        return connection
    except mysql.connector.Error as e:
        print(f"Database connection error: {e}")
        return None

def close_db_connection(connection):
    """Safely close database connection"""
    if connection and connection.is_connected():
        connection.close()

def with_db_connection(func):
    """Decorator to handle database connections with proper cleanup"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500
        
        try:
            # Add connection to kwargs so the function can use it
            kwargs['db'] = connection
            return func(*args, **kwargs)
        except mysql.connector.Error as e:
            print(f"Database error in {func.__name__}: {e}")
            return jsonify({'error': 'Database operation failed'}), 500
        finally:
            close_db_connection(connection)
    
    return wrapper

@app.context_processor
def inject_app_name():
    return {'APP_NAME': APP_NAME}

@app.context_processor
def inject_current_year():
    return {'current_year': datetime.now().year}

# Provide a helper for versioned static asset URLs to ensure clients fetch latest files
def static_file(filename):
    try:
        file_path = os.path.join(app.static_folder, filename)
        version = int(os.path.getmtime(file_path))
    except Exception:
        version = int(time.time())
    return url_for('static', filename=filename, v=version)

@app.context_processor
def inject_static_file_helper():
    return {'static_file': static_file}

def get_runtime_environment():
    """
    Get environment based on current request context.
    This can be used during request handling to detect actual URL.
    """
    try:
        if request and hasattr(request, 'url'):
            if '127.0.0.1' in request.url or 'localhost' in request.url:
                return 'development'
        return 'production'
    except (RuntimeError, AttributeError):
        # No request context available
        return get_environment()  # Fall back to startup detection

@app.context_processor
def inject_env_flags():
    """Inject environment flags based on the request host.
    Local dev is true when URL contains 127.0.0.1, otherwise production.
    """
    try:
        host = request.host or ''
    except Exception:
        host = ''
    is_local_dev = '127.0.0.1' in host
    return {
        'is_local_dev': is_local_dev,
        'is_production': not is_local_dev,
    }

#######################################################
# ROUTES
#######################################################
@app.route('/sitemap.xml')
def sitemap():
    return send_from_directory(app.static_folder, request.path[1:])

@app.route('/robots.txt')
def robots():
    return send_from_directory(app.static_folder, request.path[1:])

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/game')
def game():
    # game page
    current_year = datetime.now().year
    return render_template('game.html', current_year=current_year)

@app.route('/system_generator')
def system_generator():
    return render_template('system_generator.html', current_user=current_user)

@app.route('/matter_eater')
def matter_eater():
    return render_template('matter_eater.html')

@app.route('/unieat')
def unieat():
    return render_template('unieat.html')

@app.route('/gravity_lab')
def gravity_lab():
    return render_template('gravity_lab.html')

@app.route('/shader_lab')
def shader_lab():
    return render_template('Shader_Lab.html')

IMAGE_PLAYGROUND_EXTENSIONS = {'.gif', '.ico', '.jpeg', '.jpg', '.png', '.webp'}
REMOTE_IMAGE_TYPES = {
    'image/avif',
    'image/gif',
    'image/jpeg',
    'image/png',
    'image/vnd.microsoft.icon',
    'image/webp',
    'image/x-icon',
}
MAX_REMOTE_IMAGE_BYTES = 10 * 1024 * 1024


class ImageProxyNoRedirect(HTTPRedirectHandler):
    """Keep redirects visible so each destination can be safety-checked."""

    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def is_public_image_host(hostname):
    """Reject local, private, and otherwise non-public proxy destinations."""
    if not hostname:
        return False

    try:
        addresses = socket.getaddrinfo(hostname, None, type=socket.SOCK_STREAM)
        return bool(addresses) and all(
            ipaddress.ip_address(address[4][0].split('%')[0]).is_global
            for address in addresses
        )
    except (OSError, ValueError):
        return False


def validate_remote_image_url(url):
    parsed = urlparse(url)
    if parsed.scheme not in {'http', 'https'} or parsed.username or parsed.password:
        return None
    if not is_public_image_host(parsed.hostname):
        return None
    return parsed


def fetch_remote_image(url):
    """Fetch a public raster image, checking every redirect before following it."""
    opener = build_opener(ImageProxyNoRedirect())
    current_url = url

    for _ in range(4):
        if not validate_remote_image_url(current_url):
            raise ValueError('The image URL must use a public HTTP or HTTPS address.')

        request_headers = {'User-Agent': 'KidsAtHome-ImagePlayground/1.0'}
        try:
            response = opener.open(Request(current_url, headers=request_headers), timeout=10)
        except HTTPError as error:
            if error.code not in {301, 302, 303, 307, 308}:
                raise
            location = error.headers.get('Location')
            error.close()
            if not location:
                raise ValueError('The image URL redirected without a destination.')
            current_url = urljoin(current_url, location)
            continue
        except URLError as error:
            raise ValueError('The image URL could not be reached.') from error

        return response

    raise ValueError('The image URL redirected too many times.')


def get_image_playground_library():
    """Return the browser-displayable images available to the playground."""
    images_root = os.path.join(app.static_folder, 'images')
    images = []

    for root, _, filenames in os.walk(images_root):
        for filename in filenames:
            if os.path.splitext(filename)[1].lower() not in IMAGE_PLAYGROUND_EXTENSIONS:
                continue

            file_path = os.path.join(root, filename)
            static_path = os.path.relpath(file_path, app.static_folder).replace(os.sep, '/')
            images.append({
                'name': filename,
                'path': static_path,
                'url': static_file(static_path),
            })

    return sorted(images, key=lambda image: image['path'].casefold())


@app.route('/api/image-proxy')
def image_proxy():
    """Safely retrieve a remote raster image for the browser-based editor."""
    image_url = request.args.get('url', '').strip()
    if not image_url:
        return jsonify({'error': 'An image URL is required.'}), 400

    try:
        response = fetch_remote_image(image_url)
        content_type = response.headers.get_content_type().lower()
        content_length = response.headers.get('Content-Length')
        if content_type not in REMOTE_IMAGE_TYPES:
            response.close()
            return jsonify({'error': 'The URL did not return a supported raster image.'}), 415
        if content_length:
            try:
                if int(content_length) > MAX_REMOTE_IMAGE_BYTES:
                    response.close()
                    return jsonify({'error': 'The image is larger than the 10 MB limit.'}), 413
            except ValueError:
                # A malformed length header is harmless; enforce the limit while streaming below.
                pass

        image_bytes = bytearray()
        while chunk := response.read(min(64 * 1024, MAX_REMOTE_IMAGE_BYTES + 1 - len(image_bytes))):
            image_bytes.extend(chunk)
            if len(image_bytes) > MAX_REMOTE_IMAGE_BYTES:
                response.close()
                return jsonify({'error': 'The image is larger than the 10 MB limit.'}), 413
        response.close()
    except (HTTPError, ValueError, OSError):
        return jsonify({'error': 'Unable to retrieve that image URL.'}), 400

    return send_file(BytesIO(image_bytes), mimetype=content_type, max_age=0)


@app.route('/image_playground')
def image_playground():
    return render_template('image_playground.html', image_library=get_image_playground_library())

@app.route('/stellar_evolution')
def stellar_evolution():
    return render_template('stellar_evolution.html')

@app.route('/space_explorer_3d')
def space_explorer_3d():
    return render_template('space_explorer_3d.html', current_user=current_user)

@app.route('/game_monster_generator')
def game_monster_generator():
    return render_template('game_monster_generator.html', current_user=current_user)

@app.route('/boss_creator')
def boss_creator():
    return render_template('base_view.html', current_user=current_user)

@app.route('/life_on_exoplanet_clicker')
def life_on_exoplanet_clicker():
    return render_template('life_on_exoplanet_clicker.html', current_user=current_user)

@app.route('/stardust_to_planet')
def stardust_to_planet():
    return render_template('stardust_to_planet.html', current_user=current_user)

@app.route('/star_map')
def star_map():
    return render_template('star_map.html', current_user=current_user)

@app.route('/star_map/stats')
def star_stats():
    return render_template('star_stats.html', current_user=current_user)

@app.route('/leviathan_map')
def leviathan_map():
    return render_template('leviathan_map.html', current_user=current_user)

@app.route('/tier_maker')
def tier_maker():
    return render_template('tier_maker.html', current_user=current_user)

@app.route('/rarities_game')
def rarities_game():
    return render_template('rarities_game.html', current_user=current_user)

@app.route('/ocean_depth_game')
def ocean_depth_game():
    effects_dir = os.path.join(app.static_folder, 'sound', 'effects')
    sound_prefetch_urls = []
    if os.path.isdir(effects_dir):
        for filename in sorted(os.listdir(effects_dir)):
            if filename.lower().endswith('.mp3'):
                sound_prefetch_urls.append(static_file(f'sound/effects/{filename}'))
    return render_template(
        'ocean_depth_game.html',
        current_user=current_user,
        sound_prefetch_urls=sound_prefetch_urls,
    )

@app.route('/leaderboards')
def leaderboards():
    return render_template('leaderboards.html')

@app.route('/world-boss')
def world_boss():
    # HYPER STAR COUNT (COMMENTED OUT - Using Hyper Planets instead)
    # Get user's hyper stars count if logged in
    # hyper_stars_count = 0
    # if current_user.is_authenticated:
    #     from models.user_space_stats import UserSpaceStats
    #     user_stats = UserSpaceStats.get_or_create(current_user.id)
    #     hyper_stars_count = user_stats.hyper_stars_found
    
    # Get user's hyper planets count if logged in (for world boss combat)
    hyper_planets_count = 0
    if current_user.is_authenticated:
        from models.user_space_stats import UserSpaceStats
        user_stats = UserSpaceStats.get_or_create(current_user.id)
        hyper_planets_count = user_stats.hyper_planets_found
    
    return render_template('world_boss.html', current_user=current_user, hyper_planets_count=hyper_planets_count)

@app.route('/world-boss/attack', methods=['POST'])
@login_required
def attack_world_boss():
    """Handle world boss attack - reduce boss HP by 1 and player hyper planets by 1"""
    try:
        from models.user_space_stats import UserSpaceStats
        
        # Get user stats
        user_stats = UserSpaceStats.get_or_create(current_user.id)
        
        # Check if user has hyper planets
        if user_stats.hyper_planets_found <= 0:
            return jsonify({'error': 'No hyper planets available'}), 400
        
        # Update stats: reduce hyper planets by 1
        user_stats.hyper_planets_found -= 1
        user_stats.updated_at = datetime.utcnow()
        
        # For now, we'll simulate boss HP reduction
        # In a real implementation, you'd have a boss model/table
        # For this demo, we'll just return success with damage info
        
        try:
            db.session.commit()
        except Exception as db_error:
            print(f"Database commit error: {db_error}")
            db.session.rollback()
            return jsonify({'error': 'Database update failed'}), 500
        
        return jsonify({
            'success': True,
            'damage': 1,
            'hyper_planets_remaining': user_stats.hyper_planets_found,
            'message': f'Dealt 1 damage! {user_stats.hyper_planets_found} hyper planets remaining.'
        })
        
    except Exception as e:
        print(f"Attack error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Attack failed: {str(e)}'}), 500

@app.route('/explore/<object_name>')
def explore_object(object_name):
    return render_template('explore.html', object_name=object_name)

#######################################################
# AUTHENTICATION ROUTES
#######################################################

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        remember = bool(request.form.get('remember'))
        
        if not username or not password:
            flash('Please fill in all fields.', 'error')
            return render_template('login.html')
        
        try:
            user = UserModel.find_by_username(username)
            
            if user and user.check_password(password):
                login_user(user, remember=remember)
                
                # Update last login using model method
                user.update_last_login()
                db.session.commit()
                
                next_page = request.args.get('next')
                return redirect(next_page) if next_page else redirect(url_for('index'))
            else:
                flash('Invalid username or password.', 'error')
                
        except Exception as e:
            print(f"Login error: {e}")
            flash('An error occurred. Please try again.', 'error')
    
    return render_template('login.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form.get('username')
        email = request.form.get('email')
        password = request.form.get('password')
        confirm_password = request.form.get('confirm_password')
        
        # Validation
        if not all([username, email, password, confirm_password]):
            flash('Please fill in all fields.', 'error')
            return render_template('register.html')
        
        if password != confirm_password:
            flash('Passwords do not match.', 'error')
            return render_template('register.html')
        
        if len(password) < 6:
            flash('Password must be at least 6 characters long.', 'error')
            return render_template('register.html')
        
        if len(username) < 3:
            flash('Username must be at least 3 characters long.', 'error')
            return render_template('register.html')
        
        try:
            # Check if username or email already exists
            if UserModel.is_username_taken(username):
                flash('Username already exists.', 'error')
                return render_template('register.html')
            
            if UserModel.is_email_taken(email):
                flash('Email already exists.', 'error')
                return render_template('register.html')
            
            # Create new user using the model method
            new_user = UserModel.create_user(username, email, password)
            
            db.session.add(new_user)
            db.session.commit()
            
            flash('Account created successfully! Please log in.', 'success')
            return redirect(url_for('login'))
            
        except Exception as e:
            print(f"Registration error: {e}")
            db.session.rollback()
            flash('An error occurred during registration. Please try again.', 'error')
    
    return render_template('register.html')

@app.route('/forgot_password', methods=['GET', 'POST'])
def forgot_password():
    if request.method == 'POST':
        email = request.form.get('email')
        
        if not email:
            flash('Please enter your email address.', 'error')
            return render_template('forgot_password.html')
        
        try:
            user = UserModel.find_by_email(email)
            
            if user:
                # Generate reset token using model method
                token = secrets.token_urlsafe(32)
                reset_token = PasswordResetToken.create_token(user.id, token)
                
                db.session.add(reset_token)
                db.session.commit()
                
                # In a real application, you would send an email here
                # For now, we'll just show a success message
                flash(f'Password reset link sent to {email}. Check your email for instructions.', 'success')
            else:
                flash('No account found with that email address.', 'error')
                
        except Exception as e:
            print(f"Forgot password error: {e}")
            db.session.rollback()
            flash('An error occurred. Please try again.', 'error')
    
    return render_template('forgot_password.html')

@app.route('/reset_password/<token>', methods=['GET', 'POST'])
def reset_password(token):
    try:
        # Find valid reset token using model method
        reset_token = PasswordResetToken.find_valid_token(token)
        
        if not reset_token:
            flash('Invalid or expired reset token.', 'error')
            return redirect(url_for('forgot_password'))
        
        if request.method == 'POST':
            password = request.form.get('password')
            confirm_password = request.form.get('confirm_password')
            
            if not password or not confirm_password:
                flash('Please fill in all fields.', 'error')
                return render_template('reset_password.html', token=token)
            
            if password != confirm_password:
                flash('Passwords do not match.', 'error')
                return render_template('reset_password.html', token=token)
            
            if len(password) < 6:
                flash('Password must be at least 6 characters long.', 'error')
                return render_template('reset_password.html', token=token)
            
            # Update password and mark token as used
            user = UserModel.query.get(reset_token.user_id)
            if user:
                user.set_password(password)
                reset_token.mark_as_used()
                db.session.commit()
                
                flash('Password updated successfully! Please log in.', 'success')
                return redirect(url_for('login'))
            else:
                flash('User not found.', 'error')
                return redirect(url_for('forgot_password'))
        
        return render_template('reset_password.html', token=token)
        
    except Exception as e:
        print(f"Reset password error: {e}")
        db.session.rollback()
        flash('An error occurred. Please try again.', 'error')
        return redirect(url_for('forgot_password'))

@app.route('/logout')
@login_required
def logout():
    logout_user()
    flash('You have been logged out successfully.', 'info')
    return redirect(url_for('index'))

# Add activity logging to routes
@app.before_request
def log_activity():
    """Log user activity for analytics"""
    if request.endpoint and request.endpoint not in ['static', 'favicon']:
        try:
            user_id = current_user.id if current_user.is_authenticated else None
            session_id = session.get('session_id', 'anonymous')
            ip_address = request.remote_addr or 'unknown'
            
            UserActivity.log_activity(
                page_visited=request.endpoint,
                user_id=user_id,
                session_id=session_id,
                ip_address=ip_address
            )
        except Exception as e:
            # Don't let activity logging break the app
            print(f"Activity logging error: {e}")

#######################################################
# DATABASE UTILITIES AND EXAMPLE ROUTES
#######################################################

def init_database():
    """Initialize database tables using SQLAlchemy"""
    try:
        with app.app_context():
            db.create_all()
            print("Database tables initialized successfully")
            return True
    except Exception as e:
        print(f"Database initialization error: {e}")
        return False

@app.route('/api/system-stats')
def get_system_stats():
    """Example API endpoint that uses SQLAlchemy to return statistics"""
    try:
        # Get system statistics using model method
        system_stats = GeneratedSystem.get_system_stats()
        
        # Get recent activity (last hour)
        recent_activities = UserActivity.get_recent_activity(hours=1)
        recent_visits = len(recent_activities)
        
        return jsonify({
            'total_systems': system_stats['total_systems'],
            'user_systems': system_stats['user_systems'],
            'anonymous_systems': system_stats['anonymous_systems'],
            'recent_visits': recent_visits,
            'status': 'success'
        })
        
    except Exception as e:
        print(f"Error fetching stats: {e}")
        return jsonify({'error': 'Failed to fetch statistics'}), 500

@app.route('/api/save-system', methods=['POST'])
def save_system():
    """Example API endpoint to save generated system data"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        ip_address = request.remote_addr or 'unknown'
        user_id = current_user.id if current_user.is_authenticated else None
        
        # Create system using model method
        new_system = GeneratedSystem.create_system(data, user_id, ip_address)
        
        db.session.add(new_system)
        db.session.commit()
        
        return jsonify({
            'message': 'System saved successfully',
            'id': new_system.id
        })
        
    except Exception as e:
        print(f"Error saving system: {e}")
        db.session.rollback()
        return jsonify({'error': 'Failed to save system'}), 500

@app.route('/api/update-space-stats', methods=['POST'])
@login_required
def update_space_stats():
    """Update user space exploration statistics"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        user_id = current_user.id
        
        # Get or create user stats
        stats = UserSpaceStats.get_or_create(user_id)
        
        # Update stats based on provided data
        if 'systems_generated' in data:
            stats.total_systems_generated += data['systems_generated']
        
        if 'rarest_discovery' in data:
            discovery = data['rarest_discovery']
            # Only update if this is rarer than current
            if not stats.rarest_discovery_name or discovery.get('rarity_score', float('inf')) < (stats.discovery_chance or float('inf')):
                stats.rarest_discovery_name = discovery.get('name')
                stats.rarest_discovery_type = discovery.get('type')
                stats.rarity_class = discovery.get('rarity_class')
                stats.discovery_chance = discovery.get('rarity_score')
        
        if 'habitable_worlds' in data:
            stats.habitable_worlds_found += data['habitable_worlds']
        
        if 'legendary_systems' in data:
            stats.legendary_systems_saved += data['legendary_systems']
        
        # HYPER STAR STATS UPDATE (COMMENTED OUT - Using Hyper Planets instead)
        # if 'hyper_stars' in data:
        #     stats.hyper_stars_found += data['hyper_stars']
        
        # Hyper Planet stats update (for world boss combat)
        if 'hyper_planets' in data:
            stats.hyper_planets_found += data['hyper_planets']
        
        # Update last discovery date
        stats.last_discovery_date = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'message': 'Stats updated successfully',
            'stats': stats.to_dict()
        })
        
    except Exception as e:
        print(f"Error updating space stats: {e}")
        db.session.rollback()
        return jsonify({'error': 'Failed to update stats'}), 500

@app.route('/api/space-stats', methods=['GET'])
@login_required
def get_space_stats():
    """Get current user's space exploration statistics"""
    try:
        user_id = current_user.id
        stats = UserSpaceStats.get_or_create(user_id)
        
        return jsonify({
            'stats': stats.to_dict(),
            'status': 'success'
        })
        
    except Exception as e:
        print(f"Error fetching space stats: {e}")
        return jsonify({'error': 'Failed to fetch stats'}), 500

@app.route('/api/reset-space-stats', methods=['POST'])
@login_required
def reset_space_stats():
    """Reset user's space exploration statistics"""
    try:
        user_id = current_user.id
        stats = UserSpaceStats.get_or_create(user_id)
        
        # Reset all stats to zero/default values
        stats.total_systems_generated = 0
        stats.rarest_discovery_name = None
        stats.rarest_discovery_type = None
        stats.rarity_class = None
        stats.discovery_chance = None
        stats.habitable_worlds_found = 0
        stats.legendary_systems_saved = 0
        stats.hyper_planets_found = 0
        stats.last_discovery_date = None
        
        db.session.commit()
        
        return jsonify({
            'message': 'Stats reset successfully',
            'status': 'success'
        })
        
    except Exception as e:
        print(f"Error resetting space stats: {e}")
        db.session.rollback()
        return jsonify({'error': 'Failed to reset stats'}), 500

@app.route('/api/hyper-planets/submit', methods=['POST'])
@login_required
def submit_hyper_planets():
    """Submit hyper planets found to user's stats"""
    try:
        data = request.get_json()
        hyper_planets_count = data.get('hyper_planets_count', 0)
        
        if hyper_planets_count <= 0:
            return jsonify({'error': 'Invalid hyper planets count'}), 400
        
        user_id = current_user.id
        stats = UserSpaceStats.get_or_create(user_id)
        
        # Update hyper planets count
        stats.update_hyper_planets(hyper_planets_count)
        
        # Log the activity
        UserActivity.log_activity(
            page_visited='hyper_planets_submitted',
            user_id=user_id,
            ip_address=request.remote_addr
        )
        
        return jsonify({
            'success': True,
            'hyper_planets_submitted': hyper_planets_count,
            'total_hyper_planets': stats.hyper_planets_found,
            'message': f'Successfully submitted {hyper_planets_count} Hyper Planets!'
        })
        
    except Exception as e:
        print(f"Error submitting hyper planets: {e}")
        db.session.rollback()
        return jsonify({'error': 'Failed to submit hyper planets'}), 500

@app.route('/api/leaderboard', methods=['GET'])
def get_leaderboard():
    """Get leaderboard data for space exploration"""
    try:
        limit = request.args.get('limit', 10, type=int)
        leaderboard_data = UserSpaceStats.get_leaderboard_data(limit)
        
        # Format the data for the frontend
        formatted_data = []
        for rank, (stats, user) in enumerate(leaderboard_data, 1):
            formatted_data.append({
                'rank': rank,
                'username': user.username,
                'total_systems': stats.total_systems_generated,
                'rarest_discovery': {
                    'name': stats.rarest_discovery_name,
                    'type': stats.rarest_discovery_type,
                    'rarity_class': stats.rarity_class,
                    'discovery_chance': stats.discovery_chance
                },
                'habitable_worlds': stats.habitable_worlds_found,
                'legendary_systems': stats.legendary_systems_saved,
                'last_discovery': stats.last_discovery_date.isoformat() if stats.last_discovery_date else None
            })
        
        return jsonify({
            'leaderboard': formatted_data,
            'status': 'success'
        })
        
    except Exception as e:
        print(f"Error fetching leaderboard: {e}")
        return jsonify({'error': 'Failed to fetch leaderboard'}), 500

# Boss Battle API Endpoints
def ensure_boss_exists():
    """Ensure that boss 1 (The Cosmic Leviathan) exists in the database"""
    try:
        # Check if any boss exists
        existing_boss = Boss.query.first()
        if not existing_boss:
            print("No boss found in database, creating The Cosmic Leviathan...")
            boss = Boss.create_cosmic_leviathan()
            db.session.add(boss)
            db.session.commit()
            print(f"✅ Created boss: {boss.name}")
            return boss
        
        # Check if there's an active boss
        active_boss = Boss.get_active_boss()
        if not active_boss:
            print("No active boss found, activating the first boss...")
            existing_boss.is_active = True
            db.session.commit()
            return existing_boss
            
        return active_boss
        
    except Exception as e:
        print(f"Error ensuring boss exists: {e}")
        return None

@app.route('/api/boss/status', methods=['GET'])
def get_boss_status():
    """Get current boss status and stats"""
    try:
        # Ensure boss exists
        boss = ensure_boss_exists()
        if not boss:
            return jsonify({'error': 'Failed to initialize boss'}), 500
        
        return jsonify({
            'boss': boss.to_dict(),
            'status': 'success'
        })
        
    except Exception as e:
        print(f"Error fetching boss status: {e}")
        return jsonify({'error': 'Failed to fetch boss status'}), 500

@app.route('/api/boss/attack', methods=['POST'])
def attack_boss():
    """Attack the boss with Hyper Planets"""
    try:
        print("=== BOSS ATTACK DEBUG ===")
        print(f"User authenticated: {current_user.is_authenticated}")
        
        if not current_user.is_authenticated:
            return jsonify({'error': 'Authentication required'}), 401
        
        # Ensure boss exists
        print("Ensuring boss exists...")
        boss = ensure_boss_exists()
        if not boss:
            print("Failed to ensure boss exists")
            return jsonify({'error': 'Failed to initialize boss'}), 500
        
        print(f"Boss found: {boss.name}, Health: {boss.current_health}")
        
        # Get attack data from request
        data = request.get_json()
        print(f"Request data: {data}")
        damage = data.get('damage', 1)  # Default damage
        # HYPER STAR ATTACK (COMMENTED OUT - Using Hyper Planets instead)
        # hyper_stars_used = data.get('hyper_stars_used', 1)
        # print(f"Damage: {damage}, Hyper stars used: {hyper_stars_used}")
        hyper_planets_used = data.get('hyper_planets_used', 1)
        print(f"Damage: {damage}, Hyper planets used: {hyper_planets_used}")
        
        # Check if user has hyper planets
        print("Getting user stats...")
        user_stats = UserSpaceStats.get_or_create(current_user.id)
        # HYPER STAR CHECK (COMMENTED OUT)
        # print(f"User hyper stars: {user_stats.hyper_stars_found}")
        # if user_stats.hyper_stars_found < hyper_stars_used:
        #     print("Not enough hyper stars")
        #     return jsonify({'error': 'Not enough hyper stars available'}), 400
        print(f"User hyper planets: {user_stats.hyper_planets_found}")
        if user_stats.hyper_planets_found < hyper_planets_used:
            print("Not enough hyper planets")
            return jsonify({'error': 'Not enough hyper planets available'}), 400
        
        # Deduct hyper planets
        print("Deducting hyper planets...")
        # HYPER STAR DEDUCTION (COMMENTED OUT)
        # user_stats.hyper_stars_found -= hyper_stars_used
        user_stats.hyper_planets_found -= hyper_planets_used
        user_stats.updated_at = datetime.utcnow()
        
        # Apply damage to boss
        print("Applying damage to boss...")
        boss_defeated = boss.take_damage(damage)
        # Note: participant count and rounds fought are managed separately as global stats
        print(f"Boss health after damage: {boss.current_health}")
        
        # Commit changes
        print("Committing to database...")
        db.session.commit()
        print("Database commit successful")
        
        # Log the attack
        UserActivity.log_activity(
            page_visited='boss_attack',
            user_id=current_user.id,
            ip_address=request.remote_addr
        )
        
        return jsonify({
            'success': True,
            'damage': damage,
            # HYPER STAR RESPONSE (COMMENTED OUT)
            # 'hyper_stars_remaining': user_stats.hyper_stars_found,
            'hyper_planets_remaining': user_stats.hyper_planets_found,
            'boss_health': boss.current_health,
            'boss_health_percentage': boss.get_health_percentage(),
            'boss_defeated': boss_defeated,
            # HYPER STAR MESSAGE (COMMENTED OUT)
            # 'message': f'Dealt {damage} damage! {user_stats.hyper_stars_found} hyper stars remaining.'
            'message': f'Dealt {damage} damage! {user_stats.hyper_planets_found} hyper planets remaining.'
        })
        
    except Exception as e:
        print(f"=== BOSS ATTACK ERROR ===")
        print(f"Error attacking boss: {e}")
        import traceback
        traceback.print_exc()
        db.session.rollback()
        return jsonify({'error': f'Failed to attack boss: {str(e)}'}), 500

@app.route('/api/boss/launch-all', methods=['POST'])
@login_required
def launch_all_hyper_planets():
    """Launch all Hyper Planets at once for massive damage."""
    try:
        data = request.get_json()
        # HYPER STAR LAUNCH (COMMENTED OUT - Using Hyper Planets instead)
        # hyper_stars_used = data.get('hyper_stars_used', 0)
        # 
        # if hyper_stars_used <= 0:
        #     return jsonify({
        #         'success': False,
        #         'error': 'No Hyper Stars to launch'
        #     })
        hyper_planets_used = data.get('hyper_planets_used', 0)
        
        if hyper_planets_used <= 0:
            return jsonify({
                'success': False,
                'error': 'No Hyper Planets to launch'
            })
        
        # Get user stats
        user_stats = UserSpaceStats.get_or_create(current_user.id)
        
        # Check if user has enough Hyper Planets
        # HYPER STAR CHECK (COMMENTED OUT)
        # if user_stats.hyper_stars_found < hyper_stars_used:
        #     return jsonify({
        #         'success': False,
        #         'error': 'Not enough Hyper Stars'
        #     })
        if user_stats.hyper_planets_found < hyper_planets_used:
            return jsonify({
                'success': False,
                'error': 'Not enough Hyper Planets'
            })
        
        # Get active boss
        boss = Boss.get_active_boss()
        if not boss:
            return jsonify({
                'success': False,
                'error': 'No active boss found'
            })
        
        # Calculate total damage (1 damage per Hyper Planet)
        total_damage = hyper_planets_used
        
        print(f"Launching all {hyper_planets_used} Hyper Planets for {total_damage} total damage")
        
        # Deduct all Hyper Planets
        print("Deducting all Hyper Planets...")
        # HYPER STAR DEDUCTION (COMMENTED OUT)
        # user_stats.hyper_stars_found -= hyper_stars_used
        user_stats.hyper_planets_found -= hyper_planets_used
        user_stats.updated_at = datetime.utcnow()
        
        # Apply damage to boss
        print("Applying massive damage to boss...")
        boss_defeated = boss.take_damage(total_damage)
        print(f"Boss health after massive damage: {boss.current_health}")
        
        # Commit changes
        print("Committing to database...")
        db.session.commit()
        print("Database commit successful")
        
        # Log the massive attack
        UserActivity.log_activity(
            page_visited='boss_launch_all',
            user_id=current_user.id,
            ip_address=request.remote_addr
        )
        
        return jsonify({
            'success': True,
            'total_damage': total_damage,
            # HYPER STAR RESPONSE (COMMENTED OUT)
            # 'hyper_stars_remaining': user_stats.hyper_stars_found,
            'hyper_planets_remaining': user_stats.hyper_planets_found,
            'boss_health': boss.current_health,
            'boss_health_percentage': boss.get_health_percentage(),
            'boss_defeated': boss_defeated,
            # HYPER STAR MESSAGE (COMMENTED OUT)
            # 'message': f'🚀 LAUNCHED ALL {hyper_stars_used} HYPER STARS! Dealt {total_damage} massive damage!'
            'message': f'🚀 LAUNCHED ALL {hyper_planets_used} HYPER PLANETS! Dealt {total_damage} massive damage!'
        })
        
    except Exception as e:
        print(f"Error in launch all attack: {e}")
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': f'Failed to launch all Hyper Planets: {str(e)}'
        }), 500

# HYPER STAR GET ENDPOINT (COMMENTED OUT - Using Hyper Planets instead)
# @app.route('/api/user/hyper-stars', methods=['GET'])
# @login_required
# def get_user_hyper_stars():
#     """Get user's current Hyper Star count"""
#     try:
#         user_stats = UserSpaceStats.get_or_create(current_user.id)
#         return jsonify({
#             'success': True,
#             'hyper_stars_count': user_stats.hyper_stars_found
#         })
#     except Exception as e:
#         print(f"Error fetching user Hyper Stars: {e}")
#         return jsonify({
#             'success': False,
#             'error': f'Failed to fetch Hyper Star count: {str(e)}'
#         }), 500

@app.route('/api/user/hyper-planets', methods=['GET'])
@login_required
def get_user_hyper_planets():
    """Get user's current Hyper Planet count"""
    try:
        user_stats = UserSpaceStats.get_or_create(current_user.id)
        return jsonify({
            'success': True,
            'hyper_planets_count': user_stats.hyper_planets_found
        })
    except Exception as e:
        print(f"Error fetching user Hyper Planets: {e}")
        return jsonify({
            'success': False,
            'error': f'Failed to fetch Hyper Planet count: {str(e)}'
        }), 500

# HYPER STAR SUBMIT ENDPOINT (COMMENTED OUT - Using Hyper Planets instead)
# @app.route('/api/hyper-stars/submit', methods=['POST'])
# @login_required
# def submit_hyper_stars():
#     """Submit Hyper Stars to user's stats"""
#     try:
#         data = request.get_json()
#         hyper_stars_count = data.get('hyper_stars_count', 0)
#         
#         if hyper_stars_count <= 0:
#             return jsonify({
#                 'success': False,
#                 'error': 'No Hyper Stars to submit'
#             }), 400
#         
#         user_stats = UserSpaceStats.get_or_create(current_user.id)
#         user_stats.hyper_stars_found += hyper_stars_count
#         user_stats.updated_at = datetime.utcnow()
#         
#         db.session.commit()
#         
#         return jsonify({
#             'success': True,
#             'total_hyper_stars': user_stats.hyper_stars_found,
#             'message': f'Successfully added {hyper_stars_count} Hyper Stars to your collection!'
#         })
#         
#     except Exception as e:
#         print(f"Error submitting Hyper Stars: {e}")
#         db.session.rollback()
#         return jsonify({
#             'success': False,
#             'error': f'Failed to submit Hyper Stars: {str(e)}'
#         }), 500

# NOTE: submit_hyper_planets() is already defined earlier in the file (line ~826)
# This duplicate definition has been removed to fix the AssertionError

@app.route('/api/boss/stats', methods=['GET'])
def get_boss_stats():
    """Get global boss battle statistics"""
    try:
        # Ensure boss exists first
        boss = ensure_boss_exists()
        if not boss:
            return jsonify({'error': 'Failed to initialize boss'}), 500
            
        stats = Boss.get_boss_stats()
        return jsonify({
            'stats': stats,
            'status': 'success'
        })
        
    except Exception as e:
        print(f"Error fetching boss stats: {e}")
        return jsonify({'error': 'Failed to fetch boss stats'}), 500

@app.route('/api/boss/debug', methods=['GET'])
def debug_boss_system():
    """Debug endpoint to check boss system status"""
    try:
        print("=== BOSS DEBUG ENDPOINT ===")
        
        # Test database connection
        print("Testing database connection...")
        db.session.execute('SELECT 1')
        print("Database connection: OK")
        
        # Test Boss model
        print("Testing Boss model...")
        boss_count = Boss.query.count()
        print(f"Total bosses in database: {boss_count}")
        
        # Test UserSpaceStats model
        print("Testing UserSpaceStats model...")
        if current_user.is_authenticated:
            user_stats = UserSpaceStats.get_or_create(current_user.id)
            print(f"User stats found: {user_stats.hyper_planets_found} hyper planets")
        else:
            print("User not authenticated")
        
        # Test ensure_boss_exists
        print("Testing ensure_boss_exists...")
        boss = ensure_boss_exists()
        if boss:
            print(f"Boss exists: {boss.name}, Health: {boss.current_health}")
        else:
            print("Failed to ensure boss exists")
        
        return jsonify({
            'status': 'success',
            'database_connection': 'OK',
            'boss_count': boss_count,
            'user_authenticated': current_user.is_authenticated,
            'boss_exists': boss is not None
        })
        
    except Exception as e:
        print(f"=== BOSS DEBUG ERROR ===")
        print(f"Debug error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Debug failed: {str(e)}'}), 500

@app.route('/api/boss/reset', methods=['POST'])
def reset_boss():
    """Reset boss to full health (admin function)"""
    try:
        if not current_user.is_authenticated:
            return jsonify({'error': 'Authentication required'}), 401
        
        # For now, allow any authenticated user to reset
        # TODO: Add admin role check
        
        # Ensure boss exists
        boss = ensure_boss_exists()
        if not boss:
            return jsonify({'error': 'Failed to initialize boss'}), 500
        
        boss.reset_boss()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Boss has been reset to full health!',
            'boss_health': boss.current_health
        })
        
    except Exception as e:
        print(f"Error resetting boss: {e}")
        return jsonify({'error': 'Failed to reset boss'}), 500

# Add this function to check environment
def is_production():
    if 'HTTP_HOST' in request.environ:
        return request.environ['HTTP_HOST'].endswith('.io')
    return False


if __name__ == '__main__':
    try:
        # Validate production configuration if needed
        if config_name == 'production':
            ProductionConfig.validate_production_config()
        
        # Log startup information
        log_startup_info()
        
        # Initialize database tables on startup
        print("Initializing database...")
        init_database()
        
        # Run the application
        app.run(debug=app.config.get('DEBUG', False))
        
    except ValueError as e:
        print(f"❌ Configuration Error: {e}")
        print("Please check your environment variables and try again.")
        exit(1)
    except Exception as e:
        print(f"❌ Startup Error: {e}")
        exit(1)
