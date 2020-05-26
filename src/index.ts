import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
  ILayoutRestorer
} from '@jupyterlab/application';

import {
  ICommandPalette,
  MainAreaWidget,
  WidgetTracker
} from '@jupyterlab/apputils';

import { VideoCallSidebarWidget } from './sidebar';


async function activate(
  app: JupyterFrontEnd,
  palette: ICommandPalette,
  restorer: ILayoutRestorer
): Promise<void> {
  console.log('JupyterLab extension jupyter-jitsi is activated!');
  // Create a blank content widget inside of a MainAreaWidget
  let widget: MainAreaWidget<VideoCallSidebarWidget>;

  const command = 'jitsi:open';

  const tracker = new WidgetTracker<MainAreaWidget<VideoCallSidebarWidget>>({
    namespace: 'jitsi'
  });

  if (!widget || widget.isDisposed) {
    // Create widget
    const content = new VideoCallSidebarWidget();
    widget = new MainAreaWidget({ content });

    widget.id = 'jitsi-jupyterlab';
    widget.title.label = 'Jitsi Video Conference';
    widget.title.closable = true;
  }
  if (!tracker.has(widget)) {
    tracker.add(widget);
  }
  if (!widget.isAttached) {
    // Attach the widget to the main work area if it's not there
    app.shell.add(widget, 'right');
  }
  widget.content.update();

  app.commands.addCommand(command, {
    label: 'Jitsi Video Conference',
    execute: () => {
      // Activate the widget
      app.shell.activateById(widget.id);
    }
  });

  restorer.restore(tracker, {
    command,
    name: () => 'jitsi'
  });

  // Add the command to the palette.
  palette.addItem({ command, category: 'Tutorial' });
}

/**
 * Initialization data for the jupyter-jitsi extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab-videochat',
  autoStart: true,
  requires: [ICommandPalette, ILayoutRestorer],
  activate: activate
};

export default extension;
