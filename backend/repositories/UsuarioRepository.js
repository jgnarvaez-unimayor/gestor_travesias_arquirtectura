const { Administrador, Cliente } = require('../models/Usuario');

class UsuarioRepository {
  constructor(pool) {
    this.pool = pool;
  }

  async buscarPorEmail(email) {
    const { rows } = await this.pool.query('SELECT * FROM usuarios WHERE LOWER(email) = LOWER($1)', [email]);
    return rows[0] || null;
  }

  async buscarPorId(id) {
    const { rows } = await this.pool.query(
      'SELECT id, nombre, email, rol, nivel_acceso, test_mascara_resuelto FROM usuarios WHERE id = $1',
      [id]
    );
    return this.mapear(rows[0]);
  }

  async listar() {
    const { rows } = await this.pool.query(
      'SELECT id, nombre, email, rol, nivel_acceso, test_mascara_resuelto, creado_en FROM usuarios ORDER BY creado_en DESC'
    );
    return rows.map((row) => this.mapear(row));
  }

  async crear({ nombre, email, contrasenaHash, rol = 'cliente' }) {
    const { rows } = await this.pool.query(
      'INSERT INTO usuarios (nombre, email, contrasena_hash, rol) VALUES ($1, LOWER($2), $3, $4) RETURNING id, nombre, email, rol, nivel_acceso, test_mascara_resuelto',
      [nombre, email, contrasenaHash, rol]
    );
    return this.mapear(rows[0]);
  }

  async actualizarTestMascara(id) {
    const { rows } = await this.pool.query(
      'UPDATE usuarios SET test_mascara_resuelto = TRUE WHERE id = $1 RETURNING id, nombre, email, rol, nivel_acceso, test_mascara_resuelto',
      [id]
    );
    return this.mapear(rows[0]);
  }

  mapear(row) {
    if (!row) return null;
    const datos = {
      id: row.id,
      nombre: row.nombre,
      email: row.email,
      nivelAcceso: row.nivel_acceso,
      testMascaraResuelto: row.test_mascara_resuelto
    };
    return row.rol === 'administrador' ? new Administrador(datos) : new Cliente(datos);
  }
}

module.exports = UsuarioRepository;