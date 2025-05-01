import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { collection, doc, getDoc, getDocs, setDoc} from "firebase/firestore";
import { db, auth } from "./firebase";
import "../styles/TablaDePosiciones.css";

function TablaDePosiciones() {
    const { id: torneoId } = useParams();
    const navigate = useNavigate();
    const [torneo, setTorneo] = useState(null);
    const [tabla, setTabla] = useState([]);
    const [numEquipos, setNumEquipos] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!torneoId) return;

        const fetchTabla = async () => {
        setLoading(true);
        setError("");

        try {
            const user = auth.currentUser;
            if (!user) return;

            const userId = user.uid;

            // Obtener torneo
            const torneoRef = doc(db, `Users/${userId}/Torneos/${torneoId}`);
            const torneoSnap = await getDoc(torneoRef);
            if (!torneoSnap.exists()) throw new Error("Torneo no encontrado");

            const torneoData = torneoSnap.data();
            setTorneo(torneoData);

            // Obtener equipos
            const equiposRef = collection(db, `Users/${userId}/Torneos/${torneoId}/Equipos`);
            const equiposSnap = await getDocs(equiposRef);
            if (equiposSnap.empty) throw new Error("No hay equipos registrados");

            const equiposMap = new Map();
            equiposSnap.docs.forEach(doc => {
            equiposMap.set(doc.id, {
                id: doc.id,
                nombre: doc.data().nombre || doc.data().nombre_equipo || "Sin nombre",
                jugados: 0,
                ganados: 0,
                perdidos: 0,
                diferenciaGoles: 0,
                puntos: 0,
            });
            });

            // Obtener partidos
            const partidosRef = collection(db, `Users/${userId}/Torneos/${torneoId}/Partidos`);
            const partidosSnap = await getDocs(partidosRef);

            partidosSnap.forEach(doc => {
            const partido = doc.data();
            const { equipo1, equipo2, golesEquipo1, golesEquipo2 } = partido;

            const eq1 = equiposMap.get(equipo1?.id);
            const eq2 = equiposMap.get(equipo2?.id);

            if (eq1 && eq2 && golesEquipo1 != null && golesEquipo2 != null) {
                // Actualizar estadísticas equipo1
                eq1.jugados++;
                eq1.diferenciaGoles += golesEquipo1 - golesEquipo2;

                // Actualizar estadísticas equipo2
                eq2.jugados++;
                eq2.diferenciaGoles += golesEquipo2 - golesEquipo1;

                if (golesEquipo1 > golesEquipo2) {
                eq1.ganados++;
                eq1.puntos += 3;
                eq2.perdidos++;
                } else if (golesEquipo2 > golesEquipo1) {
                eq2.ganados++;
                eq2.puntos += 3;
                eq1.perdidos++;
                } else {
                eq1.puntos++;
                eq2.puntos++;
                }
            }
            });

            const tablaFinal = Array.from(equiposMap.values());
            setTabla(tablaFinal);    
            setNumEquipos(tablaFinal.length);
            const tablaRef = collection(db, `Users/${userId}/Torneos/${torneoId}/TablaPosiciones`);
                for (const equipo of tablaFinal) {
                const equipoRef = doc(tablaRef, equipo.id);
                await setDoc(equipoRef, equipo, { merge: true }); 
            }

        
        } catch (err) {
            console.error("❌ Error:", err.message);
            setError(err.message);
            setTabla([]);
        } finally {
            setLoading(false);
        }
        };

        fetchTabla();
    }, [torneoId]);

    return (
        <div className="tabla-container">
        <button className="back-btn" onClick={() => navigate(-1)}>←</button>
        {loading ? (
            <p className="loading">⏳ Cargando...</p>
        ) : error ? (
            <p className="error">{error}</p>
        ) : torneo ? (
            <> 
            <h2>Tabla de puntos</h2>
            <div className="torneo-header">
                <p className="torneo-name">{torneo.nombre_torneo}</p>
                <p className="torneo-teams">N° de equipos: {numEquipos}</p>
                <p className={`torneo-status ${torneo.estado === "En curso" ? "activo" : "inactivo"}`}>
                {torneo.estado}
                </p>
            </div>

            <table className="tabla-posiciones">
                <thead>
                <tr>
                    <th>POS</th>
                    <th>EQUIPO</th>
                    <th>J</th>
                    <th>G</th>
                    <th>P</th>
                    <th>GD</th>
                    <th>PTS</th>
                </tr>
                </thead>
                <tbody>
                {tabla.length > 0 ? (
                    tabla
                    .sort((a, b) => b.puntos - a.puntos || b.diferenciaGoles - a.diferenciaGoles)
                    .map((equipo, index) => (
                        <tr key={equipo.id}>
                        <td>{index + 1}</td>
                        <td>{equipo.nombre}</td>
                        <td>{equipo.jugados}</td>
                        <td>{equipo.ganados}</td>
                        <td>{equipo.perdidos}</td>
                        <td>{equipo.diferenciaGoles}</td>
                        <td>{equipo.puntos}</td>
                        </tr>
                    ))
                ) : (
                    <tr><td colSpan="7" className="no-data">No hay datos</td></tr>
                )}
                </tbody>
            </table>
            </>
        ) : (
            <p className="no-data">No se encontró el torneo</p>
        )}
        </div>
    );
}

export default TablaDePosiciones;
