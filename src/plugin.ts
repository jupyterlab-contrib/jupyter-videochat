import { Panel } from '@lumino/widgets';

import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
  ILayoutRestorer,
  IRouter
} from '@jupyterlab/application';

import { ILauncher } from '@jupyterlab/launcher';

import { ICommandPalette, WidgetTracker } from '@jupyterlab/apputils';

import { CommandIds, IVideoChatManager, URL_PARAM, NS, CSS } from './tokens';
import { IChatArgs } from './types';
import { VideoChatManager } from './manager';
import { VideoChat } from './widget';
import { chatIcon } from './icons';

const category = 'Video Chat';
let area = 'right';

async function activate(
  app: JupyterFrontEnd,
  palette: ICommandPalette,
  restorer: ILayoutRestorer,
  router: IRouter,
  launcher?: ILauncher
): Promise<IVideoChatManager> {
  const manager = new VideoChatManager({});

  const { commands, shell } = app;
  // Create a blank content widget inside of a MainAreaWidget
  let widget: Panel;
  let chat: VideoChat;

  const tracker = new WidgetTracker<Panel>({ namespace: NS });

  if (!widget || widget.isDisposed) {
    // Create widget
    chat = new VideoChat(manager, {
      onToggleSidebar: () => {
        commands.execute(CommandIds.toggleArea, {}).catch(console.warn);
      }
    });
    widget = new Panel();
    widget.addClass(`${CSS}-wrapper`);

    widget.id = `id-${NS}`;
    widget.title.caption = 'Video Chat';
    widget.title.closable = false;
    widget.title.icon = chatIcon;
    widget.addWidget(chat);
  }

  // Add to widget tracker
  if (!tracker.has(widget)) {
    tracker.add(widget).catch(console.warn);
  }

  // Add to shell
  if (!widget.isAttached) {
    shell.add(widget, area);
  }

  // Force an update
  widget.update();

  // Potentially restore position
  restorer
    .restore(tracker, { command: CommandIds.open, name: () => NS })
    .catch(console.warn);

  commands.addCommand(CommandIds.open, {
    label: 'Show Video Chat',
    icon: chatIcon,
    execute: (args: IChatArgs) => {
      if (args.area) {
        area = args.area;
        shell.add(widget, area);
      }
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
      shell.activateById(widget.id);
    }
  });

  commands.addCommand(CommandIds.routerStart, {
    label: 'Open Video Chat from URL',
    execute: args => {
      const { request } = args as IRouter.ILocation;
      const url = new URL(`http://example.com${request}`);
      const params = url.searchParams;
      const displayName = params.get(URL_PARAM);

      const chatAfterRoute = async () => {
        router.routed.disconnect(chatAfterRoute);
        if (manager.currentRoom?.displayName != displayName) {
          await commands.execute(CommandIds.open);
          manager.currentRoom = {displayName};
        }
      };

      router.routed.connect(chatAfterRoute);
    }
  });

  // Add the commands to the palette.
  palette.addItem({ command: CommandIds.open, category });
  palette.addItem({ command: CommandIds.toggleArea, category });

  // Add to the router
  router.register({
    command: CommandIds.routerStart,
    pattern: /.*/,
    rank: 29
  });

  // If available, add a card to the launcher
  if (launcher) {
    launcher.add({ command: CommandIds.open, args: { area: 'main' }});
  }

  // Return the manager that others extensions can use
  return manager;
}

/**
 * Initialization data for the jupyter-jitsi extension.
 */
const extension: JupyterFrontEndPlugin<IVideoChatManager> = {
  id: NS,
  autoStart: true,
  requires: [ICommandPalette, ILayoutRestorer, IRouter],
  optional: [ILauncher],
  activate
};

// In the future, there may be more extensions
export default [extension];
