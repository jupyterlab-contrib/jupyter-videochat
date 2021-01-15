import React, { useEffect } from 'react';

import { PageConfig } from '@jupyterlab/coreutils';

import { Room, IMeetConstructor, IMeet } from '../types';

export type JitsiMeetProps = {
  JitsiMeetExternalAPI: IMeetConstructor;
  room: Room;
  domain: string;
  onRoomSelect: (room: Room) => void;
  onMeet: (meet: IMeet) => void;
};

export const JitsiMeetComponent = (props: JitsiMeetProps): JSX.Element => {
  const container = React.createRef<HTMLDivElement>();

  useEffect(() => {
    const options = {
      roomName: props.room.id,
      parentNode: container.current,
      interfaceConfigOverwrite: {
        // Overrides defined from https://github.com/jitsi/jitsi-meet/blob/master/interface_config.js
        // We want to provide as simple an interface as possible, so we disable a bunch of things
        // 1. Anything requiring an external login. So no recording, livestreaming or calendars
        // 2. Anything that redirects to a mobile app. JupyterLab doesn't run on mobiles
        // 3. Things we don't support - like etherpad, inviting, download, etc
        TOOLBAR_BUTTONS: [
          'microphone',
          'camera',
          'closedcaptions',
          'desktop',
          'fullscreen',
          'fodeviceselection',
          'hangup',
          'profile',
          'chat' /* 'recording', */,
          /* 'livestreaming', 'etherpad', */ 'sharedvideo',
          'settings',
          'raisehand',
          'videoquality',
          'filmstrip',
          /* 'invite', */ 'feedback',
          'stats',
          'shortcuts',
          'tileview',
          'videobackgroundblur',
          /* 'download', */ 'help',
          'mute-everyone',
          'e2ee',
          'security'
        ],
        SETTINGS_SECTIONS: [
          'devices',
          'language',
          'moderator',
          'profile' /* 'calendar' */
        ],
        // Users can't join with mobile app here
        MOBILE_APP_PROMO: false
      },
      userInfo: {
        displayName: PageConfig.getOption('hubUser') || undefined
      }
    };

    const meet = new props.JitsiMeetExternalAPI(props.domain, options);

    props.onMeet(meet);

    meet.executeCommand('subject', props.room.displayName);

    meet.on('readyToClose', () => props.onRoomSelect(null));

    return () => {
      console.warn('disposing', props.room.displayName);
      props.onMeet(null);
      meet.dispose();
    };
  });

  return <div className="jp-VideoChat-jitsi-container" ref={container} />;
};
