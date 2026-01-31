# HomeVeda Backend - Installation & Setup Guide

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [Database Setup](#database-setup)
6. [Running the Application](#running-the-application)
7. [Verification & Testing](#verification--testing)
8. [Troubleshooting](#troubleshooting)
9. [Production Deployment](#production-deployment)

---

## Prerequisites

### Required Software

- **Node.js**: v16.0.0 or higher ([Download](https://nodejs.org/))
- **npm**: v7.0.0 or higher (comes with Node.js)
- **MongoDB**: v4.4 or higher
  - Local installation, or
  - MongoDB Atlas cloud database (recommended)
- **Git**: For version control ([Download](https://git-scm.com/))
- **AWS Account**: For S3 file storage

### System Requirements

- **Operating System**: Windows, macOS, or Linux
- **RAM**: Minimum 2GB
- **Disk Space**: Minimum 500MB free
- **Network**: Stable internet connection

---

## Environment Setup

### Step 1: Clone Repository

```bash
git clone <repository-url>
cd Backend
```

### Step 2: Install Node.js Dependencies

```bash
npm install
```

This installs all packages listed in `package.json`:
- Express.js
- MongoDB Mongoose
- JWT authentication
- AWS SDK
- Email service
- File upload handlers

### Step 3: Verify Installation

```bash
npm list
```

You should see a tree of all installed packages without error warnings.

---

## Configuration

### Step 1: Create Environment File

Create a `.env` file in the Backend root directory:

```bash
# Linux/macOS
touch .env

# Windows (PowerShell)
New-Item -Path .\.env -Type File
```

### Step 2: Add Environment Variables

Copy and paste the following into `.env`:

```env
# Server Configuration
PORT=5500

# MongoDB Connection
MONGO_URL=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority&appName=homeVeda

# JWT Configuration
JWT_SECRET=your_secure_random_string_here

# Email Configuration (Gmail)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Client Configuration
CLIENT_URL=http://localhost:3000

# AWS S3 Configuration
AWS_ACCESS_KEY=your_aws_access_key
AWS_SECRET_KEY=your_aws_secret_key
AWS_REGION=ap-south-1
S3_BUCKET=home-veda-storage
```

### Step 3: Configure Each Service

#### MongoDB Atlas Setup

1. Visit [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster
4. Get connection string:
   - Click "Connect" → "Drivers"
   - Copy connection string
   - Replace `<username>` and `<password>`
5. Add IP whitelist: 0.0.0.0/0 (for development)

Example connection string:
```
mongodb+srv://admin:password123@homeveda.abc123.mongodb.net/?retryWrites=true&w=majority&appName=homeVeda
```

#### JWT Secret

Generate a secure random string:

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Using OpenSSL (Linux/macOS)
openssl rand -hex 32
```

#### Email Configuration (Gmail)

1. Enable 2-factor authentication on Gmail
2. Generate App Password:
   - Go to [Google Account](https://myaccount.google.com)
   - Security → App passwords
   - Select Mail and Windows
   - Copy the generated password
3. Use as `EMAIL_PASS`

#### AWS S3 Configuration

1. Create AWS account at [AWS Console](https://aws.amazon.com/)
2. Create S3 bucket: `home-veda-storage`
3. Create IAM user with S3 access:
   - Go to IAM dashboard
   - Create new user
   - Attach `AmazonS3FullAccess` policy
   - Generate access key and secret key
4. Configure bucket permissions:
   - Bucket Policy → Allow public read access
   - CORS → Allow requests from frontend URL

---

## Database Setup

### Option 1: MongoDB Atlas (Cloud - Recommended)

**Advantages**: No local installation, automatic backups, scalable

1. Follow MongoDB Atlas Setup above
2. Connection string automatically available
3. Database created automatically on first insert

### Option 2: Local MongoDB

**Installation:**

**Windows:**
```bash
# Using Chocolatey
choco install mongodb-community

# Or download from: https://www.mongodb.com/try/download/community
```

**macOS:**
```bash
# Using Homebrew
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux (Ubuntu):**
```bash
sudo apt-get install -y mongodb

sudo systemctl start mongodb
sudo systemctl enable mongodb
```

**Connection String:**
```
mongodb://localhost:27017/homeveda
```

### Database Initialization

```javascript
// Connect string in config/mongo.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URL);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
```

---

## Running the Application

### Development Mode

Run with auto-restart on file changes:

```bash
npm run dev
```

The server runs on `http://localhost:5500`

### Production Mode

```bash
npm start
```

### Verify Server is Running

```bash
# In another terminal, test the server
curl http://localhost:5500/user

# Expected response (if no auth required)
{
  "message": "Server is running"
}
```

---

## Verification & Testing

### Step 1: Test Database Connection

```bash
curl -X GET http://localhost:5500/user/all \
  -H "Authorization: Bearer <admin_jwt_token>"
```

### Step 2: Test User Registration

```bash
curl -X POST http://localhost:5500/user \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "phone": "9876543210"
  }'

# Expected response:
# {"message": "User registered successfully"}
```

### Step 3: Test Login

```bash
curl -X POST http://localhost:5500/user/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# Expected response:
# {"message": "Login successful", "token": "eyJ..."}
```

### Step 4: Test File Upload (AWS S3)

```bash
curl -X POST http://localhost:5500/catelog \
  -H "Authorization: Bearer <admin_token>" \
  -F "name=Test Item" \
  -F "category=Standard" \
  -F "workType=Carcass" \
  -F "price=15000" \
  -F "type=Normal" \
  -F "image=@/path/to/image.jpg"
```

### Step 5: Import Postman Collection

1. Open Postman
2. File → Import → Choose `postman_collection.json`
3. Set environment variable:
   - `baseUrl`: `http://localhost:5500`
   - `adminToken`: Your JWT admin token (from login response)
4. Run requests from collection

---

## Troubleshooting

### Issue: Cannot Connect to MongoDB

**Symptoms**: `MongooseError: Cannot connect to mongodb://...`

**Solutions**:
1. Verify MongoDB is running:
   ```bash
   # Local MongoDB
   mongosh
   
   # Or check service status
   systemctl status mongodb
   ```

2. Check connection string in `.env`:
   - Username/password must be correct
   - IP whitelist includes your IP
   - Database name is correct

3. Test connection:
   ```bash
   mongosh "<connection_string>"
   ```

### Issue: Port Already in Use

**Symptoms**: `Error: listen EADDRINUSE :::5500`

**Solutions**:
```bash
# Find process using port 5500
lsof -i :5500  # macOS/Linux
netstat -ano | findstr :5500  # Windows

# Kill the process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows

# Or use different port
PORT=5501 npm run dev
```

### Issue: JWT Token Errors

**Symptoms**: `401 Invalid token` or `Invalid authorization format`

**Solutions**:
1. Ensure token is in request header:
   ```
   Authorization: Bearer <token>
   ```

2. Token may be expired (7-day validity):
   ```bash
   # Generate new token with login request
   ```

3. JWT_SECRET mismatch:
   - Verify `JWT_SECRET` in `.env` matches deployment

### Issue: File Upload Fails

**Symptoms**: `413 Payload Too Large` or AWS S3 errors

**Solutions**:
1. Check file size (under 10MB recommended)
2. Verify AWS credentials in `.env`
3. Check S3 bucket exists and is accessible
4. Enable CORS on S3 bucket

### Issue: Email Not Sending

**Symptoms**: `Password reset email not received`

**Solutions**:
1. Verify Gmail credentials:
   - `EMAIL_USER` is complete email address
   - `EMAIL_PASS` is app-specific password (not account password)

2. Enable "Less secure apps" (if not using app password):
   - https://myaccount.google.com/security

3. Check spam folder

4. Test email service:
   ```bash
   node scripts/test-email.js
   ```

---

## Production Deployment

### Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] Database backups enabled
- [ ] S3 bucket secured with proper permissions
- [ ] SSL/TLS certificates obtained
- [ ] Error logging configured
- [ ] Rate limiting implemented
- [ ] CORS configured for production domain
- [ ] JWT secret changed to production value

### Deploy to Heroku

```bash
# Install Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# Login to Heroku
heroku login

# Create new app
heroku create homeveda-backend

# Set environment variables
heroku config:set PORT=5500
heroku config:set MONGO_URL=<production_mongo_url>
heroku config:set JWT_SECRET=<new_secure_secret>

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

### Deploy to AWS EC2

```bash
# 1. Launch EC2 instance (Ubuntu 20.04)
# 2. SSH into instance
ssh -i key.pem ubuntu@instance-ip

# 3. Install dependencies
sudo apt update
sudo apt install nodejs npm

# 4. Clone repository
git clone <repo>
cd Backend

# 5. Install npm packages
npm install

# 6. Create .env file with production values
nano .env

# 7. Install PM2 (process manager)
npm install -g pm2

# 8. Start application
pm2 start app.js --name "homeveda-backend"
pm2 startup
pm2 save

# 9. Setup nginx reverse proxy
sudo apt install nginx
# Configure reverse proxy to localhost:5500
```

### Deploy to Docker

**Dockerfile:**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

ENV NODE_ENV=production
EXPOSE 5500

CMD ["npm", "start"]
```

**Build and run:**
```bash
docker build -t homeveda-backend .
docker run -p 5500:5500 --env-file .env homeveda-backend
```

### Deploy with Docker Compose

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "5500:5500"
    environment:
      - MONGO_URL=mongodb://mongo:27017/homeveda
    depends_on:
      - mongo

  mongo:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db

volumes:
  mongo-data:
```

---

## Performance Optimization

### 1. Enable Gzip Compression

```javascript
import compression from 'compression';
app.use(compression());
```

### 2. Implement Caching

```javascript
// Cache catalog for 1 hour
app.get('/catelog', (req, res, next) => {
  res.set('Cache-Control', 'public, max-age=3600');
  next();
});
```

### 3. Database Indexing

```javascript
// In userModel.js
userSchema.index({ email: 1 });
userSchema.index({ createdAt: -1 });
```

### 4. Connection Pooling

```javascript
// MongoDB connection options
mongoose.connect(url, {
  maxPoolSize: 10,
  minPoolSize: 5
});
```

---

## Monitoring & Logging

### Request Logging

Already implemented with Morgan:
```javascript
app.use(morgan('dev')); // Development
app.use(morgan('combined')); // Production
```

### Error Logging

Add Winston for production logging:

```bash
npm install winston
```

```javascript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

---

## Maintenance

### Database Backups

**MongoDB Atlas**: Automatic backups in cloud (check dashboard)

**Local MongoDB**:
```bash
# Export database
mongodump --db homeveda --out ./backups/

# Import database
mongorestore ./backups/
```

### Dependency Updates

```bash
# Check outdated packages
npm outdated

# Update packages
npm update

# Major version updates
npm install express@latest
```

### Log Rotation

Implement log rotation for production to prevent disk space issues.

---

## Support

For issues or questions:
1. Check troubleshooting section
2. Review MongoDB/AWS documentation
3. Check server logs: `npm run dev`
4. Verify all environment variables are set
