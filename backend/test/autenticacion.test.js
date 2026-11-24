const test = require('node:test');
const assert = require('node:assert/strict');
const AutenticacionService = require('../services/AutenticacionService');

test('registra una cuenta de usuario sin aceptar que se asigne rol de administrador', async () => {
  const usuario = { id: 'cliente-1', nombre: 'Ana', email: 'ana@example.com', rol: 'cliente' };
  let hashRecibido;
  const service = new AutenticacionService(
    { crear: (value) => `token-${value.id}` },
    {
      hash: async (password) => {
        hashRecibido = `hash:${password}`;
        return hashRecibido;
      }
    },
    {
      buscarPorEmail: async () => null,
      crear: async (datos) => {
        assert.deepEqual(datos, {
          nombre: 'Ana',
          email: 'ana@example.com',
          contrasenaHash: hashRecibido
        });
        return usuario;
      }
    }
  );

  const resultado = await service.registrar({
    nombre: 'Ana',
    email: 'ana@example.com',
    contrasena: 'clave-segura',
    rol: 'administrador'
  });

  assert.equal(resultado.usuario, usuario);
  assert.equal(resultado.token, 'token-cliente-1');
  assert.equal(hashRecibido, 'hash:clave-segura');
});

test('rechaza el registro de un correo existente', async () => {
  const service = new AutenticacionService(
    { crear: () => 'token' },
    { hash: async () => 'hash' },
    { buscarPorEmail: async () => ({ id: 'ya-existe' }) }
  );

  await assert.rejects(
    service.registrar({ nombre: 'Ana', email: 'ana@example.com', contrasena: 'clave-segura' }),
    { status: 409 }
  );
});

test('rechaza credenciales de inicio de sesión incorrectas', async () => {
  const service = new AutenticacionService(
    { crear: () => 'token' },
    { compare: async () => false },
    {
      buscarPorEmail: async () => ({ id: 'cliente-1', contrasena_hash: 'hash' })
    }
  );

  await assert.rejects(
    service.iniciarSesion({ email: 'ana@example.com', contrasena: 'incorrecta' }),
    { status: 401 }
  );
});

test('rechaza iniciar sesión como administrador con una cuenta de usuario', async () => {
  const service = new AutenticacionService(
    { crear: () => 'token' },
    { compare: async () => true },
    {
      buscarPorEmail: async () => ({
        id: 'cliente-1',
        nombre: 'Ana',
        email: 'ana@example.com',
        rol: 'cliente',
        contrasena_hash: 'hash'
      })
    }
  );

  await assert.rejects(
    service.iniciarSesion({
      email: 'ana@example.com',
      contrasena: 'clave-segura',
      rol: 'administrador'
    }),
    { status: 403 }
  );
});