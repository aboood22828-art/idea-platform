#!/bin/bash

# سكريبت نشر منصة أيديا المتكاملة
# يجب تشغيله من المجلد الجذر للمشروع

set -e  # إيقاف السكريبت عند حدوث خطأ

echo "🚀 بدء عملية نشر منصة أيديا المتكاملة..."

# التحقق من وجود Docker و Docker Compose
if ! command -v docker &> /dev/null; then
    echo "❌ Docker غير مثبت. يرجى تثبيت Docker أولاً."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose غير مثبت. يرجى تثبيت Docker Compose أولاً."
    exit 1
fi

# التحقق من وجود ملف البيئة
if [ ! -f .env.prod ]; then
    echo "❌ ملف .env.prod غير موجود. يرجى إنشاؤه أولاً."
    exit 1
fi

# إيقاف الحاويات الحالية إن وجدت
echo "🛑 إيقاف الحاويات الحالية..."
docker-compose -f docker-compose.prod.yml down --remove-orphans

# بناء الصور الجديدة
echo "🔨 بناء صور Docker..."
docker-compose -f docker-compose.prod.yml build --no-cache

# تشغيل الحاويات
echo "▶️ تشغيل الحاويات..."
docker-compose -f docker-compose.prod.yml up -d

# انتظار تشغيل قاعدة البيانات
echo "⏳ انتظار تشغيل قاعدة البيانات..."
sleep 10

# تشغيل migrations
echo "🗄️ تطبيق migrations..."
docker-compose -f docker-compose.prod.yml exec -T backend python manage.py migrate

# إنشاء مستخدم مدير إذا لم يكن موجوداً
echo "👤 إنشاء مستخدم مدير..."
docker-compose -f docker-compose.prod.yml exec -T backend python manage.py shell -c "
from users.models import User
if not User.objects.filter(email='admin@ideateam.com').exists():
    User.objects.create_superuser('admin@ideateam.com', 'admin123', first_name='مدير', last_name='النظام')
    print('تم إنشاء مستخدم المدير بنجاح')
else:
    print('مستخدم المدير موجود بالفعل')
"

# تجميع الملفات الثابتة
echo "📁 تجميع الملفات الثابتة..."
docker-compose -f docker-compose.prod.yml exec -T backend python manage.py collectstatic --noinput

# عرض حالة الحاويات
echo "📊 حالة الحاويات:"
docker-compose -f docker-compose.prod.yml ps

echo "✅ تم نشر منصة أيديا المتكاملة بنجاح!"
echo "🌐 يمكنك الوصول للمنصة عبر: http://localhost"
echo "🔧 لوحة الإدارة: http://localhost/admin"
echo "📧 بيانات المدير: admin@ideateam.com / admin123"

# عرض السجلات
echo "📝 لعرض السجلات استخدم: docker-compose -f docker-compose.prod.yml logs -f"
echo "🛑 لإيقاف المنصة استخدم: docker-compose -f docker-compose.prod.yml down"

