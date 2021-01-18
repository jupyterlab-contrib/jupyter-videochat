import { LabIcon } from '@jupyterlab/ui-components';
import { NS } from './tokens';
import CHAT_ICON from '../style/icons/videochat.svg';
import GROUP_ICON from '../style/icons/group.svg';
import GROUP_NEW_ICON from '../style/icons/group-add.svg';
import PUBLIC_ICON from '../style/icons/public.svg';
import USER_ICON from '../style/icons/user.svg';

/** Main chat icon */
export const chatIcon = new LabIcon({ name: `${NS}:chat`, svgstr: CHAT_ICON });

/** Group icon */
export const groupIcon = new LabIcon({
  name: `${NS}:group`,
  svgstr: GROUP_ICON,
});

/** New Group icon */
export const newGroupIcon = new LabIcon({
  name: `${NS}:group-new`,
  svgstr: GROUP_NEW_ICON,
});

/** Global icon */
export const publicIcon = new LabIcon({
  name: `${NS}:public`,
  svgstr: PUBLIC_ICON,
});

/** User icon */
export const userIcon = new LabIcon({
  name: `${NS}:user`,
  svgstr: USER_ICON,
});
