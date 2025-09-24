import { registerHistoryHandlers } from './historyHandlers.js';
import { registerCredentialHandlers } from './credentialHandlers.js';
import { registerDialogHandlers } from './dialogHandlers.js';
import { registerPinataHandlers } from './pinataHandlers.js';
import { registerAkaveHandlers } from './akaveHandlers.js';

export function registerIpcHandlers() {
  registerHistoryHandlers();
  registerCredentialHandlers();
  registerDialogHandlers();
  registerPinataHandlers();
  registerAkaveHandlers();
}
