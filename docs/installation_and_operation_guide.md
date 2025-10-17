# دليل التثبيت والتشغيل لمنصة أيديا المتكاملة

**التاريخ:** 15 أكتوبر 2025  
**المعد:** Manus AI  

---

## 1. مقدمة

يوفر هذا الدليل إرشادات مفصلة لتثبيت وتشغيل منصة أيديا المتكاملة. يمكنك اختيار طريقة التثبيت التي تناسب بيئتك: إما باستخدام Docker Compose (الطريقة الموصى بها لسهولة الإدارة) أو التثبيت اليدوي للمكونات (الواجهة الخلفية والواجهة الأمامية بشكل منفصل).

## 2. المتطلبات الأساسية

-   **نظام التشغيل:** Ubuntu 22.04 LTS (موصى به) أو أي توزيعة Linux أخرى متوافقة.
-   **الموارد:** 4GB RAM، 2 vCPU كحد أدنى. يوصى بـ 8GB RAM و 4 vCPU لبيئات الإنتاج.
-   **Git:** للتحكم في الإصدارات.
-   **Python 3.9+:** للواجهة الخلفية.
-   **Node.js 18+:** للواجهة الأمامية.
-   **PostgreSQL:** كقاعدة بيانات.
-   **Docker و Docker Compose:** (اختياري، ولكن موصى به).

## 3. التثبيت باستخدام Docker Compose (الطريقة الموصى بها)

تعتبر هذه الطريقة هي الأسهل والأكثر اتساقًا لنشر المنصة، حيث تقوم بتغليف جميع المكونات في حاويات Docker.

### 3.1. تثبيت Docker و Docker Compose

إذا لم تكن Docker و Docker Compose مثبتين بالفعل، اتبع التعليمات الرسمية:

1.  **تثبيت Docker Engine:**
    ```bash
    sudo apt-get update
    sudo apt-get install ca-certificates curl gnupg
    sudo install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    sudo chmod a+r /etc/apt/keyrings/docker.gpg
    echo \
      

      "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | \
      sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt-get update
    sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    ```

2.  **إضافة المستخدم الحالي إلى مجموعة Docker:**
    ```bash
    sudo usermod -aG docker $USER
    newgrp docker # لتطبيق التغييرات فورًا دون إعادة تشغيل
    ```

### 3.2. استنساخ المستودع

```bash
git clone https://github.com/aboood22828-art/idea-platform.git
cd idea-platform/idea-platform
```

### 3.3. إعداد المتغيرات البيئية

-   قم بإنشاء ملف `.env` في المجلد الجذر للمشروع (`idea-platform/idea-platform/`)، واملأه بالمتغيرات البيئية اللازمة، مثل مفتاح Django السري، بيانات اعتماد قاعدة البيانات، وأي مفاتيح API أخرى. مثال:

    ```dotenv
    SECRET_KEY=your_django_secret_key
    DEBUG=True
    DB_NAME=postgres
    DB_USER=postgres
    DB_PASSWORD=your_db_password
    DB_HOST=db
    DB_PORT=5432
    ALLOWED_HOSTS=localhost,127.0.0.1
    CORS_ALLOWED_ORIGINS=http://localhost:5173
    ```
    **ملاحظة:** يجب استبدال `your_django_secret_key` و `your_db_password` بقيم حقيقية.

### 3.4. بناء وتشغيل الحاويات

```bash
docker compose build
docker compose up -d
```

### 3.5. تطبيق الترحيلات وإنشاء مستخدم إداري

```bash
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py createsuperuser
```
اتبع التعليمات لإنشاء مستخدم إداري.

### 3.6. جمع الملفات الثابتة

```bash
docker compose exec backend python manage.py collectstatic --noinput
```

### 3.7. الوصول إلى المنصة

بعد تشغيل جميع الحاويات بنجاح، يمكنك الوصول إلى المنصة عبر متصفح الويب الخاص بك على العنوان:

`http://localhost:5173` (أو المنفذ الذي تم تكوينه للواجهة الأمامية).

## 4. التثبيت اليدوي (بدون Docker)

### 4.1. استنساخ المستودع

```bash
git clone https://github.com/aboood22828-art/idea-platform.git
cd idea-platform
```

### 4.2. إعداد الواجهة الخلفية (Backend - Django)

راجع **دليل التطوير اليدوي لمنصة أيديا المتكاملة** في مجلد `docs/manual_development_guide.md` للحصول على تعليمات مفصلة حول إعداد وتشغيل الواجهة الخلفية يدويًا.

### 4.3. إعداد الواجهة الأمامية (Frontend - React)

راجع **دليل التطوير اليدوي لمنصة أيديا المتكاملة** في مجلد `docs/manual_development_guide.md` للحصول على تعليمات مفصلة حول إعداد وتشغيل الواجهة الأمامية يدويًا.

## 5. استكشاف الأخطاء وإصلاحها

-   **مشكلات Docker Compose:**
    -   تأكد من أن خدمة Docker تعمل: `sudo systemctl status docker`.
    -   تأكد من أنك في مجموعة Docker: `groups $USER`.
    -   إذا واجهت مشكلات `iptables`، قد تحتاج إلى إعادة تشغيل خدمة Docker أو إعادة تعيين قواعد `iptables` (بحذر) أو استخدام التثبيت اليدوي.
-   **مشكلات الاتصال:** تأكد من أن الواجهة الخلفية والواجهة الأمامية تعملان على المنافذ الصحيحة وأن `baseURL` في الواجهة الأمامية صحيح.
-   **أخطاء قاعدة البيانات:** تحقق من إعدادات قاعدة البيانات وتأكد من أن خدمة PostgreSQL تعمل.
-   **أخطاء CORS:** تأكد من أن إعدادات CORS في Django صحيحة (ملف `settings.py`).

---

**نهاية الوثيقة**

