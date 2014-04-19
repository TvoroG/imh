import os
from urlparse import urlparse

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

DEBUG = True

try:
    db_uri = urlparse(os.environ['DATABASE_URL'])
    SQLALCHEMY_DATABASE_URI = 'postgresql://' + db_uri.netloc + db_uri.path
except KeyError as e:
    SQLALCHEMY_DATABASE_URI = 'postgresql://user:password@localhost/dbname'

WTF_CSRF_ENABLED = False
