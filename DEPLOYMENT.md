# 🚀 WorldFamily Deployment Guide для Render.com

## 📋 Предпоставки
- GitHub акаунт
- Render.com акаунт (безплатен)
- Проектите push-нати в GitHub

---

## 🗄️ 1. PostgreSQL Database

### Създаване на PostgreSQL база в Render.com:
1. **Login в Render.com**
2. **New → PostgreSQL**
3. **Настройки:**
   ```
   Name: worldfamily-db
   Database: worldfamily  
   User: worldfamily_user
   Region: Frankfurt (EU Central)
   Plan: Free
   ```
4. **Create Database**
5. **Копирай DATABASE_URL** (ще ти трябва за API-то)

---

## 🌐 2. ASP.NET Core API Deployment  

### Създаване на Web Service в Render.com:
1. **New → Web Service**
2. **Connect GitHub repository**: `WorldFamily.Api`
3. **Настройки:**
   ```
   Name: worldfamily-api
   Region: Frankfurt (EU Central)
   Branch: main
   Root Directory: WorldFamily.Api
   Runtime: Docker
   Plan: Free
   ```

### Build настройки:
```dockerfile
# Render автоматично използва Dockerfile-а в проекта
```

### Environment Variables:
```bash
ASPNETCORE_ENVIRONMENT=Production
DATABASE_URL=[PostgreSQL URL от стъпка 1]
JWT_SECRET_KEY=ThisIsAVerySecretKeyForWorldFamilyAppMinimum32Characters
CORS_ALLOWED_ORIGINS=https://your-frontend-domain.onrender.com
```

### Deploy процес:
4. **Create Web Service**
5. **Изчакай build и deployment** (~5-10 минути)
6. **Копирай API URL** (например: `https://worldfamily-api.onrender.com`)

---

## 🎨 3. Angular Frontend Deployment

### Обновяване на production environment:
```typescript
// src/environments/environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://worldfamily-api.onrender.com' // Твоя API URL
};
```

### Създаване на Static Site в Render.com:
1. **New → Static Site**
2. **Connect GitHub repository**: `WorldFamily.Web`
3. **Настройки:**
   ```
   Name: worldfamily-web
   Branch: main
   Root Directory: WorldFamily.Web
   Build Command: npm install && npm run build
   Publish Directory: dist/world-family.web/browser
   ```

### Environment Variables (Static Site):
```bash
NODE_VERSION=20
```

4. **Create Static Site**
5. **Изчакай build и deployment** (~3-5 минути)

---

## 🔄 4. Финална конфигурация

### Обновяване на CORS в API:
1. **Отиди в API Web Service**
2. **Environment → Edit**
3. **Обнови CORS_ALLOWED_ORIGINS**:
   ```
   CORS_ALLOWED_ORIGINS=https://worldfamily-web.onrender.com
   ```
4. **Save Changes** (автоматично redeploy)

---

## ✅ 5. Тестване

### API тестове:
```bash
# Health check
GET https://worldfamily-api.onrender.com/api/family

# Login test  
POST https://worldfamily-api.onrender.com/api/auth/login
{
  "email": "admin@worldfamily.com",
  "password": "Admin123!"
}
```

### Frontend тестове:
1. **Отвори**: `https://worldfamily-web.onrender.com`
2. **Тествай**:
   - Login страница
   - Family catalog
   - API connectivity

---

## 🚨 Troubleshooting

### Често срещани проблеми:

#### 1. API не стартира:
- Провери Environment Variables
- Провери DATABASE_URL формат
- Виж logs в Render dashboard

#### 2. CORS грешки:
- Провери CORS_ALLOWED_ORIGINS
- Провери production environment.ts
- Redeploy API-то след промени

#### 3. Database connection грешки:
- Провери DATABASE_URL
- Провери PostgreSQL service status
- Database migrations се създават автоматично

#### 4. Build failures:
```bash
# Angular build грешки:
- Провери Node.js версия (20+)
- Провери dependencies в package.json

# API build грешки:  
- Провери .NET 8.0 във project файла
- Провери Dockerfile синтаксис
```

---

## 📈 Performance Tips

### За Free tier:
- **API**: "спи" след 15 минути неактивност (студен старт ~30 сек)
- **Static Site**: Винаги активен, CDN кеширане
- **Database**: 1GB storage, 1 месец backup

### Оптимизации:
- Angular production build (--prod)
- Tree shaking enabled
- Lazy loading routes ✅
- Image optimization за бъдещи feature-и

---

## 🎯 Готови URLs

След успешен deployment:
- **Frontend**: `https://worldfamily-web.onrender.com`
- **API**: `https://worldfamily-api.onrender.com`
- **Swagger**: `https://worldfamily-api.onrender.com/swagger`

---

## 🔐 Default Login Credentials

```
Email: admin@worldfamily.com
Password: Admin123!
```

**Готово за submission! 🎉**