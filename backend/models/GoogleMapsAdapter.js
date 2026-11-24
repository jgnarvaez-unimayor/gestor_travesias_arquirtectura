const InformacionGeografica = require('./InformacionGeografica');

class GoogleMapsAdapter {
  constructor(googleMapsService) {
    this.googleMapsService = googleMapsService;
  }

  async consultarUbicacionRuta(ubicacionNombre) {
    const { latitud, longitud } = await this.googleMapsService.fetchCoordinatesByAddress(ubicacionNombre);
    return new InformacionGeografica(
      latitud,
      longitud,
      this.obtenerEnlaceNavegacion(latitud, longitud)
    );
  }

  obtenerEnlaceNavegacion(latitud, longitud) {
    return this.googleMapsService.generateExternalMapLink(latitud, longitud);
  }
}

module.exports = GoogleMapsAdapter;