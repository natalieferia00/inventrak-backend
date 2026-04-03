// Asegúrate de que esto sea lo PRIMERO en el archivo
require('dotenv').config(); 
const mysql = require('mysql2');

console.log("🔍 REVISANDO VARIABLES DE ENTORNO:");
console.log("HOST:", process.env.MYSQLHOST);
console.log("USER:", process.env.MYSQLUSER);

const pool = mysql.createPool({
    host: process.env.MYSQLHOST || 'autorack.proxy.rlwy.net', // Si falla el env, usa este por defecto
    user: process.env.MYSQLUSER || 'root',
    password: process.env.MYSQLPASSWORD || 'jrylRmUnZEnjvBZkyQrQBPhYwcdvkuqC',
    database: process.env.MYSQLDATABASE || 'railway',
    port: parseInt(process.env.MYSQLPORT) || 53116,
    waitForConnections: true,
    connectionLimit: 10
});

pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ ERROR FINAL:', err.message);
    } else {
        console.log('✅ ¡CONECTADO A RAILWAY CON ÉXITO!');
        connection.release();
    }
});

module.exports = pool.promise();