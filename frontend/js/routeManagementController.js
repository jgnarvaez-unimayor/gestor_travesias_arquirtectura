import { api } from './apiClient.js';

const etiquetasModalidad = {
  ciclismo: 'Submodalidad de ciclismo',
  senderismo: 'Nivel de dificultad',
  turistica: 'Puntos de interés'
};

export function crearControladorGestionRutas(elementos, {
  obtenerTravesias,
  limpiarSeleccion,
  cargarTravesias,
  seleccionarRuta,
  obtenerRutaCoordenadas,
  establecerRutaCoordenadas,
  notificar
}) {
  let rutaEditandoId = null;

  function prepararNueva() {
    rutaEditandoId = null;
    establecerRutaCoordenadas([]);
    elementos.routeForm.reset();
    elementos.routeError.textContent = '';
    document.querySelector('#route-dialog-title').textContent = 'Crear una ruta';
    document.querySelector('#route-dialog-description').textContent = 'Añade una nueva travesía al mapa de Popayán.';
    document.querySelector('#route-submit-button').textContent = 'Guardar travesía';
    document.querySelector('#map-pick-button').textContent = 'Elegir inicio y recorrido en el mapa';
    document.querySelector('#specific-label').textContent = 'Detalle de la modalidad';
  }

  function prepararEdicion(ruta) {
    const detalles = ruta.detalles || {};
    rutaEditandoId = ruta.id;
    establecerRutaCoordenadas(Array.isArray(ruta.rutaCoordenadas)
      ? ruta.rutaCoordenadas.map((punto) => punto.map(Number))
      : []);
    elementos.routeForm.reset();
    elementos.routeForm.elements.modalidad.value = ruta.modalidad;
    elementos.routeForm.elements.titulo.value = ruta.titulo;
    elementos.routeForm.elements.descripcion.value = ruta.descripcion;
    elementos.routeForm.elements.ubicacion.value = ruta.ubicacion;
    elementos.routeForm.elements.latitud.value = ruta.latitud;
    elementos.routeForm.elements.longitud.value = ruta.longitud;
    elementos.routeForm.elements.detalle.value = detalles.submodalidadCiclismo
      || detalles.nivelDificultad
      || detalles.puntosInteres
      || '';
    elementos.routeForm.elements.distanciaKm.value = detalles.distanciaKm ?? '';
    elementos.routeForm.elements.duracionMinutos.value = detalles.duracionMinutos ?? '';
    elementos.routeError.textContent = '';
    document.querySelector('#route-dialog-title').textContent = 'Editar travesía';
    document.querySelector('#route-dialog-description').textContent = 'Modifica los datos de la ruta o actualiza su recorrido en el mapa.';
    document.querySelector('#route-submit-button').textContent = 'Actualizar cambios';
    document.querySelector('#map-pick-button').textContent = 'Editar inicio y recorrido en el mapa';
    document.querySelector('#specific-label').textContent = etiquetasModalidad[ruta.modalidad] || 'Detalle de la modalidad';
    elementos.routeDialog.showModal();
  }

  function obtenerDetalles(formulario, modalidad) {
    const detalle = formulario.detalle.trim();
    const detalles = modalidad === 'ciclismo'
      ? { submodalidadCiclismo: detalle || 'Ruta recreativa' }
      : modalidad === 'senderismo'
        ? { nivelDificultad: detalle || 'Moderado' }
        : { puntosInteres: detalle || 'Centro histórico' };
    if (formulario.distanciaKm) detalles.distanciaKm = Number(formulario.distanciaKm);
    if (formulario.duracionMinutos) detalles.duracionMinutos = Number(formulario.duracionMinutos);
    return detalles;
  }

  async function guardar(event) {
    event.preventDefault();
    elementos.routeError.textContent = '';
    const formulario = Object.fromEntries(new FormData(elementos.routeForm));
    const modalidad = formulario.modalidad;
    const datos = {
      modalidad,
      titulo: formulario.titulo.trim(),
      descripcion: formulario.descripcion.trim(),
      ubicacion: formulario.ubicacion.trim(),
      latitud: formulario.latitud ? Number(formulario.latitud) : null,
      longitud: formulario.longitud ? Number(formulario.longitud) : null,
      rutaCoordenadas: obtenerRutaCoordenadas(),
      detalles: obtenerDetalles(formulario, modalidad)
    };
    try {
      const esEdicion = Boolean(rutaEditandoId);
      const travesia = esEdicion
        ? await api.actualizarTravesia(rutaEditandoId, datos)
        : await api.crearTravesia(datos);
      rutaEditandoId = null;
      establecerRutaCoordenadas([]);
      elementos.routeDialog.close();
      document.querySelector('[data-filter="todas"]').click();
      await cargarTravesias();
      await seleccionarRuta(travesia.id);
      notificar(esEdicion ? 'Travesía actualizada.' : 'Travesía creada y añadida al mapa.');
    } catch (error) {
      elementos.routeError.textContent = error.message;
    }
  }

  async function eliminar(id) {
    if (!confirm('¿Eliminar esta travesía y sus experiencias?')) return;
    try {
      await api.eliminarTravesia(id);
      limpiarSeleccion();
      await cargarTravesias();
      notificar('Travesía eliminada.');
    } catch (error) {
      notificar(error.message);
    }
  }

  function conectarEventos(elementoDetalle) {
    elementoDetalle.addEventListener('click', (event) => {
      const editButton = event.target.closest('[data-edit-route]');
      if (editButton) {
        const ruta = obtenerTravesias().find((item) => item.id === editButton.dataset.editRoute);
        if (ruta) prepararEdicion(ruta);
        return;
      }
      const deleteButton = event.target.closest('[data-delete-route]');
      if (deleteButton) eliminar(deleteButton.dataset.deleteRoute);
    });
    document.querySelector('#admin-add-button').addEventListener('click', () => {
      prepararNueva();
      elementos.routeDialog.showModal();
    });
    document.querySelector('#new-modality').addEventListener('change', (event) => {
      document.querySelector('#specific-label').textContent = etiquetasModalidad[event.target.value];
    });
    elementos.routeForm.addEventListener('submit', guardar);
  }

  return { conectarEventos };
}
