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
jupyter server extension enable --py jupyter_videochat
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

Other [JupyterLab extensions] can use the `IVideoChatManager` to interact with
the
[Jitsi Meet API](https://jitsi.github.io/handbook/docs/dev-guide/dev-guide-iframe)
instance, which has many _commands_, _functions_ and _events_. Nobody has yet,
_that we know of_: if you are successful, please consider posting an
issue/screenshot on the GitHub repository!

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
          // do something clever with the Meet!
        }
      });
    },
  };

  export default plugin;
  ```

  > _The typings provided for the Jitsit API are **best-effort**, PRs welcome to
  > improve them._

- (Probably) add `jupyter-videochat` to your extension's python dependencies,
  e.g.

  ```py
  # setup.py
  setup(
      install_requires=["jupyter-videochat"]
  )
  ```

## Releasing

- Start a release issue with a checklist of tasks
  - see previous releases for examples
- Ensure the version has been updated, roughly following [semver]
  - Basically, any _removal_ or _data_ constraint would trigger a `0.x+1.0`
  - Otherwise it's probably `0.x.y+1`
- Ensure the [CHANGELOG](./CHANGELOG.md) and [README](./README.md) are
  up-to-date
- Wait until CI passes on `master`
- Validate on Binder
- Download the release assets from the latest CI run
- From the GitHub web UI, create a new tag/release
  - name the tag `v0.x.y`
  - upload all of the release assets (including `SHA256SUMS`!)
- Upload to pypi.org
  ```bash
  twine upload jupyter-videochat*
  ```
- Upload to npm.com
  ```bash
  npm login
  npm publish jupyterlab-videochat*
  ```
- Make a new PR bumping to the next point release
  - just in case a quick fix is needed
- Validate the as-released assets in a clean environment
  - e.g. on Binder with a simple `requirements.txt` gist
  ```bash
  jupyter-videochat ==0.x.y
  ```
- Wait for the [conda-forge feedstock] to get an automated PR
  - validate and merge
- Close the release issue!

[semver]: https://semver.org/
[conda-forge feedstock]:
  https://github.com/conda-forge/jupyter-videochat-feedstock
[jupyterlab extensions]:
  https://jupyterlab.readthedocs.io/en/stable/extension/extension_dev.html
