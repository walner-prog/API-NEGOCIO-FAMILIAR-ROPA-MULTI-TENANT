import express from 'express';
import { crearProducto, listarProductos, actualizarProducto, eliminarProducto } from '../controllers/producto.controller.js';
import authMiddleware from '../middlewares/auth.js';
import { validarSuscripcion } from '../middlewares/validarSuscripcion.js';
import { verificarLimiteProductos } from '../middlewares/limiteProductos.js';

const router = express.Router();

router.post(
  '/',
  authMiddleware,
  validarSuscripcion,
  verificarLimiteProductos, // aquí se valida límite
  crearProducto
);

router.get('/', listarProductos);

router.put('/:id', authMiddleware, validarSuscripcion, actualizarProducto);
router.delete('/:id', authMiddleware, validarSuscripcion, eliminarProducto);

export default router;
