import { escaparHtml } from './uiCatalog.js';

const nombresModalidad = {
  ciclismo: 'Ciclismo',
  senderismo: 'Senderismo',
  turistica: 'Turismo'
};

function fechaLegible(fecha) {
  if (!fecha) return '';
  const valor = new Date(fecha);
  return Number.isNaN(valor.valueOf()) ? '' : valor.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function renderDetalle(travesia, experiencias, { autenticado, administrador }) {
  if (!travesia) return '<p class="detail-placeholder">Selecciona una tarjeta o marcador para ver la ruta y sus experiencias.</p>';
  const detalles = travesia.detalles || {};
  const subtipo = detalles.submodalidadCiclismo || detalles.nivelDificultad || detalles.puntosInteres;
  const datos = [
    nombresModalidad[travesia.modalidad] || travesia.modalidad,
    subtipo,
    detalles.distanciaKm ? `${detalles.distanciaKm} km` : null,
    detalles.duracionMinutos ? `${detalles.duracionMinutos} min aprox.` : null
  ].filter(Boolean);
  const reviews = experiencias.length
    ? experiencias.map((review) => `
      <article class="review-item">
        <strong>${escaparHtml(review.nombre || 'Explorador')}</strong>
        <time>${escaparHtml(fechaLegible(review.fecha))}</time>
        <p>${'★'.repeat(Number(review.puntuacion) || 0)}${'☆'.repeat(5 - (Number(review.puntuacion) || 0))} · ${escaparHtml(review.comentario)}</p>
      </article>`).join('')
    : '<p class="detail-placeholder">Aún no hay experiencias. ¡Sé la primera persona en compartir la tuya!</p>';

  return `
    <div class="detail-actions">
      <span class="badge badge-${escaparHtml(travesia.modalidad)}">${escaparHtml(nombresModalidad[travesia.modalidad] || travesia.modalidad)}</span>
      ${administrador ? `<button class="edit-route" type="button" data-edit-route="${escaparHtml(travesia.id)}">Editar ruta</button>` : ''}
      ${administrador ? `<button class="delete-route" type="button" data-delete-route="${escaparHtml(travesia.id)}">Eliminar ruta</button>` : ''}
    </div>
    <h3>${escaparHtml(travesia.titulo)}</h3>
    <p class="detail-location">⌖ ${escaparHtml(travesia.ubicacion)}</p>
    <p class="detail-description">${escaparHtml(travesia.descripcion)}</p>
    <div class="detail-meta">${datos.map((dato) => `<span>${escaparHtml(dato)}</span>`).join('')}</div>
    <a class="external-map" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${travesia.latitud},${travesia.longitud}`)}" target="_blank" rel="noopener noreferrer">Abrir indicaciones en Google Maps ↗</a>
    <div class="review-heading"><strong>Experiencias</strong><span>${experiencias.length}</span></div>
    <div class="review-list">${reviews}</div>
    ${autenticado ? `
      <form id="review-form" class="review-form" data-review-route="${escaparHtml(travesia.id)}">
        <textarea name="comentario" maxlength="1000" placeholder="¿Cómo te fue en esta travesía?" aria-label="Tu experiencia" required></textarea>
        <select name="puntuacion" aria-label="Puntuación">
          <option value="5">★★★★★</option><option value="4">★★★★☆</option><option value="3">★★★☆☆</option><option value="2">★★☆☆☆</option><option value="1">★☆☆☆☆</option>
        </select>
        <button class="button button-primary" type="submit">Publicar</button>
      </form>` : '<p class="detail-placeholder">Inicia sesión para compartir una experiencia y valoración.</p>'}`;
}