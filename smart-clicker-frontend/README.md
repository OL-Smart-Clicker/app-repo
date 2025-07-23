
# Smart Clicker 2.0 Frontend

This is the frontend for **Smart Clicker 2.0**, built with **Angular** and **TailwindCSS**. It provides a secure, role-based user interface for managing engagement and device infrastructure across multiple office locations. The frontend communicates with the backend API to visualize real-time and historical data, manage QOTDs, users, and roles, and configure office spaces and devices.

## Getting Started

### Prerequisites
Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (LTS recommended)
- [Angular CLI](https://angular.io/cli)
- [Git](https://git-scm.com/)

### Installation
1. Clone the repository:
    ```
    git clone https://github.com/OL-Smart-Clicker/app-repo.git
    ```
    OR
    
    Extract the `app-repo.zip` archive.
2. Change directory:
    ```
    cd smart-clicker-frontend
    ```
3. Install dependencies:
    ```
    npm install
    ```
4. Configure environment variables as described below.
5. Start the development server:
    ```
    npm run dev
    ```

## Configuration
Modify the environment files for API and Entra ID settings:
- `src/environments/environment.ts` (Development)
- `src/environments/environment.prod.ts` (Production)

Example:
```
export const env = {
    PRODUCTION: false,
    API_URL: 'http://localhost:80',
    REDIRECT_URL: 'http://localhost:4200',
    CLIENT_ID: 'your-client-id',
    AUTHORITY: 'https://login.microsoftonline.com/your-tenant-id',
    TOKEN_SCOPE: 'api://your-client-id/.default'
}
```

## Project Structure
```
src/
 ├── app/
 │   ├── components/        # Reusable UI components (sidebar, layout, etc.)
 │   ├── pages/             # Main pages (dashboard, QOTD, users, roles, offices)
 │   ├── services/          # API clients and business logic
 │   ├── types/             # TypeScript interfaces and enums
 │   ├── utils/             # Utility functions
 │   ├── app.module.ts      # Main Angular module
 │   └── app.routes.ts      # Application routes
 ├── assets/                # Static assets (images, icons, floor plans)
 ├── environments/          # Environment configs
 ├── styles.css             # TailwindCSS and global styles
 ├── main.ts                # Angular entry point
 └── index.html             # Main HTML file
```

## Documentation
- [Angular Docs](https://angular.dev/overview)
- [TailwindCSS Docs](https://tailwindcss.com/docs/installation/framework-guides/angular)
- [Microsoft Entra ID](https://learn.microsoft.com/en-us/entra/identity/)

## Contributors
- Andrei Niculescu
- Iasmina Huțupaș
- Mario Constantin