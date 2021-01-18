import { Panel } from '@lumino/widgets';

import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
  ILayoutRestorer,
  IRouter,
} from '@jupyterlab/application';

import { ICommandPalette, WidgetTracker } from '@jupyterlab/apputils';
import { ISettingRegistry } from '@jupyterlab/settingregistry';
import { ILauncher } from '@jupyterlab/launcher';

import { CommandIds, IVideoChatManager, URL_PARAM, NS, CSS } from './tokens';
import { IChatArgs } from './types';
import { VideoChatManager } from './manager';
import { VideoChat } from './widget';
import { chatIcon, prettyChatIcon } from './icons';

const DEFAULT_LABEL = 'Video Chat';

const category = 'Video Chat';
let currentArea = 'right';

async function activate(
  app: JupyterFrontEnd,
  palette: ICommandPalette,
  router: IRouter,
  settingRegistry: ISettingRegistry,
  launcher?: ILauncher,
  restorer?: ILayoutRestorer
): Promise<IVideoChatManager> {
  const manager = new VideoChatManager();

  const { commands, shell } = app;
  let widget: Panel;
  let chat: VideoChat;

  const tracker = new WidgetTracker<Panel>({ namespace: NS });

  if (!widget || widget.isDisposed) {
    // Create widget
    chat = new VideoChat(manager, {
      onToggleSidebar: () => {
        commands.execute(CommandIds.toggleArea, {}).catch(console.warn);
      },
    });
    widget = new Panel();
    widget.addClass(`${CSS}-wrapper`);

    widget.id = `id-${NS}`;
    widget.title.caption = DEFAULT_LABEL;
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
    shell.add(widget, currentArea);
  }

  // Force an update
  widget.update();

  let subject: string | null = null;

  // hide the label when in sidebar, as it shows the rotated text
  function updateTitle() {
    if (subject != null) {
      widget.title.caption = subject;
    } else {
      widget.title.caption = DEFAULT_LABEL;
    }
    widget.title.label = currentArea === 'main' ? widget.title.caption : '';
  }

  // listen for the subject to update the widget title dynamically
  manager.meetChanged.connect(() => {
    if (manager.meet) {
      manager.meet.on('subjectChange', (args: any) => {
        subject = args.subject;
        updateTitle();
      });
    } else {
      subject = null;
    }
    updateTitle();
  });

  commands.addCommand(CommandIds.open, {
    label: 'Video Chat',
    icon: prettyChatIcon,
    execute: (args: IChatArgs) => {
      currentArea = args.area || 'main';
      shell.add(widget, currentArea);
      updateTitle();
      // Activate the widget
      shell.activateById(widget.id);
    },
  });

  // connect settings
  settingRegistry
    .load(plugin.id)
    .then((settings) => (manager.settings = settings))
    .catch(console.error);

  // add commands
  commands.addCommand(CommandIds.toggleArea, {
    label: 'Toggle Video Chat Sidebar',
    execute: () => {
      currentArea = ['right', 'left'].includes(currentArea) ? 'main' : 'right';
      updateTitle();
      shell.add(widget, currentArea);
      shell.activateById(widget.id);
    },
  });

  commands.addCommand(CommandIds.routerStart, {
    label: 'Open Video Chat from URL',
    execute: (args) => {
      const { request } = args as IRouter.ILocation;
      const url = new URL(`http://example.com${request}`);
      const params = url.searchParams;
      const displayName = params.get(URL_PARAM);

      const chatAfterRoute = async () => {
        router.routed.disconnect(chatAfterRoute);
        if (manager.currentRoom?.displayName != displayName) {
          await commands.execute(CommandIds.open);
          manager.currentRoom = { displayName };
        }
      };

      router.routed.connect(chatAfterRoute);
    },
  });

  // Add the commands to the palette.
  palette.addItem({ command: CommandIds.open, category });
  palette.addItem({ command: CommandIds.toggleArea, category });

  // Add to the router
  router.register({
    command: CommandIds.routerStart,
    pattern: /.*/,
    rank: 29,
  });

  // If available, add a card to the launcher
  if (launcher) {
    launcher.add({ command: CommandIds.open, args: { area: 'main' } });
  }

  // If available, restore the position
  if (restorer) {
    restorer
      .restore(tracker, { command: CommandIds.open, name: () => `id-${NS}` })
      .catch(console.warn);
  }

  // Return the manager that others extensions can use
  return manager;
}

/**
 * Initialization data for the jupyter-jitsi extension.
 */
const plugin: JupyterFrontEndPlugin<IVideoChatManager> = {
  id: `${NS}:plugin`,
  autoStart: true,
  requires: [ICommandPalette, IRouter, ISettingRegistry],
  optional: [ILauncher, ILayoutRestorer],
  activate,
};

// In the future, there may be more extensions
export default [plugin];
