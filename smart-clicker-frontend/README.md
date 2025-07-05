# Smart Clicker Frontend

This is the frontend for the **Smart Clicker** project, built using **Angular** and **TailwindCSS**. It provides a user interface for viewing and analysing location data sent by ESP32 devices via Azure IoT Hub.

## Features
- **Question of the Day Input** - Set the Question of the Day and plan questions in advance using a calendar. 
- **Data Analysis** – Basic visualisation of received data.
- **Multi-Building Support** – Filter data based on different office locations.
- **Provisioning and Commissioning Flow (Optional)** - Easily implement the solution in a different location and store data separately.
- **Interactive Floor Mapping (Optional)** - Create a virtual floor plan of the office and determine the UWB anchors locations.
- **Authentication** – Secure access to the dashboard.

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
    cd smart-clicker-frontend
    ```
2. Install dependencies:
    ```
    npm install
    ```
3. Start the development server:
    ```
    ng serve --open
    ```

## Configuration
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
- [Angular Docs](https://angular.dev/overview)
- [TailwindCSS Docs](https://tailwindcss.com/docs/installation/framework-guides/angular)
- [Azure IoT Hub Docs](https://learn.microsoft.com/en-us/azure/iot-hub/)

## Contributors
- Andrei Niculescu
- Iasmina Huțupaș
- Mario Constantin

## License
This project is licensed under the MIT License.