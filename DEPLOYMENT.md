# Recovery Agent - Deployment & Web Publishing Guide

## Overview
The Recovery Agent is a full-stack application consisting of:
- **Frontend**: React 18 + TypeScript + Vite (port 4176)
- **Backend**: Node.js + Express + TypeScript (port 3001)
- **Database**: SQLite

## Quick Start (Local Development)

### Prerequisites
- Node.js v18+
- npm or yarn

### Installation
```bash
# Install dependencies for both frontend and backend
cd "C:\Users\pradnya.v\OneDrive - ascendion\Desktop\Risk analysis"
npm install
cd server && npm install
```

### Running Locally
```bash
# Terminal 1: Start Backend
cd "C:\Users\pradnya.v\OneDrive - ascendion\Desktop\Risk analysis\server"
npm run dev
# Backend runs on http://localhost:3001

# Terminal 2: Start Frontend
cd "C:\Users\pradnya.v\OneDrive - ascendion\Desktop\Risk analysis"
npx vite
# Frontend runs on http://localhost:4176
```

---

## Deployment Options

### Option 1: Vercel (Recommended - Easy)
**Best for**: Rapid deployment with minimal configuration

#### Frontend Deployment
1. Create account at [vercel.com](https://vercel.com)
2. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```
3. Deploy frontend:
   ```bash
   cd "C:\Users\pradnya.v\OneDrive - ascendion\Desktop\Risk analysis"
   vercel
   ```
4. Follow prompts and deploy

#### Backend Deployment
1. Create account at [railway.app](https://railway.app) or use Vercel Serverless Functions
2. Deploy backend:
   ```bash
   cd server
   vercel
   ```
3. Update frontend API URL in `.env`:
   ```
   VITE_API_URL=https://your-backend-railway-app.up.railway.app
   ```

---

### Option 2: Docker + Render (Full Stack)
**Best for**: Complete control and scalability

#### Create Docker Configuration

**Backend Dockerfile** (`server/Dockerfile`):
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY src ./src
COPY tsconfig.json ./
EXPOSE 3001
CMD ["npm", "run", "dev"]
```

**Frontend Dockerfile** (`.Dockerfile`):
```dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**docker-compose.yml**:
```yaml
version: '3.8'
services:
  backend:
    build: ./server
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - JWT_SECRET=${JWT_SECRET}
    volumes:
      - ./server/data:/app/data

  frontend:
    build: .
    ports:
      - "80:80"
    depends_on:
      - backend
```

#### Deploy to Render
1. Create account at [render.com](https://render.com)
2. Create new Web Service and connect GitHub repo
3. Configure:
   - **Backend**:
     - Build: `npm install && npm run build`
     - Start: `npm start`
     - Environment: Add `JWT_SECRET`
   - **Frontend**:
     - Build: `npm install && npm run build`
     - Start: nginx (configured above)

---

### Option 3: Cloud Platforms (AWS/GCP/Azure)

#### AWS Deployment
1. **Frontend on S3 + CloudFront**:
   ```bash
   npm run build
   aws s3 cp dist/ s3://your-bucket/ --recursive
   ```

2. **Backend on EC2 or Elastic Beanstalk**:
   ```bash
   eb init -p node.js recovery-agent
   eb create production
   eb deploy
   ```

#### GCP Deployment
1. **Frontend on Firebase Hosting**:
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase init hosting
   npm run build
   firebase deploy
   ```

2. **Backend on Cloud Run**:
   ```bash
   gcloud run deploy recovery-agent --source .
   ```

---

### Option 4: Heroku (Deprecated but still works)

```bash
# Install Heroku CLI
# Login to Heroku
heroku login

# Create app
heroku create recovery-agent

# Deploy
git push heroku main

# Set environment variables
heroku config:set JWT_SECRET=your_secret
```

---

## Production Setup Checklist

### Environment Variables
Create `.env.production`:
```
VITE_API_URL=https://your-api-domain.com
VITE_ENV=production
NODE_ENV=production
JWT_SECRET=your_secret_key_here
```

### Security
- [ ] Enable HTTPS/SSL
- [ ] Set secure CORS headers
- [ ] Use environment variables for secrets
- [ ] Enable rate limiting on API
- [ ] Set up API authentication tokens
- [ ] Enable database backups

### Performance
- [ ] Enable gzip compression
- [ ] Set up CDN for frontend assets
- [ ] Optimize images
- [ ] Enable database indexing
- [ ] Set up monitoring/logging

### Testing
```bash
# Run tests before deployment
npm test
cd server && npm test

# Build and verify
npm run build
cd server && npm run build
```

---

## Domain & SSL Setup

### Register Domain
- Use [Namecheap](https://www.namecheap.com), [GoDaddy](https://www.godaddy.com), or [Google Domains](https://domains.google/)

### Point to Deployment
1. Get nameservers from your hosting provider
2. Update domain DNS settings
3. Wait for DNS propagation (can take 24-48 hours)

### SSL Certificate
- Most platforms (Vercel, Render, Railway) provide free SSL
- Or use [Let's Encrypt](https://letsencrypt.org/) for free certificates

---

## Monitoring & Maintenance

### Health Checks
```bash
# Test backend
curl https://your-api.com/health

# Test frontend
curl https://your-domain.com
```

### Logging
```bash
# View logs
vercel logs recovery-agent
# or
render logs recovery-agent
```

### Updates
```bash
# Pull latest changes
git pull origin main

# Rebuild and deploy
npm run build
vercel deploy --prod
```

---

## Cost Estimates (Monthly)

| Platform | Tier | Cost |
|----------|------|------|
| Vercel | Pro | $20 + usage |
| Railway | Hobby | $5-10 |
| Render | Free | $0 |
| Firebase | Free | $0 |
| AWS | t2.micro | $9.50 |
| GCP | Free Tier | $0-25 |

---

## Troubleshooting

### Backend not connecting
```bash
# Check if backend is running
curl http://localhost:3001/health

# Check environment variables
echo $VITE_API_URL

# Check CORS settings in backend/src/index.ts
```

### Frontend blank screen
- Clear browser cache (Ctrl+Shift+Delete)
- Check console (F12) for errors
- Verify API URL in `.env`

### Database issues
- Check SQLite file exists
- Verify database permissions
- Rebuild database:
  ```bash
  cd server
  rm -f data/recovery.db
  npm run dev
  ```

---

## Support & Documentation

- GitHub Issues: [Your repo]/issues
- Email: support@recoveryagent.app
- Documentation: [Your docs site]

---

## Next Steps

1. Choose deployment platform
2. Set up environment variables
3. Deploy backend first
4. Deploy frontend
5. Test all features
6. Monitor performance
7. Share with users via domain URL

**Deployment is now live! Share your domain with users.**