import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { collection, getDocs, doc, deleteDoc, getDoc } from "firebase/firestore";
import { db, auth } from "./firebase";
import "../styles/Partidos.css";

const Partidos = () => {
  const { torneoId } = useParams();
  const navigate = useNavigate();

  const [equipos, setEquipos] = useState([]);
  const [partidos, setPartidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [userId, setUserId] = useState(null);
  const [creadorTorneoId, setCreadorTorneoId] = useState(null);

  const obtenerEquipos = useCallback(async () => {
    try {
      const user = auth.currentUser;
      if (!user) return navigate("/login");

      const equiposRef = collection(db, `Users/${user.uid}/Torneos/${torneoId}/Equipos`);
      const snapshot = await getDocs(equiposRef);
      const equiposList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setEquipos(equiposList);
    } catch (err) {
      console.error("Error obteniendo equipos:", err);
      setError("Error al cargar los equipos");
    }
  }, [torneoId, navigate]);

  const obtenerPartidos = useCallback(async () => {
    try {
      const user = auth.currentUser;
      if (!user) return navigate("/login");

      const partidosRef = collection(db, `Users/${user.uid}/Torneos/${torneoId}/Partidos`);
      const snapshot = await getDocs(partidosRef);
      const partidosList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setPartidos(partidosList);
    } catch (err) {
      console.error("Error obteniendo partidos:", err);
      setError("Error al cargar los partidos");
    }
  }, [torneoId, navigate]);

  const obtenerCreadorTorneo = useCallback(async () => {
    try {
      const user = auth.currentUser;
      if (!user) return navigate("/login");

      const torneoRef = doc(db, `Users/${user.uid}/Torneos/${torneoId}`);
      const torneoSnap = await getDoc(torneoRef);

      if (torneoSnap.exists()) {
        const data = torneoSnap.data();
        setCreadorTorneoId(data.creadorId || user.uid); // fallback por compatibilidad
      } else {
        console.warn("No se encontró el torneo");
      }
    } catch (err) {
      console.error("Error obteniendo el creador del torneo", err);
    }
  }, [torneoId, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;
      if (!user) return navigate("/login");

      setUserId(user.uid);
      try {
        await obtenerCreadorTorneo();
        await obtenerEquipos();
        await obtenerPartidos();
      } catch (err) {
        setError("Error al cargar los datos");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [obtenerCreadorTorneo, obtenerEquipos, obtenerPartidos, navigate]);

  const generarPartidosAleatorios = () => {
    if (equipos.length < 2) {
      alert("Necesitas al menos 2 equipos para generar partidos");
      return;
    }

    const nuevosPartidos = [];
    for (let i = 0; i < equipos.length; i++) {
      for (let j = i + 1; j < equipos.length; j++) {
        nuevosPartidos.push({
          equipo1: { id: equipos[i].id, nombre: equipos[i].nombre },
          equipo2: { id: equipos[j].id, nombre: equipos[j].nombre },
          golesEquipo1: 0,
          golesEquipo2: 0,
          ubicacion: "Por definir",
          fecha: new Date().toISOString().split("T")[0],
          estado: "pendiente"
        });
      }
    }

    setPartidos(nuevosPartidos);
  };

  const eliminarPartido = async (partidoId) => {
    try {
      const user = auth.currentUser;
      if (!user) return navigate("/login");

      await deleteDoc(doc(db, `Users/${user.uid}/Torneos/${torneoId}/Partidos`, partidoId));
      setPartidos(partidos.filter((p) => p.id !== partidoId));
    } catch (err) {
      console.error("Error eliminando partido:", err);
      setError("Error al eliminar el partido");
    }
  };

  const navegarAFormulario = (partido = null) => {
    if (partido) {
      navigate(`/torneos/${torneoId}/partidos/editar/${partido.id}`, {
        state: { partido }
      });
    } else {
      navigate(`/torneos/${torneoId}/partidos/nuevo`);
    }
  };

  const navegarAEstadisticas = (partidoId) => {
    navigate(`/torneos/${torneoId}/partidos/${partidoId}/estadisticas`);
  };

  if (loading) return <div className="loading">Cargando partidos...</div>;
  if (error) return <div className="error">{error}</div>;

  const partidosFiltrados = partidos.filter((partido) =>
    `${partido.equipo1?.nombre} ${partido.equipo2?.nombre}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="partidos-container">
      <h2>Partidos</h2>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Buscar partido por equipo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="partidos-actions">
        <button className="btn-generar" onClick={generarPartidosAleatorios} disabled={equipos.length < 2}>
          Generar Partidos Aleatorios
        </button>
        <button className="btn-crear" onClick={() => navegarAFormulario()}>
          Crear Partido Manualmente
        </button>
      </div>

      <div className="partidos-list">
        {partidosFiltrados.length > 0 ? (
          partidosFiltrados.map((partido) => (
            <div key={partido.id} className="partido-card" onClick={() => navegarAEstadisticas(partido.id)}>
              <div className="partido-nombre">
                <div>
                  {partido.equipo1?.nombre || "Equipo 1"} VS {partido.equipo2?.nombre || "Equipo 2"}
                </div>

                <div className="icon-actions">
                  <span
                    className={`edit-icon ${userId !== creadorTorneoId ? "disabled" : ""}`}
                    title={userId !== creadorTorneoId ? "Solo el creador del torneo puede editar" : "Editar"}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (userId === creadorTorneoId) navegarAFormulario(partido);
                    }}
                  >
                    ✏️
                  </span>
                  <span
                    className={`delete-icon ${userId !== creadorTorneoId ? "disabled" : ""}`}
                    title={userId !== creadorTorneoId ? "Solo el creador del torneo puede eliminar" : "Eliminar"}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (userId === creadorTorneoId) eliminarPartido(partido.id);
                    }}
                  >
                    🗑️
                  </span>
                </div>
              </div>

              <div className="marcador">
                <div className="equipo-logo">📷</div>
                <div className="goles">{partido.golesEquipo1} : {partido.golesEquipo2}</div>
                <div className="equipo-logo">📷</div>
              </div>

              <div className="ubicacion editable">
                📍 {partido.ubicacion}
              </div>
            </div>
          ))
        ) : (
          <p className="no-partidos">No hay partidos que coincidan.</p>
        )}
      </div>
    </div>
  );
};

export default Partidos;
