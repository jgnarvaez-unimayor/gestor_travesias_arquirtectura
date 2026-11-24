const express = require('express');

module.exports = (controller, autenticar, soloAdministrador) => {
  const router = express.Router();
  router.get('/yo', autenticar, controller.yo);
  router.post('/test-mascara', autenticar, controller.resolverTestMascara);
  router.get('/', autenticar, soloAdministrador, controller.listar);
  return router;
};