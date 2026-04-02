import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { 
  LayoutDashboard, Package, ArrowUpDown, Layers, 
  Trash2, Edit3, CheckCircle, AlertCircle, TrendingUp 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import './App.css';

const API = 'https://inventrak-backend.onrender.com/api';

// ==========================================
// 1. COMPONENTE: DASHBOARD (ANÁLISIS VIVO)
// ==========================================
const Dashboard = ({ products, categories }) => {
  const totalSkus = products.length;
  const lowStock = products.filter(p => p.current_stock <= p.min_stock_level && p.current_stock > 0);
  const outOfStock = products.filter(p => p.current_stock === 0);
  const totalValue = products.reduce((acc, p) => acc + (p.current_stock * (p.unit_price || 0)), 0);

  const barData = products.sort((a, b) => b.current_stock - a.current_stock).slice(0, 6)
    .map(p => ({ name: p.name, stock: p.current_stock }));

  const pieData = categories.map(cat => ({
    name: cat.name,
    value: products.filter(p => p.category_id === cat.id).length
  })).filter(item => item.value > 0);

  const COLORS = ['#0DFDFF', '#F1C40F', '#FF4B4B', '#2ecc71', '#9b59b6'];

  return (
    <div className="view-container animate-fade">
      <header className="dashboard-header">
        <h2 className="view-title"><LayoutDashboard size={24}/> Panel de Control</h2>
      </header>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon cyan"><Package size={20}/></div>
          <div className="stat-info">
            <span className="stat-label">Total SKUs</span>
            <span className="stat-value">{totalSkus}</span>
          </div>
        </div>
        <div className="stat-card accent-warning">
          <div className="stat-icon yellow"><AlertCircle size={20}/></div>
          <div className="stat-info">
            <span className="stat-label">Stock Bajo</span>
            <span className="stat-value">{lowStock.length}</span>
          </div>
        </div>
        <div className="stat-card accent-danger">
          <div className="stat-icon red"><TrendingUp size={20}/></div>
          <div className="stat-info">
            <span className="stat-label">Agotados</span>
            <span className="stat-value">{outOfStock.length}</span>
          </div>
        </div>
        <div className="stat-card accent-success">
          <div className="stat-icon green"><CheckCircle size={20}/></div>
          <div className="stat-info">
            <span className="stat-label">Valor Activos</span>
            <span className="stat-value">${totalValue.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="analysis-card chart-container">
          <h4>Niveles de Existencias</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#24292D" vertical={false} />
              <XAxis dataKey="name" stroke="#617983" fontSize={10} />
              <YAxis stroke="#617983" fontSize={10} />
              <Tooltip contentStyle={{ background: '#111', border: '1px solid #222' }} />
              <Bar dataKey="stock" fill="#0DFDFF" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="analysis-card chart-container">
          <h4>Mix de Categorías</h4>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={pieData} innerRadius={60} outerRadius={80} dataKey="value">
                {pieData.map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend iconType="circle" wrapperStyle={{fontSize: '12px'}} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 2. COMPONENTE: PRODUCTOS
// ==========================================
const ProductsView = ({ products, categories, onRefresh }) => {
  const [editing, setEditing] = useState(null);
  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    editing ? await axios.put(`${API}/products/${editing.id}`, data) : await axios.post(`${API}/products`, data);
    setEditing(null); onRefresh(); e.target.reset();
  };

  return (
    <div className="dashboard-grid animate-fade">
      <section className="table-card">
        <h3 className="section-title">Maestro de Artículos</h3>
        <table className="inventory-table">
          <thead>
            <tr><th>SKU</th><th>Nombre</th><th>Stock</th><th>Estado</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id}>
                <td data-label="SKU">{p.sku}</td>
                <td data-label="PRODUCTO">{p.name}</td>
                <td data-label="STOCK">{p.current_stock}</td>
                <td data-label="ESTADO">
                  <span className={`badge ${p.current_stock <= p.min_stock_level ? 'low' : 'ok'}`}>
                    {p.current_stock <= p.min_stock_level ? 'REABASTECER' : 'ESTABLE'}
                  </span>
                </td>
                <td data-label="GESTIÓN">
                  <div className="action-group">
                    <button className="action-btn" onClick={() => setEditing(p)}><Edit3 size={16}/></button>
                    <button className="action-btn delete" onClick={async () => {
                      if(confirm("¿Eliminar?")) { await axios.delete(`${API}/products/${p.id}`); onRefresh(); }
                    }}><Trash2 size={16}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <aside className="form-card">
        <h4>{editing ? 'Editar Registro' : '+ Nuevo SKU'}</h4>
        <form onSubmit={handleSubmit}>
          <div className="input-group"><label>SKU</label><input name="sku" defaultValue={editing?.sku} required /></div>
          <div className="input-group"><label>Nombre</label><input name="name" defaultValue={editing?.name} required /></div>
          <div className="input-group">
            <label>Categoría</label>
            <select name="category_id" defaultValue={editing?.category_id}>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="input-group"><label>Precio ($)</label><input name="unit_price" type="number" defaultValue={editing?.unit_price} /></div>
          <div className="input-group"><label>Mínimo</label><input name="min_stock_level" type="number" defaultValue={editing?.min_stock_level || 5} /></div>
          <button className="btn-primary">{editing ? 'GUARDAR' : 'REGISTRAR'}</button>
          {editing && <button type="button" className="btn-cancel" onClick={() => setEditing(null)}>CERRAR</button>}
        </form>
      </aside>
    </div>
  );
};

// ==========================================
// 3. COMPONENTE: MOVIMIENTOS (CON MOTIVO)
// ==========================================
const MovementsView = ({ products, onRefresh }) => {
  const [history, setHistory] = useState([]);
  useEffect(() => { axios.get(`${API}/movements`).then(res => setHistory(res.data)); }, [products]);

  const handleMovement = async (e) => {
    e.preventDefault();
    await axios.post(`${API}/movements`, Object.fromEntries(new FormData(e.target)));
    onRefresh(); e.target.reset();
  };

  return (
    <div className="dashboard-grid animate-fade">
      <section className="table-card">
        <h3 className="section-title">Auditoría de Stock</h3>
        <table className="inventory-table">
          <thead><tr><th>Fecha</th><th>Item</th><th>Tipo</th><th>Cant.</th><th>Motivo</th></tr></thead>
          <tbody>
            {history.slice(0,10).map(m => (
              <tr key={m.id}>
                <td data-label="FECHA">{new Date(m.movement_date).toLocaleDateString()}</td>
                <td data-label="ITEM">{m.product_name}</td>
                <td data-label="TIPO"><span className={`badge ${m.type === 'IN' ? 'ok' : 'low'}`}>{m.type}</span></td>
                <td data-label="CANT.">{m.quantity}</td>
                <td data-label="MOTIVO" style={{fontSize:'0.85rem'}}>{m.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <aside className="form-card">
        <h4>Registrar Stock</h4>
        <form onSubmit={handleMovement}>
          <div className="input-group">
            <select name="product_id" required>
              <option value="">Producto...</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="input-group">
            <select name="type"><option value="IN">ENTRADA (+)</option><option value="OUT">SALIDA (-)</option></select>
          </div>
          <div className="input-group"><input name="quantity" type="number" placeholder="Cantidad" required /></div>
          <div className="input-group"><input name="reason" placeholder="Motivo/Concepto" required /></div>
          <button className="btn-primary">EJECUTAR</button>
        </form>
      </aside>
    </div>
  );
};

// ==========================================
// 4. COMPONENTE: CATEGORÍAS
// ==========================================
const CategoriesView = ({ categories, onRefresh }) => (
  <div className="dashboard-grid animate-fade">
    <section className="table-card">
      <h3 className="section-title">Categorías</h3>
      <table className="inventory-table">
        <thead><tr><th>ID</th><th>Nombre</th><th>Acción</th></tr></thead>
        <tbody>
          {categories.map(c => (
            <tr key={c.id}>
              <td data-label="ID">#{c.id}</td>
              <td data-label="NOMBRE" style={{color:'var(--primary-cyan)', fontWeight:'bold'}}>{c.name}</td>
              <td data-label="ACCION">
                <button className="action-btn delete" onClick={async () => {
                  if(confirm("¿Borrar?")) { await axios.delete(`${API}/categories/${c.id}`); onRefresh(); }
                }}><Trash2 size={16}/></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
    <aside className="form-card">
      <h4>Nueva Categoría</h4>
      <form onSubmit={async (e) => {
        e.preventDefault();
        await axios.post(`${API}/categories`, { name: e.target.catName.value });
        onRefresh(); e.target.reset();
      }}>
        <div className="input-group"><input name="catName" placeholder="Nombre" required /></div>
        <button className="btn-primary">AÑADIR</button>
      </form>
    </aside>
  </div>
);

// ==========================================
// 5. NÚCLEO DE LA APP
// ==========================================
function App() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [refresh, setRefresh] = useState(refresh => refresh + 1);

  useEffect(() => {
    const load = async () => {
      const [resP, resC] = await Promise.all([axios.get(`${API}/products`), axios.get(`${API}/categories`)]);
      setProducts(resP.data); setCategories(resC.data);
    };
    load();
  }, [refresh]);

  return (
    <Router>
      <div className="app-container">
        <aside className="sidebar">
          <div className="logo-section"><h1>Inventrak</h1></div>
          <nav className="nav-links">
            <CustomLink to="/" icon={<LayoutDashboard size={20}/>} label="DASHBOARD" />
            <CustomLink to="/productos" icon={<Package size={20}/>} label="ITEMS" />
            <CustomLink to="/movimientos" icon={<ArrowUpDown size={20}/>} label="STOCK" />
            <CustomLink to="/categorias" icon={<Layers size={20}/>} label="CATS" />
          </nav>
          <div className="sidebar-footer">SISTEMA ONLINE</div>
        </aside>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard products={products} categories={categories} />} />
            <Route path="/productos" element={<ProductsView products={products} categories={categories} onRefresh={() => setRefresh(r => r+1)} />} />
            <Route path="/categorias" element={<CategoriesView categories={categories} onRefresh={() => setRefresh(r => r+1)} />} />
            <Route path="/movimientos" element={<MovementsView products={products} onRefresh={() => setRefresh(r => r+1)} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

function CustomLink({ to, icon, label }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link to={to} className={`nav-item ${isActive ? 'active' : ''}`}>
      {icon} <span>{label}</span>
    </Link>
  );
}

export default App;