import React from 'react';

import { ToolbarButtonComponent } from '@jupyterlab/apputils';
import { stopIcon, launcherIcon } from '@jupyterlab/ui-components';

import { CSS } from '../tokens';
import { Room, VideoChatConfig, IMeet, IMeetConstructor } from '../types';
import { JitsiMeetComponent } from './JitsiMeet';
import { RoomsListComponent } from './RoomsList';

export type VideoChatProps = {
  JitsiMeetExternalAPI: IMeetConstructor;
  currentRoom: Room;
  onCreateRoom: (room: Room) => void;
  onRoomSelect: (room: Room) => void;
  onEmailChanged: (email: string) => void;
  onDisplayNameChanged: (displayName: string) => void;
  onToggleSidebar: () => void;
  onMeet: (meet: IMeet) => void;
  rooms: Room[];
  config: VideoChatConfig;
  email: string;
  displayName: string;
};

export const VideoChatComponent = (props: VideoChatProps): JSX.Element => {
  const domain = props.config?.jitsiServer;
  return (
    <>
      <div className={`${CSS}-toolbar jp-Toolbar`}>
        <div className="jp-ToolbarButton jp-Toolbar-item">
          <ToolbarButtonComponent
            tooltip="Toggle Video Chat Sidebar"
            icon={launcherIcon}
            label="Toggle Sidebar"
            onClick={props.onToggleSidebar}
          />
        </div>
        <div className="jp-Toolbar-item jp-Toolbar-spacer" />
        <div className="jp-ToolbarButton jp-Toolbar-item">
          <ToolbarButtonComponent
            tooltip={`Disconnect from ${domain}`}
            icon={stopIcon}
            label="Disconnect"
            enabled={props.currentRoom !== null}
            onClick={() => props.onRoomSelect(null)}
          />
        </div>
      </div>

      {domain != null && props.currentRoom?.id != null ? (
        <JitsiMeetComponent
            JitsiMeetExternalAPI={props.JitsiMeetExternalAPI}
            room={props.currentRoom}
            domain={domain}
            onRoomSelect={props.onRoomSelect}
            onMeet={props.onMeet}
            email={props.email}
            displayName={props.displayName}
        />
      ) : (
        <RoomsListComponent
          currentRoom={props.currentRoom}
          onCreateRoom={props.onCreateRoom}
          onRoomSelect={props.onRoomSelect}
          onEmailChanged={props.onEmailChanged}
          onDisplayNameChanged={props.onDisplayNameChanged}
          rooms={props.rooms}
          email={props.email}
          displayName={props.displayName}
        />
      )}
    </>
  );
};