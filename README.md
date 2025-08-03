# 🌍 World Family - Семейна социална мрежа и родословно дърво

## 📖 Описание

**World Family** е пълнофункционална семейна социална мрежа, която позволява на потребителите да създават и управляват родословни дървета, споделят семейни истории, снимки и се свързват с други семейства. Проектът се състои от два основни компонента:

- **🔧 ASP.NET Core Web API** - Backend сървис със собствен MVC интерфейс
- **🎨 Angular Frontend** - Модерен и интерактивен потребителски интерфейс

---

## 🏗️ Архитектура на проекта

```
World Family/
├── 📂 WorldFamily.Api/          # ASP.NET Core Web API + MVC
│   ├── Controllers/             # API контролери
│   ├── Areas/Admin/             # Администраторски панел
│   ├── Views/                   # MVC views (login/register/web interface)
│   ├── Services/                # Business logic
│   ├── DTOs/                    # Data Transfer Objects
│   └── Middleware/              # Custom middleware
├── 📂 WorldFamily.Data/         # Entity Framework модели
│   ├── Models/                  # Entity модели
│   ├── Migrations/              # Database migrations
│   └── SeedData.cs              # Начални данни
└── 📂 WorldFamily.Web/          # Angular Frontend
    ├── src/app/features/        # Функционални модули
    ├── src/app/core/            # Core услуги
    └── src/app/shared/          # Споделени компоненти
```

---

## 🚀 Функционалности

### 👥 Потребителско управление
- **Регистрация и вход** с валидация на парола (9+ символа, специални символи)
- **Роли**: User и Administrator
- **Профили** с лична информация и дата на раждане

### 🏠 Семейно управление
- **Създаване на семейства** с описание
- **Добавяне на членове** с пълна биографична информация
- **Родственни връзки** между членовете на семейството
- **Публични семейни страници** за разглеждане

### 📸 Мултимедия
- **Качване на снимки** с описания и местоположение
- **Семейни истории** с rich text съдържание
- **Галерия** с възможност за лайкване и коментиране

### 🔍 Търсене и филтриране
- **Търсене по имена** на семейства и членове
- **Филтриране по дати** и местоположения
- **Пагинация** за големи резултати

### 👨‍💼 Администраторски панел
- **Dashboard** със статистики в реално време
- **Управление на потребители** и семейства
- **Системна информация** и мониториране
- **Отчети** за активност

---

## 🛠️ Технологии

### Backend (ASP.NET Core 8.0)
- **Entity Framework Core** с PostgreSQL/SQLite
- **ASP.NET Core Identity** за автентикация
- **JWT токени** за API сигурност
- **AutoMapper** за mapping между модели
- **Swagger/OpenAPI** за документация
- **Custom Middleware** за сигурност и error handling

### Frontend (Angular 18)
- **TypeScript** с строга типизация
- **RxJS** за reactive programming
- **Angular Router** с guards
- **Angular Forms** с реактивна валидация
- **Bootstrap 5** за responsive дизайн
- **Font Awesome** икони

### База данни
- **PostgreSQL** (Production)
- **SQLite** (Development)
- **Entity Framework Core** migrations

---

## 📋 Предварителни изисквания

Преди стартиране на проекта, уверете се че имате инсталирано:

- **.NET 8.0 SDK** или по-нов
- **Node.js 18+** и **npm**
- **PostgreSQL** (за production) или използвайте SQLite (по подразбиране)
- **Git** за клониране на репозиторията

---

## 🚀 Инсталация и стартиране

### 1️⃣ Клониране на проекта

```bash
git clone https://github.com/your-username/world-family.git
cd world-family
```

### 2️⃣ Стартиране на Backend (ASP.NET Core API)

```bash
# Отидете в API директорията
cd WorldFamily.Api

# Възстановете NuGet пакетите
dotnet restore

# Стартирайте миграциите (създава базата данни)
dotnet ef database update

# Стартирайте API сървъра
dotnet run
```

**API ще бъде достъпно на:** `https://localhost:5001` и `http://localhost:5000`

### 3️⃣ Стартиране на Frontend (Angular)

Отворете нов терминал:

```bash
# Отидете в Web директорията
cd WorldFamily.Web

# Инсталирайте npm зависимостите
npm install

# Стартирайте development сървъра
ng serve
```

**Angular приложението ще бъде достъпно на:** `http://localhost:4200`

---

## 🔑 Test акаунти

След стартиране, можете да използвате следните акаунти за тестване:

### 👨‍💼 Администратор
- **Email:** `admin@worldfamily.com`
- **Парола:** `Admin123!`
- **Роля:** Administrator

### 👤 Демо потребители
- **Email:** `john@demo.com` | **Парола:** `Demo123!`
- **Email:** `jane@demo.com` | **Парола:** `Demo123!`
- **Роля:** User

---

## 🌐 API Endpoints

### 🔐 Автентикация
- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Вход  
- `POST /api/auth/logout` - Изход

### 👥 Семейства
- `GET /api/family` - Всички семейства (публично)
- `GET /api/family/{id}` - Детайли за семейство
- `POST /api/family` - Създаване на семейство (auth)
- `PUT /api/family/{id}` - Редактиране (auth)
- `DELETE /api/family/{id}` - Изтриване (auth)

### 👤 Членове на семейството
- `GET /api/member/family/{familyId}` - Членове по семейство
- `GET /api/member/{id}` - Детайли за член
- `POST /api/member` - Добавяне на член (auth)
- `PUT /api/member/{id}` - Редактиране (auth)
- `DELETE /api/member/{id}` - Изтриване (auth)

### 📸 Снимки
- `GET /api/photo` - Всички снимки
- `GET /api/photo/{id}` - Детайли за снимка
- `POST /api/photo` - Качване на снимка (auth)
- `DELETE /api/photo/{id}` - Изтриване (auth)

### 📖 Истории
- `GET /api/story` - Всички истории
- `GET /api/story/{id}` - Детайли за история
- `POST /api/story` - Създаване (auth)
- `PUT /api/story/{id}` - Редактиране (auth)
- `DELETE /api/story/{id}` - Изтриване (auth)

### 👨‍💼 Администрация
- `GET /api/admin/dashboard` - Dashboard статистики (Admin)
- `GET /api/admin/users` - Всички потребители (Admin)

**📚 Пълна API документация:** `https://localhost:5001/swagger`

---

## 💻 MVC Web Interface

API-то също предлага традиционен MVC уеб интерфейс:

- **`/login`** - Вход в системата
- **`/register`** - Регистрация
- **`/web`** - Публичен каталог на семейства
- **`/web/{id}`** - Детайли за семейство
- **`/dashboard`** - Потребителски dashboard (auth)
- **`/admin`** - Администраторски панел (admin)

---

## 🎨 Angular Routes

- **`/`** - Начална страница
- **`/auth/login`** - Вход
- **`/auth/register`** - Регистрация  
- **`/families`** - Каталог на семейства
- **`/families/{id}`** - Детайли за семейство
- **`/member/{id}`** - Профил на член
- **`/admin/**`** - Администраторски секции

---

## 🔧 Конфигурация

### appsettings.json (API)

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=worldfamily.db",
    "PostgreSQLConnection": "Host=localhost;Database=worldfamily;Username=postgres;Password=password"
  },
  "DatabaseProvider": "SQLite",
  "JwtSettings": {
    "SecretKey": "YourSecretKeyHere",
    "Issuer": "WorldFamilyApi",
    "Audience": "WorldFamilyClients",
    "ExpirationMinutes": 60
  },
  "CORS": {
    "AllowedOrigins": ["http://localhost:4200"]
  }
}
```

### environment.ts (Angular)

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000'
};
```

---

## 🧪 Тестване

### Backend тестове
```bash
cd WorldFamily.Api
dotnet test
```

### Frontend тестове  
```bash
cd WorldFamily.Web
npm test
```

---

## 🏭 Production Deployment

### 🐳 Docker (Препоръчително)

```bash
# Build Docker image
docker build -t world-family-api .

# Run with PostgreSQL
docker-compose up -d
```

### ☁️ Cloud Deployment

Проектът е готов за deployment на:
- **Render.com** (API + PostgreSQL)
- **Vercel/Netlify** (Angular frontend)
- **Azure/AWS** (пълен stack)

---

## 📊 Функционални изисквания

### ✅ ASP.NET Core изисквания
- [x] **15+ страници/views** - Dashboard, семейства, членове, галерия, админ панел
- [x] **6+ модела** - User, Family, FamilyMember, Relationship, Photo, Story, Comment  
- [x] **6+ контролера** - Auth, Family, Member, Photo, Story, Admin
- [x] **Areas** - Admin area с отделен layout
- [x] **Identity система** - User/Admin роли
- [x] **Валидация** - Client и server-side
- [x] **Пагинация** - За семейства, снимки, истории
- [x] **Търсене** - По имена, дати, локации
- [x] **Error handling** - Custom error страници
- [x] **Сигурност** - CSRF protection, JWT auth

### ✅ Angular изисквания  
- [x] **4+ dynamic pages** - Семейства, детайли, профили, админ
- [x] **CRUD операции** - Пълно управление на данни
- [x] **Routing** - 10+ routes с guards
- [x] **TypeScript интерфейси** - User, Family, Member, Photo, Story
- [x] **Observables** - За всички HTTP заявки
- [x] **RxJS операторите** - map, filter, catchError, finalize
- [x] **Lifecycle hooks** - OnInit, OnDestroy
- [x] **Pipes** - За дати, текст, числа
- [x] **Валидация** - Reactive forms с custom validators
- [x] **External CSS** - Bootstrap 5

---

## 🤝 Принос

1. Fork проекта
2. Създайте feature branch (`git checkout -b feature/amazing-feature`)
3. Commit промените (`git commit -m 'Add amazing feature'`)
4. Push към branch (`git push origin feature/amazing-feature`)
5. Отворете Pull Request

---

## 📄 Лиценз

Този проект е лицензиран под MIT License - вижте [LICENSE](LICENSE) файла за детайли.

---

## 👨‍💻 Автор

**Мартин Стефанов**
- 📧 Email: martin@example.com
- 🐙 GitHub: [@marsteyor](https://github.com/marsteyor)

---

## 🙏 Благодарности

- **SoftUni** за отличното обучение
- **Microsoft** за .NET екосистемата  
- **Angular Team** за страхотния framework
- **Bootstrap Team** за UI компонентите

---

**⭐ Ако проектът ви харесва, дайте му звездичка в GitHub!**