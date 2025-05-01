import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { db, auth } from "./firebase";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import "../styles/FormularioJugadores.css";

const FormularioJugadores = () => {
    const { torneoId } = useParams();
    const [equipos, setEquipos] = useState([]);
    const [equipoSeleccionado, setEquipoSeleccionado] = useState("");
    const [nombreJugador, setNombreJugador] = useState("");
    const [numeroJugador, setNumeroJugador] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const obtenerEquipos = async () => {
        const userId = auth.currentUser?.uid;
        if (!userId) return;

        const equiposRef = collection(db, `Users/${userId}/Torneos/${torneoId}/Equipos`);
        const snapshot = await getDocs(equiposRef);
        const listaEquipos = snapshot.docs.map(doc => ({
            id: doc.id,
            nombre: doc.data().nombre || doc.data().nombre_equipo || "Equipo sin nombre"
        }));
        setEquipos(listaEquipos);
        };

        obtenerEquipos();
    }, [torneoId]);

    const handleGuardar = async () => {
        const userId = auth.currentUser?.uid;
        if (!userId || !equipoSeleccionado || !nombreJugador || !numeroJugador) return;

        const jugadorId = `${nombreJugador}-${numeroJugador}`.replace(/\s/g, "-").toLowerCase();
        const jugadorRef = doc(
        db,
        `Users/${userId}/Torneos/${torneoId}/Equipos/${equipoSeleccionado}/Jugadores/${jugadorId}`
        );

        await setDoc(jugadorRef, {
        nombre: nombreJugador,
        numero: numeroJugador,
        });

        setNombreJugador("");
        setNumeroJugador("");
        setEquipoSeleccionado("");
        alert("Jugador guardado correctamente");
        navigate(-1); // volver a pantalla anterior
    };

    return (
        <div className="form-jugadores">
        <h1> Jugadores </h1>
        <p className="subtexto">Agregue a los jugadores que estuvieron en este partido</p>
        <select
            value={equipoSeleccionado}
            onChange={(e) => setEquipoSeleccionado(e.target.value)}
        >
            <option value="">Seleccione equipo</option>
            {equipos.map((equipo) => (
            <option key={equipo.id} value={equipo.id}>
                {equipo.nombre}
            </option>
            ))}
        </select>

        <input
            type="text"
            placeholder="Nombre del jugador"
            value={nombreJugador}
            onChange={(e) => setNombreJugador(e.target.value)}
        />

        <input
            type="number"
            placeholder="Número del jugador"
            value={numeroJugador}
            onChange={(e) => setNumeroJugador(e.target.value)}
        />

        <div className="acciones">
            <button className="btn guardar" onClick={handleGuardar}> Guardar</button>
            <button className="btn cancelar" onClick={() => navigate(-1)}> Cancelar</button>
        </div>
        </div>
    );
};

export default FormularioJugadores;
