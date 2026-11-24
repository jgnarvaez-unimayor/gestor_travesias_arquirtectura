class Experiencia {
  constructor({ id, usuarioId, travesiaId, comentario, fecha, puntuacion, nombre }) {
    this.id = id;
    this.usuarioId = usuarioId;
    this.travesiaId = travesiaId;
    this.comentario = comentario;
    this.fecha = fecha;
    this.puntuacion = puntuacion;
    this.nombre = nombre;
  }

  getComentario() { return this.comentario; }
}

module.exports = Experiencia;