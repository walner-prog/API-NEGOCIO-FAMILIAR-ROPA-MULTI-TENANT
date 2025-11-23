import * as clienteService from '../service/cliente.service.js';

/**
 * Crear cliente
 */
export const crearCliente = async (req, res) => {
  try {
    const result = await clienteService.crearClienteService(req.body, req.usuario.tienda_id);
    res.json(result);
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message || 'Error interno' });
  }
};


/**
 * Listar todos los clientes de la tienda
 */
export const listarClientes = async (req, res) => {
  try {
    const tienda_id = req.query.tienda_id; // <-- usar query en vez de req.usuario
    if (!tienda_id) throw { status: 400, message: 'Tienda_id no proporcionado' };

    const result = await clienteService.listarClientesService(Number(tienda_id));
    res.json({ success: true, clientes: result.clientes });
  } catch (error) {
    console.error(error);
    res.status(error.status || 500).json({ success: false, clientes: [], message: error.message || 'Error interno' });
  }
};




/**
 * Obtener un cliente por ID (solo si pertenece a la tienda)
 */
export const obtenerCliente = async (req, res) => {
  try {
    const result = await clienteService.obtenerClienteService(req.params.id, req.query.tienda_id);
    res.json(result);
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message || 'Error interno' });
  }
};


/**
 * Eliminar cliente (solo de la tienda)
 */
export const eliminarCliente = async (req, res) => {
  try {
    // 1. Extraer ID del cliente y tienda
    const clienteId = req.params.id;
    const tiendaId = req.usuario.tienda_id; 

    // 2. Validar credenciales mínimas de seguridad
    if (!tiendaId) {
       return res.status(401).json({ success: false, message: 'ID de Tienda no encontrado. Acceso no autorizado.' });
    }

    // 3. Llamada al servicio (manejo de soft delete y validación de ventas)
    const result = await clienteService.eliminarClienteService(clienteId, tiendaId);
    
    // 4. Respuesta exitosa (HTTP 200 OK)
    res.json(result); 
    
  } catch (error) {
    // 5. Manejo de Errores
    // Captura errores del servicio (404 si no existe, 400 si tiene ventas)
    
    const status = error.status || 500;
    const message = error.message || 'Error interno del servidor al eliminar cliente.';

    // Devolver el error al cliente con el status correcto
    res.status(status).json({ success: false, message });
  }
};

/**
 * Listar clientes con ventas al crédito
 */
export async function listarClientesCreditoController(req, res) {
  try {
    const { estado, desde, hasta, page } = req.query;

    const result = await clienteService.listarClientesCreditoService({
      estado,
      desde,
      hasta,
      page: parseInt(page) || 1,
      tienda_id: req.usuario.tienda_id
    });

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Error al listar clientes con crédito'
    });
  }
}


/**
 * Listar clientes que tienen deuda pendiente para abonos
 */
export async function listarClientesConDeudaController(req, res) {
  try {
    const clientes = await clienteService.listarClientesConDeudaService(req.usuario.tienda_id);

    return res.json({
      success: true,
      clientes
    });

  } catch (error) {
    console.error("Error al obtener clientes con deuda:", error);
    return res.status(500).json({
      success: false,
      message: "Error al obtener clientes con deuda"
    });
  }
}
