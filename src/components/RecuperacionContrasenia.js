import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/NuevaContrasenia.css";

function RecuperacionContrasenia() {
    const navigate = useNavigate();

    return (
        <div className="newpassword-container">
            <h1 className="newpassword-title">Restablecer contraseña</h1>
            <p className="newpassword-subtitle">Revisa tu correo electrónico para cambiar la contraseña</p>
            
            <div className="button-group">
                <button 
                    className="newpassword-button"
                    onClick={() => navigate("/login")}
                >
                    Continuar
                </button>
            </div>
        </div>
    );
}

export default RecuperacionContrasenia;