# jupyter-videochat

> Video Chat with JupyterHub peers (or the world) inside JupyterLab, powered by [Jitsi].

![jupyter-videochat screenshot][lab-screenshot]

## Quick Start

```bash
pip install jupyter-videochat
```

This will install:

- a Python package named `jupyter-videochat` on PyPI, which offers:
  - a `jupyter_server` extension which provides convenient, [configurable](./user-guide.md#configuration)
    defaults for rooms on a JupyterHub
    - will start as soon as you re-launch your `jupyter_server`
  - a JupyterLab 3+ _federated extension_ named `jupyterlab-videochat`
    - will be available immediately
    - can launch a meet via [URL](./user-guide.md#start-a-meet-by-url)
    - also distributed on [npm]
        - for more about the TypeScript/JS API, see the [developer guide](./developer-guide.md)

## Learn More

```{toctree}
:maxdepth: 2

user-guide
developer-guide
changelog
```

[npm]: https://www.npmjs.com/package/jupyterlab-videochat
[jupyterhub]: https://github.com/jupyterhub/jupyterhub
[jitsi]: https://jitsi.org
[lab-screenshot]:
  https://user-images.githubusercontent.com/45380/106391412-312d0400-63bb-11eb-9ed9-af3c4fe85ee4.png
