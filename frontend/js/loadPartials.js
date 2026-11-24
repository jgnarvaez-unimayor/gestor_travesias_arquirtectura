const partiales = [
  'site-header.html',
  'hero-section.html',
  'explore-section.html',
  'about-section.html',
  'site-footer.html',
  'auth-dialog.html',
  'travesia-dialog.html'
];

export async function cargarParciales() {
  const respuestas = await Promise.all(partiales.map(async (archivo) => {
    const respuesta = await fetch(new URL(`../partials/${archivo}`, import.meta.url));
    if (!respuesta.ok) {
      throw new Error(`No se pudo cargar el fragmento ${archivo} (HTTP ${respuesta.status}).`);
    }
    return [archivo, await respuesta.text()];
  }));

  respuestas.forEach(([archivo, contenido]) => {
    const destino = document.querySelector(`[data-partial="${archivo}"]`);
    if (!destino) throw new Error(`No se encontró el contenedor del fragmento ${archivo}.`);
    destino.insertAdjacentHTML('beforebegin', contenido);
    destino.remove();
  });
}
