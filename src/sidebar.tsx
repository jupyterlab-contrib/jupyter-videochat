import * as React from 'react';
import { useState, useEffect } from 'react';


import JitsiMeetExternalAPI from  './external_api';
import { ReactWidget, ToolbarButtonComponent, InputDialog } from '@jupyterlab/apputils';

import { listIcon } from '@jupyterlab/ui-components';

type JitsiMeetProps = {
  meetingID: string
  domain: string
}

const JitsiMeetComponent = (props: JitsiMeetProps): JSX.Element => {
  let container = React.createRef<HTMLDivElement>();

  useEffect(() => {
    const options = {
      roomName: props.meetingID,
      parentNode: container.current
    };
    console.log(container)

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
            iconLabel="Select chat to join"
            onClick={() => {
              InputDialog.getItem({
                title: "Pick video chat to join",
                items: ["Project 1", "Project 2"],
                editable: true
              }).then((value) => {
                setCurrentChat(value.value);
              })
            }}
          />
        </div>
      </div>

      <JitsiMeetComponent meetingID={currentChat} domain="meet.jit.si" />
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