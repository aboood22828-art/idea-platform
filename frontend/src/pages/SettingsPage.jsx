import { useState } from 'react'
import { useSelector } from 'react-redux'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe,
  Save,
  Upload,
  Key,
  Mail,
  Phone
} from 'lucide-react'

const SettingsPage = () => {
  const { user } = useSelector((state) => state.auth)
  const [profileData, setProfileData] = useState({
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    company: user?.company || '',
    position: user?.position || ''
  })

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    projectUpdates: true,
    invoiceReminders: true,
    systemAlerts: false
  })

  const [security, setSecurity] = useState({
    twoFactorAuth: false,
    sessionTimeout: '30',
    loginAlerts: true
  })

  const handleProfileChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleNotificationChange = (field, value) => {
    setNotifications(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSecurityChange = (field, value) => {
    setSecurity(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const getUserInitials = () => {
    if (profileData.firstName && profileData.lastName) {
      return `${profileData.firstName.charAt(0)}${profileData.lastName.charAt(0)}`
    }
    return profileData.email?.charAt(0).toUpperCase() || 'U'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">الإعدادات</h1>
        <p className="text-muted-foreground">
          إدارة إعدادات حسابك وتفضيلاتك
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">الملف الشخصي</TabsTrigger>
          <TabsTrigger value="notifications">الإشعارات</TabsTrigger>
          <TabsTrigger value="security">الأمان</TabsTrigger>
          <TabsTrigger value="appearance">المظهر</TabsTrigger>
        </TabsList>

        {/* Profile Settings */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="ml-2 h-5 w-5" />
                المعلومات الشخصية
              </CardTitle>
              <CardDescription>
                تحديث معلوماتك الشخصية وبيانات الاتصال
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Picture */}
              <div className="flex items-center space-x-4 space-x-reverse">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="text-lg">{getUserInitials()}</AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" size="sm">
                    <Upload className="ml-2 h-4 w-4" />
                    تغيير الصورة
                  </Button>
                  <p className="text-sm text-muted-foreground mt-2">
                    JPG, PNG أو GIF. الحد الأقصى 2MB
                  </p>
                </div>
              </div>

              {/* Personal Information */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">الاسم الأول</Label>
                  <Input
                    id="firstName"
                    value={profileData.firstName}
                    onChange={(e) => handleProfileChange('firstName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">الاسم الأخير</Label>
                  <Input
                    id="lastName"
                    value={profileData.lastName}
                    onChange={(e) => handleProfileChange('lastName', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">البريد الإلكتروني</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => handleProfileChange('email', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">رقم الهاتف</Label>
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => handleProfileChange('phone', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="company">الشركة</Label>
                  <Input
                    id="company"
                    value={profileData.company}
                    onChange={(e) => handleProfileChange('company', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position">المنصب</Label>
                  <Input
                    id="position"
                    value={profileData.position}
                    onChange={(e) => handleProfileChange('position', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">نبذة شخصية</Label>
                <Textarea
                  id="bio"
                  placeholder="اكتب نبذة مختصرة عنك..."
                  value={profileData.bio}
                  onChange={(e) => handleProfileChange('bio', e.target.value)}
                />
              </div>

              <Button>
                <Save className="ml-2 h-4 w-4" />
                حفظ التغييرات
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="ml-2 h-5 w-5" />
                إعدادات الإشعارات
              </CardTitle>
              <CardDescription>
                تخصيص الإشعارات التي تريد تلقيها
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>إشعارات البريد الإلكتروني</Label>
                  <p className="text-sm text-muted-foreground">
                    تلقي الإشعارات عبر البريد الإلكتروني
                  </p>
                </div>
                <Switch
                  checked={notifications.emailNotifications}
                  onCheckedChange={(checked) => handleNotificationChange('emailNotifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>الإشعارات الفورية</Label>
                  <p className="text-sm text-muted-foreground">
                    تلقي الإشعارات الفورية في المتصفح
                  </p>
                </div>
                <Switch
                  checked={notifications.pushNotifications}
                  onCheckedChange={(checked) => handleNotificationChange('pushNotifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>تحديثات المشاريع</Label>
                  <p className="text-sm text-muted-foreground">
                    إشعارات عند تحديث حالة المشاريع
                  </p>
                </div>
                <Switch
                  checked={notifications.projectUpdates}
                  onCheckedChange={(checked) => handleNotificationChange('projectUpdates', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>تذكير الفواتير</Label>
                  <p className="text-sm text-muted-foreground">
                    تذكير بالفواتير المستحقة
                  </p>
                </div>
                <Switch
                  checked={notifications.invoiceReminders}
                  onCheckedChange={(checked) => handleNotificationChange('invoiceReminders', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>تنبيهات النظام</Label>
                  <p className="text-sm text-muted-foreground">
                    تنبيهات حول صيانة النظام والتحديثات
                  </p>
                </div>
                <Switch
                  checked={notifications.systemAlerts}
                  onCheckedChange={(checked) => handleNotificationChange('systemAlerts', checked)}
                />
              </div>

              <Button>
                <Save className="ml-2 h-4 w-4" />
                حفظ الإعدادات
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="ml-2 h-5 w-5" />
                إعدادات الأمان
              </CardTitle>
              <CardDescription>
                إدارة أمان حسابك وكلمات المرور
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>المصادقة الثنائية</Label>
                  <p className="text-sm text-muted-foreground">
                    تفعيل طبقة حماية إضافية لحسابك
                  </p>
                </div>
                <Switch
                  checked={security.twoFactorAuth}
                  onCheckedChange={(checked) => handleSecurityChange('twoFactorAuth', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>تنبيهات تسجيل الدخول</Label>
                  <p className="text-sm text-muted-foreground">
                    إشعار عند تسجيل الدخول من جهاز جديد
                  </p>
                </div>
                <Switch
                  checked={security.loginAlerts}
                  onCheckedChange={(checked) => handleSecurityChange('loginAlerts', checked)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sessionTimeout">انتهاء الجلسة (بالدقائق)</Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  value={security.sessionTimeout}
                  onChange={(e) => handleSecurityChange('sessionTimeout', e.target.value)}
                />
              </div>

              <div className="space-y-4">
                <Button variant="outline" className="w-full">
                  <Key className="ml-2 h-4 w-4" />
                  تغيير كلمة المرور
                </Button>
                
                <Button variant="outline" className="w-full">
                  <Mail className="ml-2 h-4 w-4" />
                  تحديث البريد الإلكتروني
                </Button>
              </div>

              <Button>
                <Save className="ml-2 h-4 w-4" />
                حفظ إعدادات الأمان
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Palette className="ml-2 h-5 w-5" />
                إعدادات المظهر
              </CardTitle>
              <CardDescription>
                تخصيص مظهر التطبيق وتفضيلاتك
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>المظهر</Label>
                <div className="grid grid-cols-3 gap-4">
                  <Card className="cursor-pointer border-2 border-primary">
                    <CardContent className="flex items-center justify-center p-4">
                      <div className="text-center">
                        <div className="w-8 h-8 bg-background border rounded mx-auto mb-2"></div>
                        <p className="text-sm">فاتح</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="cursor-pointer">
                    <CardContent className="flex items-center justify-center p-4">
                      <div className="text-center">
                        <div className="w-8 h-8 bg-foreground rounded mx-auto mb-2"></div>
                        <p className="text-sm">داكن</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="cursor-pointer">
                    <CardContent className="flex items-center justify-center p-4">
                      <div className="text-center">
                        <div className="w-8 h-8 bg-gradient-to-r from-background to-foreground rounded mx-auto mb-2"></div>
                        <p className="text-sm">تلقائي</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="space-y-2">
                <Label>اللغة</Label>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span>العربية (افتراضي)</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>حجم الخط</Label>
                <div className="grid grid-cols-3 gap-4">
                  <Button variant="outline" size="sm">صغير</Button>
                  <Button variant="default" size="sm">متوسط</Button>
                  <Button variant="outline" size="sm">كبير</Button>
                </div>
              </div>

              <Button>
                <Save className="ml-2 h-4 w-4" />
                حفظ إعدادات المظهر
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default SettingsPage

