# 🚀 Quick Start Guide - OBO-Berk

Get OBO-Berk running in 5 minutes!

## Prerequisites

Choose **ONE** of the following:

### Option A: Docker (Easiest - Recommended!)
- Install [Docker Desktop](https://www.docker.com/products/docker-desktop)
- That's it! 🎉

### Option B: Manual Installation
- [Node.js 18+](https://nodejs.org/)
- [MongoDB](https://www.mongodb.com/try/download/community)

## 🐳 Quick Start with Docker (Recommended)

### Linux/Mac:
```bash
# Clone the repository
git clone <your-repo-url>
cd obo-berk

# Start everything with one command!
./start.sh prod

# Or use the interactive menu
./start.sh
```

### Windows:
```cmd
# Clone the repository
git clone <your-repo-url>
cd obo-berk

# Double-click start.bat or run:
start.bat
```

### Using Docker Compose directly:
```bash
# Start all services (MongoDB, Backend, Frontend)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

**That's it!** 🎉

Access the application at:
- Frontend: http://localhost
- Backend API: http://localhost:5000/api

## 💻 Development Mode (with hot reload)

```bash
# Linux/Mac
./start.sh dev

# Windows
start.bat
# Then select option 2

# Or directly with docker-compose
docker-compose -f docker-compose.dev.yml up
```

Access at: http://localhost:5173

## 🛠️ Manual Installation (Without Docker)

### 1. Start MongoDB

**Linux/Mac:**
```bash
mongod
```

**Windows:**
```cmd
# MongoDB should start automatically if installed as a service
# Or run: "C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe"
```

### 2. Install and Start Backend

```bash
cd backend
npm install
npm run dev
```

Backend will run on http://localhost:5000

### 3. Install and Start Frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend will run on http://localhost:5173

## 📖 Using the Application

### 1. Manage Users (New!)
- Click "Manage Users" in the navigation menu
- View all users in a table format
- Create new users with name, email, and department
- Edit existing users (except email)
- Delete users (with confirmation)

### 2. Create or Select a User
- On the homepage, create a new user or select an existing one
- Fill in name, email, and department (optional)

### 3. Create a Project
- After selecting a user, click "New Project"
- Enter project name, description, and budget
- Click "Create Project"

### 3. Add Expenses
- Click on a project to view details
- Click "Add Expense"
- Fill in:
  - Expense name (e.g., "Team Lunch")
  - Type (eating, traveling, accommodation, etc.)
  - Amount in Thai Baht (฿)
  - Date
  - Notes (optional)
  - Upload receipt image/PDF
- Click "Add Expense"

### 4. Export PDF Report
- In the project detail page
- Optionally filter by expense type
- Click "Export PDF"
- PDF will include:
  - Expense summary table
  - Receipt images in order
  - Perfect for accounting department!

## 🔧 Common Commands

### With Docker:

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Restart
docker-compose restart

# Clean everything
docker-compose down -v
```

### Without Docker:

```bash
# Backend
cd backend
npm run dev

# Frontend (new terminal)
cd frontend
npm run dev
```

## 🐛 Troubleshooting

### Docker Issues

**Port already in use:**
```bash
# Check what's using the port
# Linux/Mac:
lsof -i :5000
lsof -i :80

# Windows:
netstat -ano | findstr :5000
netstat -ano | findstr :80

# Then stop that service or change ports in docker-compose.yml
```

**Container won't start:**
```bash
docker-compose logs backend
docker-compose logs frontend
docker-compose logs mongodb
```

**Clean start:**
```bash
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

### Manual Installation Issues

**MongoDB connection failed:**
- Make sure MongoDB is running
- Check `backend/.env` has correct `MONGODB_URI`
- Default: `mongodb://localhost:27017/obo-berk`

**Port 5000 already in use:**
- Change `PORT` in `backend/.env`
- Update `VITE_API_URL` in `frontend/.env`

**npm install fails:**
- Delete `node_modules` folder
- Delete `package-lock.json`
- Run `npm install` again

## 📚 Next Steps

- Read [README.md](README.md) for detailed documentation
- See [DOCKER.md](DOCKER.md) for advanced Docker usage
- Check [DEPLOYMENT.md](DEPLOYMENT.md) for production deployment

## 💡 Tips

- Use Docker for easiest setup
- Development mode includes hot reload
- All data persists in Docker volumes
- Uploaded receipts stored in `backend/uploads`
- MongoDB data in Docker volume `mongodb_data`

## 🆘 Need Help?

1. Check the logs: `docker-compose logs -f`
2. Verify services: `docker-compose ps`
3. Review documentation in `README.md`
4. Check GitHub issues

## 🎯 What You Can Do

✅ Create and manage multiple users
✅ Create projects per user
✅ Track expenses with categories
✅ Upload receipt images/PDFs
✅ Filter expenses by type
✅ Export professional PDF reports
✅ Perfect for reimbursement tracking!

Enjoy using OBO-Berk! 🚀
