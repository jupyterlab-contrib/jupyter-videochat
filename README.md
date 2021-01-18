# jupyter-videochat

![Github Actions Status](https://github.com/yuvipanda/jupyter-videochat/workflows/Build/badge.svg)[![Binder](https://mybinder.org/badge_logo.svg)](https://mybinder.org/v2/gh/yuvipanda/jupyter-videochat/master?urlpath=lab)

JuVideo Chat with peers inside JupyterLab

This extension is composed of a Python package named `jupyter_videochat` for the
server extension and a NPM package named `jupyter-videochat` for the frontend
extension.

## Requirements

- JupyterLab ==3.\*

## Install

```bash
pip install jupyter_videochat
```

## Troubleshoot

If you are seeing the frontend extension but it is not working, check that the
server extension is enabled:

```bash
jupyter server extension list
```

If the server extension is installed and enabled but you are not seeing the
frontend, check the frontend is installed:

```bash
jupyter labextension list
```

### Uninstall

```bash
pip uninstall jupyter_videochat
```
