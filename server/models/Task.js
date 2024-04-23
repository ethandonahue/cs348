const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/db.config'); // Assuming your Sequelize instance is exported as 'sequelize'

const Task = sequelize.define(
  'Task', // Model name
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    due_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    priority: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: 'tasks',
    timestamps: false, // Disabling timestamps
  }
);

module.exports = Task;
