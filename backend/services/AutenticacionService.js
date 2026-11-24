class AutenticacionService {
  constructor(tokenService, passwordHasher, usuarioRepository) {
    this.tokenService = tokenService;
    this.passwordHasher = passwordHasher;
    this.usuarioRepository = usuarioRepository;
  }

  async registrar({ nombre, email, contrasena }) {
    const existente = await this.usuarioRepository.buscarPorEmail(email);
    if (existente) {
      const error = new Error('Ya existe una cuenta con ese correo.');
      error.status = 409;
      throw error;
    }
    const contrasenaHash = await this.passwordHasher.hash(contrasena);
    const usuario = await this.usuarioRepository.crear({ nombre, email, contrasenaHash });
    return { usuario, token: this.tokenService.crear(usuario) };
  }

  async iniciarSesion({ email, contrasena, rol }) {
    const registro = await this.usuarioRepository.buscarPorEmail(email);
    const valido = registro && await this.passwordHasher.compare(contrasena, registro.contrasena_hash);
    if (!valido) {
      const error = new Error('Correo o contraseña incorrectos.');
      error.status = 401;
      throw error;
    }
    if (rol && registro.rol !== rol) {
      const error = new Error('Las credenciales no corresponden al tipo de acceso seleccionado.');
      error.status = 403;
      throw error;
    }
    const usuario = {
      id: registro.id,
      nombre: registro.nombre,
      email: registro.email,
      rol: registro.rol,
      test_mascara_resuelto: registro.test_mascara_resuelto
    };
    return { usuario, token: this.tokenService.crear(usuario) };
  }
}

module.exports = AutenticacionService;