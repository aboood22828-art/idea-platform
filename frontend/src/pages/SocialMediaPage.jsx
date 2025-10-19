import React, { useState, useEffect, useCallback } from 'react';
import { 
  Twitter, Facebook, Instagram, Linkedin, Youtube,
  Plus, Send, Calendar, BarChart2, TrendingUp, MessageCircle, AlertCircle
} from 'lucide-react';
import api from '../utils/api';

const SocialMediaPage = () => {
  const [accounts, setAccounts] = useState([]);
  const [posts, setPosts] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [activeTab, setActiveTab] = useState('posts');
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [newPost, setNewPost] = useState({
    account: '',
    content: '',
    scheduled_at: ''
  });

  const resetMessages = () => {
    setError(null);
    setSuccessMessage(null);
  };

  const fetchAccounts = useCallback(async () => {
    try {
      const response = await api.get('/api/social-media/accounts/');
      setAccounts(response.data);
    } catch (error) {
      console.error('خطأ في جلب الحسابات:', error);
      setError('فشل في جلب الحسابات. يرجى المحاولة مرة أخرى.');
    }
  }, []);

  const fetchPosts = useCallback(async () => {
    try {
      const response = await api.get('/api/social-media/posts/');
      setPosts(response.data);
    } catch (error) {
      console.error('خطأ في جلب المنشورات:', error);
      setError('فشل في جلب المنشورات. يرجى المحاولة مرة أخرى.');
    }
  }, []);

  const fetchCampaigns = useCallback(async () => {
    try {
      const response = await api.get('/api/social-media/campaigns/');
      setCampaigns(response.data);
    } catch (error) {
      console.error('خطأ في جلب الحملات:', error);
      setError('فشل في جلب الحملات. يرجى المحاولة مرة أخرى.');
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    resetMessages();
    Promise.all([fetchAccounts(), fetchPosts(), fetchCampaigns()]).finally(() => setLoading(false));
  }, [fetchAccounts, fetchPosts, fetchCampaigns]);

  const handleCreatePost = async () => {
    resetMessages();
    if (!newPost.account || !newPost.content) {
      setError("يرجى تحديد الحساب وإدخال محتوى للمنشور.");
      return;
    }
    try {
      await api.post('/api/social-media/posts/', newPost);
      fetchPosts();
      setShowNewPostModal(false);
      setNewPost({ account: '', content: '', scheduled_at: '' });
      setSuccessMessage('تم إنشاء المنشور بنجاح!');
    } catch (error) {
      console.error('خطأ في إنشاء المنشور:', error);
      setError('فشل في إنشاء المنشور. يرجى التحقق من البيانات والمحاولة مرة أخرى.');
    }
  };

  const handlePublishPost = async (postId) => {
    resetMessages();
    try {
      await api.post(`/api/social-media/posts/${postId}/publish/`);
      fetchPosts();
      setSuccessMessage('تم نشر المنشور بنجاح!');
    } catch (error) {
      console.error('خطأ في نشر المنشور:', error);
      setError('فشل في نشر المنشور. يرجى المحاولة مرة أخرى.');
    }
  };

  const getPlatformIcon = useCallback((platform) => {
    const icons = {
      twitter: <Twitter className="h-5 w-5" />,
      facebook: <Facebook className="h-5 w-5" />,
      instagram: <Instagram className="h-5 w-5" />,
      linkedin: <Linkedin className="h-5 w-5" />,
      youtube: <Youtube className="h-5 w-5" />
    };
    return icons[platform] || <MessageCircle className="h-5 w-5" />;
  }, []);

  const getPlatformColor = useCallback((platform) => {
    const colors = {
      twitter: 'bg-blue-500',
      facebook: 'bg-blue-600',
      instagram: 'bg-pink-500',
      linkedin: 'bg-blue-700',
      youtube: 'bg-red-600'
    };
    return colors[platform] || 'bg-gray-500';
  }, []);

  const getStatusBadge = useCallback((status) => {
    const statusConfig = {
      draft: { color: 'bg-gray-100 text-gray-800', label: 'مسودة' },
      scheduled: { color: 'bg-yellow-100 text-yellow-800', label: 'مجدول' },
      published: { color: 'bg-green-100 text-green-800', label: 'منشور' },
      failed: { color: 'bg-red-100 text-red-800', label: 'فشل' }
    };
    
    const config = statusConfig[status] || statusConfig.draft;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">إدارة وسائل التواصل الاجتماعي</h1>
            <p className="text-gray-600">إدارة حساباتك ومنشوراتك على منصات التواصل الاجتماعي</p>
          </div>
          <button 
            onClick={() => { resetMessages(); setShowNewPostModal(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            منشور جديد
          </button>
        </div>
      </div>

      {/* Error and Success Messages */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">خطأ! </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">نجاح! </strong>
          <span className="block sm:inline">{successMessage}</span>
        </div>
      )}

      {/* Connected Accounts */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">الحسابات المتصلة</h2>
        {accounts.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600 mb-4">لم تقم بربط أي حسابات بعد</p>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              ربط حساب جديد
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {accounts.map((account) => (
              <div key={account.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${getPlatformColor(account.platform)} text-white`}>
                      {getPlatformIcon(account.platform)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 truncate">{account.account_name}</h3>
                      <p className="text-sm text-gray-600 capitalize">{account.platform}</p>
                    </div>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${account.is_active ? 'bg-green-500' : 'bg-gray-300'}`} title={account.is_active ? 'فعال' : 'غير فعال'} />
                </div>
                <div className="text-sm text-gray-600">
                  <p>المنشورات: {account.posts_count || 0}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex gap-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('posts')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'posts'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              المنشورات
            </button>
            <button
              onClick={() => setActiveTab('campaigns')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'campaigns'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              الحملات
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'analytics'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              التحليلات
            </button>
          </nav>
        </div>
      </div>

      {/* Posts Tab */}
      {activeTab === 'posts' && (
        <div>
          {posts.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <Send className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد منشورات</h3>
              <p className="text-gray-600 mb-4">ابدأ بإنشاء منشور جديد</p>
              <button 
                onClick={() => { resetMessages(); setShowNewPostModal(true); }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                إنشاء منشور
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <div key={post.id} className="bg-white rounded-lg shadow p-6 flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${getPlatformColor(post.account?.platform)} text-white`}>
                        {getPlatformIcon(post.account?.platform)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{post.account_name}</h3>
                        <p className="text-sm text-gray-600 capitalize">{post.platform}</p>
                      </div>
                    </div>
                    {getStatusBadge(post.status)}
                  </div>
                  
                  <p className="text-gray-700 mb-4 flex-grow line-clamp-3">{post.content}</p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    {post.scheduled_at ? (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(post.scheduled_at).toLocaleString('ar-SA')}</span>
                      </div>
                    ) : <span></span>}
                  </div>
                  
                  {post.status === 'draft' && (
                    <button
                      onClick={() => handlePublishPost(post.id)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Send className="h-4 w-4" />
                      نشر الآن
                    </button>
                  )}
                  
                  {post.analytics && post.analytics.length > 0 && (
                    <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <p className="text-xs text-gray-600">الإعجابات</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {post.analytics[0].likes_count}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-600">التعليقات</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {post.analytics[0].comments_count}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-600">المشاركات</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {post.analytics[0].shares_count}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Campaigns Tab */}
      {activeTab === 'campaigns' && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <BarChart2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد حملات بعد</h3>
          <p className="text-gray-600">هذه الميزة قيد التطوير. يمكنك إنشاء حملات تسويقية وتتبعها من هنا قريباً.</p>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <TrendingUp className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">التحليلات قريباً</h3>
          <p className="text-gray-600">سيتم إضافة تحليلات مفصلة لأداء حساباتك ومنشوراتك قريباً.</p>
        </div>
      )}

      {/* New Post Modal */}
      {showNewPostModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">منشور جديد</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="account-select" className="block text-sm font-medium text-gray-700 mb-2">
                  الحساب
                </label>
                <select
                  id="account-select"
                  value={newPost.account}
                  onChange={(e) => setNewPost({...newPost, account: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">اختر حساباً</option>
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.account_name} ({account.platform})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="post-content" className="block text-sm font-medium text-gray-700 mb-2">
                  المحتوى
                </label>
                <textarea
                  id="post-content"
                  value={newPost.content}
                  onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="اكتب محتوى المنشور..."
                />
              </div>
              
              <div>
                <label htmlFor="scheduled-time" className="block text-sm font-medium text-gray-700 mb-2">
                  موعد النشر (اختياري)
                </label>
                <input
                  id="scheduled-time"
                  type="datetime-local"
                  value={newPost.scheduled_at}
                  onChange={(e) => setNewPost({...newPost, scheduled_at: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCreatePost}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300"
                disabled={!newPost.account || !newPost.content}
              >
                إنشاء
              </button>
              <button
                onClick={() => setShowNewPostModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialMediaPage;

