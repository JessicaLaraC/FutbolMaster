import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc,  } from "firebase/firestore";
import { db, auth } from "./firebase";
import "../styles/EditarTorneo.css";

const EditarTorneo = () => {
    const { torneoId } = useParams();
    const navigate = useNavigate();

    const [nombre, setNombre] = useState("");
    const [fechaInicio, setFechaInicio] = useState("");
    const [fechaFin, setFechaFin] = useState("");

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
                }
            } catch (error) {
                console.error("Error al cargar el torneo:", error);
            }
        };
        obtenerTorneo();
    }, [torneoId, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const user = auth.currentUser;
        if (!user) return;
        try {
            const torneoRef = doc(db, `Users/${user.uid}/Torneos/${torneoId}`);
            await updateDoc(torneoRef, {
                nombre_torneo: nombre,
                fecha_inicio: new Date(fechaInicio),
                fecha_fin: new Date(fechaFin)
            });
            alert("Torneo actualizado");
            navigate("/panelTorneo");
        } catch (error) {
            console.error("Error al guardar los cambios:", error);
        }
    };

    return (
        <div className="editar-torneo-form">
            <h2>Editar Torneo</h2>
            <form onSubmit={handleSubmit}>
                <label>Nombre del Torneo:</label>
                <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
                <label>Fecha de Inicio:</label>
                <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} required />
                <label>Fecha de Fin:</label>
                <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} required />
                <button type="submit">Guardar Cambios</button>
                <button type="button" onClick={() => navigate(`/editar-equipos/${torneoId}`)}>Editar Equipos</button>
            </form>
        </div>
    );
};

export default EditarTorneo;