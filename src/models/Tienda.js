import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Tienda = sequelize.define('Tienda', {
  nombre: { 
    type: DataTypes.STRING(150), 
    allowNull: false 
  },
  descripcion: { 
    type: DataTypes.STRING(255), 
    allowNull: true 
  },
  telefono: { 
    type: DataTypes.STRING(30), 
    allowNull: true 
  },
  direccion: { 
    type: DataTypes.STRING(255), 
    allowNull: true 
  },
  moneda: { 
    type: DataTypes.STRING(10), 
    allowNull: false, 
    defaultValue: 'NIO' 
  },
  plan: { 
    type: DataTypes.STRING(20), 
    allowNull: false, 
    defaultValue: 'free' 
  },
  estado: { 
    type: DataTypes.BOOLEAN, 
    allowNull: false, 
    defaultValue: true 
  },
  suscripcion_activa: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },

  fecha_renovacion: {
    type: DataTypes.DATE,
    allowNull: true
  }

}, {
  tableName: 'tiendas',
  timestamps: true,
  paranoid: true // habilita soft delete
});

export default Tienda;



