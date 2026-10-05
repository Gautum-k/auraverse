import dotenv from 'dotenv';
dotenv.config();

import { sendWelcomeEmail } from './utils/mailer.js';

const targetEmail = process.argv[2];

if (!targetEmail) {
  console.log('Usage: node testMail.js <email>');
  process.exit(1);
}

console.log(`Sending test welcome email to ${targetEmail}...`);
sendWelcomeEmail({ name: 'Test User', toEmail: targetEmail })
  .then(() => {
    console.log('Done.');
  })
  .catch((err) => {
    console.error('Error:', err.message);
  });
