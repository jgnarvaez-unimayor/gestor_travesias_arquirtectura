require('dotenv').config();

const pool = require('../config/db');
const PasswordHasher = require('../services/PasswordHasher');

async function crearAdministrador() {
  const [nombre, email, contrasena] = process.argv.slice(2);
  if (!nombre || !email || !contrasena || contrasena.length < 8) {
    throw new Error('Uso: npm run db:admin -- "Nombre" correo@ejemplo.com "contraseña-de-8-o-más-caracteres"');
  }
  const contrasenaHash = await new PasswordHasher().hash(contrasena);
  await pool.query(
    `INSERT INTO usuarios (nombre, email, contrasena_hash, rol, nivel_acceso)
     VALUES ($1, LOWER($2), $3, 'administrador', 'total')
     ON CONFLICT (email) DO UPDATE SET nombre = EXCLUDED.nombre, contrasena_hash = EXCLUDED.contrasena_hash,
       rol = 'administrador', nivel_acceso = 'total'`,
    [nombre, email, contrasenaHash]
  );
  console.log(`Administrador listo: ${email}`);
}

crearAdministrador()
  .catch((error) => {
    console.error('No fue posible crear el administrador:', error);
    process.exitCode = 1;
  })
  .finally(() => pool.end());