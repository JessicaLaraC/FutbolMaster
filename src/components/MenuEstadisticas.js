// src/components/MenuEstadisticas.js
import React from "react";
import "../styles/MenuEstadisticas.css";

const MenuEstadisticas = ({ tab, setTab, torneoId, partidoId, navigate }) => {
    const irAEstadisticas = () => {
        setTab("estadisticas");
        navigate(`/torneos/${torneoId}/partidos/${partidoId}/estadisticas`);
    };
    
    const irAPosiciones = () => {
        setTab("posiciones");
        navigate(`/torneos/${torneoId}/partidos/${partidoId}/posiciones`);
    };
    
    const irAAlineacion = () => {
        setTab("alineacion");
        navigate(`/torneos/${torneoId}/partidos/${partidoId}/alineacion`);
    };
    

    return (
        <div className="tabs-estadisticas">
        <button className={tab === "estadisticas" ? "active" : ""} onClick={irAEstadisticas}>
            Estadísticas
        </button>
        <button className={tab === "posiciones" ? "active" : ""} onClick={irAPosiciones}>
            Posiciones
        </button>
        <button className={tab === "alineacion" ? "active" : ""} onClick={irAAlineacion}>
            Alineación
        </button>
        </div>
    );
};

export default MenuEstadisticas;
