import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/EncabezadoPanelTorneos.css";

const EncabezadoPanelTorneos = ({ titulo = "Torneos Disponibles", searchTerm, setSearchTerm }) => {
    const navigate = useNavigate();

    return (
        <div className="header-torneos">
        <h1 className="titulo-torneos">🏆 {titulo}</h1>

        <div className="top-bar">
            <button className="nuevo-torneo-btn" onClick={() => navigate("/nuevo-torneo")}>
            + Nuevo Torneo
            </button>

            <div className="search-box">
            🔍
            <input
                type="text"
                placeholder="Buscar torneo por nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            </div>
        </div>
        </div>
    );
};

export default EncabezadoPanelTorneos;
