import { Venta, DetalleVenta, Gasto } from '../models/index.js'
import sequelize from '../config/database.js'
import { Op } from 'sequelize'

/**
 * Calcular ganancias de un periodo
 * @param {Object} params
 * @param {Date|string} params.desde
 * @param {Date|string} params.hasta
 * @param {'todos'|'pagadas'|'pendientes'} params.tipoVentas
 * @param {number} params.tienda_id
 */
export async function calcularGananciasPeriodo({ desde, hasta, tipoVentas = 'pagadas', tienda_id }) {
  if (!tienda_id) throw { status: 400, message: 'Se requiere tienda_id' }

  const whereVenta = { tienda_id }
  if (desde) whereVenta.fecha = { [Op.gte]: new Date(desde) }
  if (hasta) whereVenta.fecha = { ...whereVenta.fecha, [Op.lte]: new Date(hasta) }
  if (tipoVentas === 'pagadas') whereVenta.estado = 'pagado'
  if (tipoVentas === 'pendientes') whereVenta.estado = 'pendiente'

  // Obtener ventas y detalle para calcular costo y ventas usando alias
  const ventas = await Venta.findAll({
    where: whereVenta,
    include: [{ model: DetalleVenta, as: 'detalleVentas' }]
  })

  let ingresos = 0
  let costo_ventas = 0
  for (const v of ventas) {
    ingresos += Number(v.total)
    for (const dv of v.detalleVentas) {
      costo_ventas += Number(dv.costo_unitario) * Number(dv.cantidad)
    }
  }

  // Gastos en periodo filtrando por tienda
  const gastos = await Gasto.findAll({
    where: {
      tienda_id,
      fecha: {
        [Op.between]: [
          desde ? new Date(desde) : new Date(0),
          hasta ? new Date(hasta) : new Date()
        ]
      }
    }
  })

  const total_gastos = gastos.reduce((s, g) => s + Number(g.monto), 0)

  const utilidad_bruta = Number((ingresos - costo_ventas).toFixed(2))
  const utilidad_neta = Number((utilidad_bruta - total_gastos).toFixed(2))

  return { ingresos, costo_ventas, total_gastos, utilidad_bruta, utilidad_neta }
}
