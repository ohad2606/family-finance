"""add_revolving_amount_to_accounts

Revision ID: c4e8f2a03b1d
Revises: b7d3e9f01a2c
Create Date: 2026-07-04 20:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = 'c4e8f2a03b1d'
down_revision: Union[str, None] = 'b7d3e9f01a2c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('accounts', sa.Column('revolving_amount', sa.Numeric(14, 2), nullable=True))


def downgrade() -> None:
    op.drop_column('accounts', 'revolving_amount')
