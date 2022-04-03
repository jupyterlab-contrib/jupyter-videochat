# CHANGELOG

## jupyter-videochat [0.6.1] (unreleased)

[0.6.1]: https://pypi.org/project/jupyter-videochat/0.6.1

## jupyter-videochat [0.6.0]

### UI

- Rooms now show their provider, presently _Server_ or _Public_ ([#38])
- Adopt _Card_ styling, like the _Launcher_ ([#38])
- _New Video Chat_ is added to the _File_ menu ([#38])

### API

- _Public_ rooms are still configured as part of core, and can be opted-in via _Command
  Palette_ or _Advanced Settings_ (and therefore `overrides.json`) ([#38])
- The _Public_ implementation is in a separate, optional plugin ([#38])
- _Server_ rooms similarly moved to a separate, optional plugin ([#38])
- The _Toggle Sidebar_ implementation is moved to a separate, optional plugin ([#60])
- The `mainWidget` is available as part of the API, and exposes a `toolbar` for adding
  custom features ([#60])

### Integrations

- Works more harmoniously with [retrolab] ([#38])
- The _Public_ plugin is compatible with [JupyterLite] ([#38])
- All public strings are now [internationalizable][i18n] ([#60])

### Docs

- A documentation site is now maintained on [ReadTheDocs] ([#43])
  - It includes a one-click, no-install demo powered by [JupyterLite] ([#40])

[0.6.0]: https://pypi.org/project/jupyter-videochat/0.6.0
[#38]: https://github.com/jupyterlab-contrib/jupyter-videochat/pull/38
[#40]: https://github.com/jupyterlab-contrib/jupyter-videochat/pull/40
[#43]: https://github.com/jupyterlab-contrib/jupyter-videochat/pull/43
[#60]: https://github.com/jupyterlab-contrib/jupyter-videochat/pull/60
[jupyterlite]: https://github.com/jupyterlite/jupyterlite
[readthedocs]: https://jupyter-videochat.rtfd.io
[retrolab]: https://github.com/jupyterlab/retrolab
[i18n]: https://jupyterlab.readthedocs.io/en/stable/extension/internationalization.html

## jupyter-videochat [0.5.1]

- adds missing `provides` to allow downstreams extensions to use (and not just import)
  `IVideoChatManager` ([#21])
- moves current Lab UI area (e.g. `right`, `main`) to user settings ([#22])

[0.5.1]: https://pypi.org/project/jupyter-videochat/0.5.1
[#21]: https://github.com/jupyterlab-contrib/jupyter-videochat/issues/21
[#22]: https://github.com/jupyterlab-contrib/jupyter-videochat/pull/22

## jupyter-videochat [0.5.0]

- overhaul for JupyterLab 3 ([#12], [#14])
  - `pip install jupyter-videochat`, no more `jupyter labextension install`
    - `npm` tarballs will continue to be released for downstream extensions
      - user install via `jupyter labextension install` is no longer tested
  - exposes `IVideoChatManager` for other extensions to interact with the current Jitsi
    Meet instance
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
