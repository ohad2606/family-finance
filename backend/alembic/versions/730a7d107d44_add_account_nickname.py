"""add_account_nickname

Revision ID: 730a7d107d44
Revises: 7cc9dfdfa3c6
Create Date: 2026-06-17 12:05:33.974577

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '730a7d107d44'
down_revision: Union[str, Sequence[str], None] = '7cc9dfdfa3c6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('accounts', sa.Column('nickname', sa.String(100), nullable=True))


def downgrade() -> None:
    op.drop_column('accounts', 'nickname')
