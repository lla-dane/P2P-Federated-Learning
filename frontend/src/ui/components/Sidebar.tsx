import { Rocket, History } from 'lucide-react';
import logo from '../assets/react.png';
import { NavLink } from 'react-router';

const Sidebar = () => {
  const linkClasses =
    'flex items-center gap-3 hover:bg-primary/10 p-2 rounded-lg transition-colors';
  const activeLinkClasses = 'bg-primary/20 text-primary';

  return (
    <aside className='w-64 bg-surface text-text-primary p-4 flex flex-col'>
      <div className='flex items-center gap-2 mb-8'>
        <img src={logo} alt='logo' className='h-8 w-8' />
        <h1 className='text-xl font-bold'>ML-Chain</h1>
      </div>
      <nav className='flex flex-col gap-2'>
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
      <div className='mt-auto'>
        <p className='text-xs text-text-secondary'>© 2025 Karan</p>
      </div>
    </aside>
  );
};

export default Sidebar;
