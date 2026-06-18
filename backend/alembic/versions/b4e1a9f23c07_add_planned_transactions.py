"""add_planned_transactions

Revision ID: b4e1a9f23c07
Revises: 730a7d107d44
Create Date: 2026-06-17 20:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'b4e1a9f23c07'
down_revision: Union[str, Sequence[str], None] = '730a7d107d44'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column('transactions', 'account_id', nullable=True)
    op.add_column('transactions', sa.Column('is_planned', sa.Boolean(), nullable=False, server_default='false'))


def downgrade() -> None:
    op.drop_column('transactions', 'is_planned')
    op.alter_column('transactions', 'account_id', nullable=False)
