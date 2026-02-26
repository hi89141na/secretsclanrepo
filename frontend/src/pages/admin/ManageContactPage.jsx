import React, { useState, useEffect } from 'react';
import { Mail, Clock, CheckCircle, Trash2, Eye, Reply, Archive } from 'lucide-react';
import { contactAPI } from '../../services/api';
import { toast } from 'react-toastify';

const ManageContactPage = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchMessages();
  }, [filter]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await contactAPI.getAll({ status: filter !== 'all' ? filter : undefined });
      setMessages(response.data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await contactAPI.updateStatus(id, status);
      toast.success('Status updated successfully');
      fetchMessages();
      if (selectedMessage && selectedMessage._id === id) {
        setSelectedMessage(null);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      try {
        await contactAPI.delete(id);
        toast.success('Message deleted successfully');
        fetchMessages();
        setSelectedMessage(null);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete message');
      }
    }
  };

  const handleReply = async () => {
    if (!replyText.trim()) {
      toast.error('Reply message is required');
      return;
    }
    try {
      await contactAPI.reply(selectedMessage._id, { replyMessage: replyText });
      toast.success('Reply sent successfully');
      setReplyText('');
      setSelectedMessage(null);
      fetchMessages();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send reply');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'replied':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'archived':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Contact Messages
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage customer inquiries and feedback
          </p>
        </div>
        <div className="flex gap-2">
          {['all', 'pending', 'replied', 'archived'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${filter === status ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-indigo-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-3 max-h-[calc(100vh-250px)] overflow-y-auto">
            {messages.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Mail size={48} className="mx-auto mb-3 opacity-50" />
                <p>No messages found</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message._id}
                  onClick={() => setSelectedMessage(message)}
                  className={`p-4 rounded-lg cursor-pointer transition-all ${selectedMessage?._id === message._id ? 'bg-indigo-100 dark:bg-indigo-900 border-2 border-indigo-500' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-lg'}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {message.name}
                    </h3>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${getStatusColor(message.status)}`}
                    >
                      {message.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {message.email}
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                    {message.message}
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-500 dark:text-gray-400">
                    <Clock size={12} />
                    <span>{new Date(message.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="lg:col-span-2">
            {selectedMessage ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {selectedMessage.name}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      {selectedMessage.email}
                    </p>
                    {selectedMessage.subject && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Subject: {selectedMessage.subject}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        handleStatusUpdate(selectedMessage._id, 'archived')
                      }
                      className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      title="Archive Message"
                    >
                      <Archive size={20} />
                    </button>
                    <button
                      onClick={() => handleDelete(selectedMessage._id)}
                      className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Message
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {selectedMessage.message}
                  </p>
                </div>

                {selectedMessage.adminReply && (
                  <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <h3 className="font-semibold text-green-900 dark:text-green-200 mb-2">
                      Your Previous Reply
                    </h3>
                    <p className="text-green-800 dark:text-green-300 whitespace-pre-wrap text-sm">
                      {selectedMessage.adminReply.message}
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                      Sent on {new Date(selectedMessage.adminReply.repliedAt).toLocaleString()}
                    </p>
                  </div>
                )}

                <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Reply size={20} />
                    Send Reply
                  </h3>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your reply here..."
                    className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    rows="4"
                  />
                  <button
                    onClick={handleReply}
                    className="mt-3 px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                  >
                    Send Reply
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 border border-gray-200 dark:border-gray-700 text-center">
                <Eye size={64} className="mx-auto mb-4 text-gray-400 dark:text-gray-600" />
                <p className="text-gray-500 dark:text-gray-400">
                  Select a message to view details
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageContactPage;