import React, { useEffect, useState } from "react";
import { auth, db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "../styles/Profile.css";

function Profile() {
  const [userDetails, setUserDetails] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const docRef = doc(db, "Users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserDetails(docSnap.data());
        } else {
          console.log("User document not found");
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error.message);
    }
  };

  return (
    <div className="profile-container">
      {userDetails ? (
        <div className="profile-card">
          <h2 className="profile-title">👤 Bienvenido, {userDetails.firstName}</h2>
          <div className="profile-details">
            <p><strong>Email:</strong> {userDetails.email}</p>
            <p><strong>Nombre:</strong> {userDetails.firstName}</p>
            <p><strong>Contraseña:</strong> ********</p>
          </div>
          <div className="button-group">
            <button className="btn-edit" onClick={() => navigate("/edit-profile")}>✏️ Editar perfil</button>
            <button className="btn-logout" onClick={handleLogout}>🚪 Cerrar sesión</button>
          </div>
        </div>
      ) : (
        <div className="loading">Cargando perfil...</div>
      )}
    </div>
  );
}

export default Profile;
