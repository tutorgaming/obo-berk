# Production Deployment Guide

This guide covers deploying OBO-Berk to production environments.

## 🚀 Quick Deployment Options

### Option 1: Docker on VPS (Recommended)

Deploy to any VPS (DigitalOcean, AWS EC2, Google Cloud, etc.)

#### Prerequisites
- Ubuntu 20.04+ or similar Linux distro
- Docker and Docker Compose installed
- Domain name (optional but recommended)
- SSL certificate (Let's Encrypt recommended)

#### Steps

1. **Connect to your server**
```bash
ssh user@your-server-ip
```

2. **Install Docker**
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

3. **Install Docker Compose**
```bash
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

4. **Clone your repository**
```bash
git clone <your-repo-url>
cd obo-berk
```

5. **Configure environment**
```bash
# Edit backend/.env
nano backend/.env

# Set production values:
# MONGODB_URI=mongodb://mongodb:27017/obo-berk
# PORT=5001
```

6. **Start the application**
```bash
docker-compose up -d
```

7. **Set up Nginx reverse proxy (optional)**
```bash
sudo apt install nginx
sudo nano /etc/nginx/sites-available/obo-berk
```

Nginx configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:80;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /uploads {
        proxy_pass http://localhost:3001;
    }
}
```

8. **Enable SSL with Let's Encrypt**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### Option 2: DigitalOcean App Platform

1. **Create new app in DigitalOcean**
2. **Connect your GitHub repository**
3. **Configure components:**
   - Web Service: Frontend (Dockerfile: `frontend/Dockerfile`)
   - Web Service: Backend (Dockerfile: `backend/Dockerfile`)
   - Database: MongoDB

4. **Set environment variables**
   - Backend: `MONGODB_URI`, `PORT`
   - Frontend: `VITE_API_URL`

5. **Deploy**

### Option 3: AWS ECS with Fargate

1. **Push images to ECR**
```bash
# Authenticate to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Build and push backend
docker build -t obo-berk-backend ./backend
docker tag obo-berk-backend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/obo-berk-backend:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/obo-berk-backend:latest

# Build and push frontend
docker build -t obo-berk-frontend ./frontend
docker tag obo-berk-frontend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/obo-berk-frontend:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/obo-berk-frontend:latest
```

2. **Create ECS cluster and task definitions**
3. **Set up RDS MongoDB or DocumentDB**
4. **Configure load balancer**
5. **Deploy services**

### Option 4: Railway.app

1. **Install Railway CLI**
```bash
npm i -g @railway/cli
```

2. **Login and initialize**
```bash
railway login
railway init
```

3. **Add services**
```bash
railway add # Add MongoDB
railway add # Add backend
railway add # Add frontend
```

4. **Deploy**
```bash
railway up
```

## 🔒 Security Checklist

- [ ] Change default MongoDB credentials
- [ ] Use environment variables for secrets
- [ ] Enable HTTPS/SSL
- [ ] Set up firewall rules
- [ ] Configure CORS properly
- [ ] Implement rate limiting
- [ ] Regular security updates
- [ ] Set up monitoring and logging
- [ ] Backup strategy in place
- [ ] Use strong passwords

## 📊 Monitoring

### Health Checks

Backend health endpoint:
```
GET http://your-domain.com/api/health
```

### Logs

```bash
# View all logs
docker-compose logs -f

# View specific service
docker-compose logs -f backend
```

### Metrics

Consider adding:
- Prometheus for metrics
- Grafana for visualization
- Sentry for error tracking
- New Relic or Datadog for APM

## 💾 Backup Strategy

### Automated Daily Backups

Create a cron job:

```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * cd /path/to/obo-berk && ./backup.sh
```

Backup script (`backup.sh`):
```bash
#!/bin/bash
BACKUP_DIR="/backups/$(date +\%Y\%m\%d_\%H\%M\%S)"
mkdir -p $BACKUP_DIR

# Backup MongoDB
docker-compose exec -T mongodb mongodump --db obo-berk --archive > $BACKUP_DIR/mongodb.archive

# Backup uploads
docker cp obo-berk-backend:/app/uploads $BACKUP_DIR/uploads

# Compress
tar -czf $BACKUP_DIR.tar.gz $BACKUP_DIR
rm -rf $BACKUP_DIR

# Upload to S3 (optional)
aws s3 cp $BACKUP_DIR.tar.gz s3://your-bucket/backups/

# Keep only last 7 days
find /backups -name "*.tar.gz" -mtime +7 -delete
```

## 🔄 CI/CD Pipeline

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /path/to/obo-berk
            git pull
            docker-compose down
            docker-compose build
            docker-compose up -d
```

## 📈 Scaling

### Horizontal Scaling

```yaml
# docker-compose.yml
services:
  backend:
    deploy:
      replicas: 3
```

### Load Balancing

Use Nginx or HAProxy to distribute traffic across backend instances.

## 🛠️ Troubleshooting

### Application won't start
```bash
docker-compose logs
docker-compose ps
```

### MongoDB connection errors
```bash
docker-compose exec backend sh
nc -zv mongodb 27017
```

### Out of disk space
```bash
# Clean Docker
docker system prune -a

# Clean old backups
find /backups -mtime +30 -delete
```

## 📞 Support

For production issues:
1. Check logs: `docker-compose logs -f`
2. Verify health: `curl http://localhost:3001/api/health`
3. Review DOCKER.md for common issues
4. Check GitHub issues

## 🔐 Environment Variables Reference

### Backend (.env)
```env
NODE_ENV=production
PORT=5001
MONGODB_URI=mongodb://mongodb:27017/obo-berk
UPLOAD_DIR=uploads
```

### Frontend (.env.production)
```env
VITE_API_URL=https://your-domain.com/api
```

## 📝 Post-Deployment Checklist

- [ ] Application accessible via domain
- [ ] SSL certificate installed and working
- [ ] Database backups automated
- [ ] Monitoring configured
- [ ] Logs being collected
- [ ] Error tracking enabled
- [ ] Firewall configured
- [ ] DNS properly configured
- [ ] Performance tested
- [ ] Documentation updated
