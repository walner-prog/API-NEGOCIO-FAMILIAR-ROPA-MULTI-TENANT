// service/talla.service.js
import Talla from '../models/Talla.js';

/**
 * Crear una nueva talla para la tienda
 */
export async function crearTallaService({ nombre, tienda_id }) {
  if (!nombre) throw { status: 400, message: 'Nombre de la talla es requerido' };
  if (!tienda_id) throw { status: 400, message: 'Tienda inválida' };

  const talla = await Talla.create({ nombre, tienda_id });
  return { success: true, talla };
}

/**
 * Listar tallas de la tienda
 */
export async function listarTallasService(tienda_id) {
  if (!tienda_id) throw { status: 400, message: 'Tienda inválida' };

  const tallas = await Talla.findAll({
    where: { tienda_id },
    order: [['nombre', 'ASC']]
  });

  return { success: true, tallas };
}

/**
 * Eliminar talla
 */
export async function eliminarTallaService(id, tienda_id) {
  const talla = await Talla.findOne({ where: { id, tienda_id } });
  if (!talla) throw { status: 404, message: 'Talla no encontrada' };

  await talla.destroy();
  return { success: true, message: 'Talla eliminada' };
}
