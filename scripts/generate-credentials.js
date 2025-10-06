#!/usr/bin/env node

// Script to generate secure credentials for your team
// Usage: node scripts/generate-credentials.js

const crypto = require('crypto');

function generateSecurePassword(length = 12) {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*';
  const allChars = uppercase + lowercase + numbers + symbols;
  
  let password = '';
  
  // Ensure at least one character from each category
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];
  
  // Fill the rest randomly
  for (let i = 4; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

function generateCredentials() {
  console.log('🔐 GasFeel Content Challenge - Credential Generator\n');
  
  const adminEmails = [
    'admin1@example.com',
    'admin2@example.com',
    // Add your actual admin emails here
  ];
  
  const csrEmails = [
    'csr1@example.com',
    'csr2@example.com',
    // Add your actual CSR emails here
  ];
  
  console.log('📋 Copy this code to /src/app/api/auth/login/route.ts:\n');
  console.log('const ADMIN_CREDENTIALS = [');
  
  adminEmails.forEach((email, index) => {
    const password = generateSecurePassword();
    console.log(`  { email: '${email}', password: '${password}', role: 'admin' },`);
  });
  
  console.log('];\n');
  console.log('const CSR_CREDENTIALS = [');
  
  csrEmails.forEach((email, index) => {
    const password = generateSecurePassword();
    console.log(`  { email: '${email}', password: '${password}', role: 'csr' },`);
  });
  
  console.log('];\n');
  
  console.log('🔒 Security Tips:');
  console.log('- Share passwords securely (not via email/chat)');
  console.log('- Consider using a password manager');
  console.log('- Change passwords regularly');
  console.log('- Use different passwords for different services\n');
  
  console.log('📝 Instructions:');
  console.log('1. Replace the email addresses above with your actual team emails');
  console.log('2. Copy the generated code above');
  console.log('3. Paste it into /src/app/api/auth/login/route.ts');
  console.log('4. Restart your development server');
  console.log('5. Share the credentials securely with your team');
}

// Run the generator
generateCredentials();
