import { registerHistoryHandlers } from './historyHandlers.js';
import { registerCredentialHandlers } from './credentialHandlers.js';
import { registerDialogHandlers } from './dialogHandlers.js';
import { registerAkaveHandlers } from './akaveHandlers.js';

export function registerIpcHandlers() {
  registerHistoryHandlers();
  registerCredentialHandlers();
  registerDialogHandlers();
  registerAkaveHandlers();
}
