# -*- coding: utf-8 -*-
import pytz
import time
from datetime import datetime, timedelta
from celery import Celery
from celery.contrib.methods import task_method
import vk_api
import twitter
from instagram.client import InstagramAPI
from models import db, Entity
import vk_api


celery = Celery('tasks', config_source='imh.configs.celeryconfig')
instagramapi = InstagramAPI(client_id='bfe8e851a9d6456eb66df9dfa53b72b1',  client_secret='3fd16bd409ca4bb683ac18f59181361a')
vkapi = vk_api.VkApi()
twitterapi = twitter.Api(consumer_key = 'TIntPKCNErHhw5vL0kD23Q8Nq', 
	consumer_secret ='mJ8akdjMId19HgXL2PLaWkomx2uss7jw12Xo7CygWXvl1j5nzf', 
	access_token_key='2437177848-4v92v7kv7HnKeS4yeagbPc7JgnTA4wZOzDrMdha', 
	access_token_secret='YbjMX0wQHTXXoMluSFh7LwiNDoVGm8msVQxxzRKY6ZmkN')

KAZAN_LAT = 55.792403
KAZAN_LONG = 49.131203
RADIUS_M = 6000
RADIUS_I = 5000
RADIUS_KM = '60km'
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
        for i in items:
            p = self.get_vk_photo(i)
            entity = Entity(VK_SITE, p['id'], p['text'],
                            p['lat'], p['lng'], p['url'],
                            p['created'], p['photo_75'],
                            p['photo_130'], p['photo_1280'])
            entities.append(entity)

        #self.get_newest_item_time(entities)
        db.session.add_all(entities)
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
        uitems = get_unique_items(response['items'], VK_SITE, lambda i: i['id'])
        return uitems

    def get_newest_item_time(self, es):
        if es:
            self.newest_item_time = es[0].created

    def get_start_time(self):
        return time.time() - (60 * 60)

def get_unique_items(items, site, key):
    ids = [key(i) for i in items]
    eid = Entity.query.filter(Entity.alien_id.in_(ids),
                              Entity.alien_site==site)
    uids = set(ids) - set([e.alien_id for e in eid.all()])
    return [i for i in items if key(i) in uids]


class Instagram(object):
    def __init__(self):
        self.params = {
            'lat': KAZAN_LAT,
            'lng': KAZAN_LONG,
            'distance': RADIUS_I,
            'count': 100,
        }
        self.tz = pytz.timezone('Europe/Moscow')
        self.unix_ts = datetime(1970, 1, 1, tzinfo=self.tz)
        self.newest_item_time = None
        self.default_time_gap = timedelta(hours=1)

    @celery.task(filter=task_method, name='Instagram.media_search')
    def photos_search(self):
        self.params['min_timestamp'] = self.get_start_time()
        items = self.fetch('media_search', self.params)

        entities = []
        for i in items:
            p = self.get_instagram_photo(i)
            entity = Entity(INSTAGRAM_SITE, p['id'], p['text'],
                            p['lat'], p['lng'], p['url'],
                            p['created'], p['photo_150'],
                            p['photo_306'], p['photo_612'])
            entities.append(entity)

        db.session.add_all(entities)
        db.session.commit()
        
        return len(entities)

    def get_instagram_photo(self, item):
        return dict(
            id=item.id,
            text=(item.caption and item.caption.text),
            lat=item.location.point.latitude,
            lng=item.location.point.longitude,
            photo_150=item.get_thumbnail_url(),
            photo_306=item.get_low_resolution_url(),
            photo_612=item.get_standard_resolution_url(),
            url=item.link,
            created=item.created_time
        )

    def fetch(self, method_name, params):
        response = instagramapi.media_search(**params)
        for i in response:
            i.id = int((i.id).replace("_" + i.user.id, "")) 
        uitems = self.get_unique_items(response, INSTAGRAM_SITE)
        return uitems

    def get_newest_item_time(self, es):
        if es:
            self.newest_item_time = es[0].created

    def get_start_time(self):
        return time.time() - (60 * 60)

    def get_unique_items(self, items, site):
        ids = [i.id for i in items]
        eid = Entity.query.filter(Entity.alien_id.in_(ids),
                                  Entity.alien_site==site)
        uids = set(ids) - set([e.alien_id for e in eid.all()])
        return [i for i in items if i.id in uids]


#twitter
@celery.task(filter=task_method, name='twitter_search')
def twitter_search():
    st = twitterapi.GetSearch(geocode=(KAZAN_LAT, KAZAN_LONG, RADIUS_KM), count=100)
    geo_items = [s for s in st if s.geo is not None]
    items = get_unique_items(geo_items, TWITTER_SITE, lambda i: i.id)

    entities = []
    for i in items:
        entity = Entity(TWITTER_SITE, i.id, i.text,
                        i.geo['coordinates'][0], i.geo['coordinates'][1], 
						'https://twitter.com/{0}/status/{1}'.format(i.user.screen_name, i.id),
                        datetime.fromtimestamp(i.created_at_in_seconds))
        entities.append(entity)

    db.session.add_all(entities)
    db.session.commit()
        
    return len(entities)

def twitter_user_tweets(name):
    st=twitterapi.GetUserTimeline(screen_name=name, count=200)
    geo_items = [s for s in st if s.geo is not None]

    entities = []
    for i in geo_items:
        entity = Entity(TWITTER_SITE, i.id, i.text,
                        i.geo['coordinates'][0], i.geo['coordinates'][1], 
						'https://twitter.com/{0}/status/{1}'.format(i.user.screen_name, i.id),
                        datetime.fromtimestamp(i.created_at_in_seconds))
        entities.append(entity)

    return entities

def twitter_hashtags(tag):
    st=twitterapi.GetSearch(u'#{}'.format(tag), count=200)
    print len(st)
    hash_items = [s for s in st if s.geo is not None]
    
    entities = []
    for i in hash_items:
        entity = Entity(TWITTER_SITE, i.id, i.text,
                        i.geo['coordinates'][0], i.geo['coordinates'][1],
                        'https://twitter.com/{0}/status/{1}'.format(i.user.screen_name, i.id),
                        datetime.fromtimestamp(i.created_at_in_seconds))
        entities.append(entity)

    return entities

instagram = Instagram()
vk = Vk()
