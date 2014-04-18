# -*- coding: utf-8 -*-
from celery import Celery
import vk_api
from models import db, Entity, Image

celery = Celery('tasks', config_source='imh.configs.celeryconfig')

KAZAN_LAT = 55.47
KAZAN_LONG = 49.08
RADIUS_M = 6000
VK_SITE, TWITTER_SITE, INSTAGRAM_SITE = 'vk', 'twitter', 'instagram'

vk = vk_api.VkApi()

@celery.task(name='vk_photos_search')
def vk_photos_search():
    params = {
        'lat': KAZAN_LAT,
        'long': KAZAN_LONG,
        'radius': RADIUS_M,
        'count': 50
    }
    response = vk.method('photos.search', params)
    items = response['items']
    uitems = get_unique_items(items, VK_SITE)

    entities = []
    images = []
    for ui in uitems:
        p = get_vk_photo(ui)
        entity = Entity(VK_SITE, p['id'], p['text'],
                        p['lat'], p['long'])
        image = Image(p['photo_75'], p['photo_604'],
                      p['photo_1280'], entity)
        entities.append(entity)
        images.append(image)
        
    db.session.add_all(entities)
    db.session.add_all(images)
    db.session.commit()

    return len(entities)


def get_vk_photo(item):
    return dict(
        id=item.get('id'),
        text=item.get('text'),
        lat=item.get('lat'),
        long=item.get('long'),
        photo_75=item.get('photo_75'),
        photo_604=item.get('photo_604'),
        photo_1280=item.get('photo_1280')
    )


def get_unique_items(items, site):
    ids = [i['id'] for i in items]
    eid = Entity.query.filter(Entity.alien_id.in_(ids),
                              Entity.alien_site==site)
    uids = set(ids) - set(eid)
    return [i for i in items if i['id'] in uids]

