const { modalidades, rutaCoordenadasValida, TravesiaBuilder } = require('../services/TravesiaBuilder');

class GestorTravesiasController {
  constructor(servicioGeo, travesiaRepo) {
    this.travesiaRepo = travesiaRepo;
    this.travesiaBuilder = new TravesiaBuilder(servicioGeo);
  }

  listar = async (req, res, next) => {
    try {
      const { modalidad } = req.query;
      if (modalidad && !modalidades.includes(modalidad)) {
        return res.status(400).json({ error: 'Modalidad no válida.' });
      }
      res.json(await this.travesiaRepo.listar(modalidad));
    } catch (error) {
      next(error);
    }
  };

  obtener = async (req, res, next) => {
    try {
      const travesia = await this.travesiaRepo.buscarPorId(req.params.id);
      if (!travesia) return res.status(404).json({ error: 'No se encontró la travesía.' });
      res.json(travesia);
    } catch (error) {
      next(error);
    }
  };

  crear = async (req, res, next) => {
    try {
      const travesia = await this.travesiaBuilder.construir(req.body);
      res.status(201).json(await this.travesiaRepo.guardar(travesia));
    } catch (error) {
      if (error.status === 400) return res.status(400).json({ error: error.message });
      next(error);
    }
  };

  actualizar = async (req, res, next) => {
    try {
      const existente = await this.travesiaRepo.buscarPorId(req.params.id);
      if (!existente) return res.status(404).json({ error: 'No se encontró la travesía.' });
      const travesia = await this.travesiaBuilder.construir(req.body, req.params.id);
      const actualizada = await this.travesiaRepo.actualizar(travesia);
      if (!actualizada) return res.status(404).json({ error: 'No se encontró la travesía.' });
      res.json(actualizada);
    } catch (error) {
      if (error.status === 400) return res.status(400).json({ error: error.message });
      next(error);
    }
  };

  actualizarRecorrido = async (req, res, next) => {
    try {
      const { rutaCoordenadas } = req.body;
      if (!rutaCoordenadasValida(rutaCoordenadas, 2)) {
        return res.status(400).json({ error: 'El recorrido debe tener al menos dos puntos válidos [latitud, longitud].' });
      }
      const [latitud, longitud] = rutaCoordenadas[0].map(Number);
      const travesia = await this.travesiaRepo.actualizarRecorrido(
        req.params.id,
        latitud,
        longitud,
        rutaCoordenadas.map((punto) => punto.map(Number))
      );
      if (!travesia) return res.status(404).json({ error: 'No se encontró la travesía.' });
      res.json(travesia);
    } catch (error) {
      next(error);
    }
  };

  eliminar = async (req, res, next) => {
    try {
      const eliminado = await this.travesiaRepo.eliminar(req.params.id);
      if (!eliminado) return res.status(404).json({ error: 'No se encontró la travesía.' });
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  };
}

module.exports = GestorTravesiasController;