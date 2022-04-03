import { PageConfig, URLExt } from '@jupyterlab/coreutils';

import {
  ILabShell,
  ILayoutRestorer,
  IRouter,
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
  LabShell,
} from '@jupyterlab/application';

import { launcherIcon, stopIcon } from '@jupyterlab/ui-components';

import { ITranslator, nullTranslator } from '@jupyterlab/translation';

import {
  CommandToolbarButton,
  ICommandPalette,
  Toolbar,
  WidgetTracker,
  MainAreaWidget,
} from '@jupyterlab/apputils';

import { IFileBrowserFactory } from '@jupyterlab/filebrowser';
import { ISettingRegistry } from '@jupyterlab/settingregistry';
import { ILauncher } from '@jupyterlab/launcher';
import { IMainMenu } from '@jupyterlab/mainmenu';

import {
  CommandIds,
  CSS,
  DEBUG,
  FORCE_URL_PARAM,
  IVideoChatManager,
  NS,
  PUBLIC_URL_PARAM,
  RETRO_CANARY_OPT,
  RETRO_TREE_URL,
  SERVER_URL_PARAM,
  ToolbarIds,
} from './tokens';
import { IChatArgs } from './types';
import { VideoChatManager } from './manager';
import { VideoChat } from './widget';
import { chatIcon, prettyChatIcon } from './icons';
import { ServerRoomProvider } from './rooms-server';
import { RoomTitle } from './widgets/title';

const DEFAULT_LABEL = 'Video Chat';

const category = DEFAULT_LABEL;

function isFullLab(app: JupyterFrontEnd) {
  return !!(app.shell as ILabShell).layoutModified;
}

/**
 * Handle application-level concerns
 */
async function activateCore(
  app: JupyterFrontEnd,
  settingRegistry: ISettingRegistry,
  translator?: ITranslator,
  palette?: ICommandPalette,
  launcher?: ILauncher,
  restorer?: ILayoutRestorer,
  mainmenu?: IMainMenu
): Promise<IVideoChatManager> {
  const { commands, shell } = app;

  const labShell = isFullLab(app) ? (shell as LabShell) : null;

  const manager = new VideoChatManager({
    trans: (translator || nullTranslator).load(NS),
  });

  const { __ } = manager;

  let widget: MainAreaWidget;
  let chat: VideoChat;
  let subject: string | null = null;

  const tracker = new WidgetTracker<MainAreaWidget>({ namespace: NS });

  if (!widget || widget.isDisposed) {
    // Create widget
    chat = new VideoChat(manager, {});
    widget = new MainAreaWidget({ content: chat });
    widget.addClass(`${CSS}-wrapper`);
    manager.setMainWidget(widget);

    widget.toolbar.addItem(ToolbarIds.SPACER_LEFT, Toolbar.createSpacerItem());

    widget.toolbar.addItem(ToolbarIds.TITLE, new RoomTitle(manager));

    widget.toolbar.addItem(ToolbarIds.SPACER_RIGHT, Toolbar.createSpacerItem());

    const disconnectBtn = new CommandToolbarButton({
      id: CommandIds.disconnect,
      commands,
      icon: stopIcon,
    });

    const onCurrentRoomChanged = () => {
      if (manager.currentRoom) {
        disconnectBtn.show();
      } else {
        disconnectBtn.hide();
      }
    };

    manager.currentRoomChanged.connect(onCurrentRoomChanged);

    widget.toolbar.addItem(ToolbarIds.DISCONNECT, disconnectBtn);

    onCurrentRoomChanged();

    chat.id = `id-${NS}`;
    chat.title.caption = __(DEFAULT_LABEL);
    chat.title.closable = false;
    chat.title.icon = chatIcon;
  }

  // hide the label when in sidebar, as it shows the rotated text
  function updateTitle() {
    if (subject != null) {
      widget.title.caption = subject;
    } else {
      widget.title.caption = __(DEFAULT_LABEL);
    }
    widget.title.label = manager.currentArea === 'main' ? widget.title.caption : '';
  }

  // add to shell, update tracker, title, etc.
  function addToShell(area?: ILabShell.Area, activate = true) {
    DEBUG && console.warn(`add to shell in are ${area}, ${!activate || 'not '} active`);
    area = area || manager.currentArea;
    if (labShell) {
      labShell.add(widget, area);
      updateTitle();
      widget.update();
      if (!tracker.has(widget)) {
        tracker.add(widget).catch(void 0);
      }
      if (activate) {
        shell.activateById(widget.id);
      }
    } else if (window.location.search.indexOf(FORCE_URL_PARAM) !== -1) {
      document.title = [document.title.split(' - ')[0], __(DEFAULT_LABEL)].join(' - ');
      app.shell.currentWidget.parent = null;
      app.shell.add(widget, 'main', { rank: 0 });
      const { parent } = widget;
      parent.addClass(`${CSS}-main-parent`);
      setTimeout(() => {
        parent.update();
        parent.fit();
        app.shell.fit();
        app.shell.update();
      }, 100);
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
      let lastArea = manager.settings.composite.area;
      settings.changed.connect(() => {
        if (lastArea !== manager.settings.composite.area) {
          addToShell();
        }
        lastArea = manager.settings.composite.area;
      });
      addToShell(null, false);
    })
    .catch(() => addToShell(null, false));

  // add commands
  commands.addCommand(CommandIds.open, {
    label: __(DEFAULT_LABEL),
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

  commands.addCommand(CommandIds.disconnect, {
    label: __('Disconnect Video Chat'),
    execute: () => (manager.currentRoom = null),
    icon: stopIcon,
  });

  commands.addCommand(CommandIds.toggleArea, {
    label: __('Toggle Video Chat Sidebar'),
    icon: launcherIcon,
    execute: async () => {
      manager.currentArea = ['right', 'left'].includes(manager.currentArea)
        ? 'main'
        : 'right';
    },
  });

  // If available, add the commands to the palette
  if (palette) {
    palette.addItem({ command: CommandIds.open, category: __(category) });
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

  // If available, add to the file->new menu.... new tab handled in retroPlugin
  if (mainmenu && labShell) {
    mainmenu.fileMenu.newMenu.addGroup([{ command: CommandIds.open }]);
  }

  // Return the manager that others extensions can use
  return manager;
}

/**
 * Initialization data for the `jupyterlab-videochat:plugin` Plugin.
 *
 * This only rooms provided are opt-in, global rooms without any room name
 * obfuscation.
 */
const corePlugin: JupyterFrontEndPlugin<IVideoChatManager> = {
  id: `${NS}:plugin`,
  autoStart: true,
  requires: [ISettingRegistry],
  optional: [ITranslator, ICommandPalette, ILauncher, ILayoutRestorer, IMainMenu],
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
  const { __ } = chat;

  const { commands } = app;
  const provider = new ServerRoomProvider({
    serverSettings: app.serviceManager.serverSettings,
  });

  chat.registerRoomProvider({
    id: 'server',
    label: __('Server'),
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

  const { __ } = chat;

  chat.registerRoomProvider({
    id: 'public',
    label: __('Public'),
    rank: 999,
    provider: {
      updateRooms: async () => [],
      canCreateRooms: false,
      updateConfig: async () => {
        return {} as any;
      },
    },
  });

  commands.addCommand(CommandIds.togglePublicRooms, {
    label: __('Toggle Video Chat Public Rooms'),
    isVisible: () => !!chat.settings,
    isToggleable: true,
    isToggled: () => !chat.settings?.composite.disablePublicRooms,
    execute: async () => {
      if (!chat.settings) {
        console.warn(__('Video chat settings not loaded'));
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
      label: __('Open Public Video Chat from URL'),
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
              description: __('A Public Room'),
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

  // If available, add to command palette
  if (palette) {
    palette.addItem({ command: CommandIds.togglePublicRooms, category });
  }
}

/**
 * Initialization for the `jupyterlab-videochat:retro` retrolab (no-op in full)
 */
const retroPlugin: JupyterFrontEndPlugin<void> = {
  id: `${NS}:retro`,
  autoStart: true,
  requires: [IVideoChatManager],
  optional: [IFileBrowserFactory, IMainMenu],
  activate: activateRetro,
};

function activateRetro(
  app: JupyterFrontEnd,
  chat: IVideoChatManager,
  filebrowser?: IFileBrowserFactory,
  mainmenu?: IMainMenu
): void {
  if (!PageConfig.getOption(RETRO_CANARY_OPT)) {
    return;
  }

  const { __ } = chat;

  const baseUrl = PageConfig.getBaseUrl();

  // this is basically hard-coded upstream
  const treeUrl = URLExt.join(baseUrl, RETRO_TREE_URL);

  const { commands } = app;

  commands.addCommand(CommandIds.openTab, {
    label: __('New Video Chat'),
    icon: prettyChatIcon,
    execute: (args: any) => {
      window.open(`${treeUrl}?${FORCE_URL_PARAM}`, '_blank');
    },
  });

  // If available, add menu item
  if (mainmenu) {
    mainmenu.fileMenu.newMenu.addGroup([{ command: CommandIds.openTab }]);
  }

  // If available, add button to file browser
  if (filebrowser) {
    const spacer = Toolbar.createSpacerItem();
    spacer.node.style.flex = '1';
    filebrowser.defaultBrowser.toolbar.insertItem(999, 'videochat-spacer', spacer);
    filebrowser.defaultBrowser.toolbar.insertItem(
      1000,
      'new-videochat',
      new CommandToolbarButton({
        commands,
        id: CommandIds.openTab,
      })
    );
  }
}

/**
 * Initialization for the `jupyterlab-videochat:toggle-area`, which allows the user
 * to switch where video chat occurs.
 */
const areaTogglePlugin: JupyterFrontEndPlugin<void> = {
  id: `${NS}:toggle-area`,
  autoStart: true,
  requires: [IVideoChatManager],
  optional: [ICommandPalette],
  activate: activateToggleArea,
};

function activateToggleArea(
  app: JupyterFrontEnd,
  chat: IVideoChatManager,
  palette?: ICommandPalette
): void {
  const { shell, commands } = app;
  const { __ } = chat;

  const labShell = isFullLab(app) ? (shell as LabShell) : null;

  if (!labShell) {
    return;
  }

  const toggleBtn = new CommandToolbarButton({
    id: CommandIds.toggleArea,
    commands,
    icon: launcherIcon,
  });

  chat.mainWidget
    .then((widget) => {
      widget.toolbar.insertBefore(
        ToolbarIds.SPACER_LEFT,
        ToolbarIds.TOGGLE_AREA,
        toggleBtn
      );
    })
    .catch((err) => console.warn(__(`Couldn't add Video Chat area toggle`), err));

  if (palette) {
    palette.addItem({ command: CommandIds.toggleArea, category: __(category) });
  }
}

// In the future, there may be more extensions
export default [
  corePlugin,
  serverRoomsPlugin,
  publicRoomsPlugin,
  retroPlugin,
  areaTogglePlugin,
];
