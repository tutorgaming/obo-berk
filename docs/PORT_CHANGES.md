# Port Configuration Changes

## Summary
Changed ports to avoid conflicts with macOS AirDrop (port 5000) and Chrome's unsafe port restrictions (port 6000).

## New Port Configuration

### Backend (Internal Container Port)
- **Old**: 5000
- **New**: 5001

### Backend (External Host Port)
- **Old**: 6000
- **New**: 3001

### Access URLs

#### With Docker:
- Frontend: `http://localhost` (port 80)
- Backend API: `http://localhost:3001/api`
- Backend Health: `http://localhost:3001/api/health`

#### Without Docker (Manual):
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5001/api`
- Backend Health: `http://localhost:5001/api/health`

## Files Updated

### Configuration Files
- ✅ `backend/server.js` - Default port 5001
- ✅ `backend/Dockerfile.dev` - EXPOSE 5001
- ✅ `backend/.env.example` - PORT=5001
- ✅ `docker-compose.yml` - Port mapping 3001:5001, healthcheck updated
- ✅ `docker-compose.dev.yml` - Port mapping 3001:5001, environment updated
- ✅ `frontend/vite.config.js` - Proxy target backend:5001
- ✅ `frontend/src/services/api.js` - Default API URL localhost:5001
- ✅ `frontend/.env` - VITE_API_URL=http://localhost:3001/api
- ✅ `frontend/.env.example` - VITE_API_URL=http://localhost:3001/api

### Documentation Files
- ✅ `README.md` - All port references updated
- ✅ `QUICKSTART.md` - All port references updated
- ✅ `DOCKER.md` - All port references updated
- ✅ `DEPLOYMENT.md` - All port references updated, including Nginx config
- ✅ `TESTING.md` - All test URLs updated

### Scripts
- ✅ `start.sh` - Display message updated
- ✅ `start.bat` - Display message updated
- ✅ `Makefile` - Display message updated

## Why These Ports?

### Port 5001 (Backend Internal)
- Avoids macOS AirDrop which uses port 5000
- Safe and commonly available
- Close to original port for easy reference

### Port 3001 (Backend External)
- Port 6000 is blocked by Chrome as "unsafe"
- Port 3001 is safe and commonly used for development
- Avoids conflicts with common services

## Testing After Update

1. **Stop any running containers:**
   ```bash
   docker-compose down
   ```

2. **Rebuild and start:**
   ```bash
   docker-compose up -d --build
   ```

3. **Verify access:**
   - Frontend: http://localhost
   - Backend: http://localhost:3001/api/health

4. **Check logs if issues:**
   ```bash
   docker-compose logs -f backend
   ```

## Rollback (if needed)

If you need to revert to old ports, change these values:
- Backend internal: 5001 → 5000
- Backend external: 3001 → 6000

But note: You'll have the same AirDrop/Chrome issues again on macOS.
