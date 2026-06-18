"""add_first_payment_to_loans

Revision ID: c9faad279659
Revises: d9e4b1f7c823
Create Date: 2026-06-18 12:32:56.256589

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c9faad279659'
down_revision: Union[str, Sequence[str], None] = 'd9e4b1f7c823'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
