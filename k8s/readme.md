# <span style="color:#58a6ff">☸️ Kubernetes (Minikube) — راهنمای مبتدی</span>

اینجا همان backend و frontend را به‌جای `docker run` با Kubernetes اجرا می‌کنیم.  
پیش از این، بخش Docker را طبق `backend/readme.md` و `frontend/readme.md` اجرا کرده باش.

---

## Kubernetes اینجا چه کمکی می‌کند؟

به‌جای اینکه خودت دستی چند `docker run` بزنی، Kubernetes:

- چند نسخه از یک برنامه را همیشه روشن نگه می‌دارد
- اگر یکی خراب شد، دوباره می‌سازدش
- به برنامه‌ها یک آدرس ثابت داخلی می‌دهد

| واژه | معنی ساده |
|------|-----------|
| **Minikube** | یک Kubernetes کوچک روی لپ‌تاپ تو |
| **kubectl** | ابزاری که با آن به Kubernetes دستور می‌دهی |
| **Pod** | کوچک‌ترین واحد اجرا (اینجا هر Pod یک کانتینر است) |
| **Deployment** | می‌گوید از یک برنامه چند Pod همیشه روشن باشد |
| **Service** | اسم و آدرس ثابت برای رسیدن به Podها |
| **readinessProbe** | تستی که تا موفق نشود، Pod ترافیک نمی‌گیرد |

---

## پیش‌نیاز

- [ ] Docker Desktop روشن است
- [ ] `minikube version` کار می‌کند
- [ ] `kubectl version --client` کار می‌کند

---

## قدم ۱ — پاک کردن کانتینرهای دموی Docker

تا با پورت‌ها و اسم‌ها تداخل نداشته باشند:

```powershell
docker rm -f frontend backend
docker network rm demo-net
```

---

## قدم ۲ — روشن کردن Minikube

```powershell
minikube start --driver=docker --cpus=2 --memory=4096
kubectl get nodes
```

باید ببینی:

```text
NAME       STATUS   ROLES           ...
minikube   Ready    control-plane   ...
```

اگر بعد از چند دقیقه هنوز `NotReady` بود، بخش «رفع مشکلات» پایین همین فایل را ببین.

---

## قدم ۳ — دادن Imageها به Minikube

Minikube Imageهای Docker Desktop را خودکار نمی‌بیند. Imageها را بساز و داخل Minikube **بارگذاری** کن:

```powershell
docker build -t demo-backend:1.0 ./backend
docker build -t demo-frontend:1.0 ./frontend

minikube image load demo-backend:1.0
minikube image load demo-frontend:1.0
```

> از `minikube image build` استفاده نکن؛ در این محیط به خطای `403 Forbidden` از Docker Hub می‌خورد. ساخت با Docker Desktop و بعد `image load` مطمئن‌تر است.

در `app.yaml` نوشته شده `imagePullPolicy: Never`؛ یعنی Kubernetes Image را از اینترنت نمی‌گیرد و فقط از Imageهای داخل Minikube استفاده می‌کند.

---

## قدم ۴ — اجرای اپ

```powershell
kubectl apply -f .\k8s\app.yaml
kubectl get pods
```

وضعیت درست:

```text
backend-...     1/1 Running
backend-...     1/1 Running
frontend-...    1/1 Running
```

`1/1` یعنی Pod آماده است. `0/1 Running` یعنی کانتینر روشن است ولی هنوز Ready نشده.

---

## `app.yaml` چه چیزهایی می‌سازد؟

| بخش | معنی |
|-----|------|
| Deployment `backend` با `replicas: 2` | دو Pod از backend |
| readinessProbe روی `/health:6000` | تا health جواب ندهد، Pod آماده حساب نمی‌شود |
| Service `backend` (نوع `ClusterIP`) | اسم داخلی `backend` روی پورت `6000`؛ فقط از داخل کلاستر در دسترس |
| Deployment `frontend` | یک Pod از nginx |
| Service `frontend` (نوع `NodePort`، پورت `30080`) | راه ورود از بیرون به frontend |

nginx داخل frontend به `http://backend:6000` وصل می‌شود؛ اینجا `backend` اسم **Service** است.

---

## قدم ۵ — باز کردن frontend

```powershell
minikube service frontend --url
```

یک آدرس مثل `http://127.0.0.1:XXXXX` می‌دهد. **این ترمینال را باز بگذار**، آدرس را در مرورگر باز کن و دکمه را بزن.

---

## قدم ۶ — تست backend با curl و Swagger

backend از نوع `ClusterIP` است و از سیستم تو مستقیم در دسترس نیست. با `port-forward` یک تونل موقت بساز:

**ترمینال ۱ (باز بماند):**

```powershell
kubectl port-forward svc/backend 3000:6000
```

**ترمینال ۲:**

```powershell
curl.exe http://localhost:3000/health
curl.exe http://localhost:3000/api/messages
```

Swagger در مرورگر:

```text
http://localhost:3000/api-docs/
```

> سمت سیستم تو از پورت `3000` استفاده کن، نه `6000`. مرورگرها پورت `6000` را مسدود می‌کنند (`ERR_UNSAFE_PORT`).  
> اگر ترمینال `port-forward` را ببندی، این آدرس‌ها دیگر کار نمی‌کنند.

تست از داخل کلاستر (بدون port-forward):

```powershell
kubectl exec deploy/backend -- wget -qO- http://127.0.0.1:6000/api/messages
kubectl exec deploy/frontend -- wget -qO- http://backend:6000/api/messages
```

---

## رفع مشکلات

| مشکل | دلیل و راه‌حل |
|------|----------------|
| Node مدت‌ها `NotReady` است | شبکه داخلی کلاستر (`kindnet`) Image را نگرفته؛ دستورهای زیر را بزن |
| backend روی `0/1 Running` مانده | readinessProbe به پورت اشتباه می‌زند؛ پورت در `app.yaml` باید `6000` باشد |
| Pod روی `ErrImagePull` یا `ErrImageNeverPull` است | Image داخل Minikube نیست؛ قدم ۳ را دوباره انجام بده |
| `localhost:3000` در مرورگر باز نمی‌شود | ترمینال `port-forward` بسته شده؛ دوباره اجرایش کن |

رفع `NotReady`:

```powershell
docker pull docker.io/kindest/kindnetd:v20260820-69b56db7
minikube image load docker.io/kindest/kindnetd:v20260820-69b56db7
kubectl delete pod -n kube-system -l app=kindnet
kubectl get nodes
```

---

## دستورهای مفید

```powershell
kubectl get pods -o wide
kubectl get svc
kubectl logs deploy/backend
kubectl logs deploy/frontend
kubectl describe pod <pod-name>
kubectl delete -f .\k8s\app.yaml
minikube stop
```

بعد از تغییر کد:

```powershell
docker build -t demo-backend:1.0 ./backend
docker build -t demo-frontend:1.0 ./frontend
minikube image load demo-backend:1.0
minikube image load demo-frontend:1.0
kubectl rollout restart deployment/backend deployment/frontend
```
