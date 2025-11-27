// scripts/initDB.js
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

import { sequelize, Cliente, Producto } from '../src/models/index.js';
import Usuario from '../src/models/Usuario.js';
import Tienda from '../src/models/Tienda.js';

// 👉 Generador de código único
function generarCodigoUnico(length = 10) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

async function createDatabase() {
  const { MYSQLHOST, MYSQLPORT, MYSQLUSER, MYSQLPASSWORD, MYSQLDATABASE } = process.env;

  console.log('⏳ Verificando base de datos...');

  const connection = await mysql.createConnection({
    host: MYSQLHOST,
    port: MYSQLPORT,
    user: MYSQLUSER,
    password: MYSQLPASSWORD
  });

  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${MYSQLDATABASE}\`;`);
  console.log(`✅ Base de datos "${MYSQLDATABASE}" lista`);
  await connection.end();
}

async function populateData() {
  console.log('⏳ Poblando datos iniciales...');

  // =============================
  // 👉 Crear tienda inicial
  // =============================

  const codigo_unico = generarCodigoUnico();

  const [tienda, tiendaCreated] = await Tienda.findOrCreate({
    where: { nombre: 'Tienda Gilma' },
    defaults: {
      descripcion: 'Tienda Gilma',
      telefono: '88888888',
      direccion: 'Nicaragua',
      moneda: 'NIO',
      plan: 'free',
      estado: true,
      suscripcion_activa: false,

      // 🆕 Nuevos campos
      codigo_unico,
      fecha_inicio_suscripcion: null,
      fecha_renovacion: null,
    }
  });

  console.log(
    tiendaCreated
      ? `🟢 Tienda creada (código único: ${codigo_unico})`
      : '⚠️ Tienda ya existía'
  );

  // =============================
  // 👉 Crear usuarios asociados a la tienda
  // =============================
  const adminPassword = await bcrypt.hash('12345', 10);
  const userPassword = await bcrypt.hash('12345', 10);

  const [admin, adminCreated] = await Usuario.findOrCreate({
    where: { email: 'admin@admin.com' },
    defaults: {
      nombre: 'Carlos Admin',
      passwordHash: adminPassword,
      rol: 'admin',
      username: 'Carlos',
      tienda_id: tienda.id
    }
  });

  console.log(adminCreated ? '🟢 Usuario admin creado' : '⚠️ Usuario admin ya existía');

  const [user, userCreated] = await Usuario.findOrCreate({
    where: { email: 'user@user.com' },
    defaults: {
      nombre: 'Gilma User',
      passwordHash: userPassword,
      rol: 'user',
      username: 'Gilma',
      tienda_id: tienda.id
    }
  });

  console.log(userCreated ? '🟢 Usuario normal creado' : '⚠️ Usuario normal ya existía');

}

async function init() {
  try {
    await createDatabase();

    await sequelize.authenticate();
    console.log('🔗 Conexión establecida con Sequelize');

    // 👇 Sincroniza todos los modelos con fuerza (solo para desarrollo)
    await sequelize.sync({ force: true });
    console.log('🛠️ Tablas sincronizadas');

    await populateData();
  } catch (err) {
    console.error('❌ Error inicializando BD:', err);
  } finally {
    process.exit(0);
  }
}

init();


/**
 * 

  // =============================
  // 👉 Clientes
  // =============================
  await Cliente.bulkCreate([
    { nombre: 'Jose Perez ', telefono: '10000001', tienda_id: tienda.id },
    { nombre: 'Maria Lopez', telefono: '10000002', tienda_id: tienda.id },
    { nombre: 'Carlos Sanchez', telefono: '10000003', tienda_id: tienda.id },
    { nombre: 'Luis Martinez', telefono: '10000004', tienda_id: tienda.id },
    { nombre: 'Maria Gomez', telefono: '10000005', tienda_id: tienda.id }
  ], { ignoreDuplicates: true });
  console.log('🟢 Clientes insertados');

  // =============================
  // 👉 Productos
  // =============================
  const productosData = [
    
  // Camisetas
  { nombre: 'Camiseta Básica (Algodón)', codigo_barras: '0001', precio_compra: 150, precio_venta: 250, stock: 80, marca: 'Hanes' },
  { nombre: 'Camiseta Deportiva (Hombre)', codigo_barras: '0002', precio_compra: 200, precio_venta: 350, stock: 60, marca: 'Adidas' },
  { nombre: 'Camiseta Deportiva (Mujer)', codigo_barras: '0003', precio_compra: 200, precio_venta: 350, stock: 60, marca: 'Nike' },
  { nombre: 'Camiseta Manga Larga', codigo_barras: '0004', precio_compra: 180, precio_venta: 300, stock: 50, marca: 'Sin Marca' },
  { nombre: 'Camiseta Polo (Hombre)', codigo_barras: '0005', precio_compra: 220, precio_venta: 380, stock: 45, marca: 'Polo' },

  // Camisas
  { nombre: 'Camisa Formal (Manga Larga)', codigo_barras: '0006', precio_compra: 450, precio_venta: 700, stock: 40, marca: 'Perry Ellis' },
  { nombre: 'Camisa Casual (Manga Corta)', codigo_barras: '0007', precio_compra: 350, precio_venta: 550, stock: 50, marca: 'Sin Marca' },
  { nombre: 'Camisa de Mezclilla', codigo_barras: '0008', precio_compra: 400, precio_venta: 650, stock: 35, marca: 'Levi\'s' },
  { nombre: 'Camisa Estampada (Verano)', codigo_barras: '0009', precio_compra: 300, precio_venta: 500, stock: 40, marca: 'Sin Marca' },

  // Pantalones
  { nombre: 'Pantalón Jean (Mezclilla)', codigo_barras: '0010', precio_compra: 400, precio_venta: 600, stock: 50, marca: 'Wrangler' },
  { nombre: 'Pantalón de Vestir (Hombre)', codigo_barras: '0011', precio_compra: 500, precio_venta: 750, stock: 30, marca: 'Sin Marca' },
  { nombre: 'Pantalón Corto (Bermuda)', codigo_barras: '0012', precio_compra: 300, precio_venta: 450, stock: 60, marca: 'Columbia (Réplica)' },
  { nombre: 'Leggings Deportivos (Mujer)', codigo_barras: '0013', precio_compra: 180, precio_venta: 300, stock: 50, marca: 'Sin Marca' },
  { nombre: 'Pantalón Jogger (Unisex)', codigo_barras: '0014', precio_compra: 250, precio_venta: 420, stock: 40, marca: 'Nike' },
  { nombre: 'Falda de Jean', codigo_barras: '0015', precio_compra: 320, precio_venta: 500, stock: 35, marca: 'Sin Marca' },
  { nombre: 'Falda Casual (Mujer)', codigo_barras: '0016', precio_compra: 300, precio_venta: 450, stock: 30, marca: 'Sin Marca' },

  // Vestidos
  { nombre: 'Vestido Casual de Verano', codigo_barras: '0017', precio_compra: 350, precio_venta: 550, stock: 30, marca: 'Sin Marca' },
  { nombre: 'Vestido Elegante (Mujer)', codigo_barras: '0018', precio_compra: 450, precio_venta: 700, stock: 25, marca: 'Zara' },
  { nombre: 'Vestido Largo (Fiesta)', codigo_barras: '0019', precio_compra: 500, precio_venta: 800, stock: 20, marca: 'Sin Marca' },

  // Ropa Interior
  { nombre: 'Boxer (Ropa Interior Hombre)', codigo_barras: '0020', precio_compra: 90, precio_venta: 150, stock: 90, marca: 'Hanes' },
  { nombre: 'Brassiere (Mujer)', codigo_barras: '0021', precio_compra: 120, precio_venta: 200, stock: 60, marca: 'Victoria\'s Secret' },
  { nombre: 'Par de Calcetines (Deportivos)', codigo_barras: '0022', precio_compra: 50, precio_venta: 90, stock: 150, marca: 'FOTL' },
  { nombre: 'Ropa Interior Infantil', codigo_barras: '0023', precio_compra: 60, precio_venta: 100, stock: 80, marca: 'Sin Marca' },

  // Chaquetas y suéteres
  { nombre: 'Chaqueta Rompevientos', codigo_barras: '0024', precio_compra: 600, precio_venta: 900, stock: 25, marca: 'The North Face' },
  { nombre: 'Suéter Ligero (Hoddie)', codigo_barras: '0025', precio_compra: 380, precio_venta: 600, stock: 25, marca: 'Nike' },
  { nombre: 'Chaqueta de Jean', codigo_barras: '0026', precio_compra: 400, precio_venta: 650, stock: 35, marca: 'Levi\'s' },
  { nombre: 'Chaqueta de Cuero (Unisex)', codigo_barras: '0027', precio_compra: 700, precio_venta: 1100, stock: 20, marca: 'Sin Marca' },

  // Calzado
  { nombre: 'Zapatos Deportivos (Tenis)', codigo_barras: '0028', precio_compra: 900, precio_venta: 1400, stock: 20, marca: 'Puma' },
  { nombre: 'Sandalias de Cuero', codigo_barras: '0029', precio_compra: 300, precio_venta: 500, stock: 45, marca: 'El Potro (Local)' },
  { nombre: 'Zapatos Formales (Hombre)', codigo_barras: '0030', precio_compra: 700, precio_venta: 1100, stock: 30, marca: 'Sin Marca' },
  { nombre: 'Botas de Lluvia', codigo_barras: '0031', precio_compra: 400, precio_venta: 650, stock: 25, marca: 'Local' },
  { nombre: 'Sandalias Casual (Mujer)', codigo_barras: '0032', precio_compra: 250, precio_venta: 400, stock: 40, marca: 'Sin Marca' },

  // Accesorios de ropa
  { nombre: 'Gorra (Logo)', codigo_barras: '0033', precio_compra: 120, precio_venta: 200, stock: 100, marca: 'Polo' },
  { nombre: 'Cinturón de Cuero', codigo_barras: '0034', precio_compra: 120, precio_venta: 200, stock: 70, marca: 'Local' },
  { nombre: 'Bufanda de Algodón', codigo_barras: '0035', precio_compra: 100, precio_venta: 180, stock: 50, marca: 'Sin Marca' },
  { nombre: 'Sombrero Veraniego', codigo_barras: '0036', precio_compra: 150, precio_venta: 250, stock: 60, marca: 'Sin Marca' },
  { nombre: 'Guantes de Invierno', codigo_barras: '0037', precio_compra: 120, precio_venta: 200, stock: 40, marca: 'Sin Marca' },

  // Ropa infantil
  { nombre: 'Camiseta Infantil', codigo_barras: '0038', precio_compra: 120, precio_venta: 200, stock: 80, marca: 'Sin Marca' },
  { nombre: 'Pantalón Infantil', codigo_barras: '0039', precio_compra: 150, precio_venta: 250, stock: 60, marca: 'Sin Marca' },
  { nombre: 'Vestido Infantil', codigo_barras: '0040', precio_compra: 200, precio_venta: 350, stock: 50, marca: 'Sin Marca' },
  { nombre: 'Chaqueta Infantil', codigo_barras: '0041', precio_compra: 250, precio_venta: 400, stock: 40, marca: 'Sin Marca' },

  // Más ropa para adultos
  { nombre: 'Polerón con Capucha (Hombre)', codigo_barras: '0042', precio_compra: 380, precio_venta: 600, stock: 30, marca: 'Nike' },
  { nombre: 'Polerón con Capucha (Mujer)', codigo_barras: '0043', precio_compra: 380, precio_venta: 600, stock: 30, marca: 'Adidas' },
  { nombre: 'Pantalón Cargo (Hombre)', codigo_barras: '0044', precio_compra: 350, precio_venta: 550, stock: 35, marca: 'Sin Marca' },
  { nombre: 'Short Deportivo (Mujer)', codigo_barras: '0045', precio_compra: 180, precio_venta: 300, stock: 50, marca: 'Sin Marca' },
  { nombre: 'Leggings Casual (Mujer)', codigo_barras: '0046', precio_compra: 200, precio_venta: 350, stock: 50, marca: 'Sin Marca' },
  { nombre: 'Camisa Polo Infantil', codigo_barras: '0047', precio_compra: 150, precio_venta: 250, stock: 60, marca: 'Sin Marca' },
  { nombre: 'Pantalón Chino (Hombre)', codigo_barras: '0048', precio_compra: 400, precio_venta: 650, stock: 40, marca: 'Sin Marca' },
  { nombre: 'Falda Escolar', codigo_barras: '0049', precio_compra: 250, precio_venta: 400, stock: 50, marca: 'Sin Marca' },
  { nombre: 'Blusa Escolar', codigo_barras: '0050', precio_compra: 200, precio_venta: 350, stock: 50, marca: 'Sin Marca' }
  ];

  // Agregar tienda_id a cada producto
  const productosConTienda = productosData.map(p => ({ ...p, tienda_id: tienda.id }));

  await Producto.bulkCreate(productosConTienda, { ignoreDuplicates: true, individualHooks: true });
  console.log('🟢 Productos insertados con tienda asignada');

  console.log('🎉 Base de datos inicializada correctamente');
 */

