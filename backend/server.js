require('dotenv').config();

const express = require('express');
const cors = require('cors');
const dependencies = require('./config/dependencies');
const TokenService = require('./services/TokenService');
const travesiasRoutes = require('./routes/travesiasRoutes');
const autenticacionRoutes = require('./routes/autenticacionRoutes');
const experienciasRoutes = require('./routes/experienciasRoutes');
const usuariosRoutes = require('./routes/usuariosRoutes');

const app = express();
const tokenService = new TokenService();
const origenesPermitidos = (process.env.FRONTEND_ORIGIN || 'http://127.0.0.1:5500,http://localhost:5500')
  .split(',')
  .map((origen) => origen.trim());

app.use(cors());
app.use(express.json({ limit: '1mb' }));

function autenticar(req, res, next) {
  const [tipo, token] = (req.headers.authorization || '').split(' ');
  if (tipo !== 'Bearer' || !token) return res.status(401).json({ error: 'Debes iniciar sesión.' });
  try {
    req.usuario = tokenService.verificar(token);
    return next();
  } catch (error) {
    if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'La sesión no es válida o ha expirado.' });
    }
    return next(error);
  }
}

function soloAdministrador(req, res, next) {
  if (req.usuario.rol !== 'administrador') return res.status(403).json({ error: 'Se requiere rol de administrador.' });
  return next();
}

app.get('/api/salud', (req, res) => res.json({ estado: 'ok', servicio: 'Gestor de Travesías' }));
app.use('/api/travesias', travesiasRoutes(dependencies.gestorTravesiasController, autenticar, soloAdministrador));
app.use('/api/travesias', experienciasRoutes(dependencies.experienciasController, autenticar));
app.use('/api/autenticacion', autenticacionRoutes(dependencies.autenticacionController));
app.use('/api/usuarios', usuariosRoutes(dependencies.usuariosController, autenticar, soloAdministrador));
app.use((req, res) => res.status(404).json({ error: 'Ruta no encontrada.' }));
app.use((error, req, res, next) => {
  console.error(error);
  if (res.headersSent) return next(error);
  const status = error.status || (error.code === '23505' ? 409 : 500);
  const message = error.code === '23505' ? 'Ya existe un registro con esos datos.' : error.message;
  res.status(status).json({ error: message || 'Error interno del servidor.' });
});

const port = Number(process.env.PORT || 3000);
if (require.main === module) {
  app.listen(port, () => console.log(`Gestor de Travesías disponible en http://localhost:${port}`));
}

module.exports = app;