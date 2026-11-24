const CreadorCiclismo = require('../models/CreadorCiclismo');
const CreadorSenderismo = require('../models/CreadorSenderismo');
const CreadorTuristica = require('../models/CreadorTuristica');

const creadores = {
  ciclismo: new CreadorCiclismo(),
  senderismo: new CreadorSenderismo(),
  turistica: new CreadorTuristica()
};

class TravesiaRepository {
  constructor(pool) {
    this.pool = pool;
  }

  mapear(row) {
    if (!row) return null;
    const crear = creadores[row.modalidad];
    if (!crear) throw new Error(`Modalidad no soportada: ${row.modalidad}`);
    return crear.crearTravesia({
      id: row.id,
      titulo: row.titulo,
      descripcion: row.descripcion,
      ubicacion: row.ubicacion,
      latitud: row.latitud,
      longitud: row.longitud,
      rutaCoordenadas: row.ruta_coordenadas,
      detalles: row.detalles
    });
  }

  async listar(modalidad) {
    const values = [];
    let where = '';
    if (modalidad) {
      values.push(modalidad);
      where = 'WHERE modalidad = $1';
    }
    const { rows } = await this.pool.query(`SELECT * FROM travesias ${where} ORDER BY modalidad, titulo`, values);
    return rows.map((row) => this.mapear(row));
  }

  async buscarPorId(id) {
    const { rows } = await this.pool.query('SELECT * FROM travesias WHERE id = $1', [id]);
    return this.mapear(rows[0]);
  }

  async guardar(travesia) {
    const { rows } = await this.pool.query(
      `INSERT INTO travesias (id, modalidad, titulo, descripcion, ubicacion, latitud, longitud, ruta_coordenadas, detalles)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9::jsonb)
       ON CONFLICT (id) DO UPDATE SET modalidad = EXCLUDED.modalidad, titulo = EXCLUDED.titulo,
         descripcion = EXCLUDED.descripcion, ubicacion = EXCLUDED.ubicacion, latitud = EXCLUDED.latitud,
         longitud = EXCLUDED.longitud, ruta_coordenadas = EXCLUDED.ruta_coordenadas, detalles = EXCLUDED.detalles
       RETURNING *`,
      [travesia.id, travesia.modalidad, travesia.titulo, travesia.descripcion, travesia.ubicacion,
        travesia.latitud, travesia.longitud, JSON.stringify(travesia.rutaCoordenadas), JSON.stringify(travesia.detalles)]
    );
    return this.mapear(rows[0]);
  }

  async actualizar(travesia) {
    const { rows } = await this.pool.query(
      `UPDATE travesias
       SET modalidad = $2, titulo = $3, descripcion = $4, ubicacion = $5, latitud = $6,
         longitud = $7, ruta_coordenadas = $8::jsonb, detalles = $9::jsonb
       WHERE id = $1
       RETURNING *`,
      [travesia.id, travesia.modalidad, travesia.titulo, travesia.descripcion, travesia.ubicacion,
        travesia.latitud, travesia.longitud, JSON.stringify(travesia.rutaCoordenadas), JSON.stringify(travesia.detalles)]
    );
    return this.mapear(rows[0]);
  }

  async actualizarRecorrido(id, latitud, longitud, rutaCoordenadas) {
    const { rows } = await this.pool.query(
      `UPDATE travesias
       SET latitud = $2, longitud = $3, ruta_coordenadas = $4::jsonb
       WHERE id = $1
       RETURNING *`,
      [id, latitud, longitud, JSON.stringify(rutaCoordenadas)]
    );
    return this.mapear(rows[0]);
  }

  async eliminar(id) {
    const result = await this.pool.query('DELETE FROM travesias WHERE id = $1', [id]);
    return result.rowCount > 0;
  }
}

module.exports = TravesiaRepository;