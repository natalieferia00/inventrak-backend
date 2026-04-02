import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Forms.css';

const MovementForm = ({ onMovementSuccess }) => {
    const [products, setProducts] = useState([]);
    const [formData, setFormData] = useState({
        product_id: '',
        type: 'IN',
        quantity: '',
        reason: ''
    });

    useEffect(() => {
        const fetchProducts = async () => {
            const res = await axios.get('http://localhost:3000/api/products');
            setProducts(res.data);
        };
        fetchProducts();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:3000/api/movements', formData);
            alert("Movimiento registrado en InvenTrak");
            setFormData({ product_id: '', type: 'IN', quantity: '', reason: '' });
            onMovementSuccess(); // Refresca la tabla
        } catch (error) {
            alert("Error: Verifica el stock disponible");
        }
    };

    return (
        <div className="form-card">
            <h3>Registrar Movimiento_</h3>
            <form onSubmit={handleSubmit}>
                <div className="input-group">
                    <label>Producto</label>
                    <select 
                        value={formData.product_id} 
                        onChange={(e) => setFormData({...formData, product_id: e.target.value})}
                        required
                    >
                        <option value="">Seleccionar...</option>
                        {products.map(p => (
                            <option key={p.id} value={p.id}>{p.name} (Stock: {p.current_stock})</option>
                        ))}
                    </select>
                </div>

                <div className="input-group">
                    <label>Tipo</label>
                    <div className="radio-group">
                        <button 
                            type="button" 
                            className={formData.type === 'IN' ? 'active' : ''} 
                            onClick={() => setFormData({...formData, type: 'IN'})}
                        >ENTRADA</button>
                        <button 
                            type="button" 
                            className={formData.type === 'OUT' ? 'active' : ''} 
                            onClick={() => setFormData({...formData, type: 'OUT'})}
                        >SALIDA</button>
                    </div>
                </div>

                <div className="input-group">
                    <label>Cantidad</label>
                    <input 
                        type="number" 
                        value={formData.quantity}
                        onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                        placeholder="00"
                        required 
                    />
                </div>

                <button type="submit" className="btn-submit">EJECUTAR TRANSACCIÓN</button>
            </form>
        </div>
    );
};

export default MovementForm;