# -*- coding: utf-8 -*-
import pytz
import time
from datetime import datetime, timedelta
from celery import Celery
from celery.contrib.methods import task_method
import vk_api
from models import db, Entity, Image

celery = Celery('tasks', config_source='imh.configs.celeryconfig')
vkapi = vk_api.VkApi()

KAZAN_LAT = 55.792403
KAZAN_LONG = 49.131203
RADIUS_M = 6000
VK_SITE, TWITTER_SITE, INSTAGRAM_SITE = 'vk', 'twitter', 'instagram'

class Vk(object):
    def __init__(self):
        self.url = 'https://vk.com/'
        self.params = {
            'lat': KAZAN_LAT,
            'long': KAZAN_LONG,
            'radius': RADIUS_M,
            'count': 50,
        }
        #TODO: get from db
        self.tz = pytz.timezone('Europe/Moscow')
        self.unix_ts = datetime(1970, 1, 1, tzinfo=self.tz)
        self.newest_item_time = None
        self.default_time_gap = timedelta(hours=1)

    @celery.task(filter=task_method, name='Vk.photos_search')
    def photos_search(self):
        self.params['start_time'] = self.get_start_time()
        items = self.fetch('photos.search', self.params)

        entities = []
        images = []
        for i in items:
            p = self.get_vk_photo(i)
            entity = Entity(VK_SITE, p['id'], p['text'],
                            p['lat'], p['lng'], p['url'],
                            p['created'])
            image = Image(p['photo_75'], p['photo_130'],
                          p['photo_1280'], entity)
            entities.append(entity)
            images.append(image)

        #self.get_newest_item_time(entities)
        db.session.add_all(entities)
        db.session.add_all(images)
        db.session.commit()
        
        return len(entities)

    def get_vk_photo(self, item):
        return dict(
            id=item.get('id'),
            text=item.get('text'),
            lat=item.get('lat'),
            lng=item.get('long'),
            photo_75=item.get('photo_75'),
            photo_130=item.get('photo_130'),
            photo_604=item.get('photo_604'),
            photo_1280=item.get('photo_1280'),
            url='{0}id{1}?z=photo{2}_{3}'.format(self.url,
                                                 item['owner_id'],
                                                 item['owner_id'],
                                                 item['id']),
            created=datetime.fromtimestamp(item.get('date'))
        )

    def fetch(self, method_name, params):
        response = vkapi.method(method_name, params)
        uitems = get_unique_items(response['items'], VK_SITE)
        return uitems

    def get_newest_item_time(self, es):
        if es:
            self.newest_item_time = es[0].created

    def get_start_time(self):
        return time.time() - (60 * 60)

def get_unique_items(items, site):
    ids = [i['id'] for i in items]
    eid = Entity.query.filter(Entity.alien_id.in_(ids),
                              Entity.alien_site==site)
    uids = set(ids) - set([e.alien_id for e in eid.all()])
    return [i for i in items if i['id'] in uids]


vk = Vk()
