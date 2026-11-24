const CreadorTravesia = require('./CreadorTravesia');
const TravesiaSenderismo = require('./TravesiaSenderismo');

class CreadorSenderismo extends CreadorTravesia {
  constructor(nivelDificultadPredeterminado = 'Moderado') {
    super();
    this.nivelDificultadPredeterminado = nivelDificultadPredeterminado;
  }

  crearTravesia(datos) {
    return new TravesiaSenderismo({
      ...datos,
      detalles: { ...datos.detalles, nivelDificultad: datos.detalles?.nivelDificultad || this.nivelDificultadPredeterminado }
    });
  }
}

module.exports = CreadorSenderismo;
