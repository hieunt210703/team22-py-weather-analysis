"""Thêm tên gọi khác cho địa điểm."""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = "0004"
down_revision: str | None = "0003"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "locations",
        sa.Column("aliases", sa.Unicode(length=500), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("locations", "aliases")
