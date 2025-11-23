import Gasto from '../models/Gasto.js'
import sequelize from '../config/database.js'

/**
 * Registrar gasto
 * @param { descripcion, monto, categoria, usuario_id, tienda_id } payload
 */
export async function registrarGastoService({ descripcion, monto, categoria = null, usuario_id = null, tienda_id }) {
  if (!descripcion || !monto) throw { status: 400, message: 'Descripción y monto son requeridos' }
  if (!tienda_id) throw { status: 400, message: 'Tienda inválida' }

  const gasto = await Gasto.create({
    descripcion,
    monto,
    categoria,
    usuario_id,
    tienda_id,
    fecha: new Date()
  })

  return { success: true, gasto }
}

/**
 * Listar gastos de una tienda
 * @param { tienda_id } tienda
 */
export async function listarGastosService(tienda_id) {
  if (!tienda_id) throw { status: 400, message: 'Tienda inválida' }

  const gastos = await Gasto.findAll({
    where: { tienda_id },
    order: [['fecha', 'DESC']]
  })

  return { success: true, gastos }
}

/**
 * Eliminar un gasto (soft delete)
 * @param { gastoId, tienda_id } payload
 */
// En tu gasto.service.js

export async function eliminarGastoService(gastoId, tienda_id) {
    if (!tienda_id) throw { status: 400, message: 'Tienda inválida' }

    // Añade esto temporalmente:
    console.log(`Intentando eliminar gasto: ${gastoId} para tienda: ${tienda_id}`);

    const gasto = await Gasto.findOne({ where: { id: gastoId, tienda_id } })
    if (!gasto) throw { status: 404, message: 'Gasto no encontrado' }

    await gasto.destroy()

    return { success: true, message: 'Gasto eliminado correctamente' }
}
