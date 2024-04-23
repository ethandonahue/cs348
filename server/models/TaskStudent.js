const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.config'); // Assuming your Sequelize instance is exported as 'sequelize'
const Task = require('./Task'); // Assuming Task model is in the same directory
const Student = require('./Student'); // Assuming Student model is in the same directory

const TaskStudent = sequelize.define(
  'TaskStudent', // Model name
  {
    task_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    student_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
  },
  {
    tableName: 'task_students',
    timestamps: false, // Disabling timestamps
    underscored: true, // Use underscored naming for columns
  }
);



module.exports = TaskStudent;
