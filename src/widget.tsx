import React from 'react';
import { Message } from '@lumino/messaging';
import { VDomRenderer } from '@jupyterlab/apputils';
import { VideoChatComponent } from './components/VideoChat';
import { Room, IMeet } from './types';
import { VideoChatManager } from './manager';

export class VideoChat extends VDomRenderer<VideoChatManager> {
  onToggleSidebar: () => void;

  constructor(model: VideoChatManager, options: VideoChat.IOptions) {
    super(model);
    this.onToggleSidebar = options.onToggleSidebar;
    this.addClass('jp-VideoChat');
  }

  onAfterShow(msg: Message) {
    super.onAfterShow(msg);
    if (!this.model.initialized) {
      this.model.initialize();
    }
  }

  onRoomSelect = (room: Room | null) => {
    this.model.currentRoom = room;
  };

  onCreateRoom = (room: Room) => {
    this.model.createRoom(room).catch(console.warn);
  };

  onMeet = (meet: IMeet) => {
    this.model.meet = meet;
  };

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

export namespace VideoChat {
  export interface IOptions {
    onToggleSidebar: () => void;
  }
}
