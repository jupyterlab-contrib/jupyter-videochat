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

import JitsiMeetExternalAPI from  './external_api';

class JitsiWidget extends Widget {

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
