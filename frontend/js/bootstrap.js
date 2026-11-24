import { cargarParciales } from './loadPartials.js';

try {
  await cargarParciales();
  await import('./app.js');
} catch (error) {
  console.error(error);
  const aviso = document.createElement('p');
  aviso.setAttribute('role', 'alert');
  aviso.className = 'empty-state';
  aviso.textContent = 'No se pudo cargar la interfaz. Comprueba que la página se sirve desde Live Server y recárgala.';
  document.body.prepend(aviso);
}
