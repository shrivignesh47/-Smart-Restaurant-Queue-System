# Smart Restaurant Queue System - Project Structure

## Overview
This is an Angular 16+ application with TypeScript, implementing a modular architecture for a Smart Restaurant Queue Management System.

## Folder Structure

```
src/app/
├── core/                    # Core functionality (singleton services)
│   ├── core.module.ts       # Core module with singleton services
│   ├── auth.guard.ts        # Authentication guard for route protection
│   └── http.interceptor.ts  # HTTP interceptor for request/response handling
│
├── shared/                  # Shared resources
│   ├── shared.module.ts     # Shared module exporting common dependencies
│   └── material.module.ts   # Angular Material components module
│
├── features/                # Feature modules (lazy-loaded)
│   ├── tables/              # Table management feature
│   │   └── tables.module.ts
│   ├── queue/               # Queue management feature
│   │   └── queue.module.ts
│   ├── reservation/         # Reservation management feature
│   │   └── reservation.module.ts
│   └── manager/             # Manager dashboard feature
│       └── manager.module.ts
│
└── layout/                  # Layout components
    ├── layout.module.ts     # Layout module
    ├── header/              # Header component
    │   ├── header.component.ts
    │   ├── header.component.html
    │   └── header.component.scss
    ├── footer/              # Footer component
    │   ├── footer.component.ts
    │   ├── footer.component.html
    │   └── footer.component.scss
    └── sidebar/             # Sidebar navigation component
        ├── sidebar.component.ts
        ├── sidebar.component.html
        └── sidebar.component.scss
```

## Key Features

### 1. Core Module
- **Singleton Pattern**: Ensures only one instance across the app
- **Auth Guard**: Protects routes requiring authentication
- **HTTP Interceptor**: Handles global HTTP request/response logic

### 2. Shared Module
- **Material Module**: Centralizes all Angular Material component imports
- **Common Dependencies**: Exports commonly used modules and directives

### 3. Feature Modules
- **Lazy Loading**: Each feature module is lazy-loaded for better performance
- **Route Guards**: Protected by AuthGuard
- **Modular**: Each feature is self-contained

### 4. Layout Components
- **Header**: Application header with navigation
- **Sidebar**: Side navigation menu
- **Footer**: Application footer

## Angular Material Theme
Custom theme configured in `src/styles.scss` using:
- Primary: Indigo palette
- Accent: Pink palette
- Warn: Red palette

## Routing Structure
```
/               → redirects to /tables
/tables         → Tables management (lazy-loaded)
/queue          → Queue management (lazy-loaded)
/reservation    → Reservation management (lazy-loaded)
/manager        → Manager dashboard (lazy-loaded)
```

## Building the Project
```bash
npm install
npm run build
```

## Next Steps
1. Implement business logic in feature modules
2. Add components and services to each feature
3. Implement authentication logic in AuthGuard
4. Add API integration in HTTP interceptor
5. Create UI screens for each feature

## Technologies
- Angular 16.x
- TypeScript
- Angular Material 16.x
- SCSS
- Lazy Loading
- Route Guards
