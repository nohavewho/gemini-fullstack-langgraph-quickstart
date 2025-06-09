import { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';

export default function Callback() {
  const { error } = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    if (error) {
      console.error('Auth0 callback error:', error);
      navigate('/login');
    } else {
      // Auth0 will handle the callback automatically
      // Once authenticated, redirect to main app
      setTimeout(() => {
        navigate('/');
      }, 100);
    }
  }, [error, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
        <p className="mt-4 text-gray-400">Authenticating...</p>
      </div>
    </div>
  );
}