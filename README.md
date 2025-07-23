# Smart Clicker 2.0
Smart Clicker 2.0 is a modular platform consisting of a backend (**Node.js**, **Express**, **TypeScript**) and a frontend (**Angular**, **TailwindCSS**). Together, they provide secure authentication, real-time data collection, advanced role-based access control, and interactive dashboards for managing engagement and device infrastructure. The system collects, analyzes, and visualizes location and event data sent by Arduino UNO R4 WiFi clicker devices via Azure IoT Hub, supporting multi-office deployments and flexible device provisioning.

## Features
- **Microsoft Entra ID Authentication** – Secure, enterprise-grade login and access control using Microsoft Entra ID.
- **Role-Based Access Control (RBAC)** – Fine-grained permissions and role management for users and administrators.
- **Real-Time Data Collection** – Receives and processes location and event data from Arduino UNO R4 WiFi clicker devices via Azure IoT Hub.
- **REST API** – Comprehensive API for accessing and managing users, roles, offices, questions, and device data.
- **Question of the Day (QOTD) Management** – Create, schedule, and manage daily questions with a calendar interface and response analytics.
- **Data Analysis & Visualization** – Interactive dashboards for engagement and clicker activity, including office floor plan mapping.
- **Multi-Office Support** – Define and manage multiple office spaces, each with separate data, device provisioning, and configuration.
- **Device Provisioning & Configuration** – Automated Azure Device Provisioning Service (Azure DPS) group creation, device twin management, and secure onboarding of new devices.
- **Interactive Floor Mapping** – Visual editor for placing UWB anchors and viewing clicker activity on office floor plans.

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
2. Change directory to desired application:
    ```
    cd smart-clicker-backend
    ```
    OR
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
### Backend
Configure environment variables for CosmosDB, IoT Hub, DPS, Microsoft Entra ID, and Graph API integration.
- `.env` (Development)
- `.env.production` (Production)

Example:
```
FRONTEND_URL=http://localhost:4200
BACKEND_PORT=80
PRODUCTION=false
EXPRESS_SESSION_SECRET=your-session-secret
COSMOS_DB_ENDPOINT=your-cosmosdb-endpoint
COSMOS_DB_DATABASE=your-db-name
COSMOS_DB_CONNECTION_STRING=your-cosmosdb-connection-string
COSMOS_DB_MOCK_DATABASE=your-mock-db-name
COSMOS_MOCK_DB_CONNECTION_STRING=your-mock-db-connection-string
AUTHORITY=https://login.microsoftonline.com/your-tenant-id
ISSUER_VERIFICATION=https://sts.windows.net/
TENANT_ID=your-tenant-id
CLIENT_ID=your-client-id
CLIENT_SECRET=your-client-secret
GRAPH_API_ENDPOINT=https://graph.microsoft.com/
DPS_CONNECTION_STRING=your-dps-connection-string
IOTHUB_HOSTNAME=your-iothub-hostname
IOTHUB_CONNECTION_STRING=your-iothub-connection-string
AZURE_STORAGE_CONNECTION_STRING=your-storage-connection-string
AZURE_STORAGE_CONTAINER_NAME=your-storage-container
AZURE_STORAGE_ENDPOINT=your-storage-endpoint
ADMIN_USER_ID=your-admin-user-id
```

*Note*: For production, the `COSMOS_DB_CONNECTION_STRING` and `AZURE_STORAGE_CONNECTION_STRING` variables can be omitted. 

### Frontend
Configure environment files for API URL and Entra ID settings:
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
### Backend
```
src/
 ├── auth/                  # Authentication and Entra ID integration
 ├── controllers/           # API route controllers
 ├── db/                    # Database utilities (CosmosDB)
 ├── models/                # TypeScript model classes
 ├── services/              # Business logic, RBAC, device provisioning
 ├── utils/                 # Utility functions
 └── index.ts               # Main entry point
.env                        # Environment variables
swagger.json                # OpenAPI/Swagger API definition
```

### Frontend
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
- [Express](https://expressjs.com/)
- [Azure CosmosDB Docs](https://learn.microsoft.com/en-us/azure/cosmos-db/nosql/sdk-nodejs)
- [Azure IoT Hub Docs](https://learn.microsoft.com/en-us/azure/iot-hub/)
- [Azure Device Provisioning Service Docs](https://learn.microsoft.com/en-us/azure/iot-dps/)
- [Microsoft Entra ID](https://learn.microsoft.com/en-us/entra/identity/)
- [Microsoft Graph API](https://learn.microsoft.com/en-us/graph/overview)
- [Angular Docs](https://angular.dev/overview)
- [TailwindCSS Docs](https://tailwindcss.com/docs/installation/framework-guides/angular)

## Contributors
- Andrei Niculescu
- Iasmina Huțupaș
- Mario Constantin