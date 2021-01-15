import { Token } from '@lumino/coreutils';
import { ISignal } from '@lumino/signaling';

import { Room, VideoChatConfig, IMeet, IMeetConstructor } from './types';

export const NS = 'jupyterlab-videochat';

export const URL_PARAM = 'jvc';

export const DEFAULT_JS_API_URL = 'https://meet.jit.si/external_api.js';

export interface IVideoChatManager {
  rooms: Room[];
  currentRoom: Room;
  initialized: boolean;
  initialize(): void;
  createRoom(room: Room): Promise<Room>;
  config: VideoChatConfig;
  meet: IMeet;
  meetChanged: ISignal<IVideoChatManager, void>;
  JitsiMeetExternalAPI: IMeetConstructor;
}

export namespace IVideoChatManager {
  export interface IOptions {}
}

export namespace CommandIds {
  export const open = 'jitsi:open';
  export const toggleArea = 'jitsi:togglearea';
  export const routerStart = 'jitsi:router';
}

/* tslint:disable */
export const IVideoChatManager = new Token<IVideoChatManager>(
  `${NS}:IVideoChatManager`
);
/* tslint:enable */
