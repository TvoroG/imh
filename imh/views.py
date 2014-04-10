from flask import render_template, make_response
from imh import app

@app.route('/')
def index():
    return make_response(open('imh/templates/index.html').read())
