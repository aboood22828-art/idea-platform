import { useState, useEffect, useCallback, useMemo } from 'react'
import { 
  FileText, Plus, Edit, Trash2, Eye, Tag, 
  Folder, Search, Filter, MoreVertical, AlertCircle, CheckCircle, Loader2
} from 'lucide-react'
import api from '../utils/api'

const ContentManagementPage = () => {
  const [contents, setContents] = useState([])
  const [categories, setCategories] = useState([])
  const [tags, setTags] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [selectedContent, setSelectedContent] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)

  // جلب البيانات عند تحميل الصفحة أو تغيير الفلاتر
  useEffect(() => {
    loadData()
  }, [filterType, filterStatus])

  // إغلاق الرسائل تلقائيًا
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [successMessage])

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [error])

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      await Promise.all([fetchContents(), fetchCategories(), fetchTags()])
    } catch (err) {
      setError('فشل في تحميل البيانات. يرجى المحاولة لاحقًا.')
      console.error('خطأ في تحميل البيانات:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchContents = useCallback(async () => {
    try {
      let url = '/api/cms/contents/'
      const params = new URLSearchParams()
      
      if (filterType !== 'all') params.append('type', filterType)
      if (filterStatus !== 'all') params.append('status', filterStatus)
      if (params.toString()) url += `?${params.toString()}`
      
      const response = await api.get(url)
      setContents(response.data || [])
    } catch (error) {
      console.error('خطأ في جلب المحتوى:', error)
      throw error
    }
  }, [filterType, filterStatus])

  const fetchCategories = useCallback(async () => {
    try {
      const response = await api.get('/api/cms/categories/')
      setCategories(response.data || [])
    } catch (error) {
      console.error('خطأ في جلب التصنيفات:', error)
      throw error
    }
  }, [])

  const fetchTags = useCallback(async () => {
    try {
      const response = await api.get('/api/cms/tags/')
      setTags(response.data || [])
    } catch (error) {
      console.error('خطأ في جلب العلامات:', error)
      throw error
    }
  }, [])

  const handlePublish = useCallback(async (slug) => {
    if (!window.confirm('هل أنت متأكد من نشر هذا المحتوى؟')) {
      return
    }

    try {
      setActionLoading(slug)
      setError(null)
      await api.post(`/api/cms/contents/${slug}/publish/`)
      setSuccessMessage('تم نشر المحتوى بنجاح')
      await fetchContents()
    } catch (error) {
      console.error('خطأ في نشر المحتوى:', error)
      setError(error.response?.data?.detail || 'فشل في نشر المحتوى')
    } finally {
      setActionLoading(null)
    }
  }, [fetchContents])

  const handleArchive = useCallback(async (slug) => {
    if (!window.confirm('هل أنت متأكد من أرشفة هذا المحتوى؟')) {
      return
    }

    try {
      setActionLoading(slug)
      setError(null)
      await api.post(`/api/cms/contents/${slug}/archive/`)
      setSuccessMessage('تم أرشفة المحتوى بنجاح')
      await fetchContents()
    } catch (error) {
      console.error('خطأ في أرشفة المحتوى:', error)
      setError(error.response?.data?.detail || 'فشل في أرشفة المحتوى')
    } finally {
      setActionLoading(null)
    }
  }, [fetchContents])

  const handleDelete = useCallback(async (slug) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المحتوى؟ لا يمكن التراجع عن هذا الإجراء.')) {
      return
    }
    
    try {
      setActionLoading(slug)
      setError(null)
      await api.delete(`/api/cms/contents/${slug}/`)
      setSuccessMessage('تم حذف المحتوى بنجاح')
      await fetchContents()
    } catch (error) {
      console.error('خطأ في حذف المحتوى:', error)
      setError(error.response?.data?.detail || 'فشل في حذف المحتوى')
    } finally {
      setActionLoading(null)
    }
  }, [fetchContents])

  const getStatusBadge = useCallback((status) => {
    const statusConfig = {
      draft: { color: 'bg-gray-100 text-gray-800', label: 'مسودة' },
      published: { color: 'bg-green-100 text-green-800', label: 'منشور' },
      archived: { color: 'bg-red-100 text-red-800', label: 'مؤرشف' }
    }
    
    const config = statusConfig[status] || statusConfig.draft
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    )
  }, [])

  const getTypeIcon = useCallback((type) => {
    const icons = {
      article: '📄',
      page: '📃',
      news: '📰',
      blog: '✍️'
    }
    return icons[type] || '📄'
  }, [])

  const getTypeLabel = useCallback((type) => {
    const labels = {
      article: 'مقالة',
      page: 'صفحة',
      news: 'خبر',
      blog: 'مدونة'
    }
    return labels[type] || type
  }, [])

  // تصفية المحتوى بناءً على البحث
  const filteredContents = useMemo(() => {
    return contents.filter(content =>
      content.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      content.excerpt?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [contents, searchTerm])

  // حساب الإحصائيات
  const stats = useMemo(() => ({
    total: contents.length,
    published: contents.filter(c => c.status === 'published').length,
    draft: contents.filter(c => c.status === 'draft').length,
    archived: contents.filter(c => c.status === 'archived').length
  }), [contents])

  // مكون بطاقة الإحصائيات
  const StatCard = ({ icon: Icon, title, value, color }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
        </div>
        <Icon className={`h-8 w-8 ${color}`} />
      </div>
    </div>
  )

  // مكون صف المحتوى
  const ContentRow = ({ content }) => (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4">
        <div className="flex items-center">
          <span className="text-2xl ml-3">{getTypeIcon(content.content_type)}</span>
          <div>
            <div className="text-sm font-medium text-gray-900">{content.title}</div>
            <div className="text-sm text-gray-500">
              {content.excerpt?.substring(0, 50)}...
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="text-sm text-gray-900">{getTypeLabel(content.content_type)}</span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {getStatusBadge(content.status)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center text-sm text-gray-900">
          <Eye className="h-4 w-4 ml-1 text-gray-400" />
          {content.views_count || 0}
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
              disabled={actionLoading === content.slug}
              className="text-green-600 hover:text-green-900 disabled:opacity-50"
              title="نشر"
            >
              {actionLoading === content.slug ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          )}
          {content.status === 'published' && (
            <button
              onClick={() => handleArchive(content.slug)}
              disabled={actionLoading === content.slug}
              className="text-orange-600 hover:text-orange-900 disabled:opacity-50"
              title="أرشفة"
            >
              {actionLoading === content.slug ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Folder className="h-4 w-4" />
              )}
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
            disabled={actionLoading === content.slug}
            className="text-red-600 hover:text-red-900 disabled:opacity-50"
            title="حذف"
          >
            {actionLoading === content.slug ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </button>
        </div>
      </td>
    </tr>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">جاري تحميل البيانات...</p>
        </div>
      </div>
    )
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

        {/* رسائل الأخطاء والنجاح */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900">خطأ</h3>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-green-900">نجح</h3>
              <p className="text-sm text-green-700">{successMessage}</p>
            </div>
          </div>
        )}

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
        <StatCard 
          icon={FileText}
          title="إجمالي المحتوى"
          value={stats.total}
          color="text-blue-600"
        />
        
        <StatCard 
          icon={Eye}
          title="المنشور"
          value={stats.published}
          color="text-green-600"
        />
        
        <StatCard 
          icon={Folder}
          title="التصنيفات"
          value={categories.length}
          color="text-purple-600"
        />
        
        <StatCard 
          icon={Tag}
          title="العلامات"
          value={tags.length}
          color="text-orange-600"
        />
      </div>

      {/* Content List */}
      {filteredContents.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {contents.length === 0 ? 'لا يوجد محتوى' : 'لا توجد نتائج للبحث'}
          </h3>
          <p className="text-gray-600 mb-4">
            {contents.length === 0 ? 'ابدأ بإنشاء محتوى جديد' : 'حاول تغيير معايير البحث'}
          </p>
          {contents.length === 0 && (
            <button 
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              إنشاء محتوى
            </button>
          )}
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
                <ContentRow key={content.id} content={content} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default ContentManagementPage

