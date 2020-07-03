import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
  ILayoutRestorer
} from '@jupyterlab/application';

import { LabIcon } from '@jupyterlab/ui-components';

import { ICommandPalette, WidgetTracker } from '@jupyterlab/apputils';

import { Panel } from '@lumino/widgets';
import { VideoChat } from './widget';

import CHAT_ICON from '../style/icons/videochat.svg';

export namespace CommandIds {
  export const open = 'jitsi:open';
  export const toggleArea = 'jitsi:togglearea';
}

const category = 'Video Chat';
let area = 'right';

const chatIcon = new LabIcon({
  name: 'jitsi:chat',
  svgstr: CHAT_ICON
});

async function activate(
  app: JupyterFrontEnd,
  palette: ICommandPalette,
  restorer: ILayoutRestorer
): Promise<void> {
  console.log('JupyterLab extension jupyter-jitsi is activated!');
  const { commands, shell } = app;
  // Create a blank content widget inside of a MainAreaWidget
  let widget: Panel;

  const tracker = new WidgetTracker<Panel>({
    namespace: 'jitsi'
  });

  if (!widget || widget.isDisposed) {
    // Create widget
    const content = new VideoChat({
      onToggleSidebar: () => {
        commands.execute(CommandIds.toggleArea, {}).catch(console.warn);
      }
    });
    widget = new Panel();

    widget.id = 'jitsi-jupyterlab';
    widget.title.caption = 'Video Chat';
    widget.title.closable = false;
    widget.title.icon = chatIcon;
    widget.addWidget(content);
  }
  if (!tracker.has(widget)) {
    tracker.add(widget).catch(console.warn);
  }
  if (!widget.isAttached) {
    shell.add(widget, area);
  }
  widget.update();

  restorer
    .restore(tracker, {
      command: CommandIds.open,
      name: () => 'jitsi'
    })
    .catch(console.warn);

  commands.addCommand(CommandIds.open, {
    label: 'Open Video Chat',
    execute: () => {
      // Activate the widget
      shell.activateById(widget.id);
    }
  });

  commands.addCommand(CommandIds.toggleArea, {
    label: 'Toggle Video Chat Sidebar',
    execute: () => {
      area = area === 'right' ? 'main' : 'right';
      widget.title.label = area === 'main' ? widget.title.caption : '';
      shell.add(widget, area);
    }
  });

  // Add the commands to the palette.
  palette.addItem({ command: CommandIds.open, category });
  palette.addItem({ command: CommandIds.toggleArea, category });
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
