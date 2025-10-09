import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  Briefcase,
  Users,
  FileText,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Calendar,
  Plus,
} from 'lucide-react'
import { fetchProjects } from '../store/slices/projectsSlice'
import { fetchClients } from '../store/slices/clientsSlice'
import { fetchInvoices } from '../store/slices/invoicesSlice'

const Dashboard = () => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { projects } = useSelector((state) => state.projects)
  const { clients, leads } = useSelector((state) => state.clients)
  const { invoices, stats } = useSelector((state) => state.invoices)

  useEffect(() => {
    // Fetch dashboard data
    dispatch(fetchProjects({ limit: 5 }))
    dispatch(fetchClients({ limit: 5 }))
    dispatch(fetchInvoices({ limit: 5 }))
  }, [dispatch])

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'صباح الخير'
    if (hour < 17) return 'مساء الخير'
    return 'مساء الخير'
  }

  const stats_cards = [
    {
      title: 'إجمالي المشاريع',
      value: projects.length,
      description: 'مشروع نشط',
      icon: Briefcase,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'العملاء',
      value: clients.length,
      description: 'عميل نشط',
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'الفواتير',
      value: invoices.length,
      description: 'فاتورة هذا الشهر',
      icon: FileText,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'العملاء المحتملون',
      value: leads.length,
      description: 'عميل محتمل جديد',
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ]

  const recentProjects = projects.slice(0, 3)
  const recentClients = clients.slice(0, 3)

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {getGreeting()}، {user?.first_name}!
          </h1>
          <p className="text-muted-foreground">
            إليك نظرة عامة على أنشطة اليوم
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button>
            <Plus className="ml-2 h-4 w-4" />
            مشروع جديد
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats_cards.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Projects */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Briefcase className="ml-2 h-5 w-5" />
              المشاريع الحديثة
            </CardTitle>
            <CardDescription>
              آخر المشاريع التي تم العمل عليها
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentProjects.length > 0 ? (
              recentProjects.map((project) => (
                <div key={project.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{project.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {project.client_name}
                    </p>
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span>التقدم</span>
                        <span>{project.progress || 0}%</span>
                      </div>
                      <Progress value={project.progress || 0} className="h-2" />
                    </div>
                  </div>
                  <Badge
                    variant={
                      project.status === 'active' ? 'default' :
                      project.status === 'completed' ? 'secondary' :
                      'outline'
                    }
                  >
                    {project.status === 'active' ? 'نشط' :
                     project.status === 'completed' ? 'مكتمل' :
                     project.status === 'on_hold' ? 'معلق' : 'مسودة'}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                لا توجد مشاريع حديثة
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Clients */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="ml-2 h-5 w-5" />
              العملاء الجدد
            </CardTitle>
            <CardDescription>
              آخر العملاء المضافين للنظام
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentClients.length > 0 ? (
              recentClients.map((client) => (
                <div key={client.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{client.company_name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {client.first_name} {client.last_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {client.email}
                    </p>
                  </div>
                  <Badge
                    variant={
                      client.status === 'active' ? 'default' : 'secondary'
                    }
                  >
                    {client.status === 'active' ? 'نشط' : 'غير نشط'}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                لا توجد عملاء جدد
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>إجراءات سريعة</CardTitle>
          <CardDescription>
            الإجراءات الأكثر استخداماً في النظام
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="h-20 flex-col">
              <Plus className="h-6 w-6 mb-2" />
              مشروع جديد
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Users className="h-6 w-6 mb-2" />
              عميل جديد
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <FileText className="h-6 w-6 mb-2" />
              فاتورة جديدة
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Calendar className="h-6 w-6 mb-2" />
              جدولة اجتماع
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tasks & Notifications */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="ml-2 h-5 w-5" />
              المهام المعلقة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-3 space-x-reverse">
              <AlertCircle className="h-4 w-4 text-orange-500" />
              <div className="flex-1">
                <p className="text-sm font-medium">مراجعة تصميم الموقع</p>
                <p className="text-xs text-muted-foreground">مشروع شركة التقنية</p>
              </div>
              <Badge variant="outline">عاجل</Badge>
            </div>
            <div className="flex items-center space-x-3 space-x-reverse">
              <Clock className="h-4 w-4 text-blue-500" />
              <div className="flex-1">
                <p className="text-sm font-medium">إرسال العرض التسويقي</p>
                <p className="text-xs text-muted-foreground">عميل محتمل جديد</p>
              </div>
              <Badge variant="secondary">اليوم</Badge>
            </div>
            <div className="flex items-center space-x-3 space-x-reverse">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div className="flex-1">
                <p className="text-sm font-medium">اجتماع فريق التطوير</p>
                <p className="text-xs text-muted-foreground">مكتمل</p>
              </div>
              <Badge variant="outline">مكتمل</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="ml-2 h-5 w-5" />
              الملخص المالي
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">الإيرادات هذا الشهر</span>
              <span className="font-bold text-green-600">150,000 ر.س</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">الفواتير المعلقة</span>
              <span className="font-bold text-orange-600">45,000 ر.س</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">المصروفات</span>
              <span className="font-bold text-red-600">25,000 ر.س</span>
            </div>
            <div className="border-t pt-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">صافي الربح</span>
                <span className="font-bold text-primary">125,000 ر.س</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Dashboard

