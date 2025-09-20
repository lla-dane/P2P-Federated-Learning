import type { ISettings } from '../renderer';

export const saveCredentials = (settings: ISettings): Promise<void> => {
  return window.electronAPI.saveCredentials(settings);
};

export const loadCredentials = (): Promise<ISettings | null> => {
  return window.electronAPI.loadCredentials();
};
