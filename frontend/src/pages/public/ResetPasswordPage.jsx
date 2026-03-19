import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../../services/api';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { toast } from 'react-toastify';
import Loader from '../../components/common/Loader';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ 
    password: '', 
    confirmPassword: '' 
  });
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  // Validate token on component mount
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        toast.error('No reset token provided');
        setTimeout(() => navigate('/login'), 2000);
        return;
      }

      try {
        const response = await authAPI.validateResetToken({ token });
        if (response.success) {
          setTokenValid(true);
          setUserEmail(response.data.email);
        }
      } catch (error) {
        console.error('Token validation error:', error);
        toast.error(error.message || 'This reset link is invalid or has expired');
        setTimeout(() => navigate('/login'), 2000);
      } finally {
        setValidating(false);
      }
    };

    validateToken();
  }, [token, navigate]);

  const validatePassword = (password) => {
    if (password.length < 6) {
      return 'Password must be at least 6 characters long';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate passwords
    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      toast.error(passwordError);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.resetPassword({
        token,
        password: formData.password,
        confirmPassword: formData.confirmPassword
      });

      if (response.success) {
        toast.success('Password reset successfully! Redirecting to login...');
        setResetSuccess(true);
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (error) {
      console.error('Reset password error:', error);
      toast.error(error.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return <Loader fullScreen />;
  }

  if (!tokenValid || resetSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4">
        <div className="max-w-md w-full text-center">
          <div className="flex justify-center mb-4">
            <svg className="w-16 h-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Password Reset Successful</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Your password has been reset. You can now sign in with your new password.
          </p>
          <Link 
            to="/login" 
            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Create new password</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Enter a new password for {userEmail}
          </p>
        </div>

        <form 
          className="mt-8 space-y-6 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg dark:shadow-gray-900/50" 
          onSubmit={handleSubmit}
        >
          <Input
            label="New password"
            type="password"
            placeholder="Enter new password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            minLength="6"
          />

          <Input
            label="Confirm password"
            type="password"
            placeholder="Confirm new password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            required
            minLength="6"
          />

          <div className="text-sm text-gray-600 dark:text-gray-400">
            <p>✓ At least 6 characters</p>
          </div>

          <Button type="submit" fullWidth disabled={loading}>
            {loading ? 'Resetting password...' : 'Reset password'}
          </Button>

          <div className="text-center">
            <Link 
              to="/login" 
              className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300"
            >
              Back to login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
