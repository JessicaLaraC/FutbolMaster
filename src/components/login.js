import { signInWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import { useNavigate , Link} from "react-router-dom"; 
import { auth } from "./firebase";
import { toast } from "react-toastify";
import"../styles/login.css"

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate(); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log("Inicio de sesión exitoso");


      navigate("/panelTorneo");
      toast.success("Inicio de sesión exitoso", {
        position: "top-center",
      });
    } catch (error) {
      console.error("Error al iniciar :", error.message);
      toast.error(error.message, {
        position: "bottom-center",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Inicio de sesión </h3>

      <div className="mb-3">
        <label>Correo Electronico</label>
        <input
          type="email"
          className="form-control"
          placeholder="Correo electronico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="mb-3">
        <label>Contraseña</label>
        <input
          type="password"
          className="form-control"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <p className="reset-password">
        ¿Olvidaste tu contraseña? <Link to="/restablecer-contrasenia">Nueva contraseña</Link>
      </p>
      <div className="d-grid">
        <button type="submit" className="login-button">
        Iniciar sesión
        </button>
      </div>
      <p className="forgot-password text-right">
        ¿Eres nuevo usuario? <a href="/register">Registrarse</a>
      </p>
    </form>
  );
}

export default Login;
