import React from "react";
import "../styles/TorneoCard.css";

const TorneoCard = ({
    id,
    nombre,
    fecha_inicio,
    fecha_fin,
    color,
    estado,
    onEdit,
    onDelete
    }) => {
    return (
        <div className="torneo-card" style={{ backgroundColor: color }}>
        <div className="torneo-header">
            <h3 className="torneo-nombre">{nombre || "Sin nombre"}</h3>

            {(onEdit || onDelete) && (
            <div className="torneo-acciones">
                {onEdit && (
                <button
                    className="edit-icon"
                    onClick={(e) => {
                    e.stopPropagation(); 
                    onEdit(id);
                    }}
                    title="Editar torneo"
                >
                    ✏️
                </button>
                )}
                {onDelete && (
                <button
                    className="delete-icon"
                    onClick={(e) => {
                    e.stopPropagation();
                    const confirmar = window.confirm("¿Seguro que deseas eliminar este torneo?");
                    if (confirmar) onDelete(id);
                    }}
                    title="Eliminar torneo"
                >
                    🗑️
                </button>
                )}
            </div>
            )}
        </div>

        <div className="torneo-fechas">
            <p>📅 Inicio: {fecha_inicio}</p>
            <p>🏁 Fin: {fecha_fin}</p>
        </div>

        {estado && (
            <div className={`torneo-estado ${estado === "Finalizado" ? "finalizado" : "en-curso"}`}>
            {estado}
            </div>
        )}
        </div>
    );
};

export default TorneoCard;
