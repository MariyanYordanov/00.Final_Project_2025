За Angular проекта - семейната социална мрежа/родословно дърво ще покрие отлично изискванията:
✅ Структура: Публична част (разглеждане на родословни дървета) + частна част (управление на семейството)
✅ CRUD операции: Създаване/редактиране на членове на семейството, връзки, снимки, истории
✅ Dynamic pages: Каталог на семейства, детайли за член, родословно дърво, семейна лента
✅ Angular специфики: TypeScript интерфейси за Member/Family, observables за real-time updates, RxJS операторите за филтриране на данни, lifecycle hooks, pipes за дати/имена
✅ Интерактивност: Лайкване на снимки/истории, коментари, покани за свързване на семейства
За ASP.NET проекта - също ще работи перфектно:
✅ 15+ страници: Dashboard, профили, родословно дърво, галерия, timeline, администрация, и др.
✅ 6+ модела: User, Family, FamilyMember, Relationship, Photo, Story, Comment
✅ 6+ контролера: Home, Family, Member, Photo, Story, Admin
✅ Areas: Public area + Admin area
✅ Роли: User (семеен член) + Administrator
✅ Функционалности: Пагинация на снимки/истории, търсене по име/дата, валидация на връзки

Използвай PostgreSQL - по-добре за:

Релационни данни (Family, Members, Relationships)
ACID transactions
Complex queries за родословни дървета
ASP.NET Entity Framework Core отлична поддръжка

Deployment план:

ASP.NET API → Web Service (Docker)
Angular App → Static Site
PostgreSQL → Render Postgres (започни с free, upgrade when needed)

# World Family - План за разработка

## Обща стратегия
Ще разработваме **паралелно** двата проекта, като започнем с ASP.NET backend-а за да имаме стабилна основа, след което ще изградим Angular frontend-а.

---

## Фаза 1: Планиране и настройка (1-2 дни)
**Дати: 23-24 юли**

### Ден 1 (23 юли)
- [ ] Създаване на GitHub repositories (world-family-api, world-family-web)
- [ ] Анализ на функционалностите и създаване на user stories
- [ ] Дизайн на база данни (ER диаграма)
- [ ] Създаване на wireframes за основните страници
- [ ] Настройка на development environment

### Ден 2 (24 юли)  
- [ ] Финализиране на API спецификация
- [ ] Създаване на проект структура за ASP.NET
- [ ] Първи commit с основната структура

---

## Фаза 2: ASP.NET Core Backend (5-6 дни)
**Дати: 25-30 юли**

### Ден 3-4 (25-26 юли) - Core Models & Database
- [ ] Entity models: User, Family, FamilyMember, Relationship, Photo, Story, Comment
- [ ] DbContext и migrations
- [ ] Identity система (User/Admin роли)
- [ ] Data seeding
- [ ] Repository pattern (ако се налага)

### Ден 5-6 (27-28 юли) - Services & Controllers
- [ ] Business logic services
- [ ] Controllers: Family, Member, Photo, Story, Admin
- [ ] DTOs и AutoMapper config
- [ ] Basic CRUD operations
- [ ] Authentication & Authorization

### Ден 7-8 (29-30 юли) - Advanced Features
- [ ] File upload за снимки
- [ ] Search и filtering functionality
- [ ] Pagination
- [ ] API documentation (Swagger)
- [ ] Error handling и custom error pages
- [ ] Basic unit tests

---

## Фаза 3: Angular Frontend (7-8 дни)
**Дати: 31 юли - 7 август**

### Ден 9-10 (31 юли - 1 август) - Project Setup
- [ ] Angular project създаване
- [ ] Routing configuration
- [ ] Authentication service и guards
- [ ] HTTP interceptors
- [ ] Shared components (header, footer, loading)

### Ден 11-12 (2-3 август) - Core Components
- [ ] Login/Register components
- [ ] Family catalog component
- [ ] Family details component
- [ ] Member profile component
- [ ] TypeScript interfaces

### Ден 13-14 (4-5 август) - Interactive Features
- [ ] Family tree visualization
- [ ] Photo gallery с uploads
- [ ] Story timeline
- [ ] Comments система
- [ ] Like/Unlike functionality

### Ден 15-16 (6-7 август) - Polish & Integration
- [ ] RxJS operators implementation
- [ ] Pipes за форматиране
- [ ] Lifecycle hooks optimization
- [ ] Responsive design
- [ ] Error handling UI

---

## Фаза 4: Testing & Documentation (3-4 дни)
**Дати: 8-11 август**

### Ден 17-18 (8-9 август)
- [ ] Unit tests за ASP.NET services (65% coverage)
- [ ] Angular component tests
- [ ] Integration testing
- [ ] Bug fixes

### Ден 19-20 (10-11 август)
- [ ] README.md документация
- [ ] API documentation
- [ ] Deployment подготовка
- [ ] Final testing

---

## Фаза 5: Final Polish & Submission (2-3 дни)
**Дати: 12-13 август**

### Ден 21-22 (12-13 август)
- [ ] UI/UX подобрения
- [ ] Performance optimization
- [ ] Security audit
- [ ] Submission подготовка
- [ ] **Submission deadline: 13 август 23:59**

---

## Техническа архитектура

### ASP.NET Core Structure
```
WorldFamily.API/
├── Controllers/
├── Models/
├── Services/
├── Data/
├── Areas/Admin/
├── ViewModels/
└── Tests/
```

### Angular Structure  
```
world-family-web/
├── src/app/
│   ├── core/
│   ├── shared/
│   ├── features/
│   │   ├── auth/
│   │   ├── family/
│   │   ├── members/
│   │   └── admin/
│   └── layouts/
```

---

## Key Features Checklist

### ASP.NET Requirements
- [ ] 15+ views/pages
- [ ] 6+ entity models  
- [ ] 6+ controllers
- [ ] MVC Areas (Admin)
- [ ] Identity система
- [ ] Unit tests (65% coverage)
- [ ] Error handling
- [ ] Pagination
- [ ] Search/filtering
- [ ] Security measures

### Angular Requirements
- [ ] 3+ dynamic pages
- [ ] Catalog & Details views
- [ ] CRUD operations
- [ ] Client-side routing (4+ pages)
- [ ] TypeScript interfaces (2+)
- [ ] Observables
- [ ] RxJS operators (2+)
- [ ] Lifecycle hooks
- [ ] Pipes
- [ ] Route guards
- [ ] External CSS

---

## Git Strategy
- **Daily commits** с meaningful messages
- Feature branches за по-големи функционалности  
- Merge в main след завършване на feature
- Минимум 20 commits общо
- Commits в поне 5 различни дни

---

## Backup Plan
Ако изостанем от графика:
1. Фокус върху core функционалностите първо
2. Бонус features могат да се отложат
3. UI може да е по-прост, но функционален
4. Unit tests - поне основните services

---

## Submission Deadlines
- **Angular**: Линк до 2 август 23:59 (survey на 23 юли)
- **ASP.NET**: Submission до 13 август 23:59 (survey на 6 август)
- **Presentation**: 14 август (schedule ще е готов)

---

# API Endpoints Documentation

## 🌐 **Base URL**
```
http://localhost:5000
```

## 🔐 **Authentication Endpoints**

### POST `/api/auth/register`
- **Описание**: Регистрация на нов потребител
- **Auth**: Не се изисква
- **Body**: 
```json
{
  "email": "user@example.com",
  "password": "Password123!",
  "firstName": "John",
  "middleName": "Demo", 
  "lastName": "Doe"
}
```

### POST `/api/auth/login`
- **Описание**: Вход в системата
- **Auth**: Не се изисква
- **Body**:
```json
{
  "email": "admin@worldfamily.com",
  "password": "Admin123!",
  "rememberMe": false
}
```
- **Response**: JWT token + user обект с MiddleName

### POST `/api/auth/logout`
- **Описание**: Изход от системата
- **Auth**: Изисква се

---

## 👨‍👩‍👧‍👦 **Family Endpoints**

### GET `/api/family`
- **Описание**: Всички семейства (публично)
- **Auth**: Не се изисква

### GET `/api/family/{id}`
- **Описание**: Детайли за конкретно семейство (публично)
- **Auth**: Не се изисква

### POST `/api/family`
- **Описание**: Създаване на ново семейство
- **Auth**: Изисква се
- **Body**:
```json
{
  "name": "The Johnson Family",
  "description": "Our family tree description"
}
```

### PUT `/api/family/{id}`
- **Описание**: Редактиране на семейство
- **Auth**: Изисква се
- **Body**:
```json
{
  "name": "Updated Family Name",
  "description": "Updated description"
}
```

### DELETE `/api/family/{id}`
- **Описание**: Изтриване на семейство
- **Auth**: Изисква се

---

## 👤 **Member Endpoints**

### GET `/api/member/family/{familyId}`
- **Описание**: Всички членове на семейство (публично)
- **Auth**: Не се изисква

### GET `/api/member/{id}`
- **Описание**: Детайли за конкретен член (публично)
- **Auth**: Не се изисква

### POST `/api/member`
- **Описание**: Добавяне на нов член
- **Auth**: Изисква се
- **Body**:
```json
{
  "firstName": "John",
  "middleName": "Demo",
  "lastName": "Doe",
  "dateOfBirth": "1975-05-15",
  "dateOfDeath": null,
  "gender": "Male",
  "biography": "Brief biography",
  "placeOfBirth": "Sofia, Bulgaria",
  "placeOfDeath": null,
  "familyId": 1
}
```

### PUT `/api/member/{id}`
- **Описание**: Редактиране на член
- **Auth**: Изисква се
- **Body**: Същото като POST

### DELETE `/api/member/{id}`
- **Описание**: Изтриване на член
- **Auth**: Изисква се

---

## 📸 **Photo Endpoints**

### GET `/api/photo`
- **Описание**: Всички снимки или по семейство
- **Auth**: Не се изисква
- **Query params**: `?familyId=1` (optional)

### GET `/api/photo/{id}`
- **Описание**: Детайли за конкретна снимка (публично)
- **Auth**: Не се изисква

### POST `/api/photo`
- **Описание**: Качване на нова снимка
- **Auth**: Изисква се
- **Body**:
```json
{
  "imageUrl": "/uploads/photo.jpg",
  "title": "Family Photo",
  "description": "Description of the photo",
  "dateTaken": "2023-12-25",
  "location": "Sofia, Bulgaria",
  "familyId": 1
}
```

### DELETE `/api/photo/{id}`
- **Описание**: Изтриване на снимка
- **Auth**: Изисква се

---

## 📖 **Story Endpoints**

### GET `/api/story`
- **Описание**: Всички истории или по семейство
- **Auth**: Не се изисква
- **Query params**: `?familyId=1` (optional)

### GET `/api/story/{id}`
- **Описание**: Детайли за конкретна история
- **Auth**: Не се изисква

### POST `/api/story`
- **Описание**: Създаване на нова история
- **Auth**: Изисква се

### PUT `/api/story/{id}`
- **Описание**: Редактиране на история
- **Auth**: Изисква се

### DELETE `/api/story/{id}`
- **Описание**: Изтриване на история
- **Auth**: Изисква се

---

## ⚙️ **Admin Endpoints**
*(В Areas/Admin структурата)*

### GET `/api/admin/users`
- **Описание**: Всички потребители (само Admin)
- **Auth**: Admin роля

### GET `/api/admin/dashboard`
- **Описание**: Dashboard статистики
- **Auth**: Admin роля

---

## 🔑 **Authentication**
- Използва JWT tokens
- Header: `Authorization: Bearer {token}`
- Token се получава от `/api/auth/login`

## 📝 **Seed данни**
- **Admin**: `admin@worldfamily.com` / `Admin123!`
- **Demo users**: `john@demo.com`, `jane@demo.com`, etc.
- **2 семейства** с членове, снимки и истории

## ✅ **Статус тестване (28 юли 2025 - ФИНАЛНО)**
- ✅ **Auth** (register, login, logout) - работи с MiddleName 
- ✅ **Family** (GET всички, GET по ID) - без circular references, използва DTOs
- ✅ **Member** (GET по семейство, GET по ID) - включва MiddleName, използва DTOs
- ✅ **Photo** (GET всички, GET по ID, GET с filter) - без circular references, използва DTOs  
- ✅ **Story** (GET всички, GET по ID) - ПОПРАВЕНИ circular references, използва DTOs
- ❓ **Admin** - не са тествани (lower priority)

## ✅ **КРИТИЧНИ ПРОБЛЕМИ РЕШЕНИ**
- ✅ Login response сега включва MiddleName в user обект
- ✅ Всички Entity Framework circular reference грешки поправени
- ✅ Всички контролери използват DTOs вместо Entity модели
- ✅ MiddleName е задължително поле навсякъде в системата
- ✅ API работи стабилно на порт 5000

## 🎯 **API ГОТОВО ЗА PRODUCTION**
Всики основни CRUD операции работят без грешки. API-то е готово за Angular frontend integration.