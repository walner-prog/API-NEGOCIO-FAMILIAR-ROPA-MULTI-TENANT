import Producto from '../models/Producto.js';

export async function verificarLimiteProductos(req, res, next) {
  try {
    const { limiteProductos } = req.suscripcion;

    if (!limiteProductos || limiteProductos === Infinity) {
      return next(); // sin límite, pasar
    }

    const total = await Producto.count({ where: { tienda_id: req.tienda.id } });

    if (total >= limiteProductos) {
      return res.status(403).json({
        message: `Tu plan (${req.suscripcion.plan}) solo permite crear hasta ${limiteProductos} productos.`
      });
    }

    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error validando límite de productos.' });
  }
}
