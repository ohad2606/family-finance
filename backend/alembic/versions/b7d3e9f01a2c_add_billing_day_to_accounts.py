"""add_billing_day_to_accounts

Revision ID: b7d3e9f01a2c
Revises: a1b2c3d4e5f6
Create Date: 2026-07-04 18:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = 'b7d3e9f01a2c'
down_revision: Union[str, None] = 'a1b2c3d4e5f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('accounts', sa.Column('billing_day', sa.Integer(), nullable=True))


def downgrade() -> None:
    op.drop_column('accounts', 'billing_day')
