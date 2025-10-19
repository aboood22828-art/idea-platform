import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Mail,
  Phone,
  Building,
  Users,
  TrendingUp,
  UserCheck,
  AlertCircle // Added for error messages
} from 'lucide-react';
import { fetchClients, fetchLeads } from '../store/slices/clientsSlice';

const ClientsPage = () => {
  const dispatch = useDispatch();
  const { clients, leads, loading, error: clientsError } = useSelector((state) => state.clients);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const resetMessages = () => {
    setError(null);
    setSuccessMessage(null);
  };

  const memoizedFetchClients = useCallback(() => {
    dispatch(fetchClients());
  }, [dispatch]);

  const memoizedFetchLeads = useCallback(() => {
    dispatch(fetchLeads());
  }, [dispatch]);

  useEffect(() => {
    resetMessages();
    memoizedFetchClients();
    memoizedFetchLeads();
  }, [memoizedFetchClients, memoizedFetchLeads]);

  useEffect(() => {
    if (clientsError) {
      setError(`خطأ في جلب البيانات: ${clientsError}`);
    }
  }, [clientsError]);

  const filteredClients = useMemo(() => {
    return clients.filter(client =>
      client.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.last_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [clients, searchTerm]);

  const filteredLeads = useMemo(() => {
    return leads.filter(lead =>
      lead.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.last_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [leads, searchTerm]);

  const getStatusColor = useCallback((status) => {
    switch (status) {
      case 'active': return 'default';
      case 'inactive': return 'secondary';
      default: return 'outline';
    }
  }, []);

  const getStatusText = useCallback((status) => {
    switch (status) {
      case 'active': return 'نشط';
      case 'inactive': return 'غير نشط';
      default: return 'غير محدد';
    }
  }, []);

  const getLeadStatusColor = useCallback((status) => {
    switch (status) {
      case 'new': return 'default';
      case 'contacted': return 'secondary';
      case 'qualified': return 'outline';
      case 'converted': return 'default';
      default: return 'outline';
    }
  }, []);

  const getLeadStatusText = useCallback((status) => {
    switch (status) {
      case 'new': return 'جديد';
      case 'contacted': return 'تم التواصل';
      case 'qualified': return 'مؤهل';
      case 'converted': return 'تم التحويل';
      default: return 'غير محدد';
    }
  }, []);

  // Placeholder for future actions like adding client/lead
  const handleAddClient = () => {
    resetMessages();
    setSuccessMessage('تم فتح نموذج إضافة عميل جديد (هذه ميزة وهمية)');
    // Actual logic to open a modal or navigate to a form
  };

  const handleAddLead = () => {
    resetMessages();
    setSuccessMessage('تم فتح نموذج إضافة عميل محتمل جديد (هذه ميزة وهمية)');
    // Actual logic to open a modal or navigate to a form
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">العملاء</h1>
          <p className="text-muted-foreground">
            إدارة العملاء والعملاء المحتملين
          </p>
        </div>
        <div className="flex gap-2 mt-4 sm:mt-0">
          <Button variant="outline" onClick={handleAddLead}>
            <Plus className="ml-2 h-4 w-4" />
            عميل محتمل
          </Button>
          <Button onClick={handleAddClient}>
            <Plus className="ml-2 h-4 w-4" />
            عميل جديد
          </Button>
        </div>
      </div>

      {/* Error and Success Messages */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">خطأ! </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">نجاح! </strong>
          <span className="block sm:inline">{successMessage}</span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي العملاء</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : clients.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">العملاء النشطون</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : clients.filter(c => c.status === 'active').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">العملاء المحتملون</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : leads.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">معدل التحويل</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : '75%'}</div> {/* Placeholder for dynamic calculation */}
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="البحث في العملاء..."
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

      {/* Tabs */}
      <Tabs defaultValue="clients" className="space-y-4">
        <TabsList>
          <TabsTrigger value="clients">العملاء الحاليون</TabsTrigger>
          <TabsTrigger value="leads">العملاء المحتملون</TabsTrigger>
        </TabsList>

        {/* Current Clients */}
        <TabsContent value="clients" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              <div className="col-span-full text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <div className="text-muted-foreground">جاري تحميل العملاء...</div>
              </div>
            ) : filteredClients.length > 0 ? (
              filteredClients.map((client) => (
                <Card key={client.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-1">{client.company_name}</CardTitle>
                        <CardDescription>
                          {client.first_name} {client.last_name}
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <Badge variant={getStatusColor(client.status)}>
                          {getStatusText(client.status)}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Mail className="h-4 w-4 ml-2" />
                      <span>{client.email}</span>
                    </div>
                    
                    {client.phone && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Phone className="h-4 w-4 ml-2" />
                        <span>{client.phone}</span>
                      </div>
                    )}
                    
                    {client.industry && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Building className="h-4 w-4 ml-2" />
                        <span>{client.industry}</span>
                      </div>
                    )}
                    
                    <div className="pt-2 flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        عرض التفاصيل
                      </Button>
                      <Button size="sm" className="flex-1">
                        تواصل
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="text-muted-foreground mb-4">لا توجد عملاء مطابقون للبحث</div>
                <Button onClick={handleAddClient}>
                  <Plus className="ml-2 h-4 w-4" />
                  إضافة عميل جديد
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Potential Clients (Leads) */}
        <TabsContent value="leads" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              <div className="col-span-full text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <div className="text-muted-foreground">جاري تحميل العملاء المحتملين...</div>
              </div>
            ) : filteredLeads.length > 0 ? (
              filteredLeads.map((lead) => (
                <Card key={lead.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-1">{lead.company_name}</CardTitle>
                        <CardDescription>
                          {lead.first_name} {lead.last_name}
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <Badge variant={getLeadStatusColor(lead.status)}>
                          {getLeadStatusText(lead.status)}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Mail className="h-4 w-4 ml-2" />
                      <span>{lead.email}</span>
                    </div>
                    
                    {lead.phone && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Phone className="h-4 w-4 ml-2" />
                        <span>{lead.phone}</span>
                      </div>
                    )}
                    
                    {lead.source && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">المصدر: </span>
                        <span>{lead.source}</span>
                      </div>
                    )}
                    
                    <div className="pt-2 flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        تحويل لعميل
                      </Button>
                      <Button size="sm" className="flex-1">
                        متابعة
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="text-muted-foreground mb-4">لا توجد عملاء محتملون مطابقون للبحث</div>
                <Button onClick={handleAddLead}>
                  <Plus className="ml-2 h-4 w-4" />
                  إضافة عميل محتمل
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientsPage;

