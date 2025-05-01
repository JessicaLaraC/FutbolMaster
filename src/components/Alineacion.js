import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { collection, getDocs, deleteDoc, doc, getDoc } from "firebase/firestore";
import { db, auth } from "./firebase";
import MenuEstadisticas from "./MenuEstadisticas";
import "../styles/Alineacion.css";

const posiciones1 = [
    { id: "1", top: "5%", left: "45%" },
    { id: "2", top: "15%", left: "25%" },
    { id: "3", top: "15%", left: "45%" },
    { id: "4", top: "15%", left: "65%" },
    { id: "5", top: "25%", left: "35%" },
    { id: "6", top: "25%", left: "55%" },
    { id: "7", top: "35%", left: "45%" },
    { id: "8", top: "45%", left: "25%" },
    { id: "9", top: "45%", left: "65%" },
    { id: "10", top: "55%", left: "35%" },
    { id: "11", top: "55%", left: "55%" },
    ];

    const posiciones2 = [
    { id: "1", top: "95%", left: "45%" },
    { id: "2", top: "85%", left: "25%" },
    { id: "3", top: "85%", left: "45%" },
    { id: "4", top: "85%", left: "65%" },
    { id: "5", top: "75%", left: "35%" },
    { id: "6", top: "75%", left: "55%" },
    { id: "7", top: "65%", left: "45%" },
    { id: "8", top: "55%", left: "25%" },
    { id: "9", top: "55%", left: "65%" },
    { id: "10", top: "45%", left: "35%" },
    { id: "11", top: "45%", left: "55%" },
    ];

    const Alineacion = () => {
    const { torneoId, partidoId } = useParams();
    const navigate = useNavigate();

    const [partido, setPartido] = useState({});
    const [torneo, setTorneo] = useState({});
    const [alineacion1, setAlineacion1] = useState({});
    const [alineacion2, setAlineacion2] = useState({});

    const obtenerAlineacionPorEquipo = useCallback(async (equipoId, setState) => {
        const userId = auth.currentUser?.uid;
        if (!userId || !equipoId) return;
        const ref = collection(db, `Users/${userId}/Torneos/${torneoId}/Equipos/${equipoId}/Alineacion`);
        const snapshot = await getDocs(ref);
        const data = {};
        snapshot.forEach((doc) => data[doc.id] = doc.data());
        setState(data);
    }, [torneoId]);
    

    const borrarJugador = async (equipoId, posicionId) => {
        const confirmar = window.confirm("¿Seguro que deseas eliminar este jugador?");
        if (!confirmar) return;

        const userId = auth.currentUser?.uid;
        if (!userId) return;

        const jugadorRef = doc(
        db,
        `Users/${userId}/Torneos/${torneoId}/Equipos/${equipoId}/Alineacion/${posicionId}`
        );
        await deleteDoc(jugadorRef);
        await obtenerAlineacionPorEquipo(equipoId, equipoId === partido.equipo1?.id ? setAlineacion1 : setAlineacion2);
    };

    const manejarDobleClick = (equipoId, posicionId) => {
        navigate(`/formulario-alineacion/${torneoId}/${equipoId}/${partidoId}/${posicionId}`);
    };

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

        await obtenerAlineacionPorEquipo(partidoData.equipo1.id, setAlineacion1);
        await obtenerAlineacionPorEquipo(partidoData.equipo2.id, setAlineacion2);
        };

        fetchData();
    }, [torneoId, partidoId, obtenerAlineacionPorEquipo]);

    return (
        <div className="lista-jugadores-app">
        

        <div className="tablero-verde">
            <div className="equipos">
            <span>{partido.equipo1?.nombre || partido.equipo1?.nombre_equipo || "Equipo 1"}</span>
            <span className="marcador">
                {partido.golesEquipo1 ?? 0} : {partido.golesEquipo2 ?? 0}
            </span>
            <span>{partido.equipo2?.nombre || partido.equipo2?.nombre_equipo || "Equipo 2"}</span>
            </div>
            <p className="tiempo">{partido.fecha} {partido.hora}</p>
            <p className="torneo-nombre">{torneo?.nombre_torneo}</p>
        </div>
        <MenuEstadisticas
                    tab="alineacion"
                    setTab={() => {}}
                    torneoId={torneoId}
                    partidoId={partidoId}
                    navigate={navigate}
                />
        <div className="alineacion">
            <h2>Campo de juego</h2>
            <div className="alineacion-campo">
            
            {posiciones1.map((pos) => {
                const jugador = alineacion1[pos.id] || {};
                return (
                <div
                    key={`e1-${pos.id}`}
                    className="alineacion-jugador"
                    style={{ top: pos.top, left: pos.left }}
                    onDoubleClick={() => manejarDobleClick(partido.equipo1.id, pos.id)}
                >
                    <div className="alineacion-numero">{jugador.numero || "?"}</div>
                    <div className="alineacion-nombre">{jugador.nombre || "Vacío"}</div>
                    {jugador.nombre && (
                    <button
                        className="alineacion-borrar"
                        onClick={(e) => {
                        e.stopPropagation();
                        borrarJugador(partido.equipo1.id, pos.id);
                        }}
                    >
                        X
                    </button>
                    )}
                </div>
                );
            })}

            {/* Alineación equipo 2 */}
            {posiciones2.map((pos) => {
                const jugador = alineacion2[pos.id] || {};
                return (
                <div
                    key={`e2-${pos.id}`}
                    className="alineacion-jugador"
                    style={{ top: pos.top, left: pos.left }}
                    onDoubleClick={() => manejarDobleClick(partido.equipo2.id, pos.id)}
                >
                    <div className="alineacion-numero">{jugador.numero || "?"}</div>
                    <div className="alineacion-nombre">{jugador.nombre || "Vacío"}</div>
                    {jugador.nombre && (
                    <button
                        className="alineacion-borrar"
                        onClick={(e) => {
                        e.stopPropagation();
                        borrarJugador(partido.equipo2.id, pos.id);
                        }}
                    >
                        X
                    </button>
                    )}
                </div>
                );
            })}
            </div>
        </div>
        </div>
    );
};

export default Alineacion;
