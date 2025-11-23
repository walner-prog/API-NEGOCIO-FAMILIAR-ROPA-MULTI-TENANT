import Usuario from '../models/Usuario.js';
import Tienda from '../models/Tienda.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import sequelize from '../config/database.js';

const SALT_ROUNDS = 10;
const LIMITE_USUARIOS = 3; // Incluyendo al administrador
const saltRounds = 10;

/**
 * Registrar usuario y crear tienda automáticamente
 * @param {Object} datos - email, username, password, nombre, rol
 */
export async function registerUsuarioService(userData) {
    const { email, password, nombre, username } = userData;
    
    // Asumimos que las validaciones de datos (email, password, etc.) ya se han hecho.

    return await sequelize.transaction(async (t) => {
        
        const passwordHash = await bcrypt.hash(password, 10);

        // 1. Crear el Usuario (dueño) inicialmente sin tienda_id.
        // NOTA: Para que esto funcione, tienda_id en el modelo Usuario debe ser allowNull: true (como ya lo tienes).
        const nuevoUsuario = await Usuario.create({
            email,
            nombre,
            username,
            passwordHash,
            rol: 'admin', // El usuario inicial es siempre 'admin'
            // tienda_id se deja como NULL por ahora
        }, { transaction: t });

        // 2. Crear la Tienda y asociarla al nuevo Usuario.
        // Asignamos el nombre de la tienda y, opcionalmente, podríamos usar el usuario_id en la Tienda si fuera necesario.
        const nuevaTienda = await Tienda.create({
            nombre: `${nombre}'s Tienda`,

            // Puedes establecer otros valores predeterminados de la tienda aquí
        }, { transaction: t });
        
        // 3. ACTUALIZAR: Asignar el ID de la Tienda al Usuario.
        // Usamos el método update para modificar el registro de usuario creado en el paso 1.
        await nuevoUsuario.update({ 
            tienda_id: nuevaTienda.id 
        }, { transaction: t });

        // El objeto nuevoUsuario ahora tiene el tienda_id actualizado y es el que se retorna.
        nuevoUsuario.tienda_id = nuevaTienda.id;

        return nuevoUsuario;
    });
}


// Crear usuario adicional para una tienda existente
export async function crearUsuarioTiendaService(userData, tiendaId) {
    const { email, password, nombre, username, rol } = userData;

    // 1. Validar Límite de Usuarios
    const conteoUsuarios = await Usuario.count({
        where: { tienda_id: tiendaId }
    });
    
    // Si ya existen 3 o más usuarios (admin + 2 users), se bloquea
    if (conteoUsuarios >= LIMITE_USUARIOS) { 
        throw { 
            status: 400, 
            message: `Límite alcanzado: Una tienda solo puede tener ${LIMITE_USUARIOS} usuarios (incluyendo el Administrador).` 
        };
    }
    
    // 2. Validar que el nuevo rol sea 'user' o 'admin'
    const rolValido = rol === 'admin' || rol === 'user' ? rol : 'user';
    
    // 3. Crear el Usuario
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const nuevoUsuario = await Usuario.create({
        email,
        nombre,
        username,
        passwordHash,
        rol: rolValido,
        tienda_id: tiendaId // Asignar la ID de la tienda del usuario creador
    });

    return nuevoUsuario;
}


/**
 * Login usuario
 */
export async function loginUsuarioService({ username, password }) {
  if (!username || !password) throw { status: 400, message: 'Faltan username o password' };

  // Buscar usuario
  const usuario = await Usuario.findOne({ where: { username } });
  if (!usuario) throw { status: 404, message: 'Usuario no encontrado' };

  // Validar password
  const valido = await bcrypt.compare(password, usuario.passwordHash);
  if (!valido) throw { status: 401, message: 'Contraseña incorrecta' };

  // ------------------------------------
  //  QUITAR passwordHash del retorno 🔐
  // ------------------------------------
  const { passwordHash, ...usuarioSeguro } = usuario.dataValues;

  // Token
  const token = jwt.sign(
    {
      id: usuario.id,
      username: usuario.username,
      rol: usuario.rol,
      tienda_id: usuario.tienda_id
    },
    process.env.JWT_SECRET || 'secretkey',
    { expiresIn: '1d' }
  );

  return { usuario: usuarioSeguro, token };
}



/**
 * Listar todos los usuarios de la misma tienda
 */
export async function listarUsuariosService(tienda_id) {
  const usuarios = await Usuario.findAll({
    where: { tienda_id },
    attributes: ['id', 'nombre', 'email', 'username', 'rol', 'creado_en']
  });

  return { success: true, usuarios };
}


/**
 * Obtener perfil de usuario por ID
 */
export async function perfilUsuarioService(userId) {
  const usuario = await Usuario.findByPk(userId, {
    attributes: ['id', 'nombre', 'email', 'username', 'rol', 'creado_en']
  });

  if (!usuario) throw { status: 404, message: 'Usuario no encontrado' };
  return { success: true, usuario };
}


/**
 * Actualizar perfil de usuario (solo dentro de la misma tienda)
 */
export async function actualizarUsuarioService(userId, { nombre, email, password, rol }, tienda_id) {
  const usuario = await Usuario.findOne({ where: { id: userId, tienda_id } });
  if (!usuario) throw { status: 404, message: 'Usuario no encontrado en tu tienda' };

  if (nombre) usuario.nombre = nombre;
  if (email) usuario.email = email;
  if (password) usuario.passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  if (rol) usuario.rol = rol;

  await usuario.save();

  return { success: true, usuario };
}


/**
 * Eliminar usuario (solo dentro de la misma tienda)
 */
export async function eliminarUsuarioService(id, tienda_id, usuario_actual_id, password) {
    
    // 1. Buscar al usuario objetivo
    const usuarioAEliminar = await Usuario.findOne({ where: { id, tienda_id } });
    
    if (!usuarioAEliminar) {
        throw { status: 404, message: 'Usuario no encontrado en tu tienda' };
    }

    // 2. Verificar si es AUTO-ELIMINACIÓN
    // Comparamos como Strings para evitar errores de tipos (number vs string)
    const esAutoEliminacion = String(id) === String(usuario_actual_id);

    if (esAutoEliminacion) {
        // ✅ SOLUCIÓN DEL ERROR: Validar que exista password antes de llamar a bcrypt
        if (!password) {
            throw { status: 400, message: 'Se requiere contraseña para eliminar tu propia cuenta.' };
        }

        // Ahora es seguro llamar a compare porque sabemos que password tiene valor
        const passwordMatch = await bcrypt.compare(password, usuarioAEliminar.passwordHash);
        
        if (!passwordMatch) {
            throw { status: 401, message: 'Contraseña incorrecta. No se eliminó nada.' };
        }

        // --- Lógica de Admin borrando Tienda ---
        if (usuarioAEliminar.rol === 'admin') {
            return await sequelize.transaction(async (t) => {
                await usuarioAEliminar.destroy({ transaction: t });
                await Tienda.destroy({ where: { id: tienda_id }, transaction: t });
                return { success: true, message: 'Tu cuenta y la Tienda han sido eliminadas.' };
            });
        } else {
            // Usuario normal se auto-elimina
            await usuarioAEliminar.destroy();
            return { success: true, message: 'Tu cuenta ha sido eliminada.' };
        }

    } else {
        // 3. ELIMINACIÓN DE TERCEROS (Un admin borra a otro usuario)
        
        // Verificación de seguridad extra: Solo un admin puede borrar a otros
        // (Esto debería venir validado por middleware, pero por seguridad lo repetimos o asumimos rol)
        
        // Evitar borrar al último admin si no es auto-eliminación
        if (usuarioAEliminar.rol === 'admin') {
             const adminCount = await Usuario.count({ where: { tienda_id, rol: 'admin' } });
             if (adminCount <= 1) {
                 throw { status: 400, message: 'No puedes eliminar al único administrador (debes auto-eliminarte si quieres cerrar la tienda).' };
             }
        }

        // Aquí NO pedimos contraseña ni usamos bcrypt
        await usuarioAEliminar.destroy();
        return { success: true, message: 'Usuario eliminado correctamente por el administrador.' };
    }
}