# Docker VPS Manager Web Console

A web-based control panel for managing Docker containers, networks, images, and resources on a VPS server. This application provides both user and admin interfaces for comprehensive Docker management.

## Features

### User Features
- Container management (create, start, stop, restart, remove)
- Network management (create, connect, disconnect, remove)
- Image management (pull, build, remove)
- Docker Compose management
- Dockerfile management
- Resource monitoring (CPU, memory, storage)

### Admin Features
- All user features
- User management (create, edit, delete users)
- Resource allocation per user
- System-wide monitoring
- Detailed resource usage statistics

## Architecture

The application is built using the following technologies:

- **Backend**: Node.js with Express
- **Frontend**: React with TypeScript and Material UI
- **Database**: MongoDB
- **Proxy**: Nginx
- **Containerization**: Docker and Docker Compose

## Prerequisites

- Ubuntu 24.04 (or compatible Linux distribution)
- Docker and Docker Compose installed
- Git (for cloning the repository)

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd docker-vps-manager
   ```

2. Check prerequisites:
   ```
   ./check-prerequisites.sh
   ```

3. Run the setup script:
   ```
   ./setup.sh
   ```

4. Start the application:
   ```
   ./start.sh
   ```

5. Access the application:
   - Open your browser and navigate to `http://localhost`
   - Default admin credentials: admin@example.com / adminpassword

## Maintenance

### Status

To check the status of the application:
```
./status.sh
```
This will display the status of all containers, resource usage, network status, and service accessibility.

### Monitoring

To monitor the resource usage of your Docker containers in real-time:
```
./monitor.sh [refresh_interval_in_seconds]
```
The default refresh interval is 5 seconds if not specified.

### Logs

To view the logs of the application:
```
./logs.sh [options]
```

Options:
- `-s, --service SERVICE`: Service to show logs for (backend, frontend, nginx, mongo, all)
- `-l, --lines LINES`: Number of lines to show (default: 100)
- `-f, --follow`: Follow log output
- `-h, --help`: Show help message

Examples:
```
./logs.sh                     # Show last 100 lines of logs for all services
./logs.sh -s backend          # Show last 100 lines of logs for backend service
./logs.sh -s backend -l 50    # Show last 50 lines of logs for backend service
./logs.sh -s backend -f       # Follow logs for backend service
```

### Backup and Restore

To create a backup of your data:
```
./backup.sh
```

To restore from a backup:
```
./restore.sh backups/vps-manager-backup-YYYY-MM-DD_HH-MM-SS.tar.gz
```

### Start and Stop

To start the application:
```
./start.sh
```

To stop the application or specific services:
```
./stop.sh [service]
```

Where `[service]` is optional and can be one of: backend, frontend, nginx, mongo, all. If not specified, all services will be stopped.

### Restart

To restart the application or specific services:
```
./restart.sh [service]
```

Where `[service]` is optional and can be one of: backend, frontend, nginx, mongo, all. If not specified, all services will be restarted.

### Updates

To update the application to the latest version:
```
./update.sh
```

### Cleanup

To clean up unused Docker resources (containers, networks, volumes, images):
```
./cleanup.sh
```
This script will help you free up disk space by removing unused Docker resources.

### User Management

To create a new user from the command line:
```
./create-user.sh
```
This script will prompt you for user details (username, email, password, role, resource limits) and create a new user account.

To list all users in the system:
```
./list-users.sh
```
This script will display information about all users in the system, including their resource limits and account status.

### Reset Admin Password

If you forget the admin password, you can reset it using:
```
./reset-admin-password.sh
```
This script will prompt you for a new password and update the admin user's password in the database.

### Uninstallation

To uninstall the application:
```
./uninstall.sh
```

## Project Structure

```
.
├── backend/                 # Backend API
│   ├── src/                 # Source code
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Express middleware
│   │   ├── models/          # Mongoose models
│   │   ├── routes/          # API routes
│   │   ├── utils/           # Utility functions
│   │   └── index.js         # Entry point
│   ├── data/                # Data storage
│   │   ├── compose/         # Docker Compose files
│   │   └── dockerfiles/     # Dockerfile storage
│   └── Dockerfile           # Backend Docker image
├── frontend/                # Frontend React app
│   ├── src/                 # Source code
│   │   ├── components/      # Reusable components
│   │   ├── context/         # React context
│   │   ├── pages/           # Page components
│   │   ├── utils/           # Utility functions
│   │   ├── App.tsx          # Main app component
│   │   └── index.tsx        # Entry point
│   └── Dockerfile           # Frontend Docker image
├── nginx/                   # Nginx configuration
│   ├── conf/                # Configuration files
│   └── Dockerfile           # Nginx Docker image
├── data/                    # Persistent data
│   └── mongo/               # MongoDB data
└── docker-compose.yml       # Docker Compose configuration
```

## Development

### Backend Development

```
cd backend
npm install
npm run dev
```

### Frontend Development

```
cd frontend
npm install
npm start
```

## API Documentation

The API documentation is available at `/api/docs` when the application is running.

## Security Considerations

- The application uses JWT for authentication
- All API endpoints are protected with authentication middleware
- Admin-only routes are protected with role-based authorization
- Container resource limits are enforced per user

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
