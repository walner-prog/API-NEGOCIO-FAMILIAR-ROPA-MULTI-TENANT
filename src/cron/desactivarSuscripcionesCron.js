import cron from "node-cron";
import Tienda from "../models/Tienda.js";
import { Op } from "sequelize";

// Corre TODOS LOS DÍAS a las 00:00
cron.schedule("0 0 * * *", async () => {
  console.log("🔍 Ejecutando verificación diaria de suscripciones…");

  try {
    const hoy = new Date();

    const tiendasVencidas = await Tienda.findAll({
      where: {
        suscripcion_activa: true,
        fecha_renovacion: { [Op.lt]: hoy } // fecha_renovacion < hoy
      }
    });

    if (tiendasVencidas.length === 0) {
      console.log("✔ No hay tiendas vencidas hoy");
      return;
    }

    for (const tienda of tiendasVencidas) {
      await tienda.update({
        suscripcion_activa: false,
        plan: "free"
      });

      console.log(`❌ Suscripción vencida: ${tienda.nombre} (ID: ${tienda.id})`);
    }

    console.log("✔ Proceso completado");

  } catch (error) {
    console.error("❗ Error en CRON de suscripciones:", error);
  }
});

console.log("⏳ CRON de suscripciones activado");
