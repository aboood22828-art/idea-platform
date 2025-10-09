import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  CheckCircle, 
  Users, 
  Briefcase, 
  TrendingUp, 
  Shield,
  Zap,
  Globe,
  Star,
  Phone,
  Mail,
  MapPin
} from 'lucide-react'
import ideaLogo from '../assets/idea-logo.jpeg'

const LandingPage = () => {
  const features = [
    {
      icon: <Briefcase className="h-8 w-8 text-primary" />,
      title: "إدارة المشاريع",
      description: "نظام شامل لإدارة المشاريع من البداية حتى التسليم مع تتبع التقدم والمهام"
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: "إدارة العملاء",
      description: "نظام CRM متقدم لإدارة العملاء والعملاء المحتملين مع تتبع التفاعلات"
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-primary" />,
      title: "التقارير والتحليلات",
      description: "تقارير مفصلة وتحليلات ذكية لمساعدتك في اتخاذ القرارات الصحيحة"
    },
    {
      icon: <Shield className="h-8 w-8 text-primary" />,
      title: "الأمان والحماية",
      description: "أعلى معايير الأمان لحماية بياناتك مع نظام صلاحيات متقدم"
    },
    {
      icon: <Zap className="h-8 w-8 text-primary" />,
      title: "سرعة الأداء",
      description: "منصة سريعة ومتجاوبة تعمل بكفاءة عالية على جميع الأجهزة"
    },
    {
      icon: <Globe className="h-8 w-8 text-primary" />,
      title: "الوصول من أي مكان",
      description: "منصة سحابية تتيح لك الوصول لبياناتك من أي مكان وفي أي وقت"
    }
  ]

  const services = [
    "استراتيجيات التسويق الرقمي",
    "تطوير الهوية التجارية",
    "إدارة وسائل التواصل الاجتماعي",
    "تطوير المواقع الإلكترونية",
    "إنتاج المحتوى الإبداعي",
    "الاستشارات التسويقية"
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 space-x-reverse">
              <img src={ideaLogo} alt="شعار أيديا" className="h-12 w-auto" />
              <div>
                <h1 className="text-2xl font-bold text-primary">أيديا للاستشارات</h1>
                <p className="text-sm text-muted-foreground">والحلول التسويقية</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center space-x-6 space-x-reverse">
              <a href="#features" className="text-foreground hover:text-primary transition-colors">المميزات</a>
              <a href="#services" className="text-foreground hover:text-primary transition-colors">الخدمات</a>
              <a href="#contact" className="text-foreground hover:text-primary transition-colors">اتصل بنا</a>
              <Link to="/login">
                <Button>
                  دخول النظام
                  <ArrowLeft className="mr-2 h-4 w-4" />
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <Badge variant="secondary" className="mb-4">
            منصة أيديا المتكاملة
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            منصة شاملة لإدارة
            <br />
            المشاريع والعملاء
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            نظام متكامل يجمع إدارة المشاريع وعلاقات العملاء والفواتير في مكان واحد، 
            مصمم خصيصاً لشركات الاستشارات والحلول التسويقية
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login">
              <Button size="lg" className="w-full sm:w-auto">
                ابدأ الآن
                <ArrowLeft className="mr-2 h-5 w-5" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              تعرف على المزيد
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-muted/50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">مميزات المنصة</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              منصة شاملة تضم جميع الأدوات التي تحتاجها لإدارة أعمالك بكفاءة وفعالية
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="mb-4">{feature.icon}</div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">خدماتنا</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              نقدم مجموعة شاملة من الخدمات التسويقية والاستشارية لمساعدة أعمالك على النمو
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <CheckCircle className="h-8 w-8 text-primary mx-auto mb-4" />
                  <h3 className="text-lg font-semibold">{service}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">100+</div>
              <div className="text-primary-foreground/80">مشروع مكتمل</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50+</div>
              <div className="text-primary-foreground/80">عميل راضي</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">5+</div>
              <div className="text-primary-foreground/80">سنوات خبرة</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-primary-foreground/80">دعم فني</div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">تواصل معنا</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              نحن هنا لمساعدتك في تحقيق أهدافك التسويقية والنمو بأعمالك
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardContent className="pt-6">
                <Phone className="h-8 w-8 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">الهاتف</h3>
                <p className="text-muted-foreground">+966 50 123 4567</p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="pt-6">
                <Mail className="h-8 w-8 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">البريد الإلكتروني</h3>
                <p className="text-muted-foreground">info@ideateam.com</p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="pt-6">
                <MapPin className="h-8 w-8 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">العنوان</h3>
                <p className="text-muted-foreground">الرياض، المملكة العربية السعودية</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted py-12 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-4 space-x-reverse mb-4 md:mb-0">
              <img src={ideaLogo} alt="شعار أيديا" className="h-8 w-auto" />
              <div>
                <h3 className="font-bold">أيديا للاستشارات والحلول التسويقية</h3>
                <p className="text-sm text-muted-foreground">منصة متكاملة لإدارة الأعمال</p>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              © 2024 جميع الحقوق محفوظة لشركة أيديا
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage

