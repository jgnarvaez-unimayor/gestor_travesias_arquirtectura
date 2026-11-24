const CreadorTravesia = require('./CreadorTravesia');
const TravesiaTuristica = require('./TravesiaTuristica');

class CreadorTuristica extends CreadorTravesia {
  constructor(puntosInteresPredeterminados = 'Centro histórico') {
    super();
    this.puntosInteresPredeterminados = puntosInteresPredeterminados;
  }

  crearTravesia(datos) {
    return new TravesiaTuristica({
      ...datos,
      detalles: { ...datos.detalles, puntosInteres: datos.detalles?.puntosInteres || this.puntosInteresPredeterminados }
    });
  }
}

module.exports = CreadorTuristica;
