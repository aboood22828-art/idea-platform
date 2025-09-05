# منصة أيديا المتكاملة (Idea Integrated Platform)

## نظرة عامة

منصة أيديا المتكاملة هي نظام برمجي شامل ومخصص لشركة "أيديا للاستشارات والحلول التسويقية". تتكون المنصة من ثلاثة مكونات رئيسية:

1. **الموقع الإلكتروني العام** - واجهة تسويقية للجمهور
2. **لوحة التحكم الداخلية** - مركز عمليات الفريق
3. **بوابة العملاء** - مساحة آمنة للعملاء

## التقنيات المستخدمة

- **الواجهة الخلفية:** Python 3.11+ مع Django 4.2+
- **الواجهة الأمامية:** React.js مع TypeScript
- **قاعدة البيانات:** PostgreSQL
- **البنية التحتية:** Docker و Docker Compose

## هيكل المشروع

```
idea-platform/
├── backend/                 # الواجهة الخلفية (Django)
├── frontend/               # الواجهة الأمامية (React)
├── docker-compose.yml      # إعداد Docker للتطوير
├── docker-compose.prod.yml # إعداد Docker للإنتاج
├── .env.example           # متغيرات البيئة المثال
├── docs/                  # الوثائق
└── README.md             # هذا الملف
```

## التشغيل السريع

### متطلبات النظام

- Docker و Docker Compose
- Python 3.11+
- Node.js 18+

### تشغيل المشروع

1. استنساخ المشروع:
```bash
git clone <repository-url>
cd idea-platform
```

2. نسخ ملف متغيرات البيئة:
```bash
cp .env.example .env
```

3. تشغيل المشروع:
```bash
docker-compose up -d
```

4. الوصول للتطبيق:
- الموقع العام: http://localhost:3000
- لوحة التحكم: http://localhost:3000/dashboard
- بوابة العملاء: http://localhost:3000/portal
- API الخلفية: http://localhost:8000

## التطوير

### إعداد بيئة التطوير

1. إنشاء بيئة Python الافتراضية:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# أو
venv\Scripts\activate     # Windows
```

2. تثبيت التبعيات:
```bash
pip install -r requirements.txt
```

3. إعداد قاعدة البيانات:
```bash
python manage.py migrate
python manage.py createsuperuser
```

4. تشغيل خادم التطوير:
```bash
python manage.py runserver
```

### الواجهة الأمامية

1. الانتقال لمجلد الواجهة الأمامية:
```bash
cd frontend
```

2. تثبيت التبعيات:
```bash
npm install
```

3. تشغيل خادم التطوير:
```bash
npm start
```

## الاختبار

### اختبار الواجهة الخلفية
```bash
cd backend
python manage.py test
```

### اختبار الواجهة الأمامية
```bash
cd frontend
npm test
```

## النشر

### بيئة الإنتاج

1. إعداد متغيرات البيئة للإنتاج في ملف `.env`
2. تشغيل المشروع في وضع الإنتاج:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## المساهمة

1. إنشاء فرع جديد للميزة:
```bash
git checkout -b feature/new-feature
```

2. إجراء التغييرات والالتزام بها:
```bash
git commit -m "إضافة ميزة جديدة"
```

3. دفع الفرع:
```bash
git push origin feature/new-feature
```

4. إنشاء طلب سحب (Pull Request)

## الترخيص

هذا المشروع مملوك لشركة "أيديا للاستشارات والحلول التسويقية" وهو محمي بحقوق الطبع والنشر.

## الدعم

للحصول على الدعم، يرجى التواصل مع فريق التطوير أو إنشاء issue في المستودع.

