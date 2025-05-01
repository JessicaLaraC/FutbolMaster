import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db, auth } from "./firebase";
import MenuEstadisticas from "./MenuEstadisticas";
import "../styles/Estadisticas.css";

// Función reutilizable para obtener nombres desde distintos campos
function obtenerNombre(data, opciones = ["nombre", "nombre_equipo", "nombre_torneo"], defecto = "Sin nombre") {
    for (let key of opciones) {
        if (data?.[key]) return data[key];
    }
    return defecto;
}

const Posiciones = () => {
    const { torneoId, partidoId } = useParams();
    const navigate = useNavigate();

    const [partido, setPartido] = useState(null);
    const [torneo, setTorneo] = useState(null);
    const [tabla, setTabla] = useState([]);
    const [tab, setTab] = useState("posicion");

    const fetchData = useCallback(async () => {
        const userId = auth.currentUser?.uid;
        if (!userId) return;

        const partidoRef = doc(db, `Users/${userId}/Torneos/${torneoId}/Partidos/${partidoId}`);
        const partidoSnap = await getDoc(partidoRef);
        if (partidoSnap.exists()) setPartido(partidoSnap.data());

        const torneoRef = doc(db, `Users/${userId}/Torneos/${torneoId}`);
        const torneoSnap = await getDoc(torneoRef);
        if (torneoSnap.exists()) setTorneo(torneoSnap.data());

        const tablaRef = collection(db, `Users/${userId}/Torneos/${torneoId}/TablaPosiciones`);
        const tablaSnap = await getDocs(tablaRef);

        const tablaDatos = await Promise.all(tablaSnap.docs.map(async (docSnap) => {
            const data = docSnap.data();
            const equipoId = docSnap.id;

            const jugadoresRef = collection(db, `Users/${userId}/Torneos/${torneoId}/Equipos/${equipoId}/Jugadores`);
            const jugadoresSnap = await getDocs(jugadoresRef);
            const numJugadores = jugadoresSnap.size;

            return {
                id: equipoId,
                nombre: obtenerNombre(data),
                jugadores: numJugadores,
                ...data
            };
        }));

        setTabla(tablaDatos);
    }, [torneoId, partidoId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return (
        <div className="estadisticas-app">
            <div className="tablero-verde">
                <div className="equipos">
                    <span>{obtenerNombre(partido?.equipo1)}</span>
                    <span className="marcador">
                        {partido?.golesEquipo1 ?? 0} : {partido?.golesEquipo2 ?? 0}
                    </span>
                    <span>{obtenerNombre(partido?.equipo2)}</span>
                </div>
                <p className="tiempo">{partido?.fecha || "Fecha"} {partido?.hora || "Hora"}</p>
                <p className="torneo-nombre">{obtenerNombre(torneo)}</p>
            </div>

            <MenuEstadisticas
                tab={tab}
                setTab={setTab}
                torneoId={torneoId}
                partidoId={partidoId}
                navigate={navigate}
            />

            {tab === "posicion" && (
                <div className="posiciones-section">
                    <div className="torneo-header">
                        <p className="torneo-nombre">{obtenerNombre(torneo)}</p>
                        <p className="torneo-equipos">N° de equipos: {tabla.length}</p>
                        <p className="estado-torneo">
                            <span className={torneo?.estado === "En curso" ? "activo" : "inactivo"}>
                                {torneo?.estado || "Estado desconocido"}
                            </span>
                        </p>
                        <button className="btn-actualizar" onClick={fetchData}>🔄 Actualizar tabla</button>
                    </div>

                    <table className="tabla-posiciones">
                        <thead>
                            <tr>
                                <th>POSICIÓN</th>
                                <th>EQUIPO</th>
                                <th>J</th>
                                <th>G</th>
                                <th>P</th>
                                <th>GD</th>
                                <th>PTS</th>
                                <th>JUGADORES</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tabla.length > 0 ? (
                                tabla
                                    .sort((a, b) => b.puntos - a.puntos || b.diferenciaGoles - a.diferenciaGoles)
                                    .map((equipo, i) => (
                                        <tr key={equipo.id}>
                                            <td>{i + 1}</td>
                                            <td>{equipo.nombre}</td>
                                            <td>{equipo.jugados}</td>
                                            <td>{equipo.ganados}</td>
                                            <td>{equipo.perdidos}</td>
                                            <td>{equipo.diferenciaGoles}</td>
                                            <td>{equipo.puntos}</td>
                                            <td>{equipo.jugadores}</td>
                                        </tr>
                                    ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="no-data">No hay datos</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Posiciones;
