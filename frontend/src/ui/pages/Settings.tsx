import React, { useState } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Eye, EyeOff, Save, Shield, Key, Lock } from 'lucide-react';

const SettingsPage = () => {
  const { settings, saveSettings } = useSettings();
  const [localSettings, setLocalSettings] = useState(settings);
  const [isLoading, setIsLoading] = useState(false);
  const [showCredentials, setShowCredentials] = useState({
    awsAccessKeyId: false,
    awsSecretAccessKey: false,
  });
  const [errors, setErrors] = useState({
    awsAccessKeyId: '',
    awsSecretAccessKey: '',
  });
  const navigate = useNavigate();

  const validateField = (name: string, value: string) => {
    switch (name) {
      case 'awsAccessKeyId':
        return value.trim() === '' ? 'AWS Access Key ID is required' : '';
      case 'awsSecretAccessKey':
        return value.trim() === '' ? 'AWS Secret Access Key is required' : '';
      default:
        return '';
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLocalSettings((prev) => ({ ...prev, [name]: value }));

    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const toggleVisibility = (field: keyof typeof showCredentials) => {
    setShowCredentials((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const validateForm = () => {
    const newErrors = {
      awsAccessKeyId: validateField(
        'awsAccessKeyId',
        localSettings.awsAccessKeyId
      ),
      awsSecretAccessKey: validateField(
        'awsSecretAccessKey',
        localSettings.awsSecretAccessKey
      ),
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error !== '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the validation errors');
      return;
    }

    setIsLoading(true);

    try {
      await saveSettings(localSettings);
      toast.success('Settings saved successfully!');
      setTimeout(() => navigate('/training'), 1000);
    } catch (error) {
      toast.error('Failed to save settings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-background'>
      <div className='max-w-2xl mx-auto px-6 py-8'>
        <div className='bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6'>
          <div className='flex items-start gap-3'>
            <Shield className='w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5' />
            <div>
              <h3 className='font-medium text-blue-900 dark:text-blue-100'>
                Secure Credentials Storage
              </h3>
              <p className='text-sm text-blue-700 dark:text-blue-300 mt-1'>
                Your API credentials are stored locally and never sent to
                external servers.
              </p>
            </div>
          </div>
        </div>

        <div className='bg-surface rounded-xl border border-border overflow-hidden'>
          <div className='p-6 border-b border-border'>
            <h2 className='text-lg font-semibold text-text-primary'>
              AWS Credentials
            </h2>
            <p className='text-text-secondary text-sm mt-1'>
              Configure your AWS credentials to enable file storage and
              retrieval.
            </p>
          </div>

          <form onSubmit={handleSubmit} className='p-6'>
            <div className='space-y-6'>
              <div>
                <label className='flex items-center gap-2 text-sm font-medium text-text-primary mb-3'>
                  <Key className='w-4 h-4' />
                  AWS Access Key ID
                </label>
                <div className='relative'>
                  <input
                    type={showCredentials.awsAccessKeyId ? 'text' : 'password'}
                    name='awsAccessKeyId'
                    value={localSettings.awsAccessKeyId}
                    onChange={handleChange}
                    className={`w-full bg-background border ${
                      errors.awsAccessKeyId ? 'border-red-500' : 'border-border'
                    } text-text-primary rounded-lg p-3 pr-12 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors`}
                    placeholder='Enter your AWS Access Key ID'
                  />
                  <button
                    type='button'
                    onClick={() => toggleVisibility('awsAccessKeyId')}
                    className='absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors'
                  >
                    {showCredentials.awsAccessKeyId ? (
                      <EyeOff className='w-4 h-4' />
                    ) : (
                      <Eye className='w-4 h-4' />
                    )}
                  </button>
                </div>
                {errors.awsAccessKeyId && (
                  <p className='text-red-500 text-sm mt-1'>
                    {errors.awsAccessKeyId}
                  </p>
                )}
              </div>

              <div>
                <label className='flex items-center gap-2 text-sm font-medium text-text-primary mb-3'>
                  <Lock className='w-4 h-4' />
                  AWS Secret Access Key
                </label>
                <div className='relative'>
                  <input
                    type={
                      showCredentials.awsSecretAccessKey ? 'text' : 'password'
                    }
                    name='awsSecretAccessKey'
                    value={localSettings.awsSecretAccessKey}
                    onChange={handleChange}
                    className={`w-full bg-background border ${
                      errors.awsSecretAccessKey
                        ? 'border-red-500'
                        : 'border-border'
                    } text-text-primary rounded-lg p-3 pr-12 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors`}
                    placeholder='Enter your AWS Secret Access Key'
                  />
                  <button
                    type='button'
                    onClick={() => toggleVisibility('awsSecretAccessKey')}
                    className='absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors'
                  >
                    {showCredentials.awsSecretAccessKey ? (
                      <EyeOff className='w-4 h-4' />
                    ) : (
                      <Eye className='w-4 h-4' />
                    )}
                  </button>
                </div>
                {errors.awsSecretAccessKey && (
                  <p className='text-red-500 text-sm mt-1'>
                    {errors.awsSecretAccessKey}
                  </p>
                )}
              </div>
            </div>

            <div className='flex gap-3 mt-8'>
              <button
                type='submit'
                disabled={isLoading}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all ${
                  isLoading
                    ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    : 'bg-primary text-white hover:bg-primary/90 active:scale-[0.98]'
                }`}
              >
                {isLoading ? (
                  <>
                    <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className='w-4 h-4' />
                    Save Credentials
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <div className='mt-6 p-4 bg-surface rounded-lg border border-border'>
          <h3 className='font-medium text-text-primary mb-2'>
            Need help getting your credentials?
          </h3>
          <p className='text-sm text-text-secondary mb-3'>
            Visit the IAM section of your AWS account to generate an Access Key
            ID and Secret Access Key.
          </p>
          <a
            href='https://docs.aws.amazon.com/IAM/latest/UserGuide/security-creds.html#access-keys-and-secret-access-keys'
            target='_blank'
            rel='noopener noreferrer'
            className='inline-flex items-center gap-2 text-primary hover:text-primary/80 text-sm font-medium'
          >
            Go to AWS Documentation
            <svg
              className='w-3 h-3'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14'
              />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
