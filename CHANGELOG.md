# CHANGELOG

## jupyter-videochat [0.6.0] (unreleased)

### UI

- Rooms now show their provider, presently _Server_ or _Global_
- Adopt _Card_ styling, like the _Launcher_

### API

- _Global_ rooms remain part of core, and can be opted-in by command or
  _Advanced Settings_
  - compatible with [JupyterLite]
- _Server_ rooms moved to standalone plugin

[0.6.0]: https://pypi.org/project/jupyter-videochat/0.6.0
[jupyterlite]: https://github.com/jupyterlite/jupyterlite

## jupyter-videochat [0.5.1]

- adds missing `provides` to allow downstreams extensions to use (and not just
  import) `IVideoChatManager` ([#21])
- moves current Lab UI area (e.g. `right`, `main`) to user settings ([#22])

[0.5.1]: https://pypi.org/project/jupyter-videochat/0.5.1
[#21]: https://github.com/jupyterlab-contrib/jupyter-videochat/issues/21
[#22]: https://github.com/jupyterlab-contrib/jupyter-videochat/pull/22

## jupyter-videochat [0.5.0]

- overhaul for JupyterLab 3 ([#12], [#14])
  - `pip install jupyter-videochat`, no more `jupyter labextension install`
    - `npm` tarballs will continue to be released for downstream extensions
      - user install via `jupyter labextension install` is no longer tested
  - exposes `IVideoChatManager` for other extensions to interact with the
    current Jitsi Meet intance
  - fully configurable via _Advanced Settings_
    - Jitsi configuration
    - persistent display name/avatar
    - allow joining public rooms
- replaced vendored Jitsi API with use of your Jitsi server's
- adds URL router
  - open a chat directly with `?jvc=<room name>` ([#7])

[0.5.0]: https://pypi.org/project/jupyter-videochat/0.5.0
[#12]: https://github.com/jupyterlab-contrib/jupyter-videochat/issues/12
[#7]: https://github.com/jupyterlab-contrib/jupyter-videochat/issues/7
[#14]: https://github.com/jupyterlab-contrib/jupyter-videochat/pull/14

## jupyter-videochat [0.4.0]

- fixes some iframe behavior ([#2])
- last release compatible with JupyterLab 2

[0.4.0]: https://www.npmjs.com/package/jupyterlab-videochat
[#2]: https://github.com/jupyterlab-contrib/jupyter-videochat/issues/2
