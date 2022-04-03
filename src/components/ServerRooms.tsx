import React, { useState } from 'react';

import { CSS, RoomsListProps } from '../tokens';
import * as icons from '../icons';

import { noRoom, littleIcon } from './RoomsList';

export const openBlank = {
  target: '_blank',
  rel: 'noopener noreferrer',
};

/**
 * a component for rendering server rooms
 */
export const ServerRoomsComponent = (props: RoomsListProps): JSX.Element => {
  const [roomName, setRoomName] = useState<string>('');

  const { __ } = props;

  return (
    <div className={`${CSS}-rooms-server`}>
      <label id={`id-${CSS}-server-room-list`}>
        <icons.groupIcon.react {...littleIcon} />
        {__('Select Room to join')}
      </label>
      <ul aria-labelledby={`id-${CSS}-server-room-list`}>
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
                    {__('JOIN')}
                  </button>
                  <blockquote>{value.description}</blockquote>
                  <span>{props.providerForRoom(value)?.label}</span>
                </li>
              );
            })}
      </ul>

      <label id={`id-${CSS}-new-server-room-list`}>
        <icons.newGroupIcon.react {...littleIcon} />
        {__('Join Room by name')}
      </label>
      <ul aria-labelledby={`id-${CSS}-new-server-room-list`}>
        <li className={`${CSS}-has-input`}>
          <div className={`${CSS}-room-displayname-input`}>
            <input
              className="jp-mod-styled"
              placeholder={'  ' + __('Server Room Name')}
              onInput={(evt) => setRoomName(evt.currentTarget.value)}
            />
            <button
              className={`jp-mod-styled ${
                roomName.trim().length ? 'jp-mod-accept' : ''
              }`}
              disabled={!roomName.trim().length}
              onClick={() => props.onCreateRoom({ displayName: roomName })}
            >
              JOIN
            </button>
          </div>
          <blockquote>
            {__('Join (or create) a named Room.')}{' '}
            {__(
              'Share this name with other users of your Hub, Binder, or others that can share a server key.'
            )}
          </blockquote>
        </li>
      </ul>
    </div>
  );
};
