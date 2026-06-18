"""security: token_version + audit ip/ua

Revision ID: c3f8a2e91d05
Revises: b4e1a9f23c07
Create Date: 2026-06-18
"""
from alembic import op
import sqlalchemy as sa

revision = 'c3f8a2e91d05'
down_revision = 'b4e1a9f23c07'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('users', sa.Column('token_version', sa.Integer(), nullable=False, server_default='1'))
    op.add_column('audit_log', sa.Column('ip_address', sa.String(45), nullable=True))
    op.add_column('audit_log', sa.Column('user_agent', sa.String(500), nullable=True))


def downgrade() -> None:
    op.drop_column('audit_log', 'user_agent')
    op.drop_column('audit_log', 'ip_address')
    op.drop_column('users', 'token_version')
