import { Router } from 'express';
import {
  crearCliente,
  listarClientes,
  obtenerCliente,
  eliminarCliente,
  editarCliente,
  listarClientesCreditoController,
  listarClientesConDeudaController
} from '../controllers/cliente.controller.js';
import authMiddleware from '../middlewares/auth.js'
import { validarSuscripcion } from '../middlewares/validarSuscripcion.js';

const router = Router(); 

router.post('/',authMiddleware, crearCliente);         // Crear cliente
router.get('/', listarClientes);        // Listar todos los clientes
router.get('/:id', obtenerCliente);     // Obtener cliente por ID
router.put('/:id', authMiddleware, editarCliente);
router.delete('/:id', authMiddleware, eliminarCliente); // Eliminar cliente (soft delete)
router.get('/credito/deben',authMiddleware,validarSuscripcion,   listarClientesCreditoController);
router.get('/credito/deben/clientes', authMiddleware, listarClientesConDeudaController);


export default router;
