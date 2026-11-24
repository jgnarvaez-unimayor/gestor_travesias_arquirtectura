const CreadorTravesia = require('./CreadorTravesia');
const TravesiaCiclismo = require('./TravesiaCiclismo');

class CreadorCiclismo extends CreadorTravesia {
  constructor(submodalidadPredeterminada = 'Ruta recreativa') {
    super();
    this.submodalidadPredeterminada = submodalidadPredeterminada;
  }

  crearTravesia(datos) {
    return new TravesiaCiclismo({
      ...datos,
      detalles: { ...datos.detalles, submodalidadCiclismo: datos.detalles?.submodalidadCiclismo || this.submodalidadPredeterminada }
    });
  }
}

module.exports = CreadorCiclismo;
