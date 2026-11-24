import { api } from './apiClient.js';
import { escaparHtml, renderCatalogo } from './uiCatalog.js';
import { renderDetalle } from './uiDetail.js';

export function crearControladorCatalogo(elementos, { controladorMapa, obtenerUsuario, notificar }) {
  let travesias = [];
  let seleccionada = null;
  let filtroActual = 'todas';
  let busqueda = '';

  function rutasVisibles() {
    const termino = busqueda.trim().toLocaleLowerCase('es');
    return travesias.filter((travesia) => {
      const coincideModalidad = filtroActual === 'todas' || travesia.modalidad === filtroActual;
      const contenido = `${travesia.titulo} ${travesia.descripcion} ${travesia.ubicacion}`.toLocaleLowerCase('es');
      return coincideModalidad && (!termino || contenido.includes(termino));
    });
  }

  function renderSeleccionada() {
    const usuario = obtenerUsuario();
    elementos.detalle.innerHTML = renderDetalle(
      seleccionada,
      seleccionada?.experiencias || [],
      { autenticado: Boolean(usuario), administrador: usuario?.rol === 'administrador' }
    );
  }

  function render() {
    const visibles = rutasVisibles();
    elementos.catalogo.innerHTML = renderCatalogo(visibles, seleccionada?.id);
    elementos.vacio.hidden = visibles.length > 0;
    elementos.resultado.textContent = `${visibles.length} ${visibles.length === 1 ? 'resultado' : 'resultados'}`;
    elementos.totalFiltro.textContent = travesias.length;
    elementos.total.textContent = travesias.length;
    controladorMapa.actualizar(visibles, seleccionada);
  }

  async function seleccionar(id, centrar = true) {
    seleccionada = travesias.find((ruta) => ruta.id === id) || null;
    if (!seleccionada) return;
    const ruta = seleccionada;
    render();
    renderSeleccionada();
    try {
      ruta.experiencias = await api.listarExperiencias(ruta.id);
      if (seleccionada?.id === ruta.id) renderSeleccionada();
    } catch (error) {
      notificar(error.message);
    }
    if (centrar && seleccionada?.id === ruta.id) controladorMapa.centrarSeleccionada(ruta);
  }

  async function cargar() {
    try {
      travesias = await api.listarTravesias();
      if (seleccionada) {
        seleccionada = travesias.find((ruta) => ruta.id === seleccionada.id) || null;
      }
      render();
      renderSeleccionada();
    } catch (error) {
      elementos.catalogo.innerHTML = `<p class="empty-state">${escaparHtml(error.message)}</p>`;
      elementos.resultado.textContent = 'Sin conexión';
    }
  }

  function conectarEventos() {
    document.querySelectorAll('[data-filter]').forEach((button) => {
      button.addEventListener('click', () => {
        filtroActual = button.dataset.filter;
        document.querySelectorAll('[data-filter]').forEach((item) => {
          const activo = item === button;
          item.classList.toggle('is-active', activo);
          item.setAttribute('aria-pressed', String(activo));
        });
        render();
      });
    });
    document.querySelector('#search-input').addEventListener('input', (event) => {
      busqueda = event.target.value;
      render();
    });
    elementos.catalogo.addEventListener('click', (event) => {
      const card = event.target.closest('[data-route-id]');
      if (card) seleccionar(card.dataset.routeId);
    });
    elementos.catalogo.addEventListener('keydown', (event) => {
      if ((event.key === 'Enter' || event.key === ' ') && event.target.matches('[data-route-id]')) {
        event.preventDefault();
        seleccionar(event.target.dataset.routeId);
      }
    });
  }

  return {
    conectarEventos,
    cargar,
    seleccionar,
    render,
    renderSeleccionada,
    limpiarSeleccion: () => { seleccionada = null; },
    obtenerTravesias: () => travesias
  };
}
