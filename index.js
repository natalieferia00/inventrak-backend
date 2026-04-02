const express = require('express');
const cors = require('cors');
const db = require('./db');
require('dotenv').config();

const app = express();

// --- MIDDLEWARES ---
app.use(cors());
app.use(express.json());

// ==========================================
// 1. CRUD DE CATEGORÍAS
// ==========================================

// Leer todas
app.get('/api/categories', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM categories ORDER BY name ASC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: "Error en categorías: " + err.message });
    }
});

// Crear
app.post('/api/categories', async (req, res) => {
    const { name, description } = req.body;
    try {
        const [result] = await db.query('INSERT INTO categories (name, description) VALUES (?, ?)', [name, description]);
        res.status(201).json({ id: result.insertId, message: "Categoría creada" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Actualizar
app.put('/api/categories/:id', async (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;
    try {
        await db.query('UPDATE categories SET name = ?, description = ? WHERE id = ?', [name, description, id]);
        res.json({ message: "Categoría actualizada" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Eliminar
app.delete('/api/categories/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM categories WHERE id = ?', [id]);
        res.json({ message: "Categoría eliminada" });
    } catch (err) {
        res.status(500).json({ error: "No se puede eliminar: existen productos vinculados." });
    }
});

// ==========================================
// 2. CRUD DE PRODUCTOS
// ==========================================

// Leer todos (Corregido: Sin columnas inexistentes como last_updated)
app.get('/api/products', async (req, res) => {
    try {
        const query = `
            SELECT p.*, c.name as category_name 
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id
            ORDER BY p.name ASC
        `;
        const [rows] = await db.query(query);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: "Error al obtener productos: " + err.message });
    }
});

// Crear
app.post('/api/products', async (req, res) => {
    const { sku, name, description, category_id, unit_price, min_stock_level } = req.body;
    try {
        const query = `INSERT INTO products (sku, name, description, category_id, unit_price, min_stock_level) VALUES (?, ?, ?, ?, ?, ?)`;
        const [result] = await db.query(query, [sku, name, description, category_id, unit_price, min_stock_level]);
        res.status(201).json({ id: result.insertId, message: "Producto registrado" });
    } catch (err) {
        res.status(500).json({ error: "Error: El SKU debe ser único o faltan datos obligatorios." });
    }
});

// Actualizar
app.put('/api/products/:id', async (req, res) => {
    const { id } = req.params;
    const { name, description, category_id, unit_price, min_stock_level } = req.body;
    try {
        const query = `UPDATE products SET name=?, description=?, category_id=?, unit_price=?, min_stock_level=? WHERE id=?`;
        await db.query(query, [name, description, category_id, unit_price, min_stock_level, id]);
        res.json({ message: "Producto actualizado" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Eliminar
app.delete('/api/products/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM products WHERE id = ?', [id]);
        res.json({ message: "Producto eliminado" });
    } catch (err) {
        res.status(500).json({ error: "No se puede eliminar: el producto tiene historial de movimientos." });
    }
});

// ==========================================
// 3. MOVIMIENTOS (Corregido: Nombre de tabla 'movements')
// ==========================================

// Registrar Movimiento
app.post('/api/movements', async (req, res) => {
    const { product_id, type, quantity, reason } = req.body;
    try {
        // Se cambió 'inventory_movements' por 'movements'
        const query = 'INSERT INTO movements (product_id, type, quantity, reason) VALUES (?, ?, ?, ?)';
        await db.query(query, [product_id, type, quantity, reason]);
        res.json({ message: `Transacción de ${type} exitosa` });
    } catch (err) {
        res.status(500).json({ error: "Fallo en la transacción: " + err.message });
    }
});

// Ver Historial
app.get('/api/movements', async (req, res) => {
    try {
        const query = `
            SELECT m.*, p.name as product_name 
            FROM movements m
            JOIN products p ON m.product_id = p.id
            ORDER BY m.movement_date DESC
        `;
        const [rows] = await db.query(query);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- INICIO DEL SERVIDOR ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`
    🚀 INVENTRAK CORE ACTIVO EN PUERTO ${PORT}
    -----------------------------------
    Estatus: Online y conectado a Railway
    ===================================
    `);
});