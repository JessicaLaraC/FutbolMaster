import React, { useState } from "react";
import { auth, db } from "./firebase";
import { doc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { updateEmail, updatePassword } from "firebase/auth";
import "../styles/Profile.css";

function FormProfile() {
    const [formData, setFormData] = useState({
        firstName: "",
        email: "",
        password: "",
    });

    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const user = auth.currentUser;
        if (user) {
        const updates = {};

        if (formData.firstName.trim()) {
            updates.firstName = formData.firstName.trim();
        }

        if (formData.email.trim() && formData.email !== user.email) {
            try {
            await updateEmail(user, formData.email.trim());
            updates.email = formData.email.trim();
            } catch (err) {
            console.error("Error updating email:", err.message);
            alert("No se pudo actualizar el correo: " + err.message);
            }
        }

        if (formData.password.trim()) {
            try {
            await updatePassword(user, formData.password.trim());
            } catch (err) {
            console.error("Error updating password:", err.message);
            alert("No se pudo actualizar la contraseña: " + err.message);
            }
        }

        if (Object.keys(updates).length > 0) {
            const userRef = doc(db, "Users", user.uid);
            await updateDoc(userRef, updates);
        }

        navigate("/profile");
        }
    };

    return (
        <div className="form-container">
        <h2>Edit Profile</h2>
        <form onSubmit={handleSubmit}>
            <input
            type="text"
            name="firstName"
            placeholder="First Name (opcional)"
            value={formData.firstName}
            onChange={handleChange}
            />
            <input
            type="email"
            name="email"
            placeholder="New Email (opcional)"
            value={formData.email}
            onChange={handleChange}
            />
            <input
            type="password"
            name="password"
            placeholder="New Password (opcional)"
            value={formData.password}
            onChange={handleChange}
            />
            <button type="submit" className="btn">Guardar</button>
            <button type="button" className="cancelar" onClick={() => navigate("/profile")}>Cancelar</button>
        </form>
        </div>
    );
}

export default FormProfile;
