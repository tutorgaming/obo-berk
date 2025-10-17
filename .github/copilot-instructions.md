# OBO-Berk (โอโบ-เบิก) - Expense Tracking Application

## Project Overview
Full-stack expense tracking application for Obodroid company with complete Docker support.

## Technology Stack
- Frontend: React + Vite + TailwindCSS
- Backend: Node.js + Express + MongoDB
- File Upload: Multer
- PDF Generation: PDFKit
- Deployment: Docker & Docker Compose

## Project Structure
- `/backend` - Express API server with MongoDB
- `/frontend` - React application with Vite
- Docker files for containerized deployment
- Helper scripts for easy management

## Development Status
- [x] Project structure created
- [x] Database models implemented (User, Project, Expense)
- [x] API routes created (users, projects, expenses, export)
- [x] Frontend components built (UserSelection, ProjectList, ProjectDetail)
- [x] PDF export functionality with receipt images
- [x] Docker containerization complete
- [x] Documentation complete

## Quick Start

### With Docker (Recommended):
```bash
# Linux/Mac
./start.sh prod

# Windows
start.bat

# Or manually
docker-compose up -d
```

### Manual Installation:
```bash
# Backend
cd backend && npm install && npm run dev

# Frontend (new terminal)
cd frontend && npm install && npm run dev
```

## Documentation
- README.md - Main documentation
- CHANGELOG.md - Version history and changes
- docs/ - All detailed documentation
  - docs/README.md - Documentation index (wiki)
  - docs/QUICKSTART.md - 5-minute setup guide
  - docs/DOCKER.md - Docker usage guide
  - docs/DEPLOYMENT.md - Production deployment
  - docs/TESTING.md - Testing procedures
  - docs/PROJECT_SUMMARY.md - Complete feature list
  - docs/PORT_CHANGES.md - Port configuration
