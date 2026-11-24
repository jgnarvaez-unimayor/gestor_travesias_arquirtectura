class UsuariosController {
  constructor(repository) {
    this.repository = repository;
  }

  listar = async (req, res, next) => {
    try {
      res.json(await this.repository.listar());
    } catch (error) {
      next(error);
    }
  };

  yo = async (req, res, next) => {
    try {
      const usuario = await this.repository.buscarPorId(req.usuario.sub);
      if (!usuario) return res.status(404).json({ error: 'No se encontró el usuario.' });
      res.json(usuario);
    } catch (error) {
      next(error);
    }
  };

  resolverTestMascara = async (req, res, next) => {
    try {
      const usuario = await this.repository.actualizarTestMascara(req.usuario.sub);
      if (!usuario) return res.status(404).json({ error: 'No se encontró el usuario.' });
      res.json(usuario);
    } catch (error) {
      next(error);
    }
  };
}

module.exports = UsuariosController;