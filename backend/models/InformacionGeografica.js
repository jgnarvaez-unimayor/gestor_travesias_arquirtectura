class InformacionGeografica {
  constructor(latitud, longitud, urlMapa) {
    this.latitud = latitud;
    this.longitud = longitud;
    this.urlMapa = urlMapa;
  }

  getLatitud() { return this.latitud; }
  getLongitud() { return this.longitud; }
  getUrlMapa() { return this.urlMapa; }
}

module.exports = InformacionGeografica;
