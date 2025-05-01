import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc, collection, addDoc } from "firebase/firestore";
import { db, auth } from "./firebase";
import "../styles/EditarTorneo.css";

const EditarTorneo = () => {
    const { torneoId } = useParams();
    const navigate = useNavigate();

    const [nombre, setNombre] = useState("");
    const [fechaInicio, setFechaInicio] = useState("");
    const [fechaFin, setFechaFin] = useState("");
    const [equipos, setEquipos] = useState([]);

    useEffect(() => {
        const obtenerTorneo = async () => {
        const user = auth.currentUser;
        if (!user) {
            navigate("/login");
            return;
        }

        try {
            const torneoRef = doc(db, `Users/${user.uid}/Torneos/${torneoId}`);
            const torneoSnap = await getDoc(torneoRef);

            if (torneoSnap.exists()) {
            const torneo = torneoSnap.data();
            setNombre(torneo.nombre_torneo);
            setFechaInicio(torneo.fecha_inicio.toDate().toISOString().split("T")[0]);
            setFechaFin(torneo.fecha_fin.toDate().toISOString().split("T")[0]);
            } else {
            alert("⚠️ El torneo no existe o no tienes permiso.");
            navigate("/panelTorneo");
            }
        } catch (error) {
            console.error("❌ Error al cargar el torneo:", error);
        }
        };

        obtenerTorneo();
    }, [torneoId, navigate]);

    const handleEquipoChange = (index, field, value) => {
        const nuevosEquipos = [...equipos];
        nuevosEquipos[index][field] = value;
        setEquipos(nuevosEquipos);
    };

    const handleJugadorChange = (equipoIndex, jugadorIndex, field, value) => {
        const nuevosEquipos = [...equipos];
        nuevosEquipos[equipoIndex].jugadores[jugadorIndex][field] = value;
        setEquipos(nuevosEquipos);
    };

    const agregarJugador = (equipoIndex) => {
        const nuevosEquipos = [...equipos];
        nuevosEquipos[equipoIndex].jugadores.push({ nombre: "", numero: "" });
        setEquipos(nuevosEquipos);
    };

    const agregarEquipo = () => {
        setEquipos([...equipos, { nombre: "", jugadores: [] }]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const user = auth.currentUser;
        if (!user) return;

        try {
        const torneoRef = doc(db, `Users/${user.uid}/Torneos/${torneoId}`);
        await updateDoc(torneoRef, {
            nombre_torneo: nombre,
            fecha_inicio: new Date(fechaInicio),
            fecha_fin: new Date(fechaFin),
        });

        for (const equipo of equipos) {
            const equipoRef = await addDoc(collection(db, `Users/${user.uid}/Torneos/${torneoId}/Equipos`), {
            nombre: equipo.nombre,
            });

            for (const jugador of equipo.jugadores) {
            await addDoc(collection(db, `Users/${user.uid}/Torneos/${torneoId}/Equipos/${equipoRef.id}/Jugadores`), {
                nombre: jugador.nombre,
                numero: jugador.numero,
            });
            }
        }

        alert("✅ Torneo y equipos actualizados correctamente.");
        navigate("/panelTorneo");
        } catch (error) {
        console.error("❌ Error al guardar los cambios:", error);
        alert("❌ Ocurrió un error al guardar.");
        }
    };

    return (
        <div className="editar-torneo-form">
        <h2> Editar Torneo</h2>
        <form onSubmit={handleSubmit}>
            <label>Nombre del Torneo:</label>
            <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required />

            <label>Fecha de Inicio:</label>
            <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} required />

            <label>Fecha de Fin:</label>
            <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} required />

            <h3>⚽ Equipos</h3>
            {equipos.map((equipo, eqIndex) => (
            <div key={eqIndex} className="equipo-box">
                <input
                type="text"
                placeholder="Nombre del equipo"
                value={equipo.nombre}
                onChange={(e) => handleEquipoChange(eqIndex, "nombre", e.target.value)}
                required
                />
                <h4>Jugadores</h4>
                {equipo.jugadores.map((jugador, jIndex) => (
                <div key={jIndex} className="jugador-box">
                    <input
                    type="text"
                    placeholder="Nombre del jugador"
                    value={jugador.nombre}
                    onChange={(e) => handleJugadorChange(eqIndex, jIndex, "nombre", e.target.value)}
                    required
                    />
                    <input
                    type="number"
                    placeholder="Número"
                    value={jugador.numero}
                    onChange={(e) => handleJugadorChange(eqIndex, jIndex, "numero", e.target.value)}
                    required
                    />
                </div>
                ))}
                <button type="button" onClick={() => agregarJugador(eqIndex)}>Agregar Jugador</button>
            </div>
            ))}
            <button type="button" onClick={agregarEquipo}>Agregar Equipo</button>

            <div className="acciones">
            <button type="submit" className="guardar"> Guardar Cambios</button>
            <button type="button" className="cancelar" onClick={() => navigate("/panelTorneo")}>Cancelar</button>
            </div>
        </form>
        </div>
    );
};

export default EditarTorneo;
