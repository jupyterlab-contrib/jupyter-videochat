from pathlib import Path
import json

from setuptools import setup

CONF_D = "etc/jupyter/jupyter_server_config.d"

HERE = Path(__file__).parent
EXT_SRC = HERE / "jupyter_videochat" / "labextension"
PACKAGE_JSON = EXT_SRC / "package.json"

JLPM_MSG = f"""
    Please ensure a clean build of the labextension in {EXT_SRC}

        jlpm clean
        jlpm build"""

assert PACKAGE_JSON.exists(), f"""
    Did not find `labextension/package.json`

    {JLPM_MSG}
"""

__jspackage__ = json.loads(PACKAGE_JSON.read_text(encoding="utf-8"))

EXT_DEST = f"""share/jupyter/labextensions/{__jspackage__["name"]}"""


DATA_FILES = [
    (
        f"{EXT_DEST}/{p.parent.relative_to(EXT_SRC).as_posix()}",
        [str(p.relative_to(HERE).as_posix())]
    )
    for p in EXT_SRC.rglob("*") if not p.is_dir()
]


ALL_FILES = sum([df[1] for df in DATA_FILES], [])
REMOTE_ENTRY = [p for p in ALL_FILES if "remoteEntry" in p]

assert len(REMOTE_ENTRY) == 1, f"""
    Expected _exactly one_ `labextension/remoteEntry*.js`, found:

        {[p for p in REMOTE_ENTRY]}

    {JLPM_MSG}
"""

assert not [p for p in ALL_FILES if "build_log.json" in p], f"""
    Found `build_log.json`, which contains paths on your computer, etc.
    {JLPM_MSG}
"""

DATA_FILES += [
    # percolates up to the UI about the installed labextension
    (EXT_DEST, ["install.json"]),
    # enables the serverextension
    (CONF_D, ["jupyter-config/jupyter_videochat.json"]),
]


if __name__ == "__main__":
    setup(
        version=__jspackage__["version"],
        url=__jspackage__["homepage"],
        description=__jspackage__["description"],
        data_files=DATA_FILES,
        author=__jspackage__["author"],
        license=__jspackage__["license"],
        project_urls={
            "Bug Tracker": __jspackage__["bugs"]["url"],
            "Source Code": __jspackage__["repository"]["url"]
        }
    )
