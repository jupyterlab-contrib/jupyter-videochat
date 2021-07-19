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

import {
  CommandIds,
  IVideoChatManager,
  SERVER_URL_PARAM,
  NS,
  CSS,
  PUBLIC_URL_PARAM,
} from './tokens';
import { IChatArgs } from './types';
import { VideoChatManager } from './manager';
import { VideoChat } from './widget';
import { chatIcon, prettyChatIcon } from './icons';
import { ServerRoomProvider } from './rooms-server';

const DEFAULT_LABEL = 'Video Chat';

const category = 'Video Chat';

/**
 * Handle application-level concerns
 */
async function activateCore(
  app: JupyterFrontEnd,
  settingRegistry: ISettingRegistry,
  palette?: ICommandPalette,
  launcher?: ILauncher,
  restorer?: ILayoutRestorer
): Promise<IVideoChatManager> {
  const { commands, shell } = app;

  const manager = new VideoChatManager();

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
    widget.title.label =
      manager.currentArea === 'main' ? widget.title.caption : '';
  }

  // add to shell, update tracker, title, etc.
  function addToShell(area?: string, activate = true) {
    area = area || manager.currentArea;
    shell.add(widget, area);
    updateTitle();
    widget.update();
    if (!tracker.has(widget)) {
      tracker.add(widget).catch(void 0);
    }
    if (activate) {
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

  // connect settings
  settingRegistry
    .load(corePlugin.id)
    .then((settings) => {
      manager.settings = settings;
      settings.changed.connect(() => addToShell());
      addToShell(null, false);
    })
    .catch(() => addToShell(null, false));

  // add commands
  commands.addCommand(CommandIds.open, {
    label: 'Video Chat',
    icon: prettyChatIcon,
    execute: async (args: IChatArgs) => {
      await manager.initialized;
      addToShell(null, true);
      // Potentially navigate to new room
      if (manager.currentRoom?.displayName !== args.displayName) {
        manager.currentRoom = { displayName: args.displayName };
      }
    },
  });

  commands.addCommand(CommandIds.toggleArea, {
    label: 'Toggle Video Chat Sidebar',
    execute: async () => {
      manager.currentArea = ['right', 'left'].includes(manager.currentArea)
        ? 'main'
        : 'right';
    },
  });

  // If available, add the commands to the palette
  if (palette) {
    palette.addItem({ command: CommandIds.open, category });
    palette.addItem({ command: CommandIds.toggleArea, category });
  }

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
 * Initialization data for the `jupyterlab-videochat:plugin`.
 *
 * This only rooms provided are opt-in, global rooms without any room name
 * obfuscation.
 */
const corePlugin: JupyterFrontEndPlugin<IVideoChatManager> = {
  id: `${NS}:plugin`,
  autoStart: true,
  requires: [ISettingRegistry],
  optional: [ICommandPalette, ILauncher, ILayoutRestorer],
  provides: IVideoChatManager,
  activate: activateCore,
};

/**
 * Create the server room plugin
 *
 * In the future, this might `provide` itself with some reasonable API,
 * but is already accessible from the manager, which is likely preferable.
 */
function activateServerRooms(
  app: JupyterFrontEnd,
  chat: IVideoChatManager,
  router?: IRouter
): void {
  const { commands } = app;
  const provider = new ServerRoomProvider({
    serverSettings: app.serviceManager.serverSettings,
  });

  chat.registerRoomProvider({
    id: 'server',
    label: 'Server',
    rank: 0,
    provider,
  });

  // If available, Add to the router
  if (router) {
    commands.addCommand(CommandIds.serverRouterStart, {
      label: 'Open Server Video Chat from URL',
      execute: async (args) => {
        const { request } = args as IRouter.ILocation;
        const url = new URL(`http://example.com${request}`);
        const params = url.searchParams;
        const displayName = params.get(SERVER_URL_PARAM);

        const chatAfterRoute = async () => {
          router.routed.disconnect(chatAfterRoute);
          if (chat.currentRoom?.displayName != displayName) {
            await commands.execute(CommandIds.open, { displayName });
          }
        };

        router.routed.connect(chatAfterRoute);
      },
    });

    router.register({
      command: CommandIds.serverRouterStart,
      pattern: /.*/,
      rank: 29,
    });
  }
}

/**
 * Initialization data for the `jupyterlab-videochat:rooms-server` plugin, provided
 * by the serverextension REST API
 */
const serverRoomsPlugin: JupyterFrontEndPlugin<void> = {
  id: `${NS}:rooms-server`,
  autoStart: true,
  requires: [IVideoChatManager],
  optional: [IRouter],
  activate: activateServerRooms,
};

/**
 * Initialization data for the `jupyterlab-videochat:rooms-public` plugin, which
 * offers no persistence or even best-effort guarantee of privacy
 */
const publicRoomsPlugin: JupyterFrontEndPlugin<void> = {
  id: `${NS}:rooms-public`,
  autoStart: true,
  requires: [IVideoChatManager],
  optional: [IRouter, ICommandPalette],
  activate: activatePublicRooms,
};

/**
 * Create the public room plugin
 *
 * In the future, this might `provide` itself with some reasonable API,
 * but is already accessible from the manager, which is likely preferable.
 */
async function activatePublicRooms(
  app: JupyterFrontEnd,
  chat: IVideoChatManager,
  router?: IRouter,
  palette?: ICommandPalette
): Promise<void> {
  const { commands } = app;

  chat.registerRoomProvider({
    id: 'public',
    label: 'Public',
    rank: 999,
    provider: {
      updateRooms: async () => [],
      createRoom: () => null,
      updateConfig: async () => {
        return {} as any;
      },
    },
  });

  commands.addCommand(CommandIds.togglePublicRooms, {
    label: 'Toggle Video Chat Public Rooms',
    isVisible: () => !!chat.settings,
    isToggleable: true,
    isToggled: () => !chat.settings?.composite.disablePublicRooms,
    execute: async () => {
      if (!chat.settings) {
        console.warn('Video chat settings not loaded');
        return;
      }
      await chat.settings.set(
        'disablePublicRooms',
        !chat.settings?.composite.disablePublicRooms
      );
    },
  });

  // If available, Add to the router
  if (router) {
    commands.addCommand(CommandIds.publicRouterStart, {
      label: 'Open Public Video Chat from URL',
      execute: async (args) => {
        const { request } = args as IRouter.ILocation;
        const url = new URL(`http://example.com${request}`);
        const params = url.searchParams;
        const roomId = params.get(PUBLIC_URL_PARAM);

        const chatAfterRoute = async () => {
          router.routed.disconnect(chatAfterRoute);
          if (chat.currentRoom?.displayName != roomId) {
            chat.currentRoom = {
              id: roomId,
              displayName: roomId,
              description: 'A Public Room',
            };
          }
        };

        router.routed.connect(chatAfterRoute);
      },
    });

    router.register({
      command: CommandIds.publicRouterStart,
      pattern: /.*/,
      rank: 99,
    });
  }

  if (palette) {
    palette.addItem({ command: CommandIds.togglePublicRooms, category });
  }
}

// In the future, there may be more extensions
export default [corePlugin, serverRoomsPlugin, publicRoomsPlugin];
