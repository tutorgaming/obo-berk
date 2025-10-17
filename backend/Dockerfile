# Backend Dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --only=production

# Copy application files
COPY . .

# Create uploads directory and ensure fonts are included
RUN mkdir -p uploads
RUN mkdir -p fonts

# Expose port
EXPOSE 5001

# Start the application
CMD ["node", "server.js"]
