import * as tiendaService from '../service/tienda.service.js';

export const crearTienda = async (req, res) => {
  try {
    const result = await tiendaService.crearTiendaService(req.body);
    res.json(result);
    console.log(result);
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message || 'Error interno' });
  }
};

export const listarTiendas = async (req, res) => {
  try {
    const result = await tiendaService.listarTiendasService();
    res.json(result);
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message || 'Error interno' });
  }
};

export const obtenerTienda = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await tiendaService.obtenerTiendaService(id);
    res.json(result);
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message || 'Error interno' });
  }
};

export const actualizarTienda = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await tiendaService.actualizarTiendaService(id, req.body);
    res.json(result);
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message || 'Error interno' });
  }
};

export const eliminarTienda = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await tiendaService.eliminarTiendaService(id);
    res.json(result);
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message || 'Error interno' });
  }
};
