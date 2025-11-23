import Producto from '../models/Producto.js';
import Talla from '../models/Talla.js';
/**
 * Crear producto
 * @param {Object} data - { codigo_barras, nombre, marca, precio_compra, precio_venta, stock }
 * @param {Number} tienda_id - tienda del usuario logueado
 */
export async function crearProductoService(data, tienda_id) {
  let { codigo_barras, nombre, marca, precio_compra, precio_venta, stock, talla_id } = data;

  // Generar código único si no se envía
 if (!codigo_barras || codigo_barras.trim() === '') {
  // Genera un código tipo "PROD-20251121-837"
  codigo_barras = `PROD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}


 
  // Verificar duplicado
  const existe = await Producto.findOne({ where: { codigo_barras, tienda_id } });
  if (existe) throw { status: 409, message: 'Producto con ese código ya existe' };

  // Crear producto
  const producto = await Producto.create({
    codigo_barras,
    nombre,
    marca,
    precio_compra,
    precio_venta,
    stock,
    talla_id,
    tienda_id
  });
 
  
  return { success: true, producto };

}

/**
 * Actualizar producto (solo si pertenece a la tienda)
 * @param {Number} id - id del producto
 * @param {Object} payload - campos a actualizar
 * @param {Number} tienda_id - tienda del usuario logueado
 */
 
export async function actualizarProductoService(id, payload, tienda_id) {
  const producto = await Producto.findOne({ where: { id, tienda_id } });
  if (!producto) throw { status: 404, message: 'Producto no encontrado en tu tienda' };

  // Generar un código único si está vacío
  if (!payload.codigo_barras || !payload.codigo_barras.trim()) {
    let codigoUnico;
    let existe = true;

    // Reintentos hasta encontrar un código que no exista
    while (existe) {
      codigoUnico = `PROD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const productoExistente = await Producto.findOne({
        where: { codigo_barras: codigoUnico, tienda_id }
      });
      if (!productoExistente) existe = false;
    }

    payload.codigo_barras = codigoUnico;
  } else {
    // Validar que el código que envió el usuario no esté duplicado
    const duplicado = await Producto.findOne({
      where: { codigo_barras: payload.codigo_barras, tienda_id, id: { $ne: id } }
    });
    if (duplicado) throw { status: 409, message: 'Ya existe otro producto con ese código de barras' };
  }

  await producto.update(payload);
  return { success: true, producto };
}



/**
 * Listar productos de la tienda
 * @param {Number} tienda_id - tienda del usuario logueado
 */
 

export async function listarProductosService(tienda_id) {
  const productos = await Producto.findAll({
    where: { tienda_id },
    order: [['id','ASC']],
    include: [
      {
        model: Talla,
        as: 'talla',
        attributes: ['id', 'nombre'] // Trae solo id y nombre de la talla
      }
    ]
  });

  return { success: true, productos };
}

