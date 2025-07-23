
# Smart Clicker 2.0 Backend

Smart Clicker 2.0 Backend is a Node.js, Express, and TypeScript service that provides secure authentication, real-time data collection, advanced role-based access control, and a comprehensive REST API for managing users, roles, offices, questions, and device data. It integrates with Microsoft Entra ID for authentication, Azure IoT Hub for device data ingestion, and CosmosDB for persistent storage. The backend supports multi-office deployments, device provisioning, and seamless integration with the frontend dashboard.

## Getting Started

### Prerequisites
Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (LTS recommended)
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
    cd smart-clicker-backend
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

## Project Structure
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

## Documentation
- [Express](https://expressjs.com/)
- [Azure CosmosDB Docs](https://learn.microsoft.com/en-us/azure/cosmos-db/nosql/sdk-nodejs)
- [Azure IoT Hub Docs](https://learn.microsoft.com/en-us/azure/iot-hub/)
- [Azure Device Provisioning Service Docs](https://learn.microsoft.com/en-us/azure/iot-dps/)
- [Microsoft Entra ID](https://learn.microsoft.com/en-us/entra/identity/)
- [Microsoft Graph API](https://learn.microsoft.com/en-us/graph/overview)

## Contributors
- Andrei Niculescu
- Iasmina Huțupaș
- Mario Constantin