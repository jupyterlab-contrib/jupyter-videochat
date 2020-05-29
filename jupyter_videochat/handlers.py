import json

from notebook.base.handlers import APIHandler
from notebook.utils import url_path_join
from escapism import escape
import string

import tornado

class ConfigHandler(APIHandler):
    @property
    def videochat(self):
        return self.settings['videochat']

    @tornado.web.authenticated
    def get(self):
        self.finish(json.dumps({
            "room_prefix": self.videochat.room_prefix
        }))


class RoomsListHandler(APIHandler):
    """
    Return list of rooms available for this user to join.
    """
    @property
    def videochat(self):
        return self.settings['videochat']

    def safe_id(self, id):
        """
        Make sure meeting-ids are safe

        We try to keep meeting IDs to a safe subset of characters.
        Not sure if Jitsi requires this, but I think it goes on some
        URLs so easier to be safe.
        """
        return escape(id, safe=string.ascii_letters + string.digits + '-')

    @tornado.web.authenticated
    def get(self):
        prefix = self.videochat.room_prefix
        if not prefix:
            prefix = f'jp-VideoChat-{self.request.host}-'

        rooms = [
            {
                'id': self.safe_id(f'{prefix}project-1'),
                'displayName': '16A Project 1 - Team A',
                'description': 'Room for members of Team A on Project 1 of CS 16A'
            },
            {
                'id': self.safe_id(f'{prefix}project-2'),
                'displayName': 'data8 Lab 1 - Team C',
                'description': 'Room for members of Team C on Lab 1 of data8'
            }
        ]
        self.finish(json.dumps(rooms))

def setup_handlers(web_app):
    host_pattern = ".*$"

    base_url = web_app.settings["base_url"]

    def make_url_pattern(endpoint):
        return url_path_join(base_url, 'videochat', endpoint)

    handlers = [
        (make_url_pattern('rooms'), RoomsListHandler),
    ]
    web_app.add_handlers(host_pattern, handlers)
