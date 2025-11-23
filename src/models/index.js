import sequelize from '../config/database.js'
import Tienda from './Tienda.js'
import Cliente from './Cliente.js'
import Producto from './Producto.js'
import Venta from './Venta.js'
import DetalleVenta from './DetalleVenta.js'
import Gasto from './Gasto.js'
import Abono from './Abono.js'
import Usuario from './Usuario.js'
import Talla from './Talla.js'

// ===============================
//       RELACIONES TIENDA
// ===============================

// Una tienda tiene muchos usuarios
Tienda.hasMany(Usuario, { foreignKey: 'tienda_id', as: 'usuarios' })
Usuario.belongsTo(Tienda, { foreignKey: 'tienda_id', as: 'tienda' })

// Una tienda tiene muchos clientes
Tienda.hasMany(Cliente, { foreignKey: 'tienda_id', as: 'clientes' })
Cliente.belongsTo(Tienda, { foreignKey: 'tienda_id', as: 'tienda' })

// Una tienda tiene muchos productos
Tienda.hasMany(Producto, { foreignKey: 'tienda_id', as: 'productos' })
Producto.belongsTo(Tienda, { foreignKey: 'tienda_id', as: 'tienda' })

// Una tienda tiene muchas ventas
Tienda.hasMany(Venta, { foreignKey: 'tienda_id', as: 'ventas' })
Venta.belongsTo(Tienda, { foreignKey: 'tienda_id', as: 'tienda' })

// Una tienda tiene muchos detalles de venta (por si acaso)
Tienda.hasMany(DetalleVenta, { foreignKey: 'tienda_id', as: 'detalleVentas' })
DetalleVenta.belongsTo(Tienda, { foreignKey: 'tienda_id', as: 'tienda' })

// Gastos
Tienda.hasMany(Gasto, { foreignKey: 'tienda_id', as: 'gastos' })
Gasto.belongsTo(Tienda, { foreignKey: 'tienda_id', as: 'tienda' })

// Abonos
Tienda.hasMany(Abono, { foreignKey: 'tienda_id', as: 'abonos' })
Abono.belongsTo(Tienda, { foreignKey: 'tienda_id', as: 'tienda' })

// ===============================
//        RELACIONES EXISTENTES
// ===============================

// Cliente → Ventas
Cliente.hasMany(Venta, { foreignKey: 'cliente_id', as: 'ventas' })
Venta.belongsTo(Cliente, { foreignKey: 'cliente_id', as: 'cliente' })

// Venta → Detalles
Venta.hasMany(DetalleVenta, { foreignKey: 'venta_id', as: 'detalleVentas' })
DetalleVenta.belongsTo(Venta, { foreignKey: 'venta_id' })

// Producto → Detalles
Producto.hasMany(DetalleVenta, { foreignKey: 'producto_id', as: 'detalleVentas' })
DetalleVenta.belongsTo(Producto, { foreignKey: 'producto_id', as: 'producto' })

// Venta → Abonos
Venta.hasMany(Abono, { foreignKey: 'venta_id', as: 'abonos' })
Abono.belongsTo(Venta, { foreignKey: 'venta_id' })


// Relación Producto ↔ Talla
Producto.belongsTo(Talla, { foreignKey: 'talla_id', as: 'talla' });
Talla.hasMany(Producto, { foreignKey: 'talla_id', as: 'productos' });

export {
  sequelize,
  Tienda,
  Cliente,
  Producto,
  Venta,
  DetalleVenta,
  Gasto,
  Abono,
  Usuario,
  Talla
}
