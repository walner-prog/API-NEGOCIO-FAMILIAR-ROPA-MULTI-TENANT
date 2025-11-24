import {
  Venta,
  DetalleVenta,
  Producto,
  Abono,
  Cliente
} from '../models/index.js'
import sequelize from '../config/database.js'

import {
  Op
} from 'sequelize';

/**
 payload = {
   cliente_id (requerido si tipo_pago = 'credito'),
   tipo_pago: 'contado'|'credito',
   items: [{ producto_id, cantidad, precio_unitario }],
   impuesto: number (opcional),
   usuario_id (opcional),
   abono_inicial: number (opcional),
   plazo_dias: number (opcional, requerido para crédito),
   numero_abonos: number (opcional, requerido para crédito)
 }
*/
 

export async function crearVentaService(payload, tienda_id, usuario_id) {
  if (!tienda_id) {
    throw { status: 401, message: 'ID de Tienda no proporcionado. Venta no autorizada.' };
  }
  if (!usuario_id) {
    throw { status: 401, message: 'ID de Usuario no proporcionado. Venta no autorizada.' };
  }

  const {
    items = [],
    tipo_pago = 'contado',
    cliente_id = null,
    impuesto = 0,
    abono_inicial = 0,
    plazo_dias = null,
    numero_abonos = null,
    
    // ⭐ Nuevos campos
    descuento_general = 0,
    motivo_descuento = null
  } = payload;

  if (!Array.isArray(items) || items.length === 0) {
    throw { status: 400, message: 'No hay items en la venta' };
  }

  //  Validación: motivo obligatorio si hay descuento
const hayDescuentos =
  Number(descuento_general) > 0 ||
  items.some(it => Number(it.descuento_item) > 0);

if (hayDescuentos && !motivo_descuento) {
  throw { status: 400, message: "El motivo del descuento es obligatorio" };
}


  if (tipo_pago === 'credito') {
    if (!cliente_id) throw { status: 400, message: 'Se requiere un cliente para ventas a crédito' };
    if (!plazo_dias || plazo_dias <= 0) throw { status: 400, message: 'Se debe especificar el plazo de crédito en días' };
    if (!numero_abonos || numero_abonos <= 0) throw { status: 400, message: 'Se debe especificar el número de abonos' };
  }

  return await sequelize.transaction(async (t) => {

    let subtotal = 0, costo_total = 0, utilidad_total = 0;
    const detalles = [];

    // =========================================================
    // 1. Validación de productos + descuentos por item
    // =========================================================
    for (const it of items) {

      const producto = await Producto.findOne({
        where: { id: it.producto_id, tienda_id },
        transaction: t,
        lock: t.LOCK.UPDATE
      });

      if (!producto) throw { status: 404, message: `Producto ID ${it.producto_id} no encontrado` };
      if (producto.stock < it.cantidad)
        throw { status: 400, message: `Stock insuficiente para ${producto.nombre}` };

      const precio_unitario = Number(it.precio_unitario ?? producto.precio_venta);

      // ⭐ Descuento por item
      const descuento_item = Number(it.descuento_item || 0);

      const subtotal_bruto = Number((precio_unitario * it.cantidad).toFixed(2));
      const subtotal_final = Number((subtotal_bruto - descuento_item).toFixed(2));

      const costo_item = Number((producto.precio_compra * it.cantidad).toFixed(2));
      const utilidad_real = subtotal_final - costo_item;

      subtotal += subtotal_final;
      costo_total += costo_item;
      utilidad_total += utilidad_real;

      detalles.push({
        producto,
        cantidad: it.cantidad,
        precio_unitario,
        descuento_item,
        subtotal_final,
        costo_item,
        utilidad_real
      });
    }

    // =========================================================
    // 2. Aplicar descuento general
    // =========================================================
    const descGeneralNum = Number(descuento_general || 0);

    if (descGeneralNum > subtotal) {
      throw { status: 400, message: "El descuento general excede el subtotal" };
    }

    const subtotal_con_descuento_general = Number(
      (subtotal - descGeneralNum).toFixed(2)
    );

    // =========================================================
    // 3. Impuesto + total final
    // =========================================================
    const impuesto_num = Number(impuesto || 0);
    const total_final = Number((subtotal_con_descuento_general + impuesto_num).toFixed(2));

    // =========================================================
    // 4. Crear Venta
    // =========================================================
    const venta = await Venta.create({
      cliente_id,
      tienda_id,

      subtotal,                     // subtotal sin descuentos del item
      descuento_general: descGeneralNum,
      total: subtotal_con_descuento_general, // total SIN impuesto
      impuesto: impuesto_num,
      total_final,                  // total + impuesto

      motivo_descuento,

      tipo_pago,
      estado: tipo_pago === 'contado' ? 'pagado' : 'pendiente',
      saldo_pendiente: tipo_pago === 'contado' ? 0 : total_final,
      utilidad_total,
      fecha: new Date(),
      usuario_id,
      plazo_dias,
      numero_abonos
    }, { transaction: t });

    // =========================================================
    // 5. Crear DetalleVenta y bajar stock
    // =========================================================
    for (const d of detalles) {
      await DetalleVenta.create({
        venta_id: venta.id,
        producto_id: d.producto.id,
        cantidad: d.cantidad,
        precio_unitario: d.precio_unitario,
        descuento_item: d.descuento_item,
        subtotal: d.subtotal_final,      // ⭐ ahora guarda subtotal final
        costo_unitario: d.producto.precio_compra,
        utilidad_real: d.utilidad_real,
        tienda_id
      }, { transaction: t });

      d.producto.stock -= d.cantidad;
      await d.producto.save({ transaction: t });
    }

    // =========================================================
    // 6. Abono inicial (si es crédito)
    // =========================================================
    if (tipo_pago === 'credito' && Number(abono_inicial) > 0) {

      const montoNum = Number(abono_inicial);

      if (montoNum > venta.saldo_pendiente)
        throw { status: 400, message: 'El abono inicial excede el saldo' };

      const nuevoSaldo = Number((venta.saldo_pendiente - montoNum).toFixed(2));

      await Abono.create({
        venta_id: venta.id,
        monto: montoNum,
        usuario_id,
        fecha: new Date(),
        tienda_id
      }, { transaction: t });

      venta.saldo_pendiente = nuevoSaldo;
      if (nuevoSaldo === 0) venta.estado = 'pagado';
      await venta.save({ transaction: t });
    }

    return { success: true, venta, utilidad_total };
  });
}




export async function listarVentasService(query = {}) {
  const where = {};

  if (query.tienda_id) where.tienda_id = query.tienda_id; // <- filtro por tienda
  if (query.cliente_id) where.cliente_id = query.cliente_id;
  if (query.estado) where.estado = query.estado;
  if (query.tipo_pago) where.tipo_pago = query.tipo_pago;

  // Filtrar por fecha
  let desde, hasta;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  desde = query.desde ? new Date(query.desde) : hoy;
  hasta = query.hasta ? new Date(query.hasta) : new Date();
  hasta.setHours(23, 59, 59, 999);

  where.fecha = {
    [Op.between]: [desde, hasta]
  };

  const ventas = await Venta.findAll({
    where,
    include: [{
        model: DetalleVenta,
        as: 'detalleVentas',
        include: [{
          model: Producto,
          as: 'producto',
          attributes: ['id', 'nombre', 'codigo_barras', 'marca']
        }]
      },
      {
        model: Abono,
        as: 'abonos'
      },
      {
        model: Cliente,
        as: 'cliente',
        attributes: ['id', 'nombre']
      } // incluir nombre del cliente
    ],
    order: [
      ['fecha', 'DESC']
    ]
  });

  return {
    success: true,
    ventas
  };
}




export async function eliminarVentaService(ventaId, tienda_id) {
return await sequelize.transaction(async (t) => {
const venta = await Venta.findOne({
where: { id: ventaId, tienda_id },
transaction: t,
  lock: t.LOCK.UPDATE
});


if (!venta) throw { status: 404, message: 'Venta no encontrada o no pertenece a la tienda' };
if (venta.estado === 'anulado') throw { status: 400, message: 'Venta ya está anulada' };

// Obtener detalles de la venta
const detalles = await DetalleVenta.findAll({
  where: { venta_id: venta.id },
  transaction: t
});

// Devolver stock de los productos
for (const d of detalles) {
  const producto = await Producto.findByPk(d.producto_id, { transaction: t });
  if (producto) {
    producto.stock += d.cantidad;
    await producto.save({ transaction: t });
  }
}

// Eliminar abonos asociados
await Abono.destroy({ where: { venta_id: venta.id }, transaction: t });

// Eliminar detalles de venta
await DetalleVenta.destroy({ where: { venta_id: venta.id }, transaction: t });

// Anular la venta
venta.estado = 'anulado';
venta.saldo_pendiente = 0;
await venta.save({ transaction: t });

return { success: true, message: 'Venta anulada correctamente', venta };


});
}



/**
 * Registrar un abono para ventas a crédito
 */
export async function registrarAbonoService(ventaId, { monto, usuario_id }, tienda_id) {
    // Nota: El parámetro usuario_id se está recibiendo dentro del objeto desestructurado.
    // Asumimos que el controlador lo inyectó desde req.usuario.
    
    // 1. Validaciones iniciales
    if (!monto || Number(monto) <= 0) 
        throw { status: 400, message: 'Monto inválido' };
    
    // 💡 Validación de seguridad que ahora es necesaria
    if (!tienda_id)
        throw { status: 401, message: 'ID de Tienda no proporcionado.' };

    return await sequelize.transaction(async (t) => {
        
        // 2. Buscar Venta y Validaciones de Seguridad (usando tienda_id)
        const venta = await Venta.findOne({
    where: { id: ventaId, tienda_id },
    transaction: t,
    lock: t.LOCK.UPDATE
});


        if (!venta) 
            throw { status: 404, message: 'Venta no encontrada o no pertenece a la tienda' };
        if (venta.estado === 'anulado') 
            throw { status: 400, message: 'Venta anulada' };
        if (venta.tipo_pago !== 'credito') 
            throw { status: 400, message: 'Venta no es a crédito' };

        // Número de abonos registrados
        const abonosRegistrados = await Abono.count({ where: { venta_id: venta.id }, transaction: t });
        let alertaMaxAbonos = null;
        if (venta.numero_abonos && abonosRegistrados >= venta.numero_abonos) {
            alertaMaxAbonos = 'Se alcanzó el número máximo de abonos, pero se permite registrar uno más.';
        }

        const montoNum = Number(monto);
        const nuevoSaldo = Number((Number(venta.saldo_pendiente) - montoNum).toFixed(2));
        if (nuevoSaldo < 0) 
            throw { status: 400, message: 'El abono excede el saldo pendiente' };

        // 3. Crear abono (CORRECCIÓN: Incluir tienda_id)
        const abono = await Abono.create({
            venta_id: venta.id,
            monto: montoNum,
            usuario_id,
            fecha: new Date(),
            tienda_id // ✅ CORREGIDO: Añadir tienda_id
        }, { transaction: t });

        // 4. Actualizar Venta
        venta.saldo_pendiente = nuevoSaldo;
        if (nuevoSaldo === 0) venta.estado = 'pagado';
        await venta.save({ transaction: t });

        return { success: true, abono, venta, alertaMaxAbonos };
    });
}




/**
 *  Listar ventas a crédito por cliente
 * @param {
 * } clienteId 
 * @returns 
 */

export async function listarVentasPorClienteService(clienteId, tienda_id) { // <-- Se recibe clienteId
  const ventas = await Venta.findAll({
    where: {
      cliente_id: clienteId, // ✅ CORREGIDO: Usar clienteId
      tipo_pago: 'credito',
      tienda_id // <- filtro por tienda
    },
    include: [{
        model: DetalleVenta,
        as: 'detalleVentas',
        include: [{
          model: Producto,
          as: 'producto'
        }]
      },
      {
        model: Abono,
        as: 'abonos'
      }
    ],
    order: [
      ['fecha', 'DESC']
    ]
  });

  return ventas.map(v => ({
    id: v.id,
    total: parseFloat(v.total),
    saldo_pendiente: parseFloat(v.saldo_pendiente),
    fecha: v.fecha,
    numero_abonos: v.numero_abonos,
    plazo_dias: v.plazo_dias,
    estado: v.estado,
    productos: v.detalleVentas.map(d => ({
      id: d.id,
      nombre: d.producto?.nombre,
      cantidad: d.cantidad,
      precio: d.precio_unitario,
      marca: d.producto?.marca
    })),
    abonos: v.abonos.map(a => ({
      id: a.id,
      monto: parseFloat(a.monto),
      fecha: a.fecha
    }))
  }));
}

/**
 *  Obtener detalle de una venta
 * @param {
 * } ventaId 
 * @returns 
 */
export async function obtenerDetalleVentaService(ventaId, tienda_id) {
const venta = await Venta.findOne({
where: { id: ventaId, tienda_id },
include: [
{
model: DetalleVenta,
as: 'detalleVentas',
include: [{ model: Producto, as: 'producto' }]
},
{ model: Abono, as: 'abonos' },
{ model: Cliente, as: 'cliente' }
]
});

if (!venta) throw { status: 404, message: "Venta no encontrada o no pertenece a la tienda" };

return {
id: venta.id,
total: parseFloat(venta.total),
saldo_pendiente: parseFloat(venta.saldo_pendiente),
fecha: venta.fecha,
cliente: venta.cliente?.nombre,

productos: venta.detalleVentas.map(d => ({
  id: d.id,
  nombre: d.producto?.nombre,
  cantidad: d.cantidad,
  precio: parseFloat(d.precio_unitario),
  marca: d.producto?.marca
})),

abonos: venta.abonos.map(a => ({
  id: a.id,
  monto: parseFloat(a.monto),
  fecha: a.fecha
}))


};
}
