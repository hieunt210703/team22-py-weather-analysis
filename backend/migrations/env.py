from logging.config import fileConfig

from alembic import context

from weather_analysis.database import Base, get_engine
from weather_analysis import models


config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name, disable_existing_loggers=False)

target_metadata = Base.metadata


def run_migrations_online() -> None:
    """Chạy migration bằng kết nối database đang được cấu hình."""
    with get_engine().connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)

        with context.begin_transaction():
            context.run_migrations()


run_migrations_online()
