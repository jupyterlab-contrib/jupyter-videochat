import { URLExt } from '@jupyterlab/coreutils';
import { ServerConnection } from '@jupyterlab/services';

import { API_NAMESPACE, IRoomProvider } from './tokens';
import { IServerResponses, Room, VideoChatConfig } from './types';

export class ServerRoomProvider implements IRoomProvider {
  private _serverSettings: ServerConnection.ISettings;

  constructor(options: ServerRoomProvider.IOptions) {
    this._serverSettings = options.serverSettings || ServerConnection.makeSettings();
  }

  /** Request the configuration from the server */
  async updateConfig(): Promise<VideoChatConfig> {
    return await this.requestAPI('config');
  }

  /** Request the room list from the server */
  async updateRooms(): Promise<Room[]> {
    return await this.requestAPI('rooms');
  }

  get canCreateRooms(): boolean {
    return true;
  }

  /** Create a new named room */
  async createRoom(room: Partial<Room>): Promise<Room> {
    const newRoom = await this.requestAPI('generate-room', {
      method: 'POST',
      body: JSON.stringify(room),
    });
    return newRoom;
  }
  /**
   * Call the API extension
   *
   * @param endPoint API REST end point for the extension
   * @param init Initial values for the request
   * @returns The response body interpreted as JSON
   */
  async requestAPI<U extends keyof IServerResponses, T extends IServerResponses[U]>(
    endPoint: U,
    init: RequestInit = {}
  ): Promise<T> {
    // Make request to Jupyter API
    const settings = this._serverSettings;
    const requestUrl = URLExt.join(settings.baseUrl, API_NAMESPACE, endPoint);

    let response: Response;
    try {
      response = await ServerConnection.makeRequest(requestUrl, init, settings);
    } catch (error) {
      throw new ServerConnection.NetworkError(error as any);
    }

    const data = await response.json();

    if (!response.ok) {
      throw new ServerConnection.ResponseError(response, data.message);
    }

    return data as T;
  }
}

/**
 * A namespace for server room provider settings
 */
export namespace ServerRoomProvider {
  /**
   * Initialization options for a server room provider
   */
  export interface IOptions {
    serverSettings?: ServerConnection.ISettings;
  }
}
