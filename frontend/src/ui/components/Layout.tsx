import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';
import { Toaster } from 'sonner';
import TitleBar from './TitleBar';

const Layout = () => {
  return (
    <div className='flex flex-col h-screen bg-background font-sans'>
      <TitleBar />
      {/* <MenuBar /> */}
      <div className='flex flex-1 overflow-hidden'>
        <Sidebar />
        <main className='flex-1 p-8 overflow-y-auto no-scrollbar'>
          <Outlet />
          <Toaster
            richColors
            theme='dark'
            toastOptions={{
              classNames: {
                toast: 'bg-surface border-border text-text-primary',
                title: 'text-text-primary',
                description: 'text-text-secondary',
                actionButton: 'bg-primary text-background',
                cancelButton: 'bg-surface hover:bg-background',
                success: '[&>svg]:text-green-500',
                error: '[&>svg]:text-red-500',
                loading: '!bg-surface !border-primary !text-text-primary',
              },
            }}
          />
        </main>
      </div>
    </div>
  );
};

export default Layout;
