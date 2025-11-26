import express from "express";
import { uploadImage } from "../controllers/uploadController.js";
import authMiddleware from '../middlewares/auth.js';
import { upload } from '../middlewares/multer.js';

const router = express.Router();

// Aquí agregamos upload.single("file")
router.post("/", authMiddleware, upload.single("file"), uploadImage);

export default router;
