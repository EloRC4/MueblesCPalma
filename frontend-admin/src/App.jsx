import { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [muebles, setMuebles] = useState([]);
  const API_URL = 'http://localhost:8080';

  useEffect(() => {
    fetch(`${API_URL}/api/v1/muebles`)
      .then(res => res.json())
      .then(data => setMuebles(data))
      .catch(err => console.error("Error al cargar muebles:", err));
  }, []);

  return (
    <div className="container">
      <h1>Catálogo de Muebles C. Palma</h1>
      <div className="grid">
        {muebles.map((mueble) => (
          <div key={mueble.id} className="card">
            <img
              src={`${API_URL}/images/${mueble.fotoPrincipal}`}
              alt={mueble.titulo}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://via.placeholder.com/300x200?text=Sin+Imagen";
              }}
            />
            <div className="card-content">
              <h3>{mueble.titulo}</h3>
              <span className="badge">{mueble.tipo}</span>
              <p>{mueble.descripcion}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;