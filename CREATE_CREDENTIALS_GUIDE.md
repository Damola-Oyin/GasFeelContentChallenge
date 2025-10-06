# Creating Admin & CSR Credentials Guide

This guide shows you how to create email and password credentials for your verified admins and CSRs.

## 🚀 Method 1: Quick Setup (Recommended)

### Step 1: Edit the Login Route
Open `/src/app/api/auth/login/route.ts` and replace the example credentials:

```typescript
const ADMIN_CREDENTIALS = [
  { email: 'john.admin@gmail.com', password: 'AdminPass123!', role: 'admin' },
  { email: 'sarah.admin@company.com', password: 'SecureAdmin456!', role: 'admin' },
];

const CSR_CREDENTIALS = [
  { email: 'mike.csr@gmail.com', password: 'CSRPass789!', role: 'csr' },
  { email: 'lisa.csr@company.com', password: 'SecureCSR012!', role: 'csr' },
];
```

### Step 2: Restart Server
```bash
npm run dev
```

### Step 3: Test Login
Visit `http://localhost:3000/auth/login` and test with your credentials.

## 🛠️ Method 2: Using the Admin Interface

### Step 1: Access Credential Manager
1. Sign in as admin: `admin@example.com` / `admin123`
2. Go to: `http://localhost:3000/admin/manage-credentials`
3. Add your team's credentials using the form

### Step 2: Export Code
1. Click "Export Code" button
2. Copy the generated code
3. Paste it into `/src/app/api/auth/login/route.ts`
4. Restart your server

## 🔧 Method 3: Using the Generator Script

### Step 1: Edit the Script
Open `scripts/generate-credentials.js` and replace the email addresses:

```javascript
const adminEmails = [
  'your-admin1@gmail.com',
  'your-admin2@gmail.com',
];

const csrEmails = [
  'your-csr1@gmail.com',
  'your-csr2@gmail.com',
];
```

### Step 2: Run the Script
```bash
node scripts/generate-credentials.js
```

### Step 3: Copy Generated Code
The script will output code that you can copy directly into your login route file.

## 🔒 Password Security Best Practices

### Strong Password Requirements:
- **Minimum 8 characters**
- **Mix of uppercase and lowercase letters**
- **Include numbers**
- **Include special characters** (!@#$%^&*)
- **Avoid common words or patterns**

### Example Strong Passwords:
- `Admin2024!Secure`
- `CSR@GasFeel#123`
- `MySecure!Password456`

### Password Sharing:
- ✅ **Use secure messaging** (Signal, WhatsApp)
- ✅ **Share verbally** (phone call, in-person)
- ✅ **Use password managers**
- ❌ **Don't share via email**
- ❌ **Don't share via regular chat**
- ❌ **Don't write passwords down visibly**

## 👥 Team Management

### Admin Credentials:
- **Full access** to all features
- **Can manage users** and credentials
- **Can access CSR portal**
- **Can manage contest settings**

### CSR Credentials:
- **Access to CSR portal** only
- **Can add points** to contestants
- **Cannot access admin features**

## 📋 Credential Checklist

When creating credentials for your team:

- [ ] **Email addresses** are correct and accessible
- [ ] **Passwords** are strong and unique
- [ ] **Roles** are assigned correctly
- [ ] **Credentials** are shared securely
- [ ] **Team members** can successfully log in
- [ ] **Default passwords** are changed
- [ ] **Backup admin** credentials exist

## 🆘 Troubleshooting

### "Invalid email or password"
- Check email spelling exactly
- Ensure password matches (case-sensitive)
- Verify no extra spaces

### Can't access admin features
- Verify role is set to 'admin' not 'csr'
- Check user is active in database
- Ensure proper login route

### Password not working
- Check for typos
- Verify password was copied correctly
- Try regenerating password

## 🔄 Updating Credentials

### To change a password:
1. Edit the login route file
2. Update the password in the credentials array
3. Restart the server
4. Share new password securely

### To add new users:
1. Add new credential to the appropriate array
2. Restart the server
3. Share credentials with new user

### To remove users:
1. Remove credential from the array
2. Restart the server
3. Inform user their access is revoked

## 📞 Support

If you need help:
1. Check the troubleshooting section above
2. Verify your credentials match exactly
3. Ensure server is restarted after changes
4. Check browser console for errors

## 🔐 Security Reminders

- **Change default passwords** immediately
- **Use unique passwords** for each user
- **Regular password rotation** (every 3-6 months)
- **Monitor login activity**
- **Revoke access** for former team members
- **Use HTTPS** in production
- **Keep credentials secure** and private
