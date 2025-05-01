import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { db, auth } from "./firebase";
import { collection, getDocs, addDoc} from "firebase/firestore";
import "../styles/FormularioEstadisticas.css";

const FormularioEstadisticas = () => {
    const { torneoId, partidoId } = useParams();
    const [eventos, setEventos] = useState([]);
    const [equipos, setEquipos] = useState([]);
    const [jugadoresPorEquipo, setJugadoresPorEquipo] = useState({});
    const [equipoSeleccionado, setEquipoSeleccionado] = useState("");
    const [jugadoresVisibles, setJugadoresVisibles] = useState([]);
    const [nuevoEvento, setNuevoEvento] = useState({
        minuto: "",
        tipo: "Gol",
        jugador: "",
        asistencia: "",
    });

    const navigate = useNavigate();

    useEffect(() => {
        const fetchEquiposYJugadores = async () => {
        const userId = auth.currentUser?.uid;
        if (!userId) return;

        const equiposRef = collection(db, `Users/${userId}/Torneos/${torneoId}/Equipos`);
        const equiposSnap = await getDocs(equiposRef);
        const equiposData = [];
        const jugadoresMap = {};

        for (const equipoDoc of equiposSnap.docs) {
            const equipoId = equipoDoc.id;
            const equipoNombre = equipoDoc.data().nombre || equipoDoc.data().nombre_equipo || "Equipo sin nombre";
            equiposData.push({ id: equipoId, nombre: equipoNombre });

            const jugadoresSnap = await getDocs(
            collection(db, `Users/${userId}/Torneos/${torneoId}/Equipos/${equipoId}/Jugadores`)
            );

            jugadoresMap[equipoId] = jugadoresSnap.docs.map((doc) => ({
            id: doc.id,
            nombre: doc.data().nombre || doc.data().nombre_jugador || "Jugador sin nombre"
            }));
        }

        setEquipos(equiposData);
        setJugadoresPorEquipo(jugadoresMap);
        };

        fetchEquiposYJugadores();
    }, [torneoId]);

    const handleChange = (e) => {
        setNuevoEvento({ ...nuevoEvento, [e.target.name]: e.target.value });
    };

    const handleEquipoSeleccionado = (e) => {
        const equipoId = e.target.value;
        setEquipoSeleccionado(equipoId);
        setJugadoresVisibles(jugadoresPorEquipo[equipoId] || []);
        setNuevoEvento({ ...nuevoEvento, jugador: "" }); // Reset jugador al cambiar equipo
    };

    const agregarEvento = () => {
        if (nuevoEvento.minuto && nuevoEvento.jugador && equipoSeleccionado) {
            const equipoNombre = equipos.find((e) => e.id === equipoSeleccionado)?.nombre || "Equipo";
            setEventos([
                ...eventos,
                {
                    ...nuevoEvento,
                    equipoId: equipoSeleccionado,
                    equipoNombre: equipoNombre,
                    partidoId: partidoId
                },
            ]);
            setNuevoEvento({ minuto: "", tipo: "Gol", jugador: "", asistencia: "" });
        }
    };

    const guardarEstadisticas = async () => {
        const userId = auth.currentUser?.uid;
        if (!userId) return;
        const statsRef = collection(
            db,
            `Users/${userId}/Torneos/${torneoId}/Partidos/${partidoId}/Estadisticas`
        );
        for (const evento of eventos) {
            await addDoc(statsRef, evento); 
        }

        navigate(`/torneos/${torneoId}/partidos/${partidoId}/estadisticas`);
    };
    

    return (
        <div className="form-estadisticas">
        <h2>📊 Registrar Estadísticas</h2>
        <div className="form-campos">
            <input
            type="number"
            name="minuto"
            placeholder="Minuto"
            value={nuevoEvento.minuto}
            onChange={handleChange}
            />
            <select name="tipo" value={nuevoEvento.tipo} onChange={handleChange}>
            <option value="Gol">Gol</option>
            <option value="Tarjeta Amarilla">Tarjeta Amarilla</option>
            <option value="Tarjeta Roja">Tarjeta Roja</option>
            <option value="Cambio">Cambio</option>
            </select>

            <select value={equipoSeleccionado} onChange={handleEquipoSeleccionado}>
            <option value="">Selecciona equipo</option>
            {equipos.map((eq) => (
                <option key={eq.id} value={eq.id}>
                {eq.nombre}
                </option>
            ))}
            </select>

            <select name="jugador" value={nuevoEvento.jugador} onChange={handleChange}>
            <option value="">Selecciona jugador</option>
            {jugadoresVisibles.map((jug) => (
                <option key={jug.id} value={jug.nombre}>
                {jug.nombre}
                </option>
            ))}
            </select>

            {nuevoEvento.tipo === "Gol" && (
            <input
                type="text"
                name="asistencia"
                placeholder="Asistencia (opcional)"
                value={nuevoEvento.asistencia}
                onChange={handleChange}
            />
            )}

            <button className="btn verde" onClick={agregarEvento}>
            ➕ Agregar
            </button>
        </div>

        <div className="lista-eventos">
            {eventos.map((ev, i) => (
                <div key={i} className="evento-item">
                {ev.minuto}’ - {ev.tipo} - {ev.jugador}{" "}
                ({ev.equipoNombre || ev.nombre || "Equipo desconocido"})
                {ev.asistencia && ` (Asist: ${ev.asistencia})`}
                </div>
            ))}
        </div>


        <div className="botones-accion">
            <button className="btn verde" onClick={guardarEstadisticas}>
            Guardar
            </button>
            <button className="btn cancelar" onClick={() => navigate(`/torneos/${torneoId}/partidos/${partidoId}/estadisticas`)}>
            Cancelar
            </button>
        </div>
        </div>
    );
};

export default FormularioEstadisticas;
