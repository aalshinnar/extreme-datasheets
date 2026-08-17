# Quick Start Guide

## 5-Minute Local Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your Gmail credentials
```

**Get Gmail App Password:**
- Enable 2FA on Google account
- Visit https://myaccount.google.com/apppasswords
- Generate app password → copy to `EMAIL_PASSWORD` in `.env`

### 3. Start MongoDB & App

```bash
# Option A: With Docker (recommended)
docker-compose up

# Option B: With local MongoDB
# (ensure MongoDB is running on localhost:27017)
npm run dev
```

### 4. Access Application

- **Frontend**: http://localhost:3000
- **API**: http://localhost:3000/api

## Test It Out

1. **Register**: Go to `/register`, create account
2. **Verify Email**: Check email for verification link
3. **Login**: Use credentials
4. **Search**: Browse public datasheets
5. **Download**: Download a datasheet (if any exist)

## Deploy to Railway (2 steps)

### Step 1: Connect GitHub

1. Push code to GitHub
2. Go to Railway.app
3. Create new project from GitHub

### Step 2: Add Environment Variables

In Railway dashboard:

```
NODE_ENV=production
MONGODB_URI=<use Railway MongoDB service>
JWT_SECRET=<generate secure 32+ char string>
JWT_REFRESH_SECRET=<generate secure 32+ char string>
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=<app password from Gmail>
EMAIL_FROM=noreply@extremenetworks.com
CORS_ORIGIN=https://<your-railway-url>
```

Railway automatically deploys on push! 🚀

## Add Sample Datasheets

### Create Admin User

```bash
# Connect to MongoDB (via Atlas/CLI)
db.users.updateOne(
  { email: "your-email@gmail.com" },
  { $set: { role: "admin" } }
)
```

### Via Admin API

```bash
curl -X POST http://localhost:3000/api/datasheets/upload \
  -H "Authorization: Bearer <your-token>" \
  -F "file=@datasheet.pdf" \
  -F "title=XOS Datasheet" \
  -F "product=ExtremeOS" \
  -F "category=Switches"
```

## Useful Commands

```bash
# Development
npm run dev              # Start with auto-reload
npm test               # Run tests

# Docker
docker-compose up      # Start all services
docker-compose down    # Stop services
docker-compose logs -f # View logs

# Database
# Connect via MongoDB Compass or CLI
# String: mongodb://localhost:27017/extreme-datasheets
```

## File Structure

```
extreme-datasheets/
├── src/
│   ├── models/          # Database schemas
│   ├── controllers/     # Business logic
│   ├── routes/         # API endpoints
│   ├── middleware/     # Auth, validation
│   ├── services/       # Email, storage
│   ├── app.js          # Express config
│   └── server.js       # Entry point
├── public/             # Frontend
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── dashboard.html
│   └── assets/
│       ├── css/
│       └── js/
├── uploads/            # File storage
├── Dockerfile
├── docker-compose.yml
└── README.md
```

## Key Features

✅ User registration with email verification
✅ Secure JWT authentication
✅ Full-text search across datasheets
✅ Download tracking
✅ Responsive UI
✅ Admin datasheet management
✅ Rate limiting & security headers
✅ Docker containerization
✅ Railway.app ready

## Common Issues

| Issue | Solution |
|-------|----------|
| Email not sending | Check Gmail app password and 2FA enabled |
| MongoDB connection error | Verify connection string in `.env` |
| Port 3000 in use | Change `PORT` in `.env` |
| CORS errors | Update `CORS_ORIGIN` in `.env` |

## Next Steps

1. ✅ Deploy to Railway
2. Add custom domain
3. Upload datasheets
4. Create admin users
5. Share with team!

---

**Need help?** Check README.md for detailed documentation
