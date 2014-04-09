from flask import render_template
from imh import app

@app.route('/')
def index():
    return render_template('layout.html')
