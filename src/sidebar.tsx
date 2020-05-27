import * as React from 'react';
import { useState, useEffect } from 'react';


import JitsiMeetExternalAPI from  './external_api';
import { ReactWidget, ToolbarButtonComponent } from '@jupyterlab/apputils';
import { PageConfig } from '@jupyterlab/coreutils';

import { stopIcon } from '@jupyterlab/ui-components';

// Prefix for all meetings, to prevent clashes temporarily
const MEETING_PREFIX = "jp-VideoCall-test-";

type JitsiMeetProps = {
  meetingID: string
  domain: string
}

const JitsiMeetComponent = (props: JitsiMeetProps): JSX.Element => {
  let container = React.createRef<HTMLDivElement>();

  useEffect(() => {
    const options = {
      roomName: MEETING_PREFIX + props.meetingID,
      parentNode: container.current,
      interfaceConfigOverwrite: {
        // Overrides defined from https://github.com/jitsi/jitsi-meet/blob/master/interface_config.js
        // We want to provide as simple an interface as possible, so we disable a bunch of things
        // 1. Anything requiring an external login. So no recording, livestreaming or calendars
        // 2. Anything that redirects to a mobile app. JupyterLab doesn't run on mobiles
        // 3. Things we don't support - like etherpad, inviting, download, etc
        TOOLBAR_BUTTONS: [
          'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
          'fodeviceselection', 'hangup', 'profile', 'chat', /* 'recording', */
          /* 'livestreaming', 'etherpad', */ 'sharedvideo', 'settings', 'raisehand',
          'videoquality', 'filmstrip', /* 'invite', */ 'feedback', 'stats', 'shortcuts',
          'tileview', 'videobackgroundblur', /* 'download', */ 'help', 'mute-everyone',
          'e2ee', 'security'
        ],
        SETTINGS_SECTIONS: [ 'devices', 'language', 'moderator', 'profile', /* 'calendar' */ ],
        // Users can't join with mobile app here
        MOBILE_APP_PROMO: false
      },
      userInfo: {
        displayName: PageConfig.getOption("hubUser") || undefined
      }
    };

    let currentMeeting = new JitsiMeetExternalAPI(props.domain, options);

    return () => {
      console.log('disposing')
      currentMeeting.dispose();
    }
  });


  return (<div className="jp-VideoChat-jitsi-container" ref={container}>
  </div>)
}

type VideoChatListProps = {
  onRoomSelect: (room: string) => void
}

const VideoChatListComponent = (props: VideoChatListProps): JSX.Element => {
  const rooms = [
    {
      'id': 'project-1',
      'displayName': '16A Project 1 - Team A',
      'description': 'Room for members of Team A on Project 1 of CS 16A'
    },
    {
      'id': 'project-2',
      'displayName': 'data8 Lab 1 - Team C',
      'description': 'Room for members of Team C on Lab 1 of data8'
    }
  ];
  return (
    <>
      <div className="jp-VideoChat-rooms-list-header">
        Select room to join
      </div>
      <ul className="jp-VideoChat-rooms-list">
        {rooms.map((value, i) => {
          return (<li
            onClick={() => {
              props.onRoomSelect(value.id);
            }}
          >
            <a href="#">
              <span className="jp-VideoChat-room-displayname">{value.displayName}</span>
              <small className="jp-VideoChat-room-description">{value.description}</small>
            </a>
          </li>);
        })}
      </ul>
    </>
  );
}

const VideoChatSidebarComponent = (): JSX.Element => {
  const [currentChat, setCurrentChat] = useState(null);

  return (
    <>
      <div className="jp-VideoChat-toolbar jp-Toolbar">
        <div className="jp-Toolbar-item jp-Toolbar-spacer" />

        <div className="jp-ToolbarButton jp-Toolbar-item">
          <ToolbarButtonComponent
            tooltip="Disconnect"
            icon={stopIcon}
            label="Disconnect"
            enabled={currentChat !== null}
            onClick={() => {
              setCurrentChat(null);
            }}
          />
        </div>
      </div>

      {currentChat !== null ? (
        <JitsiMeetComponent
          meetingID={currentChat}
          domain="meet.jit.si"
        />
      ) : (
        <VideoChatListComponent onRoomSelect={(room) => {setCurrentChat(room)}} />
      )}
    </>
  );
}

export class VideoChatSidebarWidget extends ReactWidget {

  constructor() {
    super()
    this.addClass('jp-VideoChat')
  }

  render(): JSX.Element {
    return <VideoChatSidebarComponent />;
  }
}