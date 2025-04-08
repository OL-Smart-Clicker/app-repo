# Smart Clicker 2.0
The Smart Clicker project consists of a backend (**Node.js**, **Express**, **TypeScript**) and a frontend (**Angular**, **TailwindCSS**) that together provide a system for collecting, analysing, and visualising location data sent by ESP32 devices via Azure IoT Hub.

## Features
- **Real-time Data Collection** – Receives location data from ESP32 devices via Azure IoT Hub. 
- **REST API** – Provides an API for accessing stored data.
- **Authentication** – Secure access to the dashboard.
- **Question of the Day Input** - Set the Question of the Day and plan questions in advance using a calendar. 
- **Data Analysis** – Basic visualisation of received data.
- **Multi-Building Support** – Filter data based on different office locations.
- **Provisioning and Commissioning Flow (Optional)** - Easily implement the solution in a different location and store data separately.
- **Interactive Floor Mapping (Optional)** - Create a virtual floor plan of the office and determine the UWB anchors locations.

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

### Backend
2. Install dependencies:
    ```
    npm install
    ```
3. Start the development server:
    ```
    npm run dev
    ```

### Frontend
2. Install dependencies:
    ```
    npm install
    ```
3. Start the development server:
    ```
    ng serve --open
    ```

## Configuration
### Backend
Modify the environment files for CosmosDB and IoT Hub settings.
- `.env` (Development)
- `.env.production` (Production)

Example:
    
    FRONTEND_URL=http://localhost:4200
    BACKEND_PORT=80
    PRODUCTION=false
    EXPRESS_SESSION_SECRET=null
    COSMOS_DB_ENDPOINT=null
    AZURE_CLIENT_ID=null
    COSMOS_DB_DATABASE=null
    COSMOS_DB_MOCK_DATABASE=null
    AUTHORITY=null
    ISSUER_VERIFICATION=null
    TENANT_ID=null
    CLIENT_ID=null
    CLIENT_SECRET=null
    GRAPH_API_ENDPOINT=https://graph.microsoft.com/

### Frontend
Modify the environment files for API and Entra ID settings.
- `src/environments/environment.ts` (Development)
- `src/environments/environment.prod.ts` (Production)

Example:
    
    export const env = {
        PRODUCTION: false,
        API_URL: 'http://localhost:80',
        REDIRECT_URL: 'http://localhost:4200',
        CLIENT_ID: '',
        AUTHORITY: '',
        TOKEN_SCOPE: ''
    }

## Project Structure
### Backend
```
src/
 ├── auth/                  # Authentication utilities
 ├── controllers/           # Route controllers
 ├── db/                    # Database utilities
 ├── models/                # Model classes
 ├── services/              # Business logic and data handling
 ├── utils/                 # Utility functions
 └── index.ts               # Main entry point
.env                        # Environment variables
swagger.json                # Swagger API definition
```

### Frontend
```
src/
 ├── app/                   # Angular components & services
 │   ├── components/        # UI components
 │   ├── pages/             # Main pages (dashboard, settings, etc.)
 │   ├── services/          # API and data handling services
 │   ├── types/             # Type declarations
 │   ├── utils/             # Utility functions
 │   ├── app.module.ts      # Main module
 │   └── app.routes.ts      # Website routes
 ├── assets/                # Static assets
 ├── environments/          # Environment configurations
 ├── styles.css             # Global styles + Tailwind configuration
 ├── main.ts                # Entry point
 └── index.html             # Main HTML file
```

## Documentation
- [Express](https://expressjs.com/)
- [Azure CosmosDB Docs](https://learn.microsoft.com/en-us/azure/cosmos-db/nosql/sdk-nodejs)
- [Angular Docs](https://angular.dev/overview)
- [TailwindCSS Docs](https://tailwindcss.com/docs/installation/framework-guides/angular)
- [Azure IoT Hub Docs](https://learn.microsoft.com/en-us/azure/iot-hub/)

## Contributors
- Andrei Niculescu
- Iasmina Huțupaș
- Luc Oerlemans
- Mario Constantin

## License
This project is licensed under the MIT License.