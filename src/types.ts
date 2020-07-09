/**
 * command args for toggling position in shell
 */
export interface IChatArgs {
  area?: 'left' | 'right' | 'main';
}

/**
 * a model of a room
 */
export type Room = {
  displayName: string;
  id?: string;
  description?: string;
};

/**
 * configuration for a video chat
 */
export type VideoChatConfig = {
  jitsiServer: string;
};

/**
 * the jitsi meet constructor
 */
export interface IMeetConstructor {
  new (domain: string, options: IMeetOptions): IMeet;
}

/**
 * A jitsi meeting
 */
export interface IMeet {
  executeCommand(command: string, ...options: any): void;
  dispose(): void;
  on(event: string, fn: (...args: any) => void): void;
}

/**
 * options to initialize a jitsi meeting
 */
export interface IMeetOptions {}
