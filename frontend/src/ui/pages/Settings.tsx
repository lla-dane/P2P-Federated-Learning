import React, { useState } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { useNavigate } from 'react-router-dom';

const SettingsPage = () => {
  const { settings, saveSettings } = useSettings();
  const [localSettings, setLocalSettings] = useState(settings);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLocalSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveSettings(localSettings);
    alert('Settings saved!');
    navigate('/');
  };

  return (
    <div>
      <h1 className='text-3xl font-bold text-text-primary mb-2'>
        API Settings
      </h1>
      <p className='text-text-secondary mb-8'>
        Enter your Pinata credentials to enable IPFS functionality.
      </p>
      <div className='max-w-xl mx-auto bg-surface p-8 rounded-xl border border-border'>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <label className='block text-sm font-medium text-text-secondary mb-2'>
              Pinata API Key
            </label>
            <input
              type='password'
              name='apiKey'
              value={localSettings.apiKey}
              onChange={handleChange}
              className='w-full bg-background border border-border text-text-primary rounded-lg p-2.5'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-text-secondary mb-2'>
              Pinata API Secret
            </label>
            <input
              type='password'
              name='apiSecret'
              value={localSettings.apiSecret}
              onChange={handleChange}
              className='w-full bg-background border border-border text-text-primary rounded-lg p-2.5'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-text-secondary mb-2'>
              Pinata JWT
            </label>
            <input
              type='password'
              name='jwt'
              value={localSettings.jwt}
              onChange={handleChange}
              className='w-full bg-background border border-border text-text-primary rounded-lg p-2.5'
            />
          </div>
          <button
            type='submit'
            className='w-full bg-primary text-background font-semibold py-3 rounded-lg'
          >
            Save Credentials
          </button>
        </form>
      </div>
    </div>
  );
};

export default SettingsPage;
