const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Conexión a tu base de datos de Render
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Usaremos una variable de entorno por seguridad
  ssl: { rejectUnauthorized: false }
});

// Crear la tabla automáticamente al iniciar
const initDb = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS invitados (
        id SERIAL PRIMARY KEY,
        nombre TEXT,
        apellido TEXT,
        familia TEXT,
        asistencia TEXT,
        mensaje TEXT,
        fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Tabla 'invitados' lista.");
  } catch (err) {
    console.error("Error al crear tabla:", err);
  }
};
initDb();

// Ruta para recibir los datos del formulario
app.post('/api/rsvp', async (req, res) => {
  const { nombre, apellido, familia, asistencia, mensaje } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO invitados (nombre, apellido, familia, asistencia, mensaje) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [nombre, apellido, familia, asistencia, mensaje]
    );
    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Error al guardar" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));