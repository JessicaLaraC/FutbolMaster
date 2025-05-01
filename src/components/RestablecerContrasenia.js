import { sendPasswordResetEmail } from "firebase/auth";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "./firebase";
import { toast } from "react-toastify";
import "../styles/RestablecerContrasenia.css";

function RestablecerContrasenia() {
    const [email, setEmail] = useState("");
    const navigate = useNavigate();

    const handleSendEmail = async (e) => {
        e.preventDefault();
        try {
        await sendPasswordResetEmail(auth, email);
        toast.success("Correo de verificación enviado", {
            position: "top-center",
        });
        navigate("/recuperacion-contrasenia", { state: { email } });
        } catch (error) {
        toast.error(error.message, {
            position: "bottom-center",
        });
        }
    };

    return (
        <div className="reset-container">
        <h1 className="reset-title">Restablecer contraseña</h1>
        <p className="reset-subtitle">Ingrese su correo electrónico registrado</p>
        
        <form onSubmit={handleSendEmail} className="reset-form">
            <div className="input-group">
            <label>Correo electrónico</label>
            <input
                type="email"
                placeholder="tu@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="reset-input"
                required
            />
            </div>

            <div className="button-group">
            <button type="submit" className="reset-button">
                Confirmar
            </button>
            <button 
                type="button" 
                className="cancel-button"
                onClick={() => navigate("/login")}
            >
                Cancelar
            </button>
            </div>
        </form>
        </div>
    );
}

export default RestablecerContrasenia;