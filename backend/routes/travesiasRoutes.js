const express = require('express');

module.exports = (controller, autenticar, soloAdministrador) => {
  const router = express.Router();
  router.get('/', controller.listar);
  router.get('/:id', controller.obtener);
  router.post('/', autenticar, soloAdministrador, controller.crear);
  router.put('/:id', autenticar, soloAdministrador, controller.actualizar);
  router.put('/:id/recorrido', autenticar, soloAdministrador, controller.actualizarRecorrido);
  router.delete('/:id', autenticar, soloAdministrador, controller.eliminar);
  return router;
};