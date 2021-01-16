import { URLExt } from '@jupyterlab/coreutils';
import { ServerConnection } from '@jupyterlab/services';
import { VDomModel } from '@jupyterlab/apputils';
import { Signal } from '@lumino/signaling';
import { PromiseDelegate } from '@lumino/coreutils';

import { IVideoChatManager, DEFAULT_JS_API_URL, CSS } from './tokens';
import { Room, VideoChatConfig, IMeet, IMeetConstructor } from './types';

/** A manager that can add, join, or create Jitsi rooms
 */
export class VideoChatManager extends VDomModel implements IVideoChatManager {
  private _rooms: Room[] = [];
  private _currentRoom: Room;
  private _initialized = false;
  private _config: VideoChatConfig;
  private _meet: IMeet;
  private _meetChanged: Signal<VideoChatManager, void>;

  constructor(options: VideoChatManager.IOptions) {
    super();
    this._meetChanged = new Signal(this);
  }

  /** all known rooms */
  get rooms(): Room[] {
    return this._rooms;
  }

  /** whether the manager is initialized */
  get initialized(): boolean {
    return this._initialized;
  }

  /** the current room */
  get currentRoom(): Room {
    return this._currentRoom;
  }

  /**
   * set the current room, potentially scheduling a trip to the server for an id
   */
  set currentRoom(room: Room) {
    this._currentRoom = room;
    this.stateChanged.emit(void 0);
    if (room != null && room.id == null) {
      this.createRoom(room).catch(console.warn);
    }
  }

  /** the configuration from the server/settings */
  get config(): VideoChatConfig {
    return this._config;
  }

  /** the current JitsiExternalAPI */
  get meet(): IMeet {
    return this._meet;
  }

  /** update the current meet */
  set meet(meet: IMeet) {
    if (this._meet !== meet) {
      this._meet = meet;
      this._meetChanged.emit(void 0);
    }
  }

  /** a signal that emits when the current meet changes */
  get meetChanged(): Signal<IVideoChatManager, void> {
    return this._meetChanged;
  }

  /** handle updating configuration and rooms from the server */
  initialize(): void {
    Promise.all([this.updateConfig(), this.updateRooms()])
      .then(() => {
        this._initialized = true;
        this.stateChanged.emit(void 0);
      })
      .catch(console.warn);
  }

  /** request the configuration from the server */
  async updateConfig(): Promise<void> {
    this._config = await requestAPI<VideoChatConfig>('config');
    this.stateChanged.emit(void 0);
  }

  /** request the room list from the server */
  async updateRooms(): Promise<void> {
    this._rooms = await requestAPI<Array<Room>>('rooms');
    this.stateChanged.emit(void 0);
  }

  /** create a new named room */
  async createRoom(room: Partial<Room>): Promise<Room> {
    const newRoom = await requestAPI<Room>('generate-room', {
      method: 'POST',
      body: JSON.stringify(room),
    });
    this.currentRoom = newRoom;
    return newRoom;
  }

  /** get the JitiExternalAPI script, as loaded from the jitsi server */
  get JitsiMeetExternalAPI(): IMeetConstructor | null {
    if (Private.api) {
      return Private.api;
    } else if (this.config != null) {
      let url = DEFAULT_JS_API_URL;
      if (this.config.jitsiServer) {
        url = `https://${this.config.jitsiServer}/external_api.js`;
      }
      Private.ensureExternalAPI(url)
        .then(() => this.stateChanged.emit(void 0))
        .catch(console.warn);
    }
    return null;
  }
}

/** a namespace for video chat manager extras */
export namespace VideoChatManager {
  /** placeholder options for video chat manager */
  export interface IOptions {}
}
/**
 * Call the API extension
 *
 * @param endPoint API REST end point for the extension
 * @param init Initial values for the request
 * @returns The response body interpreted as JSON
 */
export async function requestAPI<T>(
  endPoint = '',
  init: RequestInit = {}
): Promise<T> {
  // Make request to Jupyter API
  const settings = ServerConnection.makeSettings();
  const requestUrl = URLExt.join(
    settings.baseUrl,
    'videochat', // API Namespace
    endPoint
  );

  let response: Response;
  try {
    response = await ServerConnection.makeRequest(requestUrl, init, settings);
  } catch (error) {
    throw new ServerConnection.NetworkError(error);
  }

  const data = await response.json();

  if (!response.ok) {
    throw new ServerConnection.ResponseError(response, data.message);
  }

  return data;
}

/** a private namespace for the singleton jitsi script tag */
namespace Private {
  export let api: IMeetConstructor;

  let _scriptElement: HTMLScriptElement;
  let _loadPromise: PromiseDelegate<IMeetConstructor>;

  /** return a promise that resolves when the Jitsi external JS API is available */
  export async function ensureExternalAPI(
    url: string
  ): Promise<IMeetConstructor> {
    if (_loadPromise == null) {
      _loadPromise = new PromiseDelegate();
      _scriptElement = document.createElement('script');
      _scriptElement.id = `id-${CSS}-external-api`;
      _scriptElement.src = url;
      _scriptElement.async = true;
      _scriptElement.type = 'text/javascript';
      document.body.appendChild(_scriptElement);
      _scriptElement.onload = () => {
        api = (window as any).JitsiMeetExternalAPI;
        _loadPromise.resolve(api);
      };
    }
    return _loadPromise.promise;
  }
}
