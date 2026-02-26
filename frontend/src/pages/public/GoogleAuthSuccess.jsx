import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';

const GoogleAuthSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser, checkAuth } = useAuth();
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const handleGoogleAuth = async () => {
      try {
        const token = searchParams.get('token');
        
        if (!token) {
          throw new Error('No authentication token received');
        }

        localStorage.setItem('token', token);
        await checkAuth(true);
        toast.success('Successfully signed in with Google!');
        setStatus('success');

        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);

      } catch (error) {
        console.error('Google auth error:', error);
        setStatus('error');
        toast.error(error.message || 'Google authentication failed');
        
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    };

    handleGoogleAuth();
  }, [searchParams, navigate, setUser, checkAuth]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg text-center">
        {status === 'loading' && (
          <>
            <div className="flex justify-center mb-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Completing Sign In
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Please wait while we complete your Google authentication...
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="flex justify-center mb-4">
              <svg className="h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Success!
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Redirecting to your dashboard...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="flex justify-center mb-4">
              <svg className="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Authentication Failed
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Redirecting to login page...
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default GoogleAuthSuccess;