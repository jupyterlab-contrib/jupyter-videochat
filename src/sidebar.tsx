import * as React from 'react';
import { useState, useEffect } from 'react';


import JitsiMeetExternalAPI from  './external_api';
import { ReactWidget } from '@jupyterlab/apputils';

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
      <div className="jp-VideoChat-toolbar">

        <label>
          Select chat to join
          <select name="jp-VideoChat-chat-name" id="jp-VideoChat-chat-name"
            onChange={
              (ev: any) => {setCurrentChat(ev.target.value)}
            }>
            <option value="project-1">Project 1</option>
            <option value="project-2">Project 2</option>
          </select>
        </label>

      </div>

      <JitsiMeetComponent meetingID={currentChat} domain="meet.jit.si"/>
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