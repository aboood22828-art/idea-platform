import React, { useState, useEffect } from 'react';
import { 
  Twitter, Facebook, Instagram, Linkedin, Youtube,
  Plus, Send, Calendar, BarChart2, TrendingUp, MessageCircle
} from 'lucide-react';
import api from '../utils/api';

const SocialMediaPage = () => {
  const [accounts, setAccounts] = useState([]);
  const [posts, setPosts] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [newPost, setNewPost] = useState({
    account: '',
    content: '',
    scheduled_at: ''
  });

  useEffect(() => {
    fetchAccounts();
    fetchPosts();
    fetchCampaigns();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await api.get('/api/social-media/accounts/');
      setAccounts(response.data);
    } catch (error) {
      console.error('خطأ في جلب الحسابات:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async () => {
    try {
      const response = await api.get('/api/social-media/posts/');
      setPosts(response.data);
    } catch (error) {
      console.error('خطأ في جلب المنشورات:', error);
    }
  };

  const fetchCampaigns = async () => {
    try {
      const response = await api.get('/api/social-media/campaigns/');
      setCampaigns(response.data);
    } catch (error) {
      console.error('خطأ في جلب الحملات:', error);
    }
  };

  const handleCreatePost = async () => {
    try {
      await api.post('/api/social-media/posts/', newPost);
      fetchPosts();
      setShowNewPostModal(false);
      setNewPost({ account: '', content: '', scheduled_at: '' });
      alert('تم إنشاء المنشور بنجاح');
    } catch (error) {
      console.error('خطأ في إنشاء المنشور:', error);
      alert('فشل في إنشاء المنشور');
    }
  };

  const handlePublishPost = async (postId) => {
    try {
      await api.post(`/api/social-media/posts/${postId}/publish/`);
      fetchPosts();
      alert('تم نشر المنشور بنجاح');
    } catch (error) {
      console.error('خطأ في نشر المنشور:', error);
      alert('فشل في نشر المنشور');
    }
  };

  const getPlatformIcon = (platform) => {
    const icons = {
      twitter: <Twitter className="h-5 w-5" />,
      facebook: <Facebook className="h-5 w-5" />,
      instagram: <Instagram className="h-5 w-5" />,
      linkedin: <Linkedin className="h-5 w-5" />,
      youtube: <Youtube className="h-5 w-5" />
    };
    return icons[platform] || <Twitter className="h-5 w-5" />;
  };

  const getPlatformColor = (platform) => {
    const colors = {
      twitter: 'bg-blue-500',
      facebook: 'bg-blue-600',
      instagram: 'bg-pink-500',
      linkedin: 'bg-blue-700',
      youtube: 'bg-red-600'
    };
    return colors[platform] || 'bg-gray-500';
  };

  const getStatusBadge = (status) => {
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
  };

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
            onClick={() => setShowNewPostModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            منشور جديد
          </button>
        </div>
      </div>

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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {accounts.map((account) => (
              <div key={account.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${getPlatformColor(account.platform)} text-white`}>
                      {getPlatformIcon(account.platform)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{account.account_name}</h3>
                      <p className="text-sm text-gray-600">{account.platform}</p>
                    </div>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${account.is_active ? 'bg-green-500' : 'bg-gray-300'}`} />
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
          <nav className="-mb-px flex gap-6">
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
                onClick={() => setShowNewPostModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                إنشاء منشور
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {posts.map((post) => (
                <div key={post.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${getPlatformColor(post.account?.platform)} text-white`}>
                        {getPlatformIcon(post.account?.platform)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{post.account_name}</h3>
                        <p className="text-sm text-gray-600">{post.platform}</p>
                      </div>
                    </div>
                    {getStatusBadge(post.status)}
                  </div>
                  
                  <p className="text-gray-700 mb-4 line-clamp-3">{post.content}</p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    {post.scheduled_at && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(post.scheduled_at).toLocaleString('ar-SA')}
                      </div>
                    )}
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
        <div>
          {campaigns.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <BarChart2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد حملات</h3>
              <p className="text-gray-600 mb-4">ابدأ بإنشاء حملة تسويقية جديدة</p>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                إنشاء حملة
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {campaigns.map((campaign) => (
                <div key={campaign.id} className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{campaign.name}</h3>
                  <p className="text-gray-600 mb-4">{campaign.description}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">المنشورات: {campaign.posts_count}</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      campaign.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {campaign.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <TrendingUp className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">التحليلات قريباً</h3>
          <p className="text-gray-600">سيتم إضافة تحليلات مفصلة للأداء قريباً</p>
        </div>
      )}

      {/* New Post Modal */}
      {showNewPostModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">منشور جديد</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الحساب
                </label>
                <select
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  المحتوى
                </label>
                <textarea
                  value={newPost.content}
                  onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="اكتب محتوى المنشور..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  موعد النشر (اختياري)
                </label>
                <input
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
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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

