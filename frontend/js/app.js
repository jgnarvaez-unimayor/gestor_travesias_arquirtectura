import { leerSesion } from './apiClient.js';
import { crearControladorAutenticacion } from './authController.js';
import { crearControladorCatalogo } from './catalogController.js';
import { crearControladorGestionRutas } from './routeManagementController.js';
import { crearControladorMapa } from './mapController.js';

const $ = (selector) => document.querySelector(selector);
const elementos = {
  catalogo: $('#catalog-grid'),
  detalle: $('#travesia-details'),
  mapa: $('#map'),
  vacio: $('#empty-state'),
  resultado: $('#results-label'),
  total: $('#route-count'),
  totalFiltro: $('#all-count'),
  totalMapa: $('#map-count'),
  authDialog: $('#auth-dialog'),
  authForm: $('#auth-form'),
  authError: $('#auth-error'),
  routeDialog: $('#travesia-dialog'),
  routeForm: $('#travesia-form'),
  routeError: $('#travesia-error'),
  mapEditor: $('#map-editor-controls'),
  mapEditorInstruction: $('#map-editor-instruction'),
  toast: $('#toast')
};

let usuario = leerSesion();
let rutaCoordenadasNueva = [];
let toastTimer;
let catalogo;
let gestionRutas;

function notificar(mensaje) {
  elementos.toast.textContent = mensaje;
  elementos.toast.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => elementos.toast.classList.remove('is-visible'), 3500);
}

const controladorMapa = crearControladorMapa(elementos, {
  obtenerRolUsuario: () => usuario?.rol,
  seleccionarRuta: (id, centrar) => catalogo.seleccionar(id, centrar),
  notificar,
  obtenerRutaCoordenadas: () => rutaCoordenadasNueva,
  establecerRutaCoordenadas: (coordenadas) => { rutaCoordenadasNueva = coordenadas; }
});

catalogo = crearControladorCatalogo(elementos, {
  controladorMapa,
  obtenerUsuario: () => usuario,
  notificar
});

gestionRutas = crearControladorGestionRutas(elementos, {
  obtenerTravesias: () => catalogo.obtenerTravesias(),
  limpiarSeleccion: () => catalogo.limpiarSeleccion(),
  cargarTravesias: () => catalogo.cargar(),
  seleccionarRuta: (id) => catalogo.seleccionar(id),
  obtenerRutaCoordenadas: () => rutaCoordenadasNueva,
  establecerRutaCoordenadas: (coordenadas) => { rutaCoordenadasNueva = coordenadas; },
  notificar
});

const controladorAutenticacion = crearControladorAutenticacion(elementos, {
  cambiarUsuario: (nuevoUsuario) => {
    usuario = nuevoUsuario;
    actualizarSesion();
  },
  notificar
});

function actualizarSesion() {
  const rol = usuario?.rol === 'administrador' ? 'Administrador' : 'Usuario';
  const etiqueta = $('#session-label');
  $('#user-login-button').hidden = Boolean(usuario);
  $('#admin-login-button').hidden = Boolean(usuario);
  $('#session-button').hidden = !usuario;
  etiqueta.textContent = usuario ? `Hola, ${usuario.nombre} · ${rol}` : '';
  etiqueta.title = usuario ? `Sesión iniciada como ${rol}` : '';
  etiqueta.hidden = !usuario;
  $('#admin-add-button').hidden = usuario?.rol !== 'administrador';
  catalogo.renderSeleccionada();
}

function conectarEventos() {
  catalogo.conectarEventos();
  controladorMapa.conectarEventosEditor();
  controladorAutenticacion.conectarEventos();
  gestionRutas.conectarEventos(elementos.detalle);
  document.querySelectorAll('[data-close-dialog]').forEach((button) => {
    button.addEventListener('click', () => {
      document.querySelectorAll('dialog[open]').forEach((dialog) => dialog.close());
    });
  });
}

async function iniciar() {
  conectarEventos();
  actualizarSesion();
  try {
    controladorMapa.iniciar();
  } catch (error) {
    console.error(error);
  }
  await catalogo.cargar();
}

iniciar();
