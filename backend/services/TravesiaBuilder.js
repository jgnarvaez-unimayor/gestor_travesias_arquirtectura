const crypto = require('node:crypto');
const CreadorCiclismo = require('../models/CreadorCiclismo');
const CreadorSenderismo = require('../models/CreadorSenderismo');
const CreadorTuristica = require('../models/CreadorTuristica');

const modalidades = ['ciclismo', 'senderismo', 'turistica'];
const creadores = {
  ciclismo: new CreadorCiclismo(),
  senderismo: new CreadorSenderismo(),
  turistica: new CreadorTuristica()
};

function rutaCoordenadasValida(rutaCoordenadas, minimo = 0) {
  return Array.isArray(rutaCoordenadas)
    && rutaCoordenadas.length >= minimo
    && rutaCoordenadas.length <= 1000
    && rutaCoordenadas.every((punto) => Array.isArray(punto) && punto.length === 2
      && Number.isFinite(Number(punto[0])) && Math.abs(Number(punto[0])) <= 90
      && Number.isFinite(Number(punto[1])) && Math.abs(Number(punto[1])) <= 180);
}

function errorValidacion(mensaje) {
  const error = new Error(mensaje);
  error.status = 400;
  return error;
}

class TravesiaBuilder {
  constructor(servicioGeo) {
    this.servicioGeo = servicioGeo;
  }

  async construir(datos, id) {
    const {
      modalidad,
      titulo,
      descripcion,
      ubicacion,
      latitud,
      longitud,
      rutaCoordenadas = [],
      detalles = {}
    } = datos;
    const creador = creadores[modalidad];
    if (!creador) throw errorValidacion('Selecciona una modalidad válida.');
    if (![titulo, descripcion, ubicacion].every((value) => typeof value === 'string' && value.trim())) {
      throw errorValidacion('Título, descripción y ubicación son obligatorios.');
    }

    let coordenadas = { latitud: Number(latitud), longitud: Number(longitud) };
    if (latitud == null || longitud == null || latitud === '' || longitud === ''
      || !Number.isFinite(coordenadas.latitud) || !Number.isFinite(coordenadas.longitud)) {
      const geo = await this.servicioGeo.consultarUbicacionRuta(ubicacion);
      coordenadas = { latitud: geo.latitud, longitud: geo.longitud };
    }
    if (coordenadas.latitud < -90 || coordenadas.latitud > 90
      || coordenadas.longitud < -180 || coordenadas.longitud > 180) {
      throw errorValidacion('Las coordenadas deben estar dentro del rango geográfico válido.');
    }
    if (!rutaCoordenadasValida(rutaCoordenadas)) {
      throw errorValidacion('La ruta debe ser una lista válida de coordenadas [latitud, longitud].');
    }
    if (!detalles || typeof detalles !== 'object' || Array.isArray(detalles)) {
      throw errorValidacion('Los detalles de la travesía deben ser un objeto.');
    }

    return creador.registrarTravesia({
      id: id || datos.id || `travesia-${crypto.randomUUID()}`,
      titulo: titulo.trim(),
      descripcion: descripcion.trim(),
      ubicacion: ubicacion.trim(),
      ...coordenadas,
      rutaCoordenadas,
      detalles
    });
  }
}

module.exports = { TravesiaBuilder, modalidades, rutaCoordenadasValida };
