import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "./firebase";
import { collection, addDoc } from "firebase/firestore";
import { Timestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import "../styles/NuevoTorneo.css";

const NuevoTorneoForm = () => {
    const [nombre, setNombre] = useState("");
    const [fechaInicio, setFechaInicio] = useState("");
    const [fechaFin, setFechaFin] = useState("");
    const [numeroEquipos, setNumeroEquipos] = useState(0);
    const [equipos, setEquipos] = useState([]);
    const navigate = useNavigate();
    const auth = getAuth();

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

    const generarPartidos = (equipos) => {
        const partidos = [];
        for (let i = 0; i < equipos.length; i++) {
            for (let j = i + 1; j < equipos.length; j++) {
                partidos.push({
                    equipo1: equipos[i].nombre,
                    equipo2: equipos[j].nombre,
                    fecha: null,
                    estado: "Pendiente"
                });
            }
        }

        // Mezclar aleatoriamente los partidos
        for (let i = partidos.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [partidos[i], partidos[j]] = [partidos[j], partidos[i]];
        }

        return partidos;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!auth.currentUser) {
            alert("Debes estar autenticado para crear un torneo.");
            return;
        }

        const userId = auth.currentUser.uid;

        try {
            const torneoRef = await addDoc(collection(db, `Users/${userId}/Torneos`), {
                nombre_torneo: nombre,
                fecha_inicio: Timestamp.fromDate(new Date(fechaInicio)),
                fecha_fin: Timestamp.fromDate(new Date(fechaFin)),
                numero_equipos: numeroEquipos,
                estado: "En curso",
                creadorId: userId // ✅ Se guarda el UID del usuario como creador del torneo
            });

            const nombresEquipos = [];

            for (const equipo of equipos) {
                const equipoRef = await addDoc(collection(db, `Users/${userId}/Torneos/${torneoRef.id}/Equipos`), {
                    nombre: equipo.nombre
                });

                nombresEquipos.push({ nombre: equipo.nombre });

                for (const jugador of equipo.jugadores) {
                    await addDoc(collection(db, `Users/${userId}/Torneos/${torneoRef.id}/Equipos/${equipoRef.id}/Jugadores`), {
                        nombre_jugador: jugador.nombre,
                        numero_camisa: jugador.numeroPlayera,
                        posicion: jugador.posicion || ""
                    });
                }
            }

            const partidos = generarPartidos(nombresEquipos);
            for (const partido of partidos) {
                await addDoc(collection(db, `Users/${userId}/Torneos/${torneoRef.id}/Partidos`), partido);
            }

            alert("✅ Torneo registrado con éxito.");
            navigate("/panelTorneo");
        } catch (error) {
            console.error("Error al guardar el torneo:", error);
            alert("❌ Ocurrió un error al registrar el torneo.");
        }
    };

    return (
        <div className="nuevo-torneo-form">
            <h1>Nuevo Torneo</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Nombre del Torneo:</label>
                    <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
                </div>
                <div>
                    <label>Fecha de Inicio:</label>
                    <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} required />
                </div>
                <div>
                    <label>Fecha de Fin:</label>
                    <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} required />
                </div>
                <div>
                    <label>Número de Equipos:</label>
                    <input
                        type="number"
                        value={numeroEquipos}
                        onChange={(e) => {
                            const numEquipos = Number(e.target.value);
                            setNumeroEquipos(numEquipos);
                            setEquipos(prevEquipos =>
                                Array.from({ length: numEquipos }, (_, i) => prevEquipos[i] || { nombre: "", jugadores: [] })
                            );
                        }}
                        required
                    />
                </div>
                {equipos.map((equipo, equipoIndex) => (
                    <div key={equipoIndex} className="equipo-container">
                        <h3>Equipo {equipoIndex + 1}</h3>
                        <label>Nombre del Equipo:</label>
                        <input
                            type="text"
                            value={equipo.nombre}
                            onChange={(e) => handleEquipoChange(equipoIndex, 'nombre', e.target.value)}
                            required
                        />
                        <label>Número de Jugadores:</label>
                        <input
                            type="number"
                            onChange={(e) => {
                                const numJugadores = Number(e.target.value);
                                const jugadores = Array.from({ length: numJugadores }, () => ({ nombre: "", numeroPlayera: "" }));
                                handleEquipoChange(equipoIndex, 'jugadores', jugadores);
                            }}
                            required
                        />
                        {equipo.jugadores.map((jugador, jugadorIndex) => (
                            <div key={jugadorIndex} className="jugador-container">
                                <label>Nombre del Jugador:</label>
                                <input
                                    type="text"
                                    value={jugador.nombre}
                                    onChange={(e) => handleJugadorChange(equipoIndex, jugadorIndex, 'nombre', e.target.value)}
                                    required
                                />
                                <label>Número de Playera:</label>
                                <input
                                    type="number"
                                    value={jugador.numeroPlayera}
                                    onChange={(e) => handleJugadorChange(equipoIndex, jugadorIndex, 'numeroPlayera', e.target.value)}
                                    required
                                />
                            </div>
                        ))}
                    </div>
                ))}
                <button type="submit">Crear Torneo</button>
                <button type="button" className="cancelar" onClick={() => navigate("/panelTorneo")}>Cancelar</button>
            </form>
        </div>
    );
};

export default NuevoTorneoForm;
