import React, { useState } from 'react';

import { Room } from '../types';
import { chatIcon } from '../icons';

export type RoomsListProps = {
  onRoomSelect: (room: Room) => void;
  onCreateRoom: (room: Room) => void;
  currentRoom: Room;
  rooms: Room[];
};

export const RoomsListComponent = (props: RoomsListProps): JSX.Element => {
  const [roomName, setRoomName] = useState<string>('');

  const noRoom = (
    <li>
      <blockquote>
        <p>
          <chatIcon.react
            tag="span"
            width="200px"
            height="200px"
            textAlign="center"
            opacity="0.25"
          />
        </p>
        <p>
          <strong>No named rooms are configured.</strong>
        </p>
        <p>
          <em>Create or join a room by name below.</em>
        </p>
      </blockquote>
    </li>
  );

  return (
    <div className="jp-VideoChat-rooms">
      <div className="jp-VideoChat-rooms-list-header">Select room to join</div>
      <ul className="jp-VideoChat-rooms-list jp-VideoChat-rooms-list-named">
        {!props.rooms.length
          ? noRoom
          : props.rooms.map((value, i) => {
              return (
                <li
                  key={value.id}
                  onClick={() => {
                    props.onRoomSelect(value);
                  }}
                >
                  <a href="#">
                    <span className="jp-VideoChat-room-displayname">
                      {value.displayName}
                    </span>
                    <small className="jp-VideoChat-room-description">
                      {value.description}
                    </small>
                  </a>
                </li>
              );
            })}
      </ul>
      <ul className="jp-VideoChat-rooms-list jp-VideoChat-rooms-list-new">
        <li>
          <a href="#">
            <span className="jp-VideoChat-room-displayname">
              Join room by name
            </span>
            <div className="jp-VideoChat-room-displayname-input">
              <input
                className="jp-mod-styled"
                placeholder="Room Name"
                onInput={evt => setRoomName(evt.currentTarget.value)}
              />
              <button
                className={`jp-mod-styled jp-mod-accept`}
                disabled={!roomName.trim().length}
                onClick={() => props.onCreateRoom({ displayName: roomName })}
              >
                JOIN
              </button>
            </div>
            <small className="jp-VideoChat-room-description">
              Join (or create) a named room. Share this name with other users of
              your Hub.
            </small>
          </a>
        </li>
      </ul>
    </div>
  );
};
