class CreadorTravesia {
  crearTravesia() {
    throw new Error('Las subclases deben implementar crearTravesia().');
  }

  registrarTravesia(datos) {
    return this.crearTravesia(datos);
  }
}

module.exports = CreadorTravesia;
