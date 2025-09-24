import {
  Rocket,
  History,
  Settings,
  Brain,
  Wallet,
  ChevronDown,
  Copy,
  ExternalLink,
  LogOut,
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { toast } from 'sonner';
import { useWalletInterface } from '../services/useWalletInterface';

const Sidebar = () => {
  const { accountId, balance, isConnected, actions } = useWalletInterface();
  const [isWalletExpanded, setIsWalletExpanded] = useState(false);
  const navigate = useNavigate();

  const copyToClipboard = (text: string | undefined) => {
    navigator.clipboard.writeText(text || '');
    toast.success('Address copied to clipboard!');
  };

  const openInExplorer = () => {
    if (accountId) {
      const url = `https://hashscan.io/testnet/account/${accountId}`;
      window.electronAPI.openExternalLink(url);
    }
  };

  const linkClasses =
    'focus:outline-none flex items-center gap-3 hover:bg-primary/10 p-2 rounded-lg transition-colors';
  const activeLinkClasses = 'bg-primary/20 text-primary';

  return (
    <aside className='w-64 bg-surface text-text-primary p-4 flex flex-col'>
      <div className='mb-6'>
        <div
          className='flex items-center gap-3 p-3 bg-primary/10 rounded-lg border border-primary/20 cursor-pointer'
          onClick={() => navigate('/')}
        >
          <div className='w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center border border-primary/30'>
            <Brain className='w-6 h-6 text-primary' />
          </div>
          <div>
            <h1 className='text-lg font-bold text-text-primary'>DecentraAI</h1>
            <p className='text-xs text-text-secondary'>Neural Network</p>
          </div>
        </div>
      </div>

      <div className='mb-6'>
        {!isConnected ? (
          <div className='p-3 bg-background/50 border border-border rounded-lg'>
            <div className='flex items-center gap-2 mb-2'>
              <Wallet className='w-4 h-4 text-text-secondary' />
              <span className='text-sm font-medium text-text-secondary'>
                Wallet
              </span>
            </div>
            <button
              onClick={actions.connect}
              className='w-full bg-primary text-background text-sm font-medium py-2 px-3 rounded-lg hover:bg-primary/90 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50'
            >
              Connect Wallet
            </button>
            <p className='text-xs text-text-secondary mt-2 text-center'>
              Required for training
            </p>
          </div>
        ) : (
          <div className='bg-primary/10 border border-primary/20 rounded-lg overflow-hidden'>
            <button
              onClick={() => setIsWalletExpanded(!isWalletExpanded)}
              className='w-full p-3 flex items-center justify-between hover:bg-primary/20 transition-colors duration-200'
            >
              <div className='flex items-center gap-2'>
                <div className='w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center'>
                  <Wallet className='w-3 h-3 text-primary' />
                </div>
                <div className='text-left'>
                  <p className='text-sm font-medium text-text-primary'>
                    {accountId}
                  </p>
                  <p className='text-xs text-primary font-mono'>
                    {balance ? `${balance} HBAR` : 'Loading...'}
                  </p>
                </div>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-text-secondary transition-transform duration-200 ${
                  isWalletExpanded ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isWalletExpanded && (
              <div className='border-t border-primary/20 p-3 space-y-2'>
                <button
                  onClick={() => copyToClipboard(accountId)}
                  className='w-full flex items-center gap-2 p-2 text-xs text-text-secondary hover:text-text-primary hover:bg-primary/10 rounded transition-colors duration-200'
                >
                  <Copy className='w-3 h-3' /> Copy Address
                </button>
                <button
                  onClick={openInExplorer}
                  className='w-full flex items-center gap-2 p-2 text-xs text-text-secondary hover:text-text-primary hover:bg-primary/10 rounded transition-colors duration-200'
                >
                  <ExternalLink className='w-3 h-3' /> View on Explorer
                </button>
                <button
                  onClick={actions.disconnect}
                  className='w-full flex items-center gap-2 p-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors duration-200'
                >
                  <LogOut className='w-3 h-3' /> Disconnect
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <nav className='flex flex-col gap-2'>
        <NavLink
          to='/training'
          className={({ isActive }) =>
            `${linkClasses} ${isActive ? activeLinkClasses : ''}`
          }
        >
          <Rocket size={20} />
          <span>New Training</span>
        </NavLink>
        <NavLink
          to='/history'
          className={({ isActive }) =>
            `${linkClasses} ${isActive ? activeLinkClasses : ''}`
          }
        >
          <History size={20} />
          <span>Training History</span>
        </NavLink>
      </nav>
      <nav className='flex flex-col gap-2 mt-auto pt-4 border-t border-border'>
        <NavLink
          to='/settings'
          className={({ isActive }) =>
            `${linkClasses} ${isActive ? activeLinkClasses : ''}`
          }
        >
          <Settings size={20} />
          <span>Settings</span>
        </NavLink>
      </nav>
      <div className='mt-4 pt-4 border-t border-border/50'>
        <div className='text-center'>
          <p className='text-xs text-text-secondary'>© 2025 DecentraAI</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
