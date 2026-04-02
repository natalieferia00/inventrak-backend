// src/components/InventoryTable.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './InventoryTable.css';

const InventoryTable = () => {
    const [products, setProducts] = useState([]);

    const fetchProducts = async () => {
        try {
            // Asegúrate de que tu backend esté corriendo en el puerto 3000
            const response = await axios.get('http://localhost:3000/api/products');
            setProducts(response.data);
        } catch (error) {
            console.error("Error al traer productos de InvenTrak:", error);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    return (
        <div className="table-card">
            <div className="table-card-header">
                <h3>Resumen del Inventario</h3>
            </div>
            
            <table className="futuristic-table">
                <thead>
                    <tr>
                        <th>SKU</th>
                        <th>Producto</th>
                        <th>Categoría</th>
                        <th>Stock Actual</th>
                        <th>Precio Unit.</th>
                        <th>Estado</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map(product => (
                        <tr key={product.id}>
                            <td className="sku-cell">{product.sku}</td>
                            <td className="name-cell">{product.name}</td>
                            <td>{product.category_name || 'General'}</td>
                            <td className="stock-cell">{product.current_stock}</td>
                            <td>${product.unit_price}</td>
                            <td>
                                <span className={`status-badge ${product.current_stock <= product.min_stock_level ? 'low' : 'ok'}`}>
                                    {product.current_stock <= product.min_stock_level ? 'REABASTECER' : 'OK'}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default InventoryTable;