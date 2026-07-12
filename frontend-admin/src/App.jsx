import React, { useState, useEffect } from 'react';
import './App.css';

const API_URL = 'http://localhost:8080/api/v1/muebles';
const CATEGORIAS_URL = 'http://localhost:8080/api/v1/categorias';
const UPLOAD_URL = 'http://localhost:8080/api/v1/uploads';
const AUTH_ME_URL = 'http://localhost:8080/api/v1/auth/me';
const ASSETS_BASE_URL = 'http://localhost:3000/assets/';

const CLAVE_SESION = 'adminAuth';

// Devuelve la cabecera Authorization con las credenciales guardadas
// al iniciar sesión. El backend las exige en toda operación de escritura.
function cabecerasAuth() {
  const token = sessionStorage.getItem(CLAVE_SESION);
  return token ? { Authorization: `Basic ${token}` } : {};
}

const ESTILOS_ADMIN = [
  { id: 'clasico', nombre: 'Clásico' },
  { id: 'moderno', nombre: 'Moderno' },
  { id: 'oscuro', nombre: 'Oscuro' },
];

function resolverImagen(foto) {
  if (!foto) return '';
  return foto.startsWith('http') ? foto : `${ASSETS_BASE_URL}${foto}`;
}

const FORMATO_PRECIO = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' });

function formatearPrecio(precio) {
  return precio == null ? '—' : FORMATO_PRECIO.format(precio);
}

async function subirArchivo(file) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(UPLOAD_URL, { method: 'POST', headers: cabecerasAuth(), body: formData });
  if (!res.ok) throw await crearErrorDesdeRespuesta(res, 'Error al subir la imagen');
  const data = await res.json();
  return data.filename;
}

// Construye un Error con .codigo (status HTTP) y .mensaje legible,
// intentando leer el cuerpo JSON de error que devuelve el backend.
async function crearErrorDesdeRespuesta(res, mensajePorDefecto) {
  let mensaje = mensajePorDefecto;
  try {
    const cuerpo = await res.json();
    if (cuerpo && cuerpo.mensaje) mensaje = cuerpo.mensaje;
  } catch {
    // El cuerpo no era JSON, nos quedamos con el mensaje por defecto
  }
  const error = new Error(mensaje);
  error.codigo = res.status;
  return error;
}

function App() {
  const [sesion, setSesion] = useState(() => sessionStorage.getItem(CLAVE_SESION));
  const [usuarioLogin, setUsuarioLogin] = useState('');
  const [claveLogin, setClaveLogin] = useState('');
  const [errorLogin, setErrorLogin] = useState(null);
  const [comprobandoLogin, setComprobandoLogin] = useState(false);

  const [muebles, setMuebles] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null); // { codigo, mensaje }
  const [guardando, setGuardando] = useState(false);

  const [muebleEnEdicion, setMuebleEnEdicion] = useState(null);
  const [archivoPrincipal, setArchivoPrincipal] = useState(null);
  const [archivosAdicionales, setArchivosAdicionales] = useState([]);

  const [mostrarGestorCategorias, setMostrarGestorCategorias] = useState(false);
  const [mostrarSelectorEstilos, setMostrarSelectorEstilos] = useState(false);
  const [nuevaCategoria, setNuevaCategoria] = useState('');
  const [estiloAdmin, setEstiloAdmin] = useState(() => localStorage.getItem('adminStyle') || 'clasico');

  useEffect(() => {
    if (!sesion) return;
    cargarMuebles();
    cargarCategorias();
  }, [sesion]);

  useEffect(() => {
    localStorage.setItem('adminStyle', estiloAdmin);
    document.body.dataset.adminTheme = estiloAdmin;
  }, [estiloAdmin]);

  function mostrarError(err) {
    // Si el backend rechaza las credenciales, volvemos a la pantalla de login
    if (err.codigo === 401) {
      cerrarSesion('Tu sesión ya no es válida. Vuelve a iniciar sesión.');
      return;
    }
    setError({ codigo: err.codigo ?? '—', mensaje: err.message });
  }

  async function iniciarSesion(e) {
    e.preventDefault();
    setComprobandoLogin(true);
    setErrorLogin(null);

    // Comprobamos las credenciales contra un endpoint protegido:
    // si el backend responde 200 son válidas, si responde 401 no lo son
    const token = btoa(`${usuarioLogin}:${claveLogin}`);
    try {
      const res = await fetch(AUTH_ME_URL, { headers: { Authorization: `Basic ${token}` } });
      if (!res.ok) {
        throw new Error(res.status === 401 ? 'Usuario o contraseña incorrectos' : 'No se pudo conectar con el servidor');
      }
      sessionStorage.setItem(CLAVE_SESION, token);
      setClaveLogin('');
      setSesion(token);
    } catch (err) {
      setErrorLogin(err.message);
    } finally {
      setComprobandoLogin(false);
    }
  }

  function cerrarSesion(mensaje = null) {
    sessionStorage.removeItem(CLAVE_SESION);
    setSesion(null);
    setErrorLogin(mensaje);
    setError(null);
    cerrarFormulario();
  }

  function cargarMuebles() {
    setCargando(true);
    fetch(API_URL)
      .then(async (res) => {
        if (!res.ok) throw await crearErrorDesdeRespuesta(res, 'No se pudo conectar con el servidor');
        return res.json();
      })
      .then((data) => {
        setMuebles(data);
        setError(null);
      })
      .catch(mostrarError)
      .finally(() => setCargando(false));
  }

  function cargarCategorias() {
    fetch(CATEGORIAS_URL)
      .then(async (res) => {
        if (!res.ok) throw await crearErrorDesdeRespuesta(res, 'No se pudieron cargar las categorías');
        return res.json();
      })
      .then(setCategorias)
      .catch(mostrarError);
  }

  function abrirFormularioNuevo() {
    const categoriaPorDefecto = categorias[0]?.nombre ?? '';
    setMuebleEnEdicion({ titulo: '', descripcion: '', tipo: categoriaPorDefecto, fotoPrincipal: '', precio: '' });
    setArchivoPrincipal(null);
    setArchivosAdicionales([]);
  }

  function abrirFormularioEditar(mueble) {
    setMuebleEnEdicion({ ...mueble });
    setArchivoPrincipal(null);
    setArchivosAdicionales([]);
  }

  function cerrarFormulario() {
    setMuebleEnEdicion(null);
    setArchivoPrincipal(null);
    setArchivosAdicionales([]);
  }

  function handleCambioInput(e) {
    const { name, value } = e.target;
    setMuebleEnEdicion((prev) => ({ ...prev, [name]: value }));
  }

  async function guardarMueble(e) {
    e.preventDefault();
    setGuardando(true);
    setError(null);

    try {
      const datosMueble = { ...muebleEnEdicion };

      // El input devuelve el precio como texto: lo convertimos a número,
      // o lo dejamos en null si se deja vacío (mueble sin precio publicado)
      datosMueble.precio =
        datosMueble.precio === '' || datosMueble.precio == null
          ? null
          : Number(datosMueble.precio);

      if (archivoPrincipal) {
        datosMueble.fotoPrincipal = await subirArchivo(archivoPrincipal);
      }

      const esEdicion = Boolean(datosMueble.id);
      const url = esEdicion ? `${API_URL}/${datosMueble.id}` : API_URL;
      const metodo = esEdicion ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: metodo,
        headers: { 'Content-Type': 'application/json', ...cabecerasAuth() },
        body: JSON.stringify(datosMueble),
      });
      if (!res.ok) throw await crearErrorDesdeRespuesta(res, 'Error al guardar el mueble');
      const muebleGuardado = await res.json();

      for (const archivo of archivosAdicionales) {
        const nombreGuardado = await subirArchivo(archivo);
        await fetch(`${API_URL}/${muebleGuardado.id}/fotos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...cabecerasAuth() },
          body: JSON.stringify({ fotoUrl: nombreGuardado }),
        });
      }

      cerrarFormulario();
      cargarMuebles();
    } catch (err) {
      mostrarError(err);
    } finally {
      setGuardando(false);
    }
  }

  function eliminarMueble(id) {
    const confirmar = window.confirm('¿Seguro que quieres eliminar este mueble?');
    if (!confirmar) return;

    fetch(`${API_URL}/${id}`, { method: 'DELETE', headers: cabecerasAuth() })
      .then(async (res) => {
        if (!res.ok) throw await crearErrorDesdeRespuesta(res, 'Error al eliminar el mueble');
        cargarMuebles();
      })
      .catch(mostrarError);
  }

  function crearCategoria(e) {
    e.preventDefault();
    if (!nuevaCategoria.trim()) return;

    fetch(CATEGORIAS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...cabecerasAuth() },
      body: JSON.stringify({ nombre: nuevaCategoria }),
    })
      .then(async (res) => {
        if (!res.ok) throw await crearErrorDesdeRespuesta(res, 'Error al crear la categoría');
        setNuevaCategoria('');
        cargarCategorias();
      })
      .catch(mostrarError);
  }

  function eliminarCategoria(id) {
    fetch(`${CATEGORIAS_URL}/${id}`, { method: 'DELETE', headers: cabecerasAuth() })
      .then(async (res) => {
        if (!res.ok) throw await crearErrorDesdeRespuesta(res, 'Error al eliminar la categoría');
        cargarCategorias();
      })
      .catch(mostrarError);
  }

  // Sin sesión iniciada solo se muestra la pantalla de acceso:
  // el backend rechaza igualmente cualquier escritura sin credenciales
  if (!sesion) {
    return (
      <div className={`app-contenedor tema-admin-${estiloAdmin}`}>
        <div className="login-panel">
          <h1>Muebles C Palma</h1>
          <p>Panel de gestión — acceso restringido</p>
          <form onSubmit={iniciarSesion}>
            <div className="campo">
              <label>Usuario</label>
              <input
                type="text"
                value={usuarioLogin}
                onChange={(e) => setUsuarioLogin(e.target.value)}
                autoComplete="username"
                required
                autoFocus
              />
            </div>
            <div className="campo">
              <label>Contraseña</label>
              <input
                type="password"
                value={claveLogin}
                onChange={(e) => setClaveLogin(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
            {errorLogin && <div className="mensaje-error">⚠ {errorLogin}</div>}
            <button type="submit" className="boton boton-primario login-boton" disabled={comprobandoLogin}>
              {comprobandoLogin ? 'Comprobando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={`app-contenedor tema-admin-${estiloAdmin}`}>
      <div className="app-header">
        <h1>Muebles C Palma — Panel de Gestión</h1>
        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <button className="boton boton-secundario" onClick={() => setMostrarSelectorEstilos(true)}>
            Estilo
          </button>
          <button className="boton boton-secundario" onClick={() => setMostrarGestorCategorias(true)}>
            Categorías
          </button>
          <button className="boton boton-primario" onClick={abrirFormularioNuevo}>
            + Añadir mueble
          </button>
          <button className="boton boton-secundario" onClick={() => cerrarSesion()}>
            Cerrar sesión
          </button>
        </div>
      </div>

      {error && (
        <div className="mensaje-error">
          ⚠ <strong>Error {error.codigo}:</strong> {error.mensaje}
        </div>
      )}

      {cargando ? (
        <p>Cargando muebles...</p>
      ) : (
        <table className="tabla-muebles">
          <thead>
            <tr>
              <th>Foto</th>
              <th>Título</th>
              <th>Tipo</th>
              <th>Precio</th>
              <th>Descripción</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {muebles.map((mueble) => (
              <tr key={mueble.id}>
                <td className="celda-foto">
                  <img
                    className="miniatura"
                    src={resolverImagen(mueble.fotoPrincipal)}
                    alt={mueble.titulo}
                  />
                </td>
                <td>{mueble.titulo}</td>
                <td>{mueble.tipo}</td>
                <td className="celda-precio">{formatearPrecio(mueble.precio)}</td>
                <td>{mueble.descripcion}</td>
                <td>
                  <div className="acciones-celda">
                    <button className="boton boton-secundario" onClick={() => abrirFormularioEditar(mueble)}>
                      Editar
                    </button>
                    <button className="boton boton-peligro" onClick={() => eliminarMueble(mueble.id)}>
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal: crear/editar mueble */}
      {muebleEnEdicion && (
        <div className="overlay" onClick={cerrarFormulario}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{muebleEnEdicion.id ? 'Editar mueble' : 'Nuevo mueble'}</h2>
            <form onSubmit={guardarMueble}>
              <div className="campo">
                <label>Título</label>
                <input
                  type="text"
                  name="titulo"
                  value={muebleEnEdicion.titulo}
                  onChange={handleCambioInput}
                  required
                />
              </div>

              <div className="campo">
                <label>Categoría</label>
                <select name="tipo" value={muebleEnEdicion.tipo} onChange={handleCambioInput} required>
                  <option value="" disabled>Selecciona una categoría</option>
                  {categorias.map((cat) => (
                    <option key={cat.id} value={cat.nombre}>{cat.nombre}</option>
                  ))}
                </select>
              </div>

              <div className="campo">
                <label>Precio (€)</label>
                <input
                  type="number"
                  name="precio"
                  value={muebleEnEdicion.precio ?? ''}
                  onChange={handleCambioInput}
                  min="0"
                  step="0.01"
                  placeholder="Vacío = se mostrará «Consultar precio»"
                />
              </div>

              <div className="campo">
                <label>Descripción</label>
                <textarea
                  name="descripcion"
                  value={muebleEnEdicion.descripcion}
                  onChange={handleCambioInput}
                  rows={4}
                  required
                />
              </div>

              <div className="campo">
                <label>Foto principal</label>
                {muebleEnEdicion.fotoPrincipal && !archivoPrincipal && (
                  <img
                    className="miniatura"
                    src={resolverImagen(muebleEnEdicion.fotoPrincipal)}
                    alt="Foto principal actual"
                    style={{ marginBottom: '0.5rem' }}
                  />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setArchivoPrincipal(e.target.files[0])}
                />
              </div>

              <div className="campo">
                <label>Fotos adicionales (galería)</label>
                {muebleEnEdicion.fotosAdicionales && muebleEnEdicion.fotosAdicionales.length > 0 && (
                  <div className="preview-fotos">
                    {muebleEnEdicion.fotosAdicionales.map((foto) => (
                      <img key={foto.id} src={resolverImagen(foto.fotoUrl)} alt="Foto adicional" />
                    ))}
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => setArchivosAdicionales(Array.from(e.target.files))}
                />
              </div>

              <div className="modal-acciones">
                <button type="submit" className="boton boton-primario" disabled={guardando}>
                  {guardando ? 'Guardando...' : 'Guardar'}
                </button>
                <button type="button" className="boton boton-secundario" onClick={cerrarFormulario}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: selector de estilos */}
      {mostrarSelectorEstilos && (
        <div className="overlay" onClick={() => setMostrarSelectorEstilos(false)}>
          <div className="modal modal-estilos" onClick={(e) => e.stopPropagation()}>
            <h2>Estilo del panel</h2>
            <div className="selector-estilos" aria-label="Selector de estilos del panel privado">
              {ESTILOS_ADMIN.map((estilo) => (
                <button
                  key={estilo.id}
                  type="button"
                  className={`estilo-opcion ${estiloAdmin === estilo.id ? 'activo' : ''}`}
                  onClick={() => {
                    setEstiloAdmin(estilo.id);
                    setMostrarSelectorEstilos(false);
                  }}
                >
                  <span className={`muestra-estilo muestra-${estilo.id}`} aria-hidden="true" />
                  <strong>{estilo.nombre}</strong>
                </button>
              ))}
            </div>
            <div className="modal-acciones">
              <button className="boton boton-secundario" onClick={() => setMostrarSelectorEstilos(false)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: gestionar categorías */}
      {mostrarGestorCategorias && (
        <div className="overlay" onClick={() => setMostrarGestorCategorias(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Gestionar categorías</h2>

            <form onSubmit={crearCategoria} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <input
                type="text"
                placeholder="Nueva categoría"
                value={nuevaCategoria}
                onChange={(e) => setNuevaCategoria(e.target.value)}
                style={{ flex: 1, padding: '0.5rem', border: '1px solid #d9cdb8', borderRadius: '6px' }}
              />
              <button type="submit" className="boton boton-primario">Añadir</button>
            </form>

            <ul className="lista-categorias">
              {categorias.map((cat) => (
                <li key={cat.id}>
                  <span>{cat.nombre}</span>
                  <button className="boton boton-peligro" onClick={() => eliminarCategoria(cat.id)}>
                    Eliminar
                  </button>
                </li>
              ))}
            </ul>

            <div className="modal-acciones">
              <button className="boton boton-secundario" onClick={() => setMostrarGestorCategorias(false)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
