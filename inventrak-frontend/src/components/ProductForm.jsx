import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Forms.css';

const ProductForm = ({ onProductCreated }) => {
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        sku: '',
        name: '',
        description: '',
        category_id: '',
        unit_price: '',
        min_stock_level: 5
    });

    useEffect(() => {
        // Cargar categorías para el select
        const fetchCats = async () => {
            const res = await axios.get('http://localhost:3000/api/categories');
            setCategories(res.data);
        };
        fetchCats();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:3000/api/products', formData);
            alert("SISTEMA: Producto indexado correctamente.");
            setFormData({ sku: '', name: '', description: '', category_id: '', unit_price: '', min_stock_level: 5 });
            onProductCreated(); // Refresca la tabla principal
        } catch (error) {
            console.error(error);
            alert("ERROR: El SKU ya existe o faltan datos.");
        }
    };

    return (
        <div className="form-card accent-border">
            <h3>Nuevo Item de Inventario_</h3>
            <form onSubmit={handleSubmit}>
                <div className="input-row">
                    <div className="input-group">
                        <label>SKU (Código Único)</label>
                        <input 
                            type="text" 
                            placeholder="INV-XXXX"
                            value={formData.sku}
                            onChange={(e) => setFormData({...formData, sku: e.target.value})}
                            required 
                        />
                    </div>
                    <div className="input-group">
                        <label>Nombre del Producto</label>
                        <input 
                            type="text" 
                            placeholder="Nombre"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            required 
                        />
                    </div>
                </div>

                <div className="input-group">
                    <label>Categoría</label>
                    <select 
                        value={formData.category_id}
                        onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                        required
                    >
                        <option value="">Seleccionar Categoría...</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>

                <div className="input-row">
                    <div className="input-group">
                        <label>Precio Unitario ($)</label>
                        <input 
                            type="number" 
                            step="0.01"
                            value={formData.unit_price}
                            onChange={(e) => setFormData({...formData, unit_price: e.target.value})}
                            required 
                        />
                    </div>
                    <div className="input-group">
                        <label>Stock Mínimo (Alerta)</label>
                        <input 
                            type="number" 
                            value={formData.min_stock_level}
                            onChange={(e) => setFormData({...formData, min_stock_level: e.target.value})}
                            required 
                        />
                    </div>
                </div>

                <button type="submit" className="btn-submit neon-glow">CARGAR EN BASE DE DATOS</button>
            </form>
        </div>
    );
};

export default ProductForm;