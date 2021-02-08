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
  let subject: string | null = null;

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

  // hide the label when in sidebar, as it shows the rotated text
  function updateTitle() {
    if (subject != null) {
      widget.title.caption = subject;
    } else {
      widget.title.caption = DEFAULT_LABEL;
    }
    widget.title.label = currentArea === 'main' ? widget.title.caption : '';
  }

  // add to shell, update tracker, title, etc.
  function addToShell(area?: string) {
    area = area || currentArea;
    shell.add(widget, area);
    updateTitle();
    widget.update();
    if (!tracker.has(widget)) {
      tracker.add(widget).catch(void 0);
    } else if (area == 'main') {
      shell.activateById(widget.id);
    }
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

  addToShell();

  // connect settings
  settingRegistry
    .load(plugin.id)
    .then((settings) => (manager.settings = settings))
    .catch(console.error);

  // add commands
  commands.addCommand(CommandIds.open, {
    label: 'Video Chat',
    icon: prettyChatIcon,
    execute: async (args: IChatArgs) => {
      await manager.initialized;
      currentArea = args.area || 'main';
      addToShell(currentArea);
      // Potentially navigate to new room
      if (manager.currentRoom?.displayName !== args.displayName) {
        manager.currentRoom = { displayName: args.displayName };
      }
    },
  });

  commands.addCommand(CommandIds.toggleArea, {
    label: 'Toggle Video Chat Sidebar',
    execute: async () => {
      currentArea = ['right', 'left'].includes(currentArea) ? 'main' : 'right';
      addToShell();
    },
  });

  commands.addCommand(CommandIds.routerStart, {
    label: 'Open Video Chat from URL',
    execute: async (args) => {
      const { request } = args as IRouter.ILocation;
      const url = new URL(`http://example.com${request}`);
      const params = url.searchParams;
      const displayName = params.get(URL_PARAM);

      const chatAfterRoute = async () => {
        router.routed.disconnect(chatAfterRoute);
        if (manager.currentRoom?.displayName != displayName) {
          await commands.execute(CommandIds.open, { displayName });
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

  manager.initialize();

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
  provides: IVideoChatManager,
  activate,
};

// In the future, there may be more extensions
export default [plugin];
