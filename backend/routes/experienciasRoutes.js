const express = require('express');

module.exports = (controller, autenticar) => {
  const router = express.Router();
  router.get('/:id/experiencias', controller.listar);
  router.post('/:id/experiencias', autenticar, controller.crear);
  return router;
};