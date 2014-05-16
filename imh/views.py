from flask import (render_template, make_response, url_for,
                   redirect, flash, g, request)
from imh import app
from utils import token_required
from models import User

@app.route('/')
def index():
    return make_response(open('imh/templates/index.html').read())
