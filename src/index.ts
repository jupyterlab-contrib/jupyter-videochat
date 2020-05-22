import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
  ILayoutRestorer
} from '@jupyterlab/application';

import {
  ICommandPalette,
  MainAreaWidget,
  WidgetTracker
} from '@jupyterlab/apputils';

import { Widget } from '@lumino/widgets';

class JitsiWidget extends Widget {
  private JitsiMeetExternalAPI: any;

  private currentMeeting: any;

  constructor() {
    super();

    this.addClass('jpe-jitsi-widget');
  }

  async onAfterAttach(): Promise<void> {
    console.log('attach called');
    if (!this.JitsiMeetExternalAPI) {
      this.JitsiMeetExternalAPI = await this.loadJitsiExternalApi();
    }
    // FIXME: How often is this actually called?
    const domain = 'meet.jit.si';
    const options = {
      roomName: 'jupyterlab-extension-test-room',
      parentNode: this.node
    };

    this.currentMeeting = new this.JitsiMeetExternalAPI(domain, options);
  }

  onAfterDetach(): void {
    console.log('detach called');
    this.currentMeeting.dispose();
  }

  /**
   * Load Jitsi External IFrame API
   *
   * Returns JitsiMeetExternalApi
   */
  async loadJitsiExternalApi(): Promise<void> {
    console.log('jitsi loader called');
    const SCRIPT_ID = 'jpe-jitsi-external-api-loader-script';
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script#${SCRIPT_ID}`)) {
        resolve((window as any).JitsiMeetExternalAPI);
      } else {
        const script = document.createElement('script');
        // FIXME: Load this locally
        script.src = 'https://meet.jit.si/external_api.js';
        script.id = SCRIPT_ID;
        script.onload = (): void => {
          console.log('Loading Jitsi Meet External API script');
          resolve((window as any).JitsiMeetExternalAPI);
        };
        // FIXME: Should this be appended to body instead? Does it matter?
        document.head.appendChild(script);
      }
    });
  }
}

async function activate(
  app: JupyterFrontEnd,
  palette: ICommandPalette,
  restorer: ILayoutRestorer
): Promise<void> {
  console.log('JupyterLab extension jupyter-jitsi is activated!');
  // Create a blank content widget inside of a MainAreaWidget
  let widget: MainAreaWidget<JitsiWidget>;

  const command = 'jitsi:open';

  const tracker = new WidgetTracker<MainAreaWidget<JitsiWidget>>({
    namespace: 'jitsi'
  });

  app.commands.addCommand(command, {
    label: 'Jitsi Video Conference',
    execute: () => {
      if (!widget || widget.isDisposed) {
        // Create widget
        const content = new JitsiWidget();
        widget = new MainAreaWidget({ content });

        widget.id = 'jitsi-jupyterlab';
        widget.title.label = 'Jitsi Video Conference';
        widget.title.closable = true;
      }
      if (!tracker.has(widget)) {
        tracker.add(widget);
      }
      if (!widget.isAttached) {
        // Attach the widget to the main work area if it's not there
        app.shell.add(widget, 'right');
      }
      widget.content.update();
      // Activate the widget
      app.shell.activateById(widget.id);
    }
  });

  restorer.restore(tracker, {
    command,
    name: () => 'jitsi'
  });

  // Add the command to the palette.
  palette.addItem({ command, category: 'Tutorial' });
}

/**
 * Initialization data for the jupyter-jitsi extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab-videochat',
  autoStart: true,
  requires: [ICommandPalette, ILayoutRestorer],
  activate: activate
};

export default extension;
