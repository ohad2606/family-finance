"""add_account_display_fields

Revision ID: 7cc9dfdfa3c6
Revises: 192e271a5632
Create Date: 2026-06-17 11:57:05.232994

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '7cc9dfdfa3c6'
down_revision: Union[str, Sequence[str], None] = '192e271a5632'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('accounts', sa.Column('credit_limit', sa.Numeric(14, 2), nullable=True))
    op.add_column('accounts', sa.Column('show_on_dashboard', sa.Boolean(), nullable=False, server_default=sa.text('TRUE')))
    op.add_column('accounts', sa.Column('include_in_totals', sa.Boolean(), nullable=False, server_default=sa.text('TRUE')))


def downgrade() -> None:
    op.drop_column('accounts', 'include_in_totals')
    op.drop_column('accounts', 'show_on_dashboard')
    op.drop_column('accounts', 'credit_limit')
