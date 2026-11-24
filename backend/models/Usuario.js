class Usuario {
  constructor({ id, nombre, email, rol = 'cliente', nivelAcceso = 'basico', testMascaraResuelto = false }) {
    this.id = id;
    this.nombre = nombre;
    this.email = email;
    this.rol = rol;
    this.nivelAcceso = nivelAcceso;
    this.testMascaraResuelto = testMascaraResuelto;
  }
}

class Cliente extends Usuario {
  constructor(datos) {
    super({ ...datos, rol: 'cliente' });
  }
}

class Administrador extends Usuario {
  constructor(datos) {
    super({ ...datos, rol: 'administrador' });
  }
}

module.exports = { Usuario, Cliente, Administrador };