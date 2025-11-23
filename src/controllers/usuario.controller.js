import * as usuarioService from '../service/usuario.service.js';

/**
 * Registrar usuario
 */
export const registrarUsuario = async (req, res) => {
  try {
    const usuario = await usuarioService.registerUsuarioService(req.body, req.usuario);
    res.json({ success: true, usuario });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Error interno'
    });
  }
};


// Este controlador es para crear usuarios ADICIONALES (que ya tienen una tienda_id)
export const crearUsuarioTienda = async (req, res) => {
  try {
    // La tienda_id del usuario que está creando al nuevo usuario
    const tienda_id_creador = req.usuario.tienda_id;

    if (!tienda_id_creador) {
       // Un usuario sin tienda_id no debería poder crear otros usuarios internos
       throw { status: 403, message: 'Acceso denegado: El usuario no está ligado a una tienda.' };
    }

    // Llama a un nuevo servicio para manejar la creación y la limitación de usuarios
    const nuevoUsuario = await usuarioService.crearUsuarioTiendaService(
      req.body,
      tienda_id_creador
    );

    res.status(201).json({ success: true, usuario: nuevoUsuario, message: 'Usuario creado exitosamente.' });

  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Error interno al crear el usuario'
    });
  }
};


/**
 * Login
 */
export async function loginUsuario(req, res) {
  try {
    const { usuario, token } = await usuarioService.loginUsuarioService(req.body);
    res.json({ success: true, usuario, token });
  } catch (error) {
    res.status(error.status || 500).json({ 
      success: false, 
      message: error.message || 'Error interno' 
    });
  }
}


/**
 * Listar usuarios de la misma tienda
 */
export const listarUsuarios = async (req, res) => {
  try {
    const tienda_id = req.usuario.tienda_id;

    const data = await usuarioService.listarUsuariosService(tienda_id);
    res.json(data);

  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Error interno'
    });
  }
};


/**
 * Actualizar usuario
 */
export async function actualizarUsuario(req, res) {
  try {
    const { id } = req.params;
    const tienda_id = req.usuario.tienda_id;

    const data = await usuarioService.actualizarUsuarioService(id, req.body, tienda_id);
    res.json(data);

  } catch (err) {
    console.error(err);
    res.status(err.status || 500).json({ 
      success: false, 
      message: err.message || 'Error al actualizar usuario' 
    });
  }
}



/**
 * Eliminar usuario
 */
// Controlador: eliminarUsuario
export async function eliminarUsuario(req, res) {
  try {
    const { id } = req.params;
    const { password } = req.body; // <-- Obtener la contraseña
    
    const tienda_id = req.usuario.tienda_id;
    const usuario_actual_id = req.usuario.id;

    const data = await usuarioService.eliminarUsuarioService(id, tienda_id, usuario_actual_id, password);
    
    // Si la eliminación fue exitosa, el backend podría enviar un token de expiración o simplemente la respuesta
    res.json(data);

  } catch (err) {
    console.error(err);
    return res
      .status(err.status || 500)
      .json({ success: false, message: err.message || "Error al eliminar usuario" });
  }
}

/**
 * Perfil del usuario autenticado
 */
export async function perfilUsuario(req, res) {
  try {
    const id = req.usuario.id;

    const data = await usuarioService.perfilUsuarioService(id);
    res.json(data);

  } catch (err) {
    console.error(err);
    res.status(err.status || 500).json({ 
      success: false, 
      message: err.message || 'Error al obtener perfil' 
    });
  }
}
