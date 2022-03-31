import type { JitsiMeetExternalAPIConstructor } from 'jitsi-meet';

/**
 * Command args for toggling position in shell
 */
export interface IChatArgs {
  area?: 'left' | 'right' | 'main';
  displayName?: string;
}

/**
 * A model of a room
 */
export type Room = {
  /** The human-readable name of the room */
  displayName: string;

  /** A machine-friendly mangled version of the name */
  id?: string;

  /** Human-readable description of the room */
  description?: string;
};

/**
 * Configuration for a video chat
 */
export type VideoChatConfig = {
  jitsiServer: string;
};

export interface IJitsiFactory {
  (): JitsiMeetExternalAPIConstructor;
}

/** Expected response types from the serverextension routes */
export interface IServerResponses {
  config: VideoChatConfig;
  rooms: Room[];
  'generate-room': Room;
}
