import { supabase } from "../utils/supabase.js";

export async function uploadImage(req, res) {
  try {
    console.log("=== SUBIDA DE IMAGEN INICIADA ===");
    console.log("📥 Archivo recibido en req.file:", req.file ? "SÍ" : "NO");
console.log("📥 req.body.old_path:", req.body.old_path);
console.log("📥 req.headers content-type:", req.headers["content-type"]);
console.log("📥 Tamaño de imagen buffer:", req.file?.buffer?.length);


    // Archivo recibido
    console.log("Archivo recibido (req.file):", req.file ? {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    } : "NO FILE");

    if (!req.file) {
      console.log("❌ No se envió imagen");
      return res.status(400).json({ message: "No se envió imagen" });
    }

    // Usuario y tienda
    console.log("Usuario autenticado:", req.usuario);
    const tienda_id = req.usuario.tienda_id; 
    console.log("Tienda ID:", tienda_id);

    // Construir path
    const ext = req.file.originalname.split(".").pop();
    const filePath = `products/${tienda_id}/${Date.now()}.${ext}`;
    console.log("Path generado para guardar:", filePath);

    // ---------------------------------------------------------------------
    // ELIMINAR IMAGEN ANTERIOR
    // ---------------------------------------------------------------------
    console.log("old_path recibido:", req.body.old_path);

    if (req.body.old_path) {
      console.log("Intentando eliminar imagen anterior...");

      const { data: deleteData, error: deleteError } = await supabase.storage
        .from("files")
        .remove([req.body.old_path]);

      console.log("Resultado delete:", { deleteData, deleteError });

      if (deleteError) {
        console.warn("⚠️ No se pudo eliminar la imagen anterior:", deleteError);
      }
    }

    // ---------------------------------------------------------------------
    // SUBIR IMAGEN NUEVA
    // ---------------------------------------------------------------------
    console.log("Subiendo imagen a Supabase...");

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("files")
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
        cacheControl: "3600",
      });

    console.log("Resultado upload:", { uploadData, uploadError });

    if (uploadError) {
      console.error("❌ Error al subir archivo a Supabase:", uploadError);
      throw uploadError;
    }

    console.log("✔️ Imagen subida correctamente:", filePath);

    return res.json({
      success: true,
      path: filePath,
      supabaseResponse: uploadData,
    });

  } catch (err) {
    console.error("❌ ERROR EN SUBIDA:", err);
    return res.status(500).json({
      message: "Error al subir imagen",
      error: err.message,
      fullError: err, // para debug real
    });
  }
}
