require('dotenv').config();

const fs = require('node:fs/promises');
const path = require('node:path');
const pool = require('../config/db');

const ejemplos = [
  {
    id: 'ciclismo-centro-historico',
    modalidad: 'ciclismo',
    titulo: 'Pedaleando por el centro histórico',
    descripcion: 'Recorrido urbano tranquilo entre calles coloniales, plazas y fachadas blancas de Popayán.',
    ubicacion: 'Parque Caldas, Popayán, Cauca',
    latitud: 2.4419,
    longitud: -76.6063,
    ruta: [[2.4419, -76.6063], [2.4441, -76.6098], [2.4456, -76.6141], [2.4398, -76.6124], [2.4419, -76.6063]],
    detalles: { submodalidadCiclismo: 'Ciclismo urbano', distanciaKm: 4.2, duracionMinutos: 45 }
  },
  {
    id: 'ciclismo-morro-pueblillo',
    modalidad: 'ciclismo',
    titulo: 'El Morro y subida a Pueblillo',
    descripcion: 'Ruta para disfrutar las vistas de la ciudad y el ascenso por las laderas orientales.',
    ubicacion: 'El Morro de Tulcán, Popayán, Cauca',
    latitud: 2.4467,
    longitud: -76.6014,
    ruta: [[2.4467, -76.6014], [2.4503, -76.5962], [2.4551, -76.5902], [2.4495, -76.5937], [2.4467, -76.6014]],
    detalles: { submodalidadCiclismo: 'Ciclismo de montaña', distanciaKm: 8.5, duracionMinutos: 90 }
  },
  {
    id: 'senderismo-morro-tulcan',
    modalidad: 'senderismo',
    titulo: 'Sendero del Morro de Tulcán',
    descripcion: 'Caminata corta hasta el sitio arqueológico, con panorámica del centro de Popayán.',
    ubicacion: 'Morro de Tulcán, Popayán, Cauca',
    latitud: 2.4467,
    longitud: -76.6014,
    ruta: [[2.4437, -76.6057], [2.4451, -76.6032], [2.4467, -76.6014], [2.4483, -76.6003]],
    detalles: { nivelDificultad: 'Fácil', distanciaKm: 2.1, duracionMinutos: 55 }
  },
  {
    id: 'senderismo-tres-cruces',
    modalidad: 'senderismo',
    titulo: 'Mirador de las Tres Cruces',
    descripcion: 'Ascenso a un mirador tradicional para observar el valle y los tejados de la ciudad.',
    ubicacion: 'Cerro de las Tres Cruces, Popayán, Cauca',
    latitud: 2.4527,
    longitud: -76.6072,
    ruta: [[2.4446, -76.6112], [2.4481, -76.6097], [2.4527, -76.6072]],
    detalles: { nivelDificultad: 'Moderado', distanciaKm: 3.4, duracionMinutos: 100 }
  },
  {
    id: 'turistica-ruta-colonial',
    modalidad: 'turistica',
    titulo: 'Ruta colonial y Parque Caldas',
    descripcion: 'Paseo a pie por el corazón histórico, sus plazas, museos y arquitectura republicana.',
    ubicacion: 'Parque Caldas, Popayán, Cauca',
    latitud: 2.4419,
    longitud: -76.6063,
    ruta: [[2.4419, -76.6063], [2.4432, -76.6094], [2.4454, -76.6109], [2.4441, -76.6041], [2.4419, -76.6063]],
    detalles: { puntosInteres: 'Parque Caldas, Torre del Reloj, Puente del Humilladero', distanciaKm: 2.6, duracionMinutos: 75 }
  },
  {
    id: 'turistica-templos-blancos',
    modalidad: 'turistica',
    titulo: 'Templos y tradición payanesa',
    descripcion: 'Visita exterior a templos emblemáticos y calles representativas de la Semana Santa.',
    ubicacion: 'Iglesia de San Francisco, Popayán, Cauca',
    latitud: 2.4434,
    longitud: -76.6083,
    ruta: [[2.4434, -76.6083], [2.4419, -76.6063], [2.4402, -76.6096], [2.4447, -76.6122]],
    detalles: { puntosInteres: 'Iglesia de San Francisco, Santo Domingo, San José', distanciaKm: 2.3, duracionMinutos: 80 }
  }
];

async function inicializar() {
  const esquema = await fs.readFile(path.join(__dirname, '../../database/esquema.sql'), 'utf8');
  await pool.query(esquema);
  for (const ejemplo of ejemplos) {
    await pool.query(
      `INSERT INTO travesias (id, modalidad, titulo, descripcion, ubicacion, latitud, longitud, ruta_coordenadas, detalles)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9::jsonb)
       ON CONFLICT (id) DO UPDATE SET modalidad = EXCLUDED.modalidad, titulo = EXCLUDED.titulo,
         descripcion = EXCLUDED.descripcion, ubicacion = EXCLUDED.ubicacion, latitud = EXCLUDED.latitud,
         longitud = EXCLUDED.longitud, ruta_coordenadas = EXCLUDED.ruta_coordenadas, detalles = EXCLUDED.detalles`,
      [ejemplo.id, ejemplo.modalidad, ejemplo.titulo, ejemplo.descripcion, ejemplo.ubicacion,
        ejemplo.latitud, ejemplo.longitud, JSON.stringify(ejemplo.ruta), JSON.stringify(ejemplo.detalles)]
    );
  }
  console.log(`Base de datos lista: ${ejemplos.length} ejemplos de Popayán cargados.`);
}

inicializar()
  .catch((error) => {
    console.error('No fue posible inicializar la base de datos:', error);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
