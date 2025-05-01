import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    collection,
    getDocs,
    doc,
    deleteDoc,
    getDoc,
    setDoc
} from "firebase/firestore";
import { db, auth } from "./firebase";
import "../styles/Partidos.css";

const PartidosSemifinal = () => {
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

    const cargarPartidosYCompletar = useCallback(async () => {
        const user = auth.currentUser;
        if (!user) return;

        const partidosRef = collection(db, `Users/${user.uid}/Torneos/${torneoId}/Partidos`);
        const snapshot = await getDocs(partidosRef);
        let partidosList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Si ya hay 4 partidos, solo mostramos
        if (partidosList.length >= 4) {
        setPartidos(partidosList.slice(0, 4));
        return;
        }

        // Obtener equipos
        const equiposRef = collection(db, `Users/${user.uid}/Torneos/${torneoId}/Equipos`);
        const equiposSnap = await getDocs(equiposRef);
        const equiposList = equiposSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        if (equiposList.length < 2) {
        setError("Se necesitan al menos 2 equipos para generar partidos.");
        return;
        }

        const combinaciones = [];
        const yaUsados = new Set(partidosList.map(p => `${p.equipo1?.id}-${p.equipo2?.id}`));

        for (let i = 0; i < equiposList.length; i++) {
        for (let j = i + 1; j < equiposList.length; j++) {
            const id1 = equiposList[i].id;
            const id2 = equiposList[j].id;
            const clave = `${id1}-${id2}`;
            if (!yaUsados.has(clave) && combinaciones.length + partidosList.length < 4) {
            combinaciones.push({
                equipo1: { id: id1, nombre: equiposList[i].nombre },
                equipo2: { id: id2, nombre: equiposList[j].nombre },
                golesEquipo1: 0,
                golesEquipo2: 0,
                ubicacion: "Por definir",
                fecha: new Date().toISOString().split("T")[0],
                estado: "pendiente"
            });
            yaUsados.add(clave);
            }
        }
        }

        const nuevasPromesas = combinaciones.map((partido, idx) => {
        const newId = `partido${partidosList.length + idx + 1}`;
        return setDoc(doc(db, `Users/${user.uid}/Torneos/${torneoId}/Partidos`, newId), partido);
        });

        await Promise.all(nuevasPromesas);

        // Volver a obtener todos los partidos
        const nuevosSnapshot = await getDocs(partidosRef);
        const todos = nuevosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPartidos(todos.slice(0, 4));
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
            await cargarPartidosYCompletar();
        } catch {
            setError("Error al cargar los datos.");
        } finally {
            setLoading(false);
        }
        };

        fetchData();
    }, [navigate, obtenerCreadorTorneo, cargarPartidosYCompletar]);

    const eliminarPartido = async (partidoId) => {
        try {
        const user = auth.currentUser;
        if (!user) return;
        await deleteDoc(doc(db, `Users/${user.uid}/Torneos/${torneoId}/Partidos`, partidoId));
        setPartidos(partidos.filter((p) => p.id !== partidoId));
        } catch (err) {
        console.error("Error eliminando partido:", err);
        setError("Error al eliminar el partido");
        }
    };

    const navegarAFormulario = (partido) => {
        navigate(`/torneos/${torneoId}/partidos/editar/${partido.id}`, { state: { partido } });
    };

    const navegarAEstadisticas = (partidoId) => {
        navigate(`/torneos/${torneoId}/partidos/${partidoId}/estadisticas`);
    };

    if (loading) return <div className="loading">Cargando partidos...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="partidos-container">
        <h2>Partidos Semifinales</h2>
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

export default PartidosSemifinal;
