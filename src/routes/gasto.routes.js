import express from 'express'
import { registrarGasto,listarGastos,eliminarGasto } from '../controllers/gasto.controller.js'
import authMiddleware from '../middlewares/auth.js'

const router = express.Router()

router.post('/', authMiddleware, registrarGasto)
router.get('/', authMiddleware, listarGastos);
router.delete('/:id', authMiddleware, eliminarGasto);
export default router
