# jupyter-videochat

![Github Actions Status](https://github.com/yuvipanda/jupyter-videochat/workflows/Build/badge.svg)[![Binder](https://mybinder.org/badge_logo.svg)](https://mybinder.org/v2/gh/yuvipanda/jupyter-videochat/master?urlpath=lab)

JuVideo Chat with peers inside JupyterLab

This extension is composed of:

- a Python package named `jupyter_videochat`, which offers:
  - a `jupyter_server` extension which provides convenient, configurable
    defaults for rooms on a
    [JupyterHub](https://github.com/jupyterhub/jupyterhub)
  - an NPM package named `jupyter-videochat` for the JupyterLab extension
    - for more about the TypeScript/JS API, see
      [CONTRIBUTING](https://github.com/yuvipanda/jupyter-videochat/blob/master/CONTRIBUTING.md)

## Requirements

- `jupyterlab ==3.*`

## Install

```bash
pip install jupyter_videochat
```

## Troubleshoot

If you are seeing the frontend extension but it is not working, check that the
server extension is enabled:

```bash
jupyter serverextension list
```

If the server extension is installed and enabled but you are not seeing the
frontend, check the frontend is installed:

```bash
jupyter labextension list
```

## Uninstall

```bash
pip uninstall jupyter_videochat
```

## Configuration

### Server Configuration

In your `jupyter_server_config.json` (or equivalent `.py` or `conf.d/*.json`),
you can configure the `VideoChat`:

- `room_prefix`, a prefix used for your group, by default a URL-frieldy version
  of your JupyterHub's hostname
  - can be overriden with the `JUPYTER_VIDEOCHAT_ROOM_PREFIX` environment
    variable
- `jitsi_server`, an HTTPS host that serves the Jitsi web application, by
  default `meet.jit.si`
- `rooms`, a list of Room descriptions that everyone on your Hub will be able to
  join

#### Example

```json
{
  "VideoChat": {
    "room_prefix": "our-spiffy-room-prefix",
    "rooms": [
      {
        "displayName": "Stand-Up",
        "description": "Daily room for meeting with the team"
      },
      {
        "displayName": "All-Hands",
        "description": "A weekly room for the whole team"
      }
    ],
    "jitsi_server": "jitsi.example.com"
  }
}
```

### Client Configuration

In the JupyterLab _Advanced Settings_ panel, the _Video Chat_ settings can be
further configured, as can a user's default `displayName` and `email`. The
defaults provided are generally pretty conservative, and disable as many
third-party services as possible.

### Start a Meet by URL

Appending `?jvc=room-name` to a JupyterLab URL will automatically open the Meet
(but not _fully_ start it, as browsers require a user gesture to start
audio/video).

#### Binder Example

On [Binder](https://mybinder.org), use the `urlpath` to append the argument,
ensuring the arguments get properly URL-encoded

```
https://mybinder.org/v2/gh/yuvipanda/jupyter-videochat/HEAD?urlpath=tree%3Fjvc%3Dstand-up
                                                         # URL-encoded  [? ] [=  ]
```
