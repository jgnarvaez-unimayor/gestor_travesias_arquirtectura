const pool = require('./db');
const GoogleMapsService = require('../models/GoogleMapsService');
const GoogleMapsAdapter = require('../models/GoogleMapsAdapter');
const TravesiaRepository = require('../repositories/TravesiaRepository');
const ExperienciasRepository = require('../repositories/ExperienciasRepository');
const UsuarioRepository = require('../repositories/UsuarioRepository');
const GestorTravesiasController = require('../controllers/GestorTravesiasController');
const ExperienciasController = require('../controllers/ExperienciasController');
const UsuariosController = require('../controllers/UsuariosController');
const AutenticacionController = require('../controllers/AutenticacionController');
const TokenService = require('../services/TokenService');
const PasswordHasher = require('../services/PasswordHasher');

const travesiaRepository = new TravesiaRepository(pool);
const usuarioRepository = new UsuarioRepository(pool);
const experienciasRepository = new ExperienciasRepository(pool);
const servicioGeo = new GoogleMapsAdapter(new GoogleMapsService());
const gestorTravesiasController = new GestorTravesiasController(servicioGeo, travesiaRepository);
const experienciasController = new ExperienciasController(experienciasRepository);
const usuariosController = new UsuariosController(usuarioRepository);
const autenticacionController = new AutenticacionController(
  new TokenService(),
  new PasswordHasher(),
  usuarioRepository
);

module.exports = {
  autenticacionController,
  experienciasController,
  gestorTravesiasController,
  travesiaRepository,
  usuarioRepository,
  usuariosController
};