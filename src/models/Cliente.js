import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Cliente = sequelize.define('Cliente', {
  nombre: { type: DataTypes.STRING(150), allowNull: false },
  telefono: { type: DataTypes.STRING(30), allowNull: true },
  direccion: { type: DataTypes.STRING(255), allowNull: true },
  nit: { type: DataTypes.STRING(50), allowNull: true },
  
  tienda_id: {                 
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'clientes',
  timestamps: true,
  paranoid: true // soft delete activado
});

export default Cliente;
