import { Signal, ISignal } from '@lumino/signaling';
import { PromiseDelegate } from '@lumino/coreutils';

import { ILabShell } from '@jupyterlab/application';
import { TranslationBundle } from '@jupyterlab/translation';

import { MainAreaWidget, VDomModel } from '@jupyterlab/apputils';
import { ISettingRegistry } from '@jupyterlab/settingregistry';

import { IVideoChatManager, DEFAULT_DOMAIN, CSS, DEBUG } from './tokens';

import type { JitsiMeetExternalAPIConstructor, JitsiMeetExternalAPI } from 'jitsi-meet';

import { Room, VideoChatConfig, IJitsiFactory } from './types';
import { Widget } from '@lumino/widgets';

/** A manager that can add, join, or create Video Chat rooms
 */
export class VideoChatManager extends VDomModel implements IVideoChatManager {
  private _rooms: Room[] = [];
  private _currentRoom: Room;
  private _isInitialized = false;
  private _initialized = new PromiseDelegate<void>();
  private _config: VideoChatConfig;
  private _meet: JitsiMeetExternalAPI;
  private _meetChanged: Signal<VideoChatManager, void>;
  private _settings: ISettingRegistry.ISettings;
  private _roomProviders = new Map<string, IVideoChatManager.IProviderOptions>();
  private _roomProvidedBy = new WeakMap<Room, string>();
  private _roomProvidersChanged: Signal<VideoChatManager, void>;
  private _currentRoomChanged: Signal<VideoChatManager, void>;
  private _trans: TranslationBundle;
  protected _mainWidget: MainAreaWidget;

  constructor(options?: VideoChatManager.IOptions) {
    super();
    this._trans = options.trans;
    this._meetChanged = new Signal(this);
    this._roomProvidersChanged = new Signal(this);
    this._currentRoomChanged = new Signal(this);
    this._roomProvidersChanged.connect(this.onRoomProvidersChanged, this);
  }

  __ = (msgid: string, ...args: string[]): string => {
    return this._trans.__(msgid, ...args);
  };

  /** all known rooms */
  get rooms(): Room[] {
    return this._rooms;
  }

  /** whether the manager is initialized */
  get isInitialized(): boolean {
    return this._isInitialized;
  }

  /** A `Promise` that resolves when fully initialized */
  get initialized(): Promise<void> {
    return this._initialized.promise;
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
    this._currentRoomChanged.emit(void 0);
    if (room != null && room.id == null) {
      this.createRoom(room).catch(console.warn);
    }
  }

  /** A signal that emits when the current room changes. */
  get currentRoomChanged(): ISignal<IVideoChatManager, void> {
    return this._currentRoomChanged;
  }

  /** The configuration from the server/settings */
  get config(): VideoChatConfig {
    return this._config;
  }

  /** The current JitsiExternalAPI, as served by `<domain>/external_api.js` */
  get meet(): JitsiMeetExternalAPI {
    return this._meet;
  }

  /** Update the current meet */
  set meet(meet: JitsiMeetExternalAPI) {
    if (this._meet !== meet) {
      this._meet = meet;
      this._meetChanged.emit(void 0);
    }
  }

  /** A signal that emits when the current meet changes */
  get meetChanged(): Signal<IVideoChatManager, void> {
    return this._meetChanged;
  }

  /** A signal that emits when the available rooms change */
  get roomProvidersChanged(): Signal<IVideoChatManager, void> {
    return this._roomProvidersChanged;
  }

  /** The JupyterLab settings bundle */
  get settings(): ISettingRegistry.ISettings {
    return this._settings;
  }

  set settings(settings: ISettingRegistry.ISettings) {
    if (this._settings) {
      this._settings.changed.disconnect(this.onSettingsChanged, this);
    }
    this._settings = settings;
    if (this._settings) {
      this._settings.changed.connect(this.onSettingsChanged, this);
      if (!this.isInitialized) {
        this._isInitialized = true;
        this._initialized.resolve(void 0);
      }
    }
    this.stateChanged.emit(void 0);
  }

  get currentArea(): ILabShell.Area {
    return (this.settings?.composite['area'] || 'right') as ILabShell.Area;
  }

  set currentArea(currentArea: ILabShell.Area) {
    this.settings.set('area', currentArea).catch(void 0);
  }

  get mainWidget(): Promise<MainAreaWidget<Widget>> {
    return this.initialized.then(() => this._mainWidget);
  }

  setMainWidget(widget: MainAreaWidget): void {
    if (this._mainWidget) {
      console.error(this.__('Main Video Chat widget already set'));
      return;
    }
    this._mainWidget = widget;
  }

  /** A scoped handler for connecting to the settings Signal  */
  protected onSettingsChanged = (): void => {
    this.stateChanged.emit(void 0);
  };

  /**
   * Add a new room provider.
   */
  registerRoomProvider(options: IVideoChatManager.IProviderOptions): void {
    this._roomProviders.set(options.id, options);

    const { stateChanged } = options.provider;

    if (stateChanged) {
      stateChanged.connect(
        async () => await Promise.all([this.updateConfig(), this.updateRooms()])
      );
    }

    this._roomProvidersChanged.emit(void 0);
  }

  providerForRoom = (room: Room): IVideoChatManager.IProviderOptions => {
    const key = this._roomProvidedBy.get(room) || null;
    if (key) {
      return this._roomProviders.get(key);
    }
    return null;
  };

  /**
   * Handle room providers changing
   */
  protected async onRoomProvidersChanged(): Promise<void> {
    try {
      await Promise.all([this.updateConfig(), this.updateRooms()]);
    } catch (err) {
      console.warn(err);
    }
    this.stateChanged.emit(void 0);
  }

  get rankedProviders(): IVideoChatManager.IProviderOptions[] {
    const providers = [...this._roomProviders.values()];
    providers.sort((a, b) => a.rank - b.rank);
    return providers;
  }

  /**
   * Fetch all config from all providers
   */
  async updateConfig(): Promise<VideoChatConfig> {
    let config: VideoChatConfig = { jitsiServer: DEFAULT_DOMAIN };
    for (const { provider, id } of this.rankedProviders) {
      try {
        config = { ...config, ...(await provider.updateConfig()) };
      } catch (err) {
        console.warn(this.__(`Failed to load config from %1`, id));
        console.trace(err);
      }
    }
    this._config = config;
    this.stateChanged.emit(void 0);
    return config;
  }

  /**
   * Fetch all rooms from all providers
   */
  async updateRooms(): Promise<Room[]> {
    let rooms: Room[] = [];
    let providerRooms: Room[];
    for (const { provider, id } of this.rankedProviders) {
      try {
        providerRooms = await provider.updateRooms();
        for (const room of providerRooms) {
          this._roomProvidedBy.set(room, id);
        }
        rooms = [...rooms, ...providerRooms];
      } catch (err) {
        console.warn(this.__(`Failed to load rooms from %1`, id));
        console.trace(err);
      }
    }
    this._rooms = rooms;
    this.stateChanged.emit(void 0);
    return rooms;
  }

  async createRoom(room: Partial<Room>): Promise<Room | null> {
    let newRoom: Room | null = null;
    for (const { provider, id } of this.rankedProviders) {
      if (!provider.canCreateRooms) {
        continue;
      }
      try {
        newRoom = await provider.createRoom(room);
        break;
      } catch (err) {
        console.warn(this.__(`Failed to create room from %1`, id));
      }
    }

    this.currentRoom = newRoom;

    return newRoom;
  }

  get canCreateRooms(): boolean {
    for (const { provider } of this.rankedProviders) {
      if (provider.canCreateRooms) {
        return true;
      }
    }
    return false;
  }

  /** Lazily get the JitiExternalAPI script, as loaded from the jitsi server */
  getJitsiAPI(): IJitsiFactory {
    return () => {
      if (Private.api) {
        return Private.api;
      } else if (this.config != null) {
        const domain = this.config?.jitsiServer
          ? this.config.jitsiServer
          : DEFAULT_DOMAIN;
        const url = `https://${domain}/external_api.js`;
        Private.ensureExternalAPI(url)
          .then(() => this.stateChanged.emit(void 0))
          .catch(console.warn);
      }
      return null;
    };
  }
}

/** A namespace for video chat manager extras */
export namespace VideoChatManager {
  /** placeholder options for video chat manager */
  export interface IOptions extends IVideoChatManager.IOptions {
    trans: TranslationBundle;
  }
}

/** a private namespace for the singleton jitsi script tag */
namespace Private {
  export let api: JitsiMeetExternalAPIConstructor;

  let _scriptElement: HTMLScriptElement;
  let _loadPromise: PromiseDelegate<JitsiMeetExternalAPIConstructor>;

  /** return a promise that resolves when the Jitsi external JS API is available */
  export async function ensureExternalAPI(
    url: string
  ): Promise<JitsiMeetExternalAPIConstructor> {
    if (_loadPromise == null) {
      DEBUG && console.warn('loading...');
      _loadPromise = new PromiseDelegate();
      _scriptElement = document.createElement('script');
      _scriptElement.id = `id-${CSS}-external-api`;
      _scriptElement.src = url;
      _scriptElement.async = true;
      _scriptElement.type = 'text/javascript';
      document.body.appendChild(_scriptElement);
      _scriptElement.onload = () => {
        api = (window as any).JitsiMeetExternalAPI;
        DEBUG && console.warn('loaded...');
        _loadPromise.resolve(api);
      };
    }
    return _loadPromise.promise;
  }
}
