const test = require('node:test');
const assert = require('node:assert/strict');
const ExperienciasRepository = require('../repositories/ExperienciasRepository');

test('guarda una experiencia y su valoración dentro de una transacción', async () => {
  const calls = [];
  const client = {
    query: async (sql, values) => {
      calls.push({ sql, values });
      if (sql.startsWith('INSERT INTO experiencias')) {
        return { rows: [{ id: 'exp-1', usuario_id: 'user-1', travesia_id: 'ruta-1', comentario: 'Gran recorrido', fecha: '2026-01-01' }] };
      }
      return { rows: [] };
    },
    release: () => calls.push({ sql: 'RELEASE' })
  };
  const repository = new ExperienciasRepository({
    connect: async () => client
  });

  const experiencia = await repository.crear({
    usuarioId: 'user-1',
    travesiaId: 'ruta-1',
    comentario: 'Gran recorrido',
    puntuacion: 5
  });

  assert.equal(experiencia.id, 'exp-1');
  assert.equal(experiencia.puntuacion, 5);
  assert.deepEqual(calls.map(({ sql }) => sql), [
    'BEGIN',
    'INSERT INTO experiencias (usuario_id, travesia_id, comentario) VALUES ($1, $2, $3) RETURNING id, usuario_id, travesia_id, comentario, fecha',
    'INSERT INTO valoraciones (experiencia_id, puntuacion) VALUES ($1, $2)',
    'COMMIT',
    'RELEASE'
  ]);
  assert.deepEqual(calls[2].values, ['exp-1', 5]);
});