import * as productoService from '../service/producto.service.js';

/**
 * Crear producto
 */
export const crearProducto = async (req, res) => {
  try {
    const result = await productoService.crearProductoService(req.body, req.usuario.tienda_id);
    res.json(result);
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message || 'Error interno' });
  }
};

/**
 * Listar productos de la tienda
 */
export const listarProductos = async (req, res) => {
  try {
    const result = await productoService.listarProductosService(req.query.tienda_id);
    res.json(result);
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message || 'Error interno' });
  }
};

/**
 * Actualizar producto (solo de la misma tienda)
 */
export const actualizarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await productoService.actualizarProductoService(id, req.body, req.usuario.tienda_id);
    res.json(result);
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message || 'Error interno' });
  }
};
