import { Token } from '@lumino/coreutils';
// import { Widget } from '@lumino/widgets';
import { ISignal } from '@lumino/signaling';

import { Room, VideoChatConfig, IMeet } from './types';

export const NS = 'jupyterlab-videochat';

export const URL_PARAM = 'jvc';

export interface IVideoChatManager {
  rooms: Room[];
  currentRoom: Room;
  initialized: boolean;
  initialize(): void;
  createRoom(room: Room): Promise<Room>;
  config: VideoChatConfig;
  meet: IMeet;
  meetChanged: ISignal<IVideoChatManager, void>;
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
