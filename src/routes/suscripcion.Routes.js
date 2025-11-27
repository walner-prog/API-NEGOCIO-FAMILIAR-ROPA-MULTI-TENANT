import express from "express";
import { activarSuscripcion,desactivarSuscripcion } from "../controllers/suscripcion.Controller.js";
const router = express.Router();

router.post("/", activarSuscripcion);
router.post("/desactivar", desactivarSuscripcion);


export default router;
