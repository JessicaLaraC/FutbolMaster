import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { collection, getDocs, doc, deleteDoc, getDoc, setDoc } from "firebase/firestore";
import { db, auth } from "./firebase";
import "../styles/Partidos.css";

const PartidosFinal = () => {
    const { torneoId } = useParams();
    const navigate = useNavigate();

    const [partidos, setPartidos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userId, setUserId] = useState(null);
    const [creadorTorneoId, setCreadorTorneoId] = useState(null);

    const obtenerCreadorTorneo = useCallback(async () => {
        try {
        const user = auth.currentUser;
        if (!user) return;

        const torneoRef = doc(db, `Users/${user.uid}/Torneos/${torneoId}`);
        const torneoSnap = await getDoc(torneoRef);

        if (torneoSnap.exists()) {
            const data = torneoSnap.data();
            setCreadorTorneoId(data.creadorId || user.uid);
        }
        } catch (err) {
        console.error("Error obteniendo el creador del torneo", err);
        }
    }, [torneoId]);

    const generarPartidosIniciales = (equipos) => {
        const fecha = new Date().toISOString().split("T")[0];
        return [
        {
            equipo1: equipos[0] || { id: "", nombre: "" },
            equipo2: equipos[1] || { id: "", nombre: "" },
            golesEquipo1: 0,
            golesEquipo2: 0,
            ubicacion: "",
            fecha,
            estado: "pendiente"
        },
        {
            equipo1: equipos[2] || { id: "", nombre: "" },
            equipo2: equipos[3] || { id: "", nombre: "" },
            golesEquipo1: 0,
            golesEquipo2: 0,
            ubicacion: "",
            fecha,
            estado: "pendiente"
        }
        ];
    };

    const cargarOPoblarPartidos = useCallback(async () => {
        const user = auth.currentUser;
        if (!user) return;

        const partidosRef = collection(db, `Users/${user.uid}/Torneos/${torneoId}/Partidos`);
        const snapshot = await getDocs(partidosRef);

        if (snapshot.empty) {
        // Cargar equipos para crear partidos
        const equiposRef = collection(db, `Users/${user.uid}/Torneos/${torneoId}/Equipos`);
        const equiposSnap = await getDocs(equiposRef);
        const equipos = equiposSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        if (equipos.length < 4) {
            setError("Se necesitan al menos 4 equipos para crear 2 partidos.");
            return;
        }

        const nuevos = generarPartidosIniciales(equipos);
        const promises = nuevos.map((p, i) => {
            const id = `partido${i + 1}`;
            return setDoc(doc(db, `Users/${user.uid}/Torneos/${torneoId}/Partidos`, id), p);
        });

        await Promise.all(promises);
        const partidosActualizados = await getDocs(partidosRef);
        const lista = partidosActualizados.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPartidos(lista.slice(0, 2));
        } else {
        const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPartidos(lista.slice(0, 2));
        }
    }, [torneoId]);

    useEffect(() => {
        const fetchData = async () => {
        const user = auth.currentUser;
        if (!user) {
            navigate("/login");
            return;
        }

        setUserId(user.uid);
        try {
            await obtenerCreadorTorneo();
            await cargarOPoblarPartidos();
        } catch {
            setError("Error al cargar los datos");
        } finally {
            setLoading(false);
        }
        };

        fetchData();
    }, [navigate, obtenerCreadorTorneo, cargarOPoblarPartidos]);

    const eliminarPartido = async (partidoId) => {
        try {
        const user = auth.currentUser;
        if (!user) return;

        await deleteDoc(doc(db, `Users/${user.uid}/Torneos/${torneoId}/Partidos`, partidoId));
        setPartidos(prev => prev.filter(p => p.id !== partidoId));
        } catch (err) {
        console.error("Error eliminando partido:", err);
        setError("Error al eliminar el partido");
        }
    };

    const navegarAFormulario = (partido) => {
        navigate(`/torneos/${torneoId}/partidos/editar/${partido.id}`, {
        state: { partido }
        });
    };

    const navegarAEstadisticas = (partidoId) => {
        navigate(`/torneos/${torneoId}/partidos/${partidoId}/estadisticas`);
    };

    if (loading) return <div className="loading">Cargando partidos...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="partidos-container">
        <h2>Partidos Final </h2>

        <div className="partidos-list">
            {partidos.length > 0 ? (
            partidos.map((partido) => (
                <div key={partido.id} className="partido-card" onClick={() => navegarAEstadisticas(partido.id)}>
                <div className="partido-nombre">
                    <div>
                    {partido.equipo1?.nombre || "Equipo 1"} VS {partido.equipo2?.nombre || "Equipo 2"}
                    </div>
                    <div className="icon-actions">
                    <span
                        className={`edit-icon ${userId !== creadorTorneoId ? "disabled" : ""}`}
                        onClick={(e) => {
                        e.stopPropagation();
                        if (userId === creadorTorneoId) navegarAFormulario(partido);
                        }}
                    >
                        ✏️
                    </span>
                    <span
                        className={`delete-icon ${userId !== creadorTorneoId ? "disabled" : ""}`}
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

                <div className="ubicacion editable">📍 {partido.ubicacion || "Por definir"}</div>
                </div>
            ))
            ) : (
            <p className="no-partidos">No hay partidos disponibles.</p>
            )}
        </div>
        </div>
    );
};

export default PartidosFinal;
