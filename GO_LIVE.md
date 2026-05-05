# 🎯 Recovery Agent - Go Live in 5 Minutes

## Prerequisites
- GitHub account (free at github.com)
- Vercel account (free at vercel.com)
- Railway account (free at railway.app)

## Step-by-Step: Deploy Your App Live

### Step 1: Push Code to GitHub (2 minutes)

```bash
# Navigate to project
cd "C:\Users\pradnya.v\OneDrive - ascendion\Desktop\Risk analysis"

# Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit: Recovery Agent"

# Create new repository on GitHub.com
# Then push code:
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/recovery-agent.git
git push -u origin main
```

### Step 2: Deploy Backend to Railway (1 minute)

1. Go to https://railway.app
2. Click "New Project" → "Deploy from GitHub"
3. Select your `recovery-agent` repository
4. Railway auto-detects the setup
5. Go to Settings tab:
   - Root Directory: `server/`
   - Start Command: `npm start`
   - Build Command: `npm run build`

6. Go to Variables tab and add:
   ```
   JWT_[REDACTED_GENERIC_SECRET_3]=my-super-secret-key-12345
   NODE_ENV=production
   ```

7. Click "Deploy" button
8. Wait 2-3 minutes
9. Copy your Railway URL (looks like: `https://recovery-agent-xyz.railway.app`)

### Step 3: Deploy Frontend to Vercel (1 minute)

1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select your `recovery-agent` repository
4. Configure:
   - Framework: `Vite`
   - Root Directory: `./` (leave as is)

5. Click "Environment Variables" and add:
   ```
   VITE_API_URL=https://recovery-agent-xyz.railway.app
   ```
   (Replace xyz with your Railway app name)

6. Click "Deploy" button
7. Wait 1-2 minutes
8. Get your Vercel URL (looks like: `https://recovery-agent-abc.vercel.app`)

### Step 4: Test Your Live App (1 minute)

1. Open your Vercel URL in browser
2. Click through all steps to verify everything works
3. Test AI Diagnosis specifically

### ✅ You're Live!

**Your app is now accessible at:**
- Frontend: `https://recovery-agent-abc.vercel.app`
- Backend: `https://recovery-agent-xyz.railway.app`

---

## 🔗 Share Your App

### Option 1: Share Direct Links
Send these links to your team:
```
Frontend: https://recovery-agent-abc.vercel.app
```

### Option 2: Get a Custom Domain (Optional)

1. Buy a domain (Namecheap, GoDaddy): `myapp.com`
2. In Vercel dashboard:
   - Go to your project
   - Settings → Domains
   - Add your custom domain
   - Vercel provides DNS instructions
3. Update DNS at your domain registrar
4. Wait 24 hours for propagation
5. Share: `https://myapp.com`

### Option 3: Create a Landing Page

Create a simple index page with button to your app:
```
Recovery Agent - Your Personal Banking Recovery Assistant

[Launch App Button → links to your Vercel URL]
```

---

## 📊 Monitor Your App

### Check Status
- Vercel: https://vercel.com/dashboard
- Railway: https://railway.app/dashboard

### View Logs
- **Vercel**: Click project → Analytics → Logs
- **Railway**: Click project → Logs tab

### Performance Monitoring
- Vercel shows request metrics automatically
- Railway shows memory/CPU usage
- Check these if something breaks

---

## 🔄 Update Your App After Deploy

```bash
# Make changes locally and test
# Then:
git add .
git commit -m "Fix: [what you fixed]"
git push origin main

# Both Vercel and Railway auto-redeploy!
# Check deployment status in their dashboards
```

---

## 💡 Pro Tips

1. **Uptime Monitoring**: Use Uptime Robot (free) to monitor your live app
2. **Email Notifications**: Get alerts if your app goes down
3. **Custom Domain**: Makes it feel more professional
4. **Backup Database**: Regular exports recommended
5. **Update Node Version**: Keep dependencies up to date

---

## 🚀 Production Checklist

- [ ] App deployed to Vercel (Frontend)
- [ ] Backend deployed to Railway
- [ ] Environment variables set
- [ ] All 7 steps tested on live URL
- [ ] AI Diagnosis working
- [ ] Email configured for notifications
- [ ] Database backups scheduled
- [ ] Domain configured (optional)
- [ ] Shared with team/users

---

## 📞 Quick Help

| Issue | Solution |
|-------|----------|
| App won't load | Check Vercel dashboard logs |
| API errors | Check Railway backend logs & env vars |
| Blank page | Clear browser cache (Ctrl+Shift+Delete) |
| Performance slow | Check Railway CPU/Memory usage |
| Features not working | Verify VITE_API_URL is correct |

---

## ✨ Congratulations!

Your Recovery Agent app is now live and ready to share! 🎉

**Next Steps:**
1. Share URL with your team
2. Gather feedback
3. Make improvements
4. Update and redeploy

**You did it!** 🚀
