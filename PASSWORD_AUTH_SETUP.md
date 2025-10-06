# Password-Based Authentication Setup

This guide shows you how to use the new simple password-based authentication system that replaces OAuth.

## 🔑 Default Credentials

The system comes with pre-configured admin and CSR accounts:

### Admin Accounts:
- **Email:** `admin@example.com` | **Password:** `admin123`
- **Email:** `admin2@example.com` | **Password:** `admin456`

### CSR Accounts:
- **Email:** `csr@example.com` | **Password:** `csr123`
- **Email:** `csr2@example.com` | **Password:** `csr456`

## 🚀 How to Use

### 1. Access the Login Page
Navigate to: `http://localhost:3000/auth/login`

### 2. Sign In
- Enter one of the email addresses above
- Enter the corresponding password
- Click "Sign In"

### 3. Access Control
- **Admin accounts** can access:
  - Admin Dashboard (`/admin`)
  - User Management (`/admin/manage-users`)
  - CSR Portal (`/csr`)
  - Public Leaderboard (`/`)

- **CSR accounts** can access:
  - CSR Portal (`/csr`)
  - Public Leaderboard (`/`)

### 4. Sign Out
- Click the "Logout" button in the header
- Or manually clear browser localStorage

## 🔧 Customizing Credentials

To change the default credentials, edit `/src/app/api/auth/login/route.ts`:

```typescript
const ADMIN_CREDENTIALS = [
  { email: 'your-admin@example.com', password: 'your-password', role: 'admin' },
];

const CSR_CREDENTIALS = [
  { email: 'your-csr@example.com', password: 'your-password', role: 'csr' },
];
```

## 🔒 Security Features

### JWT Tokens
- 24-hour expiration
- Signed with secret key
- Stored in browser localStorage

### Role-Based Access Control
- Admin: Full access to all features
- CSR: Limited to CSR portal and public pages
- Public: Only leaderboard access

### Protection
- All admin/CSR routes are protected
- Automatic token validation
- Automatic logout on token expiration

## 🛠️ Environment Variables

Add to your `.env.local`:

```env
JWT_SECRET=your-super-secret-jwt-key-here
```

**Important:** Use a strong, random secret key in production!

## 📱 Features

### Login Page
- Clean, responsive design
- Email/password validation
- Error handling
- Loading states

### Auth Button
- Shows user email and role when logged in
- "Sign In" button when not logged in
- "Logout" button when logged in
- Automatic token refresh

### Protected Routes
- Automatic redirect to login
- Role-based access control
- Graceful error handling

## 🔄 Migration from OAuth

The new system:
- ✅ **Simpler setup** - No Google OAuth configuration needed
- ✅ **Faster authentication** - No external API calls
- ✅ **More reliable** - No dependency on Google services
- ✅ **Easier testing** - Pre-configured test accounts
- ✅ **Better control** - Manage users without external dependencies

## 🚨 Security Notes

1. **Change default passwords** in production
2. **Use strong JWT secrets**
3. **Consider HTTPS** for production
4. **Regular password rotation**
5. **Monitor login attempts**

## 🆘 Troubleshooting

### "Invalid email or password"
- Check credentials match exactly
- Ensure no extra spaces
- Verify email is lowercase

### "Token expired"
- Tokens expire after 24 hours
- Simply log in again

### "Access denied"
- Check user role matches required role
- Verify account is active in database

### Login page not loading
- Ensure `/src/app/auth/login/page.tsx` exists
- Check for any console errors
- Verify Next.js server is running
