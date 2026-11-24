const AutenticacionService = require('../services/AutenticacionService');

class AutenticacionController {
  constructor(tokenService, passwordHasher, usuarioRepository) {
    this.service = new AutenticacionService(tokenService, passwordHasher, usuarioRepository);
  }

  registrar = async (req, res, next) => {
    try {
      const { nombre, email, contrasena } = req.body;
      if (typeof nombre !== 'string' || nombre.trim().length < 2 || nombre.trim().length > 120) {
        return res.status(400).json({ error: 'El nombre debe tener entre 2 y 120 caracteres.' });
      }
      if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ error: 'Escribe un correo electrónico válido.' });
      }
      if (typeof contrasena !== 'string' || contrasena.length < 8 || contrasena.length > 100) {
        return res.status(400).json({ error: 'La contraseña debe tener entre 8 y 100 caracteres.' });
      }
      res.status(201).json(await this.service.registrar({ nombre: nombre.trim(), email, contrasena }));
    } catch (error) {
      next(error);
    }
  };

  iniciarSesion = async (req, res, next) => {
    try {
      const { email, contrasena, rol } = req.body;
      if (typeof email !== 'string' || typeof contrasena !== 'string' || !['cliente', 'administrador'].includes(rol)) {
        return res.status(400).json({ error: 'Correo, contraseña y tipo de acceso son obligatorios.' });
      }
      res.json(await this.service.iniciarSesion({ email, contrasena, rol }));
    } catch (error) {
      next(error);
    }
  };
}

module.exports = AutenticacionController;