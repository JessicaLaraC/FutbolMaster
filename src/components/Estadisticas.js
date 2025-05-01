import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    doc,
    getDoc,
    collection,
    getDocs,
    deleteDoc
} from "firebase/firestore";
import { db, auth } from "./firebase";
import MenuEstadisticas from "./MenuEstadisticas"; 
import "../styles/Estadisticas.css";

const Estadisticas = () => {
    const { torneoId, partidoId } = useParams();
    const navigate = useNavigate();
    const [partido, setPartido] = useState(null);
    const [estadisticas, setEstadisticas] = useState({ eventos: [] });
    const [tab, setTab] = useState("estadisticas");

    useEffect(() => {
        const fetchData = async () => {
        const userId = auth.currentUser?.uid;
        if (!userId) return;

        const partidoRef = doc(db, `Users/${userId}/Torneos/${torneoId}/Partidos/${partidoId}`);
        const statsRef = collection(db, `Users/${userId}/Torneos/${torneoId}/Partidos/${partidoId}/Estadisticas`);

        const partidoSnap = await getDoc(partidoRef);
        const statsSnap = await getDocs(statsRef);

        if (partidoSnap.exists()) {
            setPartido(partidoSnap.data());
        }

        const eventos = statsSnap.docs
            .map((doc) => ({ id: doc.id, ...doc.data() }))
            .sort((a, b) => parseInt(a.minuto) - parseInt(b.minuto));

        setEstadisticas({ eventos });
        };

        fetchData();
    }, [torneoId, partidoId]);

    const eliminarEvento = async (eventoId) => {
        const userId = auth.currentUser?.uid;
        if (!userId) return;

        const eventoRef = doc(
        db,
        `Users/${userId}/Torneos/${torneoId}/Partidos/${partidoId}/Estadisticas/${eventoId}`
        );

        await deleteDoc(eventoRef);

        setEstadisticas((prev) => ({
        eventos: prev.eventos.filter((e) => e.id !== eventoId)
        }));
    };

    const irAEditarEstadisticas = () => {
        navigate(`/torneos/${torneoId}/partidos/${partidoId}/estadisticas/formulario-estadisticas`);
    };

    const irAEditarJugadores = () => {
        navigate(`/torneos/${torneoId}/partidos/${partidoId}/formulario-jugadores`);
    };

    const irAListaJugadores = () => {
        navigate(`/torneos/${torneoId}/partidos/${partidoId}/lista-jugadores`);
    };

    if (!partido) {
        navigate(`/torneos/${torneoId}/partidos/${partidoId}/estadisticas`);
        return null;
    }
    

    return (
        <div className="estadisticas-app">
        <div className="tablero">
            <div className="equipos">
            <div className="equipo-nombre">{partido.equipo1?.nombre || "Equipo 1"}</div>
            <div className="marcador">{partido.golesEquipo1} : {partido.golesEquipo2}</div>
            <div className="equipo-nombre">{partido.equipo2?.nombre || "Equipo 2"}</div>
            </div>
            <div className="tiempo">00:00</div>

            <button className="btn-editar-jugadores" onClick={irAEditarJugadores}>
            ✏️ Editar jugadores
            </button>

            <button className="btn-ir-a-lista" onClick={irAListaJugadores}>
            🤝 Ver jugadores presentes
            </button>
        </div>
        <MenuEstadisticas
            tab={tab}
            setTab={setTab}
            torneoId={torneoId}
            partidoId={partidoId}
            navigate={navigate}
        />

        
        <div className="contenido-tab">
            {tab === "estadisticas" && (
            <div className="estadisticas-section">
                <button className="btn-agregar" onClick={irAEditarEstadisticas}>
                📝 Agrega las Estadísticas
                </button>

                <div className="eventos">
                {estadisticas?.eventos?.length > 0 ? (
                    estadisticas.eventos.map((evento, i) => (
                    <div key={evento.id} className={`tipo tipo-${(evento.tipo || "desconocido").toLowerCase().replace(/\s/g, "-")}`}>
                        <span className="minuto">{evento.minuto}’</span>
                        <span className="tipo">{evento.tipo}</span>
                        <span className="jugador">{evento.jugador}</span>
                        {evento.equipoNombre && <span className="equipo">({evento.equipoNombre})</span>}
                        {evento.asistencia && (
                        <span className="asistido">→ Asistencia: {evento.asistencia}</span>
                        )}
                        <button className="btn-eliminar" onClick={() => eliminarEvento(evento.id)}>❌</button>
                    </div>
                    ))
                ) : (
                    <p className="no-eventos">No hay eventos registrados aún.</p>
                )}
                </div>
            </div>
            )}
        </div>
        </div>
    );
};
export default Estadisticas;
