# دليل التطوير اليدوي لمنصة أيديا المتكاملة

**التاريخ:** 15 أكتوبر 2025  
**المعد:** Manus AI  

---

## 1. مقدمة

يوفر هذا الدليل إرشادات مفصلة لإعداد بيئة التطوير وتشغيل منصة أيديا المتكاملة يدويًا، دون الاعتماد على Docker Compose. هذا مفيد بشكل خاص في البيئات التي قد تواجه فيها مشكلات مع Docker (كما حدث في بيئة Sandbox)، أو للمطورين الذين يفضلون التحكم الكامل في إعدادات بيئتهم.

## 2. المتطلبات الأساسية

قبل البدء، تأكد من تثبيت المتطلبات التالية على نظامك:

-   **Python 3.9+:** للواجهة الخلفية (Django).
-   **pip:** مدير حزم Python.
-   **Node.js 18+:** للواجهة الأمامية (React).
-   **npm أو yarn:** مدير حزم Node.js.
-   **PostgreSQL:** كقاعدة بيانات.
-   **Git:** للتحكم في الإصدارات.

## 3. إعداد الواجهة الخلفية (Backend - Django)

### 3.1. استنساخ المستودع

ابدأ باستنساخ كود المشروع من مستودع GitHub:

```bash
git clone https://github.com/aboood22828-art/idea-platform.git
cd idea-platform/backend
```

### 3.2. إنشاء بيئة افتراضية وتثبيت المتطلبات

يوصى بشدة باستخدام بيئة افتراضية لـ Python لتجنب تعارضات الحزم:

```bash
python3 -m venv venv
source venv/bin/activate  # لنظامي Linux/macOS
# venv\Scripts\activate  # لنظام التشغيل Windows
pip install -r requirements.txt
```

### 3.3. إعداد قاعدة البيانات

1.  **إنشاء قاعدة بيانات PostgreSQL:**
    أنشئ قاعدة بيانات PostgreSQL جديدة (على سبيل المثال، `idea_platform_db`) ومستخدمًا (على سبيل المثال، `idea_user`) بكلمة مرور قوية.

2.  **تكوين Django:**
    افتح ملف `idea_platform/settings.py` (المسار: `backend/idea_platform/settings.py`) وقم بتحديث إعدادات قاعدة البيانات لتتناسب مع إعداداتك:

    ```python
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': 'idea_platform_db',
            'USER': 'idea_user',
            'PASSWORD': 'your_db_password',
            'HOST': 'localhost',
            'PORT': '5432',
        }
    }
    ```
    استبدل `idea_platform_db`, `idea_user`, `your_db_password`, `localhost`, `5432` بالقيم الصحيحة.

### 3.4. تطبيق الترحيلات وإنشاء مستخدم إداري

```bash
python manage.py migrate
python manage.py createsuperuser
```
اتبع التعليمات لإنشاء مستخدم إداري.

### 3.5. تشغيل خادم الواجهة الخلفية

```bash
python manage.py runserver 0.0.0.0:8000
```
سيتم تشغيل الواجهة الخلفية على `http://localhost:8000`.

## 4. إعداد الواجهة الأمامية (Frontend - React)

### 4.1. الانتقال إلى مجلد الواجهة الأمامية

```bash
cd ../frontend
```

### 4.2. تثبيت المتطلبات

```bash
npm install
# أو
yarn install
```

### 4.3. تكوين API Base URL

افتح ملف `src/api/api.js` (المسار: `frontend/src/api/api.js`) وتأكد من أن `baseURL` يشير إلى عنوان الواجهة الخلفية:

```javascript
const API = axios.create({
  baseURL: 'http://localhost:8000/api/', // تأكد من أن هذا يشير إلى الواجهة الخلفية
});
```

### 4.4. تشغيل خادم الواجهة الأمامية

```bash
npm run dev
# أو
yarn dev
```
سيتم تشغيل الواجهة الأمامية عادةً على `http://localhost:5173`.

## 5. الوصول إلى المنصة

بعد تشغيل كل من الواجهة الخلفية والأمامية بنجاح، يمكنك الوصول إلى المنصة عبر متصفح الويب الخاص بك على العنوان:

`http://localhost:5173`

يمكنك تسجيل الدخول باستخدام بيانات المستخدم الإداري الذي أنشأته في الخطوة 3.4.

## 6. نصائح استكشاف الأخطاء وإصلاحها

-   **مشكلات الاتصال:** تأكد من أن الواجهة الخلفية والواجهة الأمامية تعملان على المنافذ الصحيحة وأن `baseURL` في الواجهة الأمامية صحيح.
-   **أخطاء قاعدة البيانات:** تحقق من إعدادات قاعدة البيانات في `settings.py` وتأكد من أن خدمة PostgreSQL تعمل.
-   **مشكلات الحزم:** تأكد من تثبيت جميع المتطلبات في البيئات الافتراضية الصحيحة.
-   **أخطاء CORS:** إذا واجهت أخطاء CORS، تأكد من أن إعدادات CORS في Django صحيحة (ملف `settings.py`).

---

**نهاية الوثيقة**

