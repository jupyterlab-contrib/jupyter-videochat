import React from 'react';

import { ReadonlyPartialJSONObject } from '@lumino/coreutils';

import { VDomRenderer } from '@jupyterlab/apputils';

import type { JitsiMeetExternalAPI } from 'jitsi-meet';
import { VideoChatComponent } from './components/VideoChat';
import { CSS } from './tokens';
import { Room } from './types';
import { VideoChatManager } from './manager';

/**
 * The main video chat interface which can appear in the sidebar or main area
 */
export class VideoChat extends VDomRenderer<VideoChatManager> {
  constructor(model: VideoChatManager, options: VideoChat.IOptions) {
    super(model);
    this.addClass(CSS);
  }

  /** Handle selecting a new (or no) room */
  onRoomSelect = (room: Room | null): void => {
    this.model.currentRoom = room;
  };

  /** Create a new room */
  onCreateRoom = (room: Room): void => {
    this.model.createRoom(room).catch(console.warn);
  };

  /** Set the current meeting */
  onMeet = (meet: JitsiMeetExternalAPI): void => {
    this.model.meet = meet;
  };

  /** Set the user's email address */
  onEmailChanged = (email: string): void => {
    this.model.settings?.set('email', email).catch(console.warn);
  };

  /** Set the user's display name */
  onDisplayNameChanged = (displayName: string): void => {
    this.model.settings?.set('displayName', displayName).catch(console.warn);
  };

  /** The actual renderer */
  render(): JSX.Element | JSX.Element[] {
    const { settings } = this.model;
    return (
      <VideoChatComponent
        jitsiAPI={this.model.getJitsiAPI()}
        onRoomSelect={this.onRoomSelect}
        onCreateRoom={this.onCreateRoom}
        onEmailChanged={this.onEmailChanged}
        onDisplayNameChanged={this.onDisplayNameChanged}
        onMeet={this.onMeet}
        providerForRoom={this.model.providerForRoom}
        currentRoom={this.model.currentRoom}
        config={this.model.config}
        rooms={this.model.rooms}
        email={`${settings?.composite.email || ''}`}
        displayName={`${settings?.composite.displayName || ''}`}
        configOverwrite={
          settings?.composite.configOverwrite as ReadonlyPartialJSONObject
        }
        interfaceConfigOverwrite={
          settings?.composite.interfaceConfigOverwrite as ReadonlyPartialJSONObject
        }
        disablePublicRooms={!!settings?.composite.disablePublicRooms}
        canCreateRooms={this.model.canCreateRooms}
        __={this.model.__}
      />
    );
  }
}

/** A namespace for VideoChat options */
export namespace VideoChat {
  /** Options for constructing a new a VideoChat */
  export interface IOptions {}
}
