import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom"; 
import { doc, getDoc, collection, getDocs } from "firebase/firestore"; 
import { db } from "./firebase";
import { getAuth } from "firebase/auth";


import "../styles/Torneo.css";

function Torneo() {
    const { id } = useParams(); 
    const [torneo, setTorneo] = useState(null);
    const [numEquipos, setNumEquipos] = useState(0); 
    const navigate = useNavigate(); 
    const auth = getAuth();
    const user = auth.currentUser;


    useEffect(() => {
        const fetchTorneo = async () => {
            try {
                if (!user) {
                    console.log("⚠️ No hay usuario autenticado");
                    return;
                }

                // 🔹 Referencia al torneo específico dentro del usuario
                const torneoRef = doc(db, "Users", user.uid, "Torneos", id);
                const torneoSnap = await getDoc(torneoRef);

                if (torneoSnap.exists()) {
                    setTorneo(torneoSnap.data());

                    // 🔹 Contar los equipos dentro del torneo
                    const equiposRef = collection(db, "Users", user.uid, "Torneos", id, "Equipos");
                    const equiposSnap = await getDocs(equiposRef);

                    setNumEquipos(equiposSnap.size); 
                } else {
                    console.log("❌ El torneo no existe");
                }
            } catch (error) {
                console.error("❌ Error al obtener el torneo:", error);
            }
        };

        fetchTorneo();
    }, [id, user]);

    return (
        <div className="torneo-container">
            {torneo ? (
                <>
                <h2>🏆 Torneo</h2>

                    <div className="torneo-header">
                        
                        <p className="torneo-name">{torneo.nombre_torneo}</p>
                        <p className="torneo-teams">N° de equipos: {numEquipos}</p>
                        <p className={`torneo-status ${torneo.estado === "En curso" ? "activo" : "inactivo"}`}>
                            {torneo.estado}
                        </p>
                    </div>

                    <div className="section">
                        <h3>🏆 Eliminatorias</h3>
                        <button className="btn eliminatorias" onClick={() => navigate(`/torneos/${id}/final`)}>
                            Final
                        </button>
                        <button className="btn eliminatorias" onClick={() =>navigate(`/torneos/${id}/semifinal`) }>
                            Semifinales
                        </button>
                        <button className="btn eliminatorias" onClick={() =>navigate(`/torneos/${id}/cuartosfinal`)}>
                            Cuartos de final
                        </button>
                    </div>
    

                    <div className="section" onClick={() => navigate(`/torneos/${id}/partidos`)}>
                        <h3>⚽ Partidos</h3>
                    </div>

                    <div className="section" onClick={() => navigate(`/torneos/${id}/tabla`)}>
                        <h3>👟 Tabla de posiciones</h3>
                    </div>
                </>
            ) : (
                <p className="loading">⏳ Cargando...</p>
            )}
        </div>
    );
}

export default Torneo;
