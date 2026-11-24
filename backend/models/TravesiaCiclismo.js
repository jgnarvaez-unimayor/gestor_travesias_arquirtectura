const Travesia = require('./Travesia');

class TravesiaCiclismo extends Travesia {
  constructor(datos) {
    super(datos);
    this.submodalidadCiclismo = datos.detalles?.submodalidadCiclismo || datos.submodalidadCiclismo || 'Ruta recreativa';
    this.modalidad = 'ciclismo';
  }

  getSubmodalidadCiclismo() { return this.submodalidadCiclismo; }
}

module.exports = TravesiaCiclismo;
