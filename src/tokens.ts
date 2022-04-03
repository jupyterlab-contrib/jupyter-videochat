import { Token } from '@lumino/coreutils';
import { ISignal } from '@lumino/signaling';

import { JitsiMeetExternalAPI } from 'jitsi-meet';

import { MainAreaWidget } from '@jupyterlab/apputils';
import { ILabShell } from '@jupyterlab/application';
import { ISettingRegistry } from '@jupyterlab/settingregistry';

import { Room, VideoChatConfig, IJitsiFactory } from './types';

/** The namespace for key tokens and IDs */
export const NS = 'jupyterlab-videochat';

/** The serverextension namespace, to be combined with the `base_url`
 */
export const API_NAMESPACE = 'videochat';

/** A CSS prefix */
export const CSS = 'jp-VideoChat';

/** The URL parameter (specified with `&` or `?`) which will trigger a re-route */
export const SERVER_URL_PARAM = 'jvc';

export const PUBLIC_URL_PARAM = 'JVC-PUBLIC';

/** JS assets of last resort
 *
 * ### Note
 * If an alternate Jitsi server is provided, it is assumed `/external_api.js`
 * is hosted from the root.
 */
export const DEFAULT_DOMAIN = 'meet.jit.si';

/**
 * The URL frgament (when joined with `baseUrl`) for the retro tree
 */
export const RETRO_TREE_URL = 'retro/tree';

/**
 * The canary in jupyter-config-data for detecting retrolab
 */
export const RETRO_CANARY_OPT = 'retroPage';

/**
 * A URL param that will enable chat, even in non-full Lab
 */
export const FORCE_URL_PARAM = 'show-videochat';

/**
 * Names for spacer components.
 */
export namespace ToolbarIds {
  /**
   * The main area left spacer
   */
  export const SPACER_LEFT = 'spacer-left';

  /**
   * The main area right spacer
   */
  export const SPACER_RIGHT = 'spacer-right';

  /**
   * The button for the area toggle.
   */
  export const TOGGLE_AREA = 'toggle-sidebar';

  /**
   * The button for disconnect.
   */
  export const DISCONNECT = 'disconnect';
  /**
   * The text label for the title.
   */
  export const TITLE = 'title';
}

/**
 * An interface for sources of Jitsi Rooms
 */
export interface IRoomProvider {
  /**
   * Fetch available rooms
   */
  updateRooms: () => Promise<Room[]>;
  /**
   * Whether the provider can create rooms.
   */
  canCreateRooms: boolean;
  /**
   * Create a new room, filling in missing details.
   */
  createRoom?: (room: Partial<Room>) => Promise<Room | null>;
  /**
   * Fetch the config
   */
  updateConfig: () => Promise<VideoChatConfig>;
  /**
   * A signal that updates
   */
  stateChanged?: ISignal<IRoomProvider, void>;
}

/**
 * The public interface exposed by the video chat extension
 */
export interface IVideoChatManager extends IRoomProvider {
  /** The known Hub `Rooms` from the server */
  rooms: Room[];

  /** The current room */
  currentRoom: Room;

  currentRoomChanged: ISignal<IRoomProvider, void>;

  /** Whether the manager is fully initialized */
  isInitialized: boolean;

  /** A `Promise` that resolves when fully initialized */
  initialized: Promise<void>;

  /** The last-fetched config from the server */
  config: VideoChatConfig;

  /** The current Jitsi Meet instance */
  meet: JitsiMeetExternalAPI | null;

  /** A signal emitted when the current Jitsi Meet has changed */
  meetChanged: ISignal<IVideoChatManager, void>;

  /** The user settings object (usually use `composite`) */
  settings: ISettingRegistry.ISettings;

  /** The IFrame API exposed by Jitsi
   *
   * @see https://jitsi.github.io/handbook/docs/dev-guide/dev-guide-iframe
   */
  getJitsiAPI(): IJitsiFactory;

  /** The area in the JupyterLab UI where the chat UI will be shown
   *
   * ### Notes
   * probably one of: left, right, main
   */
  currentArea: ILabShell.Area;

  /**
   * Add a new room provider.
   */
  registerRoomProvider(options: IVideoChatManager.IProviderOptions): void;

  /**
   * Get the provider for a specific room.
   */
  providerForRoom(room: Room): IVideoChatManager.IProviderOptions | null;

  /**
   * A signal for when room providers change
   */
  roomProvidersChanged: ISignal<IVideoChatManager, void>;

  /**
   * A translator for strings from this package
   */
  __(msgid: string, ...args: string[]): string;

  /**
   * The main outer Video Chat widget.
   */
  mainWidget: Promise<MainAreaWidget>;
}

export interface IRoomListProps {}

export type TRoomComponent = (props: RoomsListProps) => JSX.Element;

export type TLazyRoomComponent = () => Promise<TRoomComponent>;

/** A namespace for VideoChatManager details */
export namespace IVideoChatManager {
  /** Options for constructing a new IVideoChatManager */
  export interface IOptions {
    // TBD
  }
  export interface IProviderOptions {
    /** a unique identifier for the provider */
    id: string;
    /** a human-readable label for the provider */
    label: string;
    /** a rank for preference */
    rank: number;
    /** the provider implementation */
    provider: IRoomProvider;
  }
}

/** The lumino commands exposed by this extension */
export namespace CommandIds {
  /** The command id for opening a specific room */
  export const open = `${NS}:open`;

  /** The command id for opening a specific room in a tabs */
  export const openTab = `${NS}:open-tab`;

  /** The command id for switching the area of the UI */
  export const toggleArea = `${NS}:togglearea`;

  /** The command id for disconnecting a video chat */
  export const disconnect = `${NS}:disconnect`;

  /** The command id for enabling public rooms */
  export const togglePublicRooms = `${NS}:togglepublic`;

  /** The special command used during server routing */
  export const serverRouterStart = `${NS}:routerserver`;

  /** The special command used during public routing */
  export const publicRouterStart = `${NS}:routerpublic`;
}

/* tslint:disable */
/** The VideoManager extension point, to be used in other plugins' `activate`
 * functions */
export const IVideoChatManager = new Token<IVideoChatManager>(
  `${NS}:IVideoChatManager`
);
/* tslint:enable */

export type RoomsListProps = {
  onRoomSelect: (room: Room) => void;
  onCreateRoom: (room: Room) => void;
  onEmailChanged: (email: string) => void;
  onDisplayNameChanged: (displayName: string) => void;
  providerForRoom: (room: Room) => IVideoChatManager.IProviderOptions;
  currentRoom: Room;
  rooms: Room[];
  email: string;
  displayName: string;
  domain: string;
  disablePublicRooms: boolean;
  canCreateRooms: boolean;
  __: ITrans;
};

/**
 * A lightweight debug tool.
 */
export const DEBUG = window.location.href.indexOf('JVC_DEBUG') > -1;

/**
 * An gettext-style internationaliation translation signature.
 *
 * args can be referenced by 1-index, e.g. args[0] is %1
 */
export interface ITrans {
  (msgid: string, ...args: string[]): string;
}
