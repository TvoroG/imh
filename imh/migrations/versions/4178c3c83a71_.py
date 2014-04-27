"""empty message

Revision ID: 4178c3c83a71
Revises: 4776348aabe9
Create Date: 2014-04-24 23:18:56.857938

"""

# revision identifiers, used by Alembic.
revision = '4178c3c83a71'
down_revision = '4776348aabe9'

from alembic import op
import sqlalchemy as sa


def upgrade():
    ### commands auto generated by Alembic - please adjust! ###
    op.add_column('entities', sa.Column('created', sa.DateTime(), nullable=True))
    ### end Alembic commands ###


def downgrade():
    ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('entities', 'created')
    ### end Alembic commands ###
