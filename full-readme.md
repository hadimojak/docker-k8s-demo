# دموی Docker و Kubernetes — نقطه شروع

این پروژه برای کسی است که **هیچ دانش قبلی** از Docker یا Kubernetes ندارد.  
این فایل فقط نقشه راه است؛ مراحل اجرا داخل readme هر پوشه نوشته شده است.

---

## این پروژه چیست؟

یک اپلیکیشن خیلی کوچک با دو بخش:

| بخش | کارش چیست؟ |
|-----|------------|
| **backend** | سرور کوچکی که پیام JSON برمی‌گرداند (همراه صفحه Swagger) |
| **frontend** | صفحه وب با یک دکمه؛ با کلیک، پیام را از backend می‌گیرد |

---

## ساختار پوشه‌ها

```text
docker-k8s-demo/
├── backend/          ← سرور API          → راهنما: backend/readme.md   (Docker)
├── frontend/         ← صفحه وب + nginx   → راهنما: frontend/readme.md  (Docker)
├── k8s/              ← فایل Kubernetes   → راهنما: k8s/readme.md       (Kubernetes)
├── full-readme.md    ← همین فایل
└── usefull-links.md  ← لینک‌های آموزشی
```

---

## به چه ترتیبی جلو بروم؟

| مرحله | راهنما | چه یاد می‌گیری |
|-------|--------|----------------|
| ۱ | [`backend/readme.md`](backend/readme.md) | ساخت Image، اجرای Container، پورت‌ها |
| ۲ | [`frontend/readme.md`](frontend/readme.md) | شبکه Docker و ارتباط دو کانتینر با هم |
| ۳ | [`k8s/readme.md`](k8s/readme.md) | اجرای همین دو بخش روی Kubernetes (Minikube) |

مرحله ۳ را فقط بعد از اینکه مراحل ۱ و ۲ کار کردند شروع کن.

---

## پیش‌نیاز بخش Docker

**Docker Desktop** را روی Windows نصب کن و روشنش کن. بعد بررسی کن:

```powershell
docker -v
```

پیش‌نیازهای Kubernetes داخل `k8s/readme.md` آمده است.

---

## واژه‌های پایه Docker

| واژه | معنی ساده |
|------|-----------|
| **Image** | بسته آماده برنامه (مثل فایل نصب) — هنوز روشن نیست |
| **Container** | همان Image وقتی روشن و در حال اجرا است |
| **Dockerfile** | دستور ساخت Image |
| **Port** | شماره «در» برای ارتباط با برنامه |
| `-p 3000:6000` | پورت `3000` سیستم تو ← پورت `6000` داخل کانتینر |
| **Network** | شبکه‌ای که کانتینرها در آن همدیگر را با اسم پیدا می‌کنند |

---

## نقشه پورت‌ها در Docker

| کجا | پورت |
|-----|------|
| backend داخل کانتینر | `6000` |
| backend از سیستم تو | `localhost:3000` |
| frontend داخل کانتینر (nginx) | `80` |
| frontend از سیستم تو | `localhost:8080` |
| آدرسی که nginx به آن پروکسی می‌کند | `http://backend:6000` |

```text
مرورگر → localhost:8080 → nginx (frontend) → backend:6000 → پاسخ JSON
```

---

## اگر جایی گیر کردم

اول لاگ را بخوان؛ معمولاً دلیل خطا همان‌جا نوشته شده است:

```powershell
docker logs backend
docker logs frontend
```

خطاهای رایج هر بخش در readme همان پوشه آمده است.
