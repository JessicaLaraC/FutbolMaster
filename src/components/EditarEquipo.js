import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { collection, getDocs, updateDoc, deleteDoc, addDoc, doc } from "firebase/firestore";
import { db, auth } from "./firebase";
import "../styles/EditarEquipo.css";

const EditarEquipo = () => {
    const { torneoId } = useParams();
    const navigate = useNavigate();
    const [equipos, setEquipos] = useState([]);

    useEffect(() => {
        const fetchEquipos = async () => {
        const user = auth.currentUser;
        if (!user) { navigate("/login"); return; }
        const eqRef = collection(db, `Users/${user.uid}/Torneos/${torneoId}/Equipos`);
        const eqSnap = await getDocs(eqRef);
        const data = await Promise.all(
            eqSnap.docs.map(async d => {
            const info = d.data();
            const equipoNombre = info.nombre || info.nombre_equipo || "Equipo sin nombre";
            const jRef = collection(db, `Users/${user.uid}/Torneos/${torneoId}/Equipos/${d.id}/Jugadores`);
            const jSnap = await getDocs(jRef);
            const jugadores = jSnap.docs.map(j => {
                const jugador = j.data();
                return {
                id: j.id,
                nombre: jugador.nombre || jugador.nombre_jugador || "Jugador sin nombre",
                numero: jugador.numeroPlayera 
                };
            });
            return { id: d.id, nombre: equipoNombre, jugadores };
            })
        );
        setEquipos(data);
        };
        fetchEquipos();
    }, [torneoId, navigate]);

    const handleEquipoChange = (i, val) => {
        const arr = [...equipos];
        arr[i].nombre = val;
        setEquipos(arr);
    };

    const handleJugadorChange = (i, j, field, val) => {
        const arr = [...equipos];
        arr[i].jugadores[j][field] = val;
        setEquipos(arr);
    };

    const guardarEquipo = async i => {
        const user = auth.currentUser;
        if (!user) return;
        const eq = equipos[i];
        if (eq.id) {
        await updateDoc(doc(db, `Users/${user.uid}/Torneos/${torneoId}/Equipos/${eq.id}`), { nombre: eq.nombre });
        } else {
        const ref = await addDoc(collection(db, `Users/${user.uid}/Torneos/${torneoId}/Equipos`), { nombre: eq.nombre });
        eq.id = ref.id;
        }
        for (const j of eq.jugadores) {
        if (j.id) {
            await updateDoc(doc(db, `Users/${user.uid}/Torneos/${torneoId}/Equipos/${eq.id}/Jugadores/${j.id}`), { nombre: j.nombre, numero: j.numero });
        } else {
            await addDoc(collection(db, `Users/${user.uid}/Torneos/${torneoId}/Equipos/${eq.id}/Jugadores`), { nombre: j.nombre, numero: j.numero });
        }
        }
        alert("Equipo guardado");
    };

    const eliminarEquipo = async id => {
        const user = auth.currentUser;
        if (!user) return;
        await deleteDoc(doc(db, `Users/${user.uid}/Torneos/${torneoId}/Equipos/${id}`));
        setEquipos(equipos.filter(e => e.id !== id));
    };

    const agregarEquipo = () => setEquipos([...equipos, { nombre: "", jugadores: [] }]);
    const agregarJugador = i => {
        const arr = [...equipos];
        arr[i].jugadores.push({ nombre: "", numero: "" });
        setEquipos(arr);
    };
    const eliminarJugador = (i, j) => {
        const arr = [...equipos];
        arr[i].jugadores.splice(j, 1);
        setEquipos(arr);
    };

    return (
        <div className="editar-equipo-form">
        <h2>Equipos</h2>
        {equipos.map((e, i) => (
            <div key={i} className="equipo-item">
            <input
                type="text"
                value={e.nombre}
                onChange={ev => handleEquipoChange(i, ev.target.value)}
                placeholder="Equipo"
            />
            <div className="btn-group">
                <button className="small-btn" onClick={() => guardarEquipo(i)}>Guardar</button>
                {e.id && <button className="small-btn danger" onClick={() => eliminarEquipo(e.id)}>Eliminar</button>}
            </div>
            <div className="jugadores">
                {e.jugadores.map((j, jIdx) => (
                <div key={jIdx} className="jugador-item">
                    <input type="text" value={j.nombre} onChange={ev => handleJugadorChange(i, jIdx, 'nombre', ev.target.value)} placeholder="Jugador" />
                    <input type="number" value={j.numeroPlayera } onChange={ev => handleJugadorChange(i, jIdx, 'numeroPlayera', ev.target.value)} placeholder="#" />
                    <button className="tiny-btn danger" onClick={() => eliminarJugador(i, jIdx)}>X</button>
                </div>
                ))}
                <button className="tiny-btn" onClick={() => agregarJugador(i)}>+ Jugador</button>
            </div>
            </div>
        ))}
        <button className="btn agregar-btn" onClick={agregarEquipo}>+ Equipo</button>
        <button className="btn volver-btn" onClick={() => navigate("/panelTorneo")}>Volver</button>
        </div>
    );
};

export default EditarEquipo;