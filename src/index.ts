import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { requestAPI } from './jupyter-videochat';

/**
 * Initialization data for the jupyter-videochat extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: 'jupyter-videochat',
  autoStart: true,
  activate: (app: JupyterFrontEnd) => {
    console.log('JupyterLab extension jupyter-videochat is activated!');

    requestAPI<any>('get_example')
      .then(data => {
        console.log(data);
      })
      .catch(reason => {
        console.error(
          `The jupyter_videochat server extension appears to be missing.\n${reason}`
        );
      });
  }
};

export default extension;
