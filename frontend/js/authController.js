import { api, cerrarSesion, guardarSesion } from './apiClient.js';

export function crearControladorAutenticacion(elementos, { cambiarUsuario, notificar }) {
  let modo = 'login';
  let rol = 'cliente';

  function cambiarModo(nuevoModo) {
    modo = nuevoModo;
    const registro = modo === 'register';
    const accesoAdministrador = rol === 'administrador';
    document.querySelector('#auth-title').textContent = registro
      ? 'Crear cuenta de usuario'
      : accesoAdministrador ? 'Acceso de administrador' : 'Acceso de usuario';
    document.querySelector('#auth-description').textContent = registro
      ? 'Crea una cuenta para compartir tus travesías.'
      : accesoAdministrador
        ? 'Inicia sesión para gestionar y crear travesías.'
        : 'Inicia sesión para publicar experiencias y valoraciones.';
    document.querySelector('#auth-role-note').textContent = registro
      ? 'El catálogo está disponible para explorar. La cuenta de usuario permite publicar experiencias; los permisos de administrador se asignan por separado.'
      : accesoAdministrador
        ? 'Este acceso es exclusivo para cuentas de administrador. Podrás crear y eliminar travesías.'
        : 'Puedes explorar el catálogo y, al iniciar sesión, compartir experiencias en las rutas.';
    document.querySelector('#name-field').hidden = !registro;
    document.querySelector('#name-field input').required = registro;
    document.querySelector('input[name="contrasena"]').autocomplete = registro ? 'new-password' : 'current-password';
    document.querySelector('#register-mode-button').hidden = accesoAdministrador;
    document.querySelectorAll('[data-auth-mode]').forEach((button) => {
      button.classList.toggle('is-selected', button.dataset.authMode === modo);
    });
    elementos.authError.textContent = '';
  }

  function abrirAcceso(nuevoRol) {
    rol = nuevoRol;
    cambiarModo('login');
    elementos.authForm.reset();
    elementos.authDialog.showModal();
  }

  function conectarEventos() {
    document.querySelector('#user-login-button').addEventListener('click', () => abrirAcceso('cliente'));
    document.querySelector('#admin-login-button').addEventListener('click', () => abrirAcceso('administrador'));
    document.querySelector('#session-button').addEventListener('click', () => {
      cerrarSesion();
      cambiarUsuario(null);
      notificar('Sesión cerrada.');
    });
    document.querySelectorAll('[data-auth-mode]').forEach((button) => {
      button.addEventListener('click', () => cambiarModo(button.dataset.authMode));
    });
    elementos.authForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      elementos.authError.textContent = '';
      const datos = Object.fromEntries(new FormData(elementos.authForm));
      try {
        const sesion = await api.autenticar(
          modo,
          modo === 'login' ? { ...datos, rol } : datos
        );
        guardarSesion(sesion);
        elementos.authDialog.close();
        cambiarUsuario(sesion.usuario);
        notificar(`¡Hola, ${sesion.usuario.nombre}!`);
      } catch (error) {
        elementos.authError.textContent = error.message;
      }
    });
  }

  return { conectarEventos };
}
