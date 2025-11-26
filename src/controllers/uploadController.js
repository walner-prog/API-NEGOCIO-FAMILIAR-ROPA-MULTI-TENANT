import { supabase } from "../utils/supabase.js";

export async function uploadImage(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No se envió imagen" });
    }

    const tienda_id = req.usuario.tienda_id; 

    // Ruta de la imagen nueva
    const ext = req.file.originalname.split(".").pop();
    const filePath = `products/${tienda_id}/${Date.now()}.${ext}`;

    // ⭐ Eliminar imagen anterior si viene en req.body.old_path
    if (req.body.old_path) {
      const { error: deleteError } = await supabase.storage
        .from("files")
        .remove([req.body.old_path]);
      if (deleteError) {
        console.warn("No se pudo eliminar la imagen anterior:", deleteError.message);
      }
    }

   // console.log("eliminando imagen en Supabase en path:", req.body.old_path);

    // Subir imagen nueva
    const { error } = await supabase.storage
      .from("files")
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: true,
      });

    if (error) throw error;

    return res.json({
      success: true,
      path: filePath, // este path se guarda en tu DB
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error al subir imagen", error: err.message });
  }
}
