const bcrypt = require('bcryptjs');

async function hashPassword() {
  const password = 'yourpassword'; // Change this to the password you want
  const hashed = await bcrypt.hash(password, 10);
  console.log('Hashed password:', hashed);
}

hashPassword();
