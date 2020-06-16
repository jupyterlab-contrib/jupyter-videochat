import os

from traitlets.config import Configurable
from traitlets import Unicode, List, Dict

from ._version import __version__
from .handlers import setup_handlers

class VideoChat(Configurable):
    room_prefix = Unicode(
        default_value=os.environ.get('JUPYTER_VIDEOCHAT_ROOM_PREFIX', ''),
        help="""
        Prefix to use for all meeting room names.

        When multiple groups are using the same Jitsi server, we need a
        secure, unique prefix for each group. This lets the group use any
        name for their meeting without worrying about conflicts with other
        groups.

        In a JupyterHub context, each JupyterHub should have its own
        secure prefix, to prevent clashes with other JupyterHubs using the
        same Jitsi server. Subgroups inside a JupyterHub might also have
        their prefixe to prevent clashes.

        When set to '' (the default), the hostname where the hub is running
        will be used to form a prefix.
        """,
        config=True,
    )

    rooms = List(
        Dict,
        default_value=[
            {
                'id': 'CS16A-project-1-team-a',
                'displayName': '16A Project 1 - Team A',
                'description': 'Room for members of Team A on Project 1 of CS 16A'
            },
            {
                'id': 'data8-lab-1-team-c',
                'displayName': 'data8 Lab 1 - Team C',
                'description': 'Room for members of Team C on Lab 1 of data8'
            }
        ],
        help="""
        List of rooms shown to users in chat window.

        Each item should be a dict with the following keys:

        id - id of the meeting to be used with jitsi. Will be prefixed with `room_prefix,
             and escaped to contain only alphanumeric characters and '-'
        displayName - Name to be displayed to the users
        description - Description of this particular room

        This can be dynamically set eventually from an API call or something of that
        sort.
        """,
        config=True
    )

    jitsi_server = Unicode(
        "meet.jit.si",
        help="""
        Domain of Jitsi server to use

        Must be a domain name, with HTTPS working.
        """,
        config=True
    )

def _jupyter_server_extension_paths():
    return [{
        "module": "jupyter_videochat"
    }]


def load_jupyter_server_extension(lab_app):
    """Registers the API handler to receive HTTP requests from the frontend extension.

    Parameters
    ----------
    lab_app: jupyterlab.labapp.LabApp
        JupyterLab application instance
    """
    videochat = VideoChat(parent=lab_app)
    lab_app.web_app.settings['videochat'] = videochat
    setup_handlers(lab_app.web_app)
    lab_app.log.info("Registered HelloWorld extension at URL path /jupyter-videochat")
