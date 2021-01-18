## Contributing

### Install

The `jlpm` command is JupyterLab's pinned version of
[yarn](https://yarnpkg.com/) that is installed with JupyterLab. You may use
`yarn` or `npm` in lieu of `jlpm` below, but internally some subcommands will
use `jlpm`.

```bash
# Clone the repo to your local environment
# Move to jupyter-videochat directory

# Install server extension
pip install -e .
# Register server extension
jupyter server extension enable --py jupyter_videochat

# Install dependencies
jlpm
# Build Typescript source and Lab Extension
jlpm build
# Symlink your development version of the extension with JupyterLab
jupyter labextension develop --overwrite .
# Rebuild Typescript source after making changes
jlpm build
```

You can watch the source directory and run JupyterLab in watch mode to watch for
changes in the extension's source and automatically rebuild the extension and
application.

```bash
# Watch the source directory in another terminal tab
jlpm watch
# Run jupyterlab in watch mode in one terminal tab
jupyter lab
```
