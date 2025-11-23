import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Usuario = sequelize.define('Usuario', {
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    validate: { isEmail: true }
  },

  nombre: {
    type: DataTypes.STRING,
  },

  username: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },

  passwordHash: {
    type: DataTypes.STRING,
    allowNull: false
  },

  rol: {
    type: DataTypes.ENUM('admin', 'user'),
    defaultValue: 'user'
  },

  tienda_id: {                      
    type: DataTypes.INTEGER,
    allowNull: true
  }

}, {
  tableName: 'usuarios',
  timestamps: true,
  createdAt: 'creado_en',
  updatedAt: false
});

export default Usuario;
