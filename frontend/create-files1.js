const fs = require('fs');
const path = require('path');

const files = {
  'src/components/common/Button.jsx': `import React from 'react';

const Button = ({ children, variant = 'primary', size = 'md', fullWidth = false, ...props }) => {
  const baseStyles = 'font-semibold rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    outline: 'border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50',
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };
  
  const widthClass = fullWidth ? 'w-full' : '';
  
  return (
    <button
      className={\`\${baseStyles} \${variants[variant]} \${sizes[size]} \${widthClass}\`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;`,

  'src/components/common/Input.jsx': `import React from 'react';

const Input = ({ label, error, ...props }) => {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-gray-700 text-sm font-bold mb-2">
          {label}
        </label>
      )}
      <input
        className={\`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 \${
          error ? 'border-red-500' : 'border-gray-300'
        }\`}
        {...props}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

export default Input;`,

  'src/components/common/Loader.jsx': `import React from 'react';

const Loader = ({ size = 'md', fullScreen = false }) => {
  const sizes = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  };
  
  const loader = (
    <div className={\`animate-spin rounded-full border-4 border-gray-300 border-t-indigo-600 \${sizes[size]}\`} />
  );
  
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
        {loader}
      </div>
    );
  }
  
  return <div className="flex justify-center items-center p-8">{loader}</div>;
};

export default Loader;`,

  'src/components/common/EmptyState.jsx': `import React from 'react';
import { Link } from 'react-router-dom';
import Button from './Button';

const EmptyState = ({ title, message, actionText, actionLink }) => {
  return (
    <div className="text-center py-12">
      <svg
        className="mx-auto h-12 w-12 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
        />
      </svg>
      <h3 className="mt-2 text-sm font-medium text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-500">{message}</p>
      {actionText && actionLink && (
        <div className="mt-6">
          <Link to={actionLink}>
            <Button>{actionText}</Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default EmptyState;`,

  'src/components/common/ProtectedRoute.jsx': `import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Loader from './Loader';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <Loader fullScreen />;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

export default ProtectedRoute;`,

  'src/components/common/AdminRoute.jsx': `import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Loader from './Loader';

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <Loader fullScreen />;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

export default AdminRoute;`
};

Object.entries(files).forEach(([filePath, content]) => {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Created:', filePath);
});
