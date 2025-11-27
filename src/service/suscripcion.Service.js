import Tienda from "../models/Tienda.js"; 
import { Op } from "sequelize";

export async function activarSuscripcionService(codigo_unico) {

  // 1. Buscar tienda por código
  const tienda = await Tienda.findOne({ where: { codigo_unico } });

  if (!tienda) {
    throw { status: 404, message: "Código inválido o tienda no encontrada" };
  }

  // 2. Activar suscripción
  const hoy = new Date();
  const fechaRenovacion = new Date();
  fechaRenovacion.setDate(hoy.getDate() + 30);

  await tienda.update({
    plan: "premium",
    suscripcion_activa: true,
    fecha_inicio_suscripcion: hoy,
    fecha_renovacion: fechaRenovacion
  });

  return {
    success: true,
    message: "Suscripción activada correctamente para la tienda " + tienda.nombre,
    tienda: {
      id: tienda.id,
      nombre: tienda.nombre,
      plan: tienda.plan,
      suscripcion_activa: tienda.suscripcion_activa,
      fecha_inicio_suscripcion: tienda.fecha_inicio_suscripcion,
      fecha_renovacion: tienda.fecha_renovacion
    }
  };
}


 

export async function desactivarSuscripcionService(codigo_unico) {
  // 1. Buscar tienda por código
  const tienda = await Tienda.findOne({ where: { codigo_unico } });

  if (!tienda) {
    throw { status: 404, message: "Código inválido o tienda no encontrada" };
  }

  // 2. Desactivar suscripción
  await tienda.update({
    plan: "free",
    suscripcion_activa: false,
    fecha_inicio_suscripcion: null,
    fecha_renovacion: null
  });

  return {
    success: true,
    message: "Suscripción desactivada correctamente para la tienda " + tienda.nombre,
    tienda: {
      id: tienda.id,
      nombre: tienda.nombre,
      plan: tienda.plan,
      suscripcion_activa: tienda.suscripcion_activa,
      fecha_inicio_suscripcion: tienda.fecha_inicio_suscripcion,
      fecha_renovacion: tienda.fecha_renovacion
    }
  };
}
