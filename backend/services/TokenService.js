const jwt = require('jsonwebtoken');

class TokenService {
  constructor() {
    if (!process.env.JWT_SECRET) throw new Error('Define JWT_SECRET en el archivo .env.');
    this.secret = process.env.JWT_SECRET;
  }

  crear(usuario) {
    return jwt.sign(
      { sub: usuario.id, rol: usuario.rol, nombre: usuario.nombre },
      this.secret,
      { expiresIn: '8h' }
    );
  }

  verificar(token) {
    return jwt.verify(token, this.secret);
  }
}

module.exports = TokenService;