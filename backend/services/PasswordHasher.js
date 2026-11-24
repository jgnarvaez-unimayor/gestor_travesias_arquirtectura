const bcrypt = require('bcryptjs');

class PasswordHasher {
  hash(password) {
    return bcrypt.hash(password, 12);
  }

  compare(password, hash) {
    return bcrypt.compare(password, hash);
  }
}

module.exports = PasswordHasher;