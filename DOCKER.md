# 🐳 Docker Deployment Guide for OBO-Berk

This guide covers deploying OBO-Berk using Docker containers.

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+

## Quick Start

### Production Deployment

1. **Clone the repository**
```bash
git clone <repository-url>
cd obo-berk
```

2. **Build and start all services**
```bash
docker-compose up -d
```

This will start:
- MongoDB database (port 27017)
- Backend API (port 5000)
- Frontend web app (port 80)

3. **Access the application**
- Frontend: http://localhost
- Backend API: http://localhost:5000/api
- Health check: http://localhost:5000/api/health

4. **View logs**
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb
```

5. **Stop the application**
```bash
docker-compose down
```

6. **Stop and remove all data**
```bash
docker-compose down -v
```

### Development Mode

For development with hot reload:

```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up

# Or run in background
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f
```

This will start:
- MongoDB database (port 27017)
- Backend API with nodemon (port 5000)
- Frontend with Vite HMR (port 5173)

Access at: http://localhost:5173

## Docker Commands Reference

### Building

```bash
# Build all services
docker-compose build

# Build specific service
docker-compose build backend
docker-compose build frontend

# Build without cache
docker-compose build --no-cache
```

### Running

```bash
# Start services
docker-compose up

# Start in background (detached mode)
docker-compose up -d

# Start specific service
docker-compose up backend

# Restart services
docker-compose restart
```

### Stopping

```bash
# Stop services (keeps containers)
docker-compose stop

# Stop and remove containers
docker-compose down

# Stop and remove containers, volumes, and images
docker-compose down -v --rmi all
```

### Monitoring

```bash
# View running containers
docker-compose ps

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f backend

# Execute command in container
docker-compose exec backend sh
docker-compose exec mongodb mongosh obo-berk
```

### Data Management

```bash
# Backup MongoDB data
docker-compose exec mongodb mongodump --db obo-berk --out /data/backup

# Restore MongoDB data
docker-compose exec mongodb mongorestore --db obo-berk /data/backup/obo-berk

# Access MongoDB shell
docker-compose exec mongodb mongosh obo-berk
```

## Environment Configuration

### Backend Environment Variables

Create or modify `backend/.env`:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://mongodb:27017/obo-berk
UPLOAD_DIR=uploads
```

### Frontend Environment Variables

For production builds, create `frontend/.env.production`:

```env
VITE_API_URL=http://localhost:5000/api
```

## Production Deployment Best Practices

### 1. Use Environment-Specific Configs

```bash
# Production
docker-compose -f docker-compose.yml up -d

# Development
docker-compose -f docker-compose.dev.yml up
```

### 2. Data Persistence

The docker-compose configuration uses named volumes:
- `mongodb_data`: MongoDB database files
- `uploads_data`: Uploaded receipt files

These persist even when containers are removed.

### 3. Health Checks

Services include health checks:
- MongoDB: Database ping
- Backend: HTTP health endpoint

```bash
# Check service health
docker-compose ps
```

### 4. Scaling (if needed)

```bash
# Scale backend service
docker-compose up -d --scale backend=3
```

### 5. Resource Limits

Add to docker-compose.yml for production:

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
```

## Deploying to Cloud

### AWS ECS

1. Push images to ECR
2. Create task definitions
3. Configure ECS service
4. Set up load balancer

### Google Cloud Run

1. Build and push to GCR
2. Deploy services
3. Configure networking

### DigitalOcean App Platform

1. Connect repository
2. Configure services
3. Set environment variables

### Using Docker Swarm

```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml obo-berk

# View services
docker service ls

# Scale service
docker service scale obo-berk_backend=3
```

### Using Kubernetes

Convert docker-compose to Kubernetes:

```bash
# Install kompose
curl -L https://github.com/kubernetes/kompose/releases/download/v1.31.2/kompose-linux-amd64 -o kompose
chmod +x kompose
sudo mv kompose /usr/local/bin/kompose

# Convert
kompose convert

# Deploy
kubectl apply -f .
```

## Troubleshooting

### Container won't start

```bash
# View detailed logs
docker-compose logs backend

# Check container status
docker-compose ps

# Inspect container
docker inspect obo-berk-backend
```

### MongoDB connection issues

```bash
# Check if MongoDB is running
docker-compose ps mongodb

# Test MongoDB connection
docker-compose exec backend sh
nc -zv mongodb 27017
```

### Port conflicts

If ports are already in use:

```bash
# Change ports in docker-compose.yml
ports:
  - "8080:80"     # Frontend
  - "5001:5000"   # Backend
  - "27018:27017" # MongoDB
```

### Clear everything and start fresh

```bash
# Stop all containers
docker-compose down -v

# Remove all images
docker-compose down --rmi all

# Rebuild and start
docker-compose build --no-cache
docker-compose up -d
```

## Security Considerations

1. **Use secrets for sensitive data**
2. **Don't expose MongoDB port in production**
3. **Use reverse proxy (nginx) for SSL/TLS**
4. **Implement rate limiting**
5. **Regular security updates**

```bash
# Update base images
docker-compose pull
docker-compose up -d
```

## Monitoring & Logging

### Add logging driver

```yaml
services:
  backend:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

### Using Docker stats

```bash
# Real-time resource usage
docker stats

# Specific containers
docker stats obo-berk-backend obo-berk-frontend
```

## Backup Strategy

### Automated Backup Script

Create `backup.sh`:

```bash
#!/bin/bash
BACKUP_DIR="./backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p $BACKUP_DIR

# Backup MongoDB
docker-compose exec -T mongodb mongodump --db obo-berk --archive > $BACKUP_DIR/mongodb.archive

# Backup uploads
docker cp obo-berk-backend:/app/uploads $BACKUP_DIR/uploads

echo "Backup completed: $BACKUP_DIR"
```

Make executable and run:

```bash
chmod +x backup.sh
./backup.sh
```

## Support

For issues or questions:
- Check logs: `docker-compose logs -f`
- Restart services: `docker-compose restart`
- View documentation: This file
