import React from 'react';
import { LabIcon } from '@jupyterlab/ui-components';

import { CSS, RoomsListProps } from '../tokens';
import * as icons from '../icons';
import { ServerRoomsComponent } from './ServerRooms';
import { PublicRoomsComponent } from './PublicRooms';

export const littleIcon: Partial<LabIcon.IReactProps> = {
  tag: 'span',
  width: '20px',
  height: '20px',
};

export const noRoom = (
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

export const openBlank = {
  target: '_blank',
  rel: 'noopener noreferrer',
};

export const RoomsListComponent = (props: RoomsListProps): JSX.Element => {
  const { __ } = props;

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
            onInput={(evt) => props.onDisplayNameChanged(evt.currentTarget.value)}
            defaultValue={props.displayName}
          />
          <blockquote>
            {__('(optional) Default name to show to other chat participants')}
          </blockquote>
          <hr />
          <label>Email</label>
          <input
            className="jp-mod-styled"
            onInput={(evt) => props.onEmailChanged(evt.currentTarget.value)}
            defaultValue={props.email}
          />
          <blockquote>
            {__(`(optional) Email to show to other chat participants.`)}{' '}
            {__(`An avatar icon will be shown if this address is registered at`)}{' '}
            <a href="https://gravatar.com" {...openBlank}>
              gravatar.com
            </a>
            .
          </blockquote>
        </li>
      </ul>
      {props.canCreateRooms ? ServerRoomsComponent(props) : <></>}
      {props.disablePublicRooms ? <></> : PublicRoomsComponent(props)}
    </div>
  );
};
