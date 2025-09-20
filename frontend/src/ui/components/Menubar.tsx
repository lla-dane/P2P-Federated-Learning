import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';

const MenuBar = () => {
  const handleQuit = () => window.electronAPI.quitApp();

  return (
    <nav className='bg-surface w-full h-8 flex items-center px-2 border-b border-border select-none'>
      <div className='flex items-center text-sm'>
        {/* File Menu */}
        <Menu as='div' className='relative'>
          <Menu.Button className='px-2 py-1 rounded hover:bg-background text-text-primary focus:outline-none focus:ring-1 focus:ring-primary'>
            File
          </Menu.Button>
          <Transition
            as={Fragment}
            enter='transition ease-out duration-100'
            enterFrom='transform opacity-0 scale-95'
            enterTo='transform opacity-100 scale-100'
            leave='transition ease-in duration-75'
            leaveFrom='transform opacity-100 scale-100'
            leaveTo='transform opacity-0 scale-95'
          >
            <Menu.Items className='absolute left-0 mt-2 w-48 origin-top-left rounded-md bg-background shadow-lg ring-1 ring-border ring-opacity-50 focus:outline-none p-1'>
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={handleQuit}
                    className={`${
                      active
                        ? 'bg-primary text-background'
                        : 'text-text-primary'
                    } group flex w-full items-center rounded-md px-2 py-1.5 text-sm`}
                  >
                    Quit
                  </button>
                )}
              </Menu.Item>
            </Menu.Items>
          </Transition>
        </Menu>

        {/* You can add more menus here like Edit, View, Help, etc. */}
        <div className='px-2 py-1 rounded text-text-primary'>Help</div>
      </div>
    </nav>
  );
};

export default MenuBar;
