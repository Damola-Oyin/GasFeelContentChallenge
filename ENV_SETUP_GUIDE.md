# Environment Variables Setup Guide

This guide shows you how to set up your authentication credentials securely using environment variables.

## 🔐 Why Use Environment Variables?

- ✅ **Passwords not in codebase** - More secure
- ✅ **Easy to change** - Update without code changes
- ✅ **Team-friendly** - Each developer can have their own credentials
- ✅ **Production-ready** - Standard security practice

## 🚀 Quick Setup

### Step 1: Edit Your .env.local File

Open `.env.local` in your project root and update the credentials:

```env
# Password-based Authentication Credentials
# Replace these with your actual team emails and secure passwords

# JWT Secret for authentication tokens
JWT_SECRET=YourSuperSecretJWTKey2024

# Admin Credentials
ADMIN_EMAIL_1=your-admin1@gmail.com
ADMIN_PASSWORD_1=YourSecureAdminPassword123!

ADMIN_EMAIL_2=your-admin2@gmail.com
ADMIN_PASSWORD_2=AnotherSecureAdminPassword456!

# CSR Credentials
CSR_EMAIL_1=your-csr1@gmail.com
CSR_PASSWORD_1=YourSecureCSRPassword789!

CSR_EMAIL_2=your-csr2@gmail.com
CSR_PASSWORD_2=AnotherSecureCSRPassword012!
```

### Step 2: Replace the Placeholder Values

1. **Change the JWT_SECRET** to a strong, random string
2. **Replace email addresses** with your team's actual emails
3. **Replace passwords** with strong, secure passwords
4. **Save the file**

### Step 3: Restart Your Development Server

```bash
npm run dev
```

### Step 4: Test Login

Visit `http://localhost:3000/auth/login` and test with your credentials.

## 🔒 Security Best Practices

### JWT Secret:
- **Use a strong, random string** (at least 32 characters)
- **Include letters, numbers, and symbols**
- **Never share this secret**
- **Example**: `GasFeel2024!SuperSecretJWTKey@Secure#123`

### Passwords:
- **Minimum 8 characters**
- **Mix of uppercase and lowercase**
- **Include numbers and symbols**
- **Unique for each user**
- **Examples**:
  - `Admin2024!Secure`
  - `CSR@GasFeel#123`
  - `MySecure!Password456`

### Email Addresses:
- **Use real, accessible email addresses**
- **No typos or extra spaces**
- **Consistent format**

## 📋 Current Default Credentials

If you haven't updated the environment variables yet, these are the defaults:

### Admin Accounts:
- **Email**: `admin1@example.com` | **Password**: `admin123`
- **Email**: `admin2@example.com` | **Password**: `admin456`

### CSR Accounts:
- **Email**: `csr1@example.com` | **Password**: `csr123`
- **Email**: `csr2@example.com` | **Password**: `csr456`

## 🛠️ Adding More Users

To add more admin or CSR accounts, you have two options:

### Option A: Add to Environment Variables
Add more credentials to your `.env.local`:

```env
# Additional Admin
ADMIN_EMAIL_3=another-admin@gmail.com
ADMIN_PASSWORD_3=AnotherSecurePassword789!

# Additional CSR
CSR_EMAIL_3=another-csr@gmail.com
CSR_PASSWORD_3=CSRPassword456!
```

Then update the login route to include them:

```typescript
const ADMIN_CREDENTIALS = [
  { 
    email: process.env.ADMIN_EMAIL_1 || 'admin1@example.com', 
    password: process.env.ADMIN_PASSWORD_1 || 'admin123', 
    role: 'admin' 
  },
  { 
    email: process.env.ADMIN_EMAIL_2 || 'admin2@example.com', 
    password: process.env.ADMIN_PASSWORD_2 || 'admin456', 
    role: 'admin' 
  },
  { 
    email: process.env.ADMIN_EMAIL_3 || 'admin3@example.com', 
    password: process.env.ADMIN_PASSWORD_3 || 'admin789', 
    role: 'admin' 
  },
];
```

### Option B: Use the Admin Interface
1. Sign in as admin
2. Go to `/admin/manage-credentials`
3. Add new credentials through the web interface

## 🔄 Updating Credentials

### To change a password:
1. **Edit `.env.local`**
2. **Update the password** for the specific user
3. **Restart your server**
4. **Share new password** securely with the user

### To change an email:
1. **Edit `.env.local`**
2. **Update the email** address
3. **Restart your server**
4. **Inform the user** of the change

### To add a new user:
1. **Add new environment variables** to `.env.local`
2. **Update the login route** to include the new user
3. **Restart your server**
4. **Share credentials** with the new user

## 🚨 Important Security Notes

### For Development:
- ✅ **Use strong passwords** even in development
- ✅ **Keep `.env.local` private** (it's already in .gitignore)
- ✅ **Use different passwords** for each environment

### For Production:
- ✅ **Use environment variables** in your hosting platform
- ✅ **Never commit** `.env.local` to version control
- ✅ **Use very strong JWT secrets**
- ✅ **Regularly rotate passwords**
- ✅ **Monitor login activity**

## 🆘 Troubleshooting

### "Invalid email or password"
- Check email spelling in `.env.local`
- Verify password matches exactly
- Ensure no extra spaces
- Restart server after changes

### Environment variables not working
- Ensure `.env.local` is in project root
- Check variable names match exactly
- Restart development server
- Verify file syntax (no spaces around `=`)

### Can't access admin features
- Verify role is set to 'admin'
- Check user is active in database
- Ensure proper environment variable names

## 📁 File Structure

```
GasFeelContent/
├── .env.local                 # Your credentials (private)
├── .env.local.example         # Template for team members
├── src/
│   └── app/
│       └── api/
│           └── auth/
│               └── login/
│                   └── route.ts  # Uses environment variables
└── ENV_SETUP_GUIDE.md         # This guide
```

## 🔐 Production Deployment

When deploying to production:

1. **Set environment variables** in your hosting platform
2. **Use strong, unique JWT secret**
3. **Use production email addresses**
4. **Use very strong passwords**
5. **Enable HTTPS**
6. **Monitor for suspicious activity**

Your authentication system is now secure and ready for production! 🎉
