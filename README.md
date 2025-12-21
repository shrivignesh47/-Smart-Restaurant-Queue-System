# Smart Restaurant Queue & Table Management System

A full-stack web application to manage restaurant table availability, waiting queues, and reservations in real time.

This repository follows a **branch-based architecture** for clean separation of frontend and backend development.

---

## 🧱 Tech Stack

Frontend:
- Angular 16+
- TypeScript
- Angular Material

Backend:
- Node.js
- Express.js
- TypeScript

Database:
- MySQL

Tools:
- Git
- GitHub
- Postman
- npm

---

## 🌿 Branch Strategy

```text
main             -> Documentation & project overview
frontend-angular -> Angular application
backend-express  -> Node.js + Express API
```

Rules:
- `main` contains only documentation
- Development happens only in feature branches
- No feature code in `main`

---

## 📁 Frontend Folder Structure (Angular)

```text
src/
└── app/
    ├── core/
    │   ├── auth.guard.ts
    │   ├── http.interceptor.ts
    │   └── core.module.ts
    ├── shared/
    │   ├── material.module.ts
    │   └── shared.module.ts
    ├── features/
    │   ├── tables/
    │   ├── queue/
    │   ├── reservation/
    │   └── manager/
    ├── layout/
    │   ├── header/
    │   ├── footer/
    │   └── sidebar/
    ├── app-routing.module.ts
    ├── app.component.ts
    └── app.module.ts
```

---

## 📁 Backend Folder Structure (Express + TypeScript)

```text
src/
├── config/            # Env & DB config
├── modules/
│   ├── users/
│   ├── tables/
│   ├── queue/
│   └── reservations/
├── routes/
├── middleware/
├── utils/
├── app.ts
└── server.ts
```

---

## ⚙️ Prerequisites

```text
Node.js v18+
npm
Angular CLI
MySQL
Git
```

Install Angular CLI:
```bash
npm install -g @angular/cli
```

---

## 🚀 Frontend Setup (Angular)

```bash
git checkout frontend-angular
npm install
ng serve
```

Frontend URL:
```text
http://localhost:4200
```

Build frontend:
```bash
ng build
```

---

## 🚀 Backend Setup (Express + TypeScript)

```bash
git checkout backend-express
npm install
```

Create `.env` file from `.env.example`:

```text
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=restaurant_db
```

Run backend (development):
```bash
npm run dev
```

Build backend:
```bash
npm run build
```

Start backend:
```bash
npm start
```

Backend URL:
```text
http://localhost:3000
```

---

## 🧪 API Testing

```text
Base URL: http://localhost:3000/api
Tool: Postman
```

---

## 🔐 User Roles (Planned)

```text
Customer -> View tables, join queue, make reservations
Manager  -> Manage tables, queue, seating
Admin    -> Analytics (optional)
```

---

## 🧠 Development Guidelines

```text
- Keep commits small
- Follow branch ownership
- Agree API contracts before integration
- Use proper HTTP status codes
- Keep code modular and readable
```

---
