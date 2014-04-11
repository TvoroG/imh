from flask.ext.script import Manager
from flask.ext.migrate import Migrate, MigrateCommand

from imh import app
from imh.models import *

migrate = Migrate(app, db, 'imh/migrations')
manager = Manager(app)

manager.add_command('db', MigrateCommand)


if __name__ == '__main__':
    manager.run()


