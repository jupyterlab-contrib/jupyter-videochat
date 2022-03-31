import React, { useEffect } from 'react';

import { ReadonlyPartialJSONValue } from '@lumino/coreutils';

import { PageConfig } from '@jupyterlab/coreutils';

import { CSS, IVideoChatManager } from '../tokens';
import { Room, IMeet, IJitsiFactory, IMeetOptions } from '../types';

export type JitsiMeetProps = {
  jitsiAPI: IJitsiFactory;
  onRoomSelect: (room: Room) => void;
  onMeet: (meet: IMeet) => void;
  providerForRoom: (room: Room) => IVideoChatManager.IProviderOptions;
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
    const options: IMeetOptions = {
      roomName: props.room.id,
      parentNode: container.current,
      userInfo: {
        displayName: PageConfig.getOption('hubUser'),
      },
    };

    const { displayName, email, configOverwrite, interfaceConfigOverwrite } = props;

    if (displayName != null) {
      options.userInfo.displayName = displayName;
    }

    if (email != null) {
      options.userInfo.email = email;
    }

    if (configOverwrite != null) {
      options.configOverwrite = configOverwrite;
    } else {
      console.warn('No Jitsi third-party requests will be blocked');
    }

    if (interfaceConfigOverwrite != null) {
      options.interfaceConfigOverwrite = interfaceConfigOverwrite;
    } else {
      console.warn('All Jitsi features will be enabled');
    }

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
