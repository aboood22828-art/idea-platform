import { useState, useEffect, useCallback, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Users, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle,
  UserCheck,
  UserX,
  BarChart3,
  AlertCircle,
  Loader2
} from 'lucide-react'
import api from '../utils/api'

const UserManagementPage = () => {
  const [users, setUsers] = useState([])
  const [statistics, setStatistics] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)
  const [selectedRole, setSelectedRole] = useState('all')
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)

  // جلب المستخدمين والإحصائيات عند تحميل الصفحة
  useEffect(() => {
    loadData()
  }, [])

  // إغلاق رسائل النجاح والأخطاء تلقائيًا
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
      await Promise.all([fetchUsers(), fetchStatistics()])
    } catch (err) {
      setError('فشل في تحميل البيانات. يرجى المحاولة لاحقًا.')
      console.error('خطأ في تحميل البيانات:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchUsers = useCallback(async () => {
    try {
      const response = await api.get('/api/users/users/')
      setUsers(response.data || [])
    } catch (error) {
      console.error('خطأ في جلب المستخدمين:', error)
      // في حالة الفشل، استخدم بيانات تجريبية للعرض
      setUsers([
        {
          id: 1,
          email: 'admin@ideateam.com',
          full_name: 'مدير النظام',
          role: 'admin',
          role_display: 'مدير النظام',
          is_active: true,
          is_verified: true,
          created_at: '2024-01-15T10:00:00Z',
          last_login: '2024-10-14T08:30:00Z'
        },
      ])
      throw error
    }
  }, [])

  const fetchStatistics = useCallback(async () => {
    try {
      const response = await api.get('/api/users/users/statistics/')
      setStatistics(response.data)
    } catch (error) {
      console.error('خطأ في جلب الإحصائيات:', error)
      // في حالة الفشل، استخدم بيانات تجريبية للعرض
      setStatistics({
        total_users: users.length,
        active_users: users.filter(u => u.is_active).length,
        inactive_users: users.filter(u => !u.is_active).length,
        users_by_role: {
          admin: users.filter(u => u.role === 'admin').length,
          manager: users.filter(u => u.role === 'manager').length,
          employee: users.filter(u => u.role === 'employee').length,
          client: users.filter(u => u.role === 'client').length
        }
      })
      throw error
    }
  }, [users.length])

  const handleActivateUser = useCallback(async (userId) => {
    if (!window.confirm('هل أنت متأكد من تفعيل هذا المستخدم؟')) {
      return
    }

    try {
      setActionLoading(userId)
      setError(null)
      await api.post(`/api/users/users/${userId}/activate/`)
      setSuccessMessage('تم تفعيل المستخدم بنجاح')
      await fetchUsers()
    } catch (error) {
      console.error('خطأ في تفعيل المستخدم:', error)
      setError(error.response?.data?.detail || 'فشل في تفعيل المستخدم')
    } finally {
      setActionLoading(null)
    }
  }, [fetchUsers])

  const handleDeactivateUser = useCallback(async (userId) => {
    if (!window.confirm('هل أنت متأكد من تعطيل هذا المستخدم؟')) {
      return
    }

    try {
      setActionLoading(userId)
      setError(null)
      await api.post(`/api/users/users/${userId}/deactivate/`)
      setSuccessMessage('تم تعطيل المستخدم بنجاح')
      await fetchUsers()
    } catch (error) {
      console.error('خطأ في تعطيل المستخدم:', error)
      setError(error.response?.data?.detail || 'فشل في تعطيل المستخدم')
    } finally {
      setActionLoading(null)
    }
  }, [fetchUsers])

  const handleDeleteUser = useCallback(async (userId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المستخدم؟ لا يمكن التراجع عن هذا الإجراء.')) {
      return
    }

    try {
      setActionLoading(userId)
      setError(null)
      await api.delete(`/api/users/users/${userId}/`)
      setSuccessMessage('تم حذف المستخدم بنجاح')
      await fetchUsers()
    } catch (error) {
      console.error('خطأ في حذف المستخدم:', error)
      setError(error.response?.data?.detail || 'فشل في حذف المستخدم')
    } finally {
      setActionLoading(null)
    }
  }, [fetchUsers])

  const getRoleBadgeColor = useCallback((role) => {
    switch (role) {
      case 'admin': return 'destructive'
      case 'manager': return 'default'
      case 'employee': return 'secondary'
      case 'client': return 'outline'
      default: return 'outline'
    }
  }, [])

  const getRoleDisplay = useCallback((role) => {
    switch (role) {
      case 'admin': return 'مدير النظام'
      case 'manager': return 'مدير'
      case 'employee': return 'موظف'
      case 'client': return 'عميل'
      default: return role
    }
  }, [])

  // تصفية المستخدمين بناءً على البحث والدور
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesRole = selectedRole === 'all' || user.role === selectedRole
      return matchesSearch && matchesRole
    })
  }, [users, searchTerm, selectedRole])

  // مكون بطاقة الإحصائيات
  const StatCard = ({ icon: Icon, title, value, color }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${color}`}>{value}</div>
      </CardContent>
    </Card>
  )

  // مكون صف المستخدم
  const UserRow = ({ user }) => (
    <div
      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
    >
      <div className="flex items-center gap-4 flex-1">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-sm font-semibold text-primary">
            {user.full_name?.charAt(0)}
          </span>
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-medium">{user.full_name}</h3>
            {user.is_verified && (
              <CheckCircle className="h-4 w-4 text-green-600" title="مُتحقق" />
            )}
          </div>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Badge variant={getRoleBadgeColor(user.role)}>
          {getRoleDisplay(user.role)}
        </Badge>
        
        <Badge variant={user.is_active ? 'secondary' : 'outline'}>
          {user.is_active ? 'نشط' : 'غير نشط'}
        </Badge>

        <div className="flex gap-1">
          <Button variant="ghost" size="sm" title="تعديل">
            <Edit className="h-4 w-4" />
          </Button>
          
          {user.is_active ? (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => handleDeactivateUser(user.id)}
              disabled={actionLoading === user.id}
              title="تعطيل"
            >
              {actionLoading === user.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <XCircle className="h-4 w-4 text-orange-600" />
              )}
            </Button>
          ) : (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => handleActivateUser(user.id)}
              disabled={actionLoading === user.id}
              title="تفعيل"
            >
              {actionLoading === user.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4 text-green-600" />
              )}
            </Button>
          )}
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => handleDeleteUser(user.id)}
            disabled={actionLoading === user.id}
            title="حذف"
          >
            {actionLoading === user.id ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4 text-red-600" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">جاري تحميل البيانات...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* العنوان */}
      <div>
        <h1 className="text-3xl font-bold">إدارة المستخدمين</h1>
        <p className="text-muted-foreground mt-2">
          إدارة حسابات المستخدمين والصلاحيات
        </p>
      </div>

      {/* رسائل الأخطاء والنجاح */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900">خطأ</h3>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-green-900">نجح</h3>
            <p className="text-sm text-green-700">{successMessage}</p>
          </div>
        </div>
      )}

      {/* الإحصائيات */}
      {statistics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard 
            icon={Users}
            title="إجمالي المستخدمين"
            value={statistics.total_users}
            color="text-blue-600"
          />

          <StatCard 
            icon={UserCheck}
            title="المستخدمون النشطون"
            value={statistics.active_users}
            color="text-green-600"
          />

          <StatCard 
            icon={UserX}
            title="المستخدمون غير النشطين"
            value={statistics.inactive_users}
            color="text-red-600"
          />

          <StatCard 
            icon={BarChart3}
            title="المديرون"
            value={(statistics.users_by_role?.admin || 0) + (statistics.users_by_role?.manager || 0)}
            color="text-purple-600"
          />
        </div>
      )}

      {/* أدوات البحث والفلترة */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex-1 w-full md:w-auto">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="البحث عن مستخدم..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2 w-full md:w-auto">
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="flex h-10 w-full md:w-[180px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              >
                <option value="all">جميع الأدوار</option>
                <option value="admin">مدير النظام</option>
                <option value="manager">مدير</option>
                <option value="employee">موظف</option>
                <option value="client">عميل</option>
              </select>
              
              <Button>
                <Plus className="h-4 w-4 ml-2" />
                مستخدم جديد
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {users.length === 0 ? 'لا توجد مستخدمين' : 'لا توجد نتائج للبحث'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredUsers.map((user) => (
                  <UserRow key={user.id} user={user} />
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default UserManagementPage

