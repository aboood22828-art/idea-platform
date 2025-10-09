import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal,
  Calendar,
  DollarSign,
  FileText,
  Send,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react'
import { fetchInvoices } from '../store/slices/invoicesSlice'

const InvoicesPage = () => {
  const dispatch = useDispatch()
  const { invoices, loading, stats } = useSelector((state) => state.invoices)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    dispatch(fetchInvoices())
  }, [dispatch])

  const filteredInvoices = invoices.filter(invoice =>
    invoice.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.client_name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'outline'
      case 'sent': return 'default'
      case 'paid': return 'secondary'
      case 'overdue': return 'destructive'
      default: return 'outline'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'draft': return 'مسودة'
      case 'sent': return 'مرسلة'
      case 'paid': return 'مدفوعة'
      case 'overdue': return 'متأخرة'
      default: return 'غير محدد'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'draft': return <FileText className="h-4 w-4" />
      case 'sent': return <Send className="h-4 w-4" />
      case 'paid': return <CheckCircle className="h-4 w-4" />
      case 'overdue': return <AlertCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR'
    }).format(amount || 0)
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'غير محدد'
    return new Date(dateString).toLocaleDateString('ar-SA')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">الفواتير</h1>
          <p className="text-muted-foreground">
            إدارة الفواتير والمدفوعات
          </p>
        </div>
        <Button>
          <Plus className="ml-2 h-4 w-4" />
          فاتورة جديدة
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الفواتير</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الفواتير المدفوعة</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.paid}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الفواتير المعلقة</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الفواتير المتأخرة</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="البحث في الفواتير..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="ml-2 h-4 w-4" />
          تصفية
        </Button>
      </div>

      {/* Invoices List */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة الفواتير</CardTitle>
          <CardDescription>
            جميع الفواتير مع حالاتها وتواريخها
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground">جاري تحميل الفواتير...</div>
            </div>
          ) : filteredInvoices.length > 0 ? (
            <div className="space-y-4">
              {filteredInvoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-4 space-x-reverse">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted">
                      {getStatusIcon(invoice.status)}
                    </div>
                    <div>
                      <div className="font-medium">
                        فاتورة #{invoice.invoice_number || invoice.id}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {invoice.client_name || 'عميل غير محدد'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6 space-x-reverse">
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">المبلغ</div>
                      <div className="font-medium">
                        {formatCurrency(invoice.total_amount)}
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">تاريخ الإصدار</div>
                      <div className="font-medium">
                        {formatDate(invoice.issue_date)}
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">تاريخ الاستحقاق</div>
                      <div className="font-medium">
                        {formatDate(invoice.due_date)}
                      </div>
                    </div>
                    
                    <Badge variant={getStatusColor(invoice.status)}>
                      {getStatusText(invoice.status)}
                    </Badge>
                    
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-muted-foreground mb-4">لا توجد فواتير مطابقة للبحث</div>
              <Button>
                <Plus className="ml-2 h-4 w-4" />
                إنشاء فاتورة جديدة
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardContent className="flex items-center justify-center p-6">
            <div className="text-center">
              <Plus className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h3 className="font-medium">فاتورة جديدة</h3>
              <p className="text-sm text-muted-foreground">إنشاء فاتورة جديدة</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardContent className="flex items-center justify-center p-6">
            <div className="text-center">
              <Send className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h3 className="font-medium">إرسال تذكير</h3>
              <p className="text-sm text-muted-foreground">تذكير بالفواتير المعلقة</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardContent className="flex items-center justify-center p-6">
            <div className="text-center">
              <DollarSign className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h3 className="font-medium">تسجيل دفعة</h3>
              <p className="text-sm text-muted-foreground">تسجيل دفعة جديدة</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default InvoicesPage

