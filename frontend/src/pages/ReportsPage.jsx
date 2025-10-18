import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  BarChart3, TrendingUp, Users, DollarSign, 
  FileText, Calendar, Download, Filter, AlertCircle, CheckCircle 
} from 'lucide-react';
import api from '../utils/api';

const ReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState('all');
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [dateRange, setDateRange] = useState({
    start_date: '',
    end_date: ''
  });

  // جلب التقارير والإحصائيات عند تحميل الصفحة
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        await Promise.all([fetchReports(), fetchDashboardStats()]);
      } catch (err) {
        setError('فشل في تحميل البيانات. يرجى المحاولة لاحقًا.');
        console.error('خطأ في تحميل البيانات:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // إغلاق رسائل النجاح بعد 5 ثوان
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // إغلاق رسائل الخطأ بعد 5 ثوان
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const fetchReports = useCallback(async () => {
    try {
      const response = await api.get('/api/reports/reports/');
      setReports(response.data || []);
    } catch (error) {
      console.error('خطأ في جلب التقارير:', error);
      throw error;
    }
  }, []);

  const fetchDashboardStats = useCallback(async () => {
    try {
      const response = await api.get('/api/reports/reports/dashboard_stats/');
      setDashboardStats(response.data);
    } catch (error) {
      console.error('خطأ في جلب الإحصائيات:', error);
      throw error;
    }
  }, []);

  // التحقق من صحة نطاق التاريخ
  const isDateRangeValid = useCallback(() => {
    if (!dateRange.start_date && !dateRange.end_date) {
      return true; // كلاهما اختياري
    }
    if (dateRange.start_date && dateRange.end_date) {
      return new Date(dateRange.start_date) <= new Date(dateRange.end_date);
    }
    return true;
  }, [dateRange]);

  const generateReport = useCallback(async (reportType) => {
    if (!isDateRangeValid()) {
      setError('تاريخ البداية يجب أن يكون قبل أو مساويًا لتاريخ النهاية');
      return;
    }

    try {
      setReportLoading(true);
      setError(null);
      let endpoint = '';
      
      switch(reportType) {
        case 'project_performance':
          endpoint = '/api/reports/reports/generate_project_performance/';
          break;
        case 'sales':
          endpoint = '/api/reports/reports/generate_sales_report/';
          break;
        case 'client':
          endpoint = '/api/reports/reports/generate_client_report/';
          break;
        default:
          setError('نوع التقرير غير صحيح');
          return;
      }

      await api.post(endpoint, dateRange);
      await fetchReports();
      setSuccessMessage('تم إنشاء التقرير بنجاح');
      setDateRange({ start_date: '', end_date: '' }); // مسح نطاق التاريخ
    } catch (error) {
      console.error('خطأ في إنشاء التقرير:', error);
      setError(error.response?.data?.detail || 'فشل في إنشاء التقرير. يرجى المحاولة لاحقًا.');
    } finally {
      setReportLoading(false);
    }
  }, [dateRange, isDateRangeValid, fetchReports]);

  // مكون بطاقة الإحصائيات
  const StatCard = React.memo(({ icon: Icon, title, value, color }) => (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className={`text-2xl font-bold ${color}`}>
            {typeof value === 'number' && value > 1000 
              ? value.toLocaleString('ar-SA') 
              : value}
          </p>
        </div>
        <div className={`p-3 rounded-full ${color.replace('text', 'bg')}/10`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
      </div>
    </div>
  ));

  StatCard.displayName = 'StatCard';

  // مكون بطاقة التقرير
  const ReportCard = React.memo(({ report }) => (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{report.title}</h3>
          <p className="text-sm text-gray-600 mb-2">{report.description || 'بدون وصف'}</p>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {new Date(report.created_at).toLocaleDateString('ar-SA')}
            </span>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
              {report.report_type === 'project_performance' && 'أداء المشاريع'}
              {report.report_type === 'sales' && 'المبيعات'}
              {report.report_type === 'client' && 'العملاء'}
              {report.report_type === 'financial' && 'مالي'}
              {report.report_type === 'custom' && 'مخصص'}
            </span>
          </div>
        </div>
        <button 
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="تحميل التقرير"
        >
          <Download className="h-5 w-5 text-gray-600" />
        </button>
      </div>
      
      {report.project_metrics && report.project_metrics.length > 0 && (
        <div className="mt-4 pt-4 border-t">
          <p className="text-sm text-gray-600 mb-2">مقاييس المشاريع:</p>
          <div className="grid grid-cols-2 gap-2">
            {report.project_metrics.slice(0, 2).map((metric, idx) => (
              <div key={idx} className="text-sm">
                <span className="text-gray-500">{metric.project_name}:</span>
                <span className="font-semibold text-gray-900 mr-1">
                  {metric.completion_percentage}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  ));

  ReportCard.displayName = 'ReportCard';

  // رسالة الخطأ
  const ErrorMessage = () => (
    error && (
      <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-red-900">خطأ</h3>
          <p className="text-sm text-red-700">{error}</p>
        </div>
      </div>
    )
  );

  // رسالة النجاح
  const SuccessMessage = () => (
    successMessage && (
      <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-green-900">نجح</h3>
          <p className="text-sm text-green-700">{successMessage}</p>
        </div>
      </div>
    )
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">التقارير والتحليلات</h1>
        <p className="text-gray-600">عرض وإنشاء تقارير مفصلة عن أداء المنصة</p>
      </div>

      {/* رسائل الأخطاء والنجاح */}
      <ErrorMessage />
      <SuccessMessage />

      {/* Dashboard Stats */}
      {dashboardStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            icon={BarChart3}
            title="إجمالي المشاريع"
            value={dashboardStats.total_projects || 0}
            color="text-blue-600"
          />
          <StatCard 
            icon={TrendingUp}
            title="المشاريع النشطة"
            value={dashboardStats.active_projects || 0}
            color="text-green-600"
          />
          <StatCard 
            icon={Users}
            title="العملاء"
            value={dashboardStats.total_clients || 0}
            color="text-purple-600"
          />
          <StatCard 
            icon={DollarSign}
            title="الإيرادات الإجمالية"
            value={`${(dashboardStats.total_revenue || 0).toLocaleString('ar-SA')} ر.س`}
            color="text-orange-600"
          />
        </div>
      )}

      {/* Generate Report Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">إنشاء تقرير جديد</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              تاريخ البداية (اختياري)
            </label>
            <input
              type="date"
              value={dateRange.start_date}
              onChange={(e) => setDateRange({...dateRange, start_date: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              تاريخ النهاية (اختياري)
            </label>
            <input
              type="date"
              value={dateRange.end_date}
              onChange={(e) => setDateRange({...dateRange, end_date: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => generateReport('project_performance')}
            disabled={reportLoading}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {reportLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                جاري الإنشاء...
              </>
            ) : (
              <>
                <BarChart3 className="h-5 w-5" />
                تقرير أداء المشاريع
              </>
            )}
          </button>
          
          <button
            onClick={() => generateReport('sales')}
            disabled={reportLoading}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {reportLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                جاري الإنشاء...
              </>
            ) : (
              <>
                <DollarSign className="h-5 w-5" />
                تقرير المبيعات
              </>
            )}
          </button>
          
          <button
            onClick={() => generateReport('client')}
            disabled={reportLoading}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {reportLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                جاري الإنشاء...
              </>
            ) : (
              <>
                <Users className="h-5 w-5" />
                تقرير العملاء
              </>
            )}
          </button>
        </div>
      </div>

      {/* Reports List */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">التقارير السابقة</h2>
          <button className="flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter className="h-4 w-4" />
            تصفية
          </button>
        </div>

        {reports.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد تقارير</h3>
            <p className="text-gray-600">ابدأ بإنشاء تقرير جديد من الأعلى</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsPage;

