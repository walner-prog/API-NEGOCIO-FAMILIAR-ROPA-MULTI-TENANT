import * as gastoService from '../service/gasto.service.js'

/**
 * Registrar gasto
 */
export const registrarGasto = async (req, res) => {
  try {
    const payload = { ...req.body, tienda_id: req.usuario.tienda_id }
    const result = await gastoService.registrarGastoService(payload)
    res.json(result)
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message || 'Error interno' })
  }
}

/**
 * Listar todos los gastos de la tienda
 */
export const listarGastos = async (req, res) => {
  try {
    const result = await gastoService.listarGastosService(req.query.tienda_id)
    res.json(result)
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message || 'Error interno' })
  }
}

/**
 * Eliminar un gasto de la tienda
 */
export const eliminarGasto = async (req, res) => {
  try {
    const { id } = req.params
    const result = await gastoService.eliminarGastoService(id, req.usuario.tienda_id)
    res.json(result)
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message || 'Error interno' })
  }
}
