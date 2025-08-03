# Multi-stage build for production
FROM node:18-alpine AS client-build

# Build client
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci --only=production
COPY client/ ./
RUN npm run build

# Production stage
FROM node:18-alpine

# Install system dependencies for ffmpeg and youtube-dl
RUN apk add --no-cache \
    ffmpeg \
    python3 \
    py3-pip \
    && pip3 install --no-cache-dir youtube-dl yt-dlp

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy server files
COPY . .

# Copy built client
COPY --from=client-build /app/client/build ./client/build

# Create uploads directory
RUN mkdir -p uploads/videos uploads/images

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Start the application
CMD ["npm", "start"]