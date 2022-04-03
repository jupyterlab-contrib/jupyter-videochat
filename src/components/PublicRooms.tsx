import React, { useState } from 'react';

import { CSS, RoomsListProps } from '../tokens';
import * as icons from '../icons';

import { littleIcon, openBlank } from './RoomsList';

/**
 * A component for rendering public rooms
 */
export const PublicRoomsComponent = (props: RoomsListProps): JSX.Element => {
  const [publicRoomId, setPublicRoomId] = useState<string>('');
  const { __ } = props;

  return (
    <div className={`${CSS}-rooms-public`}>
      <label id={`id-${CSS}-public-room-list`}>
        <icons.publicIcon.react {...littleIcon} />
        {__('Join Public room by name')}
      </label>
      <ul aria-labelledby={`id-${CSS}-public-room-list`}>
        <li className={`${CSS}-has-input`}>
          <div className={`${CSS}-room-displayname-input`}>
            <input
              className="jp-mod-styled"
              placeholder={'  ' + __('Public Room ID')}
              onInput={(evt) => setPublicRoomId(evt.currentTarget.value)}
            />
            <button
              className={`jp-mod-styled ${
                publicRoomId.trim().length ? 'jp-mod-accept' : ''
              }`}
              disabled={!publicRoomId.trim().length}
              onClick={() =>
                props.onRoomSelect({
                  displayName: publicRoomId,
                  id: publicRoomId,
                })
              }
            >
              JOIN
            </button>
          </div>
          <blockquote>
            {__('Join or create a public room.')}{' '}
            {__('Share this name with anyone who can access')}{' '}
            <a href={`https://${props.domain}`} {...openBlank}>
              {props.domain}
            </a>
            .
          </blockquote>
        </li>
      </ul>
    </div>
  );
};
