from django.db import models
from django.contrib.auth import get_user_model
from django.utils.text import slugify

User = get_user_model()


class Category(models.Model):
    """تصنيفات المحتوى"""
    
    name = models.CharField('اسم التصنيف', max_length=100, unique=True)
    slug = models.SlugField('الرابط', max_length=100, unique=True, blank=True)
    description = models.TextField('الوصف', blank=True)
    created_at = models.DateTimeField('تاريخ الإنشاء', auto_now_add=True)
    
    class Meta:
        verbose_name = 'تصنيف'
        verbose_name_plural = 'التصنيفات'
        ordering = ['name']
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name, allow_unicode=True)
        super().save(*args, **kwargs)
    
    def __str__(self):
        return self.name


class Tag(models.Model):
    """علامات المحتوى"""
    
    name = models.CharField('اسم العلامة', max_length=50, unique=True)
    slug = models.SlugField('الرابط', max_length=50, unique=True, blank=True)
    created_at = models.DateTimeField('تاريخ الإنشاء', auto_now_add=True)
    
    class Meta:
        verbose_name = 'علامة'
        verbose_name_plural = 'العلامات'
        ordering = ['name']
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name, allow_unicode=True)
        super().save(*args, **kwargs)
    
    def __str__(self):
        return self.name


class Content(models.Model):
    """المحتوى الأساسي"""
    
    class ContentType(models.TextChoices):
        ARTICLE = 'article', 'مقالة'
        PAGE = 'page', 'صفحة'
        NEWS = 'news', 'خبر'
        BLOG = 'blog', 'مدونة'
    
    class Status(models.TextChoices):
        DRAFT = 'draft', 'مسودة'
        PUBLISHED = 'published', 'منشور'
        ARCHIVED = 'archived', 'مؤرشف'
    
    title = models.CharField('العنوان', max_length=200)
    slug = models.SlugField('الرابط', max_length=200, unique=True, blank=True)
    content_type = models.CharField('نوع المحتوى', max_length=20, choices=ContentType.choices)
    excerpt = models.TextField('المقتطف', max_length=500, blank=True)
    body = models.TextField('المحتوى')
    featured_image = models.URLField('الصورة المميزة', blank=True)
    status = models.CharField('الحالة', max_length=20, choices=Status.choices, default=Status.DRAFT)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='contents', verbose_name='الكاتب')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='contents', verbose_name='التصنيف')
    tags = models.ManyToManyField(Tag, blank=True, related_name='contents', verbose_name='العلامات')
    views_count = models.IntegerField('عدد المشاهدات', default=0)
    published_at = models.DateTimeField('تاريخ النشر', null=True, blank=True)
    created_at = models.DateTimeField('تاريخ الإنشاء', auto_now_add=True)
    updated_at = models.DateTimeField('تاريخ التحديث', auto_now=True)
    meta_title = models.CharField('عنوان SEO', max_length=200, blank=True)
    meta_description = models.TextField('وصف SEO', max_length=300, blank=True)
    
    class Meta:
        verbose_name = 'محتوى'
        verbose_name_plural = 'المحتويات'
        ordering = ['-created_at']
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title, allow_unicode=True)
        super().save(*args, **kwargs)
    
    def __str__(self):
        return self.title


class Comment(models.Model):
    """تعليقات المحتوى"""
    
    content = models.ForeignKey(Content, on_delete=models.CASCADE, related_name='comments', verbose_name='المحتوى')
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comments', verbose_name='الكاتب')
    body = models.TextField('التعليق')
    is_approved = models.BooleanField('موافق عليه', default=False)
    created_at = models.DateTimeField('تاريخ الإنشاء', auto_now_add=True)
    updated_at = models.DateTimeField('تاريخ التحديث', auto_now=True)
    
    class Meta:
        verbose_name = 'تعليق'
        verbose_name_plural = 'التعليقات'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"تعليق من {self.author.get_full_name()} على {self.content.title}"


class Media(models.Model):
    """ملفات الوسائط"""
    
    class MediaType(models.TextChoices):
        IMAGE = 'image', 'صورة'
        VIDEO = 'video', 'فيديو'
        DOCUMENT = 'document', 'مستند'
        AUDIO = 'audio', 'صوت'
    
    title = models.CharField('العنوان', max_length=200)
    file_url = models.URLField('رابط الملف')
    media_type = models.CharField('نوع الوسائط', max_length=20, choices=MediaType.choices)
    file_size = models.IntegerField('حجم الملف (بايت)', default=0)
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='media_files', verbose_name='رفع بواسطة')
    created_at = models.DateTimeField('تاريخ الرفع', auto_now_add=True)
    
    class Meta:
        verbose_name = 'وسائط'
        verbose_name_plural = 'الوسائط'
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title
