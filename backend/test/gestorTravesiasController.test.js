const test = require('node:test');
const assert = require('node:assert/strict');
const GestorTravesiasController = require('../controllers/GestorTravesiasController');

test('actualiza todos los datos de una travesía existente', async () => {
  let guardada;
  const controller = new GestorTravesiasController(null, {
    buscarPorId: async () => ({ id: 'ruta-1' }),
    actualizar: async (travesia) => {
      guardada = travesia;
      return travesia;
    }
  });
  let respuesta;
  const res = {
    json: (body) => {
      respuesta = body;
      return res;
    }
  };

  await controller.actualizar({
    params: { id: 'ruta-1' },
    body: {
      modalidad: 'senderismo',
      titulo: 'Nuevo nombre',
      descripcion: 'Descripción actualizada.',
      ubicacion: 'Popayán, Cauca',
      latitud: 2.44,
      longitud: -76.61,
      rutaCoordenadas: [[2.44, -76.61], [2.45, -76.62]],
      detalles: { nivelDificultad: 'Fácil', distanciaKm: 3, duracionMinutos: 60 }
    }
  }, res, (error) => {
    throw error;
  });

  assert.equal(guardada.id, 'ruta-1');
  assert.equal(guardada.modalidad, 'senderismo');
  assert.equal(guardada.titulo, 'Nuevo nombre');
  assert.equal(guardada.detalles.distanciaKm, 3);
  assert.deepEqual(guardada.rutaCoordenadas, [[2.44, -76.61], [2.45, -76.62]]);
  assert.equal(respuesta, guardada);
});

test('actualiza el recorrido usando el primer punto como inicio', async () => {
  const rutaActualizada = { id: 'ruta-1' };
  let argumentos;
  const controller = new GestorTravesiasController(null, {
    actualizarRecorrido: async (...values) => {
      argumentos = values;
      return rutaActualizada;
    }
  });
  let respuesta;
  const res = {
    json: (body) => {
      respuesta = body;
      return res;
    }
  };

  await controller.actualizarRecorrido({
    params: { id: 'ruta-1' },
    body: { rutaCoordenadas: [[2.44, -76.61], [2.45, -76.62]] }
  }, res, (error) => {
    throw error;
  });

  assert.deepEqual(argumentos, [
    'ruta-1',
    2.44,
    -76.61,
    [[2.44, -76.61], [2.45, -76.62]]
  ]);
  assert.equal(respuesta, rutaActualizada);
});

test('rechaza actualizar un recorrido con menos de dos puntos', async () => {
  const controller = new GestorTravesiasController(null, {
    actualizarRecorrido: async () => assert.fail('No debe guardar un recorrido incompleto.')
  });
  let status;
  let respuesta;
  const res = {
    status: (value) => {
      status = value;
      return res;
    },
    json: (body) => {
      respuesta = body;
      return res;
    }
  };

  await controller.actualizarRecorrido({
    params: { id: 'ruta-1' },
    body: { rutaCoordenadas: [[2.44, -76.61]] }
  }, res, (error) => {
    throw error;
  });

  assert.equal(status, 400);
  assert.match(respuesta.error, /al menos dos puntos/);
});
