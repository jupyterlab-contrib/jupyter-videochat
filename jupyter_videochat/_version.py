import json
from pathlib import Path

EXT = Path(__file__).parent / "labextension"

__jspackage__ = json.loads((EXT / "package.json").read_text(encoding="utf-8"))

__version__ = __jspackage__["version"]
