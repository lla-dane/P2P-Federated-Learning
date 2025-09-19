import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';
import { Toaster } from 'sonner';

const Layout = () => {
  return (
    <div className='flex h-screen bg-background font-sans'>
      <Sidebar />
      <main className='flex-1 p-8 overflow-y-auto'>
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
            },
          }}
        />
      </main>
    </div>
  );
};

export default Layout;
