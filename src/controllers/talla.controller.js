// controllers/talla.controller.js
import * as tallaService from '../service/talla.service.js';

/**
 * Crear talla
 */
export const crearTalla = async (req, res) => {
  try {
    const payload = { ...req.body, tienda_id: req.usuario.tienda_id };
    const result = await tallaService.crearTallaService(payload);
    res.json(result);
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message || 'Error interno' });
  }
};

/**
 * Listar tallas
 */
export const listarTallas = async (req, res) => {
  try {
    const result = await tallaService.listarTallasService(req.usuario.tienda_id);
    res.json(result);
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message || 'Error interno' });
  }
};

/**
 * Eliminar talla
 */
export const eliminarTalla = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await tallaService.eliminarTallaService(id, req.usuario.tienda_id);
    res.json(result);
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message || 'Error interno' });
  }
};
