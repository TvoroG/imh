from datetime import timedelta
from imh.tasks import vk

BROKER_URL = 'redis://localhost:6379/0'
CELERY_RESULT_BACKEND = 'redis://localhost:6379/0'
CELERY_ACCEPT_CONTENT = ['json', 'pickle']
CELERY_IMPORTS = ('imh.tasks',)

CELERYBEAT_SCHEDULE = {
    'vk-photos-search-every-10-seconds': {
        'task': 'Vk.photos_search',
        'schedule': timedelta(seconds=10),
        'args': (vk,)
    }
}
