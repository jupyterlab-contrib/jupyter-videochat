/**
 * Command args for toggling position in shell
 */
export interface IChatArgs {
  area?: 'left' | 'right' | 'main';
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

/** Need to figure out how to use these */
export type TCommandId = string;

/** @see https://jitsi.github.io/handbook/docs/dev-guide/dev-guide-iframe#events */
export type TEvent =
  | 'cameraError'
  | 'avatarChanged'
  | 'audioAvailabilityChanged'
  | 'audioMuteStatusChanged'
  | 'contentSharingParticipantsChanged'
  | 'endpointTextMessageReceived'
  | 'largeVideoChanged'
  | 'log'
  | 'micError'
  | 'screenSharingStatusChanged'
  | 'dominantSpeakerChanged'
  | 'raiseHandUpdated'
  | 'tileViewChanged'
  | 'incomingMessage'
  | 'outgoingMessage'
  | 'displayNameChange'
  | 'deviceListChanged'
  | 'emailChange'
  | 'feedbackSubmitted'
  | 'filmstripDisplayChanged'
  | 'participantJoined'
  | 'participantKickedOut'
  | 'participantLeft'
  | 'participantRoleChanged'
  | 'passwordRequired'
  | 'videoConferenceJoined'
  | 'videoConferenceLeft'
  | 'videoAvailabilityChanged'
  | 'videoMuteStatusChanged'
  | 'videoQualityChanged'
  | 'readyToClose'
  | 'subjectChange'
  | 'suspendDetected';

/** Would be nice to be able to use existing libs, sigh */
export interface IEventListener {
  (evt: Event, ...args: any): void;
}
export interface IEventListenerMap {
  [key: string]: IEventListener;
}

export interface ICommandMap {
  [key: string]: any;
}

/**
 * The Jitsi Meet constructor
 *
 * @see https://jitsi.github.io/handbook/docs/dev-guide/dev-guide-iframe#integration
 */
export interface IMeetConstructor {
  new (domain: string, options: IMeetOptions): IMeet;
}

/**
 * Options to initialize a jitsi meeting
 */
export interface IMeetOptions {
  /** name of the room to join. */
  roomName?: string;
  /** width for the iframe which will be created. If a number is specified
   * it's treated as pixel units. If a string is specified the format is
   * number followed by 'px', 'em', 'pt' or '%'. */
  width?: string | number;
  /** height for the iframe which will be created. If a number is specified
   * it's treated as pixel units. If a string is specified the format is
   * number followed by 'px', 'em', 'pt' or '%'. */
  height?: string | number;
  /** HTML DOM Element where the iframe will be added as a child. */
  parentNode?: HTMLElement;
  /** JS object with overrides for options defined in config.js. */
  configOverwrite?: IConfig;
  /** JS object with overrides for options defined in interface_config.js. */
  interfaceConfigOverwrite?: IInterfaceConfig;
  /** Boolean indicating if the server should be contacted using HTTP or HTTPS. */
  noSSL?: boolean;
  /** JWT token. */
  jwt?: any;
  /** handler for the iframe onload event. */
  onload?: (event: Event) => void;
  /** Array of objects containing information about new participants that
   * will be invited in the call. */
  invitees?: IInvitee[];
  /** A map containing information about the initial devices that will be
   * used in the call. */
  devices?: IDeviceMap;
  /** JS object containing information about the participant opening the
   * meeting, such as email. */
  userInfo?: IUserInfo;
}

export interface IJitsiFactory {
  (): IMeetConstructor;
}

export interface IUserInfo {}
export interface IConfig {}
export interface IInterfaceConfig {}
export interface IInvitee {}
export interface IDevice {}
export interface IDeviceMap {
  [key: string]: IDevice;
}

/**
 * Command strings understood by the Jitsi IFrame API
 *
 * @see https://jitsi.github.io/handbook/docs/dev-guide/dev-guide-iframe#commands
 *
 * ### Note
 * These should be extended to e.g. an interface which captures the parameter(s)
 * and return value types
 */
export type TCommand =
  | 'displayName'
  | 'password'
  | 'toggleLobby'
  | 'sendTones'
  | 'subject'
  | 'toggleAudio'
  | 'toggleVideo'
  | 'toggleFilmStrip'
  | 'toggleChat'
  | 'toggleShareScreen'
  | 'toggleTileView'
  | 'hangup'
  | 'email'
  | 'avatarUrl'
  | 'sendEndpointTextMessage'
  | 'setLargeVideoParticipant'
  | 'setVideoQuality'
  | 'muteEveryone'
  | 'startRecording'
  | 'stopRecording'
  | 'intiatePrivateChat'
  | 'cancelPrivateChat'
  | 'getContentSharingParticipants';

/**
 * A Jitsi Meeting
 */

export interface IMeet {
  dispose(): void;

  executeCommand(command: TCommand, ...options: any): void;
  executeCommands(commands: ICommandMap): void;

  /* event cruft */
  on(event: TEvent, listener: IEventListener): void;
  addEventListener(event: TEvent, listener: IEventListener): void;
  addEventListeners(events: IEventListenerMap): void;
  removeEventListener(listener: any): void;
  removeEventListeners(listeners: any[]): void;
  getAvatarURL(): string;
  getDisplayName(): string;
  getEmail(): string;
  getIFrame(): HTMLIFrameElement;
  getNumberOfParticipants(): number;

  /* promises that are probably bools */
  isAudioAvailable(): Promise<boolean>;
  isVideoAvailable(): Promise<boolean>;
  isAudioMuted(): Promise<boolean>;
  isVideoMuted(): Promise<boolean>;
  isDeviceChangeAvailable(): Promise<boolean>;
  isDeviceListAvailable(): Promise<boolean>;
  isMultipleAudioInputSupported(): Promise<boolean>;

  /* poorly typed for now */
  getCurrentDevices(): Promise<any>;
  getAvailableDevices(): Promise<any>;

  /* not even trying now */
  // sendProxyConnectionEvent: ƒ sendProxyConnectionEvent(e)
  // setAudioInputDevice: ƒ setAudioInputDevice(e, t)
  // setAudioOutputDevice: ƒ setAudioOutputDevice(e, t)
  // setVideoInputDevice: ƒ setVideoInputDevice(e, t)
  // invite: ƒ invite(e)
}

/** Expected response types from the serverextension routes */
export interface IServerResponses {
  config: VideoChatConfig;
  rooms: Room[];
  'generate-room': Room;
}
