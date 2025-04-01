// models/StudentGameProgress.js (Sequelize Version)
module.exports = (sequelize, DataTypes) => {
    const StudentGameProgress = sequelize.define('StudentGameProgress', {
      gameName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      attempts: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      completions: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      bestSteps: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      lastPlayed: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    });

    StudentGameProgress.associate = (models) => {
      StudentGameProgress.belongsTo(models.Student, { // Assuming you have a Student model
        foreignKey: 'studentId',
        as: 'student',
      });
    };

    return StudentGameProgress;
  };