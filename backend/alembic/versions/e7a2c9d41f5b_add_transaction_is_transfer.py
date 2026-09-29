"""Add is_transfer to transactions (credit card bill payments from checking)

Revision ID: e7a2c9d41f5b
Revises: d1f3e8a02b4c
Create Date: 2026-09-29
"""
from alembic import op
import sqlalchemy as sa

revision = 'e7a2c9d41f5b'
down_revision = 'd1f3e8a02b4c'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('transactions', sa.Column('is_transfer', sa.Boolean(), server_default='false', nullable=False))


def downgrade():
    op.drop_column('transactions', 'is_transfer')
