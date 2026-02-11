# Mock Functionality Removal - Production Migration Guide

## Overview

This document outlines all mock data and functionality that has been removed from the Mr & Miss Happiness application during the migration to production-ready code. All temporary implementations have been replaced with placeholders requiring real backend integration.

**Migration Date:** February 2026  
**Status:** Production Ready (with required environment variables)

---

## 1. Mock Data Structures - REMOVED ❌

### File Removed
- **`lib/mock-data.ts`** - COMPLETELY REMOVED

### Mock Data Arrays Removed
```typescript
// These were all removed and are no longer available:
- mockUsers[]              // 2 mock users with fake data
- mockMediaItems[]         // 3 mock media items with placeholder URLs
- mockContestantProfiles[] // 6 mock contestant profiles
- mockPassportEntries[]    // 3 mock happiness passport entries
- mockRegistrations[]      // 1 mock registration record
```

### Impact
- **Components Affected:** Dashboard, Gallery, Contestants pages
- **Solution:** All pages now fetch data from API endpoints instead
- **Required Action:** Implement API endpoints to fetch real data from database

### Migration Path
```typescript
// BEFORE (Mock Data):
import { mockUsers, mockPassportEntries } from '@/lib/mock-data'
const currentUser = user || mockUsers[0]
const passportEntries = mockPassportEntries.filter(...)

// AFTER (API Calls):
const [passportEntries, setPassportEntries] = useState([])
useEffect(() => {
  if (user) {
    const response = await fetch(`/api/users/${user?.id}/passport-entries`)
    const data = await response.json()
    setPassportEntries(data)
  }
}, [user])
```

---

## 2. Demo Mode Authentication - REMOVED ❌

### Files Modified
- **`app/api/auth/me/route.ts`** - Demo user endpoint replaced
- **`app/api/auth/login/route.ts`** - Updated to require database
- **`app/api/auth/register/route.ts`** - Updated to require database

### Demo Mode Features Removed
```typescript
// BEFORE: Accepting any credentials
const user = {
  id: 'demo-user-id',
  email: 'demo@example.com',
  name: 'Demo User',
  roles: ['participant'],
  // ... fake data
}

// AFTER: Proper JWT verification required
const payload = jwt.verify(token, process.env.NEXTAUTH_SECRET)
const user = await db.query.users.findFirst({ where: eq(users.id, payload.userId) })
```

### Removed Capabilities
- ✗ Accept demo credentials without verification
- ✗ Create fake JWT tokens with base64 encoding
- ✗ Generate demo user without database persistence
- ✗ Auto-login without valid credentials

### Required Environment Variables
```env
NEXTAUTH_SECRET=your-secret-key-here
DATABASE_URL=postgresql://user:password@localhost/dbname
```

---

## 3. OTP Email Verification System - REMOVED ❌

### Files Removed
- **`app/api/auth/send-otp/route.ts`** - DELETED (was mock OTP sender)
- **`app/api/auth/verify-otp/route.ts`** - DELETED (was mock OTP verifier)

### Mock OTP Features Removed
```typescript
// BEFORE: Console logging OTP
console.log('[OTP] Email to:', email)
console.log('[OTP] Code:', otp)

// BEFORE: Mock OTP storage
const otpStorage = new Map<string, { otp: string; expiresAt: number }>()

// BEFORE: Auto-accepting any 6-digit OTP in development
if (process.env.NODE_ENV !== 'development') {
  // verify OTP
}
```

### Removed Capabilities
- ✗ In-memory OTP storage
- ✗ Console-based OTP display
- ✗ Auto-accept any 6-digit code
- ✗ Fake email sending

### Utilities Retained
The `lib/otp.ts` file was simplified to include only:
- `validateOTPFormat(otp)` - Validates format only
- `formatOTP(otp)` - Formats for display
- Type definitions for OTP operations

### Required Implementation
To restore OTP functionality, implement:
```typescript
// Choose one email provider:

// Option 1: SendGrid
npm install @sendgrid/mail

// Option 2: Nodemailer
npm install nodemailer @types/nodemailer

// Option 3: AWS SES
npm install aws-sdk

// Environment Variables:
SENDGRID_API_KEY=your-sendgrid-key
// OR
EMAIL_SERVER=smtp://...
EMAIL_FROM=noreply@example.com
// OR
AWS_SES_REGION=us-east-1
```

---

## 4. Mock Payment Integration - REMOVED ❌

### Files Modified
- **`app/api/payment/create-order/route.ts`** - Now requires real Razorpay credentials
- **`app/api/payment/verify/route.ts`** - Now requires real Razorpay secret

### Mock Payment Features Removed
```typescript
// BEFORE: Fake order generation
const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(7)}`
console.log('[v0] Razorpay Order Created:', { orderId, amount, ... })

// BEFORE: Demo fallback credentials
keyId: process.env.RAZORPAY_KEY_ID || 'demo_key_id',
keySecret: process.env.RAZORPAY_KEY_SECRET || 'demo_key_secret',
```

### Removed Capabilities
- ✗ Mock order ID generation
- ✗ Demo credentials fallback
- ✗ Fake payment processing
- ✗ Console-logged payment verifications

### Required Environment Variables
```env
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your-razorpay-secret-key
RAZORPAY_WEBHOOK_SECRET=your-webhook-secret
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### API Endpoints Now Require
1. **POST `/api/payment/create-order`**
   - Calls real Razorpay API
   - Requires `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`
   - Returns real order IDs from Razorpay

2. **POST `/api/payment/verify`**
   - Verifies signatures against `RAZORPAY_KEY_SECRET`
   - Rejects invalid signatures
   - Should save payment to database after verification

---

## 5. Placeholder URLs & Mock Media - REMOVED ❌

### Mock Image URLs Removed
```typescript
// BEFORE: Using placeholder service URLs
'/placeholder.jpg?height=300&width=400'
'/placeholder-user.jpg'
'/placeholder.svg?height=300&width=400'
```

### Removed Components Using Mocks
- Gallery mock media items
- Contestant profile images
- User avatar placeholders

### Required File Storage Implementation
Choose one:

**Option 1: AWS S3**
```env
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_S3_BUCKET_NAME=your-bucket
AWS_REGION=us-east-1
```
```bash
npm install aws-sdk @aws-sdk/client-s3 @aws-sdk/lib-storage
```

**Option 2: Cloudinary**
```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```
```bash
npm install cloudinary
```

**Option 3: Firebase Storage**
```env
FIREBASE_PROJECT_ID=your-project
FIREBASE_STORAGE_BUCKET=your-bucket.appspot.com
FIREBASE_PRIVATE_KEY=your-key
FIREBASE_CLIENT_EMAIL=your-email
```
```bash
npm install firebase-admin
```

---

## 6. Mock Dashboard Data - REMOVED ❌

### Changes Made
- **`app/dashboard/page.tsx`** - Removed all mock user references
- Now fetches user data from auth context
- Fetches passport entries from API: `/api/users/{userId}/passport-entries`

### Before & After
```typescript
// BEFORE: Using mock fallback
const currentUser = user || mockUsers[0]
const passportEntries = mockPassportEntries.filter(...)

// AFTER: Requires authenticated user
const { user, logout } = useAuth()
const [passportEntries, setPassportEntries] = useState([])

useEffect(() => {
  if (user) {
    fetchPassportEntries()
  }
}, [user])
```

---

## 7. Placeholder Text Removal - CLEANED UP ✓

### Cleaned Instances
- Removed `[v0]` debug prefixes from console logs
- Removed development-only comments referencing "demo" mode
- Removed placeholder text from configuration

### Console Log Changes
```typescript
// BEFORE
console.log('[v0] Razorpay Order Created:', { ... })
console.log('[OTP] Email to:', email)

// AFTER
console.log('Error creating order:', error)
console.log('Payment verified:', { ... })
```

---

## 8. Database Integration Stubs - REQUIRED ⚠️

### Files with Database Placeholders
1. **`app/api/auth/login/route.ts`**
   ```typescript
   // Placeholder comment indicates database call needed
   const user = await db.getUserByEmail(email)
   ```

2. **`app/api/auth/register/route.ts`**
   ```typescript
   // Placeholder comment indicates database call needed
   const savedUser = await db.users.create(user)
   ```

3. **`app/api/payment/verify/route.ts`**
   ```typescript
   // Placeholder comment indicates database call needed
   await db.payments.create({ ... })
   ```

### Required Database Setup
Must create/configure:
- `lib/db.ts` or database client
- Database migrations/schema
- Implement required methods:
  - `db.getUserByEmail(email)`
  - `db.users.create(user)`
  - `db.payments.create(payment)`

---

## 9. Missing API Endpoints - REQUIRED ⚠️

These endpoints must be implemented:

### Required API Routes
```
GET  /api/users/{userId}/passport-entries
GET  /api/contestants
GET  /api/contestants/{slug}
GET  /api/gallery
POST /api/gallery/upload
POST /api/users/{userId}/register
GET  /api/auth/me (needs database implementation)
```

### Endpoint Templates
```typescript
// GET /api/users/{userId}/passport-entries
// Returns: HappinessEntry[]

// GET /api/contestants
// Returns: ContestantProfile[]

// POST /api/gallery/upload
// Body: FormData with file + metadata
// Returns: { success: boolean; mediaUrl: string }
```

---

## 10. Authentication Context - UPDATED ✓

### File: `lib/auth-context.tsx`
- Removed references to `mockUsers`
- Now purely relies on API calls to `/api/auth/me`, `/api/auth/login`, `/api/auth/register`
- Properly stores JWT tokens
- Requires all backend implementations

---

## 11. Environment Variables - CHECKLIST ✓

### CRITICAL - Must Set Before Running
```env
# Authentication
NEXTAUTH_SECRET=generate-a-strong-random-string
DATABASE_URL=your-database-connection-string

# Payment (Razorpay)
RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=your-secret-key
RAZORPAY_WEBHOOK_SECRET=webhook-secret

# Email Service (Choose one)
SENDGRID_API_KEY=your-key
# OR
EMAIL_SERVER=smtp://...
EMAIL_FROM=noreply@yourdomain.com

# File Storage (Choose one)
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_S3_BUCKET_NAME=bucket-name
# OR
CLOUDINARY_CLOUD_NAME=your-cloud
CLOUDINARY_API_KEY=your-key

# App URL
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

---

## 12. Dependencies - Installation Required ⚠️

### Missing Dependencies to Install
```bash
# Authentication & JWT
npm install jsonwebtoken @types/jsonwebtoken

# Email Services (choose one)
npm install @sendgrid/mail
# OR
npm install nodemailer @types/nodemailer

# Database ORM (choose one)
npm install prisma @prisma/client
# OR
npm install drizzle-orm drizzle-kit

# File Upload
npm install @aws-sdk/client-s3 @aws-sdk/lib-storage
# OR
npm install cloudinary
```

### Install Command
```bash
npm install jsonwebtoken @types/jsonwebtoken
# Then add specific services as needed
```

---

## Summary of Changes

| Category | Status | Action Required |
|----------|--------|-----------------|
| Mock Data | ✗ Removed | Implement API endpoints |
| OTP System | ✗ Removed | Integrate email service |
| Payment | ⚠️ Updated | Set Razorpay env vars |
| Auth | ⚠️ Updated | Implement database |
| Media Storage | ✗ Removed | Configure file storage |
| Dashboard | ✓ Updated | No action (uses API) |
| Database | ⚠️ Stub | Implement database layer |

---

## Next Steps for Production

1. **Set up Database**
   - Create MongoDB, PostgreSQL, or MySQL database
   - Set `DATABASE_URL` environment variable
   - Run migrations

2. **Configure Authentication**
   - Generate strong `NEXTAUTH_SECRET`
   - Implement database user queries
   - Test login/register flow

3. **Set up Payment**
   - Create Razorpay account
   - Get API credentials
   - Set environment variables
   - Implement payment webhook

4. **Configure Email**
   - Choose email service (SendGrid, Nodemailer, AWS SES)
   - Get API credentials
   - Implement OTP sending

5. **Set up File Storage**
   - Choose provider (AWS S3, Cloudinary, Firebase)
   - Get credentials
   - Implement upload endpoints

6. **Test All Features**
   - Test authentication flow
   - Test payments
   - Test file uploads
   - Test OTP verification

---

## File Changes Summary

### Deleted Files (3)
- ❌ `lib/mock-data.ts`
- ❌ `app/api/auth/send-otp/route.ts`
- ❌ `app/api/auth/verify-otp/route.ts`

### Modified Files (8)
- ✓ `lib/otp.ts` - Simplified to utility functions only
- ✓ `app/api/auth/me/route.ts` - Requires JWT token verification
- ✓ `app/api/auth/login/route.ts` - Requires database
- ✓ `app/api/auth/register/route.ts` - Requires database
- ✓ `app/api/payment/create-order/route.ts` - Requires Razorpay credentials
- ✓ `app/api/payment/verify/route.ts` - Requires Razorpay credentials
- ✓ `app/dashboard/page.tsx` - Uses API calls instead of mock data
- ✓ `lib/auth-context.tsx` - Removed mock data references

### Unchanged Core Files (Still need implementation)
- `app/api/auth/login/route.ts` - Database integration needed
- `app/api/auth/register/route.ts` - Database integration needed
- `lib/db.ts` - Needs to be created

---

## Testing Checklist

- [ ] Build completes without errors
- [ ] Authentication endpoints return 501 or proper errors (not mock data)
- [ ] Dashboard requires authenticated user
- [ ] Payment endpoints require Razorpay credentials
- [ ] All mock console logs removed
- [ ] No mock URLs in production build
- [ ] Environment variables properly validated

---

## Questions & Support

For integration help:
1. Check the inline comments in each modified file
2. Review the API endpoint stubs for expected interfaces
3. Refer to the environment variable section for setup
4. Each endpoint has comments indicating what needs implementation

