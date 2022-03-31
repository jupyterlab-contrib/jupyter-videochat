import json
import string
from copy import deepcopy

import tornado
from escapism import escape
from jupyter_server.base.handlers import APIHandler
from jupyter_server.utils import url_path_join


def safe_id(id):
    """
    Make sure meeting-ids are safe

    We try to keep meeting IDs to a safe subset of characters.
    Not sure if Jitsi requires this, but I think it goes on some
    URLs so easier to be safe.
    """
    return escape(id, safe=string.ascii_letters + string.digits + "-")


class BaseHandler(APIHandler):
    @property
    def videochat(self):
        return self.settings["videochat"]

    @property
    def room_prefix(self):
        prefix = self.videochat.room_prefix
        if not prefix:
            prefix = f"jp-VideoChat-{self.request.host}-"
        return prefix


class ConfigHandler(BaseHandler):
    @tornado.web.authenticated
    def get(self):
        # Use camelcase for keys, since that's what typescript likes
        # FIXME: room_prefix from hostname is generated twice, let's try fix that

        self.finish(
            json.dumps(
                {
                    "roomPrefix": self.room_prefix,
                    "jitsiServer": self.videochat.jitsi_server,
                }
            )
        )


class GenerateRoomHandler(BaseHandler):
    @tornado.web.authenticated
    def post(self):
        params = json.loads(self.request.body.decode())
        display_name = params["displayName"]
        self.finish(
            json.dumps(
                {
                    "id": safe_id(f"{self.room_prefix}{display_name}"),
                    "displayName": display_name,
                }
            )
        )


class RoomsListHandler(BaseHandler):
    """
    Return list of rooms available for this user to join.
    """

    @property
    def videochat(self):
        return self.settings["videochat"]

    @tornado.web.authenticated
    def get(self):
        # FIXME: Do this prefixing only once
        rooms = deepcopy(self.videochat.rooms)

        for room in rooms:
            room["id"] = safe_id(f"{self.room_prefix}{room['id']}")

        self.finish(json.dumps(rooms))


def setup_handlers(web_app):
    host_pattern = ".*$"

    base_url = web_app.settings["base_url"]

    def make_url_pattern(endpoint):
        return url_path_join(base_url, "videochat", endpoint)

    handlers = [
        (make_url_pattern("rooms"), RoomsListHandler),
        (make_url_pattern("config"), ConfigHandler),
        (make_url_pattern("generate-room"), GenerateRoomHandler),
    ]
    web_app.add_handlers(host_pattern, handlers)
