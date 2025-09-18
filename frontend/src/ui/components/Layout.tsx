import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';

const Layout = () => {
  return (
    <div className='flex h-screen bg-background font-sans'>
      <Sidebar />
      <main className='flex-1 p-8 overflow-y-auto'>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
