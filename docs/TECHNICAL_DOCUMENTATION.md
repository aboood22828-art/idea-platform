# الوثائق التقنية - منصة أيديا المتكاملة

## جدول المحتويات

1. [نظرة عامة على البنية التقنية](#نظرة-عامة-على-البنية-التقنية)
2. [الواجهة الخلفية (Django Backend)](#الواجهة-الخلفية-django-backend)
3. [الواجهة الأمامية (React Frontend)](#الواجهة-الأمامية-react-frontend)
4. [قاعدة البيانات والنماذج](#قاعدة-البيانات-والنماذج)
5. [APIs والخدمات](#apis-والخدمات)
6. [الأمان والمصادقة](#الأمان-والمصادقة)
7. [النشر والبنية التحتية](#النشر-والبنية-التحتية)
8. [المراقبة والصيانة](#المراقبة-والصيانة)

---

## نظرة عامة على البنية التقنية

### الهندسة المعمارية

منصة أيديا المتكاملة تتبع نمط **Microservices Architecture** مع فصل واضح بين الواجهة الأمامية والخلفية:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Client  │    │  Nginx Proxy    │    │ Django Backend  │
│   (Frontend)    │◄──►│  Load Balancer  │◄──►│   (API Server)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                       ┌─────────────────┐             │
                       │   PostgreSQL    │◄────────────┘
                       │   Database      │
                       └─────────────────┘
                                │
                       ┌─────────────────┐
                       │     Redis       │
                       │  Cache & Queue  │
                       └─────────────────┘
                                │
                       ┌─────────────────┐
                       │     Celery      │
                       │ Background Jobs │
                       └─────────────────┘
```

### المكونات الأساسية

#### 1. الواجهة الأمامية (Frontend)
- **React 18+** مع **TypeScript** للأمان والكفاءة
- **Vite** كأداة بناء سريعة ومحسنة
- **Redux Toolkit** لإدارة الحالة العامة
- **Tailwind CSS** و **shadcn/ui** للتصميم المتجاوب
- **React Router** للتنقل بين الصفحات
- **Axios** للتفاعل مع APIs

#### 2. الواجهة الخلفية (Backend)
- **Django 4.2+** كإطار عمل رئيسي
- **Django REST Framework** لبناء APIs RESTful
- **PostgreSQL** كقاعدة بيانات رئيسية
- **Redis** للتخزين المؤقت والطوابير
- **Celery** للمهام الخلفية والمجدولة
- **JWT** للمصادقة الآمنة

#### 3. البنية التحتية
- **Docker** و **Docker Compose** للحاويات
- **Nginx** كخادم ويب و reverse proxy
- **Gunicorn** كخادم WSGI للإنتاج

---

## الواجهة الخلفية (Django Backend)

### هيكل التطبيقات

```
backend/
├── idea_platform/          # إعدادات المشروع الرئيسية
│   ├── settings.py         # إعدادات Django
│   ├── urls.py            # توجيه URLs الرئيسية
│   ├── wsgi.py            # إعداد WSGI للإنتاج
│   └── celery.py          # إعداد Celery
├── users/                  # إدارة المستخدمين والمصادقة
├── projects/              # إدارة المشاريع والمهام
├── crm/                   # إدارة العملاء (CRM)
├── billing/               # إدارة الفواتير والمدفوعات
├── cms/                   # إدارة المحتوى
├── social_media/          # إدارة وسائل التواصل
├── reports/               # التقارير والتحليلات
└── requirements.txt       # مكتبات Python
```

### النماذج الأساسية (Models)

#### 1. نموذج المستخدم (User Model)
```python
class User(AbstractUser):
    """نموذج مستخدم مخصص مع أدوار متعددة"""
    
    class Role(models.TextChoices):
        ADMIN = 'admin', _('مدير')
        EMPLOYEE = 'employee', _('موظف')
        CLIENT = 'client', _('عميل')
    
    email = models.EmailField(_('البريد الإلكتروني'), unique=True)
    role = models.CharField(_('الدور'), max_length=20, choices=Role.choices)
    phone = models.CharField(_('رقم الهاتف'), max_length=20, blank=True)
    is_active = models.BooleanField(_('نشط'), default=True)
    created_at = models.DateTimeField(_('تاريخ الإنشاء'), auto_now_add=True)
```

#### 2. نموذج المشروع (Project Model)
```python
class Project(models.Model):
    """نموذج المشروع الأساسي"""
    
    class Status(models.TextChoices):
        PLANNING = 'planning', _('تخطيط')
        IN_PROGRESS = 'in_progress', _('قيد التنفيذ')
        COMPLETED = 'completed', _('مكتمل')
        ON_HOLD = 'on_hold', _('معلق')
    
    title = models.CharField(_('عنوان المشروع'), max_length=200)
    description = models.TextField(_('وصف المشروع'))
    client = models.ForeignKey('crm.Client', on_delete=models.CASCADE)
    status = models.CharField(_('الحالة'), max_length=20, choices=Status.choices)
    budget = models.DecimalField(_('الميزانية'), max_digits=12, decimal_places=2)
    start_date = models.DateField(_('تاريخ البداية'))
    end_date = models.DateField(_('تاريخ النهاية'), blank=True, null=True)
```

### APIs والـ Serializers

#### مثال على Serializer للمستخدم:
```python
class UserSerializer(serializers.ModelSerializer):
    """Serializer لبيانات المستخدم"""
    
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'role', 'phone', 'is_active']
        read_only_fields = ['id', 'created_at']
    
    def validate_email(self, value):
        """التحقق من صحة البريد الإلكتروني"""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("هذا البريد الإلكتروني مستخدم بالفعل")
        return value
```

#### مثال على ViewSet:
```python
class ProjectViewSet(viewsets.ModelViewSet):
    """ViewSet لإدارة المشاريع"""
    
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'client']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'start_date', 'budget']
    
    def get_queryset(self):
        """تخصيص الاستعلام حسب دور المستخدم"""
        user = self.request.user
        if user.role == User.Role.CLIENT:
            return Project.objects.filter(client__user=user)
        return Project.objects.all()
```

---

## الواجهة الأمامية (React Frontend)

### هيكل المشروع

```
frontend/src/
├── components/             # المكونات القابلة لإعادة الاستخدام
│   ├── ui/                # مكونات واجهة المستخدم الأساسية
│   ├── Layout.jsx         # تخطيط الصفحة الرئيسي
│   └── ProtectedRoute.jsx # حماية الصفحات
├── pages/                 # صفحات التطبيق
│   ├── LandingPage.jsx    # الصفحة الرئيسية
│   ├── LoginPage.jsx      # صفحة تسجيل الدخول
│   ├── Dashboard.jsx      # لوحة التحكم
│   ├── ProjectsPage.jsx   # صفحة المشاريع
│   ├── ClientsPage.jsx    # صفحة العملاء
│   └── InvoicesPage.jsx   # صفحة الفواتير
├── store/                 # إدارة الحالة (Redux)
│   ├── store.js          # إعداد المتجر
│   └── slices/           # شرائح Redux
├── services/              # خدمات API
│   └── api.js            # إعداد Axios
└── hooks/                 # React Hooks مخصصة
```

### إدارة الحالة مع Redux Toolkit

#### مثال على Auth Slice:
```javascript
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: localStorage.getItem('token'),
    isAuthenticated: false,
    loading: false,
    error: null
  },
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.access;
      localStorage.setItem('token', action.payload.access);
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
    }
  }
});
```

### خدمة API

```javascript
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor لإضافة التوكن
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor لمعالجة تجديد التوكن
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // إعادة توجيه لصفحة تسجيل الدخول
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

---

## قاعدة البيانات والنماذج

### تصميم قاعدة البيانات

#### العلاقات الأساسية:
```sql
-- جدول المستخدمين
CREATE TABLE users_user (
    id SERIAL PRIMARY KEY,
    email VARCHAR(254) UNIQUE NOT NULL,
    first_name VARCHAR(150),
    last_name VARCHAR(150),
    role VARCHAR(20) NOT NULL,
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول المشاريع
CREATE TABLE projects_project (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    client_id INTEGER REFERENCES crm_client(id),
    status VARCHAR(20) NOT NULL,
    budget DECIMAL(12,2),
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول العملاء
CREATE TABLE crm_client (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users_user(id),
    company_name VARCHAR(200),
    industry VARCHAR(100),
    website VARCHAR(200),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### فهارس الأداء

```sql
-- فهارس لتحسين الأداء
CREATE INDEX idx_projects_status ON projects_project(status);
CREATE INDEX idx_projects_client ON projects_project(client_id);
CREATE INDEX idx_projects_dates ON projects_project(start_date, end_date);
CREATE INDEX idx_users_email ON users_user(email);
CREATE INDEX idx_users_role ON users_user(role);
```

---

## APIs والخدمات

### نقاط النهاية الرئيسية (Endpoints)

#### المصادقة والمستخدمين:
```
POST   /api/auth/login/          # تسجيل الدخول
POST   /api/auth/logout/         # تسجيل الخروج
POST   /api/auth/register/       # التسجيل
POST   /api/auth/token/refresh/  # تجديد التوكن
GET    /api/auth/profile/        # الملف الشخصي
PUT    /api/auth/profile/        # تحديث الملف الشخصي
```

#### المشاريع:
```
GET    /api/projects/            # قائمة المشاريع
POST   /api/projects/            # إنشاء مشروع جديد
GET    /api/projects/{id}/       # تفاصيل مشروع
PUT    /api/projects/{id}/       # تحديث مشروع
DELETE /api/projects/{id}/       # حذف مشروع
GET    /api/projects/{id}/tasks/ # مهام المشروع
```

#### العملاء:
```
GET    /api/clients/             # قائمة العملاء
POST   /api/clients/             # إضافة عميل جديد
GET    /api/clients/{id}/        # تفاصيل عميل
PUT    /api/clients/{id}/        # تحديث بيانات عميل
DELETE /api/clients/{id}/        # حذف عميل
```

### معالجة الأخطاء

```python
class APIErrorHandler:
    """معالج أخطاء API موحد"""
    
    @staticmethod
    def handle_validation_error(serializer_errors):
        """معالجة أخطاء التحقق"""
        errors = {}
        for field, messages in serializer_errors.items():
            errors[field] = messages[0] if isinstance(messages, list) else str(messages)
        return Response({
            'error': 'بيانات غير صحيحة',
            'details': errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    @staticmethod
    def handle_permission_error():
        """معالجة أخطاء الصلاحيات"""
        return Response({
            'error': 'ليس لديك صلاحية للوصول لهذا المورد'
        }, status=status.HTTP_403_FORBIDDEN)
```

---

## الأمان والمصادقة

### نظام المصادقة JWT

```python
# إعدادات JWT في settings.py
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'AUTH_HEADER_TYPES': ('Bearer',),
}
```

### نظام الأدوار والصلاحيات

```python
class RoleBasedPermission(BasePermission):
    """صلاحيات مبنية على الأدوار"""
    
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        # المديرون لديهم صلاحية كاملة
        if request.user.role == User.Role.ADMIN:
            return True
        
        # الموظفون يمكنهم القراءة والكتابة
        if request.user.role == User.Role.EMPLOYEE:
            return request.method in ['GET', 'POST', 'PUT', 'PATCH']
        
        # العملاء يمكنهم القراءة فقط
        if request.user.role == User.Role.CLIENT:
            return request.method in ['GET']
        
        return False
```

### حماية من الهجمات

#### CSRF Protection:
```python
# في settings.py
CSRF_TRUSTED_ORIGINS = [
    'https://yourdomain.com',
    'https://www.yourdomain.com',
]

# استخدام CSRF tokens في النماذج
MIDDLEWARE = [
    'django.middleware.csrf.CsrfViewMiddleware',
    # ... باقي الـ middleware
]
```

#### Rate Limiting:
```python
from django_ratelimit.decorators import ratelimit

@ratelimit(key='ip', rate='5/m', method='POST')
def login_view(request):
    """تحديد معدل محاولات تسجيل الدخول"""
    pass
```

---

## النشر والبنية التحتية

### Docker Configuration

#### Dockerfile للواجهة الخلفية:
```dockerfile
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# تثبيت متطلبات النظام
RUN apt-get update && apt-get install -y \
    postgresql-client \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# تثبيت مكتبات Python
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install gunicorn

# نسخ الكود
COPY . /app/

# إنشاء مستخدم غير جذر
RUN adduser --disabled-password --gecos '' appuser
RUN chown -R appuser:appuser /app
USER appuser

EXPOSE 8000
CMD ["gunicorn", "idea_platform.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3"]
```

#### Docker Compose للإنتاج:
```yaml
version: '3.8'

services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: idea_platform
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    restart: unless-stopped

  backend:
    build: ./backend
    command: >
      sh -c "python manage.py migrate &&
             python manage.py collectstatic --noinput &&
             gunicorn idea_platform.wsgi:application --bind 0.0.0.0:8000"
    environment:
      - DEBUG=False
      - DB_HOST=db
      - REDIS_URL=redis://redis:6379/0
    depends_on:
      - db
      - redis
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  postgres_data:
```

### إعدادات Nginx

```nginx
upstream backend {
    server backend:8000;
}

server {
    listen 80;
    server_name yourdomain.com;

    # إعادة توجيه HTTP إلى HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    # إعدادات SSL
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;

    # إعدادات الأمان
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload";

    # API الخلفية
    location /api/ {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # الواجهة الأمامية
    location / {
        root /var/www/html;
        try_files $uri $uri/ /index.html;
    }
}
```

---

## المراقبة والصيانة

### سجلات النظام (Logging)

```python
# إعدادات السجلات في settings.py
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': '/app/logs/django.log',
            'formatter': 'verbose',
        },
        'console': {
            'level': 'DEBUG',
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['console', 'file'],
        'level': 'INFO',
    },
    'loggers': {
        'django': {
            'handlers': ['console', 'file'],
            'level': 'INFO',
            'propagate': False,
        },
    },
}
```

### مراقبة الأداء

```python
# Middleware لمراقبة الأداء
class PerformanceMonitoringMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        start_time = time.time()
        
        response = self.get_response(request)
        
        duration = time.time() - start_time
        
        # تسجيل الطلبات البطيئة
        if duration > 1.0:  # أكثر من ثانية واحدة
            logger.warning(f'Slow request: {request.path} took {duration:.2f}s')
        
        return response
```

### النسخ الاحتياطي التلقائي

```bash
#!/bin/bash
# سكريبت النسخ الاحتياطي التلقائي

BACKUP_DIR="/backup/idea-platform"
DATE=$(date +%Y%m%d_%H%M%S)

# نسخ احتياطي لقاعدة البيانات
docker-compose exec -T db pg_dump -U postgres idea_platform > "$BACKUP_DIR/db_backup_$DATE.sql"

# نسخ احتياطي للملفات المرفوعة
docker run --rm -v idea-platform_media_files:/data -v $BACKUP_DIR:/backup alpine tar czf /backup/media_backup_$DATE.tar.gz -C /data .

# ضغط النسخة الاحتياطية
cd $BACKUP_DIR
tar czf "idea_platform_backup_$DATE.tar.gz" "db_backup_$DATE.sql" "media_backup_$DATE.tar.gz"

# حذف الملفات المؤقتة
rm "db_backup_$DATE.sql" "media_backup_$DATE.tar.gz"

# حذف النسخ القديمة (أكثر من 30 يوم)
find $BACKUP_DIR -name "idea_platform_backup_*.tar.gz" -mtime +30 -delete

echo "تم إنشاء النسخة الاحتياطية: idea_platform_backup_$DATE.tar.gz"
```

### مراقبة الصحة (Health Checks)

```python
# views.py
from django.http import JsonResponse
from django.db import connection

def health_check(request):
    """فحص صحة النظام"""
    try:
        # فحص قاعدة البيانات
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        
        # فحص Redis
        from django.core.cache import cache
        cache.set('health_check', 'ok', 10)
        cache_status = cache.get('health_check') == 'ok'
        
        return JsonResponse({
            'status': 'healthy',
            'database': 'ok',
            'cache': 'ok' if cache_status else 'error',
            'timestamp': timezone.now().isoformat()
        })
    except Exception as e:
        return JsonResponse({
            'status': 'unhealthy',
            'error': str(e),
            'timestamp': timezone.now().isoformat()
        }, status=500)
```

---

## الخلاصة

هذه الوثائق التقنية تغطي جميع جوانب منصة أيديا المتكاملة من الناحية التقنية. المنصة مبنية على أسس تقنية قوية ومعايير صناعية عالية، مما يضمن الأداء والأمان وقابلية التوسع.

للمزيد من التفاصيل أو الاستفسارات التقنية، يرجى الرجوع إلى الكود المصدري أو التواصل مع فريق التطوير.

---

*تم إعداد هذه الوثائق بواسطة Manus AI - سبتمبر 2025*

