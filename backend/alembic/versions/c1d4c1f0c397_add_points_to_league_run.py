"""Add points to league run

Revision ID: c1d4c1f0c397
Revises: 14c09d0b2be4
Create Date: 2025-06-09 10:41:52.641299

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c1d4c1f0c397'
down_revision: Union[str, None] = '14c09d0b2be4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('league_run', sa.Column('points', sa.Integer(), nullable=True))
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('league_run', 'points')
    # ### end Alembic commands ###
