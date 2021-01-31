# Contributing

## Install

The `jlpm` command is JupyterLab's pinned version of
[yarn](https://yarnpkg.com/) that is installed with JupyterLab.

> You may use `yarn` or `npm` in lieu of `jlpm` below, but internally some
> subcommands will use still use `jlpm`.

```bash
# Clone the project repository
git clone https://github.com/yuvipanda/jupyter-videochat
# Move to jupyter-videochat directory
cd jupyter-videochat
# Install JS dependencies
jlpm
# Build TypesSript source and Lab Extension
jlpm build
# Install server extension
pip install -e .
# Register server extension
jupyter serverextension enable --py jupyter_videochat
# Symlink your development version of the extension with JupyterLab
jupyter labextension develop --overwrite .
# Rebuild Typescript source after making changes
jlpm build
```

## Live Development

You can watch the `src` directory for changes and automatically rebuild the JS
files and webpacked extension.

```bash
# Watch the source directory in another terminal tab
jlpm watch
# ... or, as they are both pretty noisy, run two terminals with
#   jlpm watch:lib
#   jlpm watch:ext
# Run jupyterlab in watch mode in one terminal tab
jupyter lab
# ... or, to also watch server extension source files
#   jupyter lab --autoreload
```

## Extending

Other JupyterLab extensions can use `IVideoChatManager` to interact with the
[Jitsi Meet API](https://jitsi.github.io/handbook/docs/dev-guide/dev-guide-iframe)
instance, which has many _commands_, _functions_ and _events_.

- Add `jupyterlab-videochat` as a `package.json` dependency

  ```bash
  # in the folder with your package.json
  jlpm add jupyterlab-videochat
  ```

- Include `IVideoChatManager` in your plugins's `activate` function

  ```ts
  // plugin.ts
  import { IVideoChatManager } from 'jupyterlab-videochat';

  const plugin: JupyterFrontEndPlugin<IVideoChatManager> = {
    id: `my-labextension:plugin`,
    autoStart: true,
    requires: [IVideoChatManager],
    activate: (app: JupyterLabFrontEnd, videochat: IVideoChatManager) => {
      videochat.meetChanged.connect(() => {
        if (videochat.meet) {
          // do something clever with the Meet
        }
      });
    },
  };

  export default plugin;
  ```

  > _The typings provided are **best-effort**, PRs welcome to improve them._

- (Probably) add `jupyter_videochat` to your extension's python dependencies,
  e.g.

  ```py
  # setup.py
  setup(
      install_requires=["jupyter_videochat"]
  )
  ```
