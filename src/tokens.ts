import { Token } from '@lumino/coreutils';
import { ISignal } from '@lumino/signaling';

import { ISettingRegistry } from '@jupyterlab/settingregistry';

import { Room, VideoChatConfig, IMeet, IMeetConstructor } from './types';

/** The namespace for key tokens and IDs */
export const NS = 'jupyterlab-videochat';

/** A CSS prefix */
export const CSS = 'jp-VideoChat';

/** The URL parameter (specified with `&` or `?`) which will trigger a re-route */
export const URL_PARAM = 'jvc';

/** JS assets of last resort
 *
 * ### Note
 * If an alternate Jitsi server is provided, it is assumed `external_api.js`
 * is hosted from the root.
 */
export const DEFAULT_JS_API_URL = 'https://meet.jit.si/external_api.js';

/**
 * The public interface exposed by the video chat extension
 *
 * ### Notes
 * This should likely be
 */
export interface IVideoChatManager {
  rooms: Room[];
  currentRoom: Room;
  initialized: boolean;
  initialize(): void;
  createRoom(room: Room): Promise<Room>;
  config: VideoChatConfig;
  meet: IMeet;
  meetChanged: ISignal<IVideoChatManager, void>;
  settings: ISettingRegistry.ISettings;
  JitsiMeetExternalAPI: IMeetConstructor;
}

export namespace IVideoChatManager {
  export interface IOptions {}
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
export const IVideoChatManager = new Token<IVideoChatManager>(
  `${NS}:IVideoChatManager`
);
/* tslint:enable */
