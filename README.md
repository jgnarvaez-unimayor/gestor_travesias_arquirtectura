# Gestor de Travesías de Popayán

Aplicación web organizada según los diagramas: modelos de dominio, Factory Method por modalidad, Adapter de geolocalización, repositorios PostgreSQL, controladores y API REST.

## Requisitos

- Node.js 18 o superior.
- PostgreSQL instalado y en ejecución.
- Visual Studio Code con Live Server para abrir la interfaz.

## Preparación

1. Crea una base de datos nueva llamada `gestor_travesias_app` en PostgreSQL (por ejemplo: `psql -U postgres -c "CREATE DATABASE gestor_travesias_app;"`). La configuración predeterminada evita alterar bases existentes.
2. Copia `.env.example` a `.env`. La configuración inicial supone el usuario `postgres` y la contraseña local `1234`; ajusta la URL si tu instalación usa otro usuario, puerto o contraseña.
3. En la raíz del proyecto ejecuta:

   ```powershell
   npm install
   npm run db:init
   npm start
   ```

4. Abre `frontend/index.html` con Live Server. El origen habitual (`http://127.0.0.1:5500`) ya está permitido. Si Live Server usa otro puerto, cambia `FRONTEND_ORIGIN` en `.env` y reinicia el backend.

El servidor queda en `http://localhost:3000`; `http://localhost:3000/api/salud` comprueba su estado. El mapa usa Leaflet y los mosaicos de OpenStreetMap, por lo que la carga de sus recursos requiere internet. Los seis ejemplos de Popayán quedan guardados en PostgreSQL y se pueden volver a cargar ejecutando `npm run db:init`.

La interfaz carga desde `frontend/partials/` sus secciones y diálogos HTML. La lógica del frontend se divide en módulos independientes para autenticación, catálogo, gestión de rutas y mapa en `frontend/js/`. Por ello, abre el frontend mediante Live Server y no como archivo local.

## Uso

- Filtra las dos travesías de ciclismo, senderismo o turismo desde el catálogo.
- Selecciona una tarjeta o marcador para centrar el mapa y mostrar el recorrido.
- El catálogo es público. Usa el acceso de usuario para registrarte o iniciar sesión y publicar experiencias con valoración.
- El acceso de administrador es independiente; crear, editar o eliminar travesías requiere una cuenta de administrador, que se crea con `npm run db:admin -- "Nombre" correo@ejemplo.com "contraseña-segura"`.
- Para dibujar una ruta nueva, pulsa **＋ Crear ruta** y **Elegir inicio y recorrido en el mapa**. Haz clic en el punto de inicio y luego en cada punto del trayecto; termina el dibujo y guarda los datos. Para editar una existente, selecciónala y pulsa **Editar ruta**; modifica sus datos, ajusta el recorrido en el mapa si lo necesitas y pulsa **Actualizar cambios**.
- `GOOGLE_MAPS_API_KEY` es opcional. Para resolver ubicaciones nuevas se usa Google Maps cuando hay clave configurada y OpenStreetMap/Nominatim como alternativa.

No publiques `.env` ni reutilices la contraseña de desarrollo en un despliegue.
