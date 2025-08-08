const bcrypt = require('bcryptjs');

const passwordHash = '$2b$12$CirbMWhW1PbnuA.oRs4T/O2GLTFxcxnc7ezm2..iweqOv4Jf4/wze';

const testPasswords = [
  'password123',
  '123456',
  'password',
  'admin',
  'test',
  'vendor',
  'ronaks',
  'vendor123',
  '123456789',
  'qwerty',
  'abc123',
  'password1',
  'admin123',
  'test123',
  'vendor@gmail.com',
  'ronaks123'
];

async function testPasswords() {
  console.log('Testing passwords against hash...');
  
  for (const password of testPasswords) {
    try {
      const isValid = await bcrypt.compare(password, passwordHash);
      if (isValid) {
        console.log(`✅ Password found: "${password}"`);
        return password;
      }
    } catch (error) {
      console.log(`❌ Error testing "${password}":`, error.message);
    }
  }
  
  console.log('❌ No password found');
  return null;
}

testPasswords(); 