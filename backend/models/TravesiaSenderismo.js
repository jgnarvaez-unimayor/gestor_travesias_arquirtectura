const Travesia = require('./Travesia');

class TravesiaSenderismo extends Travesia {
  constructor(datos) {
    super(datos);
    this.nivelDificultad = datos.detalles?.nivelDificultad || datos.nivelDificultad || 'Moderado';
    this.modalidad = 'senderismo';
  }

  getNivelDificultad() { return this.nivelDificultad; }
}

module.exports = TravesiaSenderismo;
