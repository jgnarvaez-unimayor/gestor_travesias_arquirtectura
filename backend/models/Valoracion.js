class Valoracion {
  constructor({ id, experienciaId, puntuacion, fecha }) {
    if (!Number.isInteger(Number(puntuacion)) || puntuacion < 1 || puntuacion > 5) {
      throw new Error('La puntuación debe ser un número entero entre 1 y 5.');
    }
    this.id = id;
    this.experienciaId = experienciaId;
    this.puntuacion = Number(puntuacion);
    this.fecha = fecha;
  }

  getPuntuacion() { return this.puntuacion; }
}

module.exports = Valoracion;