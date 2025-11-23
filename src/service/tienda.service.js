import Tienda from '../models/Tienda.js';
import sequelize from '../config/database.js';

export async function crearTiendaService(payload) {
  const { nombre, descripcion, telefono, direccion, moneda = 'NIO', plan = 'free' } = payload;
  if (!nombre) throw { status: 400, message: 'El nombre de la tienda es requerido' };

  const tienda = await Tienda.create({
    nombre,
    descripcion,
    telefono,
    direccion,
    moneda,
    plan,
    
  });

  return { success: true, tienda };
}

export async function listarTiendasService() {
  const tiendas = await Tienda.findAll({ order: [['createdAt', 'DESC']] });
  return { success: true, tiendas };
}

export async function obtenerTiendaService(id) {
  const tienda = await Tienda.findByPk(id);
  if (!tienda) throw { status: 404, message: 'Tienda no encontrada' };
  return { success: true, tienda };
}

export async function actualizarTiendaService(id, payload) {
  const tienda = await Tienda.findByPk(id);
  if (!tienda) throw { status: 404, message: 'Tienda no encontrada' };

  await tienda.update(payload);
  return { success: true, tienda };
}

export async function eliminarTiendaService(id) {
  const tienda = await Tienda.findByPk(id);
  if (!tienda) throw { status: 404, message: 'Tienda no encontrada' };

  // Soft delete
  await tienda.destroy();
  return { success: true, message: 'Tienda eliminada correctamente' };
}
