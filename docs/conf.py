"""documentation for jupyter-videochat"""
import datetime
import json
import os
import subprocess
import sys
from pathlib import Path
from configparser import ConfigParser

CONF_PY = Path(__file__)
HERE = CONF_PY.parent
ROOT = HERE.parent

PY = sys.executable
PIP = [PY, "-m", "pip"]
JPY = [PY, "-m", "jupyter"]

DOCS_IN_CI = json.loads(os.environ.get("DOCS_IN_CI", "False").lower())
RTD = json.loads(os.environ.get("READTHEDOCS", "False").lower())

# extra tasks peformed on ReadTheDocs
DOCS_IN_CI_TASKS = [
    # initialize the lite site
    [HERE, [*JPY, "lite", "init"]],
    # build the lite site
    [HERE, [*JPY, "lite", "build"]],
    # build the lite archive
    [HERE, [*JPY, "lite", "archive"]],
    # check the lite site
    [HERE, [*JPY, "lite", "check"]],
]

RTD_TASKS = [
    # be very sure we've got a clean state
    [
        HERE,
        [
            "git",
            "clean",
            "-dxf",
            HERE / "_build",
            HERE / "_static/lite",
            HERE / ".jupyterlite.doit.db",
        ],
    ],
    # ensure node_modules
    [ROOT, ["jlpm", "--ignore-optional"]],
    # ensure lib an labextension
    [ROOT, ["jlpm", "clean"]],
    # ensure lib an labextension
    [ROOT, ["jlpm", "build"]],
    # install hot module
    [ROOT, [*PIP, "install", "-e", ".", "--no-deps", "--ignore-installed", "-vv"]],
    # force serverextension
    [ROOT, [*JPY, "server", "extension", "enable", "--py", "jupyter_videochat"]],
    # list serverextension
    [ROOT, [*JPY, "server", "extension", "list"]],
    # force labextension
    [ROOT, [*JPY, "labextension", "develop", "--overwrite", "."]],
    # list labextension
    [ROOT, [*JPY, "labextension", "list"]],
] + DOCS_IN_CI_TASKS


APP_PKG = ROOT / "package.json"
APP_DATA = json.loads(APP_PKG.read_text(encoding="utf-8"))

SETUP_CFG = ROOT / "setup.cfg"
SETUP_DATA = ConfigParser()
SETUP_DATA.read_file(SETUP_CFG.open())

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
templates_path = ["_templates"]

html_favicon = "_static/logo.svg"

html_static_path = [
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
html_logo = "_static/logo.svg"
html_theme_options = {
    "github_url": APP_DATA["homepage"],
    "use_edit_page_button": True,
}
html_sidebars = {
    "**": [
        "demo.html",
        "search-field.html",
        "sidebar-nav-bs.html",
        "sidebar-ethical-ads.html",
    ]
}

html_context = {
    "github_user": "jupyterlab-contrib",
    "github_repo": "jupyter-videochat",
    "github_version": "master",
    "doc_path": "docs",
    "demo_tarball": f"_static/jupyter-videochat-lite-{release}.tgz",
}


def before_ci_build(app, error):
    """performs tasks not done yet in CI/RTD"""
    for cwd, task in RTD_TASKS if RTD else DOCS_IN_CI_TASKS:
        str_args = [*map(str, task)]
        print(
            f"[jupyter-videochat-docs] {cwd.relative_to(ROOT)}: {' '.join(str_args)}",
            flush=True,
        )
        subprocess.check_call(str_args, cwd=str(cwd))


def setup(app):
    if RTD or DOCS_IN_CI:
        app.connect("config-inited", before_ci_build)
