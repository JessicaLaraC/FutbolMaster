import { createUserWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "./firebase";
import { setDoc, doc } from "firebase/firestore";
import { toast } from "react-toastify";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const navigate = useNavigate();
  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      const user = auth.currentUser;
      console.log(user);
      if (user) {
        await setDoc(doc(db, "Users", user.uid), {
          email: user.email,
          firstName: fname,
          lastName: lname,
          photo:""
        });
      }
      console.log("Usuario registrado exitosamente");
      toast.success("Usuario registrado exitosamente", {
        position: "top-center",
      });
      navigate("/login");
    } catch (error) {
      console.log(error.message);
      toast.error(error.message, {
        position: "bottom-center",
      });
    }
  };

  return (
    <form onSubmit={handleRegister}>
      <h3> Crear cuenta  nueva </h3>

      <div className="mb-3">
        <label> Nombre </label>
        <input
          type="text"
          className="form-control"
          placeholder="Nombre"
          onChange={(e) => setFname(e.target.value)}
          required
        />
      </div>

      <div className="mb-3">
        <label>Apellido</label>
        <input
          type="text"
          className="form-control"
          placeholder="Apellido"
          onChange={(e) => setLname(e.target.value)}
        />
      </div>

      <div className="mb-3">
        <label>Correo electronico</label>
        <input
          type="email"
          className="form-control"
          placeholder="Ingresa tu correo electrónico"
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="mb-3">
        <label>Contraseña</label>
        <input
          type="password"
          className="form-control"
          placeholder="Crea una contraseña"
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <div className="d-grid">
        <button type="submit" className="registre-button">
        Crear Cuenta 
        </button>
      </div>
      <p className="forgot-password text-right">
      ¿Ya tienes cuenta? <a href="/login">Iniciar sesión</a>
      </p>
    </form>
  );
}
export default Register;
