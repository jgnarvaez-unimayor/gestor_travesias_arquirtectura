class Travesia {
  constructor({ id, titulo, descripcion, ubicacion, latitud, longitud, rutaCoordenadas = [], detalles = {} }) {
    if (!id || !titulo || !descripcion || !ubicacion) {
      throw new Error('La travesía requiere id, título, descripción y ubicación.');
    }
    if (!Number.isFinite(Number(latitud)) || Number(latitud) < -90 || Number(latitud) > 90
      || !Number.isFinite(Number(longitud)) || Number(longitud) < -180 || Number(longitud) > 180) {
      throw new Error('La travesía requiere coordenadas válidas.');
    }
    if (!Array.isArray(rutaCoordenadas) || rutaCoordenadas.some((punto) => !Array.isArray(punto)
      || punto.length !== 2 || !Number.isFinite(Number(punto[0])) || Math.abs(Number(punto[0])) > 90
      || !Number.isFinite(Number(punto[1])) || Math.abs(Number(punto[1])) > 180)) {
      throw new Error('La ruta requiere una lista de coordenadas [latitud, longitud] válida.');
    }

    this.id = String(id);
    this.titulo = titulo;
    this.descripcion = descripcion;
    this.ubicacion = ubicacion;
    this.latitud = Number(latitud);
    this.longitud = Number(longitud);
    this.rutaCoordenadas = rutaCoordenadas;
    this.detalles = detalles;
  }

  getId() { return this.id; }
  getTitulo() { return this.titulo; }
  getDescripcion() { return this.descripcion; }
  getUbicacion() { return this.ubicacion; }
  obtenerDetalles() { return JSON.stringify(this.detalles); }
}

module.exports = Travesia;
