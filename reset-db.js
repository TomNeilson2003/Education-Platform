const { sequelize } = require('./server');

async function resetDatabase() {
  try {
    await sequelize.sync({ force: true });
    console.log('Database reset complete!');
    process.exit(0);
  } catch (error) {
    console.error('Reset failed:', error);
    process.exit(1);
  }
}

resetDatabase();