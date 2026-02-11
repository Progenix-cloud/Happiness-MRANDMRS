# Quick Start Commands

## Development Server

```bash
# Start dev server on port 3001
npm run dev -- --port 3001

# Then visit:
# - Registration: http://localhost:3001/auth/register
# - Login: http://localhost:3001/auth/login
# - Dashboard: http://localhost:3001/dashboard
```

## Build & Test Production Build

```bash
# Build the project
npm run build

# Start production server
npm start
```

## Environment Setup

```bash
# Copy example env file
cp .env.local.example .env.local

# Edit with your values:
# - NEXT_PUBLIC_GOOGLE_CLIENT_ID
# - GOOGLE_CLIENT_ID
# - SENDGRID_API_KEY
# - SENDGRID_FROM_EMAIL
# - NEXTAUTH_SECRET
# - MONGODB_URI
```

## Testing Authentication Flows

### 1. Register with Email/Password
```
1. Go to http://localhost:3001/auth/register
2. Fill in: email, name, password, phone (optional)
3. Click "Sign up"
4. Enter OTP from email (check terminal if email not configured)
5. Get redirected to dashboard
```

### 2. Google Sign-Up
```
1. Go to http://localhost:3001/auth/register
2. Click "Sign up with Google"
3. Follow consent screen in popup
4. Get redirected to dashboard
```

### 3. Google Sign-In (if already have account)
```
1. Go to http://localhost:3001/auth/login
2. Click "Sign in with Google"
3. Select account (or consent again)
4. Get redirected to dashboard
```

### 4. Email/Password Login
```
1. Go to http://localhost:3001/auth/login
2. Enter registered email and password
3. Click "Sign In"
4. Get redirected to dashboard
```

## Debugging

### Check if dev server is running
```bash
curl http://localhost:3001/api/auth/me
# Should return 401 (no token)
```

### Verify MongoDB connection
```bash
# Check MongoDB_URI in .env.local
# Ensure cluster IP whitelist includes your IP
```

### Check email service
```bash
# If using SendGrid:
# - Verify API key in .env.local
# - Check SendGrid dashboard for sent emails

# If using SMTP:
# - Check Gmail app password is correct
# - Verify "Less secure apps" is enabled
```

### View server logs
```bash
# In terminal where npm run dev is running:
# - Look for ✅ messages for successful operations
# - Look for ❌ messages for errors
```

## API Testing with cURL

### Register
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User",
    "phone": "+1234567890"
  }'
```

### Verify OTP
```bash
curl -X POST http://localhost:3001/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "otp": "123456",
    "type": "email_verification"
  }'
```

### Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Get Current User (with token)
```bash
curl -X GET http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Google OAuth
```bash
curl -X POST http://localhost:3001/api/auth/google \
  -H "Content-Type: application/json" \
  -d '{
    "idToken": "YOUR_GOOGLE_ID_TOKEN"
  }'
```

## File Structure Summary

```
/app
  /api/auth
    /register   → User registration with OTP
    /verify-otp → OTP verification endpoint
    /login      → Email/password login
    /google     → Google OAuth verification
    /send-otp   → Send OTP endpoint
    /me         → Get/update current user
  /auth
    /register   → Registration page with form + Google button
    /login      → Login page with form + Google button
    /verify-otp → OTP verification page

/lib
  /email.ts         → SendGrid + SMTP email service
  /auth-context.tsx → Global auth state + hooks
  /models.ts        → MongoDB user schemas
  /mongodb.ts       → MongoDB connection

/public
  /google-oauth-callback.html → OAuth popup callback handler
```

## Production Deployment

### Vercel (Recommended for Next.js)
```bash
# 1. Push code to GitHub
git push origin main

# 2. Connect to Vercel dashboard
# 3. Set environment variables:
#    - NEXTAUTH_SECRET
#    - GOOGLE_CLIENT_ID
#    - SENDGRID_API_KEY
#    - MONGODB_URI
#    (all from .env.local)

# 4. Deploy
vercel deploy --prod
```

### Self-Hosted (e.g., AWS EC2, DigitalOcean)
```bash
# 1. SSH into server
ssh user@your-domain.com

# 2. Clone repo and install
git clone https://github.com/username/repo.git
cd repo
npm install --legacy-peer-deps

# 3. Create .env file with production values
nano .env.local

# 4. Build and start
npm run build
npm start

# 5. (Optional) Use PM2 for process management
npm install -g pm2
pm2 start "npm start" --name "app"
pm2 startup
pm2 save
```

---

**All auth flows are now fully integrated and ready for testing!**
