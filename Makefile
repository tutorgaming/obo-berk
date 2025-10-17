.PHONY: help build up down logs clean dev prod restart backup

# Default target
help:
	@echo "OBO-Berk Docker Management"
	@echo "=========================="
	@echo ""
	@echo "Available commands:"
	@echo "  make build       - Build all Docker images"
	@echo "  make up          - Start production environment"
	@echo "  make down        - Stop all services"
	@echo "  make logs        - View logs from all services"
	@echo "  make clean       - Remove containers, volumes, and images"
	@echo "  make dev         - Start development environment"
	@echo "  make prod        - Start production environment"
	@echo "  make restart     - Restart all services"
	@echo "  make backup      - Backup MongoDB and uploads"
	@echo "  make ps          - List running containers"
	@echo "  make shell-backend   - Access backend container shell"
	@echo "  make shell-frontend  - Access frontend container shell"
	@echo "  make shell-mongo     - Access MongoDB shell"

# Build all images
build:
	@echo "Building Docker images..."
	docker-compose build

# Start production environment
up:
	@echo "Starting production environment..."
	docker-compose up -d
	@echo "Application started!"
	@echo "Frontend: http://localhost"
	@echo "Backend API: http://localhost:5000/api"

prod: up

# Start development environment
dev:
	@echo "Starting development environment..."
	docker-compose -f docker-compose.dev.yml up
	@echo "Development server started at http://localhost:5173"

# Stop all services
down:
	@echo "Stopping services..."
	docker-compose down

# View logs
logs:
	docker-compose logs -f

# Clean everything (containers, volumes, images)
clean:
	@echo "Cleaning up Docker resources..."
	docker-compose down -v --rmi all
	@echo "Cleanup complete!"

# Restart services
restart:
	@echo "Restarting services..."
	docker-compose restart

# List running containers
ps:
	docker-compose ps

# Access backend shell
shell-backend:
	docker-compose exec backend sh

# Access frontend shell (for build container)
shell-frontend:
	@echo "Note: Frontend uses nginx in production. For dev, use 'make dev' first."
	docker-compose exec frontend sh || echo "Service not running or not available"

# Access MongoDB shell
shell-mongo:
	docker-compose exec mongodb mongosh obo-berk

# Backup MongoDB and uploads
backup:
	@echo "Creating backup..."
	@mkdir -p backups/$$(date +%Y%m%d_%H%M%S)
	docker-compose exec -T mongodb mongodump --db obo-berk --archive > backups/$$(date +%Y%m%d_%H%M%S)/mongodb.archive
	docker cp obo-berk-backend:/app/uploads backups/$$(date +%Y%m%d_%H%M%S)/uploads
	@echo "Backup created in backups/$$(date +%Y%m%d_%H%M%S)"

# View backend logs
logs-backend:
	docker-compose logs -f backend

# View frontend logs
logs-frontend:
	docker-compose logs -f frontend

# View MongoDB logs
logs-mongo:
	docker-compose logs -f mongodb

# Rebuild without cache
rebuild:
	@echo "Rebuilding images without cache..."
	docker-compose build --no-cache

# Install dependencies (for manual installation)
install:
	@echo "Installing backend dependencies..."
	cd backend && npm install
	@echo "Installing frontend dependencies..."
	cd frontend && npm install
	@echo "Dependencies installed!"

# Run tests (placeholder for future tests)
test:
	@echo "Running tests..."
	@echo "No tests configured yet"
