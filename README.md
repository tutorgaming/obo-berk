# OBO-Berk (โอโบ-เบิก)

Expense tracking and reimbursement management system for Obodroid company.

## Features

- 👤 User registration and selection
- � **User management page** - Full CRUD operations for users
- �📁 Project management per user
- 💰 Expense tracking with categories (eating, traveling, etc.)
- 📄 Receipt file upload and storage
- 📊 PDF export with expense tables and receipt images
- 🌐 Thai language support

## Tech Stack

**Frontend:**

- React 18
- Vite
- TailwindCSS
- Axios

**Backend:**

- Node.js
- Express
- MongoDB with Mongoose
- Multer (file uploads)
- PDFKit (PDF generation)

## Getting Started

### Option 1: 🐳 Docker Deployment (Recommended)

**Prerequisites:**

- Docker Engine 20.10+
- Docker Compose 2.0+

**Quick Start:**

```bash
# Clone the repository
git clone <repository-url>
cd obo-berk

# Start all services (MongoDB, Backend, Frontend)
docker-compose up -d

# Access the application
# Frontend: http://localhost
# Backend API: http://localhost:5000/api
```

**Development Mode with Hot Reload:**

```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up

# Access at http://localhost:5173
```

📚 **For detailed Docker instructions, see [DOCKER.md](DOCKER.md)**

### Option 2: Manual Installation

**Prerequisites:**

- Node.js 18+
- MongoDB running locally or MongoDB Atlas account

**Installation:**

1. **Install Backend Dependencies**

    ```bash
    cd backend
    npm install
    ```

2. **Install Frontend Dependencies**

    ```bash
    cd frontend
    npm install
    ```

### Configuration

Create a `.env` file in the `backend` directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/obo-berk
UPLOAD_DIR=uploads
```

### Running the Application

1. **Start MongoDB** (if running locally)
```bash
mongod
```

2. **Start Backend Server**
```bash
cd backend
npm run dev
```

3. **Start Frontend Development Server**
```bash
cd frontend
npm run dev
```

The application will be available at `http://localhost:5173`

## API Endpoints

### Users
- `GET /api/users` - Get all users
- `POST /api/users` - Create new user
- `GET /api/users/:id` - Get user by ID

### Projects
- `GET /api/projects` - Get all projects
- `GET /api/projects/user/:userId` - Get projects by user
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Get project by ID

### Expenses
- `GET /api/expenses/project/:projectId` - Get expenses by project
- `POST /api/expenses` - Create new expense (with file upload)
- `DELETE /api/expenses/:id` - Delete expense

### Export
- `GET /api/export/project/:projectId/pdf` - Export project expenses as PDF

## Project Structure

```
obo-berk/
├── backend/
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API routes
│   ├── uploads/         # Uploaded receipt files
│   ├── server.js        # Main server file
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── services/    # API services
│   │   ├── App.jsx      # Main app component
│   │   └── main.jsx     # Entry point
│   ├── index.html
│   └── package.json
└── README.md
```

## License

MIT
