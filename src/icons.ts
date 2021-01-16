import { LabIcon } from '@jupyterlab/ui-components';
import { NS } from './tokens';
import CHAT_ICON from '../style/icons/videochat.svg';

/** Main chat icon */
export const chatIcon = new LabIcon({ name: `${NS}:chat`, svgstr: CHAT_ICON });
