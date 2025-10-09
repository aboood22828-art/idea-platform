# مرحلة البناء
FROM node:18-alpine as build

# تعيين مجلد العمل
WORKDIR /app

# نسخ ملفات package
COPY package*.json ./

# تثبيت المكتبات
RUN npm ci --only=production

# نسخ كود المشروع
COPY . .

# بناء المشروع للإنتاج
RUN npm run build

# مرحلة الإنتاج
FROM nginx:alpine

# نسخ ملفات البناء إلى nginx
COPY --from=build /app/dist /usr/share/nginx/html

# نسخ إعدادات nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# فتح المنفذ
EXPOSE 80

# تشغيل nginx
CMD ["nginx", "-g", "daemon off;"]

