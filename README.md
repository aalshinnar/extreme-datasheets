# Extreme Networks Datasheets Portal

A secure web portal for hosting and distributing Extreme Networks product datasheets with user authentication, email verification, and full-text search capabilities.

## Features

- 🔐 User registration with email verification
- 🔑 Secure login with JWT authentication
- 🔍 Full-text search across datasheets
- 📥 Download datasheets with tracking
- 📊 Admin dashboard for managing datasheets
- 📱 Responsive design
- ☁️ Ready for Railway.app deployment

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **Email**: Nodemailer
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Deployment**: Docker, Railway.app

## Prerequisites

- Node.js 18+ and npm 9+
- MongoDB Atlas account (or local MongoDB)
- Gmail account with app password (for email)
- Railway.app account (for deployment)

## Local Development

### 1. Clone and Setup

```bash
cd extreme-datasheets
npm install
```

### 2. Environment Configuration

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/extreme-datasheets
JWT_SECRET=your-super-secret-key-min-32-characters
JWT_REFRESH_SECRET=your-refresh-secret-min-32-characters
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
CORS_ORIGIN=http://localhost:3000
```

### 3. Start with Docker Compose

```bash
docker-compose up
```

The app will be available at `http://localhost:3000`

### 4. Or Start Locally

```bash
# Install MongoDB locally first, then:
npm run dev
```

## Getting Gmail App Password

1. Enable 2-Factor Authentication on your Google account
2. Go to https://myaccount.google.com/apppasswords
3. Select "Mail" and "Windows Computer"
4. Generate app password (16 characters)
5. Use this in `EMAIL_PASSWORD`

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/verify-email` - Verify email with token
- `POST /api/auth/login` - Login and get tokens
- `POST /api/auth/refresh-token` - Get new access token
- `POST /api/auth/resend-verification` - Resend verification email

### Datasheets

- `GET /api/datasheets/search` - Search datasheets (public)
- `GET /api/datasheets/:id` - Get datasheet details (public)
- `GET /api/datasheets/:id/download` - Download datasheet (auth required)
- `POST /api/datasheets/upload` - Upload new datasheet (admin only)
- `PUT /api/datasheets/:id` - Update datasheet metadata (admin only)
- `DELETE /api/datasheets/:id` - Delete datasheet (admin only)
- `GET /api/datasheets/stats` - Get statistics (public)

## Database Schemas

### User Collection

```javascript
{
  email: String (unique),
  password: String (hashed),
  firstName: String,
  lastName: String,
  isEmailVerified: Boolean,
  verificationToken: String,
  verificationTokenExpiry: Date,
  lastLogin: Date,
  isActive: Boolean,
  role: 'user' | 'admin',
  createdAt: Date,
  updatedAt: Date
}
```

### Datasheet Collection

```javascript
{
  title: String,
  description: String,
  product: String,
  category: String,
  fileName: String,
  fileSize: Number,
  fileFormat: 'pdf' | 'docx',
  storagePath: String,
  uploadedBy: ObjectId (ref: User),
  downloadCount: Number,
  searchTags: [String],
  isPublic: Boolean,
  version: String,
  createdAt: Date,
  updatedAt: Date
}
```

## Deployment to Railway.app

### 1. Create Railway Project

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login to Railway
railway login

# Create new project
railway init
```

### 2. Set Environment Variables

In Railway dashboard:

1. Go to your project settings
2. Add variables:

```
NODE_ENV=production
MONGODB_URI=your_mongodb_atlas_uri
JWT_SECRET=your-secure-secret-32-chars-min
JWT_REFRESH_SECRET=your-refresh-secret-32-chars-min
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@extremenetworks.com
CORS_ORIGIN=https://your-railway-app-url
STORAGE_TYPE=s3
```

### 3. Add MongoDB Service

1. In Railway dashboard, click "Add"
2. Select "MongoDB"
3. Copy the `MONGODB_URI` from Railway MongoDB service
4. Add to your environment variables

### 4. Deploy

```bash
# Deploy to Railway
railway up

# Or use git:
git push railway main
```

### 5. Add Custom Domain

1. In Railway project settings
2. Go to "Domains"
3. Add your custom domain
4. Update DNS records

## File Upload

### Local Storage

Files are stored in the `/uploads` directory.

### AWS S3 (Production)

For production, configure S3:

```env
STORAGE_TYPE=s3
S3_BUCKET=your-bucket-name
S3_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
```

## Admin Setup

After deployment, create an admin user:

1. Register a normal account
2. Connect to MongoDB
3. Update user role:

```javascript
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

## Uploading Datasheets

### Via Admin Dashboard

1. Login as admin
2. Navigate to upload section
3. Select PDF file and add metadata
4. Click Upload

### Bulk Upload Script

Create datasheets from Extreme Networks website (you can automate this):

```javascript
// Example API call
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('title', 'Product Datasheet');
formData.append('product', 'ExtremeCloud IQ');
formData.append('category', 'Cloud Management');

const response = await fetch('/api/datasheets/upload', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});
```

## Security Considerations

- ✅ Passwords hashed with bcryptjs (10 rounds)
- ✅ JWT tokens with expiration
- ✅ Email verification before account activation
- ✅ Rate limiting (100 requests per 15 minutes)
- ✅ CORS protection
- ✅ Helmet.js security headers
- ✅ Input validation with Joi
- ✅ File type and size validation

## Performance Tips

1. **Caching**: Add Redis for session caching
2. **CDN**: Use CloudFront for datasheet delivery
3. **Search**: Consider Elasticsearch for large datasets
4. **Compression**: Enable gzip compression
5. **Database**: Index frequently searched fields (already done)

## Troubleshooting

### Email not sending

- Verify Gmail app password is correct
- Check 2FA is enabled
- Allow "Less secure apps" if needed

### MongoDB connection error

- Verify connection string is correct
- Check IP whitelist in MongoDB Atlas
- Ensure network connectivity

### Files not downloading

- Check file exists in storage
- Verify file permissions
- Check response headers

## Production Checklist

- [ ] Change all default secrets
- [ ] Enable HTTPS
- [ ] Set up monitoring/logging
- [ ] Configure backup strategy
- [ ] Set up error tracking (Sentry)
- [ ] Implement rate limiting per user
- [ ] Set up automated tests
- [ ] Configure CDN for file delivery
- [ ] Set up email templates properly
- [ ] Configure domain DNS

## Contributing

Pull requests welcome! Please follow:

- ESLint configuration
- Commit message format: `feat: description`
- Add tests for new features

## License

MIT

## Support

For issues or questions, contact: support@extremenetworks.com

---

**Extreme Networks Datasheets Portal** - Secure Documentation Management
