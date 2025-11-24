import * as ventaService from '../service/venta.service.js'

/**
 * Crear venta
 */
// En tu archivo de controladores de venta (ej: venta.controller.js)

export const crearVenta = async (req, res) => {
  try {
    // 1. OBTENER ID DEL USUARIO Y LA TIENDA DEL TOKEN/SESIÓN
    // Asumiendo que tu middleware de autenticación adjunta estos datos a req.usuario
    const tiendaId = req.usuario.tienda_id; 
    const usuarioId = req.usuario.id;       
    
    // 2. VALIDACIÓN DE CREDENCIALES
    if (!tiendaId || !usuarioId) {
       return res.status(401).json({ 
          success: false, 
          message: 'Faltan credenciales de autenticación (Tienda ID o Usuario ID). Venta no autorizada.' 
       });
    }
    
    // 3. LLAMADA AL SERVICIO
    // El payload (items, cliente_id, tipo_pago, etc.) viene en req.body
    const payload = { ...req.body };

    

    // Se pasan tres argumentos: el cuerpo de la petición, el ID de la tienda y el ID del usuario.
    const result = await ventaService.crearVentaService(payload, tiendaId, usuarioId); 
    
    res.status(201).json(result); // Usamos 201 Created para una creación exitosa
  } catch (error) {
    // Manejo de errores de validación (400, 404) o errores internos (500) del servicio.
    console.error('Error al crear venta:', error);
    res.status(error.status || 500).json({ 
      success: false, 
      message: error.message || 'Error interno del servidor al procesar la venta.' 
    });
  }
}

/**
 * Registrar abono
 */
export const registrarAbono = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.usuario.id; // Asumimos que también quieres el usuario_id de forma segura
    const tiendaId = req.usuario.tienda_id;
    
    if (!tiendaId) {
       return res.status(401).json({ success: false, message: 'ID de Tienda no encontrado en el token.' });
    }

    // El payload solo necesita el monto (y opcionalmente el usuario_id si no viene del token)
    const payload = { ...req.body, usuario_id: usuarioId }; // Añadimos usuario_id aquí
    
    // Pasa los tres argumentos requeridos
    const result = await ventaService.registrarAbonoService(id, payload, tiendaId); 
    
    res.json(result);
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message || 'Error interno' });
  }
}
/**
 * Listar ventas
 */
export const listarVentas = async (req, res) => {
  try {
    const query = { ...req.query, tienda_id: req.query.tienda_id } // filtro por tienda
    const result = await ventaService.listarVentasService(query)
    res.json(result)
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message || 'Error interno' })
  }
}

/**
 * Eliminar venta
 */
export const eliminarVenta = async (req, res) => {
  try {
    const { id } = req.params
    const result = await ventaService.eliminarVentaService(id, req.usuario.tienda_id)
    res.json(result)
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message || 'Error interno' })
  }
}

/**
 * Listar ventas por cliente
 */
export async function listarVentasPorClienteController(req, res) {
  try {
    const { id } = req.params
    const ventas = await ventaService.listarVentasPorClienteService(id, req.query.tienda_id)
    res.json({ success: true, ventas })
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message || 'Error interno' })
  }
}

/**
 * Obtener detalle de una venta
 */
export async function obtenerDetalleVentaController(req, res) {
  try {
    const { id } = req.params
    const venta = await ventaService.obtenerDetalleVentaService(id, req.query.tienda_id)
    res.json({ success: true, venta })
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message || 'Error interno' })
  }
}
