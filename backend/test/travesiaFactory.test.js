const test = require('node:test');
const assert = require('node:assert/strict');
const CreadorCiclismo = require('../models/CreadorCiclismo');
const CreadorSenderismo = require('../models/CreadorSenderismo');
const CreadorTuristica = require('../models/CreadorTuristica');

const base = {
  id: 'ruta-test',
  titulo: 'Ruta de prueba',
  descripcion: 'Recorrido de prueba por Popayán.',
  ubicacion: 'Popayán, Cauca',
  latitud: 2.44,
  longitud: -76.61
};

test('Factory Method crea productos concretos con sus detalles de modalidad', () => {
  const ciclismo = new CreadorCiclismo('Urbano').crearTravesia(base);
  const senderismo = new CreadorSenderismo('Fácil').crearTravesia(base);
  const turistica = new CreadorTuristica('Parque Caldas').crearTravesia(base);

  assert.equal(ciclismo.modalidad, 'ciclismo');
  assert.equal(ciclismo.submodalidadCiclismo, 'Urbano');
  assert.equal(senderismo.modalidad, 'senderismo');
  assert.equal(senderismo.nivelDificultad, 'Fácil');
  assert.equal(turistica.modalidad, 'turistica');
  assert.equal(turistica.puntosInteres, 'Parque Caldas');
});

test('el modelo valida las coordenadas del mapa y la geometría de la ruta', () => {
  const creator = new CreadorCiclismo();

  assert.throws(
    () => creator.crearTravesia({ ...base, latitud: 200 }),
    /coordenadas válidas/
  );
  assert.throws(
    () => creator.crearTravesia({ ...base, rutaCoordenadas: [[2, 'oeste']] }),
    /lista de coordenadas/
  );
});
