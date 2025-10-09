#!/bin/bash

# سكريبت النسخ الاحتياطي لمنصة أيديا المتكاملة

set -e

# إعدادات النسخ الاحتياطي
BACKUP_DIR="/backup/idea-platform"
DATE=$(date +%Y%m%d_%H%M%S)
DB_BACKUP_FILE="$BACKUP_DIR/db_backup_$DATE.sql"
MEDIA_BACKUP_FILE="$BACKUP_DIR/media_backup_$DATE.tar.gz"

# إنشاء مجلد النسخ الاحتياطي
mkdir -p $BACKUP_DIR

echo "🔄 بدء عملية النسخ الاحتياطي..."

# نسخ احتياطي لقاعدة البيانات
echo "🗄️ إنشاء نسخة احتياطية لقاعدة البيانات..."
docker-compose -f docker-compose.prod.yml exec -T db pg_dump -U postgres idea_platform > $DB_BACKUP_FILE

# نسخ احتياطي للملفات المرفوعة
echo "📁 إنشاء نسخة احتياطية للملفات..."
docker run --rm -v idea-platform_media_files_prod:/data -v $BACKUP_DIR:/backup alpine tar czf /backup/media_backup_$DATE.tar.gz -C /data .

# ضغط النسخة الاحتياطية
echo "🗜️ ضغط النسخة الاحتياطية..."
cd $BACKUP_DIR
tar czf "idea_platform_backup_$DATE.tar.gz" "db_backup_$DATE.sql" "media_backup_$DATE.tar.gz"

# حذف الملفات المؤقتة
rm "db_backup_$DATE.sql" "media_backup_$DATE.tar.gz"

# حذف النسخ الاحتياطية القديمة (أكثر من 30 يوم)
find $BACKUP_DIR -name "idea_platform_backup_*.tar.gz" -mtime +30 -delete

echo "✅ تم إنشاء النسخة الاحتياطية: idea_platform_backup_$DATE.tar.gz"
echo "📍 مسار النسخة الاحتياطية: $BACKUP_DIR/idea_platform_backup_$DATE.tar.gz"

