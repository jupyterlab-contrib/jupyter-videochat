"""documentation for jupyterlite"""
import datetime
import json
import os
from pathlib import Path
from configparser import ConfigParser

RTD = json.loads(os.environ.get("READTHEDOCS", "False").lower())

CONF_PY = Path(__file__)
HERE = CONF_PY.parent
ROOT = HERE.parent
APP_PKG = ROOT / "package.json"
APP_DATA = json.loads(APP_PKG.read_text(encoding="utf-8"))

SETUP_CFG = ROOT / "setup.cfg"
SETUP_DATA = ConfigParser()
SETUP_DATA.read_file(SETUP_CFG)

# metadata
author = APP_DATA["author"]
project = SETUP_DATA["metadata"]["name"]
copyright = f"{datetime.date.today().year}, {author}"

# The full version, including alpha/beta/rc tags
release = APP_DATA["version"]

# The short X.Y version
version = ".".join(release.rsplit(".", 1))

# sphinx config
extensions = [
    # first-party sphinx extensions
    "sphinx.ext.todo",
    "sphinx.ext.autosectionlabel",
    # for pretty schema
    "sphinx-jsonschema",
    # mostly markdown (some ipynb)
    "myst_nb",
    # autodoc-related stuff must be in order
    "sphinx.ext.autodoc",
    "sphinx.ext.napoleon",
]

autosectionlabel_prefix_document = True
myst_heading_anchors = 3
suppress_warnings = ["autosectionlabel.*"]

# files
# templates_path = ["_templates"]
# html_favicon = "../app/lab/favicon.ico"
# rely on the order of these to patch json, labextensions correctly
html_static_path = [
    # docs stuff
    "_static",
]
exclude_patterns = [
    "_build",
    ".ipynb_checkpoints",
    "**/.ipynb_checkpoints",
    "**/~.*",
    "**/node_modules",
    "babel.config.*",
    "jest-setup.js",
    "jest.config.js",
    "jupyter_execute",
    ".jupyter_cache",
    "test/",
    "tsconfig.*",
    "webpack.config.*",
]
jupyter_execute_notebooks = "auto"

execution_excludepatterns = [
    "_static/**/*",
]
# html_css_files = [
#     "theme.css",
# ]

# theme
html_theme = "pydata_sphinx_theme"
# html_logo = "_static/wordmark.svg"
html_theme_options = {
    "github_url": APP_DATA["homepage"],
    "use_edit_page_button": True,
    "navbar_start": ["launch.html"],
    "navbar_center": ["navbar-logo.html", "navbar-nav.html"],
}

html_context = {
    "github_user": "jupyterlab-contrib",
    "github_repo": "jupyter-videochat",
    "github_version": "master",
    "doc_path": "docs",
}
