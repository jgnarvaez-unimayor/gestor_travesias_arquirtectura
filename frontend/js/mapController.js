export function crearControladorMapa(elementos, {
  obtenerRolUsuario,
  seleccionarRuta,
  notificar,
  obtenerRutaCoordenadas,
  establecerRutaCoordenadas
}) {
  let map;
  let markerLayer;
  let routeLayer;
  let editLayer;
  let edicionMapa = null;

  function iniciar() {
    if (!window.L) {
      elementos.mapa.textContent = 'No se pudo cargar el mapa. Comprueba tu conexión a internet y recarga la página.';
      elementos.mapa.classList.add('map-error');
      throw new Error('La librería del mapa no está disponible.');
    }
    map = window.L.map(elementos.mapa, { scrollWheelZoom: false }).setView([2.4448, -76.6147], 14);
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
    markerLayer = window.L.layerGroup().addTo(map);
    routeLayer = window.L.layerGroup().addTo(map);
    editLayer = window.L.layerGroup().addTo(map);
    map.on('click', (event) => {
      if (!edicionMapa || obtenerRolUsuario() !== 'administrador') return;
      const punto = [Number(event.latlng.lat.toFixed(6)), Number(event.latlng.lng.toFixed(6))];
      if (edicionMapa.seleccionandoInicio || edicionMapa.puntos.length === 0) {
        edicionMapa.puntos = [punto];
        edicionMapa.seleccionandoInicio = false;
        elementos.routeForm.elements.latitud.value = punto[0];
        elementos.routeForm.elements.longitud.value = punto[1];
      } else {
        edicionMapa.puntos.push(punto);
      }
      renderizarEdicion();
    });
  }

  function renderizarEdicion() {
    if (!edicionMapa || !editLayer) return;
    editLayer.clearLayers();
    const { puntos, seleccionandoInicio } = edicionMapa;
    if (puntos.length > 1) {
      window.L.polyline(puntos, { color: '#e77c5e', weight: 5, opacity: .9 }).addTo(editLayer);
    }
    puntos.forEach((punto, indice) => {
      window.L.circleMarker(punto, {
        radius: indice === 0 ? 8 : 5,
        color: '#fff',
        weight: 2,
        fillColor: indice === 0 ? '#e77c5e' : '#286b50',
        fillOpacity: 1
      }).addTo(editLayer);
    });

    elementos.mapEditor.hidden = false;
    elementos.mapEditorInstruction.textContent = seleccionandoInicio
      ? 'Haz clic en el mapa para elegir el punto de inicio.'
      : `Inicio seleccionado. Haz clic en el mapa para agregar puntos del recorrido (${puntos.length} puntos).`;
    document.querySelector('#map-editor-undo').disabled = puntos.length === 0;
    document.querySelector('#map-editor-clear').disabled = puntos.length === 0;
    document.querySelector('#map-editor-finish').disabled = seleccionandoInicio || puntos.length < 2;
  }

  function iniciarEdicion(puntosIniciales = [], seleccionandoInicio = false) {
    map.closePopup();
    map.removeLayer(markerLayer);
    const latitudOriginal = elementos.routeForm.elements.latitud.value;
    const longitudOriginal = elementos.routeForm.elements.longitud.value;
    edicionMapa = {
      puntos: puntosIniciales.map((punto) => punto.map(Number)),
      puntosOriginales: obtenerRutaCoordenadas().map((punto) => [...punto]),
      latitudOriginal,
      longitudOriginal,
      seleccionandoInicio: seleccionandoInicio || puntosIniciales.length === 0
    };
    renderizarEdicion();
    if (edicionMapa.puntos.length > 1) {
      map.fitBounds(window.L.latLngBounds(edicionMapa.puntos), { padding: [35, 35], maxZoom: 16 });
    } else if (edicionMapa.puntos.length === 1) {
      map.setView(edicionMapa.puntos[0], 16);
    }
  }

  function dirigirAlMapa() {
    const mapa = document.querySelector('#mapa');
    if (!mapa) return;
    mapa.scrollIntoView({ behavior: 'smooth', block: 'start' });
    requestAnimationFrame(() => {
      map?.invalidateSize();
    });
  }

  function cerrarEdicion() {
    edicionMapa = null;
    elementos.mapEditor.hidden = true;
    editLayer?.clearLayers();
    if (map && markerLayer && !map.hasLayer(markerLayer)) markerLayer.addTo(map);
  }

  function terminarEdicion() {
    if (!edicionMapa || edicionMapa.seleccionandoInicio || edicionMapa.puntos.length < 2) {
      notificar('Selecciona el punto de inicio y al menos un punto más del recorrido.');
      return;
    }

    establecerRutaCoordenadas(edicionMapa.puntos.map((punto) => [...punto]));
    cerrarEdicion();
    elementos.routeDialog.showModal();
  }

  function conectarEventosEditor() {
    document.querySelector('#map-pick-button').addEventListener('click', () => {
      let puntos = obtenerRutaCoordenadas().map((punto) => [...punto]);
      if (!puntos.length && elementos.routeForm.elements.latitud.value && elementos.routeForm.elements.longitud.value) {
        puntos = [[
          Number(elementos.routeForm.elements.latitud.value),
          Number(elementos.routeForm.elements.longitud.value)
        ]];
      }
      elementos.routeDialog.close();
      iniciarEdicion(puntos, puntos.length === 0);
      dirigirAlMapa();
    });
    document.querySelector('#map-editor-start').addEventListener('click', () => {
      if (!edicionMapa) return;
      edicionMapa.seleccionandoInicio = true;
      renderizarEdicion();
    });
    document.querySelector('#map-editor-undo').addEventListener('click', () => {
      if (!edicionMapa) return;
      if (edicionMapa.puntos.length > 1) {
        edicionMapa.puntos.pop();
      } else {
        edicionMapa.puntos = [];
        edicionMapa.seleccionandoInicio = true;
        elementos.routeForm.elements.latitud.value = '';
        elementos.routeForm.elements.longitud.value = '';
      }
      renderizarEdicion();
    });
    document.querySelector('#map-editor-clear').addEventListener('click', () => {
      if (!edicionMapa) return;
      edicionMapa.puntos = edicionMapa.puntos.slice(0, 1);
      edicionMapa.seleccionandoInicio = edicionMapa.puntos.length === 0;
      renderizarEdicion();
    });
    document.querySelector('#map-editor-finish').addEventListener('click', terminarEdicion);
    document.querySelector('#map-editor-cancel').addEventListener('click', () => {
      if (edicionMapa) {
        establecerRutaCoordenadas(edicionMapa.puntosOriginales);
        elementos.routeForm.elements.latitud.value = edicionMapa.latitudOriginal;
        elementos.routeForm.elements.longitud.value = edicionMapa.longitudOriginal;
      }
      cerrarEdicion();
      elementos.routeDialog.showModal();
    });
  }

  function actualizar(rutas, seleccionada) {
    if (!map) return;
    markerLayer.clearLayers();
    routeLayer.clearLayers();
    const icono = window.L.divIcon({
      className: '',
      html: '<span class="map-marker"><span>↗</span></span>',
      iconSize: [27, 27],
      iconAnchor: [13, 25]
    });
    rutas.forEach((ruta) => {
      const marker = window.L.marker([ruta.latitud, ruta.longitud], { icon: icono }).addTo(markerLayer);
      const titulo = document.createElement('span');
      titulo.textContent = ruta.titulo;
      marker.bindPopup(titulo);
      marker.on('click', () => {
        if (!edicionMapa) seleccionarRuta(ruta.id, false);
      });
    });
    elementos.totalMapa.textContent = `${rutas.length} ${rutas.length === 1 ? 'ruta' : 'rutas'}`;
    if (!seleccionada || !rutas.some((ruta) => ruta.id === seleccionada.id)) {
      if (rutas.length > 1) {
        map.fitBounds(window.L.featureGroup(markerLayer.getLayers()).getBounds(), { padding: [30, 30], maxZoom: 14 });
      } else if (rutas.length === 1) {
        map.setView([rutas[0].latitud, rutas[0].longitud], 14);
      }
      return;
    }

    const coordenadas = Array.isArray(seleccionada.rutaCoordenadas) ? seleccionada.rutaCoordenadas : [];
    if (coordenadas.length > 1) {
      const linea = window.L.polyline(coordenadas, { color: '#286b50', weight: 4, opacity: .8 }).addTo(routeLayer);
      map.fitBounds(linea.getBounds(), { padding: [35, 35], maxZoom: 15 });
    } else {
      map.setView([seleccionada.latitud, seleccionada.longitud], 15);
    }
  }

  function centrarSeleccionada(seleccionada) {
    if (!map || !seleccionada) return;
    map.flyTo([seleccionada.latitud, seleccionada.longitud], 15, { duration: .55 });
    setTimeout(() => map.invalidateSize(), 200);
  }

  return { iniciar, actualizar, conectarEventosEditor, iniciarEdicion, centrarSeleccionada };
}
