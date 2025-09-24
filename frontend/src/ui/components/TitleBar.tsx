import React from 'react';
import { BrainCircuit, Minus, Copy, X } from 'lucide-react';
import {
  handleMinimize,
  handleMaximize,
  handleClose,
} from '../utils/windowHelper';

const TitleBar = () => {
  return (
    <header className='h-12 bg-surface flex items-center justify-between border-b border-border/50 select-none'>
      {/* Draggable Region */}

      <div
        className='flex-grow h-full flex items-center gap-3 px-4'
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      >
        <div className='w-6 h-6 bg-primary/20 rounded-md flex items-center justify-center border border-primary/30'>
          <BrainCircuit size={14} className='text-primary' />
        </div>
        <span className='font-semibold text-text-primary text-sm'>
          DecentraAI
        </span>
        <div className='w-px h-4 bg-border'></div>
        <span className='text-xs text-text-secondary'>
          Neural Training Platform
        </span>
      </div>

      {/* Window Controls (Non-Draggable) */}
      <div
        className='flex items-center space-x-2'
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        <button
          onClick={handleMinimize}
          className='h-12 w-12  flex items-center justify-center transition-colors duration-150 hover:bg-background focus:outline-none focus:ring-1 focus:ring-primary'
        >
          <Minus size={20} className='text-text-secondary' />
        </button>
        <button
          onClick={handleMaximize}
          className='h-12 w-12  flex items-center justify-center transition-colors duration-150 hover:bg-background focus:outline-none focus:ring-1 focus:ring-primary'
        >
          <Copy size={16} className='text-text-secondary' />
        </button>
        <button
          onClick={handleClose}
          className='h-12 w-12  flex items-center justify-center transition-colors duration-150 hover:bg-red-500 group focus:outline-none focus:ring-1 focus:ring-red-500'
        >
          <X size={20} className='text-text-secondary group-hover:text-white' />
        </button>
      </div>
    </header>
  );
};

export default TitleBar;
