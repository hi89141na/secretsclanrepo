import React, { useState } from 'react';
import { toast } from 'react-toastify';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      toast.success('Message sent successfully!');
      setFormData({ name: '', email: '', message: '' });
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="container mx-auto px-4 py-12 bg-white dark:bg-gray-900 min-h-screen transition-colors">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-white">Contact Us</h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 border border-gray-200 dark:border-gray-700 transition-colors">
          <form onSubmit={handleSubmit}>
            <Input
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                Message
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors"
                required
              />
            </div>
            
            <Button type="submit" fullWidth disabled={loading}>
              {loading ? 'Sending...' : 'Send Message'}
            </Button>
          </form>
        </div>
        
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Email</h3>
            <p className="text-gray-600 dark:text-gray-400">secretsclan2024@gmail.com</p>
          </div>
          <div className="text-center">
            <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Phone</h3>
            <p className="text-gray-600 dark:text-gray-400">+92 319 6193361</p>
          </div>
          <div className="text-center">
            <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Address</h3>
            <p className="text-gray-600 dark:text-gray-400">Lahore, Pakistan</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
