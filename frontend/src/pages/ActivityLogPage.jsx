import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Activity, 
  Search, 
  LogIn, 
  LogOut, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Download,
  Upload,
  Filter
} from 'lucide-react'

const ActivityLogPage = () => {
  const [activities, setActivities] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchActivities()
  }, [])

  const fetchActivities = async () => {
    try {
      setLoading(true)
      // هنا يجب استدعاء API الحقيقي
      // const response = await api.get('/api/auth/activities/')
      // setActivities(response.data)
      
      // بيانات تجريبية للعرض
      setActivities([
        {
          id: 1,
          user_name: 'مدير النظام',
          user_email: 'admin@ideateam.com',
          activity_type: 'login',
          activity_type_display: 'تسجيل دخول',
          description: 'تسجيل دخول ناجح',
          ip_address: '192.168.1.100',
          created_at: '2024-10-14T08:30:00Z'
        },
        {
          id: 2,
          user_name: 'أحمد محمد',
          user_email: 'manager@ideateam.com',
          activity_type: 'create',
          activity_type_display: 'إنشاء',
          description: 'إنشاء مشروع جديد: تطوير موقع الشركة',
          ip_address: '192.168.1.101',
          created_at: '2024-10-14T09:15:00Z'
        },
        {
          id: 3,
          user_name: 'سارة أحمد',
          user_email: 'employee@ideateam.com',
          activity_type: 'update',
          activity_type_display: 'تحديث',
          description: 'تحديث بيانات العميل: شركة التقنية المتقدمة',
          ip_address: '192.168.1.102',
          created_at: '2024-10-14T10:00:00Z'
        },
        {
          id: 4,
          user_name: 'مدير النظام',
          user_email: 'admin@ideateam.com',
          activity_type: 'delete',
          activity_type_display: 'حذف',
          description: 'حذف فاتورة: INV-2024-00123',
          ip_address: '192.168.1.100',
          created_at: '2024-10-14T11:30:00Z'
        },
        {
          id: 5,
          user_name: 'أحمد محمد',
          user_email: 'manager@ideateam.com',
          activity_type: 'logout',
          activity_type_display: 'تسجيل خروج',
          description: 'تسجيل خروج',
          ip_address: '192.168.1.101',
          created_at: '2024-10-14T17:00:00Z'
        },
      ])
    } catch (error) {
      console.error('خطأ في جلب الأنشطة:', error)
    } finally {
      setLoading(false)
    }
  }

  const getActivityIcon = (type) => {
    switch (type) {
      case 'login': return <LogIn className="h-4 w-4" />
      case 'logout': return <LogOut className="h-4 w-4" />
      case 'create': return <Plus className="h-4 w-4" />
      case 'update': return <Edit className="h-4 w-4" />
      case 'delete': return <Trash2 className="h-4 w-4" />
      case 'view': return <Eye className="h-4 w-4" />
      case 'download': return <Download className="h-4 w-4" />
      case 'upload': return <Upload className="h-4 w-4" />
      default: return <Activity className="h-4 w-4" />
    }
  }

  const getActivityColor = (type) => {
    switch (type) {
      case 'login': return 'default'
      case 'logout': return 'secondary'
      case 'create': return 'default'
      case 'update': return 'outline'
      case 'delete': return 'destructive'
      case 'view': return 'outline'
      case 'download': return 'secondary'
      case 'upload': return 'secondary'
      default: return 'outline'
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedType === 'all' || activity.activity_type === selectedType
    return matchesSearch && matchesType
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">جاري تحميل البيانات...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* العنوان */}
      <div>
        <h1 className="text-3xl font-bold">سجل الأنشطة</h1>
        <p className="text-muted-foreground mt-2">
          عرض جميع أنشطة المستخدمين في المنصة
        </p>
      </div>

      {/* أدوات البحث والفلترة */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex-1 w-full md:w-auto">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="البحث في الأنشطة..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2 w-full md:w-auto">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="flex h-10 w-full md:w-[180px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              >
                <option value="all">جميع الأنواع</option>
                <option value="login">تسجيل دخول</option>
                <option value="logout">تسجيل خروج</option>
                <option value="create">إنشاء</option>
                <option value="update">تحديث</option>
                <option value="delete">حذف</option>
                <option value="view">عرض</option>
                <option value="download">تحميل</option>
                <option value="upload">رفع</option>
              </select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {filteredActivities.length === 0 ? (
              <div className="text-center py-12">
                <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">لا توجد أنشطة</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                      activity.activity_type === 'delete' ? 'bg-red-100' :
                      activity.activity_type === 'create' ? 'bg-green-100' :
                      activity.activity_type === 'update' ? 'bg-blue-100' :
                      'bg-gray-100'
                    }`}>
                      {getActivityIcon(activity.activity_type)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{activity.user_name}</h3>
                        <Badge variant={getActivityColor(activity.activity_type)}>
                          {activity.activity_type_display}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {activity.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{formatDate(activity.created_at)}</span>
                        <span>•</span>
                        <span>{activity.ip_address}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ActivityLogPage

