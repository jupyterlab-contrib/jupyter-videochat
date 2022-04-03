import React, { useEffect } from 'react';

import { ReadonlyPartialJSONObject } from '@lumino/coreutils';

import { PageConfig } from '@jupyterlab/coreutils';

import { CSS, IVideoChatManager, ITrans } from '../tokens';
import { Room, IJitsiFactory } from '../types';

import type { ExternalAPIOptions, JitsiMeetExternalAPI } from 'jitsi-meet';

export type JitsiMeetProps = {
  jitsiAPI: IJitsiFactory;
  onRoomSelect: (room: Room) => void;
  onMeet: (meet: JitsiMeetExternalAPI) => void;
  providerForRoom: (room: Room) => IVideoChatManager.IProviderOptions;
  room: Room;
  domain: string;
  email: string;
  displayName: string;
  configOverwrite: ReadonlyPartialJSONObject | null;
  interfaceConfigOverwrite: ReadonlyPartialJSONObject | null;
  __: ITrans;
};

export const JitsiMeetComponent = (props: JitsiMeetProps): JSX.Element => {
  const container = React.createRef<HTMLDivElement>();
  const { __ } = props;

  useEffect(() => {
    const options: ExternalAPIOptions = {
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
      console.warn(__('No Jitsi third-party requests will be blocked'));
    }

    if (interfaceConfigOverwrite != null) {
      options.interfaceConfigOverwrite = interfaceConfigOverwrite;
    } else {
      console.warn(__('All Jitsi features will be enabled'));
    }

    let meet: JitsiMeetExternalAPI;
    let Jitsi = props.jitsiAPI();

    if (Jitsi == null) {
      console.info(__('Jitsi API not yet loaded, will try again in a moment'));
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
