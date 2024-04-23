const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.config'); // Assuming your Sequelize instance is exported as 'sequelize'


const Student = sequelize.define(
  'Student', // model name
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: 'students',
    timestamps: false, // Disabling timestamps
  }
);



module.exports = Student;
