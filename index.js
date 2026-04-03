const express = require('express');
const cors = require('cors');
const db = require('./db');
require('dotenv').config();

const app = express();

// --- MIDDLEWARES ---
app.use(cors());
app.use(express.json());

// ==========================================
// 1. GESTIÓN DE CATEGORÍAS
// ==========================================

app.get('/api/categories', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM categories ORDER BY name ASC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: "Error en categorías: " + err.message });
    }
});

app.post('/api/categories', async (req, res) => {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: "El nombre es obligatorio" });

    try {
        const query = 'INSERT INTO categories (name, description) VALUES (?, ?)';
        const [result] = await db.query(query, [name.trim(), description || ""]);
        res.status(201).json({ id: result.insertId, message: "Categoría creada" });
    } catch (err) {
        console.error("Error al crear categoría:", err);
        res.status(500).json({ error: "Fallo en la base de datos." });
    }
});

// ==========================================
// 2. GESTIÓN DE PRODUCTOS
// ==========================================

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

app.post('/api/products', async (req, res) => {
    const { sku, name, description, category_id, unit_price, min_stock_level } = req.body;
    try {
        const query = `
            INSERT INTO products (sku, name, description, category_id, unit_price, current_stock, min_stock_level) 
            VALUES (?, ?, ?, ?, ?, 0, ?)
        `;
        const [result] = await db.query(query, [sku, name, description || "", category_id, unit_price || 0, min_stock_level || 0]);
        res.status(201).json({ id: result.insertId, message: "Producto registrado" });
    } catch (err) {
        res.status(500).json({ error: "Verifique que el SKU sea único." });
    }
});

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
// 3. MOVIMIENTOS Y ACTUALIZACIÓN DE STOCK
// ==========================================

// Leer historial (Sincronizado con nombres de columnas de Railway)
app.get('/api/movements', async (req, res) => {
    try {
        const query = `
            SELECT m.*, p.name as product_name 
            FROM movements m
            JOIN products p ON m.product_id = p.id
            ORDER BY m.movement_date DESC
        `; // Usamos 'movement_date' según tu captura de Railway
        const [rows] = await db.query(query);
        res.json(rows);
    } catch (err) {
        console.error("Error historial:", err);
        res.status(500).json({ error: err.message });
    }
});

// Crear Movimiento + Actualizar Stock Real
app.post('/api/movements', async (req, res) => {
    const { product_id, type, quantity, reason } = req.body;
    const qty = parseInt(quantity);

    try {
        // 1. Insertamos el registro en el historial
        const queryMov = 'INSERT INTO movements (product_id, type, quantity, reason) VALUES (?, ?, ?, ?)';
        await db.query(queryMov, [product_id, type, qty, reason || ""]);

        // 2. Lógica de ajuste: "IN" o "ENTRADA" suma, lo demás resta
        const adjustment = (type === 'IN' || type === 'ENTRADA') ? qty : -qty;

        // 3. Actualizamos el stock en la tabla de productos
        const queryUpdate = 'UPDATE products SET current_stock = current_stock + ? WHERE id = ?';
        await db.query(queryUpdate, [adjustment, product_id]);

        res.json({ message: "Movimiento procesado y stock actualizado" });
    } catch (err) {
        console.error("Error en movimiento:", err);
        res.status(500).json({ error: "Fallo al procesar el stock." });
    }
});

// --- INICIO DEL SERVIDOR ---
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor InvenTrak corriendo en puerto ${PORT}`);
});