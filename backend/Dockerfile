FROM python:3.11-slim

# تعيين متغيرات البيئة
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# تعيين مجلد العمل
WORKDIR /app

# تثبيت متطلبات النظام
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        postgresql-client \
        build-essential \
        libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# تثبيت المكتبات Python
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install gunicorn

# نسخ المشروع
COPY . /app/

# إنشاء مجلدات للملفات الثابتة والوسائط
RUN mkdir -p /app/staticfiles /app/media /app/logs

# تجميع الملفات الثابتة
RUN python manage.py collectstatic --noinput || true

# إنشاء مستخدم غير جذر
RUN adduser --disabled-password --gecos '' appuser
RUN chown -R appuser:appuser /app
USER appuser

# فتح المنفذ
EXPOSE 8000

# الأمر الافتراضي
CMD ["gunicorn", "idea_platform.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3"]

