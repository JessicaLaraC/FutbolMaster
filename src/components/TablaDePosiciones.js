import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    collection,
    doc,
    getDoc,
    getDocs,
    writeBatch
} from "firebase/firestore";
import { db, auth } from "./firebase";
import "../styles/TablaDePosiciones.css";

function TablaDePosiciones() {
    const { id: torneoId } = useParams();
    const navigate = useNavigate();

    const [torneo, setTorneo] = useState(null);
    const [tabla, setTabla] = useState([]);
    const [matches, setMatches] = useState([]);
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
            if (!user) throw new Error("Usuario no autenticado");
            const userId = user.uid;

            // 1) Traer datos del torneo
            const torneoRef = doc(db, `Users/${userId}/Torneos/${torneoId}`);
            const torneoSnap = await getDoc(torneoRef);
            if (!torneoSnap.exists()) throw new Error("Torneo no encontrado");
            setTorneo(torneoSnap.data());

            // 2) Cargar equipos iniciales
            const equiposRef = collection(
            db,
            `Users/${userId}/Torneos/${torneoId}/Equipos`
            );
            const equiposSnap = await getDocs(equiposRef);
            if (equiposSnap.empty) throw new Error("No hay equipos registrados");

            // Map de estadísticas iniciales
            const equiposMap = new Map();
            equiposSnap.docs.forEach(d => {
            const data = d.data();
            equiposMap.set(d.id, {
                id: d.id,
                nombre:
                data.nombre ||
                data.nombre_equipo ||
                data.nombre_jugador ||
                "Sin nombre",
                jugados: 0,
                ganados: 0,
                perdidos: 0,
                diferenciaGoles: 0,
                puntos: 0,
            });
            });

            // 3) Cargar todos los partidos y guardar para mostrar
            const partidosRef = collection(
            db,
            `Users/${userId}/Torneos/${torneoId}/Partidos`
            );
            const partidosSnap = await getDocs(partidosRef);
            const partidosData = partidosSnap.docs.map(d => ({ id: d.id, ...d.data() }));
            setMatches(partidosData);

            // 4) Procesar sólo los finalizados
            partidosData.forEach(p => {
            if (p.estado !== "finalizado") return;
            const eq1 = equiposMap.get(p.equipo1.id);
            const eq2 = equiposMap.get(p.equipo2.id);
            if (!eq1 || !eq2) return;

            eq1.jugados++;
            eq2.jugados++;
            eq1.diferenciaGoles += p.golesEquipo1 - p.golesEquipo2;
            eq2.diferenciaGoles += p.golesEquipo2 - p.golesEquipo1;

            if (p.golesEquipo1 > p.golesEquipo2) {
                eq1.ganados++;
                eq1.puntos += 3;
                eq2.perdidos++;
            } else if (p.golesEquipo2 > p.golesEquipo1) {
                eq2.ganados++;
                eq2.puntos += 3;
                eq1.perdidos++;
            } else {
                eq1.puntos++;
                eq2.puntos++;
            }
            });

            // 5) Convertir map a array y ordenar
            const tablaFinal = Array.from(equiposMap.values()).sort(
            (a, b) =>
                b.puntos - a.puntos ||
                b.diferenciaGoles - a.diferenciaGoles
            );
            setTabla(tablaFinal);
            setNumEquipos(tablaFinal.length);

            // 6) Escribir la tabla en Firestore en un solo batch
            const batch = writeBatch(db);
            const tablaRef = collection(
            db,
            `Users/${userId}/Torneos/${torneoId}/TablaPosiciones`
            );
            tablaFinal.forEach(equipo => {
            const eqRef = doc(tablaRef, equipo.id);
            batch.set(eqRef, equipo, { merge: true });
            });
            await batch.commit();
        } catch (err) {
            console.error("❌ Error:", err);
            setError(err.message);
            setTabla([]);
        } finally {
            setLoading(false);
        }
        };

        fetchTabla();
    }, [torneoId, navigate]);

    if (loading) return <p className="loading">⏳ Cargando...</p>;
    if (error) return <p className="error">{error}</p>;

    return (
        <div className="tabla-container">
        <button className="back-btn" onClick={() => navigate(-1)}>
            ←
        </button>

        <h2>Tabla de Puntos</h2>
        <div className="torneo-header">
            <p className="torneo-name">{torneo.nombre_torneo}</p>
            <p className="torneo-teams">N° de equipos: {numEquipos}</p>
            <p
            className={`torneo-status ${
                torneo.estado === "En curso" ? "activo" : "inactivo"
            }`}
            >
            Estado torneo: {torneo.estado}
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
                tabla.map((eq, i) => (
                <tr key={eq.id}>
                    <td>{i + 1}</td>
                    <td>{eq.nombre}</td>
                    <td>{eq.jugados}</td>
                    <td>{eq.ganados}</td>
                    <td>{eq.perdidos}</td>
                    <td>{eq.diferenciaGoles}</td>
                    <td>{eq.puntos}</td>
                </tr>
                ))
            ) : (
                <tr>
                <td colSpan="7" className="no-data">
                    No hay datos
                </td>
                </tr>
            )}
            </tbody>
        </table>

        {/* Lista de partidos con su estado */}
        <section className="estado-partidos">
            <h3>Estados de Partidos</h3>
            <ul>
            {matches.map((m) => (
                <li key={m.id}>
                {m.equipo1.nombre} vs {m.equipo2.nombre}: <strong>{m.estado}</strong>
                </li>
            ))}
            </ul>
        </section>
        </div>
    );
}

export default TablaDePosiciones;
