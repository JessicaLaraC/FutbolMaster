import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, setDoc, collection, getDocs } from "firebase/firestore";
import { db, auth } from "./firebase";
import "../styles/CalificarJugadores.css";

function obtenerNombre(data, opciones, defecto = "Sin nombre") {
    for (let key of opciones) {
        if (data[key]) return data[key];
    }
    return defecto;
}

const CalificarJugadores = () => {
    const { torneoId, partidoId, jugadorId } = useParams();
    const navigate = useNavigate();

    const [jugador, setJugador] = useState(null);
    const [equipo, setEquipo] = useState(null);
    const [partido, setPartido] = useState(null);
    const [calificacion, setCalificacion] = useState(0);

    const textos = ["Muy malo", "Malo", "Regular", "Bueno", "Excelente"];
    const emojis = ["😡", "😕", "😐", "🙂", "🤩"];
    const [historial, setHistorial] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const userId = auth.currentUser?.uid;
            if (!userId) return;
    
            const partidoRef = doc(db, `Users/${userId}/Torneos/${torneoId}/Partidos/${partidoId}`);
            const partidoSnap = await getDoc(partidoRef);
            if (!partidoSnap.exists()) return;
    
            const partidoData = partidoSnap.data();
            setPartido(partidoData);
    
            const equipoId = partidoData.equipo1?.id;
            const equipoNombre = obtenerNombre(partidoData.equipo1, ["nombre", "nombre_equipo"]);
            setEquipo({ id: equipoId, nombre: equipoNombre });
    
            const jugadorRef = doc(db, `Users/${userId}/Torneos/${torneoId}/Equipos/${equipoId}/Jugadores/${jugadorId}`);
            const jugadorSnap = await getDoc(jugadorRef);
            if (jugadorSnap.exists()) {
                const jugadorData = jugadorSnap.data();
                jugadorData.nombre = obtenerNombre(jugadorData, ["nombre", "nombre_jugador"]);
                setJugador(jugadorData);
            }
    
            
            const historialRef = collection(db, `Users/${userId}/Torneos/${torneoId}/Partidos/${partidoId}/Calificaciones`);
            const historialSnap = await getDocs(historialRef);
            const calificaciones = historialSnap.docs
                .map(doc => doc.data())
                .filter(data => data.jugadorId === jugadorId)
                .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    
            setHistorial(calificaciones);
        };
    
        fetchData();
    }, [torneoId, partidoId, jugadorId]);
    
    const enviarCalificacion = async () => {
        const userId = auth.currentUser?.uid;
        if (!userId || !jugadorId || calificacion === 0) return;

        const calificacionRef = doc(
            db,
            `Users/${userId}/Torneos/${torneoId}/Partidos/${partidoId}/Calificaciones/${jugadorId}`
        );

        await setDoc(calificacionRef, {
            jugadorId,
            nombre: jugador?.nombre || "Jugador",
            equipo: equipo?.nombre || "Equipo",
            calificacion,
            fecha: new Date().toISOString()
        });

        alert("✅ Calificación guardada");
        navigate(-1);
    };

    if (!partido || !jugador) return <p>⏳ Cargando...</p>;

    return (
        <div className="calificar-container">
            <h3>{obtenerNombre(partido.equipo1, ["nombre", "nombre_equipo"])} VS {obtenerNombre(partido.equipo2, ["nombre", "nombre_equipo"])}</h3>
            <p>{partido.fecha} {partido.hora}</p>
            <p>📍 {partido.ubicacion}</p>

            <h2>Califica al Jugador:</h2>
            <p className="nombre-jugador">{jugador.nombre}</p>
            <p className="equipo-jugador">{equipo?.nombre}</p>

            <div className="emoji">{calificacion > 0 ? emojis[calificacion - 1] : "🤔"}</div>

            <p className="texto-calificacion">
                {calificacion > 0 ? textos[calificacion - 1] : "Selecciona una calificación"}
            </p>

            <div className="estrellas-horizontal">
                {[1, 2, 3, 4, 5].map(n => (
                    <button
                        key={n}
                        className={`estrella ${calificacion >= n ? "activa" : ""}`}
                        onClick={() => setCalificacion(n)}
                    >⭐</button>
                ))}
            </div>

            <button
                className="btn-enviar"
                onClick={enviarCalificacion}
                disabled={calificacion === 0}
            >
                ENVIAR
            </button>
            {historial.length > 0 && (
            <div className="historial-calificaciones">
                <h4>Calificaciones registradas:</h4>
                <ul>
                {historial.map((item, index) => (
                    <li key={index}>
                    ⭐ {item.calificacion} &nbsp;–&nbsp;
                    <span className="fecha">
                        {new Date(item.fecha).toLocaleString("es-MX", {
                        dateStyle: "short",
                        timeStyle: "short"
                        })}
                    </span>
                    </li>
                ))}
                </ul>
            </div>
            )}


            <button className="btn-salir" onClick={() => navigate(-1)}>SALIR</button>
        </div>
    );
};

export default CalificarJugadores;
