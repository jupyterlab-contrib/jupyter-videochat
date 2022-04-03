import React from 'react';

import { ReadonlyPartialJSONObject } from '@lumino/coreutils';

import { IVideoChatManager, ITrans } from '../tokens';
import { Room, VideoChatConfig, IJitsiFactory } from '../types';
import { JitsiMeetComponent } from './JitsiMeet';
import { RoomsListComponent } from './RoomsList';
import { JitsiMeetExternalAPI } from 'jitsi-meet';

export type VideoChatProps = {
  jitsiAPI: IJitsiFactory;
  currentRoom: Room;
  onCreateRoom: (room: Room) => void;
  onRoomSelect: (room: Room) => void;
  onEmailChanged: (email: string) => void;
  onDisplayNameChanged: (displayName: string) => void;
  onMeet: (meet: JitsiMeetExternalAPI) => void;
  providerForRoom: (room: Room) => IVideoChatManager.IProviderOptions;
  rooms: Room[];
  config: VideoChatConfig;
  email: string;
  displayName: string;
  configOverwrite: ReadonlyPartialJSONObject | null;
  interfaceConfigOverwrite: ReadonlyPartialJSONObject | null;
  disablePublicRooms: boolean;
  canCreateRooms: boolean;
  __: ITrans;
};

export const VideoChatComponent = (props: VideoChatProps): JSX.Element => {
  const domain = props.config?.jitsiServer;
  return (
    <>
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
          __={props.__}
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
          canCreateRooms={props.canCreateRooms}
          providerForRoom={props.providerForRoom}
          __={props.__}
        />
      )}
    </>
  );
};
