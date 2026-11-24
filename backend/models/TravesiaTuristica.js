const Travesia = require('./Travesia');

class TravesiaTuristica extends Travesia {
  constructor(datos) {
    super(datos);
    this.puntosInteres = datos.detalles?.puntosInteres || datos.puntosInteres || 'Centro histórico';
    this.modalidad = 'turistica';
  }

  getPuntosInteres() { return this.puntosInteres; }
}

module.exports = TravesiaTuristica;
