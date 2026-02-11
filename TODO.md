# TODO: Mock Functionality Removal & Production Implementation

## Status: ✅ Completed

---

## Completed ✅

### Phase 1: Database Models - COMPLETED

- [x] **1.1 Vote Model** (`lib/models.ts`)
  - Created Vote interface and schema
  - Support likes on contestants and entries
  - Added indexes for performance

- [x] **1.2 View Model** (`lib/models.ts`)
  - Created View interface and schema
  - Track page views for contestants
  - Analytics tracking

### Phase 2: API Endpoints - COMPLETED

- [x] **2.1 Create Vote API** (`app/api/votes/route.ts`)
  - POST /api/votes - Create/remove a vote (toggle)
  - GET /api/votes - Get votes for a resource
  - DELETE /api/votes - Remove a vote

- [x] **2.2 Update Contestants API** (`app/api/contestants/route.ts`)
  - Return real like count
  - Return real view count
  - Include vote status for authenticated user

- [x] **2.3 Update Contestant Detail API** (`app/api/contestants/[slug]/route.ts`)
  - Return real like/view counts from database
  - Track views for analytics
  - Include user's vote status
  - Return entries with like counts

### Phase 3: Frontend Updates - COMPLETED

- [x] **3.1 Update Contestant Page** (`app/contestants/[slug]/page.tsx`)
  - Removed `Math.random()` for likes/views
  - Fetch real data from API
  - Add like/unlike button functionality
  - Display real entry data with likes

- [x] **3.2 Update Gallery Page** (`app/gallery/page.tsx`)
  - Display real like counts
  - Display real view counts
  - Show loading state

### Phase 4: Documentation - COMPLETED

- [x] **4.1 Complete README.md**
  - Document all environment variables
  - Setup instructions
  - API documentation
  - Deployment guide

---

## Implementation Summary

### Vote Model Schema
```typescript
interface IVote extends Document {
  userId: mongoose.Types.ObjectId
  resourceType: 'contestant' | 'entry'
  resourceId: string
  createdAt: Date
}
```

### API Response Examples

#### GET /api/contestants
```json
{
  "contestants": [
    {
      "id": "...",
      "userName": "John Doe",
      "category": "Youth Radiance",
      "likes": 150,
      "views": 1250,
      "userHasVoted": false
    }
  ]
}
```

#### GET /api/contestants/john-doe
```json
{
  "id": "...",
  "userName": "John Doe",
  "likes": 150,
  "views": 1250,
  "userHasVoted": true,
  "entries": [
    {
      "id": "...",
      "likes": 25,
      "userHasLiked": false
    }
  ]
}
```

#### POST /api/votes (Toggle Like)
```json
{
  "success": true,
  "action": "added", // or "removed"
  "count": 151,
  "userHasVoted": true
}
```

---

## Environment Variables Required

```env
# Existing
MONGODB_URI=...
NEXTAUTH_SECRET=...
RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...
EMAIL_HOST=...
EMAIL_USER=...
EMAIL_PASSWORD=...
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=...
AWS_S3_BUCKET_NAME=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# New (if needed)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Files Modified/Created

### Created
- `app/api/votes/route.ts` - Vote/Like API endpoint

### Modified
- `lib/models.ts` - Added Vote and View models
- `app/api/contestants/route.ts` - Added real like/view counts
- `app/api/contestants/[slug]/route.ts` - Added view tracking and real counts
- `app/contestants/[slug]/page.tsx` - Added like functionality
- `app/gallery/page.tsx` - Updated to show real counts
- `README.md` - Complete documentation

---

## Testing Checklist

- [x] Build completes without errors
- [x] Like/unlike functionality works
- [x] View counts increment when viewing profiles
- [x] No console warnings about mock data
- [x] All API endpoints return real data


---

## Security & Vulnerability Fixes (recent)

- **OTP RNG:** Replaced insecure `Math.random()` OTP generator with `crypto.randomInt()` in `lib/email.ts`.
- **JWT Storage:** Moved from client `localStorage` tokens to HttpOnly `auth_token` cookie set by `app/api/auth/login` and `app/api/auth/register`. Frontend updated to use `credentials: 'include'` in `lib/auth-context.tsx`, `app/contestants/[slug]/page.tsx`, and `app/gallery/page.tsx`.
- **S3 Exposure:** Removed `public-read` ACL and switched to presigned URLs using `@aws-sdk/s3-request-presigner` in `lib/s3.ts`.
- **Centralized Auth:** Added `lib/auth.ts` to centralize extracting `userId` from Authorization header or cookie and used it in API handlers (votes/contestants).
- **Regex Sanitization:** Escaped user-provided `search` input in `app/api/contestants/route.ts` to reduce ReDoS / injection risk.
- **Slug Field:** Added `slug` field and auto-generation for `User` in `lib/models.ts` to make slug lookups deterministic.
- **Logout Endpoint:** Added `POST /api/auth/logout` to clear the HttpOnly cookie.
- **Session Persistence:** Added persistent `Session` model with 30-day `session_id` cookie to maintain login across browser restarts without Cloudflare Captcha re-prompts. Sessions are auto-cleanup via TTL index.
- **Rate-Limiting:** Implemented per-route rate-limiting via `middleware.ts` with per-IP tracking:
  - **OTP Send:** 3 requests/min (strictest)
  - **OTP Verify:** 5 requests/min
  - **Login/Register:** 10 requests/min
  - **Votes:** 30 requests/min
  - **Logout:** 50 requests/min
- **CSP & Security Headers:** Added middleware to enforce:
  - X-Frame-Options: DENY (prevents clickjacking)
  - X-Content-Type-Options: nosniff (prevents MIME sniffing)
  - Referrer-Policy: no-referrer (privacy)
  - Strict-Transport-Security with preload (HSTS)
  - Content-Security-Policy tuned for Cloudinary, cdn.jsdelivr.net, and WebSocket
  - Permissions-Policy to disable geolocation and microphone

**Validation Results:**
- ✅ Security scan confirms all headers present on responses
- ✅ CSP allows Cloudinary, blocks frame-ancestors, defaults to 'self'
- ✅ Rate-limiting enforced: 4th OTP request blocked (3 req/min limit)
- ✅ Cookies are HttpOnly and SameSite=Lax
- ✅ MongoDB connected; no schema errors

Notes:
- Additional hardening available (future): Redis-backed rate-limiting for distributed deployments, CSRF tokens on state-changing endpoints, audit logging, intrusion detection.
- Email sending requires valid SendGrid or SMTP credentials in `.env.local`.


