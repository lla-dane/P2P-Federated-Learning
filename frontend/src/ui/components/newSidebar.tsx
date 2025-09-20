import {
  Rocket,
  History,
  Settings,
  Brain,
  Wallet,
  Network,
  BarChart3,
  Shield,
  ChevronRight,
} from 'lucide-react';
import { NavLink } from 'react-router';

const Sidebar = () => {
  const linkClasses =
    'focus:outline-none flex items-center justify-between gap-3 hover:bg-primary/10 p-3 rounded-lg transition-all duration-200 group relative overflow-hidden';
  const activeLinkClasses =
    'bg-primary/20 text-primary border-l-2 border-primary';

  // Mock data for dynamic elements
  const networkStats = {
    activeNodes: 1247,
    balance: '12.4 ETH',
    status: 'connected',
  };

  const recentActivity = [
    { id: 1, type: 'training', status: 'completed' },
    { id: 2, type: 'training', status: 'pending' },
  ];

  return (
    <aside className='w-64 bg-surface text-text-primary p-4 flex flex-col border-r border-border'>
      {/* Logo/Brand Section */}
      <div className='mb-8'>
        <div className='flex items-center gap-3 p-3 bg-primary/10 rounded-lg border border-primary/20'>
          <div className='w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center border border-primary/30'>
            <Brain className='w-6 h-6 text-primary' />
          </div>
          <div>
            <h1 className='text-lg font-bold text-text-primary'>DecentraAI</h1>
            <p className='text-xs text-text-secondary'>Neural Network</p>
          </div>
        </div>
      </div>

      {/* Network Status Card */}
      <div className='mb-6 p-3 bg-background/50 border border-border rounded-lg'>
        <div className='flex items-center justify-between mb-2'>
          <span className='text-xs font-medium text-text-secondary'>
            Network
          </span>
          <div className='flex items-center gap-1'>
            <div className='w-2 h-2 bg-green-500 rounded-full animate-pulse'></div>
            <span className='text-xs text-green-500'>Live</span>
          </div>
        </div>
        <div className='space-y-1'>
          <div className='flex items-center justify-between'>
            <span className='text-xs text-text-secondary'>Nodes</span>
            <span className='text-xs font-mono text-text-primary'>
              {networkStats.activeNodes}
            </span>
          </div>
          <div className='flex items-center justify-between'>
            <span className='text-xs text-text-secondary'>Balance</span>
            <span className='text-xs font-mono text-primary'>
              {networkStats.balance}
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className='flex flex-col gap-2 mb-6'>
        <div className='text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2 px-3'>
          Training
        </div>

        <NavLink
          to='/'
          className={({ isActive }) =>
            `${linkClasses} ${isActive ? activeLinkClasses : ''}`
          }
        >
          {({ isActive }) => (
            <>
              {/* Animated background */}
              <div
                className='absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 
                            translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700'
              ></div>

              <div className='flex items-center gap-3 relative z-10'>
                <Rocket size={20} className={isActive ? 'text-primary' : ''} />
                <span className={isActive ? 'font-semibold' : ''}>
                  New Training
                </span>
              </div>

              <ChevronRight
                size={16}
                className={`transition-all duration-200 ${
                  isActive
                    ? 'text-primary translate-x-1'
                    : 'text-text-secondary group-hover:translate-x-1'
                }`}
              />
            </>
          )}
        </NavLink>

        <NavLink
          to='/history'
          className={({ isActive }) =>
            `${linkClasses} ${isActive ? activeLinkClasses : ''}`
          }
        >
          {({ isActive }) => (
            <>
              <div
                className='absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 
                            translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700'
              ></div>

              <div className='flex items-center gap-3 relative z-10'>
                <History size={20} className={isActive ? 'text-primary' : ''} />
                <div className='flex flex-col'>
                  <span className={isActive ? 'font-semibold' : ''}>
                    Training History
                  </span>
                  {recentActivity.length > 0 && (
                    <span className='text-xs text-text-secondary'>
                      {
                        recentActivity.filter((a) => a.status === 'pending')
                          .length
                      }{' '}
                      pending
                    </span>
                  )}
                </div>
              </div>

              <div className='flex items-center gap-1'>
                {recentActivity.some((a) => a.status === 'pending') && (
                  <div className='w-2 h-2 bg-yellow-500 rounded-full animate-pulse'></div>
                )}
                <ChevronRight
                  size={16}
                  className={`transition-all duration-200 ${
                    isActive
                      ? 'text-primary translate-x-1'
                      : 'text-text-secondary group-hover:translate-x-1'
                  }`}
                />
              </div>
            </>
          )}
        </NavLink>

        <NavLink
          to='/analytics'
          className={({ isActive }) =>
            `${linkClasses} ${isActive ? activeLinkClasses : ''}`
          }
        >
          {({ isActive }) => (
            <>
              <div
                className='absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 
                            translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700'
              ></div>

              <div className='flex items-center gap-3 relative z-10'>
                <BarChart3
                  size={20}
                  className={isActive ? 'text-primary' : ''}
                />
                <span className={isActive ? 'font-semibold' : ''}>
                  Analytics
                </span>
              </div>

              <ChevronRight
                size={16}
                className={`transition-all duration-200 ${
                  isActive
                    ? 'text-primary translate-x-1'
                    : 'text-text-secondary group-hover:translate-x-1'
                }`}
              />
            </>
          )}
        </NavLink>
      </nav>

      {/* Blockchain Section */}
      <nav className='flex flex-col gap-2 mb-6'>
        <div className='text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2 px-3'>
          Blockchain
        </div>

        <NavLink
          to='/wallet'
          className={({ isActive }) =>
            `${linkClasses} ${isActive ? activeLinkClasses : ''}`
          }
        >
          {({ isActive }) => (
            <>
              <div
                className='absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 
                            translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700'
              ></div>

              <div className='flex items-center gap-3 relative z-10'>
                <Wallet size={20} className={isActive ? 'text-primary' : ''} />
                <div className='flex flex-col'>
                  <span className={isActive ? 'font-semibold' : ''}>
                    Wallet
                  </span>
                  <span className='text-xs text-text-secondary font-mono'>
                    {networkStats.balance}
                  </span>
                </div>
              </div>

              <ChevronRight
                size={16}
                className={`transition-all duration-200 ${
                  isActive
                    ? 'text-primary translate-x-1'
                    : 'text-text-secondary group-hover:translate-x-1'
                }`}
              />
            </>
          )}
        </NavLink>

        <NavLink
          to='/network'
          className={({ isActive }) =>
            `${linkClasses} ${isActive ? activeLinkClasses : ''}`
          }
        >
          {({ isActive }) => (
            <>
              <div
                className='absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 
                            translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700'
              ></div>

              <div className='flex items-center gap-3 relative z-10'>
                <Network size={20} className={isActive ? 'text-primary' : ''} />
                <div className='flex flex-col'>
                  <span className={isActive ? 'font-semibold' : ''}>
                    Network
                  </span>
                  <span className='text-xs text-green-500'>
                    {networkStats.activeNodes} nodes
                  </span>
                </div>
              </div>

              <ChevronRight
                size={16}
                className={`transition-all duration-200 ${
                  isActive
                    ? 'text-primary translate-x-1'
                    : 'text-text-secondary group-hover:translate-x-1'
                }`}
              />
            </>
          )}
        </NavLink>
      </nav>

      {/* Quick Stats */}
      <div className='mb-6 p-3 bg-primary/5 border border-primary/20 rounded-lg'>
        <div className='text-xs font-semibold text-primary mb-2 flex items-center gap-2'>
          <Shield size={14} />
          Security Score
        </div>
        <div className='flex items-center justify-between mb-2'>
          <div className='flex-1 bg-background/50 rounded-full h-2 overflow-hidden'>
            <div className='w-4/5 h-full bg-gradient-to-r from-primary to-green-500 rounded-full'></div>
          </div>
          <span className='text-xs font-mono text-text-primary ml-2'>96%</span>
        </div>
        <p className='text-xs text-text-secondary'>
          Network consensus validated
        </p>
      </div>

      {/* Settings at bottom */}
      <nav className='flex flex-col gap-2 mt-auto pt-4 border-t border-border'>
        <NavLink
          to='/settings'
          className={({ isActive }) =>
            `${linkClasses} ${isActive ? activeLinkClasses : ''}`
          }
        >
          {({ isActive }) => (
            <>
              <div
                className='absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 
                            translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700'
              ></div>

              <div className='flex items-center gap-3 relative z-10'>
                <Settings
                  size={20}
                  className={isActive ? 'text-primary' : ''}
                />
                <span className={isActive ? 'font-semibold' : ''}>
                  Settings
                </span>
              </div>

              <ChevronRight
                size={16}
                className={`transition-all duration-200 ${
                  isActive
                    ? 'text-primary translate-x-1'
                    : 'text-text-secondary group-hover:translate-x-1'
                }`}
              />
            </>
          )}
        </NavLink>
      </nav>

      {/* Footer */}
      <div className='mt-4 pt-4 border-t border-border/50'>
        <div className='text-center'>
          <p className='text-xs text-text-secondary'>© 2025 DecentraAI</p>
          <p className='text-xs text-text-secondary/60 mt-1'>v2.1.0-beta</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
