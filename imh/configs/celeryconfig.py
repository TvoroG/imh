from datetime import timedelta
from imh.tasks import instagram
from imh.tasks import vk


BROKER_URL = 'redis://localhost:6379/0'
CELERY_RESULT_BACKEND = 'redis://localhost:6379/0'
CELERY_ACCEPT_CONTENT = ['json', 'pickle']
CELERY_IMPORTS = ('imh.tasks',)

CELERYBEAT_SCHEDULE = {
    'instagram-photos-search-every-60-seconds': {
        'task': 'Instagram.media_search',
        'schedule': timedelta(seconds=60),
        'args': (instagram,)
    },
    'vk-photos-search-every-60-seconds': {
        'task': 'Vk.photos_search',
        'schedule': timedelta(seconds=60),
        'args': (vk,)
    },
	'twitter-search-every-10-second': {
		'task': 'twitter_search',
        'schedule': timedelta(seconds=10),
	}
}
