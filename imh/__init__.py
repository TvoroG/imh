from flask import Flask

from admin import admin
from api import api
from models import db


app = Flask(__name__)
app.config.from_object('imh.configs.settings')
try:
    app.config.from_envvar('IMH_SETTINGS')
except Exception as e:
    print e


db.init_app(app)
admin.init_app(app)
api.init_app(app)


import views
