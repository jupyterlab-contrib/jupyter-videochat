import * as React from 'react';
import { useState } from 'react';

import { Widget } from '@lumino/widgets';

import JitsiMeetExternalAPI from  './external_api';
import { ReactWidget } from '@jupyterlab/apputils';

export class JitsiWidget extends Widget {

  private currentMeeting: any;

  constructor() {
    super();

    this.addClass('jpe-jitsi-widget');
  }

  async onAfterAttach(): Promise<void> {
    console.log('attach called');
    // FIXME: How often is this actually called?
    const domain = 'meet.jit.si';
    const options = {
      roomName: 'jupyterlab-extension-test-room',
      parentNode: this.node
    };

    // console.log((window as any).JitsiMeetexternalAPI)
    this.currentMeeting = new JitsiMeetExternalAPI(domain, options);
  }

  onAfterDetach(): void {
    console.log('detach called');
    this.currentMeeting.dispose();
  }
}

type JitsiMeetProps = {
  meetingID: number
}

const JitsiMeetComponent = (props: JitsiMeetProps): JSX.Element => {
  return (<div>
    <span>{props.meetingID}</span>
  </div>)
}

const VideoCallSidebarComponent = (): JSX.Element => {
  const [currentChat, setCurrentChat] = useState(1);

  return (
    <div className="jp-videochat-container">
      <div>
        <label>
          Select chat to join
          <select name="jp-videocall-chat-name" id="jp-videocall-chat-name"
            onChange={
              (ev: any) => {setCurrentChat(ev.target.value)}
            }>
            <option value="project-1">Project 1</option>
            <option value="project-2">Project 2</option>
          </select>
        </label>
      </div>
      <JitsiMeetComponent meetingID={currentChat} />
    </div>
  );
}

export class VideoCallSidebarWidget extends ReactWidget {
  childWidget: JitsiWidget;

  constructor() {
    super()
  }

  render(): JSX.Element {
    return <VideoCallSidebarComponent />;
  }


}