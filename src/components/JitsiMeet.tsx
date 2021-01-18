import React, { useEffect } from 'react';

import { ReadonlyPartialJSONValue } from '@lumino/coreutils';

import { PageConfig } from '@jupyterlab/coreutils';

import { CSS } from '../tokens';
import { Room, IMeet, IJitsiFactory } from '../types';

export type JitsiMeetProps = {
  jitsiAPI: IJitsiFactory;
  onRoomSelect: (room: Room) => void;
  onMeet: (meet: IMeet) => void;
  room: Room;
  domain: string;
  email: string;
  displayName: string;
  configOverwrite: ReadonlyPartialJSONValue | null;
  interfaceConfigOverwrite: ReadonlyPartialJSONValue | null;
};

export const JitsiMeetComponent = (props: JitsiMeetProps): JSX.Element => {
  const container = React.createRef<HTMLDivElement>();

  useEffect(() => {
    const options = {
      roomName: props.room.id,
      parentNode: container.current,
      configOverwrite: props.configOverwrite,
      interfaceConfigOverwrite: props.interfaceConfigOverwrite,
      userInfo: {
        displayName: props.displayName || PageConfig.getOption('hubUser'),
        email: props.email,
      },
    };

    let meet: IMeet;
    let Jitsi = props.jitsiAPI();

    if (Jitsi == null) {
      console.info('Jitsi API not yet loaded, will try again in a moment');
    } else {
      meet = new Jitsi(props.domain, options);
    }

    if (meet) {
      props.onMeet(meet);

      meet.executeCommand('subject', props.room.displayName);

      meet.on('readyToClose', () => props.onRoomSelect(null));
    }

    return () => {
      props.onMeet(null);
      if (meet) {
        meet.dispose();
      }
    };
  });

  return <div className={`${CSS}-jitsi-container`} ref={container} />;
};
