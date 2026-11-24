const express = require('express');

module.exports = (controller) => {
  const router = express.Router();
  router.post('/registro', controller.registrar);
  router.post('/login', controller.iniciarSesion);
  return router;
};