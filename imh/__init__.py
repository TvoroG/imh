from flask import Flask
from models import db

app = Flask(__name__)
app.config.from_object('imh.configs.settings')
try:
    app.config.from_envvar('BMFORK_SETTINGS')
except Exception as e:
    print e

db.init_app(app)


import views
