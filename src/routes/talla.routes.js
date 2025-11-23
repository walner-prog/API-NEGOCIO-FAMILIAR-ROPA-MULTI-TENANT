// routes/talla.routes.js
import { Router } from 'express';
import { crearTalla, listarTallas, eliminarTalla } from '../controllers/talla.controller.js';
import authMiddleware from '../middlewares/auth.js';

const router = Router();

router.post('/', authMiddleware, crearTalla);
router.get('/', authMiddleware, listarTallas);
router.delete('/:id', authMiddleware, eliminarTalla);

export default router;
