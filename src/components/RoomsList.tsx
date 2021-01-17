import React, { useState } from 'react';

import { CSS } from '../tokens';
import { Room } from '../types';
import { chatIcon } from '../icons';
import { LabIcon } from '@jupyterlab/ui-components';

const bigIcon: Partial<LabIcon.IReactProps> = {
  tag: 'span',
  width: '200px',
  height: '200px',
  textAlign: 'center',
  opacity: '0.25'
};

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
          <chatIcon.react {...bigIcon} />
        </p>
        <p>
          <strong>No named Hub rooms are configured.</strong>
        </p>
        <p>
          <em>Create or join a Hub room by name below.</em>
        </p>
      </blockquote>
    </li>
  );

  return (
    <div className={`${CSS}-rooms`}>
      <div className={`${CSS}-rooms-list-header`}>Select Hub room to join</div>
      <ul className={`${CSS}-rooms-list ${CSS}-rooms-list-named`}>
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
                    <span className={`${CSS}-room-displayname`}>
                      {value.displayName}
                    </span>
                    <small className={`${CSS}-room-description`}>
                      {value.description}
                    </small>
                  </a>
                </li>
              );
            })}
      </ul>
      <ul className={`${CSS}-rooms-list ${CSS}-rooms-list-new`}>
        <li>
          <a href="#">
            <div className={`${CSS}-rooms-list-header`}>Join Hub room by name</div>
            <div className={`${CSS}-room-displayname-input`}>
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
            <small className={`${CSS}-room-description`}>
              Join (or create) a named room. Share this name with other users of
              your Hub.
            </small>
          </a>
        </li>
      </ul>
    </div>
  );
};
