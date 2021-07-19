import React from 'react';
import { VDomRenderer } from '@jupyterlab/apputils';
import { VideoChatComponent } from './components/VideoChat';
import { CSS } from './tokens';
import { Room, IMeet } from './types';
import { VideoChatManager } from './manager';

/**
 * The main video chat interface which can appear in the sidebar or main area
 */
export class VideoChat extends VDomRenderer<VideoChatManager> {
  onToggleSidebar: () => void;

  constructor(model: VideoChatManager, options: VideoChat.IOptions) {
    super(model);
    this.onToggleSidebar = options.onToggleSidebar;
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
  onMeet = (meet: IMeet): void => {
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
        onToggleSidebar={this.onToggleSidebar}
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
        configOverwrite={settings?.composite.configOverwrite}
        interfaceConfigOverwrite={settings?.composite.interfaceConfigOverwrite}
        disablePublicRooms={!!settings?.composite.disablePublicRooms}
      />
    );
  }
}

/** A namespace for VideoChat options */
export namespace VideoChat {
  /** Options for constructing a new a VideoChat */
  export interface IOptions {
    /** function to run when the sidebar toggle is activated */
    onToggleSidebar: () => void;
  }
}
