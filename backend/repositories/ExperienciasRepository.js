const Experiencia = require('../models/Experiencia');
const Valoracion = require('../models/Valoracion');

class ExperienciasRepository {
  constructor(pool) {
    this.pool = pool;
  }

  async listarPorTravesia(travesiaId) {
    const { rows } = await this.pool.query(
      `SELECT e.id, e.usuario_id, e.travesia_id, e.comentario, e.fecha, u.nombre, v.puntuacion
       FROM experiencias e
       JOIN usuarios u ON u.id = e.usuario_id
       LEFT JOIN valoraciones v ON v.experiencia_id = e.id
       WHERE e.travesia_id = $1 ORDER BY e.creado_en DESC`,
      [travesiaId]
    );
    return rows.map((row) => {
      const valoracion = row.puntuacion == null ? null : new Valoracion({
        id: undefined,
        experienciaId: row.id,
        puntuacion: row.puntuacion,
        fecha: row.fecha
      });
      return new Experiencia({
        id: row.id,
        usuarioId: row.usuario_id,
        travesiaId: row.travesia_id,
        comentario: row.comentario,
        fecha: row.fecha,
        puntuacion: valoracion?.getPuntuacion() ?? null,
        nombre: row.nombre
      });
    });
  }

  async crear({ usuarioId, travesiaId, comentario, puntuacion }) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const experiencia = await client.query(
        'INSERT INTO experiencias (usuario_id, travesia_id, comentario) VALUES ($1, $2, $3) RETURNING id, usuario_id, travesia_id, comentario, fecha',
        [usuarioId, travesiaId, comentario]
      );
      await client.query(
        'INSERT INTO valoraciones (experiencia_id, puntuacion) VALUES ($1, $2)',
        [experiencia.rows[0].id, puntuacion]
      );
      await client.query('COMMIT');
      return { ...experiencia.rows[0], puntuacion };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = ExperienciasRepository;