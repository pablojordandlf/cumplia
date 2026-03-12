import asyncio
import sys
from logging.config import fileConfig

from sqlalchemy import engine_from_config
from sqlalchemy import pool

from alembic import context

# This is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Add the application's path to sys.path so that Alembic can find the models
# Assuming the alembic directory is 'alembic' and models are in 'apps/api'
# Adjust this path if your directory structure is different.
# The current working directory during execution is /home/pablojordan/.openclaw/workspace
# So, 'apps/api' should be correct assuming alembic is at apps/api/alembic
sys.path.insert(0, "apps/api")


# import all models within the app/api directory
# This is crucial so that they are discovered by Alembic
from models.base import Base  # Import Base from your base model definition
# Import all other models here or ensure they are imported by models.base
# For example:
# from models.organization import Organization
# from models.user import User

# add your model's MetaData object here
# for 'autogenerate' support
target_metadata = Base.metadata

# other values from the config, defined by the needs of env.py,
# can be acquired to use strictly as values.
#
# example:
# my_other_value = config.get_main_option("my_other_value")
#
# If you are using multi-threading, then you need to ensure that
# the 'async_redis' argument is set to True in the 'create_engine' call
# or configure a custom pool type.
#
# For more information refer to:
# https://docs.sqlalchemy.org/en/13/core/pooling.html#sqlalchemy.create_engine


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.

    This configures the context with just a URL
    and not an Engine, though an Engine is acceptable
    here as well. By skipping the Engine creation
    we don't even need a DBAPI.
    
    """
    url = config.get_main_option("sqlalchemy.url")
    
    # Fallback to DATABASE_URL from environment if not set in alembic.ini
    if not url:
        from core.config import settings
        url = settings.DATABASE_URL
        
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode.

    In this mode we'll create an Engine
    and associate a connection with the context.
    
    """
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    # Fallback to DATABASE_URL from environment if not set in alembic.ini
    if not connectable.url:
        from core.config import settings
        connectable.url = settings.DATABASE_URL

    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
