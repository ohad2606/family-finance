"""add loan track fields

Revision ID: a1b2c3d4e5f6
Revises: c9faad279659
Create Date: 2026-06-18

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'a1b2c3d4e5f6'
down_revision = 'c9faad279659'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Applied directly via psql; this revision just records the migration.
    pass


def downgrade() -> None:
    op.drop_column('loans', 'cpi_rate')
    op.drop_column('loans', 'interest_type')
    op.drop_column('loans', 'payment_day')
