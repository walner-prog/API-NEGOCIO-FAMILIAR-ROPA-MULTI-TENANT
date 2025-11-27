import Tienda from '../models/Tienda.js';

// Middleware para validar suscripción y plan
export async function validarSuscripcion(req, res, next) {
  try {
    const { tienda_id } = req.usuario; // asumimos que ya tienes un middleware que decodifica el token y asigna req.usuario

    if (!tienda_id) {
      return res.status(400).json({ message: 'El usuario no tiene una tienda asociada.' });
    }

    const tienda = await Tienda.findByPk(tienda_id);

    if (!tienda) {
      return res.status(404).json({ message: 'Tienda no encontrada.' });
    }

    const hoy = new Date();

    // Revisar si la suscripción está activa y no vencida
    const suscripcionVencida = tienda.fecha_renovacion && hoy > new Date(tienda.fecha_renovacion);

    req.tienda = tienda; // pasar tienda al request para que otros middlewares o controllers puedan usarla
    req.suscripcion = {
      activa: tienda.suscripcion_activa && !suscripcionVencida,
      plan: tienda.plan,
      limiteProductos: tienda.plan === 'free' ? 1 : Infinity, // ejemplo de límite
      mostrarReportes: tienda.plan !== 'free', // ocultar reportes si plan free
    };

    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error validando la suscripción.' });
  }
}
