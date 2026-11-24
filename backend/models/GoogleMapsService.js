class GoogleMapsService {
  async fetchCoordinatesByAddress(address) {
    const query = encodeURIComponent(address);
    if (process.env.GOOGLE_MAPS_API_KEY) {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${process.env.GOOGLE_MAPS_API_KEY}`;
      const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
      if (!response.ok) throw new Error(`Google Maps respondió HTTP ${response.status}.`);
      const result = await response.json();
      if (result.status !== 'OK' || !result.results.length) throw new Error('No se encontró esa ubicación en Google Maps.');
      const { lat, lng } = result.results[0].geometry.location;
      return { latitud: lat, longitud: lng };
    }

    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${query}`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'GestorTravesiasPopayan/1.0 (local student project)' },
      signal: AbortSignal.timeout(8000)
    });
    if (!response.ok) throw new Error(`El servicio de geolocalización respondió HTTP ${response.status}.`);
    const [result] = await response.json();
    if (!result) throw new Error('No se encontró esa ubicación en el mapa.');
    return { latitud: Number(result.lat), longitud: Number(result.lon) };
  }

  generateExternalMapLink(latitude, longitude) {
    return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
  }
}

module.exports = GoogleMapsService;
