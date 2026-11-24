# 🐳 Backend — اجرا با Docker

این پوشه سرور API پروژه است. اگر واژه‌هایی مثل Image و Container برایت تازه است، اول [`../full-readme.md`](../full-readme.md) را ببین.

---

## این بخش چیست؟

یک برنامه Node.js / Express در فایل `server.js`:

| مسیر | کار |
|------|-----|
| `GET /health` | می‌گوید سرور زنده است |
| `GET /api/messages` | یک پیام برمی‌گرداند |
| `/api-docs/` | صفحه Swagger برای تست API در مرورگر |

برنامه **داخل کانتینر** روی پورت `6000` گوش می‌دهد.

---

## اجرا بدون Docker (لوکال)

```powershell
cd backend
npm i
node server.js
```

بدون `PORT`، سرور روی `3000` بالا می‌آید (مرورگر پورت `6000` را مسدود می‌کند). تست:

```text
http://localhost:3000/health
http://localhost:3000/api/messages
http://localhost:3000/api-docs/
```

---

## Dockerfile چه می‌کند؟

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package.json ./
RUN npm i --omit=dev
COPY server.js ./
EXPOSE 6000
CMD ["node", "server.js"]
```

| دستور | توضیح |
|--------|--------|
| `FROM node:20-alpine` | از یک لینوکس سبک که Node 20 دارد شروع کن |
| `WORKDIR /app` | از این به بعد داخل پوشه `/app` کار کن |
| `COPY package.json ./` | لیست کتابخانه‌ها را کپی کن |
| `RUN npm i --omit=dev` | کتابخانه‌ها را داخل Image نصب کن |
| `COPY server.js ./` | کد سرور را کپی کن |
| `EXPOSE 6000` | فقط اعلام می‌کند برنامه روی `6000` است (پورت را باز نمی‌کند) |
| `CMD [...]` | وقتی کانتینر روشن شد، سرور را اجرا کن |

---

## قدم ۱ — ساخت Image

از ریشه پروژه:

```powershell
docker build -t demo-backend:1.0 ./backend
```



`demo-backend:1.0` یعنی اسم Image و نسخه‌اش.

---

## قدم ۲ — ساخت شبکه و اجرای کانتینر

frontend بعداً باید backend را با اسم `backend` پیدا کند، پس از همین اول کانتینر را روی یک شبکه مشترک بالا بیاور:

```powershell
docker network create demo-net
docker run -d --name backend --network demo-net -p 3000:6000 demo-backend:1.0
```

| بخش | معنی |
|-----|------|
| `-d` | در پس‌زمینه اجرا شود |
| `--name backend` | اسم کانتینر (frontend با همین اسم پیدایش می‌کند) |
| `--network demo-net` | عضو شبکه مشترک شود |
| `-p 3000:6000` | پورت `3000` سیستم تو ← پورت `6000` داخل کانتینر |

---

## قدم ۳ — تست

```powershell
curl.exe http://localhost:3000/health
curl.exe http://localhost:3000/api/messages
```

Swagger در مرورگر:

```text
http://localhost:3000/api-docs/
```

اگر JSON دیدی، backend درست کار می‌کند. حالا برو سراغ [`../frontend/readme.md`](../frontend/readme.md).

---

## خطاهای رایج

| خطا | دلیل و راه‌حل |
|-----|----------------|
| `Cannot use import statement outside a module` | در `package.json` باید `"type": "module"` باشد |
| مرورگر یا curl جواب نمی‌دهد | ترتیب `-p` را چک کن: `-p پورت_سیستم:پورت_کانتینر` ← باید به `6000` برسد |
| `localhost:6000` در مرورگر باز نمی‌شود | مرورگر پورت `6000` را مسدود می‌کند (`ERR_UNSAFE_PORT`)؛ از `3000` استفاده کن |
| `The container name "/backend" is already in use` | کانتینر قبلی هنوز هست: `docker rm -f backend` |

---

## دستورهای مفید

```powershell
docker logs backend
docker logs -f backend
docker exec -it backend sh
docker restart backend
docker rm -f backend
```

بعد از تغییر کد، Image را دوباره بساز و کانتینر را از نو اجرا کن:

```powershell
docker rm -f backend
docker build -t demo-backend:1.0 ./backend
docker run -d --name backend --network demo-net -p 3000:6000 demo-backend:1.0
```
