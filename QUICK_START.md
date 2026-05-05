# 🚀 Recovery Agent - Complete Setup & Deployment Guide

## What We've Completed

### ✅ Fixed Issues
1. **AI Diagnosis Blank Screen** - Added `min-h-[500px]` to the main container to ensure proper rendering
2. **Component Animation** - Improved AnimatePresence configuration for smooth transitions
3. **Error Handling** - Added proper fallback rendering

### ✅ Application Status
- **Frontend**: ✅ Running on http://localhost:4176
- **Backend**: ✅ Running on http://localhost:3001
- **Database**: ✅ SQLite initialized with all tables
- **All 7 Steps**: ✅ Fully functional
  1. Landing
  2. Incident Intake
  3. Transaction Selection
  4. Evidence Upload
  5. AI Diagnosis (FIXED)
  6. Dispute Packet
  7. Recovery Tracker

---

## 🌐 How to Deploy to the Web

### Quick Deploy (Recommended): Vercel + Railway

#### Step 1: Deploy Frontend to Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Navigate to project root
cd "C:\Users\pradnya.v\OneDrive - ascendion\Desktop\Risk analysis"

# Deploy frontend
vercel --prod
```

**Your frontend will be live at**: `https://recovery-agent-[random].vercel.app`

#### Step 2: Deploy Backend to Railway
1. Visit https://railway.app
2. Click "New Project"
3. Select "Deploy from GitHub"
4. Connect your repository
5. Configure:
   - **Root Directory**: `server/`
   - **Start Command**: `npm start`
   - **Build Command**: `npm run build`
6. Add environment variables:
   ```
   NODE_ENV=production
   JWT_[REDACTED_GENERIC_SECRET_3]=your-random-secret-key
   PORT=3001
   ```
7. Click "Deploy"

**Your backend will be at**: `https://your-project.railway.app`

#### Step 3: Connect Frontend to Backend
1. Create `.env.production` in project root:
   ```
   VITE_API_URL=https://your-project.railway.app
   ```

2. Redeploy frontend:
   ```bash
   vercel --prod
   ```

---

### Alternative: Docker Deployment

#### Using Docker Compose (Recommended for Control)

```bash
# Build and run both services
docker-compose up -d

# Frontend will be on http://localhost
# Backend will be on http://localhost:3001
```

#### Deploy Docker to Cloud

**Option A: Railway**
1. Connect GitHub repository to Railway
2. Railway auto-detects docker-compose.yml
3. Deploy

**Option B: Render**
1. Go to https://render.com
2. Create new Web Service
3. Connect GitHub
4. Select docker-compose.yml
5. Deploy

**Option C: AWS ECS**
```bash
# Push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789.dkr.ecr.us-east-1.amazonaws.com
docker build -t recovery-agent .
docker tag recovery-agent:latest 123456789.dkr.ecr.us-east-1.amazonaws.com/recovery-agent:latest
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/recovery-agent:latest
```

---

## 📋 Deployment Comparison

| Platform | Cost | Ease | Speed | Best For |
|----------|------|------|-------|----------|
| **Vercel** | $20/mo | ⭐⭐⭐⭐⭐ | ⚡⚡⚡ | Frontend, Fast Deploy |
| **Railway** | $5-25/mo | ⭐⭐⭐⭐ | ⚡⚡⚡ | Backend, Full Stack |
| **Render** | Free-$12/mo | ⭐⭐⭐⭐ | ⚡⚡ | Full Stack, Best Free |
| **Firebase** | Free-$100/mo | ⭐⭐⭐ | ⚡⚡ | Frontend Only |
| **AWS** | $9-50/mo | ⭐⭐⭐ | ⚡⚡⚡⭐ | Enterprise, Maximum Control |

---

## 🔒 Post-Deployment Checklist

- [ ] Update `.env` files with production URLs
- [ ] Set strong `JWT_SECRET`  
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS properly
- [ ] Set up database backups
- [ ] Enable monitoring/error logging
- [ ] Test all features on live site
- [ ] Monitor performance metrics
- [ ] Set up alerts for errors

---

## 📱 Share Your App

### With Your Domain
1. Buy a domain (Namecheap, GoDaddy)
2. Point nameservers to your host
3. Get SSL certificate (free with most platforms)
4. Share URL: `https://yourappname.com`

### Without Domain (Quick Share)
Share the platform URLs directly:
- Frontend: `https://recovery-agent-abc123.vercel.app`
- Backend: `https://recovery-agent-backend.railway.app`

### Share as Business
1. Create branded domain
2. Add custom logo/branding
3. Deploy to CDN for speed
4. Share on social media

---

## 🛠️ Local Development

### Running Locally
```bash
# Terminal 1: Backend
cd "C:\Users\pradnya.v\OneDrive - ascendion\Desktop\Risk analysis\server"
npm run dev
# Runs on http://localhost:3001

# Terminal 2: Frontend
cd "C:\Users\pradnya.v\OneDrive - ascendion\Desktop\Risk analysis"
npx vite
# Runs on http://localhost:4176
```

### Making Changes
- Edit files in `src/`
- Changes auto-reload in browser (Vite HMR)
- Test locally before deploying

---

## 🚨 Troubleshooting

### Frontend won't load
```bash
# Clear cache and reinstall
rm -rf node_modules
npm install
npx vite
```

### Backend API errors
```bash
# Check backend is running
curl http://localhost:3001/health

# Check environment variables
echo $VITE_API_URL

# Restart backend
npm run dev
```

### Database issues
```bash
# Reset database (deletes all data!)
cd server
rm -f data/recovery.db
npm run dev
```

---

## 📚 Files Reference

| File | Purpose |
|------|---------|
| `DEPLOYMENT.md` | Detailed deployment guide |
| `docker-compose.yml` | Docker container setup |
| `Dockerfile.frontend` | Frontend Docker image |
| `server/Dockerfile` | Backend Docker image |
| `deploy.sh` | Linux deployment script |
| `deploy.bat` | Windows deployment script |
| `.env.example` | Environment variables template |

---

## ✨ Your App is Ready!

**Current Status**: ✅ All features working
- Landing page: ✅
- Incident Intake: ✅
- Transaction Selection: ✅
- Evidence Upload: ✅
- AI Diagnosis: ✅ (Fixed)
- Dispute Packet: ✅
- Recovery Tracker: ✅

**Next Step**: Choose a deployment platform and go live!

---

## 📞 Need Help?

1. Check `DEPLOYMENT.md` for detailed instructions
2. Review platform documentation
3. Check browser console (F12) for errors
4. Review server logs for backend errors

**Share your live app with friends and colleagues!** 🎉
