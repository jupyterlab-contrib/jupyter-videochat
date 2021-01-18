from pathlib import Path
import json

from setuptools import setup

HERE = Path(__file__).parent
EXT_SRC = HERE / "jupyter_videochat" / "labextension"
PACKAGE_JSON = json.loads((EXT_SRC / "package.json").read_text(encoding="utf-8"))

EXT_DEST = f"""share/jupyter/labextensions/{PACKAGE_JSON["name"]}"""

CONF_D = "etc/jupyter/jupyter_server_config.d"

DATA_FILES = [
    (
        f"{EXT_DEST}/{p.parent.relative_to(EXT_SRC).as_posix()}",
        [str(p.relative_to(HERE).as_posix)]
    )
    for p in EXT_SRC.rglob("*") if not p.is_dir()
]

assert len(DATA_FILES) > 3, "expected some files"

DATA_FILES += [
    (EXT_DEST, ["install.json"]),
    (CONF_D, ["jupyter-config/jupyter_videochat.json"]),
]

if __name__ == "__main__":
    setup(
        version=PACKAGE_JSON["version"],
        data_files=DATA_FILES
    )
