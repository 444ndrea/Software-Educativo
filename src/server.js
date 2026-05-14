require('dotenv').config();
const app = require('./expressApp');
const { sequelize } = require('./models');

const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    // Sincronizar Modelos a SQLite Local
    // `alter: true` sincroniza la estructura de la tabla (agrega columnas faltantes)
    await sequelize.sync({ alter: true });
    console.log('✅ Base de Datos SQLite sincronizada');

    app.listen(PORT, () => {
      console.log(`🚀 Servidor backend escuchando en http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Error fatal al iniciar el servidor:', err);
    process.exit(1);
  }
}

startServer();
