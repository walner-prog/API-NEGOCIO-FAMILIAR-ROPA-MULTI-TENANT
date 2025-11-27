import { activarSuscripcionService,desactivarSuscripcionService } from "../service/suscripcion.Service.js";

export const activarSuscripcion = async (req, res) => {
  try {
    const { codigo_unico } = req.body;

    if (!codigo_unico) {
      return res.status(400).json({ success: false, message: "El código es obligatorio" });
    }

    const result = await activarSuscripcionService(codigo_unico);

    res.json(result);

  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || "Error al activar la suscripción"
    });
  }
};

export const desactivarSuscripcion = async (req, res) => {
  try {
    const { codigo_unico } = req.body;
    if (!codigo_unico) {
      return res.status(400).json({ success: false, message: "El código es obligatorio" });
    }
    const result = await desactivarSuscripcionService(codigo_unico);
    res.json(result);
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || "Error al desactivar la suscripción"
    });
  }
};