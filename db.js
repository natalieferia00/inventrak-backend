const mysql = require('mysql2');
require('dotenv').config();

// Creamos el pool usando la URL completa de la variable de entorno
const pool = mysql.createPool(process.env.DATABASE_URL);

module.exports = pool.promise();