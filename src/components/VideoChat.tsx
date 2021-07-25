import React from 'react';

import { ReadonlyPartialJSONValue } from '@lumino/coreutils';

import { ToolbarButtonComponent } from '@jupyterlab/apputils';
import { stopIcon, launcherIcon } from '@jupyterlab/ui-components';

import { CSS, IVideoChatManager } from '../tokens';
import { Room, VideoChatConfig, IMeet, IJitsiFactory } from '../types';
import { JitsiMeetComponent } from './JitsiMeet';
import { RoomsListComponent } from './RoomsList';

export type VideoChatProps = {
  jitsiAPI: IJitsiFactory;
  currentRoom: Room;
  onCreateRoom: (room: Room) => void;
  onRoomSelect: (room: Room) => void;
  onEmailChanged: (email: string) => void;
  onDisplayNameChanged: (displayName: string) => void;
  onToggleSidebar: () => void;
  onMeet: (meet: IMeet) => void;
  providerForRoom: (room: Room) => IVideoChatManager.IProviderOptions;
  rooms: Room[];
  config: VideoChatConfig;
  email: string;
  displayName: string;
  configOverwrite: ReadonlyPartialJSONValue | null;
  interfaceConfigOverwrite: ReadonlyPartialJSONValue | null;
  disablePublicRooms: boolean;
};

export const VideoChatComponent = (props: VideoChatProps): JSX.Element => {
  const domain = props.config?.jitsiServer;
  const isConnected = !!props.currentRoom;
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
        <div
          className={`${CSS}-room-activate-room-name jp-Toolbar-item`}
          title={`${props.currentRoom?.id}`}
        >
          {`${props.currentRoom?.displayName || props.currentRoom?.id || ''}`}
        </div>
        <div className="jp-Toolbar-item jp-Toolbar-spacer" />
        <div className="jp-ToolbarButton jp-Toolbar-item">
          <ToolbarButtonComponent
            icon={stopIcon}
            label={
              isConnected
                ? `Disconnect ${domain}`
                : `Not connected to ${domain}`
            }
            enabled={isConnected}
            onClick={() => props.onRoomSelect(null)}
          />
        </div>
      </div>

      {domain != null && props.currentRoom?.id != null ? (
        <JitsiMeetComponent
          jitsiAPI={props.jitsiAPI}
          room={props.currentRoom}
          domain={domain}
          onRoomSelect={props.onRoomSelect}
          onMeet={props.onMeet}
          email={props.email}
          displayName={props.displayName}
          configOverwrite={props.configOverwrite}
          interfaceConfigOverwrite={props.interfaceConfigOverwrite}
          providerForRoom={props.providerForRoom}
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
          domain={domain}
          disablePublicRooms={props.disablePublicRooms}
          providerForRoom={props.providerForRoom}
        />
      )}
    </>
  );
};
