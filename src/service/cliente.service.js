import { Op } from 'sequelize';
import { Cliente, Venta, DetalleVenta, Producto, Abono } from '../models/index.js';

/**
 * Crear cliente
 * @param {Object} data - { nombre, telefono, direccion, nit }
 * @param {Number} tienda_id - tienda del usuario logueado
 */
export async function crearClienteService(data, tienda_id) {
  if (!data.nombre) throw { status: 400, message: 'El nombre es obligatorio' };

  const cliente = await Cliente.create({
    ...data,
    tienda_id
  });

  return { success: true, cliente };
}

/**
 * Listar clientes de la tienda
 */
export async function listarClientesService(tienda_id) {
  if (!tienda_id) throw { status: 400, message: 'Tienda_id no proporcionado' };

  const clientes = await Cliente.findAll({ 
    where: { tienda_id },
    order: [['id', 'ASC']] 
  });

  return { success: true, clientes };
}


/**
 * Obtener cliente por ID (solo si pertenece a la tienda)
 */
export async function obtenerClienteService(id, tienda_id) {
  const cliente = await Cliente.findOne({ where: { id, tienda_id } });
  if (!cliente) throw { status: 404, message: 'Cliente no encontrado' };
  return { success: true, cliente };
}

/**
 * Eliminar cliente (solo si pertenece a la tienda)
 */
export async function eliminarClienteService(id, tienda_id) {
  const cliente = await Cliente.findOne({ where: { id, tienda_id } });
  
  if (!cliente) {
    // Si no se encuentra el cliente
    throw { status: 404, message: 'Cliente no encontrado' };
  }

  // 1. Verificar si el cliente tiene ventas
  const ventas = await Venta.findAll({ where: { cliente_id: id, tienda_id } });
  
  if (ventas.length > 0) {
    // 2. Si tiene ventas, LANZAR EL ERROR y TERMINAR AQUÍ.
    throw { 
      status: 400, 
      message: 'No se puede eliminar: el cliente tiene ventas registradas' 
    };
  }

  // 3. Si no tiene ventas, proceder con la eliminación suave (soft delete).
  await cliente.destroy(); // soft delete (si el modelo tiene paranoid: true)
  
  return { success: true, message: 'Cliente eliminado correctamente', clienteId: id };
}

/**
 * Listar clientes con ventas a crédito (solo de la tienda)
 * @param {Object} query - { estado, desde, hasta, page, tienda_id }
 */
export async function listarClientesCreditoService(query = {}) {
  const { estado, desde, hasta, page = 1, tienda_id } = query;
  const limit = 500;
  const offset = (page - 1) * limit;

  // ----------------------------------------------------
  // 💡 CAMBIO CLAVE: Definir el objeto de filtro de fechas
  // ----------------------------------------------------
  let filtroFecha = {};

  if (desde || hasta) {
    const fechaDesde = desde ? new Date(desde) : null;
      // Si hay 'hasta', la fecha final es el final de ese día. Si solo hay 'desde',
      // se usa el final del día actual como límite superior por defecto.
    const fechaHasta = hasta 
      ? new Date(new Date(hasta).setHours(23, 59, 59, 999)) 
      : new Date(new Date().setHours(23, 59, 59, 999));

    if (fechaDesde && fechaHasta) {
      filtroFecha = { [Op.between]: [fechaDesde, fechaHasta] };
    } else if (fechaDesde) {
      filtroFecha = { [Op.gte]: fechaDesde }; // Mayor o igual que 'desde'
    } else if (fechaHasta) {
      filtroFecha = { [Op.lte]: fechaHasta }; // Menor o igual que 'hasta'
    }
  }
  // ----------------------------------------------------

  const ventasCredito = await Venta.findAll({
    where: {
      tipo_pago: 'credito',
      tienda_id,
      ...(estado && { estado }),
      // 💡 CAMBIO CLAVE: Aplicar el filtro de fecha solo si existe
      ...(Object.keys(filtroFecha).length > 0 && { fecha: filtroFecha })
      // O en caso de que siempre sea un rango, simplificar:
      // ...((desde || hasta) && { fecha: { [Op.between]: [fechaDesde, fechaHasta] } })
    },
    include: [
      { model: Cliente, as: 'cliente' },
      { 
        model: DetalleVenta, 
        as: 'detalleVentas',
        include: [
          { model: Producto, as: 'producto', attributes: ['id','nombre','codigo_barras'] }
        ]
      },
      { model: Abono, as: 'abonos' }
    ],
    order: [['fecha', 'DESC']],
    limit,
    offset
  });

  // ... (el resto del código de mapeo de clientes es correcto y se mantiene igual)

  const clientesMap = new Map();
  let totalSaldoPendiente = 0;

  for (const venta of ventasCredito) {
    const clienteId = venta.cliente_id;
    if (!clientesMap.has(clienteId)) {
      clientesMap.set(clienteId, {
        cliente_id: clienteId,
        nombre: venta.cliente?.nombre || 'Sin nombre',
        total_credito: 0,
        ventas: []
      });
    }

    const clienteData = clientesMap.get(clienteId);
    clienteData.ventas.push({
      id: venta.id,
      subtotal: parseFloat(venta.subtotal),
      total: parseFloat(venta.total),
      saldo_pendiente: parseFloat(venta.saldo_pendiente),
      estado: venta.estado,
      fecha: venta.fecha,
      plazo_dias: venta.plazo_dias,
      numero_abonos: venta.numero_abonos,
      detalles: venta.detalleVentas.map(d => ({
        producto_id: d.producto_id,
        nombre_producto: d.producto?.nombre || '',
        codigo_barras: d.producto?.codigo_barras || '',
        cantidad: d.cantidad,
        precio_unitario: parseFloat(d.precio_unitario),
        costo_unitario: parseFloat(d.costo_unitario),
        subtotal: parseFloat(d.subtotal),
        utilidad_real: parseFloat(d.utilidad_real)
      })),
      abonos: venta.abonos.map(a => ({
        id: a.id,
        monto: parseFloat(a.monto),
        usuario_id: a.usuario_id,
        fecha: a.fecha
      }))
    });

    clienteData.total_credito += parseFloat(venta.saldo_pendiente);
    totalSaldoPendiente += parseFloat(venta.saldo_pendiente);
  }

  const clientes = Array.from(clientesMap.values());
  const totalClientes = clientes.length;

  return {
    success: true,
    clientes,
    totalClientes,
    totalSaldoPendiente
  };
}


/**
 * Clientes con ventas a crédito y saldo pendiente > 0 (solo tienda)
 */
export async function listarClientesConDeudaService(tienda_id) {
  const clientes = await Cliente.findAll({
    where: { tienda_id },
    attributes: ["id", "nombre", "telefono", "direccion"],
    include: [
      {
        model: Venta,
        as: "ventas",
        where: {
          tipo_pago: "credito",
          estado: { [Op.ne]: "anulado" },
          saldo_pendiente: { [Op.gt]: 0 },
          tienda_id
        },
        required: true
      }
    ],
    order: [["nombre", "ASC"]]
  });

  return clientes;
}
