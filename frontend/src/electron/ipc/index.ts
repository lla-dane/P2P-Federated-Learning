import { registerHistoryHandlers } from './historyHandlers';
import { registerCredentialHandlers } from './credentialHandlers';
import { registerDialogHandlers } from './dialogHandlers';
import { registerPinataHandlers } from './pinataHandlers';

export function registerIpcHandlers() {
  registerHistoryHandlers();
  registerCredentialHandlers();
  registerDialogHandlers();
  registerPinataHandlers();
}
