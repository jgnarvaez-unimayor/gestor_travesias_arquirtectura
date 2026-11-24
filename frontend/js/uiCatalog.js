const nombresModalidad = {
  ciclismo: 'Ciclismo',
  senderismo: 'Senderismo',
  turistica: 'Turismo'
};

export function escaparHtml(texto = '') {
  return String(texto).replace(/[&<>"']/g, (caracter) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[caracter]);
}

export function renderCatalogo(travesias, seleccionadoId) {
  return travesias.map((travesia) => {
    const detalles = travesia.detalles || {};
    const distancia = detalles.distanciaKm ? `${escaparHtml(detalles.distanciaKm)} km` : 'Ruta local';
    const modalidad = nombresModalidad[travesia.modalidad] || travesia.modalidad;
    return `
      <article class="route-card ${travesia.id === seleccionadoId ? 'is-selected' : ''}"
        data-route-id="${escaparHtml(travesia.id)}" tabindex="0" role="button"
        aria-label="Ver ruta ${escaparHtml(travesia.titulo)}">
        <div class="card-topline">
          <span class="badge badge-${escaparHtml(travesia.modalidad)}">${escaparHtml(modalidad)}</span>
          <span class="card-distance">${distancia}</span>
        </div>
        <h3>${escaparHtml(travesia.titulo)}</h3>
        <p>${escaparHtml(travesia.descripcion)}</p>
        <div class="card-bottom">
          <span class="card-location">⌖ ${escaparHtml(travesia.ubicacion)}</span>
          <span class="card-arrow" aria-hidden="true">↗</span>
        </div>
      </article>`;
  }).join('');
}