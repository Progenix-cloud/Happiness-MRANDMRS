# Mr & Miss Happiness - Production Setup Guide

## Overview
This is a complete Next.js application for the Mr & Miss Happiness contest platform with full production-ready implementations including MongoDB, JWT authentication, email services, file storage, and payment processing.

## Implemented Features

### ✅ Database (MongoDB + Mongoose)
- Complete MongoDB connection in `lib/mongodb.ts`
- All models defined in `lib/models.ts`:
  - User
  - OTP (for email verification)
  - Payment (Razorpay integration)
  - HappinessEntry (passport entries)
  - Media (gallery items)
  - Registration
  - Vote (likes/votes tracking)
  - View (analytics tracking)

### ✅ Authentication System
- JWT-based authentication with bcrypt password hashing
- User registration with email verification
- Protected routes with token validation
- OTP email verification

### ✅ Email Service (Nodemailer)
- OTP email sending for verification
- Welcome emails
- Payment confirmation emails

### ✅ File Storage
- AWS S3 integration in `lib/s3.ts`
- Cloudinary integration in `lib/cloudinary.ts`
- Both providers supported for photos and videos

### ✅ Payment Integration (Razorpay)
- Order creation
- Payment verification
- Webhook handling
- Refund support

### ✅ Like/Vote System
- Vote model and API (`app/api/votes/route.ts`)
- Like/unlike functionality
- Real-time vote counts

### ✅ Analytics (Views)
- View tracking model
- Automatic view recording for contestant profiles
- Real view counts

## Required Environment Variables

Create a `.env.local` file in the project root:

```env
# ===================
# Database (MongoDB)
# ===================
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mr-miss-happiness
# OR for local development:
# MONGODB_URI=mongodb://localhost:27017/mr-miss-happiness

# ===================
# NextAuth / JWT
# ===================
NEXTAUTH_SECRET=your-super-secret-key-at-least-32-characters
NEXTAUTH_URL=http://localhost:3000
# For production:
# NEXTAUTH_URL=https://your-domain.com

# ===================
# Email Service (Nodemailer)
# ===================
EMAIL_HOST=smtp.gmail.com
# EMAIL_HOST=smtp.your-email-provider.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@mr-miss-happiness.com

# For Gmail, use App Password:
# 1. Go to Google Account > Security
# 2. Enable 2-Step Verification
# 3. Go to App Passwords
# 4. Create new app password for 'Mail'

# ===================
# Razorpay Payment Gateway
# ===================
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_key_id

# Get keys from: https://dashboard.razorpay.com/app/keys

# ===================
# AWS S3 File Storage
# ===================
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=mr-miss-happiness

# Create IAM user with S3 permissions:
# 1. Go to AWS IAM Console
# 2. Create user with programmatic access
# 3. Attach AmazonS3FullAccess policy
# 4. Create S3 bucket with public read access

# ===================
# Cloudinary (Alternative Storage)
# ===================
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Get credentials from: https://cloudinary.com/console

# ===================
# Optional: Analytics
# ===================
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/send-otp` - Send OTP for verification
- `POST /api/auth/verify-otp` - Verify OTP

### Registration
- `GET /api/registration` - Get user's registration
- `POST /api/registration` - Create/update registration
- `PUT /api/registration` - Update registration status (admin)

### Payment
- `POST /api/payment/create-order` - Create Razorpay order
- `POST /api/payment/verify` - Verify payment
- `POST /api/webhooks/razorpay` - Handle Razorpay webhooks

### Content
- `GET /api/contestants` - Get all contestants
- `GET /api/contestants/[slug]` - Get single contestant
- `GET /api/passport` - Get user's passport entries
- `POST /api/passport` - Create passport entry
- `PUT /api/passport` - Update passport entry
- `DELETE /api/passport` - Delete passport entry

### Media
- `GET /api/media` - Get user's media
- `POST /api/media` - Upload media
- `DELETE /api/media` - Delete media

### Voting
- `GET /api/votes` - Get votes for a resource
- `POST /api/votes` - Vote/like or unlike
- `DELETE /api/votes` - Remove vote

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables in `.env.local`

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## Production Deployment

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

## Dependencies

Key packages used:
- `next` - React framework
- `mongoose` - MongoDB ODM
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT authentication
- `nodemailer` - Email sending
- `razorpay` - Payment gateway
- `@aws-sdk/client-s3` - AWS S3
- `cloudinary` - Image/video hosting

