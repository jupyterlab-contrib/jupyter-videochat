import * as React from 'react';
import { useState, useEffect } from 'react';


import JitsiMeetExternalAPI from  './external_api';
import { ReactWidget, ToolbarButtonComponent, InputDialog } from '@jupyterlab/apputils';
import { PageConfig } from '@jupyterlab/coreutils';

import { listIcon, stopIcon } from '@jupyterlab/ui-components';

type JitsiMeetProps = {
  meetingID: string
  domain: string
}

const JitsiMeetComponent = (props: JitsiMeetProps): JSX.Element => {
  let container = React.createRef<HTMLDivElement>();

  useEffect(() => {
    const options = {
      roomName: props.meetingID,
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

const VideoChatSidebarComponent = (): JSX.Element => {
  const [currentChat, setCurrentChat] = useState("project-1");

  return (
    <>
      <div className="jp-VideoChat-toolbar jp-Toolbar">
        <div className="jp-ToolbarButton jp-Toolbar-item">
          <ToolbarButtonComponent
            tooltip="Select chat to join"
            icon={listIcon}
            label="Select chat to join"
            onClick={() => {
              InputDialog.getItem({
                title: 'Pick video chat to join',
                items: ['Project 1', 'Project 2']
              }).then(result => {
                if (result.value) {
                  setCurrentChat(result.value);
                }
              });
            }}
          />
        </div>

        <div className="jp-Toolbar-item jp-Toolbar-spacer" />

        <div className="jp-ToolbarButton jp-Toolbar-item">
          <ToolbarButtonComponent
            tooltip="Disconnect"
            icon={stopIcon}
            label="Disconnect"
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
        <span>Select a meeting to start</span>
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