class ExperienciasController {
  constructor(repository) {
    this.repository = repository;
  }

  listar = async (req, res, next) => {
    try {
      res.json(await this.repository.listarPorTravesia(req.params.id));
    } catch (error) {
      next(error);
    }
  };

  crear = async (req, res, next) => {
    try {
      const { comentario, puntuacion } = req.body;
      const score = Number(puntuacion);
      if (typeof comentario !== 'string' || !comentario.trim() || comentario.trim().length > 1000) {
        return res.status(400).json({ error: 'Escribe un comentario de hasta 1000 caracteres.' });
      }
      if (!Number.isInteger(score) || score < 1 || score > 5) {
        return res.status(400).json({ error: 'La puntuación debe estar entre 1 y 5.' });
      }
      res.status(201).json(await this.repository.crear({
        usuarioId: req.usuario.sub,
        travesiaId: req.params.id,
        comentario: comentario.trim(),
        puntuacion: score
      }));
    } catch (error) {
      next(error);
    }
  };
}

module.exports = ExperienciasController;