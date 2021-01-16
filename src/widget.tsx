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
  onAfterShow(msg: Message) {
    super.onAfterShow(msg);
    if (!this.model.initialized) {
      this.model.initialize();
    }
  }

  /** Handle selecting a new (or no) room */
  onRoomSelect = (room: Room | null) => {
    this.model.currentRoom = room;
  };

  /** Create a new room */
  onCreateRoom = (room: Room) => {
    this.model.createRoom(room).catch(console.warn);
  };

  /** Set the current meeting */
  onMeet = (meet: IMeet) => {
    this.model.meet = meet;
  };

  /** The actual renderer, a no-op until the interface is shown */
  render() {
    if (!this.isVisible) {
      return <div />;
    }
    return (
      <VideoChatComponent
        JitsiMeetExternalAPI={this.model.JitsiMeetExternalAPI}
        onToggleSidebar={this.onToggleSidebar}
        onRoomSelect={this.onRoomSelect}
        onCreateRoom={this.onCreateRoom}
        onMeet={this.onMeet}
        currentRoom={this.model.currentRoom}
        config={this.model.config}
        rooms={this.model.rooms}
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
