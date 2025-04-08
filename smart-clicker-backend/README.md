# Smart Clicker Backend

This is the backend for the **Smart Clicker** project, built using **Node.js**, **Express**, and **TypeScript**. It provides a REST API for retrieving location data sent by ESP32 devices via Azure IoT Hub.

## Getting Started

### Prerequisites
Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (LTS recommended)
- [Git](https://git-scm.com/)

### Installation
1. Clone the repository:
    ```
    git clone https://github.com/OL-Smart-Clicker/app-repo.git
    cd smart-clicker-backend
    ```
2. Install dependencies:
    ```
    npm install
    ```
3. Start the development server:
    ```
    npm run dev
    ```

## Configuration
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

## Project Structure
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

## Documentation
- [Express](https://expressjs.com/)
- [Azure CosmosDB Docs](https://learn.microsoft.com/en-us/azure/cosmos-db/nosql/sdk-nodejs)

## Contributors
- Andrei Niculescu
- Iasmina Huțupaș
- Luc Oerlemans
- Mario Constantin

## License
This project is licensed under the MIT License.