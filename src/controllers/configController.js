const { Config } = require('../models');

// GET /api/config
const getConfig = async (req, res) => {
  try {
    // Buscar la configuración principal (id: 1) o crearla si no existe
    let [config] = await Config.findOrCreate({
      where: { id: 1 },
      defaults: {
        tiempoPrevisualizacion: 60,
        nombreProfesor: '',
        asignatura: ''
      }
    });

    return res.status(200).json({
      tiempoPrevisualizacion: config.tiempoPrevisualizacion,
      nombreProfesor: config.nombreProfesor,
      asignatura: config.asignatura
    });
  } catch (error) {
    console.error('[configController] Error obteniendo config:', error);
    // Devolver valores por defecto en caso de error
    return res.status(200).json({
      tiempoPrevisualizacion: 60,
      nombreProfesor: '',
      asignatura: ''
    });
  }
};

// POST /api/config
const updateConfig = async (req, res) => {
  try {
    const { tiempoPrevisualizacion, nombreProfesor, asignatura } = req.body;

    // Actualizar o crear la configuración (Upsert)
    const [config] = await Config.upsert({
      id: 1,
      tiempoPrevisualizacion: tiempoPrevisualizacion !== undefined ? tiempoPrevisualizacion : 60,
      nombreProfesor: nombreProfesor || '',
      asignatura: asignatura || ''
    });

    return res.status(200).json({
      message: 'Configuración guardada exitosamente',
      config
    });
  } catch (error) {
    console.error('[configController] Error actualizando config:', error);
    // Devolver un 200 como indicó el usuario para no interferir, pero con mensaje de log
    return res.status(200).json({ message: 'Error interno, guardado local temporal activo' });
  }
};

module.exports = {
  getConfig,
  updateConfig
};
