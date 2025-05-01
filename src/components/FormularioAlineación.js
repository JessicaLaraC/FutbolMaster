import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, setDoc, collection, getDocs } from "firebase/firestore";
import { db, auth } from "./firebase";
import "../styles/FormularioAlineacion.css";

// Función para obtener el nombre correctamente
function obtenerNombre(data, opciones, defecto = "Sin nombre") {
    for (let key of opciones) {
        if (data[key]) return data[key];
    }
    return defecto;
}

const FormularioAlineacion = () => {
    const { torneoId, equipoId, partidoId, posicionId } = useParams();

    const navigate = useNavigate();

    const [jugadores, setJugadores] = useState([]);
    const [jugadorSeleccionado, setJugadorSeleccionado] = useState("");
    const [tipoPosicion, setTipoPosicion] = useState("");
    const [equipoNombre, setEquipoNombre] = useState("Equipo");

    const tiposDePosicion = ["Portero", "Defensa", "Medio", "Delantero"];

    useEffect(() => {
        const fetchData = async () => {
        const userId = auth.currentUser?.uid;
        if (!userId) return;

        // Obtener jugadores del equipo
        const jugadoresRef = collection(db, `Users/${userId}/Torneos/${torneoId}/Equipos/${equipoId}/Jugadores`);
        const jugadoresSnap = await getDocs(jugadoresRef);
        const listaJugadores = jugadoresSnap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        setJugadores(listaJugadores);

        // Obtener nombre del equipo
        const equipoRef = doc(db, `Users/${userId}/Torneos/${torneoId}/Equipos/${equipoId}`);
        const equipoSnap = await getDoc(equipoRef);
        if (equipoSnap.exists()) {
            setEquipoNombre(obtenerNombre(equipoSnap.data(), ["nombre", "nombre_equipo"]));
        }

        // Cargar alineación si ya existía
        const alineacionRef = doc(db, `Users/${userId}/Torneos/${torneoId}/Equipos/${equipoId}/Alineacion/${posicionId}`);
        const alineacionSnap = await getDoc(alineacionRef);
        if (alineacionSnap.exists()) {
            const data = alineacionSnap.data();
            setJugadorSeleccionado(data.jugadorId || "");
            setTipoPosicion(data.tipoPosicion || "");
        }
        };

        fetchData();
    }, [torneoId, equipoId, posicionId]);

    const guardarAlineacion = async (e) => {
        e.preventDefault();
        const userId = auth.currentUser?.uid;
        if (!userId) return;

        const jugador = jugadores.find(j => j.id === jugadorSeleccionado);
        if (!jugador) return;

        const alineacionRef = doc(db, `Users/${userId}/Torneos/${torneoId}/Equipos/${equipoId}/Alineacion/${posicionId}`);
        await setDoc(alineacionRef, {
        jugadorId: jugadorSeleccionado,
        nombre: obtenerNombre(jugador, ["nombre", "nombre_jugador"]),
        numero: jugador.numero || "",
        tipoPosicion
        });

        navigate(`/torneos/${torneoId}/partidos/${partidoId}/alineacion`);
    };

    const cancelar = () => {
        navigate(-1); // volver a la página anterior
    };

    return (
        <div className="formulario-alineacion">
        <h2>Alinear jugador en la posición {posicionId}</h2>
        <p><strong>Equipo:</strong> {equipoNombre}</p>

        <form onSubmit={guardarAlineacion}>
            <label>Jugador:</label>
            <select value={jugadorSeleccionado} onChange={(e) => setJugadorSeleccionado(e.target.value)} required>
            <option value="">-- Selecciona un jugador --</option>
            {jugadores.map(j => (
                <option key={j.id} value={j.id}>
                #{j.numero} - {obtenerNombre(j, ["nombre", "nombre_jugador"])}
                </option>
            ))}
            </select>

            <label>Tipo de posición:</label>
            <select value={tipoPosicion} onChange={(e) => setTipoPosicion(e.target.value)} required>
            <option value="">-- Selecciona una posición --</option>
            {tiposDePosicion.map((pos) => (
                <option key={pos} value={pos}>{pos}</option>
            ))}
            </select>

            <div className="alineacion-botones">
            <button type="button" onClick={cancelar}>Cancelar</button>
            <button type="submit">Guardar</button>
            </div>
        </form>
        </div>
    );
};

export default FormularioAlineacion;
