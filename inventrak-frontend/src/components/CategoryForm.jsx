import React, { useState } from 'react';
import axios from 'axios';
import './Forms.css';

const CategoryForm = ({ onCategoryCreated }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:3000/api/categories', { name, description });
            alert("SISTEMA: Nueva categoría indexada con éxito.");
            setName('');
            setDescription('');
            if (onCategoryCreated) onCategoryCreated(); // Refresca para que aparezca en el select de productos
        } catch (error) {
            console.error(error);
            alert("ERROR: Fallo al registrar categoría. Verifique la conexión.");
        }
    };

    return (
        <div className="form-card accent-border-cyan">
            <h3>Gestión de Categorías_</h3>
            <form onSubmit={handleSubmit}>
                <div className="input-group">
                    <label>Nombre de Categoría</label>
                    <input 
                        type="text" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        placeholder="Ej: Periféricos, Software..." 
                        required 
                    />
                </div>
                <div className="input-group">
                    <label>Descripción</label>
                    <input 
                        type="text" 
                        value={description} 
                        onChange={(e) => setDescription(e.target.value)} 
                        placeholder="Breve detalle..." 
                    />
                </div>
                <button type="submit" className="btn-submit">CREAR CATEGORÍA</button>
            </form>
        </div>
    );
};

export default CategoryForm;