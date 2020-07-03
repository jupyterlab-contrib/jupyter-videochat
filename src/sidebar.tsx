import * as React from 'react';
import { useState, useEffect } from 'react';

import { requestAPI } from './jupyter-videochat';
import JitsiMeetExternalAPI from './external_api';
import {
  ReactWidget,
  ToolbarButtonComponent,
  InputDialog
} from '@jupyterlab/apputils';
import { PageConfig } from '@jupyterlab/coreutils';

import { stopIcon } from '@jupyterlab/ui-components';

type JitsiMeetProps = {
  room: Room;
  domain: string;
};

type Room = {
  id: string;
  displayName: string;
  description: string;
};

type VideoChatConfig = {
  jitsiServer: string;
};

const JitsiMeetComponent = (props: JitsiMeetProps): JSX.Element => {
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

    const currentMeeting = new JitsiMeetExternalAPI(props.domain, options);
    currentMeeting.executeCommand('subject', props.room.displayName);

    return () => {
      console.log('disposing');
      currentMeeting.dispose();
    };
  });

  return <div className="jp-VideoChat-jitsi-container" ref={container} />;
};

type RoomsListProps = {
  onRoomSelect: (room: Room) => void;
};

const RoomsListComponent = (props: RoomsListProps): JSX.Element => {
  const [rooms, setRooms] = useState<Array<Room>>([]);

  // Fetch list of rooms at first render only
  // We should have a 'refresh' button somewhere
  useEffect(() => {
    requestAPI<Array<Room>>('rooms')
      .then(data => {
        if (rooms !== data) {
          setRooms(data);
        }
      })
      .catch(console.warn);
  }, []);

  return (
    <>
      <div className="jp-VideoChat-rooms-list-header">Select room to join</div>
      <ul className="jp-VideoChat-rooms-list">
        {rooms.map((value, i) => {
          return (
            <li
              key={value.id}
              onClick={() => {
                props.onRoomSelect(value);
              }}
            >
              <a href="#">
                <span className="jp-VideoChat-room-displayname">
                  {value.displayName}
                </span>
                <small className="jp-VideoChat-room-description">
                  {value.description}
                </small>
              </a>
            </li>
          );
        })}
        <li
          onClick={() => {
            InputDialog.getText({
              title: 'Join room by name'
            })
              .then(value => {
                const roomName = value.value;

                requestAPI<Room>('generate-room', {
                  method: 'POST',
                  body: JSON.stringify({ displayName: roomName })
                })
                  .then(room => {
                    props.onRoomSelect(room);
                  })
                  .catch(console.warn);
              })
              .catch(console.warn);
          }}
        >
          <a href="#">
            <span className="jp-VideoChat-room-displayname">
              Join room by name
            </span>

            <small className="jp-VideoChat-room-description">
              Join an unlisted room on this hub
            </small>
          </a>
        </li>
      </ul>
    </>
  );
};

// Needs to be a separate functional component so it can use hooks
// Hooks can't be used inside the render() method of the ReactWidget
const VideoChatSidebarComponent = (): JSX.Element => {
  const [currentRoom, setCurrentRoom] = useState<Room>(null);
  const [jitsiServer, setJitsiServer] = useState<string>(null);

  // FIXME: Have a loading screen here?
  useEffect(() => {
    requestAPI<VideoChatConfig>('config')
      .then(config => {
        setJitsiServer(config.jitsiServer);
      })
      .catch(console.warn);
  }, []);

  return (
    <>
      <div className="jp-VideoChat-toolbar jp-Toolbar">
        <div className="jp-Toolbar-item jp-Toolbar-spacer" />

        <div className="jp-ToolbarButton jp-Toolbar-item">
          <ToolbarButtonComponent
            tooltip="Disconnect"
            icon={stopIcon}
            label="Disconnect"
            enabled={currentRoom !== null}
            onClick={() => {
              setCurrentRoom(null);
            }}
          />
        </div>
      </div>

      {jitsiServer !== null && currentRoom !== null ? (
        <JitsiMeetComponent room={currentRoom} domain={jitsiServer} />
      ) : (
        <RoomsListComponent
          onRoomSelect={room => {
            setCurrentRoom(room);
          }}
        />
      )}
    </>
  );
};

export class VideoChatSidebarWidget extends ReactWidget {
  constructor() {
    super();
    this.addClass('jp-VideoChat');
  }

  render(): JSX.Element {
    return <VideoChatSidebarComponent />;
  }
}
