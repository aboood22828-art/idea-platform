import React, { useState, useEffect } from 'react';
import { 
  FileText, Plus, Edit, Trash2, Eye, Tag, 
  Folder, Search, Filter, MoreVertical 
} from 'lucide-react';
import api from '../utils/api';

const ContentManagementPage = () => {
  const [contents, setContents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchContents();
    fetchCategories();
    fetchTags();
  }, [filterType, filterStatus]);

  const fetchContents = async () => {
    try {
      let url = '/api/cms/contents/';
      const params = new URLSearchParams();
      
      if (filterType !== 'all') params.append('type', filterType);
      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (params.toString()) url += `?${params.toString()}`;
      
      const response = await api.get(url);
      setContents(response.data);
    } catch (error) {
      console.error('خطأ في جلب المحتوى:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/api/cms/categories/');
      setCategories(response.data);
    } catch (error) {
      console.error('خطأ في جلب التصنيفات:', error);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await api.get('/api/cms/tags/');
      setTags(response.data);
    } catch (error) {
      console.error('خطأ في جلب العلامات:', error);
    }
  };

  const handlePublish = async (slug) => {
    try {
      await api.post(`/api/cms/contents/${slug}/publish/`);
      fetchContents();
      alert('تم نشر المحتوى بنجاح');
    } catch (error) {
      console.error('خطأ في نشر المحتوى:', error);
      alert('فشل في نشر المحتوى');
    }
  };

  const handleArchive = async (slug) => {
    try {
      await api.post(`/api/cms/contents/${slug}/archive/`);
      fetchContents();
      alert('تم أرشفة المحتوى بنجاح');
    } catch (error) {
      console.error('خطأ في أرشفة المحتوى:', error);
      alert('فشل في أرشفة المحتوى');
    }
  };

  const handleDelete = async (slug) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المحتوى؟')) return;
    
    try {
      await api.delete(`/api/cms/contents/${slug}/`);
      fetchContents();
      alert('تم حذف المحتوى بنجاح');
    } catch (error) {
      console.error('خطأ في حذف المحتوى:', error);
      alert('فشل في حذف المحتوى');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: { color: 'bg-gray-100 text-gray-800', label: 'مسودة' },
      published: { color: 'bg-green-100 text-green-800', label: 'منشور' },
      archived: { color: 'bg-red-100 text-red-800', label: 'مؤرشف' }
    };
    
    const config = statusConfig[status] || statusConfig.draft;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getTypeIcon = (type) => {
    const icons = {
      article: '📄',
      page: '📃',
      news: '📰',
      blog: '✍️'
    };
    return icons[type] || '📄';
  };

  const filteredContents = contents.filter(content =>
    content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    content.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">إدارة المحتوى</h1>
            <p className="text-gray-600">إنشاء وإدارة المحتوى الخاص بالمنصة</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            محتوى جديد
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="البحث في المحتوى..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">كل الأنواع</option>
            <option value="article">مقالة</option>
            <option value="page">صفحة</option>
            <option value="news">خبر</option>
            <option value="blog">مدونة</option>
          </select>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">كل الحالات</option>
            <option value="draft">مسودة</option>
            <option value="published">منشور</option>
            <option value="archived">مؤرشف</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">إجمالي المحتوى</p>
              <p className="text-2xl font-bold text-gray-900">{contents.length}</p>
            </div>
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">المنشور</p>
              <p className="text-2xl font-bold text-green-600">
                {contents.filter(c => c.status === 'published').length}
              </p>
            </div>
            <Eye className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">التصنيفات</p>
              <p className="text-2xl font-bold text-purple-600">{categories.length}</p>
            </div>
            <Folder className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">العلامات</p>
              <p className="text-2xl font-bold text-orange-600">{tags.length}</p>
            </div>
            <Tag className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Content List */}
      {filteredContents.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">لا يوجد محتوى</h3>
          <p className="text-gray-600 mb-4">ابدأ بإنشاء محتوى جديد</p>
          <button 
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            إنشاء محتوى
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  العنوان
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  النوع
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الحالة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  المشاهدات
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  التاريخ
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredContents.map((content) => (
                <tr key={content.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <span className="text-2xl ml-3">{getTypeIcon(content.content_type)}</span>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{content.title}</div>
                        <div className="text-sm text-gray-500">{content.excerpt?.substring(0, 50)}...</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{content.content_type}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(content.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Eye className="h-4 w-4 ml-1 text-gray-400" />
                      {content.views_count}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(content.created_at).toLocaleDateString('ar-SA')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      {content.status === 'draft' && (
                        <button
                          onClick={() => handlePublish(content.slug)}
                          className="text-green-600 hover:text-green-900"
                          title="نشر"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      )}
                      {content.status === 'published' && (
                        <button
                          onClick={() => handleArchive(content.slug)}
                          className="text-orange-600 hover:text-orange-900"
                          title="أرشفة"
                        >
                          <Folder className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedContent(content)}
                        className="text-blue-600 hover:text-blue-900"
                        title="تعديل"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(content.slug)}
                        className="text-red-600 hover:text-red-900"
                        title="حذف"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ContentManagementPage;

