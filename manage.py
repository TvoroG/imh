from flask.ext.script import Manager
from flask.ext.migrate import Migrate, MigrateCommand

from imh import app
from imh.models import *
from imh.tasks import celery

migrate = Migrate(app, db, 'imh/migrations')
manager = Manager(app)

manager.add_command('db', MigrateCommand)

@manager.command
def run_celery():
    celery.worker_main(['worker', '-A', 'imh.tasks.celery',
                  '-l', 'info', '--autoreload'])

if __name__ == '__main__':
    manager.run()


