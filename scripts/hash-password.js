// Gera o hash bcrypt de uma senha para usar na env var ADMIN_PASSWORD_HASH.
// Uso: npm run hash-password -- "minhaSenhaForte"
const bcrypt = require('bcryptjs');

const password = process.argv[2];

if (!password) {
  console.error('Uso: npm run hash-password -- "suaSenha"');
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 12);
console.log('\nADMIN_PASSWORD_HASH=' + hash + '\n');
