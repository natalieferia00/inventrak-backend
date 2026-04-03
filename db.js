const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    port: Number(process.env.MYSQLPORT) || 3306, // El Number() evita errores de formato
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Esto nos dirá en los logs de Render si funcionó
pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Error de conexión:', err.message);
    } else {
        console.log('✅ Conexión exitosa a Railway desde la nube');
        connection.release();
    }
});

module.exports = pool.promise();