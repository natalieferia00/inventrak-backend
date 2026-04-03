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

// Crear Categoría (Corregido para Railway)
app.post('/api/categories', async (req, res) => {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: "El nombre es obligatorio" });

    try {
        const query = 'INSERT INTO categories (name, description) VALUES (?, ?)';
        const [result] = await db.query(query, [name, description || null]);
        res.status(201).json({ id: result.insertId, message: "Categoría creada" });
    } catch (err) {
        res.status(500).json({ error: "Error al crear categoría: " + err.message });
    }
});

// ==========================================
// 2. CRUD DE PRODUCTOS
// ==========================================

// Leer todos (Incluye el nombre de la categoría)
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

// Crear Producto (Asegura current_stock en 0 y description opcional)
app.post('/api/products', async (req, res) => {
    const { sku, name, description, category_id, unit_price, min_stock_level } = req.body;
    
    try {
        const query = `
            INSERT INTO products (sku, name, description, category_id, unit_price, current_stock, min_stock_level) 
            VALUES (?, ?, ?, ?, ?, 0, ?)
        `;
        const [result] = await db.query(query, [
            sku, 
            name, 
            description || null, 
            category_id, 
            unit_price, 
            min_stock_level || 0
        ]);
        res.status(201).json({ id: result.insertId, message: "Producto registrado con éxito" });
    } catch (err) {
        console.error("LOG DE ERROR:", err);
        res.status(500).json({ error: "Fallo al registrar: Verifique que el SKU sea único." });
    }
});

// Actualizar Producto
app.put('/api/products/:id', async (req, res) => {
    const { id } = req.params;
    const { name, description, category_id, unit_price, min_stock_level } = req.body;
    try {
        const query = `UPDATE products SET name=?, description=?, category_id=?, unit_price=?, min_stock_level=? WHERE id=?`;
        await db.query(query, [name, description || null, category_id, unit_price, min_stock_level, id]);
        res.json({ message: "Producto actualizado" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Eliminar Producto
app.delete('/api/products/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM products WHERE id = ?', [id]);
        res.json({ message: "Producto eliminado" });
    } catch (err) {
        res.status(500).json({ error: "No se puede eliminar: tiene registros vinculados." });
    }
});

// ==========================================
// 3. MOVIMIENTOS DE STOCK
// ==========================================

app.post('/api/movements', async (req, res) => {
    const { product_id, type, quantity, reason } = req.body;
    try {
        const query = 'INSERT INTO movements (product_id, type, quantity, reason) VALUES (?, ?, ?, ?)';
        await db.query(query, [product_id, type, quantity, reason]);
        res.json({ message: "Movimiento registrado" });
    } catch (err) {
        res.status(500).json({ error: "Error en movimiento: " + err.message });
    }
});

// --- INICIO DEL SERVIDOR ---
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor InvenTrak corriendo en puerto ${PORT}`);
});