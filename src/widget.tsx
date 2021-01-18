import React from 'react';
import { Message } from '@lumino/messaging';
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

  /** Ensure the model is initialized after being shown */
  onAfterShow(msg: Message): void {
    super.onAfterShow(msg);
    if (!this.model.initialized) {
      this.model.initialize();
    }
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
    return (
      <VideoChatComponent
        jitsiAPI={this.model.getJitsiAPI()}
        onToggleSidebar={this.onToggleSidebar}
        onRoomSelect={this.onRoomSelect}
        onCreateRoom={this.onCreateRoom}
        onEmailChanged={this.onEmailChanged}
        onDisplayNameChanged={this.onDisplayNameChanged}
        onMeet={this.onMeet}
        currentRoom={this.model.currentRoom}
        config={this.model.config}
        rooms={this.model.rooms}
        email={`${this.model.settings?.composite.email || ''}`}
        displayName={`${this.model.settings?.composite.displayName || ''}`}
        configOverwrite={this.model.settings?.composite.configOverwrite}
        interfaceConfigOverwrite={
          this.model.settings?.composite.interfaceConfigOverwrite
        }
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
