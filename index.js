const express = require('express');
const cors = require('cors');
const db = require('./db'); // Importa la conexión del pool
require('dotenv').config();

const app = express();

// --- MIDDLEWARES ---
app.use(cors());
app.use(express.json());

// --- 1. RUTAS DE CATEGORÍAS ---

// Obtener todas las categorías (para llenar los selectores en el frontend)
app.get('/api/categories', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM categories ORDER BY name ASC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: "Error al obtener categorías: " + err.message });
    }
});

// Crear una nueva categoría
app.post('/api/categories', async (req, res) => {
    const { name, description } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO categories (name, description) VALUES (?, ?)',
            [name, description]
        );
        res.status(201).json({ id: result.insertId, message: "Categoría indexada con éxito" });
    } catch (err) {
        res.status(500).json({ error: "Error al crear categoría: " + err.message });
    }
});

// --- 2. RUTAS DE PRODUCTOS ---

// Listar inventario completo con nombres de categoría
app.get('/api/products', async (req, res) => {
    try {
        const query = `
            SELECT p.*, c.name as category_name 
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id
            ORDER BY p.last_updated DESC
        `;
        const [rows] = await db.query(query);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: "Error al obtener productos: " + err.message });
    }
});

// Registrar nuevo producto maestro
app.post('/api/products', async (req, res) => {
    const { sku, name, description, category_id, unit_price, min_stock_level } = req.body;
    try {
        const query = `
            INSERT INTO products (sku, name, description, category_id, unit_price, min_stock_level) 
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const [result] = await db.query(query, [sku, name, description, category_id, unit_price, min_stock_level || 5]);
        res.status(201).json({ id: result.insertId, message: "Producto registrado en el sistema" });
    } catch (err) {
        res.status(500).json({ error: "Error: El SKU ya existe o los datos son inválidos." });
    }
});

// --- 3. RUTAS DE MOVIMIENTOS (TRANSACCIONES) ---

// Registrar Entrada o Salida
// RECUERDA: El stock real se actualiza automáticamente en SQL por el TRIGGER
app.post('/api/movements', async (req, res) => {
    const { product_id, type, quantity, reason } = req.body;
    
    if (!product_id || !type || !quantity) {
        return res.status(400).json({ error: "Datos incompletos para la transacción" });
    }

    try {
        const query = 'INSERT INTO inventory_movements (product_id, type, quantity, reason) VALUES (?, ?, ?, ?)';
        await db.query(query, [product_id, type, quantity, reason]);
        res.json({ message: `Transacción de ${type} procesada correctamente` });
    } catch (err) {
        // Este error se dispara si el CHECK(current_stock >= 0) de SQL falla en una salida
        res.status(500).json({ error: "Fallo en la transacción: Stock insuficiente o ID inválido." });
    }
});

// Historial de movimientos para auditoría
app.get('/api/movements', async (req, res) => {
    try {
        const query = `
            SELECT m.*, p.name as product_name 
            FROM inventory_movements m
            JOIN products p ON m.product_id = p.id
            ORDER BY m.movement_date DESC LIMIT 30
        `;
        const [rows] = await db.query(query);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- LANZAMIENTO ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`
    =========================================
    🚀 INVENTRAK CORE - SISTEMA ACTIVO
    📡 Puerto: ${PORT}
    🔗 Endpoint: http://localhost:${PORT}
    =========================================
    `);
});