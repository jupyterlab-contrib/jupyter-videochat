import { Token } from '@lumino/coreutils';
import { ISignal } from '@lumino/signaling';

import { ISettingRegistry } from '@jupyterlab/settingregistry';

import { Room, VideoChatConfig, IMeet, IMeetConstructor } from './types';

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
 * The public interface exposed by the video chat extension
 *
 * ### Notes
 * This should likely be
 */
export interface IVideoChatManager {
  /** The known Hub `Rooms` from the server */
  rooms: Room[];

  /** The current room */
  currentRoom: Room;

  /** Whether the manager is fully initialized */
  initialized: boolean;

  /** Initialize the manager */
  initialize(): void;

  /** Create a new `Room` */
  createRoom(room: Room): Promise<Room>;

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
  JitsiMeetExternalAPI: IMeetConstructor;
}

/** A namespace for VideoChatManager details */
export namespace IVideoChatManager {
  /** Options for constructing a new IVideoChatManager */
  export interface IOptions {
    // TBD
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
