import { Link } from 'react-router-dom';
import { SearchX, Home } from 'lucide-react';

const ErrorPage = () => {
  return (
    <div className='flex flex-col items-center justify-center h-screen bg-background text-center p-4'>
      <SearchX className='text-primary' size={80} />
      <h1 className='text-4xl font-bold text-text-primary mt-6 mb-2'>
        Oops! Page Not Found
      </h1>
      <p className='text-lg text-text-secondary mb-8'>
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        to='/'
        className='flex items-center gap-2 bg-primary text-background font-semibold py-2 px-5 rounded-lg hover:opacity-90 transition-opacity'
      >
        <Home size={20} />
        Go to Homepage
      </Link>
    </div>
  );
};

export default ErrorPage;
