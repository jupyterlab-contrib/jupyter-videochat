import { Token } from '@lumino/coreutils';
import { ISignal } from '@lumino/signaling';

import { ISettingRegistry } from '@jupyterlab/settingregistry';

import { Room, VideoChatConfig, IMeet, IJitsiFactory } from './types';

/** The namespace for key tokens and IDs */
export const NS = 'jupyterlab-videochat';

/** The serverextension namespace, to be combined with the `base_url`
 */
export const API_NAMESPACE = 'videochat';

/** A CSS prefix */
export const CSS = 'jp-VideoChat';

/** The URL parameter (specified with `&` or `?`) which will trigger a re-route */
export const URL_PARAM = 'jvc';

/** JS assets of last resort
 *
 * ### Note
 * If an alternate Jitsi server is provided, it is assumed `/external_api.js`
 * is hosted from the root.
 */
export const DEFAULT_DOMAIN = 'meet.jit.si';

/**
 * An interface for sources of Jitsi Rooms
 */
export interface IRoomProvider {
  /**
   * Fetch available rooms
   */
  updateRooms: () => Promise<Room[]>;
  /**
   * Create a new room, filling in missing details
   */
  createRoom: (room: Partial<Room>) => Promise<Room | null>;
  /**
   * Fetch the config
   */
  updateConfig: () => Promise<VideoChatConfig>;
}

/**
 * The public interface exposed by the video chat extension
 */
export interface IVideoChatManager extends IRoomProvider {
  /** The known Hub `Rooms` from the server */
  rooms: Room[];

  /** The current room */
  currentRoom: Room;

  /** Whether the manager is fully initialized */
  isInitialized: boolean;

  /** A `Promise` that resolves when fully initialized */
  initialized: Promise<void>;

  /** The last-fetched config from the server */
  config: VideoChatConfig;

  /** The current Jitsi Meet instance */
  meet: IMeet | null;

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
  currentArea: string;

  /**
   * Add a new room provider.
   */
  registerRoomProvider(options: IVideoChatManager.IProviderOptions): void;

  /**
   * A signal for when room providers change
   */
  roomProvidersChanged: ISignal<IVideoChatManager, void>;
}

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

  /** The command id for switching the area of the UI */
  export const toggleArea = `${NS}:togglearea`;

  /** The special command used during routing */
  export const routerStart = `${NS}:router`;
}

/* tslint:disable */
/** The VideoManager extension point, to be used in other plugins' `activate`
 * functions */
export const IVideoChatManager = new Token<IVideoChatManager>(
  `${NS}:IVideoChatManager`
);
/* tslint:enable */
