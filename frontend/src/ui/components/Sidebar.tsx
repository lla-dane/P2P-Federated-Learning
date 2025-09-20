import { Rocket, History, Settings, Brain } from 'lucide-react';
import { NavLink } from 'react-router';

const Sidebar = () => {
  const linkClasses =
    'focus:outline-none flex items-center gap-3 hover:bg-primary/10 p-2 rounded-lg transition-colors';
  const activeLinkClasses = 'bg-primary/20 text-primary';

  return (
    <aside className='w-64 bg-surface text-text-primary p-4 flex flex-col'>
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
      <nav className='flex flex-col gap-2 mt-2'>
        <NavLink
          to='/'
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
