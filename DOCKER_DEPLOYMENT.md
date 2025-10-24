# 🐳 Docker Deployment Guide for SaaS App

This guide will help you containerize and deploy your Next.js SaaS application using Docker.

## 📋 Prerequisites

### 1. Install Docker Desktop

**For Windows:**
1. Download Docker Desktop from: https://www.docker.com/products/docker-desktop/
2. Run the installer and follow the setup wizard
3. Restart your computer if prompted
4. Launch Docker Desktop and wait for it to start
5. Verify installation by opening Command Prompt and running:
   ```cmd
   docker --version
   docker-compose --version
   ```

**For macOS:**
1. Download Docker Desktop for Mac from the same link
2. Install and start Docker Desktop
3. Verify installation in Terminal

**For Linux (Ubuntu/Debian):**
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.23.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

## 🛠️ Setup Environment Variables

1. Copy the environment template:
   ```cmd
   copy .env.docker.template .env.local
   ```

2. Edit `.env.local` with your actual values:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...

   # Optional API Keys
   GEMINI_API_KEY=your_gemini_key
   OPENAI_API_KEY=your_openai_key
   VAPI_PRIVATE_KEY=your_vapi_private_key
   VAPI_PUBLIC_KEY=your_vapi_public_key
   ```

## 🚀 Deployment Options

### Option 1: Quick Deploy (Recommended)

**Windows:**
```cmd
# Make sure Docker Desktop is running, then:
deploy.bat
```

**Linux/macOS:**
```bash
# Make script executable
chmod +x deploy.sh
# Run deployment
./deploy.sh
```

### Option 2: Docker Compose (Advanced)

```cmd
# Windows
docker-deploy.bat

# Linux/macOS
docker-compose up --build -d
```

### Option 3: Manual Docker Commands

1. **Build the image:**
   ```cmd
   docker build -t saas-app .
   ```

2. **Run the container:**
   ```cmd
   docker run -d --name saas-app-container -p 3000:3000 --env-file .env.local saas-app
   ```

3. **Access your app:**
   - Main app: http://localhost:3000
   - Health check: http://localhost:3000/api/health

## 📊 Docker Architecture

Our Docker setup uses a **multi-stage build** for optimization:

### Stage 1: Dependencies
- Uses Node.js Alpine image (smaller size)
- Installs only production dependencies
- Caches dependencies layer for faster rebuilds

### Stage 2: Build
- Copies source code
- Builds the Next.js application
- Creates standalone output for container

### Stage 3: Runtime
- Minimal runtime image
- Non-root user for security
- Health check endpoint
- Optimized for production

## 🔧 Container Management

### View running containers:
```cmd
docker ps
```

### View application logs:
```cmd
docker logs saas-app-container
```

### Stop the container:
```cmd
docker stop saas-app-container
```

### Restart the container:
```cmd
docker restart saas-app-container
```

### Remove the container:
```cmd
docker stop saas-app-container
docker rm saas-app-container
```

### Update the application:
```cmd
# Stop and remove old container
docker stop saas-app-container
docker rm saas-app-container

# Rebuild image
docker build -t saas-app .

# Start new container
docker run -d --name saas-app-container -p 3000:3000 --env-file .env.local saas-app
```

## 🔍 Troubleshooting

### Common Issues:

1. **Port already in use:**
   ```cmd
   # Use different port
   docker run -d --name saas-app-container -p 3001:3000 --env-file .env.local saas-app
   ```

2. **Environment variables not loading:**
   - Ensure `.env.local` exists and has correct format
   - No spaces around `=` in environment variables
   - Use double quotes for values with spaces

3. **Build fails:**
   ```cmd
   # Clean Docker cache
   docker system prune -a
   
   # Rebuild without cache
   docker build --no-cache -t saas-app .
   ```

4. **Container won't start:**
   ```cmd
   # Check logs for errors
   docker logs saas-app-container
   
   # Run interactively for debugging
   docker run -it --env-file .env.local saas-app sh
   ```

### Health Check Endpoint

The container includes a health check at `/api/health` that returns:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-09T...",
  "uptime": 123.45,
  "environment": "production",
  "memory": {
    "used": 45.67,
    "total": 128.0
  }
}
```

## 🌐 Production Deployment

### Using Docker Compose with Nginx (Optional):

1. **Enable nginx service:**
   ```cmd
   docker-compose --profile production up -d
   ```

2. **Configure SSL certificates** (place in `./ssl/` directory):
   - `cert.pem`
   - `key.pem`

### Cloud Deployment:

**AWS ECS/Fargate:**
1. Push image to ECR
2. Create ECS task definition
3. Deploy to Fargate

**Google Cloud Run:**
```cmd
# Build and push
docker build -t gcr.io/YOUR_PROJECT/saas-app .
docker push gcr.io/YOUR_PROJECT/saas-app

# Deploy
gcloud run deploy --image gcr.io/YOUR_PROJECT/saas-app --platform managed
```

**Azure Container Instances:**
```cmd
az container create --resource-group myResourceGroup --name saas-app --image saas-app:latest --ports 3000
```

## 📈 Performance Optimization

### Build Optimization:
- **Multi-stage build** reduces final image size
- **Layer caching** speeds up rebuilds
- **Alpine Linux** base image for smaller footprint
- **Standalone output** for faster startup

### Runtime Optimization:
- **Non-root user** for security
- **Health checks** for monitoring
- **Resource limits** (add to docker-compose.yml):
  ```yaml
  deploy:
    resources:
      limits:
        memory: 1G
        cpus: '0.5'
  ```

## 🔐 Security Best Practices

1. **Non-root user** - Container runs as `nextjs` user
2. **Environment variables** - Never commit secrets to code
3. **Health checks** - Monitor container health
4. **Resource limits** - Prevent resource exhaustion
5. **Regular updates** - Keep base images updated

## 📋 File Structure

After setup, your project will have:
```
saas_app/
├── Dockerfile                 # Multi-stage Docker build
├── docker-compose.yml         # Orchestration config
├── .dockerignore             # Files to exclude from build
├── deploy.bat                # Windows deployment script
├── deploy.sh                 # Linux/macOS deployment script
├── docker-deploy.bat         # Docker Compose deployment
├── .env.docker.template      # Environment template
├── app/api/health/           # Health check endpoint
└── ... (your existing files)
```

## 🎉 Success!

Once deployed, your SaaS app will be running in a production-ready Docker container with:
- ✅ Optimized build process
- ✅ Security best practices
- ✅ Health monitoring
- ✅ Easy scaling and deployment
- ✅ Development/production parity

Access your application at: **http://localhost:3000**

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review Docker logs: `docker logs saas-app-container`
3. Verify environment variables are set correctly
4. Ensure Docker Desktop is running

Happy containerizing! 🐳✨