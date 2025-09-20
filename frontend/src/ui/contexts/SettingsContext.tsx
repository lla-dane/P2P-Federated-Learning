import {
  createContext,
  useState,
  useContext,
  type ReactNode,
  useEffect,
} from 'react';
import { loadCredentials, saveCredentials } from '../utils/credentialsHelper';

interface ISettings {
  apiKey: string;
  apiSecret: string;
  jwt: string;
}

interface ISettingsContext {
  settings: ISettings;
  saveSettings: (newSettings: ISettings) => void;
  isConfigured: boolean;
}

const SettingsContext = createContext<ISettingsContext | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<ISettings>({
    apiKey: '',
    apiSecret: '',
    jwt: '',
  });

  useEffect(() => {
    const loadAllSettings = async () => {
      const storedSettings = await loadCredentials();
      if (storedSettings) {
        setSettings(storedSettings);
      }
    };
    loadAllSettings();
  }, []);

  const saveSettings = async (newSettings: ISettings) => {
    setSettings(newSettings);
    await saveCredentials(newSettings);
  };

  const isConfigured = !!(
    settings.apiKey &&
    settings.apiSecret &&
    settings.jwt
  );

  return (
    <SettingsContext.Provider value={{ settings, saveSettings, isConfigured }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
