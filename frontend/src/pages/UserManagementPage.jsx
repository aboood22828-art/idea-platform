import { useState, useEffect } from 'react'
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
  BarChart3
} from 'lucide-react'

const UserManagementPage = () => {
  const [users, setUsers] = useState([])
  const [statistics, setStatistics] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedRole, setSelectedRole] = useState('all')

  useEffect(() => {
    fetchUsers()
    fetchStatistics()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      // هنا يجب استدعاء API الحقيقي
      // const response = await api.get('/api/auth/management/')
      // setUsers(response.data)
      
      // بيانات تجريبية للعرض
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
        {
          id: 2,
          email: 'manager@ideateam.com',
          full_name: 'أحمد محمد',
          role: 'manager',
          role_display: 'مدير',
          is_active: true,
          is_verified: true,
          created_at: '2024-02-10T10:00:00Z',
          last_login: '2024-10-13T15:20:00Z'
        },
        {
          id: 3,
          email: 'employee@ideateam.com',
          full_name: 'سارة أحمد',
          role: 'employee',
          role_display: 'موظف',
          is_active: true,
          is_verified: false,
          created_at: '2024-03-05T10:00:00Z',
          last_login: '2024-10-12T12:10:00Z'
        },
      ])
    } catch (error) {
      console.error('خطأ في جلب المستخدمين:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStatistics = async () => {
    try {
      // هنا يجب استدعاء API الحقيقي
      // const response = await api.get('/api/auth/management/statistics/')
      // setStatistics(response.data)
      
      // بيانات تجريبية للعرض
      setStatistics({
        total_users: 15,
        active_users: 12,
        inactive_users: 3,
        users_by_role: {
          admin: 2,
          manager: 3,
          employee: 7,
          client: 3
        }
      })
    } catch (error) {
      console.error('خطأ في جلب الإحصائيات:', error)
    }
  }

  const handleActivateUser = async (userId) => {
    try {
      // await api.post(`/api/auth/management/${userId}/activate/`)
      console.log('تفعيل المستخدم:', userId)
      fetchUsers()
    } catch (error) {
      console.error('خطأ في تفعيل المستخدم:', error)
    }
  }

  const handleDeactivateUser = async (userId) => {
    try {
      // await api.post(`/api/auth/management/${userId}/deactivate/`)
      console.log('تعطيل المستخدم:', userId)
      fetchUsers()
    } catch (error) {
      console.error('خطأ في تعطيل المستخدم:', error)
    }
  }

  const handleDeleteUser = async (userId) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
      try {
        // await api.delete(`/api/auth/management/${userId}/`)
        console.log('حذف المستخدم:', userId)
        fetchUsers()
      } catch (error) {
        console.error('خطأ في حذف المستخدم:', error)
      }
    }
  }

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin': return 'destructive'
      case 'manager': return 'default'
      case 'employee': return 'secondary'
      case 'client': return 'outline'
      default: return 'outline'
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = selectedRole === 'all' || user.role === selectedRole
    return matchesSearch && matchesRole
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
        <h1 className="text-3xl font-bold">إدارة المستخدمين</h1>
        <p className="text-muted-foreground mt-2">
          إدارة حسابات المستخدمين والصلاحيات
        </p>
      </div>

      {/* الإحصائيات */}
      {statistics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي المستخدمين</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.total_users}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">المستخدمون النشطون</CardTitle>
              <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{statistics.active_users}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">المستخدمون غير النشطين</CardTitle>
              <UserX className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{statistics.inactive_users}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">المديرون</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.users_by_role.admin + statistics.users_by_role.manager}</div>
            </CardContent>
          </Card>
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
                <p className="text-muted-foreground">لا توجد مستخدمين</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{user.full_name}</h3>
                          {user.is_verified && (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge variant={getRoleBadgeColor(user.role)}>
                        {user.role_display}
                      </Badge>
                      
                      <Badge variant={user.is_active ? 'secondary' : 'outline'}>
                        {user.is_active ? 'نشط' : 'غير نشط'}
                      </Badge>

                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        {user.is_active ? (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeactivateUser(user.id)}
                          >
                            <XCircle className="h-4 w-4 text-orange-600" />
                          </Button>
                        ) : (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleActivateUser(user.id)}
                          >
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </Button>
                        )}
                        
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
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

export default UserManagementPage

