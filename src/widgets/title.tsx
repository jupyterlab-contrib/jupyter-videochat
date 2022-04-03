import React from 'react';

import { VDomRenderer } from '@jupyterlab/apputils';

import { VideoChatManager } from '../manager';

import { CSS } from '../tokens';

export class RoomTitle extends VDomRenderer<VideoChatManager> {
  protected render(): JSX.Element {
    const { currentRoom } = this.model;

    if (!currentRoom) {
      return <></>;
    }
    const provider = this.model.providerForRoom(currentRoom);
    const providerLabel = provider ? provider.label : this.model.__('Public');

    return (
      <div className={`${CSS}-active-room-name jp-Toolbar-item`} title={currentRoom.id}>
        <i>{providerLabel}</i>
        {`${currentRoom.displayName || currentRoom.id}`}
      </div>
    );
  }
}
