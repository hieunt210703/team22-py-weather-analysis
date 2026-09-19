"""Tạo bảng locations."""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = "0002"
down_revision: str | None = "0001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "locations",
        sa.Column("id", sa.Integer(), sa.Identity(), nullable=False),
        sa.Column(
            "name",
            sa.Unicode(length=100, collation="Vietnamese_CI_AS"),
            nullable=False,
        ),
        sa.Column("slug", sa.String(length=100), nullable=False),
        sa.Column("region_code", sa.String(length=50), nullable=False),
        sa.Column("region_label", sa.Unicode(length=100), nullable=False),
        sa.Column("temp_offset", sa.Float(), nullable=False),
        sa.Column("latitude", sa.Float(), nullable=False),
        sa.Column("longitude", sa.Float(), nullable=False),
        sa.Column("pin_order", sa.Integer(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("name"),
        sa.UniqueConstraint("slug"),
    )
    op.create_index(
        "ux_locations_pin_order",
        "locations",
        ["pin_order"],
        unique=True,
        mssql_where=sa.text("pin_order IS NOT NULL"),
    )


def downgrade() -> None:
    op.drop_index("ux_locations_pin_order", table_name="locations")
    op.drop_table("locations")
