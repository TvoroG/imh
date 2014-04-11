from flask import Flask
from flask.ext.login import LoginManager

from models import db
from admin import admin


app = Flask(__name__)
app.config.from_object('imh.configs.settings')
try:
    app.config.from_envvar('IMH_SETTINGS')
except Exception as e:
    print e


login_manager = LoginManager()
login_manager.login_view = 'login'


db.init_app(app)
admin.init_app(app)
login_manager.init_app(app)


import views
