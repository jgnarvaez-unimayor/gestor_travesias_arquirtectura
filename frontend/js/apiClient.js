const API_BASE_URL = window.API_BASE_URL || 'http://localhost:3000/api';
const TOKEN_KEY = 'gestor-travesias-token';

async function request(path, options = {}) {
  const headers = new Headers(options.headers || {});
  const token = sessionStorage.getItem(TOKEN_KEY);
  if (options.body) headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  } catch {
    throw new Error('No se pudo conectar con el backend. Comprueba que esté ejecutándose en http://localhost:3000.');
  }

  if (response.status === 204) return null;
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || `La solicitud falló (HTTP ${response.status}).`);
  return body;
}

export const api = {
  listarTravesias: () => request('/travesias'),
  listarExperiencias: (id) => request(`/travesias/${encodeURIComponent(id)}/experiencias`),
  crearExperiencia: (id, datos) => request(`/travesias/${encodeURIComponent(id)}/experiencias`, {
    method: 'POST',
    body: JSON.stringify(datos)
  }),
  autenticar: (modo, datos) => request(`/autenticacion/${modo === 'register' ? 'registro' : 'login'}`, {
    method: 'POST',
    body: JSON.stringify(datos)
  }),
  crearTravesia: (datos) => request('/travesias', {
    method: 'POST',
    body: JSON.stringify(datos)
  }),
  actualizarRecorrido: (id, rutaCoordenadas) => request(`/travesias/${encodeURIComponent(id)}/recorrido`, {
    method: 'PUT',
    body: JSON.stringify({ rutaCoordenadas })
  }),
  actualizarTravesia: (id, datos) => request(`/travesias/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(datos)
  }),
  eliminarTravesia: (id) => request(`/travesias/${encodeURIComponent(id)}`, { method: 'DELETE' })
};

export function guardarSesion({ token, usuario }) {
  sessionStorage.setItem(TOKEN_KEY, token);
  sessionStorage.setItem('gestor-travesias-usuario', JSON.stringify(usuario));
}

export function leerSesion() {
  const raw = sessionStorage.getItem('gestor-travesias-usuario');
  if (!raw || !sessionStorage.getItem(TOKEN_KEY)) return null;
  try {
    return JSON.parse(raw);
  } catch {
    sessionStorage.removeItem('gestor-travesias-usuario');
    sessionStorage.removeItem(TOKEN_KEY);
    return null;
  }
}

export function cerrarSesion() {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem('gestor-travesias-usuario');
}