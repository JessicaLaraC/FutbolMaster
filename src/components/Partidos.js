import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  collection,
  getDocs,
  deleteDoc,
  addDoc,
  doc,
  getDoc
} from "firebase/firestore";
import { db, auth } from "./firebase";
import "../styles/Partidos.css";

const Partidos = () => {
  const { torneoId } = useParams();
  const navigate = useNavigate();

  const [equipos, setEquipos] = useState([]);
  const [partidos, setPartidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [operando, setOperando] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [userId, setUserId] = useState(null);
  const [creadorTorneoId, setCreadorTorneoId] = useState(null);

  const obtenerCreador = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) return navigate("/login");
    setUserId(user.uid);

    const torneoRef = doc(db, `Users/${user.uid}/Torneos/${torneoId}`);
    const snap = await getDoc(torneoRef);
    setCreadorTorneoId(
      snap.exists() ? (snap.data().creadorId || user.uid) : user.uid
    );
  }, [torneoId, navigate]);

  const obtenerEquipos = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) return navigate("/login");

    const ref = collection(
      db,
      `Users/${user.uid}/Torneos/${torneoId}/Equipos`
    );
    const snap = await getDocs(ref);
    const lista = snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        nombre:
          data.nombre ||
          data.nombre_equipo ||
          data.nombre_jugador ||
          "Equipo sin nombre",
        ...data,
      };
    });
    setEquipos(lista);
  }, [torneoId, navigate]);

  const obtenerPartidos = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) return navigate("/login");

    const ref = collection(
      db,
      `Users/${user.uid}/Torneos/${torneoId}/Partidos`
    );
    const snap = await getDocs(ref);
    setPartidos(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  }, [torneoId, navigate]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const user = auth.currentUser;
        if (!user) return navigate("/login");
        await Promise.all([
          obtenerCreador(),
          obtenerEquipos(),
          obtenerPartidos(),
        ]);
      } catch (err) {
        console.error(err);
        setError("Error cargando datos");
      } finally {
        setLoading(false);
      }
    })();
  }, [obtenerCreador, obtenerEquipos, obtenerPartidos, navigate]);

  const generarTodosContraTodos = async () => {
    if (equipos.length < 2) {
      return alert("Necesitas al menos 2 equipos");
    }
    setOperando(true);
    try {
      const user = auth.currentUser;
      if (!user) return navigate("/login");

      const basePath = `Users/${user.uid}/Torneos/${torneoId}/Partidos`;
      const partidoCol = collection(db, basePath);

      const existentesSnap = await getDocs(partidoCol);
      for (const docSnap of existentesSnap.docs) {
        await deleteDoc(doc(db, basePath, docSnap.id));
      }

      const nuevos = [];
      for (let i = 0; i < equipos.length; i++) {
        for (let j = i + 1; j < equipos.length; j++) {
          nuevos.push({
            equipo1: { id: equipos[i].id, nombre: equipos[i].nombre },
            equipo2: { id: equipos[j].id, nombre: equipos[j].nombre },
            golesEquipo1: 0,
            golesEquipo2: 0,
            ubicacion: "Por definir",
            fecha: new Date().toISOString().split("T")[0],
            estado: "pendiente",
          });
        }
      }

      const creados = [];
      for (const partido of nuevos) {
        const ref = await addDoc(partidoCol, partido);
        creados.push({ id: ref.id, ...partido });
      }

      setPartidos(creados);
    } catch (err) {
      console.error("Error generando partidos:", err);
      setError("No se pudieron generar los partidos");
    } finally {
      setOperando(false);
    }
  };

  const eliminarPartido = async (partidoId) => {
    try {
      const user = auth.currentUser;
      if (!user) return navigate("/login");

      await deleteDoc(
        doc(
          db,
          `Users/${user.uid}/Torneos/${torneoId}/Partidos`,
          partidoId
        )
      );
      setPartidos(partidos.filter((p) => p.id !== partidoId));
    } catch (err) {
      console.error("Error eliminando partido:", err);
      setError("Error al eliminar el partido");
    }
  };

  const navegarAFormulario = () => {
    navigate(`/torneos/${torneoId}/partidos/nuevo`);
  };

  const editarPartido = (partido) => {
    navigate(`/torneos/${torneoId}/partidos/editar/${partido.id}`, {
      state: { partido },
    });
  };

  const navegarAEstadisticas = (partidoId) => {
    navigate(
      `/torneos/${torneoId}/partidos/${partidoId}/estadisticas`
    );
  };

  if (loading) return <div className="loading">Cargando...</div>;
  if (error) return <div className="error">{error}</div>;

  const partidosFiltrados = partidos.filter(({ equipo1, equipo2 }) =>
    `${equipo1.nombre} vs ${equipo2.nombre}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
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
        <button
          className="btn-generar"
          onClick={generarTodosContraTodos}
          disabled={
            operando ||
            equipos.length < 2 ||
            userId !== creadorTorneoId
          }
          title={
            userId !== creadorTorneoId
              ? "Solo el creador puede generar el fixture"
              : undefined
          }
        >
          {operando ? "Generando..." : "Generar Partidos"}
        </button>

        <button className="btn-crear" onClick={navegarAFormulario}>
          Agregar Partido Manualmente
        </button>
      </div>

      <div className="partidos-list">
        {partidosFiltrados.length > 0 ? (
          partidosFiltrados.map((partido) => (
            <div
              key={partido.id}
              className="partido-card"
              onClick={() => navegarAEstadisticas(partido.id)}
            >
              <div className="partido-nombre">
                <div>
                  {partido.equipo1.nombre} VS {partido.equipo2.nombre}
                </div>
                <div className="icon-actions">
                  <span
                    className={`edit-icon ${
                      userId !== creadorTorneoId ? "disabled" : ""
                    }`}
                    title={
                      userId !== creadorTorneoId
                        ? "Solo el creador puede editar"
                        : "Editar partido"
                    }
                    onClick={(e) => {
                      e.stopPropagation();
                      if (userId === creadorTorneoId)
                        editarPartido(partido);
                    }}
                  >
                    ✏️
                  </span>
                  <span
                    className={`delete-icon ${
                      userId !== creadorTorneoId ? "disabled" : ""
                    }`}
                    title={
                      userId !== creadorTorneoId
                        ? "Solo el creador puede eliminar"
                        : "Eliminar partido"
                    }
                    onClick={(e) => {
                      e.stopPropagation();
                      if (userId === creadorTorneoId)
                        eliminarPartido(partido.id);
                    }}
                  >
                    🗑️
                  </span>
                </div>
              </div>

              <div className="marcador">
                <div className="equipo-logo">📷</div>
                <div className="goles">
                  {partido.golesEquipo1} : {partido.golesEquipo2}
                </div>
                <div className="equipo-logo">📷</div>
              </div>

              
              <div className="estado">
                Estado: {partido.estado}
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
