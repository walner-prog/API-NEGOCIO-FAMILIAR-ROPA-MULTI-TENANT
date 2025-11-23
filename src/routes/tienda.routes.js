import { Router } from 'express';
import * as tiendaController from '../controllers/tienda.controller.js';
import authMiddleware from '../middlewares/auth.js'
const router = Router();

router.post('/', authMiddleware, tiendaController.crearTienda);
router.get('/', authMiddleware, tiendaController.listarTiendas);
router.get('/:id', authMiddleware, tiendaController.obtenerTienda);
router.put('/:id', authMiddleware, tiendaController.actualizarTienda);
router.delete('/:id', authMiddleware, tiendaController.eliminarTienda);

export default router;
