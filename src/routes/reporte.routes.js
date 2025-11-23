import { Router } from 'express';
import * as reporteController from '../controllers/reporte.controller.js';
import authMiddleware from '../middlewares/auth.js'
const router = Router();

// GET /api/reportes/ganancias?desde=2025-01-01&hasta=2025-12-31&tipoVentas=pagadas
router.get('/ganancias', authMiddleware, reporteController.calcularGananciasPeriodo);
export default router;
