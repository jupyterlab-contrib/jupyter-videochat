import { URLExt } from '@jupyterlab/coreutils';
import { ServerConnection } from '@jupyterlab/services';
import { VDomModel } from '@jupyterlab/apputils';
import { Signal } from '@lumino/signaling';
import { PromiseDelegate } from '@lumino/coreutils';

import { IVideoChatManager, DEFAULT_JS_API_URL } from './tokens';
import { Room, VideoChatConfig, IMeet, IMeetConstructor } from './types';

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

  get rooms() {
    return this._rooms;
  }

  get initialized() {
    return this._initialized;
  }

  get currentRoom() {
    return this._currentRoom;
  }

  /**
   * set the current room, potentially scheduling a trip to the server for an id
   */
  set currentRoom(room) {
    this._currentRoom = room;
    this.stateChanged.emit(void 0);
    if (room != null && room.id == null) {
      this.createRoom(room).catch(console.warn);
    }
  }

  get config() {
    return this._config;
  }

  get meet() {
    return this._meet;
  }

  set meet(meet) {
    if (this._meet !== meet) {
      this._meet = meet;
      this._meetChanged.emit(void 0);
    }
  }

  get meetChanged() {
    return this._meetChanged;
  }

  initialize() {
    Promise.all([this.updateConfig(), this.updateRooms()])
      .then(() => {
        this._initialized = true;
        this.stateChanged.emit(void 0);
      })
      .catch(console.warn);
  }

  async updateConfig() {
    this._config = await requestAPI<VideoChatConfig>('config');
    this.stateChanged.emit(void 0);
  }

  async updateRooms() {
    this._rooms = await requestAPI<Array<Room>>('rooms');
    this.stateChanged.emit(void 0);
  }

  async createRoom(room: Partial<Room>) {
    const newRoom = await requestAPI<Room>('generate-room', {
      method: 'POST',
      body: JSON.stringify(room)
    });
    this.currentRoom = newRoom;
    return newRoom;
  }

  get JitsiMeetExternalAPI() {
    if (Private.api) {
      return Private.api;
    } else {
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

export namespace VideoChatManager {
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

namespace Private {
  export let api: IMeetConstructor;

  let _scriptElement: HTMLScriptElement;
  let _loadPromise: PromiseDelegate<IMeetConstructor>;

  export async function ensureExternalAPI(url: string = DEFAULT_JS_API_URL) {
    if (_loadPromise == null) {
      _loadPromise = new PromiseDelegate();
      _scriptElement = document.createElement('script');
      _scriptElement.id = 'jp-VideoChat-external-api';
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
