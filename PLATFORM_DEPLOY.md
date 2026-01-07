# Platform-Specific Deployment Instructions

Quick deployment guides for popular hosting platforms.

## 🚀 Vercel (Frontend) + Railway (Backend)

### Frontend on Vercel

1. **Sign up** at [vercel.com](https://vercel.com)

2. **Import Project**
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - Root Directory: `frontend`

3. **Configure Build Settings**
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next` (default)
   - Install Command: `npm install`

4. **Environment Variables**
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api
   ```

5. **Deploy**
   - Click "Deploy"
   - Note your URL: `https://your-app.vercel.app`

### Backend on Railway

1. **Sign up** at [railway.app](https://railway.app)

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"

3. **Add Database Services**
   - Click "New" → "Database" → "Add PostgreSQL"
   - Click "New" → "Database" → "Add Redis"

4. **Configure Backend Service**
   - Click "New" → "GitHub Repo"
   - Select your repository
   - Root Directory: `backend`

5. **Environment Variables**
   ```
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   REDIS_URL=${{Redis.REDIS_URL}}
   PORT=3001
   NODE_ENV=production
   SCRAPING_DELAY_MS=2000
   CACHE_TTL_HOURS=24
   FRONTEND_URL=https://your-app.vercel.app
   ```

6. **Deploy Settings**
   - Build Command: `npm install && npm run build && npx prisma generate`
   - Start Command: `npx prisma migrate deploy && npm run start:prod`

7. **Deploy**
   - Click "Deploy"
   - Note your URL: `https://your-backend.railway.app`

8. **Update Frontend**
   - Go back to Vercel
   - Update `NEXT_PUBLIC_API_URL` with Railway URL
   - Redeploy

---

## 🎨 Render (Full Stack)

### Backend on Render

1. **Sign up** at [render.com](https://render.com)

2. **Create PostgreSQL Database**
   - Dashboard → "New" → "PostgreSQL"
   - Name: `product-explorer-db`
   - Note the Internal Database URL

3. **Create Redis Instance**
   - Dashboard → "New" → "Redis"
   - Name: `product-explorer-redis`
   - Note the Internal Redis URL

4. **Create Web Service**
   - Dashboard → "New" → "Web Service"
   - Connect your GitHub repository
   - Root Directory: `backend`

5. **Configure Settings**
   - Name: `product-explorer-backend`
   - Environment: `Node`
   - Build Command: 
     ```
     npm install && npm run build && npx prisma generate
     ```
   - Start Command:
     ```
     npx prisma migrate deploy && npm run start:prod
     ```

6. **Environment Variables**
   ```
   DATABASE_URL=<Internal Database URL>
   REDIS_URL=<Internal Redis URL>
   PORT=3001
   NODE_ENV=production
   SCRAPING_DELAY_MS=2000
   CACHE_TTL_HOURS=24
   FRONTEND_URL=https://your-frontend.onrender.com
   ```

7. **Deploy**
   - Click "Create Web Service"
   - Note your URL: `https://your-backend.onrender.com`

### Frontend on Render

1. **Create Static Site**
   - Dashboard → "New" → "Static Site"
   - Connect repository
   - Root Directory: `frontend`

2. **Configure Settings**
   - Build Command: `npm install && npm run build`
   - Publish Directory: `.next`

3. **Environment Variables**
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api
   ```

4. **Deploy**

---

## 🔶 AWS (Advanced)

### Backend on Elastic Beanstalk

1. **Prerequisites**
   - AWS account
   - AWS CLI installed
   - EB CLI installed

2. **Create RDS PostgreSQL**
   - AWS Console → RDS → Create Database
   - PostgreSQL 14
   - Note endpoint

3. **Create ElastiCache Redis**
   - AWS Console → ElastiCache → Create
   - Redis
   - Note endpoint

4. **Initialize EB**
   ```bash
   cd backend
   eb init -p node.js-18 product-explorer-backend
   ```

5. **Create Environment**
   ```bash
   eb create product-explorer-env
   ```

6. **Set Environment Variables**
   ```bash
   eb setenv DATABASE_URL=postgresql://... \
             REDIS_URL=redis://... \
             PORT=8080 \
             NODE_ENV=production
   ```

7. **Deploy**
   ```bash
   eb deploy
   ```

### Frontend on S3 + CloudFront

1. **Build Frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Create S3 Bucket**
   - AWS Console → S3 → Create Bucket
   - Enable static website hosting

3. **Upload Build**
   ```bash
   aws s3 sync out/ s3://your-bucket-name/
   ```

4. **Create CloudFront Distribution**
   - AWS Console → CloudFront → Create Distribution
   - Origin: S3 bucket
   - Configure SSL certificate

5. **Update DNS**
   - Point domain to CloudFront URL

---

## 🟦 Azure

### Backend on App Service

1. **Create App Service**
   - Azure Portal → App Services → Create
   - Runtime: Node 18
   - Operating System: Linux

2. **Create Databases**
   - Azure Database for PostgreSQL
   - Azure Cache for Redis

3. **Deploy Code**
   ```bash
   cd backend
   az webapp up --name product-explorer-backend
   ```

4. **Configure**
   - Settings → Configuration → Application Settings
   - Add environment variables

### Frontend on Static Web Apps

1. **Create Static Web App**
   - Azure Portal → Static Web Apps → Create
   - Connect GitHub repository

2. **Configure Build**
   - Add `.github/workflows` configuration
   - Build command: `npm run build`
   - App location: `/frontend`

3. **Environment Variables**
   - Configuration → Application settings

---

## 🟩 Heroku

### Backend on Heroku

1. **Install Heroku CLI**
   ```bash
   npm install -g heroku
   ```

2. **Login**
   ```bash
   heroku login
   ```

3. **Create App**
   ```bash
   cd backend
   heroku create product-explorer-backend
   ```

4. **Add Addons**
   ```bash
   heroku addons:create heroku-postgresql:mini
   heroku addons:create heroku-redis:mini
   ```

5. **Set Environment Variables**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set SCRAPING_DELAY_MS=2000
   ```

6. **Deploy**
   ```bash
   git push heroku main
   ```

7. **Run Migrations**
   ```bash
   heroku run npx prisma migrate deploy
   ```

### Frontend on Heroku

Similar process, but deploy frontend directory.

---

## 🔧 Common Issues

### PostgreSQL Connection
- Ensure SSL is enabled: `?sslmode=require`
- Check firewall rules
- Verify credentials

### Redis Connection
- Use correct URL format: `redis://host:port`
- Check network access
- Verify TLS settings if required

### Build Failures
- Check Node.js version (18+)
- Verify environment variables
- Review build logs

### Playwright Issues
- Install dependencies: `npx playwright install-deps`
- Use headless mode
- Increase timeouts

---

## 📝 Post-Deployment Checklist

- [ ] Frontend loads correctly
- [ ] Backend API is accessible
- [ ] Database connected
- [ ] Redis connected
- [ ] Scraping works
- [ ] All environment variables set
- [ ] SSL certificates valid
- [ ] No errors in logs
- [ ] Performance acceptable
- [ ] Test all features

---

## 🎯 Recommended Setup

**For Quick Start:**
- Frontend: Vercel (free tier, instant deploys)
- Backend: Railway (free tier, easy PostgreSQL + Redis)

**For Production:**
- Frontend: Vercel or Netlify (CDN, auto-scaling)
- Backend: Railway or Render (managed databases)
- Or: Full AWS/Azure setup for enterprise

---

## 💡 Tips

1. **Deploy backend first** - Get the API URL before deploying frontend
2. **Use managed databases** - Easier than self-hosting
3. **Enable auto-deploy** - Push to GitHub triggers deploy
4. **Monitor logs** - Check for errors after deployment
5. **Set up alerts** - Get notified of issues
6. **Use environment variables** - Never hardcode credentials
7. **Enable HTTPS** - Most platforms provide free SSL

---

## 🔗 Platform Links

- Vercel: https://vercel.com
- Railway: https://railway.app
- Render: https://render.com
- Heroku: https://heroku.com
- AWS: https://aws.amazon.com
- Azure: https://azure.microsoft.com
- Google Cloud: https://cloud.google.com

---

**Need Help?** Check platform-specific documentation or community forums.
