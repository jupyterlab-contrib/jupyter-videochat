import os

from traitlets.config import Configurable
from traitlets import Unicode

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
