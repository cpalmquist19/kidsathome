import logging
import os
from logging.config import fileConfig

from flask import current_app

from alembic import context

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
# This line sets up loggers basically.
fileConfig(config.config_file_name)
logger = logging.getLogger('alembic.env')

def get_environment():
    """
    Environment detection for migrations - simplified version of main app detection.
    Uses FLASK_ENV variable or defaults to development.
    """
    flask_env = os.environ.get('FLASK_ENV', 'development')
    return flask_env if flask_env in ['production', 'development'] else 'development'

def get_database_url():
    """Get database URL based on detected environment for migrations"""
    flask_env = get_environment()
    
    if flask_env == 'production':
        # Production database configuration
        mysql_config = {
            'host': os.environ.get('PRODUCTION_DB_HOST'),
            'port': int(os.environ.get('PRODUCTION_DB_PORT', 3306)),
            'user': os.environ.get('PRODUCTION_DB_USER'),
            'password': os.environ.get('PRODUCTION_DB_PASSWORD'),
            'database': os.environ.get('PRODUCTION_DB_NAME')
        }
        return f"mysql+pymysql://{mysql_config['user']}:{mysql_config['password']}@{mysql_config['host']}:{mysql_config['port']}/{mysql_config['database']}"
    else:
        # Development database configuration
        mysql_config = {
            'host': os.environ.get('LOCAL_MYSQL_HOST', 'localhost'),
            'port': int(os.environ.get('LOCAL_MYSQL_PORT', 3306)),
            'user': os.environ.get('LOCAL_MYSQL_USER', 'root'),
            'password': os.environ.get('LOCAL_MYSQL_PASSWORD', ''),
            'database': os.environ.get('LOCAL_MYSQL_DATABASE', 'kidsathome')
        }
        return f"mysql+pymysql://{mysql_config['user']}:{mysql_config['password']}@{mysql_config['host']}:{mysql_config['port']}/{mysql_config['database']}"


def get_engine():
    try:
        # this works with Flask-SQLAlchemy<3 and Alchemical
        return current_app.extensions['migrate'].db.get_engine()
    except (TypeError, AttributeError):
        # this works with Flask-SQLAlchemy>=3
        return current_app.extensions['migrate'].db.engine


def get_engine_url():
    try:
        return get_engine().url.render_as_string(hide_password=False).replace(
            '%', '%%')
    except AttributeError:
        return str(get_engine().url).replace('%', '%%')


# add your model's MetaData object here
# for 'autogenerate' support
# Import all models to ensure they are registered with SQLAlchemy
from models import UserModel, PasswordResetToken, GeneratedSystem, UserActivity, UserSpaceStats

# Set database URL based on environment detection
try:
    # Try to get URL from environment detection first
    database_url = get_database_url()
    config.set_main_option('sqlalchemy.url', database_url)
    logger.info(f"Using database URL from environment detection: {database_url.split('@')[0]}@***")
except Exception as e:
    # Fallback to engine URL if environment detection fails
    logger.warning(f"Environment detection failed, using engine URL: {e}")
    config.set_main_option('sqlalchemy.url', get_engine_url())
target_db = current_app.extensions['migrate'].db

# other values from the config, defined by the needs of env.py,
# can be acquired:
# my_important_option = config.get_main_option("my_important_option")
# ... etc.


def get_metadata():
    if hasattr(target_db, 'metadatas'):
        return target_db.metadatas[None]
    return target_db.metadata


def run_migrations_offline():
    """Run migrations in 'offline' mode.

    This configures the context with just a URL
    and not an Engine, though an Engine is acceptable
    here as well.  By skipping the Engine creation
    we don't even need a DBAPI to be available.

    Calls to context.execute() here emit the given string to the
    script output.

    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url, target_metadata=get_metadata(), literal_binds=True
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online():
    """Run migrations in 'online' mode.

    In this scenario we need to create an Engine
    and associate a connection with the context.

    """

    # this callback is used to prevent an auto-migration from being generated
    # when there are no changes to the schema
    # reference: http://alembic.zzzcomputing.com/en/latest/cookbook.html
    def process_revision_directives(context, revision, directives):
        if getattr(config.cmd_opts, 'autogenerate', False):
            script = directives[0]
            if script.upgrade_ops.is_empty():
                directives[:] = []
                logger.info('No changes in schema detected.')

    conf_args = current_app.extensions['migrate'].configure_args
    if conf_args.get("process_revision_directives") is None:
        conf_args["process_revision_directives"] = process_revision_directives

    connectable = get_engine()

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=get_metadata(),
            **conf_args
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
