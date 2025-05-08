import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom"; 
import { doc, getDoc, collection, getDocs } from "firebase/firestore"; 
import { db } from "./firebase";
import "../styles/Torneo.css";
import { useLocation } from "react-router-dom";
function Torneo() {
    const { id } = useParams(); 
    const [torneo, setTorneo] = useState(null);
    const [numEquipos, setNumEquipos] = useState(0); 
    const navigate = useNavigate(); 
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const creadorId = queryParams.get("creador");
    useEffect(() => {
        const fetchTorneo = async () => {
            if (!creadorId) {
                console.error("❌ creadorId no está definido en la URL.");
                return;
            }
        
            try {
                const torneoRef = doc(db, "Users", creadorId, "Torneos", id);
                const torneoSnap = await getDoc(torneoRef);
        
                if (torneoSnap.exists()) {
                setTorneo(torneoSnap.data());
        
                const equiposRef = collection(db, "Users", creadorId, "Torneos", id, "Equipos");
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
    }, [id, creadorId]);

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
