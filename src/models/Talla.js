// models/Talla.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Talla = sequelize.define('Talla', {
  nombre: { 
    type: DataTypes.STRING(50), 
    allowNull: false 
  },
  tienda_id: { 
    type: DataTypes.INTEGER, 
    allowNull: false 
  }
}, {
  tableName: 'tallas',
  timestamps: true,
  paranoid: true
});

export default Talla;
