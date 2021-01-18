import React, { useState } from 'react';

import { CSS } from '../tokens';
import { Room } from '../types';
import * as icons from '../icons';
import { LabIcon } from '@jupyterlab/ui-components';

export type RoomsListProps = {
  onRoomSelect: (room: Room) => void;
  onCreateRoom: (room: Room) => void;
  onEmailChanged: (email: string) => void;
  onDisplayNameChanged: (displayName: string) => void;
  currentRoom: Room;
  rooms: Room[];
  email: string;
  displayName: string;
};

const littleIcon: Partial<LabIcon.IReactProps> = {
  tag: 'span',
  width: '20px',
  height: '20px',
};

const noRoom = (
  <li>
    <blockquote>
      <p>
        <strong>No named Hub rooms are configured.</strong>
      </p>
      <p>
        <em>Create or join a Hub room by name below.</em>
      </p>
    </blockquote>
  </li>
);

export const RoomsListComponent = (props: RoomsListProps): JSX.Element => {
  const [roomName, setRoomName] = useState<string>('');
  const [publicRoomId, setPublicRoomId] = useState<string>('');

  return (
    <div className={`${CSS}-rooms`}>
      <label id={`id-${CSS}-user-info`}>
        <icons.userIcon.react {...littleIcon} />
        My Chat Info
      </label>
      <ul aria-labelledby={`id-${CSS}-user-info`}>
        <li className={`${CSS}-input-group`}>
          <label>Name</label>
          <input
            className="jp-mod-styled"
            onInput={(evt) =>
              props.onDisplayNameChanged(evt.currentTarget.value)
            }
            defaultValue={props.displayName}
          />
          <blockquote>
            (optional) Default name to show to other chat participants
          </blockquote>
        </li>
        <li className={`${CSS}-input-group`}>
          <label>Email</label>
          <input
            className="jp-mod-styled"
            onInput={(evt) => props.onEmailChanged(evt.currentTarget.value)}
            defaultValue={props.email}
          />
          <blockquote>
            (optional) Email to show to other chat participants. If an avatar
            icon is this address is registered with this address at{' '}
            <a
              href="https://gravatar.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              gravatar.com
            </a>
            , an icon will be shown.
          </blockquote>
        </li>
      </ul>

      <label id={`id-${CSS}-hub-room-list`}>
        <icons.groupIcon.react {...littleIcon} />
        Select Hub room to join
      </label>
      <ul aria-labelledby={`id-${CSS}-hub-room-list`}>
        {!props.rooms.length
          ? noRoom
          : props.rooms.map((value, i) => {
              return (
                <li key={value.id}>
                  <label>{value.displayName}</label>
                  <button
                    className={`jp-mod-styled jp-mod-accept`}
                    onClick={() => props.onRoomSelect(value)}
                  >
                    JOIN
                  </button>
                  <blockquote>{value.description}</blockquote>
                </li>
              );
            })}
      </ul>

      <label id={`id-${CSS}-new-room-list`}>
        <icons.newGroupIcon.react {...littleIcon} />
        Join Hub room by name
      </label>
      <ul aria-labelledby={`id-${CSS}-new-room-list`}>
        <li>
          <div className={`${CSS}-room-displayname-input`}>
            <input
              className="jp-mod-styled"
              placeholder="Hub Room Name"
              onInput={(evt) => setRoomName(evt.currentTarget.value)}
            />
            <button
              className={`jp-mod-styled ${roomName.trim().length ? 'jp-mod-accept' : ''}`}
              disabled={!roomName.trim().length}
              onClick={() => props.onCreateRoom({ displayName: roomName })}
            >
              JOIN
            </button>
          </div>
          <blockquote>
            Join (or create) a named room. Share this name with other users of
            your Hub.
          </blockquote>
        </li>
      </ul>

      <label id={`id-${CSS}-public-room-list`}>
        <icons.publicIcon.react {...littleIcon} />
        Join Public room by name
      </label>
      <ul aria-labelledby={`id-${CSS}-public-room-list`}>
        <li>
          <div className={`${CSS}-room-displayname-input`}>
            <input
              className="jp-mod-styled"
              placeholder="Public Room ID"
              onInput={(evt) => setPublicRoomId(evt.currentTarget.value)}
            />
            <button
              className={`jp-mod-styled ${publicRoomId.trim().length ? 'jp-mod-accept' : ''}`}
              disabled={!publicRoomId.trim().length}
              onClick={() => props.onRoomSelect({ displayName: publicRoomId, id: publicRoomId })}
            >
              JOIN
            </button>
          </div>
          <blockquote>
            Join (or create) a <b>public</b> room. Share this name with anyone
            who can access your Jitsi domain.
          </blockquote>
        </li>
      </ul>
    </div>
  );
};
