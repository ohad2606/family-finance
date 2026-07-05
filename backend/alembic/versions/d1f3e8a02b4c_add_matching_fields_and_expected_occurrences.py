"""Add matching fields to recurring_rules and expected_occurrences table

Revision ID: d1f3e8a02b4c
Revises: c4e8f2a03b1d
Create Date: 2026-07-05
"""
from alembic import op
import sqlalchemy as sa

revision = 'd1f3e8a02b4c'
down_revision = 'c4e8f2a03b1d'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('recurring_rules', sa.Column('match_pattern', sa.String(255), nullable=True))
    op.add_column('recurring_rules', sa.Column('amount_tolerance_pct', sa.Numeric(5, 2), server_default='15', nullable=False))
    op.add_column('recurring_rules', sa.Column('match_window_days', sa.SmallInteger(), server_default='12', nullable=False))
    op.add_column('recurring_rules', sa.Column('grace_days', sa.SmallInteger(), server_default='5', nullable=False))

    op.execute("""
        DO $$ BEGIN
            CREATE TYPE occurrence_kind AS ENUM ('income', 'expense');
        EXCEPTION WHEN duplicate_object THEN null;
        END $$;
    """)
    op.execute("""
        DO $$ BEGIN
            CREATE TYPE occurrence_status AS ENUM ('pending', 'matched', 'overdue', 'skipped');
        EXCEPTION WHEN duplicate_object THEN null;
        END $$;
    """)

    # Use raw SQL to avoid SQLAlchemy re-creating the enums via _on_table_create
    op.execute("""
        CREATE TABLE expected_occurrences (
            id SERIAL PRIMARY KEY,
            household_id INTEGER NOT NULL REFERENCES households(id),
            rule_id INTEGER NOT NULL REFERENCES recurring_rules(id),
            due_date DATE NOT NULL,
            expected_amount NUMERIC(14, 2) NOT NULL,
            kind occurrence_kind NOT NULL,
            status occurrence_status NOT NULL DEFAULT 'pending',
            matched_transaction_id INTEGER UNIQUE REFERENCES transactions(id),
            matched_at TIMESTAMPTZ,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            CONSTRAINT uq_occurrence_rule_date UNIQUE (rule_id, due_date)
        )
    """)
    op.create_index('ix_expected_occurrences_household_id', 'expected_occurrences', ['household_id'])
    op.create_index('ix_expected_occurrences_rule_id', 'expected_occurrences', ['rule_id'])
    op.create_index('ix_expected_occurrences_due_date', 'expected_occurrences', ['due_date'])


def downgrade():
    op.drop_index('ix_expected_occurrences_due_date', 'expected_occurrences')
    op.drop_index('ix_expected_occurrences_rule_id', 'expected_occurrences')
    op.drop_index('ix_expected_occurrences_household_id', 'expected_occurrences')
    op.drop_table('expected_occurrences')
    op.execute("DROP TYPE IF EXISTS occurrence_status")
    op.execute("DROP TYPE IF EXISTS occurrence_kind")
    op.drop_column('recurring_rules', 'grace_days')
    op.drop_column('recurring_rules', 'match_window_days')
    op.drop_column('recurring_rules', 'amount_tolerance_pct')
    op.drop_column('recurring_rules', 'match_pattern')
