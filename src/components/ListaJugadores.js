import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db, auth } from "./firebase";
import "../styles/ListaJugadores.css";

const ListaJugadores = () => {
    const { torneoId, partidoId } = useParams();
    const navigate = useNavigate();
    const [partido, setPartido] = useState(null);
    const [torneo, setTorneo] = useState(null);
    const [jugadores, setJugadores] = useState([]);
    const [equipoActivo, setEquipoActivo] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            const userId = auth.currentUser?.uid;
            if (!userId) return;

            const partidoRef = doc(db, `Users/${userId}/Torneos/${torneoId}/Partidos/${partidoId}`);
            const partidoSnap = await getDoc(partidoRef);
            if (!partidoSnap.exists()) return;

            const partidoData = partidoSnap.data();
            setPartido(partidoData);

            const torneoRef = doc(db, `Users/${userId}/Torneos/${torneoId}`);
            const torneoSnap = await getDoc(torneoRef);
            if (torneoSnap.exists()) setTorneo(torneoSnap.data());

            const equipo = partidoData.equipo1;
            if (!equipo?.id) return;
            setEquipoActivo(equipo);

            const jugadoresRef = collection(db, `Users/${userId}/Torneos/${torneoId}/Equipos/${equipo.id}/Jugadores`);
            const jugadoresSnap = await getDocs(jugadoresRef);
            const lista = jugadoresSnap.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    nombre: data.nombre || data.nombre_jugador || "Jugador sin nombre",
                    calificacion: data.calificacion ?? 0,
                    ...data
                };
            });

            setJugadores(lista);
        };

        fetchData();
    }, [torneoId, partidoId]);

    const irACalificar = (jugadorId) => {
        navigate(`/torneos/${torneoId}/partidos/${partidoId}/jugadores/${jugadorId}/calificar`);
    };

    if (!partido || !equipoActivo) return <p>⏳ Cargando...</p>;

    return (
        <div className="lista-jugadores-app">
            <div className="tablero-verde">
                <div className="equipos">
                    <span>{partido.equipo1?.nombre || partido.equipo1?.nombre_equipo}</span>
                    <span className="marcador">
                        {partido.golesEquipo1 ?? 0} : {partido.golesEquipo2 ?? 0}
                    </span>
                    <span>{partido.equipo2?.nombre || partido.equipo2?.nombre_equipo}</span>
                </div>
                <p className="tiempo">{partido.fecha} {partido.hora}</p>
                <p className="torneo-nombre">{torneo?.nombre_torneo}</p>
                <p className="num-jugadores">N° de jugadores: {jugadores.length}</p>
                <h3>Jugadores de {equipoActivo?.nombre || equipoActivo?.nombre_equipo}</h3>
            </div>

            <div className="jugadores-lista">
                {jugadores.map(jugador => (
                    <div className="jugador-item" key={jugador.id}>
                        <div className="jugador-info">
                            <span className="jugador-icono">👤</span>
                            <span className="jugador-nombre">{jugador.nombre}</span>
                        </div>
                        <button className="btn-calificar" onClick={() => irACalificar(jugador.id)}>
                            ⭐ Calificar
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ListaJugadores;
