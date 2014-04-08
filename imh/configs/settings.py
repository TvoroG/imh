import os
BASE_DIR = os.path.abspath(os.path.dirname(__file__))

DEBUG = True

# DB, override in local configs
SQLALCHEMY_DATABASE_URI = 'postgresql://user:password@localhost/dbname'
