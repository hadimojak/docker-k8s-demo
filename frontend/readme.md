# <span style="color:#58a6ff">🌐 Frontend — اجرا با Docker</span>

این پوشه صفحه وب پروژه است. قبل از این، backend باید طبق [`../backend/readme.md`](../backend/readme.md) روی شبکه `demo-net` اجرا شده باشد.

---

## این بخش چیست؟

| فایل | کار |
|------|-----|
| `index.html` | صفحه وب با دکمه «گرفتن پیام از backend» |
| `nginx.conf` | وب‌سرور؛ درخواست‌های `/api/` را به backend می‌فرستد |
| `Dockerfile` | ساخت Image از روی nginx |

nginx **داخل کانتینر** روی پورت `80` گوش می‌دهد.

---

## Dockerfile چه می‌کند؟

```dockerfile
FROM nginx:alpine
COPY index.html /usr/share/nginx/html/index.html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

| دستور | توضیح |
|--------|--------|
| `FROM nginx:alpine` | از Image سبک nginx شروع کن |
| `COPY index.html ...` | صفحه وب را جایی بگذار که nginx سرو می‌کند |
| `COPY nginx.conf ...` | تنظیمات nginx (شامل پروکسی) را جایگزین کن |
| `EXPOSE 80` | اعلام پورت nginx |

نیازی به `CMD` نیست؛ Image آماده nginx خودش سرور را روشن می‌کند.

---

## nginx چطور به backend وصل می‌شود؟

```nginx
location /api/ {
    proxy_pass http://backend:6000;
}
```

| بخش | معنی |
|-----|------|
| `backend` | اسم کانتینر backend |
| `6000` | پورتی که backend **داخل کانتینرش** روی آن گوش می‌دهد |

این اسم فقط وقتی پیدا می‌شود که هر دو کانتینر روی یک شبکه (`demo-net`) باشند.

---

## قدم ۱ — ساخت Image

از ریشه پروژه:

```powershell
docker build -t demo-frontend:1.0 ./frontend
```

---

## قدم ۲ — اجرای کانتینر

```powershell
docker run -d --name frontend --network demo-net -p 8080:80 demo-frontend:1.0
```

`-p 8080:80` یعنی پورت `8080` سیستم تو ← پورت `80` داخل کانتینر.

---

## قدم ۳ — تست

در مرورگر باز کن و دکمه را بزن:

```text
http://localhost:8080
```

یا با curl:

```powershell
curl.exe http://localhost:8080/api/messages
```

---

## خطاهای رایج

| خطا | دلیل و راه‌حل |
|-----|----------------|
| `502 Bad Gateway` | nginx به پورت اشتباه وصل شده؛ باید `backend:6000` باشد، نه `backend:3000` |
| `host not found in upstream "demo-net"` | `demo-net` اسم شبکه است، نه اسم کانتینر؛ در `proxy_pass` بنویس `backend` |
| پیام نمی‌آید با `proxy_pass http://localhost...` | داخل کانتینر frontend، `localhost` یعنی خود frontend، نه backend |
| کانتینر frontend بلافاصله خاموش می‌شود | backend روی `demo-net` نیست یا هنوز اجرا نشده؛ `docker logs frontend` را بخوان |

---

## دستورهای مفید

```powershell
docker logs frontend
docker exec -it frontend sh
docker rm -f frontend
```

بعد از تغییر `index.html` یا `nginx.conf`:

```powershell
docker rm -f frontend
docker build -t demo-frontend:1.0 ./frontend
docker run -d --name frontend --network demo-net -p 8080:80 demo-frontend:1.0
```

---

## پاک‌سازی کامل دموی Docker

```powershell
docker rm -f frontend backend
docker network rm demo-net
```

قدم بعدی: اجرای همین پروژه روی Kubernetes ← [`../k8s/readme.md`](../k8s/readme.md)
